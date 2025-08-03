
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
import { Plus, Edit, Trash2, BookCopy, Calendar, Clock, Globe, Book, Users, GraduationCap, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel?: string;
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

      // Verificar se existem aulas relacionadas
      const { data: relatedAulas, error: aulasError } = await supabase
        .from('aulas')
        .select('id')
        .eq('turma_id', id)
        .limit(1);

      if (aulasError) {
        throw new Error('Erro ao verificar aulas relacionadas.');
      }

      if (relatedAulas && relatedAulas.length > 0) {
        throw new Error('Não é possível excluir esta turma pois existem aulas cadastradas. Exclua primeiro todas as aulas desta turma.');
      }

      // Verificar se existem outros registros relacionados que impedem a exclusão
      const { data: relatedRecords, error: checkError } = await supabase
        .from('pesquisas_satisfacao')
        .select('id')
        .eq('turma_id', id)
        .limit(1);

      if (checkError) {
        console.warn('Erro ao verificar pesquisas relacionadas:', checkError);
      }

      const { data: relatedPlanos, error: planosError } = await supabase
        .from('planos_aula')
        .select('id')
        .eq('turma_id', id)
        .limit(1);

      if (planosError) {
        console.warn('Erro ao verificar planos relacionados:', planosError);
      }

      const { data: relatedRanking, error: rankingError } = await supabase
        .from('ranking')
        .select('id')
        .eq('turma_id', id)
        .limit(1);

      if (rankingError) {
        console.warn('Erro ao verificar ranking relacionado:', rankingError);
      }

      // Se existem outros registros relacionados, informar ao usuário
      const hasRelatedRecords = (
        (relatedRecords && relatedRecords.length > 0) ||
        (relatedPlanos && relatedPlanos.length > 0) ||
        (relatedRanking && relatedRanking.length > 0)
      );

      if (hasRelatedRecords) {
        throw new Error('Não é possível excluir esta turma pois existem registros relacionados (pesquisas, planos de aula ou ranking). Remova primeiro estes registros.');
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
                    <Label htmlFor="dias_da_semana" className="text-sm font-medium text-gray-700">
                      Dia da Semana *
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('dias_da_semana', value)} 
                      value={watch('dias_da_semana')}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Segunda">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Segunda-feira
                          </div>
                        </SelectItem>
                        <SelectItem value="Terça">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Terça-feira
                          </div>
                        </SelectItem>
                        <SelectItem value="Quarta">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Quarta-feira
                          </div>
                        </SelectItem>
                        <SelectItem value="Quinta">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Quinta-feira
                          </div>
                        </SelectItem>
                        <SelectItem value="Sexta">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Sexta-feira
                          </div>
                        </SelectItem>
                        <SelectItem value="Sábado">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Sábado
                          </div>
                        </SelectItem>
                        <SelectItem value="Domingo">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Domingo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Badge variant="outline" className="text-sm">
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
                        onClick={() => openEditDialog(classItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteClass(classItem.id)}
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
    </div>
  );
};

export default Classes;
