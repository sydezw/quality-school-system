
-- Adiciona a coluna data_nascimento na tabela alunos, se não existir
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS data_nascimento date;
