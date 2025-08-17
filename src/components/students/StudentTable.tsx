
import React, { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Edit, Trash2, DollarSign, Eye, User, FileText, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdvancedStudentDeleteDialog from './AdvancedStudentDeleteDialog';
import StudentContractGeneratorModal from './StudentContractGeneratorModal';
import { NewContractDialog } from './StudentNewContractModal';
import { EditContractDialog } from './StudentEditContractModal';
import { formatCPF } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Definir o tipo Student baseado na tabela alunos do banco
type Student = Database['public']['Tables']['alunos']['Row'] & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete?: (student: Student, hardDeleteOptions?: any) => void;
  onCreateFinancialPlan?: (student: Student) => void;
  onViewDetails?: (student: Student) => void;
  isDeleting?: boolean;
}

const StudentTable = ({ students, onEdit, onDelete, onCreateFinancialPlan, onViewDetails, isDeleting }: StudentTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [contractGeneratorOpen, setContractGeneratorOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [studentsWithContracts, setStudentsWithContracts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (hardDeleteOptions?: any) => {
    if (studentToDelete && onDelete) {
      onDelete(studentToDelete, hardDeleteOptions);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  // Verificar quais alunos têm contratos ativos
  useEffect(() => {
    const checkStudentContracts = async () => {
      const studentIds = students.map(s => s.id);
      if (studentIds.length === 0) return;

      try {
        const { data: contracts, error } = await supabase
          .from('contratos')
          .select('aluno_id')
          .in('aluno_id', studentIds)
          .in('status_contrato', ['Ativo', 'Agendado', 'Vencendo']);

        if (error) throw error;

        const studentIdsWithContracts = new Set(contracts?.map(c => c.aluno_id) || []);
        setStudentsWithContracts(studentIdsWithContracts);
      } catch (error) {
        console.error('Erro ao verificar contratos dos alunos:', error);
      }
    };

    checkStudentContracts();
  }, [students]);

  const handleStudentClick = (student: Student) => {
    // Função para lidar com clique no aluno - abre modal de detalhes
    if (onViewDetails) {
      onViewDetails(student);
    } else {
      console.log('Clicou no aluno:', student);
    }
  };

  const handleContractGenerator = (student: Student) => {
    setSelectedStudent(student);
    setContractGeneratorOpen(true);
  };

  const handleNewContract = (student: Student) => {
    // Os novos modais controlam seu próprio estado
    console.log('Novo contrato para:', student.nome);
  };

  const handleEditContract = async (student: Student) => {
    try {
      // Buscar contrato ativo do aluno
      const { data: contracts, error } = await supabase
        .from('contratos')
        .select(`
          *,
          planos(nome)
        `)
        .eq('aluno_id', student.id)
        .in('status_contrato', ['Ativo', 'Agendado'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (contracts && contracts.length > 0) {
        const contract = {
          ...contracts[0],
          aluno_nome: student.nome,
          plano_nome: contracts[0].planos?.nome
        };
        setSelectedContract(contract);
        setSelectedStudent(student);
      } else {
        toast({
          title: "Aviso",
          description: "Este aluno não possui contrato ativo para editar.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar contrato do aluno.",
        variant: "destructive",
      });
    }
  };

  const handleContractUpdated = () => {
    // Callback para atualizar dados após modificação de contrato
    toast({
      title: "Sucesso",
      description: "Contrato atualizado com sucesso!",
    });
  };


  
  const getStatusColor = (student: Student) => {
    switch (student.status) {
      case 'Ativo': return 'bg-green-500 text-white';
      case 'Trancado': return 'bg-yellow-500 text-white';
      case 'Inativo': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum aluno cadastrado ainda.</p>
        <p className="text-sm text-gray-400">Clique no botão "Novo Aluno" para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Idioma</TableHead>
            <TableHead>Turma</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                <div 
                  className="flex items-center gap-2 cursor-pointer group hover:bg-gradient-to-r hover:from-[#D90429]/5 hover:to-pink-500/5 p-2 rounded-lg transition-all duration-200"
                  onClick={() => handleStudentClick(student)}
                  title="Clique para ver detalhes do aluno"
                >
                  <div className="p-1.5 bg-gradient-to-r from-[#D90429] to-pink-500 rounded-full group-hover:scale-110 transition-transform duration-200">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="group-hover:text-[#D90429] transition-colors duration-200 font-medium">
                    {student.nome}
                  </span>
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-[#D90429] opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </div>
              </TableCell>
              <TableCell>{student.cpf ? formatCPF(student.cpf) : 'Não informado'}</TableCell>
              <TableCell>{student.idioma}</TableCell>
              <TableCell>{student.turmas?.nome || 'Sem turma'}</TableCell>
              <TableCell>{student.responsaveis?.nome || 'Sem responsável'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(student)}>
                  {student.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {student.telefone && <div>{student.telefone}</div>}
                  {student.email && <div className="text-gray-500">{student.email}</div>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* Botão Editar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(student)}
                    className="h-8 w-8 p-0 rounded-full border-2 border-blue-600 bg-white hover:bg-blue-600 text-blue-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                    title="Editar Aluno"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  {/* Botão Gerador de Contrato */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContractGenerator(student)}
                    className="h-8 w-8 p-0 rounded-full border-2 border-purple-600 bg-white hover:bg-purple-600 text-purple-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                    title="Gerar Contrato"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>



                  {/* Modais dentro da célula de ações */}
                  <AdvancedStudentDeleteDialog
                    student={studentToDelete}
                    isOpen={deleteDialogOpen && studentToDelete?.id === student.id}
                    onClose={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    isLoading={isDeleting}
                  />

                  <StudentContractGeneratorModal
                    student={selectedStudent}
                    isOpen={contractGeneratorOpen && selectedStudent?.id === student.id}
                    onClose={() => {
                      setContractGeneratorOpen(false);
                      setSelectedStudent(null);
                    }}
                  />

                  {/* Mostrar botão de Novo Contrato apenas para alunos SEM contratos */}
                  {!studentsWithContracts.has(student.id) && (
                    <NewContractDialog
                      student={{ id: student.id, nome: student.nome }}
                      onContractCreated={handleContractUpdated}
                    />
                  )}

                  {/* Mostrar botão de Editar Contrato apenas para alunos COM contratos */}
                  {studentsWithContracts.has(student.id) && (
                    <EditContractDialog
                      student={{ id: student.id, nome: student.nome }}
                      onContractUpdated={handleContractUpdated}
                    />
                  )}



                  {/* Botão Plano Financeiro */}
                  {onCreateFinancialPlan && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateFinancialPlan(student)}
                      className="h-8 w-8 p-0 rounded-full border-2 border-green-600 bg-white hover:bg-green-600 text-green-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Criar Plano Financeiro"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Botão Deletar */}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(student)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 rounded-full border-2 border-red-600 bg-white hover:bg-red-600 text-red-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Deletar Aluno"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </div>
  );
};

export default StudentTable;

