import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Phone, MapPin, FileText, Users, UserPlus } from 'lucide-react';
import { useResponsibles } from '@/hooks/useResponsibles';
import { Responsible } from '@/integrations/supabase/types';
import ResponsibleDialog from '@/components/students/ResponsibleDialog';
import { DeleteResponsibleDialog } from '@/components/responsibles/DeleteResponsibleDialog';
import AttachStudentModal from '@/components/responsibles/AttachStudentModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Responsibles = () => {
  const { responsibles, loading, saveResponsible, deleteResponsible } = useResponsibles();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponsible, setEditingResponsible] = useState<Responsible | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responsibleToDelete, setResponsibleToDelete] = useState<Responsible | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attachStudentModalOpen, setAttachStudentModalOpen] = useState(false);
  const [responsibleForAttachment, setResponsibleForAttachment] = useState<Responsible | null>(null);
  const [studentsData, setStudentsData] = useState<Record<string, any[]>>({});
  const [filterType, setFilterType] = useState<'all' | 'with_students' | 'without_students'>('all');
  const { toast } = useToast();

  // Buscar alunos vinculados a cada responsável
  const fetchStudentsForResponsibles = async () => {
    try {
      const { data: students, error } = await supabase
        .from('alunos')
        .select('id, nome, responsavel_id, status')
        .not('responsavel_id', 'is', null);

      if (error) throw error;

      // Agrupar alunos por responsável
      const groupedStudents: Record<string, any[]> = {};
      students?.forEach(student => {
        if (student.responsavel_id) {
          if (!groupedStudents[student.responsavel_id]) {
            groupedStudents[student.responsavel_id] = [];
          }
          groupedStudents[student.responsavel_id].push(student);
        }
      });

      setStudentsData(groupedStudents);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  useEffect(() => {
    if (responsibles.length > 0) {
      fetchStudentsForResponsibles();
    }
  }, [responsibles]);

  const filteredResponsibles = responsibles.filter(responsible => {
    const matchesSearch = responsible.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responsible.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      responsible.telefone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterType === 'with_students') {
      return studentsData[responsible.id] && studentsData[responsible.id].length > 0;
    }
    
    if (filterType === 'without_students') {
      return !studentsData[responsible.id] || studentsData[responsible.id].length === 0;
    }
    
    return true;
  });

  const handleCreateResponsible = () => {
    setEditingResponsible(null);
    setIsDialogOpen(true);
  };

  const handleEditResponsible = (responsible: Responsible) => {
    setEditingResponsible(responsible);
    setIsDialogOpen(true);
  };

  const handleDeleteResponsible = (responsible: Responsible) => {
    setResponsibleToDelete(responsible);
    setDeleteDialogOpen(true);
  };

  const handleAttachStudent = (responsible: Responsible) => {
    setResponsibleForAttachment(responsible);
    setAttachStudentModalOpen(true);
  };

  const handleAttachStudentSuccess = async () => {
    // Recarregar dados dos alunos após anexar
    await fetchStudentsForResponsibles();
    toast({
      title: 'Sucesso!',
      description: 'Aluno anexado ao responsável com sucesso.',
    });
  };

  const handleResponsibleSubmit = async (data: any) => {
    const success = await saveResponsible(data, editingResponsible);
    if (success) {
      setIsDialogOpen(false);
      setEditingResponsible(null);
      // Recarregar dados dos alunos após salvar
      await fetchStudentsForResponsibles();
      toast({
        title: editingResponsible ? 'Responsável atualizado!' : 'Responsável criado!',
        description: editingResponsible 
          ? 'As informações do responsável foram atualizadas com sucesso.'
          : 'O novo responsável foi cadastrado com sucesso.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!responsibleToDelete) return;
    
    setIsDeleting(true);
    const success = await deleteResponsible(responsibleToDelete.id);
    
    if (success) {
      setDeleteDialogOpen(false);
      setResponsibleToDelete(null);
      // Recarregar dados dos alunos após excluir
      await fetchStudentsForResponsibles();
    }
    
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando responsáveis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Responsáveis</h1>
          <p className="text-gray-600">Gerencie os responsáveis pelos alunos</p>
        </div>
        <Button onClick={handleCreateResponsible}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Responsável
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, CPF, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={filterType === 'with_students' ? 'default' : 'outline'}
            onClick={() => setFilterType('with_students')}
            size="sm"
          >
            Com Alunos
          </Button>
          <Button
            variant={filterType === 'without_students' ? 'default' : 'outline'}
            onClick={() => setFilterType('without_students')}
            size="sm"
          >
            Sem Alunos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Responsáveis</p>
                <p className="text-2xl font-bold text-gray-900">{responsibles.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Telefone</p>
                <p className="text-2xl font-bold text-gray-900">
                  {responsibles.filter(r => r.telefone).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alunos Vinculados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(studentsData).reduce((total, students) => total + students.length, 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sem Alunos Vinculados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {responsibles.filter(r => !studentsData[r.id] || studentsData[r.id].length === 0).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responsibles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResponsibles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Nenhum responsável encontrado.</p>
          </div>
        ) : (
          filteredResponsibles.map((responsible) => (
            <Card key={responsible.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{responsible.nome}</CardTitle>
                    {responsible.cpf && (
                      <p className="text-sm text-gray-600">CPF: {responsible.cpf}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditResponsible(responsible)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteResponsible(responsible)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {(!studentsData[responsible.id] || studentsData[responsible.id].length === 0) && (
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                        onClick={() => handleAttachStudent(responsible)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {responsible.telefone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {responsible.telefone}
                    </div>
                  )}
                  {responsible.endereco && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {responsible.endereco}
                    </div>
                  )}
                  
                  {/* Informações dos alunos vinculados */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Alunos Vinculados</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {studentsData[responsible.id]?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    {studentsData[responsible.id] && studentsData[responsible.id].length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {studentsData[responsible.id].map((student) => (
                          <Badge 
                            key={student.id} 
                            variant={student.status === 'ativo' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {student.nome}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ResponsibleDialog
        isOpen={isDialogOpen}
        editingResponsible={editingResponsible}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleResponsibleSubmit}
        onOpenCreate={handleCreateResponsible}
      />

      <DeleteResponsibleDialog
        isOpen={deleteDialogOpen}
        responsible={responsibleToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <AttachStudentModal
        isOpen={attachStudentModalOpen}
        onOpenChange={setAttachStudentModalOpen}
        responsible={responsibleForAttachment}
        onSuccess={handleAttachStudentSuccess}
      />
    </div>
  );
};

export default Responsibles;