# Implementação do Sistema de Múltiplas Matrículas

## Resumo
Este documento descreve a implementação do sistema que permite aos alunos serem matriculados em múltiplas turmas simultaneamente, atendendo ao cenário onde alunos fazem tanto curso em turma regular quanto aulas particulares.

## Problema Original
O sistema anterior impedia que um aluno fosse matriculado em mais de uma turma, pois:
- A busca de alunos para adicionar às turmas filtrava apenas alunos sem `turma_id`
- A validação no hook `useStudents` bloqueava alunos que já tinham turma
- Não havia interface para visualizar múltiplas matrículas

## Solução Implementada

### 1. Modificações na Página de Turmas (`Classes.tsx`)

#### Busca de Alunos
- **Antes**: `is('turma_id', null)` - apenas alunos sem turma
- **Depois**: Removida a restrição - todos os alunos ativos são exibidos
- **Campos adicionados**: `aulas_particulares`, `aulas_turma`

#### Lógica de Matrícula
- **Filtro inteligente**: Verifica se o aluno já está na turma específica
- **Múltiplas matrículas**: Permite alunos com turma principal + aulas particulares
- **Validação de limite**: Mantém o limite de 10 alunos por turma
- **Mensagens informativas**: Avisos sobre limitações atuais

#### Interface Melhorada
- **Coluna "Turma Atual"**: Mostra status de matrícula de cada aluno
- **Badges informativos**: Indica se tem turma principal, aulas particulares, etc.
- **Descrição atualizada**: Explica o sistema de múltiplas matrículas

### 2. Modificações no Hook de Estudantes (`useStudents.tsx`)

#### Validação Inteligente
- **Antes**: Bloqueava qualquer aluno com `turma_id`
- **Depois**: Só verifica limite quando há mudança de turma
- **Condição**: `shouldCheckLimit = !editingStudent || editingStudent.turma_id !== data.turma_id`

### 3. Novo Hook de Múltiplas Matrículas (`useMultipleEnrollments.tsx`)

#### Funcionalidades
- **Busca com relacionamentos**: Alunos + turmas + aulas particulares
- **Simulação de múltiplas matrículas**: Usando campos existentes
- **Estatísticas**: Contadores e percentuais de matrículas
- **Validação de conflitos**: Base para verificação de horários

#### Métodos Principais
```typescript
- fetchStudentsWithEnrollments(): Busca alunos com suas matrículas
- addStudentToClass(): Adiciona aluno a turma (permite múltiplas)
- removeStudentFromClass(): Remove de turma específica
- checkScheduleConflict(): Verifica conflitos de horário
- getEnrollmentStats(): Estatísticas do sistema
```

### 4. Componente de Visualização (`MultipleEnrollmentsView.tsx`)

#### Interface Completa
- **Resumo de matrículas**: Cards com contadores
- **Tabela detalhada**: Todas as matrículas do aluno
- **Ações por matrícula**: Remover de turma específica
- **Informações do sistema**: Explicações sobre limitações

#### Tipos de Matrícula Suportados
1. **Turma Regular**: Uma turma principal com horários fixos
2. **Aulas Particulares**: Modalidade flexível
3. **Combinação**: Turma regular + aulas particulares

### 5. Integração na Tabela de Alunos (`StudentTable.tsx`)

#### Novo Botão
- **Ícone**: `Users` (grupo de pessoas)
- **Função**: Abre modal de múltiplas matrículas
- **Posicionamento**: Ao lado dos botões existentes

## Estrutura de Dados Atual

### Campos Utilizados
```sql
alunos:
- turma_id: UUID (turma principal)
- aulas_particulares: BOOLEAN (se faz aulas particulares)
- aulas_turma: BOOLEAN (se faz aulas de turma)
```

### Lógica de Múltiplas Matrículas
1. **Sem turma**: `turma_id = null`, `aulas_particulares = false/true`
2. **Só turma regular**: `turma_id = UUID`, `aulas_particulares = false`
3. **Só aulas particulares**: `turma_id = null`, `aulas_particulares = true`
4. **Ambas**: `turma_id = UUID`, `aulas_particulares = true`

