-- Criação da tabela planos
CREATE TABLE IF NOT EXISTS public.planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  numero_aulas INTEGER NOT NULL,
  frequencia_aulas TEXT NOT NULL,
  carga_horaria_total INTEGER,
  permite_cancelamento BOOLEAN DEFAULT false,
  permite_parcelamento BOOLEAN DEFAULT false,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_planos_updated_at
  BEFORE UPDATE ON public.planos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para a tabela planos
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- Política para visualizar planos
CREATE POLICY "Usuários podem visualizar planos se tiverem permissão" ON public.planos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.email = auth.email()
      AND (
        usuarios.cargo = 'Admin'
        OR usuarios.perm_visualizar_planos = true
      )
    )
  );

-- Política para inserir planos
CREATE POLICY "Usuários podem inserir planos se tiverem permissão" ON public.planos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.email = auth.email()
      AND (
        usuarios.cargo = 'Admin'
        OR usuarios.perm_gerenciar_planos = true
      )
    )
  );

-- Política para atualizar planos
CREATE POLICY "Usuários podem atualizar planos se tiverem permissão" ON public.planos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.email = auth.email()
      AND (
        usuarios.cargo = 'Admin'
        OR usuarios.perm_gerenciar_planos = true
      )
    )
  );

-- Política para deletar planos
CREATE POLICY "Usuários podem deletar planos se tiverem permissão" ON public.planos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.email = auth.email()
      AND (
        usuarios.cargo = 'Admin'
        OR usuarios.perm_gerenciar_planos = true
      )
    )
  );

-- Inserir alguns planos de exemplo
INSERT INTO public.planos (nome, descricao, numero_aulas, frequencia_aulas, carga_horaria_total, permite_cancelamento, permite_parcelamento, observacoes) VALUES
('Plano Semestral Básico', 'Plano básico com 2 aulas por semana durante 6 meses', 6, '2x por semana', 120, true, true, 'Plano mais popular para iniciantes'),
('Plano Semestral Intensivo', 'Plano intensivo com 3 aulas por semana durante 6 meses', 6, '3x por semana', 180, true, true, 'Recomendado para alunos que querem progresso acelerado'),
('Plano Promocional', 'Plano promocional com duração flexível', 3, '2x por semana', 60, false, false, 'Plano promocional por tempo limitado');