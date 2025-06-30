-- Migração para implementar sistema de status e remover CASCADE
-- Esta migração substitui exclusões físicas por exclusões lógicas (soft delete)

-- ========================================
-- FASE 1: ADICIONAR CAMPOS DE STATUS
-- ========================================

-- Adicionar status para professores (se não existir)
ALTER TABLE public.professores 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' 
CHECK (status IN ('ativo', 'inativo', 'demitido'));

-- Adicionar status para responsáveis
ALTER TABLE public.responsaveis 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' 
CHECK (status IN ('ativo', 'inativo'));

-- Adicionar status para salas
ALTER TABLE public.salas 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativa' 
CHECK (status IN ('ativa', 'inativa', 'manutencao'));

-- Adicionar status para usuários
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' 
CHECK (status IN ('ativo', 'inativo', 'suspenso'));

-- Adicionar status para materiais (já existe, mas garantindo)
ALTER TABLE public.materiais 
ALTER COLUMN status SET DEFAULT 'disponivel';

-- ========================================
-- FASE 2: REMOVER TODAS AS CONFIGURAÇÕES CASCADE
-- ========================================

-- Remover CASCADE de alunos (contratos)
ALTER TABLE public.contratos 
DROP CONSTRAINT IF EXISTS contratos_aluno_id_fkey;

ALTER TABLE public.contratos 
ADD CONSTRAINT contratos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (boletos)
ALTER TABLE public.boletos 
DROP CONSTRAINT IF EXISTS boletos_aluno_id_fkey;

ALTER TABLE public.boletos 
ADD CONSTRAINT boletos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (presencas)
ALTER TABLE public.presencas 
DROP CONSTRAINT IF EXISTS presencas_aluno_id_fkey;

ALTER TABLE public.presencas 
ADD CONSTRAINT presencas_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (avaliacoes)
ALTER TABLE public.avaliacoes 
DROP CONSTRAINT IF EXISTS avaliacoes_aluno_id_fkey;

ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (parcelas)
ALTER TABLE public.parcelas 
DROP CONSTRAINT IF EXISTS parcelas_aluno_id_fkey;

ALTER TABLE public.parcelas 
ADD CONSTRAINT parcelas_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (recibos)
ALTER TABLE public.recibos 
DROP CONSTRAINT IF EXISTS recibos_aluno_id_fkey;

ALTER TABLE public.recibos 
ADD CONSTRAINT recibos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (notificacoes)
ALTER TABLE public.notificacoes 
DROP CONSTRAINT IF EXISTS notificacoes_destinatario_id_fkey;

