import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MultipleSelectionBarProps {
  isVisible: boolean;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
  onCancel: () => void;
  totalItems: number;
  itemName?: string; // "parcelas", "despesas", etc.
  deleteButtonText?: string;
  isAllSelected?: boolean;
}

export const MultipleSelectionBar: React.FC<MultipleSelectionBarProps> = ({
  isVisible,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onDelete,
  onCancel,
  totalItems,
  itemName = "itens",
  deleteButtonText = "Excluir Selecionados",
  isAllSelected = false
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[400px]"
        >
          <div className="flex items-center justify-between space-x-4">
            {/* Contador e informações */}
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                {selectedCount} de {totalItems} {itemName} selecionados
              </Badge>
              
              {/* Botão Selecionar/Desselecionar Todos */}
              <Button
                variant="outline"
                size="sm"
                onClick={isAllSelected ? onClearSelection : onSelectAll}
                className="flex items-center space-x-2 text-sm"
              >
                {isAllSelected ? (
                  <>
                    <Square className="h-4 w-4" />
                    <span>Desselecionar Todos</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    <span>Selecionar Todos</span>
                  </>
                )}
              </Button>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center space-x-2">
              {/* Botão Excluir */}
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={selectedCount === 0}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleteButtonText}</span>
              </Button>

              {/* Botão Cancelar */}
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};