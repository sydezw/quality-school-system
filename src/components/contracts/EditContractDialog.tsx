
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  aluno_id: string;
  aluno_nome: string;
  data_inicio: string;
  data_fim: string;
  valor_mensalidade: number;
  status: 'Ativo' | 'Trancado' | 'Cancelado' | 'Encerrado';
  observacao?: string;
}

interface EditContractDialogProps {
  contract: Contract;
  onContractUpdated: () => void;
}

export const EditContractDialog = ({ contract, onContractUpdated }: EditContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alunos, setAlunos] = useState<Array<{ id: string; nome: string }>>([]);
  const [formData, setFormData] = useState({
    aluno_id: contract.aluno_id,
    data_inicio: contract.data_inicio,
    data_fim: contract.data_fim,
    valor_mensalidade: contract.valor_mensalidade.toString(),
    status: contract.status as 'Ativo' | 'Trancado' | 'Cancelado' | 'Encerrado',
    observacao: contract.observacao || ''
  });
  const { toast } = useToast();

  const fetchAlunos = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setAlunos(data || []);
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
      // Reset form with current contract data
      setFormData({
        aluno_id: contract.aluno_id,
        data_inicio: contract.data_inicio,
        data_fim: contract.data_fim,
        valor_mensalidade: contract.valor_mensalidade.toString(),
        status: contract.status as 'Ativo' | 'Trancado' | 'Cancelado' | 'Encerrado',
        observacao: contract.observacao || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aluno_id || !formData.data_inicio || !formData.data_fim || !formData.valor_mensalidade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('contratos')
        .update({
          aluno_id: formData.aluno_id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          valor_mensalidade: parseFloat(formData.valor_mensalidade),
          status: formData.status,
          observacao: formData.observacao || null
        })
        .eq('id', contract.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contrato atualizado com sucesso.",
      });

      setOpen(false);
      onContractUpdated();

    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contrato.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Contrato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aluno">Aluno *</Label>
            <Select value={formData.aluno_id} onValueChange={(value) => setFormData(prev => ({ ...prev, aluno_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((aluno) => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.nome}
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
            <Label htmlFor="valor_mensalidade">Valor da Mensalidade *</Label>
            <Input
              id="valor_mensalidade"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.valor_mensalidade}
              onChange={(e) => setFormData(prev => ({ ...prev, valor_mensalidade: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value: 'Ativo' | 'Trancado' | 'Cancelado' | 'Encerrado') => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
                <SelectItem value="Trancado">Trancado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              placeholder="Observações sobre o contrato (opcional)"
              value={formData.observacao}
              onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
