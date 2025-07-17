import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, Users, CheckCircle, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import DatePicker from '@/components/shared/DatePicker';
import { format } from 'date-fns';

interface TornarAtivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: { id: string; nome: string; parcelas: any[] } | null;
  onSuccess: () => void;
}

interface PlanoGenerico {
  id: string;
  nome: string;
  valor_total: number | null;
  valor_por_aula: number | null;
  numero_aulas: number;
  descricao?: string;
  carga_horaria_total?: number;
  frequencia_aulas?: any;
  idioma?: string;
  observacao?: string;
}

interface FormData {
  plano_id: string;
  aulas_pagas: string;
  valor_matricula: string;
  valor_material: string;
  forma_pagamento_plano: string;
  numero_parcelas_plano: string;
  forma_pagamento_material: string;
  numero_parcelas_material: string;
  forma_pagamento_matricula: string;
  numero_parcelas_matricula: string;
  data_vencimento_primeira: string;
  observacoes: string;
}

const formatarDecimalBR = (valor: number): string => {
  return valor.toFixed(2).replace('.', ',');
};

export const TornarAtivoModal: React.FC<TornarAtivoModalProps> = ({
  isOpen,
  onClose,
  aluno,
  onSuccess
}) => {
  const [motivoArquivamento, setMotivoArquivamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [planosGenericos, setPlanosGenericos] = useState<PlanoGenerico[]>([]);
  const [dataVencimentoPrimeira, setDataVencimentoPrimeira] = useState<Date | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<FormData>({
    defaultValues: {
      plano_id: '',
      aulas_pagas: '',
      valor_matricula: '0',
      valor_material: '0',
      forma_pagamento_plano: 'boleto',
      numero_parcelas_plano: '',
      forma_pagamento_material: 'boleto',
      numero_parcelas_material: '',
      forma_pagamento_matricula: 'boleto',
      numero_parcelas_matricula: '',
      data_vencimento_primeira: '',
      observacoes: ''
    }
  });

  const watchedValues = watch();

  // Buscar planos genéricos
  useEffect(() => {
    if (motivoArquivamento === 'Renovação') {
      fetchPlanos();
    }
  }, [motivoArquivamento]);

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, valor_total, valor_por_aula, numero_aulas, descricao, carga_horaria_total, frequencia_aulas, idioma')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlanosGenericos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setPlanosGenericos([]);
    }
  };

  const getCalculatedValues = () => {
    const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
    const aulasQueAlunoVaiPagar = parseInt(watchedValues.aulas_pagas) || 0;
    const valorMatricula = parseFloat(watchedValues.valor_matricula) || 0;
    const valorMaterial = parseFloat(watchedValues.valor_material) || 0;
  
    if (!planoSelecionado) {
      return {
        valorPlano: 0,
        valorAPagar: 0,
        aulasTotal: 0,
        aulasGratuitas: 0,
        aulasAPagar: 0,
        descontoCalculado: 0,
        valorTotalGeral: 0
      };
    }
  
    const valorTotalPlano = planoSelecionado.valor_total || 0;
    const aulasTotaisNoPlano = planoSelecionado.numero_aulas || 0;
    const valorPorAula = aulasTotaisNoPlano > 0 ? valorTotalPlano / aulasTotaisNoPlano : 0;
    const valorAPagar = aulasQueAlunoVaiPagar * valorPorAula;
    
    // Calcular aulas gratuitas e aulas a pagar
    const aulasGratuitas = Math.max(0, aulasTotaisNoPlano - aulasQueAlunoVaiPagar);
    const aulasAPagar = aulasQueAlunoVaiPagar;
    
    // Calcular desconto
    let descontoCalculado = 0;
    if (aulasQueAlunoVaiPagar <= aulasTotaisNoPlano) {
      // Caso normal: pagando menos ou igual ao plano
      descontoCalculado = valorTotalPlano - valorAPagar; // Desconto por pagar menos aulas
    } else {
      // Caso especial: pagando mais aulas que o plano oferece
      descontoCalculado = 0; // Não há desconto, está pagando extra
    }
    
    const valorTotalGeral = valorAPagar + valorMatricula + valorMaterial;
  
    return {
      valorPlano: valorTotalPlano,
      valorAPagar: valorAPagar,
      aulasTotal: aulasTotaisNoPlano,
      aulasGratuitas: aulasGratuitas,
      aulasAPagar: aulasAPagar,
      descontoCalculado: Math.max(0, descontoCalculado),
      valorTotalGeral: valorTotalGeral
    };
  };

  const moverParcelasParaHistorico = async (alunoId: string) => {
    try {
      // Buscar parcelas existentes do aluno através do registro financeiro
      const { data: registroFinanceiro, error: registroError } = await supabase
        .from('financeiro_alunos')
        .select('id')
        .eq('aluno_id', alunoId)
        .single();

      if (registroError) throw registroError;

      // Buscar parcelas existentes do registro financeiro
      const { data: parcelas, error: parcelasError } = await supabase
        .from('parcelas_alunos')
        .select('*')
        .eq('registro_financeiro_id', registroFinanceiro.id);

      if (parcelasError) throw parcelasError;

      if (parcelas && parcelas.length > 0) {
        // Preparar dados para inserir no histórico
        const parcelasHistorico = parcelas.map(parcela => ({
          aluno_id: alunoId,
          registro_financeiro_id: parcela.registro_financeiro_id,
          numero_parcela: parcela.numero_parcela,
          valor: parcela.valor,
          data_vencimento: parcela.data_vencimento,
          data_pagamento: parcela.data_pagamento,
          status_pagamento: parcela.status_pagamento,
          tipo_item: parcela.tipo_item,
          tipo_arquivamento: 'renovacao' as const,
          comprovante: parcela.comprovante,
          observacoes: parcela.observacoes,
          idioma_registro: parcela.idioma_registro
        }));

        // Inserir no histórico
        const { error: historicoError } = await supabase
          .from('historico_parcelas')
          .insert(parcelasHistorico);

        if (historicoError) throw historicoError;

        // Deletar parcelas originais
        const { error: deleteError } = await supabase
          .from('parcelas_alunos')
          .delete()
          .eq('registro_financeiro_id', registroFinanceiro.id);

        if (deleteError) throw deleteError;
      }
    } catch (error) {
      console.error('Erro ao mover parcelas para histórico:', error);
      throw error;
    }
  };

  const criarNovasParcelas = async (registroFinanceiroId: string, formData: FormData) => {
    const { valorAPagar } = getCalculatedValues();
    const valorMatricula = parseFloat(formData.valor_matricula) || 0;
    const valorMaterial = parseFloat(formData.valor_material) || 0;
    
    const parcelas = [];
    let dataBase = dataVencimentoPrimeira || new Date();
    let numeroParcela = 1; // Contador sequencial para todas as parcelas

    // Parcelas do plano
    if (valorAPagar > 0) {
      const numParcelasPlano = parseInt(formData.numero_parcelas_plano) || 1;
      const valorParcela = valorAPagar / numParcelasPlano;
      
      for (let i = 0; i < numParcelasPlano; i++) {
        const dataVencimento = new Date(dataBase);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);
        
        parcelas.push({
          registro_financeiro_id: registroFinanceiroId,
          numero_parcela: numeroParcela++,
          valor: valorParcela,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status_pagamento: 'pendente' as const,
          tipo_item: 'plano' as const,
          descricao_item: 'Plano de aulas',
          forma_pagamento: formData.forma_pagamento_plano,
          idioma_registro: 'Inglês' as const
        });
      }
    }

    // Parcelas da matrícula
    if (valorMatricula > 0) {
      const numParcelasMatricula = parseInt(formData.numero_parcelas_matricula) || 1;
      const valorParcela = valorMatricula / numParcelasMatricula;
      
      for (let i = 0; i < numParcelasMatricula; i++) {
        const dataVencimento = new Date(dataBase);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);
        
        parcelas.push({
          registro_financeiro_id: registroFinanceiroId,
          numero_parcela: numeroParcela++,
          valor: valorParcela,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status_pagamento: 'pendente' as const,
          tipo_item: 'matrícula' as const,
          descricao_item: 'Taxa de matrícula',
          forma_pagamento: formData.forma_pagamento_matricula,
          idioma_registro: 'Inglês' as const
        });
      }
    }

    // Parcelas do material
    if (valorMaterial > 0) {
      const numParcelasMaterial = parseInt(formData.numero_parcelas_material) || 1;
      const valorParcela = valorMaterial / numParcelasMaterial;
      
      for (let i = 0; i < numParcelasMaterial; i++) {
        const dataVencimento = new Date(dataBase);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);
        
        parcelas.push({
          registro_financeiro_id: registroFinanceiroId,
          numero_parcela: numeroParcela++,
          valor: valorParcela,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status_pagamento: 'pendente' as const,
          tipo_item: 'material' as const,
          descricao_item: 'Material didático',
          forma_pagamento: formData.forma_pagamento_material,
          idioma_registro: 'Inglês' as const
        });
      }
    }

    if (parcelas.length > 0) {
      console.log('Criando parcelas:', parcelas); // Debug
      const { error } = await supabase
        .from('parcelas_alunos')
        .insert(parcelas);

      if (error) {
        console.error('Erro ao inserir parcelas:', error); // Debug
        throw error;
      }
      console.log('Parcelas criadas com sucesso!'); // Debug
    }
  };

  const handleTornarAtivoComRenovacao = async (formData: FormData) => {
    if (!aluno || !formData.plano_id) return;

    setLoading(true);
    try {
      // 1. Mover parcelas existentes para histórico
      await moverParcelasParaHistorico(aluno.id);

      // 2. Buscar o registro financeiro atual
      const { data: registroAtual, error: registroError } = await supabase
        .from('financeiro_alunos')
        .select('id')
        .eq('aluno_id', aluno.id)
        .single();

      if (registroError) throw registroError;

      // 3. Calcular valores
      const { valorAPagar, valorTotalGeral, descontoCalculado } = getCalculatedValues();
      const planoSelecionado = planosGenericos.find(p => p.id === formData.plano_id);
      const valorMatricula = parseFloat(formData.valor_matricula) || 0;
      const valorMaterial = parseFloat(formData.valor_material) || 0;

      // 4. Atualizar o registro financeiro com os novos dados
      const { error: updateError } = await supabase
        .from('financeiro_alunos')
        .update({
          migrado: 'nao',
          plano_id: formData.plano_id,
          valor_plano: valorAPagar,
          valor_matricula: valorMatricula,
          valor_material: valorMaterial,
          desconto_total: descontoCalculado,
          status_geral: 'Pendente',
          data_primeiro_vencimento: dataVencimentoPrimeira?.toISOString().split('T')[0],
          forma_pagamento_plano: formData.forma_pagamento_plano,
          numero_parcelas_plano: parseInt(formData.numero_parcelas_plano) || 1,
          forma_pagamento_material: formData.forma_pagamento_material,
          numero_parcelas_material: parseInt(formData.numero_parcelas_material) || 1,
          forma_pagamento_matricula: formData.forma_pagamento_matricula,
          numero_parcelas_matricula: parseInt(formData.numero_parcelas_matricula) || 1
        })
        .eq('id', registroAtual.id);

      if (updateError) throw updateError;

      // 5. Criar novas parcelas
      await criarNovasParcelas(registroAtual.id, formData);

      toast({
        title: "Sucesso",
        description: "Aluno tornado ativo e novo plano financeiro criado com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao tornar ativo com renovação:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar renovação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTornarAtivo = async () => {
    if (!aluno || !motivoArquivamento) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('financeiro_alunos')
        .update({ migrado: 'nao' })
        .eq('aluno_id', aluno.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno tornado ativo com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao tornar ativo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o aluno.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivoArquivamento('');
    reset();
    setDataVencimentoPrimeira(null);
    onClose();
  };

  if (!aluno) return null;

  const calculatedValues = getCalculatedValues();

  // Verificar se não há planos cadastrados quando renovação é selecionada
  if (motivoArquivamento === 'Renovação' && planosGenericos.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nenhum plano cadastrado</DialogTitle>
          </DialogHeader>
          <div className="text-center p-4">
            <p className="text-gray-600 mb-4">
              Por favor, crie um plano antes de prosseguir com a renovação.
            </p>
            <Button onClick={handleClose} variant="outline">
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Tornar Ativo - {aluno.nome}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aviso sobre registros migrados */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Registro Migrado</h3>
                <p className="text-amber-700 mt-1">
                  Este registro é de um aluno migrado que não possui cadastro geral completo 
                  e informações de parcelas pendentes.
                </p>
              </div>
            </div>
          </div>

          {/* Explicação da ação */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">O que acontecerá:</h3>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• As parcelas atuais da tabela serão movidas para o histórico do aluno</li>
                  <li>• O aluno será removido da tabela de migrados (migrado = false)</li>
                  {motivoArquivamento === 'Renovação' && (
                    <li>• Um novo plano financeiro será criado sobrescrevendo os dados atuais</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Seletor de motivo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo do arquivamento:</label>
            <Select value={motivoArquivamento} onValueChange={setMotivoArquivamento}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Renovação">Renovação</SelectItem>
                <SelectItem value="Cancelamento">Cancelamento</SelectItem>
                <SelectItem value="Conclusão">Conclusão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Formulário de renovação - CÓPIA COMPLETA DO FinancialPlanForm */}
          {motivoArquivamento === 'Renovação' && (
            <div className="w-full mx-auto bg-white rounded p-6 space-y-4 shadow-md h-auto relative">
              <h2 className="text-2xl font-bold mb-4">Criar Novo Plano de Pagamento</h2>
              <form onSubmit={handleSubmit(handleTornarAtivoComRenovacao)} className="space-y-6">
                {/* Seleção de Aluno e Plano */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="aluno_id">Aluno *</Label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-800">{aluno.nome}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="plano_id">Plano *</Label>
                    <Controller
                      name="plano_id"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => {
                        return (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full px-2 py-1 text-sm">
                              <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                            <SelectContent>
                              {planosGenericos.map((plano) => (
                                <SelectItem 
                                  key={plano.id}
                                  value={plano.id}
                                  className="cursor-pointer hover:bg-gray-50"
                                >
                                  {plano.nome} - R$ {(plano.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      }
                      }
                    />
                  </div>
                </div>

                {/* Header com Cards de Estatísticas - Aparece apenas quando plano é selecionado */}
                {watchedValues.plano_id && (() => {
                  const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
                  if (!planoSelecionado) return null;
                  
                  const valorPorAula = planoSelecionado.numero_aulas > 0 
                    ? (planoSelecionado.valor_total! / planoSelecionado.numero_aulas)
                    : 0;
                  
                  return (
                    <div className="mb-6">
                      {/* Header com fundo harmônico */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                          Detalhes do Plano Selecionado
                        </h3>
                        
                        {/* Grid de Cards de Estatísticas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {/* Card Valor Total */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Valor Total</p>
                                <p className="text-sm font-bold text-gray-800">
                                  R$ {(planoSelecionado.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs font-bold">R$</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Número de Aulas */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Nº de Aulas</p>
                                <p className="text-sm font-bold text-gray-800">
                                  {planoSelecionado.numero_aulas || 0}
                                </p>
                              </div>
                              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-xs font-bold">#</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Valor por Aula */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Valor/Aula</p>
                                <p className="text-sm font-bold text-gray-800">
                                  R$ {valorPorAula.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 text-xs font-bold">÷</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Frequência */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Frequência</p>
                                <p className="text-sm font-bold text-gray-800">
                                  {planoSelecionado.frequencia_aulas || 'N/A'}
                                </p>
                              </div>
                              <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 text-xs font-bold">⏰</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Segunda linha de cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          {/* Card Idioma */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Idioma</p>
                                <p className="text-sm font-bold text-gray-800">
                                  {planoSelecionado.idioma || 'N/A'}
                                </p>
                              </div>
                              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 text-xs font-bold">🌐</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Descrição */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Descrição</p>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {planoSelecionado.descricao || 'Sem descrição disponível'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Card Observação */}
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Observação</p>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {planoSelecionado.observacao || 'Nenhuma observação'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Espaço para futura barra de pesquisa de alunos */}
                <div className="mb-6 h-12">
                  {/* Espaço para futura barra de pesquisa de alunos */}
                </div>

                {/* Campo de Aulas Pagas */}
                <div>
                  <Label htmlFor="aulas_pagas">Quantas aulas esse aluno vai pagar? *</Label>
                  <Input
                    id="aulas_pagas"
                    type="number"
                    min="1"
                    disabled={!watchedValues.plano_id}
                    {...register('aulas_pagas', { 
                      required: "Por favor, informe o número de aulas pagas",
                      min: {
                        value: 1,
                        message: "O número de aulas deve ser pelo menos 1"
                      },
                      validate: {
                        planoSelecionado: (value) => {
                          if (!watchedValues.plano_id) {
                            return "Por favor, selecione um plano primeiro";
                          }
                          return true;
                        },
                        // Validação suave - só avisa, não bloqueia
                        limiteAulas: (value) => {
                          if (!watchedValues.plano_id) return true;
                          
                          const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
                          if (!planoSelecionado) return true;
                          
                          const maxAulas = planoSelecionado.numero_aulas;
                          const aulasInformadas = parseInt(value) || 0;
                          
                          // Permite digitar qualquer valor, mas avisa se exceder
                          if (aulasInformadas > maxAulas) {
                            return `Atenção: O plano tem apenas ${maxAulas} aulas. Você está pagando por ${aulasInformadas - maxAulas} aulas extras.`;
                          }
                          
                          return true;
                        }
                      }
                    })}
                    placeholder={watchedValues.plano_id ? "Ex: 10, 15, 22..." : "Selecione um plano primeiro"}
                  />
                  
                  {/* Mensagem dinâmica baseada no valor digitado */}
                  {watchedValues.plano_id && watchedValues.aulas_pagas && (
                    <div className="text-xs mt-1">
                      {(() => {
                        const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
                        const maxAulas = planoSelecionado?.numero_aulas || 0;
                        const aulasDigitadas = parseInt(watchedValues.aulas_pagas) || 0;
                        
                        if (aulasDigitadas <= maxAulas) {
                          return (
                            <p className="text-green-600">
                              {maxAulas - aulasDigitadas} aulas gratuitas (de {maxAulas} total)
                            </p>
                          );
                        } else {
                          return (
                            <p className="text-orange-600">
                              Pagando {aulasDigitadas - maxAulas} aulas extras (plano tem {maxAulas} aulas)
                            </p>
                          );
                        }
                      })()} 
                    </div>
                  )}
                  
                  {!watchedValues.plano_id && (
                    <p className="text-xs text-gray-400 mt-1">
                      Selecione um plano para ver os cálculos
                    </p>
                  )}
                </div>

                {/* Bloco de Cálculos Automáticos */}
                {watchedValues.plano_id && watchedValues.aulas_pagas && (
                  <div className="bg-white p-4 rounded grid grid-cols-2 gap-x-4">
                    <h4 className="font-semibold mb-2 col-span-2">Cálculos Automáticos</h4>
                    
                    {/* Coluna Esquerda */}
                    <div className="space-y-1 text-left pr-4">
                      <p className="text-black text-sm">Valor do Plano:</p>
                      <p className="text-black font-semibold text-lg text-left">
                        R$ {formatarDecimalBR(calculatedValues.valorPlano)}
                      </p>
                      <p className="text-black text-sm">Valor com Desconto:</p>
                      <p className="text-green-500 font-semibold text-lg text-left">
                        R$ {formatarDecimalBR(calculatedValues.descontoCalculado)}
                      </p>
                      <p className="text-black text-sm">Valor a ser pago:</p>
                      <p className="text-green-800 font-semibold text-lg text-left">
                        R$ {formatarDecimalBR(calculatedValues.valorAPagar)}
                      </p>
                    </div>
                    
                    {/* Coluna Direita */}
                    <div className="space-y-1 text-right pl-4">
                      <p className="text-black text-sm">Aulas totais:</p>
                      <p className="text-black font-medium text-lg text-right">
                        {calculatedValues.aulasTotal}
                      </p>
                      <p className="text-black text-sm">Aulas gratuitas:</p>
                      <p className="text-black font-medium text-lg text-right">
                        {calculatedValues.aulasGratuitas}
                      </p>
                      <p className="text-black text-sm">Aulas a pagar:</p>
                      <p className="text-black font-medium text-lg text-right">
                        {calculatedValues.aulasAPagar}
                      </p>
                    </div>
                  </div>
                )}

                {/* Área "Desconto" - Exibição do valor calculado */}
                <div>
                  <Label className="text-black">Desconto</Label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <span className="text-green-600 text-lg font-semibold">
                      R$ {formatarDecimalBR(calculatedValues.descontoCalculado)}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Calculado como: Valor do Plano - Valor a Ser Pago</p>
                </div>

                {/* Valores de Matrícula e Material */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="valor_matricula">Valor da Matrícula</Label>
                    <Input
                      id="valor_matricula"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('valor_matricula')}
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="valor_material">Valor do Material</Label>
                    <Input
                      id="valor_material"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('valor_material')}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* Métodos de Pagamento Separados */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg">Métodos de Pagamento</h4>
                  
                  {/* Plano */}
                  {calculatedValues.valorAPagar > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Plano - R$ {calculatedValues.valorAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Método de Pagamento</Label>
                            <Controller
                              name="forma_pagamento_plano"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                    <SelectItem value="transferencia">Transferência</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div>
                            <Label>Número de Parcelas</Label>
                            <Controller
                              name="numero_parcelas_plano"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                      <SelectItem key={num} value={num.toString()}>
                                        {num} {num === 1 ? 'parcela' : 'parcelas'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Material */}
                  {parseFloat(watchedValues.valor_material || '0') > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Materiais - R$ {parseFloat(watchedValues.valor_material || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Método de Pagamento</Label>
                            <Controller
                              name="forma_pagamento_material"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                    <SelectItem value="transferencia">Transferência</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div>
                            <Label>Número de Parcelas</Label>
                            <Controller
                              name="numero_parcelas_material"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                      <SelectItem key={num} value={num.toString()}>
                                        {num} {num === 1 ? 'parcela' : 'parcelas'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Taxa de Matrícula */}
                  {parseFloat(watchedValues.valor_matricula || '0') > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Taxa de Matrícula - R$ {parseFloat(watchedValues.valor_matricula || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Método de Pagamento</Label>
                            <Controller
                              name="forma_pagamento_matricula"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                    <SelectItem value="transferencia">Transferência</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div>
                            <Label>Número de Parcelas</Label>
                            <Controller
                              name="numero_parcelas_matricula"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                      <SelectItem key={num} value={num.toString()}>
                                        {num} {num === 1 ? 'parcela' : 'parcelas'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Área "Valor Total do Contrato" - Linhas separadas */}
                {calculatedValues.valorAPagar > 0 && (
                  <div className="bg-green-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Valor Total do Contrato</h4>
                    <div className="text-sm text-gray-700">
                      {(() => {
                        const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
                        const valorMatricula = parseFloat(watchedValues.valor_matricula) || 0;
                        const valorMaterial = parseFloat(watchedValues.valor_material) || 0;
                        const totalBruto = calculatedValues.valorPlano + valorMatricula + valorMaterial;
                        const resultado = totalBruto - calculatedValues.descontoCalculado;
                        
                        return (
                          <div className="space-y-2">
                            <p>{planoSelecionado?.nome?.toLowerCase()} : R$ {formatarDecimalBR(calculatedValues.valorPlano)}</p>
                            {valorMatricula > 0 && (
                              <p>Taxa de Matrícula : R$ {formatarDecimalBR(valorMatricula)}</p>
                            )}
                            {valorMaterial > 0 && (
                              <p>Materiais : R$ {formatarDecimalBR(valorMaterial)}</p>
                            )}
                            {calculatedValues.descontoCalculado > 0 && (
                              <p className="text-green-600">Desconto : R$ -{formatarDecimalBR(calculatedValues.descontoCalculado)}</p>
                            )}
                            <p className="text-green-800 font-semibold">Total: R$ {formatarDecimalBR(resultado)}</p>
                          </div>
                        );
                      })()} 
                    </div>
                  </div>
                )}

                {/* Data de Vencimento */}
                <div>
                  <Label htmlFor="data_vencimento_primeira">Data do Primeiro Vencimento *</Label>
                  <DatePicker
                    value={dataVencimentoPrimeira}
                    onChange={(date) => {
                      setDataVencimentoPrimeira(date);
                      setValue('data_vencimento_primeira', date ? format(date, 'yyyy-MM-dd') : '');
                    }}
                    placeholder="dd/MM/yyyy"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-2 pt-4 justify-end">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="w-32 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Plano
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Botão para outros motivos */}
          {motivoArquivamento && motivoArquivamento !== 'Renovação' && (
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleTornarAtivo}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processando...' : 'Tornar Ativo'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};