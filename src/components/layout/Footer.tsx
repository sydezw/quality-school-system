import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-sm text-gray-600 leading-relaxed">
          <div className="font-medium">Todos os direitos reservados para</div>
          <div className="text-brand-red font-semibold">Sistema Escolar TS School</div>
          <div className="font-medium">©Flution 2025</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;