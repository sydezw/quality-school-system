import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { calcularMetricasParcelas } from '@/utils/parcelaCalculations';

type Aluno = Database['public']['Tables']['alunos']['Row'];
type Turma = Database['public']['Tables']['turmas']['Row'];
type Professor = Database['public']['Tables']['professores']['Row'];
type Contrato = Database['public']['Tables']['contratos']['Row'];
type FinanceiroAluno = Database['public']['Tables']['financeiro_alunos']['Row'];
type Despesa = Database['public']['Tables']['despesas']['Row'];

interface DashboardData {
  totalAlunos: number;
  totalTurmas: number;
  faturamentoMes: number;
  inadimplentes: number;
  professoresAtivos: number;
  contratosAtivos: number;
  aniversariantesHoje: number;
  receitasDespesas: { name: string; Receitas: number; Despesas: number }[];
  alunosPorIdioma: { name: string; value: number }[];
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAlunos: 0,
    totalTurmas: 0,
    faturamentoMes: 0,
    inadimplentes: 0,
    professoresAtivos: 0,
    contratosAtivos: 0,
    aniversariantesHoje: 0,
    receitasDespesas: [],
    alunosPorIdioma: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar dados de forma segura, com tipagem simplificada
      const [alunosResult, turmasResult, professoresResult, contratosResult, parcelasResult, financeirosResult, despesasResult] = await Promise.allSettled([
        supabase.from('alunos').select('nome, idioma, status, data_nascimento').eq('status', 'Ativo'),
        supabase.from('turmas').select('id'),
        supabase.from('professores').select('id'),
        supabase.from('contratos').select('id').eq('status_contrato', 'Ativo'),
        supabase.from('parcelas_alunos').select('status_pagamento, data_vencimento'),
        supabase.from('financeiro_alunos').select('status_geral, valor_total, created_at'),
        supabase.from('despesas').select('valor, data').gte('data', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
      ]);

      // Extrair dados de forma segura
      const alunos = alunosResult.status === 'fulfilled' && !alunosResult.value.error ? alunosResult.value.data : [];
      const turmas = turmasResult.status === 'fulfilled' && !turmasResult.value.error ? turmasResult.value.data : [];
      const professores = professoresResult.status === 'fulfilled' && !professoresResult.value.error ? professoresResult.value.data : [];
      const contratos = contratosResult.status === 'fulfilled' && !contratosResult.value.error ? contratosResult.value.data : [];
      const parcelas = parcelasResult.status === 'fulfilled' && !parcelasResult.value.error ? parcelasResult.value.data : [];
      const financeiros = financeirosResult.status === 'fulfilled' && !financeirosResult.value.error ? financeirosResult.value.data : [];
      const despesas = despesasResult.status === 'fulfilled' && !despesasResult.value.error ? despesasResult.value.data : [];

      // Calcular aniversariantes de hoje usando comparação de string
      const hoje = new Date();
      const diaHoje = String(hoje.getDate()).padStart(2, '0');
      const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
      
      const aniversariantesHoje = alunos && alunos.length > 0 
        ? alunos.filter(aluno => {
            if (!aluno.data_nascimento) return false;
            try {
              // Formato esperado: YYYY-MM-DD
              const [ano, mes, dia] = aluno.data_nascimento.split('-');
              return dia === diaHoje && mes === mesHoje;
            } catch {
              return false;
            }
          }).length
        : 0;
      
      // Calcular métricas financeiras usando função centralizada
      const inicioMes = new Date();
      inicioMes.setDate(1);
      
      // Converter parcelas para o formato esperado pela função
      const parcelasFormatadas = (parcelas || []).map((p, index) => ({
        id: `parcela-${index}`,
        data_vencimento: p.data_vencimento,
        status_pagamento: p.status_pagamento,
        tipo_item: 'mensalidade' as const,
        registro_financeiro_id: `reg-${index}`,
        valor: 0 // Valor não é usado no cálculo de métricas
      }));
      
      const metricas = calcularMetricasParcelas(parcelasFormatadas);
      const parcelasVencidasCount = metricas.parcelasVencidas;
      
      // Calcular receitas do mês (mantendo a lógica original)
      let receitasMesTotal = 0;
      if (financeiros && financeiros.length > 0) {
        financeiros.forEach(registro => {
          try {
            const dataCriacao = new Date(registro.created_at);
            
            if (registro.status_geral === 'Pago' && dataCriacao >= inicioMes) {
              receitasMesTotal += Number(registro.valor_total) || 0;
            }
          } catch (error) {
            // Ignorar registros com datas inválidas
          }
        });
      }

      // Processar alunos por idioma
      const alunosPorIdioma = alunos && alunos.length > 0 
        ? alunos.reduce((acc: { name: string; value: number }[], aluno) => {
            if (aluno.idioma) {
              const existing = acc.find((item) => item.name === aluno.idioma);
              if (existing) {
                existing.value += 1;
              } else {
                acc.push({ name: aluno.idioma, value: 1 });
              }
            }
            return acc;
          }, [])
        : [];

      // Gerar dados para gráfico de receitas vs despesas
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const receitasDespesas: { name: string; Receitas: number; Despesas: number }[] = [];
      const anoAtual = new Date().getFullYear();
      
      for (let mes = 0; mes < 12; mes++) {
        let receitasMes = 0;
        let despesasMes = 0;

        // Calcular receitas do mês
        if (financeiros && financeiros.length > 0) {
          receitasMes = financeiros
            .filter(r => {
              try {
                const dataReceita = new Date(r.created_at);
                return r.status_geral === 'Pago' && 
                       dataReceita.getMonth() === mes && 
                       dataReceita.getFullYear() === anoAtual;
              } catch {
                return false;
              }
            })
            .reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0);
        }

        // Calcular despesas do mês
        if (despesas && despesas.length > 0) {
          despesasMes = despesas
            .filter(d => {
              try {
                const dataDespesa = new Date(d.data);
                return dataDespesa.getUTCMonth() === mes && 
                       dataDespesa.getUTCFullYear() === anoAtual;
              } catch {
                return false;
              }
            })
            .reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
        }

        receitasDespesas.push({
          name: meses[mes],
          Receitas: receitasMes,
          Despesas: despesasMes
        });
      }

