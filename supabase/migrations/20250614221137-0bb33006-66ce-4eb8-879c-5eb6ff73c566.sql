
-- Agenda da Secretaria
CREATE TABLE public.agenda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'cancelado')),
  criado_por UUID REFERENCES public.usuarios(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Parcelas (para parcelamento de matrícula, material, etc.)
CREATE TABLE public.parcelas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  status status_boleto NOT NULL DEFAULT 'Pendente',
  boleto_link TEXT,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recibos
CREATE TABLE public.recibos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  data DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  arquivo_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notificações e Alertas
CREATE TYPE public.tipo_notificacao AS ENUM ('boleto', 'presenca', 'lembrete', 'geral');
CREATE TYPE public.status_notificacao AS ENUM ('enviada', 'pendente', 'erro');

CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo tipo_notificacao NOT NULL,
  destinatario_id UUID REFERENCES public.alunos(id) NOT NULL,
  mensagem TEXT NOT NULL,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status status_notificacao NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documentos Gerados
CREATE TYPE public.tipo_documento AS ENUM ('contrato', 'declaracao_matricula', 'declaracao_frequencia', 'declaracao_conclusao');
CREATE TYPE public.status_documento AS ENUM ('gerado', 'assinado', 'cancelado');

CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  tipo tipo_documento NOT NULL,
  data DATE NOT NULL,
  arquivo_link TEXT,
  status status_documento NOT NULL DEFAULT 'gerado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Histórico de Alterações (Logs)
CREATE TABLE public.logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.usuarios(id) NOT NULL,
  acao TEXT NOT NULL,
  tabela_afetada TEXT NOT NULL,
  registro_id UUID,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plano de Aula e Conteúdos
CREATE TABLE public.planos_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID REFERENCES public.turmas(id) NOT NULL,
  data DATE NOT NULL,
  conteudo TEXT NOT NULL,
  professor_id UUID REFERENCES public.professores(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Avaliação por Competências
CREATE TYPE public.competencia AS ENUM ('Listening', 'Speaking', 'Writing', 'Reading');

CREATE TABLE public.avaliacoes_competencia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) NOT NULL,
  data DATE NOT NULL,
  competencia competencia NOT NULL,
  nota DECIMAL(4,2) NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pesquisas de Satisfação
CREATE TABLE public.pesquisas_satisfacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) NOT NULL,
  data DATE NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ranking
CREATE TABLE public.ranking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) NOT NULL,
  pontuacao INTEGER NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Materiais Didáticos
CREATE TYPE public.status_material AS ENUM ('disponivel', 'indisponivel');

CREATE TABLE public.materiais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  idioma idioma NOT NULL,
  nivel nivel NOT NULL,
  status status_material NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Materiais Entregues
CREATE TABLE public.materiais_entregues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  material_id UUID REFERENCES public.materiais(id) NOT NULL,
  data_entrega DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, material_id)
);

-- Melhorias nas tabelas existentes
ALTER TABLE public.alunos ADD COLUMN data_conclusao DATE;
ALTER TABLE public.alunos ADD COLUMN data_cancelamento DATE;

ALTER TABLE public.turmas ADD COLUMN status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada'));

ALTER TABLE public.boletos ADD COLUMN juros DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.boletos ADD COLUMN multa DECIMAL(5,2) DEFAULT 0;

ALTER TABLE public.usuarios ADD COLUMN funcao TEXT;

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_competencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesquisas_satisfacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_entregues ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (acesso total para usuários autenticados)
CREATE POLICY "Allow all operations for authenticated users" ON public.agenda FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.parcelas FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.recibos FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.notificacoes FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.documentos FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.logs FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.planos_aula FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.avaliacoes_competencia FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.pesquisas_satisfacao FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.ranking FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.materiais FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.materiais_entregues FOR ALL USING (true);
