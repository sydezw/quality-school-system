import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, AlertTriangle, CheckCircle, Clock, XCircle, CreditCard, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MoverParaHistoricoForm, EstatisticasParcelas, ParcelaAluno } from '../types/historico';

interface MoverParaHistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: { id: string; nome: string; parcelas: ParcelaAluno[] } | null;
  onSuccess: () => void;
}

export const MoverParaHistoricoModal: React.FC<MoverParaHistoricoModalProps> = ({
  isOpen,
  onClose,
  aluno,
  onSuccess
}) => {
  const [form, setForm] = useState<MoverParaHistoricoForm>({
    tipo_arquivamento: 'renovacao',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Função para formatar moeda
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  // Função para ícones de status
  const getStatusIcon = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  }, []);

  // Função para obter cor do status
  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Função para ícones de tipo
  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'plano':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'material':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'matrícula':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  // Calcular estatísticas das parcelas
  const estatisticas = useMemo((): EstatisticasParcelas => {
    if (!aluno?.parcelas) {
      return {
        total: 0,
        pagas: 0,
        pendentes: 0,
        vencidas: 0,
        canceladas: 0,
        valorTotal: 0,
        valorPago: 0,
        valorPendente: 0
      };
    }

    const parcelas = aluno.parcelas;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const stats = {
      total: parcelas.length,
      pagas: parcelas.filter(p => p.status_pagamento === 'pago').length,
      pendentes: parcelas.filter(p => {
        const vencimento = new Date(p.data_vencimento);
        vencimento.setHours(0, 0, 0, 0);
        return p.status_pagamento === 'pendente' && vencimento >= hoje;
      }).length,
      vencidas: parcelas.filter(p => {
        const vencimento = new Date(p.data_vencimento);
        vencimento.setHours(0, 0, 0, 0);
        return p.status_pagamento === 'pendente' && vencimento < hoje;
      }).length,
      canceladas: parcelas.filter(p => p.status_pagamento === 'cancelado').length,
      valorTotal: parcelas.reduce((acc, p) => acc + p.valor, 0),
      valorPago: parcelas.filter(p => p.status_pagamento === 'pago').reduce((acc, p) => acc + p.valor, 0),
      valorPendente: parcelas.filter(p => p.status_pagamento !== 'pago').reduce((acc, p) => acc + p.valor, 0)
    };

    return stats;
  }, [aluno?.parcelas]);

  // Função para processar o movimento para histórico
  const handleMoverParaHistorico = useCallback(async () => {
    if (!aluno) return;
    
    setLoading(true);
    
    try {
      // TODO: Implementar a lógica de backend
      console.log('Movendo para histórico:', {
        aluno: aluno,
        form: form
      });
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sucesso!",
        description: `Parcelas de ${aluno.nome} movidas para o histórico com sucesso.`,
      });
      
      onClose();
      onSuccess();
      
    } catch (error) {
      console.error('Erro ao mover para histórico:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover parcelas para o histórico. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [aluno, form, toast, onClose, onSuccess]);

  // Reset form when modal closes
  const handleClose = useCallback(() => {
    setForm({
      tipo_arquivamento: 'renovacao',
      observacoes: ''
    });
    onClose();
  }, [onClose]);

  if (!aluno) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Archive className="h-5 w-5 text-orange-600" />
            <span>Mover Parcelas para Histórico - {aluno.nome}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Estatísticas das Parcelas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Archive className="h-5 w-5 text-blue-600" />
                <span>Resumo das Parcelas</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.total}</p>
                  <p className="text-sm text-gray-600">Total de Parcelas</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{estatisticas.pagas}</p>
                  <p className="text-sm text-gray-600">Pagas</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{estatisticas.vencidas}</p>
                  <p className="text-sm text-gray-600">Vencidas</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-700">{formatCurrency(estatisticas.valorTotal)}</p>
                  <p className="text-sm text-gray-600">Valor Total</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{formatCurrency(estatisticas.valorPago)}</p>
                  <p className="text-sm text-gray-600">Valor Pago</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(estatisticas.valorPendente)}</p>
                  <p className="text-sm text-gray-600">Valor Pendente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Alertas */}
          {(estatisticas.pendentes > 0 || estatisticas.vencidas > 0) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800">Atenção!</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Este aluno possui {estatisticas.pendentes + estatisticas.vencidas} parcela(s) não paga(s). 
                      Recomendamos mover para o histórico apenas quando todas as parcelas estiverem pagas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Formulário */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipo-arquivamento" className="text-base font-medium">
                    Tipo de Arquivamento *
                  </Label>
                  <Select 
                    value={form.tipo_arquivamento} 
                    onValueChange={(value: 'renovacao' | 'cancelamento' | 'conclusao') => 
                      setForm(prev => ({...prev, tipo_arquivamento: value}))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renovacao">Renovação - Aluno renovou o contrato</SelectItem>
                      <SelectItem value="cancelamento">Cancelamento - Aluno cancelou o contrato</SelectItem>
                      <SelectItem value="conclusao">Conclusão - Aluno concluiu o curso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="observacoes" className="text-base font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={form.observacoes}
                    onChange={(e) => setForm(prev => ({...prev, observacoes: e.target.value}))}
                    placeholder="Adicione observações sobre o arquivamento (opcional)..."
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Avisos Importantes */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Avisos Importantes</span>
              </h4>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>O registro financeiro do aluno será zerado após o arquivamento</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Esta operação não pode ser revertida automaticamente</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>O status do aluno será alterado para "Inativo"</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Recomendamos mover apenas parcelas pagas para evitar problemas futuros</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleMoverParaHistorico} 
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900"
          >
            {loading ? 'Processando...' : 'Mover para Histórico'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};