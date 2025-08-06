import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Filter,
  Search,
  Star,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: 'class' | 'meeting' | 'event' | 'birthday' | 'exam';
  participants?: number;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
}

interface CalendarTemplateProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: string) => void;
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  className?: string;
}

const CalendarTemplate: React.FC<CalendarTemplateProps> = ({
  events = [],
  onEventClick,
  onAddEvent,
  title = "Calendário",
  showFilters = true,
  showSearch = true,
  className = ""
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'meeting':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'event':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'birthday':
        return 'bg-gradient-to-r from-red-500 to-gray-800 text-white';
      case 'exam':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Star className="h-3 w-3 text-yellow-400 fill-current" />;
      case 'medium':
        return <Bell className="h-3 w-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = event.date.split('T')[0];
      const matchesDate = eventDate === dateStr;
      const matchesSearch = searchTerm === '' || event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || event.type === filterType;
      return matchesDate && matchesSearch && matchesFilter;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap px-4">
          <div className="p-3 bg-gradient-to-br from-red-500/10 to-gray-100 rounded-full flex-shrink-0">
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-gray-800 bg-clip-text text-transparent text-center min-w-0">
            {title}
          </h1>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-2xl font-bold text-gray-800 min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="flex gap-2">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            )}
            
            {showFilters && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Todos</option>
                <option value="class">Aulas</option>
                <option value="meeting">Reuniões</option>
                <option value="event">Eventos</option>
                <option value="birthday">Aniversários</option>
                <option value="exam">Provas</option>
              </select>
            )}
            
            {onAddEvent && (
              <Button
                onClick={() => onAddEvent(selectedDate || new Date().toISOString().split('T')[0])}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-red-500 to-gray-800 text-white border-0 hover:from-red-600 hover:to-gray-900 transition-all duration-300">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-semibold py-2">
                  {day}
                </div>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-0">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isCurrentDay = day ? isToday(day) : false;
                
                return (
                  <motion.div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-gray-100 p-2 cursor-pointer transition-all duration-200 hover:bg-gradient-to-br hover:from-red-50 hover:to-gray-100 ${
                      day ? 'bg-white' : 'bg-gray-50'
                    } ${
                      isCurrentDay ? 'bg-gradient-to-br from-red-100 to-gray-200 ring-2 ring-red-500' : ''
                    }`}
                    onClick={() => {
                      if (day) {
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        setSelectedDate(dateStr);
                        if (onAddEvent) onAddEvent(dateStr);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${
                          isCurrentDay ? 'text-red-700' : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                        
                        <div className="space-y-1">
                          <AnimatePresence>
                            {dayEvents.slice(0, 3).map((event, eventIndex) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, delay: eventIndex * 0.05 }}
                                className={`text-xs p-1 rounded cursor-pointer transition-all duration-200 hover:scale-105 ${
                                  getEventTypeColor(event.type)
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onEventClick) onEventClick(event);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate font-medium">{event.title}</span>
                                  {getPriorityIcon(event.priority)}
                                </div>
                                {event.time && (
                                  <div className="flex items-center gap-1 mt-1 opacity-90">
                                    <Clock className="h-2 w-2" />
                                    <span className="text-xs">{event.time}</span>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{dayEvents.length - 3} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Event Summary */}
      {events.length > 0 && (
        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {['class', 'meeting', 'event', 'birthday'].map((type) => {
            const count = events.filter(e => e.type === type).length;
            const typeNames = {
              class: 'Aulas',
              meeting: 'Reuniões', 
              event: 'Eventos',
              birthday: 'Aniversários'
            };
            
            return (
              <Card key={type} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                    getEventTypeColor(type).replace('text-white', 'text-white/80')
                  }`}>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {typeNames[type as keyof typeof typeNames]}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default CalendarTemplate;