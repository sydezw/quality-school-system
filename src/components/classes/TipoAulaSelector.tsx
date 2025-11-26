import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TipoAulaSelectorProps {
  value: 'normal' | 'avaliativa' | 'prova_final';
  onChange: (value: 'normal' | 'avaliativa' | 'prova_final') => void;
}

export function TipoAulaSelector({ value, onChange }: TipoAulaSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={value === 'normal' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('normal')}
        className={cn(
          "transition-all duration-200",
          value === 'normal' 
            ? "bg-blue-500 text-white" 
            : "hover:bg-blue-50"
        )}
      >
        Normal
      </Button>
      <Button
        type="button"
        variant={value === 'avaliativa' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('avaliativa')}
        className={cn(
          "transition-all duration-200",
          value === 'avaliativa' 
            ? "bg-orange-500 text-white" 
            : "hover:bg-orange-50"
        )}
      >
        Avaliativa
      </Button>
      <Button
        type="button"
        variant={value === 'prova_final' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('prova_final')}
        className={cn(
          "transition-all duration-200",
          value === 'prova_final' 
            ? "bg-red-500 text-white" 
            : "hover:bg-red-50"
        )}
      >
        Prova Final
      </Button>
    </div>
  );
}