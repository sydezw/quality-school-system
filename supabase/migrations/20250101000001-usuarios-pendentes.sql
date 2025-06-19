-- Criação da tabela de usuários pendentes
CREATE TABLE public.usuarios_pendentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  cargo cargo_usuario NOT NULL DEFAULT 'Secretária',
  permissoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_usuarios_pendentes_status ON public.usuarios_pendentes(status);
CREATE INDEX idx_usuarios_pendentes_email ON public.usuarios_pendentes(email);

-- RLS (Row Level Security)
ALTER TABLE public.usuarios_pendentes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas administradores vejam usuários pendentes
CREATE POLICY "Apenas administradores podem ver usuários pendentes" ON public.usuarios_pendentes
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para permitir inserção de novos registros (cadastro público)
CREATE POLICY "Permitir inserção de usuários pendentes" ON public.usuarios_pendentes
  FOR INSERT WITH CHECK (true);

-- Política para permitir que administradores atualizem status
CREATE POLICY "Administradores podem atualizar status" ON public.usuarios_pendentes
  FOR UPDATE USING (auth.role() = 'authenticated');