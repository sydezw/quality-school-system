import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RelatedRecords {
  financialRecords: number;
  contracts: number;
  boletos: number;
  presences: number;
}

interface AdvancedStudentDeleteDialogProps {
  student: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteOptions?: any) => void;
  isLoading?: boolean;
}

const AdvancedStudentDeleteDialog: React.FC<AdvancedStudentDeleteDialogProps> = ({
  student,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [deleteOptions, setDeleteOptions] = useState({
    deleteFinancialRecords: false,
    deleteContracts: false,
    deleteBoletos: false,
    deletePresences: false,
  });
  const [relatedRecords, setRelatedRecords] = useState<RelatedRecords>({
    financialRecords: 0,
    contracts: 0,
    boletos: 0,
    presences: 0,
  });
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      fetchRelatedRecords();
      setConfirmText('');
      setDeleteType('soft');
      setDeleteOptions({
        deleteFinancialRecords: false,
        deleteContracts: false,
        deleteBoletos: false,
        deletePresences: false,
      });
    }
  }, [isOpen, student]);

  const fetchRelatedRecords = async () => {
    if (!student?.id) return;
    
    setLoadingRelated(true);
    try {
      // Buscar registros financeiros
      const { count: financialCount } = await supabase
        .from('financeiro_alunos')
        .select('*', { count: 'exact', head: true })
        .eq('aluno_id', student.id);
      
      // Buscar contratos
      const { count: contractsCount } = await supabase
        .from('contratos')
        .select('*', { count: 'exact', head: true })
        .eq('aluno_id', student.id);
      
      // Buscar boletos
      const { count: boletosCount } = await supabase
        .from('boletos')
        .select('*', { count: 'exact', head: true })
        .eq('aluno_id', student.id);
      
      // Buscar presenças
      const { count: presencesCount } = await supabase
        .from('presencas')
        .select('*', { count: 'exact', head: true })
        .eq('aluno_id', student.id);
      
      setRelatedRecords({
        financialRecords: financialCount || 0,
        contracts: contractsCount || 0,
        boletos: boletosCount || 0,
        presences: presencesCount || 0,
      });
    } catch (error) {
      console.error('Erro ao buscar registros relacionados:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      deleteType,
      ...deleteOptions
    });
  };

  const isConfirmValid = () => {
    if (deleteType === 'soft') {
      return confirmText === 'INATIVAR';
    } else {
      return confirmText === 'EXCLUIR PERMANENTEMENTE';
    }
  };

  const hasRelatedRecords = Object.values(relatedRecords).some(count => count > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Exclusão de Aluno
          </DialogTitle>
          <DialogDescription>
            Escolha como deseja proceder com a exclusão de <strong>{student?.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações sobre registros relacionados */}
          {loadingRelated ? (
            <div>Carregando registros relacionados...</div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Registros relacionados encontrados:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Registros financeiros: {relatedRecords.financialRecords}</li>
                  <li>• Contratos: {relatedRecords.contracts}</li>
                  <li>• Boletos: {relatedRecords.boletos}</li>
                  <li>• Presenças: {relatedRecords.presences}</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Opções de exclusão */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="soft-delete"
                name="deleteType"
                checked={deleteType === 'soft'}
                onChange={() => setDeleteType('soft')}
              />
              <Label htmlFor="soft-delete" className="font-medium">
                Arquivar Aluno (Soft Delete)
              </Label>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              O aluno será marcado como inativo (status: Inativo), mas você pode escolher quais registros relacionados excluir permanentemente.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="hard-delete"
                name="deleteType"
                checked={deleteType === 'hard'}
                onChange={() => setDeleteType('hard')}
              />
              <Label htmlFor="hard-delete" className="font-medium text-red-600">
                Exclusão Permanente Completa (Hard Delete)
              </Label>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              ⚠️ Esta ação é irreversível! O aluno e TODOS os registros relacionados serão excluídos permanentemente do banco de dados.
            </p>

            {/* Opções de exclusão de registros relacionados */}
            {hasRelatedRecords && (
              <div className={`ml-6 space-y-3 p-4 border rounded-lg ${
                deleteType === 'soft' ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                {deleteType === 'soft' ? (
                  <p className="text-sm font-medium text-yellow-800">
                    Selecione os registros relacionados que devem ser excluídos permanentemente:
                  </p>
                ) : (
                  <p className="text-sm font-medium text-red-800">
                    Todos os registros abaixo serão excluídos permanentemente junto com o aluno:
                  </p>
                )}
                
                <div className="space-y-2">
                  {relatedRecords.financialRecords > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delete-financial"
                        checked={deleteType === 'hard' || deleteOptions.deleteFinancialRecords}
                        disabled={deleteType === 'hard'}
                        onCheckedChange={(checked) => 
                          setDeleteOptions(prev => ({ ...prev, deleteFinancialRecords: !!checked }))
                        }
                      />
                      <Label htmlFor="delete-financial" className="text-sm">
                        Registros Financeiros ({relatedRecords.financialRecords})
                      </Label>
                    </div>
                  )}
                  
                  {relatedRecords.contracts > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delete-contracts"
                        checked={deleteType === 'hard' || deleteOptions.deleteContracts}
                        disabled={deleteType === 'hard'}
                        onCheckedChange={(checked) => 
                          setDeleteOptions(prev => ({ ...prev, deleteContracts: !!checked }))
                        }
                      />
                      <Label htmlFor="delete-contracts" className="text-sm">
                        Contratos ({relatedRecords.contracts})
                      </Label>
                    </div>
                  )}
                  
                  {relatedRecords.boletos > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delete-boletos"
                        checked={deleteType === 'hard' || deleteOptions.deleteBoletos}
                        disabled={deleteType === 'hard'}
                        onCheckedChange={(checked) => 
                          setDeleteOptions(prev => ({ ...prev, deleteBoletos: !!checked }))
                        }
                      />
                      <Label htmlFor="delete-boletos" className="text-sm">
                        Boletos ({relatedRecords.boletos})
                      </Label>
                    </div>
                  )}
                  
                  {relatedRecords.presences > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delete-presences"
                        checked={deleteType === 'hard' || deleteOptions.deletePresences}
                        disabled={deleteType === 'hard'}
                        onCheckedChange={(checked) => 
                          setDeleteOptions(prev => ({ ...prev, deletePresences: !!checked }))
                        }
                      />
                      <Label htmlFor="delete-presences" className="text-sm">
                        Presenças ({relatedRecords.presences})
                      </Label>
                    </div>
                  )}
                </div>
                
                {deleteType === 'hard' && (
                  <p className="text-xs text-red-600 mt-2">
                    No modo Hard Delete, todos os registros são automaticamente selecionados para exclusão.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Campo de confirmação */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Para confirmar, digite{' '}
              <code className="bg-gray-100 px-1 rounded">
                {deleteType === 'soft' ? 'INATIVAR' : 'EXCLUIR PERMANENTEMENTE'}
              </code>
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteType === 'soft' ? 'INATIVAR' : 'EXCLUIR PERMANENTEMENTE'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant={deleteType === 'soft' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={!isConfirmValid() || isLoading}
          >
            {isLoading ? 'Processando...' : (deleteType === 'soft' ? 'Inativar' : 'Excluir Permanentemente')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedStudentDeleteDialog;