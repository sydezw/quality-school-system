-- Adicionar campo ativo_ou_encerrado à tabela financeiro_alunos
ALTER TABLE public.financeiro_alunos 
ADD COLUMN ativo_ou_encerrado TEXT NOT NULL DEFAULT 'ativo'
  CHECK (ativo_ou_encerrado IN ('ativo', 'encerrado'));

-- Comentário para documentação
COMMENT ON COLUMN public.financeiro_alunos.ativo_ou_encerrado IS 'Status do registro financeiro: ativo (em andamento) ou encerrado (finalizado/cancelado)';

-- Índice para melhor performance em consultas
CREATE INDEX idx_financeiro_alunos_ativo_ou_encerrado ON public.financeiro_alunos(ativo_ou_encerrado);