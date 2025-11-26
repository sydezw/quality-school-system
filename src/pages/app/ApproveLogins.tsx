import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle, Users, Check, X, Mail, Briefcase, Calendar, Clock, UserCheck, Inbox, Eye, Home, GraduationCap, BookOpen, BookCopy, Package, DollarSign, BarChart3, FileSignature, Shield, EyeOff, Key } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Database, Tables } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDate } from '@/utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';



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
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  // Verificar se o usuário atual é Admin
  const isAdmin = currentUser?.cargo === 'Admin';


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
          permissoes: 'professor', // Adicionar permissões padrão para professores
          funcao: prof.cargo || '', // Mapear cargo para funcao
          senha: '', // Professores não têm senha visível
          status: 'ativo' // Status padrão para professores
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
            title: 'Erro ao aprovar usuário',
            description: 'Tente novamente em alguns instantes',
            variant: 'destructive',
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
          title: `✅ ${user.nome} foi aprovado com sucesso!`,
          description: 'O usuário agora tem acesso ao sistema',
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
            title: 'Erro ao rejeitar usuário',
            description: 'Tente novamente em alguns instantes',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: `❌ Solicitação de ${user.nome} foi rejeitada`,
          description: 'O usuário foi removido da lista de pendências',
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
        title: 'Erro ao processar solicitação',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userTable: string) => {
    if (!isAdmin) {
      toast({
        title: 'Acesso negado',
        description: 'Apenas administradores podem excluir usuários',
        variant: 'destructive',
      });
      return;
    }

    setDeletingUserId(userId);

    try {
      const { error } = await supabase
        .from(userTable)
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Atualizar a lista de usuários aprovados
      setApprovedUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: 'Usuário excluído',
        description: `Usuário ${userName} foi excluído com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro ao excluir usuário',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const getPermissionsByRole = (cargo: string) => {
    const permissions = {
      Admin: [
        { icon: Home, label: 'Dashboard', description: 'Acesso completo ao painel administrativo' },
        { icon: Users, label: 'Gestão de Usuários', description: 'Criar, editar e excluir usuários' },
        { icon: GraduationCap, label: 'Gestão de Professores', description: 'Gerenciar professores e suas informações' },
        { icon: BookOpen, label: 'Gestão de Turmas', description: 'Criar e gerenciar turmas' },
        { icon: BookCopy, label: 'Gestão de Aulas', description: 'Agendar e gerenciar aulas' },
        { icon: Package, label: 'Gestão de Produtos', description: 'Gerenciar produtos e serviços' },
        { icon: DollarSign, label: 'Gestão Financeira', description: 'Controle completo de finanças' },
        { icon: BarChart3, label: 'Relatórios', description: 'Acesso a todos os relatórios' },
        { icon: FileSignature, label: 'Contratos', description: 'Gerenciar contratos e documentos' }
      ],
      Gerente: [
        { icon: Home, label: 'Dashboard', description: 'Acesso ao painel gerencial' },
        { icon: GraduationCap, label: 'Gestão de Professores', description: 'Gerenciar professores e suas informações' },
        { icon: BookOpen, label: 'Gestão de Turmas', description: 'Criar e gerenciar turmas' },
        { icon: BookCopy, label: 'Gestão de Aulas', description: 'Agendar e gerenciar aulas' },
        { icon: Package, label: 'Gestão de Produtos', description: 'Gerenciar produtos e serviços' },
        { icon: DollarSign, label: 'Gestão Financeira', description: 'Visualizar e gerenciar finanças' },
        { icon: BarChart3, label: 'Relatórios', description: 'Acesso a relatórios gerenciais' },
        { icon: FileSignature, label: 'Contratos', description: 'Visualizar e gerenciar contratos' }
      ],
      Secretária: [
        { icon: Home, label: 'Dashboard', description: 'Acesso ao painel básico' },
        { icon: BookOpen, label: 'Visualizar Turmas', description: 'Consultar informações das turmas' },
        { icon: BookCopy, label: 'Gestão de Aulas', description: 'Agendar aulas básicas' },
        { icon: Users, label: 'Cadastro de Alunos', description: 'Cadastrar e editar informações de alunos' },
        { icon: FileSignature, label: 'Documentos', description: 'Gerenciar documentos básicos' }
      ],
      Professor: [
        { icon: Home, label: 'Dashboard', description: 'Acesso ao painel do professor' },
        { icon: BookOpen, label: 'Minhas Turmas', description: 'Visualizar apenas suas turmas' },
        { icon: BookCopy, label: 'Minhas Aulas', description: 'Gerenciar apenas suas aulas' },
        { icon: Users, label: 'Meus Alunos', description: 'Visualizar alunos de suas turmas' },
        { icon: BarChart3, label: 'Relatórios Básicos', description: 'Relatórios de suas turmas e aulas' }
      ]
    };

    return permissions[cargo as keyof typeof permissions] || [];
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 ml-0 md:ml-11">Aprove ou rejeite solicitações de novos usuários e gerencie permissões</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Gestão de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-md transition-all duration-200 text-xs md:text-sm"
              >
                <div className="flex items-center gap-1 md:gap-2">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Aprovações Pendentes</span>
                  <span className="sm:hidden">Pendentes</span>
                  {pendingUsers.length > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                      {pendingUsers.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="permissions"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-md transition-all duration-200 text-xs md:text-sm"
              >
                <div className="flex items-center gap-1 md:gap-2">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Gerenciar Permissões</span>
                  <span className="sm:hidden">Permissões</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4 md:mt-6">
              {pendingLoading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="flex flex-col items-center gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-gray-100 rounded-full">
                      <Inbox className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Nenhuma solicitação pendente</h3>
                      <p className="text-sm md:text-base text-gray-500">Todas as solicitações foram processadas</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {pendingUsers.map((user) => {
                    const initials = user.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    
                    return (
                      <Card key={user.id} className="border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4">
                             {/* Avatar */}
                             <div className="flex-shrink-0 self-center sm:self-start">
                               <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-lg">
                                 {initials}
                               </div>
                             </div>
                             
                             {/* Conteúdo principal */}
                             <div className="flex-1 min-w-0">
                               <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                 <Dialog>
                                   <DialogTrigger asChild>
                                     <button className="text-lg md:text-xl font-bold text-gray-900 text-center sm:text-left hover:text-blue-600 transition-colors cursor-pointer">
                                       {user.nome}
                                     </button>
                                   </DialogTrigger>
                                   <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                     <DialogHeader>
                                       <DialogTitle className="flex items-center gap-3">
                                         <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                           {initials}
                                         </div>
                                         <div>
                                           <h3 className="text-xl font-bold">{user.nome}</h3>
                                           <p className="text-sm text-gray-600">{user.cargo}</p>
                                         </div>
                                       </DialogTitle>
                                     </DialogHeader>
                                     {isAdmin && user.senha && (
                                       <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                         <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                             <Key className="h-4 w-4 text-gray-600" />
                                             <span className="text-sm font-medium text-gray-700">Senha de Acesso:</span>
                                           </div>
                                           <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => togglePasswordVisibility(user.id)}
                                             className="text-xs"
                                           >
                                             {showPassword[user.id] ? (
                                               <>
                                                 <EyeOff className="h-3 w-3 mr-1" />
                                                 Ocultar
                                               </>
                                             ) : (
                                               <>
                                                 <Eye className="h-3 w-3 mr-1" />
                                                 Mostrar
                                               </>
                                             )}
                                           </Button>
                                         </div>
                                         <div className="mt-2">
                                           <code className="text-sm bg-white px-3 py-2 rounded border font-mono">
                                             {showPassword[user.id] ? user.senha : '••••••••'}
                                           </code>
                                         </div>
                                         <p className="text-xs text-gray-500 mt-2">
                                           ⚠️ Esta informação é confidencial e deve ser tratada com segurança
                                         </p>
                                       </div>
                                     )}
                                     <div className="mt-6">
                                       <div className="flex items-center gap-2 mb-4">
                                         <Shield className="h-5 w-5 text-blue-600" />
                                         <h4 className="text-lg font-semibold">Permissões do Cargo: {user.cargo}</h4>
                                       </div>
                                       <div className="grid gap-3">
                                         {getPermissionsByRole(user.cargo).map((permission, index) => {
                                           const IconComponent = permission.icon;
                                           return (
                                             <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                                               <div className="p-2 bg-blue-100 rounded-lg">
                                                 <IconComponent className="h-4 w-4 text-blue-600" />
                                               </div>
                                               <div className="flex-1">
                                                 <h5 className="font-medium text-gray-900">{permission.label}</h5>
                                                 <p className="text-sm text-gray-600">{permission.description}</p>
                                               </div>
                                               <div className="flex items-center">
                                                 <Check className="h-4 w-4 text-green-600" />
                                               </div>
                                             </div>
                                           );
                                         })}
                                       </div>
                                       {user.cargo === 'Professor' && (
                                         <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                           <p className="text-sm text-yellow-700 flex items-center gap-2">
                                             <AlertTriangle className="h-4 w-4" />
                                             <span>Professores têm acesso limitado apenas às suas próprias turmas e aulas.</span>
                                           </p>
                                         </div>
                                       )}
                                     </div>
                                   </DialogContent>
                                 </Dialog>
                                 <div className="flex gap-2 justify-center sm:justify-start">
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center justify-center gap-1 w-fit">
                                      <Clock className="h-3 w-3" />
                                      Pendente
                                    </Badge>
                                    {isAdmin && (
                                      <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        Ver Permissões
                                      </Badge>
                                    )}
                                    {isAdmin && user.senha && (
                                      <Badge variant="outline" className="text-orange-600 border-orange-600 bg-orange-50 flex items-center gap-1">
                                        <Key className="h-3 w-3" />
                                        Senha Disponível
                                      </Badge>
                                    )}
                                  </div>
                               </div>
                              
                              {/* Informações do usuário */}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-gray-600">
                                  <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-gray-600">
                                  <Briefcase className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                  <span>{user.cargo}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                  <span>Solicitado em {formatDate(user.created_at)}</span>
                                </div>
                              </div>
                              
                              {/* Botões de ação - Apenas para Administradores */}
                              {isAdmin ? (
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                  <Button
                                    onClick={() => handleUserAction(user.id, 'approve')}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 md:px-6 flex items-center justify-center gap-2 text-sm"
                                    size="sm"
                                  >
                                    <Check className="h-3 w-3 md:h-4 md:w-4" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    onClick={() => handleUserAction(user.id, 'reject')}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-4 md:px-6 flex items-center justify-center gap-2 text-sm"
                                    size="sm"
                                  >
                                    <X className="h-3 w-3 md:h-4 md:w-4" />
                                    Rejeitar
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center py-3">
                                  <p className="text-sm text-gray-500">Apenas administradores podem aprovar ou rejeitar usuários</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="mt-4 md:mt-6">
              {approvedLoading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : approvedUsers.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="flex flex-col items-center gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-gray-100 rounded-full">
                      <Users className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Nenhum usuário encontrado</h3>
                      <p className="text-sm md:text-base text-gray-500">Não há usuários aprovados no sistema</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {approvedUsers.map((user) => {
                    // Determinar se é da tabela usuarios ou professores
                    const userTable = user.cargo === 'Professor' ? 'professores' : 'usuarios';
                    const canDelete = isAdmin && user.id !== currentUser?.id; // Admin não pode excluir a si mesmo
                    const initials = user.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    
                    return (
                      <Card key={user.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0 self-center sm:self-start">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-lg">
                                {initials}
                              </div>
                            </div>
                            
                            {/* Conteúdo principal */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                {isAdmin ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button className="text-lg md:text-xl font-bold text-gray-900 text-center sm:text-left hover:text-blue-600 transition-colors cursor-pointer">
                                        {user.nome}
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {initials}
                                          </div>
                                          <div>
                                            <h3 className="text-xl font-bold">{user.nome}</h3>
                                            <p className="text-sm text-gray-600">{user.cargo}</p>
                                          </div>
                                        </DialogTitle>
                                      </DialogHeader>
                                      {isAdmin && user.senha && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <Key className="h-4 w-4 text-gray-600" />
                                              <span className="text-sm font-medium text-gray-700">Senha de Acesso:</span>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => togglePasswordVisibility(user.id)}
                                              className="text-xs"
                                            >
                                              {showPassword[user.id] ? (
                                                <>
                                                  <EyeOff className="h-3 w-3 mr-1" />
                                                  Ocultar
                                                </>
                                              ) : (
                                                <>
                                                  <Eye className="h-3 w-3 mr-1" />
                                                  Mostrar
                                                </>
                                              )}
                                            </Button>
                                          </div>
                                          <div className="mt-2">
                                            <code className="text-sm bg-white px-3 py-2 rounded border font-mono">
                                              {showPassword[user.id] ? user.senha : '••••••••'}
                                            </code>
                                          </div>
                                          <p className="text-xs text-gray-500 mt-2">
                                            ⚠️ Esta informação é confidencial e deve ser tratada com segurança
                                          </p>
                                        </div>
                                      )}
                                      <div className="mt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                          <Shield className="h-5 w-5 text-blue-600" />
                                          <h4 className="text-lg font-semibold">Permissões do Cargo: {user.cargo}</h4>
                                        </div>
                                        <div className="grid gap-3">
                                          {getPermissionsByRole(user.cargo).map((permission, index) => {
                                            const IconComponent = permission.icon;
                                            return (
                                              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                  <IconComponent className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                  <h5 className="font-medium text-gray-900">{permission.label}</h5>
                                                  <p className="text-sm text-gray-600">{permission.description}</p>
                                                </div>
                                                <div className="flex items-center">
                                                  <Check className="h-4 w-4 text-green-600" />
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {user.cargo === 'Professor' && (
                                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-700 flex items-center gap-2">
                                              <AlertTriangle className="h-4 w-4" />
                                              <span>Professores têm acesso limitado apenas às suas próprias turmas e aulas.</span>
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center sm:text-left">{user.nome}</h3>
                                )}
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                  <Badge 
                                    variant={user.cargo === 'Admin' ? 'default' : 'secondary'}
                                    className={`${
                                      user.cargo === 'Professor' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                      user.cargo === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                      user.cargo === 'Gerente' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                      'bg-gray-100 text-gray-800 border-gray-300'
                                    }`}
                                  >
                                    {user.cargo}
                                  </Badge>
                                  {user.id === currentUser?.id && (
                                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                                      Você
                                    </Badge>
                                  )}
                                  {isAdmin && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      Ver Permissões
                                    </Badge>
                                  )}
                                   {isAdmin && user.senha && (
                                     <Badge variant="outline" className="text-orange-600 border-orange-600 bg-orange-50 flex items-center gap-1">
                                       <Key className="h-3 w-3" />
                                       Senha Disponível
                                     </Badge>
                                   )}
                                </div>
                              </div>
                              
                              {/* Informações do usuário */}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-gray-600">
                                  <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-gray-600">
                                  <Briefcase className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                  <span className="text-center sm:text-left">
                                    {user.cargo === 'Admin' && 'Acesso total ao sistema'}
                                    {user.cargo === 'Gerente' && 'Acesso administrativo limitado'}
                                    {user.cargo === 'Secretária' && 'Acesso a operações básicas'}
                                    {user.cargo === 'Professor' && 'Acesso apenas às suas turmas e aulas'}
                                  </span>
                                </div>
                              </div>
                              
                              {!isAdmin && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-xs md:text-sm text-yellow-700 flex items-center justify-center sm:justify-start gap-2">
                                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    <span className="text-center sm:text-left">Apenas administradores podem gerenciar usuários</span>
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Botão de exclusão */}
                            {canDelete && (
                              <div className="flex-shrink-0 w-full sm:w-auto">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-full w-full sm:w-auto"
                                      disabled={deletingUserId === user.id}
                                    >
                                      {deletingUserId === user.id ? (
                                        <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                      ) : (
                                        <>
                                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                          <span className="ml-2 sm:hidden">Excluir</span>
                                        </>
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        Confirmar Exclusão
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir o usuário <strong>{user.nome}</strong>?
                                        <br /><br />
                                        <span className="text-red-600 font-medium">
                                          Esta ação não pode ser desfeita. O usuário perderá acesso ao sistema permanentemente.
                                        </span>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(user.id, user.nome, userTable)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Excluir Usuário
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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