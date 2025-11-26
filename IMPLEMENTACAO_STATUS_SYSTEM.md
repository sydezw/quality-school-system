# Implementação do Sistema de Status (Soft Delete)

## 📋 Resumo das Mudanças

Este documento descreve a implementação completa do sistema de status para substituir exclusões físicas por exclusões lógicas (soft delete) no sistema escolar.

## 🗄️ Mudanças no Banco de Dados

### 1. Migração SQL
**Arquivo:** `supabase/migrations/20250125000000-implement-status-system.sql`

**⚠️ IMPORTANTE: Execute esta migração no SQL Editor do Supabase**

A migração inclui:
- ✅ Adição de campos de status em todas as tabelas principais
- ✅ Remoção de todas as configurações `ON DELETE CASCADE`
- ✅ Implementação de `ON DELETE RESTRICT` para preservar dados
- ✅ Configuração de `ON DELETE SET NULL` onde apropriado
- ✅ Criação de índices para performance
- ✅ Documentação das mudanças

### 2. Campos de Status Adicionados

| Tabela | Campo Status | Valores Possíveis |
|--------|--------------|-------------------|
| `alunos` | `status` | Ativo, Trancado, Cancelado |
| `professores` | `status` | ativo, inativo, demitido |
| `responsaveis` | `status` | ativo, inativo |
| `salas` | `status` | ativa, inativa, manutencao |
| `usuarios` | `status` | ativo, inativo, suspenso |
| `materiais` | `status` | disponivel, indisponivel |

## 🔧 Mudanças no Frontend

### 1. Hook useStudents
**Arquivo:** `src/hooks/useStudents.tsx`

**Mudanças:**
- ✅ `deleteStudent` → `archiveStudent`
- ✅ Nova função `restoreStudent`
- ✅ `fetchStudents` agora aceita parâmetro `includeInactive`
- ✅ Por padrão, mostra apenas alunos ativos

### 2. Componente de Diálogo
**Arquivo:** `src/components/students/DeleteStudentDialog.tsx`

**Mudanças:**
- ✅ `DeleteStudentDialog` → `ArchiveStudentDialog`
- ✅ Suporte para ações de "arquivar" e "restaurar"
- ✅ Interface adaptada com ícones e cores apropriadas
- ✅ Mantém compatibilidade com nome antigo

### 3. Tabela de Alunos
**Arquivo:** `src/components/students/StudentTable.tsx`

**Mudanças:**
- ✅ Botão de exclusão → Botão de arquivar/restaurar
- ✅ Ícones condicionais baseados no status do aluno
- ✅ Cores diferenciadas (laranja para arquivar, verde para restaurar)
- ✅ Tooltips informativos

### 4. Página Principal
**Arquivo:** `src/pages/app/Students.tsx`

**Mudanças:**
- ✅ Toggle para mostrar/ocultar alunos inativos
- ✅ Contador atualizado com indicação de filtros
- ✅ Interface melhorada com switch e labels

## 🚀 Como Aplicar as Mudanças

### Passo 1: Backup do Banco de Dados
```sql
-- Execute no SQL Editor do Supabase
-- Criar backup das tabelas principais
CREATE TABLE backup_alunos AS SELECT * FROM alunos;
CREATE TABLE backup_contratos AS SELECT * FROM contratos;
CREATE TABLE backup_boletos AS SELECT * FROM boletos;
-- Continue para outras tabelas importantes...
```

### Passo 2: Executar a Migração
1. Abra o SQL Editor no Supabase
2. Copie todo o conteúdo do arquivo `20250125000000-implement-status-system.sql`
3. Execute a migração
4. Verifique se não há erros

### Passo 3: Verificar as Mudanças
```sql
-- Verificar constraints aplicadas
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  rc.delete_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- Verificar campos de status
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'status'
ORDER BY table_name;
```

### Passo 4: Testar o Sistema
1. Reinicie o servidor de desenvolvimento
2. Teste o arquivamento de alunos
3. Teste a restauração de alunos
4. Verifique o toggle de alunos inativos
5. Confirme que os dados são preservados

## 📊 Benefícios da Implementação

### ✅ Segurança dos Dados
- **Antes:** Exclusão permanente e irreversível
- **Depois:** Arquivamento reversível com preservação total dos dados

### ✅ Integridade Referencial
- **Antes:** `ON DELETE CASCADE` causava exclusões em massa
- **Depois:** `ON DELETE RESTRICT` protege dados relacionados

### ✅ Auditoria e Compliance
- **Antes:** Perda de histórico para auditoria
- **Depois:** Histórico completo preservado

### ✅ Experiência do Usuário
- **Antes:** Ação irreversível e perigosa
- **Depois:** Ação reversível e segura

## 🔍 Funcionalidades Implementadas

### Para Alunos Ativos
- ✅ Botão "Arquivar" (ícone de arquivo, cor laranja)
- ✅ Confirmação com explicação clara
- ✅ Preservação de todos os dados relacionados

### Para Alunos Arquivados
- ✅ Botão "Restaurar" (ícone de rotação, cor verde)
- ✅ Confirmação de restauração
- ✅ Retorno ao status ativo

### Interface Geral
- ✅ Toggle para mostrar/ocultar alunos inativos
- ✅ Contador dinâmico de alunos
- ✅ Indicação visual do filtro ativo
- ✅ Busca funciona em ambos os modos

## 🛡️ Considerações de Segurança

1. **Backup Obrigatório:** Sempre faça backup antes de aplicar a migração
2. **Teste em Desenvolvimento:** Teste todas as funcionalidades antes de aplicar em produção
3. **Monitoramento:** Monitore o sistema após a aplicação
4. **Rollback:** Mantenha um plano de rollback caso necessário

## 📝 Próximos Passos (Opcional)

### Implementar para Outras Entidades
- [ ] Professores (similar aos alunos)
- [ ] Salas (similar aos alunos)
- [ ] Responsáveis (similar aos alunos)
- [ ] Usuários (similar aos alunos)

### Melhorias Futuras
- [ ] Relatório de itens arquivados
- [ ] Arquivamento em lote
- [ ] Restauração em lote
- [ ] Logs de auditoria para ações de arquivamento

---

**✅ Sistema implementado com sucesso!**

O sistema agora utiliza exclusão lógica (soft delete) em vez de exclusão física, garantindo a preservação dos dados e melhor experiência do usuário.