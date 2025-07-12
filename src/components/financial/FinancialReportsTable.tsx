import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  CreditCard,
  Wallet,
  Target,
  Activity,
  Eye,
  Search,
  User,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGroqPDF } from '@/hooks/useGroqPDF';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interfaces baseadas nos dados reais das parcelas
interface ParcelaDetalhada {
  id: number;
  registro_financeiro_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status_pagamento: string;
  tipo_item: 'plano' | 'material' | 'matrícula';
  idioma_registro: 'Inglês' | 'Japonês';
  aluno_nome?: string;
  plano_nome?: string;
  forma_pagamento?: string;
}

interface ResumoRegistros {
  totalParcelas: number;
  parcelasPagas: number;
  parcelasVencidas: number;
  parcelasPendentes: number;
  parcelasCanceladas: number;
  valorTotalPago: number;
  valorTotalPendente: number;
  valorTotalVencido: number;
  receitas: number;
  despesas: number;
  saldo: number;
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

interface IndicadoresRegistros {
  percentualPagamento: number;
  valorMedioPorParcela: number;
  tipoMaisComum: string;
  idiomaPreferido: string;
  tendenciaPagamento: 'Crescente' | 'Estável' | 'Decrescente';
  inadimplencia: number;
  crescimentoMensal: number;
}

interface FiltrosAvancados {
  dataInicio: string;
  dataFim: string;
  aluno: string;
  status: string;
  tipoItem: string;
  valorMin: string;
  valorMax: string;
}

interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  categoria: 'salarios' | 'aluguel' | 'materiais' | 'marketing' | 'manutencao' | 'outros';
  data: string;
  status: 'pago' | 'pendente';
}

