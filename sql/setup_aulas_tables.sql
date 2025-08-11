-- Script para criar as tabelas necessárias para a aba Aulas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar e criar tabela aulas
CREATE TABLE IF NOT EXISTS aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_aula DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  titulo VARCHAR(255),
  conteudo_programatico TEXT NOT NULL,
  observacoes TEXT,
  material_necessario TEXT,
  tipo_aula VARCHAR(20) DEFAULT 'normal' CHECK (tipo_aula IN ('normal', 'prova', 'revisao')),
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Verificar e criar tabela presencas_aulas
CREATE TABLE IF NOT EXISTS presencas_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES aulas(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aula_id, aluno_id)
);

-- 3. Verificar e criar tabela avaliacoes_progresso
CREATE TABLE IF NOT EXISTS avaliacoes_progresso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES aulas(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  speaking INTEGER CHECK (speaking >= 0 AND speaking <= 10),
  listening INTEGER CHECK (listening >= 0 AND listening <= 10),
  reading INTEGER CHECK (reading >= 0 AND reading <= 10),
  writing INTEGER CHECK (writing >= 0 AND writing <= 10),
  feedback_personalizado TEXT,
  data_avaliacao DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verificar e criar tabela configuracao_cor_turmas
CREATE TABLE IF NOT EXISTS configuracao_cor_turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  cor_principal VARCHAR(7) NOT NULL, -- Hex color
  cor_prova VARCHAR(7) NOT NULL,     -- Hex color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(turma_id, professor_id)
);

-- 5. Verificar se a coluna professor_id existe na tabela turmas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'turmas' AND column_name = 'professor_id') THEN
        ALTER TABLE turmas ADD COLUMN professor_id UUID REFERENCES usuarios(id);
    END IF;
END $$;

-- 6. Verificar se o tipo cargo_usuario inclui 'Professor'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum 
                   WHERE enumlabel = 'Professor' 
                   AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cargo_usuario')) THEN
        ALTER TYPE cargo_usuario ADD VALUE 'Professor';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Valor já existe, ignorar
        NULL;
END $$;

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_aulas_turma_id ON aulas(turma_id);
CREATE INDEX IF NOT EXISTS idx_aulas_professor_id ON aulas(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data_aula ON aulas(data_aula);
CREATE INDEX IF NOT EXISTS idx_presencas_aulas_aula_id ON presencas_aulas(aula_id);
CREATE INDEX IF NOT EXISTS idx_presencas_aulas_aluno_id ON presencas_aulas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_progresso_aula_id ON avaliacoes_progresso(aula_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_progresso_aluno_id ON avaliacoes_progresso(aluno_id);
CREATE INDEX IF NOT EXISTS idx_configuracao_cor_turmas_turma_id ON configuracao_cor_turmas(turma_id);

-- 8. Habilitar RLS (Row Level Security) nas novas tabelas
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao_cor_turmas ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas básicas de RLS (ajustar conforme necessário)
-- Política para aulas
CREATE POLICY IF NOT EXISTS "Usuários podem ver aulas" ON aulas
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Professores podem inserir aulas" ON aulas
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Professores podem atualizar suas aulas" ON aulas
    FOR UPDATE USING (true);

-- Política para presenças
CREATE POLICY IF NOT EXISTS "Usuários podem ver presenças" ON presencas_aulas
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Professores podem gerenciar presenças" ON presencas_aulas
    FOR ALL USING (true);

-- Política para avaliações
CREATE POLICY IF NOT EXISTS "Usuários podem ver avaliações" ON avaliacoes_progresso
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Professores podem gerenciar avaliações" ON avaliacoes_progresso
    FOR ALL USING (true);

-- Política para configuração de cores
CREATE POLICY IF NOT EXISTS "Usuários podem ver configurações de cores" ON configuracao_cor_turmas
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Professores podem gerenciar configurações de cores" ON configuracao_cor_turmas
    FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE aulas IS 'Tabela para armazenar informações das aulas ministradas';
COMMENT ON TABLE presencas_aulas IS 'Tabela para controle de presença dos alunos nas aulas';
COMMENT ON TABLE avaliacoes_progresso IS 'Tabela para avaliações de progresso dos alunos';
COMMENT ON TABLE configuracao_cor_turmas IS 'Tabela para configuração de cores das turmas no calendário';