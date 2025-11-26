# Instruções para Aplicar Suporte a Documentos de Professores

## Pré-requisitos
- Acesso ao banco de dados PostgreSQL
- Permissões de administrador no banco
- Cliente SQL (pgAdmin, DBeaver, psql, etc.)

## Passos para Aplicação Manual

### 1. Conectar ao Banco de Dados
Conecte-se ao seu banco de dados PostgreSQL usando suas credenciais.

### 2. Executar os Comandos SQL

Copie e execute os comandos abaixo **UM POR VEZ** no seu cliente SQL:

#### Passo 1: Expandir tipos de documento
```sql
ALTER TYPE public.tipo_documento ADD VALUE 'certificado_professor';
ALTER TYPE public.tipo_documento ADD VALUE 'diploma_professor';
ALTER TYPE public.tipo_documento ADD VALUE 'comprovante_experiencia';
ALTER TYPE public.tipo_documento ADD VALUE 'documento_pessoal';
```

#### Passo 2: Adicionar coluna professor_id
```sql
ALTER TABLE public.documentos 
ADD COLUMN professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE;
```

#### Passo 3: Permitir aluno_id nulo
```sql
ALTER TABLE public.documentos 
ALTER COLUMN aluno_id DROP NOT NULL;
```

#### Passo 4: Adicionar constraint de validação
```sql
ALTER TABLE public.documentos 
ADD CONSTRAINT check_documento_pessoa 
CHECK (
  (aluno_id IS NOT NULL AND professor_id IS NULL) OR 
  (aluno_id IS NULL AND professor_id IS NOT NULL)
);
```

#### Passo 5: Criar índice para performance
```sql
CREATE INDEX idx_documentos_professor_id ON public.documentos(professor_id);
```

#### Passo 6: Atualizar políticas RLS
```sql
-- Remover política existente
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.documentos;

-- Criar nova política
CREATE POLICY "Allow all operations for authenticated users" ON public.documentos
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. Verificar as Alterações

Após executar todos os comandos, verifique se tudo foi aplicado corretamente:

#### Verificar novos tipos de documento:
```sql
SELECT unnest(enum_range(NULL::public.tipo_documento)) AS tipos_documento;
```

#### Verificar estrutura da tabela:
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'documentos'
ORDER BY ordinal_position;
```

#### Verificar constraints:
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.documentos'::regclass;
```

### 4. Teste de Funcionamento

Após aplicar todas as alterações, teste inserindo um documento para professor:

```sql
-- Exemplo de inserção (substitua 'uuid-do-professor' por um ID real)
INSERT INTO public.documentos (
  professor_id,
  tipo,
  data,
  status,
  arquivo_link
) VALUES (
  'uuid-do-professor-existente',
  'certificado_professor',
  CURRENT_DATE,
  'gerado',
  'https://exemplo.com/certificado.pdf'
);
```

## Possíveis Problemas e Soluções

### Erro: "type already exists"
Se algum tipo já existir, ignore o erro e continue com os próximos comandos.

### Erro: "column already exists"
Se a coluna já existir, ignore o erro e continue.

### Erro: "constraint already exists"
Se a constraint já existir, ignore o erro e continue.

## Rollback (Desfazer Alterações)

Caso precise desfazer as alterações:

```sql
-- Remover constraint
ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS check_documento_pessoa;

-- Remover índice
DROP INDEX IF EXISTS idx_documentos_professor_id;

-- Remover coluna
ALTER TABLE public.documentos DROP COLUMN IF EXISTS professor_id;

-- Restaurar NOT NULL em aluno_id
ALTER TABLE public.documentos ALTER COLUMN aluno_id SET NOT NULL;
```

**Nota:** Não é possível remover valores de ENUM facilmente. Se precisar, será necessário recriar o tipo.

## Conclusão

Após executar todos os passos, o sistema estará preparado para:
- Criar documentos para professores
- Manter documentos existentes de alunos
- Garantir integridade referencial
- Funcionar com a interface web atualizada

Em caso de dúvidas, consulte a documentação do PostgreSQL ou entre em contato com o administrador do sistema.