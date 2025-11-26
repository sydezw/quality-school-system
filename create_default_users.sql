-- Script para criar usuário padrão para teste de login
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar se já existe algum usuário
SELECT * FROM usuarios LIMIT 5;

-- Se não existir nenhum usuário, vamos criar um usuário padrão
INSERT INTO usuarios (nome, email, senha, cargo, status)
VALUES 
  ('Administrador', 'admin@escola.com', 'admin123', 'Admin', 'ativo'),
  ('Usuário Padrão', 'usuario@exemplo.com', 'senha123', 'Secretária', 'ativo')
ON CONFLICT (email) DO NOTHING;

-- Verificar se os usuários foram criados
SELECT id, nome, email, cargo, status FROM usuarios;