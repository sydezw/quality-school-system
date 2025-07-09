import { Tables } from '@/integrations/supabase/types';

// Tipos baseados nas tabelas do Supabase
export type Student = Tables<'alunos'>;
export type Plan = Tables<'planos'>;
export type FinanceiroAluno = Tables<'financeiro_alunos'>;
export type ParcelaAluno = Tables<'parcelas_alunos'>;

// Interfaces específicas para componentes
export interface StudentWithRelations extends Student {
  turmas?: {
    nome: string;
    idioma: string;
  };
  responsaveis?: {
    nome: string;
    telefone: string;
  };
}