-- ========================================
-- REMOÇÃO COMPLETA DO SISTEMA DE SOFT DELETE
-- ========================================
-- Esta query remove todas as implementações de soft delete
-- e restaura o comportamento original do banco de dados

-- ========================================
-- FASE 1: REMOVER COLUNAS DELETED_AT
-- ========================================

-- Remover deleted_at de alunos (se existir)
ALTER TABLE public.alunos 
DROP COLUMN IF EXISTS deleted_at;

-- Remover deleted_at de professores (se existir)
ALTER TABLE public.professores 
DROP COLUMN IF EXISTS deleted_at;

-- Remover deleted_at de responsaveis (se existir)
ALTER TABLE public.responsaveis 
DROP COLUMN IF EXISTS deleted_at;

-- Remover deleted_at de salas (se existir)
ALTER TABLE public.salas 
DROP COLUMN IF EXISTS deleted_at;

-- Remover deleted_at de usuarios (se existir)
ALTER TABLE public.usuarios 
DROP COLUMN IF EXISTS deleted_at;

-- Remover deleted_at de turmas (se existir)
ALTER TABLE public.turmas 
DROP COLUMN IF EXISTS deleted_at;

-- Remover deleted_at de materiais (se existir)
ALTER TABLE public.materiais 
DROP COLUMN IF EXISTS deleted_at;

-- ========================================
-- FASE 2: RESTAURAR CONFIGURAÇÕES CASCADE ORIGINAIS
-- ========================================
-- Estas configurações permitem exclusão em cascata quando necessário

-- Restaurar CASCADE para contratos -> alunos
ALTER TABLE public.contratos 
DROP CONSTRAINT IF EXISTS contratos_aluno_id_fkey;

ALTER TABLE public.contratos 
ADD CONSTRAINT contratos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para boletos -> alunos
ALTER TABLE public.boletos 
DROP CONSTRAINT IF EXISTS boletos_aluno_id_fkey;

ALTER TABLE public.boletos 
ADD CONSTRAINT boletos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para presencas -> alunos
ALTER TABLE public.presencas 
DROP CONSTRAINT IF EXISTS presencas_aluno_id_fkey;

ALTER TABLE public.presencas 
ADD CONSTRAINT presencas_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para avaliacoes -> alunos
ALTER TABLE public.avaliacoes 
DROP CONSTRAINT IF EXISTS avaliacoes_aluno_id_fkey;

ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para parcelas -> alunos
ALTER TABLE public.parcelas 
DROP CONSTRAINT IF EXISTS parcelas_aluno_id_fkey;

ALTER TABLE public.parcelas 
ADD CONSTRAINT parcelas_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para recibos -> alunos
ALTER TABLE public.recibos 
DROP CONSTRAINT IF EXISTS recibos_aluno_id_fkey;

ALTER TABLE public.recibos 
ADD CONSTRAINT recibos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para notificacoes -> alunos
ALTER TABLE public.notificacoes 
DROP CONSTRAINT IF EXISTS notificacoes_destinatario_id_fkey;

ALTER TABLE public.notificacoes 
ADD CONSTRAINT notificacoes_destinatario_id_fkey 
FOREIGN KEY (destinatario_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para documentos -> alunos
ALTER TABLE public.documentos 
DROP CONSTRAINT IF EXISTS documentos_aluno_id_fkey;

ALTER TABLE public.documentos 
ADD CONSTRAINT documentos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para avaliacoes_competencia -> alunos
ALTER TABLE public.avaliacoes_competencia 
DROP CONSTRAINT IF EXISTS avaliacoes_competencia_aluno_id_fkey;

ALTER TABLE public.avaliacoes_competencia 
ADD CONSTRAINT avaliacoes_competencia_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para pesquisas_satisfacao -> alunos
ALTER TABLE public.pesquisas_satisfacao 
DROP CONSTRAINT IF EXISTS pesquisas_satisfacao_aluno_id_fkey;

ALTER TABLE public.pesquisas_satisfacao 
ADD CONSTRAINT pesquisas_satisfacao_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para ranking -> alunos
ALTER TABLE public.ranking 
DROP CONSTRAINT IF EXISTS ranking_aluno_id_fkey;

ALTER TABLE public.ranking 
ADD CONSTRAINT ranking_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Restaurar CASCADE para materiais_entregues -> alunos
ALTER TABLE public.materiais_entregues 
DROP CONSTRAINT IF EXISTS materiais_entregues_aluno_id_fkey;

ALTER TABLE public.materiais_entregues 
ADD CONSTRAINT materiais_entregues_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- ========================================
-- FASE 3: CONFIGURAÇÕES PARA PROFESSORES
-- ========================================

-- Manter SET NULL para turmas -> professor (apropriado)
ALTER TABLE public.turmas 
DROP CONSTRAINT IF EXISTS turmas_professor_id_fkey;

ALTER TABLE public.turmas 
ADD CONSTRAINT turmas_professor_id_fkey 
FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE SET NULL;

-- Restaurar CASCADE para folha_pagamento -> professor
ALTER TABLE public.folha_pagamento 
DROP CONSTRAINT IF EXISTS folha_pagamento_professor_id_fkey;

ALTER TABLE public.folha_pagamento 
ADD CONSTRAINT folha_pagamento_professor_id_fkey 
FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE CASCADE;

-- ========================================
-- FASE 4: REMOVER ÍNDICES DE STATUS DESNECESSÁRIOS
-- ========================================

-- Remover índices criados para soft delete
DROP INDEX IF EXISTS idx_alunos_deleted_at;
DROP INDEX IF EXISTS idx_professores_deleted_at;
DROP INDEX IF EXISTS idx_responsaveis_deleted_at;
DROP INDEX IF EXISTS idx_salas_deleted_at;
DROP INDEX IF EXISTS idx_usuarios_deleted_at;
DROP INDEX IF EXISTS idx_turmas_deleted_at;
DROP INDEX IF EXISTS idx_materiais_deleted_at;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Query para verificar se as colunas deleted_at foram removidas
SELECT 
  table_name,
  column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'deleted_at'
ORDER BY table_name;

-- Query para verificar as constraints atuais
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  rc.delete_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name IN ('contratos', 'boletos', 'presencas', 'avaliacoes', 'parcelas', 'recibos', 'notificacoes', 'documentos', 'avaliacoes_competencia', 'pesquisas_satisfacao', 'ranking', 'materiais_entregues', 'turmas', 'folha_pagamento'))
ORDER BY tc.table_name, tc.constraint_name;

-- ========================================
-- COMENTÁRIOS FINAIS
-- ========================================

-- Sistema de soft delete completamente removido!
-- Agora o sistema usa hard delete com as funções SQL criadas anteriormente
-- para permitir exclusão seletiva de dados relacionados.