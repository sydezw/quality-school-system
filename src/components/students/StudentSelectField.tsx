
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, ChevronsUpDown, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

type SelectOption = {
  value: string;
  label: string;
};

type StudentSelectFieldProps = {
  value: string | null;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  name?: string;
  formMessage?: React.ReactNode;
  onDelete?: (value: string) => void;
  deletingId?: string | null;
  disabled?: boolean;
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
  disabled = false,
}: StudentSelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const formContext = useFormContext();
  const hasFormContext = !!formContext;

  const handleDelete = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(optionValue);
    }
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    hasFormContext ? (
      <FormItem>
        {label && <FormLabel>{label}</FormLabel>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 md:text-sm"
            >
              <span style={{ pointerEvents: "none" }}>{selectedLabel || (placeholder || "Selecione um aluno")}</span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar aluno..." />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className="cursor-pointer group"
                    >
                      {onDelete && option.value !== "none" && (
                        <button
                          type="button"
                          className="mr-3 p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onMouseDown={(e) => e.stopPropagation()}
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
                      <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1 text-base font-medium">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {formMessage}
      </FormItem>
    ) : (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 md:text-sm"
            >
              <span style={{ pointerEvents: "none" }}>{selectedLabel || (placeholder || "Selecione um aluno")}</span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar aluno..." />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className="cursor-pointer group"
                    >
                      {onDelete && option.value !== "none" && (
                        <button
                          type="button"
                          className="mr-3 p-1 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onMouseDown={(e) => e.stopPropagation()}
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
                      <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                      <span className="flex-1 text-base font-medium">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {formMessage}
      </div>
    )
  );
};

export default StudentSelectField;
