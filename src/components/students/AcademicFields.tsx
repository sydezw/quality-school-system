
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
  // Se há idioma selecionado, filtrar por idioma; senão, mostrar todas
  const filteredClasses = selectedIdioma
    ? classes.filter(turma => {
        const turmaIdioma = normalizeString(turma.idioma || '');
        const selectedIdiomaLower = normalizeString(selectedIdioma);
        return turmaIdioma === selectedIdiomaLower;
      })
    : classes; // Mostrar todas as turmas quando não há idioma selecionado
  
  console.log('AcademicFields - filteredClasses:', filteredClasses);

  // Campo turma sempre habilitado, mas filtrado por idioma quando selecionado
  const turmaDisabled = false;

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
              label="Turma (Opcional)"
              placeholder="Selecione a turma ou deixe sem turma"
              options={[
                { value: "none", label: "Sem turma" },
                ...filteredClasses.map((cls) => ({
                  value: cls.id,
                  label: `${cls.nome} - ${cls.nivel}`
                }))
              ]}
              onChange={field.onChange}
              formMessage={<FormMessage />}
              disabled={turmaDisabled}
            />
            {/* Mensagem explicativa se usuário selecionou idioma mas não há turmas */}
            {selectedIdioma && filteredClasses.length === 0 && (
              <div className="text-xs text-amber-600 mt-1">
                Nenhuma turma disponível para o idioma selecionado. O aluno pode ficar sem turma.
              </div>
            )}
            {/* Mensagem informativa sobre a opcionalidade */}
            {!selectedIdioma && (
              <div className="text-xs text-gray-500 mt-1">
                Selecione um idioma para filtrar as turmas ou deixe o aluno sem turma.
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

