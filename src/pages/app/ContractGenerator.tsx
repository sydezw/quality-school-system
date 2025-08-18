import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Printer, FileText, Edit, Save, X, Check, ChevronsUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { numberToWords } from '@/utils/formatters';
import './contract-styles.css';
import teenSpeechSignature from '@/assets/signatures/teen-speech-assinatura.png';
import testemunha1Signature from '@/assets/signatures/testemunha1.png';
import testemunha2Signature from '@/assets/signatures/testemunha2.png';

interface Student {
  id: string;
  nome: string;
  cpf: string | null;
  idioma: string;
  responsavel_id: string | null;
  status: string;
  telefone: string | null;
  turma_regular?: {
    nome: string;
    nivel: string | null;
    horario: string | null;
    dias_da_semana: string | null;
  } | null;
  turma_particular?: {
    nome: string;
    nivel: string | null;
    horario: string | null;
    dias_da_semana: string | null;
  } | null;
  responsaveis?: {
    nome: string;
  } | null;
  financeiro_alunos?: Array<{
    plano_id: string;
    valor_plano: number;
    numero_parcelas_plano: number;
    planos: {
      nome: string;
      valor_total: number;
      numero_aulas: number;
      frequencia_aulas: string;
      descricao: string;
    };
  }>;
}

