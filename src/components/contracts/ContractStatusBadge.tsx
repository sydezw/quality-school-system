import { Badge } from '@/components/ui/badge';
import { Contract } from '@/hooks/useContracts';

interface ContractStatusBadgeProps {
  contract: Contract;
}

export const ContractStatusBadge = ({ contract }: ContractStatusBadgeProps) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Vencido': return 'destructive';
      case 'Vencendo': return 'outline'; // Usar outline para aplicar classe personalizada
      case 'Ativo': return 'outline'; // Usar outline para aplicar classe personalizada
      case 'Agendado': return 'outline';
      case 'Cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const getBadgeClassName = (status: string) => {
    if (status === 'Ativo') {
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    }
    if (status === 'Vencendo') {
      return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
    }
    return '';
  };

  const getBadgeText = (contract: Contract) => {
    // Garantir que o status tenha a primeira letra maiúscula
    return contract.status_contrato;
  };

  return (
    <Badge 
      variant={getBadgeVariant(contract.status_contrato)}
      className={getBadgeClassName(contract.status_contrato)}
    >
      {getBadgeText(contract)}
    </Badge>
  );
};