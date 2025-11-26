-- INVESTIGAÇÃO COMPLETA DAS PARCELAS PERDIDAS
-- Query otimizada baseada na estrutura real das tabelas
-- Diferença identificada: parcelas_migracao_raw (5966) vs parcelas_alunos (4044) = ~1922 parcelas perdidas

-- =============================================
-- 1. CONTAGEM GERAL DAS TABELAS
-- =============================================
SELECT 
    'CONTAGEM GERAL' as secao,
    (SELECT COUNT(*) FROM parcelas_migracao_raw) as migracao_raw,
    (SELECT COUNT(*) FROM parcelas_alunos) as parcelas_atuais,
    (SELECT COUNT(*) FROM historico_parcelas) as historico,
    (SELECT COUNT(*) FROM financeiro_alunos) as registros_financeiros,
    ((SELECT COUNT(*) FROM parcelas_alunos) + (SELECT COUNT(*) FROM historico_parcelas)) as total_contabilizado,
    ((SELECT COUNT(*) FROM parcelas_migracao_raw) - (SELECT COUNT(*) FROM parcelas_alunos)) as diferenca_perdida;

-- =============================================
-- 2. ANÁLISE POR PERÍODO (ÚLTIMOS 60 DIAS)
-- =============================================
SELECT 
    'ATIVIDADE RECENTE' as secao,
    (SELECT COUNT(*) FROM financeiro_alunos WHERE updated_at > (CURRENT_DATE - INTERVAL '60 days')) as ativacoes_60d,
    (SELECT COUNT(*) FROM historico_parcelas WHERE criado_em > (CURRENT_DATE - INTERVAL '60 days')) as arquivamentos_60d,
    (SELECT COUNT(DISTINCT aluno_id) FROM historico_parcelas WHERE criado_em > (CURRENT_DATE - INTERVAL '60 days')) as alunos_arquivados_60d;

-- =============================================
-- 3. COMPARAÇÃO DIRETA: MIGRAÇÃO vs ATUAL
-- =============================================
WITH comparacao_dados AS (
    -- Dados da migração original
    SELECT 
        'migracao' as origem,
        aluno_nome,
        valor,
        data_vencimento,
        status_pagamento,
        tipo_item,
        idioma
    FROM parcelas_migracao_raw
    
    UNION ALL
    
    -- Dados atuais do sistema
    SELECT 
        'atual' as origem,
        a.nome as aluno_nome,
        pa.valor,
        pa.data_vencimento,
        pa.status_pagamento,
        pa.tipo_item,
        pa.idioma_registro as idioma
    FROM parcelas_alunos pa
    JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
    JOIN alunos a ON fa.aluno_id = a.id
)
SELECT 
    'COMPARACAO POR ORIGEM' as secao,
    origem,
    COUNT(*) as total_parcelas,
    COUNT(DISTINCT aluno_nome) as alunos_unicos,
    SUM(valor) as valor_total
FROM comparacao_dados
GROUP BY origem;

