import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Users, FileText, UserCheck, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";



interface PendingUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  senha: string;
  permissoes: string | null;
  status: string;
  created_at: string;
}

type ApprovedUser = Tables<'usuarios'>;

export default function ApproveLogins() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();


  useEffect(() => {
    fetchPendingUsers();
    fetchApprovedUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setPendingLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('usuarios_pendentes')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) {
         console.error('Erro ao buscar usuários pendentes:', error);
         toast({
           title: "Erro",
           description: "Erro ao carregar usuários pendentes",
           variant: "destructive",
         });
         return;
       }

      setPendingUsers(data || []);
    } catch (error) {
       console.error('Erro ao buscar usuários pendentes:', error);
       toast({
         title: "Erro",
         description: "Erro ao carregar usuários pendentes",
         variant: "destructive",
       });
     } finally {
      setPendingLoading(false);
    }
  };

  const fetchApprovedUsers = async () => {
    setApprovedLoading(true);
    
    try {
      // Buscar usuários da tabela usuarios
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (usuariosError) {
         console.error('Erro ao buscar usuários aprovados:', usuariosError);
         toast({
           title: "Erro",
           description: "Erro ao carregar usuários aprovados",
           variant: "destructive",
         });
         return;
       }

      // Buscar professores da tabela professores
      const { data: professores, error: professoresError } = await supabase
        .from('professores')
        .select('id, nome, email, cargo, created_at, updated_at')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (professoresError) {
         console.error('Erro ao buscar professores:', professoresError);
         toast({
           title: "Erro",
           description: "Erro ao carregar professores",
           variant: "destructive",
         });
         return;
       }

      // Combinar usuários e professores
      const todosUsuarios = [
        ...(usuarios || []),
        ...(professores || []).map(prof => ({
          ...prof,
          permissoes: 'professor' // Adicionar permissões padrão para professores
        }))
      ];

      setApprovedUsers(todosUsuarios || []);
    } catch (error) {
       console.error('Erro ao buscar usuários aprovados:', error);
       toast({
         title: "Erro",
         description: "Erro ao carregar usuários aprovados",
         variant: "destructive",
       });
     } finally {
      setApprovedLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const user = pendingUsers.find(u => u.id === userId);
      if (!user) return;

      if (action === 'approve') {
        // Inserir o usuário na tabela usuarios
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            nome: user.nome,
            email: user.email,
            cargo: user.cargo as Database['public']['Enums']['cargo_usuario'],
            senha: user.senha, // Usar a senha que o usuário cadastrou
            permissoes: user.permissoes || (user.cargo === 'Admin' ? 'admin' : 'user')
          });

        if (insertError) {
          console.error('Erro ao aprovar usuário:', insertError);
          toast({
            title: "Erro",
            description: "Erro ao aprovar usuário",
            variant: "destructive",
          });
          return;
        }

        // Deletar da tabela usuarios_pendentes
        const { error: deleteError } = await supabase
          .from('usuarios_pendentes')
          .delete()
          .eq('id', userId);

        if (deleteError) {
          console.error('Erro ao remover usuário pendente:', deleteError);
        }

        toast({
          title: "Usuário aprovado!",
          description: `${user.nome} foi aprovado com sucesso e pode fazer login.`,
        });
      } else {
        // Deletar da tabela usuarios_pendentes
        const { error: deleteError } = await supabase
          .from('usuarios_pendentes')
          .delete()
          .eq('id', userId);

        if (deleteError) {
          console.error('Erro ao rejeitar usuário:', deleteError);
          toast({
            title: "Erro",
            description: "Erro ao rejeitar usuário",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Usuário rejeitado",
          description: `${user.nome} foi rejeitado e removido da lista.`,
          variant: "destructive",
        });
      }

      // Atualizar as listas
      fetchPendingUsers();
      if (action === 'approve') {
        fetchApprovedUsers();
      }
      
    } catch (error) {
      console.error('Erro ao processar ação do usuário:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a solicitação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="container mx-auto p-6">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Gestão de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="pending" 
                className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <Clock className="h-4 w-4" />
                Aprovações Pendentes
                {pendingUsers.length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-white text-red-600">
                    {pendingUsers.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="permissions" 
                className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Gerenciar Permissões
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum usuário pendente</h3>
                  <p className="text-muted-foreground">Não há usuários aguardando aprovação no momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <Card key={user.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{user.nome}</h4>
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p><strong>Email:</strong> {user.email}</p>
                              <p><strong>Cargo:</strong> {user.cargo}</p>
                              <p><strong>Data de Solicitação:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUserAction(user.id, 'approve')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => handleUserAction(user.id, 'reject')}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="mt-6">
              {approvedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : approvedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-muted-foreground">Não há usuários aprovados no sistema.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {approvedUsers.map((user) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{user.nome}</span>
                            <Badge 
                              variant={user.cargo === 'Admin' ? 'default' : 'secondary'}
                              className={user.cargo === 'Professor' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                            >
                              {user.cargo}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Permissões do usuário</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
       </div>
     </div>
   );
}