      // Atualizar estado com dados seguros
      setDashboardData({
        totalAlunos: alunos?.length || 0,
        totalTurmas: turmas?.length || 0,
        faturamentoMes: receitasMesTotal,
        inadimplentes: parcelasVencidasCount,
        professoresAtivos: professores?.length || 0,
        contratosAtivos: contratos?.length || 0,
        aniversariantesHoje,
        receitasDespesas,
        alunosPorIdioma
      });

    } catch (error) {
      // Em caso de erro, manter os valores zerados sem mostrar erro
      console.log('Dashboard carregado com valores padrão devido a:', error);
      
      // Gerar dados básicos para o gráfico mesmo sem dados do banco
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const receitasDespesas = meses.map(mes => ({
        name: mes,
        Receitas: 0,
        Despesas: 0
      }));

      setDashboardData({
        totalAlunos: 0,
        totalTurmas: 0,
        faturamentoMes: 0,
        inadimplentes: 0,
        professoresAtivos: 0,
        contratosAtivos: 0,
        aniversariantesHoje: 0,
        receitasDespesas,
        alunosPorIdioma: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Configurar subscriptions apenas se não houver erro
    const setupSubscriptions = () => {
      try {
        const parcelasChannel = supabase
          .channel('parcelas-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'parcelas_alunos'
            },
            () => fetchDashboardData()
          )
          .subscribe();

        const financeirosChannel = supabase
          .channel('financeiros-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'financeiro_alunos'
            },
            () => fetchDashboardData()
          )
          .subscribe();

        const despesasChannel = supabase
          .channel('despesas-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'despesas'
            },
            () => fetchDashboardData()
          )
          .subscribe();

        return () => {
          supabase.removeChannel(parcelasChannel);
          supabase.removeChannel(financeirosChannel);
          supabase.removeChannel(despesasChannel);
        };
      } catch (error) {
        console.log('Subscriptions não configuradas:', error);
        return () => {};
      }
    };

    const cleanup = setupSubscriptions();
    return cleanup;
  }, []);

  return { dashboardData, loading, refetch: fetchDashboardData };
};
