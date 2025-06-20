-- Migration para simplificar todas as permissões seguindo a nova estratégia
-- Remove as colunas antigas de criar/editar/remover
-- Adiciona as novas colunas de visualizar e gerenciar

BEGIN;

-- Materiais
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_materiais,
DROP COLUMN IF EXISTS perm_editar_materiais,
DROP COLUMN IF EXISTS perm_remover_materiais;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_materiais BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_materiais BOOLEAN DEFAULT false;

-- Alunos
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_alunos,
DROP COLUMN IF EXISTS perm_editar_alunos,
DROP COLUMN IF EXISTS perm_remover_alunos;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_alunos BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_alunos BOOLEAN DEFAULT false;

-- Turmas
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_turmas,
DROP COLUMN IF EXISTS perm_editar_turmas,
DROP COLUMN IF EXISTS perm_remover_turmas;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_turmas BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_turmas BOOLEAN DEFAULT false;

-- Contratos
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_contratos,
DROP COLUMN IF EXISTS perm_editar_contratos,
DROP COLUMN IF EXISTS perm_remover_contratos;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_contratos BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_contratos BOOLEAN DEFAULT false;

-- Aulas
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_aulas,
DROP COLUMN IF EXISTS perm_editar_aulas,
DROP COLUMN IF EXISTS perm_remover_aulas;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_aulas BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_aulas BOOLEAN DEFAULT false;

-- Avaliações
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_avaliacoes,
DROP COLUMN IF EXISTS perm_editar_avaliacoes,
DROP COLUMN IF EXISTS perm_remover_avaliacoes;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_avaliacoes BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_avaliacoes BOOLEAN DEFAULT false;

-- Professores
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_professores,
DROP COLUMN IF EXISTS perm_editar_professores,
DROP COLUMN IF EXISTS perm_remover_professores;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_professores BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_professores BOOLEAN DEFAULT false;

-- Salas
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS perm_criar_salas,
DROP COLUMN IF EXISTS perm_editar_salas,
DROP COLUMN IF EXISTS perm_remover_salas;

ALTER TABLE usuarios 
ADD COLUMN perm_visualizar_salas BOOLEAN DEFAULT false,
ADD COLUMN perm_gerenciar_salas BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN usuarios.perm_visualizar_materiais IS 'Permissão para visualizar a aba de materiais';
COMMENT ON COLUMN usuarios.perm_gerenciar_materiais IS 'Permissão para criar, editar e remover materiais';
COMMENT ON COLUMN usuarios.perm_visualizar_alunos IS 'Permissão para visualizar a aba de alunos';
COMMENT ON COLUMN usuarios.perm_gerenciar_alunos IS 'Permissão para criar, editar e remover alunos';
COMMENT ON COLUMN usuarios.perm_visualizar_turmas IS 'Permissão para visualizar a aba de turmas';
COMMENT ON COLUMN usuarios.perm_gerenciar_turmas IS 'Permissão para criar, editar e remover turmas';
COMMENT ON COLUMN usuarios.perm_visualizar_contratos IS 'Permissão para visualizar a aba de contratos';
COMMENT ON COLUMN usuarios.perm_gerenciar_contratos IS 'Permissão para criar, editar e remover contratos';
COMMENT ON COLUMN usuarios.perm_visualizar_aulas IS 'Permissão para visualizar a aba de aulas';
COMMENT ON COLUMN usuarios.perm_gerenciar_aulas IS 'Permissão para criar, editar e remover aulas';
COMMENT ON COLUMN usuarios.perm_visualizar_avaliacoes IS 'Permissão para visualizar a aba de avaliações';
COMMENT ON COLUMN usuarios.perm_gerenciar_avaliacoes IS 'Permissão para criar, editar e remover avaliações';
COMMENT ON COLUMN usuarios.perm_visualizar_professores IS 'Permissão para visualizar a aba de professores';
COMMENT ON COLUMN usuarios.perm_gerenciar_professores IS 'Permissão para criar, editar e remover professores';
COMMENT ON COLUMN usuarios.perm_visualizar_salas IS 'Permissão para visualizar a aba de salas';
COMMENT ON COLUMN usuarios.perm_gerenciar_salas IS 'Permissão para criar, editar e remover salas';

COMMIT;