import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calcularProximaDataVencimento, encontrarPrimeiraParcela } from '@/utils/dateCalculators';
import { getProximoNumeroParcela } from '@/utils/parcelaNumbering';

// Modificar a interface para incluir qual parcela foi marcada
interface ParcelaPreview {
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  tipo_item: 'plano' | 'material' | 'matrícula' | 'cancelamento' | 'outros';
  descricao_item?: string;
  idioma_registro: 'Inglês' | 'Japonês';
  registro_financeiro_id: string;
  parcela_base_id: number; // ID da parcela que foi marcada como paga
  forma_pagamento?: string;
}

export const useParcelasMigrados = () => {
  const [parcelaPreview, setParcelaPreview] = useState<ParcelaPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { toast } = useToast();

  const marcarComoPageMigrado = async (
    parcelaId: number, 
    registroFinanceiroId: string,
    onSuccess?: () => void
  ) => {
    try {
      setLoadingPreview(true);

      // 1. Buscar todas as parcelas do registro ANTES de marcar como paga
      const { data: parcelas, error: parcelasError } = await supabase
        .from('parcelas_alunos')
        .select('*')
        .eq('registro_financeiro_id', registroFinanceiroId)
        .order('numero_parcela', { ascending: true });

      if (parcelasError) throw parcelasError;

      // 2. Verificar se a parcela que está sendo marcada como paga é a última da lista
      const parcelaParaMarcar = parcelas?.find(p => p.id === parcelaId);
      if (!parcelaParaMarcar) throw new Error('Parcela não encontrada');

      // Encontrar a última parcela do mesmo tipo (maior número de parcela do mesmo tipo_item)
      const parcelasMesmoTipo = parcelas?.filter(p => p.tipo_item === parcelaParaMarcar.tipo_item);
      const ultimaParcelaMesmoTipo = parcelasMesmoTipo?.reduce((ultima, atual) => 
        atual.numero_parcela > ultima.numero_parcela ? atual : ultima
      );

      const isUltimaParcelaMesmoTipo = ultimaParcelaMesmoTipo?.id === parcelaId;

      // 3. Marcar a parcela como paga
      const { error: updateError } = await supabase
        .from('parcelas_alunos')
        .update({
          status_pagamento: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          atualizado_em: new Date().toISOString()
        })
        .eq('id', parcelaId);

      if (updateError) throw updateError;

      // 4. Só criar preview se for a última parcela do mesmo tipo
      if (isUltimaParcelaMesmoTipo) {
        // Buscar a parcela que foi marcada como paga para usar como base
        const parcelaPaga = parcelas?.find(p => p.id === parcelaId);
        if (!parcelaPaga) throw new Error('Parcela não encontrada');

        // Encontrar a primeira parcela do mesmo tipo para calcular a data
        const primeiraParcelaMesmoTipo = parcelasMesmoTipo?.reduce((primeira, atual) => 
          atual.numero_parcela < primeira.numero_parcela ? atual : primeira
        );
        
        if (!primeiraParcelaMesmoTipo) throw new Error('Primeira parcela do tipo não encontrada');

        // Calcular próximo número de parcela para este tipo específico
        const proximoNumero = await getProximoNumeroParcela(registroFinanceiroId, parcelaPaga.tipo_item);

        // Calcular próxima data de vencimento - Fix: Convert string to Date
        const proximaDataVencimento = calcularProximaDataVencimento(
          new Date(primeiraParcelaMesmoTipo.data_vencimento),
          new Date(parcelaPaga.data_vencimento)
        );

        // Criar prévia da próxima parcela
        const preview: ParcelaPreview = {
          numero_parcela: proximoNumero,
          valor: parcelaPaga.valor,
          data_vencimento: proximaDataVencimento,
          tipo_item: parcelaPaga.tipo_item,
          descricao_item: parcelaPaga.descricao_item,
          idioma_registro: parcelaPaga.idioma_registro,
          registro_financeiro_id: registroFinanceiroId,
          parcela_base_id: parcelaId,
          forma_pagamento: parcelaPaga.forma_pagamento
        };

        setParcelaPreview(preview);

        toast({
          title: 'Parcela marcada como paga!',
          description: isUltimaParcelaMesmoTipo ? 'Deseja criar a próxima parcela?' : 'Parcela atualizada com sucesso!'
        });
      } else {
        toast({
          title: 'Parcela marcada como paga!',
          description: 'Parcela atualizada com sucesso!'
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao marcar parcela como paga',
        variant: 'destructive'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const criarProximaParcela = async () => {
    if (!parcelaPreview) {
      console.error('Nenhuma prévia de parcela disponível');
      toast({
        title: 'Erro',
        description: 'Nenhuma prévia de parcela disponível',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoadingPreview(true);
      console.log('Criando próxima parcela:', parcelaPreview);

      const { data, error } = await supabase
        .from('parcelas_alunos')
        .insert({
          registro_financeiro_id: parcelaPreview.registro_financeiro_id,
          numero_parcela: parcelaPreview.numero_parcela,
          valor: parcelaPreview.valor,
          data_vencimento: parcelaPreview.data_vencimento,
          status_pagamento: 'pendente',
          tipo_item: parcelaPreview.tipo_item,
          descricao_item: parcelaPreview.descricao_item,
          idioma_registro: parcelaPreview.idioma_registro,
          forma_pagamento: parcelaPreview.forma_pagamento,
          criado_em: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Erro do Supabase ao criar parcela:', error);
        throw error;
      }

      console.log('Parcela criada com sucesso:', data);

      toast({
        title: 'Sucesso!',
        description: 'Próxima parcela criada com sucesso'
      });

      setParcelaPreview(null);
      return data;
    } catch (error) {
      console.error('Erro ao criar próxima parcela:', error);
      toast({
        title: 'Erro',
        description: `Erro ao criar próxima parcela: ${error.message || 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const cancelarPreview = () => {
    setParcelaPreview(null);
  };

  return {
    parcelaPreview,
    loadingPreview,
    marcarComoPageMigrado,
    criarProximaParcela,
    cancelarPreview
  };
};