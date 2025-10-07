-- Criação da tabela alunos_parcelas
-- Baseada na estrutura de parcelas_alunos com as seguintes modificações:
-- 1. Substitui registro_financeiro_id por alunos_financeiro_id (referencia alunos_financeiro.id)
-- 2. Adiciona coluna historico (boolean)

CREATE TABLE IF NOT EXISTS public.alunos_parcelas (
    id SERIAL PRIMARY KEY,
    alunos_financeiro_id uuid NOT NULL,
    data_vencimento date NOT NULL,
    numero_parcela integer NOT NULL,
    tipo_item tipo_item NOT NULL,
    valor numeric NOT NULL,
    status_pagamento status_pagamento DEFAULT 'pendente'::status_pagamento,
    idioma_registro idioma_registro_financeiro NOT NULL,
    descricao_item text,
    forma_pagamento text,
    data_pagamento date,
    comprovante text,
    observacoes text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now(),
    historico boolean DEFAULT false NOT NULL
);

-- Adicionar foreign key para alunos_financeiro
ALTER TABLE ONLY public.alunos_parcelas
    ADD CONSTRAINT alunos_parcelas_alunos_financeiro_id_fkey 
    FOREIGN KEY (alunos_financeiro_id) REFERENCES public.alunos_financeiro(id) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_alunos_parcelas_alunos_financeiro_id 
    ON public.alunos_parcelas(alunos_financeiro_id);

CREATE INDEX IF NOT EXISTS idx_alunos_parcelas_historico 
    ON public.alunos_parcelas(historico);

CREATE INDEX IF NOT EXISTS idx_alunos_parcelas_status_pagamento 
    ON public.alunos_parcelas(status_pagamento);

CREATE INDEX IF NOT EXISTS idx_alunos_parcelas_data_vencimento 
    ON public.alunos_parcelas(data_vencimento);

CREATE INDEX IF NOT EXISTS idx_alunos_parcelas_tipo_item 
    ON public.alunos_parcelas(tipo_item);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.alunos_parcelas ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir todas as operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.alunos_parcelas
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Comentários na tabela e colunas
COMMENT ON TABLE public.alunos_parcelas IS 'Tabela de parcelas dos alunos baseada em parcelas_alunos';
COMMENT ON COLUMN public.alunos_parcelas.alunos_financeiro_id IS 'Referência ao registro financeiro do aluno na tabela alunos_financeiro';
COMMENT ON COLUMN public.alunos_parcelas.historico IS 'Indica se o registro é histórico (true) ou ativo (false)';
COMMENT ON COLUMN public.alunos_parcelas.data_vencimento IS 'Data de vencimento da parcela';
COMMENT ON COLUMN public.alunos_parcelas.numero_parcela IS 'Número sequencial da parcela';
COMMENT ON COLUMN public.alunos_parcelas.tipo_item IS 'Tipo do item (plano, material, matricula)';
COMMENT ON COLUMN public.alunos_parcelas.valor IS 'Valor da parcela';
COMMENT ON COLUMN public.alunos_parcelas.status_pagamento IS 'Status do pagamento da parcela';

-- Verificar se a tabela foi criada com sucesso
SELECT 'Tabela alunos_parcelas criada com sucesso!' as resultado;

-- Verificar a estrutura da tabela criada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'alunos_parcelas' 
ORDER BY ordinal_position;