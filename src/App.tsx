import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/authcontext';
import { useAuth } from '@/hooks/useAuth';
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AppLayout from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { ProfessorGuard } from "./components/guards/ProfessorGuard";
import Dashboard from "./pages/app/Dashboard";
import Reports from "./pages/app/Reports";
import Students from "./pages/app/Students";
import Teachers from "./pages/app/Teachers";
import Classes from "./pages/app/Classes";
import TeacherClasses from "./pages/app/TeacherClasses";
import Lessons from "./pages/app/Lessons";
import Financial from "./pages/app/Financial";
import Agenda from "./pages/app/Agenda";
import Materials from "./pages/app/Materials";
import Documents from "./pages/app/Documents";
import Contracts from "./pages/app/Contracts";
import ContractGenerator from "./pages/app/ContractGenerator";
import ContractGenerator2 from "./pages/app/ContractGenerator2";
import Plans from "./pages/app/Plans";
import Birthdays from "./pages/app/Birthdays";
import ApproveLogins from "./pages/app/ApproveLogins";
import Responsibles from "./pages/app/Responsibles";
import SimpleBarChartExample from "./pages/app/SimpleBarChartExample";
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient();

// Componente para redirecionamento inteligente baseado em permissões
const SmartRedirect = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    
    // Redirecionamento baseado no cargo do usuário
    const isProfessor = user.cargo === 'Professor';
    const redirectTo = isProfessor ? '/teacher-classes' : '/dashboard';
    
    return <Navigate to={redirectTo} replace />;
};

// Protected routes wrapper
const ProtectedRoutes = () => {
    return (
        <ProtectedRoute>
            <ProfessorGuard>
                <AppLayout>
                    <Outlet />
                </AppLayout>
            </ProfessorGuard>
        </ProtectedRoute>
    );
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <TooltipProvider>
                        <Sonner />
                        <Toaster />
                        <Routes>
                            {/* Public routes */}
                            <Route path="/auth" element={<Auth />} />
                            
                            {/* Protected routes */}
                            <Route element={<ProtectedRoutes />}>
                                <Route path="/" element={<SmartRedirect />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/students" element={<Students />} />
                                <Route path="/teachers" element={<Teachers />} />
                                <Route path="/classes" element={<Classes />} />
                                <Route path="/teacher-classes" element={<TeacherClasses />} />
                                <Route path="/lessons" element={<Lessons />} />
                                <Route path="/financial" element={
                                    <ErrorBoundary>
                                        <Financial />
                                    </ErrorBoundary>
                                } />
                                <Route path="/agenda" element={<Agenda />} />
                                <Route path="/materials" element={<Materials />} />
                                <Route path="/documents" element={<Documents />} />
                                <Route path="/contracts" element={<Contracts />} />
                                <Route path="/contract-generator" element={<ContractGenerator />} />
          <Route path="/contract-generator-2" element={<ContractGenerator2 />} />
                                <Route path="/plans" element={<Plans />} />
                                <Route path="/birthdays" element={<Birthdays />} />
                                <Route path="/approve-logins" element={<ApproveLogins />} />
                                <Route path="/responsibles" element={<Responsibles />} />
                                <Route path="/simple-bar-chart" element={<SimpleBarChartExample />} />
                            </Route>
                            
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </TooltipProvider>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;
