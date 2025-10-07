-- Criar função RPC para inserir dados na tabela alunos_financeiro
-- Esta função contorna as restrições RLS para permitir a clonagem

CREATE OR REPLACE FUNCTION inserir_aluno_financeiro(dados jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO alunos_financeiro (
    aluno_id,
    plano_id,
    valor_total,
    valor_plano,
    valor_matricula,
    valor_material,
    desconto_total,
    status_geral,
    data_primeiro_vencimento,
    forma_pagamento_plano,
    forma_pagamento_material,
    forma_pagamento_matricula,
    numero_parcelas_plano,
    numero_parcelas_material,
    numero_parcelas_matricula,
    ativo_ou_encerrado,
    idioma_registro,
    porcentagem_total,
    porcentagem_progresso,
    migrado,
    historico
  )
  VALUES (
    (dados->>'aluno_id')::uuid,
    (dados->>'plano_id')::uuid,
    (dados->>'valor_total')::numeric,
    (dados->>'valor_plano')::numeric,
    (dados->>'valor_matricula')::numeric,
    (dados->>'valor_material')::numeric,
    (dados->>'desconto_total')::numeric,
    (dados->>'status_geral')::status_geral_financeiro,
    (dados->>'data_primeiro_vencimento')::date,
     (dados->>'forma_pagamento_plano')::forma_pagamento,
     (dados->>'forma_pagamento_material')::forma_pagamento,
     (dados->>'forma_pagamento_matricula')::forma_pagamento,
    (dados->>'numero_parcelas_plano')::integer,
    (dados->>'numero_parcelas_material')::integer,
    (dados->>'numero_parcelas_matricula')::integer,
    (dados->>'ativo_ou_encerrado')::boolean,
    (dados->>'idioma_registro')::idioma_registro_financeiro,
    (dados->>'porcentagem_total')::integer,
    (dados->>'porcentagem_progresso')::integer,
    (dados->>'migrado')::boolean,
    (dados->>'historico')::boolean
  );
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION inserir_aluno_financeiro(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION inserir_aluno_financeiro(jsonb) TO anon;