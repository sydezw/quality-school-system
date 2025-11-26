-- Script para comparar dados específicos entre parcelas_migracao_raw e parcelas_alunos
-- Este script ajuda a identificar se as parcelas perdidas eram da migração original

-- 1. Criar uma view temporária para facilitar comparações
CREATE OR REPLACE VIEW vw_parcelas_comparacao AS
SELECT 
    'migracao_raw' as origem,
    id,
    aluno_nome,
    valor,
    data_vencimento,
    data_pagamento,
    status_pagamento,
    tipo_item,
    idioma as idioma_registro,
    forma_pagamento,
    observacoes,
    NULL as registro_financeiro_id,
    1 as numero_parcela
FROM parcelas_migracao_raw
UNION ALL
SELECT 
    'parcelas_alunos' as origem,
    pa.id,
    a.nome as aluno_nome,
    pa.valor,
    pa.data_vencimento,
    pa.data_pagamento,
    pa.status_pagamento,
    pa.tipo_item,
    pa.idioma_registro,
    pa.forma_pagamento,
    pa.observacoes,
    pa.registro_financeiro_id,
    pa.numero_parcela
FROM parcelas_alunos pa
JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
JOIN alunos a ON fa.aluno_id = a.id;

-- 2. Identificar parcelas que existem na migração mas não nas parcelas atuais
-- (Busca por correspondência aproximada: mesmo aluno, valor e data)
WITH parcelas_migracao AS (
    SELECT 
        aluno_nome,
        valor,
        data_vencimento,
        status_pagamento,
        tipo_item,
        COUNT(*) as qtd_migracao
    FROM parcelas_migracao_raw
    GROUP BY aluno_nome, valor, data_vencimento, status_pagamento, tipo_item
),
parcelas_atuais AS (
    SELECT 
        a.nome as aluno_nome,
        pa.valor,
        pa.data_vencimento,
        pa.status_pagamento,
        pa.tipo_item,
        COUNT(*) as qtd_atual
    FROM parcelas_alunos pa
    JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
    JOIN alunos a ON fa.aluno_id = a.id
    GROUP BY a.nome, pa.valor, pa.data_vencimento, pa.status_pagamento, pa.tipo_item
)
SELECT 
    pm.aluno_nome,
    pm.valor,
    pm.data_vencimento,
    pm.status_pagamento,
    pm.tipo_item,
    pm.qtd_migracao,
    COALESCE(pa.qtd_atual, 0) as qtd_atual,
    (pm.qtd_migracao - COALESCE(pa.qtd_atual, 0)) as diferenca
FROM parcelas_migracao pm
LEFT JOIN parcelas_atuais pa ON (
    pm.aluno_nome = pa.aluno_nome 
    AND pm.valor = pa.valor 
    AND pm.data_vencimento = pa.data_vencimento
    AND pm.status_pagamento = pa.status_pagamento
    AND pm.tipo_item = pa.tipo_item
)
WHERE (pm.qtd_migracao - COALESCE(pa.qtd_atual, 0)) > 0
ORDER BY pm.data_vencimento DESC, diferenca DESC;

-- 3. Verificar se as parcelas "perdidas" estão no histórico
WITH parcelas_perdidas AS (
    SELECT DISTINCT
        pmr.aluno_nome,
        pmr.valor,
        pmr.data_vencimento,
        pmr.tipo_item
    FROM parcelas_migracao_raw pmr
    WHERE NOT EXISTS (
        SELECT 1 
        FROM parcelas_alunos pa
        JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
        JOIN alunos a ON fa.aluno_id = a.id
        WHERE a.nome = pmr.aluno_nome
            AND pa.valor = pmr.valor
            AND pa.data_vencimento = pmr.data_vencimento
            AND pa.tipo_item = pmr.tipo_item
    )
)
SELECT 
    pp.aluno_nome,
    pp.valor,
    pp.data_vencimento,
    pp.tipo_item,
    CASE 
        WHEN hp.id IS NOT NULL THEN 'Encontrada no histórico'
        ELSE 'Não encontrada - possivelmente perdida'
    END as status_parcela,
    hp.criado_em as data_arquivamento
FROM parcelas_perdidas pp
LEFT JOIN historico_parcelas hp ON (
    hp.aluno_nome = pp.aluno_nome
    AND hp.valor = pp.valor
    AND hp.data_vencimento = pp.data_vencimento
    AND hp.tipo_item = pp.tipo_item
)
ORDER BY pp.data_vencimento DESC;

