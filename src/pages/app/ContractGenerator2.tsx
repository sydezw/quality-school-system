import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Printer, FileText, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import teenSpeechSignature from '@/assets/signatures/teen-speech-assinatura.png';
import testemunha1Signature from '@/assets/signatures/testemunha1.png';
import testemunha2Signature from '@/assets/signatures/testemunha2.png';
import '@/pages/app/contract-styles.css'

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  responsaveis?: {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
  } | null;
  financeiro_alunos?: Array<{
    planos: {
      nome: string;
      valor_total: number;
      numero_aulas: number;
      frequencia: string;
      frequencia_aulas: string;
      descricao: string;
    };
  }>;
}

const ContractGenerator2 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const editableRef = useRef<HTMLDivElement>(null);

  // Função para calcular a idade do aluno
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Função para determinar se deve mostrar a seção do responsável
  const shouldShowResponsavelSection = (): boolean => {
    if (!selectedStudent?.data_nascimento) return true; // Se não tem data de nascimento, mostra por segurança
    
    const age = calculateAge(selectedStudent.data_nascimento);
    const hasResponsavel = selectedStudent.responsaveis?.nome;
    
    // Se menor de 18, sempre mostra
    if (age < 18) return true;
    
    // Se 18+ mas tem responsável cadastrado, mostra
    if (age >= 18 && hasResponsavel) return true;
    
    // Se 18+ e não tem responsável, não mostra
    return false;
  };

  // Função para gerar o conteúdo da seção do responsável
  const generateResponsavelSection = (): string => {
    const age = selectedStudent?.data_nascimento ? calculateAge(selectedStudent.data_nascimento) : 0;
    const hasResponsavel = selectedStudent?.responsaveis?.nome;
    
    // Se 18+ e não tem responsável, retorna espaço em branco para manter estrutura
    if (!shouldShowResponsavelSection()) {
      return `
<div style="width: 1036px; height: 220px; margin-bottom: 15px;">
  <!-- Espaço reservado para seção do responsável -->
</div>`;
    }
    
    let sectionTitle = '02. Identificação do RESPONSÁVEL FINANCEIRO (se menor de idade):';
    if (age >= 18 && hasResponsavel) {
      sectionTitle = '02. Identificação do RESPONSÁVEL FINANCEIRO (cadastrado):';
    }
    
    // Se é menor de idade e não tem responsável, mostra aviso
    if (age < 18 && !hasResponsavel) {
      return `
    <h4 style="color: #856404; background-color: #fff3cd; padding: 10px; border: 1px solid #ffeaa7; border-radius: 4px;">${sectionTitle}</h4>
    <p style="color: #856404; font-weight: bold;">⚠️ DADOS DO RESPONSÁVEL OBRIGATÓRIOS PARA MENORES DE 18 ANOS</p>
    <p>Nome: <span class="placeholder-text">Nome do responsável</span></p>
    <p>CPF: <span class="placeholder-text">CPF do responsável</span></p>
    <p>Telefone: <span class="placeholder-text">Telefone do responsável</span></p>
    <p>E-mail: <span class="placeholder-text">E-mail do responsável</span></p>`;
    }
    
    // Seção normal com dados do responsável
    return `
    <h4>${sectionTitle}</h4>
    <p>Nome: ${selectedStudent?.responsaveis?.nome || '<span class="placeholder-text">Nome do responsável</span>'}</p>
    <p>CPF: ${selectedStudent?.responsaveis?.cpf || '<span class="placeholder-text">CPF do responsável</span>'}</p>
    <p>Telefone: ${selectedStudent?.responsaveis?.telefone || '<span class="placeholder-text">Telefone do responsável</span>'}</p>
    <p>E-mail: ${selectedStudent?.responsaveis?.email || '<span class="placeholder-text">E-mail do responsável</span>'}</p>`;
  };

  // Derived data from selected student
  const planData = selectedStudent?.financeiro_alunos;
  const financialData = selectedStudent?.financeiro_alunos;

  useEffect(() => {
    fetchStudents();
    
    // Recuperar aluno selecionado do localStorage
    const savedStudent = localStorage.getItem('selectedStudent');
    if (savedStudent) {
      try {
        setSelectedStudent(JSON.parse(savedStudent));
      } catch (error) {
        console.error('Erro ao recuperar aluno salvo:', error);
      }
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          responsaveis(nome, cpf, telefone, email, endereco, numero_endereco)
        `);

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar alunos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!selectedStudent) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selecionar Aluno - CONTRATO DE PRESTAÇÃO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Buscar aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => navigate('/contract-generator')}
                className="flex items-center gap-2"
              >
                ← Voltar
              </Button>
            </div>
            
            {filteredStudents.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedStudent(student);
                      localStorage.setItem('selectedStudent', JSON.stringify(student));
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{student.nome}</p>
                        <p className="text-sm text-gray-600">CPF: {student.cpf || 'Não informado'}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Selecionar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredStudents.length === 0 && searchTerm && (
                  <div className="text-center py-4 text-gray-500">
                    <p>Nenhum aluno encontrado com o termo "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const logoBase64 = "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAyMDAxMDkwNC8vRU4iCiAiaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogd2lkdGg9IjE5My4wMDAwMDBwdCIgaGVpZ2h0PSIxMzEuMDAwMDAwcHQiIHZpZXdCb3g9IjAgMCAxOTMuMDAwMDAwIDEzMS4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KCjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDEzMS4wMDAwMDApIHNjYWxlKDAuMTAwMDAwLC0wLjEwMDAwMCkiCmZpbGw9IiMwMDAwMDAiIHN0cm9rZT0ibm9uZSI+CjxwYXRoIGQ9Ik00NzggMTEyNCBjLTQwIC0yMSAtNDQgLTUzIC0xNSAtMTI2IDI5IC03MyA0MiAtMTIyIDUyIC0xOTMgNCAtMjcKMTUgLTY5IDI1IC05MiAxNyAtMzkgMjIgLTQzIDU0IC00MyAyNSAwIDM2IC00IDM2IC0xNSAwIC04IC02IC0xNSAtMTQgLTE1Ci0yMCAwIC02MSAtODcgLTQ4IC0xMDMgMTcgLTIyIDIwIC01NiA2IC02OCAtMTIgLTEwIC05IC0xNSAxNiAtMzEgMjUgLTE1IDMxCi0yNCAyOCAtNDggLTIgLTE5IDUgLTM3IDE5IC01MiAxMSAtMTMgMjQgLTMyIDI3IC00NCA3IC0yMSAtMjQgLTEyMyAtNDkgLTE2MAotMTIgLTE5IC0xMiAtMjQgMCAtMzQgMTYgLTE0IDEzIC0xOSA0MSA2OCAyMiA2OCA0MCA4OSA2MyA2OSAxNCAtMTMgNDYgLTIzCjkxIC0zMCA4IC0xIDE1IDUgMTYgMTMgMyAzNiA1IDQwIDIzIDQwIDE1IDAgMjUgMjEgNTAgMTAzIDE4IDU2IDQyIDEzNCA1NQoxNzIgbDIzIDcwIDcgLTU1IGM0IC0zMCAxMiAtNzEgMTkgLTkwIGwxMSAtMzUgNyAzMCBjNCAxNyA3IDUwIDggNzUgMiA2NyAxNwo4MyAyOCAzMCA3IC0zNiAxNCAtNDYgNDYgLTYzIDM1IC0xOCA0MCAtMTggNTQgLTQgMjMgMjIgMTIgNDAgLTUxIDgyIC03OSA1Mgo5MCA5MyAtNDkgMTgyIDI1IDU0IDEyMiA4MSAxODggNTEgMjggLTEzIDUwIC03NSA0MSAtMTE0IC02IC0yMSAtMTIgLTI0IC01MAotMjQgLTQ1IDAgLTU2IDEwIC01NiA1MSAwIDEyIC01IDE2IC0xNSAxMyAtMjIgLTkgLTE4IC00OCA4IC03MiAxMyAtMTIgMjgKLTIyIDMzIC0yMiAyNSAwIDY2IC02MCA3MSAtMTA0IDEwIC04OCAtNjAgLTE0OCAtMTU1IC0xMzIgbC0zNCA1IDcgLTQ3IGMxMAotNjggMzAgLTEwMiA2MCAtMTAyIDIyIDAgMjUgLTQgMjUgLTM1IDAgLTM0IDIwIC00OSAzNSAtMjUgMyA1IDE3IDEwIDMwIDEwCjEzIDAgMjcgNSAzMCAxMCAxMCAxNiAzMyAxMiA1NSAtMTAgMTQgLTE0IDIwIC0zMyAyMCAtNjQgMCAtMjYgNiAtNDggMTUgLTU2CjI2IC0yMSAyOSAxNCA2IDc1IC0yNyA3MyAtMjggMTM5IC0xIDE2MiAxMyAxMiAyMCAzMCAyMCA1NSAwIDI2IDYgNDEgMjEgNTIKMTUgMTAgMjAgMjEgMTYgMzYgLTMgMTIgLTEgMzUgNSA1MSA5IDI1IDYgMzQgLTE0IDYyIC0xMyAxNyAtMjkgNDQgLTM2IDYwCi0xMSAyNiAtMTAgMjcgMTcgMjcgMTYgMCAzOCA4IDUwIDE4IDI0IDE5IDcxIDEzOCA3MSAxNzggMCAxMyA5IDU5IDIxIDEwMSAxMQo0MiAxOSA5MiAxNyAxMTIgLTMgMzIgLTcgMzcgLTQwIDQ4IC0zMiAxMCAtNDYgOSAtOTUgLTcgLTMyIC0xMSAtNzQgLTI4IC05MwotMzggLTg3IC00MyAtMjMwIC0xNzkgLTI3MCAtMjU3IC0yMiAtNDIgLTQwIC01OCAtNDAgLTM1IDAgNiAtNCAxMCAtOSAxMCAtNgowIC0xMSAtMTUgLTEzIC0zMiAtMyAtMzIgLTUgLTMzIC01MCAtMzYgbC00OCAtMyAwIC02MiBjLTEgLTc5IC0xMCAtMjM4IC0xNgotMjU1IC0yIC05IC0xOSAtMTIgLTUxIC0xMCBsLTQ4IDMgNCAxNTkgMyAxNTkgLTIzIC04IGMtMzkgLTEyIC03NCAtMTEgLTczIDMKMSA2IDIgMzIgMyA1NyBsMSA0NSAxMjQgMCAxMjUgMCAtMTIgMjMgYy0yMSAzOSAtOTYgMTI4IC0xNDUgMTcxIC01OSA1MyAtMTEzCjgxIC0yMDUgMTA2IC04NCAyMyAtNzUgMjMgLTEwOSA0eiIvPgo8L2c+Cjwvc3ZnPgo=";

  const generateEditableContractContent = () => {
    const contractContent = generateContractContent();
    
    // Replace different underscore patterns with editable input fields
    let editableContent = contractContent
      // Replace long underscores (25 characters) with text inputs
      .replace(/_________________________/g, '<span style="position: relative; display: inline-block; min-width: 200px;"><input type="text" style="border: none; background: transparent; width: 100%; font-family: inherit; font-size: inherit; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 2; outline: none;" /><span style="border-bottom: 1px solid #000; display: block; width: 100%; height: 1em; position: relative; z-index: 1;"></span></span>')
      // Replace medium underscores (5 characters) with text inputs
      .replace(/_____/g, '<span style="position: relative; display: inline-block; min-width: 80px;"><input type="text" style="border: none; background: transparent; width: 100%; font-family: inherit; font-size: inherit; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 2; outline: none;" /><span style="border-bottom: 1px solid #000; display: block; width: 100%; height: 1em; position: relative; z-index: 1;"></span></span>')
      // Replace CPF pattern with text input
      .replace(/___\.___.___-__/g, '<span style="position: relative; display: inline-block; min-width: 120px;"><input type="text" style="border: none; background: transparent; width: 100%; font-family: inherit; font-size: inherit; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 2; outline: none;" placeholder="000.000.000-00" /><span style="border-bottom: 1px solid #000; display: block; width: 100%; height: 1em; position: relative; z-index: 1;"></span></span>')
      // Replace date pattern with date input
      .replace(/___\/___\/_____/g, '<span style="position: relative; display: inline-block; min-width: 120px;"><input type="date" style="border: none; background: transparent; width: 100%; font-family: inherit; font-size: inherit; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 2; outline: none;" /><span style="border-bottom: 1px solid #000; display: block; width: 100%; height: 1em; position: relative; z-index: 1;"></span></span>')
      // Replace phone pattern with tel input
      .replace(/\(___\) _____-____/g, '<span style="position: relative; display: inline-block; min-width: 140px;"><input type="tel" style="border: none; background: transparent; width: 100%; font-family: inherit; font-size: inherit; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 2; outline: none;" placeholder="(00) 00000-0000" /><span style="border-bottom: 1px solid #000; display: block; width: 100%; height: 1em; position: relative; z-index: 1;"></span></span>')
      // Replace short underscores (4 characters) with text inputs
      .replace(/____/g, '<span style="position: relative; display: inline-block; min-width: 60px;"><input type="text" style="border: none; background: transparent; width: 100%; font-family: inherit; font-size: inherit; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 2; outline: none;" /><span style="border-bottom: 1px solid #000; display: block; width: 100%; height: 1em; position: relative; z-index: 1;"></span></span>');
    
    return editableContent;
  };

  const handleEdit = () => {
    setIsEditing(true);
    const currentContent = savedContent || generateContractContent();
    setEditableContent(currentContent);
  };



  const generateContractContent = () => {
    const contractText = `<div style="text-align: center; margin-bottom: 30px;">
      <img src="${logoBase64}" alt="TS SCHOOL Logo" style="width: 60px; height: 60px; margin: 0 auto; display: block;" />
      <h3 style="margin: 10px 0; fontSize: 16px; fontWeight: bold;">TS SCHOOL - ESCOLA DE IDIOMAS</h3>
    </div>

    <h3 style="text-align: center; margin: 20px 0;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h3>

    <p style="text-align: justify; margin-bottom: 20px;">O presente Contrato de Prestação de Serviços Educacionais tem por objetivo formalizar a relação jurídica entre a TS SCHOOL (doravante denominada CONTRATADA) e o ALUNO(A) (doravante denominado CONTRATANTE), estabelecendo os termos, condições, direitos e obrigações para a prestação de serviços de aulas particulares de inglês. Este instrumento visa proporcionar segurança e clareza na aquisição e usufruto dos pacotes de aulas, conforme detalhado no Anexo I. O CONTRATANTE terá acesso</p>

    <div style="text-align: center; font-weight: bold;">01. Identificação do CONTRATANTE:</div>
    <p>Nome: ${selectedStudent?.nome || '<span class="placeholder-text">Nome do contratante</span>'}</p>
    <p>Data de Nascimento: ${selectedStudent?.data_nascimento ? new Date(selectedStudent.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">Data de nascimento</span>'}</p>
    <p>CPF: ${selectedStudent?.cpf || '<span class="placeholder-text">CPF</span>'}</p>
    <!-- RG field removed as requested -->
    <p>Endereço: ${selectedStudent?.endereco || '<span class="placeholder-text">Endereço completo</span>'}</p>
    <p>Telefone: ${selectedStudent?.telefone || '<span class="placeholder-text">Telefone</span>'}</p>
    <p>E-mail: ${selectedStudent?.email || '<span class="placeholder-text">E-mail</span>'}</p>

    ${generateResponsavelSection()}

    <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">1. CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO</h4>
    <p style="text-align: justify; margin-bottom: 10px;">1.1. O presente Instrumento Particular tem como objeto a prestação de serviços educacionais de ensino do idioma Inglês pela TEEN SPEECH (doravante CONTRATADA) em favor do tomador de serviços (doravante CONTRATANTE ou ESTUDANTE), conforme turma e horário específicos definidos no momento da contratação e descritos no Quadro 01.</p>
    <p style="text-align: justify; margin-bottom: 15px;">1.2. Os serviços educacionais mencionados no item 1.1 incluem a participação do ESTUDANTE na turma escolhida, com garantia de vaga limitada à capacidade de 10 (dez) alunos por turma, e o usufruto de 36 (trinta e seis) aulas do idioma Inglês, a serem ministradas durante o semestre letivo vigente.</p>

    <h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">2. CLÁUSULA SEGUNDA – DA DECLARAÇÃO E ATUALIZAÇÃO CADASTRAL</h4>
    <p style="text-align: justify; margin-bottom: 10px;">2.1. O CONTRATANTE declara, para todos os fins de direito, que os dados cadastrais fornecidos e constantes no Quadro 01 deste instrumento são exatos e verdadeiros.</p>
    <p style="text-align: justify; margin-bottom: 15px;">2.2. O CONTRATANTE assume o compromisso de manter seus dados cadastrais, em especial o endereço e os meios de contato (telefone e e-mail), permanentemente atualizados junto à CONTRATADA. Qualquer alteração deverá ser comunicada imediatamente e por escrito, sob pena de serem reputadas válidas todas as comunicações e notificações encaminhadas para os dados anteriormente fornecidos. Essa atualização é essencial para que o CONTRATANTE possa ser localizado pela CONTRATADA ou por qualquer autoridade competente, quando necessário.</p>

    <h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">3. CLÁUSULA TERCEIRA – DAS INFORMAÇÕES DO CURSO E ALTERAÇÕES</h4>
    <p style="text-align: justify; margin-bottom: 10px;">3.1. A carga horária, distribuição semanal, horário das aulas e prazo de duração do treinamento estão detalhadamente especificados no Quadro 02 deste instrumento.</p>
    <p style="text-align: justify; margin-bottom: 15px;">3.2. Qualquer solicitação de alteração nos dias e horários da turma escolhida pelo CONTRATANTE deverá ser formalizada por escrito à CONTRATADA com, no mínimo, 30 (trinta) dias de antecedência ao início das aulas. A efetivação de tal alteração estará sujeita à exclusiva disponibilidade de vagas em outras turmas já formadas e à conveniência administrativa da CONTRATADA, não gerando para o CONTRATANTE o direito a ressarcimento ou compensação em caso de impossibilidade.</p>

    <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">4. CLÁUSULA QUARTA – DOS VALORES CONTRATUAIS</h4>
    <p style="text-align: justify; margin-bottom: 10px;">4.1. Todas as informações financeiras relativas à presente contratação, incluindo o valor da participação nas aulas, a taxa de matrícula, o número de parcelas, as condições para aplicação de descontos, e o valor correspondente ao material didático, encontram-se pormenorizadas no Quadro 03 integrante deste Contrato.</p>
    <p style="text-align: justify; margin-bottom: 15px;">4.2. O CONTRATANTE declara-se ciente e de acordo com os valores e condições de pagamento ali estabelecidos, os quais fazem parte indissociável deste instrumento.</p>

    <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">5. CLÁUSULA QUINTA – DO MATERIAL DIDÁTICO</h4>
    <p style="text-align: justify; margin-bottom: 10px;">5.1. A TEEN SPEECH (doravante CONTRATADA) informa que o material didático utilizado nos cursos é de sua exclusiva propriedade intelectual, desenvolvido internamente e não comercializado em outros estabelecimentos. Este material é produzido sob demanda, visando à sustentabilidade e eficiência, e passa por revisões semestrais para garantir sua qualidade e atualização.</p>
    <p style="text-align: justify; margin-bottom: 10px;">5.2. O fornecimento do material didático ao CONTRATANTE ocorrerá somente após a confirmação do pagamento integral ou da primeira parcela, conforme acordado, e mediante a expressa autorização do CONTRATANTE para a sua produção.</p>
    <p style="text-align: justify; margin-bottom: 10px;">5.3. Ao assinar o presente Contrato, o CONTRATANTE declara-se ciente da natureza exclusiva do material didático da CONTRATADA e, por este ato, AUTORIZA a CONTRATADA a produzir sua apostila e demais materiais necessários ao curso contratado.</p>
    <div class="signature-block" style="margin: 15px 0; page-break-inside: avoid;">
      <p style="text-align: center;">Autorizo o CONTRATADO a produzir minha apostila.</p>
      <div style="height: 70px; border-bottom: 1px solid #000; margin: 0 auto 5px; width: 60%;"></div>
      <div style="text-align: center; font-size: 12px;">ASSINATURA</div>
    </div>

    <h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">6. CLÁUSULA SEXTA – DAS CONDIÇÕES EM CASO DE PANDEMIA OU FORÇA MAIOR</h4>
    <p style="text-align: justify; margin-bottom: 10px;">6.1. O CONTRATANTE declara-se ciente de que, em observância a quaisquer determinações de órgãos governamentais ou em virtude de situações imprevisíveis e inevitáveis caracterizadas como força maior (tais como pandemias, epidemias, calamidades públicas, etc.), que impossibilitem ou restrinjam a realização de aulas presenciais, a TEEN SPEECH (doravante CONTRATADA) poderá, a seu exclusivo critério, realizar a transição das aulas para o formato online (à distância), total ou parcialmente.</p>
    <p style="text-align: justify; margin-bottom: 10px;">6.2. Nessas circunstâncias excepcionais, a modalidade de ensino será adaptada para garantir a continuidade do aprendizado, mantendo-se a qualidade pedagógica, a carga horária e o conteúdo programático previstos.</p>
    <p style="text-align: justify; margin-bottom: 15px;">6.3. Fica expressamente acordado que a alteração da modalidade de ensino de presencial para online, em decorrência dos motivos expostos nesta cláusula, não implicará em alteração dos valores pactuados no Quadro 03, nem ensejará direito a qualquer tipo de ressarcimento, abatimento ou rescisão contratual sem ônus para o CONTRATANTE, uma vez que tais eventos são alheios à vontade e controle da CONTRATADA.</p>

    <h4 style={{ textAlign: "center", margin: "10px 0", fontSize: 14, fontWeight: "bold" }}>7. CLÁUSULA SÉTIMA – DO PERÍODO LETIVO E FÉRIAS</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>7.1. A CONTRATADA se compromete a ministrar 36 (trinta e seis) aulas por semestre letivo, compreendendo os períodos de fevereiro a junho (primeiro semestre) e de agosto a dezembro (segundo semestre), conforme detalhamento específico constante no Quadro 02 deste instrumento. A contagem das aulas terá início a partir da data da primeira aula ministrada.</p>
<p style={{ textAlign: "justify", marginBottom: 15 }}>7.2. O período compreendido entre o término das 36 aulas de um semestre e o início das aulas do semestre subsequente é considerado recesso escolar (férias), sendo este um período sem aulas presenciais ou online. O CONTRATANTE declara-se ciente de que a existência e duração desses recessos estão previamente estabelecidas no calendário da CONTRATADA e não o eximem da obrigação de efetuar o pagamento das parcelas contratadas, que continuarão a ser devidas conforme o cronograma financeiro do Quadro 03.</p>

<h4 style={{ textAlign: "center", margin: "20px 0", fontSize: 14, fontWeight: "bold" }}>8. CLÁUSULA OITAVA – DA FREQUÊNCIA E REPOSIÇÃO DE AULAS</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>8.1. O CONTRATANTE tem plena ciência de que o objeto do presente contrato é a participação do ESTUDANTE em 36 (trinta e seis) aulas em TURMA, conforme calendário letivo previamente estabelecido pela CONTRATADA e disponível para consulta. As aulas serão ministradas para a TURMA independentemente da presença do ESTUDANTE, não havendo responsabilidade da CONTRATADA pela ausência.</p>
<p style={{ textAlign: "justify", marginBottom: 10 }}>8.2. Para fins de aproveitamento e aprovação, o CONTRATANTE compromete-se a garantir a presença do ESTUDANTE em, no mínimo, 27 (vinte e sete) aulas durante o semestre letivo. O não cumprimento desta frequência mínima resultará na reprovação automática do ESTUDANTE.</p>
<p style={{ textAlign: "justify", marginBottom: 15 }}>8.3. Em caráter excepcional e visando auxiliar na recuperação de conteúdo, a CONTRATADA disponibiliza 1 (uma) aula de reposição gratuita por mês, limitada a uma por mês. Esta aula de reposição será realizada de forma individual, terá duração de 45 (quarenta e cinco) minutos e só poderá ser agendada e usufruída dentro do semestre letivo contratado. A disponibilidade de horários para reposição será definida pela CONTRATADA.</p>

<h4 style={{ textAlign: "center", margin: "20px 0", fontSize: 14, fontWeight: "bold" }}>9. CLÁUSULA NONA – DAS MODALIDADES DE REPOSIÇÃO DE AULAS</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>9.1. Adicionalmente à aula de reposição individual gratuita mencionada na Cláusula Oitava, o ESTUDANTE poderá tentar repor aulas perdidas por meio de sua inserção temporária em outras turmas da CONTRATADA, sem custo adicional, desde que haja vagas disponíveis e que o conteúdo da aula seja compatível com o material que o ESTUDANTE precisa revisar. A elegibilidade e o agendamento dessa reposição estarão sujeitos à análise e disponibilidade da CONTRATADA.</p>
<p style={{ textAlign: "justify", marginBottom: 15 }}>9.2. Caso as opções gratuitas de reposição (aula individual mensal e/ou participação em outra turma) não sejam viáveis ou já tenham sido esgotadas pelo ESTUDANTE, o CONTRATANTE terá a faculdade de contratar aulas particulares de reposição. Cada aula particular terá o custo de R$ 40,00 (quarenta reais) e duração de 45 (quarenta e cinco) minutos, devendo ser agendada conforme a disponibilidade de horários da CONTRATADA.</p>

<h4 style={{ textAlign: "center", margin: "10px 0", fontSize: 14, fontWeight: "bold" }}>10. CLÁUSULA DÉCIMA – DO COMPROMISSO DO ESTUDANTE COM O APRENDIZADO</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>10.1. O CONTRATANTE e o ESTUDANTE reconhecem que o sucesso no aprendizado do idioma Inglês depende significativamente do esforço ativo e da dedicação contínua do ESTUDANTE, bem como da estrita observância às orientações pedagógicas fornecidas pela TEEN SPEECH (doravante CONTRATADA).</p>
<p style={{ textAlign: "justify", marginBottom: 10 }}>10.2. Ciente da natureza do aprendizado de idiomas, que exige contato e prática regulares, o ESTUDANTE compromete-se a seguir as diretrizes de estudo dos professores da CONTRATADA, incluindo a prática e revisão do conteúdo de forma espaçada e consistente, evitando acumular o estudo para um único dia. Recomenda-se e espera-se uma dedicação de ao menos 20 (vinte) minutos diários aos estudos e o esforço para assimilar o conteúdo da aula antes da aula seguinte.</p>
<p style={{ textAlign: "justify", marginBottom: 15 }}>10.3. O CONTRATANTE declara-se ciente e concorda que a CONTRATADA envidará todos os esforços didáticos e pedagógicos para o ensino. No entanto, o aproveitamento e o resultado final do curso são de responsabilidade intrínseca do ESTUDANTE, complementados pelo acompanhamento do CONTRATANTE. A CONTRATADA não poderá ser responsabilizada pelo não aprendizado ou aproveitamento insatisfatório do curso que decorra da falta de dedicação, da ausência de frequência mínima (conforme Cláusula Oitava) ou do não seguimento das orientações de estudo por parte do ESTUDANTE.</p>

<h4 style={{ textAlign: "center", margin: "10px 0", fontSize: 14, fontWeight: "bold" }}>11. CLÁUSULA DÉCIMA PRIMEIRA – DOS CRITÉRIOS DE APROVAÇÃO E REPROVAÇÃO</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>11.1. Para que o ESTUDANTE seja considerado aprovado no módulo ou semestre letivo, é indispensável que cumpra, cumulativamente, os seguintes critérios:</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>a) Obtenha nota final mínima de 7,0 (sete) pontos nas avaliações pedagógicas da CONTRATADA; e</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 15 }}>b) Registre frequência mínima de 27 (vinte e sete) aulas ao longo do semestre vigente, conforme previsto na Cláusula Oitava deste instrumento.</p>
<p style={{ textAlign: "justify", marginBottom: 15 }}>11.2. O não atendimento a qualquer um dos critérios estabelecidos no item 11.1 implicará na reprovação automática do ESTUDANTE no módulo ou semestre.</p>

<h4 style={{ textAlign: "center", margin: "20px 0", fontSize: 14, fontWeight: "bold" }}>12. CLÁUSULA DÉCIMA SEGUNDA – DA INADIMPLÊNCIA</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>12.1. Em caso de não pagamento de qualquer valor devido pelo CONTRATANTE conforme o presente contrato e o Quadro 03, incidirão sobre o montante em atraso, a partir da data de seu vencimento até a efetiva quitação:</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>a) Multa de 2% (dois por cento) sobre o valor principal devido;</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>b) Juros de mora de 1% (um por cento) ao mês; e</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 15 }}>c) Atualização monetária com base no índice IGP-M/FGV (ou outro índice aplicável).</p>
<p style={{ textAlign: "justify", marginBottom: 15 }}>12.2. O atraso no pagamento poderá, após notificação, implicar na suspensão dos serviços educacionais ao ESTUDANTE e, persistindo a inadimplência, na rescisão do presente contrato, nos termos da Cláusula Décima Terceira.</p>

