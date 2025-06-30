import { z } from "zod";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

export const teacherFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return cpfRegex.test(val);
  }, "CPF deve estar no formato 000.000.000-00"),
  telefone: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return phoneRegex.test(val);
  }, "Telefone deve estar no formato (00) 00000-0000"),
  email: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    return z.string().email().safeParse(val).success;
  }, "Email deve conter @ e um domínio válido (ex: usuario@gmail.com)"),
  idiomas: z.string().optional(),
  salario: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório")
});

export type TeacherFormData = z.infer<typeof teacherFormSchema>;