-- 4. Análise por período para identificar quando as parcelas foram perdidas
SELECT 
    DATE_TRUNC('month', data_vencimento::date) as mes_vencimento,
    COUNT(CASE WHEN origem = 'migracao_raw' THEN 1 END) as qtd_migracao,
    COUNT(CASE WHEN origem = 'parcelas_alunos' THEN 1 END) as qtd_atual,
    (COUNT(CASE WHEN origem = 'migracao_raw' THEN 1 END) - 
     COUNT(CASE WHEN origem = 'parcelas_alunos' THEN 1 END)) as diferenca
FROM vw_parcelas_comparacao
GROUP BY DATE_TRUNC('month', data_vencimento::date)
HAVING (COUNT(CASE WHEN origem = 'migracao_raw' THEN 1 END) - 
        COUNT(CASE WHEN origem = 'parcelas_alunos' THEN 1 END)) != 0
ORDER BY mes_vencimento DESC;

-- 5. Verificar alunos que tiveram ativações recentes (possível causa das perdas)
SELECT 
    a.nome as aluno_nome,
    fa.ativo_ou_encerrado,
    fa.migrado,
    fa.created_at,
    fa.updated_at,
    COUNT(pa.id) as parcelas_atuais,
    (
        SELECT COUNT(*) 
        FROM parcelas_migracao_raw pmr 
        WHERE pmr.aluno_nome = a.nome
    ) as parcelas_migracao_original,
    (
        SELECT COUNT(*) 
        FROM historico_parcelas hp 
        WHERE hp.aluno_nome = a.nome
    ) as parcelas_historico
FROM financeiro_alunos fa
JOIN alunos a ON fa.aluno_id = a.id
LEFT JOIN parcelas_alunos pa ON pa.registro_financeiro_id = fa.id
WHERE fa.updated_at > (CURRENT_DATE - INTERVAL '2 months')
GROUP BY a.nome, fa.ativo_ou_encerrado, fa.migrado, fa.created_at, fa.updated_at
HAVING (
    SELECT COUNT(*) 
    FROM parcelas_migracao_raw pmr 
    WHERE pmr.aluno_nome = a.nome
) > COUNT(pa.id)
ORDER BY fa.updated_at DESC;

-- 6. Resumo final da investigação
WITH estatisticas AS (
    SELECT 
        (SELECT COUNT(*) FROM parcelas_migracao_raw) as total_migracao,
        (SELECT COUNT(*) FROM parcelas_alunos) as total_atual,
        (SELECT COUNT(*) FROM historico_parcelas) as total_historico,
        (
            SELECT COUNT(DISTINCT pmr.id)
            FROM parcelas_migracao_raw pmr
            WHERE NOT EXISTS (
                SELECT 1 
                FROM parcelas_alunos pa
                JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
                JOIN alunos a ON fa.aluno_id = a.id
                WHERE a.nome = pmr.aluno_nome
                    AND pa.valor = pmr.valor
                    AND pa.data_vencimento = pmr.data_vencimento
                    AND pa.tipo_item = pmr.tipo_item
            )
        ) as parcelas_nao_encontradas,
        (
            SELECT COUNT(DISTINCT pmr.id)
            FROM parcelas_migracao_raw pmr
            WHERE EXISTS (
                SELECT 1 
                FROM historico_parcelas hp
                WHERE hp.aluno_nome = pmr.aluno_nome
                    AND hp.valor = pmr.valor
                    AND hp.data_vencimento = pmr.data_vencimento
                    AND hp.tipo_item = pmr.tipo_item
            )
        ) as parcelas_no_historico
)
SELECT 
    total_migracao as "Total na Migração Original",
    total_atual as "Total Atual (parcelas_alunos)",
    total_historico as "Total no Histórico",
    (total_atual + total_historico) as "Total Contabilizado",
    (total_migracao - total_atual) as "Diferença da Migração",
    parcelas_nao_encontradas as "Parcelas Não Encontradas",
    parcelas_no_historico as "Parcelas Movidas para Histórico",
    (parcelas_nao_encontradas - parcelas_no_historico) as "Parcelas Realmente Perdidas",
    CASE 
        WHEN (parcelas_nao_encontradas - parcelas_no_historico) = 0 THEN 
            'TODAS AS PARCELAS ESTÃO CONTABILIZADAS (atual + histórico)'
        WHEN (parcelas_nao_encontradas - parcelas_no_historico) < (total_migracao * 0.05) THEN 
            'PERDA MÍNIMA - Provavelmente diferenças de migração'
        WHEN parcelas_no_historico > (parcelas_nao_encontradas * 0.8) THEN 
            'MAIORIA MOVIDA PARA HISTÓRICO - Verificar processo de ativação'
        ELSE 
            'PERDA SIGNIFICATIVA - Investigação necessária'
    END as "Diagnóstico"
FROM estatisticas;

-- Limpar a view temporária
DROP VIEW IF EXISTS vw_parcelas_comparacao;