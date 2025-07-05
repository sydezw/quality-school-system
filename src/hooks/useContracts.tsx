import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Interfaces
export interface Contract {
  id: string;
  aluno_id: string;
  aluno_nome?: string;
  data_inicio: string;
  data_fim: string;
  valor_mensalidade?: number; // Tornado opcional
  observacao?: string;
  status_contrato: 'Ativo' | 'Agendado' | 'Vencendo' | 'Vencido' | 'Cancelado';
  created_at?: string;
  updated_at?: string;
  situacao?: string; // Campo calculado
  dias_restantes?: number; // Campo calculado
}

export interface ContractFormData {
  aluno_id: string;
  data_inicio: string;
  data_fim: string;
  valor_mensalidade?: number; // Tornado opcional
  observacao?: string;
  plano_id?: string;
}

export interface ContractStats {
  total: number;
  agendados: number;
  ativos: number;
  vencendo: number;
  vencidos: number;
  cancelados: number;
  valorTotalMensal: number;
}

export interface ContractFilters {
  status?: 'all' | 'agendado' | 'ativo' | 'vencendo' | 'vencido' | 'cancelado';
  aluno_id?: string;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: number;
  valor_max?: number;
  search?: string;
}

export interface ContractsState {
  contracts: Contract[];
  filteredContracts: Contract[];
  stats: ContractStats;
  loading: boolean;
  error: string | null;
  filters: ContractFilters;
}

