import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudentEnrollment {
  id: string;
  aluno_id: string;
  turma_id: string;
  data_matricula: string;
  status: 'ativo' | 'inativo' | 'trancado' | 'concluido';
  observacoes?: string;
  turma?: {
    nome: string;
    idioma: string;
    nivel: string;
    horario: string;
    dias_da_semana: string;
  };
}

interface StudentWithEnrollments {
  id: string;
  nome: string;
  status: string;
  enrollments: StudentEnrollment[];
}

export const useMultipleEnrollments = () => {
  const [students, setStudents] = useState<StudentWithEnrollments[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar alunos com suas múltiplas matrículas
  const fetchStudentsWithEnrollments = async () => {
    setLoading(true);
    try {
      // Como não temos a tabela aluno_turma ainda, vamos simular usando a estrutura atual
      // Buscar todos os alunos
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select(`
          id,
          nome,
          status,
          turma_id,
          aulas_particulares,
          aulas_turma,
          turmas:turma_id (
            id,
            nome,
            idioma,
            nivel,
            horario,
            dias_da_semana
          )
        `)
        .eq('status', 'Ativo')
        .order('nome');

      if (alunosError) throw alunosError;

      // Transformar dados para incluir múltiplas matrículas simuladas
      const studentsWithEnrollments: StudentWithEnrollments[] = (alunosData || []).map(aluno => {
        const enrollments: StudentEnrollment[] = [];
        
        // Se o aluno tem turma regular
        if (aluno.turma_id && aluno.turmas) {
          enrollments.push({
            id: `${aluno.id}-regular`,
            aluno_id: aluno.id,
            turma_id: aluno.turma_id,
            data_matricula: new Date().toISOString(),
            status: 'ativo',
            observacoes: 'Turma regular',
            turma: {
              nome: aluno.turmas.nome,
              idioma: aluno.turmas.idioma,
              nivel: aluno.turmas.nivel,
              horario: aluno.turmas.horario,
              dias_da_semana: aluno.turmas.dias_da_semana
            }
          });
        }

        // Se o aluno tem aulas particulares, simular uma "turma" de aulas particulares
        if (aluno.aulas_particulares) {
          enrollments.push({
            id: `${aluno.id}-particular`,
            aluno_id: aluno.id,
            turma_id: 'particular',
            data_matricula: new Date().toISOString(),
            status: 'ativo',
            observacoes: 'Aulas particulares',
            turma: {
              nome: 'Aulas Particulares',
              idioma: 'Variado',
              nivel: 'Personalizado',
              horario: 'Flexível',
              dias_da_semana: 'Agendamento'
            }
          });
        }

        return {
          id: aluno.id,
          nome: aluno.nome,
          status: aluno.status,
          enrollments
        };
      });

      setStudents(studentsWithEnrollments);
    } catch (error) {
      console.error('Erro ao buscar alunos com matrículas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar aluno a uma turma (permitindo múltiplas matrículas)
  const addStudentToClass = async (studentId: string, classId: string, observacoes?: string) => {
    try {
      // Verificar se o aluno já está na turma
      const { data: existingStudent, error: checkError } = await supabase
        .from('alunos')
        .select('turma_id, aulas_particulares, aulas_turma')
        .eq('id', studentId)
        .single();

      if (checkError) throw checkError;

      // Verificar limite de alunos na turma (apenas para turmas regulares)
      if (classId !== 'particular') {
        const { data: currentStudents, error: countError } = await supabase
          .from('alunos')
          .select('id')
          .eq('turma_id', classId)
          .eq('status', 'Ativo');

        if (countError) throw countError;

        const currentCount = currentStudents?.length || 0;
        if (currentCount >= 10) {
          throw new Error('Esta turma já possui o máximo de 10 alunos.');
        }
      }

      // Lógica para múltiplas matrículas
      if (classId === 'particular') {
        // Matricular em aulas particulares
        const { error } = await supabase
          .from('alunos')
          .update({ aulas_particulares: true })
          .eq('id', studentId);

        if (error) throw error;
      } else {
        // Matricular em turma regular
        // Se o aluno não tem turma ainda, definir como turma principal
        if (!existingStudent.turma_id) {
          const { error } = await supabase
            .from('alunos')
            .update({ 
              turma_id: classId,
              aulas_turma: true 
            })
            .eq('id', studentId);

          if (error) throw error;
        } else {
          // Se já tem turma, apenas marcar que faz aulas de turma
          const { error } = await supabase
            .from('alunos')
            .update({ aulas_turma: true })
            .eq('id', studentId);

          if (error) throw error;

          // Aqui seria ideal ter uma tabela de relacionamento
          // Por enquanto, vamos apenas permitir uma turma principal + aulas particulares
          toast({
            title: "Aviso",
            description: "Aluno já possui uma turma principal. Para múltiplas turmas regulares, será necessário implementar a tabela de relacionamento.",
            variant: "default",
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Aluno matriculado com sucesso!",
      });

      await fetchStudentsWithEnrollments();
    } catch (error) {
      console.error('Erro ao matricular aluno:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível matricular o aluno.",
        variant: "destructive",
      });
    }
  };

  // Remover aluno de uma turma específica
  const removeStudentFromClass = async (studentId: string, enrollmentType: 'regular' | 'particular') => {
    try {
      if (enrollmentType === 'particular') {
        // Remover das aulas particulares
        const { error } = await supabase
          .from('alunos')
          .update({ aulas_particulares: false })
          .eq('id', studentId);

        if (error) throw error;
      } else {
        // Remover da turma regular
        const { error } = await supabase
          .from('alunos')
          .update({ 
            turma_id: null,
            aulas_turma: false 
          })
          .eq('id', studentId);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Aluno removido da turma com sucesso!",
      });

      await fetchStudentsWithEnrollments();
    } catch (error) {
      console.error('Erro ao remover aluno da turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aluno da turma.",
        variant: "destructive",
      });
    }
  };

  // Verificar conflitos de horário
  const checkScheduleConflict = async (studentId: string, newClassId: string): Promise<boolean> => {
    try {
      // Buscar turmas atuais do aluno
      const { data: student, error } = await supabase
        .from('alunos')
        .select(`
          turma_id,
          turmas:turma_id (
            horario,
            dias_da_semana
          )
        `)
        .eq('id', studentId)
        .single();

      if (error || !student.turma_id || !student.turmas) return false;

      // Buscar dados da nova turma
      const { data: newClass, error: newClassError } = await supabase
        .from('turmas')
        .select('horario, dias_da_semana')
        .eq('id', newClassId)
        .single();

      if (newClassError || !newClass) return false;

      // Verificar conflito de horário
      const hasConflict = student.turmas.horario === newClass.horario && 
                         student.turmas.dias_da_semana === newClass.dias_da_semana;

      return hasConflict;
    } catch (error) {
      console.error('Erro ao verificar conflito de horário:', error);
      return false;
    }
  };

  // Obter estatísticas de matrículas
  const getEnrollmentStats = () => {
    const totalStudents = students.length;
    const studentsWithMultipleEnrollments = students.filter(s => s.enrollments.length > 1).length;
    const studentsWithRegularClasses = students.filter(s => 
      s.enrollments.some(e => e.observacoes === 'Turma regular')
    ).length;
    const studentsWithPrivateClasses = students.filter(s => 
      s.enrollments.some(e => e.observacoes === 'Aulas particulares')
    ).length;

    return {
      totalStudents,
      studentsWithMultipleEnrollments,
      studentsWithRegularClasses,
      studentsWithPrivateClasses,
      multipleEnrollmentPercentage: totalStudents > 0 
        ? Math.round((studentsWithMultipleEnrollments / totalStudents) * 100) 
        : 0
    };
  };

  useEffect(() => {
    fetchStudentsWithEnrollments();
  }, []);

  return {
    students,
    loading,
    fetchStudentsWithEnrollments,
    addStudentToClass,
    removeStudentFromClass,
    checkScheduleConflict,
    getEnrollmentStats
  };
};