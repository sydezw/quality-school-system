import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, User, DollarSign, AlertTriangle } from 'lucide-react';
import { Contract } from '@/hooks/useContracts';
import { ContractStatusBadge } from './ContractStatusBadge';
import { ContractActions } from './ContractActions';

interface ContractTableProps {
  contracts: Contract[];
  loading?: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onTerminate: (id: string) => void;
  onRenew: (contract: Contract) => void;
  filterLabel?: string;
}

// Função para renderizar a situação com alertas
const renderSituacao = (contract: Contract) => {
  const isVencendo = contract.status_contrato === 'Vencendo';
  const diasRestantes = contract.dias_restantes || 0;
  const isAlerta = isVencendo && diasRestantes <= 60;
  
  if (isAlerta) {
    return (
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <span className="text-base font-medium text-red-600">
          {contract.situacao}
        </span>
      </div>
    );
  }
  
  return (
    <span className="text-base text-muted-foreground">
      {contract.situacao || '-'}
    </span>
  );
};

export const ContractTable = ({ 
  contracts, 
  loading, 
  onEdit, 
  onDelete, 
  onTerminate, 
  onRenew,
  filterLabel = 'Todos'
}: ContractTableProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-100 animate-pulse rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contratos {filterLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead>Data Fim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium text-base">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {contract.aluno_nome || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-base text-muted-foreground">
                    {contract.plano_nome || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-base text-muted-foreground">
                    {contract.idioma_contrato || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-base">
                  {new Date(contract.data_inicio).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-base">
                  {new Date(contract.data_fim).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <ContractStatusBadge contract={contract} />
                </TableCell>
                <TableCell>
                  {renderSituacao(contract)}
                </TableCell>
                <TableCell>
                  <span className="text-base text-muted-foreground">
                    {contract.observacao || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ContractActions
                    contract={contract}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTerminate={onTerminate}
                    onRenew={onRenew}
                  />
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhum contrato encontrado para este filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};