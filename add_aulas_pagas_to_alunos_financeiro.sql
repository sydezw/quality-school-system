-- Adicionar coluna 'aulas_pagas' na tabela alunos_financeiro
ALTER TABLE public.alunos_financeiro 
  ADD COLUMN IF NOT EXISTS aulas_pagas integer NOT NULL DEFAULT 0;

-- Descrição da coluna
COMMENT ON COLUMN public.alunos_financeiro.aulas_pagas IS 'Quantidade de aulas já pagas pelo aluno';