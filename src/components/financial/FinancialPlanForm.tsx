import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';

interface PlanoGenerico {
  id: string;
  nome: string;
  valor_total: number | null;
  valor_por_aula: number | null;
  numero_aulas: number;
  descricao?: string;
  carga_horaria_total?: number;
  frequencia_aulas?: string;
}

interface Student {
  id: string;
  nome: string;
}

interface FinancialPlanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  aluno_id: string;
  plano_id: string;
  aulas_pagas: string;
  valor_matricula: string;
  valor_material: string;
  // Métodos de pagamento separados
  forma_pagamento_plano: string;
  numero_parcelas_plano: string;
  forma_pagamento_material: string;
  numero_parcelas_material: string;
  forma_pagamento_matricula: string;
  numero_parcelas_matricula: string;
  data_vencimento_primeira: string;
  desconto: string;
}

const FinancialPlanForm = ({ onSuccess, onCancel }: FinancialPlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [planosGenericos, setPlanosGenericos] = useState<PlanoGenerico[]>([]);
  const [hoveredPlan, setHoveredPlan] = useState<PlanoGenerico | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<FormData>({
    defaultValues: {
      aluno_id: '',
      plano_id: '',
      aulas_pagas: '',
      valor_matricula: '0',
      valor_material: '0',
      forma_pagamento_plano: 'boleto',
      numero_parcelas_plano: '1',
      forma_pagamento_material: 'boleto',
      numero_parcelas_material: '1',
      forma_pagamento_matricula: 'boleto',
      numero_parcelas_matricula: '1',
      data_vencimento_primeira: '',
      desconto: '0'
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchStudents();
    fetchPlanos();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    }
  };

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, valor_total, valor_por_aula, numero_aulas, descricao, carga_horaria_total, frequencia_aulas')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlanosGenericos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setPlanosGenericos([]);
    }
  };

  const handlePlanHover = (plan: PlanoGenerico, event: React.MouseEvent) => {
    setHoveredPlan(plan);
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.right + 10,
      y: rect.top
    });
  };

  const handlePlanLeave = () => {
    setHoveredPlan(null);
  };

  const getCalculatedValues = () => {
    const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
    const aulasPagas = parseInt(watchedValues.aulas_pagas) || 0;
    const valorMatricula = parseFloat(watchedValues.valor_matricula) || 0;
    const valorMaterial = parseFloat(watchedValues.valor_material) || 0;
    const desconto = parseFloat(watchedValues.desconto) || 0;

    if (!planoSelecionado || aulasPagas <= 0) {
      return {
        aulasTotal: 0,
        aulasGratuitas: 0,
        valorCalculado: 0,
        valorTotal: 0,
        valorComDesconto: 0
      };
    }

    const aulasTotal = planoSelecionado.numero_aulas || 0;
    const aulasGratuitas = Math.max(0, aulasTotal - aulasPagas);
    const valorCalculado = aulasPagas * (planoSelecionado.valor_por_aula || 0);
    const valorTotal = valorCalculado + valorMatricula + valorMaterial;
    const valorComDesconto = valorTotal - desconto;

    return {
      aulasTotal,
      aulasGratuitas,
      valorCalculado,
      valorTotal,
      valorComDesconto
    };
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const planoSelecionado = planosGenericos.find(p => p.id === data.plano_id);
      const aulasPagas = parseInt(data.aulas_pagas) || 0;
      const valorMatricula = parseFloat(data.valor_matricula) || 0;
      const valorMaterial = parseFloat(data.valor_material) || 0;
      const desconto = parseFloat(data.desconto) || 0;
      
      // Calcular valores
      const valorAulas = aulasPagas * (planoSelecionado?.valor_por_aula || 0);
      const valorTotalContrato = valorAulas + valorMatricula + valorMaterial - desconto;
      
      // Criar contrato com informações do plano
      const novoContrato = {
        aluno_id: data.aluno_id,
        plano_id: data.plano_id,
        valor_mensalidade: valorTotalContrato, // Será dividido pelas parcelas
        valor_total: valorTotalContrato,
        aulas_pagas: aulasPagas,
        valor_matricula: valorMatricula,
        valor_material: valorMaterial,
        forma_pagamento: data.forma_pagamento_plano,
        numero_parcelas: parseInt(data.numero_parcelas_plano),
        data_inicio: new Date().toISOString().split('T')[0],
        status: 'Ativo' as const
      };
      
      const { data: contratoData, error: contratoError } = await supabase
        .from('contratos')
        .insert(novoContrato)
        .select()
        .single();
      
      if (contratoError) throw contratoError;
      
      // Criar boletos para cada item com seus respectivos métodos de pagamento
      const boletos = [];
      const dataVencimento = new Date(data.data_vencimento_primeira);
      
      // Boletos do Plano
      if (valorAulas > 0) {
        const parcelasPlano = parseInt(data.numero_parcelas_plano);
        const valorParcelaPlano = valorAulas / parcelasPlano;
        
        for (let i = 1; i <= parcelasPlano; i++) {
          const dataVencimentoParcela = new Date(dataVencimento);
          dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + (i - 1));
          
          boletos.push({
            aluno_id: data.aluno_id,
            contrato_id: contratoData.id,
            descricao: `Plano - Parcela ${i}/${parcelasPlano} - ${planoSelecionado?.nome || 'Plano'}`,
            valor: valorParcelaPlano,
            data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
            status: 'Pendente' as const,
            numero_parcela: i,
            metodo_pagamento: data.forma_pagamento_plano
          });
        }
      }
      
      // Boletos de Material
      if (valorMaterial > 0) {
        const parcelasMaterial = parseInt(data.numero_parcelas_material);
        const valorParcelaMaterial = valorMaterial / parcelasMaterial;
        
        for (let i = 1; i <= parcelasMaterial; i++) {
          const dataVencimentoParcela = new Date(dataVencimento);
          dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + (i - 1));
          
          boletos.push({
            aluno_id: data.aluno_id,
            contrato_id: contratoData.id,
            descricao: `Material - Parcela ${i}/${parcelasMaterial}`,
            valor: valorParcelaMaterial,
            data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
            status: 'Pendente' as const,
            numero_parcela: i,
            metodo_pagamento: data.forma_pagamento_material
          });
        }
      }
      
      // Boletos de Matrícula
      if (valorMatricula > 0) {
        const parcelasMatricula = parseInt(data.numero_parcelas_matricula);
        const valorParcelaMatricula = valorMatricula / parcelasMatricula;
        
        for (let i = 1; i <= parcelasMatricula; i++) {
          const dataVencimentoParcela = new Date(dataVencimento);
          dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + (i - 1));
          
          boletos.push({
            aluno_id: data.aluno_id,
            contrato_id: contratoData.id,
            descricao: `Taxa de Matrícula - Parcela ${i}/${parcelasMatricula}`,
            valor: valorParcelaMatricula,
            data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
            status: 'Pendente' as const,
            numero_parcela: i,
            metodo_pagamento: data.forma_pagamento_matricula
          });
        }
      }
      
      if (boletos.length > 0) {
        const { error: boletoError } = await supabase
          .from('boletos')
          .insert(boletos);
        
        if (boletoError) throw boletoError;
      }
      
      toast({
        title: "Plano Criado",
        description: `Plano criado com sucesso! ${boletos.length} boleto(s) gerado(s).`,
      });
      
      reset();
      onSuccess();
      
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o plano.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatedValues = getCalculatedValues();

  // Verificar se não há planos cadastrados
  if (planosGenericos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Nenhum plano cadastrado
          </h3>
          <p className="text-yellow-700">
            Por favor, crie um plano antes de prosseguir.
          </p>
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleção de Aluno e Plano */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aluno_id">Aluno *</Label>
            <Controller
              name="aluno_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div>
            <Label htmlFor="plano_id">Plano *</Label>
            <Controller
              name="plano_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {planosGenericos.map((plano) => (
                      <SelectItem 
                        key={plano.id} 
                        value={plano.id}
                        onMouseEnter={(e) => handlePlanHover(plano, e)}
                        onMouseLeave={handlePlanLeave}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        {plano.nome} - R$ {(plano.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Campo de Aulas Pagas */}
        <div>
          <Label htmlFor="aulas_pagas">Quantas aulas esse aluno vai pagar? *</Label>
          <Input
            id="aulas_pagas"
            type="number"
            min="1"
            max="100"
            {...register('aulas_pagas', { required: true, min: 1 })}
            placeholder="Ex: 22"
          />
          <p className="text-xs text-gray-500 mt-1">Máximo: 100 aulas</p>
        </div>

        {/* Bloco de Cálculos Automáticos - Cor avermelhada */}
        {watchedValues.plano_id && watchedValues.aulas_pagas && (
          <div className="bg-red-50 border border-red-400 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-red-800">Cálculos Automáticos</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Aulas totais: {calculatedValues.aulasTotal}</div>
              <div>Aulas gratuitas: {calculatedValues.aulasGratuitas}</div>
              <div className="col-span-2">Valor calculado: R$ {calculatedValues.valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        )}

        {/* Campo de Desconto - Posicionado após o valor calculado */}
        <div>
          <Label htmlFor="desconto">Desconto</Label>
          <Input
            id="desconto"
            type="number"
            step="0.01"
            min="0"
            {...register('desconto')}
            placeholder="0,00"
            className="text-green-600 font-semibold"
          />
          <p className="text-xs text-green-600 mt-1">Valor do desconto em verde para destaque</p>
        </div>

        {/* Valores de Matrícula e Material */}
        <div className="grid grid-cols-2 gap-4">
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
          {calculatedValues.valorCalculado > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plano - R$ {calculatedValues.valorCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="cartao">Cartão</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
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
                <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="cartao">Cartão</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
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
                <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="cartao">Cartão</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
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

        {/* Valor Total do Contrato */}
        {calculatedValues.valorComDesconto > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Valor Total do Contrato</h4>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                Subtotal: R$ {calculatedValues.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              {parseFloat(watchedValues.desconto || '0') > 0 && (
                <div className="text-sm text-green-600 font-semibold">
                  Desconto: -R$ {parseFloat(watchedValues.desconto || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <div className="text-lg font-bold text-green-700">
                Total: R$ {calculatedValues.valorComDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}

        {/* Data de Vencimento */}
        <div>
          <Label htmlFor="data_vencimento_primeira">Data de Vencimento da 1ª Parcela *</Label>
          <Input
            id="data_vencimento_primeira"
            type="date"
            {...register('data_vencimento_primeira', { required: true })}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-2 pt-4">
          <Button 
            type="submit" 
            className="flex-1 bg-brand-red hover:bg-brand-red/90"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Plano
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>

      {/* Card de Hover com Detalhes do Plano */}
      {hoveredPlan && (
        <div 
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          <h4 className="font-semibold text-lg mb-2">{hoveredPlan.nome}</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Valor Total:</strong> R$ {(hoveredPlan.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div><strong>Valor por Aula:</strong> R$ {(hoveredPlan.valor_por_aula || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div><strong>Número de Aulas:</strong> {hoveredPlan.numero_aulas}</div>
            {hoveredPlan.carga_horaria_total && (
              <div><strong>Carga Horária:</strong> {hoveredPlan.carga_horaria_total}h</div>
            )}
            {hoveredPlan.frequencia_aulas && (
              <div><strong>Frequência:</strong> {hoveredPlan.frequencia_aulas}</div>
            )}
            {hoveredPlan.descricao && (
              <div className="mt-2">
                <strong>Descrição:</strong>
                <p className="text-gray-600 mt-1">{hoveredPlan.descricao}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialPlanForm;