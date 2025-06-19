import { useState, useEffect } from 'react';
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
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface Teacher {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  idiomas: string;
  salario: number | null;
}

import { formatCPF, formatPhone } from '@/utils/formatters';

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
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

  const onSubmit = async (data: any) => {
    try {
      // Converter salário para número se fornecido e remover formatação do CPF
      const formData = {
        ...data,
        salario: data.salario ? parseFloat(data.salario) : null,
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null
      };

      if (editingTeacher) {
        const { error } = await supabase
          .from('professores')
          .update(formData)
          .eq('id', editingTeacher.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Professor atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('professores')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Professor criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingTeacher(null);
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

  const deleteTeacher = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return;

    try {
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Professor excluído com sucesso!",
      });
      fetchTeachers();
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o professor.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setValue('nome', teacher.nome);
    setValue('cpf', teacher.cpf ? formatCPF(teacher.cpf) : '');
    setValue('telefone', teacher.telefone || '');
    setValue('email', teacher.email || '');
    setValue('idiomas', teacher.idiomas);
    setValue('salario', teacher.salario ? teacher.salario.toFixed(2) : '');
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTeacher(null);
    reset();
    setIsDialogOpen(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Professores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-brand-red hover:bg-brand-red/90">
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
                  {...register('nome', { required: true })}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpfValue || ''}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
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
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="idiomas">Idiomas *</Label>
                <Select onValueChange={(value) => setValue('idiomas', value)} defaultValue={editingTeacher?.idiomas}>
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
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  type="number"
                  step="0.01"
                  {...register('salario')}
                  placeholder="0,00"
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value && !value.includes('.') && !value.includes(',')) {
                      value = value + ',00';
                    }
                    setValue('salario', value);
                  }}
                />
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTeacher(teacher.id)}
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

export default Teachers;
