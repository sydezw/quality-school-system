
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookCopy, GraduationCap, TrendingUp } from 'lucide-react';

interface ReportData {
  totalAlunos: number;
  totalTurmas: number;
  alunosPorIdioma: { name: string; value: number }[];
  presencaPorTurma: { turma: string; presentes: number; faltas: number }[];
  avaliacoesPorTurma: { turma: string; media: number; total: number }[];
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalAlunos: 0,
    totalTurmas: 0,
    alunosPorIdioma: [],
    presencaPorTurma: [],
    avaliacoesPorTurma: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  const COLORS = ['#D72638', '#1A1A1A', '#6B7280', '#F59E0B'];

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Total de alunos ativos
      const { data: alunos, error: alunosError } = await supabase
        .from('alunos')
        .select('idioma, status')
        .eq('status', 'Ativo');

      if (alunosError) throw alunosError;

      // Total de turmas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('*');

      if (turmasError) throw turmasError;

      // Alunos por idioma
      const alunosPorIdioma = alunos?.reduce((acc: any, aluno) => {
        const existing = acc.find((item: any) => item.name === aluno.idioma);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: aluno.idioma, value: 1 });
        }
        return acc;
      }, []) || [];

      // Presença por turma (últimos 30 dias como exemplo)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - parseInt(selectedPeriod));

      const { data: presencas, error: presencasError } = await supabase
        .from('presencas')
        .select(`
          status,
          aulas!inner(
            turma_id,
            data,
            turmas!inner(nome)
          )
        `)
        .gte('aulas.data', thirtyDaysAgo.toISOString().split('T')[0]);

      if (presencasError) throw presencasError;

      const presencaPorTurma = presencas?.reduce((acc: any, presenca: any) => {
        const turmaNome = presenca.aulas.turmas.nome;
        const existing = acc.find((item: any) => item.turma === turmaNome);
        
        if (existing) {
          if (presenca.status === 'Presente') {
            existing.presentes += 1;
          } else {
            existing.faltas += 1;
          }
        } else {
          acc.push({
            turma: turmaNome,
            presentes: presenca.status === 'Presente' ? 1 : 0,
            faltas: presenca.status !== 'Presente' ? 1 : 0
          });
        }
        return acc;
      }, []) || [];

      // Avaliações por turma
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select(`
          nota,
          turmas!inner(nome)
        `)
        .gte('data', thirtyDaysAgo.toISOString().split('T')[0])
        .not('nota', 'is', null);

      if (avaliacoesError) throw avaliacoesError;

      const avaliacoesPorTurma = avaliacoes?.reduce((acc: any, avaliacao: any) => {
        const turmaNome = avaliacao.turmas.nome;
        const existing = acc.find((item: any) => item.turma === turmaNome);
        
        if (existing) {
          existing.total += parseFloat(avaliacao.nota);
          existing.count += 1;
          existing.media = existing.total / existing.count;
        } else {
          acc.push({
            turma: turmaNome,
            total: parseFloat(avaliacao.nota),
            count: 1,
            media: parseFloat(avaliacao.nota)
          });
        }
        return acc;
      }, []) || [];

      setReportData({
        totalAlunos: alunos?.length || 0,
        totalTurmas: turmas?.length || 0,
        alunosPorIdioma,
        presencaPorTurma,
        avaliacoesPorTurma: avaliacoesPorTurma.map((item: any) => ({
          turma: item.turma,
          media: Number(item.media.toFixed(2)),
          total: item.count
        }))
      });

    } catch (error) {
      console.error('Erro ao buscar dados dos relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios Pedagógicos</h1>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalAlunos}</div>
            <p className="text-xs text-muted-foreground">Alunos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalTurmas}</div>
            <p className="text-xs text-muted-foreground">Turmas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.avaliacoesPorTurma.reduce((acc, item) => acc + item.total, 0)}</div>
            <p className="text-xs text-muted-foreground">No período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.presencaPorTurma.length > 0 
                ? Math.round((reportData.presencaPorTurma.reduce((acc, item) => acc + item.presentes, 0) / 
                   (reportData.presencaPorTurma.reduce((acc, item) => acc + item.presentes + item.faltas, 0) || 1)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Taxa de presença</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="attendance">Frequência</TabsTrigger>
          <TabsTrigger value="grades">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Alunos por Idioma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.alunosPorIdioma}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.alunosPorIdioma.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequência por Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.presencaPorTurma}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="turma" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="presentes" fill="#000000" name="Presentes" />
                    <Bar dataKey="faltas" fill="#EF4444" name="Faltas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Frequência por Turma</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Turma</TableHead>
                    <TableHead>Presentes</TableHead>
                    <TableHead>Faltas</TableHead>
                    <TableHead>Taxa de Presença</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.presencaPorTurma.map((item, index) => {
                    const total = item.presentes + item.faltas;
                    const taxa = total > 0 ? ((item.presentes / total) * 100).toFixed(1) : '0';
                    return (
                      <TableRow key={index}>
                      <TableCell className="font-medium text-base">{item.turma}</TableCell>
                      <TableCell className="text-green-600 text-base">{item.presentes}</TableCell>
                      <TableCell className="text-red-600 text-base">{item.faltas}</TableCell>
                      <TableCell className="text-base">{taxa}%</TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Média de Avaliações por Turma</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Turma</TableHead>
                    <TableHead>Média</TableHead>
                    <TableHead>Total de Avaliações</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.avaliacoesPorTurma.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-base">{item.turma}</TableCell>
                      <TableCell className="text-base">{item.media}</TableCell>
                      <TableCell className="text-base">{item.total}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.media >= 7 ? 'bg-green-100 text-green-800' :
                          item.media >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.media >= 7 ? 'Excelente' : item.media >= 5 ? 'Bom' : 'Atenção'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
