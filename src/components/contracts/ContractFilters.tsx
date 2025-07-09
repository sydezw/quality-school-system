import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { ContractFilters as ContractFiltersType, ContractStats } from '@/hooks/useContracts';
import DatePicker from '@/components/shared/DatePicker';
import { format, parse } from 'date-fns';

interface ContractFiltersProps {
  filters: ContractFiltersType;
  stats: ContractStats;
  onFilterChange: (filters: ContractFiltersType) => void;
}

export const ContractFilters = ({ filters, stats, onFilterChange }: ContractFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce da busca para melhor performance
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchTerm });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusFilter = (status: ContractFiltersType['status']) => {
    onFilterChange({ ...filters, status });
  };

  const handleValueFilter = (field: 'valor_min' | 'valor_max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    onFilterChange({ ...filters, [field]: numValue });
  };

  const handleDateFilter = (field: 'data_inicio' | 'data_fim', value: string) => {
    onFilterChange({ ...filters, [field]: value || undefined });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({ status: 'all' });
  };

  const [dataInicio, setDataInicio] = useState<Date | null>(
    filters.data_inicio ? parse(filters.data_inicio, 'yyyy-MM-dd', new Date()) : null
  );
  const [dataFim, setDataFim] = useState<Date | null>(
    filters.data_fim ? parse(filters.data_fim, 'yyyy-MM-dd', new Date()) : null
  );

  return (
    <div className="space-y-4">
      {/* Busca Inteligente */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nome do aluno ou observações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros Rápidos */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={!filters.status || filters.status === 'all' ? 'default' : 'outline'}
          onClick={() => handleStatusFilter('all')}
          size="sm"
          className={`transition-all duration-200 ${
            !filters.status || filters.status === 'all' 
              ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
              : 'border-black text-black hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Todos ({stats.total})
        </Button>
        <Button 
          variant={filters.status === 'ativo' ? 'default' : 'outline'}
          onClick={() => handleStatusFilter('ativo')}
          size="sm"
          className={`transition-all duration-200 ${
            filters.status === 'ativo'
              ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
              : 'border-black text-black hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Ativos ({stats.ativos})
        </Button>
        <Button 
          variant={filters.status === 'vencendo' ? 'default' : 'outline'}
          onClick={() => handleStatusFilter('vencendo')}
          size="sm"
          className={`transition-all duration-200 ${
            filters.status === 'vencendo'
              ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
              : 'border-black text-black hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Vencendo ({stats.vencendo})
        </Button>
        <Button 
          variant={filters.status === 'vencido' ? 'default' : 'outline'}
          onClick={() => handleStatusFilter('vencido')}
          size="sm"
          className={`transition-all duration-200 ${
            filters.status === 'vencido'
              ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
              : 'border-black text-black hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Vencidos ({stats.vencidos})
        </Button>
        <Button 
          variant={filters.status === 'agendado' ? 'default' : 'outline'}
          onClick={() => handleStatusFilter('agendado')}
          size="sm"
          className={`transition-all duration-200 ${
            filters.status === 'agendado'
              ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
              : 'border-black text-black hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Agendados ({stats.agendados})
        </Button>
        <Button 
          variant={filters.status === 'cancelado' ? 'default' : 'outline'}
          onClick={() => handleStatusFilter('cancelado')}
          size="sm"
          className={`transition-all duration-200 ${
            filters.status === 'cancelado'
              ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
              : 'border-black text-black hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Cancelados ({stats.cancelados})
        </Button>
      </div>

      {/* Botão para Filtros Avançados */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros Avançados
        </Button>
        
        {(filters.search || filters.valor_min || filters.valor_max || filters.data_inicio || filters.data_fim) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Filtros Avançados (Colapsável) */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtro por Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_min" className="text-sm flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Valor Mínimo
                </Label>
                <Input
                  id="valor_min"
                  type="number"
                  placeholder="0,00"
                  value={filters.valor_min || ''}
                  onChange={(e) => handleValueFilter('valor_min', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="valor_max" className="text-sm flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Valor Máximo
                </Label>
                <Input
                  id="valor_max"
                  type="number"
                  placeholder="0,00"
                  value={filters.valor_max || ''}
                  onChange={(e) => handleValueFilter('valor_max', e.target.value)}
                />
              </div>
            </div>

            {/* Filtro por Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio" className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data Início (a partir de)
                </Label>
                <DatePicker
                  value={dataInicio}
                  onChange={(date) => {
                    setDataInicio(date);
                    handleDateFilter('data_inicio', date ? format(date, 'yyyy-MM-dd') : '');
                  }}
                  placeholder="Selecione a data de início"
                />
              </div>
              <div>
                <Label htmlFor="data_fim" className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data Fim (até)
                </Label>
                <DatePicker
                  value={dataFim}
                  onChange={(date) => {
                    setDataFim(date);
                    handleDateFilter('data_fim', date ? format(date, 'yyyy-MM-dd') : '');
                  }}
                  placeholder="Selecione a data de fim"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};