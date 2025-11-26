import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Edit, BookOpen, CheckCircle, X, UserCheck, UserX, RotateCcw, Save, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AulaAvaliativaModal } from '@/components/classes/AulaAvaliativaModal';
import { AulaProvaFinalModal } from '@/components/classes/AulaProvaFinalModal';

// Tipos simplificados para evitar recursão
interface AulaType {
  id: string;
  titulo: string | null;
  data: string;
  horario_inicio: string | null;
  horario_fim: string | null;
  descricao: string | null;
  conteudo: string | null;
  observacoes: string | null;
  status: string | null;
  turma_id: string;
  professor_id: string | null;
  created_at: string;
  updated_at: string;
  semestre: string | null;
  tipo_aula: 'normal' | 'avaliativa' | 'prova_final' | null;
}

interface TurmaSimplificada {
  id: string;
  nome: string;
  idioma: "Inglês" | "Japonês" | "Inglês/Japonês" | "particular";
  nivel: "Book 1" | "Book 2" | "Book 3" | "Book 4" | "Book 5" | "Book 6" | "Book 7" | "Book 8" | "Book 9" | "Book 10";
  cor_calendario: string;
  professor_id: string;
  total_aulas: number | null;
  professores: {
    id: string;
    nome: string;
  } | null;
}

interface AulaComTurma extends AulaType {
  turmas: TurmaSimplificada | null;
}

interface AlunoTurma {
  id: string;
  aluno_id: string;
  turma_id: string;
  alunos: {
    id: string;
    nome: string;
    cpf: string | null;
  };
}

interface PresencaRecord {
  id: string;
  aula_id: string;
  aluno_id: string | null;
  aluno_turma_id: string | null;
  status: 'Presente' | 'Falta' | 'Reposta';
  created_at: string;
  updated_at: string;
}

interface AulaDetailsModalProps {
  aula: AulaComTurma | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (aula: AulaComTurma) => void;
}

/**
 * Modal unificado de detalhes da aula
 * 
 * Funcionalidades:
 * - Visualização completa dos detalhes da aula
 * - Controle de presença dos alunos
 * - Edição da aula
 * - Interface responsiva e moderna
 */
