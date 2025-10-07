-- Adicionar a opção 'avulso' ao enum tipo_item
-- Esta query adiciona o novo valor 'avulso' ao enum existente tipo_item
-- mantendo todos os valores existentes intactos

ALTER TYPE tipo_item ADD VALUE 'avulso';

-- Verificar se a alteração foi aplicada corretamente
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_item')
ORDER BY enumsortorder;