<h4 style={{ textAlign: "center", margin: "20px 0", fontSize: 14, fontWeight: "bold" }}>13. CLÁUSULA DÉCIMA QUARTA – DO DIREITO DE ARREPENDIMENTO E DA RESCISÃO ANTECIPADA</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>13.1. Do Direito de Arrependimento (Contratação Fora do Estabelecimento Comercial):</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>a) Em observância ao disposto no art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/90), o CONTRATANTE terá o prazo improrrogável de 7 (sete) dias corridos, contados a partir da data de assinatura do presente contrato ou da efetivação da primeira aquisição do pacote de aulas, para exercer seu direito de arrependimento.</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>b) Este direito é aplicável exclusivamente às contratações realizadas fora do estabelecimento comercial físico da CONTRATADA (por exemplo, via internet, telefone, e-mail ou domicílio).</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 15 }}>c) Caso o direito de arrependimento seja exercido dentro do prazo legal, a CONTRATADA restituirá ao CONTRATANTE a integralidade dos valores eventualmente pagos (tais como Matrícula, Material Didático e/ou parcelas do Pacote de Aulas), desde que não tenha havido a utilização de qualquer aula ou serviço por parte do ESTUDANTE e o material didático seja devolvido em perfeito estado, sem indícios de uso.</p>

<p style={{ textAlign: "justify", marginBottom: 10 }}>13.2. Da Rescisão Antecipada por Iniciativa do CONTRATANTE (Após 7 dias):</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>a) Decorrido o prazo de 7 (sete) dias para o direito de arrependimento ou nos casos de contratação diretamente no estabelecimento comercial, a manifestação de vontade do CONTRATANTE em rescindir o presente contrato e/ou cancelar a utilização do pacote de aulas deverá ser formalizada por comunicação escrita à CONTRATADA.</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 15 }}>b) Nesta hipótese de rescisão antecipada, serão devidos pelo CONTRATANTE os seguintes valores: i. O valor correspondente às aulas já usufruídas ou disponibilizadas ao ESTUDANTE até a data da solicitação formal de cancelamento, calculadas pro rata die ou por aula, conforme valor unitário previsto no Quadro 02 ou proporcional ao valor total do pacote. ii. Multa Rescisória: Sobre o saldo remanescente do contrato (correspondente às parcelas vincendas e aulas não utilizadas), será aplicada uma multa compensatória equivalente a 10% (dez por cento). O saldo remanescente será calculado pela diferença entre o valor total do curso (conforme Quadro 03) e o valor das aulas já utilizadas/disponibilizadas.</p>

<p style={{ textAlign: "justify", marginBottom: 10 }}>13.3. Da Não Restituição de Matrícula e Material Didático:</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>a) A Taxa de Matrícula e o valor referente ao Material Didático, uma vez pagos e entregues, não serão passíveis de restituição, salvo na estrita hipótese de exercício do direito de arrependimento dentro do prazo legal de 7 (sete) dias, conforme detalhado no item 14.1 desta Cláusula.</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 15 }}>b) A natureza do material didático, conforme Cláusula Quinta, e o serviço de matrícula (que envolve custos administrativos de processamento) justificam sua não restituição após o prazo legal de arrependimento.</p>

