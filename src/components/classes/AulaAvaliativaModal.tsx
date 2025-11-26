import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Save } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AulaAvaliativaModalProps {
  aula: any;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal específico para aulas avaliativas
 * 
 * TODO: Implementar funcionalidades específicas para aulas avaliativas:
 * - Gestão de notas e avaliações
 * - Critérios de avaliação
 * - Feedback dos alunos
 * - Relatórios de desempenho
 */
const AulaAvaliativaModal: React.FC<AulaAvaliativaModalProps> = ({
  aula,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [alunos, setAlunos] = useState<Array<{ aluno_id: string; aluno_nome: string }>>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [competencia, setCompetencia] = useState<'Listening' | 'Speaking' | 'Writing' | 'Reading'>('Listening');
  const [notasCompetencia, setNotasCompetencia] = useState<Record<string, { nota?: number; observacao?: string }>>({});
  const [notasGerais, setNotasGerais] = useState<Record<string, { nota?: number; observacao?: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAlunos = async () => {
      if (!aula?.turma_id) return;
      setLoadingAlunos(true);
      try {
        // Primeira tentativa: RPC dedicado
        const { data, error } = await supabase.rpc('get_turma_alunos', { turma_uuid: aula.turma_id });
        let lista = (data || []).map((d: any) => ({ aluno_id: d.aluno_id, aluno_nome: d.aluno_nome }));

        // Fallback: usar view de matrículas caso RPC retorne vazio ou erro
        if (error || lista.length === 0) {
          const { data: viewData, error: viewError } = await supabase
            .from('view_alunos_turmas')
            .select('aluno_id, aluno_nome')
            .eq('turma_id', aula.turma_id);
          if (!viewError) {
            lista = (viewData || []).map((d: any) => ({ aluno_id: d.aluno_id, aluno_nome: d.aluno_nome }));
          }
        }

        setAlunos(lista);
      } catch (err) {
        console.error('Erro ao carregar alunos da turma:', err);
        toast({ title: 'Erro', description: 'Não foi possível carregar os alunos da turma.', variant: 'destructive' });
      } finally {
        setLoadingAlunos(false);
      }
    };
    fetchAlunos();
  }, [aula?.turma_id]);

  const semestreAtual = aula?.semestre || (() => {
    try {
      const d = new Date(aula?.data);
      const ano = d.getFullYear();
      const sem = d.getMonth() < 6 ? 'Semestre 1' : 'Semestre 2';
      return `${ano} - ${sem}`;
    } catch {
      return 'Semestre atual';
    }
  })();

  const salvarCompetencias = async () => {
    if (!aula?.data || !aula?.turma_id || !aula?.id) {
      toast({ title: 'Dados insuficientes', description: 'Data, turma ou aula ausentes.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const skillKeyMap: Record<string, 'listening' | 'speaking' | 'writing' | 'reading'> = {
        Listening: 'listening',
        Speaking: 'speaking',
        Writing: 'writing',
        Reading: 'reading'
      };
      const coluna = skillKeyMap[competencia];

      const registros = alunos
        .map(({ aluno_id }) => ({ aluno_id, ...notasCompetencia[aluno_id] }))
        .filter(r => typeof r.nota === 'number')
        .map(r => ({
          aula_id: aula.id,
          aluno_id: r.aluno_id,
          data_avaliacao: aula.data,
          feedback_personalizado: r.observacao || null,
          // Preenche apenas a competência selecionada; as demais ficam nulas
          [coluna]: r.nota as number
        }));

      if (registros.length === 0) {
        toast({ title: 'Nada a salvar', description: 'Preencha ao menos uma nota para salvar.', variant: 'default' });
        return;
      }

      const { error } = await (supabase as any).from('avaliacoes_progresso').insert(registros);
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Avaliações por competência salvas com sucesso.' });
      setNotasCompetencia({});
    } catch (err) {
      console.error('Erro ao salvar avaliações:', err);
      toast({ title: 'Erro', description: 'Falha ao salvar avaliações por competência.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const salvarGerais = async () => {
    if (!aula?.data || !aula?.turma_id) {
      toast({ title: 'Dados insuficientes', description: 'Data ou turma da aula ausentes.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const registros = alunos
        .map(({ aluno_id }) => ({ aluno_id, ...notasGerais[aluno_id] }))
        .filter(r => typeof r.nota === 'number')
        .map(r => ({
          aluno_id: r.aluno_id,
          turma_id: aula.turma_id,
          data: aula.data,
          nota: r.nota as number,
          observacao: r.observacao || null,
        }));

      if (registros.length === 0) {
        toast({ title: 'Nada a salvar', description: 'Preencha ao menos uma nota para salvar.', variant: 'default' });
        return;
      }

      const { error } = await supabase.from('avaliacoes').insert(registros);
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Avaliações gerais salvas com sucesso.' });
      setNotasGerais({});
    } catch (err) {
      console.error('Erro ao salvar avaliações:', err);
      toast({ title: 'Erro', description: 'Falha ao salvar avaliações gerais.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-700">
            Aula Avaliativa - {aula?.titulo}
          </DialogTitle>
          <div className="text-center text-sm text-gray-600 mt-1">Semestre: {semestreAtual}</div>
        </DialogHeader>

        {loadingAlunos ? (
          <div className="flex items-center justify-center py-6 text-gray-600">Carregando alunos...</div>
        ) : (
          <Tabs defaultValue="competencia">
            <TabsList className="grid grid-cols-2 gap-2 mb-4">
              <TabsTrigger value="competencia">Por Competência</TabsTrigger>
              <TabsTrigger value="geral">Geral</TabsTrigger>
            </TabsList>

            <TabsContent value="competencia" className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Selecione a competência:</span>
                <Select value={competencia} onValueChange={(v) => setCompetencia(v as any)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Listening">Listening</SelectItem>
                    <SelectItem value="Speaking">Speaking</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alunos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Nenhum aluno encontrado nesta turma.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alunos.map(al => (
                      <TableRow key={al.aluno_id}>
                        <TableCell className="font-medium">{al.aluno_nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0-10"
                            value={notasCompetencia[al.aluno_id]?.nota ?? ''}
                            onChange={(e) => setNotasCompetencia(prev => ({
                              ...prev,
                              [al.aluno_id]: { ...prev[al.aluno_id], nota: Number(e.target.value) }
                            }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Observações"
                            value={notasCompetencia[al.aluno_id]?.observacao ?? ''}
                            onChange={(e) => setNotasCompetencia(prev => ({
                              ...prev,
                              [al.aluno_id]: { ...prev[al.aluno_id], observacao: e.target.value }
                            }))}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button onClick={salvarCompetencias} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Avaliações por Competência'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="geral" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alunos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Nenhum aluno encontrado nesta turma.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alunos.map(al => (
                      <TableRow key={al.aluno_id}>
                        <TableCell className="font-medium">{al.aluno_nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0-10"
                            value={notasGerais[al.aluno_id]?.nota ?? ''}
                            onChange={(e) => setNotasGerais(prev => ({
                              ...prev,
                              [al.aluno_id]: { ...prev[al.aluno_id], nota: Number(e.target.value) }
                            }))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Observações"
                            value={notasGerais[al.aluno_id]?.observacao ?? ''}
                            onChange={(e) => setNotasGerais(prev => ({
                              ...prev,
                              [al.aluno_id]: { ...prev[al.aluno_id], observacao: e.target.value }
                            }))}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button onClick={salvarGerais} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Avaliações Gerais'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-center mt-4">
          <Button onClick={onClose} className="bg-neutral-700 hover:bg-neutral-800">Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { AulaAvaliativaModal };