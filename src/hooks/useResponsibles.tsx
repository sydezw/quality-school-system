
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Responsible {
  id: string;
  nome: string;
  cpf: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  telefone: string | null;
}

export const useResponsibles = () => {
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResponsibles = async () => {
    try {
      const { data, error } = await supabase
        .from('responsaveis')
        .select('*')
        .order('nome');

      if (error) throw error;
      setResponsibles(data || []);
    } catch (error) {
      console.error('Erro ao buscar responsáveis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os responsáveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveResponsible = async (data: any, editingResponsible: Responsible | null) => {
    try {
      console.log('Salvando responsável:', { data, editingResponsible });
      
      if (editingResponsible) {
        const { error } = await supabase
          .from('responsaveis')
          .update(data)
          .eq('id', editingResponsible.id);

        if (error) {
          console.error('Erro no update:', error);
          throw error;
        }
        toast({
          title: "Sucesso",
          description: "Responsável atualizado com sucesso!",
        });
      } else {
        const { data: result, error } = await supabase
          .from('responsaveis')
          .insert([data])
          .select();

        if (error) {
          console.error('Erro no insert:', error);
          throw error;
        }
        console.log('Responsável criado:', result);
        toast({
          title: "Sucesso",
          description: "Responsável criado com sucesso!",
        });
      }

      fetchResponsibles();
      return true;
    } catch (error) {
      console.error('Erro ao salvar responsável:', error);
      toast({
        title: "Erro",
        description: `Não foi possível salvar o responsável. ${error.message || ''}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteResponsible = async (id: string): Promise<boolean> => {
    try {
      // Primeiro, verificar se o responsável existe
      const { data: responsibleExists, error: checkError } = await supabase
        .from('responsaveis')
        .select('id, nome')
        .eq('id', id)
        .single();

      if (checkError || !responsibleExists) {
        toast({
          title: "Responsável não encontrado",
          description: "O responsável que você está tentando excluir não existe mais.",
          variant: "destructive",
        });
        await fetchResponsibles();
        return false;
      }

      // Executar a exclusão
      const { error: deleteError } = await supabase
        .from('responsaveis')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Tratar diferentes tipos de erro
        if (deleteError.code === 'PGRST116') {
          toast({
            title: "Responsável não encontrado",
            description: "O responsável que você está tentando excluir não existe mais.",
            variant: "destructive",
          });
          await fetchResponsibles();
          return false;
        } else if (deleteError.code === '23503') {
          toast({
            title: "Não é possível excluir este responsável",
            description: "Este responsável está vinculado a alunos ou outros registros. Remova essas vinculações antes de excluir.",
            variant: "destructive",
          });
          return false;
        } else {
          throw deleteError;
        }
      }
      
      toast({
        title: "Responsável excluído com sucesso!",
        description: `O responsável "${responsibleExists.nome}" foi removido do sistema.`,
      });
      
      // Atualizar a lista de responsáveis
      await fetchResponsibles();
      return true;
    } catch (error) {
      console.error('Erro ao excluir responsável:', error);
      toast({
        title: "Erro ao excluir responsável",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchResponsibles();
  }, []);

  return {
    responsibles,
    loading,
    saveResponsible,
    deleteResponsible,
    refetch: fetchResponsibles
  };
};
