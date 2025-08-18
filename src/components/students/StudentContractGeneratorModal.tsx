import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Download, Edit, Save, X, User, CreditCard, FileCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { numberToWords } from '@/utils/formatters';
import teenSpeechSignature from '@/assets/signatures/teen-speech-assinatura.png';
import testemunha1Signature from '@/assets/signatures/testemunha1.png';
import testemunha2Signature from '@/assets/signatures/testemunha2.png';

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  telefone: string | null;
  email: string | null;
  idioma: string | null;
  responsaveis?: {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    endereco: string;
    numero_endereco: string;
  } | null;
  financeiro_alunos?: Array<{
    valor_plano: number;
    numero_parcelas_plano: number;
    planos: {
      nome: string;
      valor_total: number;
      numero_aulas: number;
      frequencia: string;
      frequencia_aulas: string;
      descricao: string;
    };
  }>;
  turma_regular?: {
    nome: string;
    nivel: string;
    horario: string;
    dias_da_semana: string;
  } | null;
  turma_particular?: {
    nome: string;
    nivel: string;
    horario: string;
    dias_da_semana: string;
  } | null;
}

interface StudentContractGeneratorModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const StudentContractGeneratorModal = ({ student, isOpen, onClose }: StudentContractGeneratorModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [selectedContract, setSelectedContract] = useState('contrato1');
  const [savedContent, setSavedContent] = useState('');
  const [planData, setPlanData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (student && isOpen) {
      // Reset state when modal opens
      setIsEditing(false);
      setEditableContent('');
      setSelectedContract('contrato1');
      setSavedContent('');
      
      // Load complete student data with financial and class information
      loadCompleteStudentData();
    }
  }, [student, isOpen]);

  const loadCompleteStudentData = async () => {
    if (!student?.id) return;

    try {
      // Load financial data - removing limit to get all plans
      const { data: financialData, error: financialError } = await supabase
        .from('financeiro_alunos')
        .select(`
          *,
          planos (
            nome,
            valor_total,
            numero_aulas,
            frequencia_aulas,
            descricao
          )
        `)
        .eq('aluno_id', student.id);

      // Load parcelas separately with correct table name
      const { data: parcelasData, error: parcelasError } = await supabase
        .from('parcelas_alunos')
        .select('*')
        .in('registro_financeiro_id', financialData?.map(f => f.id) || []);

      // Load contract data to get start and end dates
      const { data: contractData, error: contractError } = await supabase
        .from('contratos')
        .select('*')
        .eq('aluno_id', student.id)
        .in('status_contrato', ['Ativo', 'Agendado'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (financialError) {
        console.error('Erro ao carregar dados financeiros:', financialError);
      }

      if (contractError) {
        console.error('Erro ao carregar dados do contrato:', contractError);
      }

      // Load complete student data with class information
      const { data: completeStudentData, error: studentError } = await supabase
        .from('alunos')
        .select(`
          *,
          turma_regular:turmas!turma_id(nome, nivel, horario, dias_da_semana),
          turma_particular:turmas!turma_particular_id(nome, nivel, horario, dias_da_semana),
          responsaveis(nome, cpf, telefone, email, endereco, numero_endereco)
        `)
        .eq('id', student.id)
        .single();

      if (studentError) {
        console.error('Erro ao carregar dados completos do aluno:', studentError);
      }

      // Update student data with complete information
      if (completeStudentData) {
        // Update the student object with complete data
        Object.assign(student, completeStudentData);
      }

      // Set financial data - update student object with all financial plans
      if (financialData && financialData.length > 0) {
        // Associate parcelas with financial data
        const financialWithParcelas = financialData.map(financial => {
          const parcelas = parcelasData?.filter(p => p.registro_financeiro_id === financial.id) || [];
          return {
            ...financial,
            parcelas_alunos: parcelas
          };
        });
        
        // Update the student object with complete financial data
        student.financeiro_alunos = financialWithParcelas;
        
        // Set plan data from first plan for backward compatibility
        const firstFinancial = financialWithParcelas[0];
        setPlanData(firstFinancial.planos);
        setFinancialData(firstFinancial);
      } else {
        student.financeiro_alunos = [];
        setPlanData(null);
        setFinancialData(null);
      }

      // Set contract data
      if (contractData && contractData.length > 0) {
        setContractData(contractData[0]);
      } else {
        setContractData(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados completos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados completos do aluno.",
        variant: "destructive",
      });
    }
  };

  const getContractTitle = () => {
    return selectedContract === 'contrato2' 
      ? 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS – CONTRATO 2'
      : `CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS – ${planData?.nome || 'PLANO PADRÃO'}`;
  };

  // Função para calcular a idade do aluno
  const calculateAge = (birthDate: string | null): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Função para determinar se deve exibir a seção do responsável
  const shouldShowResponsavelSection = (): boolean => {
    const age = calculateAge(student?.data_nascimento || null);
    const hasResponsavel = student?.responsaveis && student.responsaveis.nome;
    
    // Se menor de 18 anos, sempre exibir
    if (age < 18) {
      return true;
    }
    
    // Se 18+ mas tem responsável cadastrado, manter a seção
    if (age >= 18 && hasResponsavel) {
      return true;
    }
    
    // Se 18+ e não tem responsável, ocultar
    return false;
  };

  // Função para gerar o conteúdo da seção do responsável
  const generateResponsavelSection = (): string => {
    const age = calculateAge(student?.data_nascimento || null);
    const hasResponsavel = student?.responsaveis && student.responsaveis.nome;
    
    if (!shouldShowResponsavelSection()) {
      return '';
    }
    
    // Se menor de 18 e não tem responsável, mostrar aviso
    if (age < 18 && !hasResponsavel) {
      return `
<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px; background-color: #fff3cd;">
  <div style="text-align: center; font-weight: bold; color: #856404; margin-bottom: 10px;">ATENÇÃO: DADOS DO RESPONSÁVEL OBRIGATÓRIOS</div>
  <p style="color: #856404; text-align: center; margin: 5px 0;">Este aluno é menor de idade e necessita de um responsável cadastrado.</p>
  <p style="color: #856404; text-align: center; margin: 5px 0;">Por favor, cadastre os dados do responsável antes de gerar o contrato.</p>
</div>`;
    }
    
    // Seção normal do responsável com dados
    return `
<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold;">RESPONSÁVEL ${age < 18 ? '(obrigatório para menores de idade)' : '(cadastrado)'}:</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">${student?.responsaveis?.nome || '<span class="placeholder-text">Nome do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">CPF:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.responsaveis?.cpf || '<span class="placeholder-text">CPF do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Telefone:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.responsaveis?.telefone || '<span class="placeholder-text">Telefone do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Email:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.responsaveis?.email || '<span class="placeholder-text">E-mail do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Endereço:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.responsaveis?.endereco ? `${student.responsaveis.endereco}, nº ${student.responsaveis.numero_endereco || '<span class="placeholder-text">número</span>'}` : '<span class="placeholder-text">Endereço do responsável</span>'}</td>
    </tr>
  </table>
</div>`;
  };

  const generateContractContent = () => {
    if (!student) return '';
    
    // Nova logo como base64
    const logoBase64 = "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAyMDAxMDkwNC8vRU4iCiAiaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogd2lkdGg9IjE5My4wMDAwMDBwdCIgaGVpZ2h0PSIxMzEuMDAwMDAwcHQiIHZpZXdCb3g9IjAgMCAxOTMuMDAwMDAwIDEzMS4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KCjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDEzMS4wMDAwMDApIHNjYWxlKDAuMTAwMDAwLC0wLjEwMDAwMCkiCmZpbGw9IiMwMDAwMDAiIHN0cm9rZT0ibm9uZSI+CjxwYXRoIGQ9Ik00NzggMTEyNCBjLTQwIC0yMSAtNDQgLTUzIC0xNSAtMTI2IDI5IC03MyA0MiAtMTIyIDUyIC0xOTMgNCAtMjcKMTUgLTY5IDI1IC05MiAxNyAtMzkgMjIgLTQzIDU0IC00MyAyNSAwIDM2IC00IDM2IC0xNSAwIC04IC02IC0xNSAtMTQgLTE1Ci0yMCAwIC02MSAtODcgLTQ4IC0xMDMgMTcgLTIyIDIwIC01NiA2IC02OCAtMTIgLTEwIC05IC0xNSAxNiAtMzEgMjUgLTE1IDMxCi0yNCAyOCAtNDggLTIgLTE5IDUgLTM3IDE5IC01MiAxMSAtMTMgMjQgLTMyIDI3IC00NCA3IC0yMSAtMjQgLTEyMyAtNDkgLTE2MAotMTIgLTE5IC0xMiAtMjQgMCAtMzQgMTYgLTE0IDEzIC0xOSA0MSA2OCAyMiA2OCA0MCA4OSA2MyA2OSAxNCAtMTMgNDYgLTIzCjkxIC0zMCA4IC0xIDE1IDUgMTYgMTMgMyAzNiA1IDQwIDIzIDQwIDE1IDAgMjUgMjEgNTAgMTAzIDE4IDU2IDQyIDEzNCA1NQoxNzIgbDIzIDcwIDcgLTU1IGM0IC0zMCAxMiAtNzEgMTkgLTkwIGwxMSAtMzUgNyAzMCBjNCAxNyA3IDUwIDggNzUgMiA2NyAxNwo4MyAyOCAzMCA3IC0zNiAxNCAtNDYgNDYgLTYzIDM1IC0xOCA0MCAtMTggNTQgLTQgMjMgMjIgMTIgNDAgLTUxIDgyIC03OSA1Mgo5MCA5MyAtNDkgMTgyIDI1IDU0IDEyMiA4MSAxODggNTEgMjggLTEzIDUwIC03NSA0MSAtMTE0IC02IC0yMSAtMTIgLTI0IC01MAotMjQgLTQ1IDAgLTU2IDEwIC01NiA1MSAwIDEyIC01IDE2IC0xNSAxMyAtMjIgLTkgLTE4IC00OCA4IC03MiAxMyAtMTIgMjgKLTIyIDMzIC0yMiAyNSAwIDY2IC02MCA3MSAtMTA0IDEwIC04OCAtNjAgLTE0OCAtMTU1IC0xMzIgbC0zNCA1IDcgLTQ3IGMxMAotNjggMzAgLTEwMiA2MCAtMTAyIDIyIDAgMjUgLTQgMjUgLTM1IDAgLTM0IDIwIC00OSAzNSAtMjUgMyA1IDE3IDEwIDMwIDEwCjEzIDAgMjcgNSAzMCAxMCAxMCAxNiAzMyAxMiA1NSAtMTAgMTQgLTE0IDIwIC0zMyAyMCAtNjQgMCAtMjYgNiAtNDggMTUgLTU2CjI2IC0yMSAyOSAxNCA2IDc1IC0yNyA3MyAtMjggMTM5IC0xIDE2MiAxMyAxMiAyMCAzMCAyMCA1NSAwIDI2IDYgNDEgMjEgNTIKMTUgMTAgMjAgMjEgMTYgMzYgLTMgMTIgLTEgMzUgNSA1MSA5IDI1IDYgMzQgLTE0IDYyIC0xMyAxNyAtMjkgNDQgLTM2IDYwCi0xMSAyNiAtMTAgMjcgMTcgMjcgMTYgMCAzOCA4IDUwIDE4IDI0IDE5IDcxIDEzOCA3MSAxNzggMCAxMyA5IDU5IDIxIDEwMSAxMQo0MiAxOSA5MiAxNyAxMTIgLTMgMzIgLTcgMzcgLTQwIDQ4IC0zMiAxMCAtNDYgOSAtOTUgLTcgLTMyIC0xMSAtNzQgLTI4IC05MwotMzggLTg3IC00MyAtMjMwIC0xNzkgLTI3MCAtMjU3IC0yMiAtNDIgLTQwIC01OCAtNDAgLTM1IDAgNiAtNCAxMCAtOSAxMCAtNgowIC0xMSAtMTUgLTEzIC0zMiAtMyAtMzIgLTUgLTMzIC01MCAtMzYgbC00OCAtMyAwIC02MiBjLTEgLTc5IC0xMCAtMjM4IC0xNgotMjU1IC0yIC05IC0xOSAtMTIgLTUxIC0xMCBsLTQ4IDMgNCAxNTkgMyAxNTkgLTIzIC04IGMtMzkgLTEyIC03NCAtMTEgLTczIDMKMSA2IDIgMzIgMyA1NyBsMSA0NSAxMjQgMCAxMjUgMCAtMTIgMjMgYy0yMSAzOSAtOTYgMTI4IC0xNDUgMTcxIC01OSA1MyAtMTEzCjgxIC0yMDUgMTA2IC04NCAyMyAtNzUgMjMgLTEwOSA0eiIvPgo8L2c+Cjwvc3ZnPgo=";

    if (selectedContract === 'contrato2') {
      // Contrato 2 - Versão simplificada
      return `<div style="text-align: center; margin-bottom: 30px;">
        <img src="${logoBase64}" alt="Teen Speech Logo" style="width: 60px; height: 60px; margin: 0 auto; display: block;" />
        <h3 style="margin: 10px 0; fontSize: 16px; fontWeight: bold;">TEEN SPEECH - ESCOLA DE IDIOMAS</h3>
      </div>

      <h3 style="text-align: center; margin: 20px 0;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h3>

      <p style="text-align: justify; margin-bottom: 20px;">O contrato de prestação de serviços educacionais que entre si celebram, de um lado, o(a) aluno(a) abaixo qualificado(a), doravante denominado(a) CONTRATANTE, e, de outro lado, a TEEN SPEECH, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 30.857.093/0001-36, com sede na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, Guarulhos/SP, doravante denominada CONTRATADA, têm entre si justo e contratado o seguinte:</p>

      <div style="text-align: center; font-weight: bold;">01. Identificação do CONTRATANTE:</div>
      <p>Nome: ${student?.nome || '<span class="placeholder-text">Nome do contratante</span>'}</p>
      <p>Data de Nascimento: ${student?.data_nascimento ? new Date(student.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">Data de nascimento</span>'}</p>
      <p>CPF: ${student?.cpf || '<span class="placeholder-text">CPF</span>'}</p>
      <p>Endereço: ${student?.endereco || '<span class="placeholder-text">Endereço completo</span>'}</p>
      <p>Telefone: ${student?.telefone || '<span class="placeholder-text">Telefone</span>'}</p>
      <p>E-mail: ${student?.email || '<span class="placeholder-text">E-mail</span>'}</p>

      ${shouldShowResponsavelSection() ? `
      <h4>02. Identificação do RESPONSÁVEL FINANCEIRO:</h4>
      ${generateResponsavelSection().replace(/style="[^"]*"/g, '').replace(/<div[^>]*>|<\/div>/g, '').replace(/<table[^>]*>|<\/table>/g, '').replace(/<tr[^>]*>|<\/tr>/g, '').replace(/<td[^>]*>/g, '<p>').replace(/<\/td>/g, '</p>')}
      ` : ''}

      <h4>03. DO OBJETO:</h4>
      <p>3.1. A CONTRATADA compromete-se a prestar serviços educacionais de ensino de idiomas ao CONTRATANTE, conforme as condições estabelecidas neste contrato.</p>

      <h4>04. DO VALOR E FORMA DE PAGAMENTO:</h4>
      <p>4.1. O valor total do curso é de R$ <span class="placeholder-text">valor</span>, dividido em ${student?.financeiro_alunos?.[0]?.planos?.numero_aulas || '<span class="placeholder-text">número de aulas</span>'} aulas.</p>
      <p>4.2. O pagamento será efetuado conforme a periodicidade: semanal.</p>

      <div style="margin-top: 50px; page-break-inside: avoid;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 14px;">ASSINATURAS</div>
        
        <div style="display: flex; justify-content: space-between; gap: 60px; margin-bottom: 40px;">
          <div style="flex: 1; text-align: center;">
            <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;"></div>
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">${student?.nome || 'CONTRATANTE'}</div>
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
      </div>`;
    }

    // Contrato 1 - Versão completa
    return `
<div style="text-align: center; margin-bottom: 20px;">
  <div style="margin-bottom: 10px;">
    <img src="${logoBase64}" alt="Teen Speech Logo" style="width: 80px; height: 80px; display: block; margin: 0 auto;" />
  </div>
  <h1 style="font-size: 18px; font-weight: bold; margin: 0; text-align: center;">TEEN SPEECH - ESCOLA DE IDIOMAS</h1>
</div>

<div style="text-align: center; margin-bottom: 20px;">
  <h2 style="font-size: 16px; font-weight: bold; margin: 10px 0;">${getContractTitle()}</h2>
  <h3 style="font-size: 14px; font-weight: bold; margin: 10px 0;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h3>
</div>

O contrato de prestação de serviços educacionais que entre si celebram, de um lado, o(a) aluno(a) abaixo qualificado(a), doravante denominado(a) CONTRATANTE, e, de outro lado, a TEEN SPEECH, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 30.857.093/0001-36, com sede na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, Guarulhos/SP, doravante denominada CONTRATADA, têm entre si justo e contratado o seguinte:

<div style="text-align: center; font-weight: bold; margin-top: 20px; margin-bottom: 15px;">01. Identificação do CONTRATANTE:</div>

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 15%; padding: 5px; font-weight: bold;">CPF:</td>
      <td style="width: 35%; padding: 5px; border-bottom: 1px solid #000;">${student.cpf || '<span class="placeholder-text">CPF</span>'}</td>
      <td style="width: 15%; padding: 5px; font-weight: bold;">Nome:</td>
      <td style="width: 35%; padding: 5px; border-bottom: 1px solid #000;">${student.nome}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Data de nascimento:</td>
      <td colspan="3" style="padding: 5px; border-bottom: 1px solid #000;">${student.data_nascimento ? new Date(student.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">Data de nascimento</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Endereço:</td>
      <td colspan="3" style="padding: 5px; border-bottom: 1px solid #000;">${student.endereco ? `${student.endereco}, nº ${student.numero_endereco || '<span class="placeholder-text">número</span>'}` : '<span class="placeholder-text">Endereço completo</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Telefone:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student.telefone || '<span class="placeholder-text">Telefone</span>'}</td>
      <td style="padding: 5px; font-weight: bold;">E-mail:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student.email || '<span class="placeholder-text">E-mail</span>'}</td>
    </tr>
  </table>
</div>

${generateResponsavelSection()}

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">TODOS OS PLANOS ASSOCIADOS</h4>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold;">Nome do Plano:</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">${planData?.nome || 'Módulo de curso'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Valor Total:</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">R$ ${planData?.valor_total ? planData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor total</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Número de Aulas:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${planData?.numero_aulas || '<span class="placeholder-text">número de aulas</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Frequência:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">semanal</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Descrição:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${planData?.descricao || '<span class="placeholder-text">descrição do plano</span>'}</td>
    </tr>

    <tr>
      <td style="padding: 5px; font-weight: bold;">Parcelas:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${financialData?.numero_parcelas_plano || '<span class="placeholder-text">número de parcelas</span>'}</td>
    </tr>
  </table>
</div>

<div style="page-break-before: always; margin-top: 50px;"></div>

<div style="margin-top: 170px;"></div>

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold;">Valores do Curso e Condições de Pagamento:</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">Semestral: R$ ${planData?.valor_total ? planData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor semestral</span>'} / Mensal: R$ ${(() => {
        if (!student?.financeiro_alunos || student.financeiro_alunos.length === 0) {
          return financialData?.valor_plano ? financialData.valor_plano.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor mensal</span>';
        }
        
        const parcelasPlano = student.financeiro_alunos
          .flatMap(f => f.parcelas_alunos || [])
          .filter(p => p.tipo_item === 'plano')
          .sort((a, b) => a.numero_parcela - b.numero_parcela);
        
        if (parcelasPlano.length > 0) {
          return parcelasPlano[0].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }
        
        return financialData?.valor_plano ? financialData.valor_plano.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor mensal</span>';
      })()}</td>
    </tr>


  </table>
</div>

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">INFORMAÇÕES DA TURMA DO ALUNO</h4>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold;">Nome da Turma:</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">${student.turma_regular?.nome || student.turma_particular?.nome || '<span class="placeholder-text">nome da turma</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Idioma:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student.idioma || '<span class="placeholder-text">idioma</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Nível:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student.turma_regular?.nivel || student.turma_particular?.nivel || '<span class="placeholder-text">nível</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Horário:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student.turma_regular?.horario || student.turma_particular?.horario || '<span class="placeholder-text">horário</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Dias da Semana:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student.turma_regular?.dias_da_semana || student.turma_particular?.dias_da_semana || '<span class="placeholder-text">dias da semana</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Tipo de Turma:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${student.turma_regular ? 'Turma Regular' : student.turma_particular ? 'Turma Particular' : '<span class="placeholder-text">tipo de turma</span>'}</td>
    </tr>
  </table>
</div>

<p style="text-align: justify; margin-bottom: 15px;">Por este Instrumento Particular de Contrato de Prestação de Serviços, de um lado TEEN SPEECH, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 30.857.093/0001-36, com sede na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, Guarulhos/SP, doravante denominada CONTRATADA, e, de outro lado, o(a) aluno(a) acima qualificado(a), doravante denominado(a) CONTRATANTE, têm entre si justo e contratado o seguinte:</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">1. CLÁUSULA PRIMEIRA - DA IDENTIFICAÇÃO DAS PARTES E DO OBJETO</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>1.1 CONTRATANTE:</strong> ${student.nome}, portador(a) do CPF nº ${student.cpf || '<span class="placeholder-text">CPF</span>'}, nascido(a) em ${student.data_nascimento ? new Date(student.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de nascimento</span>'}, residente e domiciliado(a) na ${student.endereco || '<span class="placeholder-text">endereço</span>'}, nº ${student.numero_endereco || '<span class="placeholder-text">número</span>'}, telefone ${student.telefone || '<span class="placeholder-text">telefone</span>'}, e-mail: ${student.email || '<span class="placeholder-text">e-mail</span>'}.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>1.2 CONTRATADA:</strong> TEEN SPEECH - ESCOLA DE IDIOMAS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 30.857.093/0001-36, com sede na cidade de Guarulhos - SP, na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, telefone (11) 4372-1271, e-mail: coordenacaotsbonsucesso@gmail.com.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>1.3 OBJETO:</strong> O presente contrato tem por objeto a prestação de serviços educacionais conforme ${planData?.nome || 'Plano Padrão'}, na modalidade presencial/online, conforme as condições estabelecidas nas cláusulas seguintes.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">2. CLÁUSULA SEGUNDA - DA DURAÇÃO DO CURSO E CARGA HORÁRIA</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>2.1</strong> O curso conforme ${planData?.nome || 'Plano Padrão'} terá duração de ${planData?.numero_aulas === 36 ? '6 meses' : planData?.numero_aulas === 72 ? '1 ano' : planData?.numero_aulas ? Math.ceil(planData.numero_aulas / 4) + ' meses' : '<span class="placeholder-text">9 meses</span>'}, com início em ${contractData?.data_inicio ? new Date(contractData.data_inicio).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de início</span>'} e término previsto para ${contractData?.data_fim ? new Date(contractData.data_fim).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de término</span>'}, totalizando ${planData?.numero_aulas || '<span class="placeholder-text">36</span>'} horas/aula.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>2.2</strong> As aulas serão ministradas semanalmente, com duração de 55 minutos cada, nos dias ${student.turma_regular?.dias_da_semana || student.turma_particular?.dias_da_semana || '<span class="placeholder-text">dias da semana</span>'} e horários ${student.turma_regular?.horario || student.turma_particular?.horario || '<span class="placeholder-text">horário</span>'}.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>2.3</strong> O cronograma das aulas poderá sofrer alterações mediante comunicação prévia de no mínimo 48 (quarenta e oito) horas.</p>

<div style="margin-top: 170px;"></div>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">3. CLÁUSULA TERCEIRA - DO VALOR E FORMA DE PAGAMENTO</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>3.1</strong> O valor total do curso é de R$ ${planData?.valor_total ? planData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor total</span>'} (${planData?.valor_total ? numberToWords(planData.valor_total) : '<span class="placeholder-text">valor por extenso</span>'}) "Valor bruto sem nenhum desconto mas não é o preço a pagar".</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>3.2</strong> O pagamento será efetuado da seguinte forma:</p>
<ul style="margin-left: 20px; margin-bottom: 10px;">
  <li>Pagamento mensal de R$ ${(() => {
    if (!student?.financeiro_alunos || student.financeiro_alunos.length === 0) {
      return '<span class="placeholder-text">valor mensal</span>';
    }
    
    // Buscar parcelas do plano (tipo_item = 'plano')
    const parcelasPlano = student.financeiro_alunos
      .flatMap(f => f.parcelas_alunos || [])
      .filter(p => p.tipo_item === 'plano')
      .sort((a, b) => a.numero_parcela - b.numero_parcela);
    
    if (parcelasPlano.length > 0) {
      return parcelasPlano[0].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    
    // Fallback para valor_plano se não houver parcelas
    return financialData?.valor_plano ? financialData.valor_plano.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor mensal</span>';
  })()}</li>
  <li>Vencimento: todo dia ${financialData?.data_primeiro_vencimento ? new Date(financialData.data_primeiro_vencimento).getDate() : '<span class="placeholder-text">dia do vencimento</span>'} de cada mês</li>
<li>Primeira parcela: ${financialData?.data_primeiro_vencimento ? new Date(financialData.data_primeiro_vencimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data da primeira parcela</span>'}</li>
</ul>

<p style="text-align: justify; margin-bottom: 10px;"><strong>3.3</strong> O não pagamento na data do vencimento implicará em:</p>
<ul style="margin-left: 20px; margin-bottom: 10px;">
  <li>a) Multa de 2% (dois por cento) sobre o valor da parcela;</li>
  <li>b) Juros de mora de 1% (um por cento) ao mês;</li>
  <li>c) Atualização monetária pelo IGPM ou índice que vier a substituí-lo.</li>
</ul>

<p style="text-align: justify; margin-bottom: 15px;"><strong>3.4</strong> O atraso superior a 30 (trinta) dias no pagamento de qualquer parcela facultará à CONTRATADA a rescisão imediata do contrato, independentemente de notificação judicial ou extrajudicial.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">4. CLÁUSULA QUARTA - DAS OBRIGAÇÕES DA CONTRATADA</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>4.1</strong> Ministrar as aulas conforme cronograma estabelecido, utilizando metodologia adequada conforme ${planData?.nome || 'Plano Padrão'}.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>4.2</strong> Disponibilizar professores qualificados e material didático necessário para o desenvolvimento do curso.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>4.3</strong> Fornecer certificado de conclusão ao aluno que obtiver frequência mínima de 75% (setenta e cinco por cento) e aproveitamento satisfatório.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>4.4</strong> Comunicar previamente qualquer alteração de horário, data ou local das aulas.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>4.5</strong> Manter sigilo sobre as informações pessoais do CONTRATANTE.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">5. CLÁUSULA QUINTA - DAS OBRIGAÇÕES DO CONTRATANTE</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>5.1</strong> Efetuar o pagamento das mensalidades nas datas estabelecidas.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>5.2</strong> Comparecer às aulas com pontualidade e assiduidade.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>5.3</strong> Zelar pela conservação do material didático e das instalações da escola.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>5.4</strong> Comunicar previamente eventuais faltas ou impossibilidade de comparecimento às aulas.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>5.5</strong> Respeitar o regulamento interno da escola e as normas de convivência.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">6. CLÁUSULA SEXTA - DA REPOSIÇÃO DE AULAS</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>6.1</strong> O CONTRATANTE terá direito à reposição de aulas em caso de falta justificada, mediante comunicação prévia de no mínimo 24 (vinte e quatro) horas.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>6.2</strong> As aulas de reposição deverão ser agendadas com antecedência e realizadas conforme disponibilidade da CONTRATADA.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>6.3</strong> Não haverá reposição de aulas em caso de faltas não justificadas ou comunicadas fora do prazo estabelecido.</p>

<div style="margin-top: 170px;"></div>
<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">7. CLÁUSULA SÉTIMA - DA RESCISÃO CONTRATUAL</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>7.1</strong> O presente contrato poderá ser rescindido:</p>
<ul style="margin-left: 20px; margin-bottom: 10px;">
  <li>a) Por mútuo acordo entre as partes;</li>
  <li>b) Por inadimplemento de qualquer das cláusulas contratuais;</li>
  <li>c) Por iniciativa de qualquer das partes, mediante aviso prévio de 30 (trinta) dias.</li>
</ul>

<p style="text-align: justify; margin-bottom: 10px;"><strong>7.2</strong> Em caso de rescisão por parte do CONTRATANTE, não haverá devolução dos valores já pagos, salvo em caso de impossibilidade da CONTRATADA em cumprir suas obrigações.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>7.3</strong> A rescisão não exime o CONTRATANTE do pagamento das parcelas vencidas até a data da rescisão.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">8. CLÁUSULA OITAVA - DAS DISPOSIÇÕES GERAIS</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>8.1</strong> O presente contrato obriga as partes e seus sucessores a qualquer título.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>8.2</strong> Qualquer alteração deste contrato deverá ser feita por escrito e assinada por ambas as partes.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>8.3</strong> A tolerância de uma parte para com o descumprimento das cláusulas e condições deste contrato não importará em novação ou renúncia ao direito de exigir o seu cumprimento.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>8.4</strong> Se qualquer disposição deste contrato for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">9. CLÁUSULA NONA - DO FORO</h4>

<p style="text-align: justify; margin-bottom: 15px;"><strong>9.1</strong> As partes elegem o foro da COMARCA de Guarulhos, como único competente para decidir qualquer questão oriunda do presente contrato, em detrimento de qualquer outro por mais privilegiado que possa ser.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">10. CLÁUSULA DÉCIMA - DA PROTEÇÃO DE DADOS PESSOAIS</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>10.1</strong> A CONTRATADA compromete-se a realizar o tratamento dos dados pessoais do CONTRATANTE e do ESTUDANTE em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis do ordenamento jurídico brasileiro.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>10.2</strong> O tratamento de dados ocorrerá exclusivamente para as finalidades específicas para as quais foram coletados (como a prestação de serviços educacionais, gestão de matrículas, comunicação e cumprimento de obrigações legais), utilizando-se apenas os dados estritamente necessários para tais fins.</p>

<div style="margin-top: 8cm;"></div>
<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">11. CLÁUSULA DÉCIMA PRIMEIRA - DAS DESPESAS COM A COBRANÇA E EXECUÇÃO</h4>

<p style="text-align: justify; margin-bottom: 10px;">Em caso de inadimplemento contratual que enseje a necessidade de cobrança (judicial ou extrajudicial) ou a execução do presente contrato, a parte que deu causa ao inadimplemento será responsável por arcar com todas as despesas decorrentes, incluindo, mas não se limitando a:</p>

<ul style="margin-left: 20px; margin-bottom: 15px;">
  <li>a) Custas processuais e taxas judiciárias;</li>
  <li>b) Despesas com notificações extrajudiciais e protestos;</li>
  <li>c) Honorários advocatícios, arbitrados em 20% (vinte por cento) sobre o valor total do débito (principal, juros, multa e atualização monetária), caso seja necessária a atuação de advogado para a cobrança ou defesa dos direitos da parte contrária; e</li>
  <li>d) Outras despesas comprovadamente realizadas para a recuperação do crédito ou a defesa do cumprimento do contrato.</li>
</ul>

Estando as duas partes de acordo, declaram ciência através da assinatura deste, em duas vias de igual teor.

Guarulhos, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.

Ciente e de acordo,

<div style="text-align: center; margin: 20px 0;">
  <div style="margin-bottom: 30px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <!-- Espaço para assinatura do contratante -->
    </div>
    <div>CONTRATANTE</div>
    <div>${student.nome}</div>
    <div>CPF: ${student.cpf || '<span class="placeholder-text">CPF</span>'}</div>
  </div>
  
  <div style="margin-bottom: 30px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <img src="${teenSpeechSignature}" alt="Assinatura Teen Speech" style="max-width: 280px; max-height: 70px;" />
    </div>
    <div>TEEN SPEECH</div>
    <div>CONTRATADA</div>
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
    `;
  };

  const handleEdit = () => {
    setIsEditing(true);
    const currentContent = savedContent || generateContractContent();
    setEditableContent(currentContent);
  };

  const handleSave = () => {
    if (editableRef.current) {
      const content = editableRef.current.innerHTML;
      setSavedContent(content);
      setIsEditing(false);
      toast({
        title: "Contrato salvo",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableContent('');
  };

  const handleDownload = async () => {
    if (!student) return;
    
    try {
      // Importar jsPDF dinamicamente
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // Criar um elemento temporário com o conteúdo do contrato
      const contentToPrint = isEditing ? editableContent : (savedContent || generateContractContent());
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentToPrint;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.style.padding = '20px';
      
      document.body.appendChild(tempDiv);
      
      // Aguardar um pouco para as imagens carregarem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Adicionar estilos CSS para quebras de página inteligentes
      const style = document.createElement('style');
      style.textContent = `
        .page-break-avoid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        p, div {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
      `;
      tempDiv.appendChild(style);
      
      // Converter para canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight,
        logging: false,
        useCORS: true
      });
      
      // Remover elemento temporário
      document.body.removeChild(tempDiv);
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      const margin = 10; // Margem para evitar corte de texto
      
      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin);
      
      // Adicionar páginas adicionais com margem para evitar corte
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin);
      }
      
      // Salvar o PDF
      const fileName = `Contrato_${student.nome.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
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
      
      // Fallback para impressão tradicional
      const contentToPrint = isEditing ? editableContent : (savedContent || generateContractContent());
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contrato - ${student.nome}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .contract { max-width: 800px; margin: 0 auto; }
              img { max-width: 100%; height: auto; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                img { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="contract">
              ${contentToPrint}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerador de Contratos - {student?.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Aluno */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Aluno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Nome:</span> {student?.nome}</div>
                <div><span className="font-medium">CPF:</span> {student?.cpf || 'Não informado'}</div>
                <div><span className="font-medium">Data de Nascimento:</span> {student?.data_nascimento ? new Date(student.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</div>
                <div><span className="font-medium">Telefone:</span> {student?.telefone || 'Não informado'}</div>
                <div><span className="font-medium">Idioma:</span> {student?.idioma || 'Não informado'}</div>
                <div><span className="font-medium">Status:</span> {student?.status || 'Não informado'}</div>
                <div className="col-span-2"><span className="font-medium">Email:</span> {student?.email || 'Não informado'}</div>
                <div className="col-span-2"><span className="font-medium">Endereço:</span> {student?.endereco ? `${student.endereco}, ${student.numero_endereco}` : 'Não informado'}</div>
              </div>

              {/* Informações de Turma */}
              {(student?.turma_regular || student?.turma_particular) && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações de Turma
                  </h4>
                  <div className="space-y-3">
                    {student?.turma_regular && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium text-blue-800 mb-2">Turma Regular:</div>
                          <div><span className="font-medium">Nome:</span> {student.turma_regular.nome}</div>
                          <div><span className="font-medium">Nível:</span> {student.turma_regular.nivel || 'Não informado'}</div>
                          <div><span className="font-medium">Horário:</span> {student.turma_regular.horario || 'Não informado'}</div>
                          <div><span className="font-medium">Dias da Semana:</span> {student.turma_regular.dias_da_semana || 'Não informado'}</div>
                        </div>
                      </div>
                    )}
                    {student?.turma_particular && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium text-green-800 mb-2">Turma Particular:</div>
                          <div><span className="font-medium">Nome:</span> {student.turma_particular.nome}</div>
                          <div><span className="font-medium">Nível:</span> {student.turma_particular.nivel || 'Não informado'}</div>
                          <div><span className="font-medium">Horário:</span> {student.turma_particular.horario || 'Não informado'}</div>
                          <div><span className="font-medium">Dias da Semana:</span> {student.turma_particular.dias_da_semana || 'Não informado'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informações do Responsável */}
              {shouldShowResponsavelSection() && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações do Responsável {calculateAge(student?.data_nascimento || null) < 18 ? '(Obrigatório)' : '(Cadastrado)'}
                  </h4>
                  {student?.responsaveis ? (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">Nome:</span> {student.responsaveis.nome || 'Não informado'}</div>
                        <div><span className="font-medium">CPF:</span> {student.responsaveis.cpf || 'Não informado'}</div>
                        <div><span className="font-medium">Telefone:</span> {student.responsaveis.telefone || 'Não informado'}</div>
                        <div><span className="font-medium">Email:</span> {student.responsaveis.email || 'Não informado'}</div>
                        <div className="col-span-2"><span className="font-medium">Endereço:</span> {student.responsaveis.endereco ? `${student.responsaveis.endereco}, ${student.responsaveis.numero_endereco}` : 'Não informado'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 text-sm">
                        <span className="font-medium">Atenção:</span> Este aluno é menor de idade e necessita de um responsável cadastrado.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Informações Financeiras */}
              {student?.financeiro_alunos && student.financeiro_alunos.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Todos os Planos Associados
                  </h4>
                  <div className="space-y-4">
                    {student.financeiro_alunos.map((financeiro, index) => {
                      // Calculate total paid from parcelas_alunos
                      const valorPago = financeiro.parcelas_alunos?.reduce((total, parcela) => {
                        return total + (parseFloat(parcela.valor) || 0);
                      }, 0) || 0;
                      
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {financeiro.planos && (
                              <>
                                <div>
                                  <span className="font-medium">Nome do Plano:</span> {financeiro.planos.nome || 'Não informado'}
                                </div>
                                <div>
                                  <span className="font-medium">Valor Total:</span> R$ {financeiro.planos.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'Não informado'}
                                </div>
                                <div>
                                  <span className="font-medium">Número de Aulas:</span> {financeiro.planos.numero_aulas || 'Não informado'}
                                </div>
                                <div>
                                  <span className="font-medium">Frequência:</span> {financeiro.planos.frequencia_aulas || 'Não informado'}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">Descrição:</span> {financeiro.planos.descricao || 'Não informado'}
                                </div>

                                <div>
                                  <span className="font-medium">Parcelas:</span> {financeiro.parcelas_alunos?.length || 0}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Alertas de verificação */}
              {(!student?.financeiro_alunos || student.financeiro_alunos.length === 0) && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <span className="font-medium">Atenção:</span> Este aluno não possui plano financeiro associado. Alguns campos do contrato podem ficar em branco.
                  </p>
                </div>
              )}
              
              {(!student?.turma_regular && !student?.turma_particular) && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-orange-800 text-sm">
                    <span className="font-medium">Atenção:</span> Este aluno não possui turma associada (regular ou particular). Informações de turma no contrato ficarão em branco.
                  </p>
                </div>
              )}
              
              {(!contractData || contractData.length === 0) && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">
                    <span className="font-medium">Atenção:</span> Este aluno não possui contrato ativo. Algumas informações contratuais podem não estar disponíveis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seleção de Tipo de Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Tipo de Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={selectedContract === 'contrato1' ? 'default' : 'outline'}
                  onClick={() => setSelectedContract('contrato1')}
                >
                  {planData?.nome || 'Plano Padrão'}
                </Button>
                <Button
                  variant={selectedContract === 'contrato2' ? 'default' : 'outline'}
                  onClick={() => setSelectedContract('contrato2')}
                >
                  Contrato de pretação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contrato Gerado</span>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button onClick={handleEdit} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button onClick={handleDownload} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleSave} variant="default" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <style>{`
                .placeholder-text {
                  color: #999;
                  font-style: italic;
                  background-color: #f0f0f0;
                  padding: 2px 4px;
                  border-radius: 3px;
                  cursor: text;
                }
                .editable-contract .placeholder-text:hover {
                  background-color: #e0e0e0;
                }
                @media print {
                  .placeholder-text {
                    font-size: 6pt !important;
                    color: rgba(0,0,0,0.3) !important;
                    background-color: white !important;
                    padding: 0 !important;
                    border-radius: 0 !important;
                  }
                }
              `}</style>
              {isEditing ? (
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
                              element.setAttribute('style', 'color: #333; font-style: normal; background-color: transparent;');
                              if (e.key !== 'Backspace' && e.key !== 'Delete') {
                                element.textContent = e.key;
                                e.preventDefault();
                              }
                            }
                            break;
                          }
                        }
                        node = node.parentNode;
                      }
                    }
                  }}
                />
              ) : (
                <div 
                  className="min-h-[600px] text-sm p-4 border rounded-lg bg-white"
                  style={{ fontFamily: 'Garamond, serif', fontSize: '14pt', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: savedContent || generateContractContent() }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentContractGeneratorModal;