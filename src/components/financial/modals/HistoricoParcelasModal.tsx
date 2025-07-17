import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { History, RefreshCw, Filter, Edit, CheckCircle, AlertTriangle, Clock, XCircle, CreditCard, Calendar, DollarSign, FileText, Archive, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ParcelaHistorico, FiltrosHistorico } from '../types/historico';
import { EditarParcelaHistoricoModal } from './EditarParcelaHistoricoModal.tsx';

interface HistoricoParcelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: { id: string; nome: string } | null;
}

export const HistoricoParcelasModal: React.FC<HistoricoParcelasModalProps> = ({
  isOpen,
  onClose,
  aluno
}) => {
  const [parcelasHistorico, setParcelasHistorico] = useState<ParcelaHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosHistorico>({
    tipo_arquivamento: 'all',
    data_inicio: '',
    data_fim: '',
    status_original: 'all',
    tipo_item: 'all'
  });
  const [editandoParcela, setEditandoParcela] = useState<ParcelaHistorico | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  // Função para formatar moeda
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  // Função para formatar data
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  // Função para ícones de tipo
  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'plano':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'material':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'matrícula':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelamento':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'outros':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  }, []);

  // Função para ícones de status
  const getStatusIcon = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'vencido':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  }, []);

  // Função para obter cor do status
  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Carregar histórico de parcelas
  const carregarHistoricoParcelas = useCallback(async (alunoId: string) => {
    try {
      setLoading(true);
      
      // TODO: Implementar busca na tabela historico_parcelas
      const { data: historicoData, error } = await supabase
        .from('historico_parcelas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_arquivamento', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar histórico:', error);
        // Simular dados para demonstração
        setParcelasHistorico([]);
      } else {
        setParcelasHistorico(historicoData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de parcelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Filtrar parcelas do histórico
  const parcelasFiltradas = useMemo(() => {
    return parcelasHistorico.filter(parcela => {
      const matchTipoArquivamento = !filtros.tipo_arquivamento || filtros.tipo_arquivamento === 'all' || 
        parcela.tipo_arquivamento === filtros.tipo_arquivamento;
      
      // Usar criado_em em vez de data_arquivamento
      const matchDataInicio = !filtros.data_inicio || 
        (parcela.criado_em && new Date(parcela.criado_em) >= new Date(filtros.data_inicio));
      
      const matchDataFim = !filtros.data_fim || 
        (parcela.criado_em && new Date(parcela.criado_em) <= new Date(filtros.data_fim));
      
      const matchStatus = !filtros.status_original || filtros.status_original === 'all' || 
        parcela.status_pagamento === filtros.status_original;
      
      const matchTipoItem = !filtros.tipo_item || filtros.tipo_item === 'all' || 
        parcela.tipo_item === filtros.tipo_item;
      
      return matchTipoArquivamento && matchDataInicio && matchDataFim && matchStatus && matchTipoItem;
    });
  }, [parcelasHistorico, filtros]);

  // Limpar filtros
  const limparFiltros = useCallback(() => {
    setFiltros({
      tipo_arquivamento: 'all',
      data_inicio: '',
      data_fim: '',
      status_original: 'all',
      tipo_item: 'all'
    });
  }, []);

  // Abrir modal de edição
  const abrirModalEdicao = useCallback((parcela: ParcelaHistorico) => {
    setEditandoParcela(parcela);
    setIsEditModalOpen(true);
  }, []);

  // Callback para sucesso na edição
  const handleEdicaoSucesso = useCallback(() => {
    if (aluno) {
      carregarHistoricoParcelas(aluno.id);
    }
  }, [aluno, carregarHistoricoParcelas]);

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && aluno) {
      carregarHistoricoParcelas(aluno.id);
    }
  }, [isOpen, aluno, carregarHistoricoParcelas]);

  if (!aluno) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-red-50 to-gray-100 -m-6 mb-0 p-6 border-b">
            <DialogTitle className="flex items-center space-x-3">
              <motion.div 
                className="bg-gradient-to-r from-red-600 to-gray-800 rounded-full p-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <History className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <span className="text-xl font-semibold text-gray-800">Histórico de Parcelas</span>
                <p className="text-sm text-gray-600 font-normal mt-1">{aluno.nome}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-6 p-2">
            {/* Filtros */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 rounded-full p-2">
                      <Filter className="h-4 w-4 text-red-600" />
                    </div>
                    <CardTitle className="text-lg text-gray-800">Filtros de Pesquisa</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="filtro-tipo-arquivamento" className="text-sm font-medium text-gray-700">Tipo de Arquivamento</Label>
                      <Select 
                        value={filtros.tipo_arquivamento} 
                        onValueChange={(value) => setFiltros(prev => ({...prev, tipo_arquivamento: value}))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="renovacao">Renovação</SelectItem>
                          <SelectItem value="cancelamento">Cancelamento</SelectItem>
                          <SelectItem value="conclusao">Conclusão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="filtro-data-inicio" className="text-sm font-medium text-gray-700">Data Início</Label>
                      <Input
                        id="filtro-data-inicio"
                        type="date"
                        className="mt-1"
                        value={filtros.data_inicio}
                        onChange={(e) => setFiltros(prev => ({...prev, data_inicio: e.target.value}))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="filtro-data-fim" className="text-sm font-medium text-gray-700">Data Fim</Label>
                      <Input
                        id="filtro-data-fim"
                        type="date"
                        className="mt-1"
                        value={filtros.data_fim}
                        onChange={(e) => setFiltros(prev => ({...prev, data_fim: e.target.value}))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="filtro-status" className="text-sm font-medium text-gray-700">Status Original</Label>
                      <Select 
                        value={filtros.status_original} 
                        onValueChange={(value) => setFiltros(prev => ({...prev, status_original: value}))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="vencido">Vencido</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    // Na seção de filtros, atualizar o Select de tipo_item:
                    <div>
                      <Label htmlFor="filtro-tipo-item" className="text-sm font-medium text-gray-700">Tipo de Item</Label>
                      <Select 
                        value={filtros.tipo_item} 
                        onValueChange={(value) => setFiltros(prev => ({...prev, tipo_item: value}))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="plano">Plano</SelectItem>
                          <SelectItem value="material">Material</SelectItem>
                          <SelectItem value="matrícula">Matrícula</SelectItem>
                          <SelectItem value="cancelamento">Cancelamento</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        onClick={limparFiltros}
                        className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                      >
                        <Filter className="h-4 w-4" />
                        <span>Limpar Filtros</span>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Tabela de Histórico */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <Card className="shadow-lg border-0 overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <Archive className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-800">Parcelas Arquivadas</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{parcelasFiltradas.length} parcela{parcelasFiltradas.length !== 1 ? 's' : ''} encontrada{parcelasFiltradas.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800 px-3 py-1">
                      {parcelasFiltradas.length} registros
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="flex items-center space-x-3"
                      >
                        <RefreshCw className="h-8 w-8 text-red-600" />
                      </motion.div>
                      <span className="ml-3 text-lg font-medium text-gray-600">Carregando histórico...</span>
                    </div>
                  ) : (
                    <div className="overflow-auto h-full">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gradient-to-r from-red-600 to-gray-800 z-10">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Tipo Item</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">Parcela</TableHead>
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4" />
                                <span>Valor</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Vencimento</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Pagamento</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">Status</TableHead>
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Descrição do Item</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <Archive className="h-4 w-4" />
                                <span>Tipo Arquivamento</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Data Criação</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Observações</span>
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-white text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                          <AnimatePresence>
                            {parcelasFiltradas.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={11} className="py-16">
                                  <motion.div 
                                    className="flex flex-col items-center justify-center space-y-4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <div className="relative">
                                      <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-gray-200 rounded-full flex items-center justify-center">
                                        <Archive className="h-10 w-10 text-red-400" />
                                      </div>
                                      <motion.div
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        <XCircle className="h-4 w-4 text-white" />
                                      </motion.div>
                                    </div>
                                    
                                    <div className="text-center space-y-2">
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {parcelasHistorico.length === 0 ? 
                                          "Nenhuma parcela no histórico" : 
                                          "Nenhuma parcela encontrada"}
                                      </h3>
                                      <p className="text-gray-500 max-w-md">
                                        {parcelasHistorico.length === 0 ? 
                                          "Este aluno ainda não possui parcelas arquivadas." :
                                          "Nenhuma parcela encontrada com os filtros aplicados."}
                                      </p>
                                    </div>
                                  </motion.div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              parcelasFiltradas.map((parcela, index) => (
                                <motion.tr
                                  key={parcela.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="hover:bg-red-50 transition-colors duration-200 border-b border-gray-100"
                                >
                                  <TableCell className="font-medium py-4 text-base">
                                    <div className="flex items-center gap-2">
                                      {getTipoIcon(parcela.tipo_item)}
                                      <span className="capitalize font-medium text-base">{parcela.tipo_item}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4 text-base font-semibold">{parcela.numero_parcela}</TableCell>
                                  <TableCell className="font-bold py-4 text-base text-green-700">
                                    {formatCurrency(parcela.valor)}
                                  </TableCell>
                                  <TableCell className="py-4 text-base">{formatDate(parcela.data_vencimento)}</TableCell>
                                  <TableCell className="py-4 text-base">
                                    {parcela.data_pagamento ? formatDate(parcela.data_pagamento) : '-'}
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <motion.div whileHover={{ scale: 1.05 }}>
                                      <Badge className={`${getStatusColor(parcela.status_pagamento)} flex items-center gap-1 w-fit`}>
                                        {getStatusIcon(parcela.status_pagamento)}
                                        {parcela.status_pagamento.charAt(0).toUpperCase() + parcela.status_pagamento.slice(1)}
                                      </Badge>
                                    </motion.div>
                                  </TableCell>
                                  <TableCell className="py-4 max-w-xs">
                                    <div className="text-sm text-gray-600">
                                      {parcela.descricao_item ? (
                                        <div className="truncate" title={parcela.descricao_item}>
                                          {parcela.descricao_item}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 italic">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <Badge variant="outline" className="capitalize">
                                      {parcela.tipo_arquivamento || 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-4 text-base">
                                    {parcela.criado_em ? formatDate(parcela.criado_em) : '-'}
                                  </TableCell>
                                  <TableCell className="py-4 max-w-xs">
                                    <div className="text-sm text-gray-600">
                                      {parcela.observacoes ? (
                                        <div className="truncate" title={parcela.observacoes}>
                                          {parcela.observacoes}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 italic">Sem observações</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <div className="flex gap-2 justify-center">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            <Button
                                              size="sm"
                                              onClick={() => abrirModalEdicao(parcela)}
                                              className="bg-gradient-to-r from-red-600 to-gray-800 hover:from-red-700 hover:to-gray-900 text-white h-8 w-8 p-0"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Editar parcela do histórico</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TableCell>
                                </motion.tr>
                              ))
                            )}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Estatísticas do Histórico */}
            {parcelasFiltradas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      </div>
                      <CardTitle className="text-lg text-gray-800">Estatísticas do Histórico</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <motion.div 
                        className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <Archive className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Total de Parcelas</p>
                        <p className="text-2xl font-bold text-blue-600">{parcelasFiltradas.length}</p>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Valor Total</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(parcelasFiltradas.reduce((acc, p) => acc + p.valor, 0))}
                        </p>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Parcelas Pagas</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {parcelasFiltradas.filter(p => p.status_pagamento === 'pago').length}
                        </p>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <DollarSign className="h-6 w-6 text-teal-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Valor Pago</p>
                        <p className="text-2xl font-bold text-teal-600">
                          {formatCurrency(parcelasFiltradas
                            .filter(p => p.status_pagamento === 'pago')
                            .reduce((acc, p) => acc + p.valor, 0))}
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t bg-gradient-to-r from-gray-50 to-white -m-6 mt-0 p-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="hover:bg-red-50 hover:border-red-200 transition-all duration-200"
              >
                Fechar
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Edição */}
      <EditarParcelaHistoricoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        parcela={editandoParcela}
        onSuccess={handleEdicaoSucesso}
      />
    </>
  );
};