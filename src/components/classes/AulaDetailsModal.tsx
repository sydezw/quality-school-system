import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Edit, BookOpen, CheckCircle, X, UserCheck, UserX, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos simplificados para evitar recursão
interface AulaType {
  id: string;
  titulo: string | null;
  data: string;
  horario_inicio: string | null;
  horario_fim: string | null;
  descricao: string | null;
  conteudo: string | null;
  observacoes: string | null;
  status: string | null;
  turma_id: string;
  professor_id: string | null;
  created_at: string;
  updated_at: string;
  semestre: string | null;
  tipo_aula: 'normal' | 'avaliativa' | 'prova_final' | null;
}

interface TurmaSimplificada {
  id: string;
  nome: string;
  idioma: "Inglês" | "Japonês" | "Inglês/Japonês" | "particular";
  nivel: "Book 1" | "Book 2" | "Book 3" | "Book 4" | "Book 5" | "Book 6" | "Book 7" | "Book 8" | "Book 9" | "Book 10";
  cor_calendario: string;
  professor_id: string;
  total_aulas: number | null;
  professores: {
    id: string;
    nome: string;
  } | null;
}

interface AulaComTurma extends AulaType {
  turmas: TurmaSimplificada | null;
}

interface AlunoTurma {
  id: string;
  aluno_id: string;
  turma_id: string;
  alunos: {
    id: string;
    nome: string;
    cpf: string | null;
  };
}

interface PresencaRecord {
  id: string;
  aula_id: string;
  aluno_id: string | null;
  aluno_turma_id: string | null;
  status: 'Presente' | 'Falta' | 'Reposta';
  created_at: string;
  updated_at: string;
}

interface AulaDetailsModalProps {
  aula: AulaComTurma | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (aula: AulaComTurma) => void;
}

/**
 * Modal unificado de detalhes da aula
 * 
 * Funcionalidades:
 * - Visualização completa dos detalhes da aula
 * - Controle de presença dos alunos
 * - Edição da aula
 * - Interface responsiva e moderna
 */
