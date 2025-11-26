-- Script para adicionar suporte a documentos de professores
-- Execute este script no seu banco de dados PostgreSQL

BEGIN;

-- 1. Expandir o tipo enum tipo_documento para incluir documentos de professores
ALTER TYPE public.tipo_documento ADD VALUE 'certificado_professor';
ALTER TYPE public.tipo_documento ADD VALUE 'diploma_professor';
ALTER TYPE public.tipo_documento ADD VALUE 'comprovante_experiencia';
ALTER TYPE public.tipo_documento ADD VALUE 'documento_pessoal';

-- 2. Adicionar coluna professor_id à tabela documentos
ALTER TABLE public.documentos 
ADD COLUMN professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE;

-- 3. Modificar a coluna aluno_id para permitir valores nulos
ALTER TABLE public.documentos 
ALTER COLUMN aluno_id DROP NOT NULL;

-- 4. Adicionar constraint para garantir que pelo menos um dos IDs seja preenchido
ALTER TABLE public.documentos 
ADD CONSTRAINT check_documento_pessoa 
CHECK (
  (aluno_id IS NOT NULL AND professor_id IS NULL) OR 
  (aluno_id IS NULL AND professor_id IS NOT NULL)
);

-- 5. Criar índice para professor_id
CREATE INDEX idx_documentos_professor_id ON public.documentos(professor_id);

-- 6. Atualizar as políticas RLS para incluir professores

-- Remover política existente se houver
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.documentos;

-- Criar nova política que permite acesso total para usuários autenticados
-- (seguindo o padrão do sistema existente)
CREATE POLICY "Allow all operations for authenticated users" ON public.documentos
  FOR ALL USING (auth.role() = 'authenticated');

COMMIT;

-- Queries para verificar as alterações:

-- Verificar os novos tipos de documento
SELECT unnest(enum_range(NULL::public.tipo_documento)) AS tipos_documento;

-- Verificar a estrutura da tabela documentos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'documentos'
ORDER BY ordinal_position;

-- Verificar as constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.documentos'::regclass;

-- Verificar as políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'documentos';

-- Exemplo de inserção de documento para professor:
/*
INSERT INTO public.documentos (
  professor_id,
  tipo,
  data,
  status,
  arquivo_link
) VALUES (
  'uuid-do-professor',
  'certificado_professor',
  CURRENT_DATE,
  'gerado',
  'https://exemplo.com/certificado.pdf'
);
*/

-- Exemplo de consulta para buscar documentos de professores:
/*
SELECT 
  d.*,
  p.nome as professor_nome
FROM public.documentos d
LEFT JOIN public.professores p ON d.professor_id = p.id
WHERE d.professor_id IS NOT NULL
ORDER BY d.data DESC;
*/