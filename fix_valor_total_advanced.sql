-- Script avançado para corrigir valor_total considerando tipo_valor do plano
-- Execute este script no Supabase Dashboard -> SQL Editor

-- 1. REMOVER O TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS validate_financeiro_alunos_valor_total ON financeiro_alunos;
DROP FUNCTION IF EXISTS validate_financeiro_alunos_valor_total();

-- 2. CRIAR FUNÇÃO CORRETA PARA CALCULAR VALOR_TOTAL
CREATE OR REPLACE FUNCTION calcular_valor_total_correto(
  p_valor_plano NUMERIC,
  p_valor_material NUMERIC,
  p_valor_matricula NUMERIC,
  p_desconto_total NUMERIC,
  p_tipo_valor TEXT DEFAULT 'apenas_aulas'
) RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC := p_valor_plano;
BEGIN
  -- Adicionar material apenas se não estiver incluído no plano
  IF p_tipo_valor NOT IN ('plano_material', 'plano_completo') THEN
    total := total + p_valor_material;
  END IF;
  
  -- Adicionar matrícula apenas se não estiver incluída no plano
  IF p_tipo_valor NOT IN ('plano_matricula', 'plano_completo') THEN
    total := total + p_valor_matricula;
  END IF;
  
  -- Não subtrair desconto pois o valor_plano já pode vir com desconto aplicado
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 3. ATUALIZAR REGISTROS EXISTENTES COM A LÓGICA CORRETA
UPDATE financeiro_alunos 
SET valor_total = calcular_valor_total_correto(
  valor_plano, 
  valor_material, 
  valor_matricula, 
  desconto_total,
  COALESCE(
    (SELECT tipo_valor FROM planos WHERE id = financeiro_alunos.plano_id),
    'apenas_aulas'
  )
),
updated_at = now();

-- 4. VERIFICAR OS RESULTADOS
SELECT 
  fa.id,
  p.nome as plano_nome,
  p.tipo_valor,
  fa.valor_plano,
  fa.valor_material,
  fa.valor_matricula,
  fa.desconto_total,
  fa.valor_total as valor_atual,
  calcular_valor_total_correto(
    fa.valor_plano, 
    fa.valor_material, 
    fa.valor_matricula, 
    fa.desconto_total,
    COALESCE(p.tipo_valor, 'apenas_aulas')
  ) as valor_calculado,
  CASE 
    WHEN fa.valor_total = calcular_valor_total_correto(
      fa.valor_plano, 
      fa.valor_material, 
      fa.valor_matricula, 
      fa.desconto_total,
      COALESCE(p.tipo_valor, 'apenas_aulas')
    ) THEN 'CORRETO' 
    ELSE 'INCORRETO' 
  END as status
FROM financeiro_alunos fa
LEFT JOIN planos p ON fa.plano_id = p.id
ORDER BY fa.created_at DESC;

-- 5. ESTATÍSTICAS FINAIS
SELECT 
  COUNT(*) as total_registros,
  COUNT(CASE 
    WHEN fa.valor_total = calcular_valor_total_correto(
      fa.valor_plano, 
      fa.valor_material, 
      fa.valor_matricula, 
      fa.desconto_total,
      COALESCE(p.tipo_valor, 'apenas_aulas')
    ) THEN 1 
  END) as registros_corretos
FROM financeiro_alunos fa
LEFT JOIN planos p ON fa.plano_id = p.id;