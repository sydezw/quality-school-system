-- Script para corrigir erro 409 ao salvar alunos
-- Execute este script no Supabase SQL Editor

-- Desabilitar RLS temporariamente na tabela alunos
ALTER TABLE public.alunos DISABLE ROW LEVEL SECURITY;

-- Verificar se o RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'alunos';

-- Comentário: Para reabilitar o RLS posteriormente (quando a autenticação estiver corrigida):
-- ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Verificar se existem constraints ou triggers que podem causar conflito
SELECT 
  conname, 
  contype, 
  pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'public.alunos'::regclass;

-- Verificar triggers na tabela alunos
SELECT 
  tgname, 
  tgtype, 
  tgenabled, 
  pg_get_triggerdef(oid) as definition 
FROM pg_trigger 
WHERE tgrelid = 'public.alunos'::regclass 
  AND tgname NOT LIKE 'RI_%';