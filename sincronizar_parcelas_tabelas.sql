-- =============================================
-- SCRIPT DE SINCRONIZAÇÃO ENTRE TABELAS DE PARCELAS
-- =============================================
-- PROBLEMA IDENTIFICADO:
-- - O projeto usa a tabela 'alunos_parcelas' para exibir parcelas na interface
-- - Mas os dados reais estão na tabela 'parcelas_alunos' 
-- - Isso causa discrepância: parcelas aparecem como 'pago' em parcelas_alunos mas 'pendente' no projeto
--
-- SOLUÇÃO:
-- Este script sincroniza os dados entre as duas tabelas
-- =============================================

-- 1. VERIFICAR ESTADO ATUAL
SELECT 
    'ANTES DA SINCRONIZAÇÃO' as status,
    'parcelas_alunos' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as pagos,
    COUNT(CASE WHEN status_pagamento = 'pendente' THEN 1 END) as pendentes
FROM parcelas_alunos
UNION ALL
SELECT 
    'ANTES DA SINCRONIZAÇÃO' as status,
    'alunos_parcelas' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as pagos,
    COUNT(CASE WHEN status_pagamento = 'pendente' THEN 1 END) as pendentes
FROM alunos_parcelas;

-- 2. ADICIONAR COLUNA nome_aluno SE NÃO EXISTIR
ALTER TABLE alunos_parcelas 
ADD COLUMN IF NOT EXISTS nome_aluno TEXT;

-- 3. SINCRONIZAR DADOS: INSERIR PARCELAS FALTANTES
-- Inserir parcelas que existem em parcelas_alunos mas não em alunos_parcelas
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
    comprovante,
    observacoes,
    criado_em,
    atualizado_em,
    historico,
    nome_aluno
)
SELECT DISTINCT
    af.id as alunos_financeiro_id,
    pa.data_vencimento,
    pa.numero_parcela,
    pa.tipo_item::tipo_item,
    pa.valor,
    pa.status_pagamento::status_pagamento,
    pa.idioma_registro::idioma_registro_financeiro,
    pa.descricao_item,
    pa.forma_pagamento,
    pa.data_pagamento,
    pa.comprovante,
    pa.observacoes,
    COALESCE(pa.criado_em, NOW()),
    COALESCE(pa.atualizado_em, NOW()),
    false as historico,
    a.nome as nome_aluno
FROM parcelas_alunos pa
JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
JOIN alunos a ON fa.aluno_id = a.id
JOIN alunos_financeiro af ON af.aluno_id = fa.aluno_id
WHERE NOT EXISTS (
    SELECT 1 
    FROM alunos_parcelas ap 
    WHERE ap.alunos_financeiro_id = af.id
    AND ap.valor = pa.valor
    AND ap.data_vencimento = pa.data_vencimento
    AND ap.tipo_item = pa.tipo_item::tipo_item
    AND ap.numero_parcela = pa.numero_parcela
);

-- 4. ATUALIZAR STATUS DAS PARCELAS EXISTENTES
-- Atualizar status e dados das parcelas que já existem mas estão desatualizadas
UPDATE alunos_parcelas 
SET 
    status_pagamento = pa.status_pagamento::status_pagamento,
    data_pagamento = pa.data_pagamento,
    comprovante = pa.comprovante,
    observacoes = pa.observacoes,
    forma_pagamento = pa.forma_pagamento,
    descricao_item = pa.descricao_item,
    atualizado_em = NOW()
FROM parcelas_alunos pa
JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
JOIN alunos_financeiro af ON af.aluno_id = fa.aluno_id
WHERE alunos_parcelas.alunos_financeiro_id = af.id
    AND alunos_parcelas.valor = pa.valor
    AND alunos_parcelas.data_vencimento = pa.data_vencimento
    AND alunos_parcelas.tipo_item = pa.tipo_item::tipo_item
    AND alunos_parcelas.numero_parcela = pa.numero_parcela
    AND (
        alunos_parcelas.status_pagamento != pa.status_pagamento::status_pagamento
        OR alunos_parcelas.data_pagamento IS DISTINCT FROM pa.data_pagamento
        OR alunos_parcelas.comprovante IS DISTINCT FROM pa.comprovante
        OR alunos_parcelas.observacoes IS DISTINCT FROM pa.observacoes
        OR alunos_parcelas.forma_pagamento IS DISTINCT FROM pa.forma_pagamento
        OR alunos_parcelas.descricao_item IS DISTINCT FROM pa.descricao_item
    );

-- 5. ATUALIZAR NOMES DOS ALUNOS
UPDATE alunos_parcelas 
SET nome_aluno = a.nome
FROM alunos_financeiro af
JOIN alunos a ON af.aluno_id = a.id
WHERE alunos_parcelas.alunos_financeiro_id = af.id
    AND (alunos_parcelas.nome_aluno IS NULL OR alunos_parcelas.nome_aluno != a.nome);

-- 6. VERIFICAR RESULTADO DA SINCRONIZAÇÃO
SELECT 
    'APÓS SINCRONIZAÇÃO' as status,
    'alunos_parcelas' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as pagos,
    COUNT(CASE WHEN status_pagamento = 'pendente' THEN 1 END) as pendentes,
    COUNT(nome_aluno) as com_nome_aluno,
    COUNT(CASE WHEN historico = false THEN 1 END) as nao_historico
FROM alunos_parcelas;

-- 7. VERIFICAR DISCREPÂNCIAS RESTANTES
SELECT 
    'DISCREPÂNCIAS RESTANTES' as tipo,
    COUNT(*) as total
FROM alunos_parcelas ap
JOIN alunos_financeiro af ON ap.alunos_financeiro_id = af.id
JOIN financeiro_alunos fa ON fa.aluno_id = af.aluno_id
JOIN parcelas_alunos pa ON pa.registro_financeiro_id = fa.id 
    AND pa.valor = ap.valor 
    AND pa.data_vencimento = ap.data_vencimento
    AND pa.tipo_item = ap.tipo_item
    AND pa.numero_parcela = ap.numero_parcela
WHERE ap.status_pagamento != pa.status_pagamento::status_pagamento
    AND ap.historico = false;

-- 8. EXEMPLO DE PARCELAS SINCRONIZADAS
SELECT 
    'EXEMPLO PARCELAS SINCRONIZADAS' as tipo,
    ap.id,
    ap.nome_aluno,
    ap.valor,
    ap.data_vencimento,
    ap.status_pagamento,
    ap.tipo_item
FROM alunos_parcelas ap
WHERE ap.historico = false
    AND ap.nome_aluno IS NOT NULL
    AND ap.status_pagamento = 'pago'
ORDER BY ap.nome_aluno, ap.data_vencimento
LIMIT 10;

-- =============================================
-- INSTRUÇÕES DE USO:
-- =============================================
-- 1. Execute este script diretamente no banco de dados PostgreSQL
-- 2. O script irá:
--    - Inserir parcelas faltantes de parcelas_alunos para alunos_parcelas
--    - Atualizar status de pagamento das parcelas existentes
--    - Adicionar nomes dos alunos
--    - Mostrar relatório de sincronização
-- 3. Após executar, o projeto mostrará os dados corretos
-- =============================================

-- NOTA IMPORTANTE:
-- Este script resolve a discrepância onde:
-- - parcelas_alunos tinha 3941 registros (3812 pagos, 129 pendentes)
-- - alunos_parcelas tinha apenas 923 registros (247 pagos, 676 pendentes)
-- Após a sincronização, alunos_parcelas terá todos os dados atualizados