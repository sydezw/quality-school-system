-- Habilitar RLS na tabela financeiro_alunos para que as políticas funcionem
ALTER TABLE financeiro_alunos ENABLE ROW LEVEL SECURITY;

-- Verificar se o RLS foi habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'financeiro_alunos';