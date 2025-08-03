import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  User, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';

interface Student {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  cpf?: string | null;
  status?: string;
}

interface FinanceiroAluno {
  id: string;
  aluno_id: string;
  plano_id: string;
  valor_plano: number;
  valor_material: number;
  valor_matricula: number;
  valor_total: number;
  desconto_total: number;
  status_geral: string;
  data_primeiro_vencimento: string;
  forma_pagamento_plano: string;
  forma_pagamento_material: string | null;
  forma_pagamento_matricula: string | null;
  numero_parcelas_plano: number;
  numero_parcelas_material: number | null;
  numero_parcelas_matricula: number | null;
  porcentagem_progresso: number | null;
  porcentagem_total: number | null;
  idioma_registro: string;
  ativo_ou_encerrado: string;
  migrado: string;
  created_at: string | null;
  updated_at: string | null;
  planos?: {
    id: string;
    nome: string;
    descricao: string;
    valor_total: number | null;
    idioma: string;
  };
}

interface ParcelaAluno {
  id: number;
  registro_financeiro_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status_pagamento: string;
  tipo_item: string;
  descricao_item: string | null;
  forma_pagamento: string | null;
  idioma_registro: string;
  observacoes: string | null;
  comprovante: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

interface ContratoAluno {
  id: string;
  aluno_id: string | null;
  plano_id: string | null;
  data_inicio: string;
  data_fim: string | null;
  valor_mensalidade: number;
  status_contrato: string;
  idioma_contrato: string | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
  planos?: {
    id: string;
    nome: string;
    descricao: string;
    valor_total: number | null;
    idioma: string;
  };
}

interface DadosFinanceiros {
  registroFinanceiro: FinanceiroAluno | null;
  parcelas: ParcelaAluno[];
  valorTotal: number;
  statusGeral: string;
  proximoVencimento: string | null;
  progresso: number;
  parcelasPagas: number;
  parcelasPendentes: number;
  valorEmAtraso: number;
  planoNome: string;
}

interface DadosContratos {
  contratoAtivo: ContratoAluno | null;
  totalContratos: number;
  contratoMaisRecente: ContratoAluno | null;
}

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros>({
    registroFinanceiro: null,
    parcelas: [],
    valorTotal: 0,
    statusGeral: 'Pendente',
    proximoVencimento: null,
    progresso: 0,
    parcelasPagas: 0,
    parcelasPendentes: 0,
    valorEmAtraso: 0,
    planoNome: 'Não definido'
  });
  const [dadosContratos, setDadosContratos] = useState<DadosContratos>({
    contratoAtivo: null,
    totalContratos: 0,
    contratoMaisRecente: null
  });
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const { toast } = useToast();

