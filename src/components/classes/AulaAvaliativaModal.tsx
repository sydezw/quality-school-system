import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface AulaAvaliativaModalProps {
  aula: any;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal específico para aulas avaliativas
 * 
 * TODO: Implementar funcionalidades específicas para aulas avaliativas:
 * - Gestão de notas e avaliações
 * - Critérios de avaliação
 * - Feedback dos alunos
 * - Relatórios de desempenho
 */
const AulaAvaliativaModal: React.FC<AulaAvaliativaModalProps> = ({
  aula,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-700">
            Aula Avaliativa - {aula?.titulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Modal em Desenvolvimento
            </h3>
            <p className="text-sm text-gray-600">
              Este modal específico para aulas avaliativas ainda está sendo desenvolvido.
            </p>
            <p className="text-xs text-gray-500">
              Funcionalidades planejadas: gestão de notas, critérios de avaliação, feedback e relatórios.
            </p>
          </div>
          
          <Button 
            onClick={onClose}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { AulaAvaliativaModal };