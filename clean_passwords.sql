-- Script para limpar senhas com caracteres de quebra de linha
-- Execute este script no Supabase SQL Editor

-- Verificar senhas atuais (com caracteres especiais)
SELECT 
  id, 
  nome, 
  email, 
  senha,
  LENGTH(senha) as tamanho_senha,
  ASCII(RIGHT(senha, 1)) as ultimo_char_ascii
FROM usuarios;

-- Limpar senhas removendo espaços e quebras de linha
UPDATE usuarios 
SET senha = TRIM(BOTH FROM REPLACE(REPLACE(senha, CHR(13), ''), CHR(10), ''))
WHERE senha != TRIM(BOTH FROM REPLACE(REPLACE(senha, CHR(13), ''), CHR(10), ''));

-- Verificar senhas após limpeza
SELECT 
  id, 
  nome, 
  email, 
  senha,
  LENGTH(senha) as tamanho_senha_limpo
FROM usuarios;