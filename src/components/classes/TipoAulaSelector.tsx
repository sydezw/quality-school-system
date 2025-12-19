import React from 'react';
import { Button } from '@/components/ui/button';

type TipoAula = 'normal' | 'avaliativa' | 'prova_final';

interface TipoAulaSelectorProps {
  value: TipoAula;
  onChange: (value: TipoAula) => void;
}

export const TipoAulaSelector: React.FC<TipoAulaSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={value === 'normal' ? 'default' : 'outline'}
        size="sm"
        className="h-8 px-3 text-xs"
        aria-pressed={value === 'normal'}
        onClick={() => onChange('normal')}
      >
        Normal
      </Button>
      <Button
        type="button"
        variant={value === 'avaliativa' ? 'default' : 'outline'}
        size="sm"
        className={`h-8 px-3 text-xs ${value === 'avaliativa' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
        aria-pressed={value === 'avaliativa'}
        onClick={() => onChange('avaliativa')}
      >
        Avaliativa
      </Button>
      <Button
        type="button"
        variant={value === 'prova_final' ? 'default' : 'outline'}
        size="sm"
        className={`h-8 px-3 text-xs ${value === 'prova_final' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
        aria-pressed={value === 'prova_final'}
        onClick={() => onChange('prova_final')}
      >
        Prova Final
      </Button>
    </div>
  );
};
