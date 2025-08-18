
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift, PartyPopper, Phone, Mail, GraduationCap, Calendar, Sparkles, Heart, Clock, Star, Zap, Crown, Confetti } from "lucide-react";
import { toast } from "sonner";
import "@/styles/birthdays-animations.css";

interface Student {
  id: string;
  nome: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  turma: string | null;
}

const getCurrentMonthName = () => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[new Date().getMonth()];
};

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Nova função: Calcula quantos anos a pessoa VAI FAZER no aniversário deste ano
const calculateBirthdayAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const currentYear = today.getFullYear();
  
  // A idade que a pessoa vai completar é sempre o ano atual menos o ano de nascimento
  return currentYear - birth.getFullYear();
};

const isTodayBirthday = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Usar UTC para datas do banco para evitar problemas de timezone
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const birthDay = birth.getUTCDate();
  const birthMonth = birth.getUTCMonth();
  
  return todayDay === birthDay && todayMonth === birthMonth;
};

const getDaysUntilBirthday = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const thisYear = today.getFullYear();
  
  // Set birthday to this year
  const birthdayThisYear = new Date(thisYear, birth.getMonth(), birth.getDate());
  
  // If birthday already passed this year, calculate for next year
  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(thisYear + 1);
  }
  
  const diffTime = birthdayThisYear.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getNextBirthdayInMonth = (students: Student[]) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  
  // Filter students with birthdays in current month
  const monthBirthdays = students.filter(student => {
    if (!student.data_nascimento) return false;
    const birthDate = new Date(student.data_nascimento);
    return birthDate.getMonth() === currentMonth;
  });
  
  if (monthBirthdays.length === 0) return null;
  
  // Find the next birthday (including today)
  const nextBirthday = monthBirthdays
    .map(student => ({
      ...student,
      daysUntil: getDaysUntilBirthday(student.data_nascimento!)
    }))
    .filter(student => student.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)[0];
  
  return nextBirthday || null;
};

export default function Birthdays() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      try {
        // Buscar alunos com data de nascimento e que estejam ativos
        const { data: alunosData, error: alunosError } = await supabase
          .from("alunos")
          .select(`
            id, nome, data_nascimento, telefone, email, turma_id
          `)
          .filter("data_nascimento", "not.is", null)
          .eq("status", "ativo");

        if (alunosError) {
          console.error("Erro ao buscar alunos:", alunosError);
          toast.error("Erro ao carregar aniversariantes");
          setLoading(false);
          return;
        }

        // Buscar informações das turmas
        const turmaIds = alunosData
          ?.filter(aluno => aluno.turma_id)
          .map(aluno => aluno.turma_id) || [];

        let turmasData: any[] = [];
        if (turmaIds.length > 0) {
          const { data: turmasResult, error: turmasError } = await supabase
            .from("turmas")
            .select("id, nome")
            .in("id", turmaIds);

          if (!turmasError) {
            turmasData = turmasResult || [];
          }
        }

        // Filtra no front apenas aniversariantes do mês atual
        const now = new Date();
        const currentMonth = now.getMonth() + 1;

        const result = (alunosData as any[])
          .filter((aluno) => {
            if (!aluno.data_nascimento) return false;
            const month = Number(aluno.data_nascimento.split("-")[1]);
            return month === currentMonth;
          })
          .map((aluno) => {
            const turma = turmasData.find(t => t.id === aluno.turma_id);
            return {
              id: aluno.id,
              nome: aluno.nome,
              data_nascimento: aluno.data_nascimento,
              telefone: aluno.telefone,
              email: aluno.email,
              turma: turma ? turma.nome : null,
            };
          })
          .sort((a, b) => {
            // Ordena por dia do aniversário
            const dayA = Number(a.data_nascimento?.split("-")[2] || 0);
            const dayB = Number(b.data_nascimento?.split("-")[2] || 0);
            return dayA - dayB;
          });

        setStudents(result);
      } catch (error) {
        console.error("Erro inesperado:", error);
        toast.error("Erro inesperado ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground animate-pulse">Carregando aniversariantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 confetti-bg">
      {/* Header Section - Melhorado com design mais atraente */}
      <div className="text-center space-y-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-brand-red/15 to-pink-200 rounded-full animate-float shadow-lg">
            <PartyPopper className="h-10 w-10 text-brand-red animate-bounce-in" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-brand-red via-pink-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up flex items-center justify-center gap-3">
              <Cake className="h-10 w-10 text-brand-red" />
              Aniversariantes de {getCurrentMonthName()}
            </h1>
            <p className="text-lg text-muted-foreground mt-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Momentos especiais que merecem ser celebrados!
            </p>
          </div>
          <div className="p-4 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full animate-float shadow-lg" style={{animationDelay: '1s'}}>
            <Gift className="h-10 w-10 text-pink-600 animate-bounce-in" />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="secondary" className="text-lg px-6 py-3 bg-gradient-to-r from-brand-red/15 to-pink-200 text-brand-red border-brand-red/30 shadow-md animate-glow">
            <Cake className="h-5 w-5 mr-2" />
            {students.length} {students.length === 1 ? 'aniversariante' : 'aniversariantes'}
          </Badge>
          {students.filter(s => s.data_nascimento && isTodayBirthday(s.data_nascimento)).length > 0 && (
            <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-700 text-white shadow-md animate-pulse">
              <Sparkles className="h-5 w-5 mr-2" />
              {students.filter(s => s.data_nascimento && isTodayBirthday(s.data_nascimento)).length} hoje!
            </Badge>
          )}
          
          {/* Badge para aniversários de hoje */}
          {(() => {
            const todayBirthdays = students.filter(student => 
              student.data_nascimento && isTodayBirthday(student.data_nascimento)
            );
            
            if (todayBirthdays.length > 0) {
              return (
                <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                  <Cake className="h-5 w-5 mr-2 animate-bounce" />
                  {todayBirthdays.length === 1 
                    ? `${todayBirthdays[0].nome} faz aniversário HOJE!`
                    : `${todayBirthdays.length} pessoas fazem aniversário HOJE!`
                  }
                </Badge>
              );
            }
            
            // Se não há aniversários hoje, mostra o próximo
            const nextBirthday = getNextBirthdayInMonth(students);
            if (nextBirthday) {
              return (
                <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                  <Clock className="h-5 w-5 mr-2 animate-pulse" />
                  Próximo: {nextBirthday.nome} em {nextBirthday.daysUntil} {nextBirthday.daysUntil === 1 ? 'dia' : 'dias'}
                </Badge>
              );
            }
            return null;
          })()}
        </div>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Celebre conosco os momentos especiais dos nossos queridos alunos! Cada aniversário é uma nova página na jornada de aprendizado e crescimento. <PartyPopper className="inline h-5 w-5" /><Sparkles className="inline h-5 w-5" />
          </p>
        </div>
      </div>

      {/* Birthday Cards Grid - Design completamente reformulado */}
      {students.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-float">
              <Calendar className="h-16 w-16 text-gray-500" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-gray-600">Nenhum aniversariante este mês</h3>
              <p className="text-gray-500 text-lg max-w-lg leading-relaxed flex items-center justify-center gap-2">
                Não há aniversários registrados para {getCurrentMonthName()}. 
                <Calendar className="h-5 w-5 text-gray-400" />
              </p>
              <p className="text-sm text-gray-400 max-w-md flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 text-gray-400" />
                Dica: Verifique se todas as datas de nascimento estão atualizadas no cadastro dos alunos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {students.map((student, index) => {
            const birthDay = student.data_nascimento ? Number(student.data_nascimento.split("-")[2]) : 0;
            const age = student.data_nascimento ? calculateBirthdayAge(student.data_nascimento) : 0;
            const daysUntil = student.data_nascimento ? getDaysUntilBirthday(student.data_nascimento) : 0;
            const isToday = student.data_nascimento ? isTodayBirthday(student.data_nascimento) : false;
            const isSoon = daysUntil <= 7 && daysUntil > 0;
            const isThisWeek = daysUntil <= 3 && daysUntil > 0;
            
            return (
              <Card 
                key={student.id} 
                className={`birthday-card group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                  isToday 
                    ? 'ring-4 ring-purple-500 shadow-2xl bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 animate-glow border-4 border-purple-400' 
                    : isThisWeek
                    ? 'ring-2 ring-brand-red/50 shadow-xl bg-gradient-to-br from-brand-red/8 to-pink-100'
                    : isSoon 
                    ? 'ring-1 ring-brand-red/30 bg-gradient-to-br from-brand-red/5 to-pink-50'
                    : 'hover:ring-2 hover:ring-brand-red/40 bg-gradient-to-br from-white to-gray-50'
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Decorative Elements - Melhorados */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-red/15 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-pink-200/60 to-transparent rounded-tr-full" />
                {isToday && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/40 via-purple-200/40 to-indigo-200/40 pointer-events-none" />
                )}
                
                {/* Floating decorative elements */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-float" style={{animationDelay: '0.5s'}} />
                <div className="absolute bottom-4 right-6 w-2 h-2 bg-brand-red/40 rounded-full opacity-70 animate-float" style={{animationDelay: '1.2s'}} />
                
                {isToday && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-700 text-white animate-pulse shadow-lg border-2 border-purple-300 relative overflow-hidden">
                      <PartyPopper className="h-4 w-4 mr-1 animate-bounce" />
                      <Crown className="h-4 w-4 mr-1" />
                      HOJE!
                      {/* Confetes animados */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0s'}} />
                        <div className="absolute top-2 right-3 w-1 h-1 bg-purple-200 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
                        <div className="absolute bottom-2 left-4 w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{animationDelay: '1s'}} />
                        <div className="absolute bottom-1 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '1.5s'}} />
                      </div>
                    </Badge>
                  </div>
                )}
                
                {isThisWeek && !isToday && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-gradient-to-r from-brand-red to-pink-600 text-white shadow-md animate-pulse">
                      <Heart className="h-3 w-3 mr-1" />
                      {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
                    </Badge>
                  </div>
                )}
                
                {isSoon && !isThisWeek && !isToday && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="outline" className="border-brand-red text-brand-red bg-white/80 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Em {daysUntil} dias
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-full group-hover:scale-125 transition-all duration-500 birthday-icon ${
                        isToday 
                          ? 'bg-gradient-to-br from-yellow-200 to-orange-300 shadow-lg' 
                          : 'bg-gradient-to-br from-brand-red/15 to-pink-200'
                      }`}>
                        <Cake className={`h-7 w-7 ${
                          isToday ? 'text-orange-600' : 'text-brand-red'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-xl font-bold transition-colors duration-300 ${
                          isToday 
                            ? 'text-orange-700 group-hover:text-orange-800' 
                            : 'text-foreground group-hover:text-brand-red'
                        }`}>
                          {student.nome}
                        </CardTitle>
                        <p className={`text-base font-medium flex items-center gap-2 ${
                          isToday 
                            ? 'text-orange-600' 
                            : 'text-muted-foreground'
                        }`}>
                          Fará {age} {age === 1 ? 'ano' : 'anos'} 
                          <Gift className="h-4 w-4" />
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 relative z-10">
                  {/* Birthday Date - Design melhorado */}
                  <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isToday 
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300' 
                      : 'bg-gradient-to-r from-brand-red/8 to-pink-100 hover:from-brand-red/12 hover:to-pink-150'
                  }`}>
                    <Calendar className={`h-6 w-6 ${
                      isToday ? 'text-orange-600' : 'text-brand-red'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${
                        isToday ? 'text-orange-700' : 'text-brand-red'
                      }`}>
                        {birthDay} de {getCurrentMonthName()}
                      </p>
                      <p className={`text-sm font-medium flex items-center gap-2 ${
                        isToday 
                          ? 'text-orange-600' 
                          : isThisWeek 
                          ? 'text-brand-red' 
                          : 'text-muted-foreground'
                      }`}>
                        {isToday 
                          ? (
                            <>
                              <PartyPopper className="h-4 w-4" />
                              ANIVERSÁRIO HOJE! 
                              <Cake className="h-4 w-4" />
                            </>
                          )
                          : isThisWeek 
                          ? (
                            <>
                              <Star className="h-4 w-4" />
                              Faltam apenas {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}!
                            </>
                          )
                          : isSoon 
                          ? (
                            <>
                              <Calendar className="h-4 w-4" />
                              Faltam {daysUntil} dias
                            </>
                          )
                          : (
                            <>
                              <Calendar className="h-4 w-4" />
                              Este mês
                            </>
                          )
                        }
                      </p>
                    </div>
                  </div>

                  {/* Class Info - Design melhorado */}
                  {student.turma && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 hover:border-blue-300/70 transition-colors">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">{student.turma}</span>
                    </div>
                  )}

                  {/* Contact Info - Design melhorado */}
                  <div className="space-y-3">
                    {student.telefone && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{student.telefone}</span>
                      </div>
                    )}
                    {student.email && (
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 truncate">{student.email}</span>
                      </div>
                    )}
                    {!student.telefone && !student.email && (
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-xs text-gray-500 italic text-center flex items-center justify-center gap-2">
                          <Phone className="h-3 w-3" />
                          Sem informações de contato
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
