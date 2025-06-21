
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2 } from "lucide-react";
import { useState } from "react";

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
  onDelete?: (value: string) => void;
  deletingId?: string | null;
};

const StudentSelectField = ({
  value,
  label,
  placeholder,
  options,
  onChange,
  formMessage,
  onDelete,
  deletingId,
}: StudentSelectFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(optionValue);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select onValueChange={onChange} value={value || ""} open={isOpen} onOpenChange={setIsOpen}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={placeholder || "Selecione"} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {options.map(option => (
             <SelectItem key={option.value} value={option.value} className="group py-3">
               <div className="flex items-center w-full">
                 {onDelete && option.value !== "none" && (
                   <button
                     type="button"
                     className="mr-3 p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                     onClick={(e) => handleDelete(option.value, e)}
                     title="Excluir responsável"
                     disabled={deletingId === option.value}
                   >
                     {deletingId === option.value ? (
                       <span className="w-4 h-4 flex items-center justify-center animate-spin border border-gray-300 border-t-red-500 rounded-full"></span>
                     ) : (
                       <Trash2 className="w-4 h-4" />
                     )}
                   </button>
                 )}
                 <span className="flex-1 text-base font-medium">{option.label}</span>
               </div>
             </SelectItem>
           ))}
        </SelectContent>
      </Select>
      {formMessage}
    </FormItem>
  );
};

export default StudentSelectField;
