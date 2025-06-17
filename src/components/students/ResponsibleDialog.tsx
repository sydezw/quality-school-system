
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ResponsibleForm from './ResponsibleForm';

interface Responsible {
  id: string;
  nome: string;
  cpf: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  telefone: string | null;
}

interface ResponsibleDialogProps {
  isOpen: boolean;
  editingResponsible: Responsible | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  onOpenCreate: () => void;
}

const ResponsibleDialog = ({ 
  isOpen, 
  editingResponsible, 
  onOpenChange, 
  onSubmit, 
  onOpenCreate 
}: ResponsibleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onOpenCreate} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Responsável
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingResponsible ? 'Editar Responsável' : 'Novo Responsável'}
          </DialogTitle>
        </DialogHeader>
        <ResponsibleForm
          editingResponsible={editingResponsible}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResponsibleDialog;
