import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, X, Calendar, DollarSign, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ParcelaPreview {
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  descricao_item?: string;
  idioma_registro: 'Inglês' | 'Japonês';
}

interface PreviewProximaParcelaProps {
  parcelaPreview: ParcelaPreview;
  onCriar: () => void;
  onCancelar: () => void;
  loading?: boolean;
}

export const PreviewProximaParcela: React.FC<PreviewProximaParcelaProps> = ({
  parcelaPreview,
  onCriar,
  onCancelar,
  loading = false
}) => {
  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'plano': return '📚';
      case 'material': return '📖';
      case 'matrícula': return '🎓';
      case 'cancelamento': return '❌';
      default: return '📄';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'plano': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'material': return 'text-green-600 bg-green-50 border-green-200';
      case 'matrícula': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'cancelamento': return 'bg-red-50 border-red-200' + ' ' + 'text-red-600';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-4 p-4 bg-[#F9FAFB] border-2 border-dashed border-[#6B7280] rounded-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Plus className="h-4 w-4 text-blue-600" />
          </div>
          <h4 className="font-semibold text-blue-900">Criar próxima parcela?</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancelar}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Parcela:</span>
          <span className="font-semibold text-gray-900">#{parcelaPreview.numero_parcela}</span>
        </div>

        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Valor:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(parcelaPreview.valor)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Vencimento:</span>
          <span className="font-semibold text-gray-900">
            {format(new Date(parcelaPreview.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTipoIcon(parcelaPreview.tipo_item)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoColor(parcelaPreview.tipo_item)}`}>
            {parcelaPreview.tipo_item.charAt(0).toUpperCase() + parcelaPreview.tipo_item.slice(1)}
          </span>
          <span className="text-sm text-gray-600">•</span>
          <span className="text-sm font-medium" style={{color: '#6B7280'}}>{parcelaPreview.idioma_registro}</span>
        </div>
      </div>

      {parcelaPreview.descricao_item && (
        <div className="mb-4 p-2 bg-white rounded border">
          <span className="text-sm text-gray-600">Descrição: </span>
          <span className="text-sm text-gray-900">{parcelaPreview.descricao_item}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-700">
          Esta parcela será criada como <strong>pendente</strong> com base na parcela que você acabou de marcar como paga.
        </p>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelar}
            disabled={loading}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Não criar
          </Button>
          <Button
            size="sm"
            onClick={onCriar}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Criando...' : 'Criar Parcela'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};