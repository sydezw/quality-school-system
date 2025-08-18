-- Migration para renomear campo 'status' para 'status_aula' e criar ENUM
-- Execute estas queries manualmente no seu banco de dados

-- 1. Criar o tipo ENUM para status da aula
CREATE TYPE status_aula_enum AS ENUM (
    'agendada',      -- Aula agendada/planejada
    'concluida',     -- Aula finalizada
    'cancelada',     -- Aula cancelada
    'reagendada'     -- Aula reagendada
);

-- 2. Adicionar nova coluna com o tipo ENUM
ALTER TABLE aulas ADD COLUMN status_aula status_aula_enum DEFAULT 'agendada';

-- 3. Migrar dados existentes (ajuste conforme necessário)
-- Assumindo que os valores atuais são strings, mapeie-os adequadamente:
UPDATE aulas SET status_aula = 
    CASE 
        WHEN status = 'scheduled' OR status = 'agendada' THEN 'agendada'::status_aula_enum
        WHEN status = 'completed' OR status = 'concluida' THEN 'concluida'::status_aula_enum
        WHEN status = 'cancelled' OR status = 'cancelada' THEN 'cancelada'::status_aula_enum
        WHEN status = 'rescheduled' OR status = 'reagendada' THEN 'reagendada'::status_aula_enum
        ELSE 'agendada'::status_aula_enum  -- valor padrão para casos não mapeados
    END;

-- 4. Remover a coluna antiga
ALTER TABLE aulas DROP COLUMN status;

-- 5. Renomear a nova coluna
ALTER TABLE aulas RENAME COLUMN status_aula TO status_aula;

-- 6. Adicionar constraint NOT NULL se necessário
ALTER TABLE aulas ALTER COLUMN status_aula SET NOT NULL;

-- Verificar os dados após a migração
SELECT status_aula, COUNT(*) FROM aulas GROUP BY status_aula;

-- Comentários sobre os valores ENUM:
-- 'agendada': Aula planejada, ainda não iniciada
-- 'concluida': Aula finalizada com sucesso
-- 'cancelada': Aula cancelada (não será realizada)
-- 'reagendada': Aula que foi movida para outra data/horário