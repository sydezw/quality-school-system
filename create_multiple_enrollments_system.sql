-- Script SQL para implementar sistema de múltiplas matrículas por aluno
-- Cria tabela de relacionamento aluno-turma para permitir múltiplas matrículas
-- IMPORTANTE: Execute este script no Supabase SQL Editor com privilégios de escrita

-- 1. Criar tabela de relacionamento aluno-turma
CREATE TABLE IF NOT EXISTS public.aluno_turma (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    data_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'trancado', 'concluido')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicação da mesma matrícula
    UNIQUE(aluno_id, turma_id)
);

-- 2. Adicionar comentários para documentação
COMMENT ON TABLE public.aluno_turma IS 'Tabela de relacionamento para múltiplas matrículas de alunos em turmas';
COMMENT ON COLUMN public.aluno_turma.aluno_id IS 'ID do aluno matriculado';
COMMENT ON COLUMN public.aluno_turma.turma_id IS 'ID da turma onde o aluno está matriculado';
COMMENT ON COLUMN public.aluno_turma.data_matricula IS 'Data da matrícula do aluno na turma';
COMMENT ON COLUMN public.aluno_turma.status IS 'Status da matrícula (ativo, inativo, trancado, concluido)';
COMMENT ON COLUMN public.aluno_turma.observacoes IS 'Observações sobre a matrícula';

-- 3. Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_aluno_turma_aluno_id ON public.aluno_turma(aluno_id);
CREATE INDEX IF NOT EXISTS idx_aluno_turma_turma_id ON public.aluno_turma(turma_id);
CREATE INDEX IF NOT EXISTS idx_aluno_turma_status ON public.aluno_turma(status);
CREATE INDEX IF NOT EXISTS idx_aluno_turma_data_matricula ON public.aluno_turma(data_matricula);

-- 4. Migrar dados existentes da coluna turma_id para a nova tabela
INSERT INTO public.aluno_turma (aluno_id, turma_id, data_matricula, status)
SELECT 
    id as aluno_id,
    turma_id,
    created_at as data_matricula,
    CASE 
        WHEN status = 'Ativo' THEN 'ativo'
        WHEN status = 'Trancado' THEN 'trancado'
        ELSE 'ativo'
    END as status
FROM public.alunos 
WHERE turma_id IS NOT NULL
ON CONFLICT (aluno_id, turma_id) DO NOTHING;

-- 5. Criar função para verificar limite de alunos por turma
CREATE OR REPLACE FUNCTION check_turma_capacity()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se a turma já tem 10 alunos ativos
    IF (SELECT COUNT(*) 
        FROM public.aluno_turma 
        WHERE turma_id = NEW.turma_id 
        AND status = 'ativo') >= 10 THEN
        RAISE EXCEPTION 'Esta turma já possui o máximo de 10 alunos ativos';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para verificar capacidade antes de inserir
DROP TRIGGER IF EXISTS trigger_check_turma_capacity ON public.aluno_turma;
CREATE TRIGGER trigger_check_turma_capacity
    BEFORE INSERT OR UPDATE ON public.aluno_turma
    FOR EACH ROW
    WHEN (NEW.status = 'ativo')
    EXECUTE FUNCTION check_turma_capacity();

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_aluno_turma_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_aluno_turma_updated_at ON public.aluno_turma;
CREATE TRIGGER trigger_update_aluno_turma_updated_at
    BEFORE UPDATE ON public.aluno_turma
    FOR EACH ROW
    EXECUTE FUNCTION update_aluno_turma_updated_at();

-- 9. Criar view para facilitar consultas de alunos com suas turmas
CREATE OR REPLACE VIEW public.view_alunos_turmas AS
SELECT 
    a.id as aluno_id,
    a.nome as aluno_nome,
    a.status as aluno_status,
    t.id as turma_id,
    t.nome as turma_nome,
    t.idioma as turma_idioma,
    t.nivel as turma_nivel,
    t.horario as turma_horario,
    t.dias_da_semana as turma_dias,
    at.data_matricula,
    at.status as matricula_status,
    at.observacoes as matricula_observacoes
FROM public.alunos a
LEFT JOIN public.aluno_turma at ON a.id = at.aluno_id
LEFT JOIN public.turmas t ON at.turma_id = t.id
WHERE at.status = 'ativo' OR at.status IS NULL
ORDER BY a.nome, t.nome;

