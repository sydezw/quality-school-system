import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  Search,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGroqPDF } from '@/hooks/useGroqPDF';
import { formatDate } from '@/utils/formatters';
import { calcularNumeroPorTipo, calcularProximosVencimentos, type ParcelaBasica } from '@/utils/parcelaCalculations';
import { buscarAlunosSemCiclos } from '@/utils/alunosSemCiclos';
import { CycleManager } from './CycleManager';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import Chart from 'react-apexcharts';

// Interfaces
interface ParcelaDetalhada {
  id: number;
  alunos_financeiro_id: string | null;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status_pagamento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'avulso' | 'outros';
  descricao_item?: string | null;
  idioma_registro: 'Inglês' | 'Japonês';
  aluno_nome?: string;
  plano_nome?: string;
  forma_pagamento?: string;
  observacoes?: string | null;
  alunos_financeiro?: {
    alunos?: { nome: string };
    planos?: { nome: string };
  };
  fonte?: 'alunos_parcelas' | 'parcelas_migracao_raw';
}

interface ProximoVencimentoRegistro {
  id: number;
  alunoNome: string;
  valor: number;
  dataVencimento: string;
  diasRestantes: number;
  tipoItem: string;
  numeroParcela: number;
  planoNome?: string;
  status: string;
}

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: 'salário' | 'aluguel' | 'material' | 'manutenção';
  data: string;
  status: 'Pago' | 'Pendente';
}

interface Ciclo {
  aluno_id: string;
  aluno_nome: string;
  inicio_ciclo: string;
  final_ciclo: string;
  total_parcelas: number;
  parcelas_pagas: number;
  valor_total_ciclo: number;
  status_ciclo: 'ativo' | 'vencido';
}

// Novas interfaces para os gráficos
interface ReceitaMensal {
  mes: string;
  receita: number;
  receitaAcumulada: number;
}

interface VariacaoSaldo {
  categoria: string;
  valor: number;
  tipo: 'entrada' | 'saida' | 'saldo';
}

interface ReceitaPorIdioma {
  idioma: string;
  receita: number;
}

