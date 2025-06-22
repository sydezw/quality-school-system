
import React, { useState } from 'react';
import { Student } from '@/integrations/supabase/types';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PermissionButton } from '@/components/shared/PermissionButton';
import { formatPhoneNumber } from '@/utils/formatters';
import { DeleteStudentDialog } from './DeleteStudentDialog';
import { Badge } from '@/components/ui/badge';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => Promise<boolean>;
  deletingStudentId?: string | null;
}

const StudentTable = ({ students, onEdit, onDelete, deletingStudentId }: StudentTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    setIsDeleting(true);
    const success = await onDelete(studentToDelete.id);
    
    if (success) {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
    
    setIsDeleting(false);
  };

  const handleDeleteCancel = () => {
     setDeleteDialogOpen(false);
     setStudentToDelete(null);
   };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Trancado': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
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
    <>
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
              <Badge className={getStatusColor(student.status)}>
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
              <div className="flex space-x-2">
                <PermissionButton
                  permission="gerenciarAlunos"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(student)}
                  showLockIcon={false}
                >
                  <Edit className="h-4 w-4" />
                </PermissionButton>
                <PermissionButton
                  permission="gerenciarAlunos"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(student)}
                  className="text-red-600 hover:text-red-700"
                  showLockIcon={false}
                  disabled={deletingStudentId === student.id}
                >
                  {deletingStudentId === student.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </PermissionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    
    <DeleteStudentDialog
      isOpen={deleteDialogOpen}
      student={studentToDelete}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleDeleteConfirm}
      isDeleting={isDeleting}
    />
  </>);
};

export default StudentTable;
