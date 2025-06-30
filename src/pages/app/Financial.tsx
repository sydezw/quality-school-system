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
import { Plus, Edit, Trash2, DollarSign, Receipt, CreditCard, ChevronDown, ChevronRight, Check, Send, History, Filter } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';


interface Boleto {
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
  boletos: Boleto[];
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
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [alunosFinanceiros, setAlunosFinanceiros] = useState<AlunoFinanceiro[]>([]);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<HistoricoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBoletoDialogOpen, setIsBoletoDialogOpen] = useState(false);
  const [isDespesaDialogOpen, setIsDespesaDialogOpen] = useState(false);
  const [editingBoleto, setEditingBoleto] = useState<Boleto | null>(null);
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
        .from('boletos')
        .select(`
          *,
          alunos (nome)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      setBoletos(data || []);
    } catch (error) {
      console.error('Erro ao buscar boletos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os boletos.",
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
      const { data, error } = await supabase
        .from('historico_pagamentos')
        .select(`
          *,
          alunos(nome),
          boletos(descricao),
          usuarios(nome)
        `)
        .order('data_pagamento', { ascending: false });

      if (error) throw error;
      setHistoricoPagamentos(data || []);
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
        const { error } = await supabase
          .from('boletos')
          .update(formData)
          .eq('id', editingBoleto.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Boleto atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('boletos')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Boleto criado com sucesso!",
        });
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
      // Primeiro, verificar se o boleto existe
      const { data: boletoExists, error: checkError } = await supabase
        .from('boletos')
        .select('id, descricao')
        .eq('id', id)
        .single();

      if (checkError || !boletoExists) {
        throw new Error('Boleto não encontrado.');
      }

      // Executar a exclusão
      const { error: deleteError } = await supabase
        .from('boletos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Tratar diferentes tipos de erro
        if (deleteError.code === 'PGRST116') {
          throw new Error('Boleto não encontrado.');
        } else if (deleteError.code === '23503') {
          throw new Error('Não é possível excluir este boleto pois existem registros relacionados. Para resolver este problema, execute as migrações do banco de dados ou entre em contato com o administrador do sistema.');
        } else {
          throw new Error(`Erro no banco de dados: ${deleteError.message}`);
        }
      }
      
      toast({
        title: "Sucesso",
        description: `Boleto "${boletoExists.descricao}" excluído com sucesso!`,
        duration: 5000,
      });
      
      // Atualizar a lista de boletos
      await fetchBoletos();
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
      // Primeiro, verificar se a despesa existe
      const { data: despesaExists, error: checkError } = await supabase
        .from('despesas')
        .select('id, descricao')
        .eq('id', id)
        .single();

      if (checkError || !despesaExists) {
        throw new Error('Despesa não encontrada.');
      }

      // Executar a exclusão
      const { error: deleteError } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Tratar diferentes tipos de erro
        if (deleteError.code === 'PGRST116') {
          throw new Error('Despesa não encontrada.');
        } else if (deleteError.code === '23503') {
          throw new Error('Não é possível excluir esta despesa pois existem registros relacionados. Para resolver este problema, execute as migrações do banco de dados ou entre em contato com o administrador do sistema.');
        } else {
          throw new Error(`Erro no banco de dados: ${deleteError.message}`);
        }
      }
      
      toast({
        title: "Sucesso",
        description: `Despesa "${despesaExists.descricao}" excluída com sucesso!`,
        duration: 5000,
      });
      
      // Atualizar a lista de despesas
      await fetchDespesas();
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

  const openEditBoletoDialog = (boleto: Boleto) => {
    setEditingBoleto(boleto);
    setValueBoleto('aluno_id', boleto.aluno_id);
    setValueBoleto('data_vencimento', boleto.data_vencimento);
    setValueBoleto('valor', boleto.valor);
    setValueBoleto('status', boleto.status);
    setValueBoleto('descricao', boleto.descricao);
    setValueBoleto('link_pagamento', boleto.link_pagamento || '');
    setIsBoletoDialogOpen(true);
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
      // Primeiro, buscar os dados do boleto
      const { data: boleto, error: boletoError } = await supabase
        .from('boletos')
        .select('*')
        .eq('id', boletoId)
        .single();

      if (boletoError) throw boletoError;

      const dataAtual = new Date().toISOString().split('T')[0];

      // Atualizar o boleto
      const { error: updateError } = await supabase
        .from('boletos')
        .update({
          status: 'Pago',
          data_pagamento: dataAtual,
          metodo_pagamento: metodo
        })
        .eq('id', boletoId);

      if (updateError) throw updateError;

      // Inserir no histórico de pagamentos
      const { error: historicoError } = await supabase
        .from('historico_pagamentos')
        .insert({
          boleto_id: boletoId,
          aluno_id: boleto.aluno_id,
          valor_original: boleto.valor,
          valor_pago: boleto.valor,
          juros: 0,
          multa: 0,
          desconto: 0,
          metodo_pagamento: metodo,
          data_pagamento: dataAtual,
          data_vencimento_original: boleto.data_vencimento,
          tipo_transacao: 'pagamento',
          status_anterior: boleto.status,
          status_novo: 'Pago'
        });

      if (historicoError) throw historicoError;

      toast({
        title: "Sucesso",
        description: "Boleto marcado como pago!",
      });

      // Nova estratégia: refresh completo com timeout maior
      setTimeout(async () => {
        await Promise.all([
          fetchBoletos(),
          fetchStudents(),
          fetchHistoricoPagamentos()
        ]);
        
        // Verificar se deve gerar próxima parcela automaticamente
        await verificarEGerarProximaParcela(boleto.aluno_id, boleto);
      }, 300);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o boleto como pago.",
        variant: "destructive",
      });
    }
  };

  // Novas funções para geração automática de parcelas
  const verificarEGerarProximaParcela = async (alunoId: string, parcelaPaga: Boleto) => {
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
      
      const { error } = await supabase
        .from('boletos')
        .insert(novaParcela);
      
      if (error) throw error;
      
      toast({
        title: "Próxima Parcela Gerada",
        description: `Parcela ${numeroParcelaPaga + 1} criada automaticamente!`,
      });
      
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
      
      const { data: contratoData, error: contratoError } = await supabase
        .from('contratos')
        .insert(novoContrato)
        .select()
        .single();
      
      if (contratoError) throw contratoError;
      
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
      
      const { error: boletoError } = await supabase
        .from('boletos')
        .insert(parcelas);
      
      if (boletoError) throw boletoError;
      
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
      
      const { error } = await supabase
        .from('boletos')
        .insert(novaParcela);
      
      if (error) throw error;
      
      toast({
        title: "Parcela Avulsa Criada",
        description: "Parcela avulsa criada com sucesso!",
      });
      
      setIsParcelaAvulsaDialogOpen(false);
      setAlunoSelecionadoParcela(null);
      await fetchBoletos();
      
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

      const { data, error } = await supabase
        .from('boletos')
        .insert({
          aluno_id: alunoId,
          descricao: `${descricoes[tipo]} - Parcela ${dados.parcela || 1}`,
          valor: dados.valor || valores[tipo],
          data_vencimento: dados.vencimento,
          status: 'Pendente'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Boleto de ${tipo} criado com sucesso!`,
      });

      fetchBoletos();
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
          <TabsTrigger value="operacional">Financeiro Operacional</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="cobrancas" className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cobrança de Alunos</h2>
            <Dialog open={isNovoPlanoDialogOpen} onOpenChange={setIsNovoPlanoDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => { setIsNovoPlanoDialogOpen(true); }}
                  className="bg-brand-red hover:bg-brand-red/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Plano de Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Plano de Pagamento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(criarNovoPlano)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="aluno_id">Aluno *</Label>
                      <Controller
                        name="aluno_id"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
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
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="plano_id">Plano *</Label>
                      <Controller
                        name="plano_id"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                            <SelectContent>
                              {planosGenericos.map((plano) => (
                                <SelectItem key={plano.id} value={plano.id}>
                                  {plano.nome} - R$ {(plano.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Informações do Plano Selecionado */}
                  {watch('plano_id') && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Informações do Plano</h4>
                      {(() => {
                        const planoSelecionado = planosGenericos.find(p => p.id === watch('plano_id'));
                        if (planoSelecionado) {
                          return (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Valor Total: R$ {(planoSelecionado.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                              <div>Valor por Aula: R$ {(planoSelecionado.valor_por_aula || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="aulas_pagas">Quantas aulas esse aluno vai pagar? *</Label>
                    <Input
                      id="aulas_pagas"
                      type="number"
                      min="1"
                      max="36"
                      {...register('aulas_pagas', { required: true, min: 1, max: 36 })}
                      placeholder="Ex: 22"
                    />
                    <p className="text-xs text-gray-500 mt-1">Máximo: 36 aulas (semestre completo)</p>
                  </div>
                  
                  {/* Cálculos Automáticos */}
                  {watch('plano_id') && watch('aulas_pagas') && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Cálculos Automáticos</h4>
                      {(() => {
                        const planoSelecionado = planosGenericos.find(p => p.id === watch('plano_id'));
                        const aulasPagas = parseInt(watch('aulas_pagas')) || 0;
                        if (planoSelecionado && aulasPagas > 0) {
                          const aulasGratuitas = 36 - aulasPagas;
                          const valorCalculado = aulasPagas * (planoSelecionado.valor_por_aula || 0);
                          const descontoReais = aulasGratuitas * (planoSelecionado.valor_por_aula || 0);
                          return (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Aulas Gratuitas: {aulasGratuitas}</div>
                              <div>Valor Calculado: R$ {valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                              <div className="col-span-2">Desconto: R$ {descontoReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valor_matricula">Valor da Matrícula</Label>
                      <Input
                        id="valor_matricula"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('valor_matricula')}
                        placeholder="0,00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="valor_material">Valor do Material</Label>
                      <Input
                        id="valor_material"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('valor_material')}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                      <Controller
                        name="forma_pagamento"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="boleto">Boleto</SelectItem>
                              <SelectItem value="cartao">Cartão</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="transferencia">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="numero_parcelas">Número de Parcelas *</Label>
                      <Controller
                        name="numero_parcelas"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} {num === 1 ? 'parcela' : 'parcelas'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Valor Total do Contrato */}
                  {watch('plano_id') && watch('aulas_pagas') && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Valor Total do Contrato</h4>
                      {(() => {
                        const planoSelecionado = planosGenericos.find(p => p.id === watch('plano_id'));
                        const aulasPagas = parseInt(watch('aulas_pagas')) || 0;
                        const valorMatricula = parseFloat(watch('valor_matricula')) || 0;
                        const valorMaterial = parseFloat(watch('valor_material')) || 0;
                        if (planoSelecionado && aulasPagas > 0) {
                          const valorCalculado = aulasPagas * (planoSelecionado.valor_por_aula || 0);
                          const valorTotal = valorCalculado + valorMatricula + valorMaterial;
                          return (
                            <div className="text-lg font-bold text-green-700">
                              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          );
                        }
                        return <div className="text-gray-500">Preencha os campos acima para ver o cálculo</div>;
                      })()}
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="data_vencimento_primeira">Data de Vencimento da 1ª Parcela *</Label>
                    <Input
                      id="data_vencimento_primeira"
                      type="date"
                      {...register('data_vencimento_primeira', { required: true })}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                      Criar Plano
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsNovoPlanoDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
                  variant={viewMode === 'agrupado' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('agrupado')}
                >
                  Agrupado por Aluno
                </Button>
                <Button
                  variant={viewMode === 'lista' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('lista')}
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
              ) : viewMode === 'agrupado' ? (
                <div className="space-y-4">
                  {filtrarAlunosPorStatus(alunosFinanceiros).map((aluno) => (
                    <Card key={aluno.id} className="border">
                      <Collapsible
                        open={expandedAlunos.has(aluno.id)}
                        onOpenChange={() => toggleAlunoExpanded(aluno.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-6">
                            <div className="flex items-center justify-between w-full min-h-[60px]">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex items-center justify-center h-full pt-1">
                                  {expandedAlunos.has(aluno.id) ? (
                                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg mb-2">{aluno.nome}</CardTitle>
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                    <span className="font-medium">Total geral: R$ 350,00</span>
                                    <span className="font-medium text-green-600">Pago: R$ 270,00</span>
                                    <span className="font-medium text-red-600">Em aberto: R$ 80,00</span>
                                    {aluno.boletosVencidos > 0 && (
                                      <span className="text-red-600 font-medium">
                                        1 vencido(s)
                                      </span>
                                    )}
                                    {aluno.ultimoPagamento && (
                                      <span>Último pagamento: {new Date(aluno.ultimoPagamento).toLocaleDateString('pt-BR')}</span>
                                    )}
                                  </div>
                                  
                                  {/* Informações consolidadas */}
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Plano:</span>
                                      <Badge variant="outline" className="text-xs">
                                        {obterPlanoAluno(aluno.id)}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Status Geral:</span>
                                      <Badge variant="secondary" className="text-xs">
                                        Parcialmente Pago
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 min-w-[250px]">
                                      <span className="text-gray-500">Progresso Geral:</span>
                                      <div className="flex-1">
                                        <Progress value={77} className="h-2" />
                                        <span className="text-xs text-gray-400 mt-1">
                                          77% do valor total pago (R$ 270,00 / R$ 350,00)
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 items-center ml-4 flex-shrink-0">
                                {aluno.boletosVencidos > 0 && (
                                  <Badge variant="destructive" className="whitespace-nowrap">
                                    Em Atraso
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            {/* Tipos de Cobrança */}
                            <div className="mb-6">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Tipos de Cobrança
                              </h4>
                              
                              <div className="space-y-3">
                                {/* Toggle Plano Contratado */}
                                <div className="border rounded-lg p-3">
                                  <Collapsible
                                    open={expandedToggles[aluno.id]?.plano || false}
                                    onOpenChange={() => toggleTipoCobranca(aluno.id, 'plano')}
                                  >
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-3 flex-1">
                                          <Badge variant="outline">
                                            Plano Contratado
                                          </Badge>
                                          <div className="flex items-center gap-2 flex-1">
                                            <div className="flex-1 max-w-[200px]">
                                              <Progress value={75} className="h-2" />
                                              <span className="text-xs text-gray-400 mt-1">3/4 parcelas pagas</span>
                                            </div>
                                            <div className="text-sm">
                                              <span className="text-gray-600">R$ 150,00/mês</span>
                                              <Badge variant="outline" className="ml-2 text-xs">Em dia</Badge>
                                            </div>
                                          </div>
                                        </div>
                                        {expandedToggles[aluno.id]?.plano ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="mt-3 space-y-4">
                                        {/* Boletos existentes do plano */}
                                        {aluno.boletos.length > 0 && (
                                          <div>
                                            <h5 className="font-medium mb-2 text-sm">Boletos do Plano ({aluno.boletos.length})</h5>
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>Descrição</TableHead>
                                                  <TableHead>Valor</TableHead>
                                                  <TableHead>Vencimento</TableHead>
                                                  <TableHead>Status</TableHead>
                                                  <TableHead>Ações</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {aluno.boletos.map((boleto) => (
                                                  <TableRow key={boleto.id}>
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
                                                      <div className="flex gap-1">
                                                        {boleto.status !== 'Pago' && (
                                                          <Button
                                                            
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => marcarComoPago(boleto.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                          >
                                                            <Check className="h-3 w-3" />
                                                          </Button>
                                                        )}
                                                        <Button
                                                          
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() => openEditBoletoDialog(boleto)}
                                                        >
                                                          <Edit className="h-3 w-3" />
                                                        </Button>
                                                         <Button
 
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() => deleteBoleto(boleto.id)}
                                                          className="text-red-600 hover:text-red-700"
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                        )}
                                        
                                        {/* Botão Parcela Avulsa */}
                                        <div className="p-3 bg-gray-50 rounded">
                                          <Button
                                            
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setAlunoSelecionadoParcela(aluno.id);
                                              setIsParcelaAvulsaDialogOpen(true);
                                            }}
                                            className="text-brand-red hover:text-red-800 border-brand-red hover:bg-brand-red hover:text-white"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Parcela Avulsa
                                          </Button>
                                        </div>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                                
                                {/* Toggle Material */}
                                <div className="border rounded-lg p-3">
                                  <Collapsible
                                    open={expandedToggles[aluno.id]?.material || false}
                                    onOpenChange={() => toggleTipoCobranca(aluno.id, 'material')}
                                  >
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-3 flex-1">
                                          <Badge variant="outline">
                                            Material Didático
                                          </Badge>
                                          <div className="flex items-center gap-2 flex-1">
                                            <div className="flex-1 max-w-[200px]">
                                              <Progress value={0} className="h-2" />
                                              <span className="text-xs text-gray-400 mt-1">0/2 parcelas pagas</span>
                                            </div>
                                            <div className="text-sm">
                                              <span className="text-gray-600">R$ 80,00</span>
                                              <Badge variant="destructive" className="ml-2 text-xs">Pendente</Badge>
                                            </div>
                                          </div>
                                        </div>
                                        {expandedToggles[aluno.id]?.material ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="mt-3 space-y-4">
                                        {/* Boletos de demonstração para material */}
                                        <div>
                                          <h5 className="font-medium mb-2 text-sm">Boletos de Material (2)</h5>
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Descrição</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Vencimento</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Ações</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              <TableRow>
                                                <TableCell>Material Didático - 1ª Parcela</TableCell>
                                                <TableCell className="font-medium">R$ 40,00</TableCell>
                                                <TableCell>15/02/2025</TableCell>
                                                <TableCell>
                                                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                    Pendente
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                                      <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                      <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                              <TableRow>
                                                <TableCell>Material Didático - 2ª Parcela</TableCell>
                                                <TableCell className="font-medium">R$ 40,00</TableCell>
                                                <TableCell>15/03/2025</TableCell>
                                                <TableCell>
                                                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                    Pendente
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                                                      <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                      <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </div>
                                        
                                        {/* Botão Parcela Avulsa */}
                                        <div className="p-3 bg-gray-50 rounded">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setAlunoSelecionadoParcela(aluno.id);
                                              setIsParcelaAvulsaDialogOpen(true);
                                            }}
                                            className="text-brand-red hover:text-red-800 border-brand-red hover:bg-brand-red hover:text-white"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Parcela Avulsa
                                          </Button>
                                        </div>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                                
                                {/* Toggle Matrícula */}
                                <div className="border rounded-lg p-3">
                                  <Collapsible
                                    open={expandedToggles[aluno.id]?.matricula || false}
                                    onOpenChange={() => toggleTipoCobranca(aluno.id, 'matricula')}
                                  >
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-3 flex-1">
                                          <Badge variant="outline">
                                            Taxa de Matrícula
                                          </Badge>
                                          <div className="flex items-center gap-2 flex-1">
                                            <div className="flex-1 max-w-[200px]">
                                              <Progress value={100} className="h-2" />
                                              <span className="text-xs text-gray-400 mt-1">1/1 parcela paga</span>
                                            </div>
                                            <div className="text-sm">
                                              <span className="text-gray-600">R$ 120,00</span>
                                              <Badge variant="default" className="ml-2 text-xs">Pago</Badge>
                                            </div>
                                          </div>
                                        </div>
                                        {expandedToggles[aluno.id]?.matricula ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="mt-3 space-y-4">
                                        {/* Boletos de demonstração para matrícula */}
                                        <div>
                                          <h5 className="font-medium mb-2 text-sm">Boletos de Matrícula (1)</h5>
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Descrição</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Vencimento</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Ações</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              <TableRow>
                                                <TableCell>Taxa de Matrícula 2025</TableCell>
                                                <TableCell className="font-medium">R$ 120,00</TableCell>
                                                <TableCell>10/01/2025</TableCell>
                                                <TableCell>
                                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    Pago
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex gap-1">
                                                    <Button size="sm" variant="outline">
                                                      <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </div>
                                        
                                        {/* Botão Parcela Avulsa */}
                                        <div className="p-3 bg-gray-50 rounded">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setAlunoSelecionadoParcela(aluno.id);
                                              setIsParcelaAvulsaDialogOpen(true);
                                            }}
                                            className="text-brand-red hover:text-red-800 border-brand-red hover:bg-brand-red hover:text-white"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Parcela Avulsa
                                          </Button>
                                        </div>
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              </div>
                            </div>
                            
                            {/* Histórico de Pagamentos */}
                            {aluno.historicoPagamentos.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <History className="h-4 w-4" />
                                  Histórico de Pagamentos ({aluno.historicoPagamentos.length})
                                </h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Data</TableHead>
                                      <TableHead>Tipo</TableHead>
                                      <TableHead>Valor</TableHead>
                                      <TableHead>Método</TableHead>
                                      <TableHead>Observações</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {aluno.historicoPagamentos.slice(0, 5).map((historico) => (
                                      <TableRow key={historico.id}>
                                        <TableCell>
                                          {new Date(historico.data_pagamento).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="secondary">{historico.tipo_transacao}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          R$ {historico.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>{historico.metodo_pagamento}</TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                          {historico.observacoes || '-'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                {aluno.historicoPagamentos.length > 5 && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    Mostrando os 5 pagamentos mais recentes de {aluno.historicoPagamentos.length} total.
                                  </p>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                  
                  {filtrarAlunosPorStatus(alunosFinanceiros).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhum aluno encontrado com os filtros aplicados.</p>
                    </div>
                  )}
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
