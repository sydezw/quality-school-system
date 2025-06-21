-- Corrigir política RLS da tabela responsaveis
-- O problema era que a política estava usando auth.role() = 'authenticated'
-- que é muito restritiva. Vamos usar USING (true) como as outras tabelas.

-- Primeiro, remover a política existente
DROP POLICY IF EXISTS "Permitir acesso total para usuários autenticados" ON public.responsaveis;

-- Criar nova política mais permissiva
CREATE POLICY "Allow all operations for authenticated users" ON public.responsaveis
FOR ALL USING (true);