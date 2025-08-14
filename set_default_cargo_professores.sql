-- Script para definir valor padrão 'Professor' na coluna cargo da tabela professores
-- Execute este script no seu banco de dados PostgreSQL

BEGIN;

-- 1. Atualizar todos os professores existentes que não têm cargo definido
UPDATE professores 
SET cargo = 'Professor'
WHERE cargo IS NULL;

-- 2. Definir valor padrão 'Professor' para novos registros
ALTER TABLE professores 
ALTER COLUMN cargo SET DEFAULT 'Professor';

-- 3. Adicionar comentário para documentar a alteração
COMMENT ON COLUMN professores.cargo IS 'Cargo do professor no sistema - padrão: Professor';

COMMIT;

-- Verificar se as alterações foram aplicadas
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'professores' AND column_name = 'cargo';

-- Verificar quantos professores foram atualizados
SELECT 
    cargo,
    COUNT(*) as quantidade
FROM professores 
GROUP BY cargo;