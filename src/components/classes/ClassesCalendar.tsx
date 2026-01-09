import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Plus, Filter, Search, Eye, Edit, Users, ChevronDown, Clock, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useMultipleSelection } from '@/hooks/useMultipleSelection';
import { MultipleSelectionBar } from '@/components/shared/MultipleSelectionBar';
import { useAulas } from '@/hooks/useAulas';
import { useAuth } from '@/hooks/useAuth';
import { AulaDetailsModal } from './AulaDetailsModal';
import { NewLessonDialog } from './NewLessonDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';

// Tipos para melhor organização e reutilização
type Turma = Tables<'turmas'>;
type Aula = Tables<'aulas'>;

interface TurmaSimplificada {
  id: string;
  nome: string;
  idioma: "Inglês" | "Japonês" | "Inglês/Japonês" | "particular";
  nivel: "Book 1" | "Book 2" | "Book 3" | "Book 4" | "Book 5" | "Book 6" | "Book 7" | "Book 8" | "Book 9" | "Book 10";
  cor_calendario: string;
  professor_id: string;
  total_aulas: number | null;
  tipo_turma?: "Turma" | "Turma particular" | null;
  professores: {
    id: string;
    nome: string;
  } | null;
}

  interface AulaComTurma extends Aula {
    turmas: TurmaSimplificada | null;
  }

/**
 * Componente de Calendário das Aulas
 * 
 * Funcionalidades:
 * - Visualização em calendário FullCalendar das aulas
 * - Filtros por turma, professor, idioma
 * - Busca por título/descrição
 * - Cores diferenciadas por idioma e nível
 * - Criação de novas aulas
 * - Modal de detalhes da aula
 * - Diferentes visualizações (mês, semana, dia)
 */
