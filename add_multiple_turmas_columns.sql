-- Script SQL para adicionar suporte a múltiplas turmas (regular e particular)
-- Execute este script no Supabase SQL Editor

-- Adicionar nova coluna para turma particular
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS turma_particular_id UUID REFERENCES public.turmas(id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.alunos.turma_id IS 'ID da turma regular (principal) do aluno';
COMMENT ON COLUMN public.alunos.turma_particular_id IS 'ID da turma particular do aluno';
COMMENT ON COLUMN public.alunos.aulas_particulares IS 'Indica se o aluno faz aulas particulares';
COMMENT ON COLUMN public.alunos.aulas_turma IS 'Indica se o aluno faz aulas de turma regular';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_alunos_turma_particular_id ON public.alunos(turma_particular_id);
CREATE INDEX IF NOT EXISTS idx_alunos_aulas_particulares ON public.alunos(aulas_particulares);
CREATE INDEX IF NOT EXISTS idx_alunos_aulas_turma ON public.alunos(aulas_turma);

-- Verificar se as colunas foram criadas corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'alunos'
    AND column_name IN ('turma_id', 'turma_particular_id', 'aulas_particulares', 'aulas_turma')
ORDER BY column_name;

-- Verificar índices criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'alunos' 
    AND schemaname = 'public'
    AND indexname LIKE '%turma%';

-- Exemplo de como os dados ficarão estruturados:
-- Cenário 1: Aluno só em turma regular
-- turma_id = UUID_TURMA_REGULAR, turma_particular_id = NULL, aulas_turma = true, aulas_particulares = false

-- Cenário 2: Aluno só em turma particular  
-- turma_id = NULL, turma_particular_id = UUID_TURMA_PARTICULAR, aulas_turma = false, aulas_particulares = true

-- Cenário 3: Aluno em ambas (turma regular + particular)
-- turma_id = UUID_TURMA_REGULAR, turma_particular_id = UUID_TURMA_PARTICULAR, aulas_turma = true, aulas_particulares = true

-- Cenário 4: Aluno sem turma
-- turma_id = NULL, turma_particular_id = NULL, aulas_turma = false, aulas_particulares = false