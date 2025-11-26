# Solução para Problema de Exclusão de Alunos

## Problema Identificado

O erro "Não é possível excluir este aluno pois existem registros relacionados" ocorre devido a constraints de chave estrangeira no banco de dados que não possuem a configuração `ON DELETE CASCADE`.

## Causa Raiz

Quando um aluno possui registros relacionados em outras tabelas (como presenças, avaliações, contratos, etc.), o PostgreSQL impede a exclusão para manter a integridade referencial. Isso acontece porque as constraints de chave estrangeira foram criadas sem a opção `CASCADE`.

## Solução

### 1. Aplicar a Migração de Correção

Foi criada uma nova migração (`20250120000000-fix-all-alunos-cascade.sql`) que corrige todas as constraints de chave estrangeira relacionadas à tabela `alunos`.

**Para aplicar a migração:**

```bash
# Se estiver usando Supabase localmente
npx supabase db reset

# Ou se estiver em produção
npx supabase db push
```

### 2. Tabelas Afetadas pela Correção

A migração corrige as seguintes tabelas:

- `presencas` - Registros de presença dos alunos
- `avaliacoes` - Avaliações dos alunos
- `parcelas` - Parcelas de pagamento
- `recibos` - Recibos de pagamento
- `notificacoes` - Notificações enviadas
- `documentos` - Documentos gerados
- `avaliacoes_competencia` - Avaliações por competência
- `pesquisas_satisfacao` - Pesquisas de satisfação
- `ranking` - Sistema de ranking
- `materiais_entregues` - Materiais entregues aos alunos
- `contratos` - Contratos (já corrigido em migração anterior)
- `boletos` - Boletos (já corrigido em migração anterior)

### 3. O que a Correção Faz

Após aplicar a migração:

- ✅ Será possível excluir alunos mesmo com registros relacionados
- ✅ Todos os registros relacionados serão automaticamente removidos (CASCADE)
- ✅ A integridade dos dados será mantida
- ✅ Não haverá mais o erro de constraint de chave estrangeira

### 4. Verificação

Após aplicar a migração, teste:

1. Acesse a aba de Alunos
2. Tente excluir um aluno que possui registros relacionados
3. A exclusão deve funcionar normalmente

## Prevenção

Para evitar problemas similares no futuro:

1. **Sempre use `ON DELETE CASCADE`** ao criar constraints de chave estrangeira para entidades que devem ser excluídas em conjunto
2. **Teste a exclusão** durante o desenvolvimento
3. **Documente as relações** entre tabelas

## Contato

Se o problema persistir após aplicar a migração, verifique:

1. Se a migração foi aplicada corretamente
2. Se não há erros no console do navegador
3. Se o banco de dados está atualizado

Em caso de dúvidas, entre em contato com o administrador do sistema.