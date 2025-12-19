import React, { useState, useEffect, useDeferredValue, useTransition, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GraduationCap, X, AlertCircle, Award, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';
import { calcularFaltasPorPeriodo, type FaltasPorPeriodo } from '@/utils/faltasPorPeriodo';

interface Student {
  id: string;
  nome: string;
  status?: string;
  idioma?: string | null;
  nivel?: string | null;
  turmas?: { nome: string } | null;
}

interface StudentDetailsModalProfessorProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentDetailsModalProfessor: React.FC<StudentDetailsModalProfessorProps> = ({ isOpen, onClose, student }) => {
  const deferredStudent = useDeferredValue(student);
  const [isPending] = useTransition();
  const { toast } = useToast();

  const [faltasPeriodo, setFaltasPeriodo] = useState<FaltasPorPeriodo | null>(null);
  const [carregandoFaltas, setCarregandoFaltas] = useState(false);
  const [turmaAtual, setTurmaAtual] = useState<{ id: string; nome?: string | null; data_inicio?: string | null; data_fim?: string | null; horario?: string | null; dia_semana?: string | null; professor?: string | null; nivel?: string | null; } | null>(null);
  const [ultimaPresenca, setUltimaPresenca] = useState<string | null>(null);

  const [matriculaObservacoes, setMatriculaObservacoes] = useState<string>('');
  const [matriculaIdAtual, setMatriculaIdAtual] = useState<string | null>(null);
  const [salvandoObservacoes, setSalvandoObservacoes] = useState(false);

  const [carregandoProvaFinal, setCarregandoProvaFinal] = useState(false);
  const [provaFinalInfo, setProvaFinalInfo] = useState<{ acertos: number; total: number; percentual: number; data: string | null; observacao: string | null } | null>(null);
  const [carregandoNotas, setCarregandoNotas] = useState(false);
  const [notaGeralMedia, setNotaGeralMedia] = useState<number | null>(null);
  const [notasCompetenciasMedia, setNotasCompetenciasMedia] = useState<{ Listening?: number | null; Speaking?: number | null; Writing?: number | null; Reading?: number | null }>({});
  const [turmasAluno, setTurmasAluno] = useState<Array<{ id: string; nome: string; horario?: string | null; dias?: string | null }>>([]);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string | null>(null);

  const periodoTexto = React.useMemo(() => {
    if (turmaAtual?.data_inicio && turmaAtual?.data_fim) {
      return `${formatDate(turmaAtual.data_inicio)} — ${formatDate(turmaAtual.data_fim)}`;
    }
    return turmaAtual ? 'Período não configurado' : 'Sem turma';
  }, [turmaAtual]);

  const carregarProvaFinal = useCallback(async (alunoId: string, turmaId: string) => {
    try {
      setCarregandoProvaFinal(true);
      type ProvaFinalRow = { acertos: number | null; total_questoes: number | null; data_prova: string | null; observacao: string | null };
      type DatabaseExt = Database & { public: { Tables: Database['public']['Tables'] & { avaliacoes_prova_final: { Row: ProvaFinalRow } } } };
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

  const carregarFaltasPeriodoFn = useCallback(async (alunoId: string) => {
    if (!alunoId || !isOpen) return;
    try {
      setCarregandoFaltas(true);
      const { data: matriculas } = await supabase
        .from('view_alunos_turmas')
        .select('turma_id, data_matricula, matricula_status')
        .eq('aluno_id', alunoId)
        .ilike('matricula_status', 'ativo')
        .order('data_matricula', { ascending: false })
        .limit(1);
      const turmaId = matriculas?.[0]?.turma_id as string | undefined;
      if (!turmaId) {
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
      const resultado = await calcularFaltasPorPeriodo(alunoId, turmaId);
      setFaltasPeriodo(resultado);

      let presQuery = supabase
        .from('presencas')
        .select(`id, status, aulas!inner ( id, data, turma_id )`)
        .eq('aulas.turma_id', turmaId)
        .eq('aluno_id', alunoId)
        .eq('status', 'Presente');
      if (resultado.periodoInicio) presQuery = presQuery.gte('aulas.data', resultado.periodoInicio);
      if (resultado.periodoFim) presQuery = presQuery.lte('aulas.data', resultado.periodoFim);
      const { data: ultimas } = await presQuery.order('data', { ascending: false, foreignTable: 'aulas' }).limit(1);
      type LastPresRow = { aulas?: { data?: string | null } | null };
      const presDtRaw = ultimas && ultimas.length > 0 ? ((ultimas[0] as LastPresRow).aulas?.data ?? null) : null;
      setUltimaPresenca(presDtRaw ? formatDate(presDtRaw) : null);
    } finally {
      setCarregandoFaltas(false);
    }
  }, [isOpen]);

  const buscarTurmaAtual = useCallback(async (alunoId: string) => {
    if (!alunoId || !isOpen) return;
    const { data: viewData } = await supabase
      .from('view_alunos_turmas')
      .select('turma_id, turma_nome, turma_horario, turma_dias, data_matricula, matricula_status')
      .eq('aluno_id', alunoId)
      .ilike('matricula_status', 'ativo')
      .order('data_matricula', { ascending: false })
      .limit(1);
    const turmaId = viewData?.[0]?.turma_id as string | undefined;
    if (!turmaId) { setTurmaAtual(null); return; }
    const { data: turmaData } = await supabase
      .from('turmas')
      .select(`id, nome, data_inicio, data_fim, horario, dias_da_semana, nivel, professor_id, professores:professor_id ( id, nome )`)
      .eq('id', turmaId)
      .limit(1);
    const turma = turmaData?.[0];
    setTurmaAtual(turma ? {
      id: turma.id,
      nome: turma.nome ?? null,
      data_inicio: turma.data_inicio ?? null,
      data_fim: turma.data_fim ?? null,
      horario: turma.horario ?? null,
      dia_semana: turma.dias_da_semana ?? null,
      professor: turma?.professores?.nome ?? null,
      nivel: (turma as { nivel?: string | null }).nivel ?? null,
    } : null);
  }, [isOpen]);

  const buscarObservacoesAcademicas = useCallback(async (alunoId: string, turmaId?: string | null) => {
    if (!isOpen || !alunoId || !turmaId) { setMatriculaIdAtual(null); setMatriculaObservacoes(''); return; }
    const { data } = await supabase
      .from('aluno_turma')
      .select('id, observacoes')
      .eq('aluno_id', alunoId)
      .eq('turma_id', turmaId)
      .ilike('status', 'ativo')
      .order('data_matricula', { ascending: false })
      .limit(1);
    const m = data?.[0];
    setMatriculaIdAtual(m?.id ?? null);
    setMatriculaObservacoes(m?.observacoes ?? '');
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
      if (!turmaId) { setNotaGeralMedia(null); setNotasCompetenciasMedia({}); return; }
      const { data: turma } = await supabase
        .from('turmas')
        .select('data_inicio, data_fim')
        .eq('id', turmaId)
        .limit(1);
      const inicio = turma?.[0]?.data_inicio || viewData?.[0]?.data_matricula || null;
      const fim = turma?.[0]?.data_fim || null;
      const periodoInicio = inicio || new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().slice(0, 10);
      const periodoFim = fim || new Date().toISOString().slice(0, 10);
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
      const values = comps.map((c) => acc[c]?.count ? acc[c].sum / acc[c].count : null).filter((v): v is number => typeof v === 'number');
      const geral = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : null;
      setNotaGeralMedia(geral);
    } finally {
      setCarregandoNotas(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (!isOpen || !id) { setTurmaAtual(null); setFaltasPeriodo(null); setUltimaPresenca(null); return; }
    (async () => {
      await buscarTurmaAtual(id);
      await carregarFaltasPeriodoFn(id);
    })();
  }, [isOpen, deferredStudent?.id, student?.id, buscarTurmaAtual, carregarFaltasPeriodoFn]);

  useEffect(() => {
    const id = deferredStudent?.id || student?.id;
    if (!isOpen || !id) { setTurmasAluno([]); setTurmaSelecionadaId(null); return; }
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
      if (!turmaSelecionadaId) setTurmaSelecionadaId(turmaAtual?.id || lista[0]?.id || null);
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
          nivel: (turma as { nivel?: string | null }).nivel ?? null,
        });
      }
    })();
    buscarObservacoesAcademicas(id, turmaSelecionadaId);
  }, [isOpen, deferredStudent?.id, student?.id, turmaSelecionadaId, carregarNotasPorPeriodo, buscarObservacoesAcademicas, carregarProvaFinal]);

  useEffect(() => {
    if (deferredStudent?.id && turmaAtual?.id && isOpen) {
      buscarObservacoesAcademicas(deferredStudent.id, turmaAtual.id);
    }
  }, [deferredStudent?.id, turmaAtual?.id, isOpen, buscarObservacoesAcademicas]);

  if (!student) return null;

  const getBarGradient = (v: number) => {
    if (v <= 1) return 'from-red-500 to-red-600';
    if (v <= 2) return 'from-orange-400 to-amber-500';
    if (v <= 3) return 'from-yellow-400 to-amber-500';
    if (v <= 4) return 'from-green-500 to-green-600';
    return 'from-emerald-400 to-emerald-500';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo': return 'bg-green-500 text-white';
      case 'inativo': return 'bg-gray-500 text-white';
      case 'suspenso': return 'bg-yellow-500 text-white';
      case 'cancelado': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-md">
        <DialogHeader className="relative pb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-t-lg" />
          <div className="relative z-10 flex items-center justify-between text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-2">{student.nome}</DialogTitle>
                <Badge className={`${getStatusBadgeColor(student.status || 'ativo')} text-sm font-medium px-3 py-1`}>
                  {student.status || 'Ativo'}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full w-10 h-10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8 p-6">
          {/* Informações Acadêmicas */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Informações Acadêmicas</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Turma</span><div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.nome || student.turmas?.nome || 'Sem turma'}</div></div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Idioma</span><div className="font-semibold text-[#111827] text-sm mt-1">{student.idioma || 'Não definido'}</div></div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Nível</span><div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.nivel || student.nivel || 'Não definido'}</div></div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Período</span><div className="font-semibold text-[#111827] text-sm mt-1">{periodoTexto}</div></div>
              {faltasPeriodo?.periodoConfigurado ? (
                <>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Frequência</span><div className="font-semibold text-[#111827] text-sm mt-1">{carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.percentualPresenca.toFixed(1)}%`}</div></div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Faltas no Período</span><div className="font-semibold text-[#111827] text-sm mt-1">{carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.totalFaltas}`}</div></div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Presenças no Período</span><div className="font-semibold text-[#111827] text-sm mt-1">{carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.totalPresencas}`}</div></div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Aulas sem Registro</span><div className="font-semibold text-[#111827] text-sm mt-1">{carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.aulasSemRegistro}`}</div></div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Reposições</span><div className="font-semibold text-[#111827] text-sm mt-1">{carregandoFaltas ? 'Carregando...' : `${faltasPeriodo.totalReposicoes}`}</div></div>
                </>
              ) : (
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm col-span-2"><span className="text-xs font-medium text-gray-600">Frequência & Faltas</span><div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual ? 'Período não configurado' : 'Sem turma'}</div></div>
              )}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Horário</span><div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.horario || 'N/A'}</div></div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Dia da Semana</span><div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.dia_semana || 'N/A'}</div></div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Última Presença</span><div className="font-semibold text-[#111827] text-sm mt-1">{ultimaPresenca || 'N/A'}</div></div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><span className="text-xs font-medium text-gray-600">Professor</span><div className="font-semibold text-[#111827] text-sm mt-1">{turmaAtual?.professor || 'N/A'}</div></div>
            </div>

            {/* Observações Acadêmicas */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Observações Acadêmicas</span>
              </div>
              <div className="space-y-3">
                <Textarea placeholder="Digite observações acadêmicas relacionadas à matrícula ativa" value={matriculaObservacoes} onChange={(e) => setMatriculaObservacoes(e.target.value)} disabled={!matriculaIdAtual} />
                <div className="flex justify-end">
                  <Button onClick={salvarObservacoesAcademicas} disabled={!matriculaIdAtual || salvandoObservacoes} className="bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700 rounded-lg shadow-sm">
                    {salvandoObservacoes ? 'Salvando...' : 'Salvar Observações'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desempenho Acadêmico */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827]">Desempenho Acadêmico</h3>
                {turmasAluno.length > 1 ? (
                  <div className="mt-2">
                    <Select value={turmaSelecionadaId || turmaAtual?.id || ''} onValueChange={(v) => setTurmaSelecionadaId(v)}>
                      <SelectTrigger className="w-60"><SelectValue placeholder="Selecionar turma" /></SelectTrigger>
                      <SelectContent>
                        {turmasAluno.map((t) => (<SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">{turmaAtual?.nome || 'Sem turma'}</div>
                )}
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
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"><div className="text-xs text-gray-500">Percentual</div><div className="font-bold text-2xl text-[#111827]">{carregandoProvaFinal ? '...' : (provaFinalInfo ? `${provaFinalInfo.percentual}%` : 'N/A')}</div></div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"><div className="text-xs text-gray-500">Acertos</div><div className="font-bold text-2xl text-[#111827]">{carregandoProvaFinal ? '...' : (provaFinalInfo ? `${provaFinalInfo.acertos}/${provaFinalInfo.total}` : 'N/A')}</div></div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"><div className="text-xs text-gray-500">Data</div><div className="font-semibold text-[#111827]">{carregandoProvaFinal ? '...' : (provaFinalInfo?.data ? formatDate(provaFinalInfo.data) : 'N/A')}</div></div>
                </div>
                <div className="text-xs mt-2 text-green-600 font-medium">{carregandoProvaFinal ? '' : (provaFinalInfo ? (provaFinalInfo.percentual < 50 ? 'Insuficiente' : provaFinalInfo.percentual < 70 ? 'Regular' : provaFinalInfo.percentual < 85 ? 'Bom' : 'Excelente') : 'Sem registro')}</div>
              </div>
            </div>

            {/* Habilidades por Área + Nota Geral */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-2 h-full">
                <h4 className="text-lg font-bold text-[#111827] mb-4">Habilidades por Área</h4>
                <div className="space-y-4">
                  {(['Speaking','Listening','Reading','Writing'] as const).map((label) => {
                    const value = (notasCompetenciasMedia as any)[label] ?? 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <span className="text-sm font-bold text-[#111827]">{carregandoNotas ? '...' : (value != null ? Number(value).toFixed(1) : 'N/A')}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`bg-gradient-to-r ${getBarGradient(value ?? 0)} h-2 rounded-full`} style={{ width: carregandoNotas ? '0%' : `${Math.round(((value ?? 0)/5)*100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-[#111827]">Nota Geral</h4>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[220px] gap-3">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-extrabold text-3xl shadow-md">
                    {carregandoNotas ? '...' : (notaGeralMedia != null ? notaGeralMedia.toFixed(1) : 'N/A')}
                  </div>
                  <div className="text-base font-semibold text-green-600">
                    {carregandoNotas ? '' : (notaGeralMedia != null ? (notaGeralMedia < 2 ? 'Precisa melhorar' : notaGeralMedia < 3.5 ? 'Regular' : notaGeralMedia < 4.5 ? 'Bom' : 'Excelente') : 'Sem registros')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsModalProfessor;
