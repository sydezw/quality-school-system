-- Migration para adicionar campo 'nivel' à tabela turmas
-- Data: 2025-01-31
-- Descrição: Adiciona a coluna 'nivel' à tabela turmas para permitir classificação por nível

BEGIN;

-- Adicionar a coluna 'nivel' à tabela turmas
-- Usando o enum 'nivel' que já existe no sistema
ALTER TABLE public.turmas 
ADD COLUMN nivel nivel;

-- Comentário para documentar a coluna
COMMENT ON COLUMN public.turmas.nivel IS 'Nível da turma (Book 1, Book 2, etc.)';

-- Opcional: Definir um valor padrão para turmas existentes
-- Descomente a linha abaixo se quiser definir um nível padrão para turmas existentes
-- UPDATE public.turmas SET nivel = 'Book 1' WHERE nivel IS NULL;

-- Opcional: Tornar a coluna obrigatória (NOT NULL)
-- Descomente as linhas abaixo se quiser tornar o campo obrigatório
-- UPDATE public.turmas SET nivel = 'Book 1' WHERE nivel IS NULL;
-- ALTER TABLE public.turmas ALTER COLUMN nivel SET NOT NULL;

COMMIT;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'turmas' 
AND table_schema = 'public' 
AND column_name = 'nivel';