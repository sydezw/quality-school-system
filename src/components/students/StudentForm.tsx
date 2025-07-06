import React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from "@/components/ui/form";
import { studentFormSchema, StudentFormValues } from '@/lib/validators/student';
import { useResponsibles } from '@/hooks/useResponsibles';
import { formatCPF, formatCEP } from '@/utils/formatters';
import { format } from "date-fns";
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AcademicFields from './AcademicFields';
import ResponsibleField from './ResponsibleField';
import FormActions from './FormActions';
import { useToast } from "@/hooks/use-toast"; // para feedback de erro no submit
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
      idioma: 'none', // Padrão: sem idioma
      turma_id: 'none', // Padrão: sem turma
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
        nome: editingStudent.nome,
        cpf: editingStudent.cpf ? formatCPF(editingStudent.cpf) : '',
        telefone: editingStudent.telefone || '',
        email: editingStudent.email || '',
        endereco: editingStudent.endereco || '',
        numero_endereco: editingStudent.numero_endereco || '',
        status: editingStudent.status,
        idioma: editingStudent.idioma,
        turma_id: editingStudent.turma_id ?? 'none',
        responsavel_id: editingStudent.responsavel_id ?? 'none',
        data_nascimento: editingStudent.data_nascimento ? new Date(editingStudent.data_nascimento) : null,
      };

      // Garante que os campos turma_id e responsavel_id nunca sejam 'none' se possuir valor válido
      if (editingStudent.turma_id && editingStudent.turma_id !== 'none') {
        defaultValues.turma_id = editingStudent.turma_id;
      }
      if (editingStudent.responsavel_id && editingStudent.responsavel_id !== 'none') {
        defaultValues.responsavel_id = editingStudent.responsavel_id;
      }

      // Extrair CEP do endereço se existir
      if (editingStudent.endereco) {
        const cepMatch = editingStudent.endereco.match(/\d{5}-?\d{3}/);
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
        idioma: 'none', // Padrão: sem idioma
        turma_id: 'none',
        responsavel_id: 'none',
        status: 'Ativo',
        data_nascimento: null,
      });
    }
  }, [editingStudent, reset]);

  // Novo handleFormSubmit com mensagens de erro apropriadas
  const handleFormSubmit = (data: StudentFormValues) => {
    // Se houver algum erro de validação, mostrar toast e impedir envio
    if (!form.formState.isValid) {
      const errorFields = Object.entries(form.formState.errors).map(([key, err]: any) => err?.message).filter(Boolean);
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
      cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
      idioma: data.idioma === 'none' ? null : data.idioma,
      responsavel_id: data.responsavel_id === 'none' || !data.responsavel_id ? null : data.responsavel_id,
      turma_id: data.turma_id === 'none' || !data.turma_id ? null : data.turma_id,
      data_nascimento: data.data_nascimento ? format(data.data_nascimento, 'yyyy-MM-dd') : null,
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
        noValidate
      >
        <PersonalInfoFields control={form.control} />
        <AddressFields control={form.control} setValue={setValue} />
        <AcademicFields
          control={form.control}
          classes={classes}
          selectedIdioma={selectedIdioma}
        />
        <ResponsibleField
          control={form.control}
          responsibles={responsibles}
          saveResponsible={saveResponsible}
        />
        <FormActions
          editingStudent={editingStudent}
          isSubmitting={form.formState.isSubmitting}
          onCancel={onCancel}
        />
        {/* Mostra erro geral abaixo dos botões se houver */}
        {formState.isSubmitted && !formState.isValid && (
          <div className="text-red-600 text-sm font-bold mt-2">
            {Object.values(formState.errors).map((err: any) => err?.message).filter(Boolean).join(" — ") ||
              "Preencha todos os campos obrigatórios antes de salvar."}
          </div>
        )}
      </form>
    </Form>
  );
};

export default StudentForm;