<h4 style={{ textAlign: "center", margin: "20px 0", fontSize: 14, fontWeight: "bold" }}>14. CLÁUSULA DÉCIMA QUINTA – DA PROTEÇÃO DE DADOS PESSOAIS</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>14.1. A TEEN SPEECH (doravante CONTRATADA) compromete-se a realizar o tratamento dos dados pessoais e dados pessoais sensíveis do CONTRATANTE e do ESTUDANTE em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis do ordenamento jurídico brasileiro.</p>
<p style={{ textAlign: "justify", marginBottom: 15 }}>14.2. O tratamento de dados ocorrerá exclusivamente para as finalidades específicas para as quais foram coletados (como a prestação de serviços educacionais, gestão de matrículas, comunicação e cumprimento de obrigações legais), utilizando-se apenas os dados estritamente necessários para tais fins.</p>

<h4 style={{ textAlign: "center", margin: "20px 0", fontSize: 14, fontWeight: "bold" }}>15. CLÁUSULA DÉCIMA SEXTA – DAS DESPESAS COM A COBRANÇA E EXECUÇÃO</h4>
<p style={{ textAlign: "justify", marginBottom: 10 }}>Em caso de inadimplemento contratual que enseje a necessidade de cobrança (judicial ou extrajudicial) ou a execução do presente contrato, a parte que deu causa ao inadimplemento será responsável por arcar com todas as despesas decorrentes, incluindo, mas não se limitando a:</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>a) Custas processuais e taxas judiciárias;</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>b) Despesas com notificações extrajudiciais e protestos;</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 5 }}>c) Honorários advocatícios, arbitrados em 20% (vinte por cento) sobre o valor total do débito (principal, juros, multa e atualização monetária), caso seja necessária a atuação de advogado para a cobrança ou defesa dos direitos da parte contrária; e</p>
<p style={{ textAlign: "justify", marginLeft: 20, marginBottom: 15 }}>d) Outras despesas comprovadamente realizadas para a recuperação do crédito ou a defesa do cumprimento do contrato.</p>

