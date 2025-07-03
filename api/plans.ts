// Exemplo de API Route para lidar com operações de planos
// Este arquivo demonstra como implementar o backend para os novos campos

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

// Configuração do cliente Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role para operações do servidor
);

// Interface para o payload de criação/atualização de plano
interface PlanPayload {
  nome: string;
  descricao: string;
  numero_aulas: number;
  frequencia_aulas: string;
  valor_total: number;
  horario_por_aulas: number;
  permite_cancelamento?: boolean;
  permite_parcelamento?: boolean;
  observacoes?: string;
  ativo?: boolean;
}

// Função para criar um novo plano
export async function createPlan(payload: PlanPayload) {
  try {
    // Validações no servidor
    if (payload.valor_total <= 0) {
      return {
        success: false,
        error: 'Valor total deve ser maior que zero',
        code: 'INVALID_VALOR_TOTAL'
      };
    }

    if (payload.numero_aulas <= 0) {
      return {
        success: false,
        error: 'Número de aulas deve ser maior que zero',
        code: 'INVALID_NUMERO_AULAS'
      };
    }

    if (payload.horario_por_aulas <= 0) {
      return {
        success: false,
        error: 'Horário por aula deve ser maior que zero',
        code: 'INVALID_HORARIO_POR_AULAS'
      };
    }

    // Recalcular valores no servidor para garantir consistência
    const valor_por_aula = payload.valor_total / payload.numero_aulas;
    const carga_horaria_total = payload.numero_aulas * payload.horario_por_aulas;

    // Preparar dados para inserção
    const planData = {
      nome: payload.nome,
      descricao: payload.descricao,
      numero_aulas: payload.numero_aulas,
      frequencia_aulas: payload.frequencia_aulas,
      valor_total: payload.valor_total,
      valor_por_aula: Number(valor_por_aula.toFixed(2)),
      horario_por_aulas: payload.horario_por_aulas,
      carga_horaria_total: Number(carga_horaria_total.toFixed(1)),
      permite_cancelamento: payload.permite_cancelamento ?? false,
      permite_parcelamento: payload.permite_parcelamento ?? false,
      observacoes: payload.observacoes || null,
      ativo: payload.ativo ?? true
    };

    // Inserir no banco de dados
    const { data, error } = await supabase
      .from('planos')
      .insert([planData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar plano:', error);
      
      // Tratar erros específicos de constraint
      if (error.code === '23514') { // Check constraint violation
        if (error.message.includes('horario_por_aulas_positive')) {
          return {
            success: false,
            error: 'Horário por aula deve ser maior que zero',
            code: 'CONSTRAINT_HORARIO_POR_AULAS'
          };
        }
      }

      return {
        success: false,
        error: 'Erro interno do servidor ao criar plano',
        code: 'DATABASE_ERROR',
        details: error.message
      };
    }

    return {
      success: true,
      data: data,
      message: 'Plano criado com sucesso'
    };

  } catch (error) {
    console.error('Erro inesperado ao criar plano:', error);
    return {
      success: false,
      error: 'Erro inesperado no servidor',
      code: 'UNEXPECTED_ERROR'
    };
  }
}

// Função para atualizar um plano existente
export async function updatePlan(planId: string, payload: Partial<PlanPayload>) {
  try {
    // Buscar plano existente
    const { data: existingPlan, error: fetchError } = await supabase
      .from('planos')
      .select('*')
      .eq('id', planId)
      .single();

    if (fetchError || !existingPlan) {
      return {
        success: false,
        error: 'Plano não encontrado',
        code: 'PLAN_NOT_FOUND'
      };
    }

    // Mesclar dados existentes com novos dados
    const updatedData = { ...existingPlan, ...payload };

    // Validações (se os campos relevantes foram alterados)
    if (payload.valor_total !== undefined && payload.valor_total <= 0) {
      return {
        success: false,
        error: 'Valor total deve ser maior que zero',
        code: 'INVALID_VALOR_TOTAL'
      };
    }

    if (payload.numero_aulas !== undefined && payload.numero_aulas <= 0) {
      return {
        success: false,
        error: 'Número de aulas deve ser maior que zero',
        code: 'INVALID_NUMERO_AULAS'
      };
    }

    if (payload.horario_por_aulas !== undefined && payload.horario_por_aulas <= 0) {
      return {
        success: false,
        error: 'Horário por aula deve ser maior que zero',
        code: 'INVALID_HORARIO_POR_AULAS'
      };
    }

    // Recalcular valores se necessário
    let planData: any = { ...payload };
    
    if (payload.valor_total !== undefined || payload.numero_aulas !== undefined) {
      const valor_total = payload.valor_total ?? existingPlan.valor_total;
      const numero_aulas = payload.numero_aulas ?? existingPlan.numero_aulas;
      
      if (valor_total && numero_aulas) {
        planData.valor_por_aula = Number((valor_total / numero_aulas).toFixed(2));
      }
    }

    if (payload.numero_aulas !== undefined || payload.horario_por_aulas !== undefined) {
      const numero_aulas = payload.numero_aulas ?? existingPlan.numero_aulas;
      const horario_por_aulas = payload.horario_por_aulas ?? existingPlan.horario_por_aulas;
      
      if (numero_aulas && horario_por_aulas) {
        planData.carga_horaria_total = Number((numero_aulas * horario_por_aulas).toFixed(1));
      }
    }

    // Atualizar no banco de dados
    const { data, error } = await supabase
      .from('planos')
      .update(planData)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar plano:', error);
      
      // Tratar erros específicos de constraint
      if (error.code === '23514') {
        if (error.message.includes('horario_por_aulas_positive')) {
          return {
            success: false,
            error: 'Horário por aula deve ser maior que zero',
            code: 'CONSTRAINT_HORARIO_POR_AULAS'
          };
        }
      }

      return {
        success: false,
        error: 'Erro interno do servidor ao atualizar plano',
        code: 'DATABASE_ERROR',
        details: error.message
      };
    }

    return {
      success: true,
      data: data,
      message: 'Plano atualizado com sucesso'
    };

  } catch (error) {
    console.error('Erro inesperado ao atualizar plano:', error);
    return {
      success: false,
      error: 'Erro inesperado no servidor',
      code: 'UNEXPECTED_ERROR'
    };
  }
}

// Exemplo de uso em uma API Route do Next.js
export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const result = await createPlan(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    const result = await updatePlan(id, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}