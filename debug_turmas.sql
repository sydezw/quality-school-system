-- Script para debugar problemas com turmas no modal
-- Execute este script no Supabase SQL Editor para verificar os dados

-- 1. Verificar se existem turmas na tabela
SELECT 
    COUNT(*) as total_turmas,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as turmas_ativas,
    COUNT(CASE WHEN status != 'ativo' OR status IS NULL THEN 1 END) as turmas_inativas
FROM turmas;

-- 2. Verificar estrutura da tabela turmas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'turmas' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar algumas turmas de exemplo
SELECT 
    id,
    nome,
    idioma,
    nivel,
    dias_da_semana,
    horario,
    professor_id,
    status,
    created_at
FROM turmas 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verificar se há professores associados às turmas
SELECT 
    t.id,
    t.nome as turma_nome,
    t.professor_id,
    p.nome as professor_nome,
    t.status
FROM turmas t
LEFT JOIN professores p ON t.professor_id = p.id
WHERE t.status = 'ativo'
ORDER BY t.nome
LIMIT 10;

-- 5. Verificar valores únicos da coluna status
SELECT 
    status,
    COUNT(*) as quantidade
FROM turmas 
GROUP BY status
ORDER BY quantidade DESC;

-- 6. Simular a query exata do frontend
SELECT 
    t.id, 
    t.nome, 
    t.idioma, 
    t.nivel, 
    t.dias_da_semana, 
    t.horario, 
    t.professor_id,
    p.id as professor_id_join,
    p.nome as professor_nome
FROM turmas t
LEFT JOIN professores p ON t.professor_id = p.id
WHERE t.status = 'ativo'
ORDER BY t.nome;