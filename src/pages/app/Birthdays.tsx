
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift, PartyPopper, Phone, Mail, GraduationCap, Calendar } from "lucide-react";
import { toast } from "sonner";

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

export default function Birthdays() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("alunos")
          .select(`
            id, nome, data_nascimento, telefone, email, turma_id,
            turmas (nome)
          `)
          .filter("data_nascimento", "not.is", null);

        if (error) {
          toast.error("Erro ao carregar aniversariantes");
          setLoading(false);
          return;
        }

        // Filtra no front apenas aniversariantes do mês atual
        const now = new Date();
        const currentMonth = now.getMonth() + 1;

        const result = (data as any[])
          .filter((aluno) => {
            if (!aluno.data_nascimento) return false;
            const month = Number(aluno.data_nascimento.split("-")[1]);
            return month === currentMonth;
          })
          .map((aluno) => ({
            id: aluno.id,
            nome: aluno.nome,
            data_nascimento: aluno.data_nascimento,
            telefone: aluno.telefone,
            email: aluno.email,
            turma: aluno.turmas ? aluno.turmas.nome : null,
          }))
          .sort((a, b) => {
            // Ordena por dia do aniversário
            const dayA = Number(a.data_nascimento?.split("-")[2] || 0);
            const dayB = Number(b.data_nascimento?.split("-")[2] || 0);
            return dayA - dayB;
          });

        setStudents(result);
      } catch (error) {
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-brand-red/10 to-pink-100 rounded-full">
            <PartyPopper className="h-8 w-8 text-brand-red" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-red to-pink-600 bg-clip-text text-transparent">
            Aniversariantes de {getCurrentMonthName()}
          </h1>
          <div className="p-3 bg-gradient-to-br from-brand-red/10 to-pink-100 rounded-full">
            <Gift className="h-8 w-8 text-brand-red" />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-brand-red/10 to-pink-100 text-brand-red border-brand-red/20">
            <Cake className="h-4 w-4 mr-2" />
            {students.length} {students.length === 1 ? 'aniversariante' : 'aniversariantes'}
          </Badge>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Celebre conosco os momentos especiais dos nossos queridos alunos! 🎉
        </p>
      </div>

      {/* Birthday Cards Grid */}
      {students.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground">Nenhum aniversariante este mês</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Não há aniversários registrados para {getCurrentMonthName()}. Que tal verificar se todas as datas de nascimento estão atualizadas?
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student, index) => {
            const birthDay = student.data_nascimento ? Number(student.data_nascimento.split("-")[2]) : 0;
            const age = student.data_nascimento ? calculateBirthdayAge(student.data_nascimento) : 0; // MUDANÇA AQUI
            const daysUntil = student.data_nascimento ? getDaysUntilBirthday(student.data_nascimento) : 0;
            const isToday = daysUntil === 0;
            const isSoon = daysUntil <= 7 && daysUntil > 0;
            
            return (
              <Card 
                key={student.id} 
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isToday 
                    ? 'ring-2 ring-brand-red shadow-lg bg-gradient-to-br from-brand-red/5 to-pink-50' 
                    : isSoon 
                    ? 'ring-1 ring-brand-red/30 bg-gradient-to-br from-brand-red/2 to-pink-25'
                    : 'hover:ring-1 hover:ring-brand-red/20'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-red/10 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-100/50 to-transparent rounded-tr-full" />
                
                {isToday && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-brand-red text-white animate-pulse">
                      <PartyPopper className="h-3 w-3 mr-1" />
                      Hoje!
                    </Badge>
                  </div>
                )}
                
                {isSoon && !isToday && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="border-brand-red text-brand-red">
                      Em {daysUntil} {daysUntil === 1 ? 'dia' : 'dias'}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-brand-red/10 to-pink-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Cake className="h-6 w-6 text-brand-red" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground group-hover:text-brand-red transition-colors">
                          {student.nome}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {age} {age === 1 ? 'ano' : 'anos'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Birthday Date */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand-red/5 to-pink-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-brand-red" />
                    <div>
                      <p className="font-semibold text-brand-red">
                        {birthDay} de {getCurrentMonthName()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isToday ? '🎉 Aniversário hoje!' : isSoon ? `Faltam ${daysUntil} dias` : 'Este mês'}
                      </p>
                    </div>
                  </div>

                  {/* Class Info */}
                  {student.turma && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{student.turma}</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2">
                    {student.telefone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{student.telefone}</span>
                      </div>
                    )}
                    {student.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    )}
                    {!student.telefone && !student.email && (
                      <p className="text-xs text-muted-foreground italic">Sem informações de contato</p>
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
