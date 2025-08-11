import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, BarChart3, List } from 'lucide-react';
import ClassesCalendar from '@/components/classes/ClassesCalendar';
import ClassesList from '@/components/classes/ClassesList';
import ClassesStats from '@/components/classes/ClassesStats';
import { NewLessonDialog } from '@/components/classes/NewLessonDialog';
import { motion } from 'framer-motion';

const Lessons = () => {
  const [isNewLessonDialogOpen, setIsNewLessonDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Aulas</h1>
        <Button 
          className="bg-[#D90429] text-white hover:bg-red-700 transition-colors flex items-center gap-2"
          onClick={() => setIsNewLessonDialogOpen(true)}
        >
          <Plus size={16} />
          Nova Aula
        </Button>
      </div>

      {/* Tabs de navegação */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-gray-200 p-1 rounded-lg shadow-lg">
          <motion.div 
            className="flex w-full"
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <TabsTrigger 
              value="calendar" 
              className="flex-1 data-[state=active]:bg-[#D90429] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendário
              </motion.span>
            </TabsTrigger>
            <TabsTrigger 
              value="list" 
              className="flex-1 data-[state=active]:bg-[#D90429] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Lista
              </motion.span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="flex-1 data-[state=active]:bg-[#D90429] data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 font-medium rounded-md"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </motion.span>
            </TabsTrigger>
          </motion.div>
        </TabsList>
        {/* Conteúdo das tabs */}
        <TabsContent value="calendar" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ClassesCalendar />
          </motion.div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ClassesList />
          </motion.div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ClassesStats />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* New Lesson Dialog */}
      <NewLessonDialog
        isOpen={isNewLessonDialogOpen}
        onOpenChange={setIsNewLessonDialogOpen}
      />
    </div>
  );
};

export default Lessons;