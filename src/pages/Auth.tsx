
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School } from 'lucide-react';
import { useAuth } from '@/contexts/authcontext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  // Estados para login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para cadastro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerCargo, setRegisterCargo] = useState('Secretária');
  const [registerLoading, setRegisterLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate fields before sending
    if (!email || !password) {
      toast.error('Email e senha são obrigatórios.');
      setLoading(false);
      return;
    }
    
    try {
      await signIn({ email, password });
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    
    try {
      await signUp({
        nome: registerName,
        email: registerEmail,
        senha: registerPassword,
        cargo: registerCargo as 'Secretária' | 'Gerente' | 'Admin'
      });
      
      toast.success('Cadastro realizado com sucesso! Aguarde a aprovação do administrador.');
      
      // Limpar formulário
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterCargo('Secretária');
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado ao cadastrar usuário');
    } finally {
      setRegisterLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <School className="h-12 w-12 text-[#E53935]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[#212121] tracking-tight">TS School</h1>
            <p className="text-base text-gray-500 font-medium">Sistema de Gestão Escolar</p>
          </div>
        </div>
        
        <Card className="w-full max-w-md mx-auto card-container mobile-padding desktop-margins">
          <CardHeader className="container-padding text-center mobile-center">
            <CardTitle className="title-primary section-margin">Acesso ao Sistema</CardTitle>
          </CardHeader>
          <CardContent className="container-padding">
            <Tabs defaultValue="login" className="w-full mobile-single-column">
              <TabsList className="grid w-full grid-cols-2 section-margin bg-[#F9F9F9] rounded-lg p-1" style={{minHeight: '44px'}}>
                <TabsTrigger value="login" className="btn-tab data-[state=active]:bg-white data-[state=active]:text-[#212121] data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="btn-tab data-[state=active]:bg-white data-[state=active]:text-[#212121] data-[state=active]:shadow-sm">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="element-spacing-lg mt-0 mobile-single-column">
                <form onSubmit={handleSignIn} className="element-spacing-lg mobile-single-column">
                  <div className="element-spacing">
                    <Label htmlFor="email" className="subtitle">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="filter-input w-full bg-white text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="element-spacing">
                    <Label htmlFor="password" className="subtitle">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="filter-input w-full bg-white text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="element-spacing-lg mt-0 mobile-single-column">
                <form onSubmit={handleRegister} className="element-spacing-lg mobile-single-column">
                  <div className="element-spacing">
                    <Label htmlFor="register-name" className="subtitle">Nome Completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="filter-input w-full bg-white text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="element-spacing">
                    <Label htmlFor="register-email" className="subtitle">E-mail</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="filter-input w-full bg-white text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="element-spacing">
                    <Label htmlFor="register-password" className="subtitle">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="filter-input w-full bg-white text-gray-900 placeholder-gray-500"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="element-spacing">
                    <Label htmlFor="register-cargo" className="subtitle">Cargo</Label>
                    <select
                      id="register-cargo"
                      value={registerCargo}
                      onChange={(e) => setRegisterCargo(e.target.value)}
                      className="filter-input w-full bg-white text-gray-900"
                      required
                    >
                      <option value="Secretária">Secretária</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <Button 
                    type="submit" 
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Cadastrando...</span>
                      </div>
                    ) : 'Solicitar Cadastro'}
                  </Button>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-700 text-center font-medium">
                      📋 Seu cadastro será analisado por um administrador antes da aprovação.
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 font-medium">
            🔒 Acesso restrito à equipe da escola
          </p>
          <p className="text-auxiliary">
            Design System Mobbin Inspired
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
