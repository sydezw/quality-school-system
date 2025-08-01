import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { studentFormSchema, StudentFormValues } from '@/lib/validators/student';
import { useResponsibles } from '@/hooks/useResponsibles';
import { formatCPF, formatCEP } from '@/utils/formatters';
import { format } from "date-fns";
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AcademicFields from './AcademicFields';
import ResponsibleField from './ResponsibleField';
import { useToast } from "@/hooks/use-toast";
interface Student {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  endereco: string;
  numero: string;
  // complemento: string; // REMOVIDO
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  idioma: string;
  nivel: string;
  turma_id: string;
  turma_particular_id?: string;
  responsavel_id: string;
  status: string;
  observacoes: string;
  aulas_particulares?: boolean;
  aulas_turma?: boolean;
}
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Users, 
  Save, 
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
  tipo_turma?: string;
}

interface StudentFormProps {
  editingStudent: Student | null;
  classes: Class[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onCloseWithPrivateClasses?: () => void;
}

const StudentForm = ({ editingStudent, classes, onSubmit, onCancel, onCloseWithPrivateClasses }: StudentFormProps): JSX.Element => {
  const { toast } = useToast();
  const { responsibles, saveResponsible } = useResponsibles();
  const [selectedIdioma, setSelectedIdioma] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      data_nascimento: null as Date | null,
      telefone: '',
      email: '',
      endereco: '',
      numero_endereco: '',
      // complemento: '', // REMOVIDO
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      idioma: '',
      nivel: 'none',
      turma_id: '',
      turma_particular_id: '',
      responsavel_id: '',
      status: 'Ativo',
      observacoes: '',
      aulas_particulares: false,
      aulas_turma: true // Por padrão, alunos fazem aulas de turma
    }
  });

  const { handleSubmit, formState, setValue, watch } = form;

  // Watch para mudanças no idioma e aulas particulares
  const watchedIdioma = watch('idioma');
  const watchedAulasParticulares = watch('aulas_particulares');

  // Função personalizada de cancelamento
  const handleCancel = () => {
    if (watchedAulasParticulares && onCloseWithPrivateClasses) {
      onCloseWithPrivateClasses();
    } else {
      onCancel();
    }
  };
  
  useEffect(() => {
    setSelectedIdioma(watchedIdioma || '');
  }, [watchedIdioma]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingStudent) {
      const formattedDate = editingStudent.data_nascimento 
        ? format(new Date(editingStudent.data_nascimento), 'yyyy-MM-dd')
        : '';
      
      form.reset({
        nome: editingStudent.nome || '',
        cpf: editingStudent.cpf || '',
        data_nascimento: editingStudent.data_nascimento 
          ? new Date(editingStudent.data_nascimento)
          : null,
        telefone: editingStudent.telefone || '',
        email: editingStudent.email || '',
        endereco: editingStudent.endereco || '',
        numero_endereco: editingStudent.numero || '',
        bairro: editingStudent.bairro || '',
        cidade: editingStudent.cidade || '',
        estado: editingStudent.estado || '',
        cep: editingStudent.cep || '',
        idioma: editingStudent.idioma || '',
        nivel: editingStudent.nivel || 'none',
        turma_id: editingStudent.turma_id || '',
        responsavel_id: editingStudent.responsavel_id || '',
        status: (editingStudent.status as "Ativo" | "Inativo" | "Suspenso") || 'Ativo',
        observacoes: editingStudent.observacoes || '',
        aulas_particulares: editingStudent.aulas_particulares || false,
        aulas_turma: editingStudent.aulas_turma !== undefined ? editingStudent.aulas_turma : true
      });
      
      setSelectedIdioma(editingStudent.idioma || '');
    }
  }, [editingStudent, form]);

  // Preencher formulário quando editingStudent mudar
  useEffect(() => {
    if (editingStudent) {
      const formattedDate = editingStudent.data_nascimento 
        ? new Date(editingStudent.data_nascimento + 'T00:00:00') 
        : null;
  
      setValue('nome', editingStudent.nome || '');
      setValue('cpf', editingStudent.cpf || '');
      setValue('data_nascimento', formattedDate);
      setValue('telefone', editingStudent.telefone || '');
      setValue('email', editingStudent.email || '');
      setValue('endereco', editingStudent.endereco || '');
      setValue('numero_endereco', editingStudent.numero || ''); // Mapear numero para numero_endereco
      setValue('idioma', editingStudent.idioma || '');
      setValue('nivel', editingStudent.nivel || 'none'); // Adicionando campo nivel
      setValue('turma_id', editingStudent.turma_id || '');
      setValue('responsavel_id', editingStudent.responsavel_id || '');
      setValue('status', (editingStudent.status as "Ativo" | "Inativo" | "Suspenso" | "Trancado") || 'Ativo');
      setValue('aulas_particulares', editingStudent.aulas_particulares || false);
      setValue('aulas_turma', editingStudent.aulas_turma !== undefined ? editingStudent.aulas_turma : true);
      
      setSelectedIdioma(editingStudent.idioma || '');
    }
  }, [editingStudent, setValue]);

  const handleFormSubmit = async (data: StudentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Formatar CPF e CEP antes de enviar
      const formattedData = {
        ...data,
        cpf: data.cpf ? formatCPF(data.cpf) : '',
        cep: data.cep ? formatCEP(data.cep) : '',
        numero_endereco: data.numero_endereco || '' // Ensure the address number is sent
      };
      
      await onSubmit(formattedData);
      
      // Mostrar mensagem de sucesso sem fechar automaticamente
      toast({
        title: "Sucesso!",
        description: "Aluno atualizado com sucesso! Você pode continuar editando ou fechar o modal.",
      });
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o aluno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formSteps = [
    {
      id: 'personal',
      title: 'Dados Pessoais',
      description: 'Informações básicas do aluno',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      component: <PersonalInfoFields control={form.control} />
    },
    {
      id: 'address',
      title: 'Endereço',
      description: 'Localização e contato',
      icon: MapPin,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      component: <AddressFields control={form.control} setValue={setValue} />
    },
    {
      id: 'academic',
      title: 'Dados Acadêmicos',
      description: 'Curso e informações escolares',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      component: (
        <AcademicFields
          control={form.control}
          classes={classes}
          selectedIdioma={selectedIdioma}
          setValue={form.setValue}
        />
      )
    },
    {
      id: 'responsible',
      title: 'Responsável',
      description: 'Dados do responsável pelo aluno',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      component: (
        <ResponsibleField
          control={form.control}
          responsibles={responsibles}
          saveResponsible={saveResponsible}
        />
      )
    }
  ];

  const currentStepData = formSteps[currentStep];
  const progress = ((currentStep + 1) / formSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-4 overflow-visible">
      <div className="container mx-auto px-4 w-full max-w-4xl flex flex-col items-center justify-center">
        {/* Header Centralizado - Mais Compacto */}
        <div className="text-center mb-6 w-full max-w-2xl z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 visible">
            {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto px-4 visible">
            {editingStudent 
              ? 'Atualize as informações do aluno de forma rápida e organizada'
              : 'Cadastre um novo aluno seguindo os passos organizados abaixo'
            }
          </p>
          
          {/* Progress Bar - Mais Compacto */}
          <div className="mt-4 max-w-md mx-auto px-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">Progresso</span>
              <span className="text-xs font-medium text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 w-full max-w-3xl flex flex-col items-center z-10">
            {/* Step Navigation - Mais Compacto */}
            <div className="flex justify-center mb-4 w-full overflow-visible">
              <div className="flex items-center space-x-2 bg-white rounded-xl p-2 shadow-md border z-20">
                {formSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = completedSteps.includes(index);
                  
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => goToStep(index)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 relative z-30
                        ${isActive 
                          ? `bg-gradient-to-r ${step.color} text-white shadow-md scale-105` 
                          : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium text-xs hidden sm:block">{step.title}</span>
                      {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Card - Mais Compacto */}
            <Card className={`
              border-2 ${currentStepData.borderColor} shadow-xl transition-all duration-500
              bg-gradient-to-br from-white to-gray-50 w-full max-w-2xl overflow-visible z-10
            `}>
              <CardHeader className={`${currentStepData.bgColor} border-b-2 ${currentStepData.borderColor} overflow-visible py-4`}>
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${currentStepData.color} text-white shadow-md z-20`}>
                      <currentStepData.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 visible">
                        {currentStepData.title}
                      </CardTitle>
                      <p className="text-gray-600 text-xs mt-0.5 visible">{currentStepData.description}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="px-2 py-1 text-xs font-semibold z-20"
                  >
                    {currentStep + 1} de {formSteps.length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 overflow-visible">
                <div className="min-h-[300px] flex justify-center w-full overflow-visible">
                  <div className="w-full max-w-xl overflow-visible">
                    {currentStepData.component}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons - Mais Compacto */}
            <div className="flex justify-center w-full z-10">
              <Card className="border-0 shadow-md bg-white overflow-visible">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 z-20"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-50 z-20"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>

                    {currentStep < formSteps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className={`px-4 py-2 text-sm font-medium bg-gradient-to-r ${currentStepData.color} hover:shadow-md transition-all duration-200 z-20`}
                      >
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg z-20"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            {editingStudent ? 'Atualizar Aluno' : 'Salvar Aluno'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Display - Mais Compacto */}
            {formState.isSubmitted && !formState.isValid && (
              <Card className="border-red-200 bg-red-50 max-w-xl mx-auto w-full overflow-visible z-10">
                <CardContent className="pt-4 px-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1 text-sm visible">Erro de Validação</h4>
                      <div className="text-xs text-red-700 space-y-1">
                        {Object.entries(formState.errors).map(([field, error]) => (
                          <div key={field} className="flex items-center gap-1 visible">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {error?.message || `Campo ${field} é obrigatório`}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Indicator - Mais Compacto */}
            {formState.isValid && formState.isSubmitted && !isSubmitting && (
              <Card className="border-green-200 bg-green-50 max-w-xl mx-auto w-full overflow-visible z-10">
                <CardContent className="pt-4 px-4">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-green-800 visible">
                      Formulário válido e pronto para envio
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default StudentForm;
