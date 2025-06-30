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
    permite_cancelamento: false,
    permite_parcelamento: false,
    observacoes: '',
    ativo: true
  });

  const { toast } = useToast();

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
        permite_cancelamento: plan.permite_cancelamento,
        permite_parcelamento: plan.permite_parcelamento,
        observacoes: plan.observacoes || '',
        ativo: plan.ativo
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        nome: formData.nome,
        descricao: formData.descricao,
        numero_aulas: formData.numero_aulas,
        frequencia_aulas: formData.frequencia_aulas,
        carga_horaria_total: formData.carga_horaria_total ? parseFloat(formData.carga_horaria_total) : null,
        valor_total: formData.valor_total ? parseFloat(formData.valor_total) : null,
        valor_por_aula: formData.valor_por_aula ? parseFloat(formData.valor_por_aula) : null,
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
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Plano *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_aulas">Número de Aulas *</Label>
          <Input
            id="numero_aulas"
            type="number"
            min="1"
            value={formData.numero_aulas}
            onChange={(e) => handleInputChange('numero_aulas', parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequencia_aulas">Frequência das Aulas</Label>
          <Select value={formData.frequencia_aulas} onValueChange={(value) => handleInputChange('frequencia_aulas', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="quinzenal">Quinzenal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="intensivo">Intensivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="carga_horaria_total">Carga Horária Total (horas)</Label>
          <Input
            id="carga_horaria_total"
            type="number"
            step="0.5"
            min="0"
            value={formData.carga_horaria_total}
            onChange={(e) => handleInputChange('carga_horaria_total', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valor_total">Valor Total (R$)</Label>
          <Input
            id="valor_total"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_total}
            onChange={(e) => handleInputChange('valor_total', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_por_aula">Valor por Aula (R$)</Label>
          <Input
            id="valor_por_aula"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_por_aula}
            onChange={(e) => handleInputChange('valor_por_aula', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => handleInputChange('observacoes', e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col space-y-4">
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