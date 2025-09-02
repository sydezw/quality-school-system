-- Script para investigar se o processo "Tornar Ativo" causou a perda de parcelas
-- Foca na análise de ativações recentes e movimentações para histórico

-- 1. Verificar registros financeiros com ativações recentes
SELECT 
    'Ativações nos últimos 60 dias' as periodo,
    COUNT(*) as total_ativacoes
FROM financeiro_alunos 
WHERE updated_at > (CURRENT_DATE - INTERVAL '60 days')
    AND ativo_ou_encerrado = 'ativo'
UNION ALL
SELECT 
    'Ativações nos últimos 30 dias' as periodo,
    COUNT(*) as total_ativacoes
FROM financeiro_alunos 
WHERE updated_at > (CURRENT_DATE - INTERVAL '30 days')
    AND ativo_ou_encerrado = 'ativo';

-- 2. Analisar histórico de parcelas criado recentemente (possível resultado do moverParcelasParaHistorico)
SELECT 
    DATE_TRUNC('day', criado_em) as data_arquivamento,
    COUNT(*) as parcelas_arquivadas,
    COUNT(DISTINCT aluno_nome) as alunos_afetados,
    SUM(valor) as valor_total_arquivado
FROM historico_parcelas
WHERE criado_em > (CURRENT_DATE - INTERVAL '60 days')
GROUP BY DATE_TRUNC('day', criado_em)
ORDER BY data_arquivamento DESC;

-- 3. Identificar alunos que tiveram parcelas movidas para histórico recentemente
WITH alunos_arquivamento_recente AS (
    SELECT DISTINCT
        hp.aluno_nome,
        MIN(hp.criado_em) as primeira_movimentacao,
        MAX(hp.criado_em) as ultima_movimentacao,
        COUNT(*) as total_parcelas_arquivadas
    FROM historico_parcelas hp
    WHERE hp.criado_em > (CURRENT_DATE - INTERVAL '60 days')
    GROUP BY hp.aluno_nome
)
SELECT 
    aar.aluno_nome,
    aar.primeira_movimentacao,
    aar.ultima_movimentacao,
    aar.total_parcelas_arquivadas,
    a.status as status_atual_aluno,
    fa.ativo_ou_encerrado as status_financeiro,
    fa.updated_at as ultima_atualizacao_financeira,
    COUNT(pa.id) as parcelas_atuais
FROM alunos_arquivamento_recente aar
LEFT JOIN alunos a ON a.nome = aar.aluno_nome
LEFT JOIN financeiro_alunos fa ON fa.aluno_id = a.id
LEFT JOIN parcelas_alunos pa ON pa.registro_financeiro_id = fa.id
GROUP BY 
    aar.aluno_nome, aar.primeira_movimentacao, aar.ultima_movimentacao, 
    aar.total_parcelas_arquivadas, a.status, fa.ativo_ou_encerrado, fa.updated_at
ORDER BY aar.total_parcelas_arquivadas DESC;

-- 4. Verificar correlação entre ativações e arquivamentos
-- (Se uma ativação foi seguida de arquivamento no mesmo dia/período)
WITH ativacoes_recentes AS (
    SELECT 
        a.nome as aluno_nome,
        fa.updated_at as data_ativacao,
        fa.ativo_ou_encerrado
    FROM financeiro_alunos fa
    JOIN alunos a ON fa.aluno_id = a.id
    WHERE fa.updated_at > (CURRENT_DATE - INTERVAL '60 days')
        AND fa.ativo_ou_encerrado = 'ativo'
),
arquivamentos_recentes AS (
    SELECT 
        aluno_nome,
        MIN(criado_em) as data_arquivamento,
        COUNT(*) as parcelas_arquivadas
    FROM historico_parcelas
    WHERE criado_em > (CURRENT_DATE - INTERVAL '60 days')
    GROUP BY aluno_nome
)
SELECT 
    ar.aluno_nome,
    ar.data_ativacao,
    arc.data_arquivamento,
    arc.parcelas_arquivadas,
    (arc.data_arquivamento - ar.data_ativacao) as diferenca_tempo,
    CASE 
        WHEN ABS(EXTRACT(EPOCH FROM (arc.data_arquivamento - ar.data_ativacao))) < 3600 THEN 'MESMO PERÍODO (< 1h)'
        WHEN ABS(EXTRACT(EPOCH FROM (arc.data_arquivamento - ar.data_ativacao))) < 86400 THEN 'MESMO DIA'
        WHEN ABS(EXTRACT(EPOCH FROM (arc.data_arquivamento - ar.data_ativacao))) < 604800 THEN 'MESMA SEMANA'
        ELSE 'PERÍODOS DIFERENTES'
    END as correlacao_temporal
FROM ativacoes_recentes ar
INNER JOIN arquivamentos_recentes arc ON ar.aluno_nome = arc.aluno_nome
ORDER BY ar.data_ativacao DESC;

-- 5. Verificar se existem parcelas da migração original que foram arquivadas
-- (Isso indicaria que o processo TornarAtivo moveu parcelas migradas para histórico)
SELECT 
    pmr.aluno_nome,
    pmr.valor,
    pmr.data_vencimento,
    pmr.tipo_item,
    pmr.status_pagamento as status_original,
    hp.criado_em as data_arquivamento,
    hp.tipo_arquivamento,
    'Parcela migrada movida para histórico' as observacao
FROM parcelas_migracao_raw pmr
INNER JOIN historico_parcelas hp ON (
    hp.aluno_nome = pmr.aluno_nome
    AND hp.valor = pmr.valor
    AND hp.data_vencimento = pmr.data_vencimento
    AND hp.tipo_item = pmr.tipo_item
)
WHERE hp.criado_em > (CURRENT_DATE - INTERVAL '60 days')
ORDER BY hp.criado_em DESC, pmr.aluno_nome;

