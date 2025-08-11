import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/authcontext';
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/guards/protectedroute";
import Dashboard from "./pages/app/Dashboard";
import Reports from "./pages/app/Reports";
import Students from "./pages/app/Students";
import Teachers from "./pages/app/Teachers";
import Classes from "./pages/app/Classes";
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
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient();

// Protected routes wrapper
const ProtectedRoutes = () => {
    return (
        <ProtectedRoute>
            <AppLayout>
                <Outlet />
            </AppLayout>
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
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/students" element={<Students />} />
                                <Route path="/teachers" element={<Teachers />} />
                                <Route path="/classes" element={<Classes />} />
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
