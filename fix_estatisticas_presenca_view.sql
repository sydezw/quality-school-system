-- Query para corrigir a view estatisticas_presenca_aluno
-- Alterando 'faltas_justificadas' para 'faltas_repostas' para refletir o novo enum

-- 1. Primeiro, vamos dropar a view existente
DROP VIEW IF EXISTS estatisticas_presenca_aluno;

-- 2. Recriar a view com a nomenclatura correta
CREATE VIEW estatisticas_presenca_aluno AS
SELECT 
    a.id as aluno_id,
    a.nome as aluno_nome,
    t.id as turma_id,
    t.nome as turma_nome,
    COUNT(p.id) as total_aulas,
    COUNT(CASE WHEN p.status = 'Presente' THEN 1 END) as presencas,
    COUNT(CASE WHEN p.status = 'Falta' THEN 1 END) as faltas,
    COUNT(CASE WHEN p.status = 'Reposta' THEN 1 END) as faltas_repostas,
    CASE 
        WHEN COUNT(p.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN p.status = 'Presente' THEN 1 END)::numeric / COUNT(p.id)::numeric) * 100, 2)
        ELSE 0
    END as percentual_presenca
FROM alunos a
LEFT JOIN aluno_turma at ON a.id = at.aluno_id
LEFT JOIN turmas t ON at.turma_id = t.id
LEFT JOIN aulas au ON t.id = au.turma_id
LEFT JOIN presencas p ON au.id = p.aula_id AND a.id = p.aluno_id
GROUP BY a.id, a.nome, t.id, t.nome;

-- 3. Comentário sobre a alteração
-- Esta view agora usa 'faltas_repostas' ao invés de 'faltas_justificadas'
-- para refletir o novo enum status_presenca: "Presente" | "Falta" | "Reposta"