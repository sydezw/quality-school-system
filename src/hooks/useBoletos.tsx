import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Boleto {
  id: string;
  aluno_id: string;
  data_vencimento: string;
  valor: number;
  status: 'Pendente' | 'Pago' | 'Vencido';
  descricao: string;
  link_pagamento?: string | null;
  data_pagamento?: string | null;
  metodo_pagamento?: string | null;
  observacoes?: string | null;
  numero_parcela?: number;
  tipo_cobranca: 'plano' | 'material' | 'matricula';
  financeiro_id: string;
  alunos?: { nome: string };
  planos?: { nome: string };
}

export interface CriarBoletoData {
  aluno_id: string;
  valor: number;
  data_vencimento: string;
  descricao: string;
  tipo_cobranca: 'plano' | 'material' | 'matricula';
  numero_parcela?: number;
  observacoes?: string;
}

export const useBoletos = () => {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBoletos = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da tabela financeiro_alunos
      const { data: financeiros, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          *,
          alunos (nome),
          planos (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Converter registros financeiros em boletos
      const boletosConvertidos: Boleto[] = [];
      
      financeiros?.forEach(registro => {
        const hoje = new Date();
        const dataVencimento = new Date(registro.data_primeiro_vencimento);
        
        // Gerar boletos para plano (se valor > 0)
        if (registro.valor_plano > 0) {
          for (let i = 0; i < registro.numero_parcelas_plano; i++) {
            const dataVencimentoParcela = new Date(dataVencimento);
            dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + i);
            
            let status: 'Pendente' | 'Pago' | 'Vencido' = 'Pendente';
            if (registro.status_geral === 'Pago') {
              status = 'Pago';
            } else if (dataVencimentoParcela < hoje) {
              status = 'Vencido';
            }
            
            boletosConvertidos.push({
              id: `${registro.id}-plano-${i + 1}`,
              aluno_id: registro.aluno_id,
              data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
              valor: registro.valor_plano / registro.numero_parcelas_plano,
              status,
              descricao: `Plano ${registro.planos?.nome || 'N/A'} - Parcela ${i + 1}/${registro.numero_parcelas_plano}`,
              metodo_pagamento: registro.forma_pagamento_plano,
              numero_parcela: i + 1,
              tipo_cobranca: 'plano',
              financeiro_id: registro.id,
              alunos: registro.alunos,
              planos: registro.planos
            });
          }
        }
        
        // Gerar boletos para material (se valor > 0)
        if (registro.valor_material > 0) {
          for (let i = 0; i < registro.numero_parcelas_material; i++) {
            const dataVencimentoParcela = new Date(dataVencimento);
            dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + i);
            
            let status: 'Pendente' | 'Pago' | 'Vencido' = 'Pendente';
            if (registro.status_geral === 'Pago') {
              status = 'Pago';
            } else if (dataVencimentoParcela < hoje) {
              status = 'Vencido';
            }
            
            boletosConvertidos.push({
              id: `${registro.id}-material-${i + 1}`,
              aluno_id: registro.aluno_id,
              data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
              valor: registro.valor_material / registro.numero_parcelas_material,
              status,
              descricao: `Material - Parcela ${i + 1}/${registro.numero_parcelas_material}`,
              metodo_pagamento: registro.forma_pagamento_material,
              numero_parcela: i + 1,
              tipo_cobranca: 'material',
              financeiro_id: registro.id,
              alunos: registro.alunos,
              planos: registro.planos
            });
          }
        }
        
        // Gerar boletos para matrícula (se valor > 0)
        if (registro.valor_matricula > 0) {
          for (let i = 0; i < registro.numero_parcelas_matricula; i++) {
            const dataVencimentoParcela = new Date(dataVencimento);
            dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + i);
            
            let status: 'Pendente' | 'Pago' | 'Vencido' = 'Pendente';
            if (registro.status_geral === 'Pago') {
              status = 'Pago';
            } else if (dataVencimentoParcela < hoje) {
              status = 'Vencido';
            }
            
            boletosConvertidos.push({
              id: `${registro.id}-matricula-${i + 1}`,
              aluno_id: registro.aluno_id,
              data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
              valor: registro.valor_matricula / registro.numero_parcelas_matricula,
              status,
              descricao: `Matrícula - Parcela ${i + 1}/${registro.numero_parcelas_matricula}`,
              metodo_pagamento: registro.forma_pagamento_matricula,
              numero_parcela: i + 1,
              tipo_cobranca: 'matricula',
              financeiro_id: registro.id,
              alunos: registro.alunos,
              planos: registro.planos
            });
          }
        }
      });
      
      // Ordenar boletos por data de vencimento
      boletosConvertidos.sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());
      
      setBoletos(boletosConvertidos);
    } catch (error) {
      console.error('Erro ao buscar boletos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os boletos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoPago = async (boletoId: string, metodoPagamento: string = 'Dinheiro') => {
    try {
      // Extrair informações do ID do boleto
      const [financeiroId, tipoCobranca, numeroParcela] = boletoId.split('-');
      
      // Buscar o registro financeiro
      const { data: registro, error: fetchError } = await supabase
        .from('financeiro_alunos')
        .select('*')
        .eq('id', financeiroId)
        .single();

      if (fetchError) throw fetchError;

      // Verificar se todas as parcelas foram pagas para atualizar status geral
      const boleto = boletos.find(b => b.id === boletoId);
      if (!boleto) throw new Error('Boleto não encontrado');
      
      // Atualizar o método de pagamento específico
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (tipoCobranca === 'plano') {
        updateData.forma_pagamento_plano = metodoPagamento;
      } else if (tipoCobranca === 'material') {
        updateData.forma_pagamento_material = metodoPagamento;
      } else if (tipoCobranca === 'matricula') {
        updateData.forma_pagamento_matricula = metodoPagamento;
      }
      
      // Verificar se todas as parcelas do aluno estão pagas
      const boletosAluno = boletos.filter(b => b.financeiro_id === financeiroId);
      const boletosNaoPagos = boletosAluno.filter(b => b.status !== 'Pago' && b.id !== boletoId);
      
      if (boletosNaoPagos.length === 0) {
        updateData.status_geral = 'Pago';
      } else {
        updateData.status_geral = 'Parcialmente Pago';
      }

      const { error: updateError } = await supabase
        .from('financeiro_alunos')
        .update(updateData)
        .eq('id', financeiroId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Boleto marcado como pago!",
      });

      // Recarregar boletos
      await fetchBoletos();
    } catch (error) {
      console.error('Erro ao marcar boleto como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o boleto como pago.",
        variant: "destructive",
      });
    }
  };

  const criarBoletoAvulso = async (data: CriarBoletoData) => {
    try {
      // Criar um registro financeiro específico para boleto avulso
      const registroFinanceiro = {
        aluno_id: data.aluno_id,
        plano_id: null, // Boleto avulso não tem plano
        valor_plano: data.tipo_cobranca === 'plano' ? data.valor : 0,
        valor_material: data.tipo_cobranca === 'material' ? data.valor : 0,
        valor_matricula: data.tipo_cobranca === 'matricula' ? data.valor : 0,
        desconto_total: 0,
        valor_total: data.valor,
        status_geral: 'Pendente',
        data_primeiro_vencimento: data.data_vencimento,
        forma_pagamento_plano: data.tipo_cobranca === 'plano' ? 'boleto' : 'boleto',
        forma_pagamento_material: data.tipo_cobranca === 'material' ? 'boleto' : 'boleto',
        forma_pagamento_matricula: data.tipo_cobranca === 'matricula' ? 'boleto' : 'boleto',
        numero_parcelas_plano: data.tipo_cobranca === 'plano' ? (data.numero_parcela || 1) : 1,
        numero_parcelas_material: data.tipo_cobranca === 'material' ? (data.numero_parcela || 1) : 1,
        numero_parcelas_matricula: data.tipo_cobranca === 'matricula' ? (data.numero_parcela || 1) : 1
      };

      const { error } = await supabase
        .from('financeiro_alunos')
        .insert([registroFinanceiro]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Boleto criado com sucesso!",
      });

      // Recarregar boletos
      await fetchBoletos();
    } catch (error) {
      console.error('Erro ao criar boleto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o boleto.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBoletos();
  }, []);

  return {
    boletos,
    loading,
    fetchBoletos,
    marcarComoPago,
    criarBoletoAvulso
  };
};