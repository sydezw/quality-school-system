import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { studentFormSchema, StudentFormValues } from '@/lib/validators/student';
import { useResponsibles } from '@/hooks/useResponsibles';
import { formatCPF, formatCEP } from '@/utils/formatters';
import { format } from "date-fns";
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AcademicFields from './AcademicFields';
import ResponsibleField from './ResponsibleField';
import { useToast } from "@/hooks/use-toast";
import { Student } from '@/integrations/supabase/types';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
}

interface StudentFormProps {
  editingStudent: Student | null;
  classes: Class[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const StudentForm = ({ editingStudent, classes, onSubmit, onCancel }: StudentFormProps) => {
  const { responsibles, saveResponsible } = useResponsibles();
  const { toast } = useToast();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      cep: '',
      endereco: '',
      numero_endereco: '',
      idioma: 'none',
      turma_id: 'none',
      responsavel_id: 'none',
      status: 'Ativo',
      data_nascimento: null,
    },
  });

  const { reset, watch, setValue, handleSubmit, formState } = form;
  const selectedIdioma = watch('idioma');

  useEffect(() => {
    if (editingStudent) {
      const defaultValues: Partial<StudentFormValues> = {
        nome: editingStudent.nome || '',
        cpf: editingStudent.cpf ? formatCPF(editingStudent.cpf) : '',
        telefone: editingStudent.telefone || '',
        email: editingStudent.email || '',
        endereco: editingStudent.endereco || '',
        numero_endereco: editingStudent.numero_endereco || '',
        status: editingStudent.status || 'Ativo',
        idioma: editingStudent.idioma || 'none',
        turma_id: editingStudent.turma_id || 'none',
        responsavel_id: editingStudent.responsavel_id || 'none',
        data_nascimento: editingStudent.data_nascimento ? new Date(editingStudent.data_nascimento) : null,
      };

      if (editingStudent.endereco) {
        const cepMatch = editingStudent.endereco.match(/\\d{5}-?\\d{3}/);
        if (cepMatch) {
          defaultValues.cep = formatCEP(cepMatch[0]);
        }
      }

      reset(defaultValues as StudentFormValues);
    } else {
      reset({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        cep: '',
        endereco: '',
        numero_endereco: '',
        idioma: 'none',
        turma_id: 'none',
        responsavel_id: 'none',
        status: 'Ativo',
        data_nascimento: null,
      });
    }
  }, [editingStudent, reset]);

  const handleFormSubmit = (data: StudentFormValues) => {
    try {
      if (!form.formState.isValid) {
        const errorFields = Object.entries(form.formState.errors)
          .map(([key, err]: any) => err?.message)
          .filter(Boolean);
        const mainError = errorFields[0] || "Preencha todos os campos obrigatórios antes de salvar.";
        
        toast({
          title: "Erro ao salvar",
          description: mainError,
          variant: "destructive",
        });
        return;
      }

      const { cep, ...rest } = data;
      const submitData = {
        ...rest,
        cpf: data.cpf ? data.cpf.replace(/\\D/g, '') : null,
        idioma: data.idioma === 'none' ? null : data.idioma,
        responsavel_id: data.responsavel_id === 'none' || !data.responsavel_id ? null : data.responsavel_id,
        turma_id: data.turma_id === 'none' || !data.turma_id ? null : data.turma_id,
        data_nascimento: data.data_nascimento ? format(data.data_nascimento, 'yyyy-MM-dd') : null,
      };
      
      onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o formulário. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PersonalInfoFields control={form.control} />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressFields control={form.control} setValue={setValue} />
            </div>
          </div>

          {/* Informações Acadêmicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Acadêmicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AcademicFields
                control={form.control}
                classes={classes}
                selectedIdioma={selectedIdioma}
              />
            </div>
          </div>

          {/* Responsável */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Responsável</h3>
            <ResponsibleField
              control={form.control}
              responsibles={responsibles}
              saveResponsible={saveResponsible}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? 'Salvando...' : (editingStudent ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>

          {/* Erro geral */}
          {formState.isSubmitted && !formState.isValid && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded text-sm">
              {Object.values(formState.errors)
                .map((err: any) => err?.message)
                .filter(Boolean)
                .join(" — ") ||
                "Preencha todos os campos obrigatórios antes de salvar."}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default StudentForm;
