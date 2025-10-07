-- =============================================
-- SCRIPT PARA DEFINIR DATA DE PAGAMENTO COMO 05/10/2025
-- =============================================
-- Este script define a data de pagamento como 05/10/2025
-- para todas as parcelas que estão marcadas como 'pago'
-- no banco de dados
-- =============================================

-- 1. VERIFICAR SITUAÇÃO ATUAL DAS PARCELAS PAGAS
SELECT 
    'SITUAÇÃO ATUAL' as tipo,
    COUNT(*) as total_parcelas_pagas,
    COUNT(CASE WHEN data_pagamento IS NOT NULL THEN 1 END) as com_data_pagamento,
    COUNT(CASE WHEN data_pagamento IS NULL THEN 1 END) as sem_data_pagamento
FROM alunos_parcelas
WHERE status_pagamento = 'pago' 
    AND historico = false;

-- 2. EXEMPLO DE PARCELAS QUE SERÃO ATUALIZADAS
SELECT 
    'EXEMPLO PARCELAS A ATUALIZAR' as tipo,
    id,
    nome_aluno,
    numero_parcela,
    valor,
    data_vencimento,
    status_pagamento,
    data_pagamento as data_pagamento_atual
FROM alunos_parcelas 
WHERE status_pagamento = 'pago'
    AND historico = false
ORDER BY nome_aluno, numero_parcela
LIMIT 10;

-- 3. ATUALIZAR DATA DE PAGAMENTO PARA 05/10/2025
-- Define a data_pagamento como 05/10/2025 para todas as parcelas pagas
UPDATE alunos_parcelas 
SET data_pagamento = '2025-10-05'::date
WHERE status_pagamento = 'pago' 
    AND historico = false;

-- 4. VERIFICAR RESULTADO DA ATUALIZAÇÃO
SELECT 
    'RESULTADO APÓS ATUALIZAÇÃO' as tipo,
    COUNT(*) as total_parcelas_pagas,
    COUNT(CASE WHEN data_pagamento = '2025-10-05'::date THEN 1 END) as com_data_05_10_25,
    COUNT(CASE WHEN data_pagamento IS NOT NULL AND data_pagamento != '2025-10-05'::date THEN 1 END) as com_outras_datas,
    COUNT(CASE WHEN data_pagamento IS NULL THEN 1 END) as ainda_sem_data
FROM alunos_parcelas
WHERE status_pagamento = 'pago' 
    AND historico = false;

-- 5. EXEMPLO DE PARCELAS ATUALIZADAS
SELECT 
    'EXEMPLO PARCELAS ATUALIZADAS' as tipo,
    id,
    nome_aluno,
    numero_parcela,
    valor,
    data_vencimento,
    status_pagamento,
    data_pagamento,
    'Aparecerá como PAGA no frontend' as status_frontend
FROM alunos_parcelas 
WHERE status_pagamento = 'pago'
    AND data_pagamento = '2025-10-05'::date
    AND historico = false
ORDER BY nome_aluno, numero_parcela
LIMIT 15;

-- 6. VERIFICAR IMPACTO NO FRONTEND
-- Esta consulta simula como o frontend calculará o status após a atualização
SELECT 
    'SIMULAÇÃO STATUS FRONTEND' as tipo,
    COUNT(*) as total_parcelas,
    COUNT(CASE WHEN data_pagamento IS NOT NULL THEN 1 END) as aparecerão_como_PAGAS,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento = 'cancelado' THEN 1 END) as aparecerão_como_CANCELADAS,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento != 'cancelado' AND data_vencimento < NOW() THEN 1 END) as aparecerão_como_VENCIDAS,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento != 'cancelado' AND data_vencimento >= NOW() THEN 1 END) as aparecerão_como_PENDENTES
FROM alunos_parcelas
WHERE historico = false;

-- 7. ESTATÍSTICAS FINAIS
SELECT 
    'ESTATÍSTICAS FINAIS' as tipo,
    COUNT(*) as total_parcelas_ativas,
    COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as total_marcadas_pagas,
    COUNT(CASE WHEN data_pagamento = '2025-10-05'::date THEN 1 END) as pagas_em_05_10_25,
    SUM(CASE WHEN data_pagamento = '2025-10-05'::date THEN valor ELSE 0 END) as valor_total_pago_05_10_25
FROM alunos_parcelas
WHERE historico = false;

-- =============================================
-- INSTRUÇÕES DE USO:
-- =============================================
-- 1. Execute este script diretamente no banco de dados PostgreSQL
-- 2. O script irá:
--    a) Mostrar a situação atual das parcelas pagas
--    b) Atualizar a data_pagamento para 05/10/2025 em todas as parcelas pagas
--    c) Verificar o resultado da atualização
--    d) Simular como as parcelas aparecerão no frontend
-- 3. Após executar, todas as parcelas pagas terão data_pagamento = 05/10/2025
-- 4. O frontend reconhecerá todas essas parcelas como pagas
-- =============================================

-- OBSERVAÇÕES IMPORTANTES:
-- - Este script atualiza TODAS as parcelas com status_pagamento = 'pago'
-- - A data será definida como 05/10/2025 para todas elas
-- - Apenas parcelas não históricas são afetadas
-- - O frontend passará a reconhecer todas essas parcelas como pagas
-- - Se você quiser uma data diferente, altere '2025-10-05' no comando UPDATE