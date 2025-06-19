
-- Adicionar observacao na tabela contratos se não existir
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS observacao text;

-- Criar índices para otimizar consultas de contratos vencendo
CREATE INDEX IF NOT EXISTS idx_contratos_data_fim_status 
ON public.contratos(data_fim, status) 
WHERE status = 'Ativo';

-- Criar view para contratos vencendo
CREATE OR REPLACE VIEW contratos_vencendo AS
SELECT 
  c.*,
  a.nome as aluno_nome,
  (c.data_fim - CURRENT_DATE) as dias_restantes,
  CASE 
    WHEN c.data_fim < CURRENT_DATE THEN 'vencido'
    WHEN c.data_fim <= CURRENT_DATE + INTERVAL '30 days' THEN 'vencendo'
    ELSE 'ativo'
  END as situacao
FROM contratos c
JOIN alunos a ON c.aluno_id = a.id
WHERE c.status = 'Ativo';
