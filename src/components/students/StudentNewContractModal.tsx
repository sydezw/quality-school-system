import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, FileText, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { ContractFormData } from '@/hooks/useContracts';
import { PlanoGenerico } from '@/types/financial';
import DatePicker from '@/components/shared/DatePicker';
import { format } from 'date-fns';
import { adicionarMesesSeguro } from '@/utils/dateUtils';

interface Student {
  id: string;
  nome: string;
}

interface NewContractDialogProps {
  onContractCreated: () => void;
  student?: { id: string; nome: string };
}

// Atualizar a interface para incluir idioma_contrato
interface ExtendedContractFormData extends ContractFormData {
  idioma_contrato?: Database['public']['Enums']['idioma'];
}

export const NewContractDialog = ({ onContractCreated, student }: NewContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [planos, setPlanos] = useState<PlanoGenerico[]>([]);
  const [formData, setFormData] = useState<ExtendedContractFormData>({
    aluno_id: student?.id || '',
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
        .select('id, nome, valor_total, valor_por_aula, descricao, numero_aulas')
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

  // Função para calcular data de fim baseada no número de aulas
  const calculateEndDate = (startDate: string, numeroAulas: number): string => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    let endDate = new Date(start);
    
    // 36 aulas = 6 meses, 72 aulas = 1 ano
    if (numeroAulas === 36) {
      endDate = adicionarMesesSeguro(endDate, 6);
    } else if (numeroAulas === 72) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Para outros números de aulas, calcular proporcionalmente
      // Assumindo que 36 aulas = 6 meses como base
      const meses = Math.round((numeroAulas / 36) * 6);
      endDate = adicionarMesesSeguro(endDate, meses);
    }
    
    return endDate.toISOString().split('T')[0];
  };

  // Adicionar a função handlePlanoChange aqui
  const handlePlanoChange = async (planoId: string) => {
    setFormData(prev => ({ ...prev, plano_id: planoId }));
    
    if (planoId) {
      try {
        const { data, error } = await supabase
          .from('planos')
          .select('idioma, numero_aulas')
          .eq('id', planoId)
          .single();

        if (error) throw error;
        
        // Calcular data de fim automaticamente se há data de início
        let newEndDate = formData.data_fim;
        if (formData.data_inicio && data.numero_aulas) {
          newEndDate = calculateEndDate(formData.data_inicio, data.numero_aulas);
        }
        
        setFormData(prev => ({ 
          ...prev, 
          idioma_contrato: data.idioma,
          data_fim: newEndDate
        }));
      } catch (error) {
        console.error('Erro ao buscar dados do plano:', error);
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
    
    // Removido validações de campos obrigatórios, financeiro e contratos duplicados
    // para permitir salvamento sem restrições
  
    setLoading(true);
    
    try {
  
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
        <button 
           className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 w-8 p-0 rounded-full border-2 border-black bg-white hover:bg-black text-black hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
           tabIndex={0}
           type="button"
           aria-label="add contract"
         >
           <PlusCircle className="h-4 w-4" />
         </button>
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
            {student ? (
              <Input
                value={student.nome}
                disabled
                className="bg-gray-100"
              />
            ) : (
              <Select
                value={formData.aluno_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, aluno_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((studentItem) => (
                    <SelectItem key={studentItem.id} value={studentItem.id}>
                      {studentItem.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Campos de Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <DatePicker
                key={formData.data_inicio} // Força re-renderização quando data_inicio muda
                value={formData.data_inicio ? new Date(formData.data_inicio) : undefined}
                onChange={async (date) => {
                  const newValue = date ? format(date, 'yyyy-MM-dd') : '';
                  
                  // Se há um plano selecionado, recalcular a data de fim
                  let newEndDate = formData.data_fim;
                  if (newValue && formData.plano_id) {
                    try {
                      const { data: planoData, error } = await supabase
                        .from('planos')
                        .select('numero_aulas')
                        .eq('id', formData.plano_id)
                        .single();
                      
                      if (!error && planoData?.numero_aulas) {
                        newEndDate = calculateEndDate(newValue, planoData.numero_aulas);
                      }
                    } catch (error) {
                      console.error('Erro ao recalcular data de fim:', error);
                    }
                  }
                  
                  setFormData(prev => ({ 
                    ...prev, 
                    data_inicio: newValue,
                    data_fim: newEndDate
                  }));
                  
                  if (newValue && newEndDate) {
                    setCalculatedStatus(calculateStatus(newValue, newEndDate));
                  }
                }}
                placeholder="Selecione a data de início"
                disableAutoFormat={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim *</Label>
              <DatePicker
                key={formData.data_fim} // Força re-renderização quando data_fim muda
                value={formData.data_fim ? new Date(formData.data_fim) : undefined}
                onChange={(date) => {
                  const newValue = date ? format(date, 'yyyy-MM-dd') : '';
                  setFormData(prev => ({ ...prev, data_fim: newValue }));
                  if (formData.data_inicio && newValue) {
                    setCalculatedStatus(calculateStatus(formData.data_inicio, newValue));
                  }
                }}
                placeholder="Selecione a data de fim"
                disableAutoFormat={true}
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