import React, { memo } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, DollarSign, User, Phone, Mail, GraduationCap, Users, Star } from 'lucide-react';
import { formatCPF } from '@/utils/formatters';
import { StudentWithRelations } from '@/types/shared';

interface VirtualizedStudentRowProps {
  student: StudentWithRelations;
  index: number;
  style: React.CSSProperties;
  onEdit: (student: StudentWithRelations) => void;
  onDelete?: (student: StudentWithRelations) => void;
  onCreateFinancialPlan?: (student: StudentWithRelations) => void;
  isDeleting?: boolean;
}

const VirtualizedStudentRow = memo(({ 
  student, 
  index, 
  style,
  onEdit, 
  onDelete, 
  onCreateFinancialPlan, 
  isDeleting 
}: VirtualizedStudentRowProps) => {
  
  const getStatusColor = (student: StudentWithRelations) => {
    switch (student.status) {
      case 'Ativo': return 'bg-green-500 text-white';
      case 'Trancado': return 'bg-yellow-500 text-white';
      case 'Inativo': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLanguageIcon = (idioma: string) => {
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
  };

  return (
    <div style={style}>
      <TableRow 
        className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
        }`}
      >
        <TableCell className="font-medium py-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white rounded-full p-2">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-gray-800">{student.nome}</span>
              <p className="text-xs text-gray-500">ID: {student.id}</p>
            </div>
          </div>
        </TableCell>
        
        <TableCell className="py-4">
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {student.cpf ? formatCPF(student.cpf) : 'Não informado'}
          </span>
        </TableCell>
        
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getLanguageIcon(student.idioma)}</span>
            <span className="text-sm font-medium">{student.idioma}</span>
          </div>
        </TableCell>
        
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span className="text-sm">{student.turmas?.nome || 'Sem turma'}</span>
          </div>
        </TableCell>
        
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm">{student.responsaveis?.nome || 'Sem responsável'}</span>
          </div>
        </TableCell>
        
        <TableCell className="py-4">
          <Badge className={`${getStatusColor(student)} px-3 py-1 rounded-full text-xs font-medium`}>
            {student.status}
          </Badge>
        </TableCell>
        
        <TableCell className="py-4">
          <div className="space-y-1">
            {student.telefone && (
              <div className="flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3 text-green-600" />
                <span>{student.telefone}</span>
              </div>
            )}
            {student.email && (
              <div className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3 text-blue-600" />
                <span>{student.email}</span>
              </div>
            )}
          </div>
        </TableCell>
        
        <TableCell className="py-4">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(student)}
              className="h-8 w-8 p-0 bg-blue-500 text-white border-0 hover:bg-blue-600"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            {onCreateFinancialPlan && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateFinancialPlan(student)}
                className="h-8 w-8 p-0 bg-green-500 text-white border-0 hover:bg-green-600"
                title="Criar Plano Financeiro"
              >
                <DollarSign className="h-3 w-3" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(student)}
                disabled={isDeleting}
                className="h-8 w-8 p-0 bg-red-500 text-white border-0 hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    </div>
  );
});

VirtualizedStudentRow.displayName = 'VirtualizedStudentRow';

export default VirtualizedStudentRow;