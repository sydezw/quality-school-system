import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentDialog from '@/components/students/StudentDialog';
import StudentTable from '@/components/students/StudentTable';
import { useStudents } from '@/hooks/useStudents';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionButton } from '@/components/shared/PermissionButton';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { Plus } from 'lucide-react';

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
  const { hasPermission, isOwner } = usePermissions();
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
    <PermissionGuard permission="visualizarAlunos">
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
            <PermissionButton 
              permission="gerenciarAlunos"
              className="bg-brand-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              onClick={handleCreate}
            >
              <Plus size={16} />
              Novo Aluno
            </PermissionButton>
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
    </PermissionGuard>
  );
};

export default Students;