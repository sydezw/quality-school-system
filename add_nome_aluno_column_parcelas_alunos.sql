-- Adicionar coluna nome_aluno na tabela parcelas_alunos
ALTER TABLE parcelas_alunos 
ADD COLUMN nome_aluno TEXT;

-- Atualizar a coluna com os nomes dos alunos
UPDATE parcelas_alunos 
SET nome_aluno = a.nome
FROM financeiro_alunos fa
JOIN alunos a ON fa.aluno_id = a.id
WHERE parcelas_alunos.registro_financeiro_id = fa.id;

-- Verificar se a atualização funcionou
SELECT COUNT(*) as total_parcelas, 
       COUNT(nome_aluno) as parcelas_com_nome,
       COUNT(*) - COUNT(nome_aluno) as parcelas_sem_nome
FROM parcelas_alunos;

-- Exemplo de consulta para verificar os dados
SELECT id, numero_parcela, valor, nome_aluno, data_vencimento
FROM parcelas_alunos 
WHERE nome_aluno IS NOT NULL
ORDER BY nome_aluno, numero_parcela
LIMIT 10;