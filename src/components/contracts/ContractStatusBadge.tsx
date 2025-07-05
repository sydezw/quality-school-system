import { Badge } from '@/components/ui/badge';
import { Contract } from '@/hooks/useContracts';

interface ContractStatusBadgeProps {
  contract: Contract;
}

export const ContractStatusBadge = ({ contract }: ContractStatusBadgeProps) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Vencido': return 'destructive';
      case 'Vencendo': return 'destructive'; // Mudança: vencendo também em vermelho
      case 'Ativo': return 'default';
      case 'Agendado': return 'outline';
      case 'Cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const getBadgeText = (contract: Contract) => {
    // Garantir que o status tenha a primeira letra maiúscula
    return contract.status_contrato;
  };

  return (
    <Badge variant={getBadgeVariant(contract.status_contrato)}>
      {getBadgeText(contract)}
    </Badge>
  );
};