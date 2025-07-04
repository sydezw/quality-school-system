import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, Receipt, CreditCard, ChevronDown, ChevronRight, Check, Send, History, Filter, RefreshCw } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import RenewalAlertsTable from '@/components/financial/RenewalAlertsTable';
import FinancialRecordsTable from '@/components/financial/FinancialRecordsTable';
import BoletoManager from '@/components/financial/BoletoManager';
import { useBoletos } from '@/hooks/useBoletos';


// Interface movida para useBoletos hook
// Mantida aqui para compatibilidade com código legado
interface BoletoLegacy {
  id: string;
  aluno_id: string;
  data_vencimento: string;
  valor: number;
  status: string;
  descricao: string;
  link_pagamento: string | null;
  data_pagamento?: string | null;
  metodo_pagamento?: string | null;
  observacoes?: string | null;
  numero_parcela?: number | null;
  contrato_id?: string | null;
  alunos?: { nome: string };
}

interface HistoricoPagamento {
  id: string;
  aluno_id: string;
  tipo_transacao: string;
  valor_original: number;
  valor_pago: number;
  data_pagamento: string;
  metodo_pagamento: string;
  observacoes?: string | null;
  status_anterior?: string | null;
  status_novo?: string | null;
}

interface AlunoFinanceiro {
  id: string;
  nome: string;
  boletos: BoletoLegacy[];
  totalDividas: number;
  boletosVencidos: number;
  ultimoPagamento?: string;
  historicoPagamentos: HistoricoPagamento[];
}

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  status: string;
}

interface Student {
  id: string;
  nome: string;
}

// Novas interfaces para funcionalidades de planos
interface PlanoGenerico {
  id: string;
  nome: string;
  valor_total: number | null;
  valor_por_aula: number | null;
  descricao?: string;
}

interface ContratoAluno {
  id: string;
  aluno_id: string;
  valor_mensalidade: number;
  data_inicio: string;
  data_fim?: string;
  status: string;
  plano_nome?: string;
}

interface ProgressoParcelas {
  total: number;
  pagas: number;
  percentual: number;
  valor_total: number;
  valor_pago: number;
}

type StatusAluno = 'Em dia' | 'Atrasado' | 'Inadimplente';

const Financial = () => {
  // Usar o novo hook de boletos
  const { boletos: boletosNovos, loading: loadingBoletos } = useBoletos();
  
  // Estados legados mantidos para compatibilidade
  const [boletos, setBoletos] = useState<BoletoLegacy[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [alunosFinanceiros, setAlunosFinanceiros] = useState<AlunoFinanceiro[]>([]);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<HistoricoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBoletoDialogOpen, setIsBoletoDialogOpen] = useState(false);
  const [isDespesaDialogOpen, setIsDespesaDialogOpen] = useState(false);
  const [editingBoleto, setEditingBoleto] = useState<BoletoLegacy | null>(null);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [expandedAlunos, setExpandedAlunos] = useState<Set<string>>(new Set());
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'lista' | 'agrupado'>('agrupado');
  
  // Novos estados para funcionalidades de planos
  const [planosGenericos, setPlanosGenericos] = useState<PlanoGenerico[]>([]);
  const [contratos, setContratos] = useState<ContratoAluno[]>([]);
  const [isNovoPlanoDialogOpen, setIsNovoPlanoDialogOpen] = useState(false);
  const [isParcelaAvulsaDialogOpen, setIsParcelaAvulsaDialogOpen] = useState(false);
  const [alunoSelecionadoParcela, setAlunoSelecionadoParcela] = useState<string | null>(null);
  const [expandedToggles, setExpandedToggles] = useState<{[key: string]: {plano: boolean, material: boolean, matricula: boolean}}>({});
  const { toast } = useToast();

  const { register: registerBoleto, handleSubmit: handleSubmitBoleto, reset: resetBoleto, setValue: setValueBoleto } = useForm();
  const { register: registerDespesa, handleSubmit: handleSubmitDespesa, reset: resetDespesa, setValue: setValueDespesa } = useForm();
  const { register, handleSubmit, reset, control, watch } = useForm();
  const { register: registerParcela, handleSubmit: handleSubmitParcela, reset: resetParcela, control: controlParcela } = useForm();

  useEffect(() => {
    fetchBoletos();
    fetchDespesas();
    fetchStudents();
    fetchHistoricoPagamentos();
    fetchContratos();
    fetchPlanos();
  }, []);

  useEffect(() => {
    if (boletos.length > 0 && students.length > 0) {
      processarAlunosFinanceiros();
    }
  }, [boletos, students, historicoPagamentos]);

  const fetchBoletos = async () => {
    try {
      const { data, error } = await supabase
        .from('financeiro_alunos')
        .select(`
          *,
          alunos (nome),
          planos (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Converter dados de financeiro_alunos para formato de boletos
      const boletosConvertidos = data?.map(registro => ({
        id: registro.id,
        aluno_id: registro.aluno_id,
        data_vencimento: registro.data_primeiro_vencimento,
        valor: registro.valor_total,
        status: registro.status_geral === 'Pago' ? 'Pago' : 'Pendente',
        descricao: `Plano: ${registro.planos?.nome || 'N/A'}`,
        link_pagamento: null,
        data_pagamento: null,
        metodo_pagamento: registro.forma_pagamento_plano,
        observacoes: null,
        numero_parcela: 1,
        contrato_id: null,
        alunos: registro.alunos
      })) || [];
      
      setBoletos(boletosConvertidos);
    } catch (error) {
      console.error('Erro ao buscar registros financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros financeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDespesas = async () => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as despesas.",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const fetchHistoricoPagamentos = async () => {
    try {
      // Como não temos tabela historico_pagamentos, vamos deixar vazio
      setHistoricoPagamentos([]);
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      setHistoricoPagamentos([]);
    }
  };

  // Nova função para buscar contratos
  const fetchContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('status', 'Ativo')
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      setContratos([]);
    }
  };

  // Função para buscar planos da tabela planos
  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, valor_total, valor_por_aula, descricao')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlanosGenericos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setPlanosGenericos([]);
    }
  };

  const processarAlunosFinanceiros = () => {
    const alunosMap = new Map<string, AlunoFinanceiro>();
    
    // Inicializar alunos
    students.forEach(student => {
      alunosMap.set(student.id, {
        id: student.id,
        nome: student.nome,
        boletos: [],
        totalDividas: 0,
        boletosVencidos: 0,
        ultimoPagamento: null,
        historicoPagamentos: []
      });
    });

    // Adicionar boletos aos alunos
    boletos.forEach(boleto => {
      const aluno = alunosMap.get(boleto.aluno_id);
      if (aluno) {
        aluno.boletos.push(boleto);
        
        // Calcular dívidas (boletos não pagos)
        if (boleto.status !== 'Pago') {
          aluno.totalDividas += boleto.valor;
          
          // Verificar se está vencido
          const hoje = new Date();
          const vencimento = new Date(boleto.data_vencimento);
          if (vencimento < hoje) {
            aluno.boletosVencidos++;
          }
        }
      }
    });

    // Adicionar histórico de pagamentos
    historicoPagamentos.forEach(historico => {
      const aluno = alunosMap.get(historico.aluno_id);
      if (aluno) {
        aluno.historicoPagamentos.push(historico);
        
        // Atualizar último pagamento
        if (!aluno.ultimoPagamento || new Date(historico.data_pagamento) > new Date(aluno.ultimoPagamento)) {
          aluno.ultimoPagamento = historico.data_pagamento;
        }
      }
    });

    // Converter para array e filtrar apenas alunos com boletos ou histórico
    const alunosComDados = Array.from(alunosMap.values())
      .filter(aluno => aluno.boletos.length > 0 || aluno.historicoPagamentos.length > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome));

    setAlunosFinanceiros(alunosComDados);
  };

  // Novas funções auxiliares para funcionalidades de planos
  const calcularProgressoParcelas = (alunoId: string): ProgressoParcelas => {
    const boletosAluno = boletos.filter(b => b.aluno_id === alunoId);
    const contratoAluno = contratos.find(c => c.aluno_id === alunoId);
    
    const totalParcelas = boletosAluno.length;
    const parcelasPagas = boletosAluno.filter(b => b.status === 'Pago').length;
    const valorTotalPlano = contratoAluno ? contratoAluno.valor_mensalidade * totalParcelas : boletosAluno.reduce((sum, b) => sum + b.valor, 0);
    const valorPago = boletosAluno.filter(b => b.status === 'Pago').reduce((sum, b) => sum + b.valor, 0);
    const percentualProgresso = totalParcelas > 0 ? (parcelasPagas / totalParcelas) * 100 : 0;
    
    return {
      total: totalParcelas,
      pagas: parcelasPagas,
      percentual: percentualProgresso,
      valor_total: valorTotalPlano,
      valor_pago: valorPago
    };
  };

  const obterStatusAluno = (alunoId: string): StatusAluno => {
    const boletosAluno = boletos.filter(b => b.aluno_id === alunoId);
    const hoje = new Date();
    
    const boletosVencidos = boletosAluno.filter(b => {
      const vencimento = new Date(b.data_vencimento);
      return b.status !== 'Pago' && vencimento < hoje;
    });
    
    const boletosPendentes = boletosAluno.filter(b => b.status === 'Pendente');
    
    if (boletosVencidos.length > 0) {
      return 'Inadimplente';
    }
    
    if (boletosPendentes.length > 0) {
      return 'Atrasado';
    }
    
    return 'Em dia';
  };

  const obterPlanoAluno = (alunoId: string): string => {
    const contratoAluno = contratos.find(c => c.aluno_id === alunoId);
    if (contratoAluno && contratoAluno.plano_nome) {
      return contratoAluno.plano_nome;
    }
    
    // Tentar inferir o plano baseado no valor da mensalidade
    if (contratoAluno) {
      const valorMensal = contratoAluno.valor_mensalidade;
      if (valorMensal <= 100) return 'Plano Básico';
      if (valorMensal <= 150) return 'Plano Intermediário';
      return 'Plano Avançado';
    }
    
    return 'Plano não definido';
  };

  const onSubmitBoleto = async (data: any) => {
    try {
      // Validação específica para o campo aluno
      if (!data.aluno_id || data.aluno_id === '') {
        toast({
          title: "Erro de Validação",
          description: "Por favor, selecione um aluno para o boleto.",
          variant: "destructive",
        });
        return;
      }

      const formData = {
        ...data,
        valor: parseFloat(data.valor)
      };

      if (editingBoleto) {
        // Funcionalidade desabilitada - tabela boletos não existe
        throw new Error('Funcionalidade de edição de boletos não disponível');
      } else {
        // Funcionalidade desabilitada - tabela boletos não existe
        throw new Error('Funcionalidade de criação de boletos não disponível');
      }

      setIsBoletoDialogOpen(false);
      setEditingBoleto(null);
      resetBoleto();
      fetchBoletos();
    } catch (error) {
      console.error('Erro ao salvar boleto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o boleto.",
        variant: "destructive",
      });
    }
  };

  const onSubmitDespesa = async (data: any) => {
    try {
      const formData = {
        ...data,
        valor: parseFloat(data.valor)
      };

      if (editingDespesa) {
        // Atualizar despesa existente
        const { error } = await supabase
          .from('despesas')
          .update(formData)
          .eq('id', editingDespesa.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso!",
        });
      } else {
        // Criar nova despesa
        const { error } = await supabase
          .from('despesas')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Despesa criada com sucesso!",
        });
      }

      setIsDespesaDialogOpen(false);
      setEditingDespesa(null);
      resetDespesa();
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a despesa.",
        variant: "destructive",
      });
    }
  };

  const deleteBoleto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este boleto?')) return;

    try {
      // Funcionalidade desabilitada - tabela boletos não existe
      throw new Error('Funcionalidade de exclusão de boletos não disponível');
    } catch (error) {
      console.error('Erro ao excluir boleto:', error);
      toast({
        title: "Erro na Exclusão",
        description: error instanceof Error ? error.message : "Não foi possível excluir o boleto.",
        variant: "destructive",
      });
    }
  };

  const deleteDespesa = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });

      fetchDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast({
        title: "Erro na Exclusão",
        description: error instanceof Error ? error.message : "Não foi possível excluir a despesa.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openEditBoletoDialog = (boleto: BoletoLegacy) => {
    // Funcionalidade desabilitada - usar tabela financeiro_alunos
    toast({
      title: "Funcionalidade Indisponível",
      description: "A edição de registros financeiros foi desabilitada. Use a aba Boletos para gerenciar os dados.",
      variant: "destructive",
    });
  };

  const openEditDespesaDialog = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setValueDespesa('descricao', despesa.descricao);
    setValueDespesa('valor', despesa.valor);
    setValueDespesa('data', despesa.data);
    setValueDespesa('categoria', despesa.categoria);
    setValueDespesa('status', despesa.status);
    setIsDespesaDialogOpen(true);
  };

  // Ações rápidas para alunos
  const marcarComoPago = async (boletoId: string, metodo: string = 'Dinheiro') => {
    try {
      // Buscar o registro na tabela financeiro_alunos
      const { data: registro, error: registroError } = await supabase
        .from('financeiro_alunos')
        .select('*')
        .eq('id', boletoId)
        .single();

      if (registroError) throw registroError;

      const dataAtual = new Date().toISOString().split('T')[0];

      // Atualizar o registro financeiro
      const { error: updateError } = await supabase
        .from('financeiro_alunos')
        .update({
          status: 'Pago',
          data_pagamento: dataAtual,
          metodo_pagamento: metodo
        })
        .eq('id', boletoId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Registro marcado como pago!",
      });

      // Atualizar os dados
      setTimeout(async () => {
        await Promise.all([
          fetchBoletos(),
          fetchStudents(),
          fetchHistoricoPagamentos()
        ]);
      }, 300);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o registro como pago.",
        variant: "destructive",
      });
    }
  };

  // Novas funções para geração automática de parcelas
  const verificarEGerarProximaParcela = async (alunoId: string, parcelaPaga: BoletoLegacy) => {
    try {
      const contratoAluno = contratos.find(c => c.aluno_id === alunoId);
      if (!contratoAluno) return;
      
      const boletosAluno = boletos.filter(b => b.aluno_id === alunoId);
      const numeroParcelaPaga = parcelaPaga.numero_parcela || 1;
      
      // Verificar se já existe a próxima parcela
      const proximaParcela = boletosAluno.find(b => b.numero_parcela === numeroParcelaPaga + 1);
      if (proximaParcela) return; // Já existe
      
      // Gerar próxima parcela
      const dataVencimento = new Date(parcelaPaga.data_vencimento);
      dataVencimento.setMonth(dataVencimento.getMonth() + 1); // +30 dias (aproximadamente)
      
      const novaParcela = {
        aluno_id: alunoId,
        contrato_id: contratoAluno.id,
        descricao: `Parcela ${numeroParcelaPaga + 1} - ${obterPlanoAluno(alunoId)}`,
        valor: contratoAluno.valor_mensalidade,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status: 'Pendente' as const,
        numero_parcela: numeroParcelaPaga + 1
      };
      
      // Funcionalidade desabilitada - usar tabela financeiro_alunos
      throw new Error('Funcionalidade de geração de parcelas não disponível');
      
    } catch (error) {
      console.error('Erro ao gerar próxima parcela:', error);
    }
  };

  const criarNovoPlano = async (data: any) => {
    try {
      const planoSelecionado = planosGenericos.find(p => p.id === data.plano_id);
      const aulasPagas = parseInt(data.aulas_pagas) || 0;
      const valorMatricula = parseFloat(data.valor_matricula) || 0;
      const valorMaterial = parseFloat(data.valor_material) || 0;
      const numeroParcelas = parseInt(data.numero_parcelas);
      
      // Calcular valores
      const valorAulas = aulasPagas * (planoSelecionado?.valor_por_aula || 0);
      const valorTotalContrato = valorAulas + valorMatricula + valorMaterial;
      const valorParcela = valorTotalContrato / numeroParcelas;
      
      // Criar contrato com informações do plano
      const novoContrato = {
        aluno_id: data.aluno_id,
        plano_id: data.plano_id,
        valor_mensalidade: valorParcela,
        valor_total: valorTotalContrato,
        aulas_pagas: aulasPagas,
        valor_matricula: valorMatricula,
        valor_material: valorMaterial,
        forma_pagamento: data.forma_pagamento || 'boleto',
        numero_parcelas: numeroParcelas,
        data_inicio: new Date().toISOString().split('T')[0],
        status: 'Ativo' as const
      };
      
      // Funcionalidade desabilitada - tabela contratos não existe
      throw new Error('Funcionalidade de criação de contratos não disponível');
      
      // Criar todas as parcelas
      const parcelas = [];
      const dataVencimento = new Date(data.data_vencimento_primeira);
      
      for (let i = 1; i <= numeroParcelas; i++) {
        const dataVencimentoParcela = new Date(dataVencimento);
        dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + (i - 1));
        
        parcelas.push({
          aluno_id: data.aluno_id,
          contrato_id: contratoData.id,
          descricao: `Parcela ${i}/${numeroParcelas} - ${planoSelecionado?.nome || 'Plano'}`,
          valor: valorParcela,
          data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
          status: 'Pendente' as const,
          numero_parcela: i
        });
      }
      
      // Funcionalidade desabilitada - usar tabela financeiro_alunos
      throw new Error('Funcionalidade de criação de parcelas não disponível');
      
      toast({
        title: "Plano Criado",
        description: `Plano criado com sucesso! ${numeroParcelas} parcela(s) gerada(s).`,
      });
      
      setIsNovoPlanoDialogOpen(false);
      reset();
      await Promise.all([fetchBoletos(), fetchContratos()]);
      
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o plano.",
        variant: "destructive",
      });
    }
  };

  const criarParcelaAvulsa = async (data: any) => {
    try {
      const contratoAluno = contratos.find(c => c.aluno_id === alunoSelecionadoParcela);
      const boletosAluno = boletos.filter(b => b.aluno_id === alunoSelecionadoParcela);
      const proximoNumero = Math.max(...boletosAluno.map(b => b.numero_parcela || 0)) + 1;
      
      const novaParcela = {
        aluno_id: alunoSelecionadoParcela!,
        contrato_id: contratoAluno?.id || null,
        descricao: data.descricao || `Parcela Avulsa ${proximoNumero}`,
        valor: parseFloat(data.valor),
        data_vencimento: data.data_vencimento,
        status: 'Pendente' as const,
        numero_parcela: proximoNumero
      };
      
      // Funcionalidade desabilitada - usar tabela financeiro_alunos
      throw new Error('Funcionalidade de criação de parcela avulsa não disponível');
      
    } catch (error) {
      console.error('Erro ao criar parcela avulsa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a parcela avulsa.",
        variant: "destructive",
      });
    }
  };

  const enviarCobranca = async (alunoId: string) => {
    try {
      // Simular envio de cobrança (aqui você integraria com WhatsApp ou email)
      toast({
        title: "Cobrança Enviada",
        description: "Cobrança enviada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao enviar cobrança:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a cobrança.",
        variant: "destructive",
      });
    }
  };

  const toggleAlunoExpanded = (alunoId: string) => {
    const newExpanded = new Set(expandedAlunos);
    if (newExpanded.has(alunoId)) {
      newExpanded.delete(alunoId);
    } else {
      newExpanded.add(alunoId);
    }
    setExpandedAlunos(newExpanded);
  };

  // Funções para gerenciar toggles de tipos de cobrança
  const toggleTipoCobranca = (alunoId: string, tipo: 'plano' | 'material' | 'matricula') => {
    setExpandedToggles(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [tipo]: !prev[alunoId]?.[tipo]
      }
    }));
  };

  const criarBoletoTipo = async (alunoId: string, tipo: 'plano' | 'material' | 'matricula', dados: any) => {
    try {
      const valores = {
        plano: 150.00,
        material: 80.00,
        matricula: 120.00
      };

      const descricoes = {
        plano: 'Mensalidade do Plano Contratado',
        material: 'Taxa de Material Didático',
        matricula: 'Taxa de Matrícula'
      };

      // Funcionalidade desabilitada - usar tabela financeiro_alunos
      throw new Error('Funcionalidade de criação de boletos por tipo não disponível');
    } catch (error) {
      console.error('Erro ao criar boleto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o boleto.",
        variant: "destructive",
      });
    }
  };

  const filtrarAlunosPorStatus = (alunos: AlunoFinanceiro[]) => {
    if (filtroStatus === 'todos') return alunos;
    
    return alunos.filter(aluno => {
      switch (filtroStatus) {
        case 'inadimplentes':
          return aluno.boletosVencidos > 0;
        case 'pendentes':
          return aluno.boletos.some(b => b.status === 'Pendente');
        case 'pagos':
          return aluno.boletos.some(b => b.status === 'Pago');
        default:
          return true;
      }
    });
  };

  const totalReceitas = boletos
    .filter(b => b.status === 'Pago')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalDespesas = despesas
    .filter(d => d.status === 'Pago')
    .reduce((sum, d) => sum + d.valor, 0);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando dados financeiros...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Financeiro</h1>
        </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas (Pagas)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Pagas)</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cobrancas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cobrancas">Cobranças de Alunos</TabsTrigger>
          <TabsTrigger value="boletos">Boletos</TabsTrigger>
          <TabsTrigger value="operacional">Financeiro Operacional</TabsTrigger>
          <TabsTrigger value="registros">Registros</TabsTrigger>
          <TabsTrigger value="renovacao">Renovações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="cobrancas" className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cobrança de Alunos</h2>
            <Button
              onClick={() => { setIsNovoPlanoDialogOpen(true); }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-3 w-48 h-12 rounded-lg shadow-md hover:shadow-lg ml-auto mt-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Plano de Pagamento
            </Button>
            
            <FinancialPlanDialog
              isOpen={isNovoPlanoDialogOpen}
              onOpenChange={setIsNovoPlanoDialogOpen}
              onSuccess={async () => {
                await Promise.all([fetchBoletos(), fetchContratos()]);
              }}
            />
          </div>
            
            {/* Botões antigos comentados para preservar funcionalidade */}
             {/* 
             <Dialog open={isBoletoDialogOpen} onOpenChange={setIsBoletoDialogOpen}>
               <DialogTrigger asChild>
                 <Button
                   onClick={() => { setEditingBoleto(null); resetBoleto(); setIsBoletoDialogOpen(true); }}
                   className="bg-brand-red hover:bg-brand-red/90"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Novo Boleto
                 </Button>
               </DialogTrigger>
                 <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBoleto ? 'Editar Boleto' : 'Novo Boleto'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitBoleto(onSubmitBoleto)} className="space-y-4">
                   <div>
                     <Label htmlFor="aluno_id">Aluno *</Label>
                     <Select onValueChange={(value) => setValueBoleto('aluno_id', value)} defaultValue={editingBoleto?.aluno_id}>
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione o aluno" />
                       </SelectTrigger>
                       <SelectContent>
                         {students.map((student) => (
                           <SelectItem key={student.id} value={student.id}>
                             {student.nome}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div>
                     <Label htmlFor="descricao">Descrição *</Label>
                     <Input
                       id="descricao"
                       {...registerBoleto('descricao', { required: true })}
                       placeholder="Ex: Mensalidade Janeiro 2024"
                     />
                   </div>

                   <div>
                     <Label htmlFor="valor">Valor *</Label>
                     <Input
                       id="valor"
                       type="number"
                       step="0.01"
                       {...registerBoleto('valor', { required: true })}
                       placeholder="0.00"
                     />
                   </div>

                   <div>
                     <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                     <Input
                       id="data_vencimento"
                       type="date"
                       {...registerBoleto('data_vencimento', { required: true })}
                     />
                   </div>

                   <div>
                     <Label htmlFor="status">Status</Label>
                     <Select onValueChange={(value) => setValueBoleto('status', value)} defaultValue={editingBoleto?.status || 'Pendente'}>
                       <SelectTrigger>
                         <SelectValue placeholder="Selecione o status" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Pendente">Pendente</SelectItem>
                         <SelectItem value="Pago">Pago</SelectItem>
                         <SelectItem value="Vencido">Vencido</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div>
                     <Label htmlFor="link_pagamento">Link de Pagamento</Label>
                     <Input
                       id="link_pagamento"
                       {...registerBoleto('link_pagamento')}
                       placeholder="https://..."
                     />
                   </div>

                   <div className="flex gap-2 pt-4">
                     <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                       {editingBoleto ? 'Atualizar' : 'Criar'}
                     </Button>
                     <Button type="button" variant="outline" onClick={() => setIsBoletoDialogOpen(false)}>
                       Cancelar
                     </Button>
                   </div>
                 </form>
               </DialogContent>
             </Dialog>
             */}
        </TabsContent>

          {/* Controles de Visualização e Filtros */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled
                >
                  Lista Simples
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="inadimplentes">Em Atraso</SelectItem>
                    <SelectItem value="pendentes">Pendentes</SelectItem>
                    <SelectItem value="pagos">Pagos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Novos botões para criar planos e parcelas */}
            <div className="flex gap-2">
              {/* Botão Novo Plano comentado - funcionalidade movida para o botão principal */}
              {/*
              <Button 
                onClick={() => setIsNovoPlanoDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
              */}
              

            </div>
          </div>

          <Card>
            <CardContent>
              {boletos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum boleto cadastrado ainda.</p>
                  <p className="text-sm text-gray-400">Clique no botão "Novo Boleto" para começar.</p>
                </div>
              ) : (

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boletos.map((boleto) => (
                      <TableRow key={boleto.id}>
                        <TableCell className="font-medium">{boleto.alunos?.nome}</TableCell>
                        <TableCell>{boleto.descricao}</TableCell>
                        <TableCell className="font-medium">
                          R$ {boleto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(boleto.status)}>
                            {boleto.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {boleto.status !== 'Pago' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => marcarComoPago(boleto.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditBoletoDialog(boleto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                               size="sm"
                              variant="outline"
                              onClick={() => deleteBoleto(boleto.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boletos" className="space-y-4">
          <BoletoManager />
        </TabsContent>

        <TabsContent value="operacional" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Controle Financeiro da Escola</h2>
            <Dialog open={isDespesaDialogOpen} onOpenChange={setIsDespesaDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => { setEditingDespesa(null); resetDespesa(); setIsDespesaDialogOpen(true); }}
                  className="bg-brand-red hover:bg-brand-red/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitDespesa(onSubmitDespesa)} className="space-y-4">
                  <div>
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      {...registerDespesa('descricao', { required: true })}
                      placeholder="Ex: Aluguel Janeiro 2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor">Valor *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      {...registerDespesa('valor', { required: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      {...registerDespesa('data', { required: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select onValueChange={(value) => setValueDespesa('categoria', value)} defaultValue={editingDespesa?.categoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salário">Salário</SelectItem>
                        <SelectItem value="aluguel">Aluguel</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="manutenção">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setValueDespesa('status', value)} defaultValue={editingDespesa?.status || 'Pendente'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                      {editingDespesa ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDespesaDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              {despesas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma despesa cadastrada ainda.</p>
                  <p className="text-sm text-gray-400">Clique no botão "Nova Despesa" para começar.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesas.map((despesa) => (
                      <TableRow key={despesa.id}>
                        <TableCell className="font-medium">{despesa.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{despesa.categoria}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {new Date(despesa.data).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(despesa.status)}>
                            {despesa.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDespesaDialog(despesa)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDespesa(despesa.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registros" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Registros Financeiros</h2>
          </div>
          
          <FinancialRecordsTable />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Relatórios e Análises Financeiras</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Resumo Consolidado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Resumo Financeiro Consolidado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de Receitas (Pagas):</span>
                  <span className="font-semibold text-green-600">
                    R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de Despesas (Pagas):</span>
                  <span className="font-semibold text-red-600">
                    R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Saldo Líquido:</span>
                    <span className={`font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status de Cobranças */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  Status das Cobranças
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Boletos Pendentes:</span>
                  <span className="font-semibold text-yellow-600">
                    {boletos.filter(b => b.status === 'Pendente').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Boletos Pagos:</span>
                  <span className="font-semibold text-green-600">
                    {boletos.filter(b => b.status === 'Pago').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Boletos Vencidos:</span>
                  <span className="font-semibold text-red-600">
                    {boletos.filter(b => b.status === 'Vencido').length}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total de Boletos:</span>
                    <span className="font-bold">{boletos.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Cobranças de Alunos:</strong> Gerencie boletos, parcelas e recibos dos estudantes</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Financeiro Operacional:</strong> Controle receitas consolidadas e despesas da escola</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Relatórios:</strong> Análises e resumos para tomada de decisão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renovacao" className="space-y-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Renovações de Planos</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Sistema de Alertas de Renovação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Como funciona:</h3>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>O sistema monitora automaticamente as parcelas 1x até 12x de cada aluno</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Quando a última parcela com valor é detectada, um alerta é gerado</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>A data de renovação é calculada como 12 meses após a primeira parcela</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Alertas aparecem no dashboard quando faltam 30 dias ou menos para renovação</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Ações Recomendadas:</h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Entre em contato com o aluno para discutir a renovação do plano</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Crie um novo plano de pagamento na aba "Cobranças de Alunos"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Atualize os dados financeiros do aluno conforme necessário</p>
                      </div>
                    </div>
                  </div>
                </div>
               </CardContent>
             </Card>
             
             <RenewalAlertsTable />
           </div>
         </TabsContent>
        

        
        {/* Dialog para Parcela Avulsa */}
        <Dialog open={isParcelaAvulsaDialogOpen} onOpenChange={setIsParcelaAvulsaDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Parcela Avulsa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitParcela(criarParcelaAvulsa)} className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  {...registerParcela('descricao')}
                  placeholder="Ex: Taxa de matrícula, material didático..."
                />
              </div>
              
              <div>
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  {...registerParcela('valor', { required: true })}
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  {...registerParcela('data_vencimento', { required: true })}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-brand-red hover:bg-red-700">
                  Criar Parcela
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsParcelaAvulsaDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Tabs>
      </div>
    </div>
  );
};

export default Financial;
