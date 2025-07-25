
import { z } from 'zod';

// Schema completo com todos os campos necessários
export const studentFormSchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
  data_nascimento: z.date().optional().nullable(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  endereco: z.string().optional(),
  numero_endereco: z.string().optional(), // Campo para número do endereço
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  idioma: z.string().optional(),
  nivel: z.string().optional(),
  turma_id: z.string().optional(),
  responsavel_id: z.string().optional().nullable(),
  status: z.enum(["Ativo", "Inativo", "Suspenso", "Trancado"]).optional(),
  observacoes: z.string().optional()
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
