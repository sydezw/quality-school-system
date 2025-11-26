-- Script para verificar o estado atual das constraints no Supabase
-- Execute este script no SQL Editor do Supabase para verificar o estado atual

-- ========================================
-- VERIFICAR CONSTRAINTS DE CHAVE ESTRANGEIRA
-- ========================================

SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    rc.delete_rule,
    rc.update_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND (ccu.table_name = 'alunos' OR ccu.table_name = 'parcelas')
ORDER BY tc.table_name, tc.constraint_name;

-- ========================================
-- VERIFICAR SE A TABELA PARCELAS EXISTE
-- ========================================

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'parcelas';

-- ========================================
-- VERIFICAR CONSTRAINTS QUE REFERENCIAM PARCELAS
-- ========================================

SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'parcelas'
    AND tc.table_schema = 'public';

-- ========================================
-- VERIFICAR TABELA FINANCEIRO_ALUNOS
-- ========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'financeiro_alunos'
ORDER BY ordinal_position;

-- ========================================
-- VERIFICAR DADOS NA TABELA HISTORICO_PAGAMENTOS
-- ========================================

SELECT 
    COUNT(*) as total_registros,
    COUNT(parcela_id) as registros_com_parcela_id,
    COUNT(boleto_id) as registros_com_boleto_id
FROM public.historico_pagamentos;

-- ========================================
-- VERIFICAR MIGRAÇÕES APLICADAS
-- ========================================

SELECT 
    version,
    name,
    executed_at
FROM supabase_migrations.schema_migrations 
WHERE name LIKE '%parcelas%' 
   OR name LIKE '%financeiro%'
   OR name LIKE '%status%'
ORDER BY executed_at DESC;

-- ========================================
-- RESUMO DO ESTADO ATUAL
-- ========================================

-- Este script mostrará:
-- 1. Todas as constraints de chave estrangeira relacionadas a alunos e parcelas
-- 2. Se a tabela parcelas ainda existe
-- 3. Quais tabelas ainda referenciam parcelas
-- 4. A estrutura da tabela financeiro_alunos
-- 5. Quantos registros existem em historico_pagamentos
-- 6. Quais migrações relacionadas foram aplicadas

-- Com base nos resultados, você saberá:
-- - Se precisa aplicar a migração de remoção da tabela parcelas
-- - Qual é o estado atual das constraints (CASCADE, RESTRICT, SET NULL)
-- - Se há dados que precisam ser preservados antes da remoção