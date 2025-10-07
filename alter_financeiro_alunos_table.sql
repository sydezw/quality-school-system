-- Cópia exata da tabela financeiro_alunos com modificações nos tipos de dados solicitados
-- Esta é uma cópia ctrl+c ctrl+v da estrutura original com as alterações especificadas

-- Criar ENUMs para os campos com valores específicos
DROP TYPE IF EXISTS status_geral_financeiro CASCADE;
DROP TYPE IF EXISTS forma_pagamento CASCADE;
CREATE TYPE status_geral_financeiro AS ENUM ('Pago', 'Parcialmente Pago', 'Pendente', 'Arquivado');
CREATE TYPE forma_pagamento AS ENUM ('boleto', 'cartao_credito', 'cartao_debito', 'dinheiro', 'pix', 'transferencia', 'outro');

CREATE TABLE alunos_financeiro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id UUID NOT NULL,
    plano_id UUID NOT NULL,
    valor_plano NUMERIC NOT NULL DEFAULT 0,
    valor_material NUMERIC NOT NULL DEFAULT 0,
    valor_matricula NUMERIC NOT NULL DEFAULT 0,
    desconto_total NUMERIC NOT NULL DEFAULT 0,
    valor_total NUMERIC NOT NULL,
    status_geral status_geral_financeiro NOT NULL DEFAULT 'Pendente',
    data_primeiro_vencimento DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    forma_pagamento_material forma_pagamento DEFAULT 'boleto',
    numero_parcelas_material INTEGER DEFAULT 1,
    forma_pagamento_matricula forma_pagamento DEFAULT 'boleto',
    numero_parcelas_matricula INTEGER DEFAULT 1,
    forma_pagamento_plano forma_pagamento DEFAULT 'boleto',
    numero_parcelas_plano INTEGER DEFAULT 1,
    ativo_ou_encerrado BOOLEAN NOT NULL DEFAULT TRUE,
    idioma_registro idioma_registro_financeiro NOT NULL DEFAULT 'Inglês',
    porcentagem_total NUMERIC DEFAULT 100,
    porcentagem_progresso NUMERIC DEFAULT 0,
    migrado BOOLEAN NOT NULL DEFAULT FALSE,
    historico BOOLEAN NOT NULL DEFAULT FALSE
);

-- Adicionar foreign keys
ALTER TABLE alunos_financeiro
ADD CONSTRAINT fk_alunos_financeiro_aluno_id
FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE;

ALTER TABLE alunos_financeiro
ADD CONSTRAINT fk_alunos_financeiro_plano_id
FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE CASCADE;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_alunos_financeiro_updated_at ON alunos_financeiro;
DROP FUNCTION IF EXISTS update_alunos_financeiro_updated_at();

CREATE OR REPLACE FUNCTION update_alunos_financeiro_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alunos_financeiro_updated_at
    BEFORE UPDATE ON alunos_financeiro
    FOR EACH ROW
    EXECUTE FUNCTION update_alunos_financeiro_updated_at();

-- Comentários sobre as alterações realizadas:
-- 1. status_geral: TEXT -> ENUM status_geral_financeiro ('Pago', 'Parcialmente Pago', 'Pendente', 'Arquivado')
-- 2. forma_pagamento_material: VARCHAR(20) -> ENUM forma_pagamento ('boleto', 'cartao_credito', 'cartao_debito', 'dinheiro', 'pix', 'transferencia', 'outro')
-- 3. forma_pagamento_plano: VARCHAR(20) -> ENUM forma_pagamento ('boleto', 'cartao_credito', 'cartao_debito', 'dinheiro', 'pix', 'transferencia', 'outro')
-- 4. forma_pagamento_matricula: VARCHAR(20) -> ENUM forma_pagamento ('boleto', 'cartao_credito', 'cartao_debito', 'dinheiro', 'pix', 'transferencia', 'outro')
-- 5. ativo_ou_encerrado: ENUM -> BOOLEAN (TRUE para 'ativo', FALSE para 'encerrado')
-- 6. migrado: ENUM -> BOOLEAN (TRUE para 'sim', FALSE para 'nao')
-- 7. idioma_registro: mantido como ENUM idioma_registro_financeiro ('Inglês', 'Japonês')
-- 8. historico: nova coluna BOOLEAN (TRUE para registros históricos, FALSE para registros ativos)

-- Verificar a estrutura da tabela criada
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'alunos_financeiro'
ORDER BY ordinal_position;