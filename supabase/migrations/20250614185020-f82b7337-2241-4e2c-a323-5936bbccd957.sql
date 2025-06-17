
-- Criar tipos enum para status e categorias
CREATE TYPE public.status_aluno AS ENUM ('Ativo', 'Trancado', 'Cancelado');
CREATE TYPE public.status_contrato AS ENUM ('Ativo', 'Trancado', 'Cancelado', 'Encerrado');
CREATE TYPE public.status_boleto AS ENUM ('Pago', 'Pendente', 'Vencido');
CREATE TYPE public.status_despesa AS ENUM ('Pago', 'Pendente');
CREATE TYPE public.status_folha AS ENUM ('Pago', 'Pendente');
CREATE TYPE public.status_presenca AS ENUM ('Presente', 'Falta', 'Justificada');
CREATE TYPE public.idioma AS ENUM ('Inglês', 'Japonês');
CREATE TYPE public.nivel AS ENUM ('Book 1', 'Book 2', 'Book 3', 'Book 4', 'Book 5', 'Book 6', 'Book 7', 'Book 8', 'Book 9', 'Book 10');
CREATE TYPE public.cargo_usuario AS ENUM ('Secretária', 'Gerente', 'Admin');
CREATE TYPE public.categoria_despesa AS ENUM ('salário', 'aluguel', 'material', 'manutenção');

-- Tabela de usuários do sistema
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  cargo cargo_usuario NOT NULL DEFAULT 'Secretária',
  permissoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de professores
CREATE TABLE public.professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  idiomas TEXT NOT NULL,
  salario DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de turmas
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  idioma idioma NOT NULL,
  nivel nivel NOT NULL,
  dias_da_semana TEXT NOT NULL,
  horario TEXT NOT NULL,
  professor_id UUID REFERENCES public.professores(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de alunos
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  status status_aluno NOT NULL DEFAULT 'Ativo',
  idioma idioma NOT NULL,
  turma_id UUID REFERENCES public.turmas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de contratos
CREATE TABLE public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  valor_mensalidade DECIMAL(10,2) NOT NULL,
  status status_contrato NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de boletos
CREATE TABLE public.boletos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  data_vencimento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status status_boleto NOT NULL DEFAULT 'Pendente',
  link_pagamento TEXT,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de despesas
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  categoria categoria_despesa NOT NULL,
  status status_despesa NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de folha de pagamento
CREATE TABLE public.folha_pagamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES public.professores(id) NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status status_folha NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professor_id, mes, ano)
);

-- Tabela de aulas
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID REFERENCES public.turmas(id) NOT NULL,
  data DATE NOT NULL,
  conteudo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de presenças
CREATE TABLE public.presencas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aula_id UUID REFERENCES public.aulas(id) NOT NULL,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  status status_presenca NOT NULL DEFAULT 'Presente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aula_id, aluno_id)
);

-- Tabela de avaliações
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) NOT NULL,
  data DATE NOT NULL,
  nota DECIMAL(4,2),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor) VALUES
('idiomas', '["Inglês", "Japonês"]'),
('metodos_pagamento', '["Pix", "Boleto", "Dinheiro", "Cartão"]'),
('niveis', '["Book 1", "Book 2", "Book 3", "Book 4", "Book 5", "Book 6", "Book 7", "Book 8", "Book 9", "Book 10"]');

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boletos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folha_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (acesso total para usuários autenticados por enquanto)
-- Posteriormente você pode refinar essas políticas conforme necessário

CREATE POLICY "Allow all operations for authenticated users" ON public.usuarios
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.professores
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.turmas
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.alunos
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.contratos
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.boletos
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.despesas
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.folha_pagamento
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.aulas
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.presencas
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.avaliacoes
FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.configuracoes
FOR ALL USING (true);
