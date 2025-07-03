-- Migração temporária para desabilitar RLS em planos durante desenvolvimento
-- ATENÇÃO: Esta é uma solução temporária apenas para desenvolvimento
-- Em produção, deve-se implementar autenticação adequada

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem visualizar planos se tiverem permissão" ON public.planos;
DROP POLICY IF EXISTS "Usuários podem inserir planos se tiverem permissão" ON public.planos;
DROP POLICY IF EXISTS "Usuários podem atualizar planos se tiverem permissão" ON public.planos;
DROP POLICY IF EXISTS "Usuários podem deletar planos se tiverem permissão" ON public.planos;

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE public.planos DISABLE ROW LEVEL SECURITY;

-- Comentário: Para reabilitar RLS em produção, execute:
-- ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
-- E recrie as políticas adequadas baseadas em autenticação real