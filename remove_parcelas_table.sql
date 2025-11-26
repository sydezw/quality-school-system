-- Remove tabela parcelas do banco de dados
-- Esta tabela foi substituída pela tabela financeiro_alunos
-- Execute este script APENAS após confirmar que:
-- 1. Todas as funções hard_delete foram removidas
-- 2. O sistema está usando financeiro_alunos para controle financeiro
-- 3. Não há dependências ativas da tabela parcelas

-- Verificar se a tabela parcelas existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'parcelas';

-- Verificar se há constraints ou dependências
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (tc.table_name = 'parcelas' OR ccu.table_name = 'parcelas');

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM parcelas;

-- ATENÇÃO: Descomente as linhas abaixo APENAS se:
-- 1. A verificação acima confirmar que a tabela existe
-- 2. Não há constraints impedindo a remoção
-- 3. Você tem certeza de que os dados não são mais necessários

-- Revogar permissões da tabela parcelas
-- REVOKE ALL ON TABLE public.parcelas FROM anon;
-- REVOKE ALL ON TABLE public.parcelas FROM authenticated;
-- REVOKE ALL ON TABLE public.parcelas FROM service_role;

-- Remover a tabela parcelas
-- DROP TABLE IF EXISTS public.parcelas CASCADE;

-- Verificar se a tabela foi removida com sucesso
-- SELECT 
--     table_name,
--     table_schema
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name = 'parcelas';

-- Se a query acima não retornar resultados, a tabela foi removida com sucesso

/*
NOTAS IMPORTANTES:
1. Esta operação é IRREVERSÍVEL
2. Faça backup do banco antes de executar
3. Confirme que o sistema financeiro_alunos está funcionando corretamente
4. Execute as verificações antes de descomentar os comandos de remoção
5. A opção CASCADE remove também objetos dependentes (views, triggers, etc.)
*/