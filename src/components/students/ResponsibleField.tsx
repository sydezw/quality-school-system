import { useState, useMemo, useRef } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import StudentSelectField from "./StudentSelectField";
import ResponsibleDialog from "./ResponsibleDialog";
import { Control } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";
import { Search, Trash2 } from "lucide-react";
import { useResponsibles } from "@/hooks/useResponsibles";

interface Responsible {
  id: string;
  nome: string;
  cpf: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  telefone: string | null;
}

interface ResponsibleFieldProps {
  control: Control<StudentFormValues>;
  responsibles: Responsible[];
  saveResponsible: (data: any, editingResponsible: any) => Promise<boolean>;
}

function normalizeSearch(text: string) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\D/g, "");
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const idx = normalizedText.indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold bg-yellow-200 rounded">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

const SuggestionDropdown = ({
  suggestions,
  searchQuery,
  onSelect,
  onDelete,
  visible,
  selectedResponsibleId,
  deletingId,
}: {
  suggestions: Responsible[];
  searchQuery: string;
  onSelect: (r: Responsible) => void;
  onDelete: (id: string) => void;
  visible: boolean;
  selectedResponsibleId?: string | null;
  deletingId?: string | null;
}) => {
  if (!visible || !suggestions.length || !searchQuery.trim()) return null;
  return (
    <ul className="absolute left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded shadow max-h-56 overflow-auto">
      {suggestions.map(responsible => (
        <li key={responsible.id}>
          <div className={`flex items-center w-full ${selectedResponsibleId === responsible.id ? "bg-gray-50" : ""}`}>
            <button
              type="button"
              className={`flex-1 text-left px-3 py-2 hover:bg-gray-100 flex flex-col`}
              onClick={() => onSelect(responsible)}
            >
              <span>
                {highlightMatch(responsible.nome, searchQuery)}
                {responsible.cpf && (
                  <span className="ml-2 text-xs text-gray-500">CPF: {highlightMatch(responsible.cpf, searchQuery.replace(/\D/g, ""))}</span>
                )}
              </span>
              {responsible.telefone && (
                <span className="text-xs text-gray-500">Telefone: {highlightMatch(responsible.telefone, searchQuery.replace(/\D/g, ""))}</span>
              )}
            </button>
            <button
              type="button"
              className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-tr-md rounded-br-md"
              onClick={() => onDelete(responsible.id)}
              title="Excluir responsável"
              disabled={deletingId === responsible.id}
            >
              {deletingId === responsible.id ? (
                <span className="w-4 h-4 flex items-center justify-center animate-spin border-2 border-gray-300 border-t-red-500 rounded-full"></span>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

const ResponsibleField = ({ control, responsibles, saveResponsible }: ResponsibleFieldProps) => {
  const [isResponsibleDialogOpen, setIsResponsibleDialogOpen] = useState(false);
  const [editingResponsible, setEditingResponsible] = useState<Responsible | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { deleteResponsible } = useResponsibles();

  const filteredResponsibles = useMemo(() => {
    if (!searchQuery.trim()) {
      return responsibles;
    }
    const queryNorm = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNumbers = searchQuery.replace(/\D/g, "");

    return responsibles.filter(responsible => {
      const nomeNorm = responsible.nome ? responsible.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
      const cpfNorm = responsible.cpf ? responsible.cpf.replace(/\D/g, "") : "";
      const telNorm = responsible.telefone ? responsible.telefone.replace(/\D/g, "") : "";

      return (
        nomeNorm.startsWith(queryNorm) ||
        nomeNorm.includes(queryNorm) ||
        (cpfNorm && cpfNorm.startsWith(queryNumbers)) ||
        (cpfNorm && cpfNorm.includes(queryNumbers)) ||
        (telNorm && telNorm.startsWith(queryNumbers)) ||
        (telNorm && telNorm.includes(queryNumbers))
      );
    });
  }, [responsibles, searchQuery]);

  const suggestions = useMemo(() => filteredResponsibles.slice(0, 7), [filteredResponsibles]);

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

  const handleDeleteResponsible = async (id: string) => {
    setShowSuggestions(false);
    setTimeout(async () => {
      const confirmed = window.confirm('Tem certeza que deseja excluir este responsável?');
      if (!confirmed) return;
      setDeletingId(id);
      await deleteResponsible(id);
      setDeletingId(null);
      setSearchQuery("");
      if (inputRef.current) inputRef.current.blur();
    }, 80);
  };

  return (
    <FormField
      control={control}
      name="responsavel_id"
      render={({ field }) => (
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
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Pesquisar responsável por nome, CPF ou telefone..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              className="pl-10"
              autoComplete="off"
            />
            <SuggestionDropdown
              suggestions={suggestions}
              searchQuery={searchQuery}
              onSelect={responsible => {
                field.onChange(responsible.id);
                setSearchQuery(responsible.nome);
                setShowSuggestions(false);
                if (inputRef.current) inputRef.current.blur();
              }}
              onDelete={handleDeleteResponsible}
              visible={showSuggestions}
              selectedResponsibleId={field.value}
              deletingId={deletingId}
            />
          </div>
          <StudentSelectField
            value={field.value || 'none'}
            label={""}
            options={[
              { value: "none", label: "Sem responsável" },
              ...filteredResponsibles.map((r) => ({
                value: r.id,
                label: r.nome
              }))
            ]}
            onChange={field.onChange}
            formMessage={<FormMessage />}
          />
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-1">
              {filteredResponsibles.length > 0
                ? `${filteredResponsibles.length} responsável(is) encontrado(s)`
                : "Nenhum responsável encontrado"
              }
            </p>
          )}
        </FormItem>
      )}
    />
  );
};

export default ResponsibleField;
