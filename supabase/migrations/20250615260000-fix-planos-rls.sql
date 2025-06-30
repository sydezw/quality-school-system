-- Corrigir políticas RLS da tabela planos para garantir acesso adequado

-- Remover políticas temporárias
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.planos;

-- Recriar políticas baseadas em permissões específicas
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