-- Script para corrigir o problema do valor_total
-- Execute este script no Supabase Dashboard -> SQL Editor

-- 1. REMOVER O TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS validate_financeiro_alunos_valor_total ON financeiro_alunos;

-- 2. REMOVER A FUNÇÃO DO TRIGGER (se existir)
DROP FUNCTION IF EXISTS validate_financeiro_alunos_valor_total();

-- 3. VERIFICAR SE HÁ OUTROS TRIGGERS RELACIONADOS
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'financeiro_alunos'
  AND trigger_name LIKE '%valor_total%';

-- 4. ATUALIZAR TODOS OS REGISTROS EXISTENTES COM O CÁLCULO CORRETO
-- Primeiro, vamos ver os registros atuais
SELECT 
  id,
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  valor_total as valor_total_atual,
  (valor_plano + valor_material + valor_matricula - desconto_total) as valor_total_correto,
  (valor_total - (valor_plano + valor_material + valor_matricula - desconto_total)) as diferenca
FROM financeiro_alunos
ORDER BY created_at DESC;

-- 5. ATUALIZAR OS REGISTROS COM O CÁLCULO CORRETO
UPDATE financeiro_alunos 
SET valor_total = (valor_plano + valor_material + valor_matricula - desconto_total),
    updated_at = now()
WHERE valor_total != (valor_plano + valor_material + valor_matricula - desconto_total);

-- 6. VERIFICAR OS REGISTROS APÓS A CORREÇÃO
SELECT 
  id,
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  valor_total as valor_total_corrigido,
  (valor_plano + valor_material + valor_matricula - desconto_total) as valor_calculado,
  CASE 
    WHEN valor_total = (valor_plano + valor_material + valor_matricula - desconto_total) 
    THEN 'CORRETO' 
    ELSE 'INCORRETO' 
  END as status_calculo
FROM financeiro_alunos
ORDER BY created_at DESC;

-- 7. MOSTRAR ESTATÍSTICAS DA CORREÇÃO
SELECT 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN valor_total = (valor_plano + valor_material + valor_matricula - desconto_total) THEN 1 END) as registros_corretos,
  COUNT(CASE WHEN valor_total != (valor_plano + valor_material + valor_matricula - desconto_total) THEN 1 END) as registros_incorretos
FROM financeiro_alunos;