-- Configurar constraints para proteger planos e preservar histórico financeiro
-- Esta migração resolve o problema de exclusão de alunos com planos associados

-- 1. FINANCEIRO_ALUNOS -> PLANO: RESTRICT (protege o plano)
-- Não permite excluir plano se há registros financeiros
ALTER TABLE public.financeiro_alunos 
DROP CONSTRAINT IF EXISTS financeiro_alunos_plano_id_fkey;

ALTER TABLE public.financeiro_alunos 
ADD CONSTRAINT financeiro_alunos_plano_id_fkey 
FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE RESTRICT;

-- 2. CONTRATOS -> PLANO: RESTRICT (protege o plano)
-- Não permite excluir plano se há contratos ativos
ALTER TABLE public.contratos 
DROP CONSTRAINT IF EXISTS contratos_plano_id_fkey;

ALTER TABLE public.contratos 
ADD CONSTRAINT contratos_plano_id_fkey 
FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE RESTRICT;

-- 3. FINANCEIRO_ALUNOS -> ALUNO: SET NULL (preserva histórico financeiro)
-- Quando aluno é excluído, mantém registros financeiros mas remove referência
ALTER TABLE public.financeiro_alunos 
DROP CONSTRAINT IF EXISTS financeiro_alunos_aluno_id_fkey;

ALTER TABLE public.financeiro_alunos 
ADD CONSTRAINT financeiro_alunos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;

-- 4. CONTRATOS -> ALUNO: SET NULL (preserva histórico de contratos)
-- Quando aluno é excluído, mantém contrato mas remove referência
ALTER TABLE public.contratos 
DROP CONSTRAINT IF EXISTS contratos_aluno_id_fkey;

ALTER TABLE public.contratos 
ADD CONSTRAINT contratos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;

-- 5. PARCELAS -> ALUNO: SET NULL (preserva histórico de parcelas)
-- Quando aluno é excluído, mantém parcelas mas remove referência
ALTER TABLE public.parcelas 
DROP CONSTRAINT IF EXISTS parcelas_aluno_id_fkey;

ALTER TABLE public.parcelas 
ADD CONSTRAINT parcelas_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;

-- 6. BOLETOS -> ALUNO: SET NULL (preserva histórico de boletos)
-- Quando aluno é excluído, mantém boletos mas remove referência
ALTER TABLE public.boletos 
DROP CONSTRAINT IF EXISTS boletos_aluno_id_fkey;

ALTER TABLE public.boletos 
ADD CONSTRAINT boletos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;

-- 7. RECIBOS -> ALUNO: SET NULL (preserva histórico de recibos)
-- Quando aluno é excluído, mantém recibos mas remove referência
ALTER TABLE public.recibos 
DROP CONSTRAINT IF EXISTS recibos_aluno_id_fkey;

ALTER TABLE public.recibos 
ADD CONSTRAINT recibos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;

-- 8. HISTORICO_PAGAMENTOS -> ALUNO: SET NULL (preserva histórico de pagamentos)
-- Quando aluno é excluído, mantém histórico mas remove referência
ALTER TABLE public.historico_pagamentos 
DROP CONSTRAINT IF EXISTS historico_pagamentos_aluno_id_fkey;

ALTER TABLE public.historico_pagamentos 
ADD CONSTRAINT historico_pagamentos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;