
import { z } from 'zod';

// Função para verificar maioridade
function isMenorIdade(date?: Date | null) {
  if (!date) return false;
  const hoje = new Date();
  const idade = hoje.getFullYear() - date.getFullYear();
  if (
    hoje.getMonth() < date.getMonth() ||
    (hoje.getMonth() === date.getMonth() && hoje.getDate() < date.getDate())
  ) {
    return idade - 1 < 18;
  }
  return idade < 18;
}

export const studentFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório." }),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return z.string().email().safeParse(val).success;
  }, "Email deve ser válido (ex: usuario@exemplo.com)"),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero_endereco: z.string().optional(),
  idioma: z.string().optional(),
  turma_id: z.string().optional().nullable().or(z.literal('none')),
  responsavel_id: z.string().optional().nullable().or(z.literal('none')),
  status: z.string().optional(),
  data_nascimento: z.date().optional().nullable(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
