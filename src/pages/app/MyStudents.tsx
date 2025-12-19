import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentDialog from '@/components/students/StudentDialog';
import StudentTable from '@/components/students/StudentTable';
import { StudentDetailsModalProfessor } from '@/components/students/StudentDetailsModalProfessor';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import { StudentFilters } from '@/components/students/StudentFilters';
import { useStudents } from '@/hooks/useStudents';
import { Database } from '@/integrations/supabase/types';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type Student = Database['public']['Tables']['alunos']['Row'] & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

const STUDENTS_PER_PAGE = 20;

const MyStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, classes, loading, isDeleting, saveStudent, deleteStudentWithPlan } = useStudents();

  const [professorTurmaIds, setProfessorTurmaIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<{ status?: string; idioma?: string; turma_id?: string }>({ status: 'Ativo' });
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null);

  useEffect(() => {
    (async () => {
      if (!user?.email) return;
      let effectiveProfessorId = user.id;
      const { data: usuarioByEmail } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .limit(1);
      if (usuarioByEmail && usuarioByEmail[0]?.id) {
        effectiveProfessorId = usuarioByEmail[0].id as string;
      }
      const { data: minhasTurmas } = await supabase
        .from('turmas')
        .select('id')
        .eq('professor_id', effectiveProfessorId);
      setProfessorTurmaIds((minhasTurmas || []).map(t => t.id));
    })();
  }, [user?.id, user?.email]);

  const handleSubmit = async (data: any) => {
    const success = await saveStudent(data, editingStudent);
    if (success) {
      setIsDialogOpen(false);
      setEditingStudent(null);
      if (data.aulas_particulares) navigate('/classes');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleCreateFinancialPlan = (student: Student) => {
    setSelectedStudentForPlan(student);
    setIsFinancialDialogOpen(true);
  };

  const handleDelete = async (student: Student, plan: any) => {
    await deleteStudentWithPlan(student, plan);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudentForDetails(student);
    setIsDetailsModalOpen(true);
  };

  const handleCloseWithPrivateClasses = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    navigate('/classes');
  };

  const handleFilterChange = (newFilters: { status?: string; idioma?: string; turma_id?: string }) => {
    const safeFilters = { ...newFilters };
    if (safeFilters.turma_id && !professorTurmaIds.includes(safeFilters.turma_id)) {
      delete safeFilters.turma_id;
    }
    setFilters(safeFilters);
    setCurrentPage(1);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1);
  };

  const professorStudents = useMemo(() => {
    if (professorTurmaIds.length === 0) return [] as Student[];
    return students.filter(s => {
      const tRegular = s.turma_id ? professorTurmaIds.includes(String(s.turma_id)) : false;
      const tParticular = s.turma_particular_id ? professorTurmaIds.includes(String(s.turma_particular_id)) : false;
      return tRegular || tParticular;
    });
  }, [students, professorTurmaIds]);

  const filteredStudents = useMemo(() => {
    let result = professorStudents;
    if (query) {
      result = result.filter(student => student.nome.toLowerCase().includes(query.toLowerCase()));
    }
    if (filters.status) {
      result = result.filter(student => student.status === filters.status);
    }
    if (filters.idioma) {
      result = result.filter(student => student.idioma === filters.idioma);
    }
    if (filters.turma_id) {
      result = result.filter(student => String(student.turma_id) === filters.turma_id || String(student.turma_particular_id) === filters.turma_id);
    }
    return result;
  }, [professorStudents, query, filters]);

  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = filteredStudents.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredStudents.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Meus Alunos</h1>
          <Button 
            className="bg-brand-red text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            onClick={handleCreate}
          >
            <Plus size={16} />
            Novo Aluno
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alunos..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <StudentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <StudentDialog
          isOpen={isDialogOpen}
          editingStudent={editingStudent}
          classes={classes}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          onOpenCreate={handleCreate}
          hideButton={true}
          onCloseWithPrivateClasses={handleCloseWithPrivateClasses}
        />

        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Alunos ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudentTable
              students={currentStudents}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateFinancialPlan={handleCreateFinancialPlan}
              onViewDetails={handleViewDetails}
              isDeleting={isDeleting}
            />

            {filteredStudents.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="text-sm text-gray-600 text-center">
                  Mostrando {startItem} a {endItem} de {filteredStudents.length} alunos
                </div>
                <div className="text-sm text-gray-500 text-center">
                  Página {currentPage} de {totalPages}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Anterior
                    </Button>
                    <div className="flex space-x-1">
                      {visiblePages.map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[40px] ${
                            currentPage === page 
                              ? "bg-brand-red text-white hover:bg-red-700" 
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Próxima
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <FinancialPlanDialog
          isOpen={isFinancialDialogOpen}
          onOpenChange={setIsFinancialDialogOpen}
          selectedStudent={selectedStudentForPlan}
          onSuccess={() => {}}
        />

        <StudentDetailsModalProfessor
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          student={selectedStudentForDetails}
        />
      </div>
    </div>
  );
};

export default MyStudents;
