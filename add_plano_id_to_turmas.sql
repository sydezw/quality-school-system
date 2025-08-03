-- Adicionar coluna plano_id na tabela turmas para associar planos particulares

ALTER TABLE turmas 
ADD COLUMN plano_id UUID REFERENCES planos(id);

-- Comentário explicativo
COMMENT ON COLUMN turmas.plano_id IS 'Referência ao plano particular associado à turma (apenas para turmas particulares)';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'turmas' AND column_name = 'plano_id';