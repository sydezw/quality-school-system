import { Tables } from '@/integrations/supabase/types';

// Tipos baseados nas tabelas do Supabase
export type Student = Tables<'alunos'>;
export type Plan = Tables<'planos'>;
export type FinanceiroAluno = Tables<'financeiro_alunos'>;
export type ParcelaAluno = Tables<'parcelas_alunos'>;

// Interfaces específicas para componentes
export interface StudentWithRelations extends Student {
  // Todos os campos já estão incluídos via Student (Tables<'alunos'>)
  // Adicionando apenas as relações
  turmas?: {
    nome: string;
    idioma: string;
    nivel?: string; // Incluindo nivel da turma caso seja necessário
  };
  responsaveis?: {
    nome: string;
    telefone: string;
    email?: string;
    cpf?: string;
    endereco?: string;
    numero_endereco?: string;
    data_nascimento?: string | null;
  };
}
