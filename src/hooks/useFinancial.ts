import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Boleto,
  Despesa,
  Student,
  AlunoFinanceiro,
  HistoricoPagamento,
  PlanoGenerico,
  ContratoAluno,
  ProgressoParcelas,
  StatusAluno,
  FinancialState,
  DialogState
} from '@/types/financial';

export const useFinancial = () => {
  const { toast } = useToast();

  // Estados principais
  const [state, setState] = useState<FinancialState>({
    boletos: [],
    despesas: [],
    students: [],
    alunosFinanceiros: [],
    historicoPagamentos: [],
    planosGenericos: [],
    contratos: [],
    loading: true,
    filtroStatus: 'todos',
    viewMode: 'agrupado', // Corrigido de 'ggrupauoado'
    expandedAlunos: new Set<string>(),
    expandedToggles: {}
  });

  // Estados dos dialogs
  const [dialogState, setDialogState] = useState<DialogState>({
    isBoletoDialogOpen: false,
    isDespesaDialogOpen: false,
    isNovoPlanoDialogOpen: false,
    isParcelaAvulsaDialogOpen: false,
    editingBoleto: null,
    editingDespesa: null,
    alunoSelecionadoParcela: null
  });

  // Funções de fetch
  const fetchBoletos = async () => {
    try {
      const { data, error } = await supabase
        .from('boletos')
        .select(`
          *,
          alunos (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const boletosFormatados = data?.map(boleto => ({
        id: boleto.id,
        aluno_id: boleto.aluno_id,
        data_vencimento: boleto.data_vencimento,
        valor: Number(boleto.valor),
        status: boleto.status,
        descricao: boleto.descricao,
        link_pagamento: boleto.link_pagamento,
        data_pagamento: boleto.data_pagamento,
        metodo_pagamento: boleto.metodo_pagamento,
        observacoes: boleto.observacoes,
        numero_parcela: boleto.numero_parcela,
        contrato_id: boleto.contrato_id,
        alunos: boleto.alunos
      })) || [];
      
      setState(prev => ({ ...prev, boletos: boletosFormatados }));
    } catch (error) {
      console.error('Erro ao buscar boletos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os boletos.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setState(prev => ({ ...prev, despesas: data || [] }));
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as despesas.",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, status')  // Incluir status para referência
        // .eq('status', 'Ativo')  // ← Remover este filtro
        .order('nome');

      if (error) throw error;
      setState(prev => ({ ...prev, students: data || [] }));
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const fetchHistoricoPagamentos = async () => {
    try {
      setState(prev => ({ ...prev, historicoPagamentos: [] }));
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      setState(prev => ({ ...prev, historicoPagamentos: [] }));
    }
  };

  const fetchContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          planos(nome)
        `)
        .eq('status_contrato', 'Ativo')
        .order('data_inicio', { ascending: false });
  
      if (error) throw error;
      
      // Mapear os dados para o tipo ContratoAluno
      const contratosFormatados = data?.map(contrato => ({
        id: contrato.id,
        aluno_id: contrato.aluno_id,
        valor_mensalidade: contrato.valor_mensalidade,
        data_inicio: contrato.data_inicio,
        data_fim: contrato.data_fim,
        status: contrato.status_contrato,
        plano_nome: contrato.planos?.nome || 'Plano não definido'
      })) || [];
      
      setState(prev => ({ ...prev, contratos: contratosFormatados }));
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      setState(prev => ({ ...prev, contratos: [] }));
    }
  };

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, valor_total, valor_por_aula, descricao')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setState(prev => ({ ...prev, planosGenericos: data || [] }));
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setState(prev => ({ ...prev, planosGenericos: [] }));
    }
  };

  // Função para processar alunos financeiros
  const processarAlunosFinanceiros = () => {
    const alunosMap = new Map<string, AlunoFinanceiro>();
    
    state.students.forEach(student => {
      alunosMap.set(student.id, {
        id: student.id,
        nome: student.nome,
        boletos: [],
        totalDividas: 0,
        boletosVencidos: 0,
        ultimoPagamento: undefined,
        historicoPagamentos: []
      });
    });

    state.boletos.forEach(boleto => {
      const aluno = alunosMap.get(boleto.aluno_id);
      if (aluno) {
        aluno.boletos.push(boleto);
        
        if (boleto.status !== 'Pago') {
          aluno.totalDividas += boleto.valor;
          
          const hoje = new Date();
          const vencimento = new Date(boleto.data_vencimento);
          if (vencimento < hoje) {
            aluno.boletosVencidos++;
          }
        }
      }
    });

    state.historicoPagamentos.forEach(historico => {
      const aluno = alunosMap.get(historico.aluno_id);
      if (aluno) {
        aluno.historicoPagamentos.push(historico);
        
        if (!aluno.ultimoPagamento || new Date(historico.data_pagamento) > new Date(aluno.ultimoPagamento)) {
          aluno.ultimoPagamento = historico.data_pagamento;
        }
      }
    });

    const alunosComDados = Array.from(alunosMap.values())
      .filter(aluno => aluno.boletos.length > 0 || aluno.historicoPagamentos.length > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome));

    setState(prev => ({ ...prev, alunosFinanceiros: alunosComDados }));
  };

  // Funções auxiliares
  const calcularProgressoParcelas = (alunoId: string): ProgressoParcelas => {
    const boletosAluno = state.boletos.filter(b => b.aluno_id === alunoId);
    const contratoAluno = state.contratos.find(c => c.aluno_id === alunoId);
    
    const totalParcelas = boletosAluno.length;
    const parcelasPagas = boletosAluno.filter(b => b.status === 'Pago').length;
    const valorTotalPlano = contratoAluno ? contratoAluno.valor_mensalidade * totalParcelas : boletosAluno.reduce((sum, b) => sum + b.valor, 0);
    const valorPago = boletosAluno.filter(b => b.status === 'Pago').reduce((sum, b) => sum + b.valor, 0);
    const percentualProgresso = totalParcelas > 0 ? (parcelasPagas / totalParcelas) * 100 : 0;
    
    return {
      total: totalParcelas,
      pagas: parcelasPagas,
      percentual: percentualProgresso,
      valor_total: valorTotalPlano,
      valor_pago: valorPago
    };
  };

  const obterStatusAluno = (alunoId: string): StatusAluno => {
    const boletosAluno = state.boletos.filter(b => b.aluno_id === alunoId);
    const hoje = new Date();
    
    const boletosVencidos = boletosAluno.filter(b => {
      const vencimento = new Date(b.data_vencimento);
      return b.status !== 'Pago' && vencimento < hoje;
    });
    
    const boletosPendentes = boletosAluno.filter(b => b.status === 'Pendente');
    
    if (boletosVencidos.length > 0) {
      return 'Inadimplente';
    }
    
    if (boletosPendentes.length > 0) {
      return 'Atrasado';
    }
    
    return 'Em dia';
  };

  const obterPlanoAluno = (alunoId: string): string => {
    const contratoAluno = state.contratos.find(c => c.aluno_id === alunoId);
    if (contratoAluno && contratoAluno.plano_nome) {
      return contratoAluno.plano_nome;
    }
    
    if (contratoAluno) {
      const valorMensal = contratoAluno.valor_mensalidade;
      if (valorMensal <= 100) return 'Plano Básico';
      if (valorMensal <= 150) return 'Plano Intermediário';
      return 'Plano Avançado';
    }
    
    return 'Plano não definido';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'pendente':
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'parcialmente pago':
      case 'Parcialmente Pago': return 'bg-blue-100 text-blue-800';
      case 'arquivado':
      case 'Arquivado': return 'bg-gray-100 text-gray-800';
      case 'vencido':
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Ações
  const marcarComoPago = async (boletoId: string, metodo: string = 'Dinheiro') => {
    try {
      const { data: registro, error: registroError } = await supabase
        .from('financeiro_alunos')
        .select('*')
        .eq('id', boletoId)
        .single();

      if (registroError) throw registroError;

      const dataAtual = new Date().toISOString().split('T')[0]; // Formato date

      const { error: updateError } = await supabase
        .from('financeiro_alunos')
        .update({
          status_geral: 'Pago', // Campo correto da tabela
          data_pagamento: dataAtual,
          forma_pagamento_plano: metodo // Campo correto da tabela
        })
        .eq('id', boletoId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Registro marcado como pago!",
      });

      setTimeout(async () => {
        await Promise.all([
          fetchBoletos(),
          fetchStudents(),
          fetchHistoricoPagamentos()
        ]);
      }, 300);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o registro como pago.",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await Promise.all([
      fetchBoletos(),
      fetchDespesas(),
      fetchStudents(),
      fetchHistoricoPagamentos(),
      fetchContratos(),
      fetchPlanos()
    ]);
  };

  // Effects
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (state.boletos.length > 0 && state.students.length > 0) {
      processarAlunosFinanceiros();
    }
  }, [state.boletos, state.students, state.historicoPagamentos]);

  return {
    // Estados
    state,
    setState,
    dialogState,
    setDialogState,
    
    // Forms removidos
    
    // Funções de fetch
    fetchBoletos,
    fetchDespesas,
    fetchStudents,
    fetchHistoricoPagamentos,
    fetchContratos,
    fetchPlanos,
    refreshData,
    
    // Funções auxiliares
    calcularProgressoParcelas,
    obterStatusAluno,
    obterPlanoAluno,
    getStatusColor,
    
    // Ações
    marcarComoPago,
    
    // Toast
    toast
  };
};

const fetchStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('alunos')
      .select('id, nome, status')  // Incluir status para referência
      // .eq('status', 'Ativo')  // ← Remover este filtro
      .order('nome');

    if (error) throw error;
    setState(prev => ({ ...prev, students: data || [] }));
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
  }
};