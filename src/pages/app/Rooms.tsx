
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Building2, BarChart3, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import RoomOccupancyReport from '@/components/rooms/RoomOccupancyReport';

import { DeleteRoomDialog } from '@/components/rooms/DeleteRoomDialog';
import { Database } from '@/integrations/supabase/types';

type Room = Database['public']['Tables']['salas']['Row'];

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('Buscando salas...');
      
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      console.log('Dados recebidos:', data);
      
      // Aceita todas as salas, apenas filtra as que não têm ID
      const validRooms = (data || []).filter(room => room.id);
      
      console.log('Salas válidas:', validRooms);
      setRooms(validRooms);
      
      toast({
        title: "Sucesso",
        description: `${validRooms.length} salas carregadas com sucesso!`,
      });
    } catch (error: any) {
      console.error('Erro ao buscar salas:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar salas: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshRooms = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const onSubmit = async (data: any) => {
    try {
      // Validação básica
      if (!data.nome?.trim()) {
        toast({
          title: "Erro de validação",
          description: "O nome da sala é obrigatório.",
          variant: "destructive",
        });
        return;
      }

      const submitData = {
        nome: data.nome.trim(),
        capacidade: data.capacidade ? parseInt(data.capacidade) : null,
        tipo: data.tipo || 'Física',
        status: data.status || 'ativo'
      };

      // Validar capacidade se fornecida
      if (submitData.capacidade && (isNaN(submitData.capacidade) || submitData.capacidade <= 0)) {
        toast({
          title: "Erro de validação",
          description: "A capacidade deve ser um número maior que zero.",
          variant: "destructive",
        });
        return;
      }

      if (editingRoom) {
        const { error } = await supabase
          .from('salas')
          .update(submitData)
          .eq('id', editingRoom.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Sala atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('salas')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Sala criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingRoom(null);
      reset();
      await fetchRooms();
    } catch (error: any) {
      console.error('Erro ao salvar sala:', error);
      
      let errorMessage = "Não foi possível salvar a sala.";
      
      if (error?.code === '42501') {
        errorMessage = "Você não tem permissão para realizar esta operação.";
      } else if (error?.code === '23505') {
        errorMessage = "Já existe uma sala com este nome.";
      } else if (error?.code === '23502') {
        errorMessage = "Todos os campos obrigatórios devem ser preenchidos.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setValue('nome', room.nome);
    setValue('capacidade', room.capacidade);
    setValue('tipo', room.tipo);
    setValue('status', room.status_salas || 'ativo');
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingRoom(null);
    reset();
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;
    
    setIsDeleting(true);
    const success = await deleteRoom(roomToDelete.id);
    
    if (success) {
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
    
    setIsDeleting(false);
  };

  const deleteRoom = async (id: string): Promise<boolean> => {
    try {
      // Verificar se há turmas associadas
      const { data: classes } = await supabase
        .from('turmas')
        .select('id')
        .eq('sala_id', id);

      if (classes && classes.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Esta sala possui turmas associadas. Remova as turmas primeiro.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('salas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sala excluída com sucesso!",
      });

      await fetchRooms();
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir sala:', error);
      toast({
        title: "Erro",
        description: `Não foi possível excluir a sala: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const getTipoColor = (tipo: string | null) => {
    switch (tipo) {
      case 'Virtual':
        return 'bg-blue-100 text-blue-800';
      case 'Física':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCapacidade = (capacidade: number | null) => {
    if (!capacidade) return 'Não definida';
    return `${capacidade} alunos`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
        <span className="ml-2">Carregando salas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Salas</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshRooms}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="bg-brand-red hover:bg-brand-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Nova Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRoom ? 'Editar Sala' : 'Nova Sala'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Sala *</Label>
                  <Input
                    id="nome"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    placeholder="Ex: Sala 1"
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-sm mt-1">{errors.nome.message as string}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    min="1"
                    {...register('capacidade')}
                    placeholder="Ex: 12"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select onValueChange={(value) => setValue('tipo', value)} defaultValue={editingRoom?.tipo || 'Física'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Física">Física</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setValue('status', value)} defaultValue={editingRoom?.status_salas || 'ativo'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                    {editingRoom ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Lista de Salas
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Ocupação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lista de Salas ({rooms.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Nenhuma sala encontrada</p>
                  <p className="text-sm text-gray-400 mb-4">Clique no botão "Nova Sala" para começar ou "Atualizar" para recarregar.</p>
                  <Button onClick={openNewDialog} className="bg-brand-red hover:bg-brand-red/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Sala
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Capacidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium text-base">
                            {room.nome || 'Sem nome'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-sm ${getTipoColor(room.tipo)}`}>
                              {room.tipo || 'Não definido'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-base">{formatCapacidade(room.capacidade)}</TableCell>
                          <TableCell>
                            <Badge className={`text-sm ${room.status_salas === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {room.status_salas || 'ativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(room)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(room)}
                                className="text-red-600 hover:text-red-700"
                                disabled={isDeleting && roomToDelete?.id === room.id}
                              >
                                {isDeleting && roomToDelete?.id === room.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <RoomOccupancyReport />
        </TabsContent>
      </Tabs>

      <DeleteRoomDialog
        isOpen={deleteDialogOpen}
        room={roomToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Rooms;
