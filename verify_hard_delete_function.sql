-- Script para verificar a existência das funções hard_delete no banco de dados
-- Execute este script primeiro para confirmar se as funções existem

-- 1. Verificar se as funções hard_delete existem
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('hard_delete_aluno', 'hard_delete_professor');

-- 2. Verificar permissões (ACL) das funções se elas existirem
SELECT 
    routine_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public' 
  AND routine_name IN ('hard_delete_aluno', 'hard_delete_professor');

-- 3. Listar todas as funções que contêm 'hard_delete' no nome
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%hard_delete%';

-- Resultado esperado:
-- - Se as funções hard_delete_aluno ou hard_delete_professor existirem, elas aparecerão na primeira query
-- - Se não existirem, a primeira query retornará 0 linhas
-- - A terceira query mostrará todas as funções hard_delete existentes no banco