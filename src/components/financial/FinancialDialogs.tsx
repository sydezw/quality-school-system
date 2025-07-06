import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { DialogState, Student, Despesa, PlanoGenerico } from '@/types/financial';
import { UseFormReturn } from 'react-hook-form';

interface FinancialDialogsProps {
  dialogState: DialogState;
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>;
  students: Student[];
  planosGenericos: PlanoGenerico[];
  onSubmitBoleto: (data: any) => Promise<void>;
  onSubmitDespesa: (data: any) => Promise<void>;
  criarNovoPlano: (data: any) => Promise<void>;
  criarParcelaAvulsa: (data: any) => Promise<void>;
  openEditDespesaDialog: (despesa: Despesa) => void;
}

const FinancialDialogs: React.FC<FinancialDialogsProps> = ({
  dialogState,
  setDialogState,
  students,
  planosGenericos,
  onSubmitBoleto,
  onSubmitDespesa,
  criarNovoPlano,
  criarParcelaAvulsa,
  openEditDespesaDialog
}) => {
  // Forms removidos conforme solicitado

  return (
    <>
      {/* Dialog para Novo Boleto */}
      <Dialog open={dialogState.isBoletoDialogOpen} onOpenChange={(open) => 
        setDialogState(prev => ({ ...prev, isBoletoDialogOpen: open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.editingBoleto ? 'Editar Boleto' : 'Novo Boleto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); onSubmitBoleto({}); }} className="space-y-4">
            <div>
              <Label htmlFor="aluno_id">Aluno</Label>
              <Controller
                name="aluno_id"
                // control removido
                rules={{ required: 'Selecione um aluno' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                // register removido
                placeholder="Descrição do boleto"
              />
            </div>
            
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                // register removido
                placeholder="0,00"
              />
            </div>
            
            <div>
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                // register removido
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                // control removido
                defaultValue="Pendente"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-brand-red hover:bg-red-700">
                {dialogState.editingBoleto ? 'Atualizar' : 'Criar'} Boleto
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setDialogState(prev => ({ ...prev, isBoletoDialogOpen: false, editingBoleto: null }));
                  // reset removido
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Nova Despesa */}
      <Dialog open={dialogState.isDespesaDialogOpen} onOpenChange={(open) => 
        setDialogState(prev => ({ ...prev, isDespesaDialogOpen: open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); onSubmitDespesa({}); }} className="space-y-4">
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                // register removido
                placeholder="Descrição da despesa"
              />
            </div>
            
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                // register removido
                placeholder="0,00"
              />
            </div>
            
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                // register removido
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                // register removido
                placeholder="Ex: Material, Aluguel, Salários"
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="Pendente">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-brand-red hover:bg-red-700">
                {dialogState.editingDespesa ? 'Atualizar' : 'Criar'} Despesa
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setDialogState(prev => ({ ...prev, isDespesaDialogOpen: false, editingDespesa: null }));
                  // reset removido
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Novo Plano */}
      <Dialog open={dialogState.isNovoPlanoDialogOpen} onOpenChange={(open) => 
        setDialogState(prev => ({ ...prev, isNovoPlanoDialogOpen: open }))
      }>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Plano de Pagamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); criarNovoPlano({}); }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aluno_id">Aluno</Label>
                <Controller
                  name="aluno_id"
                  // control removido
                  rules={{ required: 'Selecione um aluno' }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="plano_id">Plano Base</Label>
                <Controller
                  name="plano_id"
                  // control removido
                  rules={{ required: 'Selecione um plano' }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {planosGenericos.map((plano) => (
                          <SelectItem key={plano.id} value={plano.id}>
                            {plano.nome} - R$ {plano.valor_por_aula}/aula
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="aulas_pagas">Aulas Pagas</Label>
                <Input
                  id="aulas_pagas"
                  type="number"
                  // register removido
                  placeholder="Ex: 12"
                />
              </div>
              
              <div>
                <Label htmlFor="numero_parcelas">Número de Parcelas</Label>
                <Input
                  id="numero_parcelas"
                  type="number"
                  // register removido
                  placeholder="Ex: 12"
                />
              </div>
              
              <div>
                <Label htmlFor="data_primeiro_vencimento">Primeiro Vencimento</Label>
                <Input
                  id="data_primeiro_vencimento"
                  type="date"
                  // register removido
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_matricula">Valor da Matrícula</Label>
                <Input
                  id="valor_matricula"
                  type="number"
                  step="0.01"
                  // register removido
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <Label htmlFor="valor_material">Valor do Material</Label>
                <Input
                  id="valor_material"
                  type="number"
                  step="0.01"
                  // register removido
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                // register removido
                placeholder="Observações adicionais sobre o plano..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-brand-red hover:bg-red-700">
                Criar Plano
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setDialogState(prev => ({ ...prev, isNovoPlanoDialogOpen: false }));
                  // reset removido
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Parcela Avulsa */}
      <Dialog open={dialogState.isParcelaAvulsaDialogOpen} onOpenChange={(open) => 
        setDialogState(prev => ({ ...prev, isParcelaAvulsaDialogOpen: open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Parcela Avulsa</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); criarParcelaAvulsa({}); }} className="space-y-4">
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                // register removido
                placeholder="Ex: Taxa de matrícula, material didático..."
              />
            </div>
            
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                // register removido
                placeholder="0,00"
              />
            </div>
            
            <div>
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                // register removido
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-brand-red hover:bg-red-700">
                Criar Parcela
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogState(prev => ({ ...prev, isParcelaAvulsaDialogOpen: false }))}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinancialDialogs;