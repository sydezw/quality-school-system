-- Script para adicionar campo aulas_por_semana à tabela turmas
-- Sistema de Reinício de Faltas por Semestre

-- 1. Adicionar coluna aulas_por_semana
ALTER TABLE turmas 
ADD COLUMN IF NOT EXISTS aulas_por_semana INTEGER DEFAULT 1;

-- 2. Criar função para calcular aulas por semana baseado nos dias_da_semana
CREATE OR REPLACE FUNCTION calculate_aulas_por_semana(dias_semana TEXT[])
RETURNS INTEGER AS $$
BEGIN
    -- Se dias_da_semana for NULL ou vazio, retorna 1
    IF dias_semana IS NULL OR array_length(dias_semana, 1) IS NULL THEN
        RETURN 1;
    END IF;
    
    -- Retorna o número de dias da semana (quantidade de aulas por semana)
    RETURN array_length(dias_semana, 1);
END;
$$ LANGUAGE plpgsql;

-- 3. Criar função trigger para atualizar aulas_por_semana automaticamente
CREATE OR REPLACE FUNCTION update_aulas_por_semana()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcula aulas_por_semana baseado nos dias_da_semana
    NEW.aulas_por_semana := calculate_aulas_por_semana(NEW.dias_da_semana);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para atualizar automaticamente em INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_update_aulas_por_semana ON turmas;
CREATE TRIGGER trigger_update_aulas_por_semana
    BEFORE INSERT OR UPDATE OF dias_da_semana ON turmas
    FOR EACH ROW
    EXECUTE FUNCTION update_aulas_por_semana();

-- 5. Popular campo aulas_por_semana para turmas existentes
UPDATE turmas 
SET aulas_por_semana = calculate_aulas_por_semana(dias_da_semana)
WHERE aulas_por_semana IS NULL OR aulas_por_semana = 1;

-- 6. Comentários para documentação
COMMENT ON COLUMN turmas.aulas_por_semana IS 'Número de aulas por semana calculado automaticamente baseado nos dias_da_semana';
COMMENT ON FUNCTION calculate_aulas_por_semana(TEXT[]) IS 'Calcula o número de aulas por semana baseado no array de dias da semana';
COMMENT ON FUNCTION update_aulas_por_semana() IS 'Função trigger para atualizar automaticamente o campo aulas_por_semana';

-- 7. Verificação final
SELECT 
    nome,
    dias_da_semana,
    aulas_por_semana,
    total_aulas,
    data_inicio,
    data_fim
FROM turmas 
ORDER BY nome
LIMIT 10;