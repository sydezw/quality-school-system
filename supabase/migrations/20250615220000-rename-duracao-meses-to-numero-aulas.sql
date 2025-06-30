-- Rename duracao_meses column to numero_aulas in planos table
ALTER TABLE public.planos 
RENAME COLUMN duracao_meses TO numero_aulas;

-- Update the comment to reflect the new column name
COMMENT ON COLUMN public.planos.numero_aulas IS 'Número total de aulas do plano';