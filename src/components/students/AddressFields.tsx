
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCEP } from "@/utils/formatters";
import { Control, UseFormSetValue } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AddressFieldsProps {
  control: Control<StudentFormValues>;
  setValue: UseFormSetValue<StudentFormValues>;
}

const AddressFields = ({ control, setValue }: AddressFieldsProps) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const { toast } = useToast();

  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, CEP: ${cep}`;
          setValue('endereco', endereco);
          toast({
            title: "CEP encontrado!",
            description: "Endereço preenchido automaticamente. Adicione apenas o número.",
          });
        } else {
          setValue('endereco', '');
          toast({
            title: "CEP não encontrado",
            description: "Verifique se o CEP está correto.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível consultar o CEP.",
          variant: "destructive",
        });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  return (
    <>
      <FormField
        control={control}
        name="cep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEP</FormLabel>
            <FormControl>
              <Input
                placeholder="00000-000"
                {...field}
                value={field.value || ''}
                onChange={e => {
                  const formattedCep = formatCEP(e.target.value);
                  field.onChange(formattedCep);
                  handleCEPChange(formattedCep);
                }}
                maxLength={9}
                disabled={loadingCep}
              />
            </FormControl>
            {loadingCep && <p className="text-sm text-gray-500 mt-1">Buscando CEP...</p>}
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input placeholder="Será preenchido automaticamente pelo CEP" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="numero_endereco"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 123" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AddressFields;
