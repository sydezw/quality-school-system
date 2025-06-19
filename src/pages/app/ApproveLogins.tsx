import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, FileText, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PendingUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  status: string;
  created_at: string;
}

export default function ApproveLogins() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setPendingLoading(true);
    
    try {
      // Como a tabela usuarios_pendentes ainda não foi criada, 
      // vamos usar dados simulados por enquanto
      console.log('Usando dados simulados - tabela usuarios_pendentes ainda não criada');
      
      // Dados simulados de usuários aguardando aprovação
      const mockPendingUsers: PendingUser[] = [
        {
          id: '1',
          nome: 'Maria Silva Santos',
          email: 'maria.silva@email.com',
          cargo: 'Secretária',
          status: 'pendente',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'João Pedro Oliveira',
          email: 'joao.pedro@email.com',
          cargo: 'Admin',
          status: 'pendente',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          nome: 'Ana Carolina Ferreira',
          email: 'ana.carolina@email.com',
          cargo: 'Gerente',
          status: 'pendente',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPendingUsers(mockPendingUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      toast.error('Erro ao carregar usuários pendentes');
    } finally {
      setPendingLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'aprovado' | 'rejeitado') => {
    try {
      const user = pendingUsers.find(u => u.id === userId);
      if (!user) return;
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'aprovado') {
        // Tentar adicionar à tabela usuarios existente
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            nome: user.nome,
            email: user.email,
            cargo: user.cargo as 'Secretária' | 'Gerente' | 'Admin',
            senha: 'senha_temporaria_123', // Senha temporária que deve ser alterada no primeiro login
            funcao: null,
            permissoes: null
          });
        
        if (insertError) {
          console.error('Erro ao inserir usuário na tabela usuarios:', insertError);
          toast.error('Erro ao aprovar usuário. Tente novamente.');
          return;
        }
        
        toast.success(`Usuário ${user.nome} aprovado com sucesso! Ele pode fazer login com a senha temporária.`);
      } else {
        toast.success(`Solicitação de ${user.nome} foi rejeitada e removida da lista.`);
      }
      
      // Remover usuário da lista local
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      toast.error('Erro inesperado ao processar solicitação');
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
                          onClick={() => handleUserAction(user.id, 'aprovado')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700"
                          onClick={() => handleUserAction(user.id, 'rejeitado')}
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