import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Contract } from '@/hooks/useContracts';
import DatePicker from '@/components/shared/DatePicker';
import { format, parse } from 'date-fns';

interface EditContractDialogProps {
  contract?: Contract;
  student?: { id: string; nome: string };
  onContractUpdated: () => void;
}

export const EditContractDialog = ({ contract, student, onContractUpdated }: EditContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(contract || null);
  const [alunos, setAlunos] = useState<Array<{ id: string; nome: string }>>([]);
  const [planos, setPlanos] = useState<Array<{ id: string; nome: string; valor_total: number }>>([]);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    aluno_id: contract?.aluno_id || student?.id || '',
    data_inicio: contract?.data_inicio || '',
    data_fim: contract?.data_fim || '',
    valor_mensalidade: contract?.valor_mensalidade?.toString() || '',
    status: (contract?.status_contrato as 'Ativo' | 'Agendado' | 'Vencendo' | 'Vencido' | 'Cancelado') || 'Ativo',
    observacao: contract?.observacao || '',
    plano_id: contract?.plano_id || '',
    idioma_contrato: contract?.idioma_contrato || ''
  });
  const { toast } = useToast();

  const fetchStudentContract = async (studentId: string) => {
    try {
      const { data: contracts, error } = await supabase
        .from('contratos')
        .select(`
          *,
          planos(nome)
        `)
        .eq('aluno_id', studentId)
        .in('status_contrato', ['Ativo', 'Agendado'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (contracts && contracts.length > 0) {
        const contractData = contracts[0];
        setCurrentContract(contractData);
        setFormData({
          aluno_id: contractData.aluno_id,
          data_inicio: contractData.data_inicio,
          data_fim: contractData.data_fim,
          valor_mensalidade: contractData.valor_mensalidade.toString(),
          status: contractData.status_contrato as 'Ativo' | 'Agendado' | 'Vencendo' | 'Vencido' | 'Cancelado',
          observacao: contractData.observacao || '',
          plano_id: contractData.plano_id || '',
          idioma_contrato: contractData.idioma_contrato || ''
        });
        return contractData;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar contrato do aluno.",
        variant: "destructive",
      });
      return null;
    }
  };

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
        .select('id, nome, valor_total, idioma')
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

  // Função para lidar com mudança de plano e definir idioma automaticamente
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
        idioma_contrato: '' 
      }));
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

  const handleOpenChange = async (newOpen: boolean) => {
      setOpen(newOpen);
      if (newOpen) {
        fetchAlunos();
        fetchPlanos();
        // Se temos um student mas não um contract, buscar o contrato
        if (student && !contract) {
          await fetchStudentContract(student.id);
        } else if (contract) {
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
             plano_id: contract.plano_id || '',
             idioma_contrato: contract.idioma_contrato || ''
           });
         }
       }
     };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Removido validação de campos obrigatórios para permitir salvamento sem restrições

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
          plano_id: formData.plano_id || null,
          idioma_contrato: formData.idioma_contrato || null
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
        <button 
           className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 w-8 p-0 rounded-full border-2 border-orange-600 bg-white hover:bg-orange-600 text-orange-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
           tabIndex={0}
           type="button"
           aria-label="edit contract"
         >
           <Settings className="h-4 w-4" />
         </button>
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

          {/* CAMPO PLANO */}
          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select value={formData.plano_id} onValueChange={handlePlanoChange}>
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

          {/* CAMPO IDIOMA DO CONTRATO */}
          <div className="space-y-2">
            <Label htmlFor="idioma_contrato">Idioma do Contrato</Label>
            <Select value={formData.idioma_contrato} onValueChange={(value) => setFormData(prev => ({ ...prev, idioma_contrato: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Idioma será definido automaticamente pelo plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingles">Inglês</SelectItem>
                <SelectItem value="espanhol">Espanhol</SelectItem>
                <SelectItem value="frances">Francês</SelectItem>
                <SelectItem value="alemao">Alemão</SelectItem>
                <SelectItem value="italiano">Italiano</SelectItem>
                <SelectItem value="portugues">Português</SelectItem>
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
                disableAutoFormat={true}
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
                disableAutoFormat={true}
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