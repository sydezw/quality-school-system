import { AlertTriangle } from 'lucide-react';
import { Contract } from '@/hooks/useContracts';

interface SituacaoAlertProps {
  contract: Contract;
}

export const SituacaoAlert = ({ contract }: SituacaoAlertProps) => {
  const isVencendo = contract.status_contrato === 'Vencendo';
  const diasRestantes = contract.dias_restantes || 0;
  const isAlerta = isVencendo && diasRestantes <= 60;
  
  if (isAlerta) {
    return (
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" style={{ color: '#ef4444' }} />
        <span className="text-sm font-medium" style={{ color: '#dc2626' }}>
          {contract.situacao}
        </span>
      </div>
    );
  }
  
  return (
    <span className="text-sm text-muted-foreground">
      {contract.situacao || '-'}
    </span>
  );
};