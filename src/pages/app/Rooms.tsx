
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
import { Plus, Edit, Trash2, Building2, BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import RoomOccupancyReport from '@/components/rooms/RoomOccupancyReport';

import { DeleteRoomDialog } from '@/components/rooms/DeleteRoomDialog';
import { Room } from '@/integrations/supabase/types';

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .order('nome');

      if (error) throw error;
      // Filtra apenas salas com nome, capacidade e tipo válidos
      const validRooms = (data || []).filter(room => room.nome && room.capacidade && room.tipo);
      setRooms(validRooms);
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as salas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const submitData = {
        ...data,
        capacidade: parseInt(data.capacidade)
      };

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
      fetchRooms();
    } catch (error) {
      console.error('Erro ao salvar sala:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a sala.",
        variant: "destructive",
      });
    }
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

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  const deleteRoom = async (id: string): Promise<boolean> => {
    try {
      // Primeiro, verificar se a sala existe
      const { data: roomExists, error: checkError } = await supabase
        .from('salas')
        .select('id, nome')
        .eq('id', id)
        .single();

      if (checkError || !roomExists) {
        toast({
          title: "Sala não encontrada",
          description: "A sala que você está tentando excluir não existe mais.",
          variant: "destructive",
        });
        await fetchRooms();
        return false;
      }

      // Verificar se há turmas associadas
      const { data: classes } = await supabase
        .from('turmas')
        .select('id')
        .eq('sala_id', id);

      if (classes && classes.length > 0) {
        toast({
          title: "Não é possível excluir esta sala",
          description: "Esta sala possui turmas associadas. Remova essas vinculações antes de excluir.",
          variant: "destructive",
        });
        return false;
      }

      // Executar a exclusão
      const { error: deleteError } = await supabase
        .from('salas')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Tratar diferentes tipos de erro
        if (deleteError.code === 'PGRST116') {
          toast({
            title: "Sala não encontrada",
            description: "A sala que você está tentando excluir não existe mais.",
            variant: "destructive",
          });
          await fetchRooms();
          return false;
        } else if (deleteError.code === '23503') {
          toast({
            title: "Não é possível excluir esta sala",
            description: "Esta sala está vinculada a turmas ou outros registros. Remova essas vinculações antes de excluir.",
            variant: "destructive",
          });
          return false;
        } else {
          throw deleteError;
        }
      }
      
      toast({
        title: "Sala excluída com sucesso!",
        description: `A sala "${roomExists.nome}" foi removida do sistema.`,
      });
      
      // Atualizar a lista de salas
      await fetchRooms();
      return true;
    } catch (error) {
      console.error('Erro ao excluir sala:', error);
      toast({
        title: "Erro ao excluir sala",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setValue('nome', room.nome);
    setValue('capacidade', room.capacidade);
    setValue('tipo', room.tipo);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRoom(null);
    reset();
    setIsDialogOpen(true);
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'Física' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando salas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Salas</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-brand-red hover:bg-brand-red/90"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Sala
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                  {...register('nome', { required: true })}
                  placeholder="Ex: Sala 1"
                />
              </div>

              <div>
                <Label htmlFor="capacidade">Capacidade *</Label>
                <Input
                  id="capacidade"
                  type="number"
                  min="1"
                  {...register('capacidade', { required: true })}
                  placeholder="Ex: 12"
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select onValueChange={(value) => setValue('tipo', value)} defaultValue={editingRoom?.tipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Física">Física</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
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
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma sala cadastrada ainda.</p>
                  <p className="text-sm text-gray-400">Clique no botão "Nova Sala" para começar.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.nome}</TableCell>
                        <TableCell>
                          <Badge className={getTipoColor(room.tipo)}>
                            {room.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{room.capacidade} alunos</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
    </div>
  );
};

export default Rooms;
