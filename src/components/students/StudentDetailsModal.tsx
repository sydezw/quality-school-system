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
  idioma?: string | null;
  turma_id?: string | null;
  nivel?: string | null;
  observacoes?: string | null;
  aulas_particulares?: boolean | null;
  aulas_turma?: boolean | null;
  turma_particular_id?: string | null;
  tipo_turma?: string | null;
  numero_endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
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
  const { toast } = useToast();
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

  const buscarDadosContratos = async (alunoId: string) => {
    try {
      const { data: contratosData, error: errorContratos } = await supabase
        .from('contratos')
        .select(`
          *,
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

      if (errorContratos) {
        console.error('Erro ao buscar contratos:', errorContratos);
        return;
      }

      const contratosArray = contratosData || [];
      
      // Encontrar contrato ativo (status_contrato = 'Ativo')
      let contratoAtivo = contratosArray.find(c => c.status_contrato === 'Ativo') || null;
      const contratoMaisRecente = contratosArray[0] || null;
      
      // Se não há contrato ativo, buscar registro financeiro para criar contrato virtual
      if (!contratoAtivo) {
        const { data: registroFinanceiro, error: errorFinanceiro } = await supabase
          .from('financeiro_alunos')
          .select(`
            *,
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

        if (!errorFinanceiro && registroFinanceiro) {
          contratoAtivo = {
            id: 'virtual',
            aluno_id: alunoId,
            plano_id: registroFinanceiro.plano_id,
            data_inicio: registroFinanceiro.created_at || new Date().toISOString(),
            data_fim: null,
            valor_mensalidade: registroFinanceiro.valor_plano,
            status_contrato: 'Ativo',
            idioma_contrato: registroFinanceiro.idioma_registro,
            observacao: 'Contrato baseado em registro financeiro',
            created_at: registroFinanceiro.created_at || new Date().toISOString(),
            updated_at: registroFinanceiro.updated_at || new Date().toISOString(),
            planos: registroFinanceiro.planos
          };
        }
      }
      
      setDadosContratos({
        contratoAtivo,
        totalContratos: contratosArray.length,
        contratoMaisRecente
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados de contratos:', error);
      setDadosContratos({
        contratoAtivo: null,
        totalContratos: 0,
        contratoMaisRecente: null
      });
    }
  };

  const buscarDadosFinanceiros = async (alunoId: string) => {
    try {
      // Buscar registro financeiro ativo
      const { data: registroFinanceiro, error: errorRegistro } = await supabase
        .from('financeiro_alunos')
        .select(`
          *,
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
        console.error('Erro ao buscar registro financeiro:', errorRegistro);
        setDadosFinanceiros({
          registroFinanceiro: null,
          parcelas: [],
          valorTotal: 0,
          statusGeral: 'Sem dados',
          proximoVencimento: null,
          progresso: 0,
          parcelasPagas: 0,
          parcelasPendentes: 0,
          valorEmAtraso: 0,
          planoNome: 'Nenhum plano ativo'
        });
        return;
      }

      // Buscar parcelas se houver registro financeiro
      const { data: parcelasData, error: errorParcelas } = await supabase
        .from('parcelas_alunos')
        .select('*')
        .eq('registro_financeiro_id', registroFinanceiro.id)
        .order('data_vencimento', { ascending: true });

      if (errorParcelas) {
        console.error('Erro ao buscar parcelas:', errorParcelas);
        return;
      }

      const parcelasArray = parcelasData || [];
      const parcelasPagas = parcelasArray.filter(p => p.status_pagamento === 'pago').length;
      const parcelasPendentes = parcelasArray.filter(p => p.status_pagamento === 'pendente').length;
      
      // Calcular valor em atraso
      const hoje = new Date();
      const parcelasVencidas = parcelasArray.filter(p => {
        const dataVencimento = new Date(p.data_vencimento);
        return dataVencimento < hoje && p.status_pagamento !== 'pago';
      });
      
      const valorEmAtraso = parcelasVencidas.reduce((total, p) => total + p.valor, 0);
      
      // Encontrar próximo vencimento
      const parcelasNaoPagas = parcelasArray.filter(p => p.status_pagamento !== 'pago');
      const proximaParcelaVencimento = parcelasNaoPagas.length > 0 ? parcelasNaoPagas[0].data_vencimento : null;
      
      // Calcular progresso
      const totalParcelas = parcelasArray.length;
      const progresso = totalParcelas > 0 ? (parcelasPagas / totalParcelas) * 100 : 0;

      setDadosFinanceiros({
        registroFinanceiro,
        parcelas: parcelasArray,
        valorTotal: registroFinanceiro.valor_total,
        statusGeral: registroFinanceiro.status_geral,
        proximoVencimento: proximaParcelaVencimento,
        progresso,
        parcelasPagas,
        parcelasPendentes,
        valorEmAtraso,
        planoNome: registroFinanceiro.planos?.nome || 'Plano não definido'
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    }
  };

  useEffect(() => {
    if (student?.id) {
      const fetchData = async () => {
        await buscarDadosFinanceiros(student.id);
        await buscarDadosContratos(student.id);
      };
      fetchData();
    }
  }, [student?.id]);

  if (!student) return null;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-green-500 text-white';
      case 'inativo':
        return 'bg-gray-500 text-white';
      case 'suspenso':
        return 'bg-yellow-500 text-white';
      case 'cancelado':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pago':
        return 'bg-green-500 text-white';
      case 'pendente':
        return 'bg-yellow-500 text-white';
      case 'atrasado':
      case 'vencido':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-2xl">
        <DialogHeader className="relative pb-6">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-t-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <div className="relative z-10 flex items-center justify-between text-white p-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-2">{student.nome}</DialogTitle>
                <Badge className={`${getStatusBadgeColor(student.status || 'ativo')} text-sm font-medium px-3 py-1`}>
                  {student.status || 'Ativo'}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <motion.div 
          className="space-y-8 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Informações Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Email</span>
              </div>
              <span className="font-semibold text-[#111827] text-base">{student.email || 'Não informado'}</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Telefone</span>
              </div>
              <span className="font-semibold text-[#111827] text-base">{student.telefone || 'Não informado'}</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Data de Nascimento</span>
              </div>
              <span className="font-semibold text-[#111827] text-base">{student.data_nascimento ? formatarData(student.data_nascimento) : 'Não informado'}</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Endereço</span>
              </div>
              <span className="font-semibold text-[#111827] text-base">{student.endereco || 'Não informado'}</span>
            </div>
          </div>

          {/* Cards Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Card Financeiro */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">Situação Financeira</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {dadosFinanceiros.registroFinanceiro?.idioma_registro || 'Não definido'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Valor Total</span>
                  <span className="font-bold text-lg text-[#111827]">{formatarMoeda(dadosFinanceiros.valorTotal)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Plano</span>
                  <span className="font-bold text-lg text-[#111827]">{dadosFinanceiros.planoNome}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <Badge className={`${getPaymentStatusBadgeColor(dadosFinanceiros.statusGeral)} px-3 py-1`}>
                    {dadosFinanceiros.statusGeral}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Próximo Vencimento</span>
                  <div className="text-right">
                    {dadosFinanceiros.proximoVencimento && (() => {
                      const hoje = new Date();
                      const vencimento = new Date(dadosFinanceiros.proximoVencimento);
                      const diffTime = vencimento.getTime() - hoje.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      return (
                        <Badge className={`${
                          diffDays < 0 ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]' :
                          diffDays <= 7 ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]' :
                          'bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]'
                        } px-3 py-1 text-xs font-medium`}>
                          {diffDays === 0 ? 'Hoje' :
                           diffDays < 0 ? `${Math.abs(diffDays)} dias em atraso` :
                           `${diffDays} dias`}
                        </Badge>
                      );
                    })()}
                    <div className="text-sm font-semibold text-[#111827] mt-1">
                      {dadosFinanceiros.proximoVencimento ? formatarData(dadosFinanceiros.proximoVencimento) : 'Nenhum'}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Progresso de Pagamento</span>
                    <span className="text-sm font-bold text-[#111827]">{Math.round(dadosFinanceiros.progresso)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                      style={{ width: `${Math.min(dadosFinanceiros.progresso, 100)}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(dadosFinanceiros.progresso, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-l-4 ${
                    dadosFinanceiros.valorEmAtraso > 0 ? 'border-l-[#F44336]' : 'border-l-[#4CAF50]'
                  } bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      dadosFinanceiros.valorEmAtraso > 0 ? 'bg-[#F44336]' : 'bg-[#4CAF50]'
                    }`}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${
                      dadosFinanceiros.valorEmAtraso > 0 ? 'text-[#F44336]' : 'text-[#4CAF50]'
                    }`}>Parcelas Pagas</span>
                    <div className="font-bold text-xl text-[#111827] mt-1">{dadosFinanceiros.parcelasPagas}</div>
                  </div>

                  <div className="p-4 rounded-xl border-l-4 border-l-[#FF9800] bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                    <div className="w-8 h-8 bg-[#FF9800] rounded-full flex items-center justify-center mb-2">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#FF9800]">Pendentes</span>
                    <div className="font-bold text-xl text-[#111827] mt-1">{dadosFinanceiros.parcelasPendentes}</div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Forma de Pagamento</span>
                  <span className="font-bold text-xl text-[#111827]">{dadosFinanceiros.registroFinanceiro?.forma_pagamento_plano || 'Não definido'}</span>
                </div>
              </div>
            </motion.div>

            {/* Card Contratos */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">Contratos</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {dadosContratos.contratoAtivo?.idioma_contrato || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Status do Contrato</span>
                  <Badge className={`${getStatusBadgeColor(dadosContratos.contratoAtivo?.status_contrato || 'inativo')} px-3 py-1`}>
                    {dadosContratos.contratoAtivo?.status_contrato || 'Inativo'}
                  </Badge>
                </div>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Plano Ativo</span>
                  <div className="font-bold text-lg text-[#111827] mt-1">{dadosContratos.contratoAtivo?.planos?.nome || 'Nenhum plano ativo'}</div>
                </div>

                {/* Barra de Progresso do Contrato */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Progresso do Contrato</span>
                    <span className="text-sm font-bold text-[#111827]">
                      {dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                        `${Math.round(((new Date().getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime())) * 100)}%` : 
                        '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                          `${Math.min(100, Math.max(0, ((new Date().getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime())) * 100))}%` : 
                          '0%'
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Cards de Informações em Layout Vertical */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Data de Início</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">
                      {dadosContratos.contratoAtivo?.data_inicio ? formatarData(dadosContratos.contratoAtivo.data_inicio) : 
                        'Não definido'
                      }
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Data de Fim</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">
                      {dadosContratos.contratoAtivo?.data_fim ? formatarData(dadosContratos.contratoAtivo.data_fim) : 
                        'Indeterminado'
                      }
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Duração</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">
                      {dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                        `${Math.ceil((new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses` : 
                        'Não calculado'
                      }
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Total de Contratos</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">{dadosContratos.totalContratos}</span>
                  </div>
                </div>

                {/* Observações */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">OBSERVAÇÕES</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    maxHeight: '4.5rem'
                  }} title={dadosContratos.contratoAtivo?.observacao || 'Nenhuma observação registrada para este contrato.'}>
                    {dadosContratos.contratoAtivo?.observacao || 'Nenhuma observação registrada para este contrato.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cards secundários */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Histórico Acadêmico */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Histórico Acadêmico</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Data de Matrícula</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Progresso</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Certificações</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Responsáveis */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Responsáveis</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Responsável Principal</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Telefone</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Email</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Parentesco</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Horários & Frequência */}
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Horários & Frequência</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Frequência</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Horário das Aulas</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Dias da Semana</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Faltas no Mês</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                    <span className="text-xs font-medium text-gray-600">Última Presença</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Informações Acadêmicas */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Informações Acadêmicas</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Turma</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">{student.turmas?.nome || 'Sem turma'}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Idioma</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">{student.idioma || 'Não definido'}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Nível</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">{student.nivel || 'Não definido'}</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Data Matrícula</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Progresso</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Frequência</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Horário</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Dia da Semana</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Faltas no Mês</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Última Presença</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-xs font-medium text-gray-600">Professor</span>
                <div className="font-semibold text-[#111827] text-sm mt-1">Em desenvolvimento...</div>
              </div>
            </div>

            {/* Observações Acadêmicas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Observações Acadêmicas</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {student.observacoes || 'O aluno demonstra excelente progresso nas atividades propostas, mantendo boa participação em aula e demonstrando interesse pelo conteúdo. Recomenda-se continuar com o ritmo atual de estudos.'}
              </p>
            </div>
          </motion.div>

          {/* Desempenho Acadêmico */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Desempenho Acadêmico</h3>
              </div>
            </div>

            {/* Métricas de Desempenho */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Nota Geral</span>
                </div>
                <div className="font-bold text-2xl text-[#111827]">8.5</div>
                <div className="text-xs text-green-600 font-medium">Excelente</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Participação</span>
                </div>
                <div className="font-bold text-2xl text-[#111827]">9.0</div>
                <div className="text-xs text-green-600 font-medium">Muito Ativa</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Evolução</span>
                </div>
                <div className="font-bold text-2xl text-[#111827]">+15%</div>
                <div className="text-xs text-green-600 font-medium">Em Crescimento</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Pontualidade</span>
                </div>
                <div className="font-bold text-2xl text-[#111827]">95%</div>
                <div className="text-xs text-green-600 font-medium">Excelente</div>
              </div>
            </div>

            {/* Habilidades por Área */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 mb-6">
              <h4 className="text-lg font-bold text-[#111827] mb-4">Habilidades por Área</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Speaking</span>
                    <span className="text-sm font-bold text-[#111827]">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full" 
                      initial={{ width: '0%' }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                
                <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium text-gray-700">Listening</span>
                     <span className="text-sm font-bold text-[#111827]">90%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <motion.div 
                       className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full" 
                       initial={{ width: '0%' }}
                       animate={{ width: '90%' }}
                       transition={{ duration: 1, delay: 0.6 }}
                     />
                   </div>
                 </div>
                 
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium text-gray-700">Reading</span>
                     <span className="text-sm font-bold text-[#111827]">82%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <motion.div 
                       className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full" 
                       initial={{ width: '0%' }}
                       animate={{ width: '82%' }}
                       transition={{ duration: 1, delay: 0.7 }}
                     />
                   </div>
                 </div>
                 
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium text-gray-700">Writing</span>
                     <span className="text-sm font-bold text-[#111827]">78%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <motion.div 
                       className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full" 
                       initial={{ width: '0%' }}
                       animate={{ width: '78%' }}
                       transition={{ duration: 1, delay: 0.8 }}
                     />
                   </div>
                 </div>
               </div>
             </div>

             {/* Feedback do Professor */}
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                   <User className="w-4 h-4 text-white" />
                 </div>
                 <span className="text-sm font-bold text-gray-700">Feedback do Professor</span>
               </div>
               <p className="text-sm text-gray-600 leading-relaxed mb-3">
                 "Aluno demonstra excelente progresso em todas as áreas. Destaque especial para listening e participação em aula. 
                 Recomendo continuar com exercícios de writing para equilibrar todas as habilidades."
               </p>
               <div className="text-xs text-gray-500 font-medium">
                 - Prof. Maria Silva, 15/12/2024
               </div>
             </div>
           </motion.div>
         </motion.div>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default StudentDetailsModal;