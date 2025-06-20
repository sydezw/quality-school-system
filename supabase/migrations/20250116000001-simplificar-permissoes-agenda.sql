-- Migration para simplificar permissões de agenda
-- Remove as colunas antigas de criar/editar/remover agenda
-- Adiciona as novas colunas de visualizar e gerenciar agenda

BEGIN;

-- Remove as colunas antigas de agenda
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_agenda,
DROP COLUMN IF EXISTS perm_editar_agenda,
DROP COLUMN IF EXISTS perm_remover_agenda;

-- Adiciona as novas colunas de agenda
ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_agenda BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_agenda BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN usuarios.perm_visualizar_agenda IS 'Permissão para visualizar a aba de agenda';
COMMENT ON COLUMN usuarios.perm_gerenciar_agenda IS 'Permissão para criar, editar e remover itens da agenda';

COMMIT;