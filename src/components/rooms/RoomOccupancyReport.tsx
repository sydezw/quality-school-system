import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, ChevronDown, CalendarDays, PlusCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { NewLessonDialog } from '../classes/NewLessonDialog';

interface Aula {
  id: string;
  data: string;
  conteudo: string | null;
}

interface Turma {
  id: string;
  nome: string;
  dias_da_semana: string;
  horario: string;
  professor_nome: string | null;
  aulas: Aula[];
}

interface RoomOccupancy {
  sala_nome: string;
  sala_tipo: string;
  sala_capacidade: number;
  turmas: Turma[];
}

const RoomOccupancyReport = () => {
  const [occupancy, setOccupancy] = useState<RoomOccupancy[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoomOccupancy();
  }, []);

  const fetchRoomOccupancy = async () => {
    try {
      const { data: rooms, error: roomsError } = await supabase
        .from('salas')
        .select('*')
        .order('nome');

      if (roomsError) throw roomsError;

      const { data: classes, error: classesError } = await supabase
        .from('turmas')
        .select(`
          id,
          nome,
          dias_da_semana,
          horario,
          sala_id,
          professores (nome)
        `)
        .not('sala_id', 'is', null);

      if (classesError) throw classesError;

      const turmaIds = classes.map(c => c.id);
      
      const { data: aulas, error: aulasError } = await supabase
        .from('aulas')
        .select('id, data, conteudo, turma_id')
        .in('turma_id', turmaIds);
        
      if (aulasError) throw aulasError;

      const occupancyData: RoomOccupancy[] = rooms.map(room => ({
        sala_nome: room.nome,
        sala_tipo: room.tipo,
        sala_capacidade: room.capacidade,
        turmas: classes
          .filter(cls => cls.sala_id === room.id)
          .map(cls => ({
            id: cls.id,
            nome: cls.nome,
            dias_da_semana: cls.dias_da_semana,
            horario: cls.horario,
            professor_nome: cls.professores?.nome || null,
            aulas: aulas
              .filter(aula => aula.turma_id === cls.id)
              .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          }))
      }));

      setOccupancy(occupancyData);
    } catch (error) {
      console.error('Erro ao buscar ocupação das salas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a ocupação das salas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'Física' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando ocupação...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Relatório de Ocupação das Salas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {occupancy.map((room) => (
            <div key={room.sala_nome} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{room.sala_nome}</h3>
                  <Badge className={getTipoColor(room.sala_tipo)}>
                    {room.sala_tipo}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Capacidade: {room.sala_capacidade} alunos
                  </span>
                </div>
              </div>
              
              {room.turmas.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma turma alocada nesta sala.</p>
              ) : (
                <div className="space-y-2">
                  {room.turmas.map((turma) => (
                    <Collapsible key={turma.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                           <p className="font-semibold">{turma.nome}</p>
                           <span className="text-sm text-gray-600">{turma.dias_da_semana} às {turma.horario}</span>
                           <span className="text-sm text-gray-600">Professor: {turma.professor_nome || 'N/A'}</span>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Toggle Aulas</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="pt-4">
                        <div className="flex justify-end mb-4">
                          <NewLessonDialog turmaId={turma.id} onSuccess={fetchRoomOccupancy}>
                            <Button size="sm">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Registrar Nova Aula
                            </Button>
                          </NewLessonDialog>
                        </div>
                        {turma.aulas.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhuma aula registrada para esta turma.</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Conteúdo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {turma.aulas.map((aula) => (
                                <TableRow key={aula.id}>
                                  <TableCell className="w-[150px]">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="h-4 w-4 text-gray-500" />
                                      {new Date(aula.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    </div>
                                  </TableCell>
                                  <TableCell>{aula.conteudo || <span className="text-gray-400">Conteúdo não informado</span>}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomOccupancyReport;
