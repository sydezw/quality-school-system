-- Script para corrigir erro de constraint única no CPF
-- Execute este script no Supabase SQL Editor

-- Remover o índice único do CPF que está causando o erro 23505
DROP INDEX IF EXISTS public.idx_alunos_cpf;

-- Criar um índice não-único para melhorar performance de consultas por CPF
-- mas permitir CPFs duplicados ou nulos
CREATE INDEX IF NOT EXISTS idx_alunos_cpf_non_unique 
ON public.alunos USING btree (cpf) 
WHERE (cpf IS NOT NULL);

-- Verificar se o índice único foi removido
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'alunos' AND indexname LIKE '%cpf%';

-- Comentário: 
-- Este script remove a constraint única do CPF, permitindo:
-- 1. CPFs duplicados (caso necessário para o sistema)
-- 2. CPFs nulos/vazios
-- 3. Mantém performance de consulta com índice não-único