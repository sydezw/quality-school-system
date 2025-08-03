
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
  email: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  cpf: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  idioma: string | null;
  nivel: string | null;
  turma_id: string | null;
  responsavel_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  data_cancelamento: string | null;
  data_conclusao: string | null;
  data_exclusao: string | null;
}

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel?: string; // Tornando opcional para alinhar com useStudents.tsx
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
          <Button onClick={onOpenCreate} className="bg-[#D90429] hover:bg-[#1F2937] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
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
