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
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AulaResumo = { id: string; turma_id: string; data: string; titulo?: string | null; semestre?: string | null };
interface AulaAvaliativaModalProps {
  aula: AulaResumo;
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
  type CompetenciaType = 'Listening' | 'Speaking' | 'Writing' | 'Reading';
  const [competencia, setCompetencia] = useState<CompetenciaType>('Listening');
  const [notasCompetencia, setNotasCompetencia] = useState<Record<string, Partial<Record<CompetenciaType, { nota?: number; observacao?: string }>>>>({});
  const [saving, setSaving] = useState(false);

  type PFRow = {
    id?: string;
    aula_id: string;
    turma_id: string;
    aluno_id: string;
    data_prova: string;
    total_questoes: number;
    acertos: number;
    observacao: string | null;
    aprovacao_status: 'aprovado' | 'reprovado';
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

  useEffect(() => {
    const fetchAlunos = async () => {
      if (!aula?.turma_id) return;
      setLoadingAlunos(true);
      try {
        let lista: Array<{ aluno_id: string; aluno_nome: string }> = [];

        const { data: rpcData, error: rpcError } = await supabase.rpc('get_turma_alunos', { turma_uuid: aula.turma_id });
        if (!rpcError && rpcData && rpcData.length > 0) {
          const rpcRows = (rpcData || []) as Array<{ aluno_id: string; aluno_nome: string }>;
          lista = rpcRows.map(d => ({ aluno_id: d.aluno_id, aluno_nome: d.aluno_nome }));
        }

        if (lista.length === 0) {
          const { data: viewData, error: viewError } = await supabase
            .from('view_alunos_turmas')
            .select('aluno_id, aluno_nome, turma_id')
            .eq('turma_id', aula.turma_id);
          if (!viewError && viewData && viewData.length > 0) {
            const viewRows = (viewData || []) as Array<{ aluno_id: string | null; aluno_nome: string | null; turma_id: string | null }>;
            lista = viewRows
              .filter(d => !!d.aluno_id && !!d.aluno_nome)
              .map(d => ({ aluno_id: d.aluno_id as string, aluno_nome: d.aluno_nome as string }));
          }
        }

        if (lista.length === 0) {
          const { data: legacyData, error: legacyError } = await supabase
            .from('aluno_turma')
            .select('aluno_id, turma_id, alunos(nome)')
            .eq('turma_id', aula.turma_id);
          if (!legacyError && legacyData && legacyData.length > 0) {
            const legacyRows = (legacyData || []) as Array<{ aluno_id: string; turma_id: string; alunos: { nome: string | null } | null }>;
            lista = legacyRows
              .filter(d => !!d.aluno_id && !!d.alunos?.nome)
              .map(d => ({ aluno_id: d.aluno_id, aluno_nome: (d.alunos?.nome || '') as string }));
          }
        }

        if (lista.length === 0) {
          const { data: turmaInfo } = await supabase
            .from('turmas')
            .select('tipo_turma')
            .eq('id', aula.turma_id)
            .single();
          const isParticular = ((turmaInfo as { tipo_turma: string | null } | null)?.tipo_turma ?? null) === 'Turma particular';
          const { data: alunosDiretos, error: alunosError } = await supabase
            .from('alunos')
            .select('id, nome')
            .or(isParticular ? `turma_particular_id.eq.${aula.turma_id}` : `turma_id.eq.${aula.turma_id}`);
          if (!alunosError && alunosDiretos && alunosDiretos.length > 0) {
            const alunosRows = (alunosDiretos || []) as Array<{ id: string; nome: string | null }>;
            lista = alunosRows
              .filter(a => !!a.nome)
              .map(aluno => ({ aluno_id: aluno.id, aluno_nome: aluno.nome as string }));
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

  useEffect(() => {
    const loadExistingCompetencias = async () => {
      if (!isOpen || !aula?.turma_id || !aula?.id || alunos.length === 0) return;
      try {
        const ids = alunos.map(a => a.aluno_id);
        const { data } = await supabase
          .from('avaliacoes_competencia')
          .select('aluno_id, competencia, nota, data, aula_id')
          .eq('turma_id', aula.turma_id)
          .eq('aula_id', aula.id)
          .in('aluno_id', ids)
          .order('data', { ascending: false });
        type Row = { aluno_id: string; competencia: CompetenciaType; nota: number | null; data: string; aula_id: string | null };
        const rows = (data || []) as Row[];
        const next: Record<string, Partial<Record<CompetenciaType, { nota?: number; observacao?: string }>>> = {};
        for (const r of rows) {
          const nota = r.nota;
          if (typeof nota === 'number') {
            const bounded = Math.max(0, Math.min(5, nota));
            const cur = next[r.aluno_id] || {};
            if (!cur[r.competencia]?.nota) {
              cur[r.competencia] = { nota: bounded };
              next[r.aluno_id] = cur;
            }
          }
        }
        setNotasCompetencia(prev => {
          const merged: Record<string, Partial<Record<CompetenciaType, { nota?: number; observacao?: string }>>> = { ...prev };
          for (const alunoId of Object.keys(next)) {
            const curPrev = merged[alunoId] || {};
            const curNext = next[alunoId] || {};
            const out: Partial<Record<CompetenciaType, { nota?: number; observacao?: string }>> = { ...curPrev };
            (['Listening','Speaking','Writing','Reading'] as CompetenciaType[]).forEach(comp => {
              const existing = curPrev[comp]?.nota;
              const incoming = curNext[comp]?.nota;
              if (existing === undefined && incoming !== undefined) {
                out[comp] = { ...(curPrev[comp] || {}), nota: incoming };
              }
            });
            merged[alunoId] = out;
          }
          return merged;
        });
      } catch (e) {
        console.error('Erro ao carregar notas existentes:', e);
      }
    };
    loadExistingCompetencias();
  }, [isOpen, aula?.id, aula?.turma_id, alunos]);

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
      const comps: CompetenciaType[] = ['Listening','Speaking','Writing','Reading'];
      const registros = alunos
        .flatMap(({ aluno_id }) => {
          return comps.map(comp => {
            const entry = notasCompetencia[aluno_id]?.[comp];
            if (typeof entry?.nota !== 'number') return null;
            return {
              aluno_id,
              turma_id: aula.turma_id,
              data: aula.data,
              aula_id: aula.id,
              competencia: comp,
              nota: Math.max(0, Math.min(5, entry.nota as number)),
              observacao: entry?.observacao || null,
            };
          });
        })
        .filter(Boolean) as Array<{
          aluno_id: string;
          turma_id: string;
          data: string;
          aula_id: string;
          competencia: CompetenciaType;
          nota: number;
          observacao: string | null;
        }>;

      if (registros.length === 0) {
        toast({ title: 'Nada a salvar', description: 'Preencha ao menos uma nota para salvar.', variant: 'default' });
        return;
      }

      const upsertRes = await supabase
        .from('avaliacoes_competencia')
        .upsert(registros, { onConflict: 'aluno_id, competencia, aula_id' });
      if (upsertRes.error) {
        const conflicts = registros.map(async (r) => {
          await supabase
            .from('avaliacoes_competencia')
            .delete()
            .eq('aluno_id', r.aluno_id)
            .eq('competencia', r.competencia)
            .eq('aula_id', r.aula_id);
        });
        await Promise.all(conflicts);
        const { error: insertError } = await supabase.from('avaliacoes_competencia').insert(registros);
        if (insertError) throw insertError;
      }

      const alunosComNotas = Array.from(new Set(registros.map(r => r.aluno_id)));
      await Promise.all(alunosComNotas.map(async (alunoId) => {
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

      toast({ title: 'Sucesso', description: 'Avaliações por competência salvas com sucesso.' });
      setNotasCompetencia({});
    } catch (err) {
      console.error('Erro ao salvar avaliações:', err);
      toast({ title: 'Erro', description: 'Falha ao salvar avaliações por competência.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const reconciliarPresenca = async () => {
      if (!isOpen || !aula?.id || !aula?.turma_id || alunos.length === 0) return;
      try {
        for (const al of alunos) {
          const { data: compReg } = await supabase
            .from('avaliacoes_competencia')
            .select('aluno_id')
            .eq('turma_id', aula.turma_id)
            .eq('aula_id', aula.id)
            .eq('aluno_id', al.aluno_id)
            .limit(1);
          if ((compReg || []).length === 0) continue;

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
        console.error('Erro ao reconciliar presenças para aula avaliativa:', e);
      }
    };
    reconciliarPresenca();
  }, [isOpen, aula?.id, aula?.turma_id, aula?.data, alunos]);

  

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
            <TabsList className="grid grid-cols-1 gap-2 mb-4">
              <TabsTrigger value="competencia">Por Competência</TabsTrigger>
            </TabsList>

            <TabsContent value="competencia" className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Preencha as notas por competência (0–5):</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Listening</TableHead>
                    <TableHead>Speaking</TableHead>
                    <TableHead>Writing</TableHead>
                    <TableHead>Reading</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alunos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        Nenhum aluno encontrado nesta turma.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alunos.map(al => (
                      <TableRow key={al.aluno_id}>
                        <TableCell className="font-medium">{al.aluno_nome}</TableCell>
                        {(['Listening','Speaking','Writing','Reading'] as CompetenciaType[]).map(comp => (
                          <TableCell key={comp}>
                            <Input
                              type="number"
                              step="0.1"
                              min={0}
                              max={5}
                              placeholder="0-5"
                              value={notasCompetencia[al.aluno_id]?.[comp]?.nota ?? ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                const nota = v === '' ? undefined : Math.max(0, Math.min(5, Number(v)));
                                setNotasCompetencia(prev => ({
                                  ...prev,
                                  [al.aluno_id]: {
                                    ...(prev[al.aluno_id] || {}),
                                    [comp]: { ...(prev[al.aluno_id]?.[comp] || {}), nota }
                                  }
                                }));
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button onClick={salvarCompetencias} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Todas as Competências'}
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
