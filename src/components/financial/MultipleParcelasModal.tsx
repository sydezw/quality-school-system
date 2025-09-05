import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getProximoNumeroParcela } from '@/utils/parcelaNumbering';
import { adicionarMesesSeguro } from '@/utils/dateUtils';
import { formatDate } from '@/utils/formatters';

interface NovaParcelaForm {
  registro_financeiro_id: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'cancelado';
  idioma_registro: 'Inglês' | 'Japonês';
  descricao_item?: string;
  observacoes?: string;
  forma_pagamento?: string;
}

interface Aluno {
  id: string;
  nome: string;
  registro_financeiro_id: string;
  // Adicionar outras propriedades conforme necessário
}

interface MultipleParcelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: Aluno | null;
  onSuccess: () => void;
  initialTab?: 'single' | 'multiple'; // Nova prop para definir a tab inicial
}

export const MultipleParcelasModal: React.FC<MultipleParcelasModalProps> = ({
  isOpen,
  onClose,
  aluno,
  onSuccess,
  initialTab = 'single' // Valor padrão é 'single'
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'multiple'>(initialTab);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Atualizar a tab ativa quando initialTab mudar
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Estados para parcela única
  const [singleParcela, setSingleParcela] = useState<NovaParcelaForm>({
    registro_financeiro_id: aluno?.registro_financeiro_id || '',
    tipo_item: 'plano',
    numero_parcela: 1,
    valor: 0,
    data_vencimento: '',
    status_pagamento: 'pendente',
    idioma_registro: 'Inglês',
    descricao_item: '',
    observacoes: '',
    forma_pagamento: 'boleto'
  });

  // Estados para múltiplas parcelas
  const [multipleParcelas, setMultipleParcelas] = useState({
    tipo_item: 'plano' as 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros',
    quantidade: 2,
    valor_total: 0,
    data_inicial: '',
    dia_padrao: 5,
    forma_pagamento: 'boleto',
    descricao_item: '',
    observacoes: ''
  });

  useEffect(() => {
    if (isOpen && aluno) {
      setSingleParcela(prev => ({
        ...prev,
        registro_financeiro_id: aluno.registro_financeiro_id,
        idioma_registro: 'Inglês'
      }));
    }
  }, [isOpen, aluno]);

  const calcularDatasMultiplas = () => {
    const datas: string[] = [];
    const dataInicial = new Date(multipleParcelas.data_inicial);
    
    for (let i = 0; i < multipleParcelas.quantidade; i++) {
      // Usar função segura para adicionar meses
      const novaData = adicionarMesesSeguro(dataInicial, i);
      
      // Ajustar para o dia padrão se especificado
      if (multipleParcelas.dia_padrao !== dataInicial.getDate()) {
        const ultimoDiaDoMes = new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0).getDate();
        const diaFinal = Math.min(multipleParcelas.dia_padrao, ultimoDiaDoMes);
        novaData.setDate(diaFinal);
      }
      
      datas.push(novaData.toISOString().split('T')[0]);
    }
    
    return datas;
  };

  const criarParcelaUnica = async () => {
    setLoading(true);
    try {
      if (!aluno?.registro_financeiro_id) {
        throw new Error('ID do registro financeiro não encontrado');
      }

      // Validar campos obrigatórios
      if (!singleParcela.data_vencimento) {
        throw new Error('Data de vencimento é obrigatória');
      }

      if (singleParcela.valor <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      const proximoNumero = await getProximoNumeroParcela(
        aluno.registro_financeiro_id,
        singleParcela.tipo_item
      );

      const { error } = await supabase
        .from('parcelas_alunos')
        .insert({
          ...singleParcela,
          numero_parcela: proximoNumero
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Parcela criada com sucesso!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar parcela:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar parcela. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarMultiplasParcelas = async () => {
    setLoading(true);
    try {
      if (!aluno?.registro_financeiro_id) {
        throw new Error('ID do registro financeiro não encontrado');
      }

      // Validar campos obrigatórios
      if (!multipleParcelas.data_inicial) {
        throw new Error('Data inicial é obrigatória');
      }

      if (multipleParcelas.valor_total <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      if (multipleParcelas.quantidade < 2) {
        throw new Error('Quantidade deve ser pelo menos 2 parcelas');
      }

      const datas = calcularDatasMultiplas();
      // Usar o valor_total diretamente para cada parcela, não dividir
      const valorPorParcela = multipleParcelas.valor_total;
      
      const proximoNumero = await getProximoNumeroParcela(
        aluno.registro_financeiro_id,
        multipleParcelas.tipo_item
      );

      const parcelasParaInserir = datas.map((data, index) => ({
        registro_financeiro_id: aluno.registro_financeiro_id,
        tipo_item: multipleParcelas.tipo_item,
        numero_parcela: proximoNumero + index,
        valor: valorPorParcela,
        data_vencimento: data,
        status_pagamento: 'pendente' as const,
        idioma_registro: 'Inglês' as const,
        descricao_item: multipleParcelas.descricao_item || null,
        observacoes: multipleParcelas.observacoes || null,
        forma_pagamento: multipleParcelas.forma_pagamento
      }));

      const { error } = await supabase
        .from('parcelas_alunos')
        .insert(parcelasParaInserir);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${multipleParcelas.quantidade} parcelas criadas com sucesso!`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar múltiplas parcelas:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar parcelas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSingleParcela({
      registro_financeiro_id: aluno?.registro_financeiro_id || '',
      tipo_item: 'plano',
      numero_parcela: 1,
      valor: 0,
      data_vencimento: '',
      status_pagamento: 'pendente',
      idioma_registro: 'Inglês' as const,
      descricao_item: '',
      observacoes: '',
      forma_pagamento: 'boleto'
    });

    setMultipleParcelas({
      tipo_item: 'plano',
      quantidade: 2,
      valor_total: 0,
      data_inicial: '',
      dia_padrao: 5,
      forma_pagamento: 'boleto',
      descricao_item: '',
      observacoes: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" style={{color: '#D90429'}} />
            <span>Criar Parcelas</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'multiple')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Parcela Única
            </TabsTrigger>
            <TabsTrigger value="multiple" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Múltiplas Parcelas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <Label htmlFor="single-tipo">Tipo</Label>
                <Select 
                  value={singleParcela.tipo_item} 
                  onValueChange={(value) => setSingleParcela(prev => ({...prev, tipo_item: value as any}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
                <Label htmlFor="single-valor">Valor</Label>
                <Input
                  id="single-valor"
                  type="number"
                  step="0.01"
                  value={singleParcela.valor}
                  onChange={(e) => setSingleParcela(prev => ({...prev, valor: parseFloat(e.target.value) || 0}))}
                />
              </div>

              <div>
                <Label htmlFor="single-vencimento">Data de Vencimento</Label>
                <Input
                  id="single-vencimento"
                  type="date"
                  value={singleParcela.data_vencimento}
                  onChange={(e) => setSingleParcela(prev => ({...prev, data_vencimento: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="single-forma-pagamento">Forma de Pagamento</Label>
                <Select 
                  value={singleParcela.forma_pagamento || 'boleto'} 
                  onValueChange={(value) => setSingleParcela(prev => ({...prev, forma_pagamento: value}))}
                >
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
              </div>

              <div>
                <Label htmlFor="single-descricao">Descrição do Item</Label>
                <Input
                  id="single-descricao"
                  type="text"
                  placeholder="Ex: valor promocional material + plano"
                  value={singleParcela.descricao_item || ''}
                  onChange={(e) => setSingleParcela(prev => ({...prev, descricao_item: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="single-observacoes">Observações</Label>
                <textarea
                  id="single-observacoes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Adicione observações sobre esta parcela..."
                  value={singleParcela.observacoes || ''}
                  onChange={(e) => setSingleParcela(prev => ({...prev, observacoes: e.target.value}))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={criarParcelaUnica}
                  disabled={loading}
                  className="transition-all duration-200" 
                  style={{background: 'linear-gradient(to right, #D90429, #1F2937)'}} 
                  onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #B91C1C, #111827)'} 
                  onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #D90429, #1F2937)'}
                >
                  {loading ? 'Criando...' : 'Criar Parcela'}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="multiple">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <Label htmlFor="multiple-tipo">Tipo</Label>
                <Select 
                  value={multipleParcelas.tipo_item} 
                  onValueChange={(value) => setMultipleParcelas(prev => ({...prev, tipo_item: value as any}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="multiple-quantidade">Quantidade de Parcelas</Label>
                  <Input
                    id="multiple-quantidade"
                    type="number"
                    min="2"
                    max="24"
                    value={multipleParcelas.quantidade}
                    onChange={(e) => setMultipleParcelas(prev => ({...prev, quantidade: parseInt(e.target.value) || 2}))}
                  />
                </div>

                <div>
                  <Label htmlFor="multiple-valor-total">Valor por Parcela</Label>
                  <Input
                    id="multiple-valor-total"
                    type="number"
                    step="0.01"
                    value={multipleParcelas.valor_total}
                    onChange={(e) => setMultipleParcelas(prev => ({...prev, valor_total: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="multiple-data-inicial">Data Inicial</Label>
                  <Input
                    id="multiple-data-inicial"
                    type="date"
                    value={multipleParcelas.data_inicial}
                    onChange={(e) => setMultipleParcelas(prev => ({...prev, data_inicial: e.target.value}))}
                  />
                </div>

                <div>
                  <Label htmlFor="multiple-dia-padrao">Dia Padrão</Label>
                  <Input
                    id="multiple-dia-padrao"
                    type="number"
                    min="1"
                    max="31"
                    value={multipleParcelas.dia_padrao}
                    onChange={(e) => setMultipleParcelas(prev => ({...prev, dia_padrao: parseInt(e.target.value) || 5}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="multiple-forma-pagamento">Forma de Pagamento</Label>
                <Select 
                  value={multipleParcelas.forma_pagamento} 
                  onValueChange={(value) => setMultipleParcelas(prev => ({...prev, forma_pagamento: value}))}
                >
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
              </div>

              <div>
                <Label htmlFor="multiple-descricao">Descrição do Item</Label>
                <Input
                  id="multiple-descricao"
                  type="text"
                  placeholder="Ex: valor promocional material + plano"
                  value={multipleParcelas.descricao_item}
                  onChange={(e) => setMultipleParcelas(prev => ({...prev, descricao_item: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="multiple-observacoes">Observações</Label>
                <textarea
                  id="multiple-observacoes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Adicione observações sobre estas parcelas..."
                  value={multipleParcelas.observacoes}
                  onChange={(e) => setMultipleParcelas(prev => ({...prev, observacoes: e.target.value}))}
                />
              </div>

              {multipleParcelas.valor_total > 0 && multipleParcelas.quantidade > 0 && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Valor total:</strong> R$ {(multipleParcelas.valor_total * multipleParcelas.quantidade).toFixed(2)}
                  </p>
                  {multipleParcelas.data_inicial && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1"><strong>Datas das parcelas:</strong></p>
                      <div className="text-xs text-gray-500 max-h-20 overflow-y-auto">
                        {calcularDatasMultiplas().map((data, index) => (
                          <div key={index}>
                            Parcela {index + 1}: {formatDate(data)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={criarMultiplasParcelas}
                  disabled={loading}
                  className="transition-all duration-200" 
                  style={{background: 'linear-gradient(to right, #D90429, #1F2937)'}} 
                  onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #B91C1C, #111827)'} 
                  onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #D90429, #1F2937)'}
                >
                  {loading ? 'Criando...' : `Criar ${multipleParcelas.quantidade} Parcelas`}
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};