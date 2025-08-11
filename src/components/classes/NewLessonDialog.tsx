
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import DatePicker from '@/components/shared/DatePicker';

const lessonSchemaWithTurma = z.object({
  turma_id: z.string().min(1, "Selecione uma turma."),
  data: z.date({
    required_error: "A data da aula é obrigatória.",
  }),
  conteudo: z.string().min(1, "O conteúdo é obrigatório.").max(500, "O conteúdo pode ter no máximo 500 caracteres."),
});

const lessonSchemaWithoutTurma = z.object({
  data: z.date({
    required_error: "A data da aula é obrigatória.",
  }),
  conteudo: z.string().min(1, "O conteúdo é obrigatório.").max(500, "O conteúdo pode ter no máximo 500 caracteres."),
});

interface Turma {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
}

interface NewLessonDialogProps {
  turmaId?: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NewLessonDialog({ 
  turmaId, 
  onSuccess, 
  children, 
  isOpen, 
  onOpenChange 
}: NewLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const { toast } = useToast();
  
  const needsTurmaSelection = !turmaId;
  
  // Criamos dois formulários diferentes dependendo se precisamos selecionar turma ou não
  const formWithTurma = useForm<z.infer<typeof lessonSchemaWithTurma>>({
    resolver: zodResolver(lessonSchemaWithTurma),
    defaultValues: {
      turma_id: '',
      conteudo: '',
      data: new Date(),
    },
  });

  const formWithoutTurma = useForm<z.infer<typeof lessonSchemaWithoutTurma>>({
    resolver: zodResolver(lessonSchemaWithoutTurma),
    defaultValues: {
      conteudo: '',
      data: new Date(),
    },
  });

  // Escolhemos qual formulário usar
  const form = needsTurmaSelection ? formWithTurma : formWithoutTurma;

  // Controle de abertura do dialog
  const dialogOpen = isOpen !== undefined ? isOpen : open;
  const setDialogOpen = onOpenChange || setOpen;

  useEffect(() => {
    const fetchTurmas = async () => {
      if (!needsTurmaSelection) return;
      
      const { data, error } = await supabase
        .from('turmas')
        .select('id, nome, idioma, nivel')
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar turmas:', error);
        return;
      }

      setTurmas(data || []);
    };

    if (dialogOpen && needsTurmaSelection) {
      fetchTurmas();
    }
  }, [dialogOpen, needsTurmaSelection]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const finalTurmaId = turmaId || values.turma_id;
      
      const { error } = await supabase
        .from('aulas')
        .insert({
          turma_id: finalTurmaId,
          data: format(values.data, 'yyyy-MM-dd'),
          conteudo: values.conteudo,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Nova aula registrada.",
      });
      
      if (onSuccess) onSuccess();
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao registrar aula:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a nova aula.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Aula</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {needsTurmaSelection && (
              <FormField
                control={formWithTurma.control}
                name="turma_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turma</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.nome} - {turma.idioma} {turma.nivel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Aula</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione a data da aula"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conteudo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que foi ensinado na aula."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
