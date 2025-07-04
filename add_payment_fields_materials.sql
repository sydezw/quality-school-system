-- Script SQL para adicionar campos de método de pagamento e número de parcelas para materiais
-- na tabela financeiro_alunos

-- Adicionar colunas para método de pagamento e número de parcelas dos materiais
ALTER TABLE financeiro_alunos 
ADD COLUMN IF NOT EXISTS forma_pagamento_material VARCHAR(20) DEFAULT 'boleto' CHECK (forma_pagamento_material IN ('boleto', 'cartao', 'pix', 'dinheiro', 'transferencia')),
ADD COLUMN IF NOT EXISTS numero_parcelas_material INTEGER DEFAULT 1 CHECK (numero_parcelas_material >= 1 AND numero_parcelas_material <= 12);

-- Adicionar comentários para documentação
COMMENT ON COLUMN financeiro_alunos.forma_pagamento_material IS 'Método de pagamento para materiais: boleto, cartao, pix, dinheiro, transferencia';
COMMENT ON COLUMN financeiro_alunos.numero_parcelas_material IS 'Número de parcelas para pagamento dos materiais (1 a 12)';

-- Criar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_financeiro_alunos_forma_pagamento_material ON financeiro_alunos(forma_pagamento_material);
CREATE INDEX IF NOT EXISTS idx_financeiro_alunos_numero_parcelas_material ON financeiro_alunos(numero_parcelas_material);

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'financeiro_alunos' 
AND column_name IN ('forma_pagamento_material', 'numero_parcelas_material')
ORDER BY column_name;