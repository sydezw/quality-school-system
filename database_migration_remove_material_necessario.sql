-- Migration para remover campo 'material_necessario' da tabela aulas
-- Execute esta query manualmente no seu banco de dados

-- Remover a coluna material_necessario da tabela aulas
ALTER TABLE aulas DROP COLUMN IF EXISTS material_necessario;

-- Verificar a estrutura da tabela após a remoção
\d aulas;

-- Comentário: 
-- O campo 'material_necessario' foi removido conforme solicitado pelo usuário
-- pois se mostrou desnecessário para o sistema.