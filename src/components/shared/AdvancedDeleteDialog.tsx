import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DeletionPlan {
  itemName: string;
  itemType: string;
  dependencies?: {
    type: string;
    count: number;
    items?: string[];
  }[];
  warnings?: string[];
}

interface AdvancedDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deletionPlan?: DeletionPlan | null;
  entityType?: string;
  entityName?: string;
  onConfirm: (plan: DeletionPlan) => void;
  isLoading?: boolean;
}

export function AdvancedDeleteDialog({
  open,
  onOpenChange,
  deletionPlan,
  entityType = 'item',
  entityName = '',
  onConfirm,
  isLoading = false,
}: AdvancedDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const expectedText = 'EXCLUIR';
  const isConfirmValid = confirmText === expectedText;

  const handleConfirm = () => {
    if (isConfirmValid) {
      const plan: DeletionPlan = deletionPlan || {
        itemName: entityName,
        itemType: entityType,
      };
      onConfirm(plan);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onOpenChange(false);
  };

  const currentPlan = deletionPlan || {
    itemName: entityName,
    itemType: entityType,
  };

  const hasDependencies = currentPlan.dependencies && currentPlan.dependencies.length > 0;
  const hasWarnings = currentPlan.warnings && currentPlan.warnings.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Você está prestes a excluir {currentPlan.itemType.toLowerCase()}:
            <strong className="block mt-1">{currentPlan.itemName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasDependencies && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Esta ação também excluirá:</p>
                  {currentPlan.dependencies!.map((dep, index) => (
                    <div key={index} className="text-sm">
                      <p>
                        • {dep.count} {dep.type.toLowerCase()}
                        {dep.count !== 1 ? 's' : ''}
                      </p>
                      {dep.items && dep.items.length > 0 && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {dep.items.slice(0, 3).map((item, itemIndex) => (
                            <li key={itemIndex} className="text-xs opacity-80">
                              - {item}
                            </li>
                          ))}
                          {dep.items.length > 3 && (
                            <li className="text-xs opacity-60">
                              ... e mais {dep.items.length - 3}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {hasWarnings && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {currentPlan.warnings!.map((warning, index) => (
                    <p key={index} className="text-sm">
                      • {warning}
                    </p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Para confirmar, digite <code className="bg-muted px-1 rounded">{expectedText}</code>:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Digite EXCLUIR para confirmar"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir Definitivamente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}