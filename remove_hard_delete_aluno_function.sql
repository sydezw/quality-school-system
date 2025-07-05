-- Remove função hard_delete_aluno do banco de dados
-- Esta query deve ser executada no Supabase para remover a função obsoleta

-- Primeiro, remover as permissões (ACL) da função se existirem
REVOKE ALL ON FUNCTION public.hard_delete_aluno FROM anon;
REVOKE ALL ON FUNCTION public.hard_delete_aluno FROM authenticated;
REVOKE ALL ON FUNCTION public.hard_delete_aluno FROM service_role;

-- Remover a função hard_delete_aluno
DROP FUNCTION IF EXISTS public.hard_delete_aluno(uuid, boolean, boolean, boolean, boolean, boolean);

-- Verificar se a função foi removida com sucesso
-- Execute esta query para confirmar:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_name = 'hard_delete_aluno';
-- (Deve retornar 0 linhas se a função foi removida com sucesso)

-- Comentário: Esta função era parte do sistema de exclusão física antigo
-- e foi substituída pelo sistema atual que usa ON DELETE CASCADE
-- nas constraints das tabelas relacionadas.