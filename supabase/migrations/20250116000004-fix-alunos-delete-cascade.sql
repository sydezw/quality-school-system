-- Migração para corrigir as restrições de chave estrangeira
-- permitindo a exclusão de alunos com contratos e boletos associados

-- Primeiro, remover as restrições existentes
ALTER TABLE public.contratos DROP CONSTRAINT IF EXISTS contratos_aluno_id_fkey;
ALTER TABLE public.boletos DROP CONSTRAINT IF EXISTS boletos_aluno_id_fkey;

-- Recriar as restrições com ON DELETE CASCADE
ALTER TABLE public.contratos 
ADD CONSTRAINT contratos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;

ALTER TABLE public.boletos 
ADD CONSTRAINT boletos_aluno_id_fkey 
FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;