
import { z } from 'zod';

// Schema completo com todos os campos necessários
export const studentFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  data_nascimento: z.date().optional().nullable(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  endereco: z.string().optional(),
  numero_endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  idioma: z.string().optional(),
  nivel: z.string().optional(),
  turma_id: z.string().optional(),
  turma_particular_id: z.string().optional(),
  responsavel_id: z.string().optional().nullable(),
  status: z.enum(["Ativo", "Inativo", "Suspenso", "Trancado"]).optional(),
  observacoes: z.string().optional(),
  aulas_particulares: z.boolean().optional(), // Campo para aulas particulares
  aulas_turma: z.boolean().optional() // Campo para aulas de turma
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
