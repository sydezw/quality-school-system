import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Phone, Mail, Calendar } from 'lucide-react';
import { formatPhone } from '@/utils/formatters';

interface Student {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  status: string;
  created_at: string;
}

interface PlanStudentsModalProps {
  planId: string | null;
  planName: string;
  isOpen: boolean;
  onClose: () => void;
}

const PlanStudentsModal = ({ planId, planName, isOpen, onClose }: PlanStudentsModalProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && planId) {
      fetchStudents();
    }
  }, [isOpen, planId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.telefone?.includes(searchTerm)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    if (!planId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          aluno_id,
          alunos (
            id,
            nome,
            email,
            telefone,
            data_nascimento,
            status,
            created_at
          )
        `)
        .eq('plano_id', planId)
        .eq('status_contrato', 'Ativo');

      if (error) {
        throw error;
      }

      const studentsData = data
        ?.map(contract => contract.alunos)
        .filter(Boolean) as Student[];

      setStudents(studentsData || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar alunos do plano.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      inativo: { label: 'Inativo', variant: 'secondary' as const },
      suspenso: { label: 'Suspenso', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const
    };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Alunos do Plano: {planName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Contador de alunos */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredStudents.length} aluno(s) encontrado(s)
            </p>
          </div>

          {/* Tabela de alunos */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando alunos...</p>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center p-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhum aluno encontrado com os critérios de pesquisa.' : 'Nenhum aluno matriculado neste plano.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Data de Nascimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Matrícula</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-base">
                          {student.nome}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.email && (
                              <div className="flex items-center gap-1 text-base">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span>{student.email}</span>
                              </div>
                            )}
                            {student.telefone && (
                              <div className="flex items-center gap-1 text-base">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{formatPhone(student.telefone)}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-base">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {formatDate(student.data_nascimento)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(student.status)}
                        </TableCell>
                        <TableCell className="text-base">
                          {formatDate(student.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanStudentsModal;