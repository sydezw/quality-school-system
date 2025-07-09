import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentDialog from '@/components/students/StudentDialog';
import VirtualizedStudentTable from '@/components/students/VirtualizedStudentTable';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import { StudentFilters } from '@/components/students/StudentFilters';
import { useStudents } from '@/hooks/useStudents';
import { Database } from '@/integrations/supabase/types';
import { Plus, Search, Users, GraduationCap, TrendingUp, Filter, BookOpen, UserCheck, UserX, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Definir o tipo Student baseado na tabela alunos do banco
type Student = Database['public']['Tables']['alunos']['Row'] & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

// Definir o tipo Student estendido com relações
type StudentWithRelations = Student & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

// Adicionar import
import { useDebounce } from '@/hooks/useDebounce';

// No componente Students
const Students = () => {
  const { students, classes, loading, isDeleting, saveStudent, deleteStudentWithPlan } = useStudents();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithRelations | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<StudentFilters>({});
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<StudentWithRelations | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = async (data: any) => {
    const success = await saveStudent(data, editingStudent);
    if (success) {
      setIsDialogOpen(false);
      setEditingStudent(null);
    }
  };

  const handleEdit = (student: StudentWithRelations) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (student: StudentWithRelations, plan: any) => {
    await deleteStudentWithPlan(student, plan);
  };

  const handleCreateFinancialPlan = (student: StudentWithRelations) => {
    setSelectedStudentForPlan(student);
    setIsFinancialDialogOpen(true);
  };

  // Add the missing handleFinancialPlanSuccess function
  const handleFinancialPlanSuccess = () => {
    setIsFinancialDialogOpen(false);
    setSelectedStudentForPlan(null);
    // Optionally refresh data or show success message
  };

  const handleFilterChange = useCallback((newFilters: StudentFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setQuery('');
  }, []);

  // Otimizar filtros com debounce implícito
  const filteredStudents = useMemo(() => {
    if (!students.length) return [];
    
    let result = students;

    // Filtro por nome - otimizado
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      result = result.filter(student =>
        student.nome.toLowerCase().includes(searchTerm)
      );
    }

    // Filtros adicionais
    if (filters.status) {
      result = result.filter(student => student.status === filters.status);
    }

    if (filters.idioma) {
      result = result.filter(student => student.idioma === filters.idioma);
    }

    if (filters.turma_id) {
      result = result.filter(student => student.turma_id === filters.turma_id);
    }

    return result;
  }, [students, query, filters]);

  // Memoizar estatísticas
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const ativos = filteredStudents.filter(s => s.status === 'Ativo').length;
    const trancados = filteredStudents.filter(s => s.status === 'Trancado').length;
    const inativos = filteredStudents.filter(s => s.status === 'Inativo').length;
    
    return { total, ativos, trancados, inativos };
  }, [filteredStudents]);

  // Memoizar idiomas únicos
  const uniqueLanguages = useMemo(() => {
    if (!students.length) return [];
    const languages = students
      .map(s => s.idioma)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return languages;
  }, [students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center bg-white rounded-2xl p-12 shadow-2xl border border-red-100">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gradient-to-r from-red-600 to-pink-600 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-red-200 to-pink-200 opacity-25 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-semibold">Carregando alunos...</p>
          <p className="mt-2 text-gray-500">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/30">
      <div className="space-y-8 p-6">
        {/* Header Principal com Gradiente Vermelho-Rosa */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          <div className="relative bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl border border-red-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                      Gestão de Alunos
                    </h1>
                    <p className="text-red-100 text-xl font-medium mt-2">Sistema completo de gerenciamento estudantil</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-red-100">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{stats.total} alunos cadastrados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    <span className="font-medium">{stats.ativos} ativos</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleCreate}
                  className="bg-gradient-to-r from-white to-red-50 text-red-600 hover:from-red-50 hover:to-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  Novo Aluno
                </Button>
                
                <Button 
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas Transparentes e Harmônicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium uppercase tracking-wide">Total de Alunos</p>
                  <p className="text-4xl font-bold mt-2 text-red-800">{stats.total}</p>
                  <p className="text-red-600 text-sm mt-1">Cadastrados no sistema</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-3 shadow-md">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium uppercase tracking-wide">Alunos Ativos</p>
                  <p className="text-4xl font-bold mt-2 text-green-800">{stats.ativos}</p>
                  <p className="text-green-600 text-sm mt-1">Estudando atualmente</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-3 shadow-md">
                  <UserCheck className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-yellow-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-700 text-sm font-medium uppercase tracking-wide">Alunos Trancados</p>
                  <p className="text-4xl font-bold mt-2 text-yellow-800">{stats.trancados}</p>
                  <p className="text-yellow-600 text-sm mt-1">Temporariamente inativos</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-3 shadow-md">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium uppercase tracking-wide">Alunos Inativos</p>
                  <p className="text-4xl font-bold mt-2 text-red-800">{stats.inativos}</p>
                  <p className="text-red-600 text-sm mt-1">Não estudando</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-3 shadow-md">
                  <UserX className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Busca e Filtros Avançados */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
          <CardContent className="p-6">
            {/* Barra de Busca Principal */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar alunos por nome..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-14 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl text-lg bg-white/90 backdrop-blur-sm shadow-sm"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    showFilters 
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'border-gray-300 hover:border-red-500 hover:text-red-600'
                  }`}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros
                </Button>
                
                {(Object.keys(filters).length > 0 || query) && (
                  <Button 
                    onClick={clearFilters}
                    variant="outline"
                    className="px-6 py-3 rounded-xl font-semibold border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-300"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {/* Filtros Expandidos */}
            {showFilters && (
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-red-600" />
                  Filtros Avançados
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status do Aluno</label>
                    <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange({ ...filters, status: value || undefined })}>
                      <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:border-red-500">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os status</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Trancado">Trancado</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Idioma */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Idioma</label>
                    <Select value={filters.idioma || ''} onValueChange={(value) => handleFilterChange({ ...filters, idioma: value || undefined })}>
                      <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:border-red-500">
                        <SelectValue placeholder="Todos os idiomas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos os idiomas</SelectItem>
                        {uniqueLanguages.map((language) => (
                          <SelectItem key={language} value={language}>{language}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Turma */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Turma</label>
                    {/* Fix the turma_id type conversion */}
                    <Select value={filters.turma_id || ''} onValueChange={(value) => handleFilterChange({ ...filters, turma_id: value || undefined })}>
                      <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:border-red-500">
                        <SelectValue placeholder="Todas as turmas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas as turmas</SelectItem>
                        {classes.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id.toString()}>{turma.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <StudentDialog
          isOpen={isDialogOpen}
          editingStudent={editingStudent}
          classes={classes}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          onOpenCreate={handleCreate}
          hideButton={true}
        />

        {/* Tabela de Alunos */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200 p-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl p-2">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Lista de Alunos</h2>
                  <p className="text-gray-600 text-sm mt-1">{filteredStudents.length} alunos encontrados</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {filteredStudents.length}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <VirtualizedStudentTable
              students={filteredStudents}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateFinancialPlan={handleCreateFinancialPlan}
              isDeleting={isDeleting}
            />
          </CardContent>
        </Card>

        <FinancialPlanDialog
          isOpen={isFinancialDialogOpen}
          onOpenChange={setIsFinancialDialogOpen}
          selectedStudent={selectedStudentForPlan}
          onSuccess={handleFinancialPlanSuccess}
        />
      </div>
    </div>
  );
};

export default Students;