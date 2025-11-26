
import React from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import MobileSidebar, { useMobileSidebar, MobileSidebarToggle } from './MobileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const { isOpen, toggle, close } = useMobileSidebar();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-16">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 px-4 py-2 md:p-6 mobile-single-column">
            <div className="space-y-1 md:space-y-4">
              {children}
            </div>
          </main>
        <Footer />
      </div>
      
      {/* Mobile Sidebar e Toggle - apenas no mobile */}
      {isMobile && (
        <>
          <MobileSidebar isOpen={isOpen} onClose={close} />
          <MobileSidebarToggle onClick={toggle} />
        </>
      )}
    </div>
  );
};

export default AppLayout;
