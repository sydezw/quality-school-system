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

      // Buscar boletos em atraso (inadimplentes)
      const hoje = new Date().toISOString().split('T')[0];
      const { data: boletosVencidos, error: boletosError } = await supabase
        .from('boletos')
        .select('*')
        .eq('status', 'Pendente')
        .lt('data_vencimento', hoje);

      if (boletosError) throw boletosError;

      // Buscar receitas do mês atual (boletos pagos)
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const { data: receitasMes, error: receitasError } = await supabase
        .from('boletos')
        .select('valor')
        .eq('status', 'Pago')
        .gte('created_at', inicioMes.toISOString());

      if (receitasError) throw receitasError;

      // Buscar despesas para gráfico
      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('valor, data')
        .gte('data', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

      if (despesasError) throw despesasError;

      // Buscar receitas para gráfico
      const { data: receitas, error: receitasGraficoError } = await supabase
        .from('boletos')
        .select('valor, created_at')
        .eq('status', 'Pago')
        .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

      if (receitasGraficoError) throw receitasGraficoError;

      console.log('Receitas encontradas:', receitas?.length);
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
        const receitasMesCalc = receitas?.filter(r => {
          const dataReceita = new Date(r.created_at);
          return dataReceita.getMonth() === mes && dataReceita.getFullYear() === anoAtual;
        }).reduce((sum, r) => sum + Number(r.valor), 0) || 0;

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

      // Calcular faturamento do mês
      const faturamentoMes = receitasMes?.reduce((sum, boleto) => sum + Number(boleto.valor), 0) || 0;

      setDashboardData({
        totalAlunos: alunos?.length || 0,
        totalTurmas: turmas?.length || 0,
        faturamentoMes,
        inadimplentes: boletosVencidos?.length || 0,
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
    const boletosChannel = supabase
      .channel('boletos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'boletos'
        },
        () => {
          console.log('Mudança detectada na tabela boletos, atualizando dashboard...');
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
      supabase.removeChannel(boletosChannel);
      supabase.removeChannel(despesasChannel);
    };
  }, []);

  return { dashboardData, loading, refetch: fetchDashboardData };
};
