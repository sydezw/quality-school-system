
import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/integrations/supabase/types';

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

  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const deleteStudent = async (id: string): Promise<boolean> => {
    setDeletingStudentId(id);
    
    try {
      // Primeiro, verificar se o aluno existe
      const { data: studentExists, error: checkError } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('id', id)
        .single();

      if (checkError || !studentExists) {
        throw new Error('Aluno não encontrado.');
      }

      // Executar a exclusão
      const { error: deleteError } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Tratar diferentes tipos de erro
        if (deleteError.code === 'PGRST116') {
          throw new Error('Aluno não encontrado.');
        } else if (deleteError.code === '23503') {
          throw new Error('Não é possível excluir este aluno pois existem registros relacionados.');
        } else {
          throw new Error(`Erro no banco de dados: ${deleteError.message}`);
        }
      }
      
      toast({
        title: "Sucesso",
        description: `Aluno "${studentExists.nome}" excluído com sucesso!`,
        duration: 5000,
      });
      
      // Atualizar a lista de alunos
      await fetchStudents();
      
      return true;
    } catch (error: any) {
      console.error('Erro ao excluir aluno:', error);
      
      const errorMessage = error.message || 'Não foi possível excluir o aluno. Tente novamente.';
      
      toast({
        title: "Erro na Exclusão",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
      
      return false;
    } finally {
      setDeletingStudentId(null);
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
    saveStudent,
    deleteStudent,
    deletingStudentId,
    refetch: fetchStudents
  };
};
