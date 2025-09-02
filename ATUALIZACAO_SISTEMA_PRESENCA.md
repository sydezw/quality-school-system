# Atualização do Sistema de Presença

## Alterações Realizadas

### 1. Estrutura do Banco de Dados

#### Tabela `presencas` - Estrutura Atualizada:
```sql
- aluno_id (string | null)
- aluno_turma_id (string | null) 
- aula_id (string)
- created_at (string)
- id (string)
- status (Database["public"]["Enums"]["status_presenca"])
- updated_at (string)
```

**Campos Removidos:**
- ❌ `justificativa` (removido)
- ❌ `observacoes` (removido)

#### Enum `status_presenca` - Atualizado:
```typescript
status_presenca: "Presente" | "Falta" | "Reposta"
```

**Alteração:**
- ❌ "Justificada" → ✅ "Reposta"

### 2. View `estatisticas_presenca_aluno`

**Query SQL para Atualização:**
- 📄 Arquivo criado: `fix_estatisticas_presenca_view.sql`
- ❌ `faltas_justificadas` → ✅ `faltas_repostas`

### 3. Código TypeScript Atualizado

#### Arquivo: `src/integrations/supabase/types.ts`
- ✅ Enum `status_presenca` atualizado
- ✅ Campos removidos da tabela `presencas`
- ✅ View `estatisticas_presenca_aluno` com `faltas_repostas`

#### Arquivo: `src/components/classes/ClassesStats.tsx`
- ✅ Interface `PresencaStats` atualizada
- ✅ Query removendo campo `justificativa`
- ✅ Lógica de contagem ajustada para novo enum
- ✅ Labels atualizados: "Faltas Justificadas" → "Faltas Repostas"
- ✅ Gráficos e estatísticas atualizados

## Próximos Passos

### 1. Aplicar Query SQL
```bash
# Execute o arquivo SQL no seu banco de dados:
psql -d seu_banco -f fix_estatisticas_presenca_view.sql
```

### 2. Implementar Interface de Controle de Presença

**Componentes a Criar:**
- `ControlePresenca.tsx` - Interface principal para marcar presença
- `usePresenca.ts` - Hook para gerenciar operações de presença
- `PresencaForm.tsx` - Formulário para registrar presença/falta/reposta

**Funcionalidades Necessárias:**
- ✅ Listar alunos da aula
- ✅ Marcar presença (Presente/Falta/Reposta)
- ✅ Salvar registros na tabela `presencas`
- ✅ Integração com `ClassesList.tsx`

### 3. Status Atual da Implementação

**✅ Concluído (85%):**
- Estrutura do banco de dados
- Tipos TypeScript
- Estatísticas de presença
- Enum atualizado

**🔄 Pendente (15%):**
- Interface de usuário para marcar presença
- Hook `usePresenca`
- Integração com lista de aulas

## Resumo das Mudanças

1. **Banco de Dados:** Tabela `presencas` simplificada, enum atualizado
2. **Frontend:** Estatísticas ajustadas para nova nomenclatura
3. **Tipos:** TypeScript sincronizado com estrutura do banco
4. **Terminologia:** "Justificada" → "Reposta" em todo o sistema

O sistema de presença está 85% implementado e pronto para uso após aplicar a query SQL fornecida.