import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Save } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Aprovacao = 'aprovado' | 'reprovado';
type PFRow = {
  id?: string;
  aula_id: string;
  turma_id: string;
  aluno_id: string;
  data_prova: string;
  total_questoes: number;
  acertos: number;
  observacao: string | null;
  aprovacao_status: Aprovacao;
  aprovacao_manual: boolean;
};
type DatabaseExt = Database & {
  public: {
    Tables: Database['public']['Tables'] & {
      avaliacoes_prova_final: {
        Row: PFRow;
        Insert: PFRow;
        Update: Partial<PFRow>;
      };
    };
  };
};

interface AulaProvaFinalModalProps {
  aula: { id: string; turma_id: string; data: string; titulo?: string; semestre?: string } | null;
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
  const [notasProvaFinal, setNotasProvaFinal] = useState<Record<string, { acertos?: number; observacao?: string; aprovacao_status?: Aprovacao; aprovacao_manual?: boolean }>>({});
  const [totalQuestoes, setTotalQuestoes] = useState<number | undefined>(50);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAlunos = async () => {
      if (!aula?.turma_id) return;
      setLoadingAlunos(true);
      try {
        // Primeira tentativa: RPC dedicado
        const { data, error } = await supabase.rpc('get_turma_alunos', { turma_uuid: aula.turma_id });
        const raw = (data || []) as Array<{ aluno_id: string; aluno_nome: string }>;
        let lista = raw.map((d) => ({ aluno_id: d.aluno_id, aluno_nome: d.aluno_nome }));

        // Fallback: usar view de matrículas caso RPC retorne vazio ou erro
        if (error || lista.length === 0) {
          const { data: viewData, error: viewError } = await supabase
            .from('view_alunos_turmas')
            .select('aluno_id, aluno_nome')
            .eq('turma_id', aula.turma_id);
          if (!viewError) {
            const vraw = (viewData || []) as Array<{ aluno_id: string; aluno_nome: string }>;
            lista = vraw.map((d) => ({ aluno_id: d.aluno_id, aluno_nome: d.aluno_nome }));
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
  }, [aula?.turma_id, toast]);

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
          observacao: r.observacao || null,
          aprovacao_status: (r.aprovacao_manual ? r.aprovacao_status : ((r.acertos ?? 0) >= Math.ceil((totalQuestoes ?? 0) / 2) ? 'aprovado' : 'reprovado')) as Aprovacao,
          aprovacao_manual: !!r.aprovacao_manual
        }));

      if (registros.length === 0) {
        toast({ title: 'Nada a salvar', description: 'Preencha ao menos um número de acertos para salvar.', variant: 'default' });
        return;
      }

      const sp = supabase as unknown as SupabaseClient<DatabaseExt>;
      const { error } = await sp
        .from('avaliacoes_prova_final')
        .upsert(registros as PFRow[], { onConflict: 'aluno_id, turma_id, data_prova' });
      if (error) throw error;

      const alunosComPF = Array.from(new Set(registros.map(r => r.aluno_id)));
      await Promise.all(alunosComPF.map(async (alunoId) => {
        const { data: existente } = await supabase
          .from('presencas')
          .select('id, status')
          .eq('aula_id', aula.id)
          .eq('aluno_id', alunoId)
          .limit(1);
        const existenteRow = existente?.[0] as { id: string; status: string } | undefined;
        if (existenteRow?.id) {
          if (existenteRow.status !== 'Presente') {
            await supabase
              .from('presencas')
              .update({ status: 'Presente' })
              .eq('id', existenteRow.id);
          }
        } else {
          await supabase
            .from('presencas')
            .insert({ aula_id: aula.id, aluno_id: alunoId, status: 'Presente' });
        }
      }));

      toast({ title: 'Sucesso', description: 'Notas da Prova Final salvas com sucesso.' });
      setNotasProvaFinal({});
    } catch (err) {
      console.error('Erro ao salvar prova final:', err);
      toast({ title: 'Erro', description: 'Falha ao salvar notas da prova final.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const reconciliarPresenca = async () => {
      if (!isOpen || !aula?.id || !aula?.turma_id || alunos.length === 0) return;
      try {
        const sp = supabase as unknown as SupabaseClient<DatabaseExt>;
        for (const al of alunos) {
          const { data: pfReg } = await sp
            .from('avaliacoes_prova_final')
            .select('aluno_id')
            .eq('turma_id', aula.turma_id)
            .eq('aluno_id', al.aluno_id)
            .eq('data_prova', aula.data)
            .limit(1);
          if ((pfReg || []).length === 0) continue;

          const { data: existente } = await supabase
            .from('presencas')
            .select('id, status')
            .eq('aula_id', aula.id)
            .eq('aluno_id', al.aluno_id)
            .limit(1);
          const existenteRow = existente?.[0] as { id: string; status: string } | undefined;
          if (existenteRow?.id) {
            if (existenteRow.status !== 'Presente') {
              await supabase
                .from('presencas')
                .update({ status: 'Presente' })
                .eq('id', existenteRow.id);
            }
          } else {
            await supabase
              .from('presencas')
              .insert({ aula_id: aula.id, aluno_id: al.aluno_id, status: 'Presente' });
          }
        }
      } catch (e) {
        console.error('Erro ao reconciliar presenças para prova final:', e);
      }
    };

    const carregarExistentes = async () => {
      if (!isOpen || !aula?.turma_id || !aula?.data) return;
      try {
        const sp = supabase as unknown as SupabaseClient<DatabaseExt>;
        const { data } = await sp
          .from('avaliacoes_prova_final')
          .select('aluno_id, acertos, observacao, aprovacao_status, aprovacao_manual, total_questoes')
          .eq('turma_id', aula.turma_id)
          .eq('data_prova', aula.data);
        const rows = (data || []) as Array<{ aluno_id: string; acertos: number | null; observacao: string | null; aprovacao_status: Aprovacao | null; aprovacao_manual: boolean | null; total_questoes: number | null }>;
        const next: Record<string, { acertos?: number; observacao?: string; aprovacao_status?: Aprovacao; aprovacao_manual?: boolean }> = {};
        for (const r of rows) {
          next[r.aluno_id] = {
            acertos: typeof r.acertos === 'number' ? r.acertos : undefined,
            observacao: r.observacao ?? undefined,
            aprovacao_status: (r.aprovacao_status ?? undefined) as Aprovacao | undefined,
            aprovacao_manual: !!r.aprovacao_manual,
          };
          if (r.total_questoes && !totalQuestoes) setTotalQuestoes(r.total_questoes);
        }
        setNotasProvaFinal(prev => ({ ...next, ...prev }));
      } catch (e) {
        console.error('Erro ao carregar prova final existente:', e);
      }
    };
    carregarExistentes();
    reconciliarPresenca();
  }, [isOpen, aula?.turma_id, aula?.data, aula?.id, alunos, totalQuestoes, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
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
                  <TableHead>Aprovação</TableHead>
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
                    const aprovCalc: Aprovacao = total > 0 && acertos >= Math.ceil(total / 2) ? 'aprovado' : 'reprovado';
                    const cur = notasProvaFinal[al.aluno_id] || {};
                    const aprovShown: Aprovacao | undefined = cur.aprovacao_manual ? cur.aprovacao_status : aprovCalc;

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
                          <div className="w-44">
                            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r from-purple-500 to-purple-600`}
                                style={{ width: `${percentual}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{percentual}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${aprovShown === 'aprovado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{aprovShown === 'aprovado' ? 'Aprovado' : 'Reprovado'}</div>
                            <div className="w-36">
                              <Select
                                value={cur.aprovacao_status ?? aprovCalc}
                                onValueChange={(v) => setNotasProvaFinal(prev => ({
                                  ...prev,
                                  [al.aluno_id]: { ...prev[al.aluno_id], aprovacao_status: v as Aprovacao, aprovacao_manual: true }
                                }))}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Aprovação" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="aprovado">Aprovado</SelectItem>
                                  <SelectItem value="reprovado">Reprovado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
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
              <Button onClick={salvarProvaFinal} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
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
