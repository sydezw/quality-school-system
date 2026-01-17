import React, { useState, useEffect, useMemo, useDeferredValue, useTransition, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatarFormaPagamento, formatPhone } from '@/utils/formatters';
import { calcularFaltasPorPeriodo, type FaltasPorPeriodo, formatarMensagemFaltas } from '@/utils/faltasPorPeriodo';

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
  const renderStart = performance.now();
  const deferredStudent = useDeferredValue(student);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [faltasPeriodo, setFaltasPeriodo] = useState<FaltasPorPeriodo | null>(null);
  const [carregandoFaltas, setCarregandoFaltas] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  
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
  const [contratoLoading, setContratoLoading] = useState(false);
  const [carregandoNotas, setCarregandoNotas] = useState(false);
  const [notaGeralMedia, setNotaGeralMedia] = useState<number | null>(null);
  const [notasCompetenciasMedia, setNotasCompetenciasMedia] = useState<{ Listening?: number | null; Speaking?: number | null; Writing?: number | null; Reading?: number | null }>({});
  const [turmasAluno, setTurmasAluno] = useState<Array<{ id: string; nome: string; horario?: string | null; dias?: string | null }>>([]);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string | null>(null);
  const [carregandoProvaFinal, setCarregandoProvaFinal] = useState(false);
  const [provaFinalInfo, setProvaFinalInfo] = useState<{ acertos: number; total: number; percentual: number; data: string | null; observacao: string | null } | null>(null);
  const [matriculaObservacoes, setMatriculaObservacoes] = useState<string>('');
  const [matriculaIdAtual, setMatriculaIdAtual] = useState<string | null>(null);
  const [salvandoObservacoes, setSalvandoObservacoes] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoPage, setHistoricoPage] = useState(0);
  const [historicoRows, setHistoricoRows] = useState<Array<{ data: string; listening?: number | null; speaking?: number | null; writing?: number | null; reading?: number | null; book?: string | null; turma_nome_snapshot?: string | null }>>([]);

  const [turmaAtual, setTurmaAtual] = useState<{
    id: string;
    nome?: string | null;
    data_inicio?: string | null;
    data_fim?: string | null;
    horario?: string | null;
    dia_semana?: string | null;
    professor?: string | null;
    nivel?: string | null;
  } | null>(null);
  const [responsavel, setResponsavel] = useState<{ id: string | null; nome: string; telefone: string | null; email: string | null } | null>(null);
  const [responsavelId, setResponsavelId] = useState<string | null>(null);
  const [carregandoParentesco, setCarregandoParentesco] = useState(false);
  const [alunosMesmoResponsavel, setAlunosMesmoResponsavel] = useState<Array<{ id: string; nome: string }>>([]);
  const currentStudentIdRef = React.useRef<string | null>(null);

  const [ultimaPresenca, setUltimaPresenca] = useState<string | null>(null);

  const periodoTexto = useMemo(() => {
    if (turmaAtual?.data_inicio && turmaAtual?.data_fim) {
      return `${formatDate(turmaAtual.data_inicio)} — ${formatDate(turmaAtual.data_fim)}`;
    }
    return turmaAtual ? 'Período não configurado' : 'Sem turma';
  }, [turmaAtual]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setShowSecondary(true), 250);
      return () => clearTimeout(t);
    } else {
      setShowSecondary(false);
    }
  }, [isOpen]);

  const carregarProvaFinal = useCallback(async (alunoId: string, turmaId: string) => {
    try {
      setCarregandoProvaFinal(true);
      type ProvaFinalRow = {
        acertos: number | null;
        total_questoes: number | null;
        data_prova: string | null;
        observacao: string | null;
      };
      type DatabaseExt = Database & {
        public: {
          Tables: Database['public']['Tables'] & {
            avaliacoes_prova_final: {
              Row: ProvaFinalRow;
            };
          };
        };
      };
      const sp = supabase as unknown as SupabaseClient<DatabaseExt>;
      const { data } = await sp
        .from('avaliacoes_prova_final')
        .select('acertos, total_questoes, data_prova, observacao')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .order('data_prova', { ascending: false })
        .limit(1);
      const rows = (data || []) as ProvaFinalRow[];
      if (rows && rows.length > 0) {
        const r = rows[0];
        const ac = Math.max(0, Number(r.acertos || 0));
        const tot = Math.max(0, Number(r.total_questoes || 0));
        const perc = tot > 0 ? Math.round((ac / tot) * 100) : 0;
        setProvaFinalInfo({ acertos: ac, total: tot, percentual: perc, data: r.data_prova, observacao: r.observacao });
      } else {
        setProvaFinalInfo(null);
      }
    } catch {
      setProvaFinalInfo(null);
    } finally {
      setCarregandoProvaFinal(false);
    }
  }, []);

  const carregarResponsavel = useCallback(async (alunoId: string) => {
    if (!alunoId) {
      setResponsavel(null);
      setResponsavelId(null);
      return;
    }
    if (!isOpen) return;
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('responsavel_id, responsaveis ( nome, telefone, email )')
        .eq('id', alunoId)
        .single();
      if (error) throw error;
      type AlunoRespJoin = { responsavel_id: string | null; responsaveis?: { nome: string; telefone: string | null; email: string | null } | null };
      const row = data as AlunoRespJoin;
      const r = row?.responsaveis ?? null;
      setResponsavel(r ? { id: row?.responsavel_id ?? null, nome: r.nome, telefone: r.telefone || null, email: r.email || null } : null);
      setResponsavelId(row?.responsavel_id ?? null);
    } catch (e) {
      setResponsavel(null);
      setResponsavelId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (isOpen && id) {
      carregarResponsavel(id);
    } else {
      setResponsavel(null);
    }
  }, [isOpen, deferredStudent?.id, student?.id, carregarResponsavel]);

  const carregarAlunosMesmoResponsavel = useCallback(async (respId: string, alunoId: string) => {
    if (!respId || !alunoId) {
      setAlunosMesmoResponsavel([]);
      return;
    }
    if (!isOpen) return;
    try {
      setCarregandoParentesco(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('responsavel_id', respId)
        .neq('id', alunoId)
        .order('nome');
      if (error) throw error;
      type AlunoBasicRow = { id: string; nome: string };
      const rows = (data || []) as AlunoBasicRow[];
      setAlunosMesmoResponsavel(rows);
    } catch (e) {
      setAlunosMesmoResponsavel([]);
    } finally {
      setCarregandoParentesco(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (isOpen && responsavelId && id) {
      carregarAlunosMesmoResponsavel(responsavelId, id);
    } else {
      setAlunosMesmoResponsavel([]);
    }
  }, [isOpen, responsavelId, deferredStudent?.id, student?.id, carregarAlunosMesmoResponsavel]);

  // Função para carregar faltas por período
  const carregarFaltasPorPeriodo = useCallback(async (alunoId: string) => {
    if (!alunoId) return;
    if (!isOpen) return;
    
    try {
      setCarregandoFaltas(true);
      
      // Buscar turma ativa do aluno via view consolidada
      const { data: matriculas, error: errorMatriculas } = await supabase
        .from('view_alunos_turmas')
        .select('turma_id, data_matricula, matricula_status')
        .eq('aluno_id', alunoId)
        .ilike('matricula_status', 'ativo')
        .order('data_matricula', { ascending: false })
        .limit(1);

      if (errorMatriculas || !matriculas || matriculas.length === 0 || !matriculas[0].turma_id) {
        setFaltasPeriodo({
          totalFaltas: 0,
          faltasRepostas: 0,
          faltasNaoRepostas: 0,
          percentualPresenca: 0,
          totalAulasRealizadas: 0,
          totalPresencas: 0,
          aulasSemRegistro: 0,
          totalReposicoes: 0,
          periodoInicio: null,
          periodoFim: null,
          periodoConfigurado: false,
          mensagemStatus: 'Aluno sem turma ativa'
        });
        setUltimaPresenca(null);
        return;
      }

      const turmaId = matriculas[0].turma_id as string;
      const resultado = await calcularFaltasPorPeriodo(alunoId, turmaId);
      setFaltasPeriodo(resultado);

      // Buscar última presença do aluno na turma (mesma base de filtros de período)
      const { data: matriculaAtiva } = await supabase
        .from('aluno_turma')
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .limit(1);

      const matriculaId = matriculaAtiva?.[0]?.id as string | undefined;

      let presQuery = supabase
        .from('presencas')
        .select(`
          id,
          status,
          aulas!inner (
            id,
            data,
            turma_id
          )
        `)
        .eq('aulas.turma_id', turmaId);

      if (matriculaId) {
        presQuery = presQuery.or(`aluno_id.eq.${alunoId},aluno_turma_id.eq.${matriculaId}`);
      } else {
        presQuery = presQuery.eq('aluno_id', alunoId);
      }

      if (resultado.periodoInicio) {
        presQuery = presQuery.gte('aulas.data', resultado.periodoInicio);
      }
      if (resultado.periodoFim) {
        presQuery = presQuery.lte('aulas.data', resultado.periodoFim);
      }

      presQuery = presQuery.eq('status', 'Presente');

      const { data: ultimas, error: errorUlt } = await presQuery
        .order('data', { ascending: false, foreignTable: 'aulas' })
        .limit(1);

      type LastPresRow = { aulas?: { data?: string | null } | null };
      const presDtRaw = !errorUlt && ultimas && ultimas.length > 0 ? ((ultimas[0] as LastPresRow).aulas?.data ?? null) : null;

      const { data: compRows } = await supabase
        .from('avaliacoes_competencia')
        .select('data')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .order('data', { ascending: false })
        .limit(1);
      let compDtRaw = (compRows?.[0] as { data?: string } | undefined)?.data || null;
      if (resultado.periodoInicio) {
        compDtRaw = compDtRaw && compDtRaw >= resultado.periodoInicio ? compDtRaw : null;
      }
      if (resultado.periodoFim) {
        compDtRaw = compDtRaw && compDtRaw <= resultado.periodoFim ? compDtRaw : null;
      }

      type PFOnlyDate = { data_prova: string | null };
      type DatabaseExtPF = Database & {
        public: {
          Tables: Database['public']['Tables'] & {
            avaliacoes_prova_final: { Row: PFOnlyDate };
          };
        };
      };
      const spPF = supabase as unknown as SupabaseClient<DatabaseExtPF>;
      const { data: pfRows } = await spPF
        .from('avaliacoes_prova_final')
        .select('data_prova')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .order('data_prova', { ascending: false })
        .limit(1);
      let pfDtRaw = (pfRows?.[0] as PFOnlyDate | undefined)?.data_prova || null;
      if (resultado.periodoInicio) {
        pfDtRaw = pfDtRaw && pfDtRaw >= resultado.periodoInicio ? pfDtRaw : null;
      }
      if (resultado.periodoFim) {
        pfDtRaw = pfDtRaw && pfDtRaw <= resultado.periodoFim ? pfDtRaw : null;
      }

      const candidates = [presDtRaw, compDtRaw, pfDtRaw].filter(Boolean) as string[];
      if (candidates.length > 0) {
        const lastIso = candidates.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0))[0];
        setUltimaPresenca(formatDate(lastIso));
      } else {
        setUltimaPresenca(null);
      }
    } catch (error) {
      console.error('Erro ao carregar faltas por período:', error);
      setFaltasPeriodo({
        totalFaltas: 0,
        faltasRepostas: 0,
        faltasNaoRepostas: 0,
        percentualPresenca: 0,
        totalAulasRealizadas: 0,
        totalPresencas: 0,
        aulasSemRegistro: 0,
        totalReposicoes: 0,
        periodoInicio: null,
        periodoFim: null,
        periodoConfigurado: false,
        mensagemStatus: 'Erro ao carregar dados'
      });
    } finally {
      setCarregandoFaltas(false);
    }
  }, [isOpen]);

  const carregarHistorico = useCallback(async (alunoId: string, page: number) => {
    try {
      setHistoricoLoading(true);
      type HistoricoRow = {
        aluno_id: string;
        aula_id?: string | null;
        data: string;
        turma_nome_snapshot?: string | null;
        book?: string | null;
        listening?: number | null;
        speaking?: number | null;
        writing?: number | null;
        reading?: number | null;
      };
      type DatabaseExt = Database & {
        public: {
          Tables: Database['public']['Tables'] & {
            view_avaliacoes_aula_historico: {
              Row: HistoricoRow;
            };
          };
        };
      };
      const sp = supabase as unknown as SupabaseClient<DatabaseExt>;
      const pageSize = 20;
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data } = await sp
        .from('view_avaliacoes_aula_historico')
        .select('data, turma_nome_snapshot, book, listening, speaking, writing, reading')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false })
        .range(from, to);
      const rows = (data || []) as HistoricoRow[];
      const mapped = rows.map(r => ({
        data: r.data,
        listening: r.listening ?? null,
        speaking: r.speaking ?? null,
        writing: r.writing ?? null,
        reading: r.reading ?? null,
        book: r.book ?? null,
        turma_nome_snapshot: r.turma_nome_snapshot ?? null,
      }));
      setHistoricoRows(prev => (page === 0 ? mapped : [...prev, ...mapped]));
    } finally {
      setHistoricoLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (historicoOpen && id) {
      setHistoricoRows([]);
      setHistoricoPage(0);
      carregarHistorico(id, 0);
    }
  }, [historicoOpen, deferredStudent?.id, student?.id, carregarHistorico]);

  const buscarTurmaAtual = useCallback(async (alunoId: string) => {
    if (!alunoId) {
      setTurmaAtual(null);
      return;
    }
    if (!isOpen) return;
    try {
      // Usar a view consolidada de matrículas para obter a turma ativa
      const { data: viewData, error: errorView } = await supabase
        .from('view_alunos_turmas')
        .select('turma_id, turma_nome, turma_horario, turma_dias, data_matricula, matricula_status')
        .eq('aluno_id', alunoId)
        .ilike('matricula_status', 'ativo')
        .order('data_matricula', { ascending: false })
        .limit(1);

      if (errorView) throw errorView;
      const turmaId = viewData?.[0]?.turma_id as string | undefined;
      if (!turmaId) {
        setTurmaAtual(null);
        return;
      }

      // Buscar detalhes completos da turma (período e professor)
      const { data: turmaData, error: errorTurma } = await supabase
        .from('turmas')
        .select(`
          id,
          nome,
          data_inicio,
          data_fim,
          horario,
          dias_da_semana,
          nivel,
          professor_id,
          professores:professor_id (
            id,
            nome
          )
        `)
        .eq('id', turmaId)
        .limit(1);

      if (errorTurma) throw errorTurma;
      type TurmaRow = {
        id: string;
        nome?: string | null;
        data_inicio?: string | null;
        data_fim?: string | null;
        horario?: string | null;
        dias_da_semana?: string | null;
        professores?: { nome?: string | null } | null;
        nivel?: string | null;
      };
      const turma = (turmaData?.[0] as TurmaRow | undefined) || null;
      if (turma) {
        const dias = turma.dias_da_semana || viewData?.[0]?.turma_dias || null;
        setTurmaAtual({
          id: turma.id,
          nome: turma.nome ?? viewData?.[0]?.turma_nome ?? null,
          data_inicio: turma.data_inicio ?? null,
          data_fim: turma.data_fim ?? null,
          horario: turma.horario ?? viewData?.[0]?.turma_horario ?? null,
          dia_semana: dias,
          professor: turma?.professores?.nome ?? null,
          nivel: turma.nivel ?? null,
        });
      } else {
        setTurmaAtual(null);
      }
    } catch (err) {
      console.error('Erro ao buscar turma atual:', err);
      setTurmaAtual(null);
    }
  }, [isOpen]);

  const buscarObservacoesAcademicas = useCallback(async (alunoId: string, turmaId?: string | null) => {
    if (!isOpen || !alunoId || !turmaId) {
      setMatriculaIdAtual(null);
      setMatriculaObservacoes('');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('aluno_turma')
        .select('id, observacoes')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .ilike('status', 'ativo')
        .order('data_matricula', { ascending: false })
        .limit(1);
      if (error) return;
      const m = data?.[0];
      setMatriculaIdAtual(m?.id ?? null);
      setMatriculaObservacoes(m?.observacoes ?? '');
    } catch (e) {
      setMatriculaIdAtual(null);
      setMatriculaObservacoes('');
    }
  }, [isOpen]);

  const salvarObservacoesAcademicas = async () => {
    if (!matriculaIdAtual) return;
    try {
      setSalvandoObservacoes(true);
      const { error } = await supabase
        .from('aluno_turma')
        .update({ observacoes: matriculaObservacoes || null })
        .eq('id', matriculaIdAtual);
      if (!error) {
        toast({ title: 'Sucesso', description: 'Observações acadêmicas atualizadas.' });
      } else {
        toast({ title: 'Erro', description: 'Falha ao salvar observações.', variant: 'destructive' });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Falha ao salvar observações.';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setSalvandoObservacoes(false);
    }
  };
  
  const buscarDadosContratos = useCallback(async (alunoId: string): Promise<DadosContratos> => {
    try {
      const { data: contratosData, error: errorContratos } = await supabase
        .from('contratos')
        .select(`
          id, aluno_id, plano_id, data_inicio, data_fim, valor_mensalidade, status_contrato, idioma_contrato, observacao, created_at, updated_at,
          planos (
            id,
            nome,
            descricao,
            valor_total,
            idioma
          )
        `)
        .eq('aluno_id', alunoId)
        .order('data_inicio', { ascending: false });

      if (errorContratos) {
        console.error('Erro ao buscar contratos:', errorContratos);
        return { contratoAtivo: null, totalContratos: 0, contratoMaisRecente: null };
      }

      const contratosArray = (contratosData || []) as ContratoAluno[];
      const contratoMaisRecente = contratosArray[0] || null;
      const contratoAtivo = contratosArray.find(c => c.status_contrato?.toLowerCase() === 'ativo') || contratoMaisRecente;

      return {
        contratoAtivo: contratoAtivo || null,
        totalContratos: contratosArray.length,
        contratoMaisRecente
      };
    } catch (error) {
      console.error('Erro ao buscar dados de contratos:', error);
      return { contratoAtivo: null, totalContratos: 0, contratoMaisRecente: null };
    }
  }, []);

  const buscarDadosFinanceiros = useCallback(async (alunoId: string) => {
    if (!isOpen) return;
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
  }, [isOpen]);

  useEffect(() => {
    if (deferredStudent?.id && isOpen) {
      const loadCritical = async () => {
        await buscarTurmaAtual(deferredStudent.id);
        await carregarFaltasPorPeriodo(deferredStudent.id);
      };
      loadCritical();

      startTransition(() => {
        buscarDadosFinanceiros(deferredStudent.id);
      });
    }
  }, [deferredStudent?.id, isOpen, buscarTurmaAtual, carregarFaltasPorPeriodo, buscarDadosFinanceiros]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    currentStudentIdRef.current = id || null;
    if (!isOpen || !id) {
      setContratoLoading(false);
      setDadosContratos({ contratoAtivo: null, totalContratos: 0, contratoMaisRecente: null });
      return;
    }
    setContratoLoading(true);
    setDadosContratos({ contratoAtivo: null, totalContratos: 0, contratoMaisRecente: null });
    let cancelled = false;
    const activeId = id;
    buscarDadosContratos(activeId)
      .then((res) => {
        if (!cancelled && activeId === currentStudentIdRef.current) {
          setDadosContratos(res);
        }
      })
      .finally(() => {
        if (!cancelled) setContratoLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, deferredStudent?.id, student?.id, buscarDadosContratos]);

  const carregarNotasPorPeriodo = useCallback(async (alunoId: string, turmaIdOverride?: string) => {
    if (!alunoId || !isOpen) return;
    try {
      setCarregandoNotas(true);
      const { data: viewData } = turmaIdOverride ? { data: [{ turma_id: turmaIdOverride, data_matricula: null }] } : await supabase
        .from('view_alunos_turmas')
        .select('turma_id, data_matricula, matricula_status')
        .eq('aluno_id', alunoId)
        .ilike('matricula_status', 'ativo')
        .order('data_matricula', { ascending: false })
        .limit(1);

      const turmaId = (turmaIdOverride as string | undefined) || (viewData?.[0]?.turma_id as string | undefined);
      if (!turmaId) {
        setNotaGeralMedia(null);
        setNotasCompetenciasMedia({});
        return;
      }

      const { data: turma } = await supabase
        .from('turmas')
        .select('data_inicio, data_fim')
        .eq('id', turmaId)
        .limit(1);
      const inicio = turma?.[0]?.data_inicio || viewData?.[0]?.data_matricula || null;
      const fim = turma?.[0]?.data_fim || null;
      const periodoInicio = inicio || new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().slice(0, 10);
      const periodoFim = fim || new Date().toISOString().slice(0, 10);

      // Notas por competência
      const { data: notasComp } = await supabase
        .from('avaliacoes_competencia')
        .select('competencia, nota')
        .eq('aluno_id', alunoId)
        .eq('turma_id', turmaId)
        .gte('data', periodoInicio)
        .lte('data', periodoFim);
      const acc: Record<string, { sum: number; count: number }> = {};
      type RowComp = { competencia: 'Listening' | 'Speaking' | 'Writing' | 'Reading'; nota: number };
      for (const r of ((notasComp || []) as RowComp[])) {
        const comp = r.competencia;
        const nota = Math.max(0, Math.min(5, r.nota));
        if (!acc[comp]) acc[comp] = { sum: 0, count: 0 };
        acc[comp].sum += nota;
        acc[comp].count += 1;
      }
      setNotasCompetenciasMedia({
        Listening: acc['Listening'] ? acc['Listening'].sum / acc['Listening'].count : null,
        Speaking: acc['Speaking'] ? acc['Speaking'].sum / acc['Speaking'].count : null,
        Writing: acc['Writing'] ? acc['Writing'].sum / acc['Writing'].count : null,
        Reading: acc['Reading'] ? acc['Reading'].sum / acc['Reading'].count : null,
      });

      const comps = ['Listening','Speaking','Writing','Reading'] as const;
      const values = comps
        .map((c) => acc[c]?.count ? acc[c].sum / acc[c].count : null)
        .filter((v): v is number => typeof v === 'number');
      const geral = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : null;
      setNotaGeralMedia(geral);
    } catch (e) {
      setNotaGeralMedia(null);
      setNotasCompetenciasMedia({});
    } finally {
      setCarregandoNotas(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (!isOpen || !id) {
      setNotaGeralMedia(null);
      setNotasCompetenciasMedia({});
      return;
    }
    carregarNotasPorPeriodo(id);
  }, [isOpen, deferredStudent?.id, student?.id, carregarNotasPorPeriodo]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (!isOpen || !id) {
      setTurmasAluno([]);
      setTurmaSelecionadaId(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('view_alunos_turmas')
        .select('turma_id, turma_nome, turma_horario, turma_dias, data_matricula, matricula_status')
        .eq('aluno_id', id)
        .ilike('matricula_status', 'ativo')
        .order('data_matricula', { ascending: false });
      const lista = ((data || []) as Array<{ turma_id: string; turma_nome: string; turma_horario?: string | null; turma_dias?: string | null }>)
        .map((r) => ({ id: r.turma_id, nome: r.turma_nome, horario: r.turma_horario ?? null, dias: r.turma_dias ?? null }));
      setTurmasAluno(lista);
      if (!turmaSelecionadaId) {
        setTurmaSelecionadaId(turmaAtual?.id || lista[0]?.id || null);
      }
    })();
  }, [isOpen, deferredStudent?.id, student?.id, turmaAtual?.id]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (!isOpen || !id || !turmaSelecionadaId) return;
    carregarNotasPorPeriodo(id, turmaSelecionadaId);
    carregarProvaFinal(id, turmaSelecionadaId);
    (async () => {
      const { data } = await supabase
        .from('turmas')
        .select(`id, nome, data_inicio, data_fim, horario, dias_da_semana, nivel, professor_id, professores:professor_id ( id, nome )`)
        .eq('id', turmaSelecionadaId)
        .limit(1);
      const turma = data?.[0];
      if (turma) {
        setTurmaAtual({
          id: turma.id,
          nome: turma.nome ?? null,
          data_inicio: turma.data_inicio ?? null,
          data_fim: turma.data_fim ?? null,
          horario: turma.horario ?? null,
          dia_semana: turma.dias_da_semana ?? null,
          professor: turma?.professores?.nome ?? null,
          nivel: turma.nivel ?? null,
        });
      }
    })();
    buscarObservacoesAcademicas(id, turmaSelecionadaId);
  }, [isOpen, deferredStudent?.id, student?.id, turmaSelecionadaId, carregarNotasPorPeriodo, buscarObservacoesAcademicas]);

  useEffect(() => {
    if (deferredStudent?.id && turmaAtual?.id && isOpen) {
      buscarObservacoesAcademicas(deferredStudent.id, turmaAtual.id);
    }
  }, [deferredStudent?.id, turmaAtual?.id, isOpen, buscarObservacoesAcademicas]);

  if (!student) return null;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return formatDate(data);
  };

  const getBarGradient = (v: number) => {
    if (v <= 1) return 'from-red-500 to-red-600';
    if (v <= 2) return 'from-orange-400 to-amber-500';
    if (v <= 3) return 'from-yellow-400 to-amber-500';
    if (v <= 4) return 'from-green-500 to-green-600';
    return 'from-emerald-400 to-emerald-500';
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

  const renderEnd = performance.now();
  console.log('[PERF] StudentDetailsModal TRUE render ms =', renderEnd - renderStart);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-md">
        <DialogHeader className="relative pb-6">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-t-lg"
          />
          <div className="relative z-10 flex items-center justify-between text-white p-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30"
              >
                <User className="w-8 h-8 text-white" />
              </div>
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

        <div className="space-y-8 p-6">
          {/* Informações Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Email</span>
              </div>
              <span className="font-semibold text-[#111827] text-base">{student.email || 'Não informado'}</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Telefone</span>
              </div>
              <span className="font-semibold text-[#111827] text-base">{student.telefone || 'Não informado'}</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600">Data de Nascimento</span>
              </div>
              <span className="font-semibold text-[#111827] text-base">{student.data_nascimento ? formatarData(student.data_nascimento) : 'Não informado'}</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
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
            <div 
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
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
                    <div 
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(dadosFinanceiros.progresso, 100)}%` }}
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
                  <div className="font-semibold text-sm text-[#111827] mt-1">{formatarFormaPagamento(dadosFinanceiros.registroFinanceiro?.forma_pagamento_plano || 'Não definido')}</div>
                </div>
              </div>
            </div>

            {/* Card Contratos */}
            <div 
              key={`contratos-${deferredStudent?.id || student?.id || 'none'}`}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">Contratos</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {contratoLoading
                      ? 'Carregando contrato...'
                      : dadosContratos.contratoAtivo
                        ? (dadosContratos.contratoAtivo.idioma_contrato || 'N/A')
                        : 'Sem contrato ativo'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Status do Contrato</span>
                  <Badge className={`${getStatusBadgeColor(contratoLoading ? 'pendente' : (dadosContratos.contratoAtivo?.status_contrato || 'inativo'))} px-3 py-1`}>
                    {contratoLoading ? 'Carregando...' : (dadosContratos.contratoAtivo?.status_contrato || 'Sem contrato')}
                  </Badge>
                </div>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Plano Ativo</span>
                  <div className="font-bold text-lg text-[#111827] mt-1">{contratoLoading ? 'Carregando...' : (dadosContratos.contratoAtivo?.planos?.nome || 'Sem contrato ativo')}</div>
                </div>

                {/* Barra de Progresso do Contrato */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Progresso do Contrato</span>
                    <span className="text-sm font-bold text-[#111827]">
                      {contratoLoading ? '...' : (dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                        `${Math.round(((new Date().getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime())) * 100)}%` : 
                        '0%')
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: contratoLoading ? '0%' : (dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                        `${Math.min(100, Math.max(0, ((new Date().getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime())) * 100))}%` : 
                        '0%') } }
                    />
                  </div>
                </div>

                {/* Cards de Informações em Layout Vertical */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Data de Início</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">
                      {contratoLoading ? '...' : (dadosContratos.contratoAtivo?.data_inicio ? formatarData(dadosContratos.contratoAtivo.data_inicio) : 
                        'Não definido')
                      }
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Data de Fim</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">
                      {contratoLoading ? '...' : (dadosContratos.contratoAtivo?.data_fim ? formatarData(dadosContratos.contratoAtivo.data_fim) : 
                        'Indeterminado')
                      }
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Duração</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">
                      {contratoLoading ? '...' : (dadosContratos.contratoAtivo?.data_inicio && dadosContratos.contratoAtivo?.data_fim ? 
                        `${Math.ceil((new Date(dadosContratos.contratoAtivo.data_fim).getTime() - new Date(dadosContratos.contratoAtivo.data_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses` : 
                        'Não calculado')
                      }
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Total de Contratos</span>
                    </div>
                    <span className="font-semibold text-[#111827] text-sm">{contratoLoading ? '...' : dadosContratos.totalContratos}</span>
                  </div>
                </div>

                
              </div>
            </div>
          </div>

          {/* Cards secundários */}
          {showSecondary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Responsáveis */}
            <div 
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Responsáveis</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Responsável Principal</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{responsavel?.nome || 'Não informado'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Telefone Responsável</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{responsavel?.telefone ? formatPhone(responsavel.telefone) : 'Não informado'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Email Responsável</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{responsavel?.email || 'Não informado'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Parentesco</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">
                      {carregandoParentesco
                        ? 'Carregando...'
                        : alunosMesmoResponsavel.length > 0
                          ? alunosMesmoResponsavel.map(a => a.nome).join(', ')
                          : 'Nenhum outro aluno com este responsável'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horários & Frequência */}
            <div 
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Horários & Frequência</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Frequência</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">
                      {carregandoFaltas ? 'Carregando...' : 
                       faltasPeriodo ? `${faltasPeriodo.percentualPresenca.toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Horário das Aulas</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.horario || 'N/A'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Dias da Semana</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.dia_semana || 'N/A'}</div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Última Presença</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{ultimaPresenca || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>)}

          {/* Informações Acadêmicas */}
          {(() => {
            const perfStart = performance.now();
            const node = (
              <div 
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">Informações Acadêmicas</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Turma</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.nome || student.turmas?.nome || 'Sem turma'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Idioma</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{student.idioma || 'Não definido'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Nível</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.nivel || student.nivel || 'Não definido'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Período</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{periodoTexto}</div>
                  </div>
                  {faltasPeriodo?.periodoConfigurado ? (
                    <>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <span className="text-xs font-medium text-gray-600">Frequência</span>
                        <div className="font-semibold text-[#111827] text-sm mt-1">
                          {carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.percentualPresenca.toFixed(1)}%`}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <span className="text-xs font-medium text-gray-600">Faltas no Período</span>
                        <div className="font-semibold text-[#111827] text-sm mt-1">
                          {carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.totalFaltas}`}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <span className="text-xs font-medium text-gray-600">Presenças no Período</span>
                        <div className="font-semibold text-[#111827] text-sm mt-1">
                          {carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.totalPresencas}`}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <span className="text-xs font-medium text-gray-600">Aulas sem Registro</span>
                        <div className="font-semibold text-[#111827] text-sm mt-1">
                          {carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.aulasSemRegistro}`}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <span className="text-xs font-medium text-gray-600">Reposições</span>
                        <div className="font-semibold text-[#111827] text-sm mt-1">
                          {carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.totalReposicoes}`}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm col-span-2">
                      <span className="text-xs font-medium text-gray-600">Frequência & Faltas</span>
                      <div className="font-semibold text-[#111827] text-sm mt-1">
                        {turmaAtual ? 'Período não configurado' : 'Sem turma'}
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Horário</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.horario || 'N/A'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Dia da Semana</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.dia_semana || 'N/A'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Última Presença</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{ultimaPresenca || 'N/A'}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="text-xs font-medium text-gray-600">Professor</span>
                    <div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.professor || 'N/A'}</div>
                  </div>
                </div>

                {/* Observações Acadêmicas */}
                {(() => {
                  const perfStart = performance.now();
                  const obs = (
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Observações Acadêmicas</span>
                      </div>
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Digite observações acadêmicas relacionadas à matrícula ativa"
                          value={matriculaObservacoes}
                          onChange={(e) => setMatriculaObservacoes(e.target.value)}
                          disabled={!matriculaIdAtual}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={salvarObservacoesAcademicas}
                            disabled={!matriculaIdAtual || salvandoObservacoes}
                            className="bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700 rounded-lg shadow-sm"
                          >
                            {salvandoObservacoes ? 'Salvando...' : 'Salvar Observações'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                  const perfEnd = performance.now();
                  console.log('[PERF] ObservacoesSection TRUE render ms =', perfEnd - perfStart);
                  return obs;
                })()}
              </div>
            );
            const perfEnd = performance.now();
            console.log('[PERF] AcademicInfoSection TRUE render ms =', perfEnd - perfStart);
            return node;
          })()}

          {/* Desempenho Acadêmico */}
          {showSecondary && (() => {
            const perfStart = performance.now();
            const node3 = (
          <div 
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Desempenho Acadêmico</h3>
                {turmasAluno.length > 1 ? (
                  <div className="mt-2">
                    <Select value={turmaSelecionadaId || turmaAtual?.id || ''} onValueChange={(v) => setTurmaSelecionadaId(v)}>
                      <SelectTrigger className="w-60">
                        <SelectValue placeholder="Selecionar turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmasAluno.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">{turmaAtual?.nome || 'Sem turma'}</div>
                )}
              </div>
              <div className="ml-auto">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setHistoricoRows([]);
                    setHistoricoPage(0);
                    setHistoricoOpen(true);
                  }}
                  className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400"
                >
                  Histórico
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Prova Final</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500">Percentual</div>
                    <div className="font-bold text-2xl text-[#111827]">{carregandoProvaFinal ? '...' : (provaFinalInfo ? `${provaFinalInfo.percentual}%` : 'N/A')}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500">Acertos</div>
                    <div className="font-bold text-2xl text-[#111827]">{carregandoProvaFinal ? '...' : (provaFinalInfo ? `${provaFinalInfo.acertos}/${provaFinalInfo.total}` : 'N/A')}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="text-xs text-gray-500">Data</div>
                    <div className="font-semibold text-[#111827]">{carregandoProvaFinal ? '...' : (provaFinalInfo?.data ? formatarData(provaFinalInfo.data) : 'N/A')}</div>
                  </div>
                </div>
                <div className="text-xs mt-2 text-green-600 font-medium">{carregandoProvaFinal ? '' : (provaFinalInfo ? (provaFinalInfo.percentual < 50 ? 'Insuficiente' : provaFinalInfo.percentual < 70 ? 'Regular' : provaFinalInfo.percentual < 85 ? 'Bom' : 'Excelente') : 'Sem registro')}</div>
              </div>
            </div>

            {/* Habilidades por Área + Nota Geral lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-2 h-full">
                <h4 className="text-lg font-bold text-[#111827] mb-4">Habilidades por Área</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Speaking</span>
                      <span className="text-sm font-bold text-[#111827]">{carregandoNotas ? '...' : (() => { const v = notasCompetenciasMedia.Speaking ?? 0; return v != null ? v.toFixed(1) : 'N/A'; })()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${getBarGradient(notasCompetenciasMedia.Speaking ?? 0)} h-2 rounded-full`}
                        style={{ width: carregandoNotas ? '0%' : `${Math.round(((notasCompetenciasMedia.Speaking ?? 0)/5)*100)}%` }}
                      />
                    </div>
                  </div>
                  
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-gray-700">Listening</span>
                       <span className="text-sm font-bold text-[#111827]">{carregandoNotas ? '...' : (() => { const v = notasCompetenciasMedia.Listening ?? 0; return v != null ? v.toFixed(1) : 'N/A'; })()}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         className={`bg-gradient-to-r ${getBarGradient(notasCompetenciasMedia.Listening ?? 0)} h-2 rounded-full`} 
                         style={{ width: carregandoNotas ? '0%' : `${Math.round(((notasCompetenciasMedia.Listening ?? 0)/5)*100)}%` }}
                       />
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-gray-700">Reading</span>
                       <span className="text-sm font-bold text-[#111827]">{carregandoNotas ? '...' : (() => { const v = notasCompetenciasMedia.Reading ?? 0; return v != null ? v.toFixed(1) : 'N/A'; })()}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         className={`bg-gradient-to-r ${getBarGradient(notasCompetenciasMedia.Reading ?? 0)} h-2 rounded-full`} 
                         style={{ width: carregandoNotas ? '0%' : `${Math.round(((notasCompetenciasMedia.Reading ?? 0)/5)*100)}%` }}
                       />
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-gray-700">Writing</span>
                       <span className="text-sm font-bold text-[#111827]">{carregandoNotas ? '...' : (() => { const v = notasCompetenciasMedia.Writing ?? 0; return v != null ? v.toFixed(1) : 'N/A'; })()}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         className={`bg-gradient-to-r ${getBarGradient(notasCompetenciasMedia.Writing ?? 0)} h-2 rounded-full`} 
                         style={{ width: carregandoNotas ? '0%' : `${Math.round(((notasCompetenciasMedia.Writing ?? 0)/5)*100)}%` }}
                       />
                     </div>
                   </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Nota Geral</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">Calculado automaticamente</span>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-end justify-between">
                    <div className="font-bold text-3xl text-[#111827]">{carregandoNotas ? '...' : (notaGeralMedia != null ? notaGeralMedia.toFixed(1) : 'N/A')}</div>
                  </div>

                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${getBarGradient(notaGeralMedia ?? 0)} h-2 rounded-full`}
                        style={{ width: carregandoNotas ? '0%' : `${Math.round(((notaGeralMedia ?? 0)/5)*100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs font-medium mt-1 text-green-600">{carregandoNotas ? '' : (notaGeralMedia == null ? 'Sem avaliações no período' : (notaGeralMedia >= 4.5 ? 'Excelente' : notaGeralMedia >= 3.5 ? 'Bom' : notaGeralMedia >= 2.5 ? 'Regular' : notaGeralMedia >= 1.5 ? 'Baixo' : 'Muito Baixo'))}</div>
                </div>
              </div>
            </div>

            
          </div>
            );
            const perfEnd = performance.now();
            console.log('[PERF] DesempenhoSection TRUE render ms =', perfEnd - perfStart);
            return node3;
          })()}
          
          <Dialog open={historicoOpen} onOpenChange={setHistoricoOpen}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Histórico de Aulas Avaliativas</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                {historicoLoading && historicoRows.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">Carregando...</div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Listening</TableHead>
                          <TableHead>Speaking</TableHead>
                          <TableHead>Writing</TableHead>
                          <TableHead>Reading</TableHead>
                          <TableHead>Book</TableHead>
                          <TableHead>Turma</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicoRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">Sem registros</TableCell>
                          </TableRow>
                        ) : (
                          historicoRows.map((r, idx) => (
                            <TableRow key={`${r.data}-${idx}`}>
                              <TableCell>{formatDate(r.data)}</TableCell>
                              <TableCell>{r.listening != null ? r.listening.toFixed(1) : 'N/A'}</TableCell>
                              <TableCell>{r.speaking != null ? r.speaking.toFixed(1) : 'N/A'}</TableCell>
                              <TableCell>{r.writing != null ? r.writing.toFixed(1) : 'N/A'}</TableCell>
                              <TableCell>{r.reading != null ? r.reading.toFixed(1) : 'N/A'}</TableCell>
                              <TableCell>{r.book || 'N/A'}</TableCell>
                              <TableCell>{r.turma_nome_snapshot || 'N/A'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setHistoricoOpen(false)}
                        className="bg-neutral-100 hover:bg-neutral-200"
                      >
                        Fechar
                      </Button>
                      <Button
                        onClick={() => {
                          const id = deferredStudent?.id || student?.id;
                          if (!id) return;
                          const nextPage = historicoPage + 1;
                          setHistoricoPage(nextPage);
                          carregarHistorico(id, nextPage);
                        }}
                        disabled={historicoLoading}
                        className="bg-gray-700 hover:bg-gray-800 text-white"
                      >
                        {historicoLoading ? 'Carregando...' : 'Carregar mais'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};
 
 export default StudentDetailsModal;
