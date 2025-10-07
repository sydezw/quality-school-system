-- Configurar Row Level Security (RLS) para tabela alunos_financeiro
-- Nível de segurança: ALL (acesso total para todos os usuários autenticados)

-- Habilitar RLS na tabela alunos_financeiro
ALTER TABLE alunos_financeiro ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva para permitir acesso total (SELECT, INSERT, UPDATE, DELETE)
-- para todos os usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON alunos_financeiro
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Verificar se o RLS foi habilitado corretamente
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'alunos_financeiro';

-- Verificar as políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'alunos_financeiro';

-- Comentários:
-- Esta configuração permite acesso total à tabela alunos_financeiro para todos os usuários autenticados
-- O nível 'ALL' significa que não há restrições baseadas em linha para esta tabela
-- A política criada usa USING (true) e WITH CHECK (true) para permitir todas as operações