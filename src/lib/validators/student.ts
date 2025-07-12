
import { z } from 'zod';

// Schema simplificado apenas com campos essenciais
export const studentFormSchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
  data_nascimento: z.date().optional().nullable(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  endereco: z.string().optional(),
  idioma: z.string().optional(),
  turma_id: z.string().optional(),
  responsavel_id: z.string().optional().nullable(),
  status: z.enum(["Ativo", "Inativo", "Suspenso", "Trancado"]).optional()
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
