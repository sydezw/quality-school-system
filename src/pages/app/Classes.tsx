
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookCopy } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
  dias_da_semana: string;
  horario: string;
  professor_id: string | null;
  sala_id: string | null;
  professores?: { nome: string };
  salas?: { nome: string };
}

interface Teacher {
  id: string;
  nome: string;
  idiomas: string;
}

interface Room {
  id: string;
  nome: string;
  capacidade: number;
  tipo: string;
}

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const selectedIdioma = watch('idioma');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchRooms();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          professores (nome),
          salas (nome)
        `)
        .order('nome');

      if (error) throw error;
      setClasses(data || []);
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

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Convert "none" back to null for database
      const submitData = {
        ...data,
        professor_id: data.professor_id === 'none' ? null : data.professor_id,
        sala_id: data.sala_id === 'none' ? null : data.sala_id
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
          .insert([submitData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingClass(null);
      reset();
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
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Turma excluída com sucesso!",
      });
      fetchClasses();
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a turma.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (classItem: Class) => {
    setEditingClass(classItem);
    setValue('nome', classItem.nome);
    setValue('idioma', classItem.idioma);
    setValue('nivel', classItem.nivel);
    setValue('dias_da_semana', classItem.dias_da_semana);
    setValue('horario', classItem.horario);
    setValue('professor_id', classItem.professor_id || 'none');
    setValue('sala_id', classItem.sala_id || 'none');
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingClass(null);
    reset();
    setIsDialogOpen(true);
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
            <Button onClick={openCreateDialog} className="bg-brand-red hover:bg-brand-red/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? 'Editar Turma' : 'Nova Turma'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Turma *</Label>
                <Input
                  id="nome"
                  {...register('nome', { required: true })}
                  placeholder="Ex: Book 1 - Manhã"
                />
              </div>

              <div>
                <Label htmlFor="idioma">Idioma *</Label>
                <Select onValueChange={(value) => setValue('idioma', value)} defaultValue={editingClass?.idioma}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Japonês">Japonês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nivel">Nível *</Label>
                <Select onValueChange={(value) => setValue('nivel', value)} defaultValue={editingClass?.nivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i + 1} value={`Book ${i + 1}`}>
                        Book {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dias_da_semana">Dias da Semana *</Label>
                <Select onValueChange={(value) => setValue('dias_da_semana', value)} defaultValue={editingClass?.dias_da_semana}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os dias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seg/Qua">Segunda e Quarta</SelectItem>
                    <SelectItem value="Ter/Qui">Terça e Quinta</SelectItem>
                    <SelectItem value="Sáb">Sábado</SelectItem>
                    <SelectItem value="Dom">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="horario">Horário *</Label>
                <Input
                  id="horario"
                  {...register('horario', { required: true })}
                  placeholder="Ex: 08h às 09h"
                />
              </div>

              <div>
                <Label htmlFor="professor_id">Professor</Label>
                <Select onValueChange={(value) => setValue('professor_id', value)} defaultValue={editingClass?.professor_id || 'none'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem professor</SelectItem>
                    {filteredTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sala_id">Sala</Label>
                <Select onValueChange={(value) => setValue('sala_id', value)} defaultValue={editingClass?.sala_id || 'none'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem sala</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.nome} ({room.tipo}) - {room.capacidade} alunos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                  {editingClass ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
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
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma turma cadastrada ainda.</p>
              <p className="text-sm text-gray-400">Clique no botão "Nova Turma" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">{classItem.nome}</TableCell>
                    <TableCell>
                      <Badge className={getIdiomaColor(classItem.idioma)}>
                        {classItem.idioma}
                      </Badge>
                    </TableCell>
                    <TableCell>{classItem.nivel}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{classItem.dias_da_semana}</div>
                        <div className="text-gray-500">{classItem.horario}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {classItem.professores?.nome || (
                        <span className="text-gray-400">Sem professor</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {classItem.salas?.nome || (
                        <span className="text-gray-400">Sem sala</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(classItem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteClass(classItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Classes;
