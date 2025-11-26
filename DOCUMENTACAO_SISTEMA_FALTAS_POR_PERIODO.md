# Sistema de Reinício de Faltas por Período da Turma

## 📋 Visão Geral

Este documento descreve o sistema implementado para calcular faltas de alunos baseado no período específico configurado para cada turma, eliminando o uso de fallbacks automáticos e fornecendo transparência total sobre qual período está sendo utilizado.

## 🎯 Objetivos do Sistema

- **Transparência Total**: Sempre mostrar qual período está sendo usado para o cálculo
- **Sem Fallbacks Forçados**: Não usar períodos automáticos (como últimos 6 meses)
- **Flexibilidade**: Funcionar com turmas de qualquer ano
- **Adaptação Automática**: Quando aluno muda de turma, usar o período da nova turma

## 🏗️ Arquitetura Implementada

### 1. Estrutura de Banco de Dados

#### Campo `aulas_por_semana` na tabela `turmas`
```sql
-- Campo adicionado automaticamente via trigger
aulas_por_semana INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN dias_da_semana IS NULL THEN 0
    ELSE array_length(string_to_array(dias_da_semana, ','), 1)
  END
) STORED;
```

### 2. Arquivos Implementados

#### `src/utils/faltasPorPeriodo.ts`
- **Interface `FaltasPorPeriodo`**: Define estrutura dos dados de faltas
- **Função `calcularFaltasPorPeriodo()`**: Calcula faltas para um aluno em uma turma específica
- **Função `calcularFaltasTodasTurmas()`**: Calcula faltas para todas as turmas de um aluno
- **Função `formatarMensagemFaltas()`**: Formata mensagens para exibição

#### `src/pages/app/Classes.tsx` (Atualizado)
- **Botão "Sugerir Datas"**: Calcula automaticamente `data_fim` baseado em:
  - `data_inicio` (manual)
  - `total_aulas`
  - `dias_da_semana`
  - Consideração de feriados

#### `src/components/students/StudentDetailsModal.tsx` (Atualizado)
- **Exibição de Faltas por Período**: Mostra faltas do período configurado da turma
- **Percentual de Frequência**: Calcula e exibe taxa de presença
- **Estados de Carregamento**: Feedback visual durante busca de dados

## 🔧 Funcionalidades Implementadas

### 1. Hierarquia de Prioridades

#### Prioridade 1 - Período Definido da Turma
- Se a turma tem `data_inicio` e `data_fim` → usa essas datas exatas
- Considera apenas presenças/faltas dentro desse período específico

#### Prioridade 2 - Turma Sem Período Configurado
- Frontend informa claramente: "Período da turma não configurado"
- Sistema não força períodos automáticos
- Indica que precisa configurar as datas

### 2. Botão "Sugerir Datas" - Lógica Inteligente

#### Funcionamento:
1. Cliente digita `data_inicio` manualmente (obrigatório)
2. Sistema pega o `total_aulas` da turma
3. Calcula os `dias_da_semana` da turma
4. Sugere a `data_fim` baseado no cálculo automático
5. Cliente pode aceitar ou ajustar manualmente

#### Exemplo:
- **Data início**: 01/02/2024 (digitado pelo cliente)
- **Total aulas**: 36
- **Dias da semana**: Segunda e Quarta
- **Sistema sugere**: Data fim: 15/07/2024 (calculado)

### 3. Interface na Aba Aulas

#### Exibição das Faltas:
- **Com período configurado**: "Faltas do semestre (01/02/2024 - 30/07/2024): 3 faltas"
- **Sem período configurado**: "Período da turma não configurado"

## 🧪 Guia de Testes e Validação

### Pré-requisitos para Testes

1. **Banco de Dados Atualizado**:
   ```bash
   # Execute o script SQL para adicionar o campo aulas_por_semana
   psql -d seu_banco -f add_aulas_por_semana_field.sql
   ```

2. **Servidor em Execução**:
   ```bash
   npm run dev
   ```

### Cenários de Teste

#### 🔍 Teste 1: Turma com Período Configurado

**Objetivo**: Validar cálculo correto de faltas dentro do período da turma

**Passos**:
1. Acesse a página de Turmas
2. Crie uma nova turma com:
   - Nome: "Inglês Básico - Teste"
   - Data início: 01/02/2024
   - Total aulas: 24
   - Dias da semana: Segunda, Quarta
3. Clique em "Sugerir Datas"
4. Verifique se a data fim foi calculada corretamente
5. Salve a turma
6. Adicione um aluno à turma
7. Crie algumas aulas no período
8. Marque presenças e faltas
9. Acesse o modal de detalhes do aluno
10. Verifique se as faltas são exibidas com o período correto

**Resultado Esperado**:
- Data fim calculada automaticamente
- Faltas exibidas como: "Faltas do semestre (01/02/2024 - [data_fim]): X faltas"
- Percentual de frequência calculado corretamente

#### 🔍 Teste 2: Turma Sem Período Configurado

**Objetivo**: Validar comportamento quando turma não tem datas configuradas

**Passos**:
1. Crie uma turma sem preencher `data_inicio` e `data_fim`
2. Adicione um aluno à turma
3. Acesse o modal de detalhes do aluno
4. Verifique a mensagem exibida

