import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

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
  const [data, setData] = useState<DashboardData>({
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
        supabase.from('alunos').select('nome, idioma, status, data_nascimento'),
        supabase.from('turmas').select('id'),
        supabase.from('professores').select('id'),
        supabase.from('contratos').select('id').eq('status_contrato', 'Ativo'),
        supabase.from('alunos_parcelas').select('status_pagamento, data_vencimento, alunos_financeiro_id'),
        supabase.from('alunos_financeiro').select('id, status_geral, valor_total, created_at, aluno_id'),
        supabase.from('despesas').select('valor, data').gte('data', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
      ]);

      // Extrair dados com verificação de erro
      const alunos = alunosResult.status === 'fulfilled' ? alunosResult.value.data || [] : [];
      const turmas = turmasResult.status === 'fulfilled' ? turmasResult.value.data || [] : [];
      const professores = professoresResult.status === 'fulfilled' ? professoresResult.value.data || [] : [];
      const contratos = contratosResult.status === 'fulfilled' ? contratosResult.value.data || [] : [];
      const parcelas = parcelasResult.status === 'fulfilled' ? parcelasResult.value.data || [] : [];
      const financeiros = financeirosResult.status === 'fulfilled' ? financeirosResult.value.data || [] : [];
      const despesas = despesasResult.status === 'fulfilled' ? despesasResult.value.data || [] : [];

      // Calcular faturamento do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const fimMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0);
      
      const faturamentoMes = financeiros
        .filter(f => {
          const dataCreated = new Date(f.created_at);
          return dataCreated >= inicioMes && dataCreated <= fimMes;
        })
        .reduce((total, f) => total + (Number(f.valor_total) || 0), 0);

      // Calcular aniversariantes de hoje
      const hoje = new Date();
      const aniversariantesHoje = alunos.filter(aluno => {
        if (!aluno.data_nascimento) return false;
        const nascimento = new Date(aluno.data_nascimento);
        return nascimento.getDate() === hoje.getDate() && nascimento.getMonth() === hoje.getMonth();
      }).length;

      // Calcular inadimplentes (pessoas únicas com parcelas pendentes)
        let inadimplentesCount = 0;
        if (parcelas && parcelas.length > 0 && financeiros && financeiros.length > 0) {
          // Filtrar parcelas pendentes (não pagas)
          const parcelasPendentes = parcelas.filter(parcela => {
            return parcela.status_pagamento === 'pendente';
          });
          
          // Obter IDs únicos de registros financeiros com parcelas pendentes
          const registrosFinanceirosInadimplentes = new Set(
            parcelasPendentes.map(parcela => parcela.alunos_financeiro_id).filter(Boolean)
          );
          
          // Contar alunos únicos inadimplentes
          const alunosInadimplentes = new Set();
          financeiros.forEach(financeiro => {
            if (financeiro.id && registrosFinanceirosInadimplentes.has(financeiro.id)) {
              alunosInadimplentes.add(financeiro.aluno_id);
            }
          });
          
          inadimplentesCount = alunosInadimplentes.size;
        }

      // Calcular receitas do mês
      let receitasMesTotal = 0;
      if (financeiros && financeiros.length > 0) {
        financeiros.forEach(registro => {
          try {
            const dataRegistro = new Date(registro.created_at);
            if (dataRegistro >= inicioMes && dataRegistro <= fimMes) {
              receitasMesTotal += Number(registro.valor_total) || 0;
            }
          } catch (error) {
            console.warn('Erro ao processar data do registro financeiro:', error);
          }
        });
      }

      // Calcular despesas do mês
      const despesasMesTotal = despesas.reduce((total, despesa) => {
        return total + (Number(despesa.valor) || 0);
      }, 0);

      // Dados para gráfico de receitas vs despesas (últimos 6 meses)
      const receitasDespesas = [];
      for (let i = 5; i >= 0; i--) {
        const mes = new Date();
        mes.setMonth(mes.getMonth() - i);
        const inicioMesGrafico = new Date(mes.getFullYear(), mes.getMonth(), 1);
        const fimMesGrafico = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
        
        const receitasMes = financeiros
          .filter(f => {
            const dataCreated = new Date(f.created_at);
            return dataCreated >= inicioMesGrafico && dataCreated <= fimMesGrafico;
          })
          .reduce((total, f) => total + (Number(f.valor_total) || 0), 0);
        
        const despesasMes = despesas
          .filter(d => {
            const dataDespesa = new Date(d.data);
            return dataDespesa >= inicioMesGrafico && dataDespesa <= fimMesGrafico;
          })
          .reduce((total, d) => total + (Number(d.valor) || 0), 0);
        
        receitasDespesas.push({
          name: mes.toLocaleDateString('pt-BR', { month: 'short' }),
          Receitas: receitasMes,
          Despesas: despesasMes
        });
      }

      // Calcular alunos por idioma
      const idiomasCount = alunos.reduce((acc, aluno) => {
        const idioma = aluno.idioma || 'Não informado';
        acc[idioma] = (acc[idioma] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alunosPorIdioma = Object.entries(idiomasCount).map(([name, value]) => ({
        name,
        value
      }));

      setData({
        totalAlunos: alunos.length,
        totalTurmas: turmas.length,
        faturamentoMes,
        inadimplentes: inadimplentesCount,
        professoresAtivos: professores.length,
        contratosAtivos: contratos.length,
        aniversariantesHoje,
        receitasDespesas,
        alunosPorIdioma
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Configurar subscriptions para atualizações em tempo real
    const parcelasChannel = supabase
      .channel('alunos_parcelas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alunos_parcelas' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const financeirosChannel = supabase
      .channel('alunos_financeiro_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alunos_financeiro' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const despesasChannel = supabase
      .channel('despesas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(parcelasChannel);
      supabase.removeChannel(financeirosChannel);
      supabase.removeChannel(despesasChannel);
    };
  }, []);

  return { data, loading, refetch: fetchDashboardData };
};
