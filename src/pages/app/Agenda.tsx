
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionButton } from '@/components/shared/PermissionButton';
import { PermissionGuard } from '@/components/guards/PermissionGuard';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();
  const { hasPermission, isOwner } = usePermissions();

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
        status: 'pendente', // Campo obrigatório na tabela
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
      const { error } = await supabase
        .from('agenda')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!",
      });
      fetchAgendaItems();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento.",
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

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForCalendar = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (dateStr: string) => {
    return agendaItems.filter(item => item.data === dateStr);
  };

  const getCategoryColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-500',
      'concluido': 'bg-green-500',
      'cancelado': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-blue-500';
  };

  const getCategoryBadgeColor = (status: string) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'concluido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-blue-100 text-blue-800';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateForCalendar(year, month, day);
      const events = getEventsForDate(dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
          onClick={() => openCreateDialog(dateStr)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map((event, index) => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${
                  getCategoryColor(event.status)
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditDialog(event);
                }}
                title={`${event.titulo} - ${event.hora}`}
              >
                {event.titulo}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500 px-1">
                +{events.length - 2} mais
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return agendaItems
      .filter(item => item.data >= today)
      .slice(0, 5);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando agenda...</div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="visualizarAgenda">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">📅 Agenda Escolar</h1>
          <PermissionButton
            permission="gerenciarAgenda"
            onClick={() => openCreateDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Evento
          </PermissionButton>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendário Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Grade do calendário */}
              <div className="grid grid-cols-7 gap-0">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com próximos eventos e legenda */}
        <div className="space-y-6">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {getUpcomingEvents().length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum evento próximo</p>
              ) : (
                <div className="space-y-3">
                  {getUpcomingEvents().map(event => (
                     <div key={event.id} className="border-l-4 pl-3 py-2" style={{
                       borderLeftColor: getCategoryColor(event.status).replace('bg-', '#')
                     }}>
                      <div className="font-medium text-sm">{event.titulo}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.data).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.hora}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legenda de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                   <span className="text-sm">Pendente</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-green-500 rounded"></div>
                   <span className="text-sm">Concluído</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 bg-red-500 rounded"></div>
                   <span className="text-sm">Cancelado</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                <PermissionButton
                  permission="gerenciarAgenda"
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    deleteItem(editingItem.id);
                    setIsDialogOpen(false);
                    setEditingItem(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </PermissionButton>
              )}
            </div>
          </form>
        </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default Agenda;
