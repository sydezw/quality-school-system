
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import CalendarTemplate from '@/components/shared/CalendarTemplate';


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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();


  useEffect(() => {
    fetchCurrentUser();
    fetchAgendaItems();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('id')
        .limit(1);

      if (error) throw error;
      
      if (usuarios && usuarios.length > 0) {
        setCurrentUserId(usuarios[0].id);
      } else {
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
        titulo: data.titulo,
        descricao: data.descricao || null,
        data: selectedDate || data.data,
        hora: data.hora,
        status: data.status || 'pendente',
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
          description: "Evento atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('agenda')
          .insert([submitData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Evento adicionado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setSelectedDate(null);
      reset();
      fetchAgendaItems();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o evento.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { data: eventExists, error: checkError } = await supabase
        .from('agenda')
        .select('id, titulo')
        .eq('id', id)
        .single();

      if (checkError || !eventExists) {
        throw new Error('Evento não encontrado.');
      }

      const { error: deleteError } = await supabase
        .from('agenda')
        .delete()
        .eq('id', id);

      if (deleteError) {
        if (deleteError.code === 'PGRST116') {
          throw new Error('Evento não encontrado.');
        } else if (deleteError.code === '23503') {
          throw new Error('Não é possível excluir este evento pois existem registros relacionados.');
        } else {
          throw new Error(`Erro no banco de dados: ${deleteError.message}`);
        }
      }
      
      toast({
        title: "Sucesso",
        description: `Evento "${eventExists.titulo}" excluído com sucesso!`,
        duration: 5000,
      });
      
      await fetchAgendaItems();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro na Exclusão",
        description: error instanceof Error ? error.message : "Não foi possível excluir o evento.",
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
    setValue('status', item.status || 'pendente');
    setIsDialogOpen(true);
  };

  const openCreateDialog = (date?: string) => {
    setEditingItem(null);
    reset();
    if (date) {
      setSelectedDate(date);
      setValue('data', date);
    }
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando agenda...</div>
      </div>
    );
  }

  // Converter eventos para o formato do CalendarTemplate
  const calendarEvents = agendaItems.map(event => ({
    id: event.id,
    title: event.titulo,
    date: event.data,
    time: event.hora,
    type: 'event' as const,
    description: event.descricao,
    priority: 'medium' as const
  }));

  return (
    <div className="space-y-6">
      <CalendarTemplate
        title="Agenda de Eventos"
        events={calendarEvents}
        onEventClick={(event) => {
          const originalEvent = agendaItems.find(e => e.id === event.id);
          if (originalEvent) {
            openEditDialog(originalEvent);
          }
        }}
        onAddEvent={(date) => {
          openCreateDialog(date);
        }}
        showFilters={true}
        showSearch={true}
      />

      {/* Dialog para adicionar/editar eventos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                {...register('titulo', { required: true })}
                placeholder="Ex: Reunião de pais"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                {...register('descricao')}
                placeholder="Detalhes do evento (opcional)"
                rows={3}
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
              <Label htmlFor="status">Status *</Label>
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
              <Button type="submit" className="flex-1">
                {editingItem ? 'Atualizar' : 'Criar'} Evento
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingItem(null);
                  setSelectedDate(null);
                  reset();
                }}
              >
                Cancelar
              </Button>
              {editingItem && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    deleteItem(editingItem.id);
                    setIsDialogOpen(false);
                    setEditingItem(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agenda;
