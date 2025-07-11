
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

// Remover a linha do complemento do schema:
export const studentFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  data_nascimento: z.date().optional().nullable(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  // complemento: z.string().optional(), // REMOVIDO
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório").max(2, "Estado deve ter 2 caracteres"),
  cep: z.string().min(1, "CEP é obrigatório"),
  idioma: z.string().min(1, "Idioma é obrigatório"),
  nivel: z.string().min(1, "Nível é obrigatório"),
  turma_id: z.string().min(1, "Turma é obrigatória"),
  responsavel_id: z.string().optional().nullable(),
  status: z.enum(["Ativo", "Inativo", "Suspenso"]).default("Ativo"),
  observacoes: z.string().optional()
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
