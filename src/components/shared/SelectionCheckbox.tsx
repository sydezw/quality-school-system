import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SelectionCheckboxProps {
  isSelected: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({
  isSelected,
  onChange,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      className="flex items-center justify-center"
    >
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`
          ${sizeClasses[size]}
          border-2 rounded-md transition-all duration-200 flex items-center justify-center
          ${isSelected 
            ? 'bg-[#D90429] border-[#D90429] text-white' 
            : 'bg-white border-gray-300 hover:border-[#D90429]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.div
          initial={false}
          animate={{ 
            scale: isSelected ? 1 : 0,
            opacity: isSelected ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          <Check className={iconSizes[size]} />
        </motion.div>
      </button>
    </motion.div>
  );
};