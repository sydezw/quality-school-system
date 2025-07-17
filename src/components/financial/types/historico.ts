export interface ParcelaHistorico {
  id: number;
  aluno_id?: string | null;
  registro_financeiro_id?: string | null;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado' | null;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  descricao_item?: string | null;
  tipo_arquivamento?: 'renovacao' | 'cancelamento' | 'conclusao' | null;
  comprovante?: string | null;
  observacoes?: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
  idioma_registro?: 'Inglês' | 'Japonês';
}

export interface FiltrosHistorico {
  tipo_arquivamento: string;
  data_inicio: string;
  data_fim: string;
  status_original: string;
  tipo_item: string;
}

export interface MoverParaHistoricoForm {
  tipo_arquivamento: 'renovacao' | 'cancelamento' | 'conclusao';
  observacoes: string;
}

export interface EstatisticasParcelas {
  total: number;
  pagas: number;
  pendentes: number;
  vencidas: number;
  canceladas: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
}

export interface ParcelaAluno {
  id: number;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  descricao_item?: string | null;
  comprovante?: string;
  observacoes?: string | null;
}