const FinancialReportsTable = () => {
  const { toast } = useToast();
  const { gerarRelatorioPDF } = useGroqPDF();
  const [loading, setLoading] = useState(true);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Callback otimizado para o onChange do input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  const [anoFiltro, setAnoFiltro] = useState<string>('todos');
  const [tipoParcelaFiltro, setTipoParcelaFiltro] = useState<'todas' | 'ativas' | 'migradas' | 'migradas_ativas'>('todas');
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [ciclos, setCiclosAtivos] = useState<Ciclo[]>([]);
  const [filtroCiclo, setFiltroCiclo] = useState<'ativos' | 'quase_encerrados' | 'encerrados' | ''>('');
  const [searchCiclosTerm, setSearchCiclosTerm] = useState('');
  const [debouncedSearchCiclosTerm, setDebouncedSearchCiclosTerm] = useState('');
  const [alunosSemCiclos, setAlunosSemCiclos] = useState<{id: string, nome: string}[]>([]);
  const [mostrandoAlunosSemCiclos, setMostrandoAlunosSemCiclos] = useState(false);
  const [paginaAlunosSemCiclos, setPaginaAlunosSemCiclos] = useState(1);

  const alunosPorPagina = 15;
  const [parcelas, setParcelas] = useState<ParcelaDetalhada[]>([]);
  const [proximosVencimentosRegistros, setProximosVencimentosRegistros] = useState<ProximoVencimentoRegistro[]>([]);
  const [paginaAtualVencimentos, setPaginaAtualVencimentos] = useState(1);
  const [searchVencimentosTerm, setSearchVencimentosTerm] = useState('');
  const itensVencimentosPorPagina = 10;
  
  // Estados para paginação da tabela de registros
  const [currentPageRegistros, setCurrentPageRegistros] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  
  // Novos estados para os gráficos
  const [receitaMensal, setReceitaMensal] = useState<ReceitaMensal[]>([]);
  const [variacaoSaldo, setVariacaoSaldo] = useState<VariacaoSaldo[]>([]);
  const [receitaPorIdioma, setReceitaPorIdioma] = useState<ReceitaPorIdioma[]>([]);
  




  // Função para buscar dados de parcelas das duas tabelas
  const buscarDadosRegistros = async (tipoParcela: 'todas' | 'ativas' | 'migradas_ativas' | 'migradas' = tipoParcelaFiltro) => {
    try {
      let dadosCombinados: ParcelaDetalhada[] = [];
      let allParcelasMigracao: any[] = [];
      
      // Buscar dados de parcelas ativas se necessário (apenas registros não migrados)
      if (tipoParcela === 'todas' || tipoParcela === 'ativas') {
        const { data: parcelasAlunosData, error: errorParcelas } = await supabase
          .from('alunos_parcelas')
          .select(`
            id, alunos_financeiro_id, numero_parcela, valor,
            data_vencimento, data_pagamento, status_pagamento,
            tipo_item, forma_pagamento, idioma_registro,
            descricao_item, observacoes, nome_aluno,
            alunos_financeiro!inner (
              aluno_id, ativo_ou_encerrado, migrado,
              alunos (nome, status),
              planos (nome)
            )
          `)
          .eq('alunos_financeiro.ativo_ou_encerrado', true)
          .eq('alunos_financeiro.migrado', false)
          .eq('alunos_financeiro.alunos.status', 'Ativo')
          .eq('historico', false)
          .limit(10000); // Aumentar limite para garantir que todas as parcelas sejam carregadas

        if (errorParcelas) {
          console.error('Erro ao buscar parcelas ativas:', errorParcelas);
        } else if (parcelasAlunosData) {
          // Normalizar dados das parcelas ativas
          const parcelasNormalizadas = parcelasAlunosData.map(parcela => ({
            ...parcela,
            aluno_nome: parcela.nome_aluno || parcela.alunos_financeiro?.alunos?.nome || 'N/A',
            plano_nome: parcela.alunos_financeiro?.planos?.nome || 'N/A',
            fonte: 'alunos_parcelas' as const
          }));
          dadosCombinados = [...dadosCombinados, ...parcelasNormalizadas];
        }
      }

      // Buscar dados de parcelas migradas se necessário
      if (tipoParcela === 'todas' || tipoParcela === 'migradas_ativas' || tipoParcela === 'migradas') {
        // Carregar todas as parcelas migradas usando paginação em lotes
        let from = 0;
        const batchSize = 1000;
        
        while (true) {
          const { data: parcelasMigracaoData, error: errorMigracao } = await supabase
            .from('parcelas_migracao_raw')
            .select(`
              id, aluno_nome, valor, data_vencimento,
              data_pagamento, status_pagamento, tipo_item,
              idioma, forma_pagamento, observacoes
            `)
            .range(from, from + batchSize - 1)
            .order('data_vencimento', { ascending: false });
          
          if (errorMigracao) {
            console.error('Erro ao buscar parcelas migradas:', errorMigracao);
            break;
          }
          
          if (!parcelasMigracaoData || parcelasMigracaoData.length === 0) break;
          
          allParcelasMigracao = [...allParcelasMigracao, ...parcelasMigracaoData];
          
          if (parcelasMigracaoData.length < batchSize) break; // Última página
          
          from += batchSize;
        }

        if (allParcelasMigracao.length > 0) {
          // Normalizar dados das parcelas migradas
          const parcelasNormalizadas = allParcelasMigracao.map(parcela => ({
            id: parcela.id,
            alunos_financeiro_id: null,
            numero_parcela: 1, // Parcelas migradas não têm numeração específica
            valor: parcela.valor,
            data_vencimento: parcela.data_vencimento,
            data_pagamento: parcela.data_pagamento,
            status_pagamento: parcela.status_pagamento,
            tipo_item: parcela.tipo_item as 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'avulso' | 'outros',
            descricao_item: null,
            idioma_registro: parcela.idioma as 'Inglês' | 'Japonês',
            aluno_nome: parcela.aluno_nome || 'N/A',
            plano_nome: 'Plano Migrado',
            forma_pagamento: parcela.forma_pagamento,
            observacoes: parcela.observacoes,
            fonte: 'parcelas_migracao_raw' as const
          }));
          dadosCombinados = [...dadosCombinados, ...parcelasNormalizadas];
        }
      }

      // Ordenar por data de vencimento (mais recentes primeiro) e depois por nome do aluno (alfabética)
      dadosCombinados.sort((a, b) => {
        const dataA = new Date(a.data_vencimento);
        const dataB = new Date(b.data_vencimento);
        if (dataA.getTime() !== dataB.getTime()) {
          return dataB.getTime() - dataA.getTime();
        }
        // Ordenação secundária por nome do aluno
        return (a.aluno_nome || '').localeCompare(b.aluno_nome || '', 'pt-BR');
      });

      setParcelas(dadosCombinados);
      
      // Calcular próximos vencimentos
      calcularProximosVencimentosLocal(dadosCombinados);
      
      return dadosCombinados;
    } catch (error) {
      console.error('Erro ao buscar dados das parcelas:', error);
      setParcelas([]);
      setProximosVencimentosRegistros([]);
      return [];
    }
  };

  // Função para buscar despesas
  const buscarDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Erro ao buscar despesas:', error);
        setDespesas([]);
        return;
      }
      
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      setDespesas([]);
    }
  };

  const buscarCiclosAtivos = async () => {
    try {
      // Buscar ciclos que estão ativos ou terminaram nos últimos 90 dias
      const hoje = new Date();
      const noventaDiasAtras = new Date(hoje.getTime() - (90 * 24 * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('alunos_parcelas')
        .select(`
          inicio_ciclo, final_ciclo, valor, status_pagamento,
          alunos_financeiro!inner (
            aluno_id,
            alunos (nome)
          )
        `)
        .not('inicio_ciclo', 'is', null)
        .not('final_ciclo', 'is', null)
        .eq('historico', false)
        .gte('final_ciclo', noventaDiasAtras.toISOString().split('T')[0]);
      
      if (error) {
        console.error('Erro ao buscar ciclos ativos:', error);
        setCiclosAtivos([]);
        return;
      }
      
      // Agrupar por aluno e ciclo
      const ciclosAgrupados = new Map<string, Ciclo>();
      
      data?.forEach(parcela => {
        const chave = `${parcela.alunos_financeiro?.aluno_id}-${parcela.inicio_ciclo}-${parcela.final_ciclo}`;
        const alunoNome = parcela.alunos_financeiro?.alunos?.nome || 'N/A';
        
        if (!ciclosAgrupados.has(chave)) {
          const hoje = new Date();
          const inicioCiclo = new Date(parcela.inicio_ciclo);
          const finalCiclo = new Date(parcela.final_ciclo);
          
          let statusCiclo: 'ativo' | 'vencido';
          if (hoje >= inicioCiclo && hoje <= finalCiclo) {
            statusCiclo = 'ativo';
          } else {
            statusCiclo = 'vencido';
          }
          
          ciclosAgrupados.set(chave, {
            aluno_id: parcela.alunos_financeiro?.aluno_id || '',
            aluno_nome: alunoNome,
            inicio_ciclo: parcela.inicio_ciclo,
            final_ciclo: parcela.final_ciclo,
            total_parcelas: 0,
            parcelas_pagas: 0,
            valor_total_ciclo: 0,
            status_ciclo: statusCiclo
          });
        }
        
        const ciclo = ciclosAgrupados.get(chave)!;
        ciclo.total_parcelas += 1;
        ciclo.valor_total_ciclo += Number(parcela.valor);
        
        if (parcela.status_pagamento === 'pago') {
          ciclo.parcelas_pagas += 1;
        }
      });
      
      setCiclosAtivos(Array.from(ciclosAgrupados.values()));
    } catch (error) {
      console.error('Erro ao buscar ciclos ativos:', error);
      setCiclosAtivos([]);
    }
  };



  // Função para calcular próximos vencimentos usando a função centralizada
  const calcularProximosVencimentosLocal = (todasParcelas: ParcelaDetalhada[]) => {
    const proximosVencimentos = calcularProximosVencimentos(todasParcelas, 30)
      .map(parcela => {
        const dataVencimento = new Date(parcela.data_vencimento);
        const hoje = new Date();
        const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: parcela.id,
          alunoNome: (parcela as any).aluno_nome || 'N/A',
          valor: parcela.valor,
          dataVencimento: parcela.data_vencimento,
          diasRestantes,
          tipoItem: (parcela as any).tipo_item,
          numeroParcela: (parcela as any).numero_parcela,
          planoNome: (parcela as any).plano_nome || 'N/A',
          status: (parcela as any).status_pagamento
        };
      });

    setProximosVencimentosRegistros(proximosVencimentos);
    // Resetar página dos vencimentos quando os dados mudarem
    setPaginaAtualVencimentos(1);
  };

  // Função para lidar com mudança do filtro de tipo de parcela
  const handleTipoParcelaChange = async (novoTipo: 'todas' | 'ativas' | 'migradas' | 'migradas_ativas') => {
    setTipoParcelaFiltro(novoTipo);
    await carregarDados(novoTipo);
  };

  // Função para carregar todos os dados
  const carregarDados = async (tipoParcela: 'todas' | 'ativas' | 'migradas' | 'migradas_ativas' = tipoParcelaFiltro) => {
    setLoading(true);
    try {
      await buscarDadosRegistros(tipoParcela);
      await buscarDespesas();
      await buscarCiclosAtivos();
      const alunosSemCiclosData = await buscarAlunosSemCiclos();
      setAlunosSemCiclos(alunosSemCiclosData);
      await buscarDadosGraficos();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };



  // Função para exportar dados em PDF
  const exportarDados = async () => {
    setExportandoPDF(true);
    try {
      // Usar dados reais de parcelas filtradas
      const parcelasParaPDF = parcelasFiltradas;
      
      // Calcular estatísticas reais
      const totalParcelas = parcelasParaPDF.length;
      const parcelasPagas = parcelasParaPDF.filter(p => p.status_pagamento?.toLowerCase() === 'pago').length;
      const parcelasVencidas = parcelasParaPDF.filter(p => {
        const hoje = new Date();
        const dataVencimento = new Date(p.data_vencimento);
        return p.status_pagamento?.toLowerCase() !== 'pago' && dataVencimento < hoje;
      }).length;
      const parcelasPendentes = parcelasParaPDF.filter(p => 
        p.status_pagamento?.toLowerCase() === 'pendente' || 
        p.status_pagamento?.toLowerCase() === 'em aberto'
      ).length;
      
      const valorTotalPago = parcelasParaPDF
        .filter(p => p.status_pagamento?.toLowerCase() === 'pago')
        .reduce((sum, p) => sum + (p.valor || 0), 0);
      const valorTotalRestante = parcelasParaPDF
        .filter(p => p.status_pagamento?.toLowerCase() !== 'pago')
        .reduce((sum, p) => sum + (p.valor || 0), 0);
      const valorTotalVencido = parcelasParaPDF
        .filter(p => {
          const hoje = new Date();
          const dataVencimento = new Date(p.data_vencimento);
          return p.status_pagamento?.toLowerCase() !== 'pago' && dataVencimento < hoje;
        })
        .reduce((sum, p) => sum + (p.valor || 0), 0);
      
      const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
      
      // Análise de risco - alunos com parcelas vencidas
      const alunosComParcelasVencidas = parcelasParaPDF
        .filter(p => {
          const hoje = new Date();
          const dataVencimento = new Date(p.data_vencimento);
          return p.status_pagamento?.toLowerCase() !== 'pago' && dataVencimento < hoje;
        })
        .reduce((acc, parcela) => {
          const nomeAluno = parcela.aluno_nome || 'Nome não informado';
          if (!acc[nomeAluno]) {
            acc[nomeAluno] = { nome: nomeAluno, count: 0, valor: 0 };
          }
          acc[nomeAluno].count++;
          acc[nomeAluno].valor += parcela.valor || 0;
          return acc;
        }, {} as Record<string, { nome: string; count: number; valor: number }>);
      
      const alunosRiscoArray = Object.values(alunosComParcelasVencidas)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);

      // Preparar dados estruturados para o PDF
      const dadosRelatorio = {
        cabecalho: {
          titulo: `### Estrutura Atual das Parcelas - TS School${anoFiltro !== 'todos' ? ` (${anoFiltro})` : ''}`,
          dataGeracao: new Date().toLocaleString('pt-BR'),
          filtroAno: anoFiltro !== 'todos' ? anoFiltro : 'Todos os anos',
          logo: "TS School" // Placeholder para logo
        },
        resumoExecutivo: {
          totalParcelas,
          parcelasPagas,
          parcelasVencidas,
          parcelasPendentes,
          percentualPago: totalParcelas > 0 ? ((parcelasPagas / totalParcelas) * 100).toFixed(1) : '0',
          percentualVencido: totalParcelas > 0 ? ((parcelasVencidas / totalParcelas) * 100).toFixed(1) : '0',
          percentualPendente: totalParcelas > 0 ? ((parcelasPendentes / totalParcelas) * 100).toFixed(1) : '0',
          valorTotalPago: valorTotalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          valorTotalRestante: valorTotalRestante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          valorTotalVencido: valorTotalVencido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          totalDespesas: totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          saldoLiquido: (valorTotalPago - totalDespesas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        proximosVencimentos: proximosVencimentosRegistros
          .filter(v => {
            // Filtrar próximos vencimentos pelo ano se necessário
            if (anoFiltro !== 'todos') {
              const anoVencimento = new Date(v.dataVencimento).getFullYear().toString();
              return anoVencimento === anoFiltro;
            }
            return true;
          })
          .map(v => ({
            aluno: v.alunoNome,
            valor: v.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            dataVencimento: formatDate(v.dataVencimento),
            diasRestantes: v.diasRestantes,
            tipo: v.tipoItem,
            parcela: v.numeroParcela,
            status: v.status,
            urgente: v.diasRestantes <= 7
          })),
        despesasRecentes: despesas.map(d => ({
          descricao: d.descricao,
          valor: d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          categoria: d.categoria,
          data: formatDate(d.data),
          status: d.status
        })),
        alertasImportantes: [
          ...alunosRiscoArray.map(aluno => 
            `⚠️ ${aluno.nome} possui ${aluno.count} parcela(s) vencida(s) totalizando ${aluno.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`
          ),
          ...(parcelasVencidas > 0 ? [`⚠️ Total de ${parcelasVencidas} parcelas vencidas requerem atenção imediata.`] : [])
        ],
        indicadoresPerformance: {
          percentualPagamento: totalParcelas > 0 ? ((parcelasPagas / totalParcelas) * 100).toFixed(1) + '%' : '0%',
          valorMedioParcela: totalParcelas > 0 ? ((valorTotalPago + valorTotalRestante) / totalParcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
          tipoMaisComum: 'Mensalidade',
          idiomaPreferido: 'Português',
          tendenciaPagamento: parcelasPagas > parcelasVencidas ? 'Regular' : 'Irregular',
          inadimplencia: totalParcelas > 0 ? ((parcelasVencidas / totalParcelas) * 100).toFixed(1) + '%' : '0%',
          crescimentoMensal: '+3%',
          statusGeral: parcelasVencidas <= (totalParcelas * 0.1) ? 'Estável' : 'Atenção Necessária'
        },
        conclusao: {
          alunosRisco: alunosRiscoArray.map(a => a.nome),
          recomendacao: alunosRiscoArray.length > 0 
            ? 'Entrar em contato com os inadimplentes nos próximos 3 dias úteis para regularização.' 
            : 'Situação financeira estável. Manter acompanhamento regular dos vencimentos.'
        },
        parcelasDetalhadas: parcelasParaPDF.slice(0, 50).map(p => ({
          aluno: p.aluno_nome || 'Nome não informado',
          plano: p.plano_nome || 'Plano não informado',
          parcela: p.numero_parcela,
          valor: (p.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          vencimento: formatDate(p.data_vencimento),
          pagamento: p.data_pagamento ? formatDate(p.data_pagamento) : '-',
          status: p.status_pagamento,
          tipo: p.tipo_item,
          idioma: p.idioma_registro,
          fonte: p.fonte
        }))
      };

      await gerarRelatorioPDF(dadosRelatorio);
      
      toast({
        title: "Sucesso",
        description: `Relatório PDF gerado com sucesso!${anoFiltro !== 'todos' ? ` (Ano: ${anoFiltro})` : ''}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setExportandoPDF(false);
    }
  };

  // Função para buscar dados dos gráficos
  const buscarDadosGraficos = async () => {
    try {
      console.log('Iniciando busca de dados dos gráficos...');
      
      // Buscar dados da tabela alunos_parcelas
      const { data: parcelasData, error: parcelasError } = await supabase
        .from('alunos_parcelas')
        .select(`
          valor,
          data_vencimento,
          data_pagamento,
          status_pagamento,
          idioma_registro,
          alunos_financeiro!inner (
            alunos (
              status
            )
          )
        `)
        .eq('alunos_financeiro.alunos.status', 'Ativo');

      if (parcelasError) {
        console.error('Erro ao buscar dados das parcelas ativas para gráficos:', parcelasError);
        return;
      }

      console.log('Dados das parcelas ativas encontrados:', parcelasData?.length || 0);

      // Normalizar dados das parcelas ativas (que podem ter estrutura aninhada)
      const parcelasAtivasNormalizadas = (parcelasData || []).map(parcela => ({
        valor: parcela.valor,
        data_vencimento: parcela.data_vencimento,
        data_pagamento: parcela.data_pagamento,
        status_pagamento: parcela.status_pagamento,
        idioma_registro: parcela.idioma_registro
      }));

      // Usar apenas dados das parcelas ativas
      const todasParcelas = parcelasAtivasNormalizadas;
      console.log('Total de parcelas combinadas:', todasParcelas.length);

      // Filtrar apenas parcelas pagas para receita
      const parcelasPagas = todasParcelas.filter(p => p.status_pagamento === 'pago');
      console.log('Parcelas pagas encontradas:', parcelasPagas.length);

      // Processar dados para receita mensal
      const receitaPorMes = parcelasPagas.reduce((acc, parcela) => {
        if (parcela.data_pagamento) {
              const dataPagamento = new Date(parcela.data_pagamento);
          const mes = `${dataPagamento.getFullYear()}-${String(dataPagamento.getMonth() + 1).padStart(2, '0')}`;
          const mesFormatado = dataPagamento.toLocaleDateString('pt-BR', { 
            year: 'numeric', 
            month: 'short' 
          });
          
          if (!acc[mes]) {
            acc[mes] = { valor: 0, label: mesFormatado };
          }
          acc[mes].valor += (parcela.valor || 0);
        }
        return acc;
      }, {} as Record<string, { valor: number; label: string }>);

      const receitaMensalData: ReceitaMensal[] = Object.entries(receitaPorMes)
        .map(([mes, data]) => ({ 
          mes: data.label, 
          receita: data.valor, 
          receitaAcumulada: data.valor 
        }))
        .sort((a, b) => {
          const dateA = new Date(a.mes.replace(' de ', ' '));
          const dateB = new Date(b.mes.replace(' de ', ' '));
          return dateA.getTime() - dateB.getTime();
        })
        .slice(-6);

      // Calcular receita acumulada
      let acumulado = 0;
      receitaMensalData.forEach(item => {
        acumulado += item.receita;
        item.receitaAcumulada = acumulado;
      });

      console.log('Receita mensal processada:', receitaMensalData);
      setReceitaMensal(receitaMensalData);

      // Processar dados para receita por idioma usando apenas parcelas pagas
      const receitaPorIdiomaData = parcelasPagas.reduce((acc, parcela) => {
        const idioma = parcela.idioma_registro || 'Não informado';
        acc[idioma] = (acc[idioma] || 0) + (parcela.valor || 0);
        return acc;
      }, {} as Record<string, number>);

      const receitaPorIdiomaArray: ReceitaPorIdioma[] = Object.entries(receitaPorIdiomaData)
        .map(([idioma, receita]) => ({ idioma, receita }))
        .filter(item => item.receita > 0);

      console.log('Receita por idioma processada:', receitaPorIdiomaArray);
      setReceitaPorIdioma(receitaPorIdiomaArray);

      // Buscar despesas para variação de saldo
      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select('valor, categoria, status');

      if (despesasError) {
        console.error('Erro ao buscar despesas para gráficos:', despesasError);
      }

      console.log('Despesas encontradas:', despesasData?.length || 0);

      // Calcular variação de saldo
      const totalReceitas = receitaPorIdiomaArray.reduce((sum, item) => sum + item.receita, 0);
      const totalDespesas = (despesasData || []).reduce((sum, despesa) => sum + (despesa.valor || 0), 0);
      const saldoFinal = totalReceitas - totalDespesas;

      const variacaoSaldoData: VariacaoSaldo[] = [
        { categoria: 'Receitas', valor: totalReceitas, tipo: 'entrada' as const },
        { categoria: 'Despesas', valor: -totalDespesas, tipo: 'saida' as const },
        { categoria: 'Saldo Final', valor: saldoFinal, tipo: 'saldo' as const }
      ].filter(item => item.valor !== 0);

      console.log('Variação de saldo processada:', variacaoSaldoData);
      setVariacaoSaldo(variacaoSaldoData);

      // Dados carregados diretamente do banco de dados
      // Se não há dados, os arrays ficam vazios

    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos gráficos.",
        variant: "destructive"
      });
      
      // Em caso de erro, definir dados vazios para evitar erros de renderização
      setReceitaMensal([]);
      setReceitaPorIdioma([]);
      setVariacaoSaldo([]);
    }
  };

  // Debounce para o searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce para o searchCiclosTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchCiclosTerm(searchCiclosTerm);
      // Resetar página quando pesquisar (tanto para ciclos quanto para alunos sem ciclos)
      setPaginaAlunosSemCiclos(1);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchCiclosTerm]);



  useEffect(() => {
    carregarDados();
  }, []);

  // Filtrar parcelas com base nos critérios de busca e ano
  const parcelasFiltradas = useMemo(() => {
    return parcelas.filter(parcela => {
      const matchesSearch = !debouncedSearchTerm || 
        parcela.aluno_nome?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        parcela.plano_nome?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        parcela.tipo_item.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        parcela.status_pagamento.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesYear = anoFiltro === 'todos' || 
        new Date(parcela.data_vencimento).getFullYear().toString() === anoFiltro;
      
      return matchesSearch && matchesYear;
    });
  }, [parcelas, debouncedSearchTerm, anoFiltro]);

  // Filtrar ciclos ativos com base no filtro selecionado e pesquisa por nome
  const ciclosFiltrados = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação apenas de data
    const umMesEmMs = 30 * 24 * 60 * 60 * 1000; // 30 dias em milissegundos
    
    return ciclos.filter(ciclo => {
      const finalCiclo = new Date(ciclo.final_ciclo);
      finalCiclo.setHours(23, 59, 59, 999); // Definir para o final do dia
      const inicioCiclo = new Date(ciclo.inicio_ciclo);
      inicioCiclo.setHours(0, 0, 0, 0); // Definir para o início do dia
      
      // Filtro por status do ciclo
      let matchesStatus = true;
      switch (filtroCiclo) {
        case 'ativos':
          matchesStatus = hoje >= inicioCiclo && hoje <= finalCiclo;
          break;
        case 'quase_encerrados':
          const tempoRestante = finalCiclo.getTime() - hoje.getTime();
          const diasRestantes = Math.ceil(tempoRestante / (24 * 60 * 60 * 1000));
          matchesStatus = hoje >= inicioCiclo && hoje <= finalCiclo && diasRestantes <= 30 && diasRestantes > 0;
          break;
        case 'encerrados':
          matchesStatus = hoje > finalCiclo;
          break;
        default:
          matchesStatus = true; // mostrar todos quando nenhum filtro específico está ativo
      }
      
      // Filtro por nome do aluno
      const matchesSearch = !debouncedSearchCiclosTerm || 
        ciclo.aluno_nome.toLowerCase().includes(debouncedSearchCiclosTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });  
  }, [ciclos, filtroCiclo, debouncedSearchCiclosTerm]);

  // Filtrar e paginar alunos sem ciclos
  const alunosSemCiclosFiltrados = useMemo(() => {
    return alunosSemCiclos.filter(aluno => 
      !debouncedSearchCiclosTerm || 
      aluno.nome.toLowerCase().includes(debouncedSearchCiclosTerm.toLowerCase())
    );
  }, [alunosSemCiclos, debouncedSearchCiclosTerm]);

  const alunosSemCiclosPaginados = useMemo(() => {
    const inicio = (paginaAlunosSemCiclos - 1) * alunosPorPagina;
    const fim = inicio + alunosPorPagina;
    return alunosSemCiclosFiltrados.slice(inicio, fim);
  }, [alunosSemCiclosFiltrados, paginaAlunosSemCiclos, alunosPorPagina]);

  const totalPaginasAlunosSemCiclos = Math.ceil(alunosSemCiclosFiltrados.length / alunosPorPagina);

  // Agrupar parcelas por aluno (apenas para dados migrados)


  // Cálculos de paginação
  const paginationData = useMemo(() => {
    const itensPorPagina = registrosPorPagina === 999999 ? parcelasFiltradas.length : registrosPorPagina;
    const totalPagesRegistros = Math.ceil(parcelasFiltradas.length / itensPorPagina);
    const startItemRegistros = registrosPorPagina === 999999 ? 1 : (currentPageRegistros - 1) * registrosPorPagina + 1;
    const endItemRegistros = registrosPorPagina === 999999 ? parcelasFiltradas.length : Math.min(currentPageRegistros * registrosPorPagina, parcelasFiltradas.length);
    const parcelasExibidas = registrosPorPagina === 999999 ? parcelasFiltradas : parcelasFiltradas.slice(
      (currentPageRegistros - 1) * registrosPorPagina,
      currentPageRegistros * registrosPorPagina
    );
    
    return {
      itensPorPagina,
      totalPagesRegistros,
      startItemRegistros,
      endItemRegistros,
      parcelasExibidas
    };
  }, [parcelasFiltradas, registrosPorPagina, currentPageRegistros]);
  
  const { itensPorPagina, totalPagesRegistros, startItemRegistros, endItemRegistros, parcelasExibidas } = paginationData;

  // Filtrar vencimentos por pesquisa
  const vencimentosFiltrados = useMemo(() => {
    if (!searchVencimentosTerm.trim()) {
      return proximosVencimentosRegistros;
    }
    return proximosVencimentosRegistros.filter(vencimento =>
      vencimento.alunoNome.toLowerCase().includes(searchVencimentosTerm.toLowerCase())
    );
  }, [proximosVencimentosRegistros, searchVencimentosTerm]);

  // Cálculos de paginação para próximos vencimentos
  const paginationVencimentos = useMemo(() => {
    const totalPaginasVencimentos = Math.ceil(vencimentosFiltrados.length / itensVencimentosPorPagina);
    const indiceInicialVencimentos = (paginaAtualVencimentos - 1) * itensVencimentosPorPagina;
    const indiceFinalVencimentos = indiceInicialVencimentos + itensVencimentosPorPagina;
    const vencimentosExibidos = vencimentosFiltrados.slice(indiceInicialVencimentos, indiceFinalVencimentos);
    
    return {
      totalPaginasVencimentos,
      vencimentosExibidos
    };
  }, [vencimentosFiltrados, paginaAtualVencimentos, itensVencimentosPorPagina]);
  
  const { totalPaginasVencimentos, vencimentosExibidos } = paginationVencimentos;



  // Função para calcular páginas visíveis na paginação
  const getVisiblePagesRegistros = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPagesRegistros <= maxVisiblePages) {
      for (let i = 1; i <= totalPagesRegistros; i++) {
        pages.push(i);
      }
    } else {
      if (currentPageRegistros <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPagesRegistros);
      } else if (currentPageRegistros >= totalPagesRegistros - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPagesRegistros - 3; i <= totalPagesRegistros; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPageRegistros - 1; i <= currentPageRegistros + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPagesRegistros);
      }
    }
    
    return pages;
  };
  
  const visiblePagesRegistros = getVisiblePagesRegistros();

  // Reset página quando ano muda ou itens por página muda
  useEffect(() => {
    setCurrentPageRegistros(1);
  }, [anoFiltro, registrosPorPagina]);

  // Função para calcular totais dinâmicos
  const calcularTotaisDinamicos = (parcelas: ParcelaDetalhada[]) => {
    const totais = parcelas.reduce((acc, parcela) => {
      const valor = parcela.valor || 0;
      
      switch (parcela.status_pagamento?.toLowerCase()) {
        case 'pago':
          acc.totalRecebido += valor;
          acc.parcelasPagas += 1;
          break;
        case 'pendente':
        case 'em aberto':
          acc.totalPendente += valor;
          acc.parcelasPendentesVencidas += 1;
          break;
        case 'vencido':
          acc.totalVencido += valor;
          acc.parcelasPendentesVencidas += 1;
          break;
        case 'cancelado':
          acc.totalCancelado += valor;
          break;
        default:
          acc.totalPendente += valor;
          acc.parcelasPendentesVencidas += 1;
      }
      
      acc.totalGeral += valor;
      return acc;
    }, {
      totalRecebido: 0,
      totalPendente: 0,
      totalVencido: 0,
      totalCancelado: 0,
      totalGeral: 0,
      parcelasPagas: 0,
      parcelasPendentesVencidas: 0
    });
    
    // Calcular propriedades derivadas
    const totalAReceber = totais.totalPendente + totais.totalVencido;
    const percentualQuitado = totais.totalGeral > 0 ? (totais.totalRecebido / totais.totalGeral) * 100 : 0;
    
    return {
      ...totais,
      totalAReceber,
      percentualQuitado
    };
  };
  
  const totaisDinamicos = calcularTotaisDinamicos(parcelasFiltradas);

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4" style={{color: '#D90429'}} />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // ApexCharts configurations
  const areaChartOptions: any = {
    chart: {
      type: 'area',
      height: 320,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: ['#10b981'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    grid: {
      strokeDashArray: 3,
      borderColor: '#f1f5f9'
    },
    xaxis: {
      categories: receitaMensal.map(item => item.mes),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        }
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        },
        formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '14px'
      },
      y: {
        formatter: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }
    },
    markers: {
      size: 4,
      colors: ['#10b981'],
      strokeColors: '#10b981',
      strokeWidth: 2,
      hover: {
        size: 6
      }
    }
  };

  const barChartOptions: any = {
    chart: {
      type: 'bar',
      height: 320,
      toolbar: {
        show: false
      }
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '30px'
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      strokeDashArray: 3,
      borderColor: '#f1f5f9'
    },
    xaxis: {
      categories: receitaPorIdioma.map(item => item.idioma),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: '11px',
          colors: '#64748b'
        },
        formatter: (value: number) => `${(value / 1000).toFixed(0)}k`
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: '11px',
          colors: '#64748b'
        }
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }
    }
  };

  const columnChartOptions: any = {
    chart: {
      type: 'bar',
      height: 320,
      toolbar: {
        show: false
      }
    },
    colors: variacaoSaldo.map(item => 
      item.tipo === 'entrada' ? '#10b981' : 
      item.tipo === 'saida' ? '#ef4444' : 
      item.valor >= 0 ? '#3b82f6' : '#f59e0b'
    ),
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '80px'
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      strokeDashArray: 3,
      borderColor: '#f1f5f9'
    },
    xaxis: {
      categories: variacaoSaldo.map(item => item.categoria),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        },
        rotate: -45
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        },
        formatter: (value: number) => `R$ ${(value / 1000).toFixed(0)}k`
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '14px'
      },
      y: {
        formatter: (value: number) => `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderBottomColor: '#D90429'}}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[#F9FAFB] min-h-screen">
      {/* Cabeçalho */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Financeiro</h1>
            <p className="text-gray-600">Visão completa das finanças da TS School</p>
          </div>
          
          <div className="flex items-center gap-3">
            {anoFiltro !== 'todos' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <CalendarDays className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">PDF: {anoFiltro}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ciclos Ativos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Ciclos 
            </CardTitle>
            
            {/* Barra de pesquisa para ciclos */}
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Pesquisar por nome do aluno..."
                  value={searchCiclosTerm}
                  onChange={(e) => setSearchCiclosTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center gap-2 mt-4 p-3 bg-red-50 rounded-lg">
              <div className="flex gap-2">

              <Button
                onClick={() => {
                  setFiltroCiclo('ativos');
                  setMostrandoAlunosSemCiclos(false);
                }}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                   filtroCiclo === 'ativos' 
                     ? 'text-[#D90429] bg-white' 
                     : 'text-gray-600 hover:text-[#D90429] hover:bg-white'
                 }`}
                variant="ghost"
              >
                Ativos
              </Button>
              <Button
                onClick={() => {
                  setFiltroCiclo('quase_encerrados');
                  setMostrandoAlunosSemCiclos(false);
                }}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                   filtroCiclo === 'quase_encerrados' 
                     ? 'text-[#D90429] bg-white' 
                     : 'text-gray-600 hover:text-[#D90429] hover:bg-white'
                 }`}
                variant="ghost"
              >
                Quase Encerrados
              </Button>
              <Button
                onClick={() => {
                  setFiltroCiclo('encerrados');
                  setMostrandoAlunosSemCiclos(false);
                }}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                   filtroCiclo === 'encerrados' 
                     ? 'text-[#D90429] bg-white' 
                     : 'text-gray-600 hover:text-[#D90429] hover:bg-white'
                 }`}
                variant="ghost"
              >
                Encerrados
              </Button>
              </div>
              <Button
                onClick={() => {
                  setMostrandoAlunosSemCiclos(!mostrandoAlunosSemCiclos);
                  if (!mostrandoAlunosSemCiclos) {
                    setFiltroCiclo('');
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                   mostrandoAlunosSemCiclos 
                     ? 'text-[#D90429] bg-white' 
                     : 'text-gray-600 hover:text-[#D90429] hover:bg-white'
                 }`}
                variant="ghost"
              >
                Alunos sem Ciclos ({alunosSemCiclos.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mostrandoAlunosSemCiclos ? (
              <div className="space-y-4">
                {alunosSemCiclosFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchCiclosTerm ? 'Nenhum aluno encontrado com esse nome' : 'Nenhum aluno sem ciclo encontrado'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {alunosSemCiclosPaginados.map((aluno) => (
                        <motion.div 
                          key={aluno.id}
                          className="flex items-center justify-between p-4 rounded-lg transition-colors duration-200" 
                          style={{backgroundColor: '#F9FAFB'}} 
                          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6'} 
                          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'}
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">{aluno.nome.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{aluno.nome}</h3>
                              <p className="text-sm text-gray-500">Sem ciclo ativo</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              {aluno.financeiro_id ? 'Sem Ciclo' : 'Sem Registro Financeiro'}
                            </Badge>
                            {aluno.financeiro_id ? (
                              <CycleManager
                                alunoId={aluno.financeiro_id}
                                isMigrationMode={false}
                                setIsMigrationMode={() => {}}
                                onCycleCreated={() => {
                                  // Recarregar a lista de alunos sem ciclos
                                  buscarAlunosSemCiclos().then(setAlunosSemCiclos);
                                  toast({
                                    title: "Sucesso",
                                    description: "Ciclo criado com sucesso!",
                                  });
                                }}
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-blue-50"
                                    style={{
                                      borderColor: '#BFDBFE',
                                      color: '#2563EB'
                                    }}
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            ) : (
                              <Badge variant="outline" className="text-gray-500 border-gray-300">
                                Criar Plano Primeiro
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Paginação */}
                    {totalPaginasAlunosSemCiclos > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-500">
                          Mostrando {((paginaAlunosSemCiclos - 1) * alunosPorPagina) + 1} a {Math.min(paginaAlunosSemCiclos * alunosPorPagina, alunosSemCiclosFiltrados.length)} de {alunosSemCiclosFiltrados.length} alunos
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPaginaAlunosSemCiclos(prev => Math.max(prev - 1, 1))}
                            disabled={paginaAlunosSemCiclos === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <span className="text-sm text-gray-600">
                            Página {paginaAlunosSemCiclos} de {totalPaginasAlunosSemCiclos}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPaginaAlunosSemCiclos(prev => Math.min(prev + 1, totalPaginasAlunosSemCiclos))}
                            disabled={paginaAlunosSemCiclos === totalPaginasAlunosSemCiclos}
                          >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : ciclosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {!filtroCiclo ? 'Nenhum ciclo encontrado' :
                   filtroCiclo === 'ativos' ? 'Nenhum ciclo ativo encontrado' :
                   filtroCiclo === 'quase_encerrados' ? 'Nenhum ciclo quase encerrado encontrado' :
                   'Nenhum ciclo encerrado encontrado'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ciclosFiltrados.map((ciclo, index) => (
                  <motion.div 
                    key={`${ciclo.aluno_id}-${ciclo.inicio_ciclo}`}
                    className="flex items-center justify-between p-4 rounded-lg transition-colors duration-200" 
                    style={{backgroundColor: '#F9FAFB'}} 
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6'} 
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{ciclo.aluno_nome}</p>
                        <p className="text-sm" style={{color: '#6B7280'}}>
                          {formatDate(ciclo.inicio_ciclo)} - {formatDate(ciclo.final_ciclo)}
                        </p>
                        <p className="text-xs" style={{color: '#9CA3AF'}}>
                          {ciclo.parcelas_pagas}/{ciclo.total_parcelas} parcelas pagas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {ciclo.valor_total_ciclo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <Badge 
                        variant={ciclo.status_ciclo === 'ativo' ? "default" : "destructive"}
                      >
                        {ciclo.status_ciclo === 'ativo' ? 'Ativo' : 'Vencido'}
                      </Badge>
                      <div className="mt-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(ciclo.parcelas_pagas / ciclo.total_parcelas) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Próximos Vencimentos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Vencimentos (30 dias)
            </CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por nome do aluno..."
                  value={searchVencimentosTerm}
                  onChange={(e) => {
                    setSearchVencimentosTerm(e.target.value);
                    setPaginaAtualVencimentos(1); // Reset para primeira página ao pesquisar
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {proximosVencimentosRegistros.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum vencimento nos próximos 30 dias</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {vencimentosExibidos.map((vencimento) => (
                    <motion.div 
                      key={vencimento.id} 
                      className="flex items-center justify-between p-4 rounded-lg transition-colors duration-200" style={{backgroundColor: '#F9FAFB'}} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(vencimento.status)}
                        <div className="flex-1">
                          <p className="font-medium">{vencimento.alunoNome}</p>
                          <p className="text-sm" style={{color: '#6B7280'}}>
                            {vencimento.tipoItem === 'plano' ? 'Módulo de curso' : vencimento.planoNome} - Parcela {vencimento.numeroParcela}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {vencimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <Badge 
                          variant={vencimento.diasRestantes <= 7 ? "destructive" : "secondary"}
                          className={vencimento.diasRestantes <= 7 ? "animate-pulse" : ""}
                        >
                          {vencimento.diasRestantes} dias
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Controles de Paginação para Próximos Vencimentos */}
                {totalPaginasVencimentos > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Mostrando {((paginaAtualVencimentos - 1) * itensVencimentosPorPagina) + 1} a {Math.min(paginaAtualVencimentos * itensVencimentosPorPagina, vencimentosFiltrados.length)} de {vencimentosFiltrados.length} vencimentos{searchVencimentosTerm.trim() ? ` (filtrados de ${proximosVencimentosRegistros.length} total)` : ''}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtualVencimentos(prev => Math.max(prev - 1, 1))}
                        disabled={paginaAtualVencimentos === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600">
                        Página {paginaAtualVencimentos} de {totalPaginasVencimentos}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaAtualVencimentos(prev => Math.min(prev + 1, totalPaginasVencimentos))}
                        disabled={paginaAtualVencimentos === totalPaginasVencimentos}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráficos Financeiros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Título da Seção de Gráficos */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 rounded-full bg-[#D90429]"></div>
          <h2 className="text-2xl font-bold" style={{color: '#1F2937'}}>Análise Financeira</h2>
        </div>

        {/* Grid de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Crescimento de Receita */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-[#F9FAFB]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span style={{color: '#1F2937'}}>Crescimento de Receita</span>
                  <p className="text-sm text-gray-500 font-normal mt-1">Evolução mensal das receitas</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80 p-4 bg-white rounded-lg border" style={{borderColor: '#F3F4F6'}}>
                {console.log('Dados receita mensal para gráfico:', receitaMensal)}
                {receitaMensal.length > 0 ? (
                  <Chart
                    options={areaChartOptions}
                    series={[{
                      name: 'Receita',
                      data: receitaMensal.map(item => item.receita)
                    }]}
                    type="area"
                    height={320}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum dado de receita disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Receita por Idioma */}
          <Card className="border-0 shadow-xl bg-[#F9FAFB]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                   <div>
                  <span style={{color: '#1F2937'}}>Distribuição por curso</span>
                  <p className="text-sm text-gray-500 font-normal mt-1">Receita por idioma/curso</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2">
              <div className="h-80 p-2 bg-white rounded-lg border" style={{borderColor: '#F3F4F6'}}>
                {console.log('Dados receita por idioma para gráfico:', receitaPorIdioma)}
                {receitaPorIdioma.length > 0 ? (
                  <Chart
                    options={barChartOptions}
                    series={[{
                      name: 'Receita',
                      data: receitaPorIdioma.map(item => item.receita)
                    }]}
                    type="bar"
                    height={320}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum dado por idioma disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


      </motion.div>

      {/* Parcelas Detalhadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Parcelas Detalhadas
              </CardTitle>
              
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">

                {/* Filtro de Ano */}
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <Select value={anoFiltro} onValueChange={setAnoFiltro}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Campo de busca */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por aluno, plano..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                
                {/* Botão de detalhes */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetalhesAbertos(!detalhesAbertos)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {detalhesAbertos ? 'Ocultar' : 'Mostrar'} Detalhes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-600 text-white">
                    <TableHead className="w-12 text-white">Status</TableHead>
                    <TableHead className="text-white">Aluno</TableHead>
                    <TableHead className="text-white">Plano</TableHead>
                    <TableHead className="text-white">Parcela</TableHead>
                    <TableHead className="text-white">Valor</TableHead>
                    <TableHead className="text-white">Vencimento</TableHead>
                    <TableHead className="text-white">Tipo</TableHead>
                    <TableHead className="text-white">Descrição do Item</TableHead>
                    {detalhesAbertos && (
                      <>
                        <TableHead className="text-white">Idioma</TableHead>
                        <TableHead className="text-white">Forma de Pagamento</TableHead>
                        <TableHead className="text-white">Data de Pagamento</TableHead>
                        <TableHead className="text-white">Observações</TableHead>
                        <TableHead className="text-white">Fonte</TableHead>
                      </>
                    )}

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelasExibidas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={detalhesAbertos ? 13 : 8} className="text-center py-8 text-gray-500">
                        Nenhuma parcela encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Renderização simples - cada parcela em uma linha própria
                    parcelasExibidas.map((parcela, index) => (
                      <TableRow 
                        key={`${parcela.fonte}-${parcela.id}`} 
                        className={`border-b hover:bg-gray-50/50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell>
                          <Badge 
                            variant={parcela.status_pagamento === 'Pago' ? 'default' : 
                                   parcela.status_pagamento === 'Pendente' ? 'secondary' : 'destructive'}
                            className={parcela.status_pagamento === 'Pago' ? 'bg-green-100 text-green-800' : 
                                     parcela.status_pagamento === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-red-100 text-red-800'}
                          >
                            {parcela.status_pagamento === 'Pago' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {parcela.status_pagamento === 'Pendente' && <Clock className="h-3 w-3 mr-1" />}
                            {parcela.status_pagamento === 'Vencido' && <XCircle className="h-3 w-3 mr-1" />}
                            {parcela.status_pagamento === 'Cancelado' && <XCircle className="h-3 w-3 mr-1" />}
                            {parcela.status_pagamento}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{parcela.aluno_nome}</TableCell>
                        <TableCell>{parcela.plano_nome || '-'}</TableCell>
                        <TableCell>{parcela.numero_parcela}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                           R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </TableCell>
                         <TableCell>
                           {formatDate(parcela.data_vencimento)}
                         </TableCell>
                         <TableCell>
                           <Badge variant="outline">{parcela.tipo_item}</Badge>
                         </TableCell>
                         <TableCell>{parcela.descricao_item || '-'}</TableCell>
                         {detalhesAbertos && (
                           <>
                             <TableCell>{parcela.idioma_registro}</TableCell>
                             <TableCell>{parcela.forma_pagamento || '-'}</TableCell>
                             <TableCell>
                               {parcela.data_pagamento ? formatDate(parcela.data_pagamento) : '-'}
                             </TableCell>
                             <TableCell>{parcela.observacoes || '-'}</TableCell>
                             <TableCell>
                               <Badge variant={parcela.fonte === 'parcelas_migracao_raw' ? 'secondary' : 'default'}>
                                 {parcela.fonte === 'parcelas_migracao_raw' ? 'Migrado' : 'Ativo'}
                               </Badge>
                             </TableCell>
                           </>
                         )}

                       </TableRow>
                     ))
                   )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={detalhesAbertos ? 14 : 7} className="bg-gray-50">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
                        <div className="flex flex-col sm:flex-row gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              TOTAL RECEBIDO: R$ {totaisDinamicos.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-gray-500">({totaisDinamicos.parcelasPagas} parcelas)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-orange-600">
                              TOTAL A RECEBER: R$ {totaisDinamicos.totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-gray-500">({totaisDinamicos.parcelasPendentesVencidas} parcelas)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">
                            {totaisDinamicos.percentualQuitado.toFixed(1)}% Quitado
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Contador de Registros */}
            {parcelasFiltradas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center mt-4"
              >
                <div className="rounded-full px-6 py-3 shadow-lg bg-[#D90429]">
                  <span className="text-white font-medium text-sm flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>{parcelasFiltradas.length} registros encontrados</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* Paginação dos Registros - CONDIÇÃO MODIFICADA */}
            {(totalPagesRegistros > 1 || parcelasFiltradas.length > 10) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-4"
              >
                <Card className="shadow-md border-0 bg-[#F9FAFB]">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Informações de exibição */}
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span className="text-sm">
                          Mostrando {startItemRegistros} a {endItemRegistros} de {parcelasFiltradas.length} registros
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Página {currentPageRegistros} de {totalPagesRegistros}
                        </span>
                      </div>

                      {/* Controles de paginação - só mostrar se houver mais de 1 página */}
                      {totalPagesRegistros > 1 && (
                        <div className="flex items-center space-x-2">
                          {/* Botão Anterior */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPageRegistros(prev => Math.max(1, prev - 1))}
                            disabled={currentPageRegistros === 1}
                            className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                              currentPageRegistros === 1
                                ? 'cursor-not-allowed' + ' ' + 'bg-gray-100 text-gray-400'
        : 'bg-white border shadow-sm' + ' ' + 'text-gray-700 hover:text-red-600 border-gray-200'
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">Anterior</span>
                          </motion.button>

                          {/* Números das páginas */}
                          <div className="flex items-center space-x-1">
                            {visiblePagesRegistros.map((page, index) => (
                              page === '...' ? (
                                <span key={`dots-${index}`} className="px-2 text-gray-400">...</span>
                              ) : (
                                <motion.button
                                  key={page}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setCurrentPageRegistros(page as number)}
                                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 ${
                                    currentPageRegistros === page
                                      ? 'text-white shadow-lg bg-[#D90429]'
        : 'bg-white border border-gray-200' + ' ' + 'text-gray-700 hover:bg-[#F9FAFB] hover:text-[#D90429]'
                                  }`}
                                >
                                  {page}
                                </motion.button>
                              )
                            ))}
                          </div>

                          {/* Botão Próximo */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPageRegistros(prev => Math.min(totalPagesRegistros, prev + 1))}
                            disabled={currentPageRegistros === totalPagesRegistros}
                            className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                              currentPageRegistros === totalPagesRegistros
                                ? 'cursor-not-allowed' + ' ' + 'bg-gray-100 text-gray-400'
        : 'bg-white border shadow-sm' + ' ' + 'text-gray-700 hover:text-red-600 border-gray-200'
                            }`}
                          >
                            <span className="text-sm font-medium">Próximo</span>
                            <ChevronRight className="h-4 w-4" />
                          </motion.button>
                        </div>
                      )}

                      {/* Seletor de itens por página - sempre mostrar */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Itens por página:</span>
                        <Select
                          value={registrosPorPagina.toString()}
                          onValueChange={(value) => {
                            console.log('Mudando itens por página para:', value);
                            setRegistrosPorPagina(Number(value));
                            setCurrentPageRegistros(1);
                          }}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="999999">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FinancialReportsTable;