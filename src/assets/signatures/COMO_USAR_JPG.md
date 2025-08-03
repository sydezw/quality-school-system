# Como Implementar Assinaturas JPG Personalizadas

## Passo 1: Preparar suas assinaturas JPG

1. **Escaneie ou fotografe** as assinaturas em alta qualidade
2. **Edite as imagens** para remover o fundo (deixe transparente ou branco)
3. **Redimensione** para aproximadamente 200x80 pixels
4. **Salve** como JPG com qualidade alta

## Passo 2: Adicionar as imagens ao projeto

1. Coloque seus arquivos JPG nesta pasta (`src/assets/signatures/`)
2. Nomeie os arquivos como:
   - `testemunha1.jpg`
   - `testemunha2.jpg`
   - `diretor.jpg` (se necessário)

## Passo 3: Atualizar o código

No arquivo `ContractGenerator.tsx`, substitua as importações SVG por JPG:

```typescript
// Substitua estas linhas:
import testemunha1Signature from '@/assets/signatures/testemunha1.svg';
import testemunha2Signature from '@/assets/signatures/testemunha2.svg';

// Por estas:
import testemunha1Signature from '@/assets/signatures/testemunha1.jpg';
import testemunha2Signature from '@/assets/signatures/testemunha2.jpg';
```

## Passo 4: Configurar o Vite (se necessário)

Se houver problemas ao importar JPG, adicione ao `vite.config.ts`:

```typescript
export default defineConfig({
  // ... outras configurações
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg']
});
```

## Exemplo de estrutura final:

```
src/assets/signatures/
├── testemunha1.jpg     ← Sua assinatura JPG
├── testemunha2.jpg     ← Sua assinatura JPG
├── testemunha1.svg     ← Exemplo SVG (pode remover)
├── testemunha2.svg     ← Exemplo SVG (pode remover)
└── README.md
```

## Dicas importantes:

- **Qualidade**: Use JPG com qualidade 85-95% para melhor resultado
- **Tamanho**: Mantenha arquivos abaixo de 500KB
- **Fundo**: Prefira fundo branco para melhor contraste
- **Teste**: Sempre teste a impressão para verificar a qualidade

## Troubleshooting:

Se as imagens não aparecerem:
1. Verifique se os caminhos estão corretos
2. Confirme se os arquivos estão na pasta correta
3. Reinicie o servidor de desenvolvimento (`npm run dev`)
4. Verifique o console do navegador para erros