
import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookCopy, Calendar, Clock, Globe, Book, Users, GraduationCap, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
  dias_da_semana: string;
  horario: string;
  professor_id: string | null;
  materiais_ids?: string[];
  professores?: { nome: string };
}

interface Teacher {
  id: string;
  nome: string;
  idiomas: string;
}

interface Material {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
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
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      nome: '',
      idioma: '',
      nivel: '',
      dias_da_semana: '',
      horario: '',
      professor_id: 'none'
    }
  });

  const selectedIdioma = watch('idioma');

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
      } else {
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

  const onSubmit = async (data: any) => {
    try {
      // Validar campos obrigatórios
      if (!data.nome || !data.idioma || !data.nivel || !data.dias_da_semana || !data.horario) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }
  
      // Convert "none" back to null for database
      const submitData = {
        nome: data.nome,
        idioma: data.idioma,
        nivel: data.nivel,
        dias_da_semana: data.dias_da_semana,
        horario: data.horario,
        professor_id: data.professor_id === 'none' ? null : data.professor_id,
        materiais_ids: selectedMaterials
      };

      if (editingClass) {
        const { error } = await supabase
          .from('turmas')
          .update(submitData)
          .eq('id', editingClass.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('turmas')
          .insert({
            nome: submitData.nome,
            idioma: submitData.idioma,
            nivel: submitData.nivel,
            dias_da_semana: submitData.dias_da_semana,
            horario: submitData.horario,
            professor_id: submitData.professor_id,
            materiais_ids: submitData.materiais_ids
          });

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingClass(null);
      reset();
      setSelectedMaterials([]);
      fetchClasses();
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a turma.",
        variant: "destructive",
      });
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
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, email, telefone, status')
        .eq('turma_id', classId)
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
        .select('id, nome, email, status, turma_id, aulas_particulares, aulas_turma')
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
      // Verificar quantos alunos já estão na turma
      const { data: currentStudents, error: countError } = await supabase
        .from('alunos')
        .select('id, turma_id')
        .eq('turma_id', selectedClassForStudents.id)
        .eq('status', 'Ativo');

      if (countError) throw countError;

      const currentCount = currentStudents?.length || 0;
      const maxStudents = 10;
      const availableSlots = maxStudents - currentCount;

      if (availableSlots <= 0) {
        toast({
          title: "Limite Atingido",
          description: "Esta turma já possui o máximo de 10 alunos.",
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
          description: `Esta turma só pode receber mais ${availableSlots} aluno(s). Máximo de 10 alunos por turma.`,
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
          .select('turma_id, aulas_particulares, aulas_turma, nome')
          .eq('id', studentId)
          .single();
          
        if (studentError) {
          console.error(`Erro ao buscar dados do aluno ${studentId}:`, studentError);
          continue;
        }
        
        // Se o aluno não tem turma principal, definir esta como principal
        if (!studentData.turma_id) {
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
          // Por enquanto, apenas marcar que faz aulas de turma
          const { error: updateError } = await supabase
            .from('alunos')
            .update({ aulas_turma: true })
            .eq('id', studentId);
            
          if (updateError) {
            console.error(`Erro ao atualizar aluno ${studentId}:`, updateError);
            continue;
          }
          
          warningMessages.push(`${studentData.nome} já possui turma principal. Múltiplas turmas regulares requerem implementação completa da tabela de relacionamento.`);
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
      const { error } = await supabase
        .from('alunos')
        .update({ turma_id: null })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno removido da turma com sucesso!",
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
      professor_id: classItem.professor_id || 'none'
    });
    
    // Carregar dias selecionados a partir da string
    const daysArray = classItem.dias_da_semana ? classItem.dias_da_semana.split(' e ') : [];
    setSelectedDays(daysArray);
    
    // Carregar materiais selecionados
    setSelectedMaterials(classItem.materiais_ids || []);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingClass(null);
    reset({
      nome: '',
      idioma: '',
      nivel: '',
      dias_da_semana: '',
      horario: '',
      professor_id: 'none'
    });
    setSelectedMaterials([]);
    setSelectedDays([]);
    setIsDialogOpen(true);
  };

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const getIdiomaColor = (idioma: string) => {
    switch (idioma) {
      case 'Inglês': return 'bg-blue-100 text-blue-800';
      case 'Japonês': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                  <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                    Nome da Turma *
                  </Label>
                  <Input
                    id="nome"
                    {...register('nome', { 
                      required: 'Nome é obrigatório',
                      minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                    })}
                    placeholder="Ex: Book 1 - Manhã"
                    className="mt-1"
                  />
                  {errors.nome && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.nome.message}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="idioma" className="text-sm font-medium text-gray-700">
                    Idioma *
                  </Label>
                  <Select 
                    onValueChange={(value) => setValue('idioma', value)} 
                    value={watch('idioma')}
                  >
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
                  <Select 
                    onValueChange={(value) => setValue('nivel', value)} 
                    value={watch('nivel')}
                  >
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
                  {errors.nivel && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <p className="text-sm text-red-600">{errors.nivel.message}</p>
                    </div>
                  )}
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
                    {watch('horario') && !errors.horario && (() => {
                      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])\s*-\s*([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
                      const match = watch('horario').match(timeRegex);
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
                  <Select 
                    onValueChange={(value) => setValue('professor_id', value)} 
                    value={watch('professor_id')}
                  >
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
                  {selectedIdioma && filteredTeachers.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Nenhum professor disponível para {selectedIdioma}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-red hover:bg-brand-red/90 px-6"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {editingClass ? (
                        <>
                          <Edit className="h-4 w-4" />
                          Atualizar
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Criar
                        </>
                      )}
                    </div>
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
            Lista de Turmas ({classes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idioma</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Materiais</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell className="font-medium text-base">{classItem.nome}</TableCell>
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
                    <span className="text-base text-gray-600">
                      {(classItem.materiais_ids?.length) || 0} materiais
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-base">{classItem.horario}</div>
                      <div className="text-base text-gray-500">{classItem.dias_da_semana}</div>
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
            </TableBody>
          </Table>
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
         <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
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
                     Nível: {selectedClassForStudents?.nivel} | Total de alunos: {classStudents.length}
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
                   <strong>Limite de alunos:</strong> Máximo 10 alunos por turma
                 </p>
                 <p className="text-sm text-blue-600 font-medium">
                   {classStudents.length}/10 alunos na turma
                 </p>
               </div>
               {classStudents.length >= 10 && (
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
                             {student.turma_id ? (
                               <div className="flex flex-col gap-1">
                                 <Badge variant="outline" className="text-xs">
                                   Tem turma principal
                                 </Badge>
                                 {student.aulas_particulares && (
                                   <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                     + Aulas particulares
                                   </Badge>
                                 )}
                               </div>
                             ) : (
                               <Badge variant="secondary" className="text-xs">
                                 {student.aulas_particulares ? 'Só particulares' : 'Sem turma'}
                               </Badge>
                             )}
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
    </div>
  );
};

export default Classes;
