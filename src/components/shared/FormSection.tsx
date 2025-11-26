import React from 'react';
import { motion, Variants } from 'framer-motion';

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  gradient?: string;
  className?: string;
}

const FormSection = ({ 
  title, 
  icon, 
  children, 
  delay = 0, 
  gradient = "bg-[#6B7280]",
  className = ""
}: FormSectionProps) => {
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay * 0.1,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className={`group w-full ${className}`}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group-hover:border-gray-200">
        {/* Header expandido horizontalmente com gradiente vermelho-rosa */}
        <div className={`${gradient} px-6 py-4 border-b border-white/20`}>
          <div className="flex items-center gap-3 text-white">
            <div className="p-1 bg-white/20 rounded-lg">
              {icon}
            </div>
            <h3 className="text-lg font-semibold tracking-wide">
              {title}
            </h3>
          </div>
        </div>
        
        {/* Conteúdo com padding adequado */}
        <div className="bg-gray-50/30">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default FormSection;