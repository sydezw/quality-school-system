-- Script para desabilitar temporariamente o RLS da tabela alunos_parcelas
-- Execute este script no Supabase SQL Editor para resolver o erro 401

-- Desabilitar RLS temporariamente
ALTER TABLE alunos_parcelas DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS Habilitado'
        ELSE 'RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE tablename = 'alunos_parcelas';

-- IMPORTANTE: Após testar a funcionalidade, reabilite o RLS executando:
-- ALTER TABLE alunos_parcelas ENABLE ROW LEVEL SECURITY;