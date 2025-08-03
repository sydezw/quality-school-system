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
      <img src="${logoBase64}" alt="Teen Speech Logo" style="width: 60px; height: 60px; margin: 0 auto; display: block;" />
      <h3 style="margin: 10px 0; fontSize: 16px; fontWeight: bold;">TEEN SPEECH - ESCOLA DE IDIOMAS</h3>
    </div>

    <h3 style="text-align: center; margin: 20px 0;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h3>

    <p style="text-align: justify; margin-bottom: 20px;">O contrato de prestação de serviços educacionais que entre si celebram, de um lado, o(a) aluno(a) abaixo qualificado(a), doravante denominado(a) CONTRATANTE, e, de outro lado, a TEEN SPEECH, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 30.857.093/0001-36, com sede na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, Guarulhos/SP, doravante denominada CONTRATADA, têm entre si justo e contratado o seguinte:</p>

    <div style="text-align: center; font-weight: bold;">01. Identificação do CONTRATANTE:</div>
    <p>Nome: ${selectedStudent?.nome || '<span class="placeholder-text">Nome do contratante</span>'}</p>
    <p>Data de Nascimento: ${selectedStudent?.data_nascimento ? new Date(selectedStudent.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">Data de nascimento</span>'}</p>
    <p>CPF: ${selectedStudent?.cpf || '<span class="placeholder-text">CPF</span>'}</p>
    <p>RG: <span class="placeholder-text">RG</span></p>
    <p>Endereço: ${selectedStudent?.endereco || '<span class="placeholder-text">Endereço completo</span>'}</p>
    <p>Telefone: ${selectedStudent?.telefone || '<span class="placeholder-text">Telefone</span>'}</p>
    <p>E-mail: ${selectedStudent?.email || '<span class="placeholder-text">E-mail</span>'}</p>

    <h4>02. Identificação do RESPONSÁVEL FINANCEIRO (se menor de idade):</h4>
    <p>Nome: ${selectedStudent?.responsaveis?.nome || '<span class="placeholder-text">Nome do responsável</span>'}</p>
    <p>CPF: ${selectedStudent?.responsaveis?.cpf || '<span class="placeholder-text">CPF do responsável</span>'}</p>
    <p>Telefone: ${selectedStudent?.responsaveis?.telefone || '<span class="placeholder-text">Telefone do responsável</span>'}</p>
    <p>E-mail: ${selectedStudent?.responsaveis?.email || '<span class="placeholder-text">E-mail do responsável</span>'}</p>

    <h4>03. DO OBJETO:</h4>
    <p>3.1. A CONTRATADA compromete-se a prestar serviços educacionais de ensino de idiomas ao CONTRATANTE, conforme as condições estabelecidas neste contrato.</p>

    <h4>04. DO VALOR E FORMA DE PAGAMENTO:</h4>
    <p>4.1. O valor total do curso é de R$ ${selectedStudent?.financeiro_alunos?.[0]?.planos?.valor_total || '<span class="placeholder-text">valor total</span>'}, dividido em ${selectedStudent?.financeiro_alunos?.[0]?.planos?.numero_aulas || '<span class="placeholder-text">número de aulas</span>'} aulas.</p>
    <p>4.2. O pagamento será efetuado conforme a periodicidade: ${selectedStudent?.financeiro_alunos?.[0]?.planos?.frequencia || '<span class="placeholder-text">frequência</span>'}.</p>

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

    <div style="margin-top: 30px; display: flex; justify-content: space-between;">
      <p><span class="placeholder-text">Data</span> horário: <span class="placeholder-text">horário</span></p>
      <p>VISTO: <span class="placeholder-text">visto</span></p>
    </div>`;
    
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

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const contentToPrint = isEditing ? editableContent : (savedContent || generateContractContent());
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentToPrint;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.padding = '20px';
      
      document.body.appendChild(tempDiv);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight
      });
      
      document.body.removeChild(tempDiv);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Contrato2_${selectedStudent.nome.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: `O arquivo ${fileName} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 print:hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CONTRATO DE PRESTAÇÃO - Teen Speech
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
              className="min-h-[600px] text-sm p-4 border rounded-lg bg-white editable-contract"
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
                // Verificar se estamos editando um campo de data
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  let node = range.startContainer;
                  
                  // Procurar se estamos em um elemento de data
                  while (node && node !== e.currentTarget) {
                    if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
                      const parentElement = node.parentElement;
                      const content = parentElement.textContent || '';
                      
                      // Verificar se o conteúdo parece ser uma data
                      const isDateContent = content.includes('dd/mm/yyyy') || 
                                           /^\d{1,2}(\/\d{0,2})?(\/\d{0,4})?$/.test(content) ||
                                           /^\d{4,8}$/.test(content);
                      
                      if (isDateContent) {
                        // Extrair apenas números
                        let numbers = content.replace(/\D/g, '');
                        
                        // Limitar a 8 dígitos (ddmmaaaa)
                        if (numbers.length > 8) {
                          numbers = numbers.substring(0, 8);
                        }
                        
                        let formattedValue = '';
                        
                        if (numbers.length > 0) {
                          // Aplicar formatação dd/mm/yyyy
                          if (numbers.length <= 2) {
                            formattedValue = numbers;
                          } else if (numbers.length <= 4) {
                            formattedValue = numbers.substring(0, 2) + '/' + numbers.substring(2);
                          } else {
                            formattedValue = numbers.substring(0, 2) + '/' + 
                                           numbers.substring(2, 4) + '/' + 
                                           numbers.substring(4);
                          }
                        }
                        
                        if (formattedValue !== content) {
                          parentElement.textContent = formattedValue;
                          
                          // Reposicionar cursor no final
                          const newRange = document.createRange();
                          const textNode = parentElement.firstChild;
                          if (textNode) {
                            const cursorPos = formattedValue.length;
                            newRange.setStart(textNode, cursorPos);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                          }
                          return;
                        }
                      }
                    }
                    node = node.parentNode;
                  }
                }
                
                // Salvar posição do scroll antes da edição
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                // Salvar posição do cursor
                const currentSelection = window.getSelection();
                const currentRange = currentSelection?.getRangeAt(0);
                const startOffset = currentRange?.startOffset;
                const startContainer = currentRange?.startContainer;
                
                // Atualizar conteúdo
                setEditableContent(e.currentTarget.innerHTML);
                
                // Restaurar posição do cursor e scroll após o próximo render
                setTimeout(() => {
                  // Restaurar scroll para a posição original
                  window.scrollTo(scrollLeft, scrollTop);
                  
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
                      
                      // Garantir que o cursor permaneça visível sem scroll desnecessário
                      const rect = newRange.getBoundingClientRect();
                      const viewportHeight = window.innerHeight;
                      const isVisible = rect.top >= 0 && rect.bottom <= viewportHeight;
                      
                      if (!isVisible) {
                        // Apenas fazer scroll se o cursor estiver fora da área visível
                        newRange.startContainer.parentElement?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                          inline: 'nearest'
                        });
                      }
                    } catch (error) {
                      console.log('Erro ao restaurar cursor:', error);
                    }
                  }
                }, 0);
              }}
              onFocus={(e) => {
                // Salvar posição atual do scroll para evitar movimento automático
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                // Restaurar posição do scroll após o foco
                setTimeout(() => {
                  window.scrollTo(scrollLeft, scrollTop);
                }, 0);
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