<p style={{ textAlign: "justify", marginBottom: 15 }}>16. As partes elegem o foro da COMARCA de Guarulhos, como único competente para decidir qualquer questão oriunda do presente contrato, em detrimento de qualquer outro por mais privilegiado que possa ser.</p>

<p style={{ textAlign: "justify", marginBottom: 15 }}>Estando as duas partes de acordo, declaram ciência através da assinatura deste, em duas vias de igual teor.</p>

    <h4>03. DO OBJETO:</h4>
    <p>3.1. A CONTRATADA compromete-se a prestar serviços educacionais de ensino de idiomas ao CONTRATANTE, conforme as condições estabelecidas neste contrato.</p>

    <h4>04. DO VALOR E FORMA DE PAGAMENTO:</h4>
    <p>4.1. O valor total do curso é de R$ <span class="placeholder-text">valor</span>, dividido em ${selectedStudent?.financeiro_alunos?.[0]?.planos?.numero_aulas || '<span class="placeholder-text">número de aulas</span>'} aulas.</p>
    <p>4.2. O pagamento será efetuado conforme a periodicidade: semanal.</p>



    <div style="margin-top: 50px; page-break-inside: avoid;">
      <div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 14px;">ASSINATURAS</div>
      
      <div style="display: flex; justify-content: space-between; gap: 60px; margin-bottom: 40px;">
        <div style="flex: 1; text-align: center;">
          <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;"></div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">${selectedStudent?.nome || 'CONTRATANTE'}</div>
          <div style="font-size: 11px; color: #666;">CONTRATANTE</div>
        </div>
        
        <div style="flex: 1; text-align: center;">
          <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
            <img src="${teenSpeechSignature}" alt="Teen Speech Signature" style="max-height: 70px; max-width: 180px; object-fit: contain;" />
          </div>
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">TEEN SPEECH</div>
          <div style="font-size: 11px; color: #666;">CONTRATADA</div>
        </div>
      </div>

      <div style="margin-top: 50px;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 14px;">TESTEMUNHAS</div>
        <div style="display: flex; justify-content: space-between; gap: 60px;">
          <div style="flex: 1; text-align: center;">
            <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
              <img src="${testemunha1Signature}" alt="Testemunha 1" style="max-height: 70px; max-width: 180px; object-fit: contain;" />
            </div>
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">Testemunha 1</div>
            <div style="font-size: 11px; color: #666;">CPF: 567.641.218-69</div>
          </div>
          
          <div style="flex: 1; text-align: center;">
            <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
              <img src="${testemunha2Signature}" alt="Testemunha 2" style="max-height: 70px; max-width: 180px; object-fit: contain;" />
            </div>
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">Testemunha 2</div>
            <div style="font-size: 11px; color: #666;">RG: 34.537.017-X</div>
          </div>
        </div>
      </div>
    </div>

    </div>`;
    
    // Seções 'horário' e 'VISTO' removidas conforme solicitado
    
    return contractText;
  };

  const handleSave = () => {
    setSavedContent(editableContent);
    setIsEditing(false);
    toast({
      title: "Sucesso",
      description: "Contrato editado com sucesso!",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableContent('');
  };

  const handlePrint = async () => {
    if (!selectedStudent) {
      toast({
        title: "Atenção",
        description: "Selecione um aluno para gerar o contrato.",
        variant: "destructive",
      });
      return;
    }

    const contentToPrint = isEditing ? editableContent : (savedContent || generateContractContent());
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato - ${selectedStudent.nome}</title>
          <style>
            body { font-family: Garamond, serif; margin: 0; }
            img { max-width: 100%; height: auto; }
            @page { size: A4; margin: 12mm 8mm; }
            @media print {
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              body { margin: 0; }
              h1, h2, h3 { page-break-after: avoid !important; break-after: avoid !important; }
              table, tr, td, div, section { page-break-inside: avoid !important; break-inside: avoid !important; }
              img[alt*="Assinatura"], img[alt*="Signature"], img[alt*="Testemunha"], .signature, .sign-area, figure { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
            .container-pdf { width: 100%; background: white; padding: 0; box-sizing: border-box; }
          </style>
        </head>
        <body>
          <div id="contrato" class="container-pdf contract-preview">
            ${contentToPrint}
          </div>
          <script>
            (function() {
              const waitImages = () => {
                const imgs = Array.from(document.images);
                if (imgs.length === 0) return Promise.resolve();
                return Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => {
                  img.addEventListener('load', res, { once: true });
                  img.addEventListener('error', res, { once: true });
                })));
              };
              window.addEventListener('afterprint', () => { try { window.close(); } catch(e){} });
              waitImages().then(() => {
                setTimeout(() => { try { window.print(); } catch(e){} }, 150);
              });
            })();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    try { printWindow.focus(); } catch {}
    // A impressão será disparada pela janela após carregar imagens

    toast({
      title: "Impressão pronta",
      description: "A janela de impressão foi aberta.",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 print:hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CONTRATO DE PRESTAÇÃO - TS SCHOOL
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={() => navigate('/contract-generator')}
                className="flex items-center gap-2"
              >
                ← Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p><strong>Aluno:</strong> {selectedStudent.nome}</p>
                  <p><strong>CPF:</strong> {selectedStudent.cpf || 'Não informado'}</p>
                </div>
                <Button onClick={() => {
                   setSelectedStudent(null);
                   localStorage.removeItem('selectedStudent');
                 }} variant="outline">
                   Trocar Aluno
                 </Button>
              </div>
              
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <Button onClick={handlePrint} className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Button>
                    <Button 
                      onClick={handleEdit}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </>
                )}
                {isEditing && (
                  <>
                    <Button 
                      onClick={handleSave}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Salvar
                    </Button>
                    <Button 
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Editando Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={editableRef}
              id="contrato"
              className="container-pdf min-h-[600px] text-sm p-4 border rounded-lg bg-white editable-contract"
              style={{
                fontFamily: 'Garamond, serif',
                fontSize: '14pt',
                lineHeight: '1.6',
                scrollBehavior: 'auto',
                overflowAnchor: 'none'
              }}
              contentEditable={true}
              dangerouslySetInnerHTML={{ __html: editableContent }}
              onKeyDown={(e) => {
                // Encontrar o placeholder mais próximo do cursor
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  let node = range.startContainer;
                  
                  // Procurar o elemento placeholder mais próximo
                  while (node && node !== e.currentTarget) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                      const element = node as Element;
                      if (element.classList.contains('placeholder-text')) {
                        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                          element.classList.remove('placeholder-text');
                          element.style.color = '#333';
                          element.style.fontStyle = 'normal';
                          if (e.key !== 'Backspace' && e.key !== 'Delete') {
                            element.textContent = '';
                          }
                        }
                        break;
                      }
                    } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
                      const parentElement = node.parentElement;
                      if (parentElement.classList.contains('placeholder-text')) {
                        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                          parentElement.classList.remove('placeholder-text');
                          parentElement.style.color = '#333';
                          parentElement.style.fontStyle = 'normal';
                          if (e.key !== 'Backspace' && e.key !== 'Delete') {
                            parentElement.textContent = '';
                          }
                        }
                        break;
                      }
                    }
                    node = node.parentNode;
                  }
                }
              }}
              onBlur={(e) => {
                // Não precisamos fazer nada no onBlur agora
                // Os placeholders são removidos permanentemente quando editados
              }}
              onInput={(e) => {
                // Formatação automática de números para datas removida
                
                // Salvar posição do cursor antes da edição
                const currentSelection = window.getSelection();
                const currentRange = currentSelection?.getRangeAt(0);
                const startOffset = currentRange?.startOffset;
                const startContainer = currentRange?.startContainer;
                
                // Atualizar conteúdo
                setEditableContent(e.currentTarget.innerHTML);
                
                // Restaurar cursor e manter scroll travado na posição do cursor
                requestAnimationFrame(() => {
                  if (currentSelection && startContainer && typeof startOffset === 'number' && editableRef.current) {
                    try {
                      const newRange = document.createRange();
                      // Encontrar o nó correspondente no DOM atualizado
                      const walker = document.createTreeWalker(
                        editableRef.current,
                        NodeFilter.SHOW_TEXT,
                        null
                      );
                      
                      let currentNode;
                      let found = false;
                      while (currentNode = walker.nextNode()) {
                        if (currentNode.textContent === startContainer.textContent) {
                          newRange.setStart(currentNode, Math.min(startOffset, currentNode.textContent?.length || 0));
                          newRange.collapse(true);
                          currentSelection.removeAllRanges();
                          currentSelection.addRange(newRange);
                          found = true;
                          break;
                        }
                      }
                      
                      // Se não encontrou o nó exato, posicionar no final do conteúdo
                      if (!found) {
                        newRange.selectNodeContents(editableRef.current);
                        newRange.collapse(false);
                        currentSelection.removeAllRanges();
                        currentSelection.addRange(newRange);
                      }
                      
                      // Scroll fixo - não fazer nenhum scroll automático para evitar jumping
                    } catch (error) {
                      console.log('Erro ao restaurar cursor:', error);
                    }
                  }
                });
              }}
              onFocus={(e) => {
                // Manter posição de scroll fixa - sem scroll automático
                e.preventDefault();
              }}
              suppressContentEditableWarning={true}
            />
          </CardContent>
        </Card>
      ) : (
        savedContent ? (
          <div 
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              lineHeight: '1.4',
              color: '#000',
              maxWidth: '210mm',
              margin: '0 auto',
              padding: '20mm',
              backgroundColor: '#fff'
            }}
            dangerouslySetInnerHTML={{ __html: savedContent }}
          />
        ) : (
          <div style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#000',
            maxWidth: '210mm',
            margin: '0 auto',
            padding: '20mm',
            backgroundColor: '#fff'
          }} dangerouslySetInnerHTML={{ __html: generateContractContent() }}>
          </div>
        )
      )}
    </div>
  );
};

export default ContractGenerator2;