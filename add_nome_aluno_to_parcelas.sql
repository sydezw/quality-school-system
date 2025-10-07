-- Script para adicionar coluna nome_aluno na tabela alunos_parcelas
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna nome_aluno
ALTER TABLE alunos_parcelas ADD COLUMN nome_aluno TEXT;

-- Atualizar as parcelas existentes com o nome do aluno
UPDATE alunos_parcelas 
SET nome_aluno = a.nome
FROM alunos_financeiro af
JOIN alunos a ON af.aluno_id = a.id
WHERE alunos_parcelas.alunos_financeiro_id = af.id;

-- Verificar se a coluna foi adicionada e os dados foram atualizados
SELECT 
    ap.id,
    ap.nome_aluno,
    ap.numero_parcela,
    ap.valor,
    ap.data_vencimento
FROM alunos_parcelas ap
LIMIT 10;

-- Opcional: Tornar a coluna NOT NULL após verificar que todos os registros foram atualizados
-- ALTER TABLE alunos_parcelas ALTER COLUMN nome_aluno SET NOT NULL;