
import React, { useState, useCallback, memo } from 'react';
import { Edit, Trash2, DollarSign, User, Phone, Mail, GraduationCap, Users, Star } from 'lucide-react';
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
import { formatCPF } from '@/utils/formatters';
import { Student } from '@/types/shared';

// Definir o tipo Student estendido com relações
type StudentWithRelations = Student & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

interface StudentTableProps {
  students: StudentWithRelations[];
  onEdit: (student: StudentWithRelations) => void;
  onDelete?: (student: StudentWithRelations, hardDeleteOptions?: any) => void;
  onCreateFinancialPlan?: (student: StudentWithRelations) => void;
  isDeleting?: boolean;
}

const StudentTable = memo(({ students, onEdit, onDelete, onCreateFinancialPlan, isDeleting }: StudentTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithRelations | null>(null);

  const handleDeleteClick = (student: StudentWithRelations) => {
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
  
  const getStatusColor = (student: StudentWithRelations) => {
    switch (student.status) {
      case 'Ativo': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0';
      case 'Trancado': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0';
      case 'Inativo': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-0';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg border-0';
    }
  };

  const getLanguageIcon = useCallback((idioma: string) => {
    switch (idioma?.toLowerCase()) {
      case 'inglês':
      case 'ingles':
        return '🇺🇸';
      case 'espanhol':
        return '🇪🇸';
      case 'francês':
      case 'frances':
        return '🇫🇷';
      case 'alemão':
      case 'alemao':
        return '🇩🇪';
      case 'italiano':
        return '🇮🇹';
      default:
        return '🌐';
    }
  }, []);

  if (students.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl p-12 max-w-lg mx-auto border border-gray-200 shadow-xl">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full p-6 w-24 h-24 mx-auto mb-6 shadow-lg">
            <Users className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhum aluno encontrado</h3>
          <p className="text-gray-600 text-lg mb-2">Não há alunos cadastrados com os filtros aplicados.</p>
          <p className="text-sm text-gray-500">Tente ajustar os filtros ou cadastre um novo aluno.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-300 border-0">
              <TableHead className="text-white font-bold text-base py-4">Aluno</TableHead>
              <TableHead className="text-white font-bold text-base py-4">CPF</TableHead>
              <TableHead className="text-white font-bold text-base py-4">Idioma</TableHead>
              <TableHead className="text-white font-bold text-base py-4">Turma</TableHead>
              <TableHead className="text-white font-bold text-base py-4">Responsável</TableHead>
              <TableHead className="text-white font-bold text-base py-4">Status</TableHead>
              <TableHead className="text-white font-bold text-base py-4">Contato</TableHead>
              <TableHead className="text-white font-bold text-base py-4">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => (
              <TableRow 
                key={student.id} 
                className={`hover:bg-gradient-to-r hover:from-red-50 hover:via-pink-50 hover:to-purple-50 transition-all duration-300 border-b border-gray-100 group ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <TableCell className="font-medium text-base py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full p-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-1 shadow-md">
                        <Star className="h-3 w-3" />
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-lg">{student.nome}</span>
                      <p className="text-sm text-gray-500 mt-1">ID: {student.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-base py-6">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 font-mono text-gray-700 inline-block">
                    {student.cpf ? formatCPF(student.cpf) : 'Não informado'}
                  </div>
                </TableCell>
                <TableCell className="text-base py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getLanguageIcon(student.idioma)}</span>
                    <div>
                      <span className="font-semibold text-gray-700">{student.idioma}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-base py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700 font-medium">{student.turmas?.nome || 'Sem turma'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-base py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-600 rounded-lg p-2">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700 font-medium">{student.responsaveis?.nome || 'Sem responsável'}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge className={`${getStatusColor(student)} px-4 py-2 rounded-full font-bold text-sm transform hover:scale-110 transition-all duration-300 cursor-default`}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-6">
                  <div className="space-y-2">
                    {student.telefone && (
                      <div className="flex items-center gap-2 text-sm bg-green-50 rounded-lg px-3 py-1">
                        <Phone className="h-3 w-3 text-green-600" />
                        <span className="text-gray-700 font-medium">{student.telefone}</span>
                      </div>
                    )}
                    {student.email && (
                      <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg px-3 py-1">
                        <Mail className="h-3 w-3 text-blue-600" />
                        <span className="text-gray-600 font-medium">{student.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(student)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onCreateFinancialPlan && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCreateFinancialPlan(student)}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
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
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none"
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
      
      <AdvancedStudentDeleteDialog
        student={studentToDelete}
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
});

export default StudentTable;
