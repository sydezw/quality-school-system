-- Adicionar novos campos à tabela contratos para suportar o novo sistema de planos
ALTER TABLE contratos 
ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS aulas_pagas INTEGER,
ADD COLUMN IF NOT EXISTS valor_matricula DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_material DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50) DEFAULT 'boleto',
ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER DEFAULT 1;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN contratos.valor_total IS 'Valor total do contrato (aulas + matrícula + material)';
COMMENT ON COLUMN contratos.aulas_pagas IS 'Número de aulas que o aluno vai pagar';
COMMENT ON COLUMN contratos.valor_matricula IS 'Valor da taxa de matrícula';
COMMENT ON COLUMN contratos.valor_material IS 'Valor do material didático';
COMMENT ON COLUMN contratos.forma_pagamento IS 'Forma de pagamento escolhida (boleto, cartao, pix, dinheiro, transferencia)';
COMMENT ON COLUMN contratos.numero_parcelas IS 'Número total de parcelas do contrato';

-- Atualizar contratos existentes com valores padrão
UPDATE contratos 
SET 
  valor_total = valor_mensalidade,
  aulas_pagas = 36,
  valor_matricula = 0,
  valor_material = 0,
  forma_pagamento = 'boleto',
  numero_parcelas = 1
WHERE valor_total IS NULL;