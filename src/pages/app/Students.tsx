import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentDialog from '@/components/students/StudentDialog';
import StudentTable from '@/components/students/StudentTable';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import { StudentFilters } from '@/components/students/StudentFilters';
import { useStudents } from '@/hooks/useStudents';
import { Database } from '@/integrations/supabase/types';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Definir o tipo Student baseado na tabela alunos do banco
type Student = Database['public']['Tables']['alunos']['Row'] & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

const Students = () => {
  const { students, classes, loading, isDeleting, saveStudent, deleteStudentWithPlan } = useStudents();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<StudentFilters>({});
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<Student | null>(null);

  const handleSubmit = async (data: any) => {
    const success = await saveStudent(data, editingStudent);
    if (success) {
      setIsDialogOpen(false);
      setEditingStudent(null);
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

  const handleDelete = async (student: Student, plan: any) => {
    await deleteStudentWithPlan(student, plan);
  };

  const handleCreateFinancialPlan = (student: Student) => {
    setSelectedStudentForPlan(student);
    setIsFinancialDialogOpen(true);
  };

  const handleFinancialPlanSuccess = () => {
    console.log('Plano financeiro criado com sucesso!');
  };

  const handleFilterChange = (newFilters: StudentFilters) => {
    setFilters(newFilters);
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
          <button 
            className="bg-brand-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            onClick={handleCreate}
          >
            <Plus size={16} />
            Novo Aluno
          </button>
        </div>

        {/* Barra de busca e filtros */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alunos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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