import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, AlertTriangle, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CycleManagerProps {
  alunoId: string;
  isMigrationMode: boolean;
  setIsMigrationMode: (value: boolean) => void;
  onCycleCreated?: () => void;
  trigger: React.ReactNode;
  showHistorico?: boolean;
}

interface ExistingCycle {
  inicio_ciclo: string;
  final_ciclo: string;
  count: number;
}

export const CycleManager: React.FC<CycleManagerProps> = ({ alunoId, isMigrationMode, setIsMigrationMode, onCycleCreated, trigger, showHistorico = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingCycle, setExistingCycle] = useState<ExistingCycle | null>(null);
  const [showMoveToHistory, setShowMoveToHistory] = useState(false);
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [formData, setFormData] = useState({
    inicio_ciclo: '',
    final_ciclo: ''
  });
  const [allParcelas, setAllParcelas] = useState<any[]>([]);
  const [selectedParcelas, setSelectedParcelas] = useState<Set<number>>(new Set());

  // Buscar todas as parcelas do aluno (excluindo parcelas avulsas)
  const fetchAllParcelas = async () => {
    try {
      console.log('Buscando parcelas para alunoId:', alunoId, 'showHistorico:', showHistorico);
      
      // Para alunos sem ciclos, buscar parcelas que não estão em ciclo (inicio_ciclo e final_ciclo são null)
      // e que não estão no histórico
      let query = supabase
        .from('alunos_parcelas')
        .select(`
          id,
          numero_parcela,
          valor,
          data_vencimento,
          tipo_item,
          historico,
          inicio_ciclo,
          final_ciclo,
          nome_aluno
        `)
        .eq('alunos_financeiro_id', alunoId)
        .neq('tipo_item', 'avulso'); // Excluir parcelas avulsas

      // Se não estamos no modo histórico, buscar apenas parcelas que não estão no histórico
      // e que não fazem parte de nenhum ciclo ainda
      if (!showHistorico) {
        query = query
          .eq('historico', false)
          .is('inicio_ciclo', null)
          .is('final_ciclo', null);
      } else {
        query = query.eq('historico', true);
      }

      const { data: parcelas, error } = await query.order('numero_parcela', { ascending: true });

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }

      console.log('Parcelas encontradas:', parcelas?.length || 0, parcelas);
      setAllParcelas(parcelas || []);
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar parcelas do aluno',
        variant: 'destructive'
      });
    }
  };

  // Verificar se já existe um ciclo ativo para o aluno
  const checkExistingCycle = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos_parcelas')
        .select('inicio_ciclo, final_ciclo')
        .eq('alunos_financeiro_id', alunoId)
        .eq('historico', showHistorico)
        .not('inicio_ciclo', 'is', null)
        .not('final_ciclo', 'is', null)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        // Contar quantas parcelas existem neste ciclo
        const { count, error: countError } = await supabase
          .from('alunos_parcelas')
          .select('*', { count: 'exact', head: true })
          .eq('alunos_financeiro_id', alunoId)
          .eq('historico', showHistorico)
          .eq('inicio_ciclo', data[0].inicio_ciclo)
          .eq('final_ciclo', data[0].final_ciclo);

        if (countError) throw countError;

        setExistingCycle({
          inicio_ciclo: data[0].inicio_ciclo,
          final_ciclo: data[0].final_ciclo,
          count: count || 0
        });
        setShowMoveToHistory(true);
      } else {
        setExistingCycle(null);
        setShowMoveToHistory(false);
      }
    } catch (error) {
      console.error('Erro ao verificar ciclo existente:', error);
    }
  };

  // Iniciar edição do ciclo existente
  const startEditingCycle = () => {
    if (!existingCycle) return;
    
    setFormData({
      inicio_ciclo: existingCycle.inicio_ciclo,
      final_ciclo: existingCycle.final_ciclo
    });
    setIsEditingCycle(true);
    setShowMoveToHistory(false);
  };

  // Salvar alterações do ciclo editado
  const saveEditedCycle = async () => {
    if (!existingCycle || !formData.inicio_ciclo || !formData.final_ciclo) return;

    if (new Date(formData.inicio_ciclo) >= new Date(formData.final_ciclo)) {
      toast({
        title: 'Erro',
        description: 'A data de início deve ser anterior à data de fim',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('alunos_parcelas')
        .update({
          inicio_ciclo: formData.inicio_ciclo,
          final_ciclo: formData.final_ciclo
        })
        .eq('alunos_financeiro_id', alunoId)
        .eq('inicio_ciclo', existingCycle.inicio_ciclo)
        .eq('final_ciclo', existingCycle.final_ciclo)
        .eq('historico', false);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ciclo atualizado com sucesso',
        variant: 'default'
      });

      // Atualizar o estado do ciclo existente
      setExistingCycle({
        ...existingCycle,
        inicio_ciclo: formData.inicio_ciclo,
        final_ciclo: formData.final_ciclo
      });
      
      setIsEditingCycle(false);
      if (onCycleCreated) onCycleCreated();
    } catch (error) {
      console.error('Erro ao atualizar ciclo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar ciclo',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mover ciclo existente para histórico
  const moveToHistory = async () => {
    if (!existingCycle) return;

    // Desabilitar o toggle de migração quando o ciclo está sendo usado
    if (isMigrationMode) {
      setIsMigrationMode(false);
      toast({
        title: 'Aviso',
        description: 'Modo migração desabilitado automaticamente ao usar funcionalidade de ciclo',
        variant: 'default'
      });
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('alunos_parcelas')
        .update({ historico: true })
        .eq('alunos_financeiro_id', alunoId)
        .eq('inicio_ciclo', existingCycle.inicio_ciclo)
        .eq('final_ciclo', existingCycle.final_ciclo)
        .eq('historico', false);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `${existingCycle.count} parcelas movidas para histórico`,
        variant: 'default'
      });

      setExistingCycle(null);
      setShowMoveToHistory(false);
    } catch (error) {
      console.error('Erro ao mover para histórico:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao mover parcelas para histórico',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Criar novo ciclo
  const createCycle = async () => {
    if (!formData.inicio_ciclo || !formData.final_ciclo) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha as datas de início e fim do ciclo',
        variant: 'destructive'
      });
      return;
    }

    if (new Date(formData.inicio_ciclo) >= new Date(formData.final_ciclo)) {
      toast({
        title: 'Erro',
        description: 'A data de início deve ser anterior à data de fim',
        variant: 'destructive'
      });
      return;
    }

    // Desabilitar o toggle de migração quando o ciclo está sendo usado
    if (isMigrationMode) {
      setIsMigrationMode(false);
      toast({
        title: 'Aviso',
        description: 'Modo migração desabilitado automaticamente ao usar funcionalidade de ciclo',
        variant: 'default'
      });
    }

    if (selectedParcelas.size === 0) {
      toast({
        title: 'Aviso',
        description: 'Selecione pelo menos uma parcela para aplicar o ciclo',
        variant: 'default'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Atualizar apenas as parcelas selecionadas com as datas do ciclo
      const { error: updateError } = await supabase
        .from('alunos_parcelas')
        .update({
          inicio_ciclo: formData.inicio_ciclo,
          final_ciclo: formData.final_ciclo
        })
        .in('id', Array.from(selectedParcelas));

      if (updateError) throw updateError;

      toast({
        title: 'Sucesso',
        description: `Ciclo criado com sucesso para ${selectedParcelas.size} parcelas`,
        variant: 'default'
      });

      setFormData({ inicio_ciclo: '', final_ciclo: '' });
      setIsOpen(false);
      onCycleCreated?.();
    } catch (error) {
      console.error('Erro ao criar ciclo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar ciclo',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para gerenciar seleção de parcelas
  const toggleParcelaSelection = (parcelaId: number) => {
    const newSelection = new Set(selectedParcelas);
    if (newSelection.has(parcelaId)) {
      newSelection.delete(parcelaId);
    } else {
      newSelection.add(parcelaId);
    }
    setSelectedParcelas(newSelection);
  };

  const selectAllParcelas = () => {
    const allIds = new Set(allParcelas.map(p => p.id));
    setSelectedParcelas(allIds);
  };

  const deselectAllParcelas = () => {
    setSelectedParcelas(new Set());
  };

  useEffect(() => {
    if (isOpen) {
      checkExistingCycle();
      fetchAllParcelas();
    }
  }, [isOpen, alunoId, showHistorico]);

  useEffect(() => {
    // Limpar seleção quando as parcelas mudarem
    setSelectedParcelas(new Set());
  }, [allParcelas]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Gerenciar Ciclo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gerenciar Ciclo de Parcelas
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Interface para modo histórico */}
          {showHistorico ? (
            <div className="space-y-4">
              {existingCycle ? (
                <div className="space-y-4">
                  {/* Informações do Ciclo Histórico */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-orange-800">Ciclo Histórico</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-orange-700">Data de Início:</p>
                        <p className="text-orange-800">{formatDate(existingCycle.inicio_ciclo)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-orange-700">Data de Término:</p>
                        <p className="text-orange-800">{formatDate(existingCycle.final_ciclo)}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="font-medium text-orange-700">Total de Parcelas:</p>
                      <p className="text-orange-800">{existingCycle.count} parcelas arquivadas</p>
                    </div>
                  </div>

                  {/* Lista de Parcelas do Ciclo */}
                  {allParcelas.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="text-md font-medium mb-3 text-gray-800">Parcelas do Ciclo</h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {allParcelas.map((parcela) => (
                          <div key={parcela.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  Parcela {parcela.numero_parcela}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {parcela.tipo_item}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {parcela.nome_aluno || 'Nome não encontrado'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                R$ {parcela.valor?.toFixed(2) || '0,00'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {parcela.data_vencimento ? formatDate(parcela.data_vencimento) : 'Sem vencimento'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum ciclo histórico encontrado para este aluno.</p>
                </div>
              )}
            </div>
          ) : (
            /* Interface normal para modo ativo */
            <div className="space-y-4">
              {/* Alerta para ciclo existente */}
              {showMoveToHistory && existingCycle && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <div className="space-y-2">
                      <p className="font-medium">Você deseja mover este ciclo existente para histórico?</p>
                      <div className="text-sm">
                        <p><strong>Período:</strong> {formatDate(existingCycle.inicio_ciclo)} até {formatDate(existingCycle.final_ciclo)}</p>
                        <p><strong>Parcelas:</strong> {existingCycle.count} parcelas serão movidas para histórico</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={startEditingCycle}
                          disabled={isLoading}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar Ciclo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={moveToHistory}
                          disabled={isLoading}
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          Sim, mover para histórico
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowMoveToHistory(false)}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Seletor de Parcelas */}
              {!showMoveToHistory && (
                <div className="space-y-4">
                  {allParcelas.length > 0 ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium">Selecionar Parcelas ({selectedParcelas.size}/{allParcelas.length})</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={selectAllParcelas}
                            disabled={isLoading}
                            className="h-9 rounded-md px-3"
                          >
                            Selecionar Todas
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={deselectAllParcelas}
                            disabled={isLoading}
                            className="h-9 rounded-md px-3"
                          >
                            Desmarcar Todas
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {allParcelas.map((parcela) => (
                          <div key={parcela.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`parcela-${parcela.id}`}
                              checked={selectedParcelas.has(parcela.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedParcelas);
                                if (e.target.checked) {
                                  newSelected.add(parcela.id);
                                } else {
                                  newSelected.delete(parcela.id);
                                }
                                setSelectedParcelas(newSelected);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={isLoading}
                            />
                            <label htmlFor={`parcela-${parcela.id}`} className="flex-1 text-sm cursor-pointer">
                              <div className="flex justify-between items-center">
                                 <span>
                                   Parcela {parcela.numero_parcela} ({parcela.tipo_item}) - {parcela.nome_aluno || 'Nome não encontrado'}
                                 </span>
                                 <span className="text-gray-500">
                                   R$ {parcela.valor?.toFixed(2) || '0,00'} - {parcela.data_vencimento ? formatDate(parcela.data_vencimento) : 'Sem vencimento'}
                                 </span>
                               </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <p className="font-medium">Nenhuma parcela encontrada</p>
                        <p className="text-sm mt-1">
                          Este aluno não possui parcelas criadas ainda. Para criar um ciclo, é necessário que o aluno tenha um plano financeiro com parcelas geradas.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Formulário de criação/edição de ciclo */}
              {(!showMoveToHistory || isEditingCycle) && (
                <div className="space-y-4">
                  {isEditingCycle && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Edit className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <p className="font-medium">Editando ciclo existente</p>
                        <p className="text-sm mt-1">Modifique as datas do ciclo abaixo e clique em "Salvar Alterações".</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inicio_ciclo">Data de Início</Label>
                      <Input
                        id="inicio_ciclo"
                        type="date"
                        value={formData.inicio_ciclo}
                        onChange={(e) => setFormData(prev => ({ ...prev, inicio_ciclo: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="final_ciclo">Data de Término</Label>
                      <Input
                        id="final_ciclo"
                        type="date"
                        value={formData.final_ciclo}
                        onChange={(e) => setFormData(prev => ({ ...prev, final_ciclo: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (isEditingCycle) {
                          setIsEditingCycle(false);
                          setShowMoveToHistory(true);
                          setFormData({ inicio_ciclo: '', final_ciclo: '' });
                        } else {
                          setIsOpen(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={isEditingCycle ? saveEditedCycle : createCycle}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (isEditingCycle ? 'Salvando...' : 'Criando...') : (isEditingCycle ? 'Salvar Alterações' : 'Criar Ciclo')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};