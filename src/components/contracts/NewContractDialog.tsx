
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { ContractFormData } from '@/hooks/useContracts';
import { PlanoGenerico } from '@/types/financial';

interface Student {
  id: string;
  nome: string;
}

interface NewContractDialogProps {
  onContractCreated: () => void;
}

// Atualizar a interface para incluir idioma_contrato
interface ExtendedContractFormData extends ContractFormData {
  idioma_contrato?: Database['public']['Enums']['idioma'];
}

export const NewContractDialog = ({ onContractCreated }: NewContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [planos, setPlanos] = useState<PlanoGenerico[]>([]);
  const [formData, setFormData] = useState<ExtendedContractFormData>({
    aluno_id: '',
    data_inicio: '',
    data_fim: '',
    observacao: '',
    plano_id: '',
    idioma_contrato: undefined
  });
  const [calculatedStatus, setCalculatedStatus] = useState<string>('Agendado');
  const { toast } = useToast();

  const fetchAlunos = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    }
  };

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, valor_total, valor_por_aula, descricao')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar planos.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchAlunos();
      fetchPlanos(); // ✅ Buscar planos ao abrir
    } else {
      // Reset form when closing - incluir todos os campos
      setFormData({
        aluno_id: '',
        data_inicio: '',
        data_fim: '',
        observacao: '',
        plano_id: '',
        idioma_contrato: undefined
      });
      setCalculatedStatus('Agendado');
    }
  };

  // Função para calcular o status baseado nas datas
  const calculateStatus = (dataInicio: string, dataFim: string) => {
    if (!dataInicio || !dataFim) return 'Agendado';
    
    const hoje = new Date();
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (inicio > hoje) return 'Agendado';
    if (fim < hoje) return 'Vencido';
    
    const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 60) return 'Vencendo';
    
    return 'Ativo';
  };

  // Atualizar status quando as datas mudarem
  useEffect(() => {
    const status = calculateStatus(formData.data_inicio, formData.data_fim);
    setCalculatedStatus(status);
  }, [formData.data_inicio, formData.data_fim]);

  // Adicionar a função handlePlanoChange aqui
  const handlePlanoChange = async (planoId: string) => {
    setFormData(prev => ({ ...prev, plano_id: planoId }));
    
    if (planoId) {
      try {
        const { data, error } = await supabase
          .from('planos')
          .select('idioma')
          .eq('id', planoId)
          .single();

        if (error) throw error;
        
        setFormData(prev => ({ 
          ...prev, 
          idioma_contrato: data.idioma 
        }));
      } catch (error) {
        console.error('Erro ao buscar idioma do plano:', error);
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        idioma_contrato: undefined 
      }));
    }
  };

  // Modificar a validação de campos obrigatórios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aluno_id || !formData.data_inicio || !formData.data_fim || !formData.plano_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Aluno, Datas e Plano).",
        variant: "destructive",
      });
      return;
    }
  
    setLoading(true);
    
    try {
      // VALIDAÇÃO: Verificar se existe registro financeiro ativo para o idioma
      if (formData.idioma_contrato) {
        const { data: registroFinanceiro, error: financeiroError } = await supabase
          .from('financeiro_alunos')
          .select(`
            id,
            ativo_ou_encerrado,
            planos!inner(idioma)
          `)
          .eq('aluno_id', formData.aluno_id)
          .eq('ativo_ou_encerrado', 'ativo')
          .eq('planos.idioma', formData.idioma_contrato);
  
        if (financeiroError) {
          console.error('Erro ao verificar registro financeiro:', financeiroError);
          throw new Error('Erro ao validar registro financeiro');
        }
  
        if (!registroFinanceiro || registroFinanceiro.length === 0) {
          toast({
            title: "Registro Financeiro Necessário",
            description: "É preciso ter primeiro o registro financeiro desse aluno com o idioma e plano selecionado antes de cadastrar o contrato.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
  
      // VALIDAÇÃO: Evitar contratos duplicados - SEMPRE EXECUTA AGORA
      const { data: existingContracts, error: checkError } = await supabase
        .from('contratos')
        .select('id, status_contrato')
        .eq('aluno_id', formData.aluno_id)
        .eq('plano_id', formData.plano_id)
        .in('status_contrato', ['Ativo', 'Agendado', 'Vencendo']);
  
      if (checkError) {
        console.error('Erro ao verificar contratos existentes:', checkError);
        throw new Error('Erro ao validar contrato');
      }
  
      if (existingContracts && existingContracts.length > 0) {
        toast({
          title: "Contrato Duplicado",
          description: "Este aluno já possui um contrato ativo com este plano. Não é possível criar contratos duplicados.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
  
      const { error } = await supabase
        .from('contratos')
        .insert({
          aluno_id: formData.aluno_id || null,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim || null,
          observacao: formData.observacao || null,
          plano_id: formData.plano_id || null,
          idioma_contrato: formData.idioma_contrato || null,
          status_contrato: calculatedStatus as Database['public']['Enums']['status_contrato'],
          valor_mensalidade: 0
        });
  
      if (error) throw error;
  
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso!",
      });
  
      setFormData({
        aluno_id: '',
        data_inicio: '',
        data_fim: '',
        observacao: '',
        plano_id: '',
        idioma_contrato: undefined
      });
      setCalculatedStatus('Agendado');
      setOpen(false);
      onContractCreated();
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar contrato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Novo Contrato
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Aluno */}
          <div className="space-y-2">
            <Label htmlFor="aluno">Aluno *</Label>
            <Select
              value={formData.aluno_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, aluno_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campos de Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData(prev => ({ ...prev, data_inicio: newValue }));
                  if (newValue && formData.data_fim) {
                    setCalculatedStatus(calculateStatus(newValue, formData.data_fim));
                  }
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim *</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData(prev => ({ ...prev, data_fim: newValue }));
                  if (formData.data_inicio && newValue) {
                    setCalculatedStatus(calculateStatus(formData.data_inicio, newValue));
                  }
                }}
                required
              />
            </div>
          </div>

          {/* Campo Plano - AGORA OBRIGATÓRIO */}
          <div className="space-y-2">
            <Label htmlFor="plano">Plano *</Label>
            <Select
              value={formData.plano_id || undefined}
              onValueChange={handlePlanoChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {planos.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome} - R$ {plano.valor_total}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo Idioma do Contrato - Só aparece quando plano é selecionado */}
          {formData.plano_id && formData.idioma_contrato && (
            <div className="space-y-2">
              <Label htmlFor="idioma_contrato">Idioma do Contrato</Label>
              <Input
                id="idioma_contrato"
                value={formData.idioma_contrato}
                disabled
                className="bg-gray-50 cursor-not-allowed"
                placeholder="Idioma baseado no plano selecionado"
              />
              <p className="text-sm text-gray-500">
                O idioma é definido automaticamente pelo plano selecionado e não pode ser alterado.
              </p>
            </div>
          )}

          {/* Campo Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              value={calculatedStatus}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">
              O status é calculado automaticamente com base nas datas do contrato
            </p>
          </div>

          {/* Campo Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              placeholder="Observações sobre o contrato (opcional)"
              value={formData.observacao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Contrato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
