import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinancial } from '@/hooks/useFinancial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Despesa {
  id?: number;
  descricao: string;
  valor: number;
  categoria: 'salário' | 'aluguel' | 'material' | 'manutenção';
  data: string;
  status: 'Pago' | 'Pendente';
}

interface CategoriaContrato {
  id: string;
  nome: string;
  descricao?: string;
}

// Função para determinar a cor do status
const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'pago':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const DespesasTable = () => {
  const { state, fetchDespesas } = useFinancial();
  const { despesas, loading } = state;
  const { toast } = useToast();
  
  // Novo estado para categorias
  const [categorias, setCategorias] = useState<CategoriaContrato[]>([]);
  
  // Estados para o modal
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);
  const [editandoDespesa, setEditandoDespesa] = useState<Despesa | null>(null);
  const [salvandoDespesa, setSalvandoDespesa] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState<Partial<Despesa>>({
    descricao: '',
    valor: 0,
    categoria: 'material', // Valor válido do ENUM
    data: new Date().toISOString().split('T')[0],
    status: 'Pendente' // Corrigido: 'Pendente' em vez de 'pendente'
  });

  // Função para buscar categorias
  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_contrato')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  // Carregar categorias ao montar o componente
  useEffect(() => {
    fetchDespesas();
    fetchCategorias();
  }, []);

  const resetarFormulario = () => {
    setNovaDespesa({
      descricao: '',
      valor: 0,
      categoria: 'material', // Valor válido do ENUM
      data: new Date().toISOString().split('T')[0],
      status: 'Pendente' // Corrigido: 'Pendente' em vez de 'pendente'
    });
    setEditandoDespesa(null);
  };

  const abrirModalEdicao = (despesa: Despesa) => {
    setEditandoDespesa(despesa);
    setNovaDespesa({
      descricao: despesa.descricao,
      valor: despesa.valor,
      categoria: despesa.categoria,
      data: despesa.data,
      status: despesa.status
    });
    setModalDespesaAberto(true);
  };

  const fecharModal = () => {
    setModalDespesaAberto(false);
    resetarFormulario();
  };

  const adicionarDespesa = async () => {
    try {
      // Validações
      if (!novaDespesa.descricao?.trim()) {
        toast({
          title: "Erro",
          description: "A descrição é obrigatória.",
          variant: "destructive"
        });
        return;
      }

      if (!novaDespesa.valor || novaDespesa.valor <= 0) {
        toast({
          title: "Erro",
          description: "O valor deve ser maior que zero.",
          variant: "destructive"
        });
        return;
      }

      setSalvandoDespesa(true);

      const despesaData = {
        descricao: novaDespesa.descricao.trim(),
        valor: Number(novaDespesa.valor),
        categoria: novaDespesa.categoria,
        data: novaDespesa.data,
        status: novaDespesa.status
      };

      let error;

      if (editandoDespesa) {
        // Atualizar despesa existente
        const { error: updateError } = await supabase
          .from('despesas')
          .update(despesaData)
          .eq('id', editandoDespesa.id);
        
        error = updateError;
      } else {
        // Criar nova despesa
        const { error: insertError } = await supabase
          .from('despesas')
          .insert([despesaData]);
        
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: editandoDespesa ? "Despesa atualizada com sucesso!" : "Despesa adicionada com sucesso!",
        variant: "default"
      });

      // Recarregar as despesas
      await fetchDespesas();
      
      // Fechar modal e resetar formulário
      fecharModal();
      
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a despesa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSalvandoDespesa(false);
    }
  };

  const excluirDespesa = async (despesaId: number) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
        return;
      }

      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', despesaId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
        variant: "default"
      });

      // Recarregar as despesas
      await fetchDespesas();
      
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a despesa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Carregar despesas ao montar o componente
  useEffect(() => {
    fetchDespesas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando despesas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Despesas</CardTitle>
            <Button 
              onClick={() => {
                resetarFormulario();
                setModalDespesaAberto(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Despesa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma despesa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                despesas.map((despesa) => (
                  <TableRow key={despesa.id}>
                    <TableCell className="font-medium">{despesa.descricao}</TableCell>
                    <TableCell className="capitalize">{despesa.categoria}</TableCell>
                    <TableCell>
                      R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {new Date(despesa.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(despesa.status)}>
                        {despesa.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => abrirModalEdicao(despesa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => excluirDespesa(despesa.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para Adicionar/Editar Despesa */}
      <AnimatePresence>
        {modalDespesaAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={fecharModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editandoDespesa ? 'Editar Despesa' : 'Nova Despesa'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fecharModal}
                  disabled={salvandoDespesa}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={novaDespesa.descricao || ''}
                    onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                    placeholder="Ex: Aluguel, Salários, Material..."
                    disabled={salvandoDespesa}
                  />
                </div>
                
                <div>
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={novaDespesa.valor || ''}
                    onChange={(e) => setNovaDespesa({...novaDespesa, valor: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                    disabled={salvandoDespesa}
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select 
                    value={novaDespesa.categoria || 'material'} 
                    onValueChange={(value) => setNovaDespesa({...novaDespesa, categoria: value as any})}
                    disabled={salvandoDespesa}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salário">Salário</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="manutenção">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novaDespesa.data || ''}
                    onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                    disabled={salvandoDespesa}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={novaDespesa.status || 'Pendente'} 
                    onValueChange={(value) => setNovaDespesa({...novaDespesa, status: value as any})}
                    disabled={salvandoDespesa}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={fecharModal}
                  className="flex-1"
                  disabled={salvandoDespesa}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={adicionarDespesa}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  disabled={salvandoDespesa}
                >
                  {salvandoDespesa ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Salvando...
                    </div>
                  ) : (
                    editandoDespesa ? 'Atualizar' : 'Adicionar'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DespesasTable;