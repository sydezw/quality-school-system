
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  status: string;
  idioma: string;
  turma_id: string | null;
  responsavel_id: string | null;
  data_nascimento: Date | null;
}

interface FormActionsProps {
  editingStudent: Student | null;
  isSubmitting: boolean;
  onCancel: () => void;
}

const FormActions = ({ editingStudent, isSubmitting, onCancel }: FormActionsProps) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90" disabled={isSubmitting}>
        <Save />
        {editingStudent ? 'Salvar Alterações' : 'Salvar Aluno'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
};

export default FormActions;
