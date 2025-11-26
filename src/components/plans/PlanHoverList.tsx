import React, { useState } from 'react';

interface PlanoGenerico {
  id: string;
  nome: string;
  valor_total: number | null;
  valor_por_aula: number | null;
  numero_aulas: number;
  descricao?: string;
  carga_horaria_total?: number;
  frequencia_aulas?: string;
}

interface PlanHoverListProps {
  planos: PlanoGenerico[];
  onPlanSelect?: (plano: PlanoGenerico) => void;
}

const PlanHoverList: React.FC<PlanHoverListProps> = ({ planos, onPlanSelect }) => {
  const [hoveredPlano, setHoveredPlano] = useState<PlanoGenerico | null>(null);

  const handleMouseEnter = (plano: PlanoGenerico) => {
    setHoveredPlano(plano);
  };

  const handleMouseLeave = () => {
    setHoveredPlano(null);
  };

  const handlePlanClick = (plano: PlanoGenerico) => {
    if (onPlanSelect) {
      onPlanSelect(plano);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Lista de planos (coluna esquerda) */}
      <div className="space-y-2 w-1/3">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors"
            onMouseEnter={() => handleMouseEnter(plano)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handlePlanClick(plano)}
          >
            <div className="font-medium text-sm">{plano.nome}</div>
            <div className="text-xs text-gray-600">
              R$ {(plano.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Painel de detalhes (coluna direita) */}
      <div className="w-2/3 min-h-[200px]">
        {hoveredPlano ? (
          <div className="bg-red-500 text-white border border-red-700 rounded shadow-lg p-4">
            <h3 className="text-lg font-bold mb-3">{hoveredPlano.nome}</h3>
            
            <div className="space-y-2">
              <div>
                <span className="font-medium">Valor Total:</span>
                <p className="text-sm">R$ {(hoveredPlano.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              
              <div>
                <span className="font-medium">Por Aula:</span>
                <p className="text-sm">R$ {(hoveredPlano.valor_por_aula || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              
              <div>
                <span className="font-medium">Número de Aulas:</span>
                <p className="text-sm">{hoveredPlano.numero_aulas}</p>
              </div>
              
              {hoveredPlano.carga_horaria_total && (
                <div>
                  <span className="font-medium">Carga Horária:</span>
                  <p className="text-sm">{hoveredPlano.carga_horaria_total}h</p>
                </div>
              )}
              
              {hoveredPlano.frequencia_aulas && (
                <div>
                  <span className="font-medium">Frequência:</span>
                  <p className="text-sm">{hoveredPlano.frequencia_aulas}</p>
                </div>
              )}
              
              {hoveredPlano.descricao && (
                <div>
                  <span className="font-medium">Descrição:</span>
                  <p className="text-sm">{hoveredPlano.descricao}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded shadow p-4 min-h-[200px] flex items-center justify-center">
            <p className="text-gray-500 italic">Passe sobre um plano para ver detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanHoverList;