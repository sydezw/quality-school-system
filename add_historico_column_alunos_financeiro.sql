-- Adicionar coluna 'historico' na tabela alunos_financeiro
-- Esta coluna permite marcar registros como históricos ou ativos

-- Adicionar a coluna historico como BOOLEAN
ALTER TABLE alunos_financeiro 
ADD COLUMN historico BOOLEAN NOT NULL DEFAULT FALSE;

-- Comentário sobre a nova coluna:
-- historico: coluna BOOLEAN (TRUE para registros históricos, FALSE para registros ativos)
-- Valor padrão: FALSE (registros são ativos por padrão)

-- Verificar se a coluna foi adicionada corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'alunos_financeiro' 
    AND column_name = 'historico';

-- Verificar a estrutura completa da tabela após a alteração
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'alunos_financeiro'
ORDER BY ordinal_position;