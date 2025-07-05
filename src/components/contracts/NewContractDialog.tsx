
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

interface Student {
  id: string;
  nome: string;
}

interface NewContractDialogProps {
  onContractCreated: () => void;
}

// Interface simplificada para o formulário (sem valor_mensalidade)
interface SimpleContractFormData {
  aluno_id: string;
  data_inicio: string;
  data_fim: string;
  observacao?: string;
}

export const NewContractDialog = ({ onContractCreated }: NewContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<SimpleContractFormData>({
    aluno_id: '',
    data_inicio: '',
    data_fim: '',
    observacao: ''
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchAlunos();
    } else {
      // Reset form when closing
      setFormData({
        aluno_id: '',
        data_inicio: '',
        data_fim: '',
        observacao: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aluno_id || !formData.data_inicio || !formData.data_fim) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contratos')
        .insert({
          aluno_id: formData.aluno_id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          observacao: formData.observacao || null,
          status_contrato: calculatedStatus as any,
          valor_mensalidade: 0 // Valor padrão temporário
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
        observacao: ''
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
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Novo Contrato
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aluno_id">Aluno *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim *</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              type="text"
              value={calculatedStatus}
              disabled
              className="bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Status calculado automaticamente"
            />
            <p className="text-xs text-gray-500">
              O status é calculado automaticamente com base nas datas do contrato
            </p>
          </div>

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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Criando...' : 'Criar Contrato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
