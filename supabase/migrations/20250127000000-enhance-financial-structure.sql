-- Migração para melhorar a estrutura financeira
-- Adiciona campos à tabela boletos e cria tabela de histórico de pagamentos

-- Adicionar novos campos à tabela boletos para melhor rastreamento
ALTER TABLE public.boletos 
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT,
ADD COLUMN IF NOT EXISTS data_pagamento DATE,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS numero_parcela INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS contrato_id UUID REFERENCES public.contratos(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_boletos_contrato_id ON public.boletos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_boletos_data_vencimento ON public.boletos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_boletos_status ON public.boletos(status);
CREATE INDEX IF NOT EXISTS idx_boletos_data_pagamento ON public.boletos(data_pagamento);

-- Adicionar campos à tabela parcelas para melhor controle
ALTER TABLE public.parcelas 
ADD COLUMN IF NOT EXISTS contrato_id UUID REFERENCES public.contratos(id),
ADD COLUMN IF NOT EXISTS numero_parcela INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS data_pagamento DATE,
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT,
ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS juros DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS multa DECIMAL(10,2) DEFAULT 0;

-- Criar índices para a tabela parcelas
CREATE INDEX IF NOT EXISTS idx_parcelas_contrato_id ON public.parcelas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_data_vencimento ON public.parcelas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON public.parcelas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_numero_parcela ON public.parcelas(numero_parcela);

-- Criar tabela de histórico de pagamentos para auditoria completa
CREATE TABLE IF NOT EXISTS public.historico_pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boleto_id UUID REFERENCES public.boletos(id) ON DELETE CASCADE,
  parcela_id UUID REFERENCES public.parcelas(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
  valor_original DECIMAL(10,2) NOT NULL,
  valor_pago DECIMAL(10,2) NOT NULL,
  juros DECIMAL(10,2) DEFAULT 0,
  multa DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  metodo_pagamento TEXT NOT NULL,
  data_pagamento DATE NOT NULL,
  data_vencimento_original DATE NOT NULL,
  observacoes TEXT,
  usuario_id UUID REFERENCES public.usuarios(id),
  tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('pagamento', 'estorno', 'ajuste')),
  status_anterior TEXT,
  status_novo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para a tabela historico_pagamentos
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_boleto_id ON public.historico_pagamentos(boleto_id);
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_parcela_id ON public.historico_pagamentos(parcela_id);
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_aluno_id ON public.historico_pagamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_contrato_id ON public.historico_pagamentos(contrato_id);
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_data_pagamento ON public.historico_pagamentos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_metodo_pagamento ON public.historico_pagamentos(metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_tipo_transacao ON public.historico_pagamentos(tipo_transacao);

-- Habilitar RLS na nova tabela
ALTER TABLE public.historico_pagamentos ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para historico_pagamentos
CREATE POLICY "Allow all operations for authenticated users" ON public.historico_pagamentos
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Criar função para atualizar automaticamente o histórico quando um pagamento é feito
CREATE OR REPLACE FUNCTION public.registrar_pagamento_historico()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar no histórico quando status muda para 'Pago'
  IF NEW.status = 'Pago' AND (OLD.status IS NULL OR OLD.status != 'Pago') THEN
    INSERT INTO public.historico_pagamentos (
      boleto_id,
      aluno_id,
      contrato_id,
      valor_original,
      valor_pago,
      juros,
      multa,
      metodo_pagamento,
      data_pagamento,
      data_vencimento_original,
      observacoes,
      tipo_transacao,
      status_anterior,
      status_novo
    ) VALUES (
      NEW.id,
      NEW.aluno_id,
      NEW.contrato_id,
      NEW.valor,
      COALESCE(NEW.valor + COALESCE(NEW.juros, 0) + COALESCE(NEW.multa, 0), NEW.valor),
      COALESCE(NEW.juros, 0),
      COALESCE(NEW.multa, 0),
      COALESCE(NEW.metodo_pagamento, 'Não informado'),
      COALESCE(NEW.data_pagamento, CURRENT_DATE),
      NEW.data_vencimento,
      NEW.observacoes,
      'pagamento',
      COALESCE(OLD.status, 'Pendente'),
      NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para registrar automaticamente no histórico
DROP TRIGGER IF EXISTS trigger_registrar_pagamento_historico ON public.boletos;
CREATE TRIGGER trigger_registrar_pagamento_historico
  AFTER UPDATE ON public.boletos
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_pagamento_historico();

-- Criar função similar para parcelas
CREATE OR REPLACE FUNCTION public.registrar_pagamento_parcela_historico()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar no histórico quando status muda para 'Pago'
  IF NEW.status = 'Pago' AND (OLD.status IS NULL OR OLD.status != 'Pago') THEN
    INSERT INTO public.historico_pagamentos (
      parcela_id,
      aluno_id,
      contrato_id,
      valor_original,
      valor_pago,
      juros,
      multa,
      metodo_pagamento,
      data_pagamento,
      data_vencimento_original,
      observacoes,
      tipo_transacao,
      status_anterior,
      status_novo
    ) VALUES (
      NEW.id,
      NEW.aluno_id,
      NEW.contrato_id,
      NEW.valor,
      COALESCE(NEW.valor_pago, NEW.valor),
      COALESCE(NEW.juros, 0),
      COALESCE(NEW.multa, 0),
      COALESCE(NEW.metodo_pagamento, 'Não informado'),
      COALESCE(NEW.data_pagamento, CURRENT_DATE),
      NEW.data_vencimento,
      NEW.observacao,
      'pagamento',
      COALESCE(OLD.status, 'Pendente'),
      NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para parcelas
DROP TRIGGER IF EXISTS trigger_registrar_pagamento_parcela_historico ON public.parcelas;
CREATE TRIGGER trigger_registrar_pagamento_parcela_historico
  AFTER UPDATE ON public.parcelas
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_pagamento_parcela_historico();

-- Criar view para facilitar consultas de inadimplência
CREATE OR REPLACE VIEW public.view_inadimplencia AS
SELECT 
  a.id as aluno_id,
  a.nome as aluno_nome,
  a.telefone,
  a.email,
  COUNT(CASE WHEN b.status = 'Vencido' THEN 1 END) as boletos_vencidos,
  COUNT(CASE WHEN p.status = 'Vencido' THEN 1 END) as parcelas_vencidas,
  SUM(CASE WHEN b.status = 'Vencido' THEN b.valor + COALESCE(b.juros, 0) + COALESCE(b.multa, 0) ELSE 0 END) as valor_boletos_vencidos,
  SUM(CASE WHEN p.status = 'Vencido' THEN p.valor + COALESCE(p.juros, 0) + COALESCE(p.multa, 0) ELSE 0 END) as valor_parcelas_vencidas,
  MIN(CASE WHEN b.status = 'Vencido' THEN b.data_vencimento END) as data_primeiro_vencimento_boleto,
  MIN(CASE WHEN p.status = 'Vencido' THEN p.data_vencimento END) as data_primeiro_vencimento_parcela
FROM public.alunos a
LEFT JOIN public.boletos b ON a.id = b.aluno_id
LEFT JOIN public.parcelas p ON a.id = p.aluno_id
WHERE a.status = 'Ativo'
GROUP BY a.id, a.nome, a.telefone, a.email
HAVING COUNT(CASE WHEN b.status = 'Vencido' THEN 1 END) > 0 
   OR COUNT(CASE WHEN p.status = 'Vencido' THEN 1 END) > 0;

-- Criar view para resumo financeiro
CREATE OR REPLACE VIEW public.view_resumo_financeiro AS
SELECT 
  DATE_TRUNC('month', CURRENT_DATE) as mes_referencia,
  -- Receitas do mês (boletos pagos)
  COALESCE(SUM(CASE 
    WHEN b.status = 'Pago' AND b.data_pagamento >= DATE_TRUNC('month', CURRENT_DATE)
    THEN b.valor + COALESCE(b.juros, 0) + COALESCE(b.multa, 0)
    ELSE 0 
  END), 0) as receitas_boletos_mes,
  -- Receitas do mês (parcelas pagas)
  COALESCE(SUM(CASE 
    WHEN p.status = 'Pago' AND p.data_pagamento >= DATE_TRUNC('month', CURRENT_DATE)
    THEN COALESCE(p.valor_pago, p.valor)
    ELSE 0 
  END), 0) as receitas_parcelas_mes,
  -- Boletos pendentes
  COUNT(CASE WHEN b.status = 'Pendente' THEN 1 END) as boletos_pendentes,
  COALESCE(SUM(CASE WHEN b.status = 'Pendente' THEN b.valor ELSE 0 END), 0) as valor_boletos_pendentes,
  -- Boletos vencidos
  COUNT(CASE WHEN b.status = 'Vencido' THEN 1 END) as boletos_vencidos,
  COALESCE(SUM(CASE WHEN b.status = 'Vencido' THEN b.valor + COALESCE(b.juros, 0) + COALESCE(b.multa, 0) ELSE 0 END), 0) as valor_boletos_vencidos,
  -- Parcelas pendentes
  COUNT(CASE WHEN p.status = 'Pendente' THEN 1 END) as parcelas_pendentes,
  COALESCE(SUM(CASE WHEN p.status = 'Pendente' THEN p.valor ELSE 0 END), 0) as valor_parcelas_pendentes,
  -- Parcelas vencidas
  COUNT(CASE WHEN p.status = 'Vencido' THEN 1 END) as parcelas_vencidas,
  COALESCE(SUM(CASE WHEN p.status = 'Vencido' THEN p.valor + COALESCE(p.juros, 0) + COALESCE(p.multa, 0) ELSE 0 END), 0) as valor_parcelas_vencidas,
  -- Despesas do mês
  COALESCE(SUM(CASE 
    WHEN d.data >= DATE_TRUNC('month', CURRENT_DATE)
    THEN d.valor
    ELSE 0 
  END), 0) as despesas_mes
FROM public.boletos b
FULL OUTER JOIN public.parcelas p ON 1=1
FULL OUTER JOIN public.despesas d ON 1=1;

-- Comentários para documentação
COMMENT ON TABLE public.historico_pagamentos IS 'Tabela de auditoria para registrar todos os pagamentos e alterações de status';
COMMENT ON COLUMN public.historico_pagamentos.tipo_transacao IS 'Tipo da transação: pagamento, estorno ou ajuste';
COMMENT ON COLUMN public.boletos.metodo_pagamento IS 'Método utilizado para o pagamento: Pix, Boleto, Dinheiro, Cartão, etc.';
COMMENT ON COLUMN public.boletos.data_pagamento IS 'Data em que o pagamento foi efetivamente realizado';
COMMENT ON COLUMN public.boletos.observacoes IS 'Observações adicionais sobre o boleto ou pagamento';
COMMENT ON COLUMN public.boletos.numero_parcela IS 'Número da parcela quando o boleto faz parte de um parcelamento';
COMMENT ON COLUMN public.boletos.contrato_id IS 'Referência ao contrato que originou este boleto';
COMMENT ON VIEW public.view_inadimplencia IS 'View que consolida informações de inadimplência por aluno';
COMMENT ON VIEW public.view_resumo_financeiro IS 'View que fornece um resumo financeiro consolidado';