const AulaDetailsModal: React.FC<AulaDetailsModalProps> = ({
  aula,
  isOpen,
  onClose,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState('detalhes');
  const [alunosTurma, setAlunosTurma] = useState<AlunoTurma[]>([]);
  const [presencas, setPresencas] = useState<PresencaRecord[]>([]);
  const [presencasPendentes, setPresencasPendentes] = useState<{[alunoId: string]: 'Presente' | 'Falta' | 'Reposta'}>({});
  const [loading, setLoading] = useState(false);
  const [salvandoPresenca, setSalvandoPresenca] = useState(false);
  const [salvandoAlteracoes, setSalvandoAlteracoes] = useState(false);
  const { toast } = useToast();

  // Verificar se é uma aula especial (avaliativa ou prova final)
  const isSpecialLesson = aula?.tipo_aula === 'avaliativa' || aula?.tipo_aula === 'prova_final';
  
  // Renderizar modal especial para aulas avaliativas e provas finais
  if (isSpecialLesson) {
    const tipoAula = aula?.tipo_aula === 'avaliativa' ? 'Avaliativa' : 'Prova Final';
    const corTema = aula?.tipo_aula === 'avaliativa' ? 'green' : 'blue';
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className={`text-center text-xl font-bold ${
              aula?.tipo_aula === 'avaliativa' ? 'text-green-700' : 'text-blue-700'
            }`}>
              Aula {tipoAula}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              aula?.tipo_aula === 'avaliativa' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <BookOpen className={`w-8 h-8 ${
                aula?.tipo_aula === 'avaliativa' ? 'text-green-600' : 'text-blue-600'
              }`} />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Modal em Desenvolvimento
              </h3>
              <p className="text-sm text-gray-600">
                O modal específico para aulas {tipoAula.toLowerCase()}s ainda está em criação.
              </p>
              <p className="text-xs text-gray-500">
                Rota futura: <code className={`px-2 py-1 rounded ${
                  aula?.tipo_aula === 'avaliativa' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  /components/classes/{aula?.tipo_aula === 'avaliativa' ? 'AulaAvaliativaModal.tsx' : 'AulaProvaFinalModal.tsx'}
                </code>
              </p>
            </div>
            
            <Button 
              onClick={onClose}
              className={`mt-4 ${
                aula?.tipo_aula === 'avaliativa' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Função para formatar horário
  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  // Carregar alunos da turma e presenças existentes
  useEffect(() => {
    if (aula && isOpen) {
      carregarDadosPresenca();
    }
  }, [aula, isOpen]);

  const carregarDadosPresenca = async () => {
    if (!aula?.turmas?.id) return;

    setLoading(true);
    try {
      // Carregar alunos da turma
      const { data: alunosData, error: alunosError } = await supabase
        .from('aluno_turma')
        .select(`
          id,
          aluno_id,
          turma_id,
          alunos (
            id,
            nome,
            cpf
          )
        `)
        .eq('turma_id', aula.turmas.id);

      if (alunosError) throw alunosError;

      setAlunosTurma(alunosData || []);

      // Carregar presenças existentes para esta aula
      const { data: presencasData, error: presencasError } = await supabase
        .from('presencas')
        .select('*')
        .eq('aula_id', aula.id);

      if (presencasError) throw presencasError;

      setPresencas(presencasData || []);
    } catch (error) {
      console.error('Erro ao carregar dados de presença:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de presença.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para obter status de presença de um aluno
  const getPresencaStatus = (alunoId: string): 'Presente' | 'Falta' | 'Reposta' | null => {
    // Verificar primeiro se há alteração pendente
    if (presencasPendentes[alunoId]) {
      return presencasPendentes[alunoId];
    }
    // Caso contrário, usar o status salvo
    const presenca = presencas.find(p => p.aluno_id === alunoId);
    return presenca?.status || null;
  };

  // Função para marcar presença (apenas localmente)
  const marcarPresenca = (alunoId: string, alunoTurmaId: string, status: 'Presente' | 'Falta' | 'Reposta') => {
    setPresencasPendentes(prev => ({
      ...prev,
      [alunoId]: status
    }));
  };

  // Função para salvar todas as alterações
  const salvarAlteracoes = async () => {
    if (!aula || Object.keys(presencasPendentes).length === 0) return;

    setSalvandoAlteracoes(true);
    try {
      const operacoes = [];

      for (const [alunoId, status] of Object.entries(presencasPendentes)) {
        const presencaExistente = presencas.find(p => p.aluno_id === alunoId);
        const alunoTurma = alunosTurma.find(at => at.aluno_id === alunoId);

        if (presencaExistente) {
          // Atualizar presença existente
          operacoes.push(
            supabase
              .from('presencas')
              .update({ status })
              .eq('id', presencaExistente.id)
          );
        } else if (alunoTurma) {
          // Criar nova presença
          operacoes.push(
            supabase
              .from('presencas')
              .insert({
                aula_id: aula.id,
                aluno_id: alunoId,
                aluno_turma_id: alunoTurma.id,
                status
              })
          );
        }
      }

      // Executar todas as operações
      const resultados = await Promise.all(operacoes);
      
      // Verificar se houve erros
      const erros = resultados.filter(r => r.error);
      if (erros.length > 0) {
        throw new Error('Erro ao salvar algumas presenças');
      }

      // Recarregar dados após salvar
      await carregarDadosPresenca();
      
      // Limpar alterações pendentes
      setPresencasPendentes({});

      toast({
        title: "Sucesso",
        description: `${Object.keys(presencasPendentes).length} presença(s) salva(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações de presença.",
        variant: "destructive",
      });
    } finally {
      setSalvandoAlteracoes(false);
    }
  };

  // Verificar se há alterações pendentes
  const temAlteracoesPendentes = Object.keys(presencasPendentes).length > 0;

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Presente':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Falta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Reposta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Presente':
        return <UserCheck className="h-4 w-4" />;
      case 'Falta':
        return <UserX className="h-4 w-4" />;
      case 'Reposta':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!aula) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
        <TooltipProvider>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full flex flex-col"
          >
            <DialogHeader className="pb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-[#D90429] to-[#B8001F] rounded-lg shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-[#D90429] to-[#B8001F] bg-clip-text text-transparent font-bold">
                  {aula.titulo || 'Detalhes da Aula'}
                </span>
              </DialogTitle>
            </motion.div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-100 to-gray-200 p-0.5 rounded-lg border border-gray-300 shadow-lg backdrop-blur-sm">
              <TabsTrigger 
                value="detalhes" 
                className={cn(
                   "flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out transform",
                  "hover:scale-102 hover:shadow-md",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D90429] data-[state=active]:to-[#B8001F]",
                   "data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-102",
                   "data-[state=active]:ring-2 data-[state=active]:ring-[#D90429] data-[state=active]:ring-opacity-50",
                   "data-[state=active]:border data-[state=active]:border-[#B8001F]",
                  "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-[#D90429]",
                  "data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:shadow-sm"
                )}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookOpen className="h-4 w-4" />
                </motion.div>
                <span className="font-bold tracking-wide">Detalhes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="presenca" 
                className={cn(
                   "flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out transform",
                  "hover:scale-102 hover:shadow-md",
                  "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#D90429] data-[state=active]:to-[#B8001F]",
                   "data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:scale-102",
                   "data-[state=active]:ring-2 data-[state=active]:ring-[#D90429] data-[state=active]:ring-opacity-50",
                   "data-[state=active]:border data-[state=active]:border-[#B8001F]",
                   "data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-[#D90429]",
                  "data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:shadow-sm"
                )}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="h-4 w-4" />
                </motion.div>
                <span className="font-bold tracking-wide">Presença</span>
                {temAlteracoesPendentes && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 h-2 w-2 bg-yellow-400 rounded-full shadow-sm"
                  />
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="detalhes" className="space-y-6 m-0">
                <motion.div
                  key="detalhes-tab"
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {/* Informações principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Status</label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <Badge 
                          variant={aula.status === 'concluida' ? 'default' : 'secondary'}
                          className={`${
                            aula.status === 'concluida' 
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                              : aula.status === 'cancelada'
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                              : 'bg-gradient-to-r from-[#D90429] to-[#B8001F] text-white'
                          } font-medium px-3 py-1`}
                        >
                          {aula.status}
                        </Badge>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Data
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">{formatDate(aula.data)}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horário
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">
                          {formatTime(aula.horario_inicio)} - {formatTime(aula.horario_fim)}
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Turma
                      </label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">{aula.turmas?.nome}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Idioma/Nível</label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">
                          {aula.turmas?.idioma} - {aula.turmas?.nivel}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="space-y-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Professor</label>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 font-medium">
                          {aula.turmas?.professores?.nome || 'Não definido'}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Conteúdo */}
                  {aula.conteudo && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Conteúdo</label>
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 leading-relaxed">{aula.conteudo}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Descrição */}
                  {aula.descricao && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <label className="text-sm font-semibold text-[#D90429] uppercase tracking-wide">Descrição</label>
                      <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-900 leading-relaxed">{aula.descricao}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="presenca" className="space-y-6 m-0">
                <motion.div
                  key="presenca-tab"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Controle de Presença
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D90429] mx-auto"></div>
                          <p className="text-gray-500 mt-2">Carregando alunos...</p>
                        </div>
                      ) : alunosTurma.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Nenhum aluno encontrado nesta turma</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {alunosTurma.map((alunoTurma) => {
                                const status = getPresencaStatus(alunoTurma.aluno_id);
                                return (
                                  <TableRow key={alunoTurma.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{alunoTurma.alunos.nome}</p>
                                        <p className="text-sm text-gray-500">{alunoTurma.alunos.cpf}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {status ? (
                                        <Badge className={cn(
                                          "flex items-center gap-1 w-fit",
                                          getStatusColor(status)
                                        )}>
                                          {getStatusIcon(status)}
                                          {status}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Não marcado</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant={status === 'Presente' ? 'default' : 'outline'}
                                              className={cn(
                                                "h-8 px-2",
                                                status === 'Presente' && "bg-green-600 hover:bg-green-700"
                                              )}
                                              onClick={() => marcarPresenca(alunoTurma.aluno_id, alunoTurma.id, 'Presente')}
                                              disabled={salvandoAlteracoes}
                                            >
                                              <UserCheck className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Marcar como presente</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant={status === 'Falta' ? 'default' : 'outline'}
                                              className={cn(
                                                "h-8 px-2",
                                                status === 'Falta' && "bg-red-600 hover:bg-red-700"
                                              )}
                                              onClick={() => marcarPresenca(alunoTurma.aluno_id, alunoTurma.id, 'Falta')}
                                              disabled={salvandoAlteracoes}
                                            >
                                              <UserX className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Marcar como falta</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant={status === 'Reposta' ? 'default' : 'outline'}
                                              className={cn(
                                                "h-8 px-2",
                                                status === 'Reposta' && "bg-blue-600 hover:bg-blue-700"
                                              )}
                                              onClick={() => marcarPresenca(alunoTurma.aluno_id, alunoTurma.id, 'Reposta')}
                                              disabled={salvandoAlteracoes}
                                            >
                                              <RotateCcw className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Marcar como reposta (falta justificada)</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          
                          {/* Botão de Salvar Alterações */}
                          {temAlteracoesPendentes && (
                            <motion.div 
                              className="flex justify-end mt-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={salvarAlteracoes}
                                    disabled={salvandoAlteracoes}
                                    className="bg-[#D90429] hover:bg-[#B8001F] text-white flex items-center gap-2"
                                  >
                                    {salvandoAlteracoes ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                      <Save className="h-4 w-4" />
                                    )}
                                    {salvandoAlteracoes ? 'Salvando...' : `Salvar ${Object.keys(presencasPendentes).length} Alteração(ões)`}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Salvar todas as alterações de presença</p>
                                </TooltipContent>
                              </Tooltip>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Ações */}
          <motion.div 
            className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Fechar
              </Button>
            </motion.div>
            
            {onEdit && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(aula)}
                  className="flex items-center gap-2 border-[#D90429] text-[#D90429] hover:bg-[#D90429] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Edit className="h-4 w-4" />
                  Editar Aula
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};

export { AulaDetailsModal };