import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitText?: string;
  cancelText?: string;
  submitIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
}

const FormActions = ({ 
  onCancel, 
  isSubmitting, 
  submitText = "Salvar",
  cancelText = "Cancelar",
  submitIcon = <Save className="h-4 w-4 mr-2" />,
  cancelIcon = <X className="h-4 w-4 mr-2" />
}: FormActionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="flex justify-end gap-3 pt-6 border-t border-gray-200"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          {cancelIcon}
          {cancelText}
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
              />
              Salvando...
            </>
          ) : (
            <>
              {submitIcon}
              {submitText}
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default FormActions;