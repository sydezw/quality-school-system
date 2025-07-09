
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
import { Contract } from '@/hooks/useContracts';
import DatePicker from '@/components/shared/DatePicker';
import { format, parse } from 'date-fns';

interface EditContractDialogProps {
  contract: Contract;
  onContractUpdated: () => void;
}

export const EditContractDialog = ({ contract, onContractUpdated }: EditContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alunos, setAlunos] = useState<Array<{ id: string; nome: string }>>([]);
  const [planos, setPlanos] = useState<Array<{ id: string; nome: string; valor_total: number }>>([]);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    aluno_id: contract.aluno_id,
    data_inicio: contract.data_inicio,
    data_fim: contract.data_fim,
    valor_mensalidade: contract.valor_mensalidade.toString(),
    status: contract.status_contrato as 'Ativo' | 'Agendado' | 'Vencendo' | 'Vencido' | 'Cancelado',
    observacao: contract.observacao || '',
    plano_id: contract.plano_id || ''
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

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('id, nome, valor_total')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de planos.",
        variant: "destructive",
      });
    }
  };

  // Função para sincronizar mudança de plano com o financeiro
  const syncPlanoWithFinanceiro = async (newPlanoId: string, oldPlanoId: string) => {
    if (!newPlanoId || newPlanoId === oldPlanoId) return;

    try {
      // Buscar registro financeiro existente do aluno
      const { data: financeiroData, error: financeiroError } = await supabase
        .from('financeiro_alunos')
        .select('id')
        .eq('aluno_id', formData.aluno_id)
        .eq('plano_id', oldPlanoId)
        .eq('ativo_ou_encerrado', 'ativo')
        .single();

      if (financeiroError && financeiroError.code !== 'PGRST116') {
        console.error('Erro ao buscar registro financeiro:', financeiroError);
        return;
      }

      // Se existe registro financeiro, atualizar o plano
      if (financeiroData) {
        const { error: updateError } = await supabase
          .from('financeiro_alunos')
          .update({ plano_id: newPlanoId })
          .eq('id', financeiroData.id);

        if (updateError) {
          console.error('Erro ao sincronizar plano no financeiro:', updateError);
          toast({
            title: "Aviso",
            description: "Contrato atualizado, mas houve erro na sincronização com o financeiro.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sincronização",
            description: "Plano sincronizado automaticamente com o registro financeiro.",
          });
        }
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchAlunos();
      fetchPlanos();
      
      // Inicializar as datas
      const inicioDate = contract.data_inicio ? parse(contract.data_inicio, 'yyyy-MM-dd', new Date()) : null;
      const fimDate = contract.data_fim ? parse(contract.data_fim, 'yyyy-MM-dd', new Date()) : null;
      
      setDataInicio(inicioDate);
      setDataFim(fimDate);
      
      setFormData({
        aluno_id: contract.aluno_id,
        data_inicio: contract.data_inicio,
        data_fim: contract.data_fim,
        valor_mensalidade: contract.valor_mensalidade.toString(),
        status: contract.status_contrato as 'Ativo' | 'Agendado' | 'Vencendo' | 'Vencido' | 'Cancelado',
        observacao: contract.observacao || '',
        plano_id: contract.plano_id || ''
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
      const oldPlanoId = contract.plano_id;

      const { error } = await supabase
        .from('contratos')
        .update({
          aluno_id: formData.aluno_id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          valor_mensalidade: parseFloat(formData.valor_mensalidade),
          status_contrato: formData.status,
          observacao: formData.observacao || null,
          plano_id: formData.plano_id || null
        })
        .eq('id', contract.id);

      if (error) throw error;

      // Sincronizar com financeiro se o plano mudou
      if (formData.plano_id !== oldPlanoId) {
        await syncPlanoWithFinanceiro(formData.plano_id, oldPlanoId || '');
      }

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
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
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

          {/* NOVO CAMPO PLANO */}
          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select value={formData.plano_id} onValueChange={(value) => setFormData(prev => ({ ...prev, plano_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {planos.map((plano) => (
                  <SelectItem key={plano.id} value={plano.id}>
                    {plano.nome} - R$ {plano.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <DatePicker
                value={dataInicio}
                onChange={(date) => {
                  setDataInicio(date);
                  setFormData(prev => ({
                    ...prev,
                    data_inicio: date ? format(date, 'yyyy-MM-dd') : ''
                  }));
                }}
                placeholder="Selecione a data de início"
              />
            </div>
            
            <div>
              <Label htmlFor="data_fim">Data de Fim *</Label>
              <DatePicker
                value={dataFim}
                onChange={(date) => {
                  setDataFim(date);
                  setFormData(prev => ({
                    ...prev,
                    data_fim: date ? format(date, 'yyyy-MM-dd') : ''
                  }));
                }}
                placeholder="Selecione a data de fim"
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
            <Select value={formData.status} onValueChange={(value: 'Ativo' | 'Agendado' | 'Vencendo' | 'Vencido' | 'Cancelado') => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Vencendo">Vencendo</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
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
