
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { Student } from '@/integrations/supabase/types';

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
