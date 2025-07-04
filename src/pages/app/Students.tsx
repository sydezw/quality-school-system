import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentDialog from '@/components/students/StudentDialog';
import StudentTable from '@/components/students/StudentTable';
import FinancialPlanDialog from '@/components/financial/FinancialPlanDialog';
import { useStudents } from '@/hooks/useStudents';

import { Student } from '@/integrations/supabase/types';
import { Plus } from 'lucide-react';

const Students = () => {
  const { students, classes, loading, isDeleting, saveStudent, deleteStudentWithPlan } = useStudents();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState('');
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
    // Pode adicionar lógica adicional aqui se necessário
    console.log('Plano financeiro criado com sucesso!');
  };



  // Filtra alunos pelo nome (insensitive)
  const filteredStudents = useMemo(() => {
    if (!query) return students;
    return students.filter(student =>
      student.nome.toLowerCase().includes(query.toLowerCase())
    );
  }, [students, query]);

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
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar alunos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
            <button 
              className="bg-brand-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              onClick={handleCreate}
            >
              <Plus size={16} />
              Novo Aluno
            </button>
          </div>
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