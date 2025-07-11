import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentDialog from '@/components/students/StudentDialog';
import StudentTable from '@/components/students/StudentTable';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import { StudentFilters } from '@/components/students/StudentFilters';
import { useStudents } from '@/hooks/useStudents';
import { Database } from '@/integrations/supabase/types';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Definir o tipo Student baseado na tabela alunos do banco
type Student = Database['public']['Tables']['alunos']['Row'] & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

// Constante para número de alunos por página
const STUDENTS_PER_PAGE = 20;

const Students = () => {
  const { students, classes, loading, isDeleting, saveStudent, deleteStudentWithPlan } = useStudents();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<StudentFilters>({});
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSubmit = async (data: any) => {
    const success = await saveStudent(data, editingStudent);
    if (success) {
      setIsDialogOpen(false);
      setEditingStudent(null);
    }
  };

  const handleEdit = (student: Student) => {
    console.log('Editando aluno:', student); // Adicione esta linha
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleCreateFinancialPlan = (student: Student) => {
    console.log('Criando plano financeiro para:', student); // Adicione esta linha
    setSelectedStudentForPlan(student);
    setIsFinancialDialogOpen(true);
  };

  const handleDelete = async (student: Student, plan: any) => {
    console.log('Excluindo aluno:', student, plan); // Adicione esta linha
    await deleteStudentWithPlan(student, plan);
  };

  const handleFinancialPlanSuccess = () => {
    console.log('Plano financeiro criado com sucesso!');
  };

  const handleFilterChange = (newFilters: StudentFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para página 1 quando filtros mudarem
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1); // Reset para página 1 quando busca mudar
  };

  // Filtra alunos pelo nome e pelos filtros selecionados
  const filteredStudents = useMemo(() => {
    let result = students;

    // Filtro por nome
    if (query) {
      result = result.filter(student =>
        student.nome.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filtro por status
    if (filters.status) {
      result = result.filter(student => student.status === filters.status);
    }

    // Filtro por idioma
    if (filters.idioma) {
      result = result.filter(student => student.idioma === filters.idioma);
    }

    // Filtro por turma
    if (filters.turma_id) {
      result = result.filter(student => student.turma_id === filters.turma_id);
    }

    return result;
  }, [students, query, filters]);

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Lógica para números de páginas visíveis (máximo 5)
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Se temos 5 ou menos páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para centralizar a página atual
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Ajusta o início se estivermos muito próximos do final
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Informações de exibição
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
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <Button 
            className="bg-brand-red text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            onClick={handleCreate}
          >
            <Plus size={16} />
            Novo Aluno
          </Button>
        </div>

        {/* Barra de busca e filtros */}
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
          
          {/* Componente de Filtros */}
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
              isDeleting={isDeleting}
            />
            
            {/* Controles de Paginação */}
            {filteredStudents.length > 0 && (
              <div className="mt-6 space-y-4">
                {/* Contador de alunos */}
                <div className="text-sm text-gray-600 text-center">
                  Mostrando {startItem} a {endItem} de {filteredStudents.length} alunos
                </div>
                
                {/* Indicador de página atual */}
                <div className="text-sm text-gray-500 text-center">
                  Página {currentPage} de {totalPages}
                </div>
                
                {/* Controles de navegação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    {/* Botão Anterior */}
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
                    
                    {/* Números das páginas */}
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
                    
                    {/* Botão Próxima */}
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
          onSuccess={handleFinancialPlanSuccess}
        />
      </div>
    </div>
  );
};

export default Students;