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
import { History, RefreshCw, Filter, Edit, CheckCircle, AlertTriangle, Clock, XCircle, CreditCard, Calendar, DollarSign, FileText, Archive, TrendingUp, Loader2 } from 'lucide-react';
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
        return <XCircle className="h-4 w-4" style={{color: '#D90429'}} />;
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
        return <AlertTriangle className="h-4 w-4" style={{color: '#D90429'}} />;
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
        return 'bg-gray-100 border-gray-200' + ' ' + 'text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Função para calcular o número da parcela por tipo de item
  const calcularNumeroPorTipo = useCallback((parcelas: ParcelaHistorico[], parcelaAtual: ParcelaHistorico) => {
    // Filtrar parcelas do mesmo tipo e ordenar por numero_parcela
    const parcelasMesmoTipo = parcelas
      .filter(p => p.tipo_item === parcelaAtual.tipo_item)
      .sort((a, b) => a.numero_parcela - b.numero_parcela);
    
    // Encontrar a posição da parcela atual na lista ordenada
    const indice = parcelasMesmoTipo.findIndex(p => p.id === parcelaAtual.id);
    
    // Retornar a posição + 1 (numeração começa em 1)
    return indice + 1;
  }, []);

  // Carregar histórico de parcelas
  const carregarHistoricoParcelas = useCallback(async (alunoId: string) => {
    try {
      setLoading(true);
      
      const { data: historicoData, error } = await supabase
        .from('historico_parcelas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('criado_em', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar histórico:', error);
        toast({
          title: "Erro",
          description: `Erro ao carregar histórico: ${error.message}`,
          variant: "destructive"
        });
        setParcelasHistorico([]);
      } else {
        console.log('Histórico carregado:', historicoData);
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
          <DialogHeader className="-m-6 mb-0 p-6 border-b" style={{background: 'linear-gradient(to right, #FEF2F2, #F3F4F6)'}}>
            <DialogTitle className="flex items-center space-x-3">
              <motion.div 
                className="rounded-full p-2" style={{background: 'linear-gradient(to right, #D90429, #1F2937)'}}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <History className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <span className="text-xl font-semibold" style={{color: '#1F2937'}}>Histórico de Parcelas</span>
                <p className="text-sm text-gray-600 font-normal mt-1">{aluno.nome}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto flex flex-col space-y-4 p-4">
            <div className="flex flex-col space-y-6 h-full">
              {/* Filtros */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0"
              >
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="border-b" style={{background: 'linear-gradient(to right, #FEF2F2, #F9FAFB)'}}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <Filter className="h-4 w-4" style={{color: '#D90429'}} />
                      </div>
                      <CardTitle className="text-lg" style={{color: '#1F2937'}}>Filtros de Pesquisa</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo-arquivamento" className="text-sm font-medium" style={{color: '#6B7280'}}>
                          Tipo de Arquivamento
                        </Label>
                        <Select value={filtros.tipo_arquivamento} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo_arquivamento: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="automatico">Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data-inicio" className="text-sm font-medium" style={{color: '#6B7280'}}>
                          Data Início
                        </Label>
                        <Input
                          id="data-inicio"
                          type="date"
                          value={filtros.data_inicio}
                          onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data-fim" className="text-sm font-medium" style={{color: '#6B7280'}}>
                          Data Fim
                        </Label>
                        <Input
                          id="data-fim"
                          type="date"
                          value={filtros.data_fim}
                          onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status-original" className="text-sm font-medium" style={{color: '#6B7280'}}>
                          Status Original
                        </Label>
                        <Select value={filtros.status_original} onValueChange={(value) => setFiltros(prev => ({ ...prev, status_original: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="vencido">Vencido</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tipo-item" className="text-sm font-medium" style={{color: '#6B7280'}}>
                          Tipo de Item
                        </Label>
                        <Select value={filtros.tipo_item} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo_item: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="mensalidade">Mensalidade</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="uniforme">Uniforme</SelectItem>
                            <SelectItem value="taxa">Taxa</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        onClick={limparFiltros}
                        className="transition-all duration-200" onMouseEnter={(e) => {(e.target as HTMLElement).style.backgroundColor = '#FEF2F2'; (e.target as HTMLElement).style.borderColor = '#FECACA'}} onMouseLeave={(e) => {(e.target as HTMLElement).style.backgroundColor = ''; (e.target as HTMLElement).style.borderColor = ''}}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tabela de Parcelas Arquivadas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 min-h-0"
              >
                <Card className="shadow-lg border-0 overflow-hidden h-full flex flex-col">
                  <CardHeader className="border-b flex-shrink-0" style={{background: 'linear-gradient(to right, #FEF2F2, #F9FAFB)'}}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 rounded-full p-2">
                          <Archive className="h-4 w-4" style={{color: '#D90429'}} />
                        </div>
                        <CardTitle className="text-lg" style={{color: '#1F2937'}}>Parcelas Arquivadas</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        {parcelasFiltradas.length} parcela{parcelasFiltradas.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center space-y-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="h-8 w-8" style={{color: '#D90429'}} />
                          </motion.div>
                          <p className="text-gray-600">Carregando histórico...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-auto h-full">
                        <Table>
                          <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow className="border-b-2 border-gray-200">
                              <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Tipo</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Parcela</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Valor</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Vencimento</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Pagamento</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Status</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Descrição</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Arquivamento</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Data Arquivo</TableHead>
                <TableHead className="font-semibold py-4 text-base" style={{color: '#6B7280'}}>Observações</TableHead>
                <TableHead className="font-semibold py-4 text-base text-center" style={{color: '#6B7280'}}>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {parcelasFiltradas.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={11} className="text-center py-12">
                                    <div className="flex flex-col items-center space-y-4">
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                      >
                                        <Archive className="h-16 w-16 text-gray-300" />
                                      </motion.div>
                                      <div className="text-center">
                                        <p className="text-lg font-medium text-gray-500">Nenhuma parcela arquivada encontrada</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                          Ajuste os filtros para encontrar parcelas específicas
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                parcelasFiltradas.map((parcela, index) => (
                                  <motion.tr
                                    key={parcela.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="transition-colors duration-200 border-b" style={{borderBottomColor: '#F3F4F6'}} onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#FEF2F2'} onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = ''}
                                  >
                                    <TableCell className="font-medium py-4 text-base">
                                      <div className="flex items-center gap-2">
                                        {getTipoIcon(parcela.tipo_item)}
                                        <span className="capitalize font-medium text-base">{parcela.tipo_item}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-base font-semibold">{calcularNumeroPorTipo(parcelasHistorico, parcela)}</TableCell>
                                    <TableCell className="font-bold py-4 text-base" style={{color: '#15803D'}}>
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
                                          {parcela.status_pagamento?.charAt(0).toUpperCase() + parcela.status_pagamento?.slice(1)}
                                        </Badge>
                                      </motion.div>
                                    </TableCell>
                                    <TableCell className="py-4 max-w-xs">
                                      <div className="text-sm" style={{color: '#6B7280'}}>
                                        {parcela.descricao_item ? (
                                          <div className="truncate" title={parcela.descricao_item}>
                                            {parcela.descricao_item}
                                          </div>
                                        ) : (
                                          <span className="italic" style={{color: '#9CA3AF'}}>-</span>
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
                                      <div className="text-sm" style={{color: '#6B7280'}}>
                                        {parcela.observacoes ? (
                                          <div className="truncate" title={parcela.observacoes}>
                                            {parcela.observacoes}
                                          </div>
                                        ) : (
                                          <span className="italic" style={{color: '#9CA3AF'}}>Sem observações</span>
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
                                                className="text-white h-8 w-8 p-0" style={{background: 'linear-gradient(to right, #D90429, #1F2937)'}} onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #B91C1C, #111827)'} onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'linear-gradient(to right, #D90429, #1F2937)'}
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
              
              {/* Estatísticas do Histórico - Agora abaixo da tabela com tamanho reduzido */}
              {parcelasFiltradas.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex-shrink-0"
                >
                  <Card className="shadow-md border-0 overflow-hidden">
                    <CardHeader className="border-b py-3" style={{background: 'linear-gradient(to right, #F9FAFB, #FFFFFF)'}}>
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full p-1.5" style={{backgroundColor: '#FEE2E2'}}>
                          <TrendingUp className="h-3 w-3" style={{color: '#D90429'}} />
                        </div>
                        <CardTitle className="text-sm" style={{color: '#1F2937'}}>Estatísticas do Histórico</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <motion.div 
                          className="text-center p-3 bg-[#F9FAFB] rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-center mb-1">
                            <Archive className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-xs font-medium" style={{color: '#6B7280'}}>Total de Parcelas</p>
                          <p className="text-lg font-bold text-blue-600">{parcelasFiltradas.length}</p>
                        </motion.div>
                        <motion.div 
                          className="text-center p-3 bg-[#F9FAFB] rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-xs font-medium" style={{color: '#6B7280'}}>Valor Total</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(parcelasFiltradas.reduce((acc, p) => acc + p.valor, 0))}
                          </p>
                        </motion.div>
                        <motion.div 
                          className="text-center p-3 bg-[#F9FAFB] rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-center mb-1">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </div>
                          <p className="text-xs font-medium" style={{color: '#6B7280'}}>Parcelas Pagas</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {parcelasFiltradas.filter(p => p.status_pagamento === 'pago').length}
                          </p>
                        </motion.div>
                        <motion.div 
                          className="text-center p-3 bg-[#F9FAFB] rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="h-4 w-4 text-teal-600" />
                          </div>
                          <p className="text-xs font-medium" style={{color: '#6B7280'}}>Valor Pago</p>
                          <p className="text-lg font-bold text-teal-600">
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
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t -m-6 mt-0 p-6" style={{background: 'linear-gradient(to right, #F9FAFB, #FFFFFF)'}}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="transition-all duration-200" onMouseEnter={(e) => {(e.target as HTMLElement).style.backgroundColor = '#FEF2F2'; (e.target as HTMLElement).style.borderColor = '#FECACA'}} onMouseLeave={(e) => {(e.target as HTMLElement).style.backgroundColor = ''; (e.target as HTMLElement).style.borderColor = ''}}
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

