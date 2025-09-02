# Investigação de Parcelas Perdidas - Guia Completo

## Situação Identificada

- **Tabela `parcelas_migracao_raw`**: 5.966 registros (dados originais da planilha Excel)
- **Tabela `parcelas_alunos`**: 4.044 registros (dados atuais do sistema)
- **Diferença**: ~1.922 parcelas perdidas
- **Período**: Diferença de aproximadamente 1 mês

## Possíveis Causas Identificadas

### 1. **Processo "Tornar Ativo" (Mais Provável)**
A função `moverParcelasParaHistorico` no `TornarAtivoModal.tsx` move parcelas existentes para `historico_parcelas` antes de criar novas parcelas. Este processo pode ter:
- Movido parcelas da migração original para o histórico
- Criado novas parcelas com base nos novos dados do formulário
- Resultado: Parcelas "perdidas" da tabela ativa, mas preservadas no histórico

### 2. **Exclusão Manual via Interface**
Funções de exclusão em `ParcelasTable.tsx` e `useParcelas.ts`

### 3. **Processo Manual "Mover para Histórico"**
Modal específico para arquivamento de parcelas

## Scripts de Investigação Criados

### 📋 Script 1: `investigar_parcelas_perdidas.sql`
**Objetivo**: Análise geral das diferenças entre tabelas

**Executa**:
- Contagem de registros em todas as tabelas
- Análise de campos e estruturas
- Distribuição temporal das parcelas
- Verificação de campos de auditoria
- Diagnóstico inicial

### 🔍 Script 2: `comparar_dados_migracao.sql`
**Objetivo**: Comparação específica entre dados da migração e dados atuais

**Executa**:
- Identificação de parcelas específicas perdidas
- Verificação se parcelas estão no histórico
- Análise por período de vencimento
- Identificação de alunos afetados
- Diagnóstico detalhado

### 🎯 Script 3: `investigar_processo_tornar_ativo.sql`
**Objetivo**: Foco no processo "Tornar Ativo" como causa principal

**Executa**:
- Análise de ativações recentes
- Correlação entre ativações e arquivamentos
- Identificação de parcelas migradas movidas para histórico
- Padrões de operações em lote
- Diagnóstico específico do processo TornarAtivo

## Como Executar a Investigação

### Passo 1: Executar Script Inicial
```sql
-- Execute no Supabase SQL Editor:
-- Arquivo: investigar_parcelas_perdidas.sql
```

**O que observar**:
- Contagem total de registros
- Distribuição por mês
- Diagnóstico inicial na query final

### Passo 2: Análise Detalhada
```sql
-- Execute no Supabase SQL Editor:
-- Arquivo: comparar_dados_migracao.sql
```

**O que observar**:
- Lista de parcelas não encontradas
- Status: "Encontrada no histórico" vs "Não encontrada"
- Resumo final com diagnóstico

### Passo 3: Investigação do TornarAtivo
```sql
-- Execute no Supabase SQL Editor:
-- Arquivo: investigar_processo_tornar_ativo.sql
```

**O que observar**:
- Ativações nos últimos 60 dias
- Correlação temporal entre ativações e arquivamentos
- Parcelas da migração movidas para histórico
- Diagnóstico final do processo TornarAtivo

## Interpretação dos Resultados

### ✅ **Cenário Ideal (Parcelas Preservadas)**
- Diagnóstico: "TODAS AS PARCELAS ESTÃO CONTABILIZADAS"
- Significado: Parcelas estão no histórico, não foram perdidas
- Ação: Nenhuma, sistema funcionando corretamente

### ⚠️ **Cenário Provável (Processo TornarAtivo)**
- Diagnóstico: "MAIORIA MOVIDA PARA HISTÓRICO"
- Significado: Processo de ativação moveu parcelas para histórico
- Ação: Verificar se o comportamento é desejado

### 🚨 **Cenário Crítico (Perda Real)**
- Diagnóstico: "PERDA SIGNIFICATIVA" ou "Parcelas realmente perdidas"
- Significado: Parcelas foram deletadas permanentemente
- Ação: Investigação urgente e possível recuperação

## Queries de Verificação Rápida

### Verificar Total de Parcelas Contabilizadas
```sql
SELECT 
    (SELECT COUNT(*) FROM parcelas_migracao_raw) as migracao_original,
    (SELECT COUNT(*) FROM parcelas_alunos) as parcelas_atuais,
    (SELECT COUNT(*) FROM historico_parcelas) as parcelas_historico,
    ((SELECT COUNT(*) FROM parcelas_alunos) + (SELECT COUNT(*) FROM historico_parcelas)) as total_contabilizado;
```

### Verificar Ativações Recentes
```sql
SELECT 
    COUNT(*) as ativacoes_ultimos_30_dias
FROM financeiro_alunos 
WHERE updated_at > (CURRENT_DATE - INTERVAL '30 days')
    AND ativo_ou_encerrado = 'ativo';
```

### Verificar Arquivamentos Recentes
```sql
SELECT 
    COUNT(*) as parcelas_arquivadas_ultimos_30_dias,
    COUNT(DISTINCT aluno_nome) as alunos_afetados
FROM historico_parcelas
WHERE criado_em > (CURRENT_DATE - INTERVAL '30 days');
```

## Ações Recomendadas Baseadas nos Resultados

### Se as Parcelas Estão no Histórico:
1. **Verificar se o comportamento é desejado**
2. **Documentar o processo de ativação**
3. **Considerar melhorias na interface para mostrar histórico**
4. **Implementar confirmações adicionais no processo TornarAtivo**

### Se as Parcelas Foram Realmente Perdidas:
1. **URGENTE**: Parar uso do sistema até investigação completa
2. **Verificar logs do Supabase** (se disponíveis)
3. **Implementar backup automático** antes de operações críticas
4. **Revisar permissões de exclusão**
5. **Considerar recuperação dos dados da `parcelas_migracao_raw`**

## Prevenção de Futuras Perdas

### 1. **Melhorias no Processo TornarAtivo**
```typescript
// Adicionar confirmação extra
const confirmarMovimentacao = async () => {
  const confirmacao = window.confirm(
    `Isso irá mover ${parcelasExistentes.length} parcelas para o histórico. Confirma?`
  );
  if (!confirmacao) return;
  // ... resto do processo
};
```

### 2. **Logs de Auditoria**
- Implementar tabela de logs para operações críticas
- Registrar quem, quando e quantas parcelas foram movidas

### 3. **Backup Automático**
- Backup antes de operações de ativação
- Retenção de dados por período determinado

### 4. **Validações Adicionais**
- Verificar se aluno já tem parcelas antes de mover
- Limitar operações em lote
- Implementar "soft delete" em vez de exclusão direta

## Contato para Suporte

Se os resultados indicarem perda real de dados:
1. **Documente todos os resultados dos scripts**
2. **Não execute mais operações de ativação**
3. **Considere restaurar dados da `parcelas_migracao_raw`** se necessário
4. **Implemente as melhorias de prevenção** antes de retomar operações normais

---

**⚠️ IMPORTANTE**: Execute os scripts em ordem e analise cada resultado antes de prosseguir. A investigação completa pode revelar se as parcelas estão preservadas no histórico ou se foram realmente perdidas.