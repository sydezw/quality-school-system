-- =============================================
-- SCRIPT PARA VERIFICAR SE A CORREÇÃO FOI APLICADA
-- =============================================
-- Use este script após executar corrigir_data_pagamento_parcelas.sql
-- para verificar se todas as parcelas pagas agora têm data_pagamento
-- =============================================

-- 1. VERIFICAR SE AINDA EXISTEM PARCELAS PAGAS SEM DATA
SELECT 
    'VERIFICAÇÃO PÓS-CORREÇÃO' as status,
    COUNT(*) as total_parcelas_ativas,
    COUNT(CASE WHEN status_pagamento = 'pago' THEN 1 END) as total_marcadas_pagas,
    COUNT(CASE WHEN status_pagamento = 'pago' AND data_pagamento IS NOT NULL THEN 1 END) as pagas_com_data,
    COUNT(CASE WHEN status_pagamento = 'pago' AND data_pagamento IS NULL THEN 1 END) as pagas_sem_data_PROBLEMA
FROM alunos_parcelas
WHERE historico = false;

-- 2. SE AINDA HOUVER PROBLEMAS, MOSTRAR QUAIS SÃO
SELECT 
    'PARCELAS AINDA COM PROBLEMA' as tipo,
    id,
    nome_aluno,
    numero_parcela,
    valor,
    data_vencimento,
    status_pagamento,
    data_pagamento,
    created_at,
    updated_at
FROM alunos_parcelas 
WHERE status_pagamento = 'pago' 
    AND data_pagamento IS NULL
    AND historico = false
ORDER BY nome_aluno, numero_parcela;

-- 3. SIMULAR COMO O FRONTEND VERÁ AS PARCELAS AGORA
SELECT 
    'SIMULAÇÃO STATUS FRONTEND' as tipo,
    COUNT(*) as total_parcelas,
    COUNT(CASE WHEN data_pagamento IS NOT NULL THEN 1 END) as frontend_mostrará_como_PAGAS,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento = 'cancelado' THEN 1 END) as frontend_mostrará_como_CANCELADAS,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento != 'cancelado' AND data_vencimento < NOW() THEN 1 END) as frontend_mostrará_como_VENCIDAS,
    COUNT(CASE WHEN data_pagamento IS NULL AND status_pagamento != 'cancelado' AND data_vencimento >= NOW() THEN 1 END) as frontend_mostrará_como_PENDENTES
FROM alunos_parcelas
WHERE historico = false;

-- 4. EXEMPLO DE PARCELAS QUE AGORA APARECERÃO COMO PAGAS NO FRONTEND
SELECT 
    'EXEMPLO PARCELAS CORRIGIDAS' as tipo,
    nome_aluno,
    numero_parcela,
    valor,
    data_vencimento,
    data_pagamento,
    status_pagamento,
    'Aparecerá como PAGA no frontend' as status_frontend
FROM alunos_parcelas 
WHERE status_pagamento = 'pago' 
    AND data_pagamento IS NOT NULL
    AND historico = false
ORDER BY nome_aluno, numero_parcela
LIMIT 15;

-- 5. ESTATÍSTICAS FINAIS PARA RELATÓRIOS
SELECT 
    'ESTATÍSTICAS FINAIS' as tipo,
    COUNT(*) as total_parcelas_ativas,
    COUNT(CASE WHEN data_pagamento IS NOT NULL THEN 1 END) as parcelas_pagas_frontend,
    ROUND(
        (COUNT(CASE WHEN data_pagamento IS NOT NULL THEN 1 END)::decimal / COUNT(*)) * 100, 
        2
    ) as percentual_pagas,
    SUM(CASE WHEN data_pagamento IS NOT NULL THEN valor ELSE 0 END) as valor_total_pago,
    SUM(CASE WHEN data_pagamento IS NULL THEN valor ELSE 0 END) as valor_total_pendente
FROM alunos_parcelas
WHERE historico = false;

-- =============================================
-- INTERPRETAÇÃO DOS RESULTADOS:
-- =============================================
-- 
-- ✅ SUCESSO se:
-- - pagas_sem_data_PROBLEMA = 0
-- - frontend_mostrará_como_PAGAS > 0
-- - Aparecem exemplos de parcelas corrigidas
--
-- ❌ PROBLEMA se:
-- - pagas_sem_data_PROBLEMA > 0
-- - Aparecem parcelas na consulta "PARCELAS AINDA COM PROBLEMA"
--
-- 📊 As estatísticas finais mostram como o sistema ficará
-- após a correção do ponto de vista do usuário final
-- =============================================