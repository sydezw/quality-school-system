import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, FileText, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

export default function ApproveLogins() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingUsers();
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

      // Atualizar a lista local removendo o usuário processado
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
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
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Aprovar Logins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {pendingUsers.length} solicitação(ões) pendente(s) de aprovação
                </span>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Aguardando Análise
              </Badge>
            </div>
            
            {pendingLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto mb-2"></div>
                Carregando solicitações...
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Nenhuma solicitação pendente</p>
                <p className="text-sm">Todas as solicitações de cadastro foram processadas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{user.nome}</h3>
                          <Badge variant="outline" className="text-xs">
                            {user.cargo}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">E-mail:</span> {user.email}
                          </div>
                          <div>
                            <span className="font-medium">Data da Solicitação:</span> {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50 hover:border-green-700"
                          onClick={() => handleUserAction(user.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700"
                          onClick={() => handleUserAction(user.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}