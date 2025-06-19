
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentDialog from '@/components/students/StudentDialog';
import StudentTable from '@/components/students/StudentTable';
import { useStudents } from '@/hooks/useStudents';

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  status: string;
  idioma: string;
  turma_id: string | null;
  responsavel_id: string | null;
  turmas?: { nome: string };
  responsaveis?: { nome: string };
  data_nascimento: Date | null; // Garante a existência da propriedade
}

const Students = () => {
  const { students, classes, loading, saveStudent, deleteStudent } = useStudents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [query, setQuery] = useState('');

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Alunos</h1>
        <div className="flex-1 flex items-center gap-2 sm:ml-8">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
        </div>
        <StudentDialog
          isOpen={isDialogOpen}
          editingStudent={editingStudent}
          classes={classes}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          onOpenCreate={handleCreate}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTable
            students={filteredStudents}
            onEdit={handleEdit}
            onDelete={deleteStudent}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
