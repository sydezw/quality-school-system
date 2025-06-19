
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type SelectOption = {
  value: string;
  label: string;
};

type StudentSelectFieldProps = {
  value: string | null;
  label: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  name?: string;
  formMessage?: React.ReactNode;
};

const StudentSelectField = ({
  value,
  label,
  placeholder,
  options,
  onChange,
  formMessage,
}: StudentSelectFieldProps) => (
  <FormItem>
    <FormLabel>{label}</FormLabel>
    <Select onValueChange={onChange} value={value || ""}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Selecione"} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {formMessage}
  </FormItem>
);

export default StudentSelectField;
