import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
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
            Acesso ao Sistema
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Gerencie sua escola com facilidade
          </p>
        </div>

        {/* Card de login com glassmorphism */}
        <Card className="backdrop-blur-xl bg-white/70 border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-800">Entrar</CardTitle>
            <CardDescription className="text-gray-600">
              Digite suas credenciais para acessar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-gray-600 hover:text-brand-red transition-colors duration-200"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              
              {/* Botão de login */}
              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-red-700",
                  "text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
                  "transform hover:scale-[1.02] active:scale-[0.98]",
                  isLoading && "animate-pulse"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
            
            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/70 px-2 text-gray-500">Ou continue com</span>
              </div>
            </div>
            
            {/* Botões de login social */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-11 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80 transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                className="h-11 bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80 transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.5 12.5c0-6.35-5.15-11.5-11.5-11.5S.5 6.15.5 12.5c0 5.74 4.21 10.49 9.71 11.35v-8.03H7.33v-3.32h2.88V9.85c0-2.84 1.69-4.41 4.28-4.41 1.24 0 2.54.22 2.54.22v2.79h-1.43c-1.41 0-1.85.87-1.85 1.77v2.13h3.15l-.5 3.32h-2.65v8.03c5.5-.86 9.71-5.61 9.71-11.35z"/>
                </svg>
                Facebook
              </Button>
            </div>
            
            {/* Link para registro */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link 
                  to="/auth/register" 
                  className="font-semibold text-brand-red hover:text-red-600 transition-colors duration-200"
                >
                  Solicitar acesso
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};