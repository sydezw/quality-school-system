-- Corrigir constraint frequencia_aulas_valid_json na tabela planos
-- O campo frequencia_aulas deve aceitar valores de texto simples, não JSON

-- Remover a constraint JSON se existir
ALTER TABLE public.planos DROP CONSTRAINT IF EXISTS frequencia_aulas_valid_json;

-- Garantir que o campo seja TEXT e aceite valores simples
ALTER TABLE public.planos ALTER COLUMN frequencia_aulas TYPE TEXT;

-- Adicionar uma constraint mais apropriada para validar os valores permitidos
ALTER TABLE public.planos 
ADD CONSTRAINT frequencia_aulas_valid_values 
CHECK (frequencia_aulas IN ('semanal', 'quinzenal', 'mensal', 'intensivo'));

-- Comentário para documentação
COMMENT ON COLUMN public.planos.frequencia_aulas IS 'Frequência das aulas: semanal, quinzenal, mensal ou intensivo';