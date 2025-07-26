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
import DatePicker from '@/components/shared/DatePicker';
import { format } from 'date-fns';
import { criarParcelasComNumeracaoCorreta } from '@/utils/parcelaNumbering';
import { PlanoGenerico } from '@/types/financial';

// HELPER FUNCTION: Formatação de valores decimais para padrão brasileiro
const formatarDecimalBR = (valor: number): string => {
  return valor.toFixed(2).replace('.', ',');
};

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
  const [dataVencimentoPrimeira, setDataVencimentoPrimeira] = useState<Date | null>(null);
  const [openStudentSearch, setOpenStudentSearch] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false); // Adicionado estado faltante
  
  // Adicionar esta linha que está faltando:
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, control, watch, setValue } = useForm<FormData>({
    defaultValues: {
      aluno_id: '',
      plano_id: '',
      aulas_pagas: '',
      valor_matricula: '0',
      valor_material: '0',
      forma_pagamento_plano: 'boleto',
      numero_parcelas_plano: '', // Removido valor padrão '1'
      forma_pagamento_material: 'boleto',
      numero_parcelas_material: '', // Removido valor padrão '1'
      forma_pagamento_matricula: 'boleto',
      numero_parcelas_matricula: '', // Removido valor padrão '1'
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

  // Novo useEffect para resetar valores quando o plano é alterado
  useEffect(() => {
    if (watchedValues.plano_id) {
      const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
      const tipoValor = planoSelecionado?.tipo_valor;
      
      // Reset dos valores de matrícula e material baseado no tipo do plano
      if (tipoValor === 'plano_matricula' || tipoValor === 'plano_completo') {
        setValue('valor_matricula', '0');
        setValue('forma_pagamento_matricula', 'boleto');
        setValue('numero_parcelas_matricula', '');
      }
      
      if (tipoValor === 'plano_material' || tipoValor === 'plano_completo') {
        setValue('valor_material', '0');
        setValue('forma_pagamento_material', 'boleto');
        setValue('numero_parcelas_material', '');
      }
    }
  }, [watchedValues.plano_id, planosGenericos]);

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
        .select('id, nome, valor_total, valor_por_aula, numero_aulas, descricao, carga_horaria_total, frequencia_aulas, idioma, tipo_valor')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlanosGenericos(data || []); // Corrigir 'datae' para 'data'
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
  
    // Debug logs
    console.log('=== DEBUG CÁLCULOS ===');
    console.log('watchedValues.aulas_pagas:', watchedValues.aulas_pagas);
    console.log('aulasQueAlunoVaiPagar:', aulasQueAlunoVaiPagar);
    console.log('planoSelecionado:', planoSelecionado);
  
    if (!planoSelecionado) {
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
  
    const valorTotalPlano = planoSelecionado.valor_total || 0;
    const aulasTotaisNoPlano = planoSelecionado.numero_aulas || 0;
    
    const precoPorAula = aulasTotaisNoPlano > 0 ? valorTotalPlano / aulasTotaisNoPlano : 0;
    const valorAPagar = aulasQueAlunoVaiPagar * precoPorAula;
    const ajuste = valorAPagar - valorTotalPlano;
  
    const aulasTotal = aulasTotaisNoPlano;
  
    // Lógica inteligente para aulas gratuitas
    let aulasGratuitas = 0;
    let descontoCalculado = 0;
  
    if (aulasQueAlunoVaiPagar <= aulasTotaisNoPlano) {
      // Caso normal: pagando menos ou igual ao plano
      aulasGratuitas = aulasTotaisNoPlano - aulasQueAlunoVaiPagar;
      descontoCalculado = Math.abs(ajuste); // Desconto por pagar menos aulas
    } else {
      // Caso especial: pagando mais aulas que o plano oferece
      aulasGratuitas = 0; // Não há aulas gratuitas
      descontoCalculado = 0; // Não há desconto, está pagando extra
    }
  
    const aulasAPagar = aulasQueAlunoVaiPagar;
    const valorPlano = valorTotalPlano;
    const valorTotal = valorAPagar + valorMatricula + valorMaterial;
    const valorComDesconto = valorTotal - descontoCalculado;
  
    console.log('Resultados calculados:');
    console.log('aulasTotal:', aulasTotal);
    console.log('aulasGratuitas:', aulasGratuitas);
    console.log('aulasAPagar:', aulasAPagar);
    console.log('valorAPagar:', valorAPagar);
    console.log('descontoCalculado:', descontoCalculado);
  
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
    
    // Verificar se o aluno já possui um plano
    try {
      const { data: existingPlan, error: checkError } = await supabase
        .from('financeiro_alunos')
        .select('id')
        .eq('aluno_id', data.aluno_id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }
      
      if (existingPlan) {
        const studentName = students.find(s => s.id === data.aluno_id)?.nome || 'Aluno';
        toast({
          title: "Plano já existe",
          description: `${studentName} já possui um plano de pagamento. Não é possível criar um novo plano para este aluno.`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar plano existente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar se o aluno já possui um plano.",
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
      
      console.log('Plano criado com sucesso! Criando parcelas...');
      
      // Criar parcelas automaticamente usando a mesma lógica do TornarAtivoModal
      if (financeiroData?.id) {
        const dataBase = new Date(data.data_vencimento_primeira);
        
        // Preparar dados das parcelas seguindo a mesma estrutura do TornarAtivoModal
        const parcelasData: any = {};
        
        // Adicionar parcelas do plano se houver valor
        if (valorAPagar > 0) {
          parcelasData.plano = {
            valor: valorAPagar,
            numParcelas: parseInt(data.numero_parcelas_plano) || 1,
            dataBase,
            formaPagamento: data.forma_pagamento_plano,
            descricao: 'Plano de aulas'
          };
        }
        
        // Adicionar parcelas de matrícula se houver valor
        if (valorMatricula > 0) {
          parcelasData.matricula = {
            valor: valorMatricula,
            numParcelas: parseInt(data.numero_parcelas_matricula) || 1,
            dataBase,
            formaPagamento: data.forma_pagamento_matricula,
            descricao: 'Taxa de matrícula'
          };
        }
        
        // Adicionar parcelas de material se houver valor
        if (valorMaterial > 0) {
          parcelasData.material = {
            valor: valorMaterial,
            numParcelas: parseInt(data.numero_parcelas_material) || 1,
            dataBase,
            formaPagamento: data.forma_pagamento_material,
            descricao: 'Material didático'
          };
        }
        
        // Criar as parcelas com numeração correta
        const parcelas = await criarParcelasComNumeracaoCorreta(
          financeiroData.id,
          parcelasData,
          'Inglês' // Idioma padrão, pode ser ajustado conforme necessário
        );
        
        console.log('Parcelas criadas:', parcelas);
        
        // Inserir as parcelas no banco
        if (parcelas.length > 0) {
          const { error: parcelasError } = await supabase
            .from('parcelas_alunos')
            .insert(parcelas);
          
          if (parcelasError) {
            console.error('Erro ao inserir parcelas:', parcelasError);
            // Não falhar completamente, apenas avisar
            toast({
              title: "Plano Criado com Aviso",
              description: "Plano financeiro criado, mas houve erro ao criar as parcelas. Você pode criá-las manualmente.",
              variant: "destructive",
            });
          } else {
            console.log('Parcelas inseridas com sucesso!');
            toast({
              title: "Plano Criado",
              description: "Plano financeiro e parcelas criados com sucesso!",
            });
          }
        } else {
          toast({
            title: "Plano Criado",
            description: "Plano financeiro criado com sucesso!",
          });
        }
      } else {
        toast({
          title: "Plano Criado",
          description: "Plano financeiro criado com sucesso!",
        });
      }
      
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="aluno_id">Aluno *</Label>
            <Controller
              name="aluno_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <div>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between px-2 py-1 text-sm"
                        >
                          {field.value
                            ? students.find((student) => student.id === field.value)?.nome
                            : "Selecione o aluno..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar aluno..." />
                          <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {students.map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={student.nome}
                                  onSelect={() => {
                                    field.onChange(student.id);
                                    setOpenCombobox(false);
                                  }}
                                  className="cursor-pointer"
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
                    {preSelectedStudent && (
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        Aluno selecionado: {preSelectedStudent.nome}
                      </p>
                    )}
                  </div>
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
            ? (planoSelecionado.valor_total / planoSelecionado.numero_aulas)
            : 0;
          
          return (
            <div className="mb-6">
              {/* Header com fundo harmônico */}
              <div className="border rounded-lg p-4 shadow-sm" style={{background: 'linear-gradient(to right, #F9FAFB, #F3F4F6)', borderColor: '#E5E7EB'}}>
                <h3 className="text-lg font-semibold mb-4 text-center" style={{color: '#1F2937'}}>
                  Detalhes do Plano Selecionado
                </h3>
                
                {/* Grid de Cards de Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Card Valor Total */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border" style={{borderColor: '#F3F4F6'}}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Valor Total</p>
                        <p className="text-sm font-bold" style={{color: '#1F2937'}}>
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
                        <p className="text-xs font-medium" style={{color: '#6B7280'}}>Nº de Aulas</p>
                        <p className="text-sm font-bold" style={{color: '#1F2937'}}>
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
                        <p className="text-xs font-medium" style={{color: '#6B7280'}}>Valor/Aula</p>
                        <p className="text-sm font-bold" style={{color: '#1F2937'}}>
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
                        <p className="text-xs font-medium" style={{color: '#6B7280'}}>Frequência</p>
                        <p className="text-sm font-bold" style={{color: '#1F2937'}}>
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
                        <p className="text-xs font-medium" style={{color: '#6B7280'}}>Idioma</p>
                        <p className="text-sm font-bold" style={{color: '#1F2937'}}>
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
                      <p className="text-xs font-medium mb-1" style={{color: '#6B7280'}}>Descrição</p>
                      <p className="text-xs leading-relaxed" style={{color: '#6B7280'}}>
                        {planoSelecionado.descricao || 'Sem descrição disponível'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Card Observação */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{color: '#6B7280'}}>Observação</p>
                      <p className="text-xs leading-relaxed" style={{color: '#374151'}}>
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
            <p className="text-xs mt-1" style={{color: '#9CA3AF'}}>
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
            {(() => {
              const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
              const tipoValor = planoSelecionado?.tipo_valor;
              
              if (tipoValor === 'plano_matricula' || tipoValor === 'plano_completo') {
                return (
                  <Input
                    id="valor_matricula"
                    type="text"
                    value="Matrícula já incluída no plano"
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                );
              }
              
              return (
                <Input
                  id="valor_matricula"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valor_matricula')}
                  placeholder="0,00"
                />
              );
            })()}
          </div>
          
          <div>
            <Label htmlFor="valor_material">Valor do Material</Label>
            {(() => {
              const planoSelecionado = planosGenericos.find(p => p.id === watchedValues.plano_id);
              const tipoValor = planoSelecionado?.tipo_valor;
              
              if (tipoValor === 'plano_material' || tipoValor === 'plano_completo') {
                return (
                  <Input
                    id="valor_material"
                    type="text"
                    value="Material já incluído no plano"
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                );
              }
              
              return (
                <Input
                  id="valor_material"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valor_material')}
                  placeholder="0,00"
                />
              );
            })()}
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
            <div className="text-sm" style={{color: '#6B7280'}}>
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
              setValue('data_vencimento_primeira', date ? format(date, 'yyyy-MM-dd') : ''); // Corrigido: usar setValue ao invés de setFormData
            }}
            placeholder="Selecione a data do primeiro vencimento"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-2 pt-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="w-32" 
            style={{backgroundColor: '#D90429'}} 
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#B91C1C'} 
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#D90429'}
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