const ClassesCalendar = () => {
  // Estados principais
  const [aulas, setAulas] = useState<AulaComTurma[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    turmaId: '',
    professorId: '',
    idioma: '',
    status: ''
  });

  // Estados do modal
  const [selectedAula, setSelectedAula] = useState<AulaComTurma | null>(null);
  const [showAulaModal, setShowAulaModal] = useState(false);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [dayAulas, setDayAulas] = useState<AulaComTurma[]>([]);
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  
  // Estado para controlar o NewLessonDialog
  const [showNewLessonDialog, setShowNewLessonDialog] = useState(false);

  // Estado para controlar o toggle dos filtros
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Referência do calendário
  const calendarRef = useRef<FullCalendar>(null);
  const [currentViewType, setCurrentViewType] = useState<string>('dayGridMonth');
  const [currentViewDateStr, setCurrentViewDateStr] = useState<string>('');

  // Hook para detectar mobile
  const isMobile = useIsMobile();

  const { toast } = useToast();

  // Hook para gerenciar aulas
  const { excluirMultiplasAulas } = useAulas();
  const { user } = useAuth();
  const isProfessor = user?.cargo === 'Professor';

  const numeroAulaPorId = useMemo(() => {
    const seq = new Map<string, number>();
    const porTurma = new Map<string, AulaComTurma[]>();
    const sorted = [...aulas].sort((a, b) => {
      const da = a.data.localeCompare(b.data);
      if (da !== 0) return da;
      const ha = (a.horario_inicio || '').localeCompare(b.horario_inicio || '');
      return ha;
    });
    for (const aula of sorted) {
      if (!porTurma.has(aula.turma_id)) porTurma.set(aula.turma_id, []);
      porTurma.get(aula.turma_id)!.push(aula);
    }
    for (const [, lista] of porTurma.entries()) {
      let idx = 1;
      for (const aula of lista) {
        if (aula.status !== 'cancelada') {
          seq.set(aula.id, idx);
          idx += 1;
        }
      }
    }
    return seq;
  }, [aulas]);

  /**
   * Filtra as aulas baseado nos critérios selecionados
   */
  const filteredAulas = aulas.filter(aula => {
    const matchesSearch = !searchTerm || 
      aula.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aula.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTurma = !filters.turmaId || aula.turma_id === filters.turmaId;
    const matchesIdioma = !filters.idioma || aula.turmas?.idioma === filters.idioma;
    const matchesStatus = !filters.status || aula.status === filters.status;

    return matchesSearch && matchesTurma && matchesIdioma && matchesStatus;
  });

  // Hook para seleção múltipla
  const {
    selectedItems,
    isSelectionMode,
    isSelected,
    toggleSelection,
    clearSelection,
    selectAll,
    getSelectedItems,
    enterSelectionMode,
    exitSelectionMode
  } = useMultipleSelection<AulaComTurma>({
    items: filteredAulas,
    getItemId: (aula) => aula.id
  });

  /**
   * Carrega as aulas do banco de dados
   * Inclui relacionamento com turmas para obter informações de cor
  */
  const loadAulas = async () => {
    try {
      setLoading(true);
      let aulasQuery = supabase
        .from('aulas')
        .select(`
          *,
          turmas (
            id,
            nome,
            idioma,
            nivel,
            cor_calendario,
            professor_id,
            total_aulas,
            tipo_turma,
            professores (
              id,
              nome
            )
          )
        `)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });

      if (isProfessor) {
        const { data: minhasTurmas, error: turmasError } = await supabase
          .from('turmas')
          .select('id')
          .eq('professor_id', user.id);
        if (turmasError) throw turmasError;
        const turmaIds = (minhasTurmas || []).map(t => t.id);
        if (turmaIds.length === 0) {
          setAulas([]);
          setLoading(false);
          return;
        }
        aulasQuery = aulasQuery.in('turma_id', turmaIds);
      }

      const { data, error } = await aulasQuery;

      if (error) throw error;

      console.log('Aulas carregadas:', data?.length || 0);
      console.log('Dados das aulas:', data);
      setAulas(data || []);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as aulas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega as turmas para os filtros
   */
  const loadTurmas = async () => {
    try {
      let turmasQuery = supabase
        .from('turmas')
        .select(`
          *,
          professores (
            id,
            nome
          )
        `)
        .eq('status', 'ativa')
        .order('nome');

      if (isProfessor) {
        turmasQuery = turmasQuery.eq('professor_id', user.id);
      }

      const { data, error } = await turmasQuery;

      if (error) throw error;

      setTurmas(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  // Carrega dados iniciais
  useEffect(() => {
    loadAulas();
    loadTurmas();
  }, [user?.id]);

  console.log('Total de aulas:', aulas.length);
  console.log('Aulas filtradas:', filteredAulas.length);

  /**
   * Converte aulas em eventos do FullCalendar
   */
  const convertAulasToEvents = (): EventInput[] => {
    const buildSingleEvent = (aula: AulaComTurma) => {
      const startBase = aula.horario_inicio || null;
      const endBase = aula.horario_fim || null;
      const isDayView = currentViewType === 'timeGridDay';
      const visualEnd = isDayView ? addMinutesToTimeStr(startBase, 3) : endBase;
      const startTime = startBase ? `T${startBase}` : '';
      const endTime = visualEnd ? `T${visualEnd}` : '';
      const isSelectedItem = isSelected(aula);
      
      // Usar o nome da turma como título principal (sem abreviações)
      const nomeTurma = aula.turmas?.nome || 'Aula Particular';
      // Processar nome para melhor exibição sem truncar
      let nomeTurmaProcessado = nomeTurma;
      
      // Remove apenas palavras desnecessárias se o nome for muito longo
      if (nomeTurma.length > 35) {
        nomeTurmaProcessado = nomeTurma
          .replace(/\b(turma|classe|grupo)\s+/gi, '') // Remove palavras como "turma", "classe", "grupo"
          .replace(/\s+/g, ' ') // Remove espaços extras
          .trim();
      }
      
      const iconeAula = '';
      
      const numeroAula = numeroAulaPorId.get(aula.id);
      let tituloCompleto = `${isSelectedItem && isSelectionMode ? '✓ ' : ''}${nomeTurmaProcessado}`;
      
      // Sistema de cores simplificado baseado no idioma
      let backgroundColor = '#6B7280'; // Cor padrão (cinza)
      let borderColor = '#6B7280';
      
      // Definir cor base da turma
       const idioma = aula.turmas?.idioma;
       const tipoTurma = aula.turmas?.tipo_turma;
       console.log('Debug - Aula:', aula.id, 'Idioma:', idioma, 'Turma:', aula.turmas?.nome);
      // Detectar turma particular por tipo/idioma/nome
      const isParticularByType = tipoTurma === 'Turma particular';
      const isParticularByIdioma = idioma === 'particular';
      const isParticularByNome = /(^|\s)particular\s*-\s*/i.test(nomeTurma);
      const isParticular = isParticularByType || isParticularByIdioma || isParticularByNome;

      // Caso seja turma particular (independente do idioma), ajustar título e cor
      if (isParticular) {
        const rawName = aula.turmas?.nome || nomeTurmaProcessado;
        const pessoaNomeBase = rawName
          .replace(/^(?:particular|turma\s*particular)\s*-\s*/i, '')
          .trim() || rawName;
        const pessoaNome = pessoaNomeBase
          .replace(/,\s*das\s*\d{1,2}:\d{2}\s*às\s*\d{1,2}:\d{2}/i, '')
          .replace(/\s*-\s*das\s*\d{1,2}:\d{2}\s*às\s*\d{1,2}:\d{2}/i, '')
          .trim();
        const diaSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][new Date(aula.data).getDay()];
        const inicio = formatTime(aula.horario_inicio);
        const fim = formatTime(aula.horario_fim);
        tituloCompleto = `${isSelectedItem && isSelectionMode ? '✓ ' : ''}${pessoaNome} - ${diaSemana} - ${inicio} as ${fim}`;
        backgroundColor = 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 60%, #6D28D9 100%)';
        borderColor = '#7C3AED';
      } else {
        if (idioma === 'Inglês') {
          backgroundColor = 'linear-gradient(145deg, #3B82F6 0%, #1E40AF 60%, #1E3A8A 100%)';
          borderColor = '#1E40AF';
        } else if (idioma === 'Japonês') {
          backgroundColor = 'linear-gradient(145deg, #EF4444 0%, #DC2626 60%, #B91C1C 100%)';
          borderColor = '#DC2626';
        } else if (idioma === 'Inglês/Japonês') {
          backgroundColor = 'linear-gradient(145deg, #3B82F6 0%, #8B5CF6 50%, #EF4444 100%)';
          borderColor = '#8B5CF6';
        } else if (idioma === 'particular') {
          backgroundColor = 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 60%, #6D28D9 100%)';
          borderColor = '#7C3AED';
          const pessoaNome = nomeTurmaProcessado.replace(/^particular\s*-\s*/i, '').trim() || nomeTurmaProcessado;
          const diaSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][new Date(aula.data).getDay()];
          const inicio = formatTime(aula.horario_inicio);
          const fim = formatTime(aula.horario_fim);
          tituloCompleto = `${isSelectedItem && isSelectionMode ? '✓ ' : ''}${pessoaNome} - ${diaSemana} - ${inicio} as ${fim}`;
        }
      }
       
       if (idioma === 'Inglês') {
         backgroundColor = 'linear-gradient(145deg, #3B82F6 0%, #1E40AF 60%, #1E3A8A 100%)';
         borderColor = '#1E40AF';
       } else if (idioma === 'Japonês') {
         backgroundColor = 'linear-gradient(145deg, #EF4444 0%, #DC2626 60%, #B91C1C 100%)';
         borderColor = '#DC2626';
       } else if (idioma === 'Inglês/Japonês') {
         backgroundColor = 'linear-gradient(145deg, #3B82F6 0%, #8B5CF6 50%, #EF4444 100%)';
         borderColor = '#8B5CF6';
       } else if (idioma === 'particular') {
         backgroundColor = 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 60%, #6D28D9 100%)';
         borderColor = '#7C3AED';
       }
      
      // Aplicar cores especiais para tipos de aula
        if (aula.tipo_aula === 'avaliativa') {
          if (idioma === 'Inglês') {
            backgroundColor = 'linear-gradient(145deg, #10B981 0%, #059669 30%, #3B82F6 70%, #1E40AF 100%)';
          } else if (idioma === 'Japonês') {
            backgroundColor = 'linear-gradient(145deg, #10B981 0%, #059669 30%, #EF4444 70%, #DC2626 100%)';
          } else {
            backgroundColor = 'linear-gradient(145deg, #10B981 0%, #059669 60%, #6B7280 100%)';
          }
          borderColor = '#059669';
        } else if (aula.tipo_aula === 'prova_final') {
          if (idioma === 'Inglês') {
            backgroundColor = 'linear-gradient(145deg, #F59E0B 0%, #D97706 30%, #3B82F6 70%, #1E40AF 100%)';
          } else if (idioma === 'Japonês') {
            backgroundColor = 'linear-gradient(145deg, #F59E0B 0%, #D97706 30%, #EF4444 70%, #DC2626 100%)';
          } else {
            backgroundColor = 'linear-gradient(145deg, #F59E0B 0%, #D97706 60%, #6B7280 100%)';
          }
          borderColor = '#D97706';
        }
      
      // Se estiver selecionada no modo de seleção, usar cor vermelha
      if (isSelectedItem && isSelectionMode) {
        backgroundColor = '#DC2626';
        borderColor = '#B91C1C';
      }
      
      const eventObj = {
        id: aula.id,
        title: tituloCompleto,
        start: `${aula.data}${startTime}`,
        end: `${aula.data}${endTime}`,
        backgroundColor,
        borderColor,
        textColor: '#FFFFFF',
        classNames: ['custom-event-style'],
        extendedProps: {
          aula: aula,
          turma: aula.turmas?.nome,
          idioma: aula.turmas?.idioma,
          nivel: aula.turmas?.nivel,
          tipo_turma: aula.turmas?.tipo_turma,
          is_particular: isParticularByType || isParticularByIdioma || isParticularByNome,
          status: aula.status,
          descricao: aula.descricao,
          tipo_aula: aula.tipo_aula
        }
      };
      
      // Adiciona atributo data-idioma para CSS
      if (aula.turmas?.idioma) {
        if (isParticular) {
          eventObj.classNames.push('idioma-particular');
        } else {
          const idiomaClass = `idioma-${aula.turmas.idioma.replace('/', '-').toLowerCase()}`;
          eventObj.classNames.push(idiomaClass);
          console.log(`Evento ${aula.id}: idioma=${aula.turmas.idioma}, classe=${idiomaClass}, background=${backgroundColor}`);
        }
      }
      if (aula.tipo_aula === 'avaliativa') {
        eventObj.classNames.push('tipo-avaliativa');
      } else if (aula.tipo_aula === 'prova_final') {
        eventObj.classNames.push('tipo-prova-final');
      }
      
      return eventObj;
    };
    const eventsSingle = filteredAulas.map(aula => buildSingleEvent(aula));
    const viewType = calendarRef.current?.getApi()?.view?.type;
    if (viewType === 'dayGridMonth') {
      const groups = new Map<string, EventInput[]>();
      for (const ev of eventsSingle) {
        const a: AulaComTurma | undefined = (ev as any).extendedProps?.aula;
        const dateStr = (ev.start as string).slice(0, 10);
        const key = a ? `${a.turma_id}|${dateStr}` : `__noaula__|${dateStr}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(ev);
      }
      const aggregated: EventInput[] = [];
      for (const [, list] of groups.entries()) {
        if (list.length <= 1) {
          aggregated.push(list[0]);
        } else {
          const first = list[0];
          const a: AulaComTurma | undefined = (first as any).extendedProps?.aula;
          const count = list.length;
          const titleBase = first.title || (a?.turmas?.nome || 'Aulas');
          const title = `${titleBase} • ${count} aulas`;
          aggregated.push({
            id: String((first as any).id) + '_group',
            title,
            start: (first.start as string).slice(0, 10),
            end: (first.end as string).slice(0, 10),
            backgroundColor: (first as any).backgroundColor,
            borderColor: (first as any).borderColor,
            textColor: '#FFFFFF',
            classNames: ['custom-event-style'],
            extendedProps: {
              aulasList: list.map(ev => (ev as any).extendedProps?.aula),
              turma: (first as any).extendedProps?.turma,
              idioma: (first as any).extendedProps?.idioma,
              nivel: (first as any).extendedProps?.nivel,
              status: (first as any).extendedProps?.status
            }
          });
        }
      }
      console.log('Eventos convertidos (agrupados mês):', aggregated.length);
      return aggregated;
    }
    
    console.log('Eventos convertidos para o calendário:', eventsSingle.length);
    return eventsSingle;
  };

  /**
   * Função para excluir aulas selecionadas
   */
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;

    const selectedAulas = getSelectedItems();
    await excluirMultiplasAulas(Array.from(selectedItems).map(id => String(id)));
    
    // Remove as aulas excluídas do estado local
    setAulas(prev => prev.filter(aula => !selectedItems.has(aula.id)));
    clearSelection();
    exitSelectionMode();
    toast({
      title: 'Sucesso',
      description: `${selectedAulas.length} aula(s) excluída(s) com sucesso.`,
    });
  };

  /**
   * Handler para clique em evento (aula)
   */
  const handleEventClick = (clickInfo: EventClickArg) => {
    const ext = clickInfo.event.extendedProps as any;
    if (ext && ext.aulasList && Array.isArray(ext.aulasList)) {
      if (isSelectionMode) return;
      const dateStr = (clickInfo.event.startStr || '').slice(0, 10);
      setSelectedDayStr(dateStr || null);
      const sameDay = (ext.aulasList as AulaComTurma[]).slice().sort((a, b) => {
        const ha = (a.horario_inicio || '').localeCompare(b.horario_inicio || '');
        if (ha !== 0) return ha;
        return (a.horario_fim || '').localeCompare(b.horario_fim || '');
      });
      setDayAulas(sameDay);
      setShowDaySelector(true);
      return;
    }
    const aulaId = clickInfo.event.id;
    const aula = aulas.find(a => a.id === aulaId);
    
    if (aula) {
      if (isSelectionMode) {
        // No modo de seleção, apenas seleciona/deseleciona a aula
        toggleSelection(aula);
      } else {
        // No modo normal, abre o modal de detalhes
        setSelectedAula(aula);
        setShowAulaModal(true);
      }
    }
  };

  const handleDateClick = (arg: DateClickArg) => {
    if (isSelectionMode) return;
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView('timeGridDay', arg.date);
      const d = new Date(arg.date);
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      setCurrentViewType('timeGridDay');
      setCurrentViewDateStr(ds);
    }
  };

  const handleDatesSet = (arg: any) => {
    const vt = arg?.view?.type || currentViewType;
    setCurrentViewType(vt);
    if (vt === 'timeGridDay') {
      const ds = (arg?.startStr || '').slice(0, 10);
      setCurrentViewDateStr(ds);
    } else {
      setCurrentViewDateStr('');
    }
  };

  /**
   * Handler para seleção de data (criar nova aula)
   */
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // TODO: Implementar modal de criação de aula
    toast({
      title: 'Nova Aula',
      description: `Criar aula para ${selectInfo.startStr}`,
    });
  };

  /**
   * Formata a data para exibição
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Formata o horário para exibição
   */
  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.substring(0, 5); // Remove segundos se houver
  };
  const addMinutesToTimeStr = (time: string | null, minutes: number) => {
    if (!time) return null;
    const m = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return time;
    const h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ss = m[3] ? parseInt(m[3], 10) : 0;
    const total = h * 60 + mm + minutes;
    const nh = Math.floor(total / 60);
    const nmm = total % 60;
    return `${String(nh).padStart(2, '0')}:${String(nmm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-64 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <motion.div 
            className="w-12 h-12 border-4 border-gray-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#D90429] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-r from-[#D90429] to-[#B8001F] rounded-full opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-lg font-semibold text-[#D90429]">Carregando calendário...</p>
          <p className="text-sm text-gray-600">Aguarde enquanto buscamos suas aulas</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header com controles - Otimizado para mobile */}
      <div className={cn(
        "flex gap-4 items-start justify-between",
        isMobile ? "flex-col space-y-4" : "flex-row items-center"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 bg-[#D90429]/10 rounded-lg",
            isMobile && "p-1.5"
          )}>
            <Calendar className={cn(
              "text-[#D90429]",
              isMobile ? "h-5 w-5" : "h-6 w-6"
            )} />
          </div>
          <div>
            <h2 className={cn(
              "font-bold text-gray-900",
              isMobile ? "text-xl" : "text-2xl"
            )}>Calendário de Aulas</h2>
            <p className={cn(
              "text-gray-600",
              isMobile ? "text-xs" : "text-sm"
            )}>Visualize e gerencie suas aulas</p>
          </div>
        </div>
        
        {/* Botões de controle */}
        <div className={cn(
          "flex gap-2",
          isMobile ? "flex-col w-full" : "flex-row"
        )}>
          <Button
             variant={isSelectionMode ? "destructive" : "outline"}
             size={isMobile ? "default" : "sm"}
             onClick={isSelectionMode ? exitSelectionMode : enterSelectionMode}
             className={cn(
               "transition-all duration-200",
               isMobile ? "w-full h-12 text-base" : "h-9",
               isSelectionMode 
                 ? "bg-red-600 hover:bg-red-700 text-white" 
                 : "border-red-200 text-red-600 hover:bg-red-50"
             )}
           >
            <Trash2 className={cn(
              "mr-2",
              isMobile ? "h-5 w-5" : "h-4 w-4"
            )} />
            {isSelectionMode ? 'Cancelar Seleção' : 'Excluir Aulas'}
          </Button>
          
          <Button
            variant="default"
            size={isMobile ? "default" : "sm"}
            onClick={() => setShowNewLessonDialog(true)}
            className={cn(
              "bg-[#D90429] hover:bg-[#B8001F] text-white transition-all duration-200",
              isMobile ? "w-full h-12 text-base" : "h-9"
            )}
          >
            <Plus className={cn(
              "mr-2",
              isMobile ? "h-5 w-5" : "h-4 w-4"
            )} />
            Nova Aula
          </Button>
        </div>

      </div>

      {/* Filtros e busca - Otimizado para mobile */}
      <Card className={cn(
        "border-0 shadow-md",
        isMobile && "mx-2"
      )}>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className={cn(
              "cursor-pointer hover:bg-gray-50 transition-colors",
              isMobile ? "p-4" : "p-6"
            )}>
              <CardTitle className={cn(
                "flex items-center justify-between",
                isMobile ? "text-base" : "text-lg"
              )}>
                <div className="flex items-center gap-2">
                  <Filter className={cn(
                    "text-[#D90429]",
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                  <span className={isMobile ? "text-sm" : ""}>Filtros de Busca</span>
                </div>
                <motion.div
                  animate={{ rotate: filtersOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={cn(
                    "text-gray-500",
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </motion.div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className={isMobile ? "p-4" : "p-6"}>
              <div className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1 space-y-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
              )}>
                {/* Busca */}
                <div className="relative">
                  <Search className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
                    isMobile ? "h-4 w-4" : "h-4 w-4"
                  )} />
                  <Input
                    placeholder="Buscar aulas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      "pl-10",
                      isMobile && "h-12 text-base rounded-xl"
                    )}
                  />
                </div>

                {/* Filtro por turma */}
                <select
                  value={filters.turmaId}
                  onChange={(e) => setFilters(prev => ({ ...prev, turmaId: e.target.value }))}
                  className={cn(
                    "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D90429] transition-all duration-200",
                    isMobile && "h-12 text-base rounded-xl"
                  )}
                >
                  <option value="">Todas as turmas</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </select>

                {/* Filtro por idioma */}
                <select
                  value={filters.idioma}
                  onChange={(e) => setFilters(prev => ({ ...prev, idioma: e.target.value }))}
                  className={cn(
                    "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D90429] transition-all duration-200",
                    isMobile && "h-12 text-base rounded-xl"
                  )}
                >
                  <option value="">Todos os idiomas</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Japonês">Japonês</option>
                  <option value="Inglês/Japonês">Inglês/Japonês</option>
                  <option value="particular">Particular</option>
                </select>

                {/* Filtro por status */}
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className={cn(
                    "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D90429] transition-all duration-200",
                    isMobile && "h-12 text-base rounded-xl"
                  )}
                >
                  <option value="">Todos os status</option>
                  <option value="agendada">Agendada</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>

                {/* Botão limpar filtros */}
                <Button
                  variant="outline"
                  className={cn(
                    "border-[#D90429] text-[#D90429] hover:bg-[#D90429] hover:text-white transition-all duration-200",
                    isMobile && "h-12 text-base rounded-xl w-full"
                  )}
                  onClick={() => {
                    setFilters({ turmaId: '', professorId: '', idioma: '', status: '' });
                    setSearchTerm('');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Legenda das cores */}
      <Card className="shadow-sm border border-gray-200 mb-4">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda das Cores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Idiomas */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-600">Idiomas:</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background: 'linear-gradient(135deg, #1E40AF 0%, #0F172A 50%, #000000 100%)'}}></div>
                <span>Inglês</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 50%, #450A0A 100%)'}}></div>
                <span>Japonês</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)'}}></div>
                <span>Particular</span>
              </div>
            </div>
            
            {/* Tipos de Aula */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-600">Tipos de Aula:</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background: 'linear-gradient(135deg, #3B82F6, #1E40AF)'}}></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background: 'linear-gradient(90deg, #16A34A 50%, #3B82F6 50%)'}}></div>
                <span>📝 Avaliativa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{background: 'linear-gradient(90deg, #8B5CF6 50%, #3B82F6 50%)'}}></div>
                <span>🎯 Prova Final</span>
              </div>
            </div>
            
            {/* Informações adicionais */}
            <div className="space-y-2 md:col-span-2">
              <h4 className="font-medium text-gray-600">Informações:</h4>
              <p className="text-gray-500">• Aulas avaliativas e provas finais combinam a cor do tipo com a cor do idioma</p>
              <p className="text-gray-500">• Máximo de 2 eventos por dia são exibidos diretamente</p>
              <p className="text-gray-500">• Clique em "mais eventos" para ver aulas adicionais</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendário FullCalendar - Otimizado para mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "w-full",
          isMobile ? "mx-2" : ""
        )}
      >
        <Card className={cn(
          "border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 w-full",
          isMobile && "rounded-xl"
        )}>
          <CardContent className={cn(
            "w-full",
            isMobile ? "p-3" : "p-0"
          )}>
            <style key={`calendar-styles-${Date.now()}`}>{`
              /* Customização do FullCalendar com tema - Largura total - Updated */
              .fc {
                font-family: inherit;
                width: 100% !important;
                max-width: 100% !important;
              }
              
              .fc-view-harness {
                width: 100% !important;
                max-width: 100% !important;
              }
              
              .fc-daygrid {
                width: 100% !important;
                table-layout: fixed !important;
              }
              
              .fc-scrollgrid {
                width: 100% !important;
                max-width: 100% !important;
              }
              
              .fc-scrollgrid-sync-table {
                width: 100% !important;
              }
              
              /* Header do calendário */
              .fc-header-toolbar {
                margin-bottom: ${isMobile ? '1rem' : '1.5rem'} !important;
                padding: ${isMobile ? '0.75rem' : '1rem'};
                background: linear-gradient(135deg, #D90429 0%, #B8001F 100%);
                border-radius: ${isMobile ? '8px' : '12px'};
                box-shadow: 0 4px 20px rgba(217, 4, 41, 0.3);
                ${isMobile ? 'flex-direction: column !important; gap: 0.5rem !important;' : ''}
              }
              
              .fc-toolbar-title {
                color: white !important;
                font-size: ${isMobile ? '1.25rem' : '1.5rem'} !important;
                font-weight: 700 !important;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                ${isMobile ? 'text-align: center !important; margin-bottom: 0.5rem !important;' : ''}
              }
              
              /* Botões do calendário */
              .fc-button {
                background: rgba(255, 255, 255, 0.2) !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                color: white !important;
                border-radius: ${isMobile ? '6px' : '8px'} !important;
                font-weight: 500 !important;
                transition: all 0.3s ease !important;
                backdrop-filter: blur(10px);
                ${isMobile ? 'min-height: 36px !important; font-size: 0.875rem !important; padding: 0.25rem 0.5rem !important;' : ''}
              }
              
              /* Mobile: Reorganizar botões */
              ${isMobile ? `
              .fc-toolbar-chunk {
                display: flex !important;
                justify-content: center !important;
                gap: 0.25rem !important;
              }
              
              .fc-button-group {
                gap: 0.25rem !important;
              }
              ` : ''}
              
              .fc-button:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              }
              
              .fc-button-active {
                background: rgba(255, 255, 255, 0.4) !important;
                border-color: rgba(255, 255, 255, 0.6) !important;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              
              /* Grid do calendário */
              .fc-daygrid-day {
                transition: all 0.3s ease;
                ${isMobile ? 'min-height: 60px !important;' : ''}
              }
              
              .fc-daygrid-day:hover {
                background-color: rgba(217, 4, 41, 0.05) !important;
                ${isMobile ? '' : 'transform: scale(1.02);'}
              }
              
              /* Cabeçalho dos dias */
              .fc-col-header-cell {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
                border-color: #dee2e6 !important;
                font-weight: 600 !important;
                color: #495057 !important;
                padding: ${isMobile ? '8px 4px' : '12px 8px'} !important;
              }
              
              .fc-col-header-cell-cushion {
                color: #D90429 !important;
                font-weight: 700 !important;
                text-transform: uppercase;
                font-size: ${isMobile ? '0.625rem' : '0.75rem'};
                letter-spacing: 0.5px;
              }
              
              /* Números dos dias */
              .fc-daygrid-day-number {
                color: #374151 !important;
                font-weight: 600 !important;
                padding: ${isMobile ? '4px' : '8px'} !important;
                transition: all 0.3s ease;
                font-size: ${isMobile ? '0.875rem' : '1rem'} !important;
              }
              
              .fc-day-today .fc-daygrid-day-number {
                background: linear-gradient(135deg, #D90429 0%, #B8001F 100%) !important;
                color: white !important;
                border-radius: 50% !important;
                width: ${isMobile ? '24px' : '32px'} !important;
                height: ${isMobile ? '24px' : '32px'} !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: ${isMobile ? '2px' : '4px'} !important;
                box-shadow: 0 4px 12px rgba(217, 4, 41, 0.4);
                animation: pulse 2s infinite;
                font-size: ${isMobile ? '0.75rem' : '0.875rem'} !important;
              }
              
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              
              /* Eventos */
              .fc-event,
              .custom-event-style {
                border-radius: ${isMobile ? '10px' : '12px'} !important;
                border: 2px solid rgba(255,255,255,0.2) !important;
                padding: ${isMobile ? '6px 8px' : '8px 12px'} !important;
                margin: ${isMobile ? '1px 0' : '2px 0'} !important;
                font-weight: 600 !important;
                font-size: ${isMobile ? '0.6875rem' : '0.8125rem'} !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                cursor: pointer !important;
                backdrop-filter: blur(8px) !important;
                position: relative !important;
                ${isMobile ? 'min-height: 42px !important;' : 'min-height: 48px !important;'}
                overflow: visible !important;
              }
              
              .fc-event:hover,
              .custom-event-style:hover {
                ${isMobile ? '' : 'transform: translateY(-3px) scale(1.02) !important;'}
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.15) !important;
                border: 2px solid rgba(255,255,255,0.4) !important;
                z-index: 10 !important;
              }
              
              .fc-event::before,
              .custom-event-style::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%) !important;
                border-radius: inherit !important;
                pointer-events: none !important;
                z-index: 1 !important;
              }
              
              .fc-event-title,
               .fc-event-time {
                 position: relative !important;
                 z-index: 2 !important;
               }
               
               /* Força aplicação dos backgrounds */
               .fc-event[style*="background"] {
                 background-image: var(--bg-gradient) !important;
               }
               
               /* Estilos específicos por idioma */
                .fc-event.idioma-inglês {
                  background: linear-gradient(145deg, #3B82F6 0%, #1E40AF 60%, #1E3A8A 100%) !important;
                  border-color: #1E40AF !important;
                }
                
                .fc-event.idioma-japonês {
                  background: linear-gradient(145deg, #EF4444 0%, #DC2626 60%, #B91C1C 100%) !important;
                  border-color: #DC2626 !important;
                }
                
                .fc-event.idioma-inglês-japonês {
                  background: linear-gradient(145deg, #3B82F6 0%, #8B5CF6 50%, #EF4444 100%) !important;
                  border-color: #8B5CF6 !important;
                }
                
                .fc-event.idioma-particular {
                  background: linear-gradient(145deg, #7C3AED 0%, #6D28D9 60%, #5B21B6 100%) !important;
                  border-color: #5B21B6 !important;
                }
              
              .fc-event-title {
                font-weight: 600 !important;
                font-size: ${isMobile ? '0.625rem' : '0.875rem'} !important;
                line-height: ${isMobile ? '1.2' : '1.4'} !important;
                padding-left: ${isMobile ? '36px' : '42px'} !important;
              }
              .custom-event-style .aula-numero-badge {
                position: absolute !important;
                left: 0 !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: ${isMobile ? '22px' : '24px'} !important;
                height: ${isMobile ? '22px' : '24px'} !important;
                border-radius: 9999px !important;
                background: linear-gradient(135deg, #D90429 0%, #B8001F 100%) !important;
                color: #fff !important;
                font-weight: 700 !important;
                font-size: ${isMobile ? '12px' : '12px'} !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 3px 8px rgba(0,0,0,0.25) !important;
                z-index: 4 !important;
              }
              .custom-event-style.edge-left .aula-numero-badge {
                left: 6px !important;
                right: auto !important;
                top: -14px !important;
                transform: none !important;
              }
              .custom-event-style.edge-left .fc-event-title {
                padding-left: ${isMobile ? '8px' : '12px'} !important;
              }
              .custom-event-style .aula-numero-badge.badge-blue {
                background: linear-gradient(145deg, #3B82F6 0%, #1E40AF 60%, #1E3A8A 100%) !important;
                box-shadow: 0 3px 8px rgba(30,64,175,0.25) !important;
              }
              .custom-event-style.tipo-avaliativa::after {
                content: 'Aula Avaliativa';
                position: absolute;
                top: -8px;
                right: -8px;
                background: #059669;
                color: #fff;
                font-weight: 700;
                border-radius: 9999px;
                font-size: 12px;
                padding: 3px 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                z-index: 3;
              }
              .custom-event-style.tipo-prova-final::after {
                content: 'Prova Final';
                position: absolute;
                top: -8px;
                right: -8px;
                background: #7C3AED;
                color: #fff;
                font-weight: 700;
                border-radius: 9999px;
                font-size: 12px;
                padding: 3px 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                z-index: 3;
              }
              
              /* Bordas das células */
              .fc-daygrid-day {
                border-color: #e5e7eb !important;
              }
              
              /* Fim de semana */
              .fc-day-sat, .fc-day-sun {
                background-color: rgba(217, 4, 41, 0.02) !important;
              }
              
              /* Mais eventos */
              .fc-daygrid-more-link {
                color: #D90429 !important;
                font-weight: 600 !important;
                background: rgba(217, 4, 41, 0.1) !important;
                border-radius: 4px !important;
                padding: 2px 6px !important;
                transition: all 0.3s ease !important;
                font-size: ${isMobile ? '0.625rem' : '0.75rem'} !important;
              }
              
              .fc-daygrid-more-link:hover {
                background: rgba(217, 4, 41, 0.2) !important;
                transform: scale(1.05);
              }
              
              /* Popover de eventos */
              .fc-popover {
                border: none !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
                border-radius: 12px !important;
                overflow: hidden;
              }
              
              .fc-popover-header {
                background: linear-gradient(135deg, #D90429 0%, #B8001F 100%) !important;
                color: white !important;
                font-weight: 600 !important;
                padding: 12px 16px !important;
              }
              
              /* Animação de entrada para eventos */
              .fc-event {
                animation: eventFadeIn 0.5s ease-out;
              }
              
              @keyframes eventFadeIn {
                from {
                  opacity: 0;
                  transform: translateY(10px) scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              
              /* Loading state */
              .fc-loading {
                position: relative;
              }
              
              .fc-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 32px;
                height: 32px;
                margin: -16px 0 0 -16px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #D90429;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              
              /* Estilos customizados para eventos do calendário - Máximo aproveitamento sem abreviações */
              .fc-event {
                border-radius: 2px !important;
                border: none !important;
                padding: 1px 2px !important;
                font-weight: 500 !important;
                font-size: ${isMobile ? '8px' : '9px'} !important;
                line-height: 1.1 !important;
                min-height: ${isMobile ? '30px' : '40px'} !important;
                max-height: ${isMobile ? '45px' : '55px'} !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
              
              .fc-event-title {
                text-align: center !important;
                display: flex !important;
                width: 100% !important;
                height: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                white-space: normal !important;
                overflow: hidden !important;
                word-wrap: break-word !important;
                hyphens: auto !important;
                font-weight: 600 !important;
                letter-spacing: 0.1px !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
              }
              
              .fc-daygrid-event {
                margin: 1px !important;
                border-radius: 6px !important;
              }
              
              .fc-event:hover {
                opacity: 0.9 !important;
                transform: scale(1.01) !important;
                transition: all 0.2s ease !important;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2) !important;
              }
              
              /* Melhor aproveitamento do espaço vertical */
              .fc-daygrid-day-events {
                margin-top: 2px !important;
              }
              
              .fc-daygrid-event-harness {
                margin-bottom: 1px !important;
              }
            `}</style>
            
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={convertAulasToEvents()}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              datesSet={handleDatesSet}
              select={handleDateSelect}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={2}
              weekends={true}
              height="auto"
              locale="pt-br"
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
              }}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              eventDisplay="block"
              displayEventTime={false}
              slotEventOverlap={false}
              dayHeaderFormat={{ weekday: 'short' }}
              eventDidMount={(info) => {
                const status = info.event.extendedProps.status;
                const base = `${info.event.extendedProps.turma}\nStatus: ${status}\nIdioma: ${info.event.extendedProps.idioma}\nNível: ${info.event.extendedProps.nivel}`;
                const ext: any = info.event.extendedProps || {};
                let numero = numeroAulaPorId.get(String(info.event.id));
                let aggregatedNums: string | null = null;
                if (Array.isArray(ext.aulasList) && ext.aulasList.length > 1) {
                  const nums = ext.aulasList
                    .map((a: any) => numeroAulaPorId.get(String(a.id)))
                    .filter((n: number | undefined) => typeof n === 'number')
                    .sort((a: number, b: number) => a - b);
                  if (nums.length > 0) {
                    aggregatedNums = nums.join(' / ');
                  }
                }
                info.el.setAttribute('title', aggregatedNums ? `${base}\nAulas: ${aggregatedNums}` : (numero ? `${base}\nAula: ${numero}` : base));
                const startDate = info.event.start;
                if (startDate && startDate.getDay() === 0) {
                  info.el.classList.add('edge-left');
                }
                if (startDate && startDate.getHours && startDate.getHours() === 7 && calendarRef.current?.getApi()?.view?.type === 'timeGridDay') {
                  info.el.classList.add('start-first-hour');
                }
              const idioma = info.event.extendedProps.idioma;
              const badge = document.createElement('div');
              badge.className = 'aula-numero-badge';
              if (idioma === 'Japonês') {
                badge.classList.add('badge-blue');
              }
              if (aggregatedNums) {
                badge.textContent = aggregatedNums;
                badge.style.fontWeight = '700';
              } else if (numero) {
                badge.textContent = String(numero);
              }
              if (aggregatedNums || numero) {
                info.el.appendChild(badge);
              }
                if (status === 'concluida') {
                  info.el.style.opacity = '0.4';
                } else {
                  info.el.style.opacity = '1';
                }
              }}
            />
            <style>{`
              .fc-timegrid-event {
                min-height: 28px !important;
                margin: 2px 2px !important;
              }
              .fc-timegrid-event .fc-event-main {
                padding: 4px 8px !important;
                font-size: 13px !important;
                line-height: 1.2 !important;
              }
              .fc-timegrid-event-harness {
                margin-bottom: 3px !important;
              }
              .custom-event-style.start-first-hour .aula-numero-badge {
                top: 8px !important;
                transform: translate(-50%, 0) !important;
              }
            `}</style>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showDaySelector} onOpenChange={setShowDaySelector}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDayStr ? `Aulas em ${formatDate(selectedDayStr)}` : 'Aulas do dia'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dayAulas.map((a) => {
              const tipo =
                a.tipo_aula === 'avaliativa'
                  ? 'Avaliativa'
                  : a.tipo_aula === 'prova_final'
                  ? 'Prova Final'
                  : 'Normal';
              const inicio = formatTime(a.horario_inicio);
              const fim = formatTime(a.horario_fim);
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAula(a);
                    setShowDaySelector(false);
                    setShowAulaModal(true);
                  }}
                  className="w-full text-left p-3 rounded-md border hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{a.turmas?.nome || a.titulo || 'Aula'}</div>
                    <div className="text-sm text-gray-600">{inicio} - {fim}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">{tipo}</div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      
      {currentViewType === 'timeGridDay' && currentViewDateStr && (() => {
        const count = filteredAulas.filter(a => a.data === currentViewDateStr).length;
        if (count > 8) {
          return (
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const sameDay = filteredAulas
                    .filter(a => a.data === currentViewDateStr)
                    .sort((a, b) => (a.horario_inicio || '').localeCompare(b.horario_inicio || ''));
                  setSelectedDayStr(currentViewDateStr);
                  setDayAulas(sameDay);
                  setShowDaySelector(true);
                }}
              >
                Mostrar todas as aulas ({count})
              </Button>
            </div>
          );
        }
        return null;
      })()}

      {/* Modal unificado de detalhes da aula */}
      <AulaDetailsModal
        aula={selectedAula}
        isOpen={showAulaModal}
        onClose={() => setShowAulaModal(false)}
        onEdit={(aula) => {
          // TODO: Implementar edição da aula
          console.log('Editar aula:', aula);
        }}
      />

      {/* Dialog para criar nova aula */}
      <NewLessonDialog 
        isOpen={showNewLessonDialog}
        onOpenChange={setShowNewLessonDialog}
        onSuccess={() => {
          loadAulas();
          setShowNewLessonDialog(false);
        }}
      />

      {/* Barra de seleção múltipla */}
       {isSelectionMode && (
         <MultipleSelectionBar
           isVisible={isSelectionMode}
           selectedCount={selectedItems.size}
           totalItems={filteredAulas.length}
           onSelectAll={selectAll}
           onClearSelection={clearSelection}
           onDelete={handleDeleteSelected}
           onCancel={exitSelectionMode}
           itemName="aulas"
           deleteButtonText="Excluir Aulas"
           isAllSelected={selectedItems.size === filteredAulas.length}
         />
       )}
    </motion.div>
  );
};

export default ClassesCalendar;
