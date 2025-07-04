-- Script para desabilitar temporariamente o RLS na tabela financeiro_alunos
-- Execute este script no Supabase Dashboard -> SQL Editor

-- Desabilitar RLS temporariamente
ALTER TABLE financeiro_alunos DISABLE ROW LEVEL SECURITY;

-- Verificar se o RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'financeiro_alunos';

-- Para reabilitar o RLS posteriormente (quando a autenticação estiver corrigida):
-- ALTER TABLE financeiro_alunos ENABLE ROW LEVEL SECURITY;