
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { Student } from '@/integrations/supabase/types';

interface FormActionsProps {
  editingStudent: Student | null;
  isSubmitting: boolean;
  onCancel: () => void;
}

const FormActions = ({ editingStudent, isSubmitting, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSubmitting ? 'Salvando...' : (editingStudent ? 'Atualizar' : 'Salvar')} Aluno
      </Button>
    </div>
  );
};

export default FormActions;