export const useContracts = () => {
  const { toast } = useToast();
  
  const [state, setState] = useState<ContractsState>({
    contracts: [],
    filteredContracts: [],
    stats: {
      total: 0,
      agendados: 0,
      ativos: 0,
      vencendo: 0,
      vencidos: 0,
      cancelados: 0,
      valorTotalMensal: 0
    },
    loading: true,
    error: null,
    filters: { status: 'all' }
  });

  // Função para calcular status baseado nas datas
  const calculateContractStatus = (dataInicio: string, dataFim: string, statusAtual: string): 'Ativo' | 'Agendado' | 'Vencendo' | 'Vencido' | 'Cancelado' => {
    if (statusAtual === 'Cancelado') return 'Cancelado';
    
    const hoje = new Date();
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (inicio > hoje) return 'Agendado';
    if (fim < hoje) return 'Vencido';
    
    const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 60) return 'Vencendo'; // Mudança: de 30 para 60 dias
    
    return 'Ativo';
  };

  // Função para recalcular campos de um contrato
  const recalculateContractFields = (contract: any) => {
    const calculatedStatus = calculateContractStatus(
      contract.data_inicio, 
      contract.data_fim, 
      contract.status_contrato
    );
    
    const hoje = new Date();
    const fim = new Date(contract.data_fim);
    const inicio = new Date(contract.data_inicio);
    const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    // Criar informação de situação baseada nos dias
    let situacaoInfo = '';
    if (calculatedStatus === 'Cancelado') {
      situacaoInfo = 'Cancelado';
    } else if (calculatedStatus === 'Agendado') {
      const diasParaInicio = Math.ceil((inicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      situacaoInfo = `Inicia em ${diasParaInicio} dias`;
    } else if (calculatedStatus === 'Vencido') {
      const diasVencido = Math.abs(diasRestantes);
      situacaoInfo = `Vencido há ${diasVencido} dias`;
    } else if (calculatedStatus === 'Vencendo') {
      situacaoInfo = `${diasRestantes} dias restantes`;
    } else {
      situacaoInfo = `${diasRestantes} dias restantes`;
    }

    return {
      ...contract,
      aluno_nome: contract.alunos?.nome,
      status_contrato: calculatedStatus, // Status com primeira letra maiúscula
      situacao: situacaoInfo, // Informação detalhada de dias
      dias_restantes: diasRestantes
    };
  };

  // Função para calcular estatísticas
  const calculateStats = (contracts: Contract[]) => {
    const stats = {
      total: contracts.length,
      agendados: contracts.filter(c => c.status_contrato === 'Agendado').length,
      ativos: contracts.filter(c => c.status_contrato === 'Ativo').length,
      vencendo: contracts.filter(c => c.status_contrato === 'Vencendo').length,
      vencidos: contracts.filter(c => c.status_contrato === 'Vencido').length,
      cancelados: contracts.filter(c => c.status_contrato === 'Cancelado').length,
      valorTotalMensal: contracts
        .filter(c => c.status_contrato === 'Ativo' || c.status_contrato === 'Vencendo')
        .reduce((total, contract) => total + (contract.valor_mensalidade || 0), 0) // Tratamento para valor opcional
    };
    
    setState(prev => ({ ...prev, stats }));
  };

  // Nova função para aplicar filtros com contratos específicos
  const applyFiltersWithContracts = (contracts: Contract[], filters: ContractFilters) => {
    let filtered = contracts;
    
    // Filtro por status
    if (filters.status && filters.status !== 'all') {
      // Converter o filtro para o formato correto (primeira letra maiúscula)
      const statusMap = {
        'agendado': 'Agendado',
        'ativo': 'Ativo', 
        'vencendo': 'Vencendo',
        'vencido': 'Vencido',
        'cancelado': 'Cancelado'
      };
      const statusToFilter = statusMap[filters.status as keyof typeof statusMap];
      filtered = filtered.filter(c => c.status_contrato === statusToFilter);
    }
    
    // Filtro por aluno
    if (filters.aluno_id) {
      filtered = filtered.filter(c => c.aluno_id === filters.aluno_id);
    }
    
    // Filtro por período
    if (filters.data_inicio) {
      filtered = filtered.filter(c => c.data_inicio >= filters.data_inicio!);
    }
    
    if (filters.data_fim) {
      filtered = filtered.filter(c => c.data_fim <= filters.data_fim!);
    }
    
    // Filtro por valor
    if (filters.valor_min) {
      filtered = filtered.filter(c => c.valor_mensalidade >= filters.valor_min!);
    }
    
    if (filters.valor_max) {
      filtered = filtered.filter(c => c.valor_mensalidade <= filters.valor_max!);
    }
    
    // Filtro por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.aluno_nome?.toLowerCase().includes(searchLower) ||
        c.observacao?.toLowerCase().includes(searchLower)
      );
    }
    
    setState(prev => ({ ...prev, filteredContracts: filtered }));
  };

  // Função para aplicar filtros
  const applyFilters = (filters: ContractFilters) => {
    setState(prev => ({ ...prev, filters }));
    applyFiltersWithContracts(state.contracts, filters);
  };

  // Função para buscar contratos
  const fetchContracts = async (): Promise<Contract[]> => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          id,
          aluno_id,
          data_inicio,
          data_fim,
          valor_mensalidade,
          observacao,
          status_contrato,
          created_at,
          updated_at,
          alunos!inner(nome)
        `)
        .order('data_inicio', { ascending: false });

      if (error) {
        console.error('Erro na query:', error);
        throw error;
      }

      // Recalcular campos para todos os contratos
      const contractsWithCalculatedFields = (data as any)?.map(recalculateContractFields) || [];

      setState(prev => ({
        ...prev,
        contracts: contractsWithCalculatedFields,
        loading: false,
        error: null
      }));

      // Recalcular estatísticas
      calculateStats(contractsWithCalculatedFields);
      
      // Reaplicar filtros com dados atualizados
      applyFiltersWithContracts(contractsWithCalculatedFields, state.filters);
      
      return contractsWithCalculatedFields;
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar contratos'
      }));
      return [];
    }
  };

  // Função para criar contrato
  const createContract = async (contractData: ContractFormData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contratos')
        .insert({
          ...contractData,
          status_contrato: 'Ativo',
          valor_mensalidade: contractData.valor_mensalidade || 0 // Valor padrão se não fornecido
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso!",
      });
      
      await fetchContracts();
      return true;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o contrato.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Função para atualizar contrato
  const updateContract = async (contractId: string, contractData: Partial<ContractFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contratos')
        .update({
          ...contractData,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contrato atualizado com sucesso!",
      });
      
      // Recarregar contratos para recalcular campos
      await fetchContracts();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contrato. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Função para excluir contrato
  const deleteContract = async (contractId: string): Promise<boolean> => {
    try {
      // Verificar se o contrato existe
      const { data: contractExists, error: checkError } = await supabase
        .from('contratos')
        .select('id')
        .eq('id', contractId)
        .single();

      if (checkError || !contractExists) {
        throw new Error('Contrato não encontrado.');
      }

      // Executar a exclusão
      const { error: deleteError } = await supabase
        .from('contratos')
        .delete()
        .eq('id', contractId);

      if (deleteError) throw deleteError;

      toast({
        title: "Sucesso",
        description: "Contrato excluído com sucesso!",
      });
      
      await fetchContracts();
      return true;
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contrato.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Função para encerrar contrato
  const terminateContract = async (contractId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contratos')
        .update({ 
          status_contrato: 'Cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contrato cancelado com sucesso!"
      });
      await fetchContracts();
      return true;
    } catch (error) {
      console.error('Erro ao cancelar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar contrato",
        variant: "destructive"
      });
      return false;
    }
  };

  // Função para renovar contrato
  const renewContract = async (contract: Contract): Promise<boolean> => {
    try {
      // Calcular nova data de fim (adicionar 1 ano à data de fim atual)
      const currentEndDate = new Date(contract.data_fim);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      // Criar observação com informações de renovação
      const dataInicioFormatada = new Date(contract.data_inicio).toLocaleDateString('pt-BR');
      const dataRenovacaoFormatada = newEndDate.toLocaleDateString('pt-BR');
      const dataHoje = new Date().toLocaleDateString('pt-BR');
      
      const novaObservacao = contract.observacao 
        ? `${contract.observacao}\n\n[RENOVAÇÃO ${dataHoje}] Contrato renovado até ${dataRenovacaoFormatada}`
        : `[CONTRATO INICIADO ${dataInicioFormatada}]\n[RENOVAÇÃO ${dataHoje}] Contrato renovado até ${dataRenovacaoFormatada}`;

      // Atualizar contrato
      const { error: contractError } = await supabase
        .from('contratos')
        .update({ 
          data_fim: newEndDate.toISOString().split('T')[0],
          observacao: novaObservacao,
          status_contrato: 'Ativo'
        })
        .eq('id', contract.id);

      if (contractError) throw contractError;

      // Ativar aluno se estiver inativo
      const { error: alunoError } = await supabase
        .from('alunos')
        .update({ status: 'Ativo' })
        .eq('id', contract.aluno_id);

      if (alunoError) throw alunoError;

      toast({
        title: "Sucesso",
        description: "Contrato renovado e aluno ativado com sucesso!",
      });
      
      await fetchContracts();
      return true;
    } catch (error) {
      console.error('Erro ao renovar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renovar o contrato.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Função para renovar múltiplos contratos
  const renewMultipleContracts = async (contractIds: string[]): Promise<boolean> => {
    try {
      let successCount = 0;
      
      for (const contractId of contractIds) {
        const contract = state.contracts.find(c => c.id === contractId);
        if (contract) {
          const success = await renewContract(contract);
          if (success) successCount++;
        }
      }
      
      toast({
        title: "Renovação em Lote",
        description: `${successCount} de ${contractIds.length} contratos renovados com sucesso!`,
      });
      
      return successCount === contractIds.length;
    } catch (error) {
      console.error('Erro na renovação em lote:', error);
      return false;
    }
  };

  // Função para buscar contratos por aluno
  const getContractsByStudent = (alunoId: string): Contract[] => {
    return state.contracts.filter(c => c.aluno_id === alunoId);
  };

  // Função para buscar contratos vencendo
  const getExpiringContracts = (days: number = 60): Contract[] => {
    return state.contracts.filter(c => 
      c.dias_restantes !== undefined && 
      c.dias_restantes <= days && 
      c.dias_restantes > 0 &&
      c.situacao === 'vencendo'
    );
  };

  // Função para buscar contratos vencidos
  const getExpiredContracts = (): Contract[] => {
    return state.contracts.filter(c => c.situacao === 'vencido');
  };

  // Função para buscar contratos agendados
  const getScheduledContracts = (): Contract[] => {
    return state.contracts.filter(c => c.situacao === 'agendado');
  };

  // Função para buscar contratos cancelados
  const getCancelledContracts = (): Contract[] => {
    return state.contracts.filter(c => c.situacao === 'cancelado');
  };

  // Effect para carregar contratos na inicialização
  useEffect(() => {
    fetchContracts();
  }, []);

  // Effect para aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters(state.filters);
  }, [state.contracts, state.filters]);

  return {
    // Estado
    contracts: state.filteredContracts,
    allContracts: state.contracts,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    
    // Ações CRUD
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    
    // Ações específicas
    terminateContract,
    renewContract,
    renewMultipleContracts,
    
    // Filtros e busca
    applyFilters,
    
    // Utilitários
    getContractsByStudent,
    getExpiringContracts,
    getExpiredContracts,
    getScheduledContracts,
    getCancelledContracts,
    calculateStats,
    calculateContractStatus
  };
};