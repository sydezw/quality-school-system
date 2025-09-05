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
import { Plus, Edit, Trash2, X, DollarSign, Calendar, Building2, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinancial } from '@/hooks/useFinancial';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';
import { Despesa } from '@/types/financial';

interface DespesaLocal {
  id?: string;
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
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors';
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-colors';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
  }
};

// Função para obter ícone da categoria
const getCategoriaIcon = (categoria: string) => {
  switch (categoria.toLowerCase()) {
    case 'salário':
      return <DollarSign className="h-4 w-4 text-green-600" />;
    case 'aluguel':
      return <Building2 className="h-4 w-4 text-blue-600" />;
    case 'material':
      return <Calendar className="h-4 w-4 text-purple-600" />;
    case 'manutenção':
      return <Wrench className="h-4 w-4 text-orange-600" />;
    default:
      return <DollarSign className="h-4 w-4 text-gray-600" />;
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
  const [salvandoDespesa, setSalvandoDespesa] = useState(false);
  const [editandoDespesa, setEditandoDespesa] = useState<DespesaLocal | null>(null);
  const [novaDespesa, setNovaDespesa] = useState<DespesaLocal>({
    descricao: '',
    valor: 0,
    categoria: 'material', // Valor válido do ENUM
    data: new Date().toISOString().split('T')[0],
    status: 'Pendente' // Corrigido: 'Pendente' em vez de 'pendente'
  });

  // Função para buscar categorias (usando enum fixo já que não há tabela específica)
  const fetchCategorias = async () => {
    try {
      // Como não há tabela de categorias específica, usar valores fixos do enum
      const categoriasFixas = [
        { id: 'salário', nome: 'Salário' },
        { id: 'aluguel', nome: 'Aluguel' },
        { id: 'material', nome: 'Material' },
        { id: 'manutenção', nome: 'Manutenção' }
      ];
      setCategorias(categoriasFixas);
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
    const despesaLocal: DespesaLocal = {
      id: despesa.id,
      descricao: despesa.descricao,
      valor: despesa.valor,
      categoria: despesa.categoria as 'salário' | 'aluguel' | 'material' | 'manutenção',
      data: despesa.data,
      status: despesa.status as 'Pago' | 'Pendente'
    };
    setEditandoDespesa(despesaLocal);
    setNovaDespesa({
      descricao: despesa.descricao,
      valor: despesa.valor,
      categoria: despesa.categoria as 'salário' | 'aluguel' | 'material' | 'manutenção',
      data: despesa.data,
      status: despesa.status as 'Pago' | 'Pendente'
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
          .eq('id', editandoDespesa.id!);
        
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

  const excluirDespesa = async (despesaId: string) => {
    try {
      if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
        return;
      }

      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', despesaId.toString());

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
      <div className="flex items-center justify-center py-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600 font-medium">Carregando despesas...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0 bg-[#F9FAFB] hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-700 flex items-center gap-3">
                  <DollarSign className="h-6 w-6" />
                  Despesas
                </CardTitle>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => {
                      resetarFormulario();
                      setModalDespesaAberto(true);
                    }}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Despesa
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Descrição</TableHead>
                      <TableHead className="font-semibold text-gray-700">Categoria</TableHead>
                      <TableHead className="font-semibold text-gray-700">Valor</TableHead>
                      <TableHead className="font-semibold text-gray-700">Data</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {despesas.length === 0 ? (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <p className="text-lg font-medium">Nenhuma despesa encontrada</p>
                              <p className="text-sm text-gray-400 mt-2">Clique em "Nova Despesa" para começar</p>
                            </motion.div>
                          </TableCell>
                        </motion.tr>
                      ) : (
                        despesas.map((despesa, index) => (
                          <motion.tr
                            key={despesa.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <TableCell className="font-medium">{despesa.descricao}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getCategoriaIcon(despesa.categoria)}
                                <span className="capitalize">{despesa.categoria}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              {formatDate(despesa.data)}
                            </TableCell>
                            <TableCell>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Badge className={getStatusColor(despesa.status)}>
                                  {despesa.status}
                                </Badge>
                              </motion.div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => abrirModalEdicao(despesa)}
                                    className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => excluirDespesa(despesa.id)}
                                    className="hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Modal para Adicionar/Editar Despesa */}
      <AnimatePresence>
        {modalDespesaAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={fecharModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                  {editandoDespesa ? 'Editar Despesa' : 'Nova Despesa'}
                </h3>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fecharModal}
                    disabled={salvandoDespesa}
                    className="hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div>
                  <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={novaDespesa.descricao || ''}
                    onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                    placeholder="Ex: Aluguel, Salários, Material..."
                    disabled={salvandoDespesa}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="valor" className="text-sm font-semibold text-gray-700">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={novaDespesa.valor || ''}
                    onChange={(e) => setNovaDespesa({...novaDespesa, valor: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                    disabled={salvandoDespesa}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria" className="text-sm font-semibold text-gray-700">Categoria</Label>
                  <Select 
                    value={novaDespesa.categoria || 'material'} 
                    onValueChange={(value) => setNovaDespesa({...novaDespesa, categoria: value as any})}
                    disabled={salvandoDespesa}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salário">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Salário
                        </div>
                      </SelectItem>
                      <SelectItem value="aluguel">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          Aluguel
                        </div>
                      </SelectItem>
                      <SelectItem value="material">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          Material
                        </div>
                      </SelectItem>
                      <SelectItem value="manutenção">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-orange-600" />
                          Manutenção
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="data" className="text-sm font-semibold text-gray-700">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novaDespesa.data || ''}
                    onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                    disabled={salvandoDespesa}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</Label>
                  <Select 
                    value={novaDespesa.status || 'Pendente'} 
                    onValueChange={(value) => setNovaDespesa({...novaDespesa, status: value as any})}
                    disabled={salvandoDespesa}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex gap-3 mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    onClick={fecharModal}
                    className="w-full border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                    disabled={salvandoDespesa}
                  >
                    Cancelar
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={adicionarDespesa}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] transition-all duration-200"
                    disabled={salvandoDespesa}
                  >
                    {salvandoDespesa ? (
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div 
                          className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Salvando...
                      </motion.div>
                    ) : (
                      editandoDespesa ? 'Atualizar' : 'Adicionar'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DespesasTable;