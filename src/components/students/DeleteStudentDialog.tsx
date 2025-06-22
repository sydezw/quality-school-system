import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { Student } from '@/integrations/supabase/types';

interface DeleteStudentDialogProps {
  isOpen: boolean;
  student: Student | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteStudentDialog: React.FC<DeleteStudentDialogProps> = ({
  isOpen,
  student,
  onOpenChange,
  onConfirm,
  isDeleting
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-sm text-gray-600 mt-2">
          Tem certeza que deseja excluir o aluno{' '}
          <span className="font-semibold text-gray-900">
            {student?.nome}
          </span>
          ?
          <br />
          <br />
          <span className="text-red-600 font-medium">
            Esta ação não pode ser desfeita.
          </span>
          {' '}Todos os dados relacionados ao aluno (contratos, boletos, etc.) também serão removidos permanentemente.
        </AlertDialogDescription>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="mr-2"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Excluindo...
              </>
            ) : (
              'Excluir Aluno'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteStudentDialog;