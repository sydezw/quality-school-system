
import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/integrations/supabase/types';
// Remover esta linha:
// import { DeletionPlan } from '@/components/shared/AdvancedDeleteDialog';

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

  const fetchStudents = async (includeArchived = false) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('alunos')
        .select(`
          *,
          turmas(nome, idioma, nivel),
          responsaveis(nome, telefone)
        `);
      
      if (!includeArchived) {
        // Mostrar apenas alunos ativos e trancados (não inativos)
        query = query.in('status', ['Ativo', 'Trancado']);
      }
      
      const { data, error } = await query.order('nome');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
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

  const deleteStudentWithPlan = async (student: Student, deleteOptions?: {
    deleteType: 'soft' | 'hard';
    deleteFinancialRecords?: boolean;
    deleteContracts?: boolean;
    deleteBoletos?: boolean;
    deletePresences?: boolean;
  }) => {
    try {
      setIsDeleting(true);
      
      if (deleteOptions?.deleteType === 'hard') {
        // HARD DELETE: Excluir tudo em cascade permanentemente
        
        // Excluir contratos (não tem CASCADE)
        const { error: contratosError } = await supabase
          .from('contratos')
          .delete()
          .eq('aluno_id', student.id);
        
        if (contratosError) {
          console.error('Erro ao excluir contratos:', contratosError);
          throw contratosError;
        }
        
        // Excluir boletos (não tem CASCADE)
        const { error: boletosError } = await supabase
          .from('boletos')
          .delete()
          .eq('aluno_id', student.id);
        
        if (boletosError) {
          console.error('Erro ao excluir boletos:', boletosError);
          throw boletosError;
        }
        
        // Excluir avaliações (não tem CASCADE)
        const { error: avaliacoesError } = await supabase
          .from('avaliacoes')
          .delete()
          .eq('aluno_id', student.id);
        
        if (avaliacoesError) {
          console.error('Erro ao excluir avaliações:', avaliacoesError);
          throw avaliacoesError;
        }
        
        // Agora excluir o aluno - as tabelas com CASCADE serão excluídas automaticamente
        const { error: deleteError } = await supabase
          .from('alunos')
          .delete()
          .eq('id', student.id);
        
        if (deleteError) {
          console.error('Erro ao excluir aluno permanentemente:', deleteError);
          throw deleteError;
        }
        
        toast({
          title: "Aluno excluído permanentemente",
          description: `${student.nome} e todos os registros relacionados foram removidos permanentemente do sistema.`,
        });
        
      } else {
        // SOFT DELETE: Marcar aluno como inativo, mas permitir excluir registros selecionados permanentemente
        
        // Primeiro, excluir registros relacionados selecionados permanentemente
        if (deleteOptions?.deleteFinancialRecords) {
          const { error: financeiroError } = await supabase
            .from('financeiro_alunos')
            .delete()
            .eq('aluno_id', student.id);
          
          if (financeiroError) {
            console.error('Erro ao excluir registros financeiros:', financeiroError);
            throw financeiroError;
          }
        }
        
        if (deleteOptions?.deleteBoletos) {
          const { error: boletosError } = await supabase
            .from('boletos')
            .delete()
            .eq('aluno_id', student.id);
          
          if (boletosError) {
            console.error('Erro ao excluir boletos:', boletosError);
            throw boletosError;
          }
        }
        
        if (deleteOptions?.deleteContracts) {
          const { error: contratosError } = await supabase
            .from('contratos')
            .delete()
            .eq('aluno_id', student.id);
          
          if (contratosError) {
            console.error('Erro ao excluir contratos:', contratosError);
            throw contratosError;
          }
        }
        
        if (deleteOptions?.deletePresences) {
          const { error: presencasError } = await supabase
            .from('presencas')
            .delete()
            .eq('aluno_id', student.id);
          
          if (presencasError) {
            console.error('Erro ao excluir presenças:', presencasError);
            throw presencasError;
          }
        }
        
        // Agora fazer soft delete do aluno (marcar como inativo)
        const { error: softDeleteError } = await supabase
          .from('alunos')
          .update({
            status: 'Inativo',
            data_exclusao: new Date().toISOString()
          })
          .eq('id', student.id);
        
        if (softDeleteError) {
          console.error('Erro ao fazer soft delete do aluno:', softDeleteError);
          throw softDeleteError;
        }
        
        const deletedRecords = [];
        if (deleteOptions?.deleteFinancialRecords) deletedRecords.push('registros financeiros');
        if (deleteOptions?.deleteBoletos) deletedRecords.push('boletos');
        if (deleteOptions?.deleteContracts) deletedRecords.push('contratos');
        if (deleteOptions?.deletePresences) deletedRecords.push('presenças');
        
        const deletedText = deletedRecords.length > 0 
          ? ` Os seguintes registros foram excluídos permanentemente: ${deletedRecords.join(', ')}.`
          : '';
        
        toast({
          title: "Aluno arquivado",
          description: `${student.nome} foi marcado como inativo e pode ser restaurado posteriormente.${deletedText}`,
        });
      }
      
      // Atualizar a lista de alunos
      await fetchStudents();
      
    } catch (error: any) {
      console.error('Erro na exclusão do aluno:', error);
      
      if (error.code === '23503') {
        toast({
          title: "Erro de dependência",
          description: "Este aluno possui registros relacionados que impedem a exclusão. Verifique as opções de exclusão.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao excluir aluno",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      }
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
