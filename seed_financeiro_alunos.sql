-- Script para inserir dados de exemplo na tabela financeiro_alunos
-- Execute este script no Supabase SQL Editor para popular a tabela

-- Primeiro, vamos verificar se existem alunos e planos
-- Se não existirem, vamos criar alguns dados básicos

-- Inserir alguns alunos de exemplo (se não existirem)
INSERT INTO alunos (nome, email, telefone, data_nascimento, status, created_at)
SELECT 
  'João Silva', 
  'joao.silva@email.com', 
  '(11) 99999-1111', 
  '2010-05-15'::date, 
  'Ativo', 
  now()
WHERE NOT EXISTS (SELECT 1 FROM alunos WHERE email = 'joao.silva@email.com');

INSERT INTO alunos (nome, email, telefone, data_nascimento, status, created_at)
SELECT 
  'Maria Santos', 
  'maria.santos@email.com', 
  '(11) 99999-2222', 
  '2012-08-20'::date, 
  'Ativo', 
  now()
WHERE NOT EXISTS (SELECT 1 FROM alunos WHERE email = 'maria.santos@email.com');

INSERT INTO alunos (nome, email, telefone, data_nascimento, status, created_at)
SELECT 
  'Pedro Oliveira', 
  'pedro.oliveira@email.com', 
  '(11) 99999-3333', 
  '2011-03-10'::date, 
  'Ativo', 
  now()
WHERE NOT EXISTS (SELECT 1 FROM alunos WHERE email = 'pedro.oliveira@email.com');

-- Inserir alguns planos de exemplo (se não existirem)
INSERT INTO planos (nome, descricao, valor_total, numero_aulas, frequencia_aulas, ativo, created_at)
SELECT 
  'Plano Básico', 
  'Plano básico com 8 aulas mensais', 
  350.00, 
  8, 
  'Semanal', 
  true, 
  now()
WHERE NOT EXISTS (SELECT 1 FROM planos WHERE nome = 'Plano Básico');

INSERT INTO planos (nome, descricao, valor_total, numero_aulas, frequencia_aulas, ativo, created_at)
SELECT 
  'Plano Intermediário', 
  'Plano intermediário com 12 aulas mensais', 
  480.00, 
  12, 
  'Semanal', 
  true, 
  now()
WHERE NOT EXISTS (SELECT 1 FROM planos WHERE nome = 'Plano Intermediário');

INSERT INTO planos (nome, descricao, valor_total, numero_aulas, frequencia_aulas, ativo, created_at)
SELECT 
  'Plano Avançado', 
  'Plano avançado com 16 aulas mensais', 
  650.00, 
  16, 
  'Semanal', 
  true, 
  now()
WHERE NOT EXISTS (SELECT 1 FROM planos WHERE nome = 'Plano Avançado');

-- Agora inserir registros financeiros de exemplo
-- Registro 1: João Silva - Plano Básico
INSERT INTO financeiro_alunos (
  aluno_id,
  plano_id,
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  status_geral,
  data_primeiro_vencimento,
  forma_pagamento_plano,
  numero_parcelas_plano,
  forma_pagamento_material,
  numero_parcelas_material,
  forma_pagamento_matricula,
  numero_parcelas_matricula
)
SELECT 
  a.id,
  p.id,
  350.00,
  80.00,
  100.00,
  30.00,
  'Pendente',
  '2024-02-01'::date,
  'boleto',
  6,
  'pix',
  1,
  'cartao',
  2
FROM alunos a, planos p
WHERE a.email = 'joao.silva@email.com' 
  AND p.nome = 'Plano Básico'
  AND NOT EXISTS (
    SELECT 1 FROM financeiro_alunos fa 
    WHERE fa.aluno_id = a.id AND fa.plano_id = p.id
  );

-- Registro 2: Maria Santos - Plano Intermediário
INSERT INTO financeiro_alunos (
  aluno_id,
  plano_id,
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  status_geral,
  data_primeiro_vencimento,
  forma_pagamento_plano,
  numero_parcelas_plano,
  forma_pagamento_material,
  numero_parcelas_material,
  forma_pagamento_matricula,
  numero_parcelas_matricula
)
SELECT 
  a.id,
  p.id,
  480.00,
  120.00,
  100.00,
  50.00,
  'Parcialmente Pago',
  '2024-01-15'::date,
  'cartao',
  12,
  'boleto',
  3,
  'pix',
  1
FROM alunos a, planos p
WHERE a.email = 'maria.santos@email.com' 
  AND p.nome = 'Plano Intermediário'
  AND NOT EXISTS (
    SELECT 1 FROM financeiro_alunos fa 
    WHERE fa.aluno_id = a.id AND fa.plano_id = p.id
  );

-- Registro 3: Pedro Oliveira - Plano Avançado
INSERT INTO financeiro_alunos (
  aluno_id,
  plano_id,
  valor_plano,
  valor_material,
  valor_matricula,
  desconto_total,
  status_geral,
  data_primeiro_vencimento,
  forma_pagamento_plano,
  numero_parcelas_plano,
  forma_pagamento_material,
  numero_parcelas_material,
  forma_pagamento_matricula,
  numero_parcelas_matricula
)
SELECT 
  a.id,
  p.id,
  650.00,
  150.00,
  100.00,
  0.00,
  'Pago',
  '2024-01-01'::date,
  'transferencia',
  1,
  'dinheiro',
  1,
  'boleto',
  4
FROM alunos a, planos p
WHERE a.email = 'pedro.oliveira@email.com' 
  AND p.nome = 'Plano Avançado'
  AND NOT EXISTS (
    SELECT 1 FROM financeiro_alunos fa 
    WHERE fa.aluno_id = a.id AND fa.plano_id = p.id
  );

-- Verificar os dados inseridos
SELECT 
  fa.*,
  a.nome as nome_aluno,
  p.nome as nome_plano
FROM financeiro_alunos fa
JOIN alunos a ON fa.aluno_id = a.id
JOIN planos p ON fa.plano_id = p.id
ORDER BY fa.created_at DESC;