-- Script para aplicar suporte a documentos de professores
-- Execute este script completo no seu editor SQL

-- Passo 1: Expandir tipos de documento
ALTER TYPE public.tipo_documento ADD VALUE IF NOT EXISTS 'certificado_professor';
ALTER TYPE public.tipo_documento ADD VALUE IF NOT EXISTS 'diploma_professor';
ALTER TYPE public.tipo_documento ADD VALUE IF NOT EXISTS 'comprovante_experiencia';
ALTER TYPE public.tipo_documento ADD VALUE IF NOT EXISTS 'documento_pessoal';

-- Passo 2: Adicionar coluna professor_id (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documentos' 
        AND column_name = 'professor_id'
    ) THEN
        ALTER TABLE public.documentos 
        ADD COLUMN professor_id UUID REFERENCES public.professores(id);
    END IF;
END $$;

-- Passo 3: Permitir aluno_id nulo
ALTER TABLE public.documentos 
ALTER COLUMN aluno_id DROP NOT NULL;

-- Passo 4: Adicionar constraint de validação (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_documento_pessoa'
    ) THEN
        ALTER TABLE public.documentos 
        ADD CONSTRAINT check_documento_pessoa 
        CHECK (
          (aluno_id IS NOT NULL AND professor_id IS NULL) OR 
          (aluno_id IS NULL AND professor_id IS NOT NULL)
        );
    END IF;
END $$;

-- Passo 5: Criar índice para performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_documentos_professor_id ON public.documentos(professor_id);

-- Passo 6: Atualizar políticas RLS
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.documentos;

CREATE POLICY "Allow all operations for authenticated users" ON public.documentos
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verificações finais
-- Verificar novos tipos de documento
SELECT 'Tipos de documento disponíveis:' as info;
SELECT unnest(enum_range(NULL::public.tipo_documento)) AS tipos_documento;

-- Verificar estrutura da tabela
SELECT 'Estrutura da tabela documentos:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'documentos'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 'Constraints da tabela documentos:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.documentos'::regclass;

SELECT 'Script aplicado com sucesso!' as resultado;