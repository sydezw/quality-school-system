
import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/integrations/supabase/types';
import { DeletionPlan } from '@/components/shared/AdvancedDeleteDialog';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          turmas (nome),
          responsaveis (nome)
        `)
        .order('nome');

      if (error) throw error;

      // Ajuste: converter data_nascimento de string para Date | null
      const mapped = (data || []).map((aluno: any) => ({
        ...aluno,
        data_nascimento: aluno.data_nascimento ? new Date(aluno.data_nascimento) : null,
      }));

      setStudents(mapped);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .order('nome');

      if (error) throw error;
      console.log('Turmas carregadas:', data);
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    }
  };

  const saveStudent = async (data: any, editingStudent: Student | null) => {
    try {
      // Processar dados antes de enviar
      const submitData = {
        ...data,
        turma_id: data.turma_id === 'none' ? null : data.turma_id,
        responsavel_id: data.responsavel_id === 'none' ? null : data.responsavel_id
      };

      if (editingStudent) {
        const { error } = await supabase
          .from('alunos')
          .update(submitData)
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('alunos')
          .insert([submitData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Aluno criado com sucesso!",
        });
      }

      fetchStudents();
      return true;
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o aluno.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteStudentWithPlan = async (student: Student, plan: DeletionPlan) => {
    setIsDeleting(true);
    try {
      // Primeiro, aplicar as regras do plano de exclusão
      // Para dados que devem ser mantidos (SET NULL), não fazemos nada especial
      // pois as constraints do banco já estão configuradas
      
      // Para dados que devem ser excluídos (CASCADE), também não precisamos
      // fazer nada especial pois as constraints estão configuradas
      
      // A exclusão do aluno vai respeitar as constraints do banco
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', student.id);

      if (error) {
        // Se houver erro de constraint, explicar ao usuário
        if (error.code === '23503') {
          toast({
            title: "Erro de Dependência",
            description: "Não foi possível excluir o aluno devido a registros relacionados. Verifique se existem dados que impedem a exclusão.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: "Sucesso",
        description: `Aluno ${student.nome} foi excluído com sucesso!`,
      });
      
      // Atualizar a lista de alunos
      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o aluno. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  return {
    students,
    classes,
    loading,
    isDeleting,
    saveStudent,
    deleteStudentWithPlan,
    refetch: fetchStudents,
    fetchStudents
  };
};
