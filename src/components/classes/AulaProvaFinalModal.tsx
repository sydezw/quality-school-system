import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Save } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AulaProvaFinalModalProps {
  aula: any;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal específico para aulas de prova final
 * 
 * TODO: Implementar funcionalidades específicas para provas finais:
 * - Gestão de questões e gabaritos
 * - Controle de tempo de prova
 * - Correção automática/manual
 * - Geração de certificados
 * - Relatórios de aprovação
 */
const AulaProvaFinalModal: React.FC<AulaProvaFinalModalProps> = ({ aula, isOpen, onClose }) => {
  const { toast } = useToast();
  const [alunos, setAlunos] = useState<Array<{ aluno_id: string; aluno_nome: string }>>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [notasProvaFinal, setNotasProvaFinal] = useState<Record<string, { acertos?: number; observacao?: string }>>({});
  const [totalQuestoes, setTotalQuestoes] = useState<number | undefined>(50);
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
          } else {
            throw viewError;
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

  const salvarProvaFinal = async () => {
    if (!aula?.data || !aula?.turma_id || !aula?.id) {
      toast({ title: 'Dados insuficientes', description: 'Data, turma ou aula ausentes.', variant: 'destructive' });
      return;
    }
    if (!totalQuestoes || totalQuestoes <= 0) {
      toast({ title: 'Total de questões inválido', description: 'Defina um número de questões maior que zero.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const registros = alunos
        .map(({ aluno_id }) => ({ aluno_id, ...notasProvaFinal[aluno_id] }))
        .filter(r => typeof r.acertos === 'number')
        .map(r => ({
          aula_id: aula.id,
          turma_id: aula.turma_id,
          aluno_id: r.aluno_id,
          data_prova: aula.data,
          total_questoes: totalQuestoes,
          acertos: r.acertos as number,
          observacao: r.observacao || null
        }));

      if (registros.length === 0) {
        toast({ title: 'Nada a salvar', description: 'Preencha ao menos um número de acertos para salvar.', variant: 'default' });
        return;
      }

      const { error } = await (supabase as any).from('avaliacoes_prova_final').insert(registros);
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Notas da Prova Final salvas com sucesso.' });
      setNotasProvaFinal({});
    } catch (err) {
      console.error('Erro ao salvar prova final:', err);
      toast({ title: 'Erro', description: 'Falha ao salvar notas da prova final.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-700">
            Aula Prova Final - {aula?.titulo}
          </DialogTitle>
          <div className="text-center text-sm text-gray-600 mt-1">Semestre: {semestreAtual}</div>
        </DialogHeader>

        {loadingAlunos ? (
          <div className="flex items-center justify-center py-6 text-gray-600">Carregando alunos...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Total de questões:</span>
              <Input
                type="number"
                value={totalQuestoes ?? ''}
                onChange={e => setTotalQuestoes(Number(e.target.value))}
                className="w-28"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Acertos</TableHead>
                  <TableHead>Percentual</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      Nenhum aluno encontrado nesta turma.
                    </TableCell>
                  </TableRow>
                ) : (
                  alunos.map(al => {
                    const acertos = notasProvaFinal[al.aluno_id]?.acertos ?? 0;
                    const total = totalQuestoes ?? 0;
                    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;

                    // Define cores conforme percentual
                    const color = percentual < 50 ? 'from-red-500 to-red-600'
                      : percentual < 70 ? 'from-orange-500 to-orange-600'
                      : percentual < 85 ? 'from-yellow-500 to-yellow-600'
                      : 'from-green-500 to-green-600';

                    return (
                      <TableRow key={al.aluno_id}>
                        <TableCell className="font-medium">{al.aluno_nome}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={notasProvaFinal[al.aluno_id]?.acertos ?? ''}
                            onChange={(e) => setNotasProvaFinal(prev => ({
                              ...prev,
                              [al.aluno_id]: { ...prev[al.aluno_id], acertos: Number(e.target.value) }
                            }))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="w-40">
                            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${color}`}
                                style={{ width: `${percentual}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{percentual}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Observações"
                            value={notasProvaFinal[al.aluno_id]?.observacao ?? ''}
                            onChange={(e) => setNotasProvaFinal(prev => ({
                              ...prev,
                              [al.aluno_id]: { ...prev[al.aluno_id], observacao: e.target.value }
                            }))}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <Button onClick={salvarProvaFinal} disabled={saving} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Notas de Prova Final'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Button onClick={onClose} className="bg-neutral-700 hover:bg-neutral-800">Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AulaProvaFinalModal };