-- 10. Criar função para obter turmas de um aluno
CREATE OR REPLACE FUNCTION get_aluno_turmas(aluno_uuid UUID)
RETURNS TABLE(
    turma_id UUID,
    turma_nome TEXT,
    turma_idioma TEXT,
    turma_nivel TEXT,
    data_matricula TIMESTAMP WITH TIME ZONE,
    matricula_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.nome,
        t.idioma::TEXT,
        t.nivel::TEXT,
        at.data_matricula,
        at.status
    FROM public.turmas t
    INNER JOIN public.aluno_turma at ON t.id = at.turma_id
    WHERE at.aluno_id = aluno_uuid
    AND at.status = 'ativo'
    ORDER BY at.data_matricula DESC;
END;
$$ LANGUAGE plpgsql;

-- 11. Criar função para obter alunos de uma turma
CREATE OR REPLACE FUNCTION get_turma_alunos(turma_uuid UUID)
RETURNS TABLE(
    aluno_id UUID,
    aluno_nome TEXT,
    aluno_status TEXT,
    data_matricula TIMESTAMP WITH TIME ZONE,
    matricula_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.nome,
        a.status::TEXT,
        at.data_matricula,
        at.status
    FROM public.alunos a
    INNER JOIN public.aluno_turma at ON a.id = at.aluno_id
    WHERE at.turma_id = turma_uuid
    AND at.status = 'ativo'
    ORDER BY a.nome;
END;
$$ LANGUAGE plpgsql;

-- 12. Atualizar tabelas relacionadas para usar a nova estrutura
-- Atualizar presencas para usar aluno_turma
ALTER TABLE public.presencas 
ADD COLUMN IF NOT EXISTS aluno_turma_id UUID REFERENCES public.aluno_turma(id) ON DELETE CASCADE;

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_turma_id ON public.presencas(aluno_turma_id);

-- Atualizar avaliacoes para usar aluno_turma
ALTER TABLE public.avaliacoes 
ADD COLUMN IF NOT EXISTS aluno_turma_id UUID REFERENCES public.aluno_turma(id) ON DELETE CASCADE;

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_avaliacoes_aluno_turma_id ON public.avaliacoes(aluno_turma_id);

-- Atualizar avaliacoes_competencia para usar aluno_turma
ALTER TABLE public.avaliacoes_competencia 
ADD COLUMN IF NOT EXISTS aluno_turma_id UUID REFERENCES public.aluno_turma(id) ON DELETE CASCADE;

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_avaliacoes_competencia_aluno_turma_id ON public.avaliacoes_competencia(aluno_turma_id);

-- Atualizar ranking para usar aluno_turma
ALTER TABLE public.ranking 
ADD COLUMN IF NOT EXISTS aluno_turma_id UUID REFERENCES public.aluno_turma(id) ON DELETE CASCADE;

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_ranking_aluno_turma_id ON public.ranking(aluno_turma_id);

-- Atualizar pesquisas_satisfacao para usar aluno_turma
ALTER TABLE public.pesquisas_satisfacao 
ADD COLUMN IF NOT EXISTS aluno_turma_id UUID REFERENCES public.aluno_turma(id) ON DELETE CASCADE;

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_pesquisas_satisfacao_aluno_turma_id ON public.pesquisas_satisfacao(aluno_turma_id);

-- 13. Migrar dados das tabelas relacionadas
-- Migrar presencas
UPDATE public.presencas 
SET aluno_turma_id = (
    SELECT at.id 
    FROM public.aluno_turma at
    INNER JOIN public.aulas au ON at.turma_id = au.turma_id
    WHERE at.aluno_id = presencas.aluno_id 
    AND au.id = presencas.aula_id
    AND at.status = 'ativo'
    LIMIT 1
)
WHERE aluno_turma_id IS NULL AND aluno_id IS NOT NULL;

-- Migrar avaliacoes
UPDATE public.avaliacoes 
SET aluno_turma_id = (
    SELECT at.id 
    FROM public.aluno_turma at
    WHERE at.aluno_id = avaliacoes.aluno_id 
    AND at.turma_id = avaliacoes.turma_id
    AND at.status = 'ativo'
    LIMIT 1
)
WHERE aluno_turma_id IS NULL;

-- Migrar avaliacoes_competencia
UPDATE public.avaliacoes_competencia 
SET aluno_turma_id = (
    SELECT at.id 
    FROM public.aluno_turma at
    WHERE at.aluno_id = avaliacoes_competencia.aluno_id 
    AND at.turma_id = avaliacoes_competencia.turma_id
    AND at.status = 'ativo'
    LIMIT 1
)
WHERE aluno_turma_id IS NULL;

-- Migrar ranking
UPDATE public.ranking 
SET aluno_turma_id = (
    SELECT at.id 
    FROM public.aluno_turma at
    WHERE at.aluno_id = ranking.aluno_id 
    AND at.turma_id = ranking.turma_id
    AND at.status = 'ativo'
    LIMIT 1
)
WHERE aluno_turma_id IS NULL;

-- Migrar pesquisas_satisfacao
UPDATE public.pesquisas_satisfacao 
SET aluno_turma_id = (
    SELECT at.id 
    FROM public.aluno_turma at
    WHERE at.aluno_id = pesquisas_satisfacao.aluno_id 
    AND at.turma_id = pesquisas_satisfacao.turma_id
    AND at.status = 'ativo'
    LIMIT 1
)
WHERE aluno_turma_id IS NULL;

-- 14. Adicionar políticas RLS (Row Level Security) se necessário
-- ALTER TABLE public.aluno_turma ENABLE ROW LEVEL SECURITY;

-- 15. Criar função para validar conflitos de horário (opcional)
CREATE OR REPLACE FUNCTION check_horario_conflito(aluno_uuid UUID, nova_turma_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    conflito_count INTEGER;
BEGIN
    -- Verificar se há conflito de horário entre as turmas do aluno
    SELECT COUNT(*) INTO conflito_count
    FROM public.aluno_turma at1
    INNER JOIN public.turmas t1 ON at1.turma_id = t1.id
    INNER JOIN public.turmas t2 ON t2.id = nova_turma_id
    WHERE at1.aluno_id = aluno_uuid
    AND at1.status = 'ativo'
    AND t1.horario = t2.horario
    AND t1.dias_da_semana = t2.dias_da_semana;
    
    RETURN conflito_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Script executado com sucesso!
-- Agora o sistema permite múltiplas matrículas por aluno mantendo a integridade dos dados.