  // Função para buscar dados de contratos do aluno
  const buscarDadosContratos = async (alunoId: string) => {
    setLoadingContratos(true);
    try {
      // Buscar todos os contratos do aluno com join correto para planos
      const { data: contratos, error } = await supabase
        .from('contratos')
        .select(`
          id,
          aluno_id,
          plano_id,
          data_inicio,
          data_fim,
          valor_mensalidade,
          status_contrato,
          idioma_contrato,
          observacao,
          created_at,
          updated_at,
          planos (
            id,
            nome,
            descricao,
            valor_total,
            idioma
          )
        `)
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const contratosArray = contratos || [];
      
      // Encontrar contrato ativo (status_contrato = 'Ativo')
      const contratoAtivo = contratosArray.find(c => c.status_contrato === 'Ativo') || null;
      
      // Contrato mais recente (primeiro da lista ordenada por created_at desc)
      const contratoMaisRecente = contratosArray[0] || null;

      setDadosContratos({
        contratoAtivo,
        totalContratos: contratosArray.length,
        contratoMaisRecente
      });

    } catch (error) {
      console.error('Erro ao buscar dados de contratos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de contratos do aluno.",
        variant: "destructive",
      });
    } finally {
      setLoadingContratos(false);
    }
  };

  // Função para buscar dados financeiros do aluno
  const buscarDadosFinanceiros = async (alunoId: string) => {
    setLoadingFinanceiro(true);
    try {
      // Buscar registro financeiro do aluno com join correto para planos
      const { data: registroFinanceiro, error: errorRegistro } = await supabase
        .from('financeiro_alunos')
        .select(`
          id,
          aluno_id,
          plano_id,
          valor_plano,
          valor_material,
          valor_matricula,
          valor_total,
          desconto_total,
          status_geral,
          data_primeiro_vencimento,
          forma_pagamento_plano,
          forma_pagamento_material,
          forma_pagamento_matricula,
          numero_parcelas_plano,
          numero_parcelas_material,
          numero_parcelas_matricula,
          porcentagem_progresso,
          porcentagem_total,
          idioma_registro,
          ativo_ou_encerrado,
          migrado,
          created_at,
          updated_at,
          planos (
            id,
            nome,
            descricao,
            valor_total,
            idioma
          )
        `)
        .eq('aluno_id', alunoId)
        .eq('ativo_ou_encerrado', 'ativo')
        .single();

      if (errorRegistro && errorRegistro.code !== 'PGRST116') {
        throw errorRegistro;
      }

      if (!registroFinanceiro) {
        setDadosFinanceiros(prev => ({
          ...prev,
          registroFinanceiro: null,
          parcelas: [],
          planoNome: 'Nenhum plano ativo'
        }));
        return;
      }

      // Buscar parcelas do registro financeiro com todos os campos necessários
      const { data: parcelas, error: errorParcelas } = await supabase
        .from('parcelas_alunos')
        .select(`
          id,
          registro_financeiro_id,
          numero_parcela,
          valor,
          data_vencimento,
          data_pagamento,
          status_pagamento,
          tipo_item,
          descricao_item,
          forma_pagamento,
          idioma_registro,
          observacoes,
          comprovante,
          criado_em,
          atualizado_em
        `)
        .eq('registro_financeiro_id', registroFinanceiro.id)
        .order('data_vencimento', { ascending: true });

      if (errorParcelas) {
        throw errorParcelas;
      }

      // Calcular dados derivados
      const parcelasArray = parcelas || [];
      const hoje = new Date();
      
      const parcelasPagas = parcelasArray.filter(p => p.status_pagamento === 'pago').length;
      const parcelasPendentes = parcelasArray.filter(p => p.status_pagamento === 'pendente').length;
      
      // Calcular valor em atraso (parcelas vencidas não pagas)
      const valorEmAtraso = parcelasArray
        .filter(p => {
          const dataVencimento = new Date(p.data_vencimento);
          return dataVencimento < hoje && p.status_pagamento !== 'pago';
        })
        .reduce((total, p) => total + Number(p.valor), 0);

      // Encontrar próximo vencimento
      const parcelasNaoPagas = parcelasArray.filter(p => p.status_pagamento !== 'pago');
      const proximaParcela = parcelasNaoPagas
        .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0];

      const proximoVencimento = proximaParcela ? proximaParcela.data_vencimento : null;

      setDadosFinanceiros({
        registroFinanceiro,
        parcelas: parcelasArray,
        valorTotal: Number(registroFinanceiro.valor_total),
        statusGeral: registroFinanceiro.status_geral,
        proximoVencimento,
        progresso: Number(registroFinanceiro.porcentagem_progresso || 0),
        parcelasPagas,
        parcelasPendentes,
        valorEmAtraso,
        planoNome: registroFinanceiro.planos?.nome || 'Plano não definido'
      });

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros do aluno.",
        variant: "destructive",
      });
    } finally {
      setLoadingFinanceiro(false);
    }
  };

  // Buscar dados financeiros e de contratos quando o modal abrir
  useEffect(() => {
    if (isOpen && student?.id) {
      buscarDadosFinanceiros(student.id);
      buscarDadosContratos(student.id);
    }
  }, [isOpen, student?.id]);

  // Função para formatar valor monetário
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para formatar data
  const formatarData = (data: string) => {
    return formatDate(data);
  };

  // Função para calcular duração do contrato
  const calcularDuracaoContrato = (dataInicio: string, dataFim?: string | null) => {
    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : new Date();
    
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} dias`;
  };

  // Função para obter cor do status do contrato
  const getStatusContratoColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'text-green-400';
      case 'inativo':
        return 'text-gray-400';
      case 'suspenso':
        return 'text-yellow-400';
      case 'cancelado':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Função para obter ícone do status do contrato
  const getStatusContratoIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4" />;
      case 'inativo':
        return <Clock className="h-4 w-4" />;
      case 'suspenso':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelado':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'text-green-400';
      case 'pendente':
        return 'text-yellow-400';
      case 'atrasado':
      case 'vencido':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return <CheckCircle className="h-4 w-4" />;
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'atrasado':
      case 'vencido':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center space-x-3 text-2xl font-bold text-[#1F2937]">
            <div className="p-2 bg-gradient-to-r from-[#D90429] to-pink-500 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <span>Detalhes do Aluno</span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header com informações básicas */}
          <div className="bg-gradient-to-r from-[#D90429] to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{student.nome}</h2>
                <p className="text-white/80">ID: {student.id}</p>
              </div>
              <div className="text-right">
                <Badge className="bg-white/20 text-white border-white/30">
                  {student.status || 'Ativo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informações Pessoais - Topo, expandido horizontalmente, baixo em altura */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg p-6 shadow-lg text-white mb-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-6 w-6 text-white" />
              <h3 className="text-xl font-semibold">Informações Pessoais</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="flex flex-col">
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Nome:
                </span>
                <span className="font-medium text-lg">{student.nome}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email:
                </span>
                <span className="font-medium">{student.email || 'Não informado'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone:
                </span>
                <span className="font-medium">{student.telefone || 'Não informado'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data de Nascimento:
                </span>
                <span className="font-medium">{student.data_nascimento ? formatarData(student.data_nascimento) : 'Não informado'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/70 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Endereço:
                </span>
                <span className="font-medium">{student.endereco || 'Não informado'}</span>
              </div>
            </div>
          </motion.div>

          {/* Cards principais - Registro Financeiro, Desempenho e Contratos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Coluna esquerda - Registro Financeiro e Desempenho */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Registro Financeiro - Expandido */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-[#2BC96D] to-[#27B561] rounded-lg p-8 shadow-lg text-white flex-1 mb-6"
              >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-7 w-7 text-white" />
                  <h3 className="text-2xl font-semibold">Registro Financeiro</h3>
                  {loadingFinanceiro && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                </div>
                
                {/* Idioma - Movido para a mesma altura do título */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                  <span className="text-white/70 text-xs uppercase tracking-wide">Idioma: </span>
                  <span className="font-semibold text-white">
                    {dadosFinanceiros.registroFinanceiro?.idioma_registro || 'Não definido'}
                  </span>
                </div>
              </div>
              
              {/* Linha Superior - 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Valor Total - Card destacado */}
                <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/30 shadow-lg">
                  <span className="text-white/90 text-sm block mb-1 font-medium">Valor Total:</span>
                  <span className="font-bold text-xl text-white">{formatarMoeda(dadosFinanceiros.valorTotal)}</span>
                </div>
                
                {/* Status Geral - Mesmo design do Valor Total */}
                <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/30 shadow-lg">
                  <span className="text-white/90 text-sm block mb-1 font-medium flex items-center gap-1">
                    {getStatusIcon(dadosFinanceiros.statusGeral)}
                    Status Geral:
                  </span>
                  <span className="font-bold text-xl text-white">{dadosFinanceiros.statusGeral}</span>
                </div>
                
                {/* Próximo Vencimento - Mesmo design do Valor Total */}
                <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/30 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/90 text-sm font-medium">Próximo Vencimento:</span>
                    {dadosFinanceiros.proximoVencimento && (() => {
                      const hoje = new Date();
                      const vencimento = new Date(dadosFinanceiros.proximoVencimento);
                      const diffTime = vencimento.getTime() - hoje.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          diffDays < 0 ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                          diffDays <= 7 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                          'bg-green-500/20 text-green-300 border border-green-400/30'
                        }`}>
                          {diffDays < 0 ? `${Math.abs(diffDays)}d atraso` : 
                           diffDays === 0 ? 'Hoje' : 
                           `${diffDays}d`}
                        </div>
                      );
                    })()}
                  </div>
                  <span className="font-bold text-xl text-white block">
                    {dadosFinanceiros.proximoVencimento ? formatarData(dadosFinanceiros.proximoVencimento) : 'Nenhum'}
                  </span>
                </div>
              </div>
              
              {/* Barra de Progresso - Ocupando toda largura horizontal */}
              <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/30 shadow-lg mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/90 text-sm flex items-center gap-1 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    Progresso:
                  </span>
                  <span className="font-bold text-xl text-white">{dadosFinanceiros.progresso.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-300 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${Math.min(dadosFinanceiros.progresso, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Linha Inferior - Cards com estilos diferenciados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Parcelas Pagas - Card com borda verde */}
                <div className="bg-black/15 rounded-lg p-4 backdrop-blur-sm border-l-4 border-l-green-400 border-t border-r border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Parcelas Pagas:</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="font-bold text-2xl text-green-300 block mt-1">{dadosFinanceiros.parcelasPagas}</span>
                </div>
                
                {/* Parcelas Pendentes - Card com borda verde */}
                <div className="bg-black/15 rounded-lg p-4 backdrop-blur-sm border-l-4 border-l-green-400 border-t border-r border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Parcelas Pendentes:</span>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <span className="font-bold text-2xl text-yellow-300 block mt-1">{dadosFinanceiros.parcelasPendentes}</span>
                </div>
                
                {/* Valor em Atraso - Card com borda verde */}
                <div className="bg-black/15 rounded-lg p-4 backdrop-blur-sm border-l-4 border-l-green-400 border-t border-r border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm">Valor em Atraso:</span>
                    <div className={`w-2 h-2 rounded-full ${
                      dadosFinanceiros.valorEmAtraso > 0 ? 'bg-red-400' : 'bg-green-400'
                    }`}></div>
                  </div>
                  <span className={`font-bold text-2xl block mt-1 ${
                    dadosFinanceiros.valorEmAtraso > 0 ? 'text-red-300' : 'text-green-300'
                  }`}>
                    {formatarMoeda(dadosFinanceiros.valorEmAtraso)}
                  </span>
                </div>
              </div>

                {/* Informações Adicionais - Layout horizontal */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Plano - Mesmo design do Valor Total */}
                  <div className="flex-1 bg-gradient-to-r from-white/20 to-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/30 shadow-lg">
                    <span className="text-white/90 text-sm block mb-1 font-medium flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Plano Contratado:
                    </span>
                    <span className="font-bold text-xl text-white">{dadosFinanceiros.planoNome}</span>
                  </div>
                  
                  {/* Forma de Pagamento - Mesmo design do Valor Total */}
                  <div className="flex-1 bg-gradient-to-r from-white/20 to-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/30 shadow-lg">
                    <span className="text-white/90 text-sm block mb-1 font-medium">Forma de Pagamento:</span>
                    <span className="font-bold text-xl text-white">{dadosFinanceiros.registroFinanceiro?.forma_pagamento_plano || 'Não definido'}</span>
                  </div>
                </div>
              </motion.div>


            </div>

            {/* Contratos - Azul, ao lado direito */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-8 shadow-lg text-white relative overflow-hidden"
            >
              {/* Header com idioma */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="h-7 w-7 text-white" />
                  <h3 className="text-2xl font-semibold">Contratos</h3>
                  {loadingContratos && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                  {dadosContratos.contratoAtivo?.idioma_contrato || 'N/A'}
                </div>
              </div>
              
              {/* Layout Vertical */}
              <div className="space-y-4">
                {/* Status do Contrato - Card Destacado */}
                <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-xl p-5 border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {dadosContratos.contratoAtivo ? 
                      getStatusContratoIcon(dadosContratos.contratoAtivo.status_contrato) : 
                      <Clock className="h-5 w-5" />
                    }
                    <span className="text-white/90 text-base font-medium">Status do Contrato</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {dadosContratos.contratoAtivo?.status_contrato || 'Inativo'}
                  </div>
                  <div className="text-white/80 text-base">
                    {dadosContratos.contratoAtivo?.planos?.nome || 'Nenhum plano ativo'}
                  </div>
                </div>

                {/* Barra de Progresso do Contrato */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-base font-medium">Progresso do Contrato</span>
                    <span className="text-white text-base font-bold">
                      {dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                        `${Math.round(((new Date().getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime())) * 100)}%` : 
                        '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-white to-blue-200 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                          `${Math.min(100, Math.max(0, ((new Date().getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime())) * 100))}%` : 
                          '0%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Cards de Informações em Layout Vertical */}
                <div className="space-y-4">
                  {/* Data de Início */}
                  <div className="bg-black/20 rounded-lg p-5 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-white/80" />
                      <span className="text-white/80 text-sm font-medium">INÍCIO</span>
                    </div>
                    <div className="text-white font-bold text-base">
                      {dadosContratos.contratoAtivo?.data_inicio ? 
                        formatarData(dadosContratos.contratoAtivo.data_inicio) : 
                        'Não definido'
                      }
                    </div>
                  </div>

                  {/* Data de Fim */}
                  <div className="bg-black/20 rounded-lg p-5 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-white/80" />
                      <span className="text-white/80 text-sm font-medium">FIM</span>
                    </div>
                    <div className="text-white font-bold text-base">
                      {dadosContratos.contratoAtivo?.data_fim ? 
                        formatarData(dadosContratos.contratoAtivo.data_fim) : 
                        'Indeterminado'
                      }
                    </div>
                  </div>

                  {/* Duração */}
                  <div className="bg-black/20 rounded-lg p-5 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                      <span className="text-white/80 text-sm font-medium">DURAÇÃO</span>
                    </div>
                    <div className="text-white font-bold text-base">
                      {dadosContratos.contratoAtivo?.data_inicio ? 
                        calcularDuracaoContrato(dadosContratos.contratoAtivo.data_inicio, dadosContratos.contratoAtivo.data_fim) : 
                        'Não calculado'
                      }
                    </div>
                  </div>

                  {/* Total de Contratos */}
                  <div className="bg-black/20 rounded-lg p-5 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      <span className="text-white/80 text-sm font-medium">TOTAL DE CONTRATOS</span>
                    </div>
                    <div className="text-white font-bold text-xl">
                      {dadosContratos.totalContratos}
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações - Sempre visível */}
              <div className="mt-4 bg-black/10 rounded-lg p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">OBSERVAÇÕES</span>
                </div>
                <div 
                  className="text-white/90 text-base leading-relaxed cursor-help overflow-hidden" 
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    maxHeight: '4.5rem'
                  }}
                  title={dadosContratos.contratoAtivo?.observacao || 'Nenhuma observação registrada para este contrato.'}
                >
                  {dadosContratos.contratoAtivo?.observacao || 'Nenhuma observação registrada para este contrato.'}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cards secundários - Grid menor */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Histórico Acadêmico */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-[#1F2937]">Histórico Acadêmico</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Matrícula:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progresso:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificações:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequência:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
              </div>
            </motion.div>

            {/* Responsáveis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-[#1F2937]">Responsáveis</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Responsável Principal:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parentesco:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
              </div>
            </motion.div>

            {/* Horários e Frequência */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-[#1F2937]">Horários & Frequência</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Horário das Aulas:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dias da Semana:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faltas no Mês:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Presença:</span>
                  <span className="font-medium">Em desenvolvimento...</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Informações Acadêmicas - Card Horizontal Completo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 shadow-sm col-span-full"
          >
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-[#1F2937]">Informações Acadêmicas</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Turma</span>
                <div className="text-base font-semibold text-gray-900">A1-Manhã</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Idioma</span>
                <div className="text-base font-semibold text-gray-900">Inglês</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Nível</span>
                <div className="text-base font-semibold text-gray-900">Intermediário</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Data Matrícula</span>
                <div className="text-base font-semibold text-gray-900">15/01/2024</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Progresso</span>
                <div className="text-base font-semibold text-purple-600">75%</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Frequência</span>
                <div className="text-base font-semibold text-green-600">92%</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Horário</span>
                <div className="text-base font-semibold text-gray-900">08:00-10:00</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Dia da Semana</span>
                <div className="text-base font-semibold text-gray-900">Seg/Qua/Sex</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Faltas no Mês</span>
                <div className="text-base font-semibold text-red-600">2</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Última Presença</span>
                <div className="text-base font-semibold text-gray-900">18/12/2024</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-gray-500 font-medium">Professor</span>
                <div className="text-base font-semibold text-gray-900">Prof. Maria Silva</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-purple-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-purple-700 mb-2 block">Observações Acadêmicas:</span>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    Aluno demonstra excelente progresso na conversação e compreensão auditiva. Recomenda-se foco em gramática avançada e exercícios de escrita para o próximo módulo. Participação ativa nas aulas e boa interação com colegas.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card de Desempenho */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 shadow-lg text-white col-span-full"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Award className="h-7 w-7 text-white" />
              <h3 className="text-2xl font-semibold">Desempenho Acadêmico</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Nota Geral */}
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 text-sm font-medium">Nota Geral</span>
                  <TrendingUp className="h-4 w-4 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">8.7</div>
                <div className="text-white/80 text-sm">Excelente</div>
              </div>
              
              {/* Participação */}
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 text-sm font-medium">Participação</span>
                  <Users className="h-4 w-4 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">9.2</div>
                <div className="text-white/80 text-sm">Muito Ativo</div>
              </div>
              
              {/* Evolução */}
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 text-sm font-medium">Evolução</span>
                  <TrendingUp className="h-4 w-4 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-green-300 mb-1">+15%</div>
                <div className="text-white/80 text-sm">Último mês</div>
              </div>
              
              {/* Pontualidade */}
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 text-sm font-medium">Pontualidade</span>
                  <Clock className="h-4 w-4 text-white/80" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">96%</div>
                <div className="text-white/80 text-sm">Excelente</div>
              </div>
            </div>
            
            {/* Habilidades */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Habilidades por Área</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Speaking */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-sm">Speaking</span>
                    <span className="text-white font-bold">8.5</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-300 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                {/* Listening */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-sm">Listening</span>
                    <span className="text-white font-bold">9.0</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-300 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
                
                {/* Reading */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-sm">Reading</span>
                    <span className="text-white font-bold">8.2</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-300 h-2 rounded-full" style={{width: '82%'}}></div>
                  </div>
                </div>
                
                {/* Writing */}
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-sm">Writing</span>
                    <span className="text-white font-bold">7.8</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-300 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feedback do Professor */}
            <div className="mt-6 bg-black/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <User className="h-4 w-4 text-white/80" />
                <span className="text-white/90 text-sm font-medium">Feedback do Professor</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                "Aluno demonstra excelente progresso em todas as áreas. Destaque especial para listening e participação em aula. 
                Recomendo continuar com exercícios de writing para equilibrar todas as habilidades."
              </p>
              <div className="mt-2 text-white/70 text-xs">
                - Prof. Maria Silva, 15/12/2024
              </div>
            </div>
          </motion.div>
          
          {/* Placeholder para futuras seções */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center col-span-full"
          >
            <div className="text-gray-500">
              <h3 className="text-xl font-medium mb-3">Modal de detalhes do aluno implementado com sucesso!</h3>
              <p className="text-base max-w-2xl mx-auto">
                O modal agora exibe dados reais e mockados para:
                <br />
                <strong>Registro Financeiro:</strong> valor total, status geral, próximo vencimento, progresso, parcelas pagas/pendentes, valor em atraso, plano, idioma e forma de pagamento.
                <br />
                <strong>Contratos:</strong> status do contrato ativo, datas de início e fim, valor da mensalidade, duração, idioma do contrato, total de contratos e observações.
                <br />
                <strong>Informações Acadêmicas:</strong> turma, idioma, nível, datas, progresso, frequência, horários, professor e observações.
                <br />
                <strong>Desempenho:</strong> notas por habilidade, evolução, participação, pontualidade e feedback do professor.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModal;