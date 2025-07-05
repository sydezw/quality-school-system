import React from 'react';
import { useContracts, Contract } from '@/hooks/useContracts';
import { ContractStats, ContractFilters, ContractTable } from '@/components/contracts';
import { NewContractDialog } from '@/components/contracts/NewContractDialog';

const Contracts = () => {
  const {
    contracts,
    stats,
    loading,
    filters,
    deleteContract,
    terminateContract,
    renewContract,
    applyFilters,
    fetchContracts
  } = useContracts();

  const handleDeleteContract = async (contractId: string) => {
    await deleteContract(contractId);
  };

  const handleTerminateContract = async (contractId: string) => {
    await terminateContract(contractId);
  };

  const handleRenewContract = async (contract: Contract) => {
    await renewContract(contract);
  };

  const refreshContracts = async () => {
    await fetchContracts();
  };

  const getFilterLabel = () => {
    if (!filters.status || filters.status === 'all') return 'Todos';
    switch (filters.status) {
      case 'ativo': return 'Ativos';
      case 'vencendo': return 'Vencendo';
      case 'vencido': return 'Vencidos';
      case 'agendado': return 'Agendados';
      case 'cancelado': return 'Cancelados';
      default: return 'Todos';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-48"></div>
        <ContractStats stats={stats} loading={true} />
        <ContractTable 
          contracts={[]} 
          loading={true}
          onEdit={refreshContracts}
          onDelete={handleDeleteContract}
          onTerminate={handleTerminateContract}
          onRenew={handleRenewContract}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestão de Contratos</h1>
        <NewContractDialog onContractCreated={refreshContracts} />
      </div>

      <ContractStats stats={stats} />
      
      <ContractFilters 
        filters={filters}
        stats={stats}
        onFilterChange={applyFilters}
      />

      <ContractTable
        contracts={contracts}
        onEdit={refreshContracts}
        onDelete={handleDeleteContract}
        onTerminate={handleTerminateContract}
        onRenew={handleRenewContract}
        filterLabel={getFilterLabel()}
      />
    </div>
  );
};

export default Contracts;
