-- Desabilitar temporariamente RLS na tabela alunos_financeiro para permitir clonagem
ALTER TABLE alunos_financeiro DISABLE ROW LEVEL SECURITY;

-- Verificar se o RLS foi desabilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'alunos_financeiro';

-- Para reabilitar depois da operação de clonagem:
-- ALTER TABLE alunos_financeiro ENABLE ROW LEVEL SECURITY;