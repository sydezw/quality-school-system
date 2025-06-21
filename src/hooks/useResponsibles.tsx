
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

  const deleteResponsible = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este responsável?')) return;

    try {
      const { error } = await supabase
        .from('responsaveis')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Responsável excluído com sucesso!",
      });
      fetchResponsibles();
    } catch (error) {
      console.error('Erro ao excluir responsável:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o responsável.",
        variant: "destructive",
      });
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
