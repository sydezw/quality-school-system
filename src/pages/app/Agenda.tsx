
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AgendaItem {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  hora: string;
  status: string;
  criado_por: string;
  usuarios?: { nome: string };
}

const Agenda = () => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchCurrentUser();
    fetchAgendaItems();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // Primeiro, vamos tentar obter o primeiro usuário disponível
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('id')
        .limit(1);

      if (error) throw error;
      
      if (usuarios && usuarios.length > 0) {
        setCurrentUserId(usuarios[0].id);
      } else {
        // Se não há usuários, criar um usuário padrão
        const { data: newUser, error: createError } = await supabase
          .from('usuarios')
          .insert([{
            nome: 'Usuário Padrão',
            email: 'usuario@exemplo.com',
            senha: 'senha123',
            cargo: 'Secretária'
          }])
          .select()
          .single();

        if (createError) throw createError;
        setCurrentUserId(newUser.id);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao configurar usuário.",
        variant: "destructive",
      });
    }
  };

  const fetchAgendaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda')
        .select(`
          *,
          usuarios (nome)
        `)
        .order('data', { ascending: true });

      if (error) throw error;
      setAgendaItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar agenda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a agenda.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!currentUserId) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }

    try {
      const submitData = {
        ...data,
        criado_por: currentUserId
      };

      if (editingItem) {
        const { error } = await supabase
          .from('agenda')
          .update(submitData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Item da agenda atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('agenda')
          .insert([submitData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Item adicionado à agenda com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      reset();
      fetchAgendaItems();
    } catch (error) {
      console.error('Erro ao salvar item da agenda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o item da agenda.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item da agenda?')) return;

    try {
      const { error } = await supabase
        .from('agenda')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item da agenda excluído com sucesso!",
      });
      fetchAgendaItems();
    } catch (error) {
      console.error('Erro ao excluir item da agenda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item da agenda.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: AgendaItem) => {
    setEditingItem(item);
    setValue('titulo', item.titulo);
    setValue('descricao', item.descricao || '');
    setValue('data', item.data);
    setValue('hora', item.hora);
    setValue('status', item.status);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    reset();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agenda da Secretaria</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-brand-red hover:bg-brand-red/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Novo Item da Agenda'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  {...register('titulo', { required: true })}
                  placeholder="Ex: Reunião com pais"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Detalhes do compromisso..."
                />
              </div>

              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  {...register('data', { required: true })}
                />
              </div>

              <div>
                <Label htmlFor="hora">Hora *</Label>
                <Input
                  id="hora"
                  type="time"
                  {...register('hora', { required: true })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setValue('status', value)} defaultValue={editingItem?.status || 'pendente'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                  {editingItem ? 'Atualizar' : 'Criar'}
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
            <Calendar className="h-5 w-5" />
            Compromissos ({agendaItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendaItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum compromisso agendado ainda.</p>
              <p className="text-sm text-gray-400">Clique no botão "Novo Item" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendaItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.titulo}</div>
                        {item.descricao && (
                          <div className="text-sm text-gray-500">{item.descricao}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(item.data)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {item.hora}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteItem(item.id)}
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

export default Agenda;
