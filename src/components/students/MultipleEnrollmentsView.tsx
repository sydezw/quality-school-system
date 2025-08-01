import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock, Calendar, BookOpen, X, AlertTriangle } from 'lucide-react';

interface StudentEnrollment {
  id: string;
  nome: string;
  status: string;
  turma_id: string | null;
  aulas_particulares: boolean;
  aulas_turma: boolean;
  turma?: {
    nome: string;
    idioma: string;
    nivel: string;
    horario: string;
    dias_da_semana: string;
  };
}

interface Student {
  id: string;
  nome: string;
  status: string;
  turma_id: string | null;
  aulas_particulares?: boolean;
  aulas_turma?: boolean;
}

interface MultipleEnrollmentsViewProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MultipleEnrollmentsView: React.FC<MultipleEnrollmentsViewProps> = ({
  student: studentProp,
  isOpen,
  onClose
}) => {
  const [student, setStudent] = useState<StudentEnrollment | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudentEnrollments = async () => {
    if (!studentProp?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          id,
          nome,
          status,
          turma_id,
          aulas_particulares,
          aulas_turma,
          turmas:turma_id (
            nome,
            idioma,
            nivel,
            horario,
            dias_da_semana
          )
        `)
        .eq('id', studentProp.id)
        .single();

      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error('Erro ao buscar matrículas do aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as matrículas do aluno.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromPrivateClasses = async () => {
    if (!studentProp?.id) return;
    
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ aulas_particulares: false })
        .eq('id', studentProp.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno removido das aulas particulares.",
      });

      await fetchStudentEnrollments();
    } catch (error) {
      console.error('Erro ao remover das aulas particulares:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno das aulas particulares.",
        variant: "destructive",
      });
    }
  };

  const removeFromRegularClass = async () => {
    if (!studentProp?.id) return;
    
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ 
          turma_id: null,
          aulas_turma: false 
        })
        .eq('id', studentProp.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno removido da turma regular.",
      });

      await fetchStudentEnrollments();
    } catch (error) {
      console.error('Erro ao remover da turma regular:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno da turma regular.",
        variant: "destructive",
      });
    }
  };

  const getEnrollmentCount = () => {
    if (!student) return 0;
    let count = 0;
    if (student.turma_id) count++;
    if (student.aulas_particulares) count++;
    return count;
  };

  const hasScheduleConflict = () => {
    // Simulação de verificação de conflito
    // Em uma implementação real, isso verificaria horários conflitantes
    return false;
  };

  useEffect(() => {
    if (isOpen && studentProp?.id) {
      fetchStudentEnrollments();
    }
  }, [isOpen, studentProp?.id]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Users className="h-5 w-5" />
            Matrículas de {studentProp?.nome || 'Aluno'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="ml-2 text-gray-600">Carregando matrículas...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo das Matrículas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Resumo das Matrículas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{getEnrollmentCount()}</div>
                    <div className="text-sm text-blue-800">Total de Matrículas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {student?.turma_id ? '1' : '0'}
                    </div>
                    <div className="text-sm text-green-800">Turmas Regulares</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {student?.aulas_particulares ? '1' : '0'}
                    </div>
                    <div className="text-sm text-purple-800">Aulas Particulares</div>
                  </div>
                </div>

                {hasScheduleConflict() && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Atenção: Possível conflito de horário detectado entre as matrículas.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalhes das Matrículas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes das Matrículas</CardTitle>
              </CardHeader>
              <CardContent>
                {getEnrollmentCount() === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Este aluno não possui matrículas ativas.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Turma/Modalidade</TableHead>
                        <TableHead>Idioma</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Turma Regular */}
                      {student?.turma_id && student.turma && (
                        <TableRow>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Turma Regular
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{student.turma.nome}</TableCell>
                          <TableCell>{student.turma.idioma}</TableCell>
                          <TableCell>{student.turma.nivel}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {student.turma.horario}
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {student.turma.dias_da_semana}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={removeFromRegularClass}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Aulas Particulares */}
                      {student?.aulas_particulares && (
                        <TableRow>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              Aulas Particulares
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">Aulas Particulares</TableCell>
                          <TableCell>Variado</TableCell>
                          <TableCell>Personalizado</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            Flexível
                          </TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            Agendamento
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={removeFromPrivateClasses}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Múltiplas Matrículas:</strong> Este aluno pode estar matriculado em uma turma regular e aulas particulares simultaneamente.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Turma Principal:</strong> Apenas uma turma regular pode ser definida como principal no momento.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Aulas Particulares:</strong> Modalidade flexível com horários personalizados.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Futuras Expansões:</strong> O sistema está preparado para suportar múltiplas turmas regulares com a implementação da tabela de relacionamento.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};