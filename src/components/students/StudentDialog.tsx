
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, User, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentForm from './StudentForm';
import { Student } from '@/integrations/supabase/types';

interface Class {
  id: string;
  nome: string;
  idioma: string;
  nivel: string;
}

interface StudentDialogProps {
  isOpen: boolean;
  editingStudent: Student | null;
  classes: Class[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  onOpenCreate: () => void;
  hideButton?: boolean;
}

const StudentDialog = ({ 
  isOpen, 
  editingStudent, 
  classes, 
  onOpenChange, 
  onSubmit, 
  onOpenCreate,
  hideButton = false
}: StudentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {!hideButton && (
        <DialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              onClick={onOpenCreate} 
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="h-4 w-4" />
                Novo Aluno
              </motion.div>
            </Button>
          </motion.div>
        </DialogTrigger>
      )}
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-white via-gray-50 to-pink-50 border-0 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {/* Header com gradiente */}
              <DialogHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-lg">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {editingStudent ? (
                      <User className="h-6 w-6" />
                    ) : (
                      <GraduationCap className="h-6 w-6" />
                    )}
                  </div>
                  <DialogTitle className="text-2xl font-bold">
                    {editingStudent ? 'Editar Aluno' : 'Adicionar Novo Aluno'}
                  </DialogTitle>
                </motion.div>
              </DialogHeader>
              
              {/* Conteúdo do formulário */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <StudentForm
                    editingStudent={editingStudent}
                    classes={classes}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                  />
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default StudentDialog;
