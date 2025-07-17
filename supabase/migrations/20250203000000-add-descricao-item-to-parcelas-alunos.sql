-- Migração para adicionar o campo descricao_item na tabela parcelas_alunos
-- Data: 2025-02-03
-- Descrição: Adiciona campo para descrição personalizada dos itens das parcelas

-- Adicionar coluna descricao_item na tabela parcelas_alunos
ALTER TABLE parcelas_alunos 
ADD COLUMN descricao_item TEXT;

-- Adicionar comentário na coluna
COMMENT ON COLUMN parcelas_alunos.descricao_item IS 'Descrição personalizada do item da parcela (ex: valor promocional material + plano)';

-- Adicionar coluna descricao_item na tabela historico_parcelas (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historico_parcelas') THEN
        ALTER TABLE historico_parcelas 
        ADD COLUMN IF NOT EXISTS descricao_item TEXT;
        
        COMMENT ON COLUMN historico_parcelas.descricao_item IS 'Descrição personalizada do item da parcela (ex: valor promocional material + plano)';
    END IF;
END $$;