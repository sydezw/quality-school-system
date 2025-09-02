import React, { useState, useEffect, useRef } from 'react';
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
import { AulaDetailsModal } from './AulaDetailsModal';

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';

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

  // Estado para controlar o toggle dos filtros
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Referência do calendário
  const calendarRef = useRef<FullCalendar>(null);

  // Hook para detectar mobile
  const isMobile = useIsMobile();

  const { toast } = useToast();

  // Hook para gerenciar aulas
  const { excluirMultiplasAulas } = useAulas();

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
      
      const { data, error } = await supabase
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
            professores (
              id,
              nome
            )
          )
        `)
        .order('data', { ascending: true })
        .order('horario_inicio', { ascending: true });

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
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          professores (
            id,
            nome
          )
        `)
        .eq('status', 'ativo')
        .order('nome');

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
  }, []);

  console.log('Total de aulas:', aulas.length);
  console.log('Aulas filtradas:', filteredAulas.length);

  /**
   * Converte aulas em eventos do FullCalendar
   */
  const convertAulasToEvents = (): EventInput[] => {
    const events = filteredAulas.map(aula => {
      const startTime = aula.horario_inicio ? `T${aula.horario_inicio}` : '';
      const endTime = aula.horario_fim ? `T${aula.horario_fim}` : '';
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
      
      const tituloCompleto = `${isSelectedItem && isSelectionMode ? '✓ ' : ''}${nomeTurmaProcessado}`;
      
      // Determinar cor baseada no tipo de aula
      let backgroundColor = aula.turmas?.cor_calendario || '#6B7280';
      let borderColor = aula.turmas?.cor_calendario || '#6B7280';
      
      if (aula.tipo_aula === 'avaliativa') {
        backgroundColor = '#16A34A'; // Verde
        borderColor = '#15803D';
      } else if (aula.tipo_aula === 'prova_final') {
        backgroundColor = '#2563EB'; // Azul
        borderColor = '#1D4ED8';
      }
      
      // Se estiver selecionada no modo de seleção, usar cor vermelha
      if (isSelectedItem && isSelectionMode) {
        backgroundColor = '#DC2626';
        borderColor = '#B91C1C';
      }
      
      return {
        id: aula.id,
        title: tituloCompleto,
        start: `${aula.data}${startTime}`,
        end: `${aula.data}${endTime}`,
        backgroundColor,
        borderColor,
        textColor: '#FFFFFF',
        extendedProps: {
          aula: aula,
          turma: aula.turmas?.nome,
          idioma: aula.turmas?.idioma,
          nivel: aula.turmas?.nivel,
          status: aula.status,
          descricao: aula.descricao,
          tipo_aula: aula.tipo_aula
        }
      };
    });
    
    console.log('Eventos convertidos para o calendário:', events.length);
    console.log('Eventos:', events);
    return events;
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
            <style>{`
              /* Customização do FullCalendar com tema - Largura total */
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
              .fc-event {
                border-radius: ${isMobile ? '4px' : '8px'} !important;
                border: none !important;
                padding: ${isMobile ? '2px 4px' : '4px 8px'} !important;
                margin: ${isMobile ? '1px 0' : '2px 0'} !important;
                font-weight: 500 !important;
                font-size: ${isMobile ? '0.625rem' : '0.875rem'} !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
                ${isMobile ? 'min-height: 16px !important;' : ''}
              }
              
              .fc-event:hover {
                ${isMobile ? '' : 'transform: translateY(-2px) scale(1.02) !important;'}
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
                z-index: 10 !important;
              }
              
              .fc-event-title {
                font-weight: 600 !important;
                font-size: ${isMobile ? '0.625rem' : '0.875rem'} !important;
                line-height: ${isMobile ? '1.2' : '1.4'} !important;
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
                min-height: ${isMobile ? '22px' : '26px'} !important;
                max-height: ${isMobile ? '40px' : '48px'} !important;
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
              select={handleDateSelect}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
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
              dayHeaderFormat={{ weekday: 'short' }}
              eventDidMount={(info) => {
                // Adiciona tooltip aos eventos
                const status = info.event.extendedProps.status;
                info.el.setAttribute('title', 
                  `${info.event.extendedProps.turma}\nStatus: ${status}\nIdioma: ${info.event.extendedProps.idioma}\nNível: ${info.event.extendedProps.nivel}`
                );
                
                // Aplica opacidade baseada no status da aula
                if (status === 'concluida') {
                  // Aulas concluídas: opacidade baixa (0.4)
                  info.el.style.opacity = '0.4';
                } else {
                  // Aulas não concluídas (agendada, em_andamento, cancelada): opacidade total
                  info.el.style.opacity = '1';
                }
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

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