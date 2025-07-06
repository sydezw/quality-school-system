
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatCPF, formatPhone } from "@/utils/formatters";
import BirthDateInput from "./BirthDateInput";
import { Control } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";

interface PersonalInfoFieldsProps {
  control: Control<StudentFormValues>;
}

const PersonalInfoFields = ({ control }: PersonalInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="data_nascimento"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Data de Nascimento</FormLabel>
            <BirthDateInput
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF</FormLabel>
            <FormControl>
              <Input
                placeholder="000.000.000-00"
                {...field}
                value={field.value || ''}
                onChange={e => field.onChange(formatCPF(e.target.value))}
                maxLength={14}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input 
                placeholder="(11) 99999-9999" 
                {...field} 
                value={field.value || ''}
                onChange={e => field.onChange(formatPhone(e.target.value))}
                maxLength={15}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="email@exemplo.com" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PersonalInfoFields;
