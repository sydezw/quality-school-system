-- Script para atualizar o enum idioma na tabela planos
-- Adiciona 'particular' como opção válida junto com 'Inglês' e 'Japonês'
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- VERIFICAR ESTADO ATUAL DO ENUM
-- ========================================

-- Verificar valores atuais do enum idioma
SELECT unnest(enum_range(NULL::public.idioma)) AS valores_atuais;

-- Verificar planos existentes e seus idiomas
SELECT idioma, COUNT(*) as quantidade
FROM planos 
GROUP BY idioma
ORDER BY idioma;

-- ========================================
-- ATUALIZAR ENUM IDIOMA
-- ========================================

-- Adicionar 'particular' ao enum idioma
-- Nota: Esta operação deve ser executada em uma transação separada
-- Execute este comando isoladamente:

BEGIN;
ALTER TYPE public.idioma ADD VALUE IF NOT EXISTS 'particular';
COMMIT;

-- Aguarde alguns segundos antes de executar os próximos comandos

-- ========================================
-- VERIFICAR ALTERAÇÕES
-- ========================================

-- Verificar se 'particular' foi adicionado com sucesso
SELECT unnest(enum_range(NULL::public.idioma)) AS valores_atualizados;

-- ========================================
-- COMENTÁRIOS E INSTRUÇÕES
-- ========================================

/*
Após executar este script, os valores válidos para a coluna idioma na tabela planos serão:
- 'Inglês'
- 'Japonês' 
- 'Inglês/Japonês'
- 'particular'

Este script:
1. Verifica o estado atual do enum
2. Adiciona 'particular' como novo valor
3. Confirma que a alteração foi aplicada

Nota importante:
- A operação ADD VALUE em enums PostgreSQL é irreversível
- Se 'particular' já existir, o comando será ignorado (IF NOT EXISTS)
- Não é possível remover valores de enum facilmente - seria necessário recriar o tipo

Para testar a funcionalidade:
1. Execute este script
2. Verifique se 'particular' aparece nos valores do enum
3. Teste criar/editar um plano com idioma 'particular'
*/

-- ========================================
-- EXEMPLO DE USO
-- ========================================

/*
-- Exemplo de como criar um plano com idioma 'particular'
INSERT INTO planos (
    nome,
    descricao,
    numero_aulas,
    frequencia_aulas,
    valor_total,
    idioma,
    ativo
) VALUES (
    'Aulas Particulares Premium',
    'Plano personalizado para aulas particulares',
    10,
    'flexível',
    800.00,
    'particular',
    true
);

-- Exemplo de como atualizar um plano existente para 'particular'
UPDATE planos 
SET idioma = 'particular'
WHERE nome = 'Nome do Plano Específico';
*/