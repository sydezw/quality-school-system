import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, BarChart3, List, Menu, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import ClassesCalendar from '@/components/classes/ClassesCalendar';
import ClassesList from '@/components/classes/ClassesList';
import ClassesStats from '@/components/classes/ClassesStats';
import { NewLessonDialog } from '@/components/classes/NewLessonDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Lessons = () => {
  const [isNewLessonDialogOpen, setIsNewLessonDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const isMobile = useIsMobile();

  // Auto-hide swipe hint after 6 seconds
  useEffect(() => {
    if (isMobile && showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, showSwipeHint]);

  const tabs = ['calendar', 'list', 'stats'];
  const tabLabels = {
    calendar: { full: 'Calendario', short: 'Cal.' },
    list: { full: 'Lista', short: 'Lista' },
    stats: { full: 'Estatisticas', short: 'Stats' }
  };

  // Swipe gesture handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Navigation functions
  const goToPreviousTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const goToNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-4" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div 
            className={cn(
              "relative",
              isMobile && "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md px-4 py-2"
            )}
            style={{
              marginTop: activeTab === 'calendar' ? '-55px' : '0px',
              transition: 'margin-top 0.3s ease-in-out'
            }}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousTab}
                disabled={tabs.indexOf(activeTab) === 0}
                className={cn(
                  "h-10 w-10 p-0 rounded-lg transition-all duration-200",
                  tabs.indexOf(activeTab) === 0 
                    ? "opacity-30 cursor-not-allowed" 
                    : "hover:bg-gray-100 hover:scale-105"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <TabsList className={cn(
                "bg-white/95 backdrop-blur-md border border-gray-200/50 p-1 shadow-sm",
                isMobile ? "flex-1 grid grid-cols-3 h-12 rounded-xl" : "inline-flex rounded-lg"
              )}>
                {tabs.map((tab, index) => {
                  const Icon = tab === 'calendar' ? Calendar : tab === 'list' ? List : BarChart3;
                  const isActive = activeTab === tab;
                  
                  return (
                    <TabsTrigger 
                      key={tab}
                      value={tab}
                      className={cn(
                        "relative flex-1 transition-all duration-200 font-medium",
                        isMobile ? "text-xs py-2 px-2 rounded-lg" : "px-4 py-2 rounded-md",
                        isActive 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className={isMobile ? "hidden sm:inline" : ""}>
                          {isMobile ? tabLabels[tab as keyof typeof tabLabels].short : tabLabels[tab as keyof typeof tabLabels].full}
                        </span>
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextTab}
                disabled={tabs.indexOf(activeTab) === tabs.length - 1}
                className={cn(
                  "h-10 w-10 p-0 rounded-lg transition-all duration-200",
                  tabs.indexOf(activeTab) === tabs.length - 1
                    ? "opacity-30 cursor-not-allowed" 
                    : "hover:bg-gray-100 hover:scale-105"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {isMobile && (
            <div className="flex justify-center mt-3 space-x-1">
              {tabs.map((tab, index) => (
                <div
                  key={tab}
                  className={cn(
                    "h-1 w-6 rounded-full transition-all duration-200",
                    activeTab === tab ? "bg-blue-600" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          )}
            
          <div 
            className={cn(
              "relative overflow-hidden",
              isMobile && "touch-pan-y"
            )}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          >
            <AnimatePresence mode="wait">
              <TabsContent 
                key="calendar"
                value="calendar" 
                className={cn(
                  "space-y-4 focus:outline-none",
                  isMobile && "min-h-[60vh]"
                )}
              >
                {activeTab === 'calendar' && (
                  <motion.div
                    initial={{ opacity: 0, x: isMobile ? 100 : 0, y: isMobile ? 0 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: isMobile ? -100 : 0, y: isMobile ? 0 : -20 }}
                    transition={{ 
                      duration: isMobile ? 0.3 : 0.4, 
                      delay: isMobile ? 0 : 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    className="w-full"
                  >
                    <div className={cn(
                      "bg-white rounded-xl shadow-sm border border-gray-200",
                      isMobile && "mx-2 p-4 mt-20"
                    )}>
                      <ClassesCalendar />
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent 
                key="list"
                value="list" 
                className={cn(
                  "space-y-4 focus:outline-none",
                  isMobile && "min-h-[60vh]"
                )}
              >
                {activeTab === 'list' && (
                  <motion.div
                    initial={{ opacity: 0, x: isMobile ? 100 : 0, y: isMobile ? 0 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: isMobile ? -100 : 0, y: isMobile ? 0 : -20 }}
                    transition={{ 
                      duration: isMobile ? 0.3 : 0.4, 
                      delay: isMobile ? 0 : 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    className="w-full"
                  >
                    <div className={cn(
                      "bg-white rounded-xl shadow-sm border border-gray-200",
                      isMobile && "mx-2 p-4 mt-20"
                    )}>
                      <ClassesList />
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent 
                key="stats"
                value="stats" 
                className={cn(
                  "space-y-4 focus:outline-none",
                  isMobile && "min-h-[60vh]"
                )}
              >
                {activeTab === 'stats' && (
                  <motion.div
                    initial={{ opacity: 0, x: isMobile ? 100 : 0, y: isMobile ? 0 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: isMobile ? -100 : 0, y: isMobile ? 0 : -20 }}
                    transition={{ 
                      duration: isMobile ? 0.3 : 0.4, 
                      delay: isMobile ? 0 : 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    className="w-full"
                  >
                    <div className={cn(
                      "bg-white rounded-xl shadow-sm border border-gray-200",
                      isMobile && "mx-2 p-4 mt-20"
                    )}>
                      <ClassesStats />
                    </div>
                  </motion.div>
                )}
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.div>

      <NewLessonDialog
        isOpen={isNewLessonDialogOpen}
        onOpenChange={setIsNewLessonDialogOpen}
      />
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        className="fixed bottom-32 right-6 z-50 md:bottom-6"
      >
        <Button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#D90429] text-white hover:bg-[#B8001F] h-9 w-9 shadow-lg hover:shadow-xl"
          onClick={() => setIsNewLessonDialogOpen(true)}
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </motion.div>
      
      <AnimatePresence>
        {isMobile && showSwipeHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="fixed bottom-40 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-40"
          >
            Deslize para navegar entre as abas
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lessons;