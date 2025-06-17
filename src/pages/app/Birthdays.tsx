
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Student {
  id: string;
  nome: string;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  turma: string | null;
}

export default function Birthdays() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      // Query: alunos com data_nascimento no mês atual + turma
      const { data, error } = await supabase
        .from("alunos")
        .select(`
          id, nome, data_nascimento, telefone, email, turma_id,
          turmas (nome)
        `)
        .filter("data_nascimento", "not.is", null);

      if (error) {
        setLoading(false);
        return;
      }

      // Filtra no front apenas aniversariantes do mês atual (evita timezone bug)
      const now = new Date();
      const currentMonth = now.getMonth() + 1;

      const result = (data as any[]).filter((aluno) => {
        if (!aluno.data_nascimento) return false;
        const month = Number(aluno.data_nascimento.split("-")[1]);
        return month === currentMonth;
      }).map((aluno) => ({
        id: aluno.id,
        nome: aluno.nome,
        data_nascimento: aluno.data_nascimento,
        telefone: aluno.telefone,
        email: aluno.email,
        turma: aluno.turmas ? aluno.turmas.nome : null,
      }));

      setStudents(result);
      setLoading(false);
    };

    fetchBirthdays();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Aniversariantes do Mês ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">Carregando...</div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">Nenhum aniversariante este mês.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Turma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell>{aluno.nome}</TableCell>
                    <TableCell>
                      {aluno.data_nascimento
                        ? (() => {
                            const [y, m, d] = aluno.data_nascimento.split("-");
                            return `${d}/${m}`;
                          })()
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {aluno.telefone || aluno.email || <span className="text-gray-400 text-xs">Sem contato</span>}
                    </TableCell>
                    <TableCell>{aluno.turma ?? <span className="text-gray-400 text-xs">-</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
