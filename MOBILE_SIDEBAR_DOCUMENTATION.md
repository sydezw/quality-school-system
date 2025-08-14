# 📱 Mobile Sidebar - Documentação Completa

## 📋 Visão Geral

O **MobileSidebar** é um componente off-canvas/drawer lateral desenvolvido especificamente para dispositivos móveis, respeitando as cores e ícones do sistema TS School. Ele oferece uma navegação intuitiva e moderna para telas menores que 768px.

## 🎨 Design e Características

### Cores do Sistema
- **Cor Principal**: `brand-red (#D72638)` - Cor oficial do TS School
- **Gradientes**: Degradês suaves do vermelho principal
- **Estados**: Hover, ativo e foco com transições suaves
- **Contraste**: Cores otimizadas para acessibilidade

### Ícones
- **Biblioteca**: Lucide React (consistente com o sistema)
- **Tamanhos**: Responsivos e proporcionais
- **Estados**: Animações de hover e transformações

### Animações
- **Entrada**: Slide suave da esquerda para direita
- **Saída**: Retorno animado com spring physics
- **Overlay**: Fade in/out com backdrop blur
- **Itens**: Animação sequencial com delay escalonado

## 🔧 Estrutura dos Arquivos

```
src/components/layout/
├── MobileSidebar.tsx          # Componente principal
├── MobileSidebarExample.tsx   # Exemplo de implementação
└── MOBILE_SIDEBAR_DOCUMENTATION.md
```

## 📦 Componentes Exportados

### 1. `MobileSidebar`
Componente principal do drawer lateral.

```typescript
interface MobileSidebarProps {
  isOpen: boolean;    // Estado de abertura
  onClose: () => void; // Função para fechar
}
```

### 2. `useMobileSidebar`
Hook personalizado para gerenciar o estado.

```typescript
const { isOpen, toggle, open, close } = useMobileSidebar();
```

### 3. `MobileSidebarToggle`
Botão flutuante para abrir o menu.

```typescript
<MobileSidebarToggle onClick={toggle} />
```

## 🚀 Como Implementar

### Passo 1: Importar os Componentes

```typescript
import MobileSidebar, { 
  useMobileSidebar, 
  MobileSidebarToggle 
} from '@/components/layout/MobileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
```

### Passo 2: Configurar o Hook

```typescript
const YourComponent = () => {
  const isMobile = useIsMobile();
  const { isOpen, toggle, close } = useMobileSidebar();

  return (
    <div className="min-h-screen">
      {/* Seus componentes aqui */}
    </div>
  );
};
```

### Passo 3: Adicionar os Componentes

```typescript
return (
  <div className="min-h-screen">
    {/* Botão de toggle - aparece apenas no mobile */}
    <MobileSidebarToggle onClick={toggle} />
    
    {/* Sidebar mobile - aparece apenas no mobile */}
    <MobileSidebar isOpen={isOpen} onClose={close} />
    
    {/* Seu conteúdo principal */}
    <main className={isMobile ? 'pt-20 px-4' : 'pt-8 px-8'}>
      {/* Conteúdo da página */}
    </main>
  </div>
);
```

## 📱 Funcionalidades Mobile

### Detecção Automática
- Aparece apenas em telas < 768px
- Usa o hook `useIsMobile()` existente
- Desaparece automaticamente no desktop

### Gestos e Interações
- **Abrir**: Clique no botão flutuante
- **Fechar**: 
  - Clique no botão X
  - Clique no overlay
  - Pressione a tecla ESC
  - Navegação automática

### Acessibilidade
- Suporte completo a teclado
- ARIA labels apropriados
- Contraste de cores otimizado
- Foco visível e lógico

## 🔐 Sistema de Permissões

### Integração com Roles
O componente integra automaticamente com o sistema de permissões:

```typescript
const { isAdmin, isProfessor } = usePermissions();

// Filtragem automática dos itens do menu
const filteredMenuItems = menuItems.filter(item => {
  if (isAdmin) return item.roles.includes('admin');
  if (isProfessor) return item.roles.includes('professor');
  return false;
});
```

### Redirecionamentos Inteligentes
```typescript
const handleNavigation = (path: string) => {
  if (isProfessor && !isAdmin && path === '/classes') {
    return '/teacher-classes';
  }
  return path;
};
```

## 🎯 Itens do Menu

### Para Administradores
- Dashboard
- Alunos
- Turmas
- Aulas
- Materiais
- Planos
- Financeiro
- Relatórios
- Calendário
- Contratos
- Responsáveis
- Aniversários

### Para Professores
- Dashboard
- Minhas Turmas
- Aulas
- Calendário
- Aniversários

## 🎨 Customização de Estilos

### Cores Principais
```css
/* Cor principal do sistema */
.brand-red { color: #D72638; }

/* Gradientes */
.gradient-brand {
  background: linear-gradient(to right, #D72638, #dc2626);
}
```

### Classes Tailwind Utilizadas
```css
/* Layout */
fixed left-0 top-0 h-full w-80

/* Animações */
transition-all duration-200
transform hover:scale-110

/* Estados */
hover:bg-gray-50 active:bg-gray-100
bg-gradient-to-r from-brand-red to-red-600
```

## 🔄 Estados do Componente

### Estado Fechado
- Sidebar fora da tela (`x: '-100%'`)
- Overlay invisível
- Botão toggle visível

### Estado Aberto
- Sidebar visível (`x: 0`)
- Overlay com backdrop blur
- Scroll do body bloqueado
- Animações dos itens ativas

### Transições
```typescript
// Configuração das animações
transition={{ 
  type: 'spring', 
  stiffness: 300, 
  damping: 30,
  duration: 0.4 
}}
```

## 📊 Performance

### Otimizações
- Renderização condicional (apenas mobile)
- Lazy loading de animações
- Cleanup automático de event listeners
- Prevenção de re-renders desnecessários

### Bundle Size
- Componente modular
- Imports específicos do Lucide
- Tree shaking otimizado

## 🧪 Como Testar

### Teste Manual
1. **Redimensionar janela**: < 768px
2. **Ferramentas do desenvolvedor**: Modo mobile
3. **Dispositivos reais**: Teste em smartphones

### Cenários de Teste
- ✅ Abertura e fechamento
- ✅ Navegação entre páginas
- ✅ Diferentes permissões de usuário
- ✅ Responsividade
- ✅ Acessibilidade (teclado)
- ✅ Performance em dispositivos lentos

## 🔮 Próximas Melhorias

### Funcionalidades Futuras
- [ ] Suporte a gestos de swipe
- [ ] Modo escuro automático
- [ ] Personalização de largura
- [ ] Suporte a submenus
- [ ] Indicadores de notificação

### Otimizações
- [ ] Lazy loading de rotas
- [ ] Cache de estado
- [ ] Animações mais fluidas
- [ ] Suporte a PWA

## 📝 Exemplo Completo

```typescript
import React from 'react';
import MobileSidebar, { useMobileSidebar, MobileSidebarToggle } from '@/components/layout/MobileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const MyPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { isOpen, toggle, close } = useMobileSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Components */}
      <MobileSidebarToggle onClick={toggle} />
      <MobileSidebar isOpen={isOpen} onClose={close} />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isMobile ? 'pt-20 px-4' : 'pt-8 px-8'
      }`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Minha Página
          </h1>
          {/* Seu conteúdo aqui */}
        </div>
      </main>
    </div>
  );
};

export default MyPage;
```

## ✅ Checklist de Implementação

- ✅ **Componente criado**: `MobileSidebar.tsx`
- ✅ **Hook implementado**: `useMobileSidebar`
- ✅ **Botão toggle**: `MobileSidebarToggle`
- ✅ **Exemplo prático**: `MobileSidebarExample.tsx`
- ✅ **Documentação**: Este arquivo
- ✅ **Integração com permissões**: Sistema de roles
- ✅ **Design responsivo**: Mobile-first
- ✅ **Animações suaves**: Framer Motion
- ✅ **Acessibilidade**: WCAG compliant
- ✅ **TypeScript**: Tipagem completa

---

## 🎉 Conclusão

O **MobileSidebar** está pronto para uso e oferece uma experiência de navegação moderna e intuitiva para dispositivos móveis. O componente segue as melhores práticas de desenvolvimento React, mantém consistência com o design system do TS School e oferece excelente performance e acessibilidade.

**Desenvolvido com ❤️ para o TS School System**