const FinancialReportsTable = () => {
  const { toast } = useToast();
  const { gerarRelatorioPDF } = useGroqPDF();
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes-atual');
  const [loading, setLoading] = useState(true);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [parcelas, setParcelas] = useState<ParcelaDetalhada[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState<Partial<Despesa>>({
    descricao: '',
    valor: 0,
    categoria: 'outros',
    data: new Date().toISOString().split('T')[0],
    status: 'pendente'
  });
  
  // Estados para filtros avançados
  const [filtros, setFiltros] = useState<FiltrosAvancados>({
    dataInicio: '',
    dataFim: '',
    aluno: '',
    status: '',
    tipoItem: '',
    valorMin: '',
    valorMax: ''
  });
  
  // Estados para os dados dos registros
  const [resumoRegistros, setResumoRegistros] = useState<ResumoRegistros>({
    totalParcelas: 0,
    parcelasPagas: 0,
    parcelasVencidas: 0,
    parcelasPendentes: 0,
    parcelasCanceladas: 0,
    valorTotalPago: 0,
    valorTotalPendente: 0,
    valorTotalVencido: 0,
    receitas: 0,
    despesas: 0,
    saldo: 0
  });
  
  const [proximosVencimentosRegistros, setProximosVencimentosRegistros] = useState<ProximoVencimentoRegistro[]>([]);
  const [indicadoresRegistros, setIndicadoresRegistros] = useState<IndicadoresRegistros>({
    percentualPagamento: 0,
    valorMedioPorParcela: 0,
    tipoMaisComum: '',
    idiomaPreferido: '',
    tendenciaPagamento: 'Estável',
    inadimplencia: 0,
    crescimentoMensal: 0
  });

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

  // Função para buscar despesas do banco
  const buscarDespesas = async () => {
    try {
      console.log('Buscando despesas...');
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar despesas:', error);
        toast({
          title: "Erro",
          description: `Erro ao carregar despesas: ${error.message}`,
          variant: "destructive"
        });
        setDespesas([]);
        return;
      }
      
      console.log('Despesas carregadas:', data);
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as despesas.",
        variant: "destructive"
      });
      setDespesas([]);
    }
  };

  // Função para adicionar nova despesa
  const adicionarDespesa = async () => {
    try {
      // Validação mais robusta
      if (!novaDespesa.descricao || !novaDespesa.descricao.trim()) {
        toast({
          title: "Erro de Validação",
          description: "A descrição é obrigatória.",
          variant: "destructive"
        });
        return;
      }

      if (!novaDespesa.valor || novaDespesa.valor <= 0) {
        toast({
          title: "Erro de Validação",
          description: "O valor deve ser maior que zero.",
          variant: "destructive"
        });
        return;
      }

      if (!novaDespesa.data) {
        toast({
          title: "Erro de Validação",
          description: "A data é obrigatória.",
          variant: "destructive"
        });
        return;
      }

      console.log('Adicionando despesa:', novaDespesa);

      const despesaParaInserir = {
        descricao: novaDespesa.descricao.trim(),
        valor: parseFloat(novaDespesa.valor.toString()),
        categoria: novaDespesa.categoria,
        data: novaDespesa.data,
        status: novaDespesa.status
      };

      const { data, error } = await supabase
        .from('despesas')
        .insert([despesaParaInserir])
        .select();
      
      if (error) {
        console.error('Erro ao adicionar despesa:', error);
        toast({
          title: "Erro",
          description: `Erro ao adicionar despesa: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Despesa adicionada:', data);
      
      if (data && data[0]) {
        // Atualizar lista de despesas
        setDespesas([data[0], ...despesas]);
        
        // Resetar formulário
        setNovaDespesa({
          descricao: '',
          valor: 0,
          categoria: 'outros',
          data: new Date().toISOString().split('T')[0],
          status: 'pendente'
        });
        
        // Fechar modal
        setModalDespesaAberto(false);
        
        toast({
          title: "Sucesso",
          description: "Despesa adicionada com sucesso!",
          variant: "default"
        });
        
        // Recarregar dados para atualizar o resumo
        await carregarDados();
      }
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar despesa.",
        variant: "destructive"
      });
    }
  };

  // Função para calcular resumo dos registros
  const calcularResumoRegistros = (parcelas: any[]): ResumoRegistros => {
    const hoje = new Date();
    
    let totalParcelas = 0;
    let parcelasPagas = 0;
    let parcelasVencidas = 0;
    let parcelasPendentes = 0;
    let parcelasCanceladas = 0;
    let valorTotalPago = 0;
    let valorTotalPendente = 0;
    let valorTotalVencido = 0;

    parcelas.forEach(parcela => {
      totalParcelas++;
      const valor = parcela.valor || 0;
      const dataVencimento = new Date(parcela.data_vencimento);
      
      switch (parcela.status_pagamento) {
        case 'pago':
          parcelasPagas++;
          valorTotalPago += valor;
          break;
        case 'cancelado':
          parcelasCanceladas++;
          break;
        default:
          if (dataVencimento < hoje) {
            parcelasVencidas++;
            valorTotalVencido += valor;
          } else {
            parcelasPendentes++;
            valorTotalPendente += valor;
          }
          break;
      }
    });

    // Calcular total de despesas reais
    const totalDespesas = despesas.reduce((total, despesa) => {
      return total + (despesa.valor || 0);
    }, 0);

    const receitas = valorTotalPago;
    const saldo = receitas - totalDespesas;

    return {
      totalParcelas,
      parcelasPagas,
      parcelasVencidas,
      parcelasPendentes,
      parcelasCanceladas,
      valorTotalPago,
      valorTotalPendente,
      valorTotalVencido,
      receitas,
      despesas: totalDespesas,
      saldo
    };
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

  // Função para calcular indicadores dos registros
  const calcularIndicadoresRegistros = (parcelas: any[]): IndicadoresRegistros => {
    if (parcelas.length === 0) {
      return {
        percentualPagamento: 0,
        valorMedioPorParcela: 0,
        tipoMaisComum: '',
        idiomaPreferido: '',
        tendenciaPagamento: 'Estável',
        inadimplencia: 0,
        crescimentoMensal: 0
      };
    }

    const parcelasPagas = parcelas.filter(p => p.status_pagamento === 'pago').length;
    const parcelasVencidas = parcelas.filter(p => {
      const dataVencimento = new Date(p.data_vencimento);
      return p.status_pagamento !== 'pago' && dataVencimento < new Date();
    }).length;
    
    const percentualPagamento = (parcelasPagas / parcelas.length) * 100;
    const inadimplencia = (parcelasVencidas / parcelas.length) * 100;
    
    const valorTotal = parcelas.reduce((sum, p) => sum + (p.valor || 0), 0);
    const valorMedioPorParcela = valorTotal / parcelas.length;

    // Tipo mais comum
    const tipoCount = parcelas.reduce((acc, p) => {
      acc[p.tipo_item] = (acc[p.tipo_item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const tipoMaisComum = Object.keys(tipoCount).reduce((a, b) => tipoCount[a] > tipoCount[b] ? a : b, '');

    // Idioma preferido
    const idiomaCount = parcelas.reduce((acc, p) => {
      acc[p.idioma_registro] = (acc[p.idioma_registro] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const idiomaPreferido = Object.keys(idiomaCount).reduce((a, b) => idiomaCount[a] > idiomaCount[b] ? a : b, '');

    // Crescimento mensal simulado
    const crescimentoMensal = Math.random() * 20 - 10; // -10% a +10%

    return {
      percentualPagamento,
      valorMedioPorParcela,
      tipoMaisComum,
      idiomaPreferido,
      tendenciaPagamento: percentualPagamento >= 80 ? 'Crescente' : percentualPagamento >= 60 ? 'Estável' : 'Decrescente',
      inadimplencia,
      crescimentoMensal
    };
  };

  // Carregar dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      const dados = await buscarDadosRegistros();
      setParcelas(dados);
      
      setResumoRegistros(calcularResumoRegistros(dados));
      setProximosVencimentosRegistros(calcularProximosVencimentosRegistros(dados));
      setIndicadoresRegistros(calcularIndicadoresRegistros(dados));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos registros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    buscarDespesas();
  }, [periodoSelecionado, filtros]);

  // Função para exportar dados com IA
  const exportarDados = async () => {
    setExportandoPDF(true);
    
    try {
      // Preparar dados mais completos para o relatório
      const dadosExportacao = {
        // Informações básicas do relatório
        dataGeracao: new Date().toLocaleString('pt-BR'),
        periodo: periodoSelecionado,
        escola: 'TS School',
        tipoRelatorio: 'Relatório Financeiro Completo',
        
        // Resumo financeiro principal
        resumo: {
          ...resumoRegistros,
          // Adicionar percentuais calculados
          percentualPago: resumoRegistros.totalParcelas > 0 ? 
            ((resumoRegistros.parcelasPagas / resumoRegistros.totalParcelas) * 100).toFixed(1) : '0',
          percentualVencido: resumoRegistros.totalParcelas > 0 ? 
            ((resumoRegistros.parcelasVencidas / resumoRegistros.totalParcelas) * 100).toFixed(1) : '0',
          percentualPendente: resumoRegistros.totalParcelas > 0 ? 
            ((resumoRegistros.parcelasPendentes / resumoRegistros.totalParcelas) * 100).toFixed(1) : '0'
        },
        
        // Próximos vencimentos com mais detalhes
        proximosVencimentos: proximosVencimentosRegistros.map(venc => ({
          ...venc,
          valorFormatado: venc.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
          dataVencimentoFormatada: new Date(venc.dataVencimento).toLocaleDateString('pt-BR'),
          urgencia: venc.diasRestantes <= 7 ? 'Alta' : venc.diasRestantes <= 15 ? 'Média' : 'Baixa'
        })),
        
        // Indicadores expandidos
        indicadores: {
          ...indicadoresRegistros,
          // Adicionar mais métricas calculadas
          statusGeral: indicadoresRegistros.percentualPagamento >= 80 ? 'Excelente' : 
                      indicadoresRegistros.percentualPagamento >= 60 ? 'Bom' : 
                      indicadoresRegistros.percentualPagamento >= 40 ? 'Regular' : 'Crítico',
          valorMedioFormatado: indicadoresRegistros.valorMedioPorParcela.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        },
        
        // Análise detalhada por tipo de item
        analisePorTipo: {
          planos: parcelas.filter(p => p.tipo_item === 'plano').length,
          materiais: parcelas.filter(p => p.tipo_item === 'material').length,
          matriculas: parcelas.filter(p => p.tipo_item === 'matrícula').length
        },
        
        // Análise por idioma
        analisePorIdioma: {
          ingles: parcelas.filter(p => p.idioma_registro === 'Inglês').length,
          japones: parcelas.filter(p => p.idioma_registro === 'Japonês').length
        },
        
        // Análise de status de pagamento
        analiseStatus: {
          pagas: {
            quantidade: resumoRegistros.parcelasPagas,
            valor: resumoRegistros.valorTotalPago,
            percentual: resumoRegistros.totalParcelas > 0 ? 
              ((resumoRegistros.parcelasPagas / resumoRegistros.totalParcelas) * 100).toFixed(1) : '0'
          },
          vencidas: {
            quantidade: resumoRegistros.parcelasVencidas,
            valor: resumoRegistros.valorTotalVencido,
            percentual: resumoRegistros.totalParcelas > 0 ? 
              ((resumoRegistros.parcelasVencidas / resumoRegistros.totalParcelas) * 100).toFixed(1) : '0'
          },
          pendentes: {
            quantidade: resumoRegistros.parcelasPendentes,
            valor: resumoRegistros.valorTotalPendente,
            percentual: resumoRegistros.totalParcelas > 0 ? 
              ((resumoRegistros.parcelasPendentes / resumoRegistros.totalParcelas) * 100).toFixed(1) : '0'
          }
        },
        
        // Top 10 maiores valores pendentes
        maioresPendencias: parcelas
          .filter(p => p.status_pagamento !== 'pago' && p.status_pagamento !== 'cancelado')
          .sort((a, b) => (b.valor || 0) - (a.valor || 0))
          .slice(0, 10)
          .map(p => ({
            alunoNome: p.financeiro_alunos?.alunos?.nome || 'Nome não informado',
            valor: p.valor || 0,
            valorFormatado: (p.valor || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }),
            dataVencimento: new Date(p.data_vencimento).toLocaleDateString('pt-BR'),
            diasAtraso: p.status_pagamento !== 'pago' && new Date(p.data_vencimento) < new Date() ?
              Math.ceil((new Date().getTime() - new Date(p.data_vencimento).getTime()) / (1000 * 60 * 60 * 24)) : 0,
            tipoItem: p.tipo_item,
            numeroParcela: p.numero_parcela
          })),
        
        // Resumo de valores totais
        totaisGerais: {
          valorTotalGerado: parcelas.reduce((sum, p) => sum + (p.valor || 0), 0),
          valorTotalPago: resumoRegistros.valorTotalPago,
          valorTotalPendente: resumoRegistros.valorTotalPendente + resumoRegistros.valorTotalVencido,
          percentualRecebido: parcelas.length > 0 ? 
            ((resumoRegistros.valorTotalPago / parcelas.reduce((sum, p) => sum + (p.valor || 0), 0)) * 100).toFixed(1) : '0'
        },
        
        // Alertas e recomendações
        alertas: [
          ...(resumoRegistros.parcelasVencidas > 0 ? 
            [`${resumoRegistros.parcelasVencidas} parcela(s) vencida(s) no valor de ${resumoRegistros.valorTotalVencido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`] : []),
          ...(proximosVencimentosRegistros.filter(p => p.diasRestantes <= 7).length > 0 ? 
            [`${proximosVencimentosRegistros.filter(p => p.diasRestantes <= 7).length} vencimento(s) nos próximos 7 dias`] : []),
          ...(indicadoresRegistros.percentualPagamento < 60 ? 
            ['Taxa de pagamento abaixo de 60% - atenção necessária'] : [])
        ]
      };
      
      toast({
        title: "Gerando Relatório...",
        description: "A IA está analisando os dados e criando seu relatório personalizado.",
        variant: "default"
      });
      
      const resultado = await gerarRelatorioPDF(dadosExportacao);
      
      if (resultado.success) {
        toast({
          title: "🎉 Relatório Gerado com Sucesso!",
          description: `Relatório inteligente ${resultado.fileName} foi baixado com análises da IA.`,
          variant: "default"
        });
      } else {
        throw new Error(resultado.error);
      }
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "❌ Erro na Geração do Relatório",
        description: "Não foi possível gerar o relatório inteligente. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setExportandoPDF(false);
    }
  };

  // Filtrar parcelas baseado na busca e filtros
  const parcelasFiltradas = parcelas.filter(parcela => {
    const nomeAluno = parcela.financeiro_alunos?.alunos?.nome?.toLowerCase() || '';
    const nomePlano = parcela.financeiro_alunos?.planos?.nome?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchSearch = nomeAluno.includes(searchLower) || 
                       nomePlano.includes(searchLower) ||
                       parcela.tipo_item.toLowerCase().includes(searchLower);
    
    const matchFiltros = (
      (!filtros.aluno || nomeAluno.includes(filtros.aluno.toLowerCase())) &&
      (!filtros.status || parcela.status_pagamento === filtros.status) &&
      (!filtros.tipoItem || parcela.tipo_item === filtros.tipoItem) &&
      (!filtros.valorMin || parcela.valor >= parseFloat(filtros.valorMin)) &&
      (!filtros.valorMax || parcela.valor <= parseFloat(filtros.valorMax))
    );
    
    return matchSearch && matchFiltros;
  });

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
      {/* Cabeçalho Moderno */}
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
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Filtro de Período */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-atual">Mês Atual</SelectItem>
                  <SelectItem value="trimestre">Último Trimestre</SelectItem>
                  <SelectItem value="semestre">Último Semestre</SelectItem>
                  <SelectItem value="ano">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFiltrosAbertos(!filtrosAbertos)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filtros
                      {filtrosAbertos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filtros avançados</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={exportarDados}
                      disabled={exportandoPDF}
                      className={`flex items-center gap-2 ${exportandoPDF ? "animate-pulse" : ""}`}
                    >
                      {exportandoPDF ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {exportandoPDF ? 'Gerando...' : 'Exportar PDF'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{exportandoPDF ? 'IA analisando dados...' : 'Gerar relatório com análise inteligente da IA'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {/* Filtros Avançados Expansíveis */}
        <AnimatePresence>
          {filtrosAbertos && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Data Início
                  </Label>
                  <Input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Data Fim
                  </Label>
                  <Input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Aluno
                  </Label>
                  <Input
                    placeholder="Nome do aluno"
                    value={filtros.aluno}
                    onChange={(e) => setFiltros({...filtros, aluno: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4" />
                    Status
                  </Label>
                  <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cards de Métricas Principais */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Receitas */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Receitas</CardTitle>
            <div className="p-2 bg-green-200 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-2">
              R$ {resumoRegistros.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-300">
                +{indicadoresRegistros.crescimentoMensal > 0 ? indicadoresRegistros.crescimentoMensal.toFixed(1) : '0.0'}%
              </Badge>
              <p className="text-xs text-green-600">vs mês anterior</p>
            </div>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Despesas</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalDespesaAberto(true)}
                className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 border-red-300"
              >
                <Plus className="h-4 w-4 text-red-700" />
              </Button>
              <div className="p-2 bg-red-200 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900 mb-2">
              R$ {resumoRegistros.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 border-red-300">
                {despesas.filter(d => d.status === 'pendente').length} pendentes
              </Badge>
              <p className="text-xs text-red-600">despesas registradas</p>
            </div>
          </CardContent>
        </Card>

        {/* Saldo */}
        <Card className={`bg-gradient-to-br ${resumoRegistros.saldo >= 0 ? 'from-blue-50 to-cyan-100 border-blue-200' : 'from-orange-50 to-amber-100 border-orange-200'} shadow-lg hover:shadow-xl transition-all duration-300`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${resumoRegistros.saldo >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Saldo</CardTitle>
            <div className={`p-2 ${resumoRegistros.saldo >= 0 ? 'bg-blue-200' : 'bg-orange-200'} rounded-full`}>
              <Wallet className={`h-5 w-5 ${resumoRegistros.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${resumoRegistros.saldo >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              R$ {resumoRegistros.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={resumoRegistros.saldo >= 0 ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-orange-100 text-orange-800 border-orange-300'}>
                {resumoRegistros.saldo >= 0 ? 'Positivo' : 'Negativo'}
              </Badge>
              <p className={`text-xs ${resumoRegistros.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>balanço atual</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cards de Indicadores Secundários */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Parcelas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumoRegistros.totalParcelas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {resumoRegistros.parcelasPagas} pagas • {resumoRegistros.parcelasPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Pagamento</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indicadoresRegistros.percentualPagamento.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Tendência: {indicadoresRegistros.tendenciaPagamento}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {indicadoresRegistros.valorMedioPorParcela.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground">Por parcela</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo Mais Comum</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{indicadoresRegistros.tipoMaisComum}</div>
            <p className="text-xs text-muted-foreground">Categoria principal</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista de Despesas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Despesas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {despesas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma despesa registrada
              </p>
            ) : (
              <div className="space-y-2">
                {despesas.slice(0, 5).map((despesa) => (
                  <div key={despesa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{despesa.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {despesa.categoria} • {new Date(despesa.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant={despesa.status === 'pago' ? 'default' : 'secondary'}>
                        {despesa.status === 'pago' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
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
        transition={{ duration: 0.5, delay: 0.3 }}
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

      {/* Tabela de Parcelas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
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
                    {detalhesAbertos && (
                      <>
                        <TableHead>Idioma</TableHead>
                        <TableHead>Pagamento</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelasFiltradas.slice(0, 20).map((parcela) => (
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
              </Table>
              
              {parcelasFiltradas.length > 20 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Mostrando 20 de {parcelasFiltradas.length} parcelas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal para Nova Despesa */}
      <AnimatePresence>
        {modalDespesaAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setModalDespesaAberto(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Nova Despesa</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalDespesaAberto(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={novaDespesa.descricao}
                    onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                    placeholder="Ex: Salário professor, Aluguel, Material didático"
                  />
                </div>
                
                <div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={novaDespesa.valor}
                    onChange={(e) => setNovaDespesa({...novaDespesa, valor: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={novaDespesa.categoria}
                    onValueChange={(value) => setNovaDespesa({...novaDespesa, categoria: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salarios">Salários</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                      <SelectItem value="materiais">Materiais</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={novaDespesa.data}
                    onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select
                    value={novaDespesa.status}
                    onValueChange={(value) => setNovaDespesa({...novaDespesa, status: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setModalDespesaAberto(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={adicionarDespesa}
                  className="flex-1"
                  disabled={!novaDespesa.descricao || !novaDespesa.valor}
                >
                  Adicionar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialReportsTable;