-- Script para corrigir a constraint da coluna tipo_aula na tabela aulas
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos remover a constraint antiga
ALTER TABLE aulas DROP CONSTRAINT IF EXISTS aulas_tipo_aula_check;

-- 2. Adicionar a nova constraint com os valores corretos
ALTER TABLE aulas ADD CONSTRAINT aulas_tipo_aula_check 
CHECK (tipo_aula IN ('normal', 'avaliativa', 'prova_final'));

-- 3. Verificar se há registros com valores antigos e atualizá-los
UPDATE aulas SET tipo_aula = 'avaliativa' WHERE tipo_aula = 'prova';
UPDATE aulas SET tipo_aula = 'normal' WHERE tipo_aula = 'revisao';

-- 4. Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'aulas' AND column_name = 'tipo_aula';

-- 5. Verificar as constraints
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'aulas'::regclass AND conname LIKE '%tipo_aula%';