-- Script para debugar e temporariamente desabilitar RLS na tabela financeiro_alunos
-- Execute este script no Supabase Dashboard -> SQL Editor

-- 1. Verificar status atual do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'financeiro_alunos';

-- 2. Verificar políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'financeiro_alunos';

-- 3. Verificar triggers na tabela
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'financeiro_alunos';

-- 4. Verificar constraints
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'financeiro_alunos';

-- 5. TEMPORARIAMENTE desabilitar RLS para teste
-- ATENÇÃO: Execute apenas para teste, reabilite depois!
ALTER TABLE financeiro_alunos DISABLE ROW LEVEL SECURITY;

-- 6. Verificar se foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled_after_disable
FROM pg_tables 
WHERE tablename = 'financeiro_alunos';

-- IMPORTANTE: Para reabilitar o RLS depois do teste:
-- ALTER TABLE financeiro_alunos ENABLE ROW LEVEL SECURITY;