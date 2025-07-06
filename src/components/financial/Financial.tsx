import { useState } from 'react';
import FinancialRecordsTable from './FinancialRecordsTable';
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
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === 'records'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Registros Financeiros
          </button>
          <button
            onClick={() => setCurrentView('grouping')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === 'grouping'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Agrupamento por Aluno
          </button>
        </nav>
      </div>
      
      {/* Content */}
      {currentView === 'records' ? (
        <FinancialRecordsTable />
      ) : (
        <StudentGroupingView />
      )}
    </div>
  );
};

export default Financial;