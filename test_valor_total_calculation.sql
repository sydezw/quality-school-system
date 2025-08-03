-- Script para verificar se há cálculo automático do valor_total
-- Execute este script no Supabase Dashboard -> SQL Editor

-- 1. Verificar a definição da coluna valor_total
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  generation_expression
FROM information_schema.columns 
WHERE table_name = 'financeiro_alunos' 
  AND column_name = 'valor_total';

-- 2. Verificar se há triggers que calculam valor_total
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'financeiro_alunos'
  AND action_statement LIKE '%valor_total%';

-- 3. Verificar se há funções relacionadas ao cálculo
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_definition LIKE '%valor_total%'
  AND routine_type = 'FUNCTION';

-- 4. Verificar se há uma constraint ou regra que calcula valor_total
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'financeiro_alunos'::regclass
  AND pg_get_constraintdef(oid) LIKE '%valor_total%';

-- 5. Teste: Inserir um registro simples para ver o comportamento
-- ATENÇÃO: Este é apenas um teste, delete depois!
INSERT INTO financeiro_alunos (
  aluno_id,
  plano_id,
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  valor_total,
  status_geral,
  data_primeiro_vencimento
) VALUES (
  (SELECT id FROM alunos LIMIT 1),
  (SELECT id FROM planos LIMIT 1),
  1000.00,
  200.00,
  100.00,
  50.00,
  9999.99, -- Valor propositalmente diferente para ver se é alterado
  'Pendente',
  '2024-12-01'
) RETURNING *;

-- 6. Verificar se o valor foi alterado
SELECT 
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  valor_total,
  (valor_plano + valor_material + valor_matricula - desconto_total) as valor_calculado_manual
FROM financeiro_alunos 
WHERE valor_total = 9999.99 OR valor_plano = 1000.00
ORDER BY created_at DESC 
LIMIT 1;