
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users, FileText } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  nome: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  turma: string | null;
}

interface PendingUser {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  status: string;
  created_at: string;
}

export default function Birthdays() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      // Query: alunos com data_nascimento no mês atual + turma
      const { data, error } = await supabase
        .from("alunos")
        .select(`
          id, nome, data_nascimento, telefone, email, turma_id,
          turmas (nome)
        `)
        .filter("data_nascimento", "not.is", null);

      if (error) {
        setLoading(false);
        return;
      }

      // Filtra no front apenas aniversariantes do mês atual (evita timezone bug)
      const now = new Date();
      const currentMonth = now.getMonth() + 1;

      const result = (data as any[]).filter((aluno) => {
        if (!aluno.data_nascimento) return false;
        const month = Number(aluno.data_nascimento.split("-")[1]);
        return month === currentMonth;
      }).map((aluno) => ({
        id: aluno.id,
        nome: aluno.nome,
        data_nascimento: aluno.data_nascimento,
        telefone: aluno.telefone,
        email: aluno.email,
        turma: aluno.turmas ? aluno.turmas.nome : null,
      }));

      setStudents(result);
      setLoading(false);
    };

    fetchBirthdays();
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setPendingLoading(true);
    
    // Dados simulados de usuários pendentes até a tabela ser criada
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
        cargo: 'Administrador',
        status: 'pendente',
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
      }
    ];
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPendingUsers(mockPendingUsers);
    setPendingLoading(false);
  };

  const handleUserAction = async (userId: string, action: 'aprovado' | 'rejeitado') => {
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'aprovado') {
        toast.success('Usuário aprovado com sucesso! Ele agora pode fazer login no sistema.');
      } else {
        toast.success('Usuário rejeitado. A solicitação foi removida da lista.');
      }
      
      // Remover usuário da lista local (simulação)
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
    } catch (error) {
      toast.error('Erro inesperado ao processar solicitação');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Aniversariantes do Mês ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Carregando...</div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">Nenhum aniversariante este mês.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Turma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell>{aluno.nome}</TableCell>
                    <TableCell>
                      {aluno.data_nascimento
                        ? (() => {
                            const [y, m, d] = aluno.data_nascimento.split("-");
                            return `${d}/${m}`;
                          })()
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {aluno.telefone || aluno.email || <span className="text-gray-400 text-xs">Sem contato</span>}
                    </TableCell>
                    <TableCell>{aluno.turma ?? <span className="text-gray-400 text-xs">-</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Seção de Novos Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Novos Usuários
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
