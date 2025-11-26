-- Script para corrigir as políticas RLS da tabela financeiro_alunos
-- Execute este script no Supabase Dashboard -> SQL Editor

-- Remover políticas antigas
DROP POLICY IF EXISTS "Administradores podem fazer tudo em financeiro_alunos" ON financeiro_alunos;
DROP POLICY IF EXISTS "Professores podem visualizar financeiro_alunos" ON financeiro_alunos;

-- Criar novas políticas que usam a tabela usuarios
-- Acesso total para administradores
CREATE POLICY "Administradores podem fazer tudo em financeiro_alunos"
  ON financeiro_alunos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.email = (auth.jwt()::jsonb ->> 'email')
      AND usuarios.cargo = 'Admin'
    )
  );

-- Professores podem visualizar
CREATE POLICY "Professores podem visualizar financeiro_alunos"
  ON financeiro_alunos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.email = (auth.jwt()::jsonb ->> 'email')
      AND usuarios.cargo IN ('Admin', 'Professor')
    )
  );

-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'financeiro_alunos';