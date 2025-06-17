
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  status: string;
  idioma: string;
  turma_id: string | null;
  responsavel_id: string | null;
  turmas?: { nome: string };
  responsaveis?: { nome: string };
}

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentTable = ({ students, onEdit, onDelete }: StudentTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Trancado': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum aluno cadastrado ainda.</p>
        <p className="text-sm text-gray-400">Clique no botão "Novo Aluno" para começar.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Idioma</TableHead>
          <TableHead>Turma</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">{student.nome}</TableCell>
            <TableCell>{student.cpf || 'Não informado'}</TableCell>
            <TableCell>{student.idioma}</TableCell>
            <TableCell>{student.turmas?.nome || 'Sem turma'}</TableCell>
            <TableCell>{student.responsaveis?.nome || 'Sem responsável'}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(student.status)}>
                {student.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {student.telefone && <div>{student.telefone}</div>}
                {student.email && <div className="text-gray-500">{student.email}</div>}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(student)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(student.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StudentTable;
