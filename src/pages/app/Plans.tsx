import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  carga_horaria_total: number | null;
  valor_total: number | null;
  valor_por_aula: number | null;
  permite_cancelamento: boolean;
  permite_parcelamento: boolean;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const Plans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  
  const { toast } = useToast();




  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const filtered = plans.filter(plan =>
      plan.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlans(filtered);
  }, [plans, searchTerm]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar planos:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar planos.',
          variant: 'destructive',
        });
        return;
      }

      setPlans(data || []);
      
      // Buscar contagem de alunos para cada plano
      if (data && data.length > 0) {
        await fetchStudentCounts(data.map(plan => plan.id));
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
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

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;

    try {
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
    setShowForm(false);
    setEditingPlan(null);
    fetchPlans();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleViewStudents = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowStudentsModal(true);
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
          <p className="text-muted-foreground">
            Gerencie os planos de ensino da escola
          </p>
        </div>
        <Button onClick={handleCreatePlan} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Plano
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando planos...</p>
          </div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum plano encontrado' : 'Nenhum plano cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando seu primeiro plano de ensino'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreatePlan}>
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
                  <p><strong>Frequência:</strong> {plan.frequencia_aulas}</p>
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
                      onClick={() => setDeletingPlan(plan)}
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
      <Dialog open={showForm} onOpenChange={setShowForm}>
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
              onClick={handleDeletePlan}
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