const ContractGenerator = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedContract, setSelectedContract] = useState<string>('');

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
    if (!shouldShowResponsavelSection()) return '';
    
    const age = selectedStudent?.data_nascimento ? calculateAge(selectedStudent.data_nascimento) : 0;
    const hasResponsavel = selectedStudent?.responsaveis?.nome;
    
    let sectionTitle = 'RESPONSÁVEL (para menores de idade):';
    if (age >= 18 && hasResponsavel) {
      sectionTitle = 'RESPONSÁVEL (cadastrado):';
    }
    
    // Se é menor de idade e não tem responsável, mostra aviso
    if (age < 18 && !hasResponsavel) {
      return `
<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px; background-color: #fff3cd;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold; color: #856404;">${sectionTitle}</td>
      <td style="width: 70%; padding: 5px; color: #856404; font-weight: bold;">⚠️ DADOS DO RESPONSÁVEL OBRIGATÓRIOS PARA MENORES DE 18 ANOS</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">CPF:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;"><span class="placeholder-text">CPF do responsável</span></td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Telefone:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;"><span class="placeholder-text">Telefone do responsável</span></td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Email:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;"><span class="placeholder-text">E-mail do responsável</span></td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Endereço:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;"><span class="placeholder-text">Endereço do responsável</span></td>
    </tr>
  </table>
</div>`;
    }
    
    // Seção normal com dados do responsável
    return `
<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold;">${sectionTitle}</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">${selectedStudent?.responsaveis?.nome || '<span class="placeholder-text">Nome do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">CPF:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent?.responsaveis?.cpf || '<span class="placeholder-text">CPF do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Telefone:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent?.responsaveis?.telefone || '<span class="placeholder-text">Telefone do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Email:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent?.responsaveis?.email || '<span class="placeholder-text">E-mail do responsável</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Endereço:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent?.responsaveis?.endereco ? `${selectedStudent.responsaveis.endereco}, nº ${selectedStudent.responsaveis.numero_endereco || '<span class="placeholder-text">número</span>'}` : '<span class="placeholder-text">Endereço do responsável</span>'}</td>
    </tr>
  </table>
</div>`;
  };

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');

  const [open, setOpen] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Derived data from selected student
  const planData = selectedStudent?.financeiro_alunos && selectedStudent.financeiro_alunos.length > 0 ? selectedStudent.financeiro_alunos[0].planos : null;
  const financialData = selectedStudent?.financeiro_alunos && selectedStudent.financeiro_alunos.length > 0 ? selectedStudent.financeiro_alunos[0] : null;
  const [contractData, setContractData] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
    fetchPlans();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedPlan, allStudents]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar planos',
        variant: 'destructive',
      });
    }
  };

  const filterStudents = () => {
    let filtered = allStudents;

    // Filtro por nome com busca inteligente
    if (searchTerm) {
      const queryNorm = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const queryNumbers = searchTerm.replace(/\D/g, "");
      
      filtered = filtered.filter(student => {
        const nomeNorm = student.nome ? student.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
        const cpfNorm = student.cpf ? student.cpf.replace(/\D/g, "") : "";
        const telefoneNorm = student.telefone ? student.telefone.replace(/\D/g, "") : "";

        // Busca inteligente: início do nome completo, início de qualquer palavra, CPF ou telefone
        const nomeWords = nomeNorm.split(' ').filter(word => word.length > 0);
        const queryMatches = (
          // Começa com a query
          nomeNorm.startsWith(queryNorm) ||
          // Qualquer palavra começa com a query
          nomeWords.some(word => word.startsWith(queryNorm)) ||
          // CPF contém os números
          (cpfNorm && cpfNorm.includes(queryNumbers)) ||
          // Telefone contém os números
          (telefoneNorm && telefoneNorm.includes(queryNumbers))
        );

        return queryMatches;
      });
    }

    // Filtro por plano
    if (selectedPlan && selectedPlan !== 'all') {
      filtered = filtered.filter(student => 
        student.financeiro_alunos?.some(financeiro => 
          financeiro.planos?.nome === selectedPlan
        )
      );
    }

    setStudents(filtered);
    
    // Auto-select first student if there are filtered results
    if (filtered.length > 0 && (searchTerm || (selectedPlan && selectedPlan !== 'all'))) {
      setSelectedStudent(filtered[0]);
      setSelectedContract('contrato1');
    } else if (filtered.length === 0) {
      setSelectedStudent(null);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          turma_regular:turmas!turma_id(nome, nivel, horario, dias_da_semana),
          turma_particular:turmas!turma_particular_id(nome, nivel, horario, dias_da_semana),
          responsaveis(nome, cpf, telefone, email, endereco, numero_endereco),
          financeiro_alunos(
            plano_id,
            valor_plano,
            numero_parcelas_plano,
            data_primeiro_vencimento,
            planos(
              nome,
              valor_total,
              numero_aulas,
              frequencia_aulas,
              descricao
            )
          )
        `)
        .eq('status', 'Ativo')
        .order('nome');

      if (error) throw error;
      setAllStudents(data || []);
      setStudents(data || []);
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

  const loadContractData = async (studentId: string) => {
    try {
      const { data: contractData, error: contractError } = await supabase
        .from('contratos')
        .select('*')
        .eq('aluno_id', studentId)
        .in('status_contrato', ['Ativo', 'Agendado'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (contractError) {
        console.error('Erro ao carregar dados do contrato:', contractError);
      }

      if (contractData && contractData.length > 0) {
        setContractData(contractData[0]);
      } else {
        setContractData(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do contrato:', error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
    if (student) {
      setSelectedContract('contrato1');
      loadContractData(studentId);
    }
    setIsEditing(false);
    setEditableContent('');
  };

  const getContractTitle = () => {
    return selectedContract === 'contrato2' 
      ? 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS – CONTRATO 2'
      : `CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS – ${planData?.nome || 'PLANO PADRÃO'}`;
  };

  const generateContractContent = () => {
    if (!selectedStudent) return '';
    
    // Nova logo como base64
    const logoBase64 = "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAyMDAxMDkwNC8vRU4iCiAiaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogd2lkdGg9IjE5My4wMDAwMDBwdCIgaGVpZ2h0PSIxMzEuMDAwMDAwcHQiIHZpZXdCb3g9IjAgMCAxOTMuMDAwMDAwIDEzMS4wMDAwMDAiCiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0Ij4KCjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLDEzMS4wMDAwMDApIHNjYWxlKDAuMTAwMDAwLC0wLjEwMDAwMCkiCmZpbGw9IiMwMDAwMDAiIHN0cm9rZT0ibm9uZSI+CjxwYXRoIGQ9Ik00NzggMTEyNCBjLTQwIC0yMSAtNDQgLTUzIC0xNSAtMTI2IDI5IC03MyA0MiAtMTIyIDUyIC0xOTMgNCAtMjcKMTUgLTY5IDI1IC05MiAxNyAtMzkgMjIgLTQzIDU0IC00MyAyNSAwIDM2IC00IDM2IC0xNSAwIC04IC02IC0xNSAtMTQgLTE1Ci0yMCAwIC02MSAtODcgLTQ4IC0xMDMgMTcgLTIyIDIwIC01NiA2IC02OCAtMTIgLTEwIC05IC0xNSAxNiAtMzEgMjUgLTE1IDMxCi0yNCAyOCAtNDggLTIgLTE5IDUgLTM3IDE5IC01MiAxMSAtMTMgMjQgLTMyIDI3IC00NCA3IC0yMSAtMjQgLTEyMyAtNDkgLTE2MAotMTIgLTE5IC0xMiAtMjQgMCAtMzQgMTYgLTE0IDEzIC0xOSA0MSA2OCAyMiA2OCA0MCA4OSA2MyA2OSAxNCAtMTMgNDYgLTIzCjkxIC0zMCA4IC0xIDE1IDUgMTYgMTMgMyAzNiA1IDQwIDIzIDQwIDE1IDAgMjUgMjEgNTAgMTAzIDE4IDU2IDQyIDEzNCA1NQoxNzIgbDIzIDcwIDcgLTU1IGM0IC0zMCAxMiAtNzEgMTkgLTkwIGwxMSAtMzUgNyAzMCBjNCAxNyA3IDUwIDggNzUgMiA2NyAxNwo4MyAyOCAzMCA3IC0zNiAxNCAtNDYgNDYgLTYzIDM1IC0xOCA0MCAtMTggNTQgLTQgMjMgMjIgMTIgNDAgLTUxIDgyIC03OSA1Mgo5MCA5MyAtNDkgMTgyIDI1IDU0IDEyMiA4MSAxODggNTEgMjggLTEzIDUwIC03NSA0MSAtMTE0IC02IC0yMSAtMTIgLTI0IC01MAotMjQgLTQ1IDAgLTU2IDEwIC01NiA1MSAwIDEyIC01IDE2IC0xNSAxMyAtMjIgLTkgLTE4IC00OCA4IC03MiAxMyAtMTIgMjgKLTIyIDMzIC0yMiAyNSAwIDY2IC02MCA3MSAtMTA0IDEwIC04OCAtNjAgLTE0OCAtMTU1IC0xMzIgbC0zNCA1IDcgLTQ3IGMxMAotNjggMzAgLTEwMiA2MCAtMTAyIDIyIDAgMjUgLTQgMjUgLTM1IDAgLTM0IDIwIC00OSAzNSAtMjUgMyA1IDE3IDEwIDMwIDEwCjEzIDAgMjcgNSAzMCAxMCAxMCAxNiAzMyAxMiA1NSAtMTAgMTQgLTE0IDIwIC0zMyAyMCAtNjQgMCAtMjYgNiAtNDggMTUgLTU2CjI2IC0yMSAyOSAxNCA2IDc1IC0yNyA3MyAtMjggMTM5IC0xIDE2MiAxMyAxMiAyMCAzMCAyMCA1NSAwIDI2IDYgNDEgMjEgNTIKMTUgMTAgMjAgMjEgMTYgMzYgLTMgMTIgLTEgMzUgNSA1MSA5IDI1IDYgMzQgLTE0IDYyIC0xMyAxNyAtMjkgNDQgLTM2IDYwCi0xMSAyNiAtMTAgMjcgMTcgMjcgMTYgMCAzOCA4IDUwIDE4IDI0IDE5IDcxIDEzOCA3MSAxNzggMCAxMyA5IDU5IDIxIDEwMSAxMQo0MiAxOSA5MiAxNyAxMTIgLTMgMzIgLTcgMzcgLTQwIDQ4IC0zMiAxMCAtNDYgOSAtOTUgLTcgLTMyIC0xMSAtNzQgLTI4IC05MwotMzggLTg3IC00MyAtMjMwIC0xNzkgLTI3MCAtMjU3IC0yMiAtNDIgLTQwIC01OCAtNDAgLTM1IDAgNiAtNCAxMCAtOSAxMCAtNgowIC0xMSAtMTUgLTEzIC0zMiAtMyAtMzIgLTUgLTMzIC01MCAtMzYgbC00OCAtMyAwIC02MiBjLTEgLTc5IC0xMCAtMjM4IC0xNgotMjU1IC0yIC05IC0xOSAtMTIgLTUxIC0xMCBsLTQ4IDMgNCAxNTkgMyAxNTkgLTIzIC04IGMtMzkgLTEyIC03NCAtMTEgLTczIDMKMSA2IDIgMzIgMyA1NyBsMSA0NSAxMjQgMCAxMjUgMCAtMTIgMjMgYy0yMSAzOSAtOTYgMTI4IC0xNDUgMTcxIC01OSA1MyAtMTEzCjgxIC0yMDUgMTA2IC04NCAyMyAtNzUgMjMgLTEwOSA0eiIvPgo8L2c+Cjwvc3ZnPgo=";

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
      <td style="width: 35%; padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.cpf || '<span class="placeholder-text">CPF</span>'}</td>
      <td style="width: 15%; padding: 5px; font-weight: bold;">Nome:</td>
      <td style="width: 35%; padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.nome}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Data de nascimento:</td>
      <td colspan="3" style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.data_nascimento ? new Date(selectedStudent.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">Data de nascimento</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Endereço:</td>
      <td colspan="3" style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.endereco ? `${selectedStudent.endereco}, nº ${selectedStudent.numero_endereco || '<span class="placeholder-text">número</span>'}` : '<span class="placeholder-text">Endereço completo</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Telefone:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.telefone || '<span class="placeholder-text">Telefone</span>'}</td>
      <td style="padding: 5px; font-weight: bold;">E-mail:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.email || '<span class="placeholder-text">E-mail</span>'}</td>
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

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold;">Valores do Curso e Condições de Pagamento:</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">Semestral: R$ ${planData?.valor_total ? planData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor semestral</span>'} / Mensal: R$ ${(() => {
  if (!selectedStudent?.financeiro_alunos || selectedStudent.financeiro_alunos.length === 0) {
    return financialData?.valor_plano ? financialData.valor_plano.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor mensal</span>';
  }
  
  const parcelasPlano = selectedStudent.financeiro_alunos
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
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.turma_regular?.nome || selectedStudent.turma_particular?.nome || '<span class="placeholder-text">nome da turma</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Idioma:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.idioma || '<span class="placeholder-text">idioma</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Nível:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.turma_regular?.nivel || selectedStudent.turma_particular?.nivel || '<span class="placeholder-text">nível</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Horário:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.turma_regular?.horario || selectedStudent.turma_particular?.horario || '<span class="placeholder-text">horário</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Dias da Semana:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.turma_regular?.dias_da_semana || selectedStudent.turma_particular?.dias_da_semana || '<span class="placeholder-text">dias da semana</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Tipo de Turma:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${selectedStudent.turma_regular ? 'Turma Regular' : selectedStudent.turma_particular ? 'Turma Particular' : '<span class="placeholder-text">tipo de turma</span>'}</td>
    </tr>
  </table>
</div>

<p style="text-align: justify; margin-bottom: 15px;">Por este Instrumento Particular de Contrato de Prestação de Serviços, de um lado TEEN SPEECH, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 30.857.093/0001-36, com sede na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, Guarulhos/SP, doravante denominada CONTRATADA, e, de outro lado, o(a) aluno(a) acima qualificado(a), doravante denominado(a) CONTRATANTE, têm entre si justo e contratado o seguinte:</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">1. CLÁUSULA PRIMEIRA - DA IDENTIFICAÇÃO DAS PARTES E DO OBJETO</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>1.1 CONTRATANTE:</strong> ${selectedStudent.nome}, portador(a) do CPF nº ${selectedStudent.cpf || '<span class="placeholder-text">CPF</span>'}, nascido(a) em ${selectedStudent.data_nascimento ? new Date(selectedStudent.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de nascimento</span>'}, residente e domiciliado(a) na ${selectedStudent.endereco || '<span class="placeholder-text">endereço</span>'}, nº ${selectedStudent.numero_endereco || '<span class="placeholder-text">número</span>'}, telefone ${selectedStudent.telefone || '<span class="placeholder-text">telefone</span>'}, e-mail: ${selectedStudent.email || '<span class="placeholder-text">e-mail</span>'}.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>1.2 CONTRATADA:</strong> TEEN SPEECH - ESCOLA DE IDIOMAS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 30.857.093/0001-36, com sede na cidade de Guarulhos - SP, na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, telefone (11) 4372-1271, e-mail: coordenacaotsbonsucesso@gmail.com.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>1.3 OBJETO:</strong> O presente contrato tem por objeto a prestação de serviços educacionais conforme ${selectedContract === 'contrato2' ? 'Contrato 2' : planData?.nome || 'Plano Padrão'}, na modalidade presencial/online, conforme as condições estabelecidas nas cláusulas seguintes.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">2. CLÁUSULA SEGUNDA - DA DURAÇÃO DO CURSO E CARGA HORÁRIA</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>2.1</strong> O curso conforme ${selectedContract === 'contrato2' ? 'Contrato 2' : planData?.nome || 'Plano Padrão'} terá duração de ${planData?.numero_aulas === 36 ? '6 meses' : planData?.numero_aulas === 72 ? '1 ano' : planData?.numero_aulas && planData?.frequencia_aulas ? Math.ceil(planData.numero_aulas / (planData.frequencia_aulas.toLowerCase().includes('semanal') ? 4 : planData.frequencia_aulas.toLowerCase().includes('mensal') ? 1 : 4)) + ' meses' : '<span class="placeholder-text">duração em meses</span>'}, com início em ${contractData?.data_inicio ? new Date(contractData.data_inicio).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de início</span>'} e término previsto para ${contractData?.data_fim ? new Date(contractData.data_fim).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de término</span>'}, totalizando ${planData?.numero_aulas || '<span class="placeholder-text">total de horas</span>'} horas/aula.</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>2.2</strong> As aulas serão ministradas semanalmente, com duração de ${planData?.descricao?.match(/\d+/)?.[0] || '55'} minutos cada, nos dias <span class="placeholder-text">dias da semana</span> e horários <span class="placeholder-text">horários das aulas</span>.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>2.3</strong> O cronograma das aulas poderá sofrer alterações mediante comunicação prévia de no mínimo 48 (quarenta e oito) horas.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">3. CLÁUSULA TERCEIRA - DO VALOR E FORMA DE PAGAMENTO</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>3.1</strong> O valor total do curso é de R$ ${planData?.valor_total ? planData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor total</span>'} (${planData?.valor_total ? numberToWords(planData.valor_total) : '<span class="placeholder-text">valor por extenso</span>'}) "Valor bruto sem nenhum desconto mas não é o preço a pagar".</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>3.2</strong> O pagamento será efetuado da seguinte forma:</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">${(() => {
  // Buscar valor da primeira parcela
  const getFirstParcelaValue = () => {
    if (!selectedStudent?.financeiro_alunos || selectedStudent.financeiro_alunos.length === 0) {
      return financialData?.valor_plano ? financialData.valor_plano.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor da parcela</span>';
    }
    
    const parcelasPlano = selectedStudent.financeiro_alunos
      .flatMap(f => f.parcelas_alunos || [])
      .filter(p => p.tipo_item === 'plano')
      .sort((a, b) => a.numero_parcela - b.numero_parcela);
    
    if (parcelasPlano.length > 0) {
      return parcelasPlano[0].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    
    return financialData?.valor_plano ? financialData.valor_plano.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '<span class="placeholder-text">valor da parcela</span>';
  };
  
  return financialData?.numero_parcelas_plano && financialData.numero_parcelas_plano > 1 
    ? `- Parcelado em ${financialData.numero_parcelas_plano} (${financialData.numero_parcelas_plano === 2 ? 'duas' : financialData.numero_parcelas_plano === 3 ? 'três' : financialData.numero_parcelas_plano === 4 ? 'quatro' : financialData.numero_parcelas_plano === 5 ? 'cinco' : financialData.numero_parcelas_plano === 6 ? 'seis' : 'várias'}) parcelas mensais de R$ ${getFirstParcelaValue()}` 
    : `- Pagamento mensal de R$ ${getFirstParcelaValue()}`;
})()}</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">- Vencimento: todo dia ${financialData?.data_primeiro_vencimento ? new Date(financialData.data_primeiro_vencimento).getDate() : '<span class="placeholder-text">dia do vencimento</span>'} de cada mês</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 10px;">- Primeira parcela: ${financialData?.data_primeiro_vencimento ? new Date(financialData.data_primeiro_vencimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data da primeira parcela</span>'}</p>

<p style="text-align: justify; margin-bottom: 10px;"><strong>3.3</strong> O não pagamento na data do vencimento implicará em:</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">a) Multa de 2% (dois por cento) sobre o valor da parcela;</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">b) Juros de mora de 1% (um por cento) ao mês;</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 10px;">c) Atualização monetária pelo IGPM ou índice que vier a substituí-lo.</p>

<p style="text-align: justify; margin-bottom: 15px;"><strong>3.4</strong> O atraso superior a 30 (trinta) dias no pagamento de qualquer parcela facultará à CONTRATADA a rescisão imediata do contrato, independentemente de notificação judicial ou extrajudicial.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">4. CLÁUSULA QUARTA - DAS OBRIGAÇÕES DA CONTRATADA</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>4.1</strong> Ministrar as aulas conforme cronograma estabelecido, utilizando metodologia adequada conforme ${selectedContract === 'contrato2' ? 'Contrato 2' : planData?.nome || 'Plano Padrão'}.</p>

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

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">7. CLÁUSULA SÉTIMA - DA RESCISÃO CONTRATUAL</h4>

<p style="text-align: justify; margin-bottom: 10px;"><strong>7.1</strong> O presente contrato poderá ser rescindido:</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">a) Por mútuo acordo entre as partes;</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">b) Por inadimplemento de qualquer das cláusulas contratuais;</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 10px;">c) Por iniciativa de qualquer das partes, mediante aviso prévio de 30 (trinta) dias.</p>

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

<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">a) Custas processuais e taxas judiciárias;</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">b) Despesas com notificações extrajudiciais e protestos;</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 5px;">c) Honorários advocatícios, arbitrados em 20% (vinte por cento) sobre o valor total do débito (principal, juros, multa e atualização monetária), caso seja necessária a atuação de advogado para a cobrança ou defesa dos direitos da parte contrária; e</p>
<p style="text-align: justify; margin-left: 20px; margin-bottom: 15px;">d) Outras despesas comprovadamente realizadas para a recuperação do crédito ou a defesa do cumprimento do contrato.</p>

Estando as duas partes de acordo, declaram ciência através da assinatura deste, em duas vias de igual teor.

Guarulhos, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.

Ciente e de acordo,


<div style="text-align: center; margin: 20px 0;">
  <div style="margin-bottom: 30px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <!-- Espaço para assinatura do contratante -->
    </div>
    <div>CONTRATANTE</div>
    <div>${selectedStudent.nome}</div>
    <div>CPF: ${selectedStudent.cpf || '<span class="placeholder-text">CPF</span>'}</div>
  </div>
  
  <div style="margin-bottom: 30px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <img src="${teenSpeechSignature}" alt="Assinatura Teen Speech" style="max-width: 280px; max-height: 70px;" />
    </div>
    <div>TEEN SPEECH</div>
    <div>CNPJ: 30.857.093/0001-36</div>
  </div>
</div>


TESTEMUNHAS:

<div style="display: flex; justify-content: space-between; margin-top: 30px;">
  <div style="text-align: center; width: 45%;">
    <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <img src="${testemunha1Signature}" alt="Assinatura Testemunha 1" style="max-width: 180px; max-height: 70px;" />
    </div>
    <div style="padding-top: 5px;">
        Testemunha 1<br/>
        CPF: 567.641.218-69
      </div>
    </div>
    <div style="text-align: center; width: 45%;">
      <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
        <img src="${testemunha2Signature}" alt="Assinatura Testemunha 2" style="max-width: 180px; max-height: 70px;" />
      </div>
      <div style="padding-top: 5px;">
        Testemunha 2<br/>
        RG: 34.537.017-X
      </div>
    </div>
  </div>
      </div>
    `;
  };

  const handleEdit = () => {
    if (!selectedStudent) return;
    
    // Usar o conteúdo HTML formatado do contrato original - todo o texto será editável
    const currentContent = savedContent || generateContractContent();
    setEditableContent(currentContent);
    setIsEditing(true);
  };

  const generateEditableContractContent = () => {
    if (!selectedStudent) return '';
    
    let content = generateContractContent();
    
    // Substituir underscores por inputs editáveis
    content = content.replace(/_________________________/g, '<input type="text" style="border: none; border-bottom: 1px solid #000; background: transparent; width: 200px; font-family: inherit; font-size: inherit;" placeholder="Preencher..." />');
    content = content.replace(/_____/g, '<input type="text" style="border: none; border-bottom: 1px solid #000; background: transparent; width: 60px; font-family: inherit; font-size: inherit;" placeholder="..." />');
    content = content.replace(/___\.___.___-__/g, '<input type="text" style="border: none; border-bottom: 1px solid #000; background: transparent; width: 120px; font-family: inherit; font-size: inherit;" placeholder="000.000.000-00" />');
    content = content.replace(/___\/___\/_____/g, '<input type="date" style="border: none; border-bottom: 1px solid #000; background: transparent; width: 120px; font-family: inherit; font-size: inherit;" />');
    content = content.replace(/\(___\) _____-____/g, '<input type="tel" style="border: none; border-bottom: 1px solid #000; background: transparent; width: 140px; font-family: inherit; font-size: inherit;" placeholder="(11) 99999-9999" />');
    content = content.replace(/____/g, '<input type="text" style="border: none; border-bottom: 1px solid #000; background: transparent; width: 50px; font-family: inherit; font-size: inherit;" placeholder="..." />');
    
    return content;
  };

  const handleSave = () => {
    setSavedContent(editableContent);
    setIsEditing(false);
    toast({
      title: "Contrato salvo",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handlePrint = async () => {
    if (!selectedStudent) return;
    
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
      const fileName = `Contrato_${selectedStudent.nome.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
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
            <title>Contrato - ${selectedStudent.nome}</title>
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableContent('');
    // Não limpa o savedContent para manter as alterações salvas anteriormente
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerador de Contratos</h1>
          <div className="flex gap-2">
            {selectedStudent && !isEditing && (
              <Button 
                onClick={handleEdit}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
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
            <Button 
              onClick={handlePrint}
              disabled={!selectedStudent}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
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
              {/* Filtro por plano */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <label className="text-sm font-medium mb-2 block text-blue-800">
                    Filtrar por plano:
                  </label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos os planos" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="all">Todos os planos</SelectItem>
                       {plans.map((plan) => (
                         <SelectItem key={plan.id} value={plan.nome}>
                           {plan.nome}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="w-1/2">
                <label className="text-sm font-medium mb-2 block">
                  Pesquisar por nome:
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedStudent
                        ? `${selectedStudent.nome} - ${selectedStudent.idioma}${selectedStudent.turma_regular?.nome || selectedStudent.turma_particular?.nome ? ` (${selectedStudent.turma_regular?.nome || selectedStudent.turma_particular?.nome})` : ''}`
                        : "Digite o nome do aluno..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Buscar aluno..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value=""
                            onSelect={() => {
                              setSelectedStudent(null);
                              localStorage.removeItem('selectedStudent');
                              setSelectedContract('');
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !selectedStudent ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Sem aluno selecionado
                          </CommandItem>
                          {students.map(student => (
                            <CommandItem
                              key={student.id}
                              value={student.nome}
                              onSelect={() => {
                                setSelectedStudent(student);
                                localStorage.setItem('selectedStudent', JSON.stringify(student));
                                setSelectedContract('contrato1');
                                setOpen(false);
                              }}
                            >
                              <div className="flex items-center w-full">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedStudent?.id === student.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{student.nome} - {student.idioma}</div>
                                  {(student.turma_regular?.nome || student.turma_particular?.nome) && (
                                    <div className="text-sm text-gray-500">Turma: {student.turma_regular?.nome || student.turma_particular?.nome}</div>
                                  )}
                                  {student.cpf && (
                                    <div className="text-sm text-gray-500">CPF: {student.cpf}</div>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedStudent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Aluno Selecionado:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span> {selectedStudent.nome}
                    </div>
                    <div>
                      <span className="font-medium">CPF:</span> {selectedStudent.cpf || 'Não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Idioma:</span> {selectedStudent.idioma}
                    </div>
                    <div>
                      <span className="font-medium">Turma:</span> {selectedStudent.turma_regular?.nome || selectedStudent.turma_particular?.nome || 'Não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedStudent.status}
                    </div>
                    <div>
                      <span className="font-medium">Responsável:</span> {selectedStudent.responsaveis?.nome || 'Não informado'}
                    </div>
                  </div>
                  

                  
                  {/* Informações dos Planos Disponíveis */}
                  {selectedStudent.financeiro_alunos && selectedStudent.financeiro_alunos.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold mb-2 text-gray-800">Todos os Planos Associados:</h4>
                      {selectedStudent.financeiro_alunos.map((financeiro, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2 text-sm">
                          {financeiro.planos && (
                            <>
                              <div>
                                <span className="font-medium">Nome do Plano:</span> {financeiro.planos.nome}
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
                                <span className="font-medium">Parcelas:</span> {financeiro.numero_parcelas_plano || 'Não informado'}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(!selectedStudent.financeiro_alunos || selectedStudent.financeiro_alunos.length === 0) && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 text-sm">
                        <span className="font-medium">Atenção:</span> Este aluno não possui plano financeiro associado.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Tipo de Contrato */}
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Contrato</CardTitle>
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
                  onClick={() => navigate('/contract-generator-2')}
                >
                  Contrato de pretação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Contrato Gerado */}
        {selectedStudent && (
          <Card>
            <CardHeader>
              <CardTitle>Contrato Gerado</CardTitle>
            </CardHeader>
            <CardContent>
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
                    
                    // Salvar posição do scroll antes da edição
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                    
                    // Salvar posição do cursor
                    const range = selection?.getRangeAt(0);
                    const startOffset = range?.startOffset;
                    const startContainer = range?.startContainer;
                    
                    // Atualizar conteúdo
                    setEditableContent(e.currentTarget.innerHTML);
                    
                    // Restaurar posição do cursor e scroll após o próximo render
                    setTimeout(() => {
                      // Restaurar scroll para a posição original
                      window.scrollTo(scrollLeft, scrollTop);
                      
                      if (selection && startContainer && typeof startOffset === 'number' && editableRef.current) {
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
                              selection.removeAllRanges();
                              selection.addRange(newRange);
                              found = true;
                              break;
                            }
                          }
                          
                          // Se não encontrou o nó exato, posicionar no final do conteúdo
                          if (!found) {
                            newRange.selectNodeContents(editableRef.current);
                            newRange.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
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
                  onFocus={() => {
                    // Prevenir scroll automático ao focar
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                    setTimeout(() => {
                      window.scrollTo(scrollLeft, scrollTop);
                    }, 0);
                  }}
                  suppressContentEditableWarning={true}
                />
              ) : (
                savedContent ? (
                  <div id="contract-content" className="contract-preview whitespace-pre-wrap text-sm p-4 border rounded-lg bg-white" style={{ fontFamily: 'Garamond, serif', fontSize: '14pt', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: savedContent }}>
                  </div>
                ) : (
                  <div id="contract-content" className="contract-preview whitespace-pre-wrap text-sm p-4 border rounded-lg bg-white" style={{ fontFamily: 'Garamond, serif', fontSize: '14pt', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: generateContractContent() }}>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContractGenerator;