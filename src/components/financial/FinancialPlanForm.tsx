import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';

// HELPER FUNCTION: Formatação de valores decimais para padrão brasileiro
const formatarDecimalBR = (valor: number): string => {
  return valor.toFixed(2).replace('.', ',');
};

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
  preSelectedStudent?: Student | null;
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
}

const FinancialPlanForm = ({ onSuccess, onCancel, preSelectedStudent }: FinancialPlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [planosGenericos, setPlanosGenericos] = useState<PlanoGenerico[]>([]);

  const [openStudentSearch, setOpenStudentSearch] = useState(false);
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
      data_vencimento_primeira: ''
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    fetchStudents();
    fetchPlanos();
    
    // Se há um aluno pré-selecionado, define no formulário
    if (preSelectedStudent) {
      setValue('aluno_id', preSelectedStudent.id);
    }
  }, [preSelectedStudent]);

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



  const getCalculatedValues = () => {
    const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
    const aulasQueAlunoVaiPagar = parseInt(watchedValues.aulas_pagas) || 0;
    const valorMatricula = parseFloat(watchedValues.valor_matricula) || 0;
    const valorMaterial = parseFloat(watchedValues.valor_material) || 0;

    if (!planoSelecionado || aulasQueAlunoVaiPagar <= 0) {
      return {
        aulasTotal: 0,
        aulasGratuitas: 0,
        aulasAPagar: 0,
        valorAPagar: 0,
        valorTotal: 0,
        valorComDesconto: 0,
        descontoCalculado: 0,
        valorPlano: 0,
        precoPorAula: 0,
        ajuste: 0
      };
    }

    // Nova lógica de cálculo
    const valorTotalPlano = planoSelecionado.valor_total || 0;
    const aulasTotaisNoPlano = planoSelecionado.numero_aulas || 0;
    
    // 1. precoPorAula = valorTotalPlano ÷ aulasTotaisNoPlano
    const precoPorAula = aulasTotaisNoPlano > 0 ? valorTotalPlano / aulasTotaisNoPlano : 0;
    
    // 2. valorAPagar = aulasQueAlunoVaiPagar × precoPorAula
    const valorAPagar = aulasQueAlunoVaiPagar * precoPorAula;
    
    // 3. ajuste = valorAPagar − valorTotalPlano
    const ajuste = valorAPagar - valorTotalPlano;
    
    // Para compatibilidade com o resto do código
    const aulasTotal = aulasTotaisNoPlano;
    const aulasGratuitas = Math.max(0, aulasTotal - aulasQueAlunoVaiPagar);
    const aulasAPagar = aulasQueAlunoVaiPagar;
    const valorPlano = valorTotalPlano;
    const descontoCalculado = Math.abs(ajuste < 0 ? ajuste : 0); // Desconto quando ajuste é negativo
    
    const valorTotal = valorAPagar + valorMatricula + valorMaterial;
    const valorComDesconto = valorTotal - descontoCalculado;

    return {
      aulasTotal,
      aulasGratuitas,
      aulasAPagar,
      valorAPagar,
      valorTotal,
      valorComDesconto,
      descontoCalculado,
      valorPlano,
      precoPorAula,
      ajuste
    };
  };
  
  // O desconto é agora calculado automaticamente e exibido como texto

  const onSubmit = async (data: FormData) => {
    console.log('=== INÍCIO DA SUBMISSÃO ===');
    console.log('Dados do formulário:', data);
    
    // Validações básicas
    if (!data.aluno_id) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um aluno.",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.plano_id) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um plano.",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.aulas_pagas || parseInt(data.aulas_pagas) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe o número de aulas pagas.",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.data_vencimento_primeira) {
      toast({
        title: "Erro",
        description: "Por favor, informe a data de vencimento da primeira parcela.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const planoSelecionado = planosGenericos.find(p => p.id === data.plano_id);
      console.log('Plano selecionado:', planoSelecionado);
      
      const aulasPagas = parseInt(data.aulas_pagas) || 0;
      const valorMatricula = parseFloat(data.valor_matricula) || 0;
      const valorMaterial = parseFloat(data.valor_material) || 0;
      
      console.log('Valores:', { aulasPagas, valorMatricula, valorMaterial });
      
      // Calcular valores usando a mesma lógica da função getCalculatedValues
      const valorTotalPlano = planoSelecionado?.valor_total || 0;
      const aulasTotaisNoPlano = planoSelecionado?.numero_aulas || 0;
      const precoPorAula = aulasTotaisNoPlano > 0 ? valorTotalPlano / aulasTotaisNoPlano : 0;
      const valorAPagar = aulasPagas * precoPorAula;
      const ajuste = valorAPagar - valorTotalPlano;
      const descontoCalculado = Math.abs(ajuste < 0 ? ajuste : 0);
      
      console.log('Cálculos:', { valorTotalPlano, aulasTotaisNoPlano, precoPorAula, valorAPagar, descontoCalculado });
      
      // Criar registro financeiro na nova tabela
      const novoFinanceiroAluno = {
        aluno_id: data.aluno_id,
        plano_id: data.plano_id,
        valor_plano: valorAPagar,
        valor_material: valorMaterial,
        valor_matricula: valorMatricula,
        desconto_total: descontoCalculado,
        // valor_total será calculado automaticamente pelo trigger
        valor_total: valorAPagar + valorMatricula + valorMaterial - descontoCalculado,
         status_geral: 'Pendente',
        data_primeiro_vencimento: data.data_vencimento_primeira,
        // Métodos de pagamento e parcelas
        forma_pagamento_plano: data.forma_pagamento_plano,
        numero_parcelas_plano: parseInt(data.numero_parcelas_plano),
        forma_pagamento_material: data.forma_pagamento_material,
        numero_parcelas_material: parseInt(data.numero_parcelas_material),
        forma_pagamento_matricula: data.forma_pagamento_matricula,
        numero_parcelas_matricula: parseInt(data.numero_parcelas_matricula)
      };
      
      console.log('Dados para inserir:', novoFinanceiroAluno);
      
      const { data: financeiroData, error: financeiroError } = await supabase
        .schema('public')
        .from('financeiro_alunos')
        .insert(novoFinanceiroAluno)
        .select()
        .single();
      
      console.log('Resultado da inserção:', { financeiroData, financeiroError });
      
      if (financeiroError) {
        console.error('Erro do Supabase:', financeiroError);
        throw financeiroError;
      }
      
      console.log('Plano criado com sucesso!');
      
      toast({
        title: "Plano Criado",
        description: "Plano financeiro criado com sucesso!",
      });
      
      reset();
      onSuccess();
      
    } catch (error) {
      console.error('=== ERRO AO CRIAR PLANO ===');
      console.error('Erro completo:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      let errorMessage = "Não foi possível criar o plano.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
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
    <div className="w-full mx-auto bg-white rounded p-6 space-y-4 shadow-md h-auto relative">
      <h2 className="text-2xl font-bold mb-4">Criar Plano de Pagamento</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seleção de Aluno e Plano */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="aluno_id">Aluno *</Label>
            {preSelectedStudent && (
              <p className="text-sm text-blue-600 mb-2">
                Aluno selecionado: {preSelectedStudent.nome}
              </p>
            )}
            <Controller
              name="aluno_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                const selectedStudent = students.find(student => student.id === field.value);
                return (
                  <Popover open={openStudentSearch} onOpenChange={setOpenStudentSearch}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStudentSearch}
                        className="w-full justify-between"
                        disabled={!!preSelectedStudent}
                      >
                        {selectedStudent ? selectedStudent.nome : "Buscar aluno..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Digite o nome do aluno..." />
                        <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            {students.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.nome}
                                onSelect={() => {
                                  field.onChange(student.id);
                                  setOpenStudentSearch(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === student.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {student.nome}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                );
              }}
            />
          </div>
          
          <div>
            <Label htmlFor="plano_id">Plano *</Label>
            <Controller
              name="plano_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <div className="space-y-4">
                    {/* Select tradicional para compatibilidade */}
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

                  </div>
                );
              }
            }
            />

          </div>
        </div>



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
            max="100"
            {...register('aulas_pagas', { required: true, min: 1 })}
            placeholder="Ex: 22"
          />
          <p className="text-xs text-gray-500 mt-1">Máximo: 100 aulas</p>
        </div>



        {/* Bloco de Cálculos Automáticos */}
        {watchedValues.plano_id && watchedValues.aulas_pagas && (
          <div className="bg-white p-4 rounded grid grid-cols-2 gap-x-4">
            <h4 className="font-semibold mb-2 col-span-2">Cálculos Automáticos</h4>
            
            {/* Coluna Esquerda */}
            <div className="space-y-1 text-left pr-4">
              <p className="text-black text-sm">Valor a ser pago:</p>
              <p className="text-green-600 font-semibold text-lg text-left">
                R$ {formatarDecimalBR(calculatedValues.valorAPagar)}
              </p>
              <p className="text-black text-sm">Desconto calculado:</p>
              <p className="text-green-600 font-semibold text-lg text-left">
                R$ {formatarDecimalBR(calculatedValues.descontoCalculado)}
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
          <Label htmlFor="data_vencimento_primeira">Data de Vencimento da 1ª Parcela *</Label>
          <Input
            id="data_vencimento_primeira"
            type="date"
            {...register('data_vencimento_primeira', { required: true })}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-2 pt-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="w-32 bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Plano
          </Button>
        </div>
      </form>


    </div>
  );
};

export default FinancialPlanForm;