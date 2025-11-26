-- Adicionar campo tipo_valor à tabela planos
-- Execute esta query manualmente no seu banco de dados

ALTER TABLE planos 
ADD COLUMN tipo_valor VARCHAR(20) DEFAULT 'plano' 
CHECK (tipo_valor IN ('plano', 'plano_material', 'plano_matricula', 'plano_completo'));

-- Comentário explicativo sobre os valores possíveis:
-- 'plano' = Apenas o valor do plano de aulas
-- 'plano_material' = Plano + material didático
-- 'plano_matricula' = Plano + taxa de matrícula  
-- 'plano_completo' = Plano + material + matrícula

-- Atualizar planos existentes para o valor padrão (opcional)
UPDATE planos SET tipo_valor = 'plano' WHERE tipo_valor IS NULL;