import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Download, Edit, Save, X, User, CreditCard, FileCheck, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { numberToWords, formatCPF, formatCEP } from '@/utils/formatters';
import teenSpeechSignature from '@/assets/signatures/teen-speech-assinatura.png';
import testemunha1Signature from '@/assets/signatures/testemunha1.png';
import testemunha2Signature from '@/assets/signatures/testemunha2.png';
import '@/pages/app/contract-styles.css';

// Função para converter imagem em base64
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

type StudentContractGeneratorModalProps = { isOpen: boolean; onClose: () => void; student: any };
const StudentContractGeneratorModal: React.FC<StudentContractGeneratorModalProps> = ({ isOpen, onClose, student }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [savedContent, setSavedContent] = useState<string>('');
  const [editableContent, setEditableContent] = useState<string>('');
  const [selectedContract, setSelectedContract] = useState<string>('contrato1');
  const editableRef = useRef<HTMLDivElement>(null);
  const [contratanteResponsavel, setContratanteResponsavel] = useState<boolean>(false);
  const [signatureImages, setSignatureImages] = useState({
    teenSpeech: '',
    testemunha1: '',
    testemunha2: ''
  });
  useEffect(() => {
    if (student?.data_nascimento) {
      const age = calculateAge(student.data_nascimento);
      setContratanteResponsavel(age < 18);
    } else {
      setContratanteResponsavel(false);
    }
  }, [student, isOpen]);

  // Carregar imagens em base64
  useEffect(() => {
    const loadSignatureImages = async () => {
      try {
        const [teenSpeech, testemunha1, testemunha2] = await Promise.all([
          imageToBase64(teenSpeechSignature),
          imageToBase64(testemunha1Signature),
          imageToBase64(testemunha2Signature)
        ]);
        
        setSignatureImages({
          teenSpeech,
          testemunha1,
          testemunha2
        });
      } catch (error) {
        console.error('Erro ao carregar imagens de assinatura:', error);
        // Fallback: usar os caminhos originais se a conversão falhar
        setSignatureImages({
          teenSpeech: teenSpeechSignature,
          testemunha1: testemunha1Signature,
          testemunha2: testemunha2Signature
        });
      }
    };

    if (isOpen) {
      loadSignatureImages();
    }
  }, [isOpen]);
  const planData = (student as any)?.planData || (student as any)?.plano || null;
  const financialData = (student as any)?.financialData || (student as any)?.financeiro || null;
  const contractData = (student as any)?.contractData || null;

  // Planos particulares dinâmicos
  const [particularPlans, setParticularPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        const { data, error } = await supabase
          .from('planos')
          .select('id, nome, valor_total, valor_por_aula, numero_aulas, descricao, observacoes, tipo_valor, idioma, ativo')
          .eq('idioma', 'particular')
          .eq('ativo', true)
          .order('nome');
        if (error) throw error;
        setParticularPlans(data || []);
      } catch (err) {
        console.error('Erro ao buscar planos particulares:', err);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os planos particulares.',
          variant: 'destructive',
        });
      } finally {
        setLoadingPlans(false);
      }
    };
    if (isOpen) loadPlans();
  }, [isOpen]);

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

  const shouldShowResponsavelSection = (): boolean => {
    if (!student?.data_nascimento) return true;
    const age = calculateAge(student.data_nascimento);
    const hasResponsavel = student?.responsaveis?.nome;
    if (age < 18) return true;
    if (age >= 18 && hasResponsavel) return true;
    return false;
  };

  const generateContractContent = () => {
    if (!student) {
      return `<div style="padding: 10px;">Selecione um aluno para gerar o contrato.</div>`;
    }
    const logoBase64 = selectedContract === 'contrato_particulares' ? '/logo_tsschool.jpg.png' : '/ts-logo.svg';
     const year = new Date().getFullYear();
     const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
     const today = new Date();
     const day = today.getDate();
     const currentDateText = `Guarulhos/SP, ${day} de ${monthNames[today.getMonth()]} de ${year}.`;
    // Dados do aluno para o parágrafo do CONTRATANTE
    const nomeAluno = student?.nome || '';
    const nacionalidade = student?.nacionalidade || '';
    const profissao = student?.profissao || '';
    const cpfFmt = student?.cpf ? formatCPF(student.cpf) : '';
    const enderecoBase = student?.endereco || '';
    const numeroEndereco = student?.numero_endereco || student?.numero || '';
    const bairro = student?.bairro || '';
    const cidade = student?.cidade || '';
    const estado = student?.estado || '';
    const cepFmt = student?.cep ? formatCEP(student.cep) : '';
    const cidadeEstado = cidade && estado ? `${cidade}/${estado}` : '';
    const enderecoTexto = [enderecoBase, bairro].filter(Boolean).join(', ');
    // Lógica de menor e dados do responsável
    const isMinor = student?.data_nascimento ? calculateAge(student.data_nascimento) < 18 : false;
    const nomeResponsavel = student?.responsaveis?.nome || '';
    const cpfResponsavelFmt = student?.responsaveis?.cpf ? formatCPF(student.responsaveis.cpf) : '';
    const enderecoResponsavelBase = student?.responsaveis?.endereco || '';
    const numeroEnderecoResponsavel = student?.responsaveis?.numero_endereco || '';
    const enderecoResponsavelTexto = [enderecoResponsavelBase].filter(Boolean).join(', ');
    const nacionalidadeResponsavel = '';
    const profissaoResponsavel = '';
    const cepResponsavelFmt = student?.responsaveis?.cep ? formatCEP(student.responsaveis.cep) : '';
    const cidadeEstadoResponsavel = (student?.responsaveis?.cidade && student?.responsaveis?.estado)
      ? `${student.responsaveis.cidade}/${student.responsaveis.estado}`
      : '';
    const isContratanteResponsavel = contratanteResponsavel;
  const getContractTitle = () => {
    if (planData?.numero_aulas === 36) return 'Contrato Semestral';
    if (planData?.numero_aulas === 72) return 'Contrato Anual';
    return 'Contrato de Prestação de Serviços Educacionais';
  };
  const generateResponsavelSection = () => '';
  // Turma atual do aluno: prioriza regular, depois particular
  const turmaAtual = student?.turma_regular || student?.turma_particular || null;
  const turmaTipo = student?.turma_regular ? 'Turma Regular' : student?.turma_particular ? 'Turma Particular' : null;
  // Idioma do contrato: prioriza idioma_contrato, depois idioma da turma, depois idioma do aluno/plano; evita o valor 'particular'
  const idiomaContrato = (() => {
    const candidates = [contractData?.idioma_contrato, turmaAtual?.idioma, student?.idioma, planData?.idioma] as (string | null | undefined)[];
    const idiomaValido = candidates.find((i) => i && i !== 'particular');
    return (idiomaValido as string) || 'Inglês';
  })();
  // Obtém valores diretamente de alunos_financeiro (sem usar tipo_item em parcelas)
  const financeiroSelecionado = (() => {
    const list = student?.alunos_financeiro || student?.financeiro_alunos || null;
    if (Array.isArray(list) && list.length > 0) {
      const byPlan = planData?.id ? list.find((f: any) => f?.planos?.id === planData?.id || f?.plano_id === planData?.id) : null;
      return byPlan || list[0];
    }
    return (student as any)?.financialData || (student as any)?.financeiro || null;
  })();
  const parseNum = (v: any): number => {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? '0').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };
  // Fallbacks robustos e cálculo do total do plano
  const valorPlanoMensal = parseNum(financeiroSelecionado?.valor_plano ?? 0);
  const valorMaterial = parseNum(financeiroSelecionado?.valor_material ?? 0);
  const valorMatricula = parseNum(financeiroSelecionado?.valor_matricula ?? 0);
  const descontoTotal = parseNum(financeiroSelecionado?.desconto_total ?? 0);
  const valorTotalRaw = parseNum(financeiroSelecionado?.valor_total ?? 0);

  const parcelas = Array.isArray(financeiroSelecionado?.parcelas_alunos) ? financeiroSelecionado?.parcelas_alunos : [];
  const totalParcelasPlano = parcelas.reduce((sum: number, p: any) => sum + parseNum(p?.valor), 0);
  const numeroParcelasPlano = parseNum(financeiroSelecionado?.numero_parcelas_plano ?? 0);

  const valorPlanoTotalCalculado = totalParcelasPlano > 0
    ? totalParcelasPlano
    : ((valorPlanoMensal > 0 && numeroParcelasPlano > 0)
        ? valorPlanoMensal * numeroParcelasPlano
        : parseNum(planData?.valor_total ?? 0));

  const valorTotalCurso = valorTotalRaw > 0
    ? valorTotalRaw
    : ((valorPlanoTotalCalculado + valorMaterial + valorMatricula - descontoTotal) > 0
        ? (valorPlanoTotalCalculado + valorMaterial + valorMatricula - descontoTotal)
        : parseNum(planData?.valor_total ?? 0));

  const formatCurrency = (value: number) => parseNum(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const numeroAulas = planData?.numero_aulas as number | undefined;
  const valorPorAula = (() => {
    const aulasTotal = (numeroAulas && numeroAulas > 0) ? numeroAulas : 36;
    const base = valorPlanoTotalCalculado > 0 ? valorPlanoTotalCalculado : parseNum(planData?.valor_total ?? 0);
    return (aulasTotal > 0 && base > 0) ? (base / aulasTotal) : 0;
  })();
  const semestreInfoHtml = (() => {
    const basePlano = valorPlanoTotalCalculado > 0 ? valorPlanoTotalCalculado : parseNum(planData?.valor_total ?? 0);
    if (numeroAulas === 72 && basePlano > 0) {
      const metade = basePlano / 2;
      return `Semestre 1: R$ ${formatCurrency(metade)} / Semestre 2: R$ ${formatCurrency(metade)}`;
    }
    return `Semestre: R$ ${formatCurrency(basePlano)}`;
  })();
  const aulasPagas = parseNum(financeiroSelecionado?.aulas_pagas ?? 0);
  const aulasGratis = (typeof numeroAulas === 'number' && numeroAulas > 0) ? Math.max(0, numeroAulas - aulasPagas) : 0;

  // Tabela dinâmica de planos particulares
  const plansTableHtml = (() => {
    const year = new Date().getFullYear();
    const rows = (particularPlans || []).map((p: any) => {
      const valorTotal = (() => {
        const vt = parseNum(p?.valor_total ?? 0);
        if (vt > 0) return vt;
        const vpa = parseNum(p?.valor_por_aula ?? 0);
        const aulas = parseNum(p?.numero_aulas ?? 0);
        if (vpa > 0 && aulas > 0) return vpa * aulas;
        return vpa > 0 ? vpa : 0;
      })();
      const valorLabel = (() => {
        if (parseNum(p?.valor_total ?? 0) > 0) return `R$ ${formatCurrency(valorTotal)}`;
        const vpa = parseNum(p?.valor_por_aula ?? 0);
        const aulas = parseNum(p?.numero_aulas ?? 0);
        if (vpa > 0 && aulas > 0) return `R$ ${formatCurrency(valorTotal)}`;
        if (vpa > 0) return `R$ ${formatCurrency(vpa)} por aula`;
        return `R$ ${formatCurrency(0)}`;
      })();
      const descricao = [p?.descricao, p?.observacoes].filter(Boolean).join('<br />') || 'Plano particular';
      return `
           <tr>
             <td style="padding:8px; border:1px solid #666;">${p?.nome || ''}</td>
             <td style="padding:8px; border:1px solid #666;">${valorLabel}</td>
             <td style="padding:8px; border:1px solid #666;">${descricao}</td>
           </tr>`;
    }).join('');
    const tbody = rows || `<tr><td colspan="3" style="padding:8px; border:1px solid #666; text-align:center;">Nenhum plano encontrado</td></tr>`;
    return `
       <h4 style="text-align: center; margin: 24px 0; font-size: 14px; font-weight: bold;">ANEXO I - TABELA DE \"AULAS PARTICULARES ${year}\"</h4>
       <table style=\"width: 100%; border-collapse: collapse; font-size: 12px;\">
         <thead>
           <tr>
             <th style=\"background:#333; color:#fff; padding:8px; border:1px solid #666; text-align:left;\">PLANO</th>
             <th style=\"background:#333; color:#fff; padding:8px; border:1px solid #666; text-align:left;\">VALOR</th>
             <th style=\"background:#333; color:#fff; padding:8px; border:1px solid #666; text-align:left;\">DESCRIÇÃO</th>
           </tr>
         </thead>
         <tbody>
           ${tbody}
         </tbody>
       </table>`;
  })();

  // Forma de pagamento e parcelas (plano, material, matrícula)
  const numeroParcelasMaterial = parseNum(financeiroSelecionado?.numero_parcelas_material ?? 0);
  const numeroParcelasMatricula = parseNum(financeiroSelecionado?.numero_parcelas_matricula ?? 0);
  const formaPagamentoPlano = (financeiroSelecionado?.forma_pagamento_plano as string) || '';
  const formaPagamentoMaterial = (financeiroSelecionado?.forma_pagamento_material as string) || '';
  const formaPagamentoMatricula = (financeiroSelecionado?.forma_pagamento_matricula as string) || '';
  const valorParcelaMaterial = (numeroParcelasMaterial > 0 && valorMaterial > 0) ? (valorMaterial / numeroParcelasMaterial) : 0;
  const valorParcelaMatricula = (numeroParcelasMatricula > 0 && valorMatricula > 0) ? (valorMatricula / numeroParcelasMatricula) : 0;

  const displayFormaPagamento = (raw?: string) => {
    const s = (raw ?? '').toString().trim();
    if (!s) return '';
    const lower = s.toLowerCase();
    if (lower === 'cartao_credito') return 'cartao credito';
    return s.replace(/_/g, ' ');
  };

  const partesPagamento: string[] = [];
  if (numeroParcelasPlano > 0 && valorPlanoMensal > 0) {
    partesPagamento.push(`${numeroParcelasPlano}x de R$ ${formatCurrency(valorPlanoMensal)} no ${displayFormaPagamento(formaPagamentoPlano) || '<span class="placeholder-text">forma de pagamento</span>'}`);
  }
  if (numeroParcelasMaterial > 0 && valorParcelaMaterial > 0) {
    partesPagamento.push(`${numeroParcelasMaterial}x de R$ ${formatCurrency(valorParcelaMaterial)} no ${displayFormaPagamento(formaPagamentoMaterial) || '<span class="placeholder-text">forma de pagamento</span>'}`);
  }
  if (numeroParcelasMatricula > 0 && valorParcelaMatricula > 0) {
    partesPagamento.push(`${numeroParcelasMatricula}x de R$ ${formatCurrency(valorParcelaMatricula)} no ${displayFormaPagamento(formaPagamentoMatricula) || '<span class="placeholder-text">forma de pagamento</span>'}`);
  } else if (valorMatricula > 0) {
    partesPagamento.push(`valor da matrícula de R$ ${formatCurrency(valorMatricula)}`);
  }
  const resumoFormaPagamento = partesPagamento.length > 0 ? partesPagamento.join(' + ') : '<span class="placeholder-text">forma de pagamento e parcelas</span>';

  // Cronograma de Aulas - baseado em data_inicio, data_fim e dias_da_semana da turma
  const cronogramaHtml = (() => {
    const startStr = (turmaAtual as any)?.data_inicio || contractData?.data_inicio || null;
    const endStr = (turmaAtual as any)?.data_fim || contractData?.data_fim || null;
    const diasStr = turmaAtual?.dias_da_semana || student?.turma_regular?.dias_da_semana || student?.turma_particular?.dias_da_semana || '';

    const normalize = (s: string) => s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    const sNorm = normalize(String(diasStr || ''));

    // Extrai dias da semana presentes na string (suporta "segunda a sexta" e abreviações: seg, ter, qua, qui, sex, sab, dom)
    let diasIndices: number[] = [];
    const pushUnique = (n: number) => { if (!diasIndices.includes(n)) diasIndices.push(n); };

    const hasSeg = sNorm.includes('segunda') || sNorm.includes('seg');
    const hasSex = sNorm.includes('sexta') || sNorm.includes('sex');
    const hasRange = sNorm.includes(' a ') || sNorm.includes(' ate ') || sNorm.includes('ate') || sNorm.includes(' - ') || sNorm.includes('-') || sNorm.includes(' à ');

    if (hasSeg && hasSex && hasRange) {
      diasIndices = [1,2,3,4,5];
    } else {
      if (sNorm.includes('domingo') || sNorm.includes('dom')) pushUnique(0);
      if (hasSeg) pushUnique(1);
      if (sNorm.includes('terca') || sNorm.includes('ter') || sNorm.includes('terça')) pushUnique(2);
      if (sNorm.includes('quarta') || sNorm.includes('qua')) pushUnique(3);
      if (sNorm.includes('quinta') || sNorm.includes('qui')) pushUnique(4);
      if (hasSex) pushUnique(5);
      if (sNorm.includes('sabado') || sNorm.includes('sab') || sNorm.includes('sábado')) pushUnique(6);
    }

    const startDate = startStr ? new Date(startStr) : null;
    const endDate = endStr ? new Date(endStr) : null;
    if (!startDate || diasIndices.length === 0) return '';

    const fmtBR = (d: Date) => d.toLocaleDateString('pt-BR');
    const matches: string[] = [];
    const totalAulasTurma = (turmaAtual as any)?.total_aulas;
    const isPlanoAnual = Number(numeroAulas) === 72;
    const isPlano36 = Number(numeroAulas) === 36;
    const maxLessons = isPlanoAnual
      ? 36
      : ((typeof totalAulasTurma === 'number' && totalAulasTurma > 0)
          ? totalAulasTurma
          : (endDate ? Infinity : (typeof numeroAulas === 'number' && numeroAulas > 0 ? numeroAulas : 36)));
    const targetCount = isPlano36 ? Math.floor(36 / 2) : maxLessons;
    const daySet = new Set(diasIndices);
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    const isVacationMonth = (m: number) => m === 0 || m === 6; // Janeiro (0) e Julho (6)
    const jumpToNextNonVacationMonth = (d: Date) => {
      let m = d.getMonth();
      while (isVacationMonth(m)) {
        d.setMonth(m + 1, 1); // vai para o primeiro dia do próximo mês
        m = d.getMonth();
      }
    };

    // Se começar em mês de férias, pula imediatamente
    jumpToNextNonVacationMonth(current);

    while (matches.length < targetCount) {
      if (!isPlanoAnual && endDate && current.getTime() > endDate.getTime()) break;

      // Quando cair em mês de férias, pula direto para o próximo mês permitido
      if (isVacationMonth(current.getMonth())) {
        jumpToNextNonVacationMonth(current);
        continue;
      }

      if (daySet.has(current.getDay())) {
        matches.push(fmtBR(current));
      }
      current.setDate(current.getDate() + 1);
      if (!endDate && matches.length >= targetCount) break;
    }

    if (matches.length === 0) return '';

    const mid = Math.ceil(matches.length / 2);
    const left = matches.slice(0, mid);
    const right = matches.slice(mid);

    const header = '<tr><td style="width: 25%; padding: 5px; border: 1px solid #000; font-weight: bold; text-align: center;">Aula nº</td><td style="width: 75%; padding: 5px; border: 1px solid #000; font-weight: bold; text-align: center;">Data Estimada</td></tr>';
    const makePairLabel = (index: number) => ((index * 2 + 1) + '–' + (index * 2 + 2));
    const leftRows = left.map((date, i) => '<tr><td style="padding: 5px; border: 1px solid #000; text-align: center;">' + (isPlano36 ? makePairLabel(i) : (i+1)) + '</td><td style="padding: 5px; border: 1px solid #000;">' + date + '</td></tr>').join('');
    const rightRows = right.map((date, i) => '<tr><td style="padding: 5px; border: 1px solid #000; text-align: center;">' + (isPlano36 ? makePairLabel(mid + i) : (mid+i+1)) + '</td><td style="padding: 5px; border: 1px solid #000;">' + date + '</td></tr>').join('');

    return '<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">'
      + '<h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">CRONOGRAMA DE AULAS</h4>'
      + '<div style="display: flex; gap: 12px;">'
        + '<table style="width: 50%; border-collapse: collapse;">' + header + leftRows + '</table>'
        + '<table style="width: 50%; border-collapse: collapse;">' + header + rightRows + '</table>'
      + '</div>'
      + '<div style="font-size: 10px; text-align: center; margin-top: 6px;">As datas podem sofrer alterações devido a feriados ou ajustes pedagógicos. A tabela mostra no máximo ' + (isPlano36 ? 36 : maxLessons) + ' aulas.' + (isPlano36 ? ' Cada encontro equivale a 2 aulas.' : '') + ' Não inclui meses de férias (Janeiro e Julho); semestres: Fev–Jun e Ago–Dez.</div>'
    + '</div>';
  })();

  const cronogramaHtmlAno = (() => {
    if (Number(numeroAulas) !== 72) return '';
    const startStr = (turmaAtual as any)?.data_inicio || contractData?.data_inicio || null;
    const endStr = (turmaAtual as any)?.data_fim || contractData?.data_fim || null;
    const diasStr = turmaAtual?.dias_da_semana || student?.turma_regular?.dias_da_semana || student?.turma_particular?.dias_da_semana || '';

    const normalize = (s: string) => s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    const sNorm = normalize(String(diasStr || ''));

    let diasIndices: number[] = [];
    const pushUnique = (n: number) => { if (!diasIndices.includes(n)) diasIndices.push(n); };

    const hasSeg = sNorm.includes('segunda') || sNorm.includes('seg');
    const hasSex = sNorm.includes('sexta') || sNorm.includes('sex');
    const hasRange = sNorm.includes(' a ') || sNorm.includes(' ate ') || sNorm.includes('ate') || sNorm.includes(' - ') || sNorm.includes('-') || sNorm.includes(' à ');

    if (hasSeg && hasSex && hasRange) {
      diasIndices = [1,2,3,4,5];
    } else {
      if (sNorm.includes('domingo') || sNorm.includes('dom')) pushUnique(0);
      if (hasSeg) pushUnique(1);
      if (sNorm.includes('terca') || sNorm.includes('ter') || sNorm.includes('terça')) pushUnique(2);
      if (sNorm.includes('quarta') || sNorm.includes('qua')) pushUnique(3);
      if (sNorm.includes('quinta') || sNorm.includes('qui')) pushUnique(4);
      if (hasSex) pushUnique(5);
      if (sNorm.includes('sabado') || sNorm.includes('sab') || sNorm.includes('sábado')) pushUnique(6);
    }

    const startDate = startStr ? new Date(startStr) : null;
    if (!startDate || diasIndices.length === 0) return '';

    const fmtBR = (d: Date) => d.toLocaleDateString('pt-BR');
    const matches: string[] = [];
    const maxLessons = 72;
    const daySet = new Set(diasIndices);

    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    const isVacationMonth = (m: number) => m === 0 || m === 6; // Janeiro (0) e Julho (6)
    const jumpToNextNonVacationMonth = (d: Date) => {
      let m = d.getMonth();
      while (isVacationMonth(m)) {
        d.setMonth(m + 1, 1); // vai para o primeiro dia do próximo mês
        m = d.getMonth();
      }
    };

    jumpToNextNonVacationMonth(current);

    while (matches.length < maxLessons) {
      if (isVacationMonth(current.getMonth())) {
        jumpToNextNonVacationMonth(current);
        continue;
      }
      if (daySet.has(current.getDay())) {
        matches.push(fmtBR(current));
      }
      current.setDate(current.getDate() + 1);
    }

    if (matches.length === 0) return '';

    const mid = Math.ceil(matches.length / 2);
    const left = matches.slice(0, mid);
    const right = matches.slice(mid);

    const header = '<tr><td style="width: 25%; padding: 5px; border: 1px solid #000; font-weight: bold; text-align: center;">Aula nº</td><td style="width: 75%; padding: 5px; border: 1px solid #000; font-weight: bold; text-align: center;">Data Estimada</td></tr>';
    const makePairLabel = (index: number) => ((index * 2 + 1) + '–' + (index * 2 + 2));
    const leftRows = left.map((date, i) => '<tr><td style="padding: 5px; border: 1px solid #000; text-align: center;">' + makePairLabel(i) + '</td><td style="padding: 5px; border: 1px solid #000;">' + date + '</td></tr>').join('');
    const rightRows = right.map((date, i) => '<tr><td style="padding: 5px; border: 1px solid #000; text-align: center;">' + makePairLabel(mid + i) + '</td><td style="padding: 5px; border: 1px solid #000;">' + date + '</td></tr>').join('');

    return '<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">'
      + '<h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">CRONOGRAMA DE AULAS - ANO COMPLETO</h4>'
      + '<div style="display: flex; gap: 12px;">'
        + '<table style="width: 50%; border-collapse: collapse;">' + header + leftRows + '</table>'
        + '<table style="width: 50%; border-collapse: collapse;">' + header + rightRows + '</table>'
      + '</div>'
      + '<div style="font-size: 10px; text-align: center; margin-top: 6px;">As datas podem sofrer alterações devido a feriados ou ajustes pedagógicos. A tabela mostra no máximo ' + maxLessons + ' aulas. Não inclui meses de férias (Janeiro e Julho); semestres: Fev–Jun e Ago–Dez.</div>'
    + '</div>';
  })();

  const cronogramaHtmlSemestre = (() => {
    if (Number(numeroAulas) !== 72) return '';
    const startStr = (turmaAtual as any)?.data_inicio || contractData?.data_inicio || null;
    const endStr = (turmaAtual as any)?.data_fim || contractData?.data_fim || null;
    const diasStr = turmaAtual?.dias_da_semana || student?.turma_regular?.dias_da_semana || student?.turma_particular?.dias_da_semana || '';

    const normalize = (s: string) => s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    const sNorm = normalize(String(diasStr || ''));

    let diasIndices: number[] = [];
    const pushUnique = (n: number) => { if (!diasIndices.includes(n)) diasIndices.push(n); };

    const hasSeg = sNorm.includes('segunda') || sNorm.includes('seg');
    const hasSex = sNorm.includes('sexta') || sNorm.includes('sex');
    const hasRange = sNorm.includes(' a ') || sNorm.includes(' ate ') || sNorm.includes('ate') || sNorm.includes(' - ') || sNorm.includes('-') || sNorm.includes(' à ');

    if (hasSeg && hasSex && hasRange) {
      diasIndices = [1,2,3,4,5];
    } else {
      if (sNorm.includes('domingo') || sNorm.includes('dom')) pushUnique(0);
      if (hasSeg) pushUnique(1);
      if (sNorm.includes('terca') || sNorm.includes('ter') || sNorm.includes('terça')) pushUnique(2);
      if (sNorm.includes('quarta') || sNorm.includes('qua')) pushUnique(3);
      if (sNorm.includes('quinta') || sNorm.includes('qui')) pushUnique(4);
      if (hasSex) pushUnique(5);
      if (sNorm.includes('sabado') || sNorm.includes('sab') || sNorm.includes('sábado')) pushUnique(6);
    }

    const startDate = startStr ? new Date(startStr) : null;
    const endDate = endStr ? new Date(endStr) : null;
    if (!startDate || diasIndices.length === 0) return '';

    const fmtBR = (d: Date) => d.toLocaleDateString('pt-BR');
    const matches: string[] = [];
    const lessonsPerMeeting = 2;
    const maxMeetings = Math.floor(36 / lessonsPerMeeting); // 18 encontros para 36 aulas
    const daySet = new Set(diasIndices);

    const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    const isVacationMonth = (m: number) => m === 0 || m === 6; // Janeiro (0) e Julho (6)
    const jumpToNextNonVacationMonth = (d: Date) => {
      let m = d.getMonth();
      while (isVacationMonth(m)) {
        d.setMonth(m + 1, 1);
        m = d.getMonth();
      }
    };

    jumpToNextNonVacationMonth(current);

    while (matches.length < maxMeetings) {
      if (isVacationMonth(current.getMonth())) {
        jumpToNextNonVacationMonth(current);
        continue;
      }
      if (endDate && current > endDate) break;
      if (daySet.has(current.getDay())) {
        matches.push(fmtBR(current));
      }
      current.setDate(current.getDate() + 1);
    }

    if (matches.length === 0) return '';

    const mid = Math.ceil(matches.length / 2);
    const left = matches.slice(0, mid);
    const right = matches.slice(mid);

    const header = '<tr><td style="width: 25%; padding: 5px; border: 1px solid #000; font-weight: bold; text-align: center;">Aula nº</td><td style="width: 75%; padding: 5px; border: 1px solid #000; font-weight: bold; text-align: center;">Data Estimada</td></tr>';
    const leftRows = left.map((date, i) => '<tr><td style="padding: 5px; border: 1px solid #000; text-align: center;">' + (i+1) + '</td><td style="padding: 5px; border: 1px solid #000;">' + date + '</td></tr>').join('');
    const rightRows = right.map((date, i) => '<tr><td style="padding: 5px; border: 1px solid #000; text-align: center;">' + (mid+i+1) + '</td><td style="padding: 5px; border: 1px solid #000;">' + date + '</td></tr>').join('');

    return '<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">'
      + '<h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">CRONOGRAMA DE AULAS - TURMA - 1º SEMESTRE</h4>'
      + '<div style="display: flex; gap: 12px;">'
        + '<table style="width: 50%; border-collapse: collapse;">' + header + leftRows + '</table>'
        + '<table style="width: 50%; border-collapse: collapse;">' + header + rightRows + '</table>'
      + '</div>'
      + '<div style="font-size: 10px; text-align: center; margin-top: 6px;">Exibe 18 encontros (36 aulas). Cada encontro equivale a 2 aulas. Não inclui meses de férias (Janeiro e Julho); semestres: Fev–Jun e Ago–Dez.</div>'
    + '</div>';
  })();

  const turmaTotalAulas = (turmaAtual as any)?.total_aulas;
  const sDate = (turmaAtual as any)?.data_inicio || contractData?.data_inicio || null;
  const eDate = (turmaAtual as any)?.data_fim || contractData?.data_fim || null;
  const isSameSemester = (s: Date, e: Date) => {
    const mS = s.getMonth();
    const mE = e.getMonth();
    const inFirst = (m: number) => m >= 1 && m <= 5; // Fev–Jun
    const inSecond = (m: number) => m >= 7 && m <= 11; // Ago–Dez
    return (inFirst(mS) && inFirst(mE)) || (inSecond(mS) && inSecond(mE));
  };

  const showSemestre = Number(numeroAulas) === 72 && ((turmaTotalAulas === 36) || (sDate && eDate && isSameSemester(new Date(sDate), new Date(eDate))));

  const cronogramaHtmlFinal = showSemestre ? cronogramaHtmlSemestre : (Number(numeroAulas) === 72 ? cronogramaHtmlAno : cronogramaHtml);

  return `
<div style="position: relative; margin-bottom: 20px; text-align: center; min-height: 80px;">
  <img src="${logoBase64}" alt="${selectedContract === 'contrato_particulares' ? 'TS SCHOOL Logo' : 'Teen Speech Logo'}" style="position: absolute; left: 20px; top: 0; width: 80px; height: 80px;" />
  <h1 style="font-size: 18px; font-weight: bold; margin: 0; text-align: center; line-height: 80px;">${selectedContract === 'contrato_particulares' ? 'TS SCHOOL - ESCOLA DE IDIOMAS' : 'TEEN SPEECH - ESCOLA DE IDIOMAS'}</h1>
</div>

<div style="text-align: center; margin-bottom: 20px;">
  <h2 style="font-size: 16px; font-weight: bold; margin: 10px 0;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h2>
</div>

${selectedContract === 'contrato_particulares'
   ? `<p style="text-align: justify; margin-bottom: 20px;">O presente Contrato de Prestação de Serviços Educacionais tem por objetivo formalizar a relação jurídica entre a TS SCHOOL (doravante denominada CONTRATADA) e o ALUNO(A) (doravante denominado CONTRATANTE), estabelecendo os termos, condições, direitos e obrigações para a prestação de serviços de aulas particulares de inglês. Este instrumento visa proporcionar segurança e clareza na aquisição e usufruto dos pacotes de aulas, conforme detalhado no Anexo I. O CONTRATANTE terá acesso a aulas ministradas por profissionais qualificados em um dia e horário fixos, previamente escolhidos e reservados no ato da matrícula, com a possibilidade de alternar entre modalidades (online ou presencial) sob certas condições, bem como o benefício do 'Passe Livre' em planos específicos, sempre em conformidade com as regras estabelecidas neste contrato.</p>
     <p style="text-align: justify; margin-bottom: 20px;">Este Contrato de Prestação de Serviços Educacionais é celebrado em ${day} de ${monthNames[today.getMonth()]} de ${year}, na Comarca de Guarulhos, Estado de São Paulo, entre:</p>

     <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">I. DAS PARTES</h4>
     <p style="text-align: justify; margin-bottom: 10px;">TS SCHOOL, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 41.854.243/0001-74, com sede na Avenida Armando Bei, 465, CEP: 07175-000, Guarulhos/SP, doravante denominada CONTRATADA.</p>
     ${isContratanteResponsavel
       ? `
     <p style=\"text-align: justify; margin-bottom: 10px;\">${nomeResponsavel ? nomeResponsavel : '<span class=\"placeholder-text\" contentEditable=\"true\">__________</span> (nome do responsável)'}${nacionalidadeResponsavel ? `, ${nacionalidadeResponsavel}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">___________</span> (nacionalidade)'}${profissaoResponsavel ? `, ${profissaoResponsavel}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">__________________</span> (profissão)'}, portador(a) do CPF nº ${cpfResponsavelFmt || '<span class=\"placeholder-text\" contentEditable=\"true\">_____________</span>'}, residente e domiciliado(a) na ${enderecoResponsavelTexto || '<span class=\"placeholder-text\" contentEditable=\"true\">____________</span> (rua/avenida/estrada)'}${numeroEnderecoResponsavel ? `, ${numeroEnderecoResponsavel}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">__________</span> (número da residência)'}${cidadeEstadoResponsavel ? `, na cidade de ${cidadeEstadoResponsavel}` : ', na cidade de <span class=\"placeholder-text\" contentEditable=\"true\">_____________</span>/(cidade e estado)'}${cepResponsavelFmt ? ` CEP: ${cepResponsavelFmt}` : ' CEP: <span class=\"placeholder-text\" contentEditable=\"true\">____________________</span>'}, doravante denominado(a) CONTRATANTE e RESPONSÁVEL LEGAL.</p>
     <p style=\"text-align: justify; margin-bottom: 10px;\">${nomeAluno ? nomeAluno : '<span class=\"placeholder-text\" contentEditable=\"true\">__________</span> (nome do aluno)'}${nacionalidade ? `, ${nacionalidade}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">___________</span> (nacionalidade)'}${profissao ? `, ${profissao}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">__________________</span> (profissão)'}${cpfFmt ? `, portador(a) do CPF nº ${cpfFmt}` : ', portador(a) do CPF nº <span class=\"placeholder-text\" contentEditable=\"true\">_____________</span>'}, residente e domiciliado(a) na ${enderecoTexto || '<span class=\"placeholder-text\" contentEditable=\"true\">____________</span> (rua/avenida/estrada)'}${numeroEndereco ? `, ${numeroEndereco}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">__________</span> (número da residência)'}${cidadeEstado ? `, na cidade de ${cidadeEstado}` : ', na cidade de <span class=\"placeholder-text\" contentEditable=\"true\">_____________</span>/(cidade e estado)'}${cepFmt ? ` CEP: ${cepFmt}` : ' CEP: <span class=\"placeholder-text\" contentEditable=\"true\">____________________</span>'}${isMinor ? ', menor de idade, representado(a) por seu responsável legal acima qualificado' : ''}, doravante denominado(a) ALUNO(A).</p>
       `
       : `
     <p style=\"text-align: justify; margin-bottom: 10px;\">${nomeAluno ? nomeAluno : '<span class=\"placeholder-text\" contentEditable=\"true\">__________</span> (nome)'}${nacionalidade ? `, ${nacionalidade}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">___________</span> (nacionalidade)'}${profissao ? `, ${profissao}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">__________________</span> (profissão)'}, portador(a) do CPF nº ${cpfFmt || '<span class=\"placeholder-text\" contentEditable=\"true\">_____________</span>'}, residente e domiciliado(a) na ${enderecoTexto || '<span class=\"placeholder-text\" contentEditable=\"true\">____________</span> (rua/avenida/estrada)'}${numeroEndereco ? `, ${numeroEndereco}` : ', <span class=\"placeholder-text\" contentEditable=\"true\">__________</span> (número da residência)'}${cidadeEstado ? `, na cidade de ${cidadeEstado}` : ', na cidade de <span class=\"placeholder-text\" contentEditable=\"true\">_____________</span>/(cidade e estado)'}${cepFmt ? ` CEP: ${cepFmt}` : ' CEP: <span class=\"placeholder-text\" contentEditable=\"true\">____________________</span>'}, doravante denominado(a) CONTRATANTE ou ALUNO(A).</p>
       `}

     <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">II. DO OBJETO DO CONTRATO</h4>
     <p style="text-align: justify; margin-bottom: 10px;">O presente contrato tem como objeto a prestação de serviços educacionais na modalidade de aulas particulares de inglês, a serem ministradas pela CONTRATADA ao CONTRATANTE, de acordo com os pacotes e condições estabelecidos na tabela de valores de "Aulas Particulares ${year}" (Anexo I), que faz parte integrante e indissociável deste instrumento.</p>

     <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">III. DA DURAÇÃO E RENOVAÇÃO</h4>
     <p style="text-align: justify; margin-bottom: 10px;">O presente contrato terá a duração de 01 (um) ano, contado a partir da data de sua assinatura, ou seja, de <span class="placeholder-text" contentEditable="true">_____</span> (data de início) a <span class="placeholder-text" contentEditable="true">______</span> (data de término).</p>
     <p style="text-align: justify; margin-bottom: 10px;">Ao término do prazo de 01 (um) ano, o presente contrato será automaticamente rescindido, não havendo renovação tácita.</p>
     <p style="text-align: justify; margin-bottom: 10px;">Caso haja interesse das partes na continuidade da prestação dos serviços, um novo contrato deverá ser celebrado. Na ocasião da celebração de um novo contrato, a CONTRATADA reserva-se o direito de reajustar os valores dos serviços oferecidos, caso necessário, com base em custos operacionais, inflação e condições de mercado.</p>

     <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">IV. DOS SERVIÇOS E FORMAS DE ADESÃO</h4>
     <p style="text-align: justify; margin-bottom: 10px;">Os serviços a serem prestados consistem em aulas particulares de inglês, cuja carga horária e benefícios (aulas extras) são determinados pelos pacotes escolhidos pelo CONTRATANTE, conforme tabela "Aulas Particulares ${year}" (Anexo I).</p>
     <p style="text-align: justify; margin-bottom: 10px;">Durante a vigência deste contrato, o CONTRATANTE poderá adquirir quaisquer dos pacotes de aulas particulares oferecidos pela CONTRATADA, de acordo com sua necessidade e disponibilidade financeira. No entanto, a aquisição de pacotes de aulas deverá ser feita um por vez, ou seja, o CONTRATANTE somente poderá adquirir um novo pacote após a utilização ou o vencimento das aulas do pacote atualmente contratado.</p>
     <p style="text-align: justify; margin-bottom: 10px;">A CONTRATADA se compromete a disponibilizar suporte via WhatsApp para o CONTRATANTE para dúvidas e agendamentos.</p>
     <p style="text-align: justify; margin-bottom: 10px;">A modalidade de aulas divididas para dois alunos é um benefício exclusivo dos planos "Elite" e "Ultimate", sendo uma opção do CONTRATANTE ao adquirir estes pacotes, caso deseje convidar outra pessoa para compartilhar as aulas. Nos planos "Elite" e "Ultimate", cada estudante que optar por dividir as aulas deverá pagar sua matrícula e seu material individualmente, conforme estabelecido no Anexo I. A divisão de aulas é aplicável somente para até 2 (dois) alunos. Para os demais planos ("Essential", "Advanced" e "Mastery"), as aulas são individuais, destinadas a apenas 01 (um) aluno.</p>

      <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">V. DAS CONDIÇÕES FINANCEIRAS</h4>
      <p style="text-align: justify; margin-bottom: 10px;">Para o acesso aos serviços educacionais, o CONTRATANTE deverá efetuar o pagamento da Matrícula no valor de R$ 150,00 (cento e cinquenta reais) e do Material Didático no valor de R$ 200,00 (duzentos reais) no ato da assinatura deste contrato. Tais valores são fixos e não reembolsáveis.</p>
      <p style="text-align: justify; margin-bottom: 10px;">Os valores de cada pacote de aulas (Aulas, Aulas + Aulas Grátis) e os benefícios de economia são aqueles indicados na tabela "Aulas Particulares ${year}" (Anexo I).</p>
      <p style="text-align: justify; margin-bottom: 10px;">O pagamento pelos pacotes de aulas adquiridos deverá ser efetuado integralmente no momento da contratação de cada pacote, de acordo com os meios de pagamento aceitos pela CONTRATADA.</p>
      <p style="text-align: justify; margin-bottom: 10px;">Eventuais aulas extras concedidas em função da aquisição de pacotes maiores (conforme Anexo I) não geram qualquer custo adicional ao CONTRATANTE.</p>

      <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">VI. DOS HORÁRIOS E MODALIDADES DAS AULAS</h4>
      <p style="text-align: justify; margin-bottom: 10px;">No ato da matrícula, o CONTRATANTE deverá escolher o dia e horário de preferência para a realização de suas aulas, o qual será reservado e prioritariamente destinado ao CONTRATANTE durante a vigência deste contrato, sujeito à disponibilidade da CONTRATADA. No ato da matrícula, o CONTRATANTE também informará a modalidade de aula de sua preferência (online ou presencial), que será considerada a modalidade padrão.</p>
      <p style="text-align: justify; margin-bottom: 10px;">As aulas poderão ser ministradas nas modalidades presencial ou online. O CONTRATANTE deverá informar à CONTRATADA, com antecedência mínima de 2 (duas) horas antes do horário agendado, caso deseje alterar a modalidade da aula (de presencial para online, ou vice-versa). Caso não haja comunicação prévia dentro do prazo estipulado, a aula será realizada na modalidade padrão escolhida pelo CONTRATANTE no ato da matrícula.</p>
      <p style="text-align: justify; margin-bottom: 10px;">Não haverá aulas em feriados nacionais, estaduais ou municipais (da cidade de Guarulhos/SP). As aulas que, porventura, recaírem em feriados, não serão deduzidas do pacote do CONTRATANTE, sendo que a CONTRATADA não será obrigada a repô-las, uma vez que o valor do pacote já considera a grade anual e os recessos de feriados.</p>

      <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">VII. DO PASSE LIVRE</h4>
      <p style="text-align: justify; margin-bottom: 10px;">O benefício "Passe Livre", aplicável aos planos ADVANCED, MASTERY, ELITE e ULTIMATE, permite ao CONTRATANTE participar de aulas extras em turmas regulares da CONTRATADA sem custo adicional, conforme disponibilidade de vagas e horários.</p>
      <p style="text-align: justify; margin-bottom: 10px;">Para ter acesso ao "Passe Livre" em uma determinada semana, o CONTRATANTE deverá ter realizado ao menos 01 (uma) aula particular do seu pacote contratado na mesma semana.</p>
      <p style="text-align: justify; margin-bottom: 10px;">Caso o CONTRATANTE utilize o "Passe Livre" em uma semana, mas não tenha realizado nenhuma aula particular do pacote contratado naquela mesma semana, será contabilizada 01 (uma) aula do pacote do CONTRATANTE como utilizada, mesmo que a aula do "Passe Livre" seja em turma.</p>

      <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">VIII. DAS RESPONSABILIDADES DAS PARTES</h4>
      <p style="text-align: justify; margin-bottom: 10px;">Da CONTRATADA: a. Garantir a qualidade do ensino e a qualificação dos professores. b. Cumprir com a carga horária e os benefícios (aulas extras) correspondentes aos pacotes adquiridos. c. Disponibilizar o suporte via WhatsApp. d. Manter a estrutura necessária para a realização das aulas presenciais e a plataforma para aulas online. e. Comunicar previamente ao CONTRATANTE qualquer alteração relevante nos serviços ou horários.</p>
      <p style="text-align: justify; margin-bottom: 10px;">Do CONTRATANTE: a. Efetuar o pagamento da Matrícula, Material Didático e dos pacotes de aulas nos prazos e formas acordados. b. Comparecer às aulas nos horários agendados ou comunicar com antecedência mínima de 12 (doze) horas o cancelamento ou reagendamento, sob pena de perda da aula sem direito a reposição ou reembolso. c. Zelar pela conservação do material didático e das instalações da CONTRATADA. d. Respeitar as normas internas da CONTRATADA. e. Informar a modalidade (online ou presencial) da aula conforme o item VI.2, caso deseje alterá-la para o dia em questão. f. Cumprir as condições para utilização do "Passe Livre" conforme item VII.2.</p>

      <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">IX. DA PROTEÇÃO DE DADOS</h4>
      <p style="text-align: justify; margin-bottom: 10px;">As Partes reconhecem e concordam que os dados pessoais fornecidos em decorrência deste contrato serão tratados de acordo com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD) e demais legislações pertinentes.</p>
      <p style="text-align: justify; margin-bottom: 10px;">A CONTRATADA se compromete a coletar, armazenar e utilizar os dados pessoais do CONTRATANTE estritamente para os fins necessários à execução deste contrato, bem como para o cumprimento de obrigações legais e regulatórias.</p>
      <p style="text-align: justify; margin-bottom: 10px;">A CONTRATADA adotará medidas de segurança técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.</p>
      <p style="text-align: justify; margin-bottom: 10px;">O CONTRATANTE, por meio da assinatura deste contrato, declara-se ciente e concorda com o tratamento de seus dados pessoais pela CONTRATADA nos termos da legislação aplicável e para as finalidades aqui descritas.</p>

      <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">X. DAS DISPOSIÇÕES GERAIS</h4>
      <p style="text-align: justify; margin-bottom: 10px;">Período de Recesso e Melhorias: A CONTRATADA informa que nos meses de dezembro e janeiro de cada ano, a escola poderá entrar em período de recesso para férias e/ou manutenção e melhorias em suas instalações (como reformas e pintura). Durante este período, o agendamento de aulas poderá ser limitado ou indisponível. A CONTRATADA comunicará previamente aos CONTRATANTES a programação específica para estes meses.</p>

      <p style="text-align: justify; margin-bottom: 10px;">Cancelamento do Contrato e Restituição de Valores: a. Conforme o Código de Defesa do Consumidor, o CONTRATANTE tem o prazo de 7 (sete) dias corridos, a contar da data da assinatura deste contrato e/ou da primeira aquisição de pacote de aulas, para exercer o direito de arrependimento, caso a contratação tenha ocorrido fora do estabelecimento comercial (online, por telefone, etc.). Neste caso, todos os valores eventualmente pagos (Matrícula, Material e Pacote de Aulas) serão restituídos integralmente, desde que não tenha havido utilização de qualquer serviço.</p>
      <p style="text-align: justify; margin-bottom: 10px;">b. Após o prazo de 7 (sete) dias previsto no item "a", caso o CONTRATANTE manifeste o desejo de cancelar este contrato e/ou a utilização de um pacote de aulas, será devido o pagamento das aulas já utilizadas até a data da solicitação de cancelamento. Sobre o valor correspondente às aulas que não foram utilizadas e que seriam cobradas (parcelas vincendas), será aplicada uma multa rescisória de 10% (dez por cento). O valor a ser restituído ao CONTRATANTE, se houver, será o saldo remanescente após a dedução das aulas utilizadas e da multa. As aulas concedidas a título de benefício/gratuidades (aulas extras) não serão consideradas para fins de restituição ou cálculo de multa.</p>
      <p style="text-align: justify; margin-bottom: 10px;">c. A Matrícula e o Material Didático, uma vez pagos, não são passíveis de restituição, exceto no caso de arrependimento dentro do prazo de 7 dias, conforme o item "a".</p>

      <p style="text-align: justify; margin-bottom: 10px;">Casos de Força Maior: Nenhuma das partes será responsável por falhas ou atrasos no cumprimento de suas obrigações se tais falhas ou atrasos forem causados por eventos de força maior ou caso fortuito, como desastres naturais, guerras, greves, pandemias, interrupções de energia, etc.</p>

      <p style="text-align: justify; margin-bottom: 10px;">Alterações Contratuais: Qualquer alteração ou aditamento a este contrato somente terá validade se for feito por escrito e assinado por ambas as partes.</p>

      <p style="text-align: justify; margin-bottom: 10px;">Independência das Cláusulas: Se qualquer cláusula deste contrato for considerada inválida ou inexequível, as demais cláusulas permanecerão em pleno vigor e efeito.</p>

      <h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">XI. DO FORO</h4>
      <p style="text-align: justify; margin-bottom: 10px;">As partes elegem o Foro da Comarca de Guarulhos, Estado de São Paulo, para dirimir quaisquer dúvidas ou litígios oriundos do presente contrato, renunciando a qualquer outro, por mais privilegiado que seja.</p>

      <p style="text-align: justify; margin-bottom: 10px;">E, por estarem assim justos e contratados, as partes assinam o presente instrumento em 02 (duas) vias de igual teor e forma, na presença das 02 (duas) testemunhas abaixo, para que produza seus devidos e legais efeitos.</p>
      <p style="text-align: center; margin-bottom: 10px;">${currentDateText}</p>

      <p style="text-align: center; margin-bottom: 10px;">Ciente e de acordo,</p>

      <div style="text-align: center; margin: 30px 0 10px;">
        <img src="${signatureImages.teenSpeech}" alt="Assinatura TS SCHOOL" style="display: block; margin: 0 auto; max-width: 280px; max-height: 70px;" />
        <p style="text-align: center; margin: 2px 0 0; line-height: 1;">_________________________________________________________</p>
      </div>
      <p style="text-align: center; margin-bottom: 20px;">TS SCHOOL</p>

      <p style="text-align: center; margin-top: 30px;">Contratante:</p>
      <p style="text-align: center; margin: 28px 0 6px;">_________________________________________________________</p>
      <p style="text-align: center; margin: 0 0 12px;">
        ${isContratanteResponsavel
          ? (nomeResponsavel || '<span class="placeholder-text" contentEditable="true">Nome do Responsável</span>')
          : (nomeAluno || '<span class="placeholder-text" contentEditable="true">Nome do Contratante</span>')}
        - CPF:
        ${isContratanteResponsavel
          ? (cpfResponsavelFmt || '<span class="placeholder-text" contentEditable="true">_____________</span>')
          : (cpfFmt || '<span class="placeholder-text" contentEditable="true">_____________</span>')}
      </p>

      <div style="text-align: center; margin-top: 20px;">
        <img src="${signatureImages.testemunha1}" alt="Assinatura Testemunha 1" style="display: block; margin: 0 auto; max-height: 70px; max-width: 180px; object-fit: contain;" />
        <p style="text-align: center; margin: 2px 0 4px; line-height: 1;">_________________________________________________________</p>
        <p style="text-align: center; margin: 4px 0;">Testemunha</p>
        <p style="text-align: center;">CPF: 567641218-69</p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <img src="${signatureImages.testemunha2}" alt="Assinatura Testemunha 2" style="display: block; margin: 0 auto; max-height: 70px; max-width: 180px; object-fit: contain;" />
        <p style="text-align: center; margin: 2px 0 4px; line-height: 1;">_________________________________________________________</p>
        <p style="text-align: center; margin: 4px 0;">Testemunha 2</p>
        <p style="text-align: center;">RG: 34.537.017-X</p>
      </div>

       ${plansTableHtml}`
   : `O contrato de prestação de serviços reúne os termos que regem o relacionamento entre CONTRATADO e CONTRATANTE. Ele deve prever todas as situações envolvidas nesta relação, aumentando a segurança e estabelecendo os direitos e obrigações das partes. O presente instrumento tem como objetivo formalizar a aquisição do direito de estudos na unidade Bonsucesso da TEEN SPEECH para o Curso de Inglês. O referido direito é válido para a participação em 36 aulas em uma turma de escolha do RESPONSÁVEL, além da possibilidade de participação em aulas extras em outras turmas ao longo do semestre. Ocorrerão duas aulas por semana, com duração de cinquenta e cinco minutos cada. O valor do direito pode ser pago à vista ou em parcelas no crédito. Os semestres ocorrem de fevereiro a junho (primeiro semestre do ano) e de agosto a dezembro (segundo semestre).`}


${selectedContract !== 'contrato_particulares' ? `
<div style="text-align: center; font-weight: bold; margin-top: 20px; margin-bottom: 15px;">01. Identificação do CONTRATANTE:</div>

<div style="border: 1px solid #000; padding: 6px 10px; margin-bottom: 2px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 15%; padding: 5px; font-weight: bold;">CPF:</td>
      <td style="width: 35%; padding: 5px; border-bottom: 1px solid #000;">${isContratanteResponsavel ? (cpfResponsavelFmt || '<span class="placeholder-text">CPF</span>') : (cpfFmt || '<span class="placeholder-text">CPF</span>')}</td>
      <td style="width: 15%; padding: 5px; font-weight: bold;">Nome:</td>
      <td style="width: 35%; padding: 5px; border-bottom: 1px solid #000;">${isContratanteResponsavel ? (nomeResponsavel || '<span class="placeholder-text">Nome</span>') : (nomeAluno || '<span class="placeholder-text">Nome</span>')}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Data de nascimento:</td>
      <td colspan="3" style="padding: 5px; border-bottom: 1px solid #000;">${
        isContratanteResponsavel
          ? (student?.responsaveis?.data_nascimento ? new Date(student.responsaveis.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">Data de nascimento</span>')
          : (student?.data_nascimento ? new Date(student.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">Data de nascimento</span>')
      }</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Endereço:</td>
      <td colspan="3" style="padding: 5px; border-bottom: 1px solid #000;">${
        isContratanteResponsavel
          ? (enderecoResponsavelBase ? `${enderecoResponsavelBase}, nº ${numeroEnderecoResponsavel || '<span class=\"placeholder-text\">número</span>'}` : '<span class="placeholder-text">Endereço completo</span>')
          : (enderecoBase ? `${enderecoBase}, nº ${student?.numero_endereco || '<span class=\"placeholder-text\">número</span>'}` : '<span class="placeholder-text">Endereço completo</span>')
      }</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Telefone:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${isContratanteResponsavel ? (student?.responsaveis?.telefone || '<span class="placeholder-text">Telefone</span>') : (student?.telefone || '<span class="placeholder-text">Telefone</span>')}</td>
      <td style="padding: 5px; font-weight: bold;">E-mail:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${isContratanteResponsavel ? (student?.responsaveis?.email || '<span class="placeholder-text">E-mail</span>') : (student?.email || '<span class="placeholder-text">E-mail</span>')}</td>
    </tr>
  </table>
</div>

${isContratanteResponsavel ? `
<div style="text-align: center; font-weight: bold; margin-top: 10px; margin-bottom: 10px;">02. Identificação do ALUNO:</div>
<div style=\"border: 1px solid #000; padding: 6px 10px; margin-bottom: 2px;\">
  <table style=\"width: 100%; border-collapse: collapse;\">
    <tr>
      <td style=\"width: 15%; padding: 5px; font-weight: bold;\">CPF:</td>
      <td style=\"width: 35%; padding: 5px; border-bottom: 1px solid #000;\">${cpfFmt || '<span class="placeholder-text">CPF</span>'}</td>
      <td style=\"width: 15%; padding: 5px; font-weight: bold;\">Nome:</td>
      <td style=\"width: 35%; padding: 5px; border-bottom: 1px solid #000;\">${nomeAluno || '<span class="placeholder-text">Nome</span>'}</td>
    </tr>
    <tr>
      <td style=\"padding: 5px; font-weight: bold;\">Data de nascimento:</td>
      <td colspan=\"3\" style=\"padding: 5px; border-bottom: 1px solid #000;\">${student?.data_nascimento ? new Date(student.data_nascimento).toLocaleDateString('pt-BR') : '<span class=\"placeholder-text\">Data de nascimento</span>'}</td>
    </tr>
    <tr>
      <td style=\"padding: 5px; font-weight: bold;\">Endereço:</td>
      <td colspan=\"3\" style=\"padding: 5px; border-bottom: 1px solid #000;\">${enderecoBase ? `${enderecoBase}, nº ${student?.numero_endereco || '<span class=\"placeholder-text\">número</span>'}` : '<span class=\"placeholder-text\">Endereço completo</span>'}</td>
    </tr>
    <tr>
      <td style=\"padding: 5px; font-weight: bold;\">Telefone:</td>
      <td style=\"padding: 5px; border-bottom: 1px solid #000;\">${student?.telefone || '<span class=\"placeholder-text\">Telefone</span>'}</td>
      <td style=\"padding: 5px; font-weight: bold;\">E-mail:</td>
      <td style=\"padding: 5px; border-bottom: 1px solid #000;\">${student?.email || '<span class=\"placeholder-text\">E-mail</span>'}</td>
    </tr>
  </table>
</div>
` : ''}

${generateResponsavelSection()}

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">Identificações do Curso, Prazo e Horário</h4>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 50%; padding: 0; vertical-align: top; border-right: 1px solid #000;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 40%; padding: 5px; font-weight: bold;">Nome do Plano:</td>
            <td style="width: 60%; padding: 5px; border-bottom: 1px solid #000;">${planData?.nome || 'Módulo de curso'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Valor Total (sem desconto) :</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${planData?.valor_total ? planData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '<span class="placeholder-text">valor total</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Número de Aulas:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${planData?.numero_aulas || '<span class="placeholder-text">número de aulas</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Duração de cada aula:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">55 minutos</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Quantidade de aulas do semestre:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">36</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Média de aprovação no curso:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">7</td>
          </tr>
        </table>
      </td>
      <td style="width: 50%; padding: 0; vertical-align: top;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 40%; padding: 5px; font-weight: bold;">Frequência:</td>
            <td style="width: 60%; padding: 5px; border-bottom: 1px solid #000;">${planData?.frequencia_aulas || 'semanal'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Descrição:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${planData?.descricao || '<span class="placeholder-text">descrição do plano</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Data de início:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${contractData?.data_inicio ? new Date(contractData.data_inicio).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de início</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Data de encerramento:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${contractData?.data_fim ? new Date(contractData.data_fim).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de encerramento</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Semestre:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${numeroAulas === 72 ? '2 semestres' : numeroAulas === 36 ? '1 semestre' : numeroAulas ? Math.round(numeroAulas / 36) + ' semestre(s)' : '<span class="placeholder-text">semestre</span>'}</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>



<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td colspan="2" style="padding: 5px; font-weight: bold;">Valores do Curso e Condições de Pagamento:</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold; border-bottom: 1px solid #000;">Valor Total do Contrato:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${valorTotalCurso > 0 ? formatCurrency(valorTotalCurso) : (planData?.valor_total ? planData.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '<span class="placeholder-text">valor total</span>')}</td>
    </tr>
    <tr>
      <td style="width: 50%; padding: 5px; vertical-align: top; border-right: 1px solid #000;">
        <table style="width: 100%; border-collapse: collapse;">
          ${numeroAulas === 72 && (valorPlanoTotalCalculado > 0 || parseNum(planData?.valor_total ?? 0) > 0) ? `
          <tr>
            <td style="padding: 5px; font-weight: bold;">Semestre 1:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${formatCurrency(((valorPlanoTotalCalculado > 0 ? valorPlanoTotalCalculado : parseNum(planData?.valor_total ?? 0)) / 2))}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 5px;">⦁ 36 aulas (R$ ${formatCurrency(valorPorAula)} cada)</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Semestre 2:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${formatCurrency(((valorPlanoTotalCalculado > 0 ? valorPlanoTotalCalculado : parseNum(planData?.valor_total ?? 0)) / 2))}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 5px;">⦁ 36 aulas (R$ ${formatCurrency(valorPorAula)} cada)</td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 5px; font-weight: bold;">Semestre 1:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${formatCurrency(valorPlanoTotalCalculado > 0 ? valorPlanoTotalCalculado : parseNum(planData?.valor_total ?? 0))}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 5px;">⦁ ${numeroAulas || 36} aulas (R$ ${formatCurrency(valorPorAula)} cada)</td>
          </tr>
          `}
          <tr>
            <td style="padding: 5px; font-weight: bold;">Quantidade mínima obrigatória de aulas por semestre:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">27 aulas</td>
          </tr>
        </table>
      </td>
      <td style="width: 50%; padding: 5px; vertical-align: top;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px; font-weight: bold;">Parcelas:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${financialData?.numero_parcelas_plano || '<span class="placeholder-text">número de parcelas</span>'}</td>
          </tr>
          ${valorMaterial > 0 ? `
          <tr>
            <td style="padding: 5px; font-weight: bold;">Material Didático:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${formatCurrency(valorMaterial)}</td>
          </tr>
          ` : ''}
          ${valorMatricula > 0 ? `
          <tr>
            <td style="padding: 5px; font-weight: bold;">Matrícula:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${formatCurrency(valorMatricula)}</td>
          </tr>
          ` : ''}
        </table>
      </td>
    </tr>
  </table>
</div>

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 20%; padding: 5px; font-weight: bold;">Benefício:</td>
      <td style="width: 80%; padding: 5px; border: 1px solid #000; min-height: 40px;">${contractData?.beneficio || '<span class="placeholder-text">descrever benefício</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Aulas Pagas:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${aulasPagas}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Aulas Grátis:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${aulasGratis}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Desconto total:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">R$ ${formatCurrency(descontoTotal)}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Forma de pagamento e número de parcelas:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${resumoFormaPagamento}</td>
    </tr>
  </table>
</div>

<div style="border: 1px solid #000; padding: 10px; margin-bottom: 15px;">
  <h4 style="text-align: center; margin: 10px 0; font-size: 14px; font-weight: bold;">INFORMAÇÕES DA TURMA DO ALUNO</h4>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 30%; padding: 5px; font-weight: bold;">Nome da Turma:</td>
      <td style="width: 70%; padding: 5px; border-bottom: 1px solid #000;">${turmaAtual?.nome || '<span class="placeholder-text">nome da turma</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Idioma:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${turmaAtual?.idioma || planData?.idioma || '<span class="placeholder-text">idioma</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Nível:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${turmaAtual?.nivel || '<span class="placeholder-text">nível</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Horário:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${turmaAtual?.horario || '<span class="placeholder-text">horário</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Dias da Semana:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${turmaAtual?.dias_da_semana || '<span class="placeholder-text">dias da semana</span>'}</td>
    </tr>
    <tr>
      <td style="padding: 5px; font-weight: bold;">Tipo de Turma:</td>
      <td style="padding: 5px; border-bottom: 1px solid #000;">${turmaTipo || '<span class="placeholder-text">tipo de turma</span>'}</td>
    </tr>
  </table>
  ${cronogramaHtmlFinal}
</div>

<p style="text-align: justify; margin-bottom: 15px;">Por este Instrumento Particular de Contrato de Prestação de Serviços, de um lado, TEEN SPEECH, pessoa jurídica de direito privado, com sede na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso, Guarulhos/SP, inscrita no CNPJ nº 30.857.093/0001-36, doravante denominada CONTRATADA, e de outro lado, o tomador de serviço identificado no Quadro 01 e ao final assinado, doravante denominado CONTRATANTE, ajustam entre si o que segue, obrigando-se a cumprir as cláusulas abaixo:</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">1. CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO</h4>
<p style="text-align: justify; margin-bottom: 10px;">1.1. O presente Instrumento Particular tem como objeto a prestação de serviços educacionais de ensino do idioma ${idiomaContrato} pela TEEN SPEECH (doravante CONTRATADA) em favor do tomador de serviços (doravante CONTRATANTE ou ESTUDANTE), conforme turma e horário específicos definidos no momento da contratação e descritos no Quadro 01.</p>
<p style="text-align: justify; margin-bottom: 15px;">1.2. Os serviços educacionais mencionados no item 1.1 incluem a participação do ESTUDANTE na turma escolhida, com garantia de vaga limitada à capacidade de 10 (dez) alunos por turma, e o usufruto de ${numeroAulas || 36} (${numeroAulas === 72 ? 'setenta e duas' : 'trinta e seis'}) aulas do idioma ${idiomaContrato}, a serem ministradas durante o semestre letivo vigente.</p>

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


<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">7. CLÁUSULA SÉTIMA – DO PERÍODO LETIVO E FÉRIAS</h4>

<p style="text-align: justify; margin-bottom: 10px;">7.1. A CONTRATADA se compromete a ministrar 36 (trinta e seis) aulas por semestre letivo, compreendendo os períodos de fevereiro a junho (primeiro semestre) e de agosto a dezembro (segundo semestre), conforme detalhamento específico constante no Quadro 02 deste instrumento. A contagem das aulas terá início a partir da data da primeira aula ministrada.</p>

<p style="text-align: justify; margin-bottom: 15px;">7.2. O período compreendido entre o término das 36 aulas de um semestre e o início das aulas do semestre subsequente é considerado recesso escolar (férias), sendo este um período sem aulas presenciais ou online. O CONTRATANTE declara-se ciente de que a existência e duração desses recessos estão previamente estabelecidas no calendário da CONTRATADA e não o eximem da obrigação de efetuar o pagamento das parcelas contratadas, que continuarão a ser devidas conforme o cronograma financeiro do Quadro 03.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">8. CLÁUSULA OITAVA – DA FREQUÊNCIA E REPOSIÇÃO DE AULAS</h4>

<p style="text-align: justify; margin-bottom: 10px;">8.1. O CONTRATANTE tem plena ciência de que o objeto do presente contrato é a participação do ESTUDANTE em 36 (trinta e seis) aulas em TURMA, conforme calendário letivo previamente estabelecido pela CONTRATADA e disponível para consulta. As aulas serão ministradas para a TURMA independentemente da presença do ESTUDANTE, não havendo responsabilidade da CONTRATADA pela ausência.</p>
<p style="text-align: justify; margin-bottom: 10px;">8.2. Para fins de aproveitamento e aprovação, o CONTRATANTE compromete-se a garantir a presença do ESTUDANTE em, no mínimo, 27 (vinte e sete) aulas durante o semestre letivo. O não cumprimento desta frequência mínima resultará na reprovação automática do ESTUDANTE.</p>
<p style="text-align: justify; margin-bottom: 15px;">8.3. Em caráter excepcional e visando auxiliar na recuperação de conteúdo, a CONTRATADA disponibiliza 1 (uma) aula de reposição gratuita por mês, limitada a uma por mês. Esta aula de reposição será realizada de forma individual, terá duração de 45 (quarenta e cinco) minutos e só poderá ser agendada e usufruída dentro do semestre letivo contratado. A disponibilidade de horários para reposição será definida pela CONTRATADA.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">9. CLÁUSULA NONA – DAS MODALIDADES DE REPOSIÇÃO DE AULAS</h4>

<p style="text-align: justify; margin-bottom: 10px;">9.1. Adicionalmente à aula de reposição individual gratuita mencionada na Cláusula Oitava, o ESTUDANTE poderá tentar repor aulas perdidas por meio de sua inserção temporária em outras turmas da CONTRATADA, sem custo adicional, desde que haja vagas disponíveis e que o conteúdo da aula seja compatível com o material que o ESTUDANTE precisa revisar. A elegibilidade e o agendamento dessa reposição estarão sujeitos à análise e disponibilidade da CONTRATADA.</p>
<p style="text-align: justify; margin-bottom: 15px;">9.2. Caso as opções gratuitas de reposição (aula individual mensal e/ou participação em outra turma) não sejam viáveis ou já tenham sido esgotadas pelo ESTUDANTE, o CONTRATANTE terá a faculdade de contratar aulas particulares de reposição. Cada aula particular terá o custo de R$ 40,00 (quarenta reais) e duração de 45 (quarenta e cinco) minutos, devendo ser agendada conforme a disponibilidade de horários da CONTRATADA.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">10. CLÁUSULA DÉCIMA – DO COMPROMISSO DO ESTUDANTE COM O APRENDIZADO</h4>

<p style="text-align: justify; margin-bottom: 10px;">10.1. O CONTRATANTE e o ESTUDANTE reconhecem que o sucesso no aprendizado do idioma Inglês depende significativamente do esforço ativo e da dedicação contínua do ESTUDANTE, bem como da estrita observância às orientações pedagógicas fornecidas pela TEEN SPEECH (doravante CONTRATADA).</p>

<p style="text-align: justify; margin-bottom: 10px;">10.2. Ciente da natureza do aprendizado de idiomas, que exige contato e prática regulares, o ESTUDANTE compromete-se a seguir as diretrizes de estudo dos professores da CONTRATADA, incluindo a prática e revisão do conteúdo de forma espaçada e consistente, evitando acumular o estudo para um único dia. Recomenda-se e espera-se uma dedicação de ao menos 20 (vinte) minutos diários aos estudos e o esforço para assimilar o conteúdo da aula antes da aula seguinte.</p>

<p style="text-align: justify; margin-bottom: 15px;">10.3. O CONTRATANTE declara-se ciente e concorda que a CONTRATADA envidará todos os esforços didáticos e pedagógicos para o ensino. No entanto, o aproveitamento e o resultado final do curso são de responsabilidade intrínseca do ESTUDANTE, complementados pelo acompanhamento do CONTRATANTE. A CONTRATADA não poderá ser responsabilizada pelo não aprendizado ou aproveitamento insatisfatório do curso que decorra da falta de dedicação, da ausência de frequência mínima (conforme Cláusula Oitava) ou do não seguimento das orientações de estudo por parte do ESTUDANTE.</p>


<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">11. CLÁUSULA DÉCIMA PRIMEIRA – DOS CRITÉRIOS DE APROVAÇÃO E REPROVAÇÃO</h4>

<p style="text-align: justify; margin-bottom: 10px;">11.1. Para que o ESTUDANTE seja considerado aprovado no módulo ou semestre letivo, é indispensável que cumpra, cumulativamente, os seguintes critérios: a) obtenha nota final mínima de 7,0 (sete) pontos nas avaliações pedagógicas da CONTRATADA; e b) registre frequência mínima de 27 (vinte e sete) aulas ao longo do semestre vigente, conforme previsto na Cláusula Oitava deste instrumento.</p>
<p style="text-align: justify; margin-bottom: 15px;">11.2. O não atendimento a qualquer um dos critérios estabelecidos no item 11.1 implicará na reprovação automática do ESTUDANTE no módulo ou semestre.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">12. CLÁUSULA DÉCIMA SEGUNDA – DA INADIMPLÊNCIA</h4>

<p style="text-align: justify; margin-bottom: 10px;">12.1. Em caso de não pagamento de qualquer valor devido pelo CONTRATANTE conforme o presente contrato e o Quadro 03, incidirão sobre o montante em atraso, a partir da data de seu vencimento até a efetiva quitação:</p>
<ul style="margin-left: 20px; margin-bottom: 10px;">
  <li>a) Multa de 2% (dois por cento) sobre o valor principal devido;</li>
  <li>b) Juros de mora de 1% (um por cento) ao mês;</li>
  <li>c) Atualização monetária com base no índice IGP-M/FGV (ou outro índice aplicável).</li>
</ul>
<p style="text-align: justify; margin-bottom: 15px;">12.2. O atraso no pagamento poderá, após notificação, implicar na suspensão dos serviços educacionais ao ESTUDANTE e, persistindo a inadimplência, na rescisão do presente contrato, nos termos da Cláusula Décima Terceira.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">13. CLÁUSULA DÉCIMA TERCEIRA – DO DIREITO DE ARREPENDIMENTO E DA RESCISÃO ANTECIPADA</h4>

<p style="text-align: justify; margin-bottom: 10px;">13.1. Do Direito de Arrependimento (Contratação Fora do Estabelecimento Comercial):</p>
<ul style="margin-left: 20px; margin-bottom: 10px;">
  <li>a) Em observância ao disposto no art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/90), o CONTRATANTE terá o prazo improrrogável de 7 (sete) dias corridos, contados a partir da data de assinatura do presente contrato ou da efetivação da primeira aquisição do pacote de aulas, para exercer seu direito de arrependimento.</li>
  <li>b) Este direito é aplicável exclusivamente às contratações realizadas fora do estabelecimento comercial físico da CONTRATADA (por exemplo, via internet, telefone, e-mail ou domicílio).</li>
  <li>c) Caso o direito de arrependimento seja exercido dentro do prazo legal, a CONTRATADA restituirá ao CONTRATANTE a integralidade dos valores eventualmente pagos (tais como Matrícula, Material Didático e/ou parcelas do Pacote de Aulas), desde que não tenha havido a utilização de qualquer aula ou serviço por parte do ESTUDANTE e o material didático seja devolvido em perfeito estado, sem indícios de uso.</li>
</ul>

<p style="text-align: justify; margin-bottom: 10px;">13.2. Da Rescisão Antecipada por Iniciativa do CONTRATANTE (Após 7 dias):</p>
<ul style="margin-left: 20px; margin-bottom: 10px;">
  <li>a) Decorrido o prazo de 7 (sete) dias para o direito de arrependimento ou nos casos de contratação diretamente no estabelecimento comercial, a manifestação de vontade do CONTRATANTE em rescindir o presente contrato e/ou cancelar a utilização do pacote de aulas deverá ser formalizada por comunicação escrita à CONTRATADA.</li>
  <li>b) Nesta hipótese de rescisão antecipada, serão devidos pelo CONTRATANTE os seguintes valores: i. o valor correspondente às aulas já usufruídas ou disponibilizadas ao ESTUDANTE até a data da solicitação formal de cancelamento, calculadas pro rata die ou por aula, conforme valor unitário previsto no Quadro 02 ou proporcional ao valor total do pacote; ii. Multa Rescisória: sobre o saldo remanescente do contrato (correspondente às parcelas vincendas e aulas não utilizadas), será aplicada uma multa compensatória equivalente a 10% (dez por cento). O saldo remanescente será calculado pela diferença entre o valor total do curso (conforme Quadro 03) e o valor das aulas já utilizadas/disponibilizadas.</li>
  <li>c) O valor a ser restituído ao CONTRATANTE, se houver, será o saldo positivo resultante da diferença entre os valores pagos até a data da rescisão e a soma dos valores devidos (aulas utilizadas + multa rescisória).</li>
  <li>d) Para fins de cálculo de restituição ou multa, não serão consideradas e nem gerarão direito a abatimento as aulas concedidas a título de benefício, gratuidade, aulas extras ou reposições concedidas em caráter de cortesia.</li>
</ul>

<p style="text-align: justify; margin-bottom: 10px;">13.3. Da Não Restituição de Matrícula e Material Didático:</p>
<ul style="margin-left: 20px; margin-bottom: 15px;">
  <li>a) A Taxa de Matrícula e o valor referente ao Material Didático, uma vez pagos e entregues, não serão passíveis de restituição, salvo na estrita hipótese de exercício do direito de arrependimento dentro do prazo legal de 7 (sete) dias, conforme detalhado no item 13.1 desta Cláusula.</li>
  <li>b) A natureza do material didático, conforme Cláusula Quinta, e o serviço de matrícula (que envolve custos administrativos de processamento) justificam sua não restituição após o prazo legal de arrependimento.</li>
</ul>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">14. CLÁUSULA DÉCIMA QUARTA – DA PROTEÇÃO DE DADOS PESSOAIS</h4>

<p style="text-align: justify; margin-bottom: 10px;">14.1. A TEEN SPEECH (doravante CONTRATADA) compromete-se a realizar o tratamento dos dados pessoais e dados pessoais sensíveis do CONTRATANTE e do ESTUDANTE em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis do ordenamento jurídico brasileiro.</p>
<p style="text-align: justify; margin-bottom: 15px;">14.2. O tratamento de dados ocorrerá exclusivamente para as finalidades específicas para as quais foram coletados (como a prestação de serviços educacionais, gestão de matrículas, comunicação e cumprimento de obrigações legais), utilizando-se apenas os dados estritamente necessários para tais fins.</p>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">15. CLÁUSULA DÉCIMA QUINTA – DAS DESPESAS COM A COBRANÇA E EXECUÇÃO</h4>

<p style="text-align: justify; margin-bottom: 10px;">Em caso de inadimplemento contratual que enseje a necessidade de cobrança (judicial ou extrajudicial) ou a execução do presente contrato, a parte que deu causa ao inadimplemento será responsável por arcar com todas as despesas decorrentes, incluindo, mas não se limitando a:</p>
<ul style="margin-left: 20px; margin-bottom: 15px;">
  <li>a) Custas processuais e taxas judiciárias;</li>
  <li>b) Despesas com notificações extrajudiciais e protestos;</li>
  <li>c) Honorários advocatícios, arbitrados em 20% (vinte por cento) sobre o valor total do débito (principal, juros, multa e atualização monetária), caso seja necessária a atuação de advogado para a cobrança ou defesa dos direitos da parte contrária; e</li>
  <li>d) Outras despesas comprovadamente realizadas para a recuperação do crédito ou a defesa do cumprimento do contrato.</li>
</ul>

<h4 style="text-align: center; margin: 20px 0; font-size: 14px; font-weight: bold;">16. CLÁUSULA DÉCIMA SEXTA – DO FORO</h4>

<p style="text-align: justify; margin-bottom: 15px;">16.1. As partes elegem o foro da COMARCA de Guarulhos, como único competente para decidir qualquer questão oriunda do presente contrato, em detrimento de qualquer outro por mais privilegiado que possa ser.</p>

<p style="text-align: center; margin-bottom: 8px;">Estando as duas partes de acordo, declaram ciência através da assinatura deste, em duas vias de igual teor.</p>
<p style="text-align: center; margin-bottom: 8px;">Guarulhos, ${new Date().getDate()} de ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} de ${new Date().getFullYear()}.</p>
<p style="text-align: center; margin-bottom: 8px;">Ciente e de acordo,</p>

<div style="text-align: center; margin: 10px 0;">
  <div style="margin-bottom: 10px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <!-- Espaço para assinatura do contratante -->
    </div>
    <div style="font-size: 14pt;">CONTRATANTE</div>
    <div style="font-size: 14pt;">${isContratanteResponsavel ? (nomeResponsavel || '<span class=\"placeholder-text\">Nome</span>') : (nomeAluno || '<span class=\"placeholder-text\">Nome</span>')} - ${isContratanteResponsavel ? (cpfResponsavelFmt || '<span class=\"placeholder-text\">CPF</span>') : (cpfFmt || '<span class=\"placeholder-text\">CPF</span>')}</div>
  </div>
  
  <div style="margin-bottom: 10px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <img src="${signatureImages.teenSpeech}" alt="Assinatura Teen Speech" style="max-width: 280px; max-height: 70px;" />
    </div>
    <div style="font-size: 14pt;">TEEN SPEECH</div>
    <div style="font-size: 14pt;">CONTRATADA</div>
  </div>
</div>

<div style="display: flex; justify-content: space-between; gap: 60px;">
  <div style="flex: 1; text-align: center;">
    <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 8px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
      <img src="${signatureImages.testemunha1}" alt="Testemunha 1" style="max-height: 70px; max-width: 180px; object-fit: contain;">
    </div>
    <div style="font-weight: bold; font-size: 10pt; margin-bottom: 5px;">Testemunha 1</div>
    <div style="font-size: 10pt; color: #666;">CPF: 567.641.218-69</div>
  </div>
  
  <div style="flex: 1; text-align: center;">
    <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 8px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
      <img src="${signatureImages.testemunha2}" alt="Testemunha 2" style="max-height: 70px; max-width: 180px; object-fit: contain;">
    </div>
    <div style="font-weight: bold; font-size: 10pt; margin-bottom: 5px;">Testemunha 2</div>
    <div style="font-size: 10pt; color: #666;">RG: 34.537.017-X</div>
  </div>
</div>

<div style="border: 1px solid #000; padding: 6px 10px; margin-bottom: 2px; page-break-before: always; break-before: page;">
  <h4 style="text-align: center; margin: 6px 0; font-size: 14px; font-weight: bold;">Direito de imagem</h4>
  <div style="text-align: center; margin-bottom: 6px; font-size: 13px; font-weight: bold;">01 – Identificação do Aluno</div>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 50%; vertical-align: top; padding: 0 5px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 40%; padding: 5px; font-weight: bold;">Nome do Aluno:</td>
            <td style="width: 60%; padding: 5px; border-bottom: 1px solid #000;">${student?.nome || '<span class="placeholder-text">Nome</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">CPF:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.cpf || '<span class="placeholder-text">CPF</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Endereço:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.endereco ? `${student.endereco}, ${student?.numero_endereco || ''}` : '<span class="placeholder-text">endereço</span>'}</td>
          </tr>
        </table>
      </td>
      <td style="width: 50%; vertical-align: top; padding: 0 5px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 40%; padding: 5px; font-weight: bold;">Telefone:</td>
            <td style="width: 60%; padding: 5px; border-bottom: 1px solid #000;">${student?.telefone || '<span class="placeholder-text">telefone</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">Data de Nascimento:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.data_nascimento ? new Date(student.data_nascimento).toLocaleDateString('pt-BR') : '<span class="placeholder-text">data de nascimento</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">E-mail:</td>
            <td style="padding: 5px; border-bottom: 1px solid #000;">${student?.email || '<span class="placeholder-text">e-mail</span>'}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>

<div style="margin-top: 2px;">
  <p style="text-align: justify; margin-bottom: 8px;">Pelo presente instrumento particular, a empresa TEEN SPEECH, com sede na cidade de Guarulhos - SP, na Avenida Armando Bei, nº 465, Vila Nova Bonsucesso - Inscrita no CNPJ nº30.857.093/0001-36 a seguir denominada PRESTADORA DE SERVIÇOS, e de outro lado o tomador de serviço identificado no quadro 01 e ao final assinado, doravante denominado ALUNO têm, entre si, justo e contratado o seguinte:</p>
  <p style="text-align: justify; margin-bottom: 15px;">1. Pelo presente instrumento particular e na melhor forma de direito, o ALUNO autoriza a PRESTADORA DE SERVIÇOS, desde já, em caráter irretratável e irrevogável, a:</p>
  <ol type="a" style="padding-left: 18px; text-align: justify;">
    <li>utilizar e veicular as fotografias realizadas com o registro da imagem do(a) ALUNO no “folder” sobre a PRESTADORA DE SERVIÇOS, para fins de publicidade institucional e/ou de produtos de serviços de inglês sem quaisquer limitações de números de inserções e reproduções;</li>
    <li>utilizar e veicular as fotografias acima referidas no site da PRESTADORA DE SERVIÇOS na Internet, nas redes Intranet e Extranet (redes de computadores restrita aos seus funcionários, fornecedores e empresas franqueadas);</li>
    <li>utilizar as fotografias na produção de quaisquer materiais publicitários e promocionais para fins de divulgação do “folder” da PRESTADORA DE SERVIÇOS, tais como, exemplificativamente, anúncios em revistas e jornais, folhetos, cartazetes, “posters”, filmes publicitários, “out door” e “bus door”, dentre outros, a serem veiculados, no Brasil e/ou no exterior, em quaisquer veículos, formatos e mídia (televisão, cinema, mídias impressa e alternativa, etc.), sem limitação de número de inserções e reproduções;</li>
    <li>utilizar as fotografias para a produção de materiais publicitários institucionais da PRESTADORA DE SERVIÇOS a serem veiculados nas mesmas condições previstas na alínea anterior; e</li>
    <li>utilizar as fotografias em veículos próprios da PRESTADORA DE SERVIÇOS, tais como jornais, manuais de treinamento de funcionários, boletins, catálogos e quaisquer outros materiais a serem distribuídos entre seus funcionários, fornecedores e empresas franqueadas.</li>
  </ol>
  <p style="text-align: justify; margin-bottom: 15px;">2. Os materiais publicitários referidos na cláusula anterior serão produzidos para utilização pela PRESTADORA DE SERVIÇOS e por suas empresas franqueadas, pelo prazo de 70 anos, a contar da data da assinatura do presente instrumento.</p>
  <p style="text-align: justify; margin-bottom: 15px;">3. A PRESTADORA DE SERVIÇOS fica autorizada a executar livremente a montagem das fotografias e dos materiais publicitários, objeto deste contrato, podendo proceder aos cortes e às fixações necessárias, utilizando-as, no entanto, para os fins previstos neste instrumento, e responsabilizando-se pela guarda e pela utilização da obra final produzida.</p>
  <p style="text-align: justify; margin-bottom: 15px;">4. O presente contrato é firmado em caráter irretratável e irrevogável, pelo mesmo obrigando-se as partes, em todos os seus termos, por si, seus herdeiros e sucessores.</p>
  <p style="text-align: justify; margin-bottom: 15px;">5. Fica eleito o foro da COMARCA de Guarulhos, como único competente para decidir qualquer questão oriunda do presente contrato, em detrimento de qualquer outro por mais privilegiado que possa ser.</p>
  <p style="text-align: justify; margin-bottom: 15px;">As partes, justas e contratadas, assinam o presente instrumento em 2 (duas) vias de igual teor e para um só efeito, na presença de duas testemunhas, para que produza os seus efeitos legais.</p>
</div>

<div style="text-align: center; margin: 20px 0;">
  <div style="margin-bottom: 30px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <!-- Espaço para assinatura do contratante -->
    </div>
    <div style="font-size: 14pt;">CONTRATANTE</div>
    <div style="font-size: 14pt;">${isContratanteResponsavel ? (nomeResponsavel || '<span class=\"placeholder-text\">Nome</span>') : (nomeAluno || '<span class=\"placeholder-text\">Nome</span>')} - ${isContratanteResponsavel ? (cpfResponsavelFmt || '<span class=\"placeholder-text\">CPF</span>') : (cpfFmt || '<span class=\"placeholder-text\">CPF</span>')}</div>
  </div>
  
  <div style="margin-bottom: 30px;">
    <div style="border-bottom: 1px solid #000; width: 300px; margin: 0 auto 10px; height: 80px; display: flex; align-items: end; justify-content: center;">
      <img src="${signatureImages.teenSpeech}" alt="Assinatura Teen Speech" style="max-width: 280px; max-height: 70px;" />
    </div>
    <div style="font-size: 14pt;">TEEN SPEECH</div>
    <div style="font-size: 14pt;">CONTRATADA</div>
  </div>
</div>

<div style="margin-top: 50px;">
  <div style="text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 14px;">TESTEMUNHAS</div>
  <div style="display: flex; justify-content: space-between; gap: 60px; margin-bottom: 30px;">
    <div style="flex: 1; text-align: center;">
      <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
        <img src="${signatureImages.testemunha1}" alt="Testemunha 1" style="max-height: 70px; max-width: 180px; object-fit: contain;" />
      </div>
      <div style="font-weight: bold; font-size: 10pt; margin-bottom: 5px;">Testemunha 1</div>
      <div style="font-size: 10pt; color: #666;">CPF: 567.641.218-69</div>
    </div>
    
    <div style="flex: 1; text-align: center;">
      <div style="height: 80px; border-bottom: 1px solid #000; margin-bottom: 15px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
        <img src="${signatureImages.testemunha2}" alt="Testemunha 2" style="max-height: 70px; max-width: 180px; object-fit: contain;" />
      </div>
      <div style="font-weight: bold; font-size: 10pt; margin-bottom: 5px;">Testemunha 2</div>
      <div style="font-size: 10pt; color: #666;">RG: 34.537.017-X</div>
    </div>
  </div>
</div>
  ` : ''}
    `;
  };

  const handleEdit = () => {
    setIsEditing(true);
    const currentContent = (savedContent && savedContent.includes('CRONOGRAMA DE AULAS')) ? savedContent : generateContractContent();
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

  const handlePrint = () => {
    const contentToPrint = isEditing ? editableContent : ((savedContent && savedContent.includes('CRONOGRAMA DE AULAS')) ? savedContent : generateContractContent());
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato - ${student?.nome || 'Aluno'}</title>
          <style>
            body { font-family: Garamond, serif; margin: 0; }
            img { max-width: 100%; height: auto; }
            @page { size: A4; margin: 12mm 8mm; }
            @media print {
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              body { margin: 0; }
              h1, h2, h3 { page-break-after: avoid !important; break-after: avoid !important; }
              table, tr, td, div, section { page-break-inside: avoid !important; break-inside: avoid !important; }
              /* Evitar quebra de assinaturas */
              img[alt*="Assinatura"], img[alt*="Signature"], img[alt*="Testemunha"], .signature, .sign-area, figure {
                page-break-inside: avoid !important; break-inside: avoid !important;
              }
            }
            .contract-preview { font-size: 10pt; }
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
  };

  const handleDownload = async () => {
    if (!student) return;
    
    try {
      // Preparar elemento temporário com layout A4
      const contentToPrint = isEditing ? editableContent : ((savedContent && savedContent.includes('CRONOGRAMA DE AULAS')) ? savedContent : generateContractContent());
      const tempDiv = document.createElement('div');
      tempDiv.id = 'contrato';
      tempDiv.className = 'container-pdf editable-contract contract-preview';
      tempDiv.innerHTML = contentToPrint;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.minHeight = '297mm';
      tempDiv.style.background = '#fff';
      tempDiv.style.padding = '20mm';
      tempDiv.style.boxSizing = 'border-box';

      // CSS robusto para tabelas e quebras de página
      const styleEl = document.createElement('style');
      styleEl.textContent = `
      .contract-preview { font-size: 10pt; }
      .contract-preview table { width: 100%; border-collapse: collapse; }
      .contract-preview thead { display: table-header-group; }
      .contract-preview tfoot { display: table-footer-group; }
      .contract-preview tr, .contract-preview td, .contract-preview th { page-break-inside: avoid; break-inside: avoid; }
      .contract-preview table { page-break-inside: auto; break-inside: auto; }
      .contract-preview td, .contract-preview th { word-break: break-word; }
      `;
      tempDiv.insertBefore(styleEl, tempDiv.firstChild);

      // Marcar elementos de tabela para evitar quebras
      tempDiv.querySelectorAll('table, thead, tbody, tr, td, th').forEach(el => {
        el.classList.add('page-break-avoid');
      });

      document.body.appendChild(tempDiv);

      // Aguarda layout e fontes para evitar captura com altura 0
      await new Promise(resolve => setTimeout(resolve, 500));
      try { await (document as any).fonts?.ready; } catch {}

      // Gerar PDF com html2pdf (com pagebreaks e imagens)
      const html2pdf = (await import('html2pdf.js')).default as any;

      // Medir dimensões reais do conteúdo
      const rect = tempDiv.getBoundingClientRect();
      const windowWidth = Math.ceil(rect.width || tempDiv.scrollWidth || 794); // ~210mm em px a ~96dpi
      const windowHeight = Math.ceil(tempDiv.scrollHeight || rect.height || 1123); // ~297mm

      const opt = {
        margin: 0,
        filename: 'contrato.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          scrollY: 0,
          windowWidth,
          windowHeight
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.page-break-avoid', 'table', 'thead', 'tbody', 'tr', 'td', 'th'] }
      };
      // Preload de imagens dentro do conteúdo
      const imgs = Array.from(tempDiv.querySelectorAll('img'));
      await Promise.all(
        imgs.map(img => new Promise(resolve => {
          if (img.complete) return resolve(true);
          img.addEventListener('load', () => resolve(true));
          img.addEventListener('error', () => resolve(true));
        }))
      );
      await html2pdf().set(opt).from(tempDiv).save();

      // Remover elemento temporário
      document.body.removeChild(tempDiv);

      toast({
        title: "PDF gerado com sucesso!",
        description: `O arquivo contrato.pdf foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
      
      // Fallback para impressão tradicional
      const contentToPrint = isEditing ? editableContent : ((savedContent && savedContent.includes('CRONOGRAMA DE AULAS')) ? savedContent : generateContractContent());
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Contrato - ${student.nome}</title>
            <style>
              /* Base screen styles */
              body { font-family: Garamond, serif; margin: 0; }
              img { max-width: 100%; height: auto; }
              /* Print A4 setup */
              @page { size: A4; margin: 12mm 8mm; }
              @media print {
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { margin: 0; }
                h1, h2, h3 { page-break-after: avoid !important; break-after: avoid !important; }
                table, tr, td, div, section { page-break-inside: avoid !important; break-inside: avoid !important; }
              }
              /* Container approximating A4 content area */
              .contract-preview { font-size: 10pt; }
              .container-pdf { width: 100%; background: white; padding: 0; box-sizing: border-box; }
            </style>
          </head>
          <body>
            <div id="contrato" class="container-pdf contract-preview">
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
                    Informações da Turma do Aluno
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
              {student?.alunos_financeiro && student.alunos_financeiro.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Identificações do Curso, Prazo e Horário
                  </h4>
                  <div className="space-y-4">
                    {student.alunos_financeiro.map((financeiro, index) => {
                      // Calculate total paid from parcelas_alunos
                      const valorPago = financeiro.parcelas_alunos?.reduce((total, parcela) => {
                        return total + (parseFloat(parcela.valor) || 0);
                      }, 0) || 0;
                      
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                                    {financeiro.planos && (
                                      <>
                                        {/* Coluna Esquerda: Nome do Plano, Valor Total (sem desconto), Número de Aulas */}
                                        <div className="space-y-1">
                                          <div>
                                            <span className="font-medium">Nome do Plano:</span> {financeiro.planos.nome || 'Não informado'}
                                          </div>
                                          <div>
                                            <span className="font-medium">Valor Total (sem desconto) :</span> R$ {financeiro.planos.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'Não informado'}
                                          </div>
                                          <div>
                                            <span className="font-medium">Número de Aulas:</span> {financeiro.planos.numero_aulas || 'Não informado'}
                                          </div>
                                        </div>

                                        {/* Coluna Direita: Demais informações */}
                                        <div className="space-y-1">
                                          <div>
                                            <span className="font-medium">Frequência:</span> {financeiro.planos.frequencia_aulas || 'Não informado'}
                                          </div>
                                          <div>
                                            <span className="font-medium">Descrição:</span> {financeiro.planos.descricao || 'Não informado'}
                                          </div>
                                          <div>
                                            <span className="font-medium">Parcelas:</span> {financeiro.parcelas_alunos?.length || 0}
                                          </div>
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
              {(!student?.alunos_financeiro || student.alunos_financeiro.length === 0) && (
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
                  variant={typeof selectedContract !== 'undefined' && selectedContract === 'contrato1' ? 'default' : 'outline'}
                  onClick={() => setSelectedContract('contrato1')}
                >
                  {planData?.nome || 'Plano Padrão'}
                </Button>

                {/* Mostrar opção de Contrato de Aulas Particulares apenas para alunos de turmas particulares */}
                {student?.turma_particular && (
                  <Button
                    variant={typeof selectedContract !== 'undefined' && selectedContract === 'contrato_particulares' ? 'default' : 'outline'}
                    onClick={() => setSelectedContract('contrato_particulares')}
                  >
                    Contrato de Aulas Particulares
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contrato Gerado</span>
                <div className="flex gap-3 items-center">
                  <Label htmlFor="responsavel-contratante" className="text-sm">Responsável</Label>
                  <Switch id="responsavel-contratante" checked={contratanteResponsavel} onCheckedChange={setContratanteResponsavel} className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted" />
                  {!isEditing ? (
                    <>
                      <Button onClick={handleEdit} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button onClick={handlePrint} variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
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
                  id="contrato"
                  className="container-pdf min-h-[600px] text-sm p-4 border rounded-lg bg-white editable-contract"
                  style={{ 
                    fontFamily: 'Garamond, serif', 
                    fontSize: '10pt', 
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
                  style={{ fontFamily: 'Garamond, serif', fontSize: '10pt', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: (savedContent && savedContent.includes('CRONOGRAMA DE AULAS')) ? savedContent : generateContractContent() }}
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