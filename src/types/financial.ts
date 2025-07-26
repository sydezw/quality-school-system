// Interfaces e tipos para o módulo financeiro

export interface Boleto {
  id: string;
  aluno_id: string;
  data_vencimento: string;
  valor: number;
  status: string;
  descricao: string;
  link_pagamento: string | null;
  data_pagamento?: string | null;
  metodo_pagamento?: string | null;
  observacoes?: string | null;
  numero_parcela?: number | null;
  contrato_id?: string | null;
  alunos?: { nome: string };
}

export interface HistoricoPagamento {
  id: string;
  aluno_id: string;
  tipo_transacao: string;
  valor_original: number;
  valor_pago: number;
  data_pagamento: string;
  metodo_pagamento: string;
  observacoes?: string | null;
  status_anterior?: string | null;
  status_novo?: string | null;
}

export interface AlunoFinanceiro {
  id: string;
  nome: string;
  boletos: Boleto[];
  totalDividas: number;
  boletosVencidos: number;
  ultimoPagamento?: string;
  historicoPagamentos: HistoricoPagamento[];
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  status: string;
}

export interface Student {
  id: string;
  nome: string;
}

export interface PlanoGenerico {
  id: string;
  nome: string;
  valor_total: number | null;
  valor_por_aula: number | null;
  numero_aulas: number; // Obrigatório para cálculos
  descricao?: string;
  carga_horaria_total?: number;
  frequencia_aulas?: string | number; // Aceitar Json do banco
  tipo_valor?: string; // Adicionar tipo_valor para controle dos campos
  idioma?: string; // Campo idioma usado nos formulários
  observacao?: string; // Campo observacao usado nos formulários
}

export interface ContratoAluno {
  id: string;
  aluno_id: string;
  valor_mensalidade: number;
  data_inicio: string;
  data_fim?: string;
  status: string;
  plano_nome?: string;
}

export interface ProgressoParcelas {
  total: number;
  pagas: number;
  percentual: number;
  valor_total: number;
  valor_pago: number;
}

export type StatusAluno = 'Em dia' | 'Atrasado' | 'Inadimplente';

export interface FinancialState {
  boletos: Boleto[];
  despesas: Despesa[];
  students: Student[];
  alunosFinanceiros: AlunoFinanceiro[];
  historicoPagamentos: HistoricoPagamento[];
  planosGenericos: PlanoGenerico[];
  contratos: ContratoAluno[];
  loading: boolean;
  filtroStatus: string;
  viewMode: 'lista' | 'agrupado';
  expandedAlunos: Set<string>;
  expandedToggles: {[key: string]: {plano: boolean, material: boolean, matricula: boolean}};
}

export interface DialogState {
  isBoletoDialogOpen: boolean;
  isDespesaDialogOpen: boolean;
  isNovoPlanoDialogOpen: boolean;
  isParcelaAvulsaDialogOpen: boolean;
  editingBoleto: Boleto | null;
  editingDespesa: Despesa | null;
  alunoSelecionadoParcela: string | null;
}