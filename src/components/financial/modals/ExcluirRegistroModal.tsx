import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, AlertTriangle, Archive, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

// Tipo simplificado para o modal de exclusão
interface AlunoSimples {
  id: string;
  nome: string;
}

interface ExcluirRegistroModalProps {
  aluno: AlunoSimples | null;
  registroId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcluirRegistroModal: React.FC<ExcluirRegistroModalProps> = ({ 
  aluno, 
  registroId, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [entendeuConsequencias, setEntendeuConsequencias] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const excluirRegistroFinanceiro = async (registroId: string, alunoNome: string) => {
    try {
      setLoading(true);
      
      // 1. Verificar se existem parcelas pagas (importante para auditoria)
      const { data: parcelasPagas } = await supabase
        .from('parcelas_alunos')
        .select('*')
        .eq('registro_financeiro_id', registroId)
        .eq('status_pagamento', 'pago');
      
      if (parcelasPagas && parcelasPagas.length > 0) {
        toast({
          title: "Atenção!",
          description: `Este registro possui ${parcelasPagas.length} parcela(s) já paga(s). Considere mover para histórico em vez de excluir.`,
          variant: "destructive"
        });
        return;
      }
      
      // 2. Excluir o registro financeiro principal
      // As parcelas serão excluídas automaticamente devido ao ON DELETE CASCADE
      const { error } = await supabase
        .from('financeiro_alunos')
        .delete()
        .eq('id', registroId);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: `Registro financeiro de ${alunoNome} excluído permanentemente.`,
      });
      
      onSuccess();
      
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir registro financeiro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleExcluir = async () => {
    if (!aluno || !registroId) return;
    
    if (confirmText !== 'excluir' || !entendeuConsequencias) {
      toast({
        title: "Confirmação necessária",
        description: "Complete todos os campos de confirmação.",
        variant: "destructive"
      });
      return;
    }
    
    await excluirRegistroFinanceiro(registroId, aluno.nome);
    handleClose();
  };

  const handleClose = () => {
    setConfirmText('');
    setEntendeuConsequencias(false);
    setLoading(false);
    onClose();
  };

  if (!aluno || !registroId) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <div className="rounded-full p-2" style={{background: 'linear-gradient(to right, #D90429, #1F2937)'}}>
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <span>Excluir Registro Financeiro - {aluno.nome}</span>
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Aviso Principal */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl border border-red-200 shadow-lg text-white" style={{background: 'linear-gradient(to right, #D90429, #1F2937)'}}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-white mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-2">⚠️ ATENÇÃO: Exclusão Permanente</h4>
                  <p className="text-sm text-red-100 mb-3">
                    Esta ação irá <strong>excluir permanentemente</strong> o registro financeiro e todas as parcelas relacionadas. 
                    Os dados não poderão ser recuperados.
                  </p>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
                    <p className="text-sm text-white font-medium">
                      💡 <strong>Recomendação:</strong> Se o aluno ainda faz parte do curso ou pode retornar, 
                      use a função <strong>"Mover para Histórico"</strong> em vez de excluir.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
          
          {/* Cards Explicativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden"
            >
              <div className="bg-green-600 p-4">
                <div className="flex items-center space-x-2 text-white">
                  <Archive className="h-5 w-5" />
                  <h3 className="font-bold text-lg">Mover para Histórico</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-green-700 mb-3">
                  <Shield className="h-4 w-4" />
                  <span className="font-semibold">Preserva dados para auditoria</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aluno renovou contrato</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aluno concluiu curso</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aluno pode retornar</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dados importantes</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-red-200 shadow-lg overflow-hidden"
            >
              <div className="p-4" style={{background: 'linear-gradient(to right, #D90429, #B91C1C)'}}>
                <div className="flex items-center space-x-2 text-white">
                  <Trash2 className="h-5 w-5" />
                  <h3 className="font-bold text-lg">Excluir Permanentemente</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-red-700 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold">Remove dados definitivamente</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aluno nunca mais será usado</span>
                    <span style={{color: '#D90429'}}>⚠</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Limpeza definitiva</span>
                    <span className="text-red-600">⚠</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dados por engano</span>
                    <span className="text-red-600">⚠</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-bold">Não há parcelas pagas</span>
                    <span className="text-red-600">⚠</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Confirmações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl border border-red-200 shadow-lg space-y-4" style={{background: 'linear-gradient(to right, #FEF2F2, #F3F4F6)'}}
          >
            <div>
              <Label className="text-base font-medium text-red-700">
                Digite "excluir" para confirmar a exclusão permanente
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite: excluir"
                className="mt-2"
                disabled={loading}
              />
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="entendeu"
                checked={entendeuConsequencias}
                onCheckedChange={(checked) => setEntendeuConsequencias(!!checked)}
                disabled={loading}
              />
              <Label htmlFor="entendeu" className="text-sm" style={{color: '#6B7280'}}>
                Entendo que esta ação é <strong>irreversível</strong> e que os dados serão 
                <strong>perdidos permanentemente</strong>. Confirmo que não há parcelas pagas 
                e que o aluno nunca mais será utilizado no sistema.
              </Label>
            </div>
          </motion.div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExcluir}
              disabled={confirmText !== 'excluir' || !entendeuConsequencias || loading}
              className="" style={{backgroundColor: '#D90429'}} onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C1C'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#D90429'}
            >
              {loading ? (
                'Excluindo...'
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};