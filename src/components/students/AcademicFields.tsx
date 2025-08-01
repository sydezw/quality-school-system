
import { FormField, FormMessage } from "@/components/ui/form";
import StudentSelectField from "./StudentSelectField";
import { Control, useWatch } from "react-hook-form";
import { StudentFormValues } from "@/lib/validators/student";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  setValue?: (name: keyof StudentFormValues, value: any) => void; // Adicionando setValue como prop opcional
}

const AcademicFields = ({ control, classes, selectedIdioma, setValue }: AcademicFieldsProps) => {
  console.log('AcademicFields - classes recebidas:', classes);
  console.log('AcademicFields - selectedIdioma:', selectedIdioma);
  
  // Observar mudanças no campo turma_id para sincronizar o nível
  const turmaId = useWatch({
    control,
    name: "turma_id"
  });

  // Função para normalizar strings removendo acentos e convertendo para minúsculas
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Filtrar turmas baseado no idioma selecionado
  // Se há idioma selecionado e não é "none", filtrar por idioma; senão, mostrar todas
  const filteredClasses = selectedIdioma && selectedIdioma !== "none"
    ? classes.filter(turma => {
        const turmaIdioma = normalizeString(turma.idioma || '');
        const selectedIdiomaLower = normalizeString(selectedIdioma);
        return turmaIdioma === selectedIdiomaLower;
      })
    : classes; // Mostrar todas as turmas quando não há idioma selecionado ou é "none"
  
  console.log('AcademicFields - filteredClasses:', filteredClasses);

  // Campo turma sempre habilitado, mas filtrado por idioma quando selecionado
  const turmaDisabled = false;

  // Efeito para sincronizar o nível quando a turma muda
  useEffect(() => {
    if (turmaId && turmaId !== 'none' && setValue) {
      const turmaSelecionada = classes.find(cls => cls.id === turmaId);
      if (turmaSelecionada && turmaSelecionada.nivel) {
        console.log('Sincronizando nível da turma:', turmaSelecionada.nivel);
        setValue('nivel', turmaSelecionada.nivel);
      }
    } else if ((!turmaId || turmaId === 'none') && setValue) {
      // Se não há turma selecionada, limpar o nível (opcional)
      // setValue('nivel', '');
    }
  }, [turmaId, classes, setValue]);

  return (
    <>
      <FormField
        control={control}
        name="idioma"
        render={({ field }) => (
          <StudentSelectField
            value={field.value}
            label="Idioma (Opcional)"
            placeholder="Selecione o idioma ou deixe em branco"
            options={[
              { value: "none", label: "Sem idioma específico" },
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
        name="nivel"
        render={({ field }) => {
          const turmaSelecionada = turmaId && turmaId !== 'none' 
            ? classes.find(cls => cls.id === turmaId) 
            : null;
          
          return (
            <div>
              <StudentSelectField
                value={field.value || 'none'}
                label="Nível"
                placeholder={turmaSelecionada ? `Nível da turma: ${turmaSelecionada.nivel}` : "Selecione o nível"}
                options={[
                  { value: "none", label: "Sem nível definido" },
                  { value: "Book 1", label: "Book 1" },
                  { value: "Book 2", label: "Book 2" },
                  { value: "Book 3", label: "Book 3" },
                  { value: "Book 4", label: "Book 4" },
                  { value: "Book 5", label: "Book 5" },
                  { value: "Book 6", label: "Book 6" },
                  { value: "Book 7", label: "Book 7" },
                  { value: "Book 8", label: "Book 8" },
                  { value: "Book 9", label: "Book 9" },
                  { value: "Book 10", label: "Book 10" }
                ]}
                onChange={field.onChange}
                formMessage={<FormMessage />}
              />
              {turmaSelecionada && (
                <div className="text-xs text-blue-600 mt-1">
                  💡 Nível sincronizado automaticamente com a turma "{turmaSelecionada.nome}". Você pode alterar manualmente se necessário.
                </div>
              )}
              {!turmaSelecionada && (
                <div className="text-xs text-gray-500 mt-1">
                  Selecione uma turma para sincronizar o nível automaticamente ou defina manualmente.
                </div>
              )}
            </div>
          );
        }}
      />
      {/* Seção de Tipos de Aula */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tipos de Aula</h3>
          <div className="space-y-3">
            <FormField
              control={control}
              name="aulas_turma"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aulas_turma"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                  <Label
                    htmlFor="aulas_turma"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Aulas de Turma (Regulares)
                  </Label>
                </div>
              )}
            />
            <FormField
              control={control}
              name="aulas_particulares"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aulas_particulares"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                  <Label
                    htmlFor="aulas_particulares"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Aulas Particulares
                  </Label>
                </div>
              )}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selecione os tipos de aula que o aluno irá frequentar. É possível selecionar ambos.
          </p>
        </div>
      </div>
      
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <StudentSelectField
            value={field.value}
            label="Status"
            options={[
              { value: "Ativo", label: "Ativo" },
              { value: "Inativo", label: "Inativo" },
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

