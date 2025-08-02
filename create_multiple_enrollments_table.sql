-- Script para criar tabela de múltiplas matrículas
-- Execute este script no Supabase SQL Editor

-- Criar tabela para gerenciar múltiplas matrículas de alunos
CREATE TABLE IF NOT EXISTS public.matriculas_alunos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    tipo_matricula VARCHAR(20) NOT NULL CHECK (tipo_matricula IN ('regular', 'particular')),
    data_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'cancelada')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicatas
    UNIQUE(aluno_id, turma_id)
);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.matriculas_alunos IS 'Tabela para gerenciar múltiplas matrículas de alunos em diferentes turmas';
COMMENT ON COLUMN public.matriculas_alunos.tipo_matricula IS 'Tipo da matrícula: regular ou particular';
COMMENT ON COLUMN public.matriculas_alunos.status IS 'Status da matrícula: ativa, inativa ou cancelada';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno_id ON public.matriculas_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma_id ON public.matriculas_alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_tipo ON public.matriculas_alunos(tipo_matricula);
CREATE INDEX IF NOT EXISTS idx_matriculas_status ON public.matriculas_alunos(status);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_matriculas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_matriculas_updated_at
    BEFORE UPDATE ON public.matriculas_alunos
    FOR EACH ROW
    EXECUTE FUNCTION update_matriculas_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.matriculas_alunos ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso total para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users on matriculas_alunos"
    ON public.matriculas_alunos
    FOR ALL
    USING (true);

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'matriculas_alunos'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.matriculas_alunos'::regclass;

-- Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'matriculas_alunos' 
    AND schemaname = 'public';