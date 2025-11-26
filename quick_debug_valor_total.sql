-- Script simples para identificar o problema do valor_total
-- Execute este script no Supabase Dashboard -> SQL Editor

-- 1. Verificar se há triggers na tabela financeiro_alunos
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'financeiro_alunos';

-- 2. Verificar se a coluna valor_total tem alguma definição especial
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'financeiro_alunos' 
  AND column_name = 'valor_total';

-- 3. Verificar o último registro inserido
SELECT 
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  valor_total,
  created_at
FROM financeiro_alunos 
ORDER BY created_at DESC 
LIMIT 3;