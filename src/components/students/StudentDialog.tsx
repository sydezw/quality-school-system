
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import StudentForm from './StudentForm';
import { Student } from '@/integrations/supabase/types';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
}

interface StudentDialogProps {
  isOpen: boolean;
  editingStudent: Student | null;
  classes: Class[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  onOpenCreate: () => void;
  hideButton?: boolean;
}

const StudentDialog = ({ 
  isOpen, 
  editingStudent, 
  classes, 
  onOpenChange, 
  onSubmit, 
  onOpenCreate,
  hideButton = false
}: StudentDialogProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {!hideButton && (
        <SheetTrigger asChild>
          <Button onClick={onOpenCreate} className="bg-brand-red hover:bg-brand-red/90">
            <Plus />
            Novo Aluno
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {editingStudent ? 'Editar Aluno' : 'Adicionar Aluno'}
          </SheetTitle>
        </SheetHeader>
        <StudentForm
          editingStudent={editingStudent}
          classes={classes}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

export default StudentDialog;
