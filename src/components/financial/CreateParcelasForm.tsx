import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2, User, FileText, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types/shared';
import { formatDate } from '@/utils/formatters';
import { criarNovaParcela, TipoItem } from '@/utils/parcelaNumbering';

interface CreateParcelasFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ParcelaToCreate {
  id: string;
  aluno_id: string;
  valor: number;
  data_vencimento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'avulso' | 'outros';
  descricao_item: string;
  idioma_registro: 'Inglês' | 'Japonês';
  forma_pagamento: string;
  observacoes?: string;
}

interface ParcelaTemplate {
  aluno_id: string;
  valor: number;
  data_vencimento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'avulso' | 'outros';
  descricao_item: string;
  idioma_registro: 'Inglês' | 'Japonês';
  forma_pagamento: string;
  observacoes?: string;
  quantidade: number;
}

const CreateParcelasForm: React.FC<CreateParcelasFormProps> = ({ onSuccess, onCancel }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaToCreate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [parcelaTemplate, setParcelaTemplate] = useState<ParcelaTemplate>({
    aluno_id: '',
    valor: 0,
    data_vencimento: '',
    tipo_item: 'outros',
    descricao_item: '',
    idioma_registro: 'Inglês',
    forma_pagamento: 'pix',
    observacoes: '',
    quantidade: 1
  });

  useEffect(() => {
    fetchStudentsWithFinancialPlans();
  }, []);

  const fetchStudentsWithFinancialPlans = async () => {
    try {
      setIsLoadingStudents(true);
      
      // Buscar alunos ativos que têm planos financeiros
      const { data: studentsData, error: studentsError } = await supabase
        .from('alunos')
        .select(`
          id,
          nome,
          email,
          telefone,
          status,
          financeiro_alunos!inner(
            id,
            idioma_registro,
            planos(
              nome
            )
          )
        `)
        .eq('status', 'Ativo')

      if (studentsError) {
        console.error('Erro ao buscar alunos:', studentsError);
        toast.error('Erro ao carregar alunos');
        return;
      }

      setStudents(studentsData || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast.error('Erro ao carregar alunos');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const addParcela = () => {
    if (parcelas.length >= 12) {
      toast.error('Máximo de 12 parcelas permitidas');
      return;
    }
    
    const newParcela: ParcelaToCreate = {
      id: `temp-${Date.now()}`,
      aluno_id: '',
      valor: 0,
      data_vencimento: '',
      tipo_item: 'outros',
      descricao_item: 'Parcela individual',
      idioma_registro: 'Inglês',
      forma_pagamento: 'pix',
      observacoes: ''
    };
    setParcelas([...parcelas, newParcela]);
  };

  const removeParcela = (id: string) => {
    setParcelas(parcelas.filter(p => p.id !== id));
  };

  const updateParcela = (id: string, field: keyof ParcelaToCreate, value: any) => {
    setParcelas(parcelas.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const createMultipleParcelas = () => {
    if (!parcelaTemplate.aluno_id || parcelaTemplate.valor <= 0 || !parcelaTemplate.data_vencimento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (parcelaTemplate.quantidade <= 0 || parcelaTemplate.quantidade > 12) {
      toast.error('A quantidade deve ser entre 1 e 12');
      return;
    }

    if (parcelas.length + parcelaTemplate.quantidade > 12) {
      toast.error(`Não é possível adicionar ${parcelaTemplate.quantidade} parcelas. Limite máximo: 12`);
      return;
    }

    const novasParcelas: ParcelaToCreate[] = [];
    const baseDate = new Date(parcelaTemplate.data_vencimento);

    for (let i = 0; i < parcelaTemplate.quantidade; i++) {
      const dataVencimento = new Date(baseDate);
      dataVencimento.setMonth(dataVencimento.getMonth() + i);

      const novaParcela: ParcelaToCreate = {
        id: `temp-${Date.now()}-${i}`,
        aluno_id: parcelaTemplate.aluno_id,
        valor: parcelaTemplate.valor,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        tipo_item: parcelaTemplate.tipo_item,
        descricao_item: parcelaTemplate.descricao_item || 'Parcela criada em lote',
        idioma_registro: parcelaTemplate.idioma_registro,
        forma_pagamento: parcelaTemplate.forma_pagamento,
        observacoes: parcelaTemplate.observacoes
      };
      novasParcelas.push(novaParcela);
    }

    setParcelas([...parcelas, ...novasParcelas]);
    setShowBulkCreate(false);
    toast.success(`${parcelaTemplate.quantidade} parcela(s) adicionada(s) com sucesso!`);

    // Reset template
    setParcelaTemplate({
      aluno_id: '',
      valor: 0,
      data_vencimento: '',
      tipo_item: 'outros',
      descricao_item: '',
      idioma_registro: 'Inglês',
      forma_pagamento: 'pix',
      observacoes: '',
      quantidade: 1
    });
  };

  const updateTemplate = (field: keyof ParcelaTemplate, value: any) => {
    setParcelaTemplate(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (parcelas.length === 0) {
      toast.error('Adicione pelo menos uma parcela');
      return false;
    }

    for (const parcela of parcelas) {
      if (!parcela.aluno_id) {
        toast.error('Selecione um aluno para todas as parcelas');
        return false;
      }
      if (parcela.valor <= 0) {
        toast.error('O valor deve ser maior que zero');
        return false;
      }
      if (!parcela.data_vencimento) {
        toast.error('Defina a data de vencimento para todas as parcelas');
        return false;
      }

    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      let parcelasCreated = 0;
      let errors = 0;

      for (const parcela of parcelas) {
        // Buscar o registro financeiro do aluno
        const { data: financialRecord, error: financialError } = await supabase
          .from('financeiro_alunos')
          .select('id')
          .eq('aluno_id', parcela.aluno_id)
          .single();

        if (financialError || !financialRecord) {
          console.error('Erro ao encontrar registro financeiro:', financialError);
          toast.error(`Erro ao encontrar registro financeiro do aluno`);
          errors++;
          continue;
        }

        // Usar a função criarNovaParcela que cuida da numeração automática
        const novaParcela = await criarNovaParcela(
          financialRecord.id,
          parcela.tipo_item as TipoItem,
          {
            valor: parcela.valor,
            data_vencimento: parcela.data_vencimento,
            status_pagamento: 'pendente',
            descricao_item: parcela.descricao_item || 'Parcela criada manualmente',
            idioma_registro: parcela.idioma_registro,
            forma_pagamento: parcela.forma_pagamento,
            observacoes: parcela.observacoes
          }
        );

        if (novaParcela) {
          parcelasCreated++;
        } else {
          errors++;
          toast.error(`Erro ao criar parcela para o aluno`);
        }
      }

      if (parcelasCreated > 0) {
        toast.success(`${parcelasCreated} parcela(s) criada(s) com sucesso!`);
        if (errors > 0) {
          toast.error(`${errors} parcela(s) falharam ao ser criadas`);
        }
        onSuccess();
      } else {
        toast.error('Nenhuma parcela foi criada');
      }
    } catch (error) {
      console.error('Erro ao criar parcelas:', error);
      toast.error('Erro ao criar parcelas');
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.nome : '';
  };

  if (isLoadingStudents) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{showBulkCreate ? 'Criar Parcelas em Lote' : 'Criar Parcelas Individuais'}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!showBulkCreate ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBulkCreate(false)}
            >
              Individual
            </Button>
            <Button
              type="button"
              variant={showBulkCreate ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBulkCreate(true)}
            >
              Em Lote
            </Button>
          </div>
          <Badge variant="outline" className="text-sm">
            {parcelas.length}/12 parcela(s)
          </Badge>
        </div>
      </div>

      {showBulkCreate && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Template para Criação em Lote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Aluno
                </Label>
                <Select
                  value={parcelaTemplate.aluno_id}
                  onValueChange={(value) => updateTemplate('aluno_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={parcelaTemplate.valor || ''}
                  onChange={(e) => updateTemplate('valor', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data de Vencimento (1ª parcela)
                </Label>
                <Input
                  type="date"
                  value={parcelaTemplate.data_vencimento}
                  onChange={(e) => updateTemplate('data_vencimento', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Quantidade de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={parcelaTemplate.quantidade}
                  onChange={(e) => updateTemplate('quantidade', parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Item</Label>
                <Select
                  value={parcelaTemplate.tipo_item}
                  onValueChange={(value) => updateTemplate('tipo_item', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plano">Plano</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="matrícula">Matrícula</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                    <SelectItem value="avulso">Avulso</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select
                  value={parcelaTemplate.idioma_registro}
                  onValueChange={(value) => updateTemplate('idioma_registro', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Japonês">Japonês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={parcelaTemplate.forma_pagamento}
                  onValueChange={(value) => updateTemplate('forma_pagamento', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>



            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Input
                value={parcelaTemplate.observacoes || ''}
                onChange={(e) => updateTemplate('observacoes', e.target.value)}
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={createMultipleParcelas}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gerar {parcelaTemplate.quantidade} Parcela(s)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {parcelas.map((parcela, index) => (
          <Card key={parcela.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Parcela {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParcela(parcela.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`aluno-${parcela.id}`} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Aluno
                  </Label>
                  <Select
                    value={parcela.aluno_id}
                    onValueChange={(value) => updateParcela(parcela.id, 'aluno_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`valor-${parcela.id}`}>Valor (R$)</Label>
                  <Input
                    id={`valor-${parcela.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={parcela.valor || ''}
                    onChange={(e) => updateParcela(parcela.id, 'valor', parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`data-${parcela.id}`} className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Vencimento
                  </Label>
                  <Input
                    id={`data-${parcela.id}`}
                    type="date"
                    value={parcela.data_vencimento}
                    onChange={(e) => updateParcela(parcela.id, 'data_vencimento', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tipo-${parcela.id}`}>Tipo de Item</Label>
                  <Select
                    value={parcela.tipo_item}
                    onValueChange={(value) => updateParcela(parcela.id, 'tipo_item', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plano">Plano</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="matrícula">Matrícula</SelectItem>
                      <SelectItem value="cancelamento">Cancelamento</SelectItem>
                      <SelectItem value="avulso">Avulso</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`idioma-${parcela.id}`}>Idioma</Label>
                  <Select
                    value={parcela.idioma_registro}
                    onValueChange={(value) => updateParcela(parcela.id, 'idioma_registro', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inglês">Inglês</SelectItem>
                      <SelectItem value="Japonês">Japonês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`pagamento-${parcela.id}`}>Forma de Pagamento</Label>
                  <Select
                    value={parcela.forma_pagamento}
                    onValueChange={(value) => updateParcela(parcela.id, 'forma_pagamento', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>



              <div className="space-y-2">
                <Label htmlFor={`observacoes-${parcela.id}`}>Observações (opcional)</Label>
                <Input
                  id={`observacoes-${parcela.id}`}
                  value={parcela.observacoes || ''}
                  onChange={(e) => updateParcela(parcela.id, 'observacoes', e.target.value)}
                  placeholder="Observações adicionais..."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          onClick={addParcela}
          disabled={parcelas.length >= 12}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Parcela ({parcelas.length}/12)
        </Button>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || parcelas.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Criando...
            </>
          ) : (
            `Criar ${parcelas.length} Parcela(s)`
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateParcelasForm;