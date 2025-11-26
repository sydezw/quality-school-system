import { useState, useEffect, useCallback } from 'react';
import { List, Plus, Filter, Search, Edit, Users, Clock, Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tables } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NewLessonDialog } from './NewLessonDialog';
import { AulaDetailsModal } from './AulaDetailsModal';
import { useAulas } from '@/hooks/useAulas';
import { useMultipleSelection } from '@/hooks/useMultipleSelection';
import { MultipleSelectionBar } from '@/components/shared/MultipleSelectionBar';
import { SelectionCheckbox } from '@/components/shared/SelectionCheckbox';
import { ConfirmDeleteModal } from '@/components/shared/ConfirmDeleteModal';
import { formatDate } from '@/utils/formatters';

// Tipos para melhor organização e reutilização
type Turma = Tables<'turmas'>;
type Aula = Tables<'aulas'>;
type Usuario = Tables<'usuarios'>;

interface TurmaComProfessor {
  id: string;
  nome: string;
  idioma: "Inglês" | "Japonês" | "Inglês/Japonês" | "particular";
  nivel: "Book 1" | "Book 2" | "Book 3" | "Book 4" | "Book 5" | "Book 6" | "Book 7" | "Book 8" | "Book 9" | "Book 10";
  cor_calendario: string;
  professor_id: string;
  status: string;
  total_aulas: number | null;
  professores: {
    id: string;
    nome: string;
    email: string;
  } | null;
}

interface AulaComDetalhes extends Aula {
  turmas: TurmaComProfessor | null;
  _count?: {
    presencas: number;
  };
}

/**
 * Componente de Lista das Aulas
 * 
 * Funcionalidades:
 * - Visualização em tabela das aulas
 * - Filtros avançados por múltiplos critérios
 * - Busca por título/descrição
 * - Ordenação por colunas
 * - Ações rápidas (editar, presença, etc.)
 * - Seleção múltipla e exclusão em lote
 * - Paginação para performance
 */
