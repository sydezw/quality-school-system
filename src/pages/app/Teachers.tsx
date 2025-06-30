import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Users, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Teacher } from '@/integrations/supabase/types';
import { teacherFormSchema, type TeacherFormData } from '@/lib/validators/teacher';
import { formatCPF, formatPhone } from '@/utils/formatters';
import { AdvancedDeleteDialog, DeletionPlan } from '@/components/shared/AdvancedDeleteDialog';

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      idiomas: '',
      salario: '',
      status: 'ativo'
    }
  });
  const cpfValue = watch('cpf');

  useEffect(() => {
    fetchTeachers();
  }, []);

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os professores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setValue('cpf', formattedCPF);
  };

  const onSubmit = async (data: TeacherFormData) => {


    try {
      const teacherData = {
        nome: data.nome,
        cpf: data.cpf?.replace(/\D/g, '') || null,
        telefone: data.telefone || null,
        email: data.email || null,
        idiomas: data.idiomas || '',
        salario: data.salario && data.salario !== '0,00' ? parseFloat(data.salario.replace(/\./g, '').replace(',', '.')) : null,
      };

      if (editingTeacher) {
        const { error } = await supabase
          .from('professores')
          .update(teacherData)
          .eq('id', editingTeacher.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Professor atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('professores')
          .insert([teacherData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Professor criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      reset();
      fetchTeachers();
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o professor.",
        variant: "destructive",
      });
    }
  };



  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    reset({
      nome: teacher.nome,
      cpf: teacher.cpf ? formatCPF(teacher.cpf) : '',
      telefone: teacher.telefone || '',
      email: teacher.email || '',
      idiomas: teacher.idiomas,
      salario: teacher.salario ? teacher.salario.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) : '0,00',
      status: teacher.status || 'ativo'
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTeacher(null);
    reset();
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const deleteTeacherWithPlan = async (teacher: Teacher, plan: DeletionPlan) => {
    setIsDeleting(true);
    try {
      // A exclusão do professor vai respeitar as constraints do banco
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', teacher.id);

      if (error) {
        // Se houver erro de constraint, explicar ao usuário
        if (error.code === '23503') {
          toast({
            title: "Erro de Dependência",
            description: "Não foi possível excluir o professor devido a registros relacionados. Verifique se existem dados que impedem a exclusão.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: "Sucesso",
        description: `Professor ${teacher.nome} foi excluído com sucesso!`,
      });
      
      // Atualizar a lista de professores
      await fetchTeachers();
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
      return true;
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o professor. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando professores...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Professores</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-brand-red hover:bg-brand-red/90"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Professor
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? 'Editar Professor' : 'Novo Professor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome completo"
                  className={errors.nome ? "border-red-500" : ""}
                />
                {errors.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpfValue || ''}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={errors.cpf ? "border-red-500" : ""}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500 mt-1">{errors.cpf.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(11) 99999-9999"
                  onChange={e => {
                    const formatted = formatPhone(e.target.value);
                    setValue('telefone', formatted);
                  }}
                  maxLength={15}
                  className={errors.telefone ? "border-red-500" : ""}
                />
                {errors.telefone && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="idiomas">Idiomas</Label>
                <Select onValueChange={(value) => setValue('idiomas', value)} value={watch('idiomas')}>
                  <SelectTrigger className={errors.idiomas ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Japonês">Japonês</SelectItem>
                  </SelectContent>
                </Select>
                {errors.idiomas && (
                  <p className="text-sm text-red-500 mt-1">{errors.idiomas.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  {...register('salario')}
                  placeholder="0,00"
                  value={watch('salario') || '0,00'}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove tudo que não é número
                    value = value.replace(/\D/g, '');
                    
                    // Se vazio, define como 0
                    if (value === '') {
                      setValue('salario', '0,00');
                      return;
                    }
                    
                    // Converte para número e formata
                    const numValue = parseInt(value);
                    
                    // Formata como moeda brasileira
                    const formatted = (numValue / 100).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    
                    setValue('salario', formatted);
                  }}
                  className={errors.salario ? "border-red-500" : ""}
                />
                {errors.salario && (
                  <p className="text-sm text-red-500 mt-1">{errors.salario.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select onValueChange={(value) => setValue('status', value)} value={watch('status')}>
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="demitido">Demitido</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                  {editingTeacher ? 'Atualizar' : 'Criar'}
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
            <Users className="h-5 w-5" />
            Lista de Professores ({teachers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum professor cadastrado ainda.</p>
              <p className="text-sm text-gray-400">Clique no botão "Novo Professor" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Idiomas</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.nome}</TableCell>
                    <TableCell>{teacher.cpf ? formatCPF(teacher.cpf) : 'Não informado'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.idiomas.split(',').map((idioma, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {idioma.trim()}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {teacher.telefone && <div>{teacher.telefone}</div>}
                        {teacher.email && <div className="text-gray-500">{teacher.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {teacher.salario ? (
                        <span className="text-green-600 font-medium">
                          R$ {teacher.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={teacher.status === 'ativo' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          teacher.status === 'ativo' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : teacher.status === 'inativo'
                            ? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }`}
                      >
                        {teacher.status === 'ativo' ? 'Ativo' : 
                         teacher.status === 'inativo' ? 'Inativo' : 'Demitido'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(teacher)}
                          disabled={isDeleting}
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
      
      <AdvancedDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        entityType="teacher"
        entityName={teacherToDelete?.nome || ''}
        onConfirm={(plan) => deleteTeacherWithPlan(teacherToDelete!, plan)}
        isLoading={isDeleting}
      />

    </div>
  );
};

export default Teachers;
