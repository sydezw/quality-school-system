
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { formatCPF, formatCEP, formatPhone } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2 } from 'lucide-react';

interface Responsible {
  id: string;
  nome: string;
  cpf: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  telefone: string | null;
}

interface ResponsibleFormProps {
  editingResponsible: Responsible | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ResponsibleForm = ({ editingResponsible, onSubmit, onCancel }: ResponsibleFormProps) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });
  const { toast } = useToast();
  const [loadingCep, setLoadingCep] = useState(false);
  const cpfValue = watch('cpf');
  const cepValue = watch('cep');
  const [hasExportedAddress, setHasExportedAddress] = useState(false);

  useEffect(() => {
    // Verificar se há endereço exportado
    const exportedAddress = localStorage.getItem('exportedAddress');
    setHasExportedAddress(!!exportedAddress);

    if (editingResponsible) {
      setValue('nome', editingResponsible.nome);
      setValue('cpf', editingResponsible.cpf ? formatCPF(editingResponsible.cpf) : '');
      setValue('endereco', editingResponsible.endereco || '');
      setValue('numero_endereco', editingResponsible.numero_endereco || '');
      setValue('telefone', editingResponsible.telefone || '');

      let cep = '';
      if (editingResponsible.endereco) {
        const cepMatch = editingResponsible.endereco.match(/\d{5}-?\d{3}/);
        if (cepMatch) {
          cep = formatCEP(cepMatch[0]);
        }
      }
      setValue('cep', cep);
    } else {
      reset({ nome: '', cpf: '', endereco: '', telefone: '', cep: '', numero_endereco: '' });
    }
  }, [editingResponsible, setValue, reset]);

  const importExportedAddress = async () => {
    const exportedAddress = localStorage.getItem('exportedAddress');
    if (exportedAddress) {
      try {
        const addressData = JSON.parse(exportedAddress);
        
        // Preencher o CEP primeiro
        if (addressData.cep) {
          setValue('cep', addressData.cep);
          
          // Executar a busca automática do CEP
          await handleCEPChange(addressData.cep);
        }
        
        // Preencher o número do endereço
        setValue('numero_endereco', addressData.numero_endereco || '');
        
        toast({
          title: "Endereço importado!",
          description: "O endereço exportado foi preenchido automaticamente com busca por CEP.",
        });
      } catch (error) {
        toast({
          title: "Erro ao importar endereço",
          description: "Não foi possível importar o endereço exportado.",
          variant: "destructive",
        });
      }
    }
  };

  const clearExportedAddress = () => {
    localStorage.removeItem('exportedAddress');
    setHasExportedAddress(false);
    toast({
      title: "Endereço exportado removido",
      description: "O endereço exportado foi limpo da memória.",
    });
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setValue('cpf', formattedCPF);
  };

  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, CEP: ${cep}`;
          setValue('endereco', endereco);
          toast({
            title: "CEP encontrado!",
            description: "Endereço preenchido automaticamente. Adicione apenas o número.",
          });
        } else {
          setValue('endereco', '');
          toast({
            title: "CEP não encontrado",
            description: "Verifique se o CEP está correto.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível consultar o CEP.",
          variant: "destructive",
        });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleFormSubmit = (data: any) => {
    // Validação manual para evitar mensagens de erro temporárias
    if (!data.nome || data.nome.trim() === '') {
      toast({
        title: "Erro",
        description: "O nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const { cep, ...rest } = data;
    const submitData = {
      nome: data.nome || '',
      cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
      endereco: data.endereco || null,
      numero_endereco: data.numero_endereco || null,
      telefone: data.telefone || null
    };
    console.log('Dados sendo enviados:', submitData);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          {...register('nome')}
          placeholder="Nome completo do responsável"
        />
        {errors.nome && (
          <p className="text-sm text-red-600 mt-1">Nome é obrigatório</p>
        )}
      </div>

      <div>
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          value={cpfValue || ''}
          onChange={handleCPFChange}
          placeholder="000.000.000-00"
          maxLength={14}
        />
      </div>

      <div>
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          value={cepValue || ''}
          onChange={(e) => {
            const formattedCep = formatCEP(e.target.value);
            setValue('cep', formattedCep);
            handleCEPChange(formattedCep);
          }}
          placeholder="00000-000"
          maxLength={9}
          disabled={loadingCep}
        />
        {loadingCep && <p className="text-sm text-muted-foreground mt-1">Buscando CEP...</p>}
      </div>

      <div>
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          {...register('endereco')}
          placeholder="Preenchido automaticamente pelo CEP"
        />
      </div>

      <div>
        <Label htmlFor="numero_endereco">Número</Label>
        <Input
          id="numero_endereco"
          {...register('numero_endereco')}
          placeholder="Ex: 123"
        />
      </div>

      <div>
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          {...register('telefone')}
          placeholder="(11) 99999-9999"
          onChange={e => {
            const formatted = formatPhone(e.target.value);
            setValue('telefone', formatted);
          }}
          maxLength={15}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-brand-red hover:bg-brand-red/90">
          {editingResponsible ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ResponsibleForm;
