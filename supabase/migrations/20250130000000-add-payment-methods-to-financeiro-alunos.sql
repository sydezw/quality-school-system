-- Adicionar campos de método de pagamento e número de parcelas para cada tipo
-- na tabela financeiro_alunos

-- Adicionar colunas para método de pagamento do plano
alter table financeiro_alunos 
add column forma_pagamento_plano text default 'boleto'
  check (forma_pagamento_plano in ('boleto', 'cartao', 'pix', 'dinheiro', 'transferencia'));

alter table financeiro_alunos 
add column numero_parcelas_plano integer default 1
  check (numero_parcelas_plano >= 1 and numero_parcelas_plano <= 12);

-- Adicionar colunas para método de pagamento do material
alter table financeiro_alunos 
add column forma_pagamento_material text default 'boleto'
  check (forma_pagamento_material in ('boleto', 'cartao', 'pix', 'dinheiro', 'transferencia'));

alter table financeiro_alunos 
add column numero_parcelas_material integer default 1
  check (numero_parcelas_material >= 1 and numero_parcelas_material <= 12);

-- Adicionar colunas para método de pagamento da matrícula
alter table financeiro_alunos 
add column forma_pagamento_matricula text default 'boleto'
  check (forma_pagamento_matricula in ('boleto', 'cartao', 'pix', 'dinheiro', 'transferencia'));

alter table financeiro_alunos 
add column numero_parcelas_matricula integer default 1
  check (numero_parcelas_matricula >= 1 and numero_parcelas_matricula <= 12);

-- Comentários para documentação
comment on column financeiro_alunos.forma_pagamento_plano is 'Método de pagamento do plano: boleto, cartao, pix, dinheiro, transferencia';
comment on column financeiro_alunos.numero_parcelas_plano is 'Número de parcelas do plano (1 a 12)';
comment on column financeiro_alunos.forma_pagamento_material is 'Método de pagamento do material: boleto, cartao, pix, dinheiro, transferencia';
comment on column financeiro_alunos.numero_parcelas_material is 'Número de parcelas do material (1 a 12)';
comment on column financeiro_alunos.forma_pagamento_matricula is 'Método de pagamento da matrícula: boleto, cartao, pix, dinheiro, transferencia';
comment on column financeiro_alunos.numero_parcelas_matricula is 'Número de parcelas da matrícula (1 a 12)';

-- Criar índices para os novos campos
create index idx_financeiro_alunos_forma_pagamento_plano on financeiro_alunos(forma_pagamento_plano);
create index idx_financeiro_alunos_forma_pagamento_material on financeiro_alunos(forma_pagamento_material);
create index idx_financeiro_alunos_forma_pagamento_matricula on financeiro_alunos(forma_pagamento_matricula);

-- Atualizar constraints para incluir cartao_credito e cartao_debito
alter table financeiro_alunos 
drop constraint if exists financeiro_alunos_forma_pagamento_plano_check;

alter table financeiro_alunos 
add constraint financeiro_alunos_forma_pagamento_plano_check 
check (forma_pagamento_plano in ('boleto', 'cartao_credito', 'cartao_debito', 'pix', 'dinheiro', 'transferencia', 'outro'));

alter table financeiro_alunos 
drop constraint if exists financeiro_alunos_forma_pagamento_material_check;

alter table financeiro_alunos 
add constraint financeiro_alunos_forma_pagamento_material_check 
check (forma_pagamento_material in ('boleto', 'cartao_credito', 'cartao_debito', 'pix', 'dinheiro', 'transferencia', 'outro'));

alter table financeiro_alunos 
drop constraint if exists financeiro_alunos_forma_pagamento_matricula_check;

alter table financeiro_alunos 
add constraint financeiro_alunos_forma_pagamento_matricula_check 
check (forma_pagamento_matricula in ('boleto', 'cartao_credito', 'cartao_debito', 'pix', 'dinheiro', 'transferencia', 'outro'));