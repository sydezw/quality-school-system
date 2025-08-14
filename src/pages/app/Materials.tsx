
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
import { Plus, Edit, Trash2, BookOpen, Package, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { getIdiomaColor } from '@/utils/idiomaColors';


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
  const [activeTab, setActiveTab] = useState('ingles');
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();


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
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    try {
      // Primeiro, verificar se o material existe
      const { data: materialExists, error: checkError } = await supabase
        .from('materiais')
        .select('id, nome')
        .eq('id', id)
        .single();

      if (checkError || !materialExists) {
        throw new Error('Material não encontrado.');
      }

      // Executar a exclusão
      const { error: deleteError } = await supabase
        .from('materiais')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Tratar diferentes tipos de erro
        if (deleteError.code === 'PGRST116') {
          throw new Error('Material não encontrado.');
        } else if (deleteError.code === '23503') {
          throw new Error('Não é possível excluir este material pois existem registros relacionados. Para resolver este problema, execute as migrações do banco de dados ou entre em contato com o administrador do sistema.');
        } else {
          throw new Error(`Erro no banco de dados: ${deleteError.message}`);
        }
      }
      
      toast({
        title: "Sucesso",
        description: `Material "${materialExists.nome}" excluído com sucesso!`,
        duration: 5000,
      });
      
      // Atualizar a lista de materiais
      await fetchMaterials();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast({
        title: "Erro na Exclusão",
        description: error instanceof Error ? error.message : "Não foi possível excluir o material.",
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
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Materiais Didáticos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-brand-red hover:bg-brand-red/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
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

      {/* Botões de Navegação */}
      <div className="space-y-4">
        <div className="inline-flex h-10 items-center justify-center text-muted-foreground bg-gray-200 p-1 rounded-lg shadow-lg">
          <div className="flex w-full">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ingles'}
              data-state={activeTab === 'ingles' ? 'active' : 'inactive'}
              onClick={() => setActiveTab('ingles')}
              className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 data-[state=active]:bg-[#D90429] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <span>Inglês</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'japones'}
              data-state={activeTab === 'japones' ? 'active' : 'inactive'}
              onClick={() => setActiveTab('japones')}
              className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 data-[state=active]:bg-[#D90429] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <span>Japonês</span>
            </button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lista de Materiais ({materials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const currentLanguage = activeTab === 'ingles' ? 'Inglês' : 'Japonês';
            const filteredMaterials = materials.filter(m => m.idioma === currentLanguage);
            
            if (filteredMaterials.length === 0) {
              return (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum material de {currentLanguage} cadastrado ainda.</p>
                  <p className="text-sm text-gray-400">Clique no botão "Novo Material" para começar.</p>
                </div>
              );
            }
            
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getIdiomaColor(currentLanguage)}>
                    {currentLanguage}
                  </Badge>
                  <span className="text-sm text-gray-500">({filteredMaterials.length} materiais)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-base">{material.nome}</h4>
                          <p className="text-sm text-gray-600">{material.nivel}</p>
                          {material.descricao && (
                            <p className="text-sm text-gray-500 mt-1">{material.descricao}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(material.status)}>
                          {material.status === 'disponivel' ? 'Disponível' : 'Indisponível'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(material)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMaterial(material.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Materials;