## Limitações Atuais

### 1. Uma Turma Principal
- Aluno pode ter apenas uma `turma_id` (turma principal)
- Múltiplas turmas regulares requerem tabela de relacionamento

### 2. Aulas Particulares Simplificadas
- Representadas apenas por boolean
- Não há agendamentos específicos (preparado para expansão)

### 3. Relatórios e Integrações
- Presença, avaliações e financeiro ainda usam `turma_id`
- Migração futura necessária para usar relacionamentos

## Expansão Futura

### Script SQL Preparado
- **Arquivo**: `create_multiple_enrollments_system.sql`
- **Tabela**: `aluno_turma` (relacionamento N:N)
- **Migração**: Dados existentes preservados
- **Triggers**: Validação automática de limites
- **Views**: Consultas otimizadas
- **Funções**: Helpers para múltiplas matrículas

### Benefícios da Expansão
1. **Múltiplas turmas regulares**: Sem limitações
2. **Histórico de matrículas**: Data de entrada/saída
3. **Status por matrícula**: Ativo, trancado, concluído
4. **Relatórios precisos**: Por matrícula específica
5. **Validação de conflitos**: Horários automáticos

## Cenários de Uso

### 1. Aluno Novo - Só Turma Regular
```
1. Criar aluno no formulário
2. Selecionar turma no campo "Turma"
3. Sistema define: turma_id = UUID, aulas_turma = true
```

### 2. Aluno Novo - Só Aulas Particulares
```
1. Criar aluno no formulário
2. Marcar checkbox "Aulas Particulares"
3. Sistema define: aulas_particulares = true
```

### 3. Aluno Existente - Adicionar Segunda Turma
```
1. Na página Turmas, clicar "Adicionar Alunos"
2. Selecionar aluno que já tem turma
3. Sistema permite e avisa sobre limitação
```

### 4. Visualizar Múltiplas Matrículas
```
1. Na tabela de alunos, clicar botão "Users"
2. Modal mostra todas as matrículas
3. Permite remover matrículas específicas
```

## Validações Implementadas

### 1. Limite por Turma
- **Máximo**: 10 alunos por turma
- **Verificação**: Antes de adicionar novos alunos
- **Exceção**: Alunos já na turma não contam novamente

### 2. Duplicação
- **Prevenção**: Aluno não pode ser adicionado à mesma turma duas vezes
- **Mensagem**: "Todos os alunos selecionados já estão matriculados nesta turma"

### 3. Integridade
- **Campos obrigatórios**: Mantidos
- **Relacionamentos**: Preservados
- **Cascata**: Exclusões funcionam normalmente

## Testes Recomendados

### 1. Matrícula Simples
- [ ] Criar aluno só com turma regular
- [ ] Criar aluno só com aulas particulares
- [ ] Verificar campos salvos corretamente

### 2. Múltiplas Matrículas
- [ ] Adicionar aluno com turma a aulas particulares
- [ ] Tentar adicionar aluno à mesma turma (deve avisar)
- [ ] Verificar limite de 10 alunos por turma

### 3. Interface
- [ ] Visualizar múltiplas matrículas no modal
- [ ] Remover matrícula específica
- [ ] Verificar badges na tabela de seleção

### 4. Navegação
- [ ] Salvar aluno com "aulas particulares" deve navegar para /classes
- [ ] Cancelar com "aulas particulares" deve navegar para /classes

## Conclusão

O sistema agora suporta múltiplas matrículas de forma inteligente, usando a estrutura existente e preparando o terreno para expansões futuras. A implementação mantém a integridade dos dados, respeita os limites de negócio e oferece uma interface clara para gerenciar as matrículas múltiplas.

**Status**: ✅ Implementado e funcional
**Próximos passos**: Executar script SQL para suporte completo a múltiplas turmas regulares