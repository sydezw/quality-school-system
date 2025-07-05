import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  totalAlunos: number;
  totalTurmas: number;
  faturamentoMes: number;
  inadimplentes: number;
  professoresAtivos: number;
  contratosAtivos: number;
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
    receitasDespesas: [],
    alunosPorIdioma: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      console.log('Carregando dados do dashboard...');
      setLoading(true);

      // Buscar total de alunos ativos
      const { data: alunos, error: alunosError } = await supabase
        .from('alunos')
        .select('idioma, status')
        .eq('status', 'Ativo');

      if (alunosError) throw alunosError;

      // Buscar total de turmas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('*');

      if (turmasError) throw turmasError;

      // Buscar professores
      const { data: professores, error: professoresError } = await supabase
        .from('professores')
        .select('*');

      if (professoresError) throw professoresError;

      // Buscar contratos ativos
      const { data: contratos, error: contratosError } = await supabase
        .from('contratos')
        .select('*')
        .eq('status', 'Ativo');

      if (contratosError) throw contratosError;

      // Buscar registros financeiros para calcular inadimplentes e receitas
      const { data: financeiros, error: financeirosError } = await supabase
        .from('financeiro_alunos')
        .select('*');

      if (financeirosError) throw financeirosError;

      // Calcular boletos vencidos e receitas do mês
      const hoje = new Date();
      const inicioMes = new Date();
      inicioMes.setDate(1);
      
      let boletosVencidosCount = 0;
      let receitasMesTotal = 0;
      
      financeiros?.forEach(registro => {
        const dataVencimento = new Date(registro.data_primeiro_vencimento);
        const dataCriacao = new Date(registro.created_at);
        
        // Contar boletos vencidos (status não pago e data vencida)
        if (registro.status_geral !== 'Pago' && dataVencimento < hoje) {
          boletosVencidosCount++;
        }
        
        // Somar receitas do mês (registros pagos criados no mês atual)
        if (registro.status_geral === 'Pago' && dataCriacao >= inicioMes) {
          receitasMesTotal += Number(registro.valor_total);
        }
      });

      // Buscar despesas para gráfico
      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('valor, data')
        .gte('data', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

      if (despesasError) throw despesasError;

      // Processar receitas do ano para o gráfico
      const receitasAno = financeiros?.filter(registro => {
        const dataCriacao = new Date(registro.created_at);
        return registro.status_geral === 'Pago' && dataCriacao.getFullYear() === new Date().getFullYear();
      }) || [];

      console.log('Receitas encontradas:', receitasAno?.length);
      console.log('Despesas encontradas:', despesas?.length);

      // Processar dados para alunos por idioma
      const alunosPorIdioma = alunos?.reduce((acc: any, aluno) => {
        const existing = acc.find((item: any) => item.name === aluno.idioma);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: aluno.idioma, value: 1 });
        }
        return acc;
      }, []) || [];

      // Processar dados para gráfico de receitas vs despesas (anual)
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const receitasDespesas = [];
      const anoAtual = new Date().getFullYear();
      
      for (let mes = 0; mes < 12; mes++) {
        const receitasMesCalc = receitasAno?.filter(r => {
          const dataReceita = new Date(r.created_at);
          return dataReceita.getMonth() === mes && dataReceita.getFullYear() === anoAtual;
        }).reduce((sum, r) => sum + Number(r.valor_total), 0) || 0;

        const despesasMes = despesas?.filter(d => {
          const dataDespesa = new Date(d.data);
          // Usar getUTCMonth para evitar problemas de fuso horário com datas no formato YYYY-MM-DD
          return dataDespesa.getUTCMonth() === mes && dataDespesa.getUTCFullYear() === anoAtual;
        }).reduce((sum, d) => sum + Number(d.valor), 0) || 0;

        receitasDespesas.push({
          name: meses[mes],
          Receitas: receitasMesCalc,
          Despesas: despesasMes
        });
      }

      console.log('Dados processados do gráfico:', receitasDespesas);

      setDashboardData({
        totalAlunos: alunos?.length || 0,
        totalTurmas: turmas?.length || 0,
        faturamentoMes: receitasMesTotal,
        inadimplentes: boletosVencidosCount,
        professoresAtivos: professores?.length || 0,
        contratosAtivos: contratos?.length || 0,
        receitasDespesas,
        alunosPorIdioma
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Configurar real-time subscriptions
    const financeirosChannel = supabase
      .channel('financeiros-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financeiro_alunos'
        },
        () => {
          console.log('Mudança detectada na tabela financeiro_alunos, atualizando dashboard...');
          fetchDashboardData();
        }
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
        () => {
          console.log('Mudança detectada na tabela despesas, atualizando dashboard...');
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(financeirosChannel);
      supabase.removeChannel(despesasChannel);
    };
  }, []);

  return { dashboardData, loading, refetch: fetchDashboardData };
};
