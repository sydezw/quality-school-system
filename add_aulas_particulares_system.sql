-- Script SQL para implementar sistema de aulas particulares e aulas de turma
-- Adiciona colunas à tabela alunos e cria tabela para gerenciar aulas particulares
-- IMPORTANTE: Execute este script no Supabase SQL Editor com privilégios de escrita

-- 1. Adicionar colunas à tabela alunos
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS aulas_particulares BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aulas_turma BOOLEAN DEFAULT TRUE;

-- 2. Adicionar comentários para documentação
COMMENT ON COLUMN public.alunos.aulas_particulares IS 'Indica se o aluno faz aulas particulares';
COMMENT ON COLUMN public.alunos.aulas_turma IS 'Indica se o aluno faz aulas de turma (regulares)';

-- 3. Criar tabela para gerenciar aulas particulares
CREATE TABLE IF NOT EXISTS public.aulas_particulares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
    data_aula TIMESTAMP WITH TIME ZONE NOT NULL,
    duracao_minutos INTEGER DEFAULT 60 CHECK (duracao_minutos > 0),
    valor DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada', 'reagendada')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Adicionar comentários à tabela aulas_particulares
COMMENT ON TABLE public.aulas_particulares IS 'Tabela para gerenciar aulas particulares dos alunos';
COMMENT ON COLUMN public.aulas_particulares.aluno_id IS 'ID do aluno que terá a aula particular';
COMMENT ON COLUMN public.aulas_particulares.professor_id IS 'ID do professor que dará a aula (opcional)';
COMMENT ON COLUMN public.aulas_particulares.data_aula IS 'Data e hora da aula particular';
COMMENT ON COLUMN public.aulas_particulares.duracao_minutos IS 'Duração da aula em minutos';
COMMENT ON COLUMN public.aulas_particulares.valor IS 'Valor da aula particular';
COMMENT ON COLUMN public.aulas_particulares.status IS 'Status da aula: agendada, realizada, cancelada, reagendada';

-- 5. Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_alunos_aulas_particulares ON public.alunos(aulas_particulares);
CREATE INDEX IF NOT EXISTS idx_alunos_aulas_turma ON public.alunos(aulas_turma);
CREATE INDEX IF NOT EXISTS idx_aulas_particulares_aluno_id ON public.aulas_particulares(aluno_id);
CREATE INDEX IF NOT EXISTS idx_aulas_particulares_professor_id ON public.aulas_particulares(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_particulares_data_aula ON public.aulas_particulares(data_aula);
CREATE INDEX IF NOT EXISTS idx_aulas_particulares_status ON public.aulas_particulares(status);

-- 6. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aulas_particulares_updated_at 
    BEFORE UPDATE ON public.aulas_particulares 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Atualizar alunos existentes para ter aulas_turma = TRUE por padrão
UPDATE public.alunos 
SET aulas_turma = TRUE 
WHERE aulas_turma IS NULL;

-- 8. Verificações finais
-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'alunos' 
AND column_name IN ('aulas_particulares', 'aulas_turma')
ORDER BY column_name;

-- Verificar se a tabela aulas_particulares foi criada
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name = 'aulas_particulares';

-- Verificar índices criados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('alunos', 'aulas_particulares') 
AND indexname LIKE '%aulas%'
ORDER BY tablename, indexname;

-- INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Certifique-se de que tem privilégios de escrita
-- 3. Após executar, teste a interface de criação/edição de alunos
-- 4. Verifique se as checkboxes aparecem corretamente