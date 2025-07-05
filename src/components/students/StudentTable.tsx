
import React, { useState } from 'react';
import { Student } from '@/integrations/supabase/types';
import { Edit, Trash2, DollarSign } from 'lucide-react';
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

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete?: (student: Student, hardDeleteOptions?: any) => void;
  onCreateFinancialPlan?: (student: Student) => void;
  isDeleting?: boolean;
}

const StudentTable = ({ students, onEdit, onDelete, onCreateFinancialPlan, isDeleting }: StudentTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

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
  
  const getStatusColor = (student: Student) => {
    switch (student.status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Trancado': return 'bg-yellow-100 text-yellow-800';
      case 'Inativo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <TableCell className="font-medium">{student.nome}</TableCell>
              <TableCell>{student.cpf || 'Não informado'}</TableCell>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(student)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onCreateFinancialPlan && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCreateFinancialPlan(student)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Criar Plano Financeiro"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(student)}
                      disabled={isDeleting}
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
      
      <AdvancedStudentDeleteDialog
        student={studentToDelete}
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default StudentTable;
