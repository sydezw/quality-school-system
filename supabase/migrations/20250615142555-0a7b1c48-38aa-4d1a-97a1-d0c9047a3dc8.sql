
-- Habilitar RLS e criar políticas para a tabela 'alunos'
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total para usuários autenticados"
ON public.alunos
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Habilitar RLS e criar políticas para a tabela 'contratos'
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total para usuários autenticados"
ON public.contratos
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Habilitar RLS e criar políticas para a tabela 'salas'
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total para usuários autenticados"
ON public.salas
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Habilitar RLS e criar políticas para a tabela 'responsaveis'
ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total para usuários autenticados"
ON public.responsaveis
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
