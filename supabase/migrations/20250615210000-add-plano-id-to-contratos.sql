-- Adicionar campo plano_id à tabela contratos
-- Esta migração adiciona a referência de plano aos contratos existentes

-- Adicionar coluna plano_id à tabela contratos
ALTER TABLE contratos 
ADD COLUMN plano_id UUID REFERENCES planos(id) ON DELETE SET NULL;

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_contratos_plano_id ON contratos(plano_id);

-- Atualizar a política RLS para incluir o novo campo
DROP POLICY IF EXISTS "Usuários podem visualizar contratos" ON contratos;
CREATE POLICY "Usuários podem visualizar contratos" ON contratos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.email = auth.jwt() ->> 'email'
      AND (usuarios.cargo = 'Admin' OR usuarios.perm_visualizar_contratos = true)
    )
  );

DROP POLICY IF EXISTS "Usuários podem inserir contratos" ON contratos;
CREATE POLICY "Usuários podem inserir contratos" ON contratos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.email = auth.jwt() ->> 'email'
      AND (usuarios.cargo = 'Admin' OR usuarios.perm_gerenciar_contratos = true)
    )
  );

DROP POLICY IF EXISTS "Usuários podem atualizar contratos" ON contratos;
CREATE POLICY "Usuários podem atualizar contratos" ON contratos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.email = auth.jwt() ->> 'email'
      AND (usuarios.cargo = 'Admin' OR usuarios.perm_gerenciar_contratos = true)
    )
  );

DROP POLICY IF EXISTS "Usuários podem excluir contratos" ON contratos;
CREATE POLICY "Usuários podem excluir contratos" ON contratos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.email = auth.jwt() ->> 'email'
      AND (usuarios.cargo = 'Admin' OR usuarios.perm_gerenciar_contratos = true)
    )
  );

-- Comentário explicativo
COMMENT ON COLUMN contratos.plano_id IS 'Referência ao plano associado ao contrato';