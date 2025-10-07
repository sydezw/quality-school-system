-- Script para migrar todas as parcelas de parcelas_migracao_raw para a aba de migrados
-- Criando registros financeiros históricos e suas respectivas parcelas

BEGIN;

-- Primeiro, vamos criar registros únicos em alunos_financeiro para cada aluno_nome único
INSERT INTO alunos_financeiro (
    id,
    aluno_id,
    plano_id,
    valor_plano,
    valor_material,
    valor_matricula,
    desconto_total,
    valor_total,
    status_geral,
    data_primeiro_vencimento,
    created_at,
    updated_at,
    forma_pagamento_plano,
    numero_parcelas_plano,
    ativo_ou_encerrado,
    idioma_registro,
    migrado,
    historico
)
SELECT DISTINCT
    gen_random_uuid() as id,
    NULL as aluno_id, -- Não temos referência de aluno real
    NULL as plano_id, -- Não temos referência de plano real
    COALESCE(SUM(CASE WHEN tipo_item = 'plano' THEN valor ELSE 0 END), 0) as valor_plano,
    COALESCE(SUM(CASE WHEN tipo_item = 'material' THEN valor ELSE 0 END), 0) as valor_material,
    COALESCE(SUM(CASE WHEN tipo_item = 'matricula' THEN valor ELSE 0 END), 0) as valor_matricula,
    0 as desconto_total,
    SUM(valor) as valor_total,
    'pendente'::status_pagamento_enum as status_geral,
    MIN(data_vencimento) as data_primeiro_vencimento,
    NOW() as created_at,
    NOW() as updated_at,
    'parcelado'::forma_pagamento_enum as forma_pagamento_plano,
    COUNT(*) as numero_parcelas_plano,
    false as ativo_ou_encerrado,
    COALESCE(idioma, 'ingles'::idioma_enum) as idioma_registro,
    true as migrado,
    true as historico
FROM parcelas_migracao_raw
GROUP BY aluno_nome, idioma;

-- Agora vamos inserir todas as parcelas individuais
INSERT INTO alunos_parcelas (
    alunos_financeiro_id,
    data_vencimento,
    numero_parcela,
    tipo_item,
    valor,
    status_pagamento,
    idioma_registro,
    descricao_item,
    forma_pagamento,
    data_pagamento,
    observacoes,
    criado_em,
    atualizado_em,
    historico,
    nome_aluno
)
SELECT 
    af.id as alunos_financeiro_id,
    pmr.data_vencimento,
    ROW_NUMBER() OVER (PARTITION BY pmr.aluno_nome, pmr.idioma ORDER BY pmr.data_vencimento) as numero_parcela,
    pmr.tipo_item,
    pmr.valor,
    pmr.status_pagamento,
    COALESCE(pmr.idioma, 'ingles'::idioma_enum) as idioma_registro,
    pmr.descricao_item,
    pmr.forma_pagamento,
    pmr.data_pagamento,
    pmr.observacoes,
    NOW() as criado_em,
    NOW() as atualizado_em,
    true as historico,
    pmr.aluno_nome
FROM parcelas_migracao_raw pmr
JOIN alunos_financeiro af ON (
    af.migrado = true 
    AND af.historico = true 
    AND af.idioma_registro = COALESCE(pmr.idioma, 'ingles'::idioma_enum)
    AND af.data_primeiro_vencimento = (
        SELECT MIN(data_vencimento) 
        FROM parcelas_migracao_raw pmr2 
        WHERE pmr2.aluno_nome = pmr.aluno_nome 
        AND COALESCE(pmr2.idioma, 'ingles'::idioma_enum) = COALESCE(pmr.idioma, 'ingles'::idioma_enum)
    )
    AND af.valor_total = (
        SELECT SUM(valor) 
        FROM parcelas_migracao_raw pmr3 
        WHERE pmr3.aluno_nome = pmr.aluno_nome 
        AND COALESCE(pmr3.idioma, 'ingles'::idioma_enum) = COALESCE(pmr.idioma, 'ingles'::idioma_enum)
    )
)
ORDER BY pmr.aluno_nome, pmr.data_vencimento;

-- Atualizar as porcentagens de progresso nos registros financeiros
UPDATE alunos_financeiro 
SET 
    porcentagem_progresso = CASE 
        WHEN valor_total > 0 THEN 
            COALESCE(
                (SELECT SUM(valor) 
                 FROM alunos_parcelas ap 
                 WHERE ap.alunos_financeiro_id = alunos_financeiro.id 
                 AND ap.status_pagamento = 'pago'), 
                0
            ) * 100.0 / valor_total
        ELSE 0 
    END,
    porcentagem_total = 100.0,
    updated_at = NOW()
WHERE migrado = true AND historico = true;

-- Verificar quantos registros foram criados
SELECT 
    'Registros financeiros criados' as tipo,
    COUNT(*) as quantidade
FROM alunos_financeiro 
WHERE migrado = true AND historico = true

UNION ALL

SELECT 
    'Parcelas migradas' as tipo,
    COUNT(*) as quantidade
FROM alunos_parcelas 
WHERE historico = true;

COMMIT;

-- Opcional: Limpar a tabela de migração após sucesso
-- DROP TABLE IF EXISTS parcelas_migracao_raw;