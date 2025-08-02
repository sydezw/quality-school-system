-- SOLUÇÃO PARA ERRO 55P04: unsafe use of new value "particular" of enum type idioma
-- Execute estes comandos UM POR VEZ, em sessões separadas do SQL Editor

-- =============================================
-- PASSO 1: EXECUTE APENAS ESTE COMANDO PRIMEIRO
-- =============================================
-- Abra uma nova aba/sessão no SQL Editor do Supabase
-- Execute APENAS esta linha:

ALTER TYPE public.idioma ADD VALUE 'particular';

-- =============================================
-- AGUARDE E FECHE A SESSÃO
-- =============================================
-- 1. Aguarde 5-10 segundos após executar o comando acima
-- 2. FECHE completamente a aba/sessão do SQL Editor
-- 3. Abra uma NOVA sessão/aba do SQL Editor

-- =============================================
-- PASSO 2: EM UMA NOVA SESSÃO, EXECUTE ESTA VERIFICAÇÃO
-- =============================================
-- Abra uma nova aba do SQL Editor e execute:

SELECT unnest(enum_range(NULL::public.idioma)) AS valores_idioma;

-- Você deve ver: Inglês, Japonês, Inglês/Japonês, particular

-- =============================================
-- PASSO 3: TESTE CRIAÇÃO DE PLANO (OPCIONAL)
-- =============================================
-- Se a verificação acima mostrou 'particular', teste criar um plano:

INSERT INTO planos (
    nome,
    descricao,
    numero_aulas,
    frequencia_aulas,
    valor_total,
    idioma,
    ativo,
    permite_cancelamento,
    permite_parcelamento
) VALUES (
    'Aulas Particulares Premium',
    'Plano personalizado para aulas particulares individuais',
    10,
    'flexível',
    800.00,
    'particular',
    true,
    true,
    true
);

-- =============================================
-- EXPLICAÇÃO DO PROBLEMA
-- =============================================
/*
O erro 55P04 ocorre porque o PostgreSQL requer que:
1. Novos valores de enum sejam adicionados em uma transação
2. A transação seja COMMITADA
3. Uma NOVA sessão seja iniciada para usar o novo valor

Por isso é essencial:
- Executar o ALTER TYPE sozinho
- Fechar a sessão atual
- Abrir uma nova sessão para usar o valor
*/

-- =============================================
-- ALTERNATIVA: SCRIPT COMPLETO COM TRANSAÇÕES
-- =============================================
/*
Se preferir, execute este bloco completo em uma única sessão:

BEGIN;
  ALTER TYPE public.idioma ADD VALUE 'particular';
COMMIT;

-- Aguarde alguns segundos, então execute:

SELECT unnest(enum_range(NULL::public.idioma)) AS valores_idioma;
*/