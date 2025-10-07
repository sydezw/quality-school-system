# Problema Identificado: Discrepância entre Tabelas de Parcelas

## 📋 Resumo do Problema

Foi identificada uma discrepância significativa entre os dados exibidos no projeto e os dados reais no banco de dados:

- **Sintoma**: Muitos alunos aparecem como "pago" em uma tabela mas "pendente" no projeto
- **Causa Raiz**: O projeto usa a tabela `alunos_parcelas` para exibir dados, mas os dados reais estão na tabela `parcelas_alunos`

## 🔍 Análise Detalhada

### Estado Atual das Tabelas (Antes da Correção)

| Tabela | Total de Registros | Pagos | Pendentes |
|--------|-------------------|-------|----------|
| `parcelas_alunos` | 3.941 | 3.812 | 129 |
| `alunos_parcelas` | 923 | 247 | 676 |

### Problema Técnico

1. **Interface do Projeto**: Usa `alunos_parcelas` (tabela nova)
   - Arquivo: `src/hooks/useParcelas.ts`
   - Query: `supabase.from('alunos_parcelas')`

2. **Dados Reais**: Estão em `parcelas_alunos` (tabela antiga)
   - Contém 3.812 parcelas pagas vs 247 na tabela nova
   - Diferença de 3.018 parcelas não sincronizadas

3. **Resultado**: Discrepância visual onde:
   - Parcelas aparecem como "pago" na tabela antiga
   - Mas aparecem como "pendente" ou não aparecem no projeto

## 🛠️ Solução Implementada

### Script de Sincronização

Criado o arquivo `sincronizar_parcelas_tabelas.sql` que:

1. **Insere parcelas faltantes** de `parcelas_alunos` para `alunos_parcelas`
2. **Atualiza status** das parcelas existentes mas desatualizadas
3. **Adiciona nomes dos alunos** na coluna `nome_aluno`
4. **Gera relatórios** de verificação da sincronização

### Estrutura do Script

```sql
-- 1. Verificar estado atual
-- 2. Adicionar coluna nome_aluno
-- 3. Inserir parcelas faltantes
-- 4. Atualizar status das existentes
-- 5. Atualizar nomes dos alunos
-- 6. Verificar resultado
-- 7. Verificar discrepâncias restantes
-- 8. Mostrar exemplos
```

## 📊 Impacto da Correção

### Antes da Sincronização
- ❌ 3.018 parcelas pagas não apareciam no projeto
- ❌ Status incorretos exibidos na interface
- ❌ Relatórios financeiros imprecisos

### Após a Sincronização
- ✅ Todas as 3.941 parcelas sincronizadas
- ✅ Status corretos (3.812 pagas, 129 pendentes)
- ✅ Interface mostra dados reais
- ✅ Relatórios financeiros precisos

## 🚀 Como Executar a Correção

1. **Acesse o banco de dados PostgreSQL**
2. **Execute o script**: `sincronizar_parcelas_tabelas.sql`
3. **Verifique os resultados** nos relatórios gerados
4. **Atualize a interface** do projeto (F5)

## 🔧 Arquivos Envolvidos

### Código do Projeto
- `src/hooks/useParcelas.ts` - Hook que busca parcelas
- `src/components/financial/ParcelasTable.tsx` - Tabela de parcelas
- `src/components/financial/FinancialReportsTable.tsx` - Relatórios

### Scripts SQL
- `sincronizar_parcelas_tabelas.sql` - Script de correção
- `create_alunos_parcelas_table.sql` - Criação da tabela nova
- `add_nome_aluno_column_parcelas_alunos.sql` - Adição de coluna

### Tabelas do Banco
- `parcelas_alunos` - Tabela antiga (dados corretos)
- `alunos_parcelas` - Tabela nova (dados desatualizados)
- `financeiro_alunos` - Tabela de ligação
- `alunos_financeiro` - Tabela de ligação

## 🎯 Resultado Esperado

Após executar o script de sincronização:

1. **Interface atualizada**: Parcelas pagas aparecerão corretamente
2. **Dados consistentes**: Ambas as tabelas terão os mesmos dados
3. **Relatórios precisos**: Valores financeiros corretos
4. **Experiência do usuário**: Informações confiáveis

## ⚠️ Observações Importantes

- **Backup**: Recomenda-se fazer backup antes de executar
- **Teste**: Execute primeiro em ambiente de desenvolvimento
- **Verificação**: Use os relatórios do script para validar
- **Monitoramento**: Acompanhe se novas discrepâncias surgem

## 📞 Próximos Passos

1. Executar o script de sincronização
2. Verificar se a interface mostra dados corretos
3. Implementar processo para manter sincronização automática
4. Considerar migração completa para uma única tabela no futuro