**Resultado Esperado**:
- Mensagem: "Período da turma não configurado"
- Não deve mostrar cálculos de faltas

#### 🔍 Teste 3: Botão "Sugerir Datas"

**Objetivo**: Validar funcionamento do cálculo automático de datas

**Passos**:
1. Acesse a página de Turmas
2. Preencha apenas:
   - Data início: 15/03/2024
   - Total aulas: 36
   - Dias da semana: Terça, Quinta
3. Clique em "Sugerir Datas"
4. Verifique se a data fim foi calculada
5. Teste com diferentes combinações de dias da semana

**Resultado Esperado**:
- Data fim calculada considerando feriados
- Mensagem informativa sobre feriados detectados
- Cálculo preciso baseado nos dias da semana selecionados

#### 🔍 Teste 4: Turma de Ano Anterior

**Objetivo**: Validar que o sistema funciona com turmas de qualquer ano

**Passos**:
1. Crie uma turma com:
   - Data início: 01/02/2023
   - Data fim: 30/07/2023
2. Adicione um aluno
3. Crie aulas no período de 2023
4. Marque presenças/faltas
5. Verifique os dados no modal do aluno

**Resultado Esperado**:
- Sistema mostra faltas apenas do período de 2023
- Não força período atual ou últimos 6 meses

#### 🔍 Teste 5: Aluno com Múltiplas Turmas

**Objetivo**: Validar comportamento quando aluno está em múltiplas turmas

**Passos**:
1. Crie duas turmas com períodos diferentes
2. Matricule o mesmo aluno nas duas turmas
3. Crie aulas e marque presenças em ambas
4. Verifique os dados no modal do aluno

**Resultado Esperado**:
- Sistema deve mostrar dados da turma ativa atual
- Faltas calculadas apenas para a turma ativa

### Validações de Dados

#### ✅ Checklist de Validação

- [ ] Campo `aulas_por_semana` é calculado automaticamente
- [ ] Botão "Sugerir Datas" funciona corretamente
- [ ] Faltas são calculadas apenas no período da turma
- [ ] Mensagens informativas são exibidas claramente
- [ ] Sistema não usa fallbacks automáticos
- [ ] Percentual de frequência é calculado corretamente
- [ ] Interface responde adequadamente a estados de carregamento
- [ ] Erros são tratados graciosamente

### Casos Extremos para Testar

#### 🚨 Cenários de Erro

1. **Turma sem alunos**: Verificar se não há erros
2. **Aluno sem turma ativa**: Deve exibir mensagem apropriada
3. **Período da turma no futuro**: Deve mostrar 0 faltas
4. **Dados corrompidos**: Sistema deve tratar erros graciosamente

#### 🔄 Performance

1. **Muitas aulas**: Teste com turmas que têm 100+ aulas
2. **Muitos alunos**: Teste com turmas de 50+ alunos
3. **Períodos longos**: Teste com turmas de 1+ ano

## 🐛 Troubleshooting

### Problemas Comuns

#### Erro: "Campo aulas_por_semana não encontrado"
**Solução**: Execute o script SQL `add_aulas_por_semana_field.sql`

#### Botão "Sugerir Datas" não funciona
**Verificar**:
- Data início está preenchida
- Total aulas é maior que 0
- Pelo menos um dia da semana está selecionado

#### Faltas não aparecem no modal do aluno
**Verificar**:
- Aluno tem turma ativa
- Turma tem período configurado
- Existem aulas criadas no período

### Logs de Debug

Para debugar problemas, verifique o console do navegador:
```javascript
// Logs importantes a procurar:
console.log('Calculando faltas para período:', periodo);
console.error('Erro ao calcular faltas por período:', error);
```

## 📊 Métricas de Sucesso

### KPIs do Sistema

1. **Transparência**: 100% das exibições de faltas mostram o período usado
2. **Precisão**: Faltas calculadas apenas no período correto da turma
3. **Usabilidade**: Botão "Sugerir Datas" reduz tempo de configuração
4. **Flexibilidade**: Sistema funciona com turmas de qualquer ano

### Monitoramento

- Verificar logs de erro relacionados ao cálculo de faltas
- Monitorar tempo de resposta das consultas de presença
- Acompanhar uso do botão "Sugerir Datas"

## 🔄 Manutenção

### Atualizações Futuras

1. **Relatórios**: Implementar relatórios de faltas por período
2. **Notificações**: Alertas quando aluno atinge limite de faltas
3. **Histórico**: Manter histórico de mudanças de turma
4. **API**: Endpoints para integração com sistemas externos

### Backup e Recuperação

- Fazer backup regular da tabela `presencas`
- Manter logs de alterações no campo `aulas_por_semana`
- Documentar procedimentos de rollback se necessário

---

## 📞 Suporte

Para dúvidas ou problemas com o sistema:
1. Verifique este documento primeiro
2. Execute os testes de validação
3. Consulte os logs de erro
4. Documente o problema com prints e logs

**Data da Documentação**: Janeiro 2024  
**Versão do Sistema**: 1.0  
**Última Atualização**: Janeiro 2024