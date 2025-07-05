import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Edit, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Contract } from '@/hooks/useContracts';
import { EditContractDialog } from './EditContractDialog';

interface ContractActionsProps {
  contract: Contract;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onTerminate: (id: string) => void;
  onRenew: (contract: Contract) => void;
}

export const ContractActions = ({ 
  contract, 
  onEdit, 
  onDelete, 
  onTerminate, 
  onRenew 
}: ContractActionsProps) => {
  const canTerminate = ['Ativo', 'Vencendo', 'Vencido'].includes(contract.status_contrato);
  const canRenew = ['Ativo', 'Vencendo', 'Vencido'].includes(contract.status_contrato);
  const canEdit = contract.status_contrato !== 'Cancelado';

  return (
    <div className="flex gap-2 flex-wrap">
      {canEdit && (
        <EditContractDialog contract={contract} onContractUpdated={onEdit} />
      )}
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(contract.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {canTerminate && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Encerrar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Encerrar contrato</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja encerrar este contrato? O status do aluno será alterado para Inativo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onTerminate(contract.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Encerrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {canRenew && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="default">
              <RotateCcw className="h-4 w-4 mr-1" />
              Renovar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Renovar contrato</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja renovar este contrato por mais 1 ano? A data de fim será estendida e o status será atualizado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRenew(contract)}>
                Renovar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};