ALTER TABLE public.notificacoes 
ADD CONSTRAINT notificacoes_destinatario_id_fkey 
FOREIGN KEY (destinatario_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (documentos)
ALTER TABLE public.documentos 
DROP CONSTRAINT IF EXISTS documentos_aluno_id_fkey;

ALTER TABLE public.documentos 
ADD CONSTRAINT documentos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (avaliacoes_competencia)
ALTER TABLE public.avaliacoes_competencia 
DROP CONSTRAINT IF EXISTS avaliacoes_competencia_aluno_id_fkey;

ALTER TABLE public.avaliacoes_competencia 
ADD CONSTRAINT avaliacoes_competencia_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (pesquisas_satisfacao)
ALTER TABLE public.pesquisas_satisfacao 
DROP CONSTRAINT IF EXISTS pesquisas_satisfacao_aluno_id_fkey;

ALTER TABLE public.pesquisas_satisfacao 
ADD CONSTRAINT pesquisas_satisfacao_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (ranking)
ALTER TABLE public.ranking 
DROP CONSTRAINT IF EXISTS ranking_aluno_id_fkey;

ALTER TABLE public.ranking 
ADD CONSTRAINT ranking_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- Remover CASCADE de alunos (materiais_entregues)
ALTER TABLE public.materiais_entregues 
DROP CONSTRAINT IF EXISTS materiais_entregues_aluno_id_fkey;

ALTER TABLE public.materiais_entregues 
ADD CONSTRAINT materiais_entregues_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE RESTRICT;

-- ========================================
-- FASE 3: CONFIGURAR RELACIONAMENTOS COM SET NULL
-- ========================================

-- Turmas -> Professor (SET NULL quando professor for removido)
ALTER TABLE public.turmas 
DROP CONSTRAINT IF EXISTS turmas_professor_id_fkey;

ALTER TABLE public.turmas 
ADD CONSTRAINT turmas_professor_id_fkey 
FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE SET NULL;

-- Turmas -> Sala (SET NULL quando sala for removida)
ALTER TABLE public.turmas 
DROP CONSTRAINT IF EXISTS turmas_sala_id_fkey;

ALTER TABLE public.turmas 
ADD CONSTRAINT turmas_sala_id_fkey 
FOREIGN KEY (sala_id) REFERENCES public.salas(id) ON DELETE SET NULL;

-- Alunos -> Turma (SET NULL quando turma for removida)
ALTER TABLE public.alunos 
DROP CONSTRAINT IF EXISTS alunos_turma_id_fkey;

ALTER TABLE public.alunos 
ADD CONSTRAINT alunos_turma_id_fkey 
FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE SET NULL;

-- Alunos -> Responsável (SET NULL quando responsável for removido)
ALTER TABLE public.alunos 
DROP CONSTRAINT IF EXISTS alunos_responsavel_id_fkey;

ALTER TABLE public.alunos 
ADD CONSTRAINT alunos_responsavel_id_fkey 
FOREIGN KEY (responsavel_id) REFERENCES public.responsaveis(id) ON DELETE SET NULL;

-- Folha de Pagamento -> Professor (RESTRICT para manter histórico)
ALTER TABLE public.folha_pagamento 
DROP CONSTRAINT IF EXISTS folha_pagamento_professor_id_fkey;

ALTER TABLE public.folha_pagamento 
ADD CONSTRAINT folha_pagamento_professor_id_fkey 
FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE RESTRICT;

-- Aulas -> Turma (RESTRICT para manter histórico)
ALTER TABLE public.aulas 
DROP CONSTRAINT IF EXISTS aulas_turma_id_fkey;

ALTER TABLE public.aulas 
ADD CONSTRAINT aulas_turma_id_fkey 
FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE RESTRICT;

-- Presencas -> Aula (CASCADE é apropriado aqui)
ALTER TABLE public.presencas 
DROP CONSTRAINT IF EXISTS presencas_aula_id_fkey;

ALTER TABLE public.presencas 
ADD CONSTRAINT presencas_aula_id_fkey 
FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;

-- Materiais Entregues -> Material (RESTRICT para manter histórico)
ALTER TABLE public.materiais_entregues 
DROP CONSTRAINT IF EXISTS materiais_entregues_material_id_fkey;

ALTER TABLE public.materiais_entregues 
ADD CONSTRAINT materiais_entregues_material_id_fkey 
FOREIGN KEY (material_id) REFERENCES public.materiais(id) ON DELETE RESTRICT;

-- ========================================
-- FASE 4: CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para consultas por status
CREATE INDEX IF NOT EXISTS idx_alunos_status ON public.alunos(status);
CREATE INDEX IF NOT EXISTS idx_professores_status ON public.professores(status);
CREATE INDEX IF NOT EXISTS idx_responsaveis_status ON public.responsaveis(status);
CREATE INDEX IF NOT EXISTS idx_salas_status ON public.salas(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON public.usuarios(status);
CREATE INDEX IF NOT EXISTS idx_turmas_status ON public.turmas(status);
CREATE INDEX IF NOT EXISTS idx_materiais_status ON public.materiais(status);

-- ========================================
-- FASE 5: COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON COLUMN public.alunos.status IS 'Status do aluno: Ativo, Trancado, Cancelado';
COMMENT ON COLUMN public.professores.status IS 'Status do professor: ativo, inativo, demitido';
COMMENT ON COLUMN public.responsaveis.status IS 'Status do responsável: ativo, inativo';
COMMENT ON COLUMN public.salas.status IS 'Status da sala: ativa, inativa, manutencao';
COMMENT ON COLUMN public.usuarios.status IS 'Status do usuário: ativo, inativo, suspenso';

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Query para verificar se todas as constraints foram aplicadas corretamente
-- SELECT 
--   tc.table_name, 
--   tc.constraint_name, 
--   tc.constraint_type,
--   rc.delete_rule
-- FROM information_schema.table_constraints tc
-- LEFT JOIN information_schema.referential_constraints rc 
--   ON tc.constraint_name = rc.constraint_name
-- WHERE tc.table_schema = 'public' 
--   AND tc.constraint_type = 'FOREIGN KEY'
-- ORDER BY tc.table_name, tc.constraint_name;