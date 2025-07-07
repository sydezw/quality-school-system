import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

export interface StudentFilters {
  status?: string;
  idioma?: string;
  turma_id?: string;
}

interface StudentFiltersProps {
  filters: StudentFilters;
  onFilterChange: (filters: StudentFilters) => void;
}

interface FilterOption {
  value: string;
  label: string;
}

export const StudentFilters = ({ filters, onFilterChange }: StudentFiltersProps) => {
  const [statusOptions, setStatusOptions] = useState<FilterOption[]>([]);
  const [idiomaOptions, setIdiomaOptions] = useState<FilterOption[]>([]);
  const [turmaOptions, setTurmaOptions] = useState<FilterOption[]>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // Buscar status distintos
      const { data: statusData, error: statusError } = await supabase
        .from('alunos')
        .select('status')
        .not('status', 'is', null)
        .in('status', ['Ativo', 'Trancado']);

      if (statusError) throw statusError;

      const uniqueStatus = [...new Set(statusData.map(item => item.status))];
      setStatusOptions(uniqueStatus.map(status => ({ value: status, label: status })));

      // Buscar idiomas distintos
      const { data: idiomaData, error: idiomaError } = await supabase
        .from('alunos')
        .select('idioma')
        .not('idioma', 'is', null)
        .in('status', ['Ativo', 'Trancado']);

      if (idiomaError) throw idiomaError;

      const uniqueIdiomas = [...new Set(idiomaData.map(item => item.idioma))];
      setIdiomaOptions(uniqueIdiomas.map(idioma => ({ value: idioma, label: idioma })));

      // Buscar turmas com nomes
      const { data: turmaData, error: turmaError } = await supabase
        .from('turmas')
        .select('id, nome')
        .order('nome');

      if (turmaError) throw turmaError;

      setTurmaOptions(turmaData.map(turma => ({ value: turma.id, label: turma.nome })));

    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
    }
  };

  const handleStatusChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === 'todos') {
      delete newFilters.status;
    } else {
      newFilters.status = value;
    }
    onFilterChange(newFilters);
  };

  const handleIdiomaChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === 'todos') {
      delete newFilters.idioma;
    } else {
      newFilters.idioma = value;
    }
    onFilterChange(newFilters);
  };

  const handleTurmaChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === 'todos') {
      delete newFilters.turma_id;
    } else {
      newFilters.turma_id = value;
    }
    onFilterChange(newFilters);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Filtro por Status */}
      <Select value={filters.status || 'todos'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro por Idioma */}
      <Select value={filters.idioma || 'todos'} onValueChange={handleIdiomaChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Filtrar por idioma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os idiomas</SelectItem>
          {idiomaOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro por Turma */}
      <Select value={filters.turma_id || 'todos'} onValueChange={handleTurmaChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por turma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as turmas</SelectItem>
          {turmaOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};