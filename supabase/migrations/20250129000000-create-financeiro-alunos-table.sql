-- Criação da tabela financeiro_alunos
create table financeiro_alunos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos(id) on delete cascade,
  plano_id uuid not null references planos(id) on delete restrict,
  valor_plano numeric(10,2) not null default 0,
  valor_material numeric(10,2) not null default 0,
  valor_matricula numeric(10,2) not null default 0,
  desconto_total numeric(10,2) not null default 0,
  valor_total numeric(10,2) not null,
  status_geral text not null default 'Pendente'
    check (status_geral in ('Pago', 'Parcialmente Pago', 'Pendente')),
  data_primeiro_vencimento date not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Comentários para documentação
comment on table financeiro_alunos is 'Tabela principal de controle financeiro dos alunos';
comment on column financeiro_alunos.id is 'ID único da cobrança';
comment on column financeiro_alunos.aluno_id is 'ID do aluno (relacionado à tabela alunos)';
comment on column financeiro_alunos.plano_id is 'ID do plano (relacionado à tabela planos)';
comment on column financeiro_alunos.valor_plano is 'Valor do plano contratado';
comment on column financeiro_alunos.valor_material is 'Valor do material didático';
comment on column financeiro_alunos.valor_matricula is 'Taxa de matrícula';
comment on column financeiro_alunos.desconto_total is 'Desconto aplicado, se houver';
comment on column financeiro_alunos.valor_total is 'Soma de tudo (plano + matrícula + material - desconto)';
comment on column financeiro_alunos.status_geral is 'Status geral: Pago, Parcialmente Pago, Pendente';
comment on column financeiro_alunos.data_primeiro_vencimento is 'Data da primeira parcela';

-- Índices
create index idx_financeiro_alunos_aluno_id on financeiro_alunos(aluno_id);
create index idx_financeiro_alunos_plano_id on financeiro_alunos(plano_id);
create index idx_financeiro_alunos_status on financeiro_alunos(status_geral);
create index idx_financeiro_alunos_vencimento on financeiro_alunos(data_primeiro_vencimento);
create index idx_financeiro_alunos_created_at on financeiro_alunos(created_at);

-- Função trigger para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_financeiro_alunos_updated_at
  before update on financeiro_alunos
  for each row
  execute function update_updated_at_column();

-- Função trigger para validar/calcular valor_total
create or replace function validate_valor_total()
returns trigger as $$
begin
  new.valor_total = coalesce(new.valor_plano, 0)
                  + coalesce(new.valor_material, 0)
                  + coalesce(new.valor_matricula, 0)
                  - coalesce(new.desconto_total, 0);

  if new.valor_total < 0 then
    raise exception 'Valor total não pode ser negativo. Verifique os valores inseridos.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger validate_financeiro_alunos_valor_total
  before insert or update on financeiro_alunos
  for each row
  execute function validate_valor_total();

-- Ativa o RLS
alter table financeiro_alunos enable row level security;

-- Políticas RLS

-- Acesso total para administradores
create policy "Administradores podem fazer tudo em financeiro_alunos"
  on financeiro_alunos
  for all
  using (
    exists (
      select 1 from usuarios 
      where usuarios.email = (auth.jwt()::jsonb ->> 'email')
      and usuarios.cargo = 'Admin'
    )
  );

-- Professores podem visualizar
create policy "Professores podem visualizar financeiro_alunos"
  on financeiro_alunos
  for select
  using (
    exists (
      select 1 from usuarios 
      where usuarios.email = (auth.jwt()::jsonb ->> 'email')
      and usuarios.cargo in ('Admin', 'Professor')
    )
  );

-- (Opcional) Alunos podem ver seus próprios dados financeiros
create policy "Alunos podem ver seus próprios dados financeiros"
  on financeiro_alunos
  for select
  using (
    (auth.jwt()::jsonb ->> 'email') = (
      select email from alunos where alunos.id = financeiro_alunos.aluno_id
    )
  );