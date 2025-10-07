-- =============================================
-- SCRIPT PARA CORRIGIR DATA DE PAGAMENTO DAS PARCELAS
-- =============================================
-- Este script corrige o problema onde parcelas estão marcadas como 'pago'
-- no banco de dados mas não aparecem como pagas no frontend porque
-- não possuem data_pagamento preenchida.
--
-- O frontend usa a função calcularStatusAutomatico que verifica primeiro
-- se existe data_pagamento para determinar se a parcela está paga.
-- =============================================

-- 1. VERIFICAR SITUAÇÃO ATUAL
SELECT 
    'SITUAÇÃO ATUAL' as tipo,
    COUNT(*) as total_parcelas,
    COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as marcadas_como_pagas,
    COUNT(CASE WHEN status_pagamento = 'pago' AND data_pagamento IS NOT NULL THEN 1 END) as pagas_com_data,
    COUNT(CASE WHEN status_pagamento = 'pago' AND data_pagamento IS NULL THEN 1 END) as pagas_sem_data
FROM alunos_parcelas
WHERE historico = false;

-- 2. EXEMPLO DE PARCELAS QUE SERÃO CORRIGIDAS
SELECT 
    'EXEMPLO PARCELAS A CORRIGIR' as tipo,
    id,
    nome_aluno,
    numero_parcela,
    valor,
    data_vencimento,
    status_pagamento,
    data_pagamento
FROM alunos_parcelas 
WHERE status_pagamento = 'pago' 
    AND data_pagamento IS NULL
    AND historico = false
ORDER BY nome_aluno, numero_parcela
LIMIT 10;

-- 3. ATUALIZAR DATA DE PAGAMENTO PARA PARCELAS PAGAS
-- Define a data_pagamento como a data_vencimento para parcelas marcadas como pagas
UPDATE alunos_parcelas 
SET data_pagamento = data_vencimento,
    updated_at = NOW()
WHERE status_pagamento = 'pago' 
    AND data_pagamento IS NULL
    AND historico = false;

-- 4. VERIFICAR RESULTADO DA CORREÇÃO
SELECT 
    'RESULTADO APÓS CORREÇÃO' as tipo,
    COUNT(*) as total_parcelas,
    COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as marcadas_como_pagas,
    COUNT(CASE WHEN status_pagamento = 'pago' AND data_pagamento IS NOT NULL THEN 1 END) as pagas_com_data,
    COUNT(CASE WHEN status_pagamento = 'pago' AND data_pagamento IS NULL THEN 1 END) as pagas_sem_data_restantes
FROM alunos_parcelas
WHERE historico = false;

-- 5. EXEMPLO DE PARCELAS CORRIGIDAS
SELECT 
    'EXEMPLO PARCELAS CORRIGIDAS' as tipo,
    id,
    nome_aluno,
    numero_parcela,
    valor,
    data_vencimento,
    status_pagamento,
    data_pagamento
FROM alunos_parcelas 
WHERE status_pagamento = 'pago' 
    AND data_pagamento IS NOT NULL
    AND historico = false
ORDER BY nome_aluno, numero_parcela
LIMIT 10;

-- 6. VERIFICAR IMPACTO NO FRONTEND
-- Esta consulta simula como o frontend calculará o status após a correção
SELECT 
    'SIMULAÇÃO STATUS FRONTEND' as tipo,
    COUNT(*) as total_parcelas,
    COUNT(CASE WHEN data_pagamento IS NOT NULL THEN 1 END) as aparecerão_como_pagas,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento = 'cancelado' THEN 1 END) as aparecerão_como_canceladas,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento != 'cancelado' AND data_vencimento < NOW() THEN 1 END) as aparecerão_como_vencidas,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento != 'cancelado' AND data_vencimento >= NOW() THEN 1 END) as aparecerão_como_pendentes
FROM alunos_parcelas
WHERE historico = false;

-- =============================================
-- INSTRUÇÕES DE USO:
-- =============================================
-- 1. Execute este script diretamente no banco de dados PostgreSQL
-- 2. O script irá:
--    a) Mostrar a situação atual das parcelas
--    b) Atualizar a data_pagamento para parcelas marcadas como pagas
--    c) Verificar o resultado da correção
--    d) Simular como as parcelas aparecerão no frontend
-- 3. Após executar, as parcelas pagas aparecerão corretamente no frontend
-- 4. O frontend usa a lógica: se tem data_pagamento = 'pago', senão verifica outros critérios
-- =============================================

-- OBSERVAÇÕES IMPORTANTES:
-- - Este script apenas corrige parcelas que já estão marcadas como 'pago' no banco
-- - Não altera o status_pagamento, apenas adiciona a data_pagamento necessária
-- - A data_pagamento será definida como igual à data_vencimento
-- - Apenas parcelas não históricas são afetadas
-- - O frontend passará a reconhecer essas parcelas como pagas automaticamente