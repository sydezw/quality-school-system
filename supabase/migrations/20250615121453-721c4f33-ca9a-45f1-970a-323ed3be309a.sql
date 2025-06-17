
-- Criar tabela de responsáveis
CREATE TABLE public.responsaveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  endereco TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo responsavel_id na tabela alunos
ALTER TABLE public.alunos 
ADD COLUMN responsavel_id UUID REFERENCES public.responsaveis(id);

-- Criar índice para melhorar performance
CREATE INDEX idx_alunos_responsavel_id ON public.alunos(responsavel_id);
