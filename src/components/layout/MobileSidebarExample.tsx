import React from 'react';
import MobileSidebar, { useMobileSidebar, MobileSidebarToggle } from './MobileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Exemplo de como implementar o MobileSidebar em uma página
 * 
 * Este componente demonstra:
 * 1. Como usar o hook useMobileSidebar
 * 2. Como integrar o MobileSidebarToggle
 * 3. Como renderizar o MobileSidebar
 * 4. Como adaptar o layout para mobile
 */

const MobileSidebarExample: React.FC = () => {
  const isMobile = useIsMobile();
  const { isOpen, toggle, close } = useMobileSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toggle Button - aparece apenas no mobile */}
      <MobileSidebarToggle onClick={toggle} />
      
      {/* Mobile Sidebar - aparece apenas no mobile */}
      <MobileSidebar isOpen={isOpen} onClose={close} />
      
      {/* Conteúdo principal */}
      <main className={`
        transition-all duration-300
        ${isMobile ? 'pt-20 px-4' : 'pt-8 px-8'}
      `}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Exemplo de Implementação - Mobile Sidebar
          </h1>
          
          <div className="grid gap-6">
            {/* Card de demonstração */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Como Implementar
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">1. Importar os componentes:</h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    import MobileSidebar, {`{ useMobileSidebar, MobileSidebarToggle }`} from './MobileSidebar';
                  </code>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">2. Usar o hook:</h3>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    const {`{ isOpen, toggle, close }`} = useMobileSidebar();
                  </code>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">3. Adicionar os componentes:</h3>
                  <div className="space-y-2">
                    <code className="block text-sm bg-gray-100 px-2 py-1 rounded">
                      {`<MobileSidebarToggle onClick={toggle} />`}
                    </code>
                    <code className="block text-sm bg-gray-100 px-2 py-1 rounded">
                      {`<MobileSidebar isOpen={isOpen} onClose={close} />`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Características do componente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Características do Mobile Sidebar
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">🎨 Design</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cores do site (brand-red #D72638)</li>
                    <li>• Ícones Lucide React</li>
                    <li>• Animações suaves com Framer Motion</li>
                    <li>• Design moderno e responsivo</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">⚡ Funcionalidades</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Off-canvas/Drawer lateral</li>
                    <li>• Overlay com backdrop blur</li>
                    <li>• Navegação com indicador ativo</li>
                    <li>• Controle de permissões</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">📱 Mobile First</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Aparece apenas no mobile</li>
                    <li>• Gestos de toque otimizados</li>
                    <li>• Fechamento automático</li>
                    <li>• Suporte a teclado (ESC)</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">🔧 Integração</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Hook useIsMobile</li>
                    <li>• Sistema de permissões</li>
                    <li>• React Router integrado</li>
                    <li>• TypeScript completo</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Status atual */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Status da Implementação
              </h2>
              
              <div className="space-y-2 text-green-700">
                <p>✅ Componente MobileSidebar criado</p>
                <p>✅ Hook useMobileSidebar implementado</p>
                <p>✅ Botão MobileSidebarToggle criado</p>
                <p>✅ Integração com sistema de permissões</p>
                <p>✅ Animações e transições suaves</p>
                <p>✅ Design responsivo e acessível</p>
              </div>
            </div>
            
            {/* Instruções de teste */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                Como Testar
              </h2>
              
              <div className="space-y-3 text-blue-700">
                <p>📱 <strong>No Mobile:</strong> Redimensione a janela para menos de 768px ou use as ferramentas de desenvolvedor</p>
                <p>🔘 <strong>Botão Toggle:</strong> Aparecerá no canto superior esquerdo</p>
                <p>📋 <strong>Menu Lateral:</strong> Desliza da esquerda com animação suave</p>
                <p>🎯 <strong>Navegação:</strong> Clique nos itens para navegar (fecha automaticamente)</p>
                <p>❌ <strong>Fechar:</strong> Clique no X, fora do menu, ou pressione ESC</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobileSidebarExample;