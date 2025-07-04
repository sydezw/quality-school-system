import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  nome: string;
  descricao: string;
  numero_aulas: number;
  frequencia_aulas: string;
  carga_horaria_total: number | null;
  valor_total: number | null;
  valor_por_aula: number | null;
  horario_por_aula: number | null;
  permite_cancelamento: boolean;
  permite_parcelamento: boolean;
  observacoes: string | null;
  ativo: boolean;
}

interface PlanFormProps {
  plan?: Plan | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PlanForm = ({ plan, onSuccess, onCancel }: PlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    numero_aulas: 1,
    frequencia_aulas: 'semanal',
    carga_horaria_total: '',
    valor_total: '',
    valor_por_aula: '',
    horario_por_aula: '',
    permite_cancelamento: false,
    permite_parcelamento: false,
    observacoes: '',
    ativo: true
  });

  const { toast } = useToast();

  // Função para formatar carga horária em formato HH:MM
  const formatCargaHoraria = (value: string): string => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return '';
    
    const parteInteira = Math.floor(numericValue);
    const parteDecimal = numericValue - parteInteira;
    
    // Se não há parte decimal, exibe apenas o número inteiro
    if (parteDecimal === 0) {
      return parteInteira.toString();
    }
    
    // Converte a parte decimal para dois dígitos (ex: 0.25 -> 25, 0.5 -> 50)
    const decimalFormatted = Math.round(parteDecimal * 100).toString().padStart(2, '0');
    
    return `${parteInteira}:${decimalFormatted}`;
  };

  useEffect(() => {
    if (plan) {
      setFormData({
        nome: plan.nome,
        descricao: plan.descricao,
        numero_aulas: plan.numero_aulas,
        frequencia_aulas: plan.frequencia_aulas,
        carga_horaria_total: plan.carga_horaria_total?.toString() || '',
        valor_total: plan.valor_total?.toString() || '',
        valor_por_aula: plan.valor_por_aula?.toString() || '',
        horario_por_aula: plan.horario_por_aula?.toString() || '',
        permite_cancelamento: plan.permite_cancelamento,
        permite_parcelamento: plan.permite_parcelamento,
        observacoes: plan.observacoes || '',
        ativo: plan.ativo
      });
    }
  }, [plan]);

  // Cálculos automáticos em tempo real
  useEffect(() => {
    const valorTotal = parseFloat(formData.valor_total) || 0;
    const numeroAulas = formData.numero_aulas || 0;
    const horarioPorAula = parseFloat(formData.horario_por_aula) || 0;

    // Calcular valor por aula automaticamente
    if (valorTotal > 0 && numeroAulas > 0) {
      const valorPorAula = (valorTotal / numeroAulas).toFixed(2);
      if (formData.valor_por_aula !== valorPorAula) {
        setFormData(prev => ({ ...prev, valor_por_aula: valorPorAula }));
      }
    }

    // Calcular carga horária total automaticamente
    // Agora horarioPorAula está em horas, então multiplicamos diretamente
    if (numeroAulas > 0 && horarioPorAula > 0) {
      const cargaHorariaTotal = (numeroAulas * horarioPorAula).toFixed(1);
      if (formData.carga_horaria_total !== cargaHorariaTotal) {
        setFormData(prev => ({ ...prev, carga_horaria_total: cargaHorariaTotal }));
      }
    }
  }, [formData.valor_total, formData.numero_aulas, formData.horario_por_aula]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      const valorTotal = parseFloat(formData.valor_total) || 0;
      const numeroAulas = formData.numero_aulas || 0;
      const horarioPorAula = parseFloat(formData.horario_por_aula) || 0;

      if (valorTotal <= 0) {
        toast({
          title: "Erro de Validação",
          description: "Valor Total deve ser maior que zero.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (numeroAulas <= 0) {
        toast({
          title: "Erro de Validação",
          description: "Número de Aulas deve ser maior que zero.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (horarioPorAula <= 0) {
        toast({
          title: "Erro de Validação",
          description: "Horário por Aula deve ser maior que zero.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Recalcular valores no servidor para garantir consistência
      const valorPorAula = valorTotal / numeroAulas;
      const cargaHorariaTotal = numeroAulas * horarioPorAula;

      const planData = {
        nome: formData.nome,
        descricao: formData.descricao,
        numero_aulas: numeroAulas,
        frequencia_aulas: formData.frequencia_aulas,
        carga_horaria_total: cargaHorariaTotal,
        valor_total: valorTotal,
        valor_por_aula: valorPorAula,
        horario_por_aula: horarioPorAula,
        permite_cancelamento: formData.permite_cancelamento,
        permite_parcelamento: formData.permite_parcelamento,
        observacoes: formData.observacoes || null,
        ativo: formData.ativo
      };
  
      let error;
      if (plan) {
        const { error: updateError } = await supabase
          .from('planos')
          .update(planData)
          .eq('id', plan.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('planos')
          .insert([planData]);
        error = insertError;
      }
  
      if (error) {
        throw error;
      }
  
      toast({
        title: "Sucesso!",
        description: plan ? "Plano atualizado com sucesso." : "Plano criado com sucesso.",
      });
  
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Plano</Label>
          <Input
            id="nome"
            type="text"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="numero_aulas">Número de Aulas</Label>
          <Input
            id="numero_aulas"
            type="number"
            min="1"
            value={formData.numero_aulas}
            onChange={(e) => handleInputChange('numero_aulas', parseInt(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          rows={3}
          placeholder="Descreva o plano de pagamento..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequencia_aulas">Frequência das Aulas</Label>
          <Select
            value={formData.frequencia_aulas}
            onValueChange={(value) => handleInputChange('frequencia_aulas', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diaria">Diária</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="quinzenal">Quinzenal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="bimestral">Bimestral</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="semestral">Semestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="horario_por_aula">Horário por Aula (horas)</Label>
          <Input
            id="horario_por_aula"
            type="number"
            min="0.1"
            step="0.1"
            value={formData.horario_por_aula || ''}
            onChange={(e) => handleInputChange('horario_por_aula', parseFloat(e.target.value) || null)}
            placeholder="Ex: 1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="carga_horaria_total">Carga Horária Total (horas)</Label>
        <Input
          id="carga_horaria_total"
          type="number"
          min="0"
          step="0.5"
          value={formData.carga_horaria_total || ''}
          readOnly
          className="bg-gray-50"
          placeholder="Calculado automaticamente"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valor_total">Valor Total (R$)</Label>
          <Input
            id="valor_total"
            type="number"
            min="0"
            step="0.01"
            value={formData.valor_total || ''}
            onChange={(e) => handleInputChange('valor_total', parseFloat(e.target.value) || null)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="valor_por_aula">Valor por Aula (R$)</Label>
          <Input
          id="valor_por_aula"
          type="number"
          min="0"
          step="0.01"
          value={formData.valor_por_aula || ''}
          readOnly
          className="bg-gray-50"
          placeholder="Calculado automaticamente"
        />
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes || ''}
          onChange={(e) => handleInputChange('observacoes', e.target.value)}
          rows={2}
          placeholder="Observações adicionais sobre o plano..."
        />
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="permite_cancelamento"
            checked={formData.permite_cancelamento}
            onCheckedChange={(checked) => handleInputChange('permite_cancelamento', checked)}
          />
          <Label htmlFor="permite_cancelamento">Permite cancelamento</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="permite_parcelamento"
            checked={formData.permite_parcelamento}
            onCheckedChange={(checked) => handleInputChange('permite_parcelamento', checked)}
          />
          <Label htmlFor="permite_parcelamento">Permite parcelamento</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => handleInputChange('ativo', checked)}
          />
          <Label htmlFor="ativo">Plano ativo</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {plan ? 'Atualizar' : 'Criar'} Plano
        </Button>
      </div>
    </form>
  );
};

export default PlanForm;