import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface AulaProvaFinalModalProps {
  aula: any;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal específico para aulas de prova final
 * 
 * TODO: Implementar funcionalidades específicas para provas finais:
 * - Gestão de questões e gabaritos
 * - Controle de tempo de prova
 * - Correção automática/manual
 * - Geração de certificados
 * - Relatórios de aprovação
 */
const AulaProvaFinalModal: React.FC<AulaProvaFinalModalProps> = ({
  aula,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-blue-700">
            Prova Final - {aula?.titulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Modal em Desenvolvimento
            </h3>
            <p className="text-sm text-gray-600">
              Este modal específico para provas finais ainda está sendo desenvolvido.
            </p>
            <p className="text-xs text-gray-500">
              Funcionalidades planejadas: gestão de questões, controle de tempo, correção e certificados.
            </p>
          </div>
          
          <Button 
            onClick={onClose}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { AulaProvaFinalModal };