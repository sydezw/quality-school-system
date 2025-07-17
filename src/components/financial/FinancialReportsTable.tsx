import React, { useState, useEffect } from 'react';
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
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGroqPDF } from '@/hooks/useGroqPDF';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Interfaces
interface ParcelaDetalhada {
  id: number;
  registro_financeiro_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status_pagamento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  descricao_item?: string | null;
  idioma_registro: 'Inglês' | 'Japonês';
  aluno_nome?: string;
  plano_nome?: string;
  forma_pagamento?: string;
  financeiro_alunos?: {
    alunos?: { nome: string };
    planos?: { nome: string };
  };
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
  const [parcelas, setParcelas] = useState<ParcelaDetalhada[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [proximosVencimentosRegistros, setProximosVencimentosRegistros] = useState<ProximoVencimentoRegistro[]>([]);
  
  // Estados para paginação da tabela de registros
  const [currentPageRegistros, setCurrentPageRegistros] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  
  // Novos estados para os gráficos
  const [receitaMensal, setReceitaMensal] = useState<ReceitaMensal[]>([]);
  const [variacaoSaldo, setVariacaoSaldo] = useState<VariacaoSaldo[]>([]);
  const [receitaPorIdioma, setReceitaPorIdioma] = useState<ReceitaPorIdioma[]>([]);

  // Função para buscar dados das parcelas
  const buscarDadosRegistros = async () => {
    try {
      const { data: parcelasData, error } = await supabase
        .from('parcelas_alunos')
        .select(`
          *,
          financeiro_alunos!inner (
            aluno_id,
            alunos (
              nome,
              status
            ),
            planos (
              nome
            )
          )
        `)
        .eq('financeiro_alunos.alunos.status', 'Ativo');

      if (error) {
        console.error('Erro ao buscar dados das parcelas:', error);
        return [];
      }

      return parcelasData || [];
    } catch (error) {
      console.error('Erro ao buscar dados das parcelas:', error);
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

  // Função para calcular próximos vencimentos
  const calcularProximosVencimentosRegistros = (parcelas: any[]): ProximoVencimentoRegistro[] => {
    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);

    const proximosVencimentos = parcelas
      .filter(parcela => {
        const dataVencimento = new Date(parcela.data_vencimento);
        return parcela.status_pagamento !== 'pago' && 
               parcela.status_pagamento !== 'cancelado' &&
               dataVencimento >= hoje && 
               dataVencimento <= em30Dias;
      })
      .map(parcela => {
        const dataVencimento = new Date(parcela.data_vencimento);
        const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: parcela.id,
          alunoNome: parcela.financeiro_alunos?.alunos?.nome || 'Nome não informado',
          valor: parcela.valor || 0,
          dataVencimento: parcela.data_vencimento,
          diasRestantes,
          tipoItem: parcela.tipo_item,
          numeroParcela: parcela.numero_parcela,
          planoNome: parcela.financeiro_alunos?.planos?.nome,
          status: parcela.status_pagamento
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 10);

    return proximosVencimentos;
  };

  // Função para carregar todos os dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      const parcelasData = await buscarDadosRegistros();
      setParcelas(parcelasData);
      
      const proximosVencimentos = calcularProximosVencimentosRegistros(parcelasData);
      setProximosVencimentosRegistros(proximosVencimentos);
      
      await buscarDespesas();
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
      // Calcular estatísticas completas
      const totalParcelas = parcelas.length;
      const parcelasPagas = parcelas.filter(p => p.status_pagamento === 'pago').length;
      const parcelasVencidas = parcelas.filter(p => {
        const hoje = new Date();
        const vencimento = new Date(p.data_vencimento);
        return p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado' && vencimento < hoje;
      }).length;
      const parcelasPendentes = parcelas.filter(p => {
        const hoje = new Date();
        const vencimento = new Date(p.data_vencimento);
        return p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado' && vencimento >= hoje;
      }).length;
      
      const valorTotalPago = parcelas
        .filter(p => p.status_pagamento === 'pago')
        .reduce((sum, p) => sum + (p.valor || 0), 0);
      
      const valorTotalRestante = parcelas
        .filter(p => p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado')
        .reduce((sum, p) => sum + (p.valor || 0), 0);
      
      const valorTotalVencido = parcelas
        .filter(p => {
          const hoje = new Date();
          const vencimento = new Date(p.data_vencimento);
          return p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado' && vencimento < hoje;
        })
        .reduce((sum, p) => sum + (p.valor || 0), 0);
      
      const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
      
      // Identificar alunos com maior risco
      const alunosRisco = parcelas
        .filter(p => {
          const hoje = new Date();
          const vencimento = new Date(p.data_vencimento);
          return p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado' && vencimento < hoje;
        })
        .reduce((acc, p) => {
          const nome = p.financeiro_alunos?.alunos?.nome || 'Nome não informado';
          if (!acc[nome]) {
            acc[nome] = { count: 0, valor: 0 };
          }
          acc[nome].count++;
          acc[nome].valor += p.valor || 0;
          return acc;
        }, {} as Record<string, { count: number; valor: number }>);
      
      const alunosRiscoArray = Object.entries(alunosRisco)
        .map(([nome, data]) => ({ nome, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Preparar dados estruturados para o PDF
      const dadosRelatorio = {
        cabecalho: {
          titulo: "Relatório Financeiro - TS School",
          dataGeracao: new Date().toLocaleString('pt-BR'),
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
        proximosVencimentos: proximosVencimentosRegistros.map(v => ({
          aluno: v.alunoNome,
          valor: v.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          dataVencimento: new Date(v.dataVencimento).toLocaleDateString('pt-BR'),
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
          data: new Date(d.data).toLocaleDateString('pt-BR'),
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
        parcelasDetalhadas: parcelas.slice(0, 50).map(p => ({
          aluno: p.financeiro_alunos?.alunos?.nome || 'Nome não informado',
          plano: p.financeiro_alunos?.planos?.nome || 'Plano não informado',
          parcela: p.numero_parcela,
          valor: (p.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          vencimento: new Date(p.data_vencimento).toLocaleDateString('pt-BR'),
          pagamento: p.data_pagamento ? new Date(p.data_pagamento).toLocaleDateString('pt-BR') : '-',
          status: p.status_pagamento,
          tipo: p.tipo_item,
          idioma: p.idioma_registro
        }))
      };

      await gerarRelatorioPDF(dadosRelatorio);
      
      toast({
        title: "Sucesso",
        description: "Relatório PDF gerado com sucesso!",
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
      
      // Buscar dados para o gráfico de receita mensal (removendo filtro muito restritivo)
      const { data: parcelasData, error: parcelasError } = await supabase
        .from('parcelas_alunos')
        .select(`
          valor,
          data_vencimento,
          data_pagamento,
          status_pagamento,
          idioma_registro,
          financeiro_alunos!inner (
            alunos (
              status
            )
          )
        `)
        .eq('financeiro_alunos.alunos.status', 'Ativo');
        // Removido o filtro .eq('status_pagamento', 'pago') para ter mais dados

      if (parcelasError) {
        console.error('Erro ao buscar dados das parcelas para gráficos:', parcelasError);
        return;
      }

      console.log('Dados das parcelas encontrados:', parcelasData?.length || 0);

      // Filtrar apenas parcelas pagas para receita
      const parcelasPagas = (parcelasData || []).filter(p => p.status_pagamento === 'pago');
      console.log('Parcelas pagas encontradas:', parcelasPagas.length);

      // Processar dados para receita mensal
      const receitaPorMes = parcelasPagas.reduce((acc, parcela) => {
        if (parcela.data_pagamento) {
          // Melhorar o formato da data para ordenação
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
          // Ordenar por data corretamente
          const dateA = new Date(a.mes.replace(' de ', ' '));
          const dateB = new Date(b.mes.replace(' de ', ' '));
          return dateA.getTime() - dateB.getTime();
        })
        .slice(-6); // Últimos 6 meses

      // Calcular receita acumulada
      let acumulado = 0;
      receitaMensalData.forEach(item => {
        acumulado += item.receita;
        item.receitaAcumulada = acumulado;
      });

      console.log('Receita mensal processada:', receitaMensalData);
      setReceitaMensal(receitaMensalData);

      // Processar dados para receita por idioma (usando todas as parcelas, não só pagas)
      const receitaPorIdiomaData = (parcelasData || []).reduce((acc, parcela) => {
        const idioma = parcela.idioma_registro || 'Não informado';
        // Considerar valor total da parcela, independente do status
        acc[idioma] = (acc[idioma] || 0) + (parcela.valor || 0);
        return acc;
      }, {} as Record<string, number>);

      const receitaPorIdiomaArray: ReceitaPorIdioma[] = Object.entries(receitaPorIdiomaData)
        .map(([idioma, receita]) => ({ idioma, receita }))
        .filter(item => item.receita > 0); // Filtrar apenas idiomas com receita

      console.log('Receita por idioma processada:', receitaPorIdiomaArray);
      setReceitaPorIdioma(receitaPorIdiomaArray);

      // Buscar despesas para variação de saldo
      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select('valor, categoria, status');
        // Removido filtro de status para ter mais dados

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
      ].filter(item => item.valor !== 0); // Filtrar itens com valor zero

      console.log('Variação de saldo processada:', variacaoSaldoData);
      setVariacaoSaldo(variacaoSaldoData);

      // Se não há dados, criar dados de exemplo para visualização
      if (receitaMensalData.length === 0) {
        console.log('Nenhum dado encontrado, criando dados de exemplo...');
        const dadosExemplo: ReceitaMensal[] = [
          { mes: 'Jan 2024', receita: 0, receitaAcumulada: 0 },
          { mes: 'Fev 2024', receita: 0, receitaAcumulada: 0 },
          { mes: 'Mar 2024', receita: 0, receitaAcumulada: 0 }
        ];
        setReceitaMensal(dadosExemplo);
      }

      if (receitaPorIdiomaArray.length === 0) {
        const dadosExemploIdioma: ReceitaPorIdioma[] = [
          { idioma: 'Inglês', receita: 0 },
          { idioma: 'Japonês', receita: 0 }
        ];
        setReceitaPorIdioma(dadosExemploIdioma);
      }

      if (variacaoSaldoData.length === 0) {
        const dadosExemploSaldo: VariacaoSaldo[] = [
          { categoria: 'Receitas', valor: 0, tipo: 'entrada' },
          { categoria: 'Despesas', valor: 0, tipo: 'saida' },
          { categoria: 'Saldo Final', valor: 0, tipo: 'saldo' }
        ];
        setVariacaoSaldo(dadosExemploSaldo);
      }

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

  useEffect(() => {
    carregarDados();
  }, []);

  // Calcular totais dinâmicos
  const calcularTotaisDinamicos = (parcelas: ParcelaDetalhada[]) => {
    const totalRecebido = parcelas
      .filter(p => p.status_pagamento === 'pago')
      .reduce((sum, p) => sum + (p.valor || 0), 0);
    
    const totalAReceber = parcelas
      .filter(p => p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado')
      .reduce((sum, p) => sum + (p.valor || 0), 0);
    
    const parcelasPagas = parcelas.filter(p => p.status_pagamento === 'pago').length;
    const parcelasPendentesVencidas = parcelas.filter(p => p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado').length;
    
    const totalGeral = totalRecebido + totalAReceber;
    const percentualQuitado = totalGeral > 0 ? (totalRecebido / totalGeral) * 100 : 0;

    return {
      totalRecebido,
      totalAReceber,
      parcelasPagas,
      parcelasPendentesVencidas,
      percentualQuitado
    };
  };

  // Filtrar parcelas baseado no termo de busca
  const parcelasFiltradas = parcelas.filter(parcela => {
    if (!searchTerm) return true;
    
    const termo = searchTerm.toLowerCase();
    const nomeAluno = parcela.financeiro_alunos?.alunos?.nome?.toLowerCase() || '';
    const nomePlano = parcela.financeiro_alunos?.planos?.nome?.toLowerCase() || '';
    const tipoItem = parcela.tipo_item?.toLowerCase() || '';
    const descricaoItem = parcela.descricao_item?.toLowerCase() || '';
    
    return nomeAluno.includes(termo) || 
           nomePlano.includes(termo) || 
           tipoItem.includes(termo) ||
           descricaoItem.includes(termo);
  });

  // Cálculos de paginação para registros
  const totalPagesRegistros = Math.ceil(parcelasFiltradas.length / registrosPorPagina);
  const startItemRegistros = (currentPageRegistros - 1) * registrosPorPagina + 1;
  const endItemRegistros = Math.min(currentPageRegistros * registrosPorPagina, parcelasFiltradas.length);
  const parcelasExibidas = parcelasFiltradas.slice(
    (currentPageRegistros - 1) * registrosPorPagina,
    currentPageRegistros * registrosPorPagina
  );

  // DEBUG: Logs para diagnosticar
  console.log('=== DEBUG PAGINAÇÃO ===');
  console.log('Total parcelas filtradas:', parcelasFiltradas.length);
  console.log('Registros por página:', registrosPorPagina);
  console.log('Página atual:', currentPageRegistros);
  console.log('Total de páginas:', totalPagesRegistros);
  console.log('Parcelas exibidas:', parcelasExibidas.length);
  console.log('Condição paginação (totalPages > 1):', totalPagesRegistros > 1);
  console.log('Condição alternativa (parcelas > registrosPorPagina):', parcelasFiltradas.length > registrosPorPagina);
  console.log('=== FIM DEBUG ===');

  // Páginas visíveis para paginação
  const getVisiblePagesRegistros = () => {
    if (totalPagesRegistros <= 1) return [];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Calcular o range de páginas ao redor da página atual
    const start = Math.max(2, currentPageRegistros - delta);
    const end = Math.min(totalPagesRegistros - 1, currentPageRegistros + delta);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Sempre incluir a primeira página
    if (start > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Adicionar o range do meio (excluindo primeira e última se já incluídas)
    range.forEach(page => {
      if (page !== 1 && page !== totalPagesRegistros) {
        rangeWithDots.push(page);
      }
    });

    // Sempre incluir a última página se houver mais de uma
    if (end < totalPagesRegistros - 1) {
      rangeWithDots.push('...', totalPagesRegistros);
    } else if (totalPagesRegistros > 1) {
      rangeWithDots.push(totalPagesRegistros);
    }

    // Remover duplicatas e ordenar
    return [...new Set(rangeWithDots)].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      if (typeof a === 'number') return -1;
      if (typeof b === 'number') return 1;
      return 0;
    });
  };

  const visiblePagesRegistros = getVisiblePagesRegistros();

  // Reset página quando busca muda ou itens por página muda
  useEffect(() => {
    setCurrentPageRegistros(1);
  }, [searchTerm, registrosPorPagina]);

  // Calcular totais baseados nas parcelas filtradas
  const totaisDinamicos = calcularTotaisDinamicos(parcelasFiltradas);

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-600" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
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
          
          {/* Botão Exportar PDF */}
          <Button 
            onClick={exportarDados}
            disabled={exportandoPDF}
            className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${exportandoPDF ? "animate-pulse" : ""}`}
          >
            {exportandoPDF ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exportandoPDF ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </div>
      </motion.div>

      {/* Despesas Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Despesas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {despesas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma despesa encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {despesas.map((despesa) => (
                  <motion.div 
                    key={despesa.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{despesa.descricao}</p>
                        <p className="text-sm text-gray-600">
                          {despesa.categoria} • {new Date(despesa.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <Badge 
                        variant={despesa.status === 'Pago' ? "default" : "secondary"}
                      >
                        {despesa.status === 'Pago' ? 'Pago' : 'Pendente'}
                      </Badge>
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
          </CardHeader>
          <CardContent>
            {proximosVencimentosRegistros.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum vencimento nos próximos 30 dias</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proximosVencimentosRegistros.map((vencimento) => (
                  <motion.div 
                    key={vencimento.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(vencimento.status)}
                      <div className="flex-1">
                        <p className="font-medium">{vencimento.alunoNome}</p>
                        <p className="text-sm text-gray-600">
                          {vencimento.planoNome} - Parcela {vencimento.numeroParcela}
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
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Análise Financeira</h2>
        </div>

        {/* Grid de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Crescimento de Receita */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="text-gray-800">Crescimento de Receita</span>
                  <p className="text-sm text-gray-500 font-normal mt-1">Evolução mensal das receitas</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80 p-4 bg-white rounded-lg border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={receitaMensal} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="mes" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        'Receita'
                      ]}
                      labelFormatter={(label) => `Mês: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        fontSize: '14px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="#10b981" 
                      fill="url(#colorReceita)" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                    />
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Receita por Idioma */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                   <div>
                  <span className="text-gray-800">Distribuição por curso</span>
                  <p className="text-sm text-gray-500 font-normal mt-1">Receita por idioma/curso</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2">
              <div className="h-80 p-2 bg-white rounded-lg border border-gray-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={receitaPorIdioma} 
                    layout="horizontal" 
                    margin={{ top: 20, right: 20, left: 60, bottom: 20 }}
                    maxBarSize={30}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="idioma" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      width={55}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        'Receita'
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="receita" radius={[0, 6, 6, 0]}>
                      {receitaPorIdioma.map((entry, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={colors[index % colors.length]} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Variação de Saldo - Largura Total */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <span className="text-gray-800">Variação de Saldo</span>
                <p className="text-sm text-gray-500 font-normal mt-1">Entradas e saídas por categoria</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-6">
            <div className="h-80 p-6 bg-white rounded-lg border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={variacaoSaldo} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="categoria" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      value >= 0 ? 'Entrada' : 'Saída'
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={80}>
                    {variacaoSaldo.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.tipo === 'entrada' ? '#10b981' : 
                          entry.tipo === 'saida' ? '#ef4444' : 
                          entry.valor >= 0 ? '#3b82f6' : '#f59e0b'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
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
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por aluno, plano..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
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
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição do Item</TableHead>
                    {detalhesAbertos && (
                      <>
                        <TableHead>Idioma</TableHead>
                        <TableHead>Pagamento</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelasExibidas.map((parcela) => (
                    <TableRow key={parcela.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <TableCell>
                        <div className="flex justify-center">
                          {getStatusIcon(parcela.status_pagamento)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {parcela.financeiro_alunos?.alunos?.nome || 'Nome não informado'}
                      </TableCell>
                      <TableCell>
                        {parcela.financeiro_alunos?.planos?.nome || 'Plano não informado'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {parcela.numero_parcela}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">
                        R$ {parcela.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                      </TableCell>
                      <TableCell>
                        {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(parcela.tipo_item)}>
                          {parcela.tipo_item}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-gray-600">
                          {parcela.descricao_item ? (
                            <div className="truncate" title={parcela.descricao_item}>
                              {parcela.descricao_item}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </div>
                      </TableCell>
                      {detalhesAbertos && (
                        <>
                          <TableCell>
                            <Badge variant="secondary">
                              {parcela.idioma_registro}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {parcela.data_pagamento ? 
                              new Date(parcela.data_pagamento).toLocaleDateString('pt-BR') : 
                              '-'
                            }
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={12} className="bg-gray-50">
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
                <div className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full px-6 py-3 shadow-lg">
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
                <Card className="shadow-md border-0 bg-gradient-to-r from-gray-50 to-white">
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
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 shadow-sm'
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
                                      ? 'bg-gradient-to-r from-red-600 to-gray-800 text-white shadow-lg'
                                      : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
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
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 shadow-sm'
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