import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ResponsibleDialog from "./ResponsibleDialog";
import { Control } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";
import { useResponsibles } from "@/hooks/useResponsibles";
import { DeleteResponsibleDialog } from "@/components/responsibles/DeleteResponsibleDialog";
import { Tables } from "@/integrations/supabase/types";
type Responsible = Tables<'responsaveis'> & { data_nascimento?: string | null };

interface ResponsibleFieldProps {
  control: Control<StudentFormValues>;
  responsibles: Responsible[];
  saveResponsible: (data: any, editingResponsible: any) => Promise<boolean>;
}

const ResponsibleFieldComponent = ({ control, responsibles, saveResponsible }: ResponsibleFieldProps) => {
  const [isResponsibleDialogOpen, setIsResponsibleDialogOpen] = useState(false);
  const [editingResponsible, setEditingResponsible] = useState<Responsible | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responsibleToDelete, setResponsibleToDelete] = useState<Responsible | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteResponsible } = useResponsibles();

  const filteredResponsibles = useMemo(() => {
    if (!searchQuery.trim()) return responsibles;
    const queryNorm = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNumbers = searchQuery.replace(/\D/g, "");

    return responsibles.filter(responsible => {
      const nomeNorm = responsible.nome ? responsible.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
      const cpfNorm = responsible.cpf ? responsible.cpf.replace(/\D/g, "") : "";
      const telNorm = responsible.telefone ? responsible.telefone.replace(/\D/g, "") : "";

      // Busca inteligente: início do nome completo, início de qualquer palavra, ou sobrenomes
      const nomeWords = nomeNorm.split(' ').filter(word => word.length > 0);
      const queryMatches = (
        // Começa com a query
        nomeNorm.startsWith(queryNorm) ||
        // Qualquer palavra começa com a query
        nomeWords.some(word => word.startsWith(queryNorm)) ||
        // CPF contém os números
        (cpfNorm && cpfNorm.includes(queryNumbers)) ||
        // Telefone contém os números
        (telNorm && telNorm.includes(queryNumbers))
      );

      return queryMatches;
    });
  }, [responsibles, searchQuery]);

  const handleResponsibleSubmit = async (data: any) => {
    const success = await saveResponsible(data, editingResponsible);
    if (success) {
      setIsResponsibleDialogOpen(false);
      setEditingResponsible(null);
    }
  };

  const handleCreateResponsible = () => {
    setEditingResponsible(null);
    setIsResponsibleDialogOpen(true);
  };

  const handleDeleteClick = (responsible: Responsible) => {
    setResponsibleToDelete(responsible);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!responsibleToDelete) return;
    
    setIsDeleting(true);
    setDeletingId(responsibleToDelete.id);
    const success = await deleteResponsible(responsibleToDelete.id);
    
    if (success) {
      setDeleteDialogOpen(false);
      setResponsibleToDelete(null);
    }
    
    setIsDeleting(false);
    setDeletingId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResponsibleToDelete(null);
  };

  return (
    <>
    <FormField
      control={control}
      name="responsavel_id"
      render={({ field }) => {
        const selectedResponsible = responsibles.find(r => r.id === field.value);
        return (
          <FormItem>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Responsável</FormLabel>
              <ResponsibleDialog
                isOpen={isResponsibleDialogOpen}
                editingResponsible={editingResponsible}
                onOpenChange={setIsResponsibleDialogOpen}
                onSubmit={handleResponsibleSubmit}
                onOpenCreate={handleCreateResponsible}
              />
            </div>
            <div className={`combobox-wrapper ${open ? 'border-red-600' : 'border-gray-300'}`} data-open={open}>
               <Popover open={open} onOpenChange={setOpen}>
                 <PopoverTrigger asChild>
                        <Button
                           variant="ghost"
                           role="combobox"
                           aria-expanded={open}
                           className="w-full justify-between rounded-none border-0 focus:ring-0 focus:ring-offset-0 hover:bg-transparent"
                           style={{ border: 'none', boxShadow: 'none', borderRadius: '0', outline: 'none' }}
                         >
                    {selectedResponsible ? selectedResponsible.nome : "Selecionar responsável..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                       className="p-0" 
                       style={{ 
                         width: 'var(--radix-popover-trigger-width)', 
                         minWidth: '400px', 
                         maxHeight: '300px'
                       }}
                     >
                  <Command style={{ border: 'none' }}>
                    <CommandInput
                         placeholder="Buscar responsável..."
                         value={searchQuery}
                         onValueChange={setSearchQuery}
                         style={{ border: 'none' }}
                       />
                    <CommandList style={{ border: 'none' }}>
                    <CommandEmpty>
                      <div className="text-center py-6 px-4">
                        <div className="text-sm text-gray-500 mb-3">
                          {searchQuery.trim() ? 
                            `Nenhum responsável encontrado para "${searchQuery}"` : 
                            'Nenhum responsável encontrado'
                          }
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setOpen(false);
                            handleCreateResponsible();
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Criar novo responsável
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          field.onChange(null);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !field.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Sem responsável
                      </CommandItem>
                      {filteredResponsibles.map(responsible => (
                        <CommandItem
                          key={responsible.id}
                          value={responsible.nome}
                          onSelect={() => {
                            field.onChange(responsible.id);
                            setOpen(false);
                          }}
                        >
                          <div className="flex items-center w-full">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === responsible.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{responsible.nome}</div>
                              {responsible.cpf && (
                                <div className="text-sm text-gray-500">CPF: {responsible.cpf}</div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(responsible);
                              }}
                              className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                              disabled={deletingId === responsible.id}
                            >
                              {deletingId === responsible.id ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
                 </Popover>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
    
    <DeleteResponsibleDialog
      isOpen={deleteDialogOpen}
      responsible={responsibleToDelete}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleDeleteConfirm}
      isDeleting={isDeleting}
    />
    </>
  );
};

const ResponsibleField = ({ control, responsibles, saveResponsible }: ResponsibleFieldProps) => {
  return (
    <ResponsibleFieldComponent 
      control={control} 
      responsibles={responsibles} 
      saveResponsible={saveResponsible} 
    />
  );
};

export default ResponsibleField;