-- 6. Análise de padrões suspeitos de perda
-- Verificar se há alunos que perderam muitas parcelas de uma vez
WITH perdas_por_aluno AS (
    SELECT 
        pmr.aluno_nome,
        COUNT(*) as parcelas_migracao_original,
        (
            SELECT COUNT(*) 
            FROM parcelas_alunos pa
            JOIN financeiro_alunos fa ON pa.registro_financeiro_id = fa.id
            JOIN alunos a ON fa.aluno_id = a.id
            WHERE a.nome = pmr.aluno_nome
        ) as parcelas_atuais,
        (
            SELECT COUNT(*) 
            FROM historico_parcelas hp
            WHERE hp.aluno_nome = pmr.aluno_nome
        ) as parcelas_historico
    FROM parcelas_migracao_raw pmr
    GROUP BY pmr.aluno_nome
)
SELECT 
    aluno_nome,
    parcelas_migracao_original,
    parcelas_atuais,
    parcelas_historico,
    (parcelas_atuais + parcelas_historico) as total_contabilizado,
    (parcelas_migracao_original - parcelas_atuais) as parcelas_perdidas,
    (parcelas_migracao_original - (parcelas_atuais + parcelas_historico)) as parcelas_realmente_perdidas,
    CASE 
        WHEN (parcelas_migracao_original - parcelas_atuais) > 10 THEN 'PERDA ALTA (>10 parcelas)'
        WHEN (parcelas_migracao_original - parcelas_atuais) > 5 THEN 'PERDA MÉDIA (5-10 parcelas)'
        WHEN (parcelas_migracao_original - parcelas_atuais) > 0 THEN 'PERDA BAIXA (1-5 parcelas)'
        ELSE 'SEM PERDA'
    END as classificacao_perda
FROM perdas_por_aluno
WHERE (parcelas_migracao_original - parcelas_atuais) > 0
ORDER BY (parcelas_migracao_original - parcelas_atuais) DESC;

-- 7. Verificar se há evidências de execução da função moverParcelasParaHistorico
-- Buscar por padrões que indicam execução em lote
SELECT 
    DATE_TRUNC('hour', criado_em) as hora_execucao,
    COUNT(*) as parcelas_movidas,
    COUNT(DISTINCT aluno_nome) as alunos_afetados,
    MIN(criado_em) as inicio_operacao,
    MAX(criado_em) as fim_operacao,
    (MAX(criado_em) - MIN(criado_em)) as duracao_operacao,
    CASE 
        WHEN COUNT(*) > 50 AND (MAX(criado_em) - MIN(criado_em)) < INTERVAL '10 minutes' THEN 'OPERAÇÃO EM LOTE SUSPEITA'
        WHEN COUNT(DISTINCT aluno_nome) > 10 AND (MAX(criado_em) - MIN(criado_em)) < INTERVAL '1 hour' THEN 'MÚLTIPLOS ALUNOS PROCESSADOS'
        ELSE 'OPERAÇÃO NORMAL'
    END as tipo_operacao
FROM historico_parcelas
WHERE criado_em > (CURRENT_DATE - INTERVAL '60 days')
GROUP BY DATE_TRUNC('hour', criado_em)
HAVING COUNT(*) > 5  -- Apenas operações que moveram mais de 5 parcelas
ORDER BY hora_execucao DESC;

-- 8. Resumo da investigação do processo TornarAtivo
WITH resumo_investigacao AS (
    SELECT 
        (SELECT COUNT(*) FROM historico_parcelas WHERE criado_em > (CURRENT_DATE - INTERVAL '60 days')) as parcelas_arquivadas_60d,
        (SELECT COUNT(DISTINCT aluno_nome) FROM historico_parcelas WHERE criado_em > (CURRENT_DATE - INTERVAL '60 days')) as alunos_arquivados_60d,
        (SELECT COUNT(*) FROM financeiro_alunos WHERE updated_at > (CURRENT_DATE - INTERVAL '60 days') AND ativo_ou_encerrado = 'ativo') as ativacoes_60d,
        (
            SELECT COUNT(*)
            FROM parcelas_migracao_raw pmr
            WHERE EXISTS (
                SELECT 1 FROM historico_parcelas hp
                WHERE hp.aluno_nome = pmr.aluno_nome
                    AND hp.valor = pmr.valor
                    AND hp.data_vencimento = pmr.data_vencimento
                    AND hp.criado_em > (CURRENT_DATE - INTERVAL '60 days')
            )
        ) as parcelas_migracao_arquivadas_60d
)
SELECT 
    parcelas_arquivadas_60d as "Parcelas Arquivadas (60 dias)",
    alunos_arquivados_60d as "Alunos com Arquivamento (60 dias)",
    ativacoes_60d as "Ativações Financeiras (60 dias)",
    parcelas_migracao_arquivadas_60d as "Parcelas da Migração Arquivadas (60 dias)",
    CASE 
        WHEN parcelas_migracao_arquivadas_60d > 1000 THEN 
            'ALTA PROBABILIDADE: Processo TornarAtivo moveu muitas parcelas da migração para histórico'
        WHEN parcelas_migracao_arquivadas_60d > 500 THEN 
            'MÉDIA PROBABILIDADE: Algumas parcelas da migração foram arquivadas'
        WHEN parcelas_arquivadas_60d > 0 AND ativacoes_60d > 0 THEN 
            'BAIXA PROBABILIDADE: Há atividade de arquivamento, mas poucas parcelas da migração'
        ELSE 
            'IMPROVÁVEL: Pouca ou nenhuma atividade de arquivamento recente'
    END as "Diagnóstico TornarAtivo"
FROM resumo_investigacao;