import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { PermissionButton } from '@/components/guards/PermissionButton';

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  idioma: string;
  responsavel_id: string | null;
  status: string;
  telefone: string | null;
  turmas?: {
    nome: string;
  } | null;
  responsaveis?: {
    nome: string;
  } | null;
}

const ContractGenerator = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Inglês');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const { data: studentsData, error } = await supabase
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          idioma,
          responsavel_id,
          status,
          telefone,
          turmas:turma_id(nome),
          responsaveis:responsavel_id(nome)
        `)
        .eq('status', 'Ativo')
        .order('nome', { ascending: true });

      if (error) throw error;

      setStudents(studentsData || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
    if (student) {
      setSelectedLanguage(student.idioma);
    }
  };

  const getContractTitle = () => {
    return selectedLanguage === 'Japonês' 
      ? 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS – CURSO DE JAPONÊS'
      : 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS – CURSO DE INGLÊS';
  };

  const handlePrint = () => {
    if (!selectedStudent) {
      toast({
        title: "Atenção",
        description: "Selecione um aluno para gerar o contrato.",
        variant: "destructive",
      });
      return;
    }

    const printContent = document.getElementById('contract-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato - ${selectedStudent.nome}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .contract-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .contract-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .contract-section {
              margin-bottom: 20px;
            }
            .contract-section h3 {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .contract-field {
              margin-bottom: 8px;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature-line {
              border-top: 1px solid #333;
              width: 200px;
              text-align: center;
              padding-top: 5px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-48"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="visualizarGeradorContratos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerador de Contratos</h1>
          <PermissionButton 
            permission="gerenciarGeradorContratos"
            onClick={handlePrint}
            disabled={!selectedStudent}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </PermissionButton>
        </div>

      {/* Seleção de Aluno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Selecionar Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Escolha um aluno para gerar o contrato:
              </label>
              <Select onValueChange={handleStudentSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um aluno..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nome} - {student.idioma}
                      {student.turmas?.nome && ` (${student.turmas.nome})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedStudent && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Aluno Selecionado:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Nome:</strong> {selectedStudent.nome}</div>
                  <div><strong>CPF:</strong> {selectedStudent.cpf || 'Não informado'}</div>
                  <div><strong>Idioma:</strong> {selectedStudent.idioma}</div>
                  <div><strong>Turma:</strong> {selectedStudent.turmas?.nome || 'Não informado'}</div>
                  <div><strong>Responsável:</strong> {selectedStudent.responsaveis?.nome || 'Não informado'}</div>
                  <div><strong>Status:</strong> {selectedStudent.status}</div>
                  <div><strong>Contato:</strong> {selectedStudent.telefone || 'Não informado'}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contrato Gerado */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Contrato Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="contract-content" className="space-y-6 p-6 bg-white border rounded-lg">
              <div className="contract-header text-center">
                <div className="mb-4 flex justify-center gap-2">
                  <PermissionButton
                    permission="gerenciarGeradorContratos"
                    variant={selectedLanguage === 'Inglês' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLanguage('Inglês')}
                  >
                    Inglês
                  </PermissionButton>
                  <PermissionButton
                    permission="gerenciarGeradorContratos"
                    variant={selectedLanguage === 'Japonês' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLanguage('Japonês')}
                  >
                    Japonês
                  </PermissionButton>
                </div>
                <h1 className="contract-title text-xl font-bold mb-4">
                  {getContractTitle()}
                </h1>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">CONTRATANTE:</h3>
                <div className="contract-field"><strong>Nome:</strong> {selectedStudent.nome}</div>
                <div className="contract-field"><strong>CPF:</strong> {selectedStudent.cpf || '_______________________'}</div>
                <div className="contract-field"><strong>Responsável:</strong> {selectedStudent.responsaveis?.nome || '_______________________'}</div>
                <div className="contract-field"><strong>Contato:</strong> {selectedStudent.telefone || '_______________________'}</div>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">CONTRATADA:</h3>
                <p>TS SCHOOL – CURSO DE IDIOMAS, inscrita no CNPJ nº 00.000.000/0001-00, com sede na Rua _________________________, nº _____, Bairro ___________________, Cidade de _____________________, Estado de ________.</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">1. OBJETO DO CONTRATO</h3>
                <p>O presente contrato tem como objeto a prestação de serviços educacionais referentes ao curso de <strong>{selectedLanguage}</strong>, ministrado pela CONTRATADA na turma <strong>{selectedStudent.turmas?.nome || '_______________________'}</strong>, conforme cronograma e metodologia estabelecida.</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">2. DURAÇÃO DO CONTRATO</h3>
                <p>O curso terá duração conforme o plano contratado, iniciando em ___/___/____, com término previsto para ___/___/____, podendo ser renovado mediante novo acordo entre as partes.</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">3. VALOR E FORMA DE PAGAMENTO</h3>
                <p>3.1. Pela prestação dos serviços objeto deste contrato, o CONTRATANTE pagará à CONTRATADA o valor de R$ ________ (________________________ reais) mensais.</p>
                <p>3.2. O vencimento da mensalidade ocorrerá todo dia ______ de cada mês.</p>
                <p>3.3. O não pagamento até a data de vencimento acarretará multa de 2% (dois por cento) sobre o valor da parcela, juros de 1% (um por cento) ao mês e atualização monetária.</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">4. OBRIGAÇÕES DA CONTRATADA</h3>
                <p>4.1. Oferecer aulas do curso contratado, de acordo com os dias e horários definidos para a turma <strong>{selectedStudent.turmas?.nome || '_______________________'}</strong>.</p>
                <p>4.2. Disponibilizar material didático (quando incluso no contrato) e suporte pedagógico.</p>
                <p>4.3. Comunicar ao CONTRATANTE qualquer alteração referente às aulas, horários ou cronograma.</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">5. OBRIGAÇÕES DO CONTRATANTE</h3>
                <p>5.1. Cumprir com os pagamentos nas datas acordadas.</p>
                <p>5.2. Zelar pelo bom uso das dependências e materiais fornecidos pela CONTRATADA.</p>
                <p>5.3. Comparecer às aulas com pontualidade e disciplina.</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">6. STATUS DO CONTRATO</h3>
                <p><strong>Status:</strong> {selectedStudent.status}</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">7. RESCISÃO CONTRATUAL</h3>
                <p>7.1. Este contrato poderá ser rescindido a qualquer tempo, por ambas as partes, mediante aviso prévio de 30 (trinta) dias.</p>
                <p>7.2. A ausência prolongada do aluno sem justificativa não o exime do pagamento das mensalidades vincendas até a data da rescisão formal.</p>
              </div>

              <div className="contract-section">
                <h3 className="font-bold mb-3">8. FORO</h3>
                <p>Fica eleito o foro da cidade de _____________________________, Estado de _________, para dirimir quaisquer controvérsias oriundas deste contrato.</p>
              </div>

              <div className="contract-section">
                <p className="text-center mb-8">Guarulhos, ____ de ______________ de 2025.</p>
              </div>

              <div className="signature-section flex justify-between mt-16">
                <div className="text-center">
                  <div className="border-t border-black w-64 mb-2"></div>
                  <p><strong>CONTRATANTE: {selectedStudent.nome}</strong></p>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-64 mb-2"></div>
                  <p><strong>CONTRATADA: TS SCHOOL – CURSO DE IDIOMAS</strong></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </PermissionGuard>
  );
};

export default ContractGenerator;