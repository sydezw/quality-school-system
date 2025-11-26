-- Script para adicionar novos campos na tabela turmas
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- PASSO 1: CRIAR ENUM PARA TIPO DE TURMA
-- ========================================

-- Criar o enum para tipo de turma
CREATE TYPE public.tipo_turma AS ENUM (
    'Turma particular',
    'Turma'
);

-- ========================================
-- PASSO 2: ADICIONAR COLUNAS NA TABELA TURMAS
-- ========================================

-- Adicionar coluna tipo_turma
ALTER TABLE public.turmas 
ADD COLUMN tipo_turma public.tipo_turma DEFAULT 'Turma';

-- Adicionar coluna data_inicio
ALTER TABLE public.turmas 
ADD COLUMN data_inicio DATE;

-- Adicionar coluna data_fim (data que vai acabar)
ALTER TABLE public.turmas 
ADD COLUMN data_fim DATE;

-- Adicionar coluna total_aulas (número total de aulas)
ALTER TABLE public.turmas 
ADD COLUMN total_aulas INTEGER;

-- ========================================
-- PASSO 3: ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON COLUMN public.turmas.tipo_turma IS 'Tipo da turma: Turma particular ou Turma regular';
COMMENT ON COLUMN public.turmas.data_inicio IS 'Data de início da turma';
COMMENT ON COLUMN public.turmas.data_fim IS 'Data prevista para o fim da turma';
COMMENT ON COLUMN public.turmas.total_aulas IS 'Número total de aulas previstas para a turma';

-- ========================================
-- PASSO 4: VERIFICAR AS ALTERAÇÕES
-- ========================================

-- Verificar se o enum foi criado
SELECT unnest(enum_range(NULL::public.tipo_turma)) AS tipos_turma;

-- Verificar a estrutura da tabela turmas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'turmas' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- PASSO 5: EXEMPLO DE USO (OPCIONAL)
-- ========================================

-- Exemplo de como inserir uma turma com os novos campos
/*
INSERT INTO public.turmas (
    nome,
    idioma,
    nivel,
    tipo_turma,
    data_inicio,
    data_fim,
    total_aulas,
    dias_da_semana,
    horario
) VALUES (
    'Turma Particular - João Silva',
    'Inglês',
    'Book 1',
    'Turma particular',
    '2024-02-01',
    '2024-06-30',
    20,
    'Segunda, Quarta',
    '14:00-15:00'
);
*/

-- ========================================
-- INSTRUÇÕES DE EXECUÇÃO
-- ========================================

/*
PARA EXECUTAR ESTE SCRIPT:

1. Abra o SQL Editor no Supabase
2. Cole todo o conteúdo deste arquivo
3. Execute o script completo
4. Verifique se não há erros
5. Confirme as alterações com as consultas de verificação

APÓS A EXECUÇÃO:
- A tabela turmas terá 4 novos campos:
  * tipo_turma (enum): 'Turma particular' ou 'Turma'
  * data_inicio (date): Data de início da turma
  * data_fim (date): Data prevista para o fim da turma
  * total_aulas (integer): Número total de aulas previstas

- O campo tipo_turma tem valor padrão 'Turma' para turmas existentes
- Os campos de data e total_aulas permitem valores nulos inicialmente
*/