-- Adicionar coluna horario_por_aulas na tabela planos
ALTER TABLE planos 
ADD COLUMN horario_por_aulas NUMERIC NOT NULL DEFAULT 0;

-- Adicionar constraint para garantir que horario_por_aulas seja maior que 0
ALTER TABLE planos 
ADD CONSTRAINT horario_por_aulas_positive CHECK (horario_por_aulas > 0);

-- Atualizar a policy de inserção para incluir horario_por_aulas (se necessário)
-- A policy atual já permite inserção para usuários autenticados, então não precisa de alteração

-- Comentário explicativo
COMMENT ON COLUMN planos.horario_por_aulas IS 'Duração em horas de cada aula individual do plano';