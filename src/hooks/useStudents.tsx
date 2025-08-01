
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Student, StudentWithRelations } from '@/types/shared';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel?: string; // Opcional, pois não estamos buscando esse campo atualmente
}

export const useStudents = () => {
  const [students, setStudents] = useState<StudentWithRelations[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Memoizar a função de busca para evitar re-criações
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Query otimizada com apenas campos que existem na tabela
      let query = supabase
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          telefone,
          email,
          idioma,
          nivel,
          status,
          turma_id,
          responsavel_id,
          created_at,
          updated_at,
          data_nascimento,
          endereco,
          numero_endereco,
          bairro,
          cep,
          cidade,
          estado,
          data_cancelamento,
          data_conclusao,
          data_exclusao,
          aulas_particulares,
          aulas_turma,
          turmas(nome, idioma),
          responsaveis(nome, telefone)
        `);
      
      // Remover o filtro de status - mostrar todos os alunos
      // if (!includeArchived) {
      //   query = query.in('status', ['Ativo', 'Trancado']);
      // }
      
      const { data, error } = await query.order('nome');
      
      if (error) throw error;
      
      // Transformar os dados para o tipo correto
      const transformedData: StudentWithRelations[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        cpf: item.cpf,
        telefone: item.telefone,
        email: item.email,
        idioma: item.idioma,
        nivel: item.nivel || 'none', // Campo nivel do aluno, usando 'none' como padrão
        status: item.status,
        turma_id: item.turma_id,
        responsavel_id: item.responsavel_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        data_nascimento: item.data_nascimento,
        endereco: item.endereco,
        numero_endereco: item.numero_endereco,
        bairro: item.bairro, // Campos que estavam faltando
        cep: item.cep,
        cidade: item.cidade,
        estado: item.estado,
        data_cancelamento: item.data_cancelamento,
        data_conclusao: item.data_conclusao,
        data_exclusao: item.data_exclusao,
        aulas_particulares: item.aulas_particulares || false,
        aulas_turma: item.aulas_turma !== null ? item.aulas_turma : true,
        turmas: item.turmas ? {
          nome: item.turmas.nome,
          idioma: item.turmas.idioma || ''
        } : undefined,
        responsaveis: item.responsaveis ? {
          nome: item.responsaveis.nome,
          telefone: item.responsaveis.telefone || ''
        } : undefined
      }));
      
      setStudents(transformedData);
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
  }, [toast]);

  const fetchClasses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('id, nome, idioma, nivel')
        .order('nome');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const saveStudent = async (data: any, editingStudent: Student | null) => {
    try {
      // Processar apenas os campos essenciais, removendo campos UUID vazios
      const submitData: any = {
        nome: data.nome || null,
        cpf: data.cpf || null,
        data_nascimento: data.data_nascimento || null,
        telefone: data.telefone || null,
        email: data.email || null,
        endereco: data.endereco || null,
        numero_endereco: data.numero_endereco || null,
        bairro: data.bairro || null,
        cep: data.cep || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        nivel: data.nivel && data.nivel !== 'none' ? data.nivel : null,
        status: data.status || 'Ativo',
        aulas_particulares: data.aulas_particulares || false,
        aulas_turma: data.aulas_turma !== undefined ? data.aulas_turma : true
      };
  
      // Só incluir idioma se tiver valor válido
      if (data.idioma && data.idioma !== 'none' && data.idioma !== '') {
        submitData.idioma = data.idioma;
      }
  
      // Só incluir turma_id se tiver valor UUID válido
      if (data.turma_id && data.turma_id !== 'none' && data.turma_id !== '') {
        // Verificar se a turma de destino já tem 10 alunos (apenas para novos alunos ou mudança de turma)
        const shouldCheckLimit = !editingStudent || editingStudent.turma_id !== data.turma_id;
        
        if (shouldCheckLimit) {
          const { data: currentStudents, error: countError } = await supabase
            .from('alunos')
            .select('id')
            .eq('turma_id', data.turma_id)
            .eq('status', 'Ativo');

          if (countError) {
            console.error('Erro ao verificar limite da turma:', countError);
            throw new Error('Erro ao verificar limite da turma');
          }

          const currentCount = currentStudents?.length || 0;
          const maxStudents = 10;

          // Se estamos editando um aluno, não contar ele mesmo se já estiver na turma
          const isStudentAlreadyInClass = editingStudent && editingStudent.turma_id === data.turma_id;
          const effectiveCount = isStudentAlreadyInClass ? currentCount - 1 : currentCount;

          if (effectiveCount >= maxStudents) {
            throw new Error(`Esta turma já possui o máximo de ${maxStudents} alunos. Escolha outra turma ou remova alunos desta turma primeiro.`);
          }
        }

        submitData.turma_id = data.turma_id;
      } else if (data.turma_id === 'none' || data.turma_id === '') {
        // Explicitamente definir como null para remover a turma
        submitData.turma_id = null;
      }
  
      // Só incluir responsavel_id se tiver valor UUID válido
      if (data.responsavel_id && data.responsavel_id !== 'none' && data.responsavel_id !== '') {
        submitData.responsavel_id = data.responsavel_id;
      } else if (data.responsavel_id === 'none' || data.responsavel_id === '') {
        // Explicitamente definir como null para remover o responsável
        submitData.responsavel_id = null;
      }
  
      console.log('Dados recebidos do formulário:', data);
      console.log('Dados que serão enviados para o banco:', submitData);
      console.log('Editando aluno:', editingStudent?.id, editingStudent?.nome);
  
      if (editingStudent) {
        const { error } = await supabase
          .from('alunos')
          .update(submitData)
          .eq('id', editingStudent.id);
  
        if (error) {
          console.error('Erro ao atualizar:', error);
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso!",
        });
      } else {
        const { data: insertedData, error } = await supabase
          .from('alunos')
          .insert([submitData])
          .select();
  
        if (error) {
          console.error('Erro ao inserir:', error);
          throw error;
        }
        
        console.log('Aluno criado:', insertedData);
        
        toast({
          title: "Sucesso",
          description: "Aluno criado com sucesso!",
        });
      }
  
      await fetchStudents();
      return true;
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar o aluno: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
      throw error;
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
  }, [fetchStudents, fetchClasses]);

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