const ClassesList = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Hook personalizado para gerenciar aulas
  const {
    aulas,
    turmas,
    professores,
    loading,
    excluirAula,
    excluirMultiplasAulas,
    buscarAulas,
    recarregarAulas
  } = useAulas();

  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    turmaId: '',
    professorId: '',
    idioma: '',
    nivel: '',
    status: '',
    dataInicio: '',
    dataFim: ''
  });

  // Estados de ordenação e paginação
  const [sortBy, setSortBy] = useState<keyof AulaComDetalhes>('data');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Estado para controlar o toggle dos filtros
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Estados para modais de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Estados para modal de detalhes da aula
  const [showAulaModal, setShowAulaModal] = useState(false);
  const [selectedAula, setSelectedAula] = useState<AulaComDetalhes | null>(null);



  /**
   * Aplica filtros e busca
   */
  const aplicarFiltros = useCallback(() => {
    const filtrosAtivos = {
      termo: searchTerm,
      turmaId: filters.turmaId,
      professorId: filters.professorId,
      idioma: filters.idioma,
      nivel: filters.nivel,
      status: filters.status,
      dataInicio: filters.dataInicio,
      dataFim: filters.dataFim
    };

    buscarAulas(filtrosAtivos);
  }, [searchTerm, filters, buscarAulas]);

  // Aplica filtros quando os valores mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      aplicarFiltros();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [aplicarFiltros]);

  /**
   * Funções de exclusão
   */
  const handleDelete = (aula: AulaComDetalhes) => {
    if (isSelectionMode) {
      toggleSelection(aula);
    } else {
      enterSelectionMode();
      toggleSelection(aula);
    }
  };

  const handleConfirmMultipleDelete = () => {
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      setDeleteLoading(true);
      const selectedAulas = getSelectedItems();
      
      if (selectedAulas.length === 1) {
        await excluirAula(selectedAulas[0].id);
      } else {
        const ids = selectedAulas.map(aula => aula.id);
        await excluirMultiplasAulas(ids);
      }

      // Limpar seleção e sair do modo de seleção
      clearSelection();
      exitSelectionMode();
      setShowDeleteModal(false);

    } catch (error) {
      console.error('Erro ao excluir aulas:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Aplica filtros e busca nas aulas
   */
  const filteredAulas = aulas.filter(aula => {
    const matchesSearch = !searchTerm || 
      aula.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aula.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aula.turmas?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTurma = !filters.turmaId || aula.turma_id === filters.turmaId;
    const matchesProfessor = !filters.professorId || aula.turmas?.professor_id === filters.professorId;
    const matchesIdioma = !filters.idioma || aula.turmas?.idioma === filters.idioma;
    const matchesNivel = !filters.nivel || aula.turmas?.nivel === filters.nivel;
    const matchesStatus = !filters.status || aula.status === filters.status;
    
    const matchesDataInicio = !filters.dataInicio || aula.data >= filters.dataInicio;
    const matchesDataFim = !filters.dataFim || aula.data <= filters.dataFim;

    return matchesSearch && matchesTurma && matchesProfessor && 
           matchesIdioma && matchesNivel && matchesStatus && 
           matchesDataInicio && matchesDataFim;
  });

  /**
   * Aplica ordenação
   */
  const sortedAulas = [...filteredAulas].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  /**
   * Aplica paginação
   */
  const aulasPaginadas = sortedAulas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedAulas.length / itemsPerPage);

  // Hook para seleção múltipla
  const {
    selectedItems,
    isSelectionMode,
    selectedCount,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    getSelectedItems
  } = useMultipleSelection<AulaComDetalhes>({
    items: aulasPaginadas,
    getItemId: (aula) => aula.id
  });

  /**
   * Manipula ordenação por coluna
   */
  const handleSort = (column: keyof AulaComDetalhes) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  /**
   * Abre o modal de detalhes da aula
   */
  const handleOpenAulaDetails = (aula: AulaComDetalhes) => {
    setSelectedAula(aula);
    setShowAulaModal(true);
  };



  /**
   * Formata horário para exibição
   */
  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  /**
   * Retorna cor do status
   */
  const getStatusColor = (status: string) => {
    const colors = {
      'agendada': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'concluida': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className={cn(
        "flex gap-4 items-start justify-between p-4 bg-gray-50 rounded-lg border",
        isMobile ? "flex-col" : "flex-row items-center"
      )}>
        <div className="flex items-center gap-2">
          <List className={cn("text-red-600", isMobile ? "h-4 w-4" : "h-5 w-5")} />
          <h2 className={cn("font-semibold text-gray-900", isMobile ? "text-lg" : "text-xl")}>
            Lista de Aulas
          </h2>
          <Badge variant="outline" className={isMobile ? "text-xs" : ""}>
            {sortedAulas.length} aula{sortedAulas.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className={cn(
          "flex gap-3",
          isMobile ? "flex-col w-full" : "flex-row"
        )}>
          <Button
            variant="outline"
            onClick={() => {
              if (isSelectionMode) {
                exitSelectionMode();
              } else {
                enterSelectionMode();
              }
            }}
            className={cn(
              "border-red-300 text-red-600 hover:bg-red-50 font-medium",
              isMobile ? "w-full h-12 text-base rounded-xl" : "h-10 px-4"
            )}
          >
            <Trash2 className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")} />
            {isSelectionMode ? 'Cancelar Seleção' : 'Excluir Aulas'}
          </Button>
          
          <NewLessonDialog onSuccess={recarregarAulas}>
            <Button className={cn(
              "bg-red-600 hover:bg-red-700 font-medium",
              isMobile ? "w-full h-12 text-base rounded-xl" : "h-10 px-4"
            )}>
              <Plus className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")} />
              Nova Aula
            </Button>
          </NewLessonDialog>
        </div>
      </div>

      {/* Filtros avançados */}
      <Card className={isMobile ? "mx-2" : ""}>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className={cn(
              "cursor-pointer hover:bg-gray-50 transition-colors",
              isMobile ? "p-4" : ""
            )}>
              <CardTitle className={cn(
                "flex items-center justify-between",
                isMobile ? "text-base" : ""
              )}>
                <div className="flex items-center gap-2">
                  <Filter className={cn("text-[#D90429]", isMobile ? "h-4 w-4" : "h-4 w-4")} />
                  Filtros Avançados
                </div>
                <motion.div
                  animate={{ rotate: filtersOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={cn("text-gray-500", isMobile ? "h-4 w-4" : "h-4 w-4")} />
                </motion.div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className={isMobile ? "p-4" : ""}>
          <div className={cn(
            "gap-4 mb-4",
            isMobile ? "grid grid-cols-1 space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {/* Busca */}
            <div className={cn("relative", isMobile ? "" : "lg:col-span-2")}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descrição ou turma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-10",
                  isMobile ? "h-12 text-base rounded-xl" : ""
                )}
              />
            </div>

            {/* Data início */}
            <div>
              <label className={cn(
                "block font-medium text-gray-700 mb-1",
                isMobile ? "text-sm" : "text-sm"
              )}>
                Data Início
              </label>
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                className={isMobile ? "h-12 text-base rounded-xl" : ""}
              />
            </div>

            {/* Data fim */}
            <div>
              <label className={cn(
                "block font-medium text-gray-700 mb-1",
                isMobile ? "text-sm" : "text-sm"
              )}>
                Data Fim
              </label>
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                className={isMobile ? "h-12 text-base rounded-xl" : ""}
              />
            </div>
          </div>

          <div className={cn(
            "gap-4",
            isMobile ? "grid grid-cols-1 space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
          )}>
            {/* Filtro por turma */}
            <div>
              <label className={cn(
                "block font-medium text-gray-700 mb-1",
                isMobile ? "text-sm" : "text-sm"
              )}>
                Turma
              </label>
              <select
                value={filters.turmaId}
                onChange={(e) => setFilters(prev => ({ ...prev, turmaId: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500",
                  isMobile ? "h-12 text-base rounded-xl" : "rounded-md"
                )}
              >
                <option value="">Todas</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por professor */}
            <div>
              <label className={cn(
                "block font-medium text-gray-700 mb-1",
                isMobile ? "text-sm" : "text-sm"
              )}>
                Professor
              </label>
              <select
                value={filters.professorId}
                onChange={(e) => setFilters(prev => ({ ...prev, professorId: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500",
                  isMobile ? "h-12 text-base rounded-xl" : "rounded-md"
                )}
              >
                <option value="">Todos</option>
                {professores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por idioma */}
            <div>
              <label className={cn(
                "block font-medium text-gray-700 mb-1",
                isMobile ? "text-sm" : "text-sm"
              )}>
                Idioma
              </label>
              <select
                value={filters.idioma}
                onChange={(e) => setFilters(prev => ({ ...prev, idioma: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500",
                  isMobile ? "h-12 text-base rounded-xl" : "rounded-md"
                )}
              >
                <option value="">Todos</option>
                <option value="Inglês">Inglês</option>
                <option value="Japonês">Japonês</option>
                <option value="Inglês/Japonês">Inglês/Japonês</option>
                <option value="particular">Particular</option>
              </select>
            </div>

            {/* Filtro por nível */}
            <div>
              <label className={cn(
                "block font-medium text-gray-700 mb-1",
                isMobile ? "text-sm" : "text-sm"
              )}>
                Nível
              </label>
              <select
                value={filters.nivel}
                onChange={(e) => setFilters(prev => ({ ...prev, nivel: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500",
                  isMobile ? "h-12 text-base rounded-xl" : "rounded-md"
                )}
              >
                <option value="">Todos</option>
                <option value="Básico">Básico</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
                <option value="Conversação">Conversação</option>
              </select>
            </div>

            {/* Filtro por status */}
            <div>
              <label className={cn(
                "block font-medium text-gray-700 mb-1",
                isMobile ? "text-sm" : "text-sm"
              )}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500",
                  isMobile ? "h-12 text-base rounded-xl" : "rounded-md"
                )}
              >
                <option value="">Todos</option>
                <option value="agendada">Agendada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className={cn(
            "mt-4",
            isMobile ? "flex justify-center" : "flex justify-end"
          )}>
            <Button
              variant="outline"
              className={isMobile ? "w-full h-12 text-base rounded-xl" : ""}
              onClick={() => {
                setFilters({
                  turmaId: '',
                  professorId: '',
                  idioma: '',
                  nivel: '',
                  status: '',
                  dataInicio: '',
                  dataFim: ''
                });
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

      {/* Tabela de aulas */}
      <Card className={isMobile ? "mx-2" : ""}>
        <CardContent className={isMobile ? "p-3" : "p-0"}>
          {isMobile ? (
            // Layout mobile com cards
            <div className="space-y-3">
              {aulasPaginadas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma aula encontrada.
                </div>
              ) : (
                aulasPaginadas.map(aula => (
                  <motion.div
                    key={aula.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <SelectionCheckbox
                          isSelected={isSelected(aula)}
                          onChange={() => toggleSelection(aula)}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {aula.titulo || 'Sem título'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {aula.turmas?.nome || 'Turma não definida'}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn("text-xs", getStatusColor(aula.status))}>
                        {aula.status === 'agendada' && 'Agendada'}
                        {aula.status === 'em_andamento' && 'Em Andamento'}
                        {aula.status === 'concluida' && 'Concluída'}
                        {aula.status === 'cancelada' && 'Cancelada'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(aula.data)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTime(aula.horario_inicio)} - {formatTime(aula.horario_fim)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{aula.turmas?.professores?.nome || 'Professor não definido'}</span>
                      </div>
                      <div className="text-gray-600">
                        {aula.turmas?.idioma} • {aula.turmas?.nivel}
                      </div>
                    </div>
                    
                    {aula.descricao && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {aula.descricao}
                      </p>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 h-10 text-sm rounded-lg"
                        onClick={() => handleOpenAulaDetails(aula)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                      <h1>Tab de presenças</h1>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-10 px-3 text-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(aula)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            // Layout desktop com tabela
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <SelectionCheckbox
                    isSelected={selectedCount === aulasPaginadas.length && aulasPaginadas.length > 0}
                    onChange={() => {
                      if (selectedCount === aulasPaginadas.length) {
                        clearSelection();
                      } else {
                        selectAll();
                      }
                    }}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('data')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data
                    {sortBy === 'data' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('horario_inicio')}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário
                    {sortBy === 'horario_inicio' && (
                      <span className="text-xs">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('titulo')}
                >
                  Título
                  {sortBy === 'titulo' && (
                    <span className="text-xs ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Idioma/Nível</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortBy === 'status' && (
                    <span className="text-xs ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aulasPaginadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Nenhuma aula encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                aulasPaginadas.map(aula => (
                  <TableRow key={aula.id} className="hover:bg-gray-50">
                    <TableCell>
                      <SelectionCheckbox
                        isSelected={isSelected(aula)}
                        onChange={() => toggleSelection(aula)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatDate(aula.data)}
                    </TableCell>
                    <TableCell>
                      {formatTime(aula.horario_inicio)} - {formatTime(aula.horario_fim)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {aula.titulo || 'Sem título'}
                        </div>
                        {aula.descricao && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {aula.descricao}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: aula.turmas?.cor_calendario || '#6B7280' }}
                      ></div>
                      {aula.turmas?.nome}
                    </TableCell>
                    <TableCell>
                      {aula.turmas?.professores?.nome || 'Não definido'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{aula.turmas?.idioma}</div>
                        <div className="text-gray-500">{aula.turmas?.nivel}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(aula.status || '')}>
                        {aula.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenAulaDetails(aula)}
                          title="Ver detalhes e controlar presença"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(aula)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className={cn(
          "flex items-center justify-between",
          isMobile ? "flex-col gap-4 mx-2" : ""
        )}>
          <div className={cn(
            "text-gray-700",
            isMobile ? "text-sm text-center" : "text-sm"
          )}>
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
            {Math.min(currentPage * itemsPerPage, sortedAulas.length)} de{' '}
            {sortedAulas.length} aulas
          </div>
          
          <div className={cn(
            "flex items-center gap-2",
            isMobile ? "w-full justify-center" : ""
          )}>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              className={isMobile ? "h-10 px-4 rounded-xl" : ""}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size={isMobile ? "default" : "sm"}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      isMobile ? "h-10 w-10 rounded-xl" : "w-8 h-8 p-0"
                    )}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              className={isMobile ? "h-10 px-4 rounded-xl" : ""}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Barra de seleção múltipla */}
      {isSelectionMode && (
        <MultipleSelectionBar
          isVisible={isSelectionMode}
          selectedCount={selectedCount}
          totalItems={aulasPaginadas.length}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onDelete={handleConfirmMultipleDelete}
          onCancel={() => {
            clearSelection();
            exitSelectionMode();
          }}
          itemName="aulas"
          deleteButtonText="Excluir Selecionadas"
          isAllSelected={selectedCount === aulasPaginadas.length && aulasPaginadas.length > 0}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDelete}
        itemCount={selectedCount}
        itemName="aula"
        isLoading={deleteLoading}
      />

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
    </div>
  );
};

export default ClassesList;