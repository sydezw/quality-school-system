-- Corrigir todas as constraints de chave estrangeira para alunos
-- Permitindo a exclusão de alunos com registros relacionados

-- Remover constraints existentes e recriar com ON DELETE CASCADE

-- Tabela: presencas
ALTER TABLE public.presencas DROP CONSTRAINT IF EXISTS presencas_aluno_id_fkey;
ALTER TABLE public.presencas 
ADD CONSTRAINT presencas_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: avaliacoes
ALTER TABLE public.avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_aluno_id_fkey;
ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: parcelas
ALTER TABLE public.parcelas DROP CONSTRAINT IF EXISTS parcelas_aluno_id_fkey;
ALTER TABLE public.parcelas 
ADD CONSTRAINT parcelas_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: recibos
ALTER TABLE public.recibos DROP CONSTRAINT IF EXISTS recibos_aluno_id_fkey;
ALTER TABLE public.recibos 
ADD CONSTRAINT recibos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: notificacoes
ALTER TABLE public.notificacoes DROP CONSTRAINT IF EXISTS notificacoes_destinatario_id_fkey;
ALTER TABLE public.notificacoes 
ADD CONSTRAINT notificacoes_destinatario_id_fkey 
FOREIGN KEY (destinatario_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: documentos
ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS documentos_aluno_id_fkey;
ALTER TABLE public.documentos 
ADD CONSTRAINT documentos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: avaliacoes_competencia
ALTER TABLE public.avaliacoes_competencia DROP CONSTRAINT IF EXISTS avaliacoes_competencia_aluno_id_fkey;
ALTER TABLE public.avaliacoes_competencia 
ADD CONSTRAINT avaliacoes_competencia_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: pesquisas_satisfacao
ALTER TABLE public.pesquisas_satisfacao DROP CONSTRAINT IF EXISTS pesquisas_satisfacao_aluno_id_fkey;
ALTER TABLE public.pesquisas_satisfacao 
ADD CONSTRAINT pesquisas_satisfacao_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: ranking
ALTER TABLE public.ranking DROP CONSTRAINT IF EXISTS ranking_aluno_id_fkey;
ALTER TABLE public.ranking 
ADD CONSTRAINT ranking_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

-- Tabela: materiais_entregues
ALTER TABLE public.materiais_entregues DROP CONSTRAINT IF EXISTS materiais_entregues_aluno_id_fkey;
ALTER TABLE public.materiais_entregues 
ADD CONSTRAINT materiais_entregues_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;