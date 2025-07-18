
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCEP } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";
import { MapPin, Search, Loader2, Home, Hash, Building2, MapIcon, Sparkles, Navigation, Download } from "lucide-react";

interface AddressFieldsProps {
  control: Control<StudentFormValues>;
  setValue: UseFormSetValue<StudentFormValues>;
}

const AddressFields = ({ control, setValue }: AddressFieldsProps) => {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const { toast } = useToast();

  // Usar useWatch para capturar os valores atuais do formulário
  const cep = useWatch({ control, name: 'cep' });
  const endereco = useWatch({ control, name: 'endereco' });
  const numero = useWatch({ control, name: 'numero' });
  const bairro = useWatch({ control, name: 'bairro' });
  const cidade = useWatch({ control, name: 'cidade' });
  const estado = useWatch({ control, name: 'estado' });

  const watchedValues = useWatch({
    control
  }) as any;

  const fetchAddressByCEP = async (cep: string) => {
    if (!cep || cep.replace(/\D/g, '').length < 8) return;
    
    setIsLoadingCEP(true);
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado e tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      // Preencher campos automaticamente
      setValue('endereco', data.logradouro || '');
      setValue('bairro', data.bairro || '');
      setValue('cidade', data.localidade || '');
      setValue('estado', (data.uf || '').toUpperCase());
      
      toast({
        title: "🎉 Endereço encontrado!",
        description: "Os dados do endereço foram preenchidos automaticamente.",
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const exportAddress = async () => {
    const addressData = {
      cep: cep || '',
      endereco: endereco || '',
      numero: numero || '',
      bairro: bairro || '',
      cidade: cidade || '',
      estado: estado || ''
    };
  
    // Verificar se há dados de endereço para exportar
    const hasAddressData = Object.values(addressData).some(value => value && value.toString().trim() !== '');
    
    if (!hasAddressData) {
      toast({
        title: "Nenhum endereço para exportar",
        description: "Preencha os campos de endereço antes de exportar.",
        variant: "destructive",
      });
      return;
    }
  
    // Salvar no localStorage
    localStorage.setItem('exportedAddress', JSON.stringify(addressData));
    
    // Copiar CEP para a área de transferência
    if (addressData.cep) {
      try {
        await navigator.clipboard.writeText(addressData.cep);
        toast({
          title: "Endereço exportado e CEP copiado!",
          description: `CEP ${addressData.cep} foi copiado para a área de transferência e o endereço completo foi salvo para uso no responsável.`,
        });
      } catch (error) {
        console.error('Erro ao copiar CEP:', error);
        toast({
          title: "Endereço exportado!",
          description: `CEP ${addressData.cep} e endereço completo foram salvos para uso no responsável. (Não foi possível copiar o CEP)`,
        });
      }
    } else {
      toast({
        title: "Endereço exportado!",
        description: "Endereço completo foi salvo para uso no responsável.",
      });
    }
  
    // Debug para verificar se o CEP está sendo capturado
    console.log('Endereço exportado:', addressData);
  };

  return (
    <div className="space-y-8">
      {/* Header da Seção com botão Exportar */}
      <div className="text-center pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-emerald-600 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Endereço</span>
            </div>
            <p className="text-gray-600 text-sm">Informe o endereço completo do aluno</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportAddress}
            className="flex items-center gap-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
          >
            <Download className="h-4 w-4" />
            Exportar Endereço
          </Button>
        </div>
      </div>

      {/* CEP com busca automática - Destaque especial */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
        <FormField
          control={control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-bold text-gray-800 flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                CEP - Busca Automática
              </FormLabel>
              <FormControl>
                <div className="flex gap-3">
                  <Input
                    placeholder="00000-000"
                    className="h-14 text-lg font-medium border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 bg-white shadow-sm"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      field.onChange(formatted);
                      // Auto-buscar quando CEP estiver completo
                      if (formatted.replace(/\D/g, '').length === 8) {
                        fetchAddressByCEP(formatted);
                      }
                    }}
                    maxLength={9}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-14 px-6 border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300 font-medium"
                    onClick={() => fetchAddressByCEP(String(field.value || ''))}
                    disabled={isLoadingCEP || !field.value || (typeof field.value === 'string' ? field.value.replace(/\D/g, '').length < 8 : true)}
                    title="Buscar endereço pelo CEP"
                  >
                    {isLoadingCEP ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-emerald-600 mt-2 font-medium">
                💡 Digite o CEP e o endereço será preenchido automaticamente
              </p>
            </FormItem>
          )}
        />
      </div>

      {/* Grid de Campos de Endereço */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endereço */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  Endereço *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Rua, Avenida, etc."
                    className="h-12 text-base border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 bg-white"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Número */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                    <Hash className="h-4 w-4 text-white" />
                  </div>
                  Número *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="123"
                    className="h-12 text-base border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 bg-white"
                    {...field}
                    value={field.value?.toString() || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bairro */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                    <MapIcon className="h-4 w-4 text-white" />
                  </div>
                  Bairro *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome do bairro"
                    className="h-12 text-base border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 bg-white"
                    {...field}
                    value={field.value?.toString() || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Cidade */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  Cidade *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome da cidade"
                    className="h-12 text-base border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 bg-white"
                    {...field}
                    value={field.value?.toString() || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estado */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <FormField
            control={control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-700 flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  Estado *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="SP"
                    className="h-12 text-base border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300 bg-white uppercase"
                    {...field}
                    value={field.value?.toString() || ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Dica */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <p className="text-emerald-700 text-sm font-medium">
          🏠 Dica: Use o CEP para preenchimento automático dos campos de endereço
        </p>
      </div>
    </div>
  );
};

export default AddressFields;
