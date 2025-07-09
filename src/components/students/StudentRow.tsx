import React, { memo, useCallback } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, DollarSign, User, Phone, Mail, GraduationCap, Users, Star } from 'lucide-react';
import { formatCPF } from '@/utils/formatters';

interface StudentRowProps {
  student: any;
  index: number;
  onEdit: (student: any) => void;
  onDelete?: (student: any) => void;
  onCreateFinancialPlan?: (student: any) => void;
  isDeleting?: boolean;
  getStatusColor: (student: any) => string;
  getLanguageIcon: (idioma: string) => string;
}

const StudentRow = memo(({ 
  student, 
  index, 
  onEdit, 
  onDelete, 
  onCreateFinancialPlan, 
  isDeleting,
  getStatusColor,
  getLanguageIcon 
}: StudentRowProps) => {
  
  const handleEdit = useCallback(() => onEdit(student), [onEdit, student]);
  const handleDelete = useCallback(() => onDelete?.(student), [onDelete, student]);
  const handleCreatePlan = useCallback(() => onCreateFinancialPlan?.(student), [onCreateFinancialPlan, student]);

  return (
    <TableRow 
      className={`hover:bg-gradient-to-r hover:from-red-50 hover:via-pink-50 hover:to-purple-50 transition-all duration-300 border-b border-gray-100 group ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
      }`}
    >
      {/* ... conteúdo da linha permanece igual ... */}
    </TableRow>
  );
});

StudentRow.displayName = 'StudentRow';

export default StudentRow;