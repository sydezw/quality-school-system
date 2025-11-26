import { useState } from 'react';
import ClassesDashboard from './ClassesDashboard';
import ClassesCalendar from './ClassesCalendar';
import ClassesList from './ClassesList';
import ClassesStats from './ClassesStats';

/**
 * Componente principal da aba Aulas
 * 
 * Estrutura otimizada para IA:
 * - Padrão de navegação por abas consistente com Financial.tsx
 * - Estados bem definidos e tipados
 * - Componentes modulares e reutilizáveis
 * - Nomenclatura clara e descritiva
 */
const Classes = () => {
  // Estado para controlar a visualização atual
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'list' | 'stats'>('dashboard');
  
  return (
    <div className="space-y-6">
      {/* Navigation tabs - Padrão consistente com outras abas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'dashboard'
                ? 'text-red-600 border-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'calendar'
                ? 'text-red-600 border-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendário
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'list'
                ? 'text-red-600 border-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            }`}
          >
            Lista de Aulas
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'stats'
                ? 'text-red-600 border-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            }`}
          >
            Estatísticas
          </button>
        </nav>
      </div>

      {/* Content - Renderização condicional baseada na visualização atual */}
      <div className="mt-6">
        {currentView === 'dashboard' && <ClassesDashboard />}
        {currentView === 'calendar' && <ClassesCalendar />}
        {currentView === 'list' && <ClassesList />}
        {currentView === 'stats' && <ClassesStats />}
      </div>
    </div>
  );
};

export default Classes;