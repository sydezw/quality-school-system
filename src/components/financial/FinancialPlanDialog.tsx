import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FinancialPlanForm from './FinancialPlanForm';
import { Student } from '@/integrations/supabase/types';

interface FinancialPlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudent?: Student | null;
  onSuccess: () => void;
}

const FinancialPlanDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedStudent, 
  onSuccess 
}: FinancialPlanDialogProps) => {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedStudent 
              ? `Criar Plano Financeiro - ${selectedStudent.nome}`
              : 'Criar Plano Financeiro'
            }
          </DialogTitle>
        </DialogHeader>
        <FinancialPlanForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          preSelectedStudent={selectedStudent}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FinancialPlanDialog;