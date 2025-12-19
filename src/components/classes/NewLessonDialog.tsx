
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import DatePicker from '@/components/shared/DatePicker';
import { TipoAulaSelector } from './TipoAulaSelector';
import { GraduationCap, Calendar, Clock, Edit2, Check, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Schema para criação de aula única
const singleLessonSchema = z.object({
  turma_id: z.string().min(1, "Selecione uma turma."),
  data: z.date({
    required_error: "A data da aula é obrigatória.",
  }),
  semestre: z.string().min(1, "O semestre é obrigatório."),
});

// Schema para criação de todas as aulas
const allLessonsSchema = z.object({
  turma_id: z.string().min(1, "Selecione uma turma."),
  data_inicio: z.date({
    required_error: "A data de início é obrigatória.",
  }),
  data_fim: z.date({
    required_error: "A data de fim é obrigatória.",
  }),
  numero_aulas: z.number().min(1, "O número de aulas deve ser maior que 0."),
  semestre: z.string().min(1, "O semestre é obrigatório."),
}).refine((data) => data.data_fim > data.data_inicio, {
  message: "A data de fim deve ser posterior à data de início.",
  path: ["data_fim"],
});

interface Turma {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
  dias_da_semana: string;
  horario: string;
  professor_id: string | null;
  status?: string;
  data_inicio?: string | null;
  data_fim?: string | null;
  professores?: {
    id: string;
    nome: string;
  } | null;
}

interface GeneratedLesson {
  id: string;
  data: Date;
  diaSemana: string;
  numero: number;
  isEditing?: boolean;
  tipo_aula: 'normal' | 'avaliativa' | 'prova_final';
}

type CreationMode = 'single' | 'all';

interface NewLessonDialogProps {
  turmaId?: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NewLessonDialog({ 
  turmaId, 
  onSuccess, 
  children, 
  isOpen, 
  onOpenChange 
}: NewLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>('single');
  const [generatedLessons, setGeneratedLessons] = useState<GeneratedLesson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllResults, setShowAllResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [singleLessonType, setSingleLessonType] = useState<'normal' | 'avaliativa' | 'prova_final'>('normal');
  const [dateWarningMessage, setDateWarningMessage] = useState<string>('');
  const { toast } = useToast();
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);
  const [semesterDuplicateConfirmed, setSemesterDuplicateConfirmed] = useState(false);
  
  // Formulário para aula única
  const singleForm = useForm<z.infer<typeof singleLessonSchema>>({
    resolver: zodResolver(singleLessonSchema),
    defaultValues: {
      turma_id: turmaId || '',
      data: new Date(),
      semestre: '',
    },
  });

  // Formulário para todas as aulas
  const allForm = useForm<z.infer<typeof allLessonsSchema>>({
    resolver: zodResolver(allLessonsSchema),
    defaultValues: {
      turma_id: turmaId || '',
      data_inicio: new Date(),
      data_fim: addDays(new Date(), 180), // 6 meses padrão
      numero_aulas: 36,
      semestre: '',
    },
  });

  // Controle de abertura do dialog
  const dialogOpen = isOpen !== undefined ? isOpen : open;
  const setDialogOpen = onOpenChange || setOpen;

  // Buscar turmas com informações de professores
  useEffect(() => {
    const fetchTurmas = async () => {
      console.log('🔍 Iniciando busca de turmas...');
      
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          id, 
          nome, 
          idioma, 
          nivel, 
          dias_da_semana, 
          horario, 
          professor_id,
          status,
          data_inicio,
          data_fim,
          professores:professor_id(
            id,
            nome
          )
        `)
        .order('nome');

      console.log('📊 Resultado da consulta:', { data, error });
      console.log('📈 Número de turmas encontradas:', data?.length || 0);

      if (error) {
        console.error('❌ Erro ao buscar turmas:', error);
        toast({
          title: "Erro",
          description: `Erro ao carregar turmas: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setTurmas(data || []);
      console.log('✅ Turmas carregadas no estado:', data?.length || 0);
    };

    if (dialogOpen) {
      console.log('🚪 Dialog aberto, buscando turmas...');
      fetchTurmas();
    }
  }, [dialogOpen, toast]);

  // Sincronizar turma inicial quando `turmaId` é fornecido
  useEffect(() => {
    if (turmaId && turmas.length > 0) {
      handleTurmaSelect(turmaId);
    }
  }, [turmaId, turmas]);

  // Resetar showAllResults quando searchTerm mudar
  useEffect(() => {
    setShowAllResults(false);
  }, [searchTerm]);

  // Função para detectar clique fora da área de busca
  const handleClickOutsideSearch = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const searchContainer = document.querySelector('[data-search-container]');
    const mainScrollArea = document.querySelector('[data-main-scroll]');
    
    if (isSearchFocused && searchContainer && !searchContainer.contains(target)) {
      setIsSearchFocused(false);
      // Transferir foco para o scroll principal
      if (mainScrollArea) {
        (mainScrollArea as HTMLElement).focus();
      }
    }
  }, [isSearchFocused]);

  // Adicionar/remover listener de clique
  useEffect(() => {
    if (isSearchFocused) {
      document.addEventListener('mousedown', handleClickOutsideSearch);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideSearch);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSearch);
    };
  }, [isSearchFocused, handleClickOutsideSearch]);

  // Função para gerar opções de semestre
  const generateSemesterOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    
    // Gerar 7 anos antes e 7 anos depois do ano atual
    for (let year = currentYear - 7; year <= currentYear + 7; year++) {
      options.push(`${year} - Semestre 1`);
      options.push(`${year} - Semestre 2`);
    }
    
    return options;
  };

  const semesterOptions = generateSemesterOptions();

  // Função para verificar se já existe aula única na mesma data para a turma
  const checkSingleLessonDuplicate = async (turmaId: string, data: Date) => {
    const { data: existingLesson, error } = await supabase
      .from('aulas')
      .select('id')
      .eq('turma_id', turmaId)
      .eq('data', format(data, 'yyyy-MM-dd'))
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!existingLesson;
  };

  const checkSemesterLessonsDuplicate = async (turmaId: string, semestre: string) => {
    const { data: existingLessons, error } = await supabase
      .from('aulas')
      .select('id')
      .eq('turma_id', turmaId)
      .eq('semestre', semestre)
      .limit(1);

    if (error) {
      throw error;
    }

    return existingLessons && existingLessons.length > 0;
  };

  // Filtrar turmas baseado na busca com dropdown inteligente
  const filteredTurmas = turmas.filter(turma => 
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.professores?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.idioma.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.nivel.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Limitar resultados para dropdown inteligente
  const DROPDOWN_LIMIT = 5;
  const displayedTurmas = showAllResults ? filteredTurmas : filteredTurmas.slice(0, DROPDOWN_LIMIT);
  const hasMoreResults = filteredTurmas.length > DROPDOWN_LIMIT;
  
  // Log para debug
  console.log('🔍 Estado atual:', {
    totalTurmas: turmas.length,
    filteredTurmas: filteredTurmas.length,
    searchTerm,
    dialogOpen,
    selectedTurma: selectedTurma?.nome
  });

  // Função para selecionar turma e preencher campos automaticamente
  const handleTurmaSelect = (turmaId: string) => {
    const turma = turmas.find(t => t.id === turmaId);
    if (turma) {
      setSelectedTurma(turma);
      singleForm.setValue('turma_id', turmaId);
      allForm.setValue('turma_id', turmaId);
      
      // Preencher automaticamente as datas se disponíveis
      if (turma.data_inicio && turma.data_fim) {
        try {
          const dataInicio = new Date(turma.data_inicio);
          const dataFim = new Date(turma.data_fim);
          
          // Preencher campos de data no formulário "all"
          allForm.setValue('data_inicio', dataInicio);
          allForm.setValue('data_fim', dataFim);
          
          // Limpar mensagem de aviso
          setDateWarningMessage('');
          
          toast({
            title: "Datas preenchidas automaticamente",
            description: `Data de início: ${format(dataInicio, 'dd/MM/yyyy')} - Data de fim: ${format(dataFim, 'dd/MM/yyyy')}`,
          });
        } catch (error) {
          console.error('Erro ao processar datas da turma:', error);
          setDateWarningMessage('As datas da turma estão em formato inválido. Por favor, defina as datas manualmente.');
        }
      } else {
        // Mostrar mensagem de aviso se as datas não estiverem definidas
        setDateWarningMessage('Esta turma não possui datas de início e fim definidas. Por favor, defina as datas manualmente.');
      }
    }
  };

  // Função para gerar aulas baseado nos dias da semana
  const generateLessons = (startDate: Date, endDate: Date, diasSemana: string, numeroAulas: number): GeneratedLesson[] => {
    const lessons: GeneratedLesson[] = [];
    const diasMap: { [key: string]: number } = {
      'domingo': 0, 'segunda': 1, 'terça': 2, 'quarta': 3, 
      'quinta': 4, 'sexta': 5, 'sábado': 6
    };
    
    // Extrair dias da semana do string (ex: "Segunda, Quarta")
    const diasArray = diasSemana.toLowerCase().split(',').map(d => d.trim());
    const diasNumeros = diasArray.map(dia => diasMap[dia]).filter(num => num !== undefined);
    
    let currentDate = new Date(startDate);
    let lessonCount = 0;
    
    while (lessonCount < numeroAulas && currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (diasNumeros.includes(dayOfWeek)) {
        lessons.push({
          id: `lesson-${lessonCount + 1}`,
          data: new Date(currentDate),
          diaSemana: currentDate.toLocaleDateString('pt-BR', { weekday: 'long' }),
          numero: lessonCount + 1,
          tipo_aula: 'normal',
        });
        lessonCount++;
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    return lessons;
  };

  // Atualizar aulas geradas quando dados mudarem (preservando tipo_aula)
  const dataInicio = allForm.watch('data_inicio');
  const dataFim = allForm.watch('data_fim');
  const numeroAulas = allForm.watch('numero_aulas');

  useEffect(() => {
    if (creationMode === 'all' && selectedTurma) {
      if (dataInicio && dataFim && numeroAulas) {
        const baseLessons = generateLessons(
          dataInicio,
          dataFim,
          selectedTurma.dias_da_semana,
          numeroAulas
        );
        setGeneratedLessons(prev => {
          if (!prev || prev.length === 0) return baseLessons;
          // Preserva o tipo_aula previamente selecionado por id
          return baseLessons.map(newL => {
            const old = prev.find(p => p.id === newL.id);
            return old ? { ...newL, tipo_aula: old.tipo_aula } : newL;
          });
        });
      }
    }
  }, [creationMode, selectedTurma, dataInicio, dataFim, numeroAulas]);

  useEffect(() => {
    setSemesterDuplicateConfirmed(false);
  }, [selectedTurma?.id, numeroAulas]);

  // Função para editar data de uma aula específica
  const handleEditLessonDate = (lessonId: string, newDate: Date) => {
    setGeneratedLessons(prev => prev.map(lesson => 
      lesson.id === lessonId 
        ? { 
            ...lesson, 
            data: newDate, 
            diaSemana: newDate.toLocaleDateString('pt-BR', { weekday: 'long' }),
            isEditing: false 
          }
        : lesson
    ));
  };

  // Função para submeter aula única
  const onSubmitSingle = async (values: z.infer<typeof singleLessonSchema>) => {
    setIsSubmitting(true);
    try {
      // Verificar se já existe aula na mesma data para a turma
      const isDuplicate = await checkSingleLessonDuplicate(values.turma_id, values.data);
      
      if (isDuplicate) {
        toast({
          title: "Aula já existe",
          description: `Já existe uma aula cadastrada para esta turma na data ${format(values.data, 'dd/MM/yyyy')}.`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('aulas').insert({
        turma_id: values.turma_id,
        data: format(values.data, 'yyyy-MM-dd'),
        semestre: values.semestre,
        tipo_aula: singleLessonType,
        professor_id: selectedTurma?.professor_id || null,
        titulo: `Aula - ${format(values.data, 'dd/MM/yyyy')}`,
        horario_inicio: selectedTurma?.horario.split('-')[0]?.trim() || '08:00:00',
        horario_fim: selectedTurma?.horario.split('-')[1]?.trim() || '09:00:00',
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Nova aula registrada.",
      });
      
      handleDialogClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao registrar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a nova aula.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para submeter todas as aulas
  const onSubmitAll = async (values: z.infer<typeof allLessonsSchema>) => {
    setIsSubmitting(true);
    try {
      const hasSemesterLessons = await checkSemesterLessonsDuplicate(values.turma_id, values.semestre);
      if (hasSemesterLessons && !semesterDuplicateConfirmed) {
        setConfirmDuplicateOpen(true);
        setIsSubmitting(false);
        return;
      }

      // Inserir todas as aulas geradas
      const aulasToInsert = generatedLessons.map(lesson => ({
        turma_id: values.turma_id,
        professor_id: selectedTurma?.professor_id || null,
        data: format(lesson.data, 'yyyy-MM-dd'),
        titulo: `Aula ${lesson.numero} - ${format(lesson.data, 'dd/MM/yyyy')}`,
        conteudo: `Conteúdo da aula ${lesson.numero} - ${selectedTurma?.nome} - ${format(lesson.data, 'dd/MM/yyyy', { locale: ptBR })}. Adicione aqui o conteúdo específico desta aula.`,
        horario_inicio: selectedTurma?.horario.split('-')[0]?.trim() || '08:00:00',
        horario_fim: selectedTurma?.horario.split('-')[1]?.trim() || '09:00:00',
        semestre: values.semestre,
        tipo_aula: lesson.tipo_aula,
      }));

      const { error } = await supabase
        .from('aulas')
        .insert(aulasToInsert);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `${generatedLessons.length} aulas criadas com sucesso.`,
      });
      
      handleDialogClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao registrar aulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar as aulas.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para fechar dialog e resetar estados
  const handleDialogClose = () => {
    setDialogOpen(false);
    singleForm.reset();
    allForm.reset();
    setSelectedTurma(null);
    setGeneratedLessons([]);
    setSearchTerm('');
    setCreationMode('single');
    setSingleLessonType('normal');
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-semibold">Criar Aulas</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="max-h-[80vh] overflow-y-auto" data-main-scroll>
            <div className="pr-4">
              <Tabs value={creationMode} onValueChange={(value) => setCreationMode(value as CreationMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="single">Criar Aula Única</TabsTrigger>
                  <TabsTrigger value="all">Criar Todas as Aulas</TabsTrigger>
                </TabsList>
                
                {/* Seleção de Turma (comum para ambas as abas) */}
                {!turmaId && (
                  <div className="space-y-3" data-search-container>
                    {/* Campo de busca otimizado */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Buscar Turma</label>
                      <Input
                        placeholder="Nome, professor, idioma ou nível..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => {
                          // Delay para permitir cliques nos resultados
                          setTimeout(() => setIsSearchFocused(false), 150);
                        }}
                        className="w-full h-9"
                      />
                    </div>
                    
                    {/* Lista de turmas expandida verticalmente */}
                    <div className="border rounded-lg bg-gray-50/50">
                      <div className="p-2 border-b bg-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">
                            {showAllResults ? filteredTurmas.length : Math.min(displayedTurmas.length, DROPDOWN_LIMIT)} de {filteredTurmas.length} turma(s)
                          </span>
                          {hasMoreResults && !showAllResults && (
                            <button
                              onClick={() => setShowAllResults(true)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Ver todas ({filteredTurmas.length})
                            </button>
                          )}
                          {showAllResults && (
                            <button
                              onClick={() => setShowAllResults(false)}
                              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                            >
                              Mostrar menos
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={`overflow-y-auto p-2 ${showAllResults ? 'max-h-80' : 'max-h-60'}`}>
                        <div className="space-y-2">
                          {displayedTurmas.map((turma) => (
                            <div
                              key={turma.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-white hover:shadow-sm ${
                                selectedTurma?.id === turma.id 
                                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                  : 'border-gray-200 bg-white'
                              }`}
                              onClick={() => handleTurmaSelect(turma.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-base text-gray-900">{turma.nome}</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {turma.idioma} • {turma.nivel}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                    <GraduationCap className="h-3 w-3" />
                                    {turma.professores?.nome || 'Sem professor'}
                                  </Badge>
                                  <div className="text-xs text-gray-500">
                                    {turma.dias_da_semana} • {turma.horario}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredTurmas.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <div className="text-sm">Nenhuma turma encontrada</div>
                              <div className="text-xs mt-1">Tente ajustar os termos de busca</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
          
                {/* Informações da turma selecionada - Layout melhorado */}
                {selectedTurma && (
            <div className="mt-4">
              {/* Header compacto da turma selecionada */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{selectedTurma.nome}</h3>
                    <p className="text-sm text-gray-600">{selectedTurma.idioma} • {selectedTurma.nivel}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedTurma(null)}
                    className="text-xs"
                  >
                    Alterar Turma
                  </Button>
                </div>
                
                {/* Informações em linha horizontal */}
                <div className="flex items-center gap-6 mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Professor:</span>
                    <span className="text-gray-700">{selectedTurma.professores?.nome || 'Sem professor'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Dias:</span>
                    <span className="text-gray-700">{selectedTurma.dias_da_semana}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Horário:</span>
                    <span className="text-gray-700">{selectedTurma.horario}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
                {/* Aba: Criar Aula Única */}
                <TabsContent value="single" className="mt-0">
                    {(selectedTurma || turmaId) && (
                      <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                           <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
                             <Calendar className="h-4 w-4 text-blue-600" />
                             Criar Aula Única
                           </CardTitle>
                         </CardHeader>
                         <CardContent>
                            <div className="space-y-2 mb-6">
                              <Label>Tipo de Aula</Label>
                              <TipoAulaSelector
                                value={singleLessonType}
                                onChange={setSingleLessonType}
                              />
                            </div>
                            <Form {...singleForm}>
                              <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-6">
                                 <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={singleForm.control}
                          name="data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Data da Aula</FormLabel>
                              <FormControl>
                                <DatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Selecione a data"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={singleForm.control}
                          name="semestre"
                          render={({ field }) => (
                            <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Semestre *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Selecione o semestre" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {semesterOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      
                      

                  
                      
                      <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={handleDialogClose}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                          {isSubmitting ? 'Salvando...' : 'Criar Aula'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
                {/* Aba: Criar Todas as Aulas */}
                <TabsContent value="all" className="mt-0">
                  {(selectedTurma || turmaId) && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-4">
                         <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
                           <Calendar className="h-4 w-4 text-blue-600" />
                           Criar Todas as Aulas
                         </CardTitle>
                       </CardHeader>
                       
                       {/* Mensagem de aviso sobre datas da turma */}
                       {dateWarningMessage && (
                         <div className="mx-6 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                           <p className="text-sm text-yellow-800">{dateWarningMessage}</p>
                         </div>
                       )}
                       
                       <CardContent>
                          <Form {...allForm}>
                            <form onSubmit={allForm.handleSubmit(onSubmitAll)} className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={allForm.control}
                          name="data_inicio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Data Início</FormLabel>
                              <FormControl>
                                <DatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Data de início"
                                  disabled={!!(selectedTurma?.data_inicio && selectedTurma?.data_fim)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={allForm.control}
                          name="data_fim"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Data Fim</FormLabel>
                              <FormControl>
                                <DatePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Data de fim"
                                  disabled={!!(selectedTurma?.data_inicio && selectedTurma?.data_fim)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                              <div className="grid grid-cols-2 gap-6">
                                <FormField
                                  control={allForm.control}
                                  name="numero_aulas"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Número de Aulas</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  className="h-10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                                <FormField
                                  control={allForm.control}
                                  name="semestre"
                          render={({ field }) => (
                            <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">Semestre *</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={async (value) => {
                                    field.onChange(value);
                                    setSemesterDuplicateConfirmed(false);
                                    const turmaAtual = selectedTurma?.id || allForm.getValues('turma_id');
                                    const num = allForm.getValues('numero_aulas');
                                    if (turmaAtual && num && num > 0) {
                                      const exists = await checkSemesterLessonsDuplicate(turmaAtual, value);
                                      if (exists) {
                                        setConfirmDuplicateOpen(true);
                                      }
                                    }
                                  }}
                                  value={field.value}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Selecione o semestre" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {semesterOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                              </div>
                  
                              {/* Visualização das aulas geradas */}
                              {generatedLessons.length > 0 && (
                        <Card className="mt-6 border border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-800">Aulas Geradas ({generatedLessons.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="max-h-64 overflow-y-auto">
                              <div className="space-y-2">
                                {generatedLessons.map((lesson) => {
                                  const getBgColor = () => {
                                    switch (lesson.tipo_aula) {
                                      case 'avaliativa': return 'bg-green-50 border-green-200 hover:bg-green-100';
                                      case 'prova_final': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
                                      default: return 'bg-white border-gray-200 hover:bg-gray-50';
                                    }
                                  };
                                  
                                  const getBadgeColor = () => {
                                    switch (lesson.tipo_aula) {
                                      case 'avaliativa': return 'bg-green-100 text-green-800 border-green-300';
                                      case 'prova_final': return 'bg-blue-100 text-blue-800 border-blue-300';
                                      default: return 'bg-gray-100 text-gray-800 border-gray-300';
                                    }
                                  };
                                  
                                  return (
                                  <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${getBgColor()}`}>
                                    <div className="flex items-center space-x-3">
                                      <Badge variant="outline" className={`w-12 justify-center text-xs ${getBadgeColor()}`}>
                                        {lesson.numero}
                                      </Badge>
                                      <div>
                                        <div className="font-medium text-sm text-gray-900">
                                          {format(lesson.data, 'dd/MM/yyyy')}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">
                                          {lesson.diaSemana}
                                        </div>
                                        <div className="text-xs font-medium mt-1">
                                          <span className={`px-2 py-1 rounded-full text-xs ${
                                            lesson.tipo_aula === 'avaliativa' ? 'bg-green-100 text-green-700' :
                                            lesson.tipo_aula === 'prova_final' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                          }`}>
                                            {lesson.tipo_aula === 'normal' ? 'Normal' :
                                             lesson.tipo_aula === 'avaliativa' ? 'Avaliativa' :
                                             'Prova Final'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="flex space-x-1">
                                        <Button
                                          type="button"
                                          variant={lesson.tipo_aula === 'normal' ? 'default' : 'outline'}
                                          size="sm"
                                          className="h-7 px-2 text-xs"
                                          onClick={() => {
                                            setGeneratedLessons(prev => prev.map(l => 
                                              l.id === lesson.id ? { ...l, tipo_aula: 'normal' } : l
                                            ));
                                          }}
                                        >
                                          Normal
                                        </Button>
                                        <Button
                                          type="button"
                                          variant={lesson.tipo_aula === 'avaliativa' ? 'default' : 'outline'}
                                          size="sm"
                                          className={`h-7 px-2 text-xs ${
                                            lesson.tipo_aula === 'avaliativa' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'
                                          }`}
                                          onClick={() => {
                                            setGeneratedLessons(prev => prev.map(l => 
                                              l.id === lesson.id ? { ...l, tipo_aula: 'avaliativa' } : l
                                            ));
                                          }}
                                        >
                                          Avaliativa
                                        </Button>
                                        <Button
                                          type="button"
                                          variant={lesson.tipo_aula === 'prova_final' ? 'default' : 'outline'}
                                          size="sm"
                                          className={`h-7 px-2 text-xs ${
                                            lesson.tipo_aula === 'prova_final' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'
                                          }`}
                                          onClick={() => {
                                            setGeneratedLessons(prev => prev.map(l => 
                                              l.id === lesson.id ? { ...l, tipo_aula: 'prova_final' } : l
                                            ));
                                          }}>
                                          Prova Final
                                        </Button>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                          setGeneratedLessons(prev => prev.map(l => 
                                            l.id === lesson.id ? { ...l, isEditing: true } : l
                                          ));
                                        }}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    {lesson.isEditing && (
                                      <div className="absolute inset-0 bg-white border rounded-lg p-2 flex items-center space-x-2 z-10">
                                        <DatePicker
                                          value={lesson.data}
                                          onChange={(newDate) => {
                                            if (newDate) {
                                              handleEditLessonDate(lesson.id, newDate);
                                            }
                                          }}
                                          placeholder="Nova data"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setGeneratedLessons(prev => prev.map(l => 
                                              l.id === lesson.id ? { ...l, isEditing: false } : l
                                            ));
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  );
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                              <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button type="button" variant="outline" onClick={handleDialogClose}>
                                  Cancelar
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={isSubmitting || generatedLessons.length === 0}
                                  className="min-w-[140px]"
                                >
                                  {isSubmitting ? 'Criando...' : `Criar ${generatedLessons.length} Aulas`}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
        <AlertDialog open={confirmDuplicateOpen} onOpenChange={setConfirmDuplicateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aulas já existentes no semestre</AlertDialogTitle>
              <AlertDialogDescription>
                {`Esta turma já possui aulas cadastradas no semestre ${allForm.getValues('semestre')}. Deseja criar as aulas mesmo assim?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setConfirmDuplicateOpen(false);
                allForm.setValue('semestre', '');
              }}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                setConfirmDuplicateOpen(false);
                setSemesterDuplicateConfirmed(true);
              }}>
                Criar mesmo assim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
