import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  permite_cancelamento: boolean | null;
  permite_parcelamento: boolean | null;
  observacoes: string | null;
  ativo: boolean | null;
  idioma: 'Inglês' | 'Japonês' | 'Inglês/Japonês' | 'particular';
  tipo_valor?: 'plano' | 'plano_material' | 'plano_matricula' | 'plano_completo';
  created_at: string;
  updated_at: string;
}

interface PlanFormProps {
  plan?: Plan | null;
  onSuccess: () => void;
  onCancel: () => void;
  isViewMode?: boolean;
}

const PlanForm = ({ plan, onSuccess, onCancel, isViewMode = false }: PlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    numero_aulas: '',
    frequencia_aulas: 'semanal',
    idioma: 'Inglês' as 'Inglês' | 'Japonês' | 'Inglês/Japonês' | 'particular',
    carga_horaria_total: '',
    valor_total: '',
    valor_por_aula: '',
    modo_duracao: 'minutos' as 'minutos' | 'horas',
    horas_por_aula: '0',
    minutos_por_aula: '50',
    horario_por_aula: '',
    permite_cancelamento: false,
    permite_parcelamento: false,
    observacoes: '',
    ativo: true,
    tipo_valor: 'plano' // novo campo
  });

  const { toast } = useToast();

  const convertToDecimal = (horas: string, minutos: string): number => {
    const h = parseInt(horas) || 0;
    const m = parseInt(minutos) || 0;
    return h + (m / 60);
  };

  const convertFromDecimal = (decimal: number): { horas: string, minutos: string } => {
    const horas = Math.floor(decimal);
    const minutos = Math.round((decimal - horas) * 60);
    return {
      horas: horas.toString(),
      minutos: minutos.toString()
    };
  };

  useEffect(() => {
    if (plan) {
      const { horas, minutos } = convertFromDecimal(plan.horario_por_aula || 0);
      
      setFormData({
        nome: plan.nome,
        descricao: plan.descricao,
        numero_aulas: plan.numero_aulas.toString(),
        frequencia_aulas: plan.frequencia_aulas,
        idioma: plan.idioma || 'Inglês',
        carga_horaria_total: plan.carga_horaria_total?.toString() || '',
        valor_total: plan.valor_total?.toString() || '',
        valor_por_aula: plan.valor_por_aula?.toString() || '',
        modo_duracao: 'minutos',
        horas_por_aula: horas,
        minutos_por_aula: minutos,
        horario_por_aula: plan.horario_por_aula?.toString() || '',
        permite_cancelamento: plan.permite_cancelamento ?? false,
        permite_parcelamento: plan.permite_parcelamento ?? false,
        observacoes: plan.observacoes || '',
        ativo: plan.ativo ?? true,
        tipo_valor: plan.tipo_valor || 'plano'
      });
    }
  }, [plan]);

  useEffect(() => {
    const horas = parseInt(formData.horas_por_aula) || 0;
    const minutos = parseInt(formData.minutos_por_aula) || 0;
    
    let decimal;
    if (formData.modo_duracao === 'minutos') {
      decimal = minutos / 60;
    } else {
      decimal = horas + (minutos / 60);
    }
    
    const horarioDecimal = decimal.toFixed(2);
    if (formData.horario_por_aula !== horarioDecimal) {
      setFormData(prev => ({ ...prev, horario_por_aula: horarioDecimal }));
    }
  }, [formData.horas_por_aula, formData.minutos_por_aula, formData.modo_duracao]);

  useEffect(() => {
    const valorTotal = parseFloat(formData.valor_total) || 0;
    const numeroAulas = parseInt(formData.numero_aulas.toString()) || 0;
    const horarioPorAula = convertToDecimal(formData.horas_por_aula, formData.minutos_por_aula);

    if (valorTotal > 0 && numeroAulas > 0) {
      const valorPorAula = valorTotal / numeroAulas;
      const cargaHorariaTotal = numeroAulas * horarioPorAula;

      const planData = {
        nome: formData.nome,
        descricao: formData.descricao,
        numero_aulas: numeroAulas,
        frequencia_aulas: formData.frequencia_aulas,
        idioma: formData.idioma,
        carga_horaria_total: parseFloat(cargaHorariaTotal.toFixed(2)),
        valor_total: parseFloat(valorTotal.toFixed(2)),
        valor_por_aula: parseFloat(valorPorAula.toFixed(2)),
        horario_por_aula: parseFloat(horarioPorAula.toFixed(2)),
        permite_cancelamento: formData.permite_cancelamento,
        permite_parcelamento: formData.permite_parcelamento,
        observacoes: formData.observacoes || null,
        ativo: formData.ativo
      };

      // DEBUG: Vamos ver exatamente o que está sendo enviado
      console.log('=== DADOS SENDO ENVIADOS ===');
      console.log('planData:', planData);
      console.log('Tipos dos campos:');
      Object.keys(planData).forEach(key => {
        console.log(`${key}: ${typeof planData[key]} = ${planData[key]}`);
      });
      console.log('=============================');

      if (formData.valor_por_aula !== valorPorAula.toFixed(2)) {
        setFormData(prev => ({ ...prev, valor_por_aula: valorPorAula.toFixed(2) }));
      }

      if (formData.carga_horaria_total !== cargaHorariaTotal.toFixed(2)) {
        setFormData(prev => ({ ...prev, carga_horaria_total: cargaHorariaTotal.toFixed(2) }));
      }
    }
  }, [formData.valor_total, formData.numero_aulas, formData.horario_por_aula]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações específicas para cada campo obrigatório
      if (!formData.nome.trim()) {
        toast({
          title: "Campo Obrigatório",
          description: "O campo 'Nome do Plano' é obrigatório.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.descricao.trim()) {
        toast({
          title: "Campo Obrigatório",
          description: "O campo 'Descrição' é obrigatório.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.idioma) {
        toast({
          title: "Campo Obrigatório",
          description: "O campo 'Tipo do Curso' é obrigatório.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.frequencia_aulas) {
        toast({
          title: "Campo Obrigatório",
          description: "O campo 'Frequência das Aulas' é obrigatório.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const valorTotal = parseFloat(formData.valor_total) || 0;
      const numeroAulas = parseInt(formData.numero_aulas.toString()) || 0;
      const horarioPorAula = convertToDecimal(formData.horas_por_aula, formData.minutos_por_aula);

      if (!formData.numero_aulas || numeroAulas <= 0) {
        toast({
          title: "Campo Obrigatório",
          description: "O campo 'Número de Aulas' é obrigatório e deve ser maior que zero.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (horarioPorAula <= 0) {
        toast({
          title: "Campo Obrigatório",
          description: "O campo 'Duração da Aula' é obrigatório e deve ser maior que zero.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.valor_total || valorTotal <= 0) {
        toast({
          title: "Campo Obrigatório",
          description: "O campo 'Valor Total' é obrigatório e deve ser maior que zero.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const valorPorAula = valorTotal / numeroAulas;
      const cargaHorariaTotal = numeroAulas * horarioPorAula;

      const planData = {
        nome: formData.nome,
        descricao: formData.descricao,
        numero_aulas: numeroAulas,
        frequencia_aulas: formData.frequencia_aulas,
        idioma: formData.idioma,
        carga_horaria_total: Math.round(cargaHorariaTotal),
        valor_total: valorTotal,
        valor_por_aula: valorPorAula,
        horario_por_aula: horarioPorAula,
        permite_cancelamento: formData.permite_cancelamento,
        permite_parcelamento: formData.permite_parcelamento,
        observacoes: formData.observacoes || null,
        ativo: formData.ativo,
        tipo_valor: formData.tipo_valor
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
          <Label htmlFor="nome">Nome do Plano *</Label>
          <Input
            id="nome"
            type="text"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            readOnly={isViewMode}
            className={isViewMode ? 'bg-gray-50' : ''}
            required
          />
        </div>

        <div>
          <Label htmlFor="idioma">Tipo do Curso *</Label>
          <Select value={formData.idioma} onValueChange={(value) => handleInputChange('idioma', value)} disabled={isViewMode} required>
            <SelectTrigger className={isViewMode ? 'bg-gray-50' : ''}>
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inglês">Inglês</SelectItem>
              <SelectItem value="Japonês">Japonês</SelectItem>
              <SelectItem value="Inglês/Japonês">Inglês/Japonês</SelectItem>
              <SelectItem value="particular">Particular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numero_aulas">Número de Aulas *</Label>
          <Input
            id="numero_aulas"
            type="number"
            min="1"
            value={formData.numero_aulas}
            onChange={(e) => handleInputChange('numero_aulas', e.target.value)}
            placeholder="Digite o número de aulas"
            readOnly={isViewMode}
            className={isViewMode ? 'bg-gray-50' : ''}
            required
          />
        </div>

        <div>
          <Label>Duração da Aula *</Label>
          
          <div className="flex gap-2 mt-1 mb-2">
            <label className={`flex items-center space-x-1 text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
              formData.modo_duracao === 'minutos' 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}>
              <input
                type="radio"
                name="modo_duracao"
                value="minutos"
                checked={formData.modo_duracao === 'minutos'}
                onChange={(e) => {
                  handleInputChange('modo_duracao', 'minutos');
                  if (formData.modo_duracao === 'horas') {
                    const totalMinutos = (parseInt(formData.horas_por_aula) || 0) * 60 + (parseInt(formData.minutos_por_aula) || 0);
                    if (totalMinutos > 0) {
                      handleInputChange('minutos_por_aula', totalMinutos.toString());
                      handleInputChange('horas_por_aula', '0');
                    }
                  }
                }}
                className="w-3 h-3 accent-red-500"
              />
              <span>Minutos</span>
            </label>
            <label className={`flex items-center space-x-1 text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
              formData.modo_duracao === 'horas' 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
            }`}>
              <input
                type="radio"
                name="modo_duracao"
                value="horas"
                checked={formData.modo_duracao === 'horas'}
                onChange={(e) => {
                  handleInputChange('modo_duracao', 'horas');
                  if (formData.modo_duracao === 'minutos') {
                    const totalMinutos = parseInt(formData.minutos_por_aula) || 0;
                    if (totalMinutos > 0) {
                      const horas = Math.floor(totalMinutos / 60);
                      const minutos = totalMinutos % 60;
                      handleInputChange('horas_por_aula', horas.toString());
                      handleInputChange('minutos_por_aula', minutos.toString());
                    }
                  }
                }}
                className="w-3 h-3 accent-red-500"
              />
              <span>H + Min</span>
            </label>
          </div>

          {formData.modo_duracao === 'minutos' ? (
            <Input
              type="number"
              min="1"
              max="480"
              value={formData.minutos_por_aula}
              onChange={(e) => {
                handleInputChange('minutos_por_aula', e.target.value);
                handleInputChange('horas_por_aula', '0');
              }}
              placeholder="Ex: 50, 90, 120..."
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                max="8"
                value={formData.horas_por_aula}
                onChange={(e) => handleInputChange('horas_por_aula', e.target.value)}
                placeholder="0h"
              />
              <Input
                type="number"
                min="0"
                max="59"
                value={formData.minutos_por_aula}
                onChange={(e) => handleInputChange('minutos_por_aula', e.target.value)}
                placeholder="0min"
              />
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            {(() => {
              const horas = parseInt(formData.horas_por_aula) || 0;
              const minutos = parseInt(formData.minutos_por_aula) || 0;
              const totalMinutos = (horas * 60) + minutos;
              
              if (totalMinutos === 0) return "0 min";
              
              if (formData.modo_duracao === 'minutos') {
                const h = Math.floor(totalMinutos / 60);
                const m = totalMinutos % 60;
                return h > 0 ? `${totalMinutos} min (${h}h ${m}min)` : `${totalMinutos} min`;
              } else {
                return horas > 0 && minutos > 0 ? `${horas}h ${minutos}min` : 
                       horas > 0 ? `${horas}h` : `${minutos} min`;
              }
            })()} • {parseFloat(formData.horario_por_aula || '0').toFixed(2)}h
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          rows={3}
          placeholder="Descreva o plano de pagamento..."
          readOnly={isViewMode}
          className={isViewMode ? 'bg-gray-50' : ''}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="frequencia_aulas">Frequência das Aulas *</Label>
          <Select value={formData.frequencia_aulas} onValueChange={(value) => handleInputChange('frequencia_aulas', value)} disabled={isViewMode} required>
            <SelectTrigger className={isViewMode ? 'bg-gray-50' : ''}>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="quinzenal">Quinzenal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="intensivo">Intensivo</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      <div>
        <Label>Tipo de Valor *</Label>
        <Tabs value={formData.tipo_valor} onValueChange={isViewMode ? undefined : (value) => handleInputChange('tipo_valor', value)} className="w-full">
          <TabsList className={`grid w-full grid-cols-4 ${isViewMode ? 'pointer-events-none bg-gray-50' : ''}`}>
            <TabsTrigger value="plano" disabled={isViewMode}>Plano Básico</TabsTrigger>
            <TabsTrigger value="plano_material" disabled={isViewMode}>Plano + Material</TabsTrigger>
            <TabsTrigger value="plano_matricula" disabled={isViewMode}>Plano + Matrícula</TabsTrigger>
            <TabsTrigger value="plano_completo" disabled={isViewMode}>Plano Completo</TabsTrigger>
          </TabsList>
          <TabsContent value="plano" className="mt-2">
            <p className="text-sm text-gray-600">Valor inclui apenas o plano de aulas</p>
          </TabsContent>
          <TabsContent value="plano_material" className="mt-2">
            <p className="text-sm text-gray-600">Valor inclui o plano de aulas + material didático</p>
          </TabsContent>
          <TabsContent value="plano_matricula" className="mt-2">
            <p className="text-sm text-gray-600">Valor inclui o plano de aulas + taxa de matrícula</p>
          </TabsContent>
          <TabsContent value="plano_completo" className="mt-2">
            <p className="text-sm text-gray-600">Valor inclui o plano de aulas + material + matrícula</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valor_total">Valor Total (R$) *</Label>
          <Input
            id="valor_total"
            type="number"
            min="0"
            step="0.01"
            value={formData.valor_total || ''}
            onChange={(e) => handleInputChange('valor_total', parseFloat(e.target.value) || null)}
            placeholder="0,00"
            readOnly={isViewMode}
            className={isViewMode ? 'bg-gray-50' : ''}
            required
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
          readOnly={isViewMode}
          className={isViewMode ? 'bg-gray-50' : ''}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="permite_cancelamento"
            checked={formData.permite_cancelamento}
            onCheckedChange={(checked) => handleInputChange('permite_cancelamento', checked)}
            disabled={isViewMode}
          />
          <Label htmlFor="permite_cancelamento">Permite cancelamento</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="permite_parcelamento"
            checked={formData.permite_parcelamento}
            onCheckedChange={(checked) => handleInputChange('permite_parcelamento', checked)}
            disabled={isViewMode}
          />
          <Label htmlFor="permite_parcelamento">Permite parcelamento</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => handleInputChange('ativo', checked)}
            disabled={isViewMode}
          />
          <Label htmlFor="ativo">Plano ativo</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {isViewMode ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isViewMode && (
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {plan ? 'Atualizar' : 'Criar'} Plano
          </Button>
        )}
      </div>
    </form>
  );
};

export default PlanForm;