
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
  cpf: z.string().min(1, { message: "CPF é obrigatório." }).max(14),
  telefone: z.string().min(8, { message: "Telefone é obrigatório." }),
  email: z.string()
    .email({ message: "Email inválido." })
    .min(3, { message: "Email é obrigatório." }),
  cep: z.string().min(8, { message: "CEP é obrigatório." }),
  endereco: z.string().min(3, { message: "Endereço é obrigatório." }),
  numero_endereco: z.string().min(1, { message: "Número do endereço é obrigatório." }),
  idioma: z.string().min(1, { message: "Idioma é obrigatório." }),
  turma_id: z.string().refine(val => val && val !== "none", { message: "Selecione uma turma antes de salvar." }),
  responsavel_id: z.string().optional().nullable(),
  status: z.string().min(1, { message: "Status é obrigatório." }),
  data_nascimento: z.date({
    required_error: "Data de nascimento é obrigatória."
  }).nullable().refine(val => !!val, { message: "Data de nascimento é obrigatória." }),
}).superRefine((data, ctx) => {
  // Validar responsável se menor
  const { data_nascimento, responsavel_id } = data as any;
  let menorDeIdade = false;

  if (data_nascimento instanceof Date) {
    menorDeIdade = isMenorIdade(data_nascimento);
  }

  if (menorDeIdade) {
    if (!responsavel_id || responsavel_id === "none") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["responsavel_id"],
        message: "Informe um responsável para alunos menores de idade.",
      });
    }
  }
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
