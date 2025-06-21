
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionButton } from '@/components/shared/PermissionButton';
import { PermissionGuard } from '@/components/guards/PermissionGuard';

interface Material {
  id: string;
  nome: string;
  descricao: string | null;
  idioma: string;
  nivel: string;
  status: string;
}

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();
  const { hasPermission, isOwner } = usePermissions();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .order('nome');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingMaterial) {
        const { error } = await supabase
          .from('materiais')
          .update(data)
          .eq('id', editingMaterial.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Material atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('materiais')
          .insert([data]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Material criado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingMaterial(null);
      reset();
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o material.",
        variant: "destructive",
      });
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!isOwner() && !hasPermission('gerenciarMateriais')) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para realizar esta ação. Entre em contato com o administrador.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    try {
      const { error } = await supabase
        .from('materiais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Material excluído com sucesso!",
      });
      fetchMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o material.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (material: Material) => {
    setEditingMaterial(material);
    setValue('nome', material.nome);
    setValue('descricao', material.descricao || '');
    setValue('idioma', material.idioma);
    setValue('nivel', material.nivel);
    setValue('status', material.status);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingMaterial(null);
    reset();
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800';
      case 'indisponivel': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIdiomaColor = (idioma: string) => {
    switch (idioma) {
      case 'Inglês': return 'bg-blue-100 text-blue-800';
      case 'Japonês': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando materiais...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="visualizarMateriais">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Materiais Didáticos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <PermissionButton
              permission="gerenciarMateriais"
              onClick={openCreateDialog}
              className="bg-brand-red hover:bg-brand-red/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </PermissionButton>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Editar Material' : 'Novo Material'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Material *</Label>
                <Input
                  id="nome"
                  {...register('nome', { required: true })}
                  placeholder="Ex: English Book 1"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Descrição do material..."
                />
              </div>

              <div>
                <Label htmlFor="idioma">Idioma *</Label>
                <Select onValueChange={(value) => setValue('idioma', value)} defaultValue={editingMaterial?.idioma}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Japonês">Japonês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nivel">Nível *</Label>
                <Select onValueChange={(value) => setValue('nivel', value)} defaultValue={editingMaterial?.nivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i + 1} value={`Book ${i + 1}`}>
                        Book {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setValue('status', value)} defaultValue={editingMaterial?.status || 'disponivel'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="indisponivel">Indisponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                  {editingMaterial ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lista de Materiais ({materials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum material cadastrado ainda.</p>
              <p className="text-sm text-gray-400">Clique no botão "Novo Material" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{material.nome}</div>
                        {material.descricao && (
                          <div className="text-sm text-gray-500">{material.descricao}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getIdiomaColor(material.idioma)}>
                        {material.idioma}
                      </Badge>
                    </TableCell>
                    <TableCell>{material.nivel}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(material.status)}>
                        {material.status === 'disponivel' ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <PermissionButton
                          permission="gerenciarMateriais"
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </PermissionButton>
                        <PermissionButton
                          permission="gerenciarMateriais"
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </PermissionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
};

export default Materials;
