// Utilitário para cores consistentes dos badges de idioma em todo o sistema

export const getIdiomaColor = (idioma: string): string => {
  switch (idioma) {
    case 'Inglês':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Japonês':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Inglês/Japonês':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'particular':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Cores para gráficos (hex values)
export const getIdiomaChartColor = (idioma: string): string => {
  switch (idioma) {
    case 'Inglês':
      return '#3B82F6'; // blue-500
    case 'Japonês':
      return '#EF4444'; // red-500
    case 'Inglês/Japonês':
      return '#F97316'; // orange-500
    case 'particular':
      return '#8B5CF6'; // purple-500
    default:
      return '#6B7280'; // gray-500
  }
};

// Mapeamento de idiomas para cores (para uso em componentes que precisam de arrays)
export const IDIOMA_COLORS = {
  'Inglês': '#3B82F6',
  'Japonês': '#EF4444',
  'Inglês/Japonês': '#F97316',
  'particular': '#8B5CF6'
} as const;

// Array de cores para gráficos que precisam de múltiplas cores
export const CHART_COLORS = [
  '#3B82F6', // Inglês - azul
  '#EF4444', // Japonês - vermelho
  '#F97316', // Inglês/Japonês - laranja
  '#8B5CF6', // particular - roxo
  '#6B7280'  // default - cinza
];