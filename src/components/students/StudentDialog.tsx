
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import StudentForm from './StudentForm';
import NewStudentForm from './NewStudentForm';
interface Student {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  cpf: string;
  turma_id: string;
}

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
  // Se está editando, usa Sheet (mantém animação)
  if (editingStudent) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              Editar Aluno
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
  }

  // Se está criando, usa Dialog (modal centralizado)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {!hideButton && (
        <DialogTrigger asChild>
          <Button onClick={onOpenCreate} className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
            <Plus />
            Novo Aluno
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Novo Aluno
          </DialogTitle>
        </DialogHeader>
        <NewStudentForm
          classes={classes}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StudentDialog;
