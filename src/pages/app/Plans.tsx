import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Users, Clock, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PlanForm from '@/components/plans/PlanForm';
import PlanStudentsModal from '@/components/plans/PlanStudentsModal';


interface Plan {
  id: string;
  nome: string;
  descricao: string;
  numero_aulas: number;
  frequencia_aulas: string;
  horario_por_aula: number | null;
  carga_horaria_total: number | null;
  valor_total: number | null;
  valor_por_aula: number | null;
  permite_cancelamento: boolean | null;
  permite_parcelamento: boolean | null;
  observacoes: string | null;
  ativo: boolean | null;
  idioma: 'Inglês' | 'Japonês' | 'Inglês/Japonês';
  tipo_valor?: 'plano' | 'plano_material' | 'plano_matricula' | 'plano_completo';
  created_at: string;
  updated_at: string;
}

const Plans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('todos');
  
  const { toast } = useToast();

  useEffect(() => {
    const initializePlans = async () => {
      try {
        await fetchPlans();
      } catch (err) {
        console.error('Erro ao inicializar planos:', err);
        setError('Erro ao carregar a página de planos');
        setLoading(false);
      }
    };
    
    initializePlans();
  }, []);

  useEffect(() => {
    try {
      let filtered = plans.filter(plan =>
        plan.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Filtrar por idioma
      if (selectedLanguage !== 'todos') {
        filtered = filtered.filter(plan => plan.idioma === selectedLanguage);
      }
      
      setFilteredPlans(filtered);
    } catch (err) {
      console.error('Erro ao filtrar planos:', err);
      setFilteredPlans(plans);
    }
  }, [plans, searchTerm, selectedLanguage]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('planos')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const plansData = data || [];
      
      // Debug: verificar estrutura dos dados
      console.log('Plans data from database:', plansData);
      if (plansData.length > 0) {
        console.log('First plan frequencia_aulas:', plansData[0].frequencia_aulas, typeof plansData[0].frequencia_aulas);
      }
      
      // Converter e normalizar dados para garantir compatibilidade de tipos
      const typedPlansData: Plan[] = plansData.map(plan => ({
        ...plan,
        frequencia_aulas: String(plan.frequencia_aulas || ''),
        numero_aulas: Number(plan.numero_aulas) || 0,
        permite_cancelamento: plan.permite_cancelamento ?? true,
        permite_parcelamento: plan.permite_parcelamento ?? true,
        ativo: plan.ativo ?? true,
        idioma: plan.idioma as 'Inglês' | 'Japonês' | 'Inglês/Japonês',
        tipo_valor: plan.tipo_valor as 'plano' | 'plano_material' | 'plano_matricula' | 'plano_completo' | undefined
      }));
      
      setPlans(typedPlansData);
      
      // Buscar contagem de alunos para cada plano
      if (plansData.length > 0) {
        await fetchStudentCounts(plansData.map(plan => plan.id));
      }
    } catch (error: any) {
      console.error('Erro ao buscar planos:', error);
      setError(error.message || 'Erro ao carregar planos');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar planos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCounts = async (planIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('plano_id')
        .in('plano_id', planIds);

      if (error) {
        console.error('Erro ao buscar contagem de alunos:', error);
        return;
      }

      const counts: Record<string, number> = {};
      data?.forEach(contract => {
        if (contract.plano_id) {
          counts[contract.plano_id] = (counts[contract.plano_id] || 0) + 1;
        }
      });
      
      setStudentCounts(counts);
    } catch (error) {
      console.error('Erro ao buscar contagem de alunos:', error);
    }
  };

  const handleNewPlan = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    setDeletingPlan(plan);
  };

  const confirmDeletePlan = async () => {
    if (!deletingPlan) return;

    try {
      // Verificar se há registros financeiros vinculados ao plano
      const { data: financialRecords, error: financialError } = await supabase
        .from('financeiro_alunos')
        .select('id')
        .eq('plano_id', deletingPlan.id)
        .limit(1);

      if (financialError) {
        console.error('Erro ao verificar registros financeiros:', financialError);
        toast({
          title: 'Erro',
          description: 'Erro ao verificar vinculações do plano.',
          variant: 'destructive',
        });
        return;
      }

      // Se há registros financeiros, impedir a exclusão
      if (financialRecords && financialRecords.length > 0) {
        toast({
          title: 'Exclusão não permitida',
          description: `Não é possível excluir o plano "${deletingPlan.nome}" pois há alunos vinculados a ele. Para excluir este plano, primeiro remova todos os alunos associados.`,
          variant: 'destructive',
        });
        setDeletingPlan(null);
        return;
      }

      // Se não há registros financeiros, prosseguir com a exclusão
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', deletingPlan.id);

      if (error) {
        console.error('Erro ao excluir plano:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao excluir plano.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Plano excluído com sucesso!',
      });

      fetchPlans();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir plano.',
        variant: 'destructive',
      });
    } finally {
      setDeletingPlan(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
    fetchPlans();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
  };

  const handleViewStudents = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowStudentsModal(true);
  };

  // Função para formatar o tipo de valor
  const formatTipoValor = (tipo?: string) => {
    switch (tipo) {
      case 'plano':
        return 'Plano Básico';
      case 'plano_material':
        return 'Plano + Material';
      case 'plano_matricula':
        return 'Plano + Matrícula';
      case 'plano_completo':
        return 'Plano Completo';
      default:
        return 'Plano Básico';
    }
  };

  // Função para cor do badge do tipo de valor
  const getTipoValorColor = (tipo?: string) => {
    switch (tipo) {
      case 'plano':
        return 'bg-blue-100 text-blue-800';
      case 'plano_material':
        return 'bg-green-100 text-green-800';
      case 'plano_matricula':
        return 'bg-orange-100 text-orange-800';
      case 'plano_completo':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
        <Button onClick={handleNewPlan}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {/* Filtro por idioma */}
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os idiomas</SelectItem>
            <SelectItem value="Inglês">Inglês</SelectItem>
            <SelectItem value="Japonês">Japonês</SelectItem>
            <SelectItem value="Inglês/Japonês">Inglês/Japonês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-destructive mb-2">Erro ao carregar planos</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchPlans} variant="outline">
            Tentar novamente
          </Button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum plano encontrado' : 'Nenhum plano cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando seu primeiro plano de ensino'}
          </p>
          {!searchTerm && (
            <Button onClick={handleNewPlan}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{plan.nome}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs mr-1">
                      {plan.idioma}
                    </Badge>
                    {plan.ativo ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Badge do tipo de valor */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoValorColor(plan.tipo_valor)}`}>
                    {formatTipoValor(plan.tipo_valor)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {plan.descricao}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{plan.numero_aulas} aulas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{studentCounts[plan.id] || 0} alunos</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <p><strong>Frequência:</strong> {typeof plan.frequencia_aulas === 'string' ? plan.frequencia_aulas : 'Não definida'}</p>
                  {plan.carga_horaria_total && (
                    <p><strong>Carga horária:</strong> {plan.carga_horaria_total}h</p>
                  )}
                  {plan.valor_total && (
                    <p><strong>Valor total:</strong> R$ {plan.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  )}
                </div>
                
                <div className="flex gap-2 text-xs">
                  {plan.permite_cancelamento && (
                    <Badge variant="outline">Permite cancelamento</Badge>
                  )}
                  {plan.permite_parcelamento && (
                    <Badge variant="outline">Permite parcelamento</Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewStudents(plan)}
                    className="flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    Ver Alunos
                  </Button>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(plan)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal do Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </DialogTitle>
          </DialogHeader>
          <PlanForm
            plan={editingPlan}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano "{deletingPlan?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Alunos */}
      <PlanStudentsModal
        planId={selectedPlan?.id || null}
        planName={selectedPlan?.nome || ''}
        isOpen={showStudentsModal}
        onClose={() => {
          setShowStudentsModal(false);
          setSelectedPlan(null);
        }}
      />
    </div>
  );
};

export default Plans;