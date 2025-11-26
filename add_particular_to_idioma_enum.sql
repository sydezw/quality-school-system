-- Script simples para adicionar 'particular' ao enum idioma
-- Execute este script isoladamente no SQL Editor do Supabase
-- IMPORTANTE: Execute apenas este comando por vez

-- Passo 1: Adicionar 'particular' ao enum (execute sozinho)
ALTER TYPE public.idioma ADD VALUE IF NOT EXISTS 'particular';

-- Aguarde alguns segundos após executar o comando acima
-- Então execute os comandos de verificação abaixo:

-- Passo 2: Verificar se foi adicionado com sucesso
-- SELECT unnest(enum_range(NULL::public.idioma)) AS valores_idioma;

-- Passo 3: Testar criação de plano com idioma particular
/*
INSERT INTO planos (
    nome,
    descricao,
    numero_aulas,
    frequencia_aulas,
    valor_total,
    idioma,
    ativo
) VALUES (
    'Teste Aulas Particulares',
    'Plano de teste para aulas particulares',
    8,
    'flexível',
    600.00,
    'particular',
    true
);
*/

-- INSTRUÇÕES:
-- 1. Execute apenas a linha 6 (ALTER TYPE) primeiro
-- 2. Aguarde alguns segundos
-- 3. Execute a verificação (linha 11) para confirmar
-- 4. Teste a criação de um plano se desejar (descomente o INSERT)