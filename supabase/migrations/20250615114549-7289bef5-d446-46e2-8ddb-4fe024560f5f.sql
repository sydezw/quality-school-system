
-- Criar tabela de salas
CREATE TABLE public.salas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  capacidade INTEGER NOT NULL DEFAULT 10,
  tipo TEXT NOT NULL DEFAULT 'Física' CHECK (tipo IN ('Física', 'Virtual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo sala_id na tabela turmas
ALTER TABLE public.turmas 
ADD COLUMN sala_id UUID REFERENCES public.salas(id);

-- Inserir algumas salas padrão
INSERT INTO public.salas (nome, capacidade, tipo) VALUES
('Sala 1', 12, 'Física'),
('Sala 2', 10, 'Física'),
('Sala 3', 8, 'Física'),
('Sala Online A', 20, 'Virtual'),
('Sala Online B', 15, 'Virtual');
