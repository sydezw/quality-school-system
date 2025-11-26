import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useResponsibles } from '@/hooks/useResponsibles';
import { formatCPF, formatCEP } from '@/utils/formatters';
import { studentFormSchema, StudentFormValues } from '@/lib/validators/student';
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AcademicFields from './AcademicFields';
import ResponsibleField from './ResponsibleField';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel?: string;
}

interface NewStudentFormProps {
  classes: Class[];
  onSubmit: (data: StudentFormValues) => void;
  onCancel: () => void;
  onCloseWithPrivateClasses?: () => void;
}

const NewStudentForm = ({ classes, onSubmit, onCancel, onCloseWithPrivateClasses }: NewStudentFormProps): JSX.Element => {
  const { toast } = useToast();
  const { responsibles, saveResponsible } = useResponsibles();
  const [selectedIdioma, setSelectedIdioma] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      data_nascimento: null,
      telefone: '',
      email: '',
      endereco: '',
      numero_endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      idioma: '',
      nivel: '',
      turma_id: '',
      responsavel_id: '',
      status: undefined
    }
  });

  const { handleSubmit, setValue, watch } = form;
  const watchedIdioma = watch('idioma');
  const watchedAulasParticulares = watch('aulas_particulares');

  useEffect(() => {
    setSelectedIdioma(watchedIdioma || '');
  }, [watchedIdioma]);

  // Função personalizada de cancelamento
  const handleCancel = () => {
    if (watchedAulasParticulares && onCloseWithPrivateClasses) {
      onCloseWithPrivateClasses();
    } else {
      onCancel();
    }
  };

  const handleFormSubmit = async (data: StudentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Formatar CPF e CEP antes de enviar
      const formattedData = {
        ...data,
        cpf: data.cpf ? formatCPF(data.cpf) : '',
        cep: data.cep ? formatCEP(data.cep) : ''
      };
      
      // Aguardar o resultado do onSubmit
      await onSubmit(formattedData);
      
      // Só mostrar animação se salvou com sucesso
      setShowSuccessAnimation(true);
      
      toast({
        title: "Sucesso!",
        description: "Aluno cadastrado com sucesso! Você pode continuar configurando o responsável ou fechar o modal.",
      });
      
      // Apenas remover a animação após um tempo, sem navegar automaticamente
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar aluno. Tente novamente.",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-2 py-2" style={{ fontSize: '118%' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header centralizado */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Aluno</h1>
              <p className="text-gray-600 text-sm">Cadastre um novo aluno no sistema</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-lg mx-auto">
            <Progress 
              value={((currentStep + 1) / formSteps.length) * 100} 
              className="h-2 bg-gray-200"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Passo {currentStep + 1} de {formSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / formSteps.length) * 100)}% concluído</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 w-full max-w-6xl flex flex-col items-center z-10">
            {/* Step Navigation - Mais Compacto */}
            <div className="flex justify-center mb-3 w-full overflow-visible">
              <div className="flex items-center space-x-1 bg-white rounded-xl p-1.5 shadow-md border z-20">
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
                        flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-300 relative z-30
                        ${isActive 
                          ? `bg-gradient-to-r ${step.color} text-white shadow-md scale-105` 
                          : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs hidden sm:block">{step.title}</span>
                      {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Card - Muito Maior */}
            <Card className={`
              border-2 ${currentStepData.borderColor} shadow-xl transition-all duration-500
              bg-gradient-to-br from-white to-gray-50 w-full max-w-5xl overflow-visible z-10
            `}>
              <CardHeader className={`${currentStepData.bgColor} border-b-2 ${currentStepData.borderColor} overflow-visible py-3`}>
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
              
              <CardContent className="p-8 overflow-visible">
                <div className="min-h-[500px] flex justify-center w-full overflow-visible">
                  <div className="w-full max-w-4xl overflow-visible">
                    {currentStepData.component}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons - Mais Compacto */}
            <div className="flex justify-center w-full z-10">
              <Card className="border-0 shadow-md bg-white overflow-visible">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 justify-center">
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
                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all duration-200 z-20"
                      >
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md transition-all duration-200 disabled:opacity-50 z-20"
                      >
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar Aluno'}
                        <CheckCircle2 className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewStudentForm;