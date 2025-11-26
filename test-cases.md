# Casos de Teste - Sistema de Planos com Cálculos Automáticos

## Resumo das Funcionalidades Implementadas

### 1. Cálculos Automáticos
- **Valor por Aula**: Calculado automaticamente como `Valor Total ÷ Número de Aulas`
- **Carga Horária Total**: Calculada automaticamente como `Número de Aulas × Horário por Aula`

### 2. Validações
- Valor Total deve ser > 0
- Número de Aulas deve ser > 0
- Horário por Aula deve ser > 0

### 3. Campos do Formulário
- **Obrigatórios**: Nome, Descrição, Número de Aulas, Valor Total, Horário por Aula
- **Calculados automaticamente**: Valor por Aula, Carga Horária Total
- **Opcionais**: Frequência, Observações, Switches de configuração

## Casos de Teste para Verificação

### Teste 1: Criação de Plano Básico
```json
{
  "nome": "Curso de Inglês Básico",
  "descricao": "Curso introdutório de inglês para iniciantes",
  "numero_aulas": 20,
  "frequencia_aulas": "semanal",
  "valor_total": 1000.00,
  "horario_por_aula": 1.5,
  "permite_cancelamento": true,
  "permite_parcelamento": true,
  "observacoes": "Material incluso",
  "ativo": true
}
```

**Resultados Esperados:**
- Valor por Aula: R$ 50,00 (1000 ÷ 20)
- Carga Horária Total: 30,0 horas (20 × 1.5)

### Teste 2: Plano Intensivo
```json
{
  "nome": "Curso Intensivo de Programação",
  "descricao": "Bootcamp intensivo de desenvolvimento web",
  "numero_aulas": 40,
  "frequencia_aulas": "intensivo",
  "valor_total": 3200.00,
  "horario_por_aula": 4.0,
  "permite_cancelamento": false,
  "permite_parcelamento": true,
  "observacoes": "Certificado incluso",
  "ativo": true
}
```

**Resultados Esperados:**
- Valor por Aula: R$ 80,00 (3200 ÷ 40)
- Carga Horária Total: 160,0 horas (40 × 4.0)

### Teste 3: Plano com Valores Decimais
```json
{
  "nome": "Aulas Particulares de Matemática",
  "descricao": "Reforço escolar personalizado",
  "numero_aulas": 12,
  "frequencia_aulas": "quinzenal",
  "valor_total": 750.00,
  "horario_por_aula": 1.5,
  "permite_cancelamento": true,
  "permite_parcelamento": false,
  "observacoes": null,
  "ativo": true
}
```

**Resultados Esperados:**
- Valor por Aula: R$ 62,50 (750 ÷ 12)
- Carga Horária Total: 18,0 horas (12 × 1.5)

### Teste 4: Validação de Erros

#### Teste 4a: Valor Total Inválido
```json
{
  "nome": "Teste Erro",
  "descricao": "Teste de validação",
  "numero_aulas": 10,
  "valor_total": 0,
  "horario_por_aula": 2.0
}
```
**Erro Esperado**: "Valor Total deve ser maior que zero"

#### Teste 4b: Número de Aulas Inválido
```json
{
  "nome": "Teste Erro",
  "descricao": "Teste de validação",
  "numero_aulas": 0,
  "valor_total": 1000.00,
  "horario_por_aula": 2.0
}
```
**Erro Esperado**: "Número de Aulas deve ser maior que zero"

#### Teste 4c: Horário por Aula Inválido
```json
{
  "nome": "Teste Erro",
  "descricao": "Teste de validação",
  "numero_aulas": 10,
  "valor_total": 1000.00,
  "horario_por_aula": 0
}
```
**Erro Esperado**: "Horário por Aula deve ser maior que zero"

## Como Verificar no Front-end

### 1. Teste de Cálculo em Tempo Real
1. Abra o formulário "Novo Plano"
2. Preencha "Valor Total" com 1000
3. Preencha "Número de Aulas" com 20
4. Preencha "Horário por Aula" com 1.5
5. **Verificar**: Campo "Valor por Aula" deve mostrar automaticamente "50.00"
6. **Verificar**: Campo "Carga Horária Total" deve mostrar automaticamente "30.0"

### 2. Teste de Atualização Dinâmica
1. Com os valores do teste anterior preenchidos
2. Altere "Número de Aulas" para 25
3. **Verificar**: "Valor por Aula" deve atualizar para "40.00" (1000 ÷ 25)
4. **Verificar**: "Carga Horária Total" deve atualizar para "37.5" (25 × 1.5)

### 3. Teste de Validação
1. Tente submeter o formulário com "Valor Total" vazio ou zero
2. **Verificar**: Deve aparecer mensagem de erro de validação
3. Tente submeter com "Horário por Aula" vazio ou zero
4. **Verificar**: Deve aparecer mensagem de erro de validação

### 4. Teste de Campos Somente Leitura
1. **Verificar**: Campo "Valor por Aula" deve estar desabilitado (cinza)
2. **Verificar**: Campo "Carga Horária Total" deve estar desabilitado (cinza)
3. **Verificar**: Deve haver texto explicativo abaixo desses campos

## Estrutura do Banco de Dados

### Nova Coluna Adicionada
```sql
ALTER TABLE planos 
ADD COLUMN horario_por_aula NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE planos 
ADD CONSTRAINT horario_por_aula_positive CHECK (horario_por_aula > 0);
```

### Campos da Tabela `planos`
- `id`: UUID (Primary Key)
- `nome`: VARCHAR (Nome do plano)
- `descricao`: TEXT (Descrição detalhada)
- `numero_aulas`: INTEGER (Quantidade de aulas)
- `frequencia_aulas`: VARCHAR (semanal, quinzenal, mensal, intensivo)
- `valor_total`: NUMERIC (Valor total do plano)
- `valor_por_aula`: NUMERIC (Calculado: valor_total ÷ numero_aulas)
- `horario_por_aula`: NUMERIC (Duração de cada aula em horas)
- `carga_horaria_total`: NUMERIC (Calculado: numero_aulas × horario_por_aula)
- `permite_cancelamento`: BOOLEAN
- `permite_parcelamento`: BOOLEAN
- `observacoes`: TEXT (Opcional)
- `ativo`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Notas de Implementação

1. **Cálculos no Cliente**: Os cálculos são feitos em tempo real no front-end para melhor UX
2. **Validação no Servidor**: Os cálculos são refeitos no servidor para garantir consistência
3. **Campos Somente Leitura**: Valor por Aula e Carga Horária Total não podem ser editados manualmente
4. **Validações**: Todos os valores numéricos devem ser positivos
5. **Precisão**: Valor por Aula com 2 casas decimais, Carga Horária com 1 casa decimal