# Remoção das Funções hard_delete

## Situação Atual

As funções `hard_delete_aluno` e `hard_delete_professor` são funções obsoletas do sistema antigo de exclusão física que precisam ser removidas do banco de dados online do Supabase.

### Estado do Banco de Dados

- **Arquivo de dump local**: A função `hard_delete_aluno` já foi removida, mas `hard_delete_professor` ainda existe
- **Banco online (Supabase)**: Ambas as funções ainda podem existir e precisam ser removidas
- **Sistema atual**: Utiliza `ON DELETE CASCADE` nas constraints das tabelas relacionadas

## Arquivos Criados

### 1. `verify_hard_delete_function.sql`
**Propósito**: Verificar se as funções `hard_delete_aluno` e `hard_delete_professor` existem no banco online

**Como usar**:
1. Execute no SQL Editor do Supabase
2. Verifique se as funções existem antes de tentar removê-las

### 2. `remove_hard_delete_aluno_function.sql`
**Propósito**: Remover a função `hard_delete_aluno` e suas permissões

**Como usar**:
1. Execute apenas APÓS confirmar que a função existe
2. Remove as permissões (ACL) primeiro
3. Remove a função em si
4. Inclui query de verificação final

### 3. `remove_hard_delete_professor_function.sql`
**Propósito**: Remover a função `hard_delete_professor` e suas permissões

**Como usar**:
1. Execute apenas APÓS confirmar que a função existe
2. Remove as permissões (ACL) primeiro
3. Remove a função em si
4. Inclui query de verificação final

## Passos para Execução

### Passo 1: Verificação
```sql
-- Execute verify_hard_delete_function.sql no Supabase
```

### Passo 2: Remoção das funções (se existirem)
```sql
-- Execute remove_hard_delete_aluno_function.sql no Supabase (se a função existir)
-- Execute remove_hard_delete_professor_function.sql no Supabase (se a função existir)
```

### Passo 3: Confirmação
```sql
-- Execute novamente a query de verificação para confirmar remoção
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name IN ('hard_delete_aluno', 'hard_delete_professor');
-- Deve retornar 0 linhas
```

## Considerações Importantes

- ⚠️ **Backup**: Faça backup antes de executar
- ✅ **Segurança**: A remoção é segura pois as funções não são mais utilizadas
- 🔄 **Sistema atual**: O frontend usa exclusão com `ON DELETE CASCADE`
- 📝 **Irreversível**: A remoção das funções é permanente

## Benefícios da Remoção

1. **Limpeza do código**: Remove funções obsoletas
2. **Consistência**: Alinha banco online com o sistema atual
3. **Manutenção**: Reduz complexidade do banco
4. **Segurança**: Remove funções não utilizadas

## Próximos Passos

Após a remoção das funções `hard_delete_aluno` e `hard_delete_professor`, você poderá prosseguir com a remoção da tabela `parcelas` conforme planejado.