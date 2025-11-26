import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Award, Clock, Calendar, Globe, BookOpen, GraduationCap, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Material {
  id: string;
  nome: string;
  nivel: string;
  idioma: string;
}

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel?: string;
  dias_da_semana: string;
  horario: string;
  professor_id: string | null;
  materiais_ids?: string[];
  professores?: { nome: string };
  tipo_turma?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  total_aulas?: number | null;
  materiais?: Material[];
}

const TeacherClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  console.log('TeacherClasses - Renderizando componente');
  console.log('TeacherClasses - User:', user);
  console.log('TeacherClasses - Loading:', loading);
  console.log('TeacherClasses - Classes:', classes);
  
  // Criar usuário de teste se não existir
  useEffect(() => {
    if (!user && !loading) {
      console.log('TeacherClasses - Criando usuário de teste');
      const testUser = {
        id: 'test-professor-123',
        nome: 'Professor Teste',
        email: 'professor@teste.com',
        cargo: 'Professor' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('ts_school_session', JSON.stringify({ userId: testUser.id }));
      localStorage.setItem('ts_school_user_data', JSON.stringify(testUser));
      
      // Recarregar a página para aplicar as mudanças
      window.location.reload();
    }
  }, [user, loading]);

  useEffect(() => {
    fetchMyClasses();
  }, [user]);

  const fetchMyClasses = async () => {
    console.log('fetchMyClasses - Iniciando busca');
    console.log('fetchMyClasses - User ID:', user?.id);
    
    try {
      if (!user?.id) {
        console.log('fetchMyClasses - Usuário sem ID, finalizando loading');
        setLoading(false);
        return;
      }

      console.log('fetchMyClasses - Fazendo query no Supabase');
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          professores (nome)
        `)
        .eq('professor_id', user.id)
        .order('nome');

      console.log('fetchMyClasses - Resultado da query:', { data, error });

      if (error) throw error;
      
      // Converter os dados para o formato esperado pelo tipo Class
      const formattedData = data?.map(item => ({
        ...item,
        materiais_ids: Array.isArray(item.materiais_ids) 
          ? item.materiais_ids.map(id => String(id))
          : item.materiais_ids 
            ? [String(item.materiais_ids)]
            : []
      })) || [];
      
      // Buscar materiais para cada turma
      const classesWithMaterials = await Promise.all(
        formattedData.map(async (classItem) => {
          if (classItem.materiais_ids && classItem.materiais_ids.length > 0) {
            const { data: materiaisData } = await supabase
              .from('materiais')
              .select('id, nome, nivel, idioma')
              .in('id', classItem.materiais_ids);
            
            return {
              ...classItem,
              materiais: materiaisData || []
            };
          }
          return {
            ...classItem,
            materiais: []
          };
        })
      );
      
      setClasses(classesWithMaterials);
      console.log('fetchMyClasses - Classes carregadas:', classesWithMaterials);
    } catch (error) {
      console.error('Erro ao buscar minhas turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas turmas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLanguageIcon = (idioma: string) => {
    switch (idioma) {
      case 'Inglês':
        return '🇺🇸';
      case 'Japonês':
        return '🇯🇵';
      default:
        return '🌐';
    }
  };

  const getLanguageColor = (idioma: string) => {
    switch (idioma) {
      case 'Inglês':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Japonês':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Carregando suas turmas...</p>
        </div>
      </div>
    );
  }

  // Design iOS com Human Interface Guidelines
  return (
    <div className={cn(
      "min-h-screen",
      isMobile 
        ? "bg-gradient-to-br from-gray-50 to-gray-100" 
        : "bg-gradient-to-br from-gray-50 to-white"
    )} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      {/* Header com gradiente e melhor hierarquia */}
      <div className="backdrop-blur-md border-b border-gray-200/50 bg-gradient-to-r from-white/95 to-gray-50/95 container-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent tracking-tight">Minhas Turmas</h1>
              <p className="text-gray-600 mt-1 font-medium">Gerencie suas turmas e acompanhe o progresso dos alunos</p>
            </div>

          </div>
        </div>
      </div>

      <div className={cn(
        "max-w-7xl mx-auto",
        isMobile ? "px-4 py-6" : "px-6 py-8"
      )}>
        {/* Painel de informações do professor - Melhorado */}
        <div className={cn(
          "bg-white/95 backdrop-blur-md border border-gray-200/50 mb-8 shadow-md",
          isMobile ? "rounded-xl p-4" : "rounded-2xl p-6"
        )}>
          <div className="flex items-center mb-6">
            <div className="bg-blue-50 p-3 rounded-xl mr-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className={cn(
                "font-bold text-gray-900",
                isMobile ? "text-lg" : "text-xl"
              )}>Informações do Professor</h2>
              <p className="text-gray-600 text-sm mt-1">Dados do seu perfil no sistema</p>
            </div>
          </div>
          
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-3"
          )}>
            <div className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors duration-200">
              <div className="bg-blue-500 p-3 rounded-xl shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Usuário</p>
                <p className="text-gray-900 font-semibold text-sm">{user?.nome || 'Não logado'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-100 hover:bg-green-50 transition-colors duration-200">
              <div className="bg-green-500 p-3 rounded-xl shadow-sm">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Email</p>
                <p className="text-gray-900 font-semibold text-sm">{user?.email || 'Não definido'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:bg-orange-50 transition-colors duration-200">
              <div className="bg-orange-500 p-3 rounded-xl shadow-sm">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Cargo</p>
                <p className="text-gray-900 font-semibold text-sm">{user?.cargo || 'Não definido'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de turmas - Melhorada */}
        <div className={cn(
          "bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-md",
          isMobile ? "rounded-xl p-4" : "rounded-2xl p-6"
        )}>
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center">
               <div className="bg-blue-50 p-3 rounded-xl mr-4">
                 <BookOpen className="h-6 w-6 text-blue-600" />
               </div>
               <div>
                 <h2 className={cn(
                   "font-bold text-gray-900",
                   isMobile ? "text-lg" : "text-xl"
                 )}>Suas Turmas</h2>
                 <p className="text-gray-600 text-sm font-medium">{classes.length} turma{classes.length !== 1 ? 's' : ''} encontrada{classes.length !== 1 ? 's' : ''}</p>
               </div>
             </div>
           </div>
          
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Nenhuma turma encontrada</p>
              <p className="text-gray-400 mt-2">Entre em contato com a administração para verificar suas turmas.</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
            )}>
              {classes.map((classItem) => (
                <div key={classItem.id} className={cn(
                  "bg-white/95 backdrop-blur-md border border-gray-200/50 overflow-hidden transition-all duration-300 shadow-md",
                  "hover:bg-white/100 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                  isMobile ? "rounded-xl" : "rounded-2xl"
                )}>
                  {/* Header do card - Melhorado */}
                  <div className="p-5 bg-gradient-to-r from-gray-50/80 to-gray-100/50 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "p-3 rounded-xl shadow-sm",
                          classItem.idioma === 'Inglês' ? 'bg-red-500' : 'bg-blue-500'
                        )}>
                          <span className="text-xl text-white">{getLanguageIcon(classItem.idioma)}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{classItem.nome}</h3>
                          <p className="text-sm text-gray-600 font-medium">{classItem.idioma}</p>
                        </div>
                      </div>
                      <div className="bg-red-500 px-3 py-2 rounded-lg shadow-sm">
                        <span className="text-xs font-bold text-white">{classItem.tipo_turma || 'Turma'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do card - Melhorado */}
                  <div className={cn(
                    "space-y-4",
                    isMobile ? "p-4" : "p-5"
                  )}>
                    {/* Nível */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Nível</p>
                        <p className="text-sm text-gray-900 font-semibold">{classItem.nivel || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Horário */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Horário</p>
                        <p className="text-sm text-gray-900 font-semibold">{classItem.horario}</p>
                      </div>
                    </div>

                    {/* Dias da semana */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Dias</p>
                        <p className="text-sm text-gray-900 font-semibold">{classItem.dias_da_semana}</p>
                      </div>
                    </div>

                    {/* Materiais */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Materiais</p>
                      </div>
                      
                      {classItem.materiais && classItem.materiais.length > 0 ? (
                        <div className="space-y-2 pl-14">
                          {classItem.materiais.map((material) => (
                            <div key={material.id} className="bg-purple-50/80 rounded-xl p-3 border border-purple-100 hover:bg-purple-50 transition-colors duration-200">
                              <p className="text-sm font-semibold text-gray-900">{material.nome}</p>
                              <p className="text-xs text-purple-600 font-medium">{material.nivel}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 pl-14 font-medium">Nenhum material atribuído</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherClasses;