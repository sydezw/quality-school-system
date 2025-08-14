# Documentação de Otimização Mobile - Sistema Escolar Quality

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura Mobile-First](#arquitetura-mobile-first)
3. [Sistema de Responsividade](#sistema-de-responsividade)
4. [Componentes Mobile-Optimized](#componentes-mobile-optimized)
5. [Performance Mobile](#performance-mobile)
6. [UX/UI Mobile](#uxui-mobile)
7. [Testes e Validação](#testes-e-validação)
8. [Checklist de Implementação](#checklist-de-implementação)
9. [Monitoramento e Métricas](#monitoramento-e-métricas)
10. [Troubleshooting](#troubleshooting)

## Visão Geral

Este documento contém todas as diretrizes, implementações e boas práticas para garantir que o Sistema Escolar Quality seja 100% otimizado para dispositivos móveis.

### Tecnologias Base
- **React 18** com TypeScript
- **Tailwind CSS** para responsividade
- **Radix UI + shadcn/ui** para componentes acessíveis
- **Vite** para build otimizado
- **Supabase** para backend mobile-friendly

## Arquitetura Mobile-First

### 1. Breakpoints Padrão
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Smartphones grandes */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Telas grandes */
```

### 2. Hook de Detecção Mobile
```typescript
// src/hooks/use-mobile.tsx
const MOBILE_BREAKPOINT = 768;

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);
  
  return isMobile;
};
```

### 3. Layout Responsivo Principal
```typescript
// src/components/layout/AppLayout.tsx
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 mobile-single-column">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
```

## Sistema de Responsividade

### 1. CSS Global Mobile
```css
/* src/index.css */
@media (max-width: 768px) {
  /* Ajustes de fonte para inputs */
  input, select, textarea {
    font-size: 16px !important;
  }
  
  /* Tamanho mínimo de toque */
  button, .btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Scroll suave */
  * {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Previne zoom horizontal */
  body {
    overflow-x: hidden;
  }
  
  /* Cards responsivos */
  .card {
    margin: 0.5rem;
    border-radius: 0.75rem;
  }
  
  /* Formulários mobile */
  .form-container {
    padding: 1rem;
  }
  
  /* Sombras reduzidas */
  .shadow-lg {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  /* Sidebar mobile */
  .sidebar-mobile {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar-mobile.open {
    transform: translateX(0);
  }
}
```

### 2. Animações Mobile-Friendly
```css
/* src/index.css */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideInUp 0.4s ease-out;
}
```

## Componentes Mobile-Optimized

### 1. Aba de Aulas - Espaçamento Responsivo

A implementação do espaçamento responsivo na aba de aulas segue uma abordagem mobile-first com breakpoints específicos para diferentes dispositivos.

```typescript
// src/pages/app/TeacherClasses.tsx
const TeacherClasses = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Minhas Aulas</h1>
        <Button 
          size={isMobile ? "mobile" : "default"}
          className="w-full sm:w-auto"
        >
          Nova Aula
        </Button>
      </div>
      
      {/* Grid de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total de Aulas" value="24" />
        <StatCard title="Aulas Hoje" value="3" />
        <StatCard title="Próxima Aula" value="14:00" />
        <StatCard title="Alunos Ativos" value="156" />
      </div>
      
      {/* Calendário e lista de aulas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <ClassCalendar />
        </div>
        <div className="space-y-4">
          <ClassList />
        </div>
      </div>
    </div>
  );
};

// Componente StatCard otimizado para mobile
const StatCard = ({ title, value }: { title: string; value: string }) => {
  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-2">
        <p className="text-sm md:text-base text-muted-foreground">{title}</p>
        <p className="text-2xl md:text-3xl font-bold">{value}</p>
      </div>
    </Card>
  );
};
```

#### Especificações de Espaçamento

```css
/* Espaçamentos responsivos aplicados */
.space-y-4 > * + * { margin-top: 1rem; }     /* Mobile: 16px */
.md:space-y-6 > * + * { margin-top: 1.5rem; } /* Desktop: 24px */

.gap-4 { gap: 1rem; }     /* Mobile: 16px */
.md:gap-6 { gap: 1.5rem; } /* Desktop: 24px */

.p-4 { padding: 1rem; }     /* Mobile: 16px */
.md:p-6 { padding: 1.5rem; } /* Desktop: 24px */
```
 
 #### Espaçamento Superior de 100px - Aba de Aulas
 
 A implementação do espaçamento de 100px na aba de aulas foi otimizada para diferentes dispositivos:
 
 ```typescript
 // src/pages/app/Lessons.tsx
 const Lessons = () => {
   const [activeTab, setActiveTab] = useState('calendar');
   const isMobile = useIsMobile();
 
   return (
     <div className="space-y-4">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         {/* Tab Navigation com espaçamento fixo de 100px */}
          <div className="relative" style={{ marginTop: '100px' }}>
           <TabsList className={cn(
             "bg-white/95 backdrop-blur-md border border-gray-200/50 p-1 shadow-sm",
             isMobile ? "w-full grid grid-cols-3 h-12 rounded-xl" : "inline-flex rounded-lg"
           )}>
             {tabs.map((tab) => (
               <TabsTrigger key={tab} value={tab}>
                 {/* Conteúdo da tab */}
               </TabsTrigger>
             ))}
           </TabsList>
         </div>
         
         {/* Conteúdo das tabs */}
         <TabsContent value="calendar">
           <ClassesCalendar />
         </TabsContent>
         <TabsContent value="list">
           <ClassesList />
         </TabsContent>
         <TabsContent value="stats">
           <ClassesStats />
         </TabsContent>
       </Tabs>
     </div>
   );
 };
 ```
 
 #### Especificações Técnicas
  
  - **Todos os dispositivos**: `marginTop: '100px'` = 100px de espaçamento superior fixo
  - **Implementação**: Inline style para garantir consistência absoluta
  - **Responsividade**: Espaçamento uniforme em mobile e desktop
  - **Consistência**: Mantém exatamente 100px de distância do elemento superior
 
 #### Benefícios da Implementação
 
 1. **UX Mobile**: Espaçamento reduzido para melhor aproveitamento da tela
 2. **UX Desktop**: Espaçamento completo conforme design original
 3. **Performance**: Utiliza classes CSS nativas do Tailwind
 4. **Manutenibilidade**: Código limpo sem inline styles
 
 ### 3. Button Component
```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        mobile: "h-12 px-6 text-base", // Tamanho específico para mobile
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 2. Table Responsiva
```typescript
// src/components/ui/table.tsx
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));

// Implementação de tabela mobile com cards
const MobileTable = ({ data, columns }) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <Card key={index} className="p-4">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between py-2 border-b last:border-b-0">
                <span className="font-medium text-gray-600">{column.label}:</span>
                <span className="text-right">{item[column.key]}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <Table>
      {/* Implementação desktop normal */}
    </Table>
  );
};
```

### 3. Sidebar Mobile
```typescript
// src/components/layout/Sidebar.tsx
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "bg-white shadow-lg transition-transform duration-300 z-50",
        isMobile ? [
          "fixed left-0 top-0 h-full w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        ] : "relative w-64"
      )}>
        {/* Conteúdo da sidebar */}
      </aside>
      
      {/* Botão de toggle para mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-60 p-2 bg-white rounded-md shadow-lg md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  );
};
```

## Performance Mobile

### 1. Lazy Loading de Componentes
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const TeacherClasses = lazy(() => import('./pages/app/TeacherClasses'));
const Students = lazy(() => import('./pages/app/Students'));
const Financial = lazy(() => import('./pages/app/Financial'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/teacher-classes" element={<TeacherClasses />} />
        <Route path="/students" element={<Students />} />
        <Route path="/financial" element={<Financial />} />
      </Routes>
    </Suspense>
  );
};
```

### 2. Otimização de Imagens
```typescript
// src/components/shared/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      loading="lazy"
      decoding="async"
    />
  );
};
```

### 3. Virtualização para Listas Grandes
```typescript
// src/components/shared/VirtualizedList.tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  renderItem: ({ index, style }: any) => React.ReactElement;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  itemHeight,
  renderItem
}) => {
  const isMobile = useIsMobile();
  const height = isMobile ? window.innerHeight - 200 : 600;
  
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      className="scrollbar-thin scrollbar-thumb-gray-300"
    >
      {renderItem}
    </List>
  );
};
```

## UX/UI Mobile

### 1. Design do Calendário iOS

O design do calendário no iOS segue o Human Interface Guidelines da Apple, com um visual minimalista, tipografia limpa e foco na interação por toque. Aqui estão os principais pontos:

#### Características Visuais
- **Tipografia**: San Francisco (SF Pro) como fonte principal
- **Cores**: Sistema de cores adaptativo (light/dark mode)
- **Espaçamento**: Generoso para facilitar interação touch
- **Bordas**: Cantos arredondados (corner radius) consistentes
- **Sombras**: Sutis e funcionais, não decorativas

#### Princípios de Interação
- **Área de Toque**: Mínimo 44x44 pontos para elementos interativos
- **Feedback Tátil**: Haptic feedback para confirmações
- **Animações**: Fluidas e com propósito (ease-in-out)
- **Gestos**: Swipe, tap, long press intuitivos
- **Estados**: Clear, pressed, disabled bem definidos

#### Implementação no Sistema
```css
/* Calendário iOS-style */
.calendar-ios {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.calendar-day {
  min-height: 44px;
  min-width: 44px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.calendar-day:active {
  transform: scale(0.95);
  background: rgba(0, 122, 255, 0.1);
}
```

### 2. Gestos Touch
```typescript
// src/hooks/useSwipeGesture.ts
interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}: SwipeGestureOptions) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};
```

### 2. Modal Mobile-Friendly
```typescript
// src/components/ui/mobile-modal.tsx
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  const isMobile = useIsMobile();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      <div className={cn(
        "relative bg-white rounded-t-lg md:rounded-lg shadow-xl",
        isMobile 
          ? "w-full max-h-[90vh] animate-slide-up" 
          : "w-full max-w-md max-h-[80vh] animate-fade-in"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### 3. Form Mobile-Optimized
```typescript
// src/components/shared/MobileForm.tsx
interface MobileFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

const MobileForm: React.FC<MobileFormProps> = ({
  children,
  onSubmit,
  className
}) => {
  const isMobile = useIsMobile();
  
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "space-y-4",
        isMobile && "space-y-6 p-4",
        className
      )}
    >
      {children}
      
      {/* Botão fixo no bottom para mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button type="submit" className="w-full h-12">
            Salvar
          </Button>
        </div>
      )}
    </form>
  );
};
```

## Testes e Validação

### 1. Testes de Responsividade
```typescript
// src/tests/mobile.test.tsx
import { render, screen } from '@testing-library/react';
import { useIsMobile } from '../hooks/use-mobile';

// Mock do hook mobile
jest.mock('../hooks/use-mobile');
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  test('should render mobile layout on small screens', () => {
    mockUseIsMobile.mockReturnValue(true);
    
    render(<AppLayout><div>Test Content</div></AppLayout>);
    
    expect(screen.getByTestId('mobile-sidebar')).toBeInTheDocument();
  });

  test('should render desktop layout on large screens', () => {
    mockUseIsMobile.mockReturnValue(false);
    
    render(<AppLayout><div>Test Content</div></AppLayout>);
    
    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
  });
});
```

### 2. Performance Testing
```typescript
// src/tests/performance.test.tsx
import { measurePerformance } from '../utils/performance';

describe('Mobile Performance', () => {
  test('should load components within acceptable time', async () => {
    const startTime = performance.now();
    
    const { container } = render(<TeacherClasses />);
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(1000); // Menos de 1 segundo
  });

  test('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Student ${i}`,
      email: `student${i}@example.com`
    }));
    
    const startTime = performance.now();
    render(<VirtualizedList items={largeDataset} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(500);
  });
});
```

## Checklist de Implementação

### ✅ Estrutura Base
- [x] Hook `useIsMobile` implementado
- [x] Breakpoints Tailwind configurados
- [x] CSS global mobile implementado
- [x] Layout responsivo principal

### ✅ Componentes UI
- [x] Button com variante mobile
- [x] Table responsiva com fallback para cards
- [x] Modal mobile-friendly
- [x] Form otimizado para mobile
- [x] Sidebar com overlay mobile

### ✅ Performance
- [x] Lazy loading de rotas
- [x] Otimização de imagens
- [x] Virtualização para listas grandes
- [x] Code splitting implementado

### ✅ UX Mobile
- [x] Gestos touch implementados
- [x] Animações mobile-friendly
- [x] Tamanhos de toque adequados (44px mínimo)
- [x] Prevenção de zoom horizontal

### ✅ Componentes Específicos
- [x] Aba de Aulas com espaçamento responsivo
- [x] Calendário de aulas mobile-optimized
- [x] Lista de aulas com layout adaptativo
- [x] Estatísticas responsivas

### 🔄 Pendente
- [ ] PWA (Progressive Web App)
- [ ] Offline support
- [ ] Push notifications
- [ ] Biometric authentication

## Monitoramento e Métricas

### 1. Core Web Vitals
```typescript
// src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

// Métricas específicas para mobile
export const trackMobileMetrics = () => {
  // Tempo de carregamento inicial
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  const metrics = {
    loadTime: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
    domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
  };
  
  console.log('Mobile Performance Metrics:', metrics);
  return metrics;
};
```

### 2. Metas de Performance
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.8s

## Troubleshooting

### Problemas Comuns

#### 1. Zoom Indesejado em iOS
```css
/* Solução: Font-size mínimo de 16px em inputs */
input, select, textarea {
  font-size: 16px !important;
}
```

#### 2. Scroll Horizontal
```css
/* Solução: Overflow hidden no body */
body {
  overflow-x: hidden;
}

/* Container com max-width */
.container {
  max-width: 100vw;
  overflow-x: hidden;
}
```

#### 3. Performance em Listas Grandes
```typescript
// Solução: Implementar virtualização
import { FixedSizeList } from 'react-window';

// Ou paginação
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 20;
const paginatedItems = items.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

#### 4. Gestos Conflitantes
```css
/* Desabilitar gestos do navegador quando necessário */
.no-touch-action {
  touch-action: none;
}

.pan-y-only {
  touch-action: pan-y;
}
```

### Ferramentas de Debug

1. **Chrome DevTools Mobile Simulation**
2. **Lighthouse Mobile Audit**
3. **React DevTools Profiler**
4. **Bundle Analyzer** para otimização de tamanho

## Configurações de Build

### Vite Config Otimizado
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    host: true, // Para testar em dispositivos móveis na rede local
    port: 5173
  }
});
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview --host",
    "analyze": "npx vite-bundle-analyzer",
    "lighthouse": "lighthouse http://localhost:5173 --view"
  }
}
```

## Conclusão

Esta documentação fornece um guia completo para manter e expandir a otimização mobile do Sistema Escolar Quality. Todas as implementações seguem as melhores práticas da indústria e são testadas para garantir uma experiência mobile excepcional.

### Próximos Passos
1. Implementar PWA capabilities
2. Adicionar suporte offline
3. Implementar push notifications
4. Otimizar ainda mais o bundle size
5. Adicionar testes automatizados de performance

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0  
**Responsável**: Equipe de Desenvolvimento