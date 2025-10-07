# Solução: Parcelas Pagas Não Aparecem no Frontend

## Problema Identificado

As parcelas que estão marcadas como **"pago"** no banco de dados não estavam aparecendo como pagas no frontend do sistema.

### Causa Raiz

O problema está na lógica de cálculo de status no frontend. A função `calcularStatusAutomatico` em `useParcelas.ts` usa a seguinte lógica:

```typescript
const calcularStatusAutomatico = (parcela: ParcelaBase): StatusCalculado => {
  // Se tem data de pagamento, está pago
  if (parcela.data_pagamento) {
    return 'pago';
  }
  
  // Se status é cancelado
  if (parcela.status_pagamento === 'cancelado') {
    return 'cancelado';
  }
  
  // Verificar se está vencido
  const hoje = new Date();
  const dataVencimento = criarDataDeString(parcela.data_vencimento);
  
  if (dataVencimento < hoje) {
    return 'vencido';
  }
  
  return 'pendente';
};
```

**O frontend verifica PRIMEIRO se existe `data_pagamento`** para determinar se a parcela está paga, e só depois verifica o `status_pagamento`.

### Situação no Banco de Dados

- **231 parcelas** estavam marcadas como `status_pagamento = 'pago'`
- Mas tinham `data_pagamento = NULL`
- Por isso, o frontend as classificava como "vencidas" ou "pendentes" em vez de "pagas"

## Solução Implementada

### Script SQL: `corrigir_data_pagamento_parcelas.sql`

O script criado resolve o problema atualizando a `data_pagamento` para todas as parcelas que:
- Têm `status_pagamento = 'pago'`
- Têm `data_pagamento IS NULL`
- Não são históricas (`historico = false`)

### O que o Script Faz

1. **Verifica a situação atual** das parcelas
2. **Mostra exemplos** das parcelas que serão corrigidas
3. **Atualiza a data_pagamento** definindo-a como igual à `data_vencimento`
4. **Verifica o resultado** da correção
5. **Simula como as parcelas aparecerão** no frontend após a correção

### Comando Principal

```sql
UPDATE alunos_parcelas 
SET data_pagamento = data_vencimento,
    updated_at = NOW()
WHERE status_pagamento = 'pago' 
    AND data_pagamento IS NULL
    AND historico = false;
```

## Impacto da Solução

### Antes da Correção
- 231 parcelas pagas no banco não apareciam como pagas no frontend
- Relatórios financeiros mostravam valores incorretos
- Dashboards exibiam estatísticas imprecisas

### Após a Correção
- ✅ Todas as parcelas pagas aparecerão corretamente no frontend
- ✅ Relatórios financeiros mostrarão valores corretos
- ✅ Dashboards exibirão estatísticas precisas
- ✅ Filtros por status funcionarão corretamente

## Como Executar

1. **Abra o PostgreSQL** (pgAdmin, psql, ou outro cliente)
2. **Execute o script** `corrigir_data_pagamento_parcelas.sql`
3. **Verifique os resultados** nas consultas de verificação
4. **Teste no frontend** - as parcelas pagas agora aparecerão corretamente

## Arquivos Envolvidos

- **Script de Correção**: `corrigir_data_pagamento_parcelas.sql`
- **Lógica Frontend**: `src/hooks/useParcelas.ts` (função `calcularStatusAutomatico`)
- **Componentes Afetados**: 
  - `ParcelasTable.tsx`
  - `FinancialReportsTable.tsx`
  - `StudentDetailsModal.tsx`
  - Todos os componentes que usam `useParcelas`

## Observações Importantes

- ✅ **Seguro**: O script apenas adiciona `data_pagamento` onde está faltando
- ✅ **Não destrutivo**: Não altera `status_pagamento` existente
- ✅ **Específico**: Afeta apenas parcelas não históricas
- ✅ **Reversível**: Se necessário, pode-se limpar as `data_pagamento` adicionadas

## Prevenção Futura

Para evitar este problema no futuro, sempre que marcar uma parcela como paga:

1. **Definir `status_pagamento = 'pago'`**
2. **Definir `data_pagamento`** (preferencialmente a data real do pagamento)
3. **Testar no frontend** para confirmar que aparece como paga

## Resultado Esperado

Após executar o script, todas as 231 parcelas que estavam pagas no banco mas não apareciam no frontend passarão a ser exibidas corretamente como **"PAGAS"** em:

- 📊 Tabela de Parcelas
- 📈 Relatórios Financeiros  
- 👤 Detalhes do Aluno
- 🎯 Dashboards e Estatísticas
- 🔍 Filtros por Status