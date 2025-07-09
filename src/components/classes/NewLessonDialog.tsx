
import { useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DatePicker from '@/components/shared/DatePicker';

const lessonSchema = z.object({
  data: z.date({
    required_error: "A data da aula é obrigatória.",
  }),
  conteudo: z.string().min(1, "O conteúdo é obrigatório.").max(500, "O conteúdo pode ter no máximo 500 caracteres."),
});

interface NewLessonDialogProps {
  turmaId: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function NewLessonDialog({ turmaId, onSuccess, children }: NewLessonDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      conteudo: '',
      data: new Date(),
    },
  });

  const onSubmit = async (values: z.infer<typeof lessonSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('aulas')
        .insert({
          turma_id: turmaId,
          data: format(values.data, 'yyyy-MM-dd'),
          conteudo: values.conteudo,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Nova aula registrada.",
      });
      onSuccess();
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Aula</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
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
