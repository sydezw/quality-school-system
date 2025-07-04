-- Migração para remover completamente a tabela parcelas
-- Esta migração deve ser aplicada no Supabase online

-- ========================================
-- FASE 1: REMOVER CONSTRAINTS QUE REFERENCIAM PARCELAS
-- ========================================

-- Remover constraint de historico_pagamentos que referencia parcelas
ALTER TABLE public.historico_pagamentos 
DROP CONSTRAINT IF EXISTS historico_pagamentos_parcela_id_fkey;

-- Remover a coluna parcela_id da tabela historico_pagamentos
ALTER TABLE public.historico_pagamentos 
DROP COLUMN IF EXISTS parcela_id;

-- ========================================
-- FASE 2: REMOVER A TABELA PARCELAS
-- ========================================

-- Remover a tabela parcelas completamente
DROP TABLE IF EXISTS public.parcelas CASCADE;

-- ========================================
-- FASE 3: VERIFICAR E LIMPAR OUTRAS REFERÊNCIAS
-- ========================================

-- Verificar se há outras tabelas que ainda referenciam parcelas
-- (Esta query pode ser executada para verificação, mas não afeta a migração)
/*
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'parcelas'
    AND tc.table_schema = 'public';
*/

-- ========================================
-- FASE 4: COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

-- Esta migração remove completamente a tabela parcelas do sistema
-- A funcionalidade de parcelas foi substituída pela tabela financeiro_alunos
-- que oferece um controle mais granular e eficiente dos pagamentos

-- Tabelas afetadas por esta migração:
-- 1. historico_pagamentos - removida coluna parcela_id
-- 2. parcelas - tabela removida completamente

-- IMPORTANTE: 
-- - Esta migração é irreversível
-- - Certifique-se de que todos os dados importantes foram migrados para financeiro_alunos
-- - Faça backup antes de executar esta migração
-- - Teste em ambiente de desenvolvimento primeiro

COMMIT;