# Implementação dos Novos Campos de Turmas

## Resumo
Este documento descreve a implementação dos novos campos na tabela `turmas` para suportar diferentes tipos de turmas, datas de início/fim e cálculo automático baseado no total de aulas.

## Campos Adicionados

### 1. `tipo_turma` (ENUM)
- **Valores**: 'Turma particular', 'Turma'
- **Padrão**: 'Turma'
- **Descrição**: Define se é uma turma regular ou particular

### 2. `data_inicio` (DATE)
- **Descrição**: Data de início da turma
- **Opcional**: Sim
- **Uso**: Base para cálculo da data de fim

### 3. `data_fim` (DATE)
- **Descrição**: Data calculada automaticamente para o fim da turma
- **Cálculo**: Baseado em data_inicio + total_aulas + dias_da_semana
- **Considerações**: Detecta e permite reagendamento de feriados

### 4. `total_aulas` (INTEGER)
- **Descrição**: Número total de aulas previstas para a turma
- **Padrão**: 20
- **Validação**: Mínimo 1, máximo 100

## Funcionalidades Implementadas

### 1. Cálculo Automático da Data de Fim
- **Arquivo**: `src/utils/dateCalculations.ts`
- **Função**: `calculateEndDate()` e `calculateEndDateWithHolidays()`
- **Lógica**: 
  - Considera apenas os dias da semana selecionados
  - Conta o número exato de aulas
  - Detecta feriados nacionais
  - Calcula a data final precisa

### 2. Detecção de Feriados
- **Feriados Detectados**: Ano Novo, Tiradentes, Dia do Trabalhador, Independência, N. Sra. Aparecida, Finados, Proclamação da República, Natal
- **Funcionalidade**: Modal para reagendamento ou ignorar feriados
- **Arquivo**: `src/components/classes/HolidayModal.tsx`

### 3. Interface de Usuário
- **Seção**: "Configurações da Turma" no formulário
- **Campos**:
  - Seletor de tipo de turma (Regular/Particular)
  - Campo numérico para total de aulas
  - Seletor de data de início
  - Exibição automática da data de fim calculada

### 4. Modal de Gerenciamento de Feriados
- **Funcionalidades**:
  - Lista feriados detectados
  - Permite reagendamento individual
  - Opção de ignorar todos os feriados
  - Calendário para seleção de nova data
  - Validação para evitar datas passadas

## Arquivos Modificados

### 1. Banco de Dados
- `add_campos_turmas.sql` - Script SQL para adicionar campos

### 2. TypeScript Types
- `src/integrations/supabase/types.ts` - Tipos atualizados

### 3. Componentes
- `src/pages/app/Classes.tsx` - Formulário principal
- `src/components/classes/HolidayModal.tsx` - Modal de feriados (novo)

### 4. Utilitários
- `src/utils/dateCalculations.ts` - Funções de cálculo (novo)

## Como Usar

### 1. Criação de Nova Turma
1. Preencher informações básicas (nome, idioma, nível)
2. Selecionar tipo de turma (Regular ou Particular)
3. Definir total de aulas (padrão: 20)
4. Escolher data de início
5. Selecionar dias da semana
6. Sistema calcula automaticamente a data de fim
7. Se houver feriados, modal aparece para reagendamento

### 2. Edição de Turma Existente
- Todos os campos são carregados automaticamente
- Data de fim é recalculada se dados forem alterados
- Feriados são verificados novamente se necessário

## Validações Implementadas

### 1. Campos Obrigatórios
- Nome da turma
- Idioma
- Nível
- Tipo de turma
- Total de aulas
- Dias da semana
- Horário

### 2. Validações Específicas
- Total de aulas: entre 1 e 100
- Data de início: formato de data válido
- Dias da semana: pelo menos um dia selecionado

## Benefícios

### 1. Gestão Automatizada
- Cálculo automático de datas
- Detecção proativa de conflitos com feriados
- Redução de erros manuais

### 2. Flexibilidade
- Suporte a turmas regulares e particulares
- Configuração personalizada de duração
- Reagendamento inteligente de feriados

### 3. Experiência do Usuário
- Interface intuitiva
- Feedback visual imediato
- Processo guiado para resolução de conflitos

## Próximos Passos

### 1. Execução do Script SQL
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: add_campos_turmas.sql
```

### 2. Teste das Funcionalidades
- Criar turmas com diferentes configurações
- Testar cálculo de datas
- Verificar detecção de feriados
- Validar reagendamento

### 3. Possíveis Melhorias Futuras
- Feriados regionais/municipais
- Integração com calendário escolar
- Notificações automáticas
- Relatórios de cronograma

## Considerações Técnicas

### 1. Performance
- Cálculos são feitos no frontend
- Validações em tempo real
- Otimização para grandes quantidades de aulas

### 2. Compatibilidade
- Turmas existentes mantêm funcionamento
- Valores padrão para campos novos
- Migração transparente

### 3. Manutenibilidade
- Código modular e reutilizável
- Funções utilitárias separadas
- Documentação inline

---

**Data de Implementação**: Janeiro 2025  
**Versão**: 1.0  
**Status**: Implementado - Aguardando execução do script SQL