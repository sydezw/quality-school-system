import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Tipo base da parcela
type ParcelaBase = Tables<'parcelas_alunos'>;

// Tipo estendido com dados do aluno e plano (para exibição)
export interface ParcelaComDetalhes extends ParcelaBase {
  aluno_nome?: string;
  plano_nome?: string;
  status_calculado?: StatusCalculado;
}

// Tipo para inserção de nova parcela
type NovaParcelaInput = TablesInsert<'parcelas_alunos'>;

// Tipo para atualização de parcela
type AtualizarParcelaInput = TablesUpdate<'parcelas_alunos'>;

// Status calculados automaticamente (agora usando enum)
export type StatusCalculado = 'pago' | 'pendente' | 'vencido' | 'cancelado';

// Filtros para busca
// Filtros para busca
export interface FiltrosParcelas {
  termo?: string; // Busca apenas por aluno.nome
  status?: StatusCalculado | 'todos';
  tipo?: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros' | 'todos';
  dataVencimentoInicio?: string; // Date em formato string
  dataVencimentoFim?: string; // Date em formato string
  idioma?: 'Inglês' | 'Japonês' | 'todos';
}

export const useParcelas = () => {
  const [parcelas, setParcelas] = useState<ParcelaComDetalhes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Função para calcular status automático
  const calcularStatusAutomatico = (parcela: ParcelaBase): StatusCalculado => {
    // Se tem data de pagamento, está pago
    if (parcela.data_pagamento) {
      return 'pago';
    }
    
    // Se status é cancelado
    if (parcela.status_pagamento === 'cancelado') {
      return 'cancelado';
    }
    
    // Verificar se está vencido
    const hoje = new Date();
    const dataVencimento = new Date(parcela.data_vencimento);
    
    if (dataVencimento < hoje) {
      return 'vencido';
    }
    
    return 'pendente';
  };

  // Função para buscar parcelas - Query com filtros implementados
  // Memoizar a função fetchParcelas para evitar re-renders desnecessários
  const fetchParcelas = useCallback(async (filtros?: FiltrosParcelas) => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar TODAS as parcelas usando paginação em lotes (como no StudentGroupingView)
      let allParcelas: any[] = [];
      let from = 0;
      const batchSize = 1000;
      
      while (true) {
        let query = supabase
          .from('parcelas_alunos')
          .select(`
            *,
            financeiro_alunos!inner(
              aluno_id,
              plano_id,
              alunos!inner(nome),
              planos!inner(nome)
            )
          `)
          .range(from, from + batchSize - 1);
        
        // Aplicar filtros
        if (filtros) {
          // Filtro por nome do aluno (busca parcial, case-insensitive)
          if (filtros.termo && filtros.termo.trim() !== '') {
            query = query.ilike('financeiro_alunos.alunos.nome', `%${filtros.termo.trim()}%`);
          }
          
          // Filtro por tipo de item
          if (filtros.tipo && filtros.tipo !== 'todos') {
            query = query.eq('tipo_item', filtros.tipo);
          }
          
          // Filtro por data de vencimento (início)
          if (filtros.dataVencimentoInicio) {
            query = query.gte('data_vencimento', filtros.dataVencimentoInicio);
          }
          
          // Filtro por data de vencimento (fim)
          if (filtros.dataVencimentoFim) {
            query = query.lte('data_vencimento', filtros.dataVencimentoFim);
          }
          
          // Filtro por idioma
          if (filtros.idioma && filtros.idioma !== 'todos') {
            query = query.eq('idioma_registro', filtros.idioma);
          }
        }
        
        // Ordenação por data de vencimento (mais recente primeiro)
        query = query.order('data_vencimento', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (!data || data.length === 0) break;
        
        allParcelas = [...allParcelas, ...data];
        
        if (data.length < batchSize) break; // Última página
        
        from += batchSize;
      }
      
      console.log(`=== DEBUG PARCELAS ===`);
      console.log(`Total de parcelas carregadas: ${allParcelas.length}`);
      console.log(`=== FIM DEBUG ===`);
      
      // Processar dados para incluir nomes do aluno e plano
      let parcelasProcessadas = allParcelas.map(parcela => ({
        ...parcela,
        aluno_nome: parcela.financeiro_alunos?.alunos?.nome,
        plano_nome: parcela.financeiro_alunos?.planos?.nome,
        status_calculado: calcularStatusAutomatico(parcela)
      }));
      
      // Aplicar filtro por status (após calcular status)
      if (filtros?.status && filtros.status !== 'todos') {
        parcelasProcessadas = parcelasProcessadas.filter(parcela => 
          calcularStatusAutomatico(parcela) === filtros.status
        );
      }
      
      setParcelas(parcelasProcessadas as ParcelaComDetalhes[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar parcelas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []); // Dependências vazias pois a função não depende de nenhum estado

  // Função para criar nova parcela
  const criarParcela = async (novaParcela: NovaParcelaInput) => {
    try {
      const { data, error } = await supabase
        .from('parcelas_alunos')
        .insert(novaParcela)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Parcela criada com sucesso!'
      });
      
      // Recarregar lista
      await fetchParcelas();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar parcela';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Função para atualizar parcela
  const atualizarParcela = async (id: number, atualizacao: AtualizarParcelaInput) => {
    try {
      const { data, error } = await supabase
        .from('parcelas_alunos')
        .update(atualizacao)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Parcela atualizada com sucesso!'
      });
      
      // Recarregar lista
      await fetchParcelas();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar parcela';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Função para marcar como pago
  const marcarComoPago = async (id: number, dataPagamento?: string, comprovante?: string) => {
    const atualizacao: AtualizarParcelaInput = {
      status_pagamento: 'pago',
      data_pagamento: dataPagamento || new Date().toISOString().split('T')[0], // Formato date
      comprovante: comprovante || null,
      atualizado_em: new Date().toISOString()
    };
    
    return await atualizarParcela(id, atualizacao);
  };

  // Função para excluir parcela
  const excluirParcela = async (id: number) => {
    try {
      const { error } = await supabase
        .from('parcelas_alunos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Parcela excluída com sucesso!'
      });
      
      // Recarregar lista
      await fetchParcelas();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir parcela';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Carregar parcelas na inicialização
  useEffect(() => {
    fetchParcelas();
  }, [fetchParcelas]);

  return {
    parcelas,
    loading,
    error,
    fetchParcelas,
    marcarComoPago,
    excluirParcela,
    calcularStatusAutomatico
  };
};