
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/authcontext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const Auth = () => {
  // Estados para login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Estados para cadastro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerCargo, setRegisterCargo] = useState('Secretária');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerNameFocused, setRegisterNameFocused] = useState(false);
  const [registerEmailFocused, setRegisterEmailFocused] = useState(false);
  const [registerPasswordFocused, setRegisterPasswordFocused] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
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
    
    if (registerPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      setPasswordMismatch(true);
      setRegisterLoading(false);
      return;
    }
    
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
      setConfirmPassword('');
      setRegisterCargo('Secretária');
      setPasswordMismatch(false);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado ao cadastrar usuário');
    } finally {
      setRegisterLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50" />
      
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-brand-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-red/3 to-blue-500/3 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Logo e título principal */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-red/20 rounded-full blur-xl scale-110" />
              <div className="relative bg-gradient-to-br from-brand-red to-red-600 p-6 rounded-full shadow-2xl border border-white/20">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 font-['Inter']">
            TS School
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Sistema de Gestão Escolar
          </p>
        </div>
        
        {/* Card de login com glassmorphism */}
        <Card className="backdrop-blur-xl bg-white/70 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-800">Acesso ao Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 backdrop-blur-sm rounded-lg p-1 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm transition-all duration-200">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm transition-all duration-200">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  {/* Campo de email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                        emailFocused ? "text-brand-red" : "text-gray-400"
                      )} />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        placeholder="seu@email.com"
                        required
                        disabled={loading}
                        className={cn(
                          "pl-10 h-12 transition-all duration-200 border-2 bg-white/50 backdrop-blur-sm",
                          emailFocused 
                            ? "border-brand-red ring-2 ring-brand-red/20 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Campo de senha */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</Label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                        passwordFocused ? "text-brand-red" : "text-gray-400"
                      )} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Sua senha"
                        required
                        disabled={loading}
                        className={cn(
                          "pl-10 pr-10 h-12 transition-all duration-200 border-2 bg-white/50 backdrop-blur-sm",
                          passwordFocused 
                            ? "border-brand-red ring-2 ring-brand-red/20 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Link de recuperação de senha */}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-brand-red hover:text-red-600 transition-colors duration-200 font-medium"
                      onClick={() => setShowForgotPasswordModal(true)}
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                  
                  {/* Botão de login */}
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full h-12 bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-red-700",
                      "text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
                      "transform hover:scale-[1.02] active:scale-[0.98]",
                      loading && "animate-pulse"
                    )}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                  

                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Campo de nome */}
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">Nome Completo</Label>
                    <div className="relative">
                      <User className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                        registerNameFocused ? "text-brand-red" : "text-gray-400"
                      )} />
                      <Input
                        id="register-name"
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        onFocus={() => setRegisterNameFocused(true)}
                        onBlur={() => setRegisterNameFocused(false)}
                        placeholder="Seu nome completo"
                        required
                        disabled={registerLoading}
                        className={cn(
                          "pl-10 h-12 transition-all duration-200 border-2 bg-white/50 backdrop-blur-sm",
                          registerNameFocused 
                            ? "border-brand-red ring-2 ring-brand-red/20 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Campo de email */}
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                        registerEmailFocused ? "text-brand-red" : "text-gray-400"
                      )} />
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        onFocus={() => setRegisterEmailFocused(true)}
                        onBlur={() => setRegisterEmailFocused(false)}
                        placeholder="seu@email.com"
                        required
                        disabled={registerLoading}
                        className={cn(
                          "pl-10 h-12 transition-all duration-200 border-2 bg-white/50 backdrop-blur-sm",
                          registerEmailFocused 
                            ? "border-brand-red ring-2 ring-brand-red/20 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Campo de senha */}
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">Senha</Label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                        registerPasswordFocused ? "text-brand-red" : "text-gray-400"
                      )} />
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerPassword}
                        onChange={(e) => {
                          setRegisterPassword(e.target.value);
                          if (confirmPassword && e.target.value !== confirmPassword) {
                            setPasswordMismatch(true);
                          } else {
                            setPasswordMismatch(false);
                          }
                        }}
                        onFocus={() => setRegisterPasswordFocused(true)}
                        onBlur={() => setRegisterPasswordFocused(false)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        disabled={registerLoading}
                        minLength={6}
                        className={cn(
                          "pl-10 pr-10 h-12 transition-all duration-200 border-2 bg-white/50 backdrop-blur-sm",
                          registerPasswordFocused 
                            ? "border-brand-red ring-2 ring-brand-red/20 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Campo Confirmar Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirme a senha</Label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                        confirmPasswordFocused ? "text-brand-red" : "text-gray-400"
                      )} />
                      <Input
                        id="confirm-password"
                        type={showRegisterPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (registerPassword && e.target.value !== registerPassword) {
                            setPasswordMismatch(true);
                          } else {
                            setPasswordMismatch(false);
                          }
                        }}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        placeholder="Confirme sua senha"
                        required
                        disabled={registerLoading}
                        className={cn(
                          "pl-10 pr-4 h-12 transition-all duration-200 border-2 bg-white/50 backdrop-blur-sm",
                          passwordMismatch && confirmPassword ? "border-red-300 ring-2 ring-red-300/20" :
                          confirmPasswordFocused 
                            ? "border-brand-red ring-2 ring-brand-red/20 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      />
                    </div>
                    {passwordMismatch && confirmPassword && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm animate-in fade-in duration-200">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>As senhas não coincidem</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Campo de cargo */}
                  <div className="space-y-2">
                    <Label htmlFor="register-cargo" className="text-sm font-medium text-gray-700">Cargo</Label>
                    <select
                      id="register-cargo"
                      value={registerCargo}
                      onChange={(e) => setRegisterCargo(e.target.value)}
                      className="w-full h-12 px-3 border-2 border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm text-gray-900 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all duration-200"
                      required
                    >
                      <option value="Secretária">Secretária</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  
                  {/* Botão de cadastro */}
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full h-12 bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-red-700",
                      "text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
                      "transform hover:scale-[1.02] active:scale-[0.98]",
                      registerLoading && "animate-pulse"
                    )}
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Solicitar Cadastro'
                    )}
                  </Button>
                  
                  {/* Aviso sobre aprovação - Alert Card Estilizado */}
                   <div className="relative bg-gradient-to-r from-blue-50 to-blue-50/30 border-l-4 border-blue-400 rounded-lg p-4 shadow-sm animate-in fade-in duration-300">
                     <div className="flex items-start space-x-3">
                       {/* Ícone fixo à esquerda */}
                       <div className="flex-shrink-0">
                         <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                           <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                           </svg>
                         </div>
                       </div>
                       
                       {/* Conteúdo do texto */}
                       <div className="flex-1 min-w-0">
                         <p className="text-sm text-blue-800 leading-relaxed">
                           <span className="font-semibold">Seu cadastro será analisado</span> por um administrador antes da aprovação.
                         </p>
                       </div>
                       
                       {/* Botão de fechar opcional */}
                       <button 
                         type="button"
                         className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors duration-200"
                         onClick={(e) => {
                           const alertElement = e.currentTarget.closest('div[class*="bg-gradient-to-r"]');
                           if (alertElement) {
                             alertElement.style.display = 'none';
                           }
                         }}
                       >
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                       </button>
                     </div>
                   </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Rodapé com hierarquia visual melhorada */}
        <div className="text-center space-y-4 mt-8">
          {/* Linha 1 - Acesso restrito (destaque principal) */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">
                Acesso restrito à equipe da escola
              </span>
            </div>
          </div>
          
          {/* Linha 2 - Créditos do design (discreto) */}
          <p className="text-xs text-gray-400 italic font-light">
            Design System Mobbin Inspired
          </p>
        </div>
      </div>

      {/* Modal de Esqueceu a Senha */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div data-modal="forgot-password" className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4">
            <div className="p-8 text-center">
              {/* Ícone */}
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Título */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Entre em contato com o administrador
              </h3>

              {/* Mensagem */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                Para redefinir sua senha, fale com a equipe responsável pelo sistema.
              </p>

              {/* Botão */}
              <button
                onClick={() => {
                  const modal = document.querySelector('[data-modal="forgot-password"]');
                  if (modal) {
                    modal.classList.add('animate-out', 'fade-out', 'zoom-out-95', 'slide-out-to-bottom-4');
                    setTimeout(() => setShowForgotPasswordModal(false), 200);
                  } else {
                    setShowForgotPasswordModal(false);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ok, entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
