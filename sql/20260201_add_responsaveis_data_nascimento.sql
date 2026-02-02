ALTER TABLE public.responsaveis
ADD COLUMN IF NOT EXISTS data_nascimento DATE;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'responsaveis' AND column_name = 'data_nascimento';
