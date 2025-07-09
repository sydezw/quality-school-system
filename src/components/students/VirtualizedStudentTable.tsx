import React, { memo, useMemo, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users } from 'lucide-react';
import VirtualizedStudentRow from './VirtualizedStudentRow';
import { StudentWithRelations } from '@/types/shared';

interface VirtualizedStudentTableProps {
  students: StudentWithRelations[];
  onEdit: (student: StudentWithRelations) => void;
  onDelete?: (student: StudentWithRelations) => void;
  onCreateFinancialPlan?: (student: StudentWithRelations) => void;
  isDeleting?: boolean;
}

const ITEM_HEIGHT = 80;
const HEADER_HEIGHT = 60;

const VirtualizedStudentTable = memo(({ 
  students, 
  onEdit, 
  onDelete, 
  onCreateFinancialPlan, 
  isDeleting 
}: VirtualizedStudentTableProps) => {
  
  const [containerHeight, setContainerHeight] = useState(800);

  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      // Usar 70% da altura da viewport, mínimo 800px
      const dynamicHeight = Math.max(800, viewportHeight * 0.7);
      setContainerHeight(dynamicHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  const listHeight = useMemo(() => {
    return containerHeight - HEADER_HEIGHT;
  }, [containerHeight]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const student = students[index];
    
    return (
      <VirtualizedStudentRow
        student={student}
        index={index}
        style={style}
        onEdit={onEdit}
        onDelete={onDelete}
        onCreateFinancialPlan={onCreateFinancialPlan}
        isDeleting={isDeleting}
      />
    );
  };

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
    <div className="w-full">
      <div 
        className="overflow-hidden rounded-2xl border border-gray-200 shadow-xl bg-white w-full" 
        style={{ height: `${containerHeight}px` }}
      >
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
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
          </Table>
        </div>
        
        {/* Lista virtualizada */}
        <div className="relative" style={{ height: `${listHeight}px` }}>
          <List
            height={listHeight}
            itemCount={students.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
            className="scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100 hover:scrollbar-thumb-red-400"
            style={{
              overflowX: 'hidden'
            }}
          >
            {Row}
          </List>
        </div>
      </div>
    </div>
  );
});

VirtualizedStudentTable.displayName = 'VirtualizedStudentTable';

export default VirtualizedStudentTable;