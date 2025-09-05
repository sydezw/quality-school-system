
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Download, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formatDate } from '@/utils/formatters';



interface Document {
  id: string;
  tipo: string;
  data: string;
  arquivo_link: string | null;
  status: 'gerado' | 'assinado' | 'cancelado';
  aluno_id: string | null;
  professor_id: string | null;
  alunos?: { nome: string };
  professores?: { nome: string };
}

interface Student {
  id: string;
  nome: string;
}

interface Teacher {
  id: string;
  nome: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState<'aluno' | 'professor'>('aluno');
  const { toast } = useToast();
  interface FormData {
    pessoa_id: string;
    tipo: string;
    arquivo_link?: string;
  }

  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => {
    fetchDocuments();
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select(`
          *,
          alunos (nome),
          professores (nome)
        `)
        .order('data', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Criar dados para inserção baseado no tipo de documento
      const insertData: any = {
        tipo: data.tipo,
        data: new Date().toISOString().split('T')[0],
        arquivo_link: data.arquivo_link || null,
        status: 'gerado'
      };

      if (documentType === 'aluno') {
        insertData.aluno_id = data.pessoa_id;
        insertData.professor_id = null;
      } else {
        insertData.professor_id = data.pessoa_id;
        insertData.aluno_id = null;
      }

      const { error } = await supabase
        .from('documentos')
        .insert([insertData]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Documento criado com sucesso!",
      });

      setIsDialogOpen(false);
      reset();
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o documento.",
        variant: "destructive",
      });
    }
  };

  const updateDocumentStatus = async (id: string, status: 'gerado' | 'assinado' | 'cancelado') => {
    try {
      const { error } = await supabase
        .from('documentos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Status do documento atualizado!",
      });
      
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    reset();
    setDocumentType('aluno');
    setIsDialogOpen(true);
    fetchTeachers();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'gerado': return 'bg-blue-100 text-blue-800';
      case 'assinado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      'contrato': 'Contrato',
      'declaracao_matricula': 'Declaração de Matrícula',
      'declaracao_frequencia': 'Declaração de Frequência',
      'declaracao_conclusao': 'Declaração de Conclusão',
      'certificado_professor': 'Certificado do Professor',
      'diploma_professor': 'Diploma do Professor',
      'comprovante_experiencia': 'Comprovante de Experiência',
      'documento_pessoal': 'Documento Pessoal'
    };
    return labels[tipo] || tipo;
  };

  const getDocumentTypeOptions = () => {
    if (documentType === 'aluno') {
      return [
        { value: 'contrato', label: 'Contrato' },
        { value: 'declaracao_matricula', label: 'Declaração de Matrícula' },
        { value: 'declaracao_frequencia', label: 'Declaração de Frequência' },
        { value: 'declaracao_conclusao', label: 'Declaração de Conclusão' }
      ];
    } else {
      return [
        { value: 'certificado_professor', label: 'Certificado do Professor' },
        { value: 'diploma_professor', label: 'Diploma do Professor' },
        { value: 'comprovante_experiencia', label: 'Comprovante de Experiência' },
        { value: 'documento_pessoal', label: 'Documento Pessoal' }
      ];
    }
  };





  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Documentos</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                onClick={openCreateDialog} 
                className="bg-brand-red hover:bg-brand-red/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Gerar Documento
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Novo Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="documentType">Tipo de Pessoa *</Label>
                <Select onValueChange={(value) => {
                  setDocumentType(value as 'aluno' | 'professor');
                  setValue('pessoa_id', '');
                  setValue('tipo', '');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {documentType && (
                <div>
                  <Label htmlFor="pessoa_id">{documentType === 'aluno' ? 'Aluno' : 'Professor'} *</Label>
                  <Select onValueChange={(value) => setValue('pessoa_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione o ${documentType === 'aluno' ? 'aluno' : 'professor'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(documentType === 'aluno' ? students : teachers).map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {documentType && (
                <div>
                  <Label htmlFor="tipo">Tipo de Documento *</Label>
                  <Select onValueChange={(value) => setValue('tipo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDocumentTypeOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="arquivo_link">Link do Arquivo</Label>
                <Input
                  id="arquivo_link"
                  {...register('arquivo_link')}
                  placeholder="https://exemplo.com/documento.pdf"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
                  Gerar Documento
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Gerados ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum documento gerado ainda.</p>
              <p className="text-sm text-gray-400">Clique no botão "Gerar Documento" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium text-base">
                      {doc.alunos?.nome || doc.professores?.nome}
                    </TableCell>
                    <TableCell className="text-base">{getTipoLabel(doc.tipo)}</TableCell>
                    <TableCell className="text-base">{formatDate(doc.data)}</TableCell>
                    <TableCell>
                        <Select
                          value={doc.status}
                          onValueChange={(value) => updateDocumentStatus(doc.id, value as 'gerado' | 'assinado' | 'cancelado')}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gerado">Gerado</SelectItem>
                            <SelectItem value="assinado">Assinado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {doc.arquivo_link && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.arquivo_link!, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.arquivo_link!;
                                link.download = `${getTipoLabel(doc.tipo)}_${doc.alunos?.nome}.pdf`;
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Documents;
