
import React from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-10">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