-- =============================================
-- 4. IDENTIFICAR PARCELAS PERDIDAS
-- =============================================
WITH parcelas_perdidas AS (
    SELECT 
        pmr.aluno_nome,
        pmr.valor,
        pmr.data_vencimento,
        pmr.status_pagamento,
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
    'PARCELAS PERDIDAS' as secao,
    COUNT(*) as total_perdidas,
    COUNT(DISTINCT aluno_nome) as alunos_afetados,
    SUM(valor) as valor_perdido,
    tipo_item,
    COUNT(*) as qtd_por_tipo
FROM parcelas_perdidas
GROUP BY tipo_item
ORDER BY qtd_por_tipo DESC;

-- =============================================
-- 5. VERIFICAR SE ESTÃO NO HISTÓRICO
-- =============================================
WITH parcelas_no_historico AS (
    SELECT 
        pmr.aluno_nome,
        pmr.valor,
        pmr.data_vencimento,
        pmr.tipo_item
    FROM parcelas_migracao_raw pmr
    WHERE EXISTS (
        SELECT 1 
        FROM historico_parcelas hp
        JOIN alunos a ON hp.aluno_id = a.id
        WHERE a.nome = pmr.aluno_nome
        AND hp.valor = pmr.valor
        AND hp.data_vencimento = pmr.data_vencimento
        AND hp.tipo_item = pmr.tipo_item
    )
)
SELECT 
    'PARCELAS NO HISTORICO' as secao,
    COUNT(*) as total_no_historico,
    COUNT(DISTINCT aluno_nome) as alunos_no_historico;

-- =============================================
-- 6. ANÁLISE DO PROCESSO "TORNAR ATIVO"
-- =============================================
SELECT 
    'PROCESSO TORNAR ATIVO' as secao,
    DATE(hp.criado_em) as data_arquivamento,
    COUNT(*) as parcelas_arquivadas,
    COUNT(DISTINCT hp.aluno_id) as alunos_afetados,
    hp.tipo_arquivamento
FROM historico_parcelas hp
WHERE hp.criado_em > (CURRENT_DATE - INTERVAL '90 days')
GROUP BY DATE(hp.criado_em), hp.tipo_arquivamento
ORDER BY data_arquivamento DESC
LIMIT 20;

-- =============================================
-- 7. ALUNOS COM ATIVAÇÕES RECENTES
-- =============================================
SELECT 
    'ATIVACOES RECENTES' as secao,
    a.nome as aluno_nome,
    fa.updated_at as data_ativacao,
    fa.ativo_ou_encerrado as status_atual,
    (SELECT COUNT(*) FROM parcelas_alunos pa WHERE pa.registro_financeiro_id = fa.id) as parcelas_atuais,
    (SELECT COUNT(*) FROM historico_parcelas hp WHERE hp.aluno_id = a.id) as parcelas_historico
FROM financeiro_alunos fa
JOIN alunos a ON fa.aluno_id = a.id
WHERE fa.updated_at > (CURRENT_DATE - INTERVAL '30 days')
AND fa.ativo_ou_encerrado = 'ativo'
ORDER BY fa.updated_at DESC
LIMIT 10;

-- =============================================
-- 8. DIAGNÓSTICO FINAL
-- =============================================
WITH diagnostico AS (
    SELECT 
        (SELECT COUNT(*) FROM parcelas_migracao_raw) as total_original,
        (SELECT COUNT(*) FROM parcelas_alunos) as total_atual,
        (SELECT COUNT(*) FROM historico_parcelas) as total_historico,
        (
            SELECT COUNT(*) 
            FROM parcelas_migracao_raw pmr
            WHERE NOT EXISTS (
                SELECT 1 
                FROM parcelas_alunos pa
                JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
                JOIN alunos a ON fa.aluno_id = a.id
                WHERE a.nome = pmr.aluno_nome
                AND pa.valor = pmr.valor
                AND pa.data_vencimento = pmr.data_vencimento
            )
            AND NOT EXISTS (
                SELECT 1 
                FROM historico_parcelas hp
                JOIN alunos a ON hp.aluno_id = a.id
                WHERE a.nome = pmr.aluno_nome
                AND hp.valor = pmr.valor
                AND hp.data_vencimento = pmr.data_vencimento
            )
        ) as verdadeiramente_perdidas
)
SELECT 
    'DIAGNOSTICO FINAL' as secao,
    total_original as "Total Original (migração)",
    total_atual as "Total Atual (parcelas_alunos)",
    total_historico as "Total Histórico",
    (total_atual + total_historico) as "Total Contabilizado",
    (total_original - total_atual) as "Diferença Aparente",
    verdadeiramente_perdidas as "Verdadeiramente Perdidas",
    CASE 
        WHEN verdadeiramente_perdidas = 0 THEN 'TODAS AS PARCELAS ESTÃO CONTABILIZADAS (atual + histórico)'
        WHEN verdadeiramente_perdidas < 100 THEN 'PERDA MÍNIMA - Investigar casos específicos'
        WHEN verdadeiramente_perdidas > 1000 THEN 'PERDA SIGNIFICATIVA - Ação urgente necessária'
        ELSE 'PERDA MODERADA - Verificar processo de migração'
    END as diagnostico
FROM diagnostico;

-- =============================================
-- 9. RECOMENDAÇÕES BASEADAS NO RESULTADO
-- =============================================
SELECT 
    'RECOMENDACOES' as secao,
    'Se verdadeiramente_perdidas = 0: Parcelas foram movidas para histórico pelo processo Tornar Ativo' as cenario_1,
    'Se verdadeiramente_perdidas > 0: Parcelas foram deletadas sem backup - Recuperar da parcelas_migracao_raw' as cenario_2,
    'Verificar logs da aplicação para confirmar quando ocorreram as perdas' as acao_1,
    'Implementar auditoria para prevenir futuras perdas' as acao_2;

-- =============================================
-- QUERY EXECUTADA COM SUCESSO
-- =============================================
SELECT 'INVESTIGACAO CONCLUIDA' as status, NOW() as timestamp_execucao;