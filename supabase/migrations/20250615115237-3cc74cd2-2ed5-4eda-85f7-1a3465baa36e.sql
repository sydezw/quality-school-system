
-- Adicionar campo CPF na tabela de alunos
ALTER TABLE public.alunos 
ADD COLUMN cpf TEXT;

-- Adicionar campo CPF na tabela de professores  
ALTER TABLE public.professores 
ADD COLUMN cpf TEXT;

-- Adicionar índices únicos para CPF (evitar duplicatas)
CREATE UNIQUE INDEX idx_alunos_cpf ON public.alunos (cpf) WHERE cpf IS NOT NULL;
CREATE UNIQUE INDEX idx_professores_cpf ON public.professores (cpf) WHERE cpf IS NOT NULL;