const AulaDetailsModal: React.FC<AulaDetailsModalProps> = ({
  aula,
  isOpen,
  onClose,
  onEdit
}) => {
  // Guard: don't render modal content if no aula or not open
  if (!isOpen || !aula) {
    return null;
  }
  const [activeTab, setActiveTab] = useState('detalhes');
  const [alunosTurma, setAlunosTurma] = useState<AlunoTurma[]>([]);
  const [presencas, setPresencas] = useState<PresencaRecord[]>([]);
  const [presencasPendentes, setPresencasPendentes] = useState<{[alunoId: string]: 'Presente' | 'Falta' | 'Reposta' | null}>({});
  const [loading, setLoading] = useState(false);
  const [salvandoPresenca, setSalvandoPresenca] = useState(false);
  const [salvandoAlteracoes, setSalvandoAlteracoes] = useState(false);
  const [tipoAulaAtual, setTipoAulaAtual] = useState<'normal' | 'avaliativa' | 'prova_final'>('normal');
  const [alterandoTipoAula, setAlterandoTipoAula] = useState(false);
  const { toast } = useToast();

  // Estado derivado: há mudanças pendentes?
  const temAlteracoesPendentes = Object.keys(presencasPendentes).length > 0;

  // Inicializa tipo de aula atual a partir da aula recebida
  useEffect(() => {
    if (aula?.tipo_aula) {
      setTipoAulaAtual(aula.tipo_aula as 'normal' | 'avaliativa' | 'prova_final');
    } else {
      setTipoAulaAtual('normal');
    }
  }, [aula?.tipo_aula]);

  // Carregar alunos e presenças quando abrir o modal
  useEffect(() => {
    const loadData = async () => {
      if (!aula?.id || !aula?.turma_id) return;
      setLoading(true);
      await Promise.all([fetchAlunosTurma(), fetchPresencas()]);
      setLoading(false);
    };
    if (isOpen && aula) {
      loadData();
    }
  }, [isOpen, aula?.id, aula?.turma_id]);

  // Buscar alunos da turma com estratégia robusta (RPC -> View -> Tabela antiga)
  const fetchAlunosTurma = async () => {
    if (!aula?.turma_id) return;
    try {
      // 1) Tenta RPC dedicada
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_turma_alunos', { turma_uuid: aula.turma_id });
      let lista: AlunoTurma[] = [];
      if (!rpcError && rpcData && rpcData.length > 0) {
        lista = rpcData.map((d: any) => ({
          id: d.aluno_turma_id || d.matricula_id || d.aluno_id,
          aluno_id: d.aluno_id,
          turma_id: aula.turma_id,
          alunos: { id: d.aluno_id, nome: d.aluno_nome, cpf: d.aluno_cpf ?? null }
        }));
      }

      // 2) Fallback: view de matrículas
      if (lista.length === 0) {
        const { data: viewData, error: viewError } = await supabase
          .from('view_alunos_turmas')
          .select('aluno_id, aluno_nome, aluno_cpf')
          .eq('turma_id', aula.turma_id);
        if (!viewError && viewData) {
          lista = viewData.map((d: any) => ({
            id: d.aluno_id,
            aluno_id: d.aluno_id,
            turma_id: aula.turma_id,
            alunos: { id: d.aluno_id, nome: d.aluno_nome, cpf: d.aluno_cpf ?? null }
          }));
        }
      }

      // 3) Fallback: tabela antiga aluno_turma
      if (lista.length === 0) {
        const { data: legacyData, error: legacyError } = await supabase
          .from('aluno_turma')
          .select('id, aluno_id, turma_id, alunos(id, nome, cpf)')
          .eq('turma_id', aula.turma_id);
        if (!legacyError && legacyData) {
          lista = (legacyData as any[]).map((d) => ({
            id: d.id,
            aluno_id: d.aluno_id,
            turma_id: d.turma_id,
            alunos: d.alunos
          }));
        }
      }

      // 4) Fallback final: buscar diretamente na tabela alunos usando campos turma_id/turma_particular_id
      if (lista.length === 0) {
        const { data: turmaInfo, error: turmaError } = await supabase
          .from('turmas')
          .select('tipo_turma')
          .eq('id', aula.turma_id)
          .single();
        if (!turmaError && turmaInfo) {
          const isParticular = turmaInfo.tipo_turma === 'Turma particular';
          const { data: alunosDiretos, error: alunosError } = await supabase
            .from('alunos')
            .select('id, nome, cpf')
            .or(isParticular ? `turma_particular_id.eq.${aula.turma_id}` : `turma_id.eq.${aula.turma_id}`);
          if (!alunosError && alunosDiretos) {
            lista = (alunosDiretos as any[]).map((aluno) => ({
              id: aluno.id,
              aluno_id: aluno.id,
              turma_id: aula.turma_id,
              alunos: { id: aluno.id, nome: aluno.nome, cpf: aluno.cpf ?? null }
            }));
          }
        }
      }

      setAlunosTurma(lista);
    } catch (err) {
      console.error('Erro ao carregar alunos da turma:', err);
      toast({ title: 'Erro', description: 'Falha ao carregar alunos da turma', variant: 'destructive' });
    }
  };

  // Buscar presenças já registradas
  const fetchPresencas = async () => {
    if (!aula?.id) return;
    const { data, error } = await supabase
      .from('presencas')
      .select('*')
      .eq('aula_id', aula.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar presenças', variant: 'destructive' });
      return;
    }
    setPresencas((data || []) as unknown as PresencaRecord[]);
  };

  // Formatação de data
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return format(d, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  // Formatação de hora
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    // Se já estiver no formato HH:mm, mantém
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    try {
      const d = new Date(timeStr);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (e) {
      return timeStr;
    }
  };

  // Alterar tipo de aula no Supabase
  const alterarTipoAula = async (novoTipo: 'normal' | 'avaliativa' | 'prova_final') => {
    if (!aula?.id) return;
    try {
      setAlterandoTipoAula(true);
      const { error } = await supabase
        .from('aulas')
        .update({ tipo_aula: novoTipo })
        .eq('id', aula.id);
      if (error) throw error;
      setTipoAulaAtual(novoTipo);
      toast({ title: 'Tipo de aula atualizado', description: `Tipo alterado para ${novoTipo}` });
    } catch (e: any) {
      toast({ title: 'Erro ao alterar tipo', description: e.message || 'Falha ao salvar no banco', variant: 'destructive' });
    } finally {
      setAlterandoTipoAula(false);
    }
  };

  // Obter status de presença considerando alterações pendentes
  const getPresencaStatus = (alunoId: string) => {
    const pendente = presencasPendentes[alunoId];
    if (pendente) return pendente;
    const registro = presencas.find(p => p.aluno_id === alunoId);
    return registro?.status || null;
  };

  // Classes visuais por status
  const getStatusColor = (status: 'Presente' | 'Falta' | 'Reposta') => {
    switch (status) {
      case 'Presente':
        return 'bg-green-100 text-green-700';
      case 'Falta':
        return 'bg-red-100 text-red-700';
      case 'Reposta':
        return 'bg-blue-100 text-blue-700';
      default:
        return '';
    }
  };

  // Ícone por status
  const getStatusIcon = (status: 'Presente' | 'Falta' | 'Reposta') => {
    switch (status) {
      case 'Presente':
        return <UserCheck className="h-3 w-3" />;
      case 'Falta':
        return <UserX className="h-3 w-3" />;
      case 'Reposta':
        return <RotateCcw className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Marcar presença localmente (pendente)
  const marcarPresenca = (
    alunoId: string,
    alunoTurmaId: string,
    status: 'Presente' | 'Falta' | 'Reposta'
  ) => {
    setPresencasPendentes(prev => ({ ...prev, [alunoId]: status }));
  };

  // Limpar presença (pendente)
  const limparPresenca = (alunoId: string) => {
    setPresencasPendentes(prev => {
      const { [alunoId]: _, ...rest } = prev;
      return rest;
    });
  };

  // Persistir alterações de presença
  const salvarAlteracoes = async () => {
    if (!aula?.id) return;
    try {
      setSalvandoAlteracoes(true);
      // Para cada aluno alterado, insere/atualiza o registro
      for (const [alunoId, novoStatus] of Object.entries(presencasPendentes)) {
        // Buscar registro existente
        const { data: existentes, error: selectError } = await supabase
          .from('presencas')
          .select('*')
          .eq('aula_id', aula.id)
          .eq('aluno_id', alunoId)
          .limit(1);
        if (selectError) throw selectError;

        const existente = existentes?.[0] as PresencaRecord | undefined;

        if (!novoStatus) {
          // Se for limpeza, remove registro se existir
          if (existente?.id) {
            const { error: deleteError } = await supabase
              .from('presencas')
              .delete()
              .eq('id', existente.id);
            if (deleteError) throw deleteError;
          }
          continue;
        }

        if (existente?.id) {
          const { error: updateError } = await supabase
            .from('presencas')
            .update({ status: novoStatus })
            .eq('id', existente.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('presencas')
            .insert({ aula_id: aula.id, aluno_id: alunoId, status: novoStatus });
          if (insertError) throw insertError;
        }
      }

      // Recarregar lista e limpar pendências
      await fetchPresencas();
      setPresencasPendentes({});
      toast({ title: 'Presenças salvas', description: 'Alterações aplicadas com sucesso.' });
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message || 'Falha ao persistir presença', variant: 'destructive' });
    } finally {
      setSalvandoAlteracoes(false);
    }
  };

  // Verificar se é uma aula especial (avaliativa ou prova final)
  const isSpecialLesson = aula?.tipo_aula === 'avaliativa' || aula?.tipo_aula === 'prova_final';
  
  // Renderizar modal especial para aulas avaliativas e provas finais
  if (isSpecialLesson) {
    if (aula?.tipo_aula === 'avaliativa') {
      return (
        <AulaAvaliativaModal aula={aula} isOpen={isOpen} onClose={onClose} />
      );
    }
    return (
      <AulaProvaFinalModal aula={aula} isOpen={isOpen} onClose={onClose} />
    );
  }
  const tipoAula = aula?.tipo_aula === 'avaliativa' ? 'Avaliativa' : 'Prova Final';
  const corTema = aula?.tipo_aula === 'avaliativa' ? 'green' : 'blue';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
        <TooltipProvider>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full flex flex-col"
          >
            <DialogHeader className="pb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-[#D90429] to-[#B8001F] rounded-lg shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-[#D90429] to-[#B8001F] bg-clip-text text-transparent font-bold">
                  {aula?.titulo ?? 'Detalhes da Aula'}
                </span>
              </DialogTitle>
            </motion.div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-100 to-gray-200 p-0.5 rounded-lg border border-gray-300 shadow-lg backdrop-blur-sm">
              <TabsTrigger 
                value="detalhes" 
                className={cn(
                   "flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duração-300 ease-in-out transform",
                  "hover:scale-102 hover:shadow-md",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D90429] data-[state=active]:to-[#B8001F]",
                   "data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-102",
                   "data-[state=active]:ring-2 data-[state=active]:ring-[#D90429] data-[state=active]:ring-opacity-50",
                   "data-[state=active]:border data-[state=active]:border-[#B8001F]",
                  "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-[#D90429]",
                  "data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:shadow-sm"
                )}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookOpen className="h-4 w-4" />
                </motion.div>
                <span className="font-bold tracking-wide">Detalhes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="presenca" 
                className={cn(
                   "flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duração-300 ease-in-out transform",
                  "hover:scale-102 hover:shadow-md",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D90429] data-[state=active]:to-[#B8001F]",
                   "data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-102",
                   "data-[state=active]:ring-2 data-[state=active]:ring-[#D90429] data-[state=active]:ring-opacity-50",
                   "data-[state=active]:border data-[state=active]:border-[#B8001F]",
                  "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-[#D90429]",
                  "data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:shadow-sm"
                )}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="h-4 w-4" />
                </motion.div>
                <span className="font-bold tracking-wide">Presença</span>
                {temAlteracoesPendentes && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 h-2 w-2 bg-yellow-400 rounded-full shadow-sm"
                  />
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="detalhes" className="space-y-6 m-0">
                <motion.div
                  key="detalhes-tab"
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {/* Informações principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Status</label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <Badge 
                          variant={aula?.status === 'concluida' ? 'default' : 'secondary'}
                          className={`${
                            aula?.status === 'concluida' 
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                              : aula?.status === 'cancelada'
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                              : 'bg-gradient-to-r from-[#D90429] to-[#B8001F] text-white'
                          } font-medium px-3 py-1`}
                        >
                          {aula?.status ?? 'agendada'}
                        </Badge>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">{aula?.data ? formatDate(aula.data) : '-'}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horário
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">
                          {formatTime(aula?.horario_inicio ?? null)} - {formatTime(aula?.horario_fim ?? null)}
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Turma
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">{aula?.turmas?.nome ?? '-'}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Idioma/Nível</label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">
                          {aula?.turmas?.idioma ?? '-'} - {aula?.turmas?.nivel ?? '-'}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Professor</label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">
                          {aula?.turmas?.professores?.nome || 'Não definido'}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Tipo de Aula */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Tipo de Aula</label>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant={tipoAulaAtual === 'normal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => alterarTipoAula('normal')}
                        disabled={alterandoTipoAula}
                        className={cn(
                          "transition-all duration-200",
                          tipoAulaAtual === 'normal' 
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                            : "hover:bg-blue-50 hover:border-blue-300"
                        )}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Normal
                      </Button>
                      <Button
                        variant={tipoAulaAtual === 'avaliativa' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => alterarTipoAula('avaliativa')}
                        disabled={alterandoTipoAula}
                        className={cn(
                          "transition-all duration-200",
                          tipoAulaAtual === 'avaliativa' 
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" 
                            : "hover:bg-orange-50 hover:border-orange-300"
                        )}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Avaliativa
                      </Button>
                      <Button
                        variant={tipoAulaAtual === 'prova_final' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => alterarTipoAula('prova_final')}
                        disabled={alterandoTipoAula}
                        className={cn(
                          "transition-all duration-200",
                          tipoAulaAtual === 'prova_final' 
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" 
                            : "hover:bg-red-50 hover:border-red-300"
                        )}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Prova Final
                      </Button>
                    </div>
                  </motion.div>

                  {/* Conteúdo */}
                  {aula.conteudo && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Conteúdo</label>
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 leading-relaxed">{aula.conteudo}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Descrição */}
                  {aula.descricao && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Descrição</label>
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 leading-relaxed">{aula.descricao}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="presenca" className="space-y-6 m-0">
                <motion.div
                  key="presenca-tab"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Controle de Presença
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90429] mx-auto"></div>
                          <p className="text-gray-500 mt-2">Carregando alunos...</p>
                        </div>
                      ) : alunosTurma.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Nenhum aluno encontrado nesta turma</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {alunosTurma.map((alunoTurma) => {
                                const status = getPresencaStatus(alunoTurma.aluno_id);
                                return (
                                  <TableRow key={alunoTurma.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{alunoTurma.alunos.nome}</p>
                                        <p className="text-sm text-gray-500">{alunoTurma.alunos.cpf}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {status ? (
                                        <Badge className={cn(
                                          "flex items-center gap-1 w-fit",
                                          getStatusColor(status)
                                        )}>
                                          {getStatusIcon(status)}
                                          {status}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Não marcado</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant={status === 'Presente' ? 'default' : 'outline'}
                                              className={cn(
                                                "h-8 px-2",
                                                status === 'Presente' && "bg-green-600 hover:bg-green-700"
                                              )}
                                              onClick={() => marcarPresenca(alunoTurma.aluno_id, alunoTurma.id, 'Presente')}
                                              disabled={salvandoAlteracoes}
                                            >
                                              <UserCheck className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Marcar como presente</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant={status === 'Falta' ? 'default' : 'outline'}
                                              className={cn(
                                                "h-8 px-2",
                                                status === 'Falta' && "bg-red-600 hover:bg-red-700"
                                              )}
                                              onClick={() => marcarPresenca(alunoTurma.aluno_id, alunoTurma.id, 'Falta')}
                                              disabled={salvandoAlteracoes}
                                            >
                                              <UserX className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Marcar como falta</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant={status === 'Reposta' ? 'default' : 'outline'}
                                              className={cn(
                                                "h-8 px-2",
                                                status === 'Reposta' && "bg-blue-600 hover:bg-blue-700"
                                              )}
                                              onClick={() => marcarPresenca(alunoTurma.aluno_id, alunoTurma.id, 'Reposta')}
                                              disabled={salvandoAlteracoes}
                                            >
                                              <RotateCcw className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Marcar como reposta (falta justificada)</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        {status && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                                onClick={() => limparPresenca(alunoTurma.aluno_id)}
                                                disabled={salvandoAlteracoes}
                                              >
                                                <Eraser className="h-3 w-3" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Limpar presença</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          
                          {/* Botão de Salvar Alterações */}
                          {temAlteracoesPendentes && (
                            <motion.div 
                              className="flex justify-end mt-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={salvarAlteracoes}
                                    disabled={salvandoAlteracoes}
                                    className="bg-[#D90429] hover:bg-[#B8001F] text-white flex items-center gap-2"
                                  >
                                    {salvandoAlteracoes ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                      <Save className="h-4 w-4" />
                                    )}
                                    {salvandoAlteracoes ? 'Salvando...' : `Salvar ${Object.keys(presencasPendentes).length} Alteração(ões)`}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Salvar todas as alterações de presença</p>
                                </TooltipContent>
                              </Tooltip>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Ações */}
          <motion.div 
            className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Fechar
              </Button>
            </motion.div>
            
            {onEdit && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(aula)}
                  className="flex items-center gap-2 border-[#D90429] text-[#D90429] hover:bg-[#D90429] hover:text-white transition-all duração-300 shadow-lg hover:shadow-xl"
                >
                  <Edit className="h-4 w-4" />
                  Editar Aula
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};

export { AulaDetailsModal };