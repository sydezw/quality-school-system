import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  itemName?: string; // ex: "parcela", "aluno", "registro"
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemName = "item",
  isLoading = false
}) => {
  const [confirmText, setConfirmText] = useState('');

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === 'excluir') {
      onConfirm();
      setConfirmText('');
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === 'excluir';

  const getTitle = () => {
    if (itemCount === 1) {
      return `Excluir ${itemName}`;
    }
    return `Excluir ${itemCount} ${itemName}s`;
  };

  const getDescription = () => {
    if (itemCount === 1) {
      return `Tem certeza que deseja excluir este ${itemName}? Esta ação não pode ser desfeita.`;
    }
    return `Tem certeza que deseja excluir ${itemCount} ${itemName}s selecionados? Esta ação não pode ser desfeita.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-red-700 font-medium">
                Atenção: Esta ação é irreversível
              </p>
              <p className="text-sm text-red-600">
                {getDescription()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              Para confirmar, digite <span className="font-bold text-red-600">"excluir"</span>:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Digite: excluir"
              disabled={isLoading}
              className="border-red-200 focus:border-red-400 focus:ring-red-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};