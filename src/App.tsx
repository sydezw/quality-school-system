import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/app/Dashboard";
import Reports from "./pages/app/Reports";
import Students from "./pages/app/Students";
import Teachers from "./pages/app/Teachers";
import Classes from "./pages/app/Classes";
import Financial from "./pages/app/Financial";
import Agenda from "./pages/app/Agenda";
import Materials from "./pages/app/Materials";
import Documents from "./pages/app/Documents";
import Contracts from "./pages/app/Contracts";
import Rooms from "./pages/app/Rooms";
import Birthdays from "./pages/app/Birthdays";

const queryClient = new QueryClient();

// Protected routes wrapper
const ProtectedRoutes = () => {
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

    return (
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/app" element={<ProtectedRoutes />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reports" element={<Reports />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="classes" element={<Classes />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="financial" element={<Financial />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="materials" element={<Materials />} />
              <Route path="documents" element={<Documents />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="birthdays" element={<Birthdays />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
