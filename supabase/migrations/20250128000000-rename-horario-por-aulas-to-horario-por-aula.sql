-- Renomear coluna horario_por_aulas para horario_por_aula na tabela planos
ALTER TABLE planos 
RENAME COLUMN horario_por_aulas TO horario_por_aula;

-- Remover constraint antiga
ALTER TABLE planos 
DROP CONSTRAINT IF EXISTS horario_por_aulas_positive;

-- Adicionar nova constraint com nome correto
ALTER TABLE planos 
ADD CONSTRAINT horario_por_aula_positive CHECK (horario_por_aula > 0);

-- Atualizar comentário da coluna
COMMENT ON COLUMN planos.horario_por_aula IS 'Duração em horas de cada aula individual do plano';