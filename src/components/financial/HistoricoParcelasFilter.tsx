import React from 'react';
import { toast } from 'sonner';
import { History, AlertTriangle } from 'lucide-react';

interface HistoricoParcelasFilterProps {
  onHistoricoToggle: (showHistorico: boolean) => void;
  showHistorico: boolean;
}

const HistoricoParcelasFilter: React.FC<HistoricoParcelasFilterProps> = ({
  onHistoricoToggle,
  showHistorico
}) => {

  const handleToggle = (checked: boolean) => {
    onHistoricoToggle(checked);
    if (checked) {
      toast.info('Exibindo parcelas históricas');
    } else {
      toast.info('Ocultando parcelas históricas');
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-slate-600" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Histórico</h3>
            <p className="text-xs text-gray-500">Visualizar parcelas arquivadas do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700" htmlFor="historico-toggle">
            Ativo
          </label>
          <button 
            type="button" 
            role="switch" 
            aria-checked={showHistorico ? "true" : "false"}
            data-state={showHistorico ? "checked" : "unchecked"}
            onClick={() => handleToggle(!showHistorico)}
            className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-slate-600" 
            id="historico-toggle"
          >
            <span 
              data-state={showHistorico ? "checked" : "unchecked"}
              className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 data-[state=checked]:shadow-xl data-[state=unchecked]:shadow-md"
            ></span>
          </button>
        </div>
      </div>

      
      {/* Indicador quando modo histórico está ativo */}
      {showHistorico && (
        <div 
          className="mt-3 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
        >
          <AlertTriangle className="h-4 w-4 text-slate-600" />
          <span className="text-sm text-slate-700 font-medium">
            Modo histórico ativo - Quando ativado, o sistema mostra apenas as parcelas arquivadas
          </span>
        </div>
      )}
    </div>
  );
};

export default HistoricoParcelasFilter;