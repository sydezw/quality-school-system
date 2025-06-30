-- Adicionar campo valor_total à tabela planos
ALTER TABLE public.planos 
ADD COLUMN valor_total DECIMAL(10,2);

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.planos.valor_total IS 'Valor total do plano em reais';

-- Atualizar planos existentes com valor padrão (opcional)
-- UPDATE public.planos SET valor_total = 0.00 WHERE valor_total IS NULL;