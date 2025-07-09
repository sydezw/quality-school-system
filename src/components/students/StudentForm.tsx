import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from "@/components/ui/form";
import { studentFormSchema, StudentFormValues } from '@/lib/validators/student';
import { useResponsibles } from '@/hooks/useResponsibles';
import { formatCPF, formatCEP } from '@/utils/formatters';
import { format } from "date-fns";
import { motion, Variants } from 'framer-motion';
import { User, MapPin, GraduationCap, Users, Save, X } from 'lucide-react';
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AcademicFields from './AcademicFields';
import ResponsibleField from './ResponsibleField';
import { useToast } from "@/hooks/use-toast";
import { Student } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

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

// Componente reutilizável para seções do formulário
interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

const FormSection = ({ title, icon, children, delay = 0 }: FormSectionProps) => {
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay * 0.1,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="group w-full"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-gray-300">
        {/* Header com gradiente cinza para preto */}
        <div className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 px-6 py-3 border-b border-gray-300">
          <div className="flex items-center gap-3 text-white">
            <div className="p-1.5 bg-white/15 rounded-md backdrop-blur-sm">
              {icon}
            </div>
            <h3 className="text-base font-medium tracking-wide">{title}</h3>
          </div>
        </div>
        
        {/* Conteúdo com fundo sutil */}
        <div className="bg-gradient-to-br from-gray-50/50 to-white">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

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
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Título simples */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          {editingStudent ? 'Editar Aluno' : 'Adicionar Aluno'}
        </h1>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Seções empilhadas verticalmente */}
            <div className="space-y-6">
              {/* Informações Pessoais */}
              <FormSection
                title="Informações Pessoais"
                icon={<User className="h-5 w-5" />}
                delay={0}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                  <PersonalInfoFields control={form.control} />
                </div>
              </FormSection>

              {/* Endereço */}
              <FormSection
                title="Endereço"
                icon={<MapPin className="h-5 w-5" />}
                delay={1}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                  <AddressFields control={form.control} setValue={setValue} />
                </div>
              </FormSection>

              {/* Informações Acadêmicas */}
              <FormSection
                title="Informações Acadêmicas"
                icon={<GraduationCap className="h-5 w-5" />}
                delay={2}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                  <AcademicFields
                    control={form.control}
                    classes={classes}
                    selectedIdioma={selectedIdioma}
                  />
                </div>
              </FormSection>

              {/* Responsável */}
              <FormSection
                title="Responsável"
                icon={<Users className="h-5 w-5" />}
                delay={3}
              >
                <div className="p-6">
                  <ResponsibleField
                    control={form.control}
                    responsibles={responsibles}
                    saveResponsible={saveResponsible}
                  />
                </div>
              </FormSection>
            </div>

            {/* Ações do Formulário */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-end gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={formState.isSubmitting}
                    className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="submit"
                    disabled={formState.isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    {formState.isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                        />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingStudent ? 'Atualizar' : 'Salvar'} Aluno
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Erro geral */}
            {formState.isSubmitted && !formState.isValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm font-medium"
              >
                {Object.values(formState.errors)
                  .map((err: any) => err?.message)
                  .filter(Boolean)
                  .join(" — ") ||
                  "Preencha todos os campos obrigatórios antes de salvar."}
              </motion.div>
            )}
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default StudentForm;
