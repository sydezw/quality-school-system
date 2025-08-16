
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookCopy, Calendar, Clock, Globe, Book, Users, GraduationCap, AlertTriangle, CheckCircle, X, CalendarDays, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { getIdiomaColor } from '@/utils/idiomaColors';
import { calculateEndDate, calculateEndDateWithHolidays, parseDaysOfWeek, formatDateForDisplay, isHoliday } from '@/utils/dateCalculations';
import HolidayModal from '@/components/classes/HolidayModal';

interface Class {
  id: string;
  nome: string;
  idioma: Database["public"]["Enums"]["idioma"];
  nivel?: Database["public"]["Enums"]["nivel"] | null;
  dias_da_semana: string;
  horario: string;
  professor_id: string | null;
  materiais_ids?: string[];
  professores?: { nome: string };
  tipo_turma?: Database["public"]["Enums"]["tipo_turma"] | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  total_aulas?: number | null;
}

interface Teacher {
  id: string;
  nome: string;
  idiomas: string;
}

interface Material {
  id: string;
  nome: string;
  idioma: Database["public"]["Enums"]["idioma"];
  nivel: Database["public"]["Enums"]["nivel"];
  status: string;
}

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [detectedHolidays, setDetectedHolidays] = useState<Date[]>([]);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoTurmaFilter, setTipoTurmaFilter] = useState<string>('all');
  // Estados para paginação de turmas com múltiplos dias
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // Estados para planos particulares
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [classDataInicio, setClassDataInicio] = useState<string>('');
  const [classDataFim, setClassDataFim] = useState<string>('');
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, getValues, control, formState: { errors } } = useForm({
    defaultValues: {
      nome: '',
      idioma: '',
      nivel: '',
      dias_da_semana: '',
      horario: '',
      professor_id: 'none',
      tipo_turma: 'Turma',
      data_inicio: '',
      data_fim: '',
      total_aulas: 0
    }
  });

  const selectedIdioma = watch('idioma');
  const watchedDataInicio = watch('data_inicio');
  const watchedDataFim = watch('data_fim');
  const watchedTotalAulas = watch('total_aulas');
  const watchedDiasSemana = watch('dias_da_semana');
  const watchedNivel = watch('nivel');
  const watchedHorario = watch('horario');

  // Função para gerar nome padrão da turma
  const generateStandardName = () => {
    const nivel = getValues('nivel');
    const horario = getValues('horario');
    
    // Verificar se os campos obrigatórios estão preenchidos
    if (!nivel) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione o nível antes de gerar o nome padrão.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedDays.length === 0) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione pelo menos um dia da semana antes de gerar o nome padrão.",
        variant: "destructive",
      });
      return;
    }
    
    if (!horario || !horario.includes(' - ')) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o horário completo (ex: 16:00 - 18:00) antes de gerar o nome padrão.",
        variant: "destructive",
      });
      return;
    }
    
    // Gerar o nome seguindo o padrão: Book X - Dia da Semana - Horário às Horário
    const diasTexto = selectedDays.join(' e ');
    const horarioFormatado = horario.replace(' - ', ' às ');
    const nomeGerado = `${nivel} - ${diasTexto} - ${horarioFormatado}`;
    
    // Definir o nome no formulário
    setValue('nome', nomeGerado);
    
    toast({
      title: "Nome gerado",
      description: "Nome padrão da turma foi gerado com sucesso!",
    });
  };

  // Atualizar total de aulas quando plano for selecionado
  useEffect(() => {
    if (selectedPlan && selectedPlan !== 'none') {
      const plan = plans.find(p => p.id === selectedPlan);
      if (plan && plan.numero_aulas) {
        setValue('total_aulas', plan.numero_aulas);
      }
    }
  }, [selectedPlan, plans, setValue]);

  // Calcular data de fim automaticamente
  useEffect(() => {
    // Para a seção de alunos da turma, usar os dias da turma selecionada
    const daysToUse = selectedClassForStudents && selectedClassForStudents.dias_da_semana 
      ? selectedClassForStudents.dias_da_semana.split(' e ') 
      : selectedDays;
    
    if (watchedDataInicio && watchedTotalAulas && daysToUse.length > 0) {
      console.log('Calculando data de fim:', {
        dataInicio: watchedDataInicio,
        totalAulas: watchedTotalAulas,
        diasSemana: daysToUse
      });
      
      const result = calculateEndDateWithHolidays(
        watchedDataInicio,
        watchedTotalAulas,
        daysToUse
      );
      
      console.log('Resultado do cálculo:', result);
      
      setCalculatedEndDate(result.endDate);
      setDetectedHolidays(result.holidaysFound);
      
      // Atualizar o campo data_fim apenas se não foi editado manualmente
      if (!watchedDataFim || watchedDataFim === calculatedEndDate) {
        setValue('data_fim', result.endDate);
      }
      
      // Mostrar modal se feriados foram detectados
      if (result.holidaysFound.length > 0) {
        setIsHolidayModalOpen(true);
      }
    } else {
      setCalculatedEndDate('');
      setDetectedHolidays([]);
      if (!watchedDataFim) {
        setValue('data_fim', '');
      }
    }
  }, [watchedDataInicio, watchedTotalAulas, selectedDays, selectedClassForStudents, watchedDataFim, calculatedEndDate, setValue]);

  // Função para gerenciar seleção de dias
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      const newDays = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day];
      
      // Atualizar o campo dias_da_semana com os dias concatenados
      const daysString = newDays.join(' e ');
      setValue('dias_da_semana', daysString);
      
      return newDays;
    });
  };

  // Função para verificar se um feriado é a última aula do cronograma
  const isLastClassHoliday = (holidayDate: Date, startDate: string, totalClasses: number, classDays: string[]): boolean => {
    const daysOfWeek = {
      'Domingo': 0,
      'Segunda': 1,
      'Terça': 2,
      'Quarta': 3,
      'Quinta': 4,
      'Sexta': 5,
      'Sábado': 6
    };

    const classDaysNumbers = classDays.map(day => daysOfWeek[day as keyof typeof daysOfWeek]).filter(day => day !== undefined);
    let classCount = 0;
    let currentDate = new Date(startDate);
    let lastClassDate: Date | null = null;

    // Avançar para o primeiro dia de aula se necessário
    while (!classDaysNumbers.includes(currentDate.getDay())) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Simular cronograma para encontrar a última aula
    while (classCount < totalClasses) {
      if (classDaysNumbers.includes(currentDate.getDay())) {
        if (!isHoliday(currentDate)) {
          classCount++;
          lastClassDate = new Date(currentDate);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Verificar se o feriado seria a última aula
    return lastClassDate ? holidayDate.getTime() === lastClassDate.getTime() : false;
  };

  // Função para reagendar feriado
  const handleHolidayReschedule = (originalDate: Date, newDate: Date) => {
    const watchedDataInicio = watch('data_inicio');
    const watchedTotalAulas = watch('total_aulas');
    
    // Verificar se este feriado afeta a data final antes de removê-lo
    let shouldUpdateEndDate = false;
    if (watchedDataInicio && watchedTotalAulas && selectedDays.length > 0) {
      // Verificar se é a última aula ou se a nova data é posterior ao cronograma atual
      const { endDate: currentEndDate } = calculateEndDateWithHolidays(
        watchedDataInicio,
        watchedTotalAulas,
        selectedDays
      );
      
      const currentEndDateObj = new Date(currentEndDate);
      
      // Se a nova data é posterior à data atual de fim, ou se é a última aula sendo reagendada
      if (newDate > currentEndDateObj || 
          isLastClassHoliday(originalDate, watchedDataInicio, watchedTotalAulas, selectedDays)) {
        shouldUpdateEndDate = true;
      }
    }
    
    // Remover o feriado da lista
    setDetectedHolidays(prev => prev.filter(h => h.getTime() !== originalDate.getTime()));
    
    // Atualizar data de fim se necessário
    if (shouldUpdateEndDate && watchedDataInicio && watchedTotalAulas && selectedDays.length > 0) {
      // Recalcular sem o feriado reagendado
      const remainingHolidays = detectedHolidays.filter(h => h.getTime() !== originalDate.getTime());
      
      if (remainingHolidays.length === 0) {
        // Se não há mais feriados, a data de fim é a nova data reagendada ou a data calculada simples
        const simpleEndDate = calculateEndDate(watchedDataInicio, watchedTotalAulas, selectedDays);
        const simpleEndDateObj = new Date(simpleEndDate);
        
        // Usar a data mais tardia entre a calculada simples e a reagendada
        const finalEndDate = newDate > simpleEndDateObj ? newDate : simpleEndDateObj;
        setCalculatedEndDate(formatDateForDisplay(finalEndDate.toISOString().split('T')[0]));
      } else {
        // Recalcular com os feriados restantes e considerar o reagendamento
        const { endDate: recalculatedEndDate } = calculateEndDateWithHolidays(
          watchedDataInicio,
          watchedTotalAulas,
          selectedDays
        );
        const recalculatedEndDateObj = new Date(recalculatedEndDate);
        
        // Usar a data mais tardia
        const finalEndDate = newDate > recalculatedEndDateObj ? newDate : recalculatedEndDateObj;
        setCalculatedEndDate(formatDateForDisplay(finalEndDate.toISOString().split('T')[0]));
      }
    }
    
    toast({
      title: "Feriado reagendado",
      description: `Aula de ${formatDateForDisplay(originalDate.toISOString().split('T')[0])} reagendada para ${formatDateForDisplay(newDate.toISOString().split('T')[0])}`
    });
  };

  // Função para ignorar todos os feriados
  const handleIgnoreHolidays = () => {
    setDetectedHolidays([]);
    setIsHolidayModalOpen(false);
    toast({
      title: "Feriados aceitos",
      description: "Feriados foram compensados automaticamente. Data de fim ajustada."
    });
  };

  // Função para aumentar nível da turma
  const increaseClassLevel = async (classItem: Class) => {
    try {
      // Extrair número do nível atual
      const currentLevelMatch = classItem.nivel?.match(/Book (\d+)/);
      if (!currentLevelMatch) {
        toast({
          title: "Erro",
          description: "Não foi possível identificar o nível atual da turma.",
          variant: "destructive",
        });
        return;
      }

      const currentLevel = parseInt(currentLevelMatch[1]);
      if (currentLevel >= 10) {
        toast({
          title: "Aviso",
          description: "A turma já está no nível máximo (Book 10).",
          variant: "destructive",
        });
        return;
      }

      const nextLevel = currentLevel + 1;
      const newNivel = `Book ${nextLevel}`;

      // Buscar material correspondente ao novo nível
      let materialName;
      if (nextLevel === 10) {
        // Caso especial para Book 10 que está como "English Book 9,9"
        materialName = "English Book 9,9";
      } else if (nextLevel === 2) {
        // Caso especial para Book 2 que está como "English book 2 " (com espaço)
        materialName = "English book 2 ";
      } else if (nextLevel <= 5) {
        // Books 1-5 estão com 'b' minúsculo
        materialName = `English book ${nextLevel}`;
      } else {
        // Books 6+ estão com 'B' maiúsculo
        materialName = `English Book ${nextLevel}`;
      }

      const { data: newMaterial, error: materialError } = await supabase
        .from('materiais')
        .select('id')
        .eq('nome', materialName)
        .eq('idioma', classItem.idioma)
        .eq('status', 'disponivel')
        .single();

      if (materialError || !newMaterial) {
        toast({
          title: "Erro",
          description: `Material "${materialName}" não encontrado ou não disponível.`,
          variant: "destructive",
        });
        return;
      }

      // Atualizar turma com novo nível e material
      const { error: updateError } = await supabase
        .from('turmas')
        .update({
          nivel: newNivel,
          materiais_ids: [newMaterial.id]
        })
        .eq('id', classItem.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: `Turma atualizada para ${newNivel} com material ${materialName}.`,
      });

      // Recarregar lista de turmas
      fetchClasses();
    } catch (error) {
      console.error('Erro ao aumentar nível da turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aumentar o nível da turma.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchMaterials();
    fetchPlans();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          professores (nome)
        `)
        .order('nome');
  
      if (error) throw error;
      
      // Converter os dados para o formato esperado pelo tipo Class
      const formattedData = data?.map(item => ({
        ...item,
        materiais_ids: Array.isArray(item.materiais_ids) 
          ? item.materiais_ids.map(id => String(id)) // Converter cada elemento para string
          : item.materiais_ids 
            ? [String(item.materiais_ids)] // Converter valor único para string e colocar em array
            : [] // Array vazio se for null/undefined
      })) || [];
      
      setClasses(formattedData);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('status', 'disponivel')
        .order('nome');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('idioma', 'particular')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos particulares:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos particulares.",
        variant: "destructive",
      });
    }
  };

  // Função para filtrar turmas
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.idioma.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.nivel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (classItem.professores?.nome || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = tipoTurmaFilter === 'all' || classItem.tipo_turma === tipoTurmaFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Função para organizar turmas por dia da semana
  const organizeClassesByDay = (classes: Class[]) => {
    const daysOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const classesByDay: { [key: string]: Class[] } = {};
    
    // Separar turmas de um dia das turmas de múltiplos dias
    const singleDayClasses: Class[] = [];
    const multiDayClasses: Class[] = [];
    
    // Inicializar todos os dias
    daysOrder.forEach(day => {
      classesByDay[day] = [];
    });
    
    // Separar turmas por quantidade de dias
    classes.forEach(classItem => {
      const days = classItem.dias_da_semana.split(' e ');
      if (days.length > 1) {
        multiDayClasses.push(classItem);
      } else {
        singleDayClasses.push(classItem);
      }
    });
    
    // Organizar apenas turmas de um dia por dia da semana
    singleDayClasses.forEach(classItem => {
      const days = classItem.dias_da_semana.split(' e ');
      days.forEach(day => {
        const normalizedDay = day.trim();
        if (classesByDay[normalizedDay]) {
          classesByDay[normalizedDay].push(classItem);
        }
      });
    });
    
    // Ordenar turmas dentro de cada dia por horário
    Object.keys(classesByDay).forEach(day => {
      classesByDay[day].sort((a, b) => {
        const timeA = a.horario.split(':').map(Number);
        const timeB = b.horario.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
    });
    
    return { classesByDay, daysOrder, multiDayClasses };
  };

  const { classesByDay, daysOrder, multiDayClasses } = organizeClassesByDay(filteredClasses);

  // Paginação para turmas de múltiplos dias
  const totalPages = multiDayClasses.length > 0 ? Math.ceil(multiDayClasses.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMultiDayClasses = multiDayClasses.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Reset da página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tipoTurmaFilter]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Validação básica dos campos obrigatórios
      const requiredFields = {
        nome: 'Nome da turma',
        idioma: 'Idioma',
        nivel: 'Nível',
        dias_da_semana: 'Dias da semana',
        horario: 'Horário'
      };
      
      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!data[field] || data[field].trim() === '') {
          missingFields.push(label);
        }
      }
      
      if (missingFields.length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: `Por favor, preencha: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
  
      if (editingClass) {
        // Atualizar turma existente - mantém todos os campos
        const updateData = {
          nome: data.nome.trim(),
          idioma: data.idioma,
          nivel: data.nivel,
          dias_da_semana: data.dias_da_semana,
          horario: data.horario.trim(),
          professor_id: data.professor_id === 'none' ? null : data.professor_id,
          materiais_ids: selectedMaterials.length > 0 ? selectedMaterials : [],
          tipo_turma: data.tipo_turma || 'Turma',
          data_inicio: data.data_inicio || null,
          data_fim: data.data_fim || null,
          total_aulas: data.total_aulas ? parseInt(data.total_aulas) : null,
          plano_id: selectedPlan && selectedPlan !== 'none' ? selectedPlan : null,
          status: 'ativa'
        };

        const { error } = await supabase
          .from('turmas')
          .update(updateData)
          .eq('id', editingClass.id);

        if (error) {
          console.error('Erro ao atualizar turma:', error);
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso!",
        });
      } else {
        // Criar nova turma - apenas campos especificados
        const insertData = {
          nome: data.nome.trim(),
          idioma: data.idioma,
          dias_da_semana: data.dias_da_semana,
          horario: data.horario.trim(),
          professor_id: data.professor_id === 'none' ? null : data.professor_id,
          sala_id: null, // Campo disponível mas não implementado no form
          materiais_ids: selectedMaterials.length > 0 ? selectedMaterials : [],
          nivel: data.nivel,
          tipo_turma: data.tipo_turma || 'Turma',
          status: 'ativa'
          // Campos ignorados: data_inicio, data_fim, total_aulas, plano_id
        };

        const { error } = await supabase
          .from('turmas')
          .insert(insertData);

        if (error) {
          console.error('Erro ao criar turma:', error);
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        });
      }

      // Reset após sucesso
      setIsDialogOpen(false);
      setEditingClass(null);
      reset();
      setSelectedMaterials([]);
      setSelectedDays([]);
      setCalculatedEndDate('');
      setDetectedHolidays([]);
      setSelectedPlan('');
      setClassDataInicio('');
      setClassDataFim('');
      
      // Recarregar lista de turmas
      await fetchClasses();
      
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      
      // Tratamento de erros
      let errorMessage = "Não foi possível salvar a turma.";
      
      if (error.code === '23505') {
        errorMessage = "Já existe uma turma com este nome.";
      } else if (error.code === '23503') {
        errorMessage = "Erro de referência: verifique se o professor selecionado existe.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (classItem: Class) => {
    setClassToDelete(classItem);
    setDeleteConfirmation('');
    setIsDeleteDialogOpen(true);
  };

  const fetchClassStudents = async (classId: string) => {
    try {
      setLoadingStudents(true);
      
      // Buscar informações da turma para determinar o tipo
      const { data: classData, error: classError } = await supabase
        .from('turmas')
        .select('tipo_turma')
        .eq('id', classId)
        .single();
        
      if (classError) throw classError;
      
      const isParticularClass = classData?.tipo_turma === 'Turma particular';
      
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, email, telefone, status')
        .or(isParticularClass ? `turma_particular_id.eq.${classId}` : `turma_id.eq.${classId}`)
        .order('nome');

      if (error) throw error;
      setClassStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos da turma.",
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, email, status, turma_id, turma_particular_id, aulas_particulares, aulas_turma')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setAllStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    }
  };

  const openStudentsDialog = async (classItem: Class) => {
    setSelectedClassForStudents(classItem);
    setIsStudentsDialogOpen(true);
    await fetchClassStudents(classItem.id);
  };

  const openAddStudentDialog = async () => {
    setIsAddStudentDialogOpen(true);
    await fetchAllStudents();
  };

  const addStudentsToClass = async () => {
    if (!selectedClassForStudents || selectedStudentsToAdd.length === 0) return;

    try {
      // Verificar quantos alunos já estão na turma (regular ou particular)
      const isParticularClass = selectedClassForStudents.tipo_turma === 'Turma particular';
      const { data: currentStudents, error: countError } = await supabase
        .from('alunos')
        .select('id, turma_id, turma_particular_id')
        .or(isParticularClass ? `turma_particular_id.eq.${selectedClassForStudents.id}` : `turma_id.eq.${selectedClassForStudents.id}`)
        .eq('status', 'Ativo');

      if (countError) throw countError;

      const currentCount = currentStudents?.length || 0;
      
      // Definir limite baseado no tipo de turma
      const maxStudents = selectedClassForStudents.tipo_turma === 'Turma particular' ? 2 : 10;
      const tipoTurmaTexto = selectedClassForStudents.tipo_turma === 'Turma particular' ? 'particular' : 'regular';
      const availableSlots = maxStudents - currentCount;

      if (availableSlots <= 0) {
        toast({
          title: "Limite Atingido",
          description: `Esta turma ${tipoTurmaTexto} já possui o máximo de ${maxStudents} alunos.`,
          variant: "destructive",
        });
        return;
      }

      // Filtrar alunos que já estão nesta turma específica
      const studentsAlreadyInClass = currentStudents?.map(s => s.id) || [];
      const studentsToAdd = selectedStudentsToAdd.filter(id => !studentsAlreadyInClass.includes(id));
      
      if (studentsToAdd.length === 0) {
        toast({
          title: "Aviso",
          description: "Todos os alunos selecionados já estão matriculados nesta turma.",
          variant: "default",
        });
        return;
      }

      if (studentsToAdd.length > availableSlots) {
        toast({
          title: "Limite Excedido",
          description: `Esta turma ${tipoTurmaTexto} só pode receber mais ${availableSlots} aluno(s). Máximo de ${maxStudents} alunos por turma ${tipoTurmaTexto}.`,
          variant: "destructive",
        });
        return;
      }

      // Processar cada aluno individualmente para múltiplas matrículas
      let successCount = 0;
      let warningMessages: string[] = [];
      
      for (const studentId of studentsToAdd) {
        // Buscar dados atuais do aluno
        const { data: studentData, error: studentError } = await supabase
          .from('alunos')
          .select('turma_id, turma_particular_id, aulas_particulares, aulas_turma, nome')
          .eq('id', studentId)
          .single();
          
        if (studentError) {
          console.error(`Erro ao buscar dados do aluno ${studentId}:`, studentError);
          continue;
        }
        
        // Determinar se é turma particular ou regular
        const isParticularClass = selectedClassForStudents.tipo_turma === 'Turma particular';
        
        if (isParticularClass) {
          // Adicionar à turma particular
          const { error: updateError } = await supabase
            .from('alunos')
            .update({ 
              turma_particular_id: selectedClassForStudents.id,
              aulas_particulares: true 
            })
            .eq('id', studentId);
            
          if (updateError) {
            console.error(`Erro ao matricular aluno ${studentId} em turma particular:`, updateError);
            continue;
          }
          
          successCount++;
        } else {
          // Adicionar à turma regular
          if (!studentData.turma_id) {
            // Aluno não tem turma regular, definir esta como principal
            const { error: updateError } = await supabase
              .from('alunos')
              .update({ 
                turma_id: selectedClassForStudents.id,
                aulas_turma: true 
              })
              .eq('id', studentId);
              
            if (updateError) {
              console.error(`Erro ao matricular aluno ${studentId}:`, updateError);
              continue;
            }
            
            successCount++;
          } else if (studentData.turma_id !== selectedClassForStudents.id) {
            // Aluno já tem uma turma principal diferente
            warningMessages.push(`${studentData.nome} já possui uma turma regular. Para múltiplas turmas regulares, execute o script SQL de múltiplas matrículas.`);
          }
        }
      }

      // Mostrar mensagens de resultado
      if (successCount > 0) {
        toast({
          title: "Sucesso",
          description: `${successCount} aluno(s) matriculado(s) com sucesso!`,
        });
      }
      
      if (warningMessages.length > 0) {
        toast({
          title: "Avisos",
          description: warningMessages.join(' '),
          variant: "default",
        });
      }
      
      if (successCount === 0 && warningMessages.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum aluno pôde ser matriculado.",
          variant: "destructive",
        });
      }

      setIsAddStudentDialogOpen(false);
      setSelectedStudentsToAdd([]);
      setStudentSearchQuery('');
      await fetchClassStudents(selectedClassForStudents.id);
    } catch (error) {
      console.error('Erro ao adicionar alunos à turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os alunos à turma.",
        variant: "destructive",
      });
    }
  };

  const removeStudentFromClass = async (studentId: string) => {
    try {
      if (!selectedClassForStudents) return;
      
      const isParticularClass = selectedClassForStudents.tipo_turma === 'Turma particular';
      
      const updateData = isParticularClass 
        ? { turma_particular_id: null, aulas_particulares: false }
        : { turma_id: null, aulas_turma: false };
      
      const { error } = await supabase
        .from('alunos')
        .update(updateData)
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Aluno removido da turma ${isParticularClass ? 'particular' : 'regular'} com sucesso!`,
      });

      if (selectedClassForStudents) {
        await fetchClassStudents(selectedClassForStudents.id);
      }
    } catch (error) {
      console.error('Erro ao remover aluno da turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno da turma.",
        variant: "destructive",
      });
    }
  };

  const handleSaveClassConfiguration = async () => {
    if (!selectedClassForStudents) return;

    try {
      setLoading(true);
      
      const formData = getValues();
      
      // Preparar dados para atualização
      const updateData: any = {
        total_aulas: formData.total_aulas,
        data_inicio: formData.data_inicio || null,
        data_fim: formData.data_fim || null,
      };

      // Se for turma particular e tiver plano selecionado, salvar o plano
      if (selectedClassForStudents.tipo_turma === 'Turma particular' && selectedPlan && selectedPlan !== 'none') {
        updateData.plano_id = selectedPlan;
      }

      const { error } = await supabase
        .from('turmas')
        .update(updateData)
        .eq('id', selectedClassForStudents.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações da turma salvas com sucesso.",
      });

      // Atualizar a lista de turmas
      await fetchClasses();
      
      // Atualizar os dados da turma selecionada
      const updatedClass = { ...selectedClassForStudents, ...updateData };
      setSelectedClassForStudents(updatedClass);
      
    } catch (error) {
      console.error('Erro ao salvar configurações da turma:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações da turma.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation !== 'SIM' || !classToDelete) {
      toast({
        title: "Confirmação inválida",
        description: "Digite 'SIM' para confirmar a exclusão.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteClass(classToDelete.id);
      setIsDeleteDialogOpen(false);
      setClassToDelete(null);
      setDeleteConfirmation('');
    } catch (error) {
      // Erro já tratado na função deleteClass
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      // Verificar se a turma existe
      const { data: classExists, error: fetchError } = await supabase
        .from('turmas')
        .select('nome')
        .eq('id', id)
        .single();

      if (fetchError || !classExists) {
        throw new Error('Turma não encontrada.');
      }

      // Excluir aulas relacionadas automaticamente
      const { data: relatedAulas, error: aulasError } = await supabase
        .from('aulas')
        .select('id')
        .eq('turma_id', id);

      if (aulasError) {
        throw new Error('Erro ao verificar aulas relacionadas.');
      }

      if (relatedAulas && relatedAulas.length > 0) {
        console.log(`Excluindo ${relatedAulas.length} aulas relacionadas à turma...`);
        const { error: deleteAulasError } = await supabase
          .from('aulas')
          .delete()
          .eq('turma_id', id);

        if (deleteAulasError) {
          throw new Error(`Erro ao excluir aulas relacionadas: ${deleteAulasError.message}`);
        }
      }

      // Excluir registros relacionados automaticamente
      
      // Excluir pesquisas de satisfação relacionadas
      const { data: relatedRecords, error: checkError } = await supabase
        .from('pesquisas_satisfacao')
        .select('id')
        .eq('turma_id', id);

      if (checkError) {
        console.warn('Erro ao verificar pesquisas relacionadas:', checkError);
      } else if (relatedRecords && relatedRecords.length > 0) {
        console.log(`Excluindo ${relatedRecords.length} pesquisas de satisfação relacionadas...`);
        const { error: deletePesquisasError } = await supabase
          .from('pesquisas_satisfacao')
          .delete()
          .eq('turma_id', id);
        
        if (deletePesquisasError) {
          console.warn('Erro ao excluir pesquisas relacionadas:', deletePesquisasError);
        }
      }

      // Excluir planos de aula relacionados
      const { data: relatedPlanos, error: planosError } = await supabase
        .from('planos_aula')
        .select('id')
        .eq('turma_id', id);

      if (planosError) {
        console.warn('Erro ao verificar planos relacionados:', planosError);
      } else if (relatedPlanos && relatedPlanos.length > 0) {
        console.log(`Excluindo ${relatedPlanos.length} planos de aula relacionados...`);
        const { error: deletePlanosError } = await supabase
          .from('planos_aula')
          .delete()
          .eq('turma_id', id);
        
        if (deletePlanosError) {
          console.warn('Erro ao excluir planos relacionados:', deletePlanosError);
        }
      }

      // Excluir ranking relacionado
      const { data: relatedRanking, error: rankingError } = await supabase
        .from('ranking')
        .select('id')
        .eq('turma_id', id);

      if (rankingError) {
        console.warn('Erro ao verificar ranking relacionado:', rankingError);
      } else if (relatedRanking && relatedRanking.length > 0) {
        console.log(`Excluindo ${relatedRanking.length} registros de ranking relacionados...`);
        const { error: deleteRankingError } = await supabase
          .from('ranking')
          .delete()
          .eq('turma_id', id);
        
        if (deleteRankingError) {
          console.warn('Erro ao excluir ranking relacionado:', deleteRankingError);
        }
      }

      // Tentar excluir a turma
      const { error: deleteError } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Erro na exclusão:', deleteError);
        throw new Error(`Erro ao excluir turma: ${deleteError.message}`);
      }
      
      toast({
        title: "Sucesso",
        description: `Turma "${classExists.nome}" excluída com sucesso!`,
        duration: 5000,
      });
      
      // Atualizar a lista de turmas
      await fetchClasses();
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      toast({
        title: "Erro na Exclusão",
        description: error instanceof Error ? error.message : "Não foi possível excluir a turma.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (classItem: Class) => {
    setEditingClass(classItem);
    reset({
      nome: classItem.nome,
      idioma: classItem.idioma,
      nivel: classItem.nivel || '',
      dias_da_semana: classItem.dias_da_semana,
      horario: classItem.horario,
      professor_id: classItem.professor_id || 'none',
      tipo_turma: classItem.tipo_turma || 'Turma',
      data_inicio: classItem.data_inicio || '',
      total_aulas: classItem.total_aulas || 0,
      data_fim: classItem.data_fim || ''
    });
    
    // Carregar dias selecionados a partir da string
    const daysArray = classItem.dias_da_semana ? classItem.dias_da_semana.split(' e ') : [];
    setSelectedDays(daysArray);
    
    // Carregar materiais selecionados
    setSelectedMaterials(classItem.materiais_ids || []);
    
    // Calcular data de fim se houver dados suficientes
    if (classItem.data_inicio && classItem.total_aulas && daysArray.length > 0) {
      const endDate = calculateEndDate(classItem.data_inicio, classItem.total_aulas, daysArray);
      setCalculatedEndDate(endDate);
    }
    
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingClass(null);
    
    // Reset completo do formulário com valores padrão alinhados ao banco
    reset({
      nome: '',
      idioma: '',
      nivel: '',
      dias_da_semana: '',
      horario: '',
      professor_id: 'none',
      tipo_turma: 'Turma', // Valor padrão do banco
      data_inicio: '',
      data_fim: '',
      total_aulas: 0
    });
    
    // Reset de todos os estados relacionados
    setSelectedMaterials([]);
    setSelectedDays([]);
    setCalculatedEndDate('');
    setDetectedHolidays([]);
    setSelectedPlan('');
    setClassDataInicio('');
    setClassDataFim('');
    
    // Abrir o modal
    setIsDialogOpen(true);
  };

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };



  const filteredTeachers = teachers.filter(teacher => 
    !selectedIdioma || teacher.idiomas.includes(selectedIdioma)
  );

  const filteredMaterials = materials.filter(material =>
    !selectedIdioma || material.idioma === selectedIdioma
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando turmas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Turmas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-brand-red hover:bg-brand-red/90"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <BookCopy className="h-5 w-5 text-brand-red" />
                {editingClass ? 'Editar Turma' : 'Nova Turma'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Seção: Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações Básicas</h3>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                      Nome da Turma *
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateStandardName}
                      className="text-xs px-2 py-1 h-7"
                    >
                      <BookCopy className="h-3 w-3 mr-1" />
                      Nome Padrão
                    </Button>
                  </div>
                  <Input
                    id="nome"
                    {...register('nome', { 
                      required: 'Nome é obrigatório',
                      minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                    })}
                    placeholder="Ex: Book 1 - Quinta - 16:00 às 18:00"
                    className="mt-1"
                  />
                  {errors.nome && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.nome.message}</p>
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    💡 Use o botão "Nome Padrão" para gerar automaticamente: Book X - Dia - Horário às Horário
                  </div>
                </div>

                <div>
                  <Label htmlFor="idioma" className="text-sm font-medium text-gray-700">
                    Idioma *
                  </Label>
                  <Controller
                    name="idioma"
                    control={control}
                    rules={{ required: 'Idioma é obrigatório' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inglês">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Inglês
                            </div>
                          </SelectItem>
                          <SelectItem value="Japonês">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Japonês
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.idioma && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.idioma.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="nivel" className="text-sm font-medium text-gray-700">
                    Nível *
                  </Label>
                  <Controller
                    name="nivel"
                    control={control}
                    rules={{ required: 'Nível é obrigatório' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                      <SelectItem value="Book 1">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 1
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 2">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 2
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 3">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 3
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 4">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 4
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 5">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 5
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 6">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 6
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 7">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 7
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 8">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 8
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 9">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 9
                        </div>
                      </SelectItem>
                      <SelectItem value="Book 10">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Book 10
                        </div>
                      </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.nivel && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.nivel.message}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Seção: Configurações da Turma */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Configurações da Turma</h3>
                
                <div>
                  <Label htmlFor="tipo_turma" className="text-sm font-medium text-gray-700">
                    Tipo de Turma *
                  </Label>
                  <Controller
                    name="tipo_turma"
                    control={control}
                    rules={{ required: 'Tipo de turma é obrigatório' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                      <SelectItem value="Turma">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Turma Regular
                        </div>
                      </SelectItem>
                      <SelectItem value="Turma particular">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Turma Particular
                        </div>
                      </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              
              {/* Seção: Materiais */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-medium text-gray-900">Materiais</h3>
                  {selectedMaterials.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {selectedMaterials.length} selecionado{selectedMaterials.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  {filteredMaterials.length === 0 ? (
                    <div className="text-center py-8">
                      <BookCopy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {selectedIdioma ? `Nenhum material disponível para ${selectedIdioma}` : 'Selecione um idioma para ver os materiais'}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-3">
                      {filteredMaterials.map((material) => (
                        <div key={material.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-white transition-colors">
                          <Checkbox
                            id={`material-${material.id}`}
                            checked={selectedMaterials.includes(material.id)}
                            onCheckedChange={() => handleMaterialToggle(material.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={`material-${material.id}`} 
                              className="text-sm font-medium cursor-pointer block"
                            >
                              {material.nome}
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {material.idioma}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {material.nivel}
                              </Badge>
                              <Badge 
                                variant={material.status === 'ativo' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {material.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Seção: Horários */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Horários</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Dias da Semana *
                    </Label>
                    <div className="mt-2 space-y-2">
                      {[
                        { value: 'Segunda', label: 'Segunda-feira' },
                        { value: 'Terça', label: 'Terça-feira' },
                        { value: 'Quarta', label: 'Quarta-feira' },
                        { value: 'Quinta', label: 'Quinta-feira' },
                        { value: 'Sexta', label: 'Sexta-feira' },
                        { value: 'Sábado', label: 'Sábado' },
                        { value: 'Domingo', label: 'Domingo' }
                      ].map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={day.value}
                            checked={selectedDays.includes(day.value)}
                            onCheckedChange={() => handleDayToggle(day.value)}
                            className="h-4 w-4"
                          />
                          <Label 
                            htmlFor={day.value} 
                            className="text-sm font-normal cursor-pointer flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedDays.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Dias selecionados:</strong> {selectedDays.join(' e ')}
                        </p>
                      </div>
                    )}
                    {errors.dias_da_semana && (
                      <div className="mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.dias_da_semana.message}</p>
                      </div>
                    )}
                  </div>
                
                  <div>
                    <Label htmlFor="horario" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      🕐 Horário *
                    </Label>
                    <div className="mt-1 relative">
                      <Input
                        id="horario"
                        {...register('horario', { 
                          required: 'Horário é obrigatório',
                          pattern: {
                            value: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                            message: 'Complete o horário de início e fim'
                          }
                        })}
                        placeholder="Digite: 8:00"
                        className="pr-10"
                        onChange={(e) => {
                          let value = e.target.value;
                          
                          // Remove caracteres não permitidos
                          value = value.replace(/[^0-9: -]/g, '');
                          
                          // Auto-formatação inteligente
                          if (value.length === 1 && /[0-9]/.test(value)) {
                            // Se digitou apenas um número, não faz nada ainda
                          } else if (value.length === 2 && /^[0-9]{2}$/.test(value)) {
                            // Se digitou dois números (ex: "08"), adiciona :
                            value = value + ':';
                          } else if (value.length === 4 && /^[0-9]{1,2}:[0-9]$/.test(value)) {
                            // Se digitou H:M, não faz nada ainda
                          } else if (value.length === 5 && /^[0-9]{1,2}:[0-9]{2}$/.test(value)) {
                            // Se completou HH:MM, adiciona " - "
                            value = value + ' - ';
                          } else if (value.length === 8 && /^[0-9]{1,2}:[0-9]{2} - $/.test(value)) {
                            // Aguarda o usuário digitar o próximo horário
                          } else if (value.length === 9 && /^[0-9]{1,2}:[0-9]{2} - [0-9]$/.test(value)) {
                            // Se digitou o primeiro número do segundo horário
                          } else if (value.length === 10 && /^[0-9]{1,2}:[0-9]{2} - [0-9]{2}$/.test(value)) {
                            // Se digitou dois números do segundo horário, adiciona :
                            const parts = value.split(' - ');
                            value = parts[0] + ' - ' + parts[1] + ':';
                          }
                          
                          // Limita o tamanho máximo
                          if (value.length > 13) {
                            value = value.substring(0, 13);
                          }
                          
                          e.target.value = value;
                          setValue('horario', value);
                        }}
                        onKeyDown={(e) => {
                          // Permite apenas números, backspace, delete, tab, enter, e :
                          if (!/[0-9]/.test(e.key) && 
                              !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', ':'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      
                      {/* Ícone de relógio */}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    

                    
                    {/* Mensagem de erro */}
                    {errors.horario && (
                      <div className="mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.horario.message}</p>
                      </div>
                    )}
                    
                    {/* Indicador de duração (só aparece quando horário está completo e válido) */}
                    {(() => {
                      const horario = watch('horario');
                      if (!horario || errors.horario) return null;
                      
                      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])\s*-\s*([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
                      const match = horario.match(timeRegex);
                      if (match) {
                        const startHour = parseInt(match[1]);
                        const startMin = parseInt(match[2]);
                        const endHour = parseInt(match[3]);
                        const endMin = parseInt(match[4]);
                        
                        const startTime = startHour * 60 + startMin;
                        const endTime = endHour * 60 + endMin;
                        const duration = endTime - startTime;
                        
                        if (duration > 0) {
                          const hours = Math.floor(duration / 60);
                          const minutes = duration % 60;
                          let durationText = '';
                          if (hours > 0) durationText += `${hours}h `;
                          if (minutes > 0) durationText += `${minutes}min`;
                          
                          return (
                            <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Duração: {durationText.trim()}</span>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Seção: Recursos */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Recursos</h3>
                
                <div>
                  <Label htmlFor="professor_id" className="text-sm font-medium text-gray-700">
                    Professor
                  </Label>
                  <Controller
                    name="professor_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione um professor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              Sem professor
                            </div>
                          </SelectItem>
                          {filteredTeachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-green-600" />
                                {teacher.nome}
                                <Badge variant="outline" className="text-xs ml-2">
                                  {teacher.idiomas}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {selectedIdioma && filteredTeachers.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Nenhum professor disponível para {selectedIdioma}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Botões de Ação - Reorganizados */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingClass(null);
                    reset();
                    setSelectedMaterials([]);
                    setSelectedDays([]);
                  }}
                  className="px-6 flex items-center gap-2"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                
                <Button 
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    const formData = getValues();
                    await onSubmit(formData);
                  }}
                  className="bg-brand-red hover:bg-brand-red/90 px-6 flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      {editingClass ? (
                        <>
                          <Edit className="h-4 w-4" />
                          Atualizar Turma
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Criar Turma
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookCopy className="h-5 w-5" />
            Lista de Turmas ({filteredClasses.length} de {classes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barra de pesquisa e filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por nome, idioma, nível ou professor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={tipoTurmaFilter} onValueChange={setTipoTurmaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Turma">Turma Regular</SelectItem>
                  <SelectItem value="Turma particular">Turma Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idioma</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Tipo de Turma</TableHead>
                <TableHead>Materiais</TableHead>
                <TableHead>Total de Aulas</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daysOrder.map(day => {
                const dayClasses = classesByDay[day];
                if (dayClasses.length === 0) return null;
                
                return (
                  <React.Fragment key={day}>
                    {/* Separador do dia da semana */}
                    <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
                      <TableCell colSpan={9} className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                            {day.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">{day}-feira</h3>
                            <p className="text-sm text-blue-700">{dayClasses.length} turma{dayClasses.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Turmas do dia */}
                    {dayClasses.map((classItem) => (
                      <TableRow key={`${day}-${classItem.id}`} className="hover:bg-blue-25">
                        <TableCell className="font-medium text-base pl-12">{classItem.nome}</TableCell>
                        <TableCell>
                          <Badge className={`text-sm ${getIdiomaColor(classItem.idioma)}`}>
                            {classItem.idioma}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-sm bg-red-50 text-red-700 border-red-200">
                            {classItem.nivel || 'Não definido'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-sm ${
                              classItem.tipo_turma === 'Turma particular' 
                                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {classItem.tipo_turma === 'Turma particular' ? 'Particular' : 'Regular'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-base text-gray-600">
                            {(classItem.materiais_ids?.length) || 0} materiais
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookCopy className={`h-4 w-4 ${(classItem.total_aulas || 0) === 0 ? 'text-red-500' : 'text-green-500'}`} />
                            <span className={`text-base font-medium ${(classItem.total_aulas || 0) === 0 ? 'text-red-700' : 'text-green-700'}`}>
                              {classItem.total_aulas || 0} aulas
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-base flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              {classItem.horario}
                            </div>
                            <div className="text-sm text-gray-500">{classItem.dias_da_semana}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-base">
                          {classItem.professores?.nome || (
                            <span className="text-gray-400 italic">Sem professor</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStudentsDialog(classItem)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Ver alunos da turma"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => increaseClassLevel(classItem)}
                              className="text-green-600 hover:text-green-700"
                              title="Aumentar nível da turma"
                              disabled={classItem.nivel === 'Book 10'}
                            >
                              <GraduationCap className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(classItem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(classItem)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
              
              {/* Seção de turmas com múltiplos dias */}
              {multiDayClasses.length > 0 && (
                <React.Fragment>
                  <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-500">
                    <TableCell colSpan={9} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-bold">
                          M
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-purple-900">Turmas com Múltiplos Dias</h3>
                          <p className="text-sm text-purple-700">{multiDayClasses.length} turma{multiDayClasses.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Turmas paginadas */}
                  {paginatedMultiDayClasses.map((classItem) => (
                    <TableRow key={`multi-${classItem.id}`} className="hover:bg-purple-25">
                      <TableCell className="font-medium text-base pl-12">{classItem.nome}</TableCell>
                      <TableCell>
                        <Badge className={`text-sm ${getIdiomaColor(classItem.idioma)}`}>
                          {classItem.idioma}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-sm bg-red-50 text-red-700 border-red-200">
                          {classItem.nivel || 'Não definido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-sm ${
                            classItem.tipo_turma === 'Turma particular' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {classItem.tipo_turma === 'Turma particular' ? 'Particular' : 'Regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-base text-gray-600">
                          {(classItem.materiais_ids?.length) || 0} materiais
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookCopy className={`h-4 w-4 ${(classItem.total_aulas || 0) === 0 ? 'text-red-500' : 'text-green-500'}`} />
                          <span className={`text-base font-medium ${(classItem.total_aulas || 0) === 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {classItem.total_aulas || 0} aulas
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            {classItem.horario}
                          </div>
                          <div className="text-sm text-gray-500">{classItem.dias_da_semana}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-base">
                        {classItem.professores?.nome || (
                          <span className="text-gray-400 italic">Sem professor</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStudentsDialog(classItem)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Ver alunos da turma"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => increaseClassLevel(classItem)}
                            className="text-green-600 hover:text-green-700"
                            title="Aumentar nível da turma"
                            disabled={classItem.nivel === 'Book 10'}
                          >
                            <GraduationCap className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(classItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(classItem)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              )}
              
              {/* Mensagem quando não há turmas */}
              {filteredClasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Nenhuma turma encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Controles de paginação para turmas de múltiplos dias */}
          {multiDayClasses.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, multiDayClasses.length)} de {multiDayClasses.length} turmas com múltiplos dias
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-600">Página {currentPage} de {totalPages || 0}</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-purple-300 hover:bg-purple-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 border-purple-300 hover:bg-purple-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
               <p className="text-sm text-red-800">
                 <strong>Atenção:</strong> Esta ação não pode ser desfeita!
               </p>
               <p className="text-sm text-red-700 mt-2">
                 Você está prestes a excluir a turma:
               </p>
               <p className="font-semibold text-red-900 mt-1">
                 {classToDelete?.nome} - {classToDelete?.idioma} ({classToDelete?.nivel})
               </p>
               <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                 <p className="text-xs text-yellow-800">
                   <strong>Importante:</strong> Todos os registros relacionados a esta turma também serão excluídos automaticamente:
                 </p>
                 <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                   <li>Aulas cadastradas</li>
                   <li>Pesquisas de satisfação</li>
                   <li>Planos de aula</li>
                   <li>Registros de ranking</li>
                 </ul>
               </div>
             </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                Para confirmar, digite <strong>SIM</strong> no campo abaixo:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Digite SIM para confirmar"
                className="text-center font-semibold"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setClassToDelete(null);
                  setDeleteConfirmation('');
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmation !== 'SIM' || isDeleting}
                className="min-w-[100px]"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Excluindo...
                  </div>
                ) : (
                  'Excluir Turma'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
       </Dialog>

       {/* Modal de Visualização de Alunos da Turma */}
       <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
         <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-blue-600">
               <Users className="h-5 w-5" />
               Alunos da Turma: {selectedClassForStudents?.nome}
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-semibold text-blue-900">
                     {selectedClassForStudents?.nome} - {selectedClassForStudents?.idioma}
                   </p>
                   <p className="text-sm text-blue-700">
                     Nível: {selectedClassForStudents?.nivel} | Total de alunos: {classStudents?.length || 0}
                   </p>
                 </div>
                 <Button
                   onClick={openAddStudentDialog}
                   className="bg-blue-600 hover:bg-blue-700"
                   size="sm"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Adicionar Alunos
                 </Button>
               </div>
             </div>

             {/* Seção de Configurações da Turma - apenas para turmas particulares */}
             {/* Configurações da Turma - Campos de Data e Aulas */}
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
               <h3 className="text-lg font-medium text-blue-900 border-b border-blue-200 pb-2">
                 Configurações da Turma
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Total de Aulas */}
                  <div>
                    <Label htmlFor="total_aulas" className="text-sm font-medium text-gray-700">
                      Total de Aulas *
                      {selectedPlan && selectedPlan !== 'none' && (
                        <span className="text-xs text-green-600 ml-1">(Do plano selecionado)</span>
                      )}
                    </Label>
                    <Input
                      id="total_aulas"
                      type="number"
                      min="0"
                      max="100"
                      {...register('total_aulas', {
                        required: 'Total de aulas é obrigatório',
                        min: { value: 0, message: 'Mínimo 0 aulas' },
                        max: { value: 100, message: 'Máximo 100 aulas' }
                      })}
                      className="mt-1"
                      placeholder="Ex: 20"
                      readOnly={selectedPlan && selectedPlan !== 'none'}
                    />
                    {selectedPlan && selectedPlan !== 'none' && (
                      <div className="mt-1 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-xs text-green-600">
                          Valor obtido do plano selecionado
                        </p>
                      </div>
                    )}
                    {errors.total_aulas && (
                      <div className="mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.total_aulas.message}</p>
                      </div>
                    )}
                  </div>

                 {/* Data de Início */}
                 <div>
                   <Label htmlFor="data_inicio" className="text-sm font-medium text-gray-700">
                     Data de Início *
                   </Label>
                   <Input
                     id="data_inicio"
                     type="date"
                     {...register('data_inicio', {
                       required: 'Data de início é obrigatória'
                     })}
                     className="mt-1"
                   />
                   {errors.data_inicio && (
                     <div className="mt-1 flex items-center gap-1">
                       <AlertTriangle className="h-4 w-4 text-red-500" />
                       <p className="text-sm text-red-600">{errors.data_inicio.message}</p>
                     </div>
                   )}
                 </div>

                 {/* Data de Fim */}
                 <div>
                   <Label htmlFor="data_fim" className="text-sm font-medium text-gray-700">
                     Data de Fim
                     <span className="text-xs text-gray-500 ml-1">(Automática)</span>
                   </Label>
                   <Input
                     id="data_fim"
                     type="date"
                     {...register('data_fim')}
                     className="mt-1"
                     placeholder="Será calculada automaticamente"
                   />
                   {calculatedEndDate && (
                     <div className="mt-1 flex items-center gap-1">
                       <CheckCircle className="h-4 w-4 text-green-500" />
                       <p className="text-xs text-green-600">
                         Calculada: {formatDateForDisplay(calculatedEndDate)}
                       </p>
                     </div>
                   )}
                   {detectedHolidays.length > 0 && (
                     <div className="mt-1 flex items-center gap-1">
                       <AlertTriangle className="h-4 w-4 text-amber-500" />
                       <p className="text-xs text-amber-600">
                         {detectedHolidays.length} feriado(s) detectado(s)
                       </p>
                     </div>
                   )}
                 </div>
               </div>
             </div>

             {selectedClassForStudents?.tipo_turma === 'Turma particular' && (
               <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                 <h3 className="text-lg font-medium text-purple-900 border-b border-purple-200 pb-2">
                   Configurações da Turma Particular
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Seleção de Plano */}
                   <div>
                     <Label htmlFor="plano_particular" className="text-sm font-medium text-gray-700">
                       Plano Particular
                     </Label>
                     <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                       <SelectTrigger className="mt-1">
                         <SelectValue placeholder="Selecione um plano" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2">
                              <X className="h-4 w-4" />
                              Nenhum plano
                            </div>
                          </SelectItem>
                         {plans.map((plan) => (
                           <SelectItem key={plan.id} value={plan.id}>
                             <div className="flex items-center gap-2">
                               <BookCopy className="h-4 w-4" />
                               {plan.nome}
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   {/* Informações do Plano Selecionado */}
                   {(() => {
                     if (!selectedPlan || selectedPlan === 'none') return null;
                     
                     const plan = plans.find(p => p.id === selectedPlan);
                     return plan ? (
                       <div className="bg-white rounded-lg p-3 border">
                         <h4 className="text-sm font-medium text-gray-900 mb-2">Informações do Plano</h4>
                         <div className="space-y-1 text-xs">
                           <p><strong>Aulas:</strong> {plan.numero_aulas}</p>
                           <p><strong>Carga Horária:</strong> {plan.carga_horaria_total || 'N/A'} horas</p>
                           <p><strong>Valor:</strong> R$ {plan.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</p>
                           <p><strong>Frequência:</strong> {plan.frequencia_aulas || 'N/A'}</p>
                         </div>
                       </div>
                     ) : null;
                   })()}
                 </div>
               </div>
             )}

             {loadingStudents ? (
               <div className="flex items-center justify-center py-8">
                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                 <span className="ml-2 text-gray-600">Carregando alunos...</span>
               </div>
             ) : classStudents.length === 0 ? (
               <div className="text-center py-8">
                 <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-600">Nenhum aluno cadastrado nesta turma</p>
                 <Button
                   onClick={openAddStudentDialog}
                   className="mt-4 bg-blue-600 hover:bg-blue-700"
                   size="sm"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Adicionar Primeiro Aluno
                 </Button>
               </div>
             ) : (
               <div className="space-y-2">
                 <h3 className="font-semibold text-gray-900">Lista de Alunos ({classStudents.length})</h3>
                 <div className="border rounded-lg">
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Nome</TableHead>
                         <TableHead>Email</TableHead>
                         <TableHead>Telefone</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead>Ações</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {classStudents.map((student) => (
                         <TableRow key={student.id}>
                           <TableCell className="font-medium">{student.nome}</TableCell>
                           <TableCell>{student.email || '-'}</TableCell>
                           <TableCell>{student.telefone || '-'}</TableCell>
                           <TableCell>
                             <Badge variant={student.status === 'Ativo' ? 'default' : 'secondary'}>
                               {student.status}
                             </Badge>
                           </TableCell>
                           <TableCell>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => removeStudentFromClass(student.id)}
                               className="text-red-600 hover:text-red-700"
                               title="Remover da turma"
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
               </div>
             )}
             
             {/* Botão de Salvar Configurações */}
             <div className="flex justify-end pt-4 border-t border-gray-200">
               <Button
                 onClick={handleSaveClassConfiguration}
                 className="bg-green-600 hover:bg-green-700 text-white"
                 disabled={loading}
               >
                 {loading ? (
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     Salvando...
                   </div>
                 ) : (
                   <div className="flex items-center gap-2">
                     <CheckCircle className="h-4 w-4" />
                     Salvar Configurações
                   </div>
                 )}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Modal de Adicionar Alunos à Turma */}
       <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
         <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-green-600">
               <Plus className="h-5 w-5" />
               Adicionar Alunos à Turma: {selectedClassForStudents?.nome}
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
               <p className="text-sm text-green-800">
                 <strong>Múltiplas Matrículas:</strong> Alunos podem estar em várias turmas simultaneamente.
               </p>
               <p className="text-xs text-green-700 mt-1">
                 • Alunos sem turma: serão matriculados como turma principal<br/>
                 • Alunos com turma: serão marcados para múltiplas matrículas
               </p>
             </div>

             {/* Informação sobre limite de alunos */}
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <div className="flex items-center justify-between">
                 <p className="text-sm text-blue-800">
                   <strong>Limite de alunos:</strong> Máximo {selectedClassForStudents?.tipo_turma === 'Turma particular' ? '2' : '10'} alunos por turma {selectedClassForStudents?.tipo_turma === 'Turma particular' ? 'particular' : 'regular'}
                 </p>
                 <p className="text-sm text-blue-600 font-medium">
                   {classStudents.length}/{selectedClassForStudents?.tipo_turma === 'Turma particular' ? '2' : '10'} alunos na turma
                 </p>
               </div>
               {classStudents.length >= (selectedClassForStudents?.tipo_turma === 'Turma particular' ? 2 : 10) && (
                 <p className="text-sm text-red-600 mt-2 font-medium">
                   ⚠️ Esta turma já atingiu o limite máximo de alunos.
                 </p>
               )}
             </div>

             {/* Barra de Pesquisa */}
             <div className="space-y-2">
               <Label htmlFor="student-search" className="text-sm font-medium">
                 Pesquisar Alunos
               </Label>
               <Input
                 id="student-search"
                 placeholder="Digite o nome do aluno..."
                 value={studentSearchQuery}
                 onChange={(e) => setStudentSearchQuery(e.target.value)}
                 className="w-full"
               />
             </div>

             {allStudents.length === 0 ? (
               <div className="text-center py-8">
                 <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-600">Nenhum aluno disponível para adicionar</p>
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <h3 className="font-semibold text-gray-900">
                     Alunos Disponíveis ({allStudents.filter(student => 
                       student.nome.toLowerCase().includes(studentSearchQuery.toLowerCase())
                     ).length})
                   </h3>
                   <p className="text-sm text-gray-600">
                     {selectedStudentsToAdd.length} selecionado(s)
                   </p>
                 </div>
                 
                 <div className="border rounded-lg max-h-96 overflow-y-auto">
                   <Table>
                     <TableHeader>
                         <TableRow>
                           <TableHead className="w-12">Selecionar</TableHead>
                           <TableHead>Nome</TableHead>
                           <TableHead>Email</TableHead>
                           <TableHead>Turma Atual</TableHead>
                           <TableHead>Status</TableHead>
                         </TableRow>
                       </TableHeader>
                     <TableBody>
                       {allStudents
                         .filter(student => 
                           student.nome.toLowerCase().includes(studentSearchQuery.toLowerCase())
                         )
                         .map((student) => (
                         <TableRow key={student.id}>
                           <TableCell>
                             <Checkbox
                               checked={selectedStudentsToAdd.includes(student.id)}
                               onCheckedChange={(checked) => {
                                 if (checked) {
                                   setSelectedStudentsToAdd(prev => [...prev, student.id]);
                                 } else {
                                   setSelectedStudentsToAdd(prev => prev.filter(id => id !== student.id));
                                 }
                               }}
                             />
                           </TableCell>
                           <TableCell className="font-medium">{student.nome}</TableCell>
                           <TableCell>{student.email || '-'}</TableCell>
                           <TableCell>
                             <div className="flex flex-col gap-1">
                               {student.turma_id && (
                                 <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                   Turma Regular
                                 </Badge>
                               )}
                               {student.turma_particular_id && (
                                 <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                   Turma Particular
                                 </Badge>
                               )}
                               {!student.turma_id && !student.turma_particular_id && (
                                 <Badge variant="secondary" className="text-xs">
                                   Sem turma
                                 </Badge>
                               )}
                             </div>
                           </TableCell>
                           <TableCell>
                             <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                               {student.status}
                             </Badge>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>

                 <div className="flex gap-2 justify-end">
                   <Button
                     variant="outline"
                     onClick={() => {
                       setIsAddStudentDialogOpen(false);
                       setSelectedStudentsToAdd([]);
                       setStudentSearchQuery('');
                     }}
                   >
                     Cancelar
                   </Button>
                   <Button
                     onClick={addStudentsToClass}
                     disabled={
                       selectedStudentsToAdd.length === 0 || 
                       classStudents.length >= 10 ||
                       selectedStudentsToAdd.length > (10 - classStudents.length)
                     }
                     className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                   >
                     {classStudents.length >= 10 
                       ? 'Turma Lotada (10/10)'
                       : selectedStudentsToAdd.length > (10 - classStudents.length)
                       ? `Excede limite (${selectedStudentsToAdd.length}/${10 - classStudents.length} vagas)`
                       : `Adicionar ${selectedStudentsToAdd.length} Aluno(s)`
                     }
                   </Button>
                 </div>
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* Modal de Feriados */}
       <HolidayModal
         isOpen={isHolidayModalOpen}
         onClose={() => setIsHolidayModalOpen(false)}
         holidays={detectedHolidays}
         onReschedule={handleHolidayReschedule}
         onIgnore={handleIgnoreHolidays}
         classDays={selectedDays}
       />
    </div>
  );
};

export default Classes;
