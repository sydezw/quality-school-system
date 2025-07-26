import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ParcelaHistorico } from '../types/historico';

interface EditarParcelaHistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcela: ParcelaHistorico | null;
  onSuccess: () => void;
}

export const EditarParcelaHistoricoModal: React.FC<EditarParcelaHistoricoModalProps> = ({
  isOpen,
  onClose,
  parcela,
  onSuccess
}) => {
  const [editandoParcela, setEditandoParcela] = useState<ParcelaHistorico | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sincronizar com a parcela recebida
  useEffect(() => {
    if (parcela) {
      setEditandoParcela({ ...parcela });
    }
  }, [parcela]);

  // Função para salvar edição
  const salvarEdicao = useCallback(async () => {
    if (!editandoParcela) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('historico_parcelas')
        .update({
          tipo_item: editandoParcela.tipo_item,
          numero_parcela: editandoParcela.numero_parcela,
          valor: editandoParcela.valor,
          data_vencimento: editandoParcela.data_vencimento,
          status_pagamento: editandoParcela.status_pagamento,
          descricao_item: editandoParcela.descricao_item || null,
          observacoes: editandoParcela.observacoes || null
        })
        .eq('id', editandoParcela.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parcela do histórico atualizada com sucesso!"
      });

      onClose();
      onSuccess();
      
    } catch (error) {
      console.error('Erro ao atualizar parcela do histórico:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar parcela do histórico",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [editandoParcela, toast, onClose, onSuccess]);

  if (!editandoParcela) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" style={{color: '#2563EB'}} />
            <span>Editar Parcela do Histórico</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-hist-tipo" className="text-sm font-medium" style={{color: '#6B7280'}}>Tipo de Item</Label>
              <Select 
                value={editandoParcela.tipo_item} 
                onValueChange={(value: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros') => 
                  setEditandoParcela(prev => prev ? {...prev, tipo_item: value} : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plano">Plano</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="matrícula">Matrícula</SelectItem>
                  <SelectItem value="cancelamento">Cancelamento</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-hist-numero" className="text-sm font-medium" style={{color: '#6B7280'}}>Número da Parcela</Label>
              <Input
                id="edit-hist-numero"
                type="number"
                value={editandoParcela.numero_parcela}
                onChange={(e) => setEditandoParcela(prev => 
                  prev ? {...prev, numero_parcela: parseInt(e.target.value) || 0} : null
                )}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-hist-valor" className="text-sm font-medium" style={{color: '#6B7280'}}>Valor</Label>
              <Input
                id="edit-hist-valor"
                type="number"
                step="0.01"
                value={editandoParcela.valor}
                onChange={(e) => setEditandoParcela(prev => 
                  prev ? {...prev, valor: parseFloat(e.target.value) || 0} : null
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-hist-vencimento" className="text-sm font-medium" style={{color: '#6B7280'}}>Data de Vencimento</Label>
              <Input
                id="edit-hist-vencimento"
                type="date"
                value={editandoParcela.data_vencimento}
                onChange={(e) => setEditandoParcela(prev => 
                  prev ? {...prev, data_vencimento: e.target.value} : null
                )}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="edit-hist-descricao" className="text-sm font-medium" style={{color: '#6B7280'}}>Descrição do Item</Label>
            <Input
              id="edit-hist-descricao"
              value={editandoParcela.descricao_item || ''}
              onChange={(e) => setEditandoParcela(prev => 
                prev ? {...prev, descricao_item: e.target.value} : null
              )}
              placeholder="Descrição do item..."
            />
          </div>
          
          <div>
            <Label htmlFor="edit-hist-status" className="text-sm font-medium" style={{color: '#6B7280'}}>Status</Label>
            <Select 
              value={editandoParcela.status_pagamento || ''} 
              onValueChange={(value: 'pago' | 'pendente' | 'vencido' | 'cancelado') => 
                setEditandoParcela(prev => prev ? {...prev, status_pagamento: value} : null)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="edit-hist-obs" className="text-sm font-medium" style={{color: '#6B7280'}}>Observações</Label>
            <Input
              id="edit-hist-obs"
              value={editandoParcela.observacoes || ''}
              onChange={(e) => setEditandoParcela(prev => 
                prev ? {...prev, observacoes: e.target.value} : null
              )}
              placeholder="Observações sobre a parcela..."
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={salvarEdicao} disabled={loading} className="" style={{background: 'linear-gradient(to right, #D90429, #1F2937)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #B91C1C, #111827)'} onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #D90429, #1F2937)'}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};