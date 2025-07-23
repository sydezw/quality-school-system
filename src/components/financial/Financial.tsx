import { useState } from 'react';
import ParcelasTable from './ParcelasTable';
import StudentGroupingView from './StudentGroupingView';

const Financial = () => {
  const [currentView, setCurrentView] = useState<'records' | 'grouping'>('records');
  
  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setCurrentView('records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'records'
                ? 'text-red-600' + ' ' + 'border-red-500'
        : 'border-transparent hover:border-gray-300' + ' ' + 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registros (Parcelas)
          </button>
          <button
            onClick={() => setCurrentView('grouping')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              currentView === 'grouping'
                ? 'text-red-600' + ' ' + 'border-red-500'
        : 'border-transparent hover:border-gray-300' + ' ' + 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Agrupamento por Aluno
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {currentView === 'records' ? (
          <ParcelasTable />
        ) : (
          <StudentGroupingView />
        )}
      </div>
    </div>
  );
};

export default Financial;