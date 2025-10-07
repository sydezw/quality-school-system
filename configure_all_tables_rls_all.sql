-- ATENÇÃO: ANÁLISE DE SEGURANÇA NECESSÁRIA
-- Este script configura TODAS as tabelas com nível de segurança 'ALL'
-- Isso pode não ser adequado para um sistema de produção

-- ANÁLISE DA SITUAÇÃO ATUAL:
-- 1. A tabela 'usuarios' já tem política 'ALL' (correto para autenticação)
-- 2. A tabela 'financeiro_alunos' tem políticas específicas:
--    - Admins podem fazer tudo
--    - Alunos só podem ver seus próprios dados
-- 3. Outras tabelas também podem ter regras de negócio específicas

-- RECOMENDAÇÃO:
-- Configurar TODAS as tabelas com 'ALL' pode ser um RISCO DE SEGURANÇA
-- porque remove controles de acesso baseados em função/cargo

-- Se você REALMENTE quer prosseguir, descomente as linhas abaixo:

/*
-- Tabelas que ainda não têm RLS habilitado
ALTER TABLE aluno_turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas_particulares ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas_migracao_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que são restritivas
DROP POLICY IF EXISTS "Administradores podem fazer tudo em financeiro_alunos" ON financeiro_alunos;
DROP POLICY IF EXISTS "Admins podem visualizar financeiro_alunos" ON financeiro_alunos;
DROP POLICY IF EXISTS "Alunos podem ver seus próprios dados financeiros" ON financeiro_alunos;
DROP POLICY IF EXISTS "Permitir acesso total para usuários autenticados" ON alunos;

-- Criar políticas 'ALL' para todas as tabelas
CREATE POLICY "Allow all operations for authenticated users" ON agenda FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON aluno_turma FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON aulas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON aulas_particulares FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON avaliacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON avaliacoes_competencia FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON configuracoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON contratos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON documentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON documentos_contratos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON financeiro_alunos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON folha_pagamento FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON historico_pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON historico_parcelas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON materiais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON materiais_entregues FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON parcelas_alunos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON parcelas_migracao_raw FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON pesquisas_satisfacao FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON planos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON planos_aula FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON presencas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON ranking FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON recibos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON responsaveis FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON salas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON turmas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated users" ON usuarios_pendentes FOR ALL TO authenticated USING (true) WITH CHECK (true);
*/

-- VERIFICAÇÃO FINAL
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS Habilitado'
        ELSE 'RLS Desabilitado'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- IMPORTANTE:
-- Este script está comentado por questões de segurança.
-- Remover controles de acesso pode expor dados sensíveis.
-- Considere manter políticas específicas para tabelas financeiras e de usuários.