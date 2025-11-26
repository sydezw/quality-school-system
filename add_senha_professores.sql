-- Script para adicionar coluna senha na tabela professores
-- Execute este script no seu banco de dados PostgreSQL

BEGIN;

-- Adicionar coluna senha na tabela professores
ALTER TABLE professores 
ADD COLUMN senha TEXT;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN professores.senha IS 'Senha de acesso do professor ao sistema';

COMMIT;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'professores' AND column_name = 'senha';