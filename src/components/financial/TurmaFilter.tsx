import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface Turma {
  id: string;
  nome: string;
  tipo_turma: 'Turma' | 'Turma particular';
}

interface TurmaFilterProps {
  onTurmaChange: (turmaId: string | null) => void;
  selectedTurma: string | null;
}

export const TurmaFilter: React.FC<TurmaFilterProps> = ({ onTurmaChange, selectedTurma }) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const { data, error } = await supabase
          .from('turmas')
          .select('id, nome, tipo_turma')
          .eq('tipo_turma', 'Turma') // Apenas turmas não particulares
          .order('nome');

        if (error) {
          console.error('Erro ao buscar turmas:', error);
          return;
        }

        setTurmas(data || []);
      } catch (error) {
        console.error('Erro ao buscar turmas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurmas();
  }, []);

  const handleValueChange = (value: string) => {
    if (value === 'desativado') {
      onTurmaChange(null);
    } else {
      onTurmaChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Filtrar por Turma
      </label>
      <Select
        value={selectedTurma || 'desativado'}
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Carregando..." : "Selecione uma turma"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desativado">Desativado</SelectItem>
          {turmas.map((turma) => (
            <SelectItem key={turma.id} value={turma.id}>
              {turma.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};