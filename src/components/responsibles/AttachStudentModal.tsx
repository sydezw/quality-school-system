import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, User, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status: string;
  idioma: string | null;
  nivel: string | null;
  data_nascimento: string | null;
}

interface Responsible {
  id: string;
  nome: string;
}

interface AttachStudentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  responsible: Responsible | null;
  onSuccess: () => void;
}

const AttachStudentModal = ({ isOpen, onOpenChange, responsible, onSuccess }: AttachStudentModalProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const { toast } = useToast();

  // Função para calcular idade
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Buscar alunos sem responsável e menores de 18 anos
  const fetchStudentsWithoutResponsible = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, email, telefone, status, idioma, nivel, data_nascimento')
        .is('responsavel_id', null)
        .eq('status', 'Ativo')
        .not('data_nascimento', 'is', null)
        .order('nome');

      if (error) throw error;
      
      // Filtrar apenas alunos menores de 18 anos
      const minorStudents = (data || []).filter(student => {
        if (!student.data_nascimento) return false;
        const age = calculateAge(student.data_nascimento);
        return age < 18;
      });
      
      setStudents(minorStudents);
      setFilteredStudents(minorStudents);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos sem responsável.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar alunos por termo de busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Carregar alunos quando o modal abrir
  useEffect(() => {
    if (isOpen && responsible) {
      fetchStudentsWithoutResponsible();
      setSearchTerm('');
    }
  }, [isOpen, responsible]);

  // Anexar aluno ao responsável
  const handleAttachStudent = async (student: Student) => {
    if (!responsible) return;

    setAttaching(true);
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ responsavel_id: responsible.id })
        .eq('id', student.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Aluno ${student.nome} foi anexado ao responsável ${responsible.nome}.`,
      });

      // Atualizar lista removendo o aluno anexado
      const updatedStudents = students.filter(s => s.id !== student.id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents.filter(s => 
        !searchTerm || 
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
      ));

      onSuccess();
    } catch (error) {
      console.error('Erro ao anexar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível anexar o aluno ao responsável.",
        variant: "destructive",
      });
    } finally {
      setAttaching(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Anexar Aluno ao Responsável
          </DialogTitle>
          {responsible && (
            <p className="text-sm text-gray-600">
              Responsável: <span className="font-medium">{responsible.nome}</span>
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Campo de busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar aluno</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Digite o nome ou email do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de alunos */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando alunos...</p>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Nenhum aluno menor de 18 anos encontrado com os critérios de busca.' 
                      : 'Não há alunos menores de 18 anos sem responsável no momento.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-r from-red-600 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{student.nome}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {student.email && (
                                <span className="text-sm text-gray-600">{student.email}</span>
                              )}
                              {student.telefone && (
                                <span className="text-sm text-gray-600">• {student.telefone}</span>
                              )}
                              {student.data_nascimento && (
                                <span className="text-sm text-gray-600">• {calculateAge(student.data_nascimento)} anos</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={student.status === 'ativo' ? 'default' : 'secondary'} className="text-xs">
                                {student.status}
                              </Badge>
                              {student.idioma && (
                                <Badge variant="outline" className="text-xs">
                                  {student.idioma}
                                </Badge>
                              )}
                              {student.nivel && (
                                <Badge variant="outline" className="text-xs">
                                  {student.nivel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAttachStudent(student)}
                        disabled={attaching}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Anexar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachStudentModal;