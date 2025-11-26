# Assinaturas Digitais

Esta pasta contém as assinaturas digitais em formato JPG para uso nos contratos.

## Como usar:

1. **Adicione suas assinaturas**: Coloque os arquivos JPG das assinaturas nesta pasta
2. **Nomeação recomendada**:
   - `testemunha1.jpg` - Assinatura da primeira testemunha
   - `testemunha2.jpg` - Assinatura da segunda testemunha
   - `diretor.jpg` - Assinatura do diretor
   - `responsavel.jpg` - Assinatura do responsável

## Especificações técnicas:

- **Formato**: JPG/JPEG
- **Resolução recomendada**: 300x150 pixels (ou similar)
- **Fundo**: Transparente ou branco
- **Tamanho máximo**: 500KB por arquivo

## Implementação no código:

As assinaturas serão importadas e exibidas no contrato usando:

```typescript
import testemunha1 from '@/assets/signatures/testemunha1.jpg';
import testemunha2 from '@/assets/signatures/testemunha2.jpg';

// No JSX:
<img src={testemunha1} alt="Assinatura Testemunha 1" className="signature" />
```

## Nota de segurança:

Certifique-se de que as assinaturas digitais estão protegidas e são usadas apenas em contextos apropriados.