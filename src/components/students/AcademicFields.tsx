
import { FormField, FormMessage } from "@/components/ui/form";
import StudentSelectField from "./StudentSelectField";
import { Control } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
}

interface AcademicFieldsProps {
  control: Control<StudentFormValues>;
  classes: Class[];
  selectedIdioma: string;
}

const AcademicFields = ({ control, classes, selectedIdioma }: AcademicFieldsProps) => {
  console.log('AcademicFields - classes recebidas:', classes);
  console.log('AcademicFields - selectedIdioma:', selectedIdioma);
  
  // Função para normalizar strings removendo acentos e convertendo para minúsculas
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Filtrar turmas baseado no idioma selecionado
  const filteredClasses = selectedIdioma
    ? classes.filter(turma => {
        const turmaIdioma = normalizeString(turma.idioma || '');
        const selectedIdiomaLower = normalizeString(selectedIdioma);
        return turmaIdioma === selectedIdiomaLower;
      })
    : classes; // Se não há idioma selecionado, mostrar todas as turmas
  
  console.log('AcademicFields - filteredClasses:', filteredClasses);

  // Determinar estado do select de turma
  const turmaDisabled = !selectedIdioma;

  return (
    <>
      <FormField
        control={control}
        name="idioma"
        render={({ field }) => (
          <StudentSelectField
            value={field.value}
            label="Idioma *"
            placeholder="Selecione o idioma"
            options={[
              { value: "Inglês", label: "Inglês" },
              { value: "Japonês", label: "Japonês" }
            ]}
            onChange={field.onChange}
            formMessage={<FormMessage />}
          />
        )}
      />
      <FormField
        control={control}
        name="turma_id"
        render={({ field }) => (
          <div>
            <StudentSelectField
              value={field.value || 'none'}
              label="Turma"
              placeholder="Selecione a turma"
              options={[
                { value: "none", label: "Sem turma" },
                ...filteredClasses.map((cls) => ({
                  value: cls.id,
                  label: `${cls.nome} - ${cls.nivel}`
                }))
              ]}
              onChange={field.onChange}
              formMessage={<FormMessage />}
              // Campo desabilitado até selecionar idioma
              disabled={turmaDisabled}
            />
            {/* Mensagem explicativa se usuário tentou selecionar, mas não há turmas */}
            {selectedIdioma && filteredClasses.length === 0 && (
              <div className="text-xs text-red-600 mt-1">
                Nenhuma turma disponível para o idioma selecionado.
              </div>
            )}
          </div>
        )}
      />
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <StudentSelectField
            value={field.value}
            label="Status"
            options={[
              { value: "Ativo", label: "Ativo" },
              { value: "Trancado", label: "Trancado" },
              { value: "Cancelado", label: "Cancelado" }
            ]}
            onChange={field.onChange}
            formMessage={<FormMessage />}
          />
        )}
      />
    </>
  );
};

export default AcademicFields;

