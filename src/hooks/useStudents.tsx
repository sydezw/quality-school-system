
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  status: string;
  idioma: string;
  turma_id: string | null;
  responsavel_id: string | null;
  data_nascimento: Date | null;
  turmas?: { nome: string };
  responsaveis?: { nome: string };
}

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
      const submitData = data;

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

  const deleteStudent = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Aluno excluído com sucesso!",
      });
      fetchStudents();
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o aluno.",
        variant: "destructive",
      });
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
    refetch: fetchStudents
  };
};
