import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  dateFormat?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  error,
  className = "",
  dateFormat = "dd/MM/yyyy"
}) => {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [inputValue, setInputValue] = useState(
    value ? format(value, dateFormat, { locale: ptBR }) : ""
  );
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthNamesShort = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getYearRange = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    const years = [];
    
    for (let i = startYear - 1; i <= startYear + 10; i++) {
      years.push(i);
    }
    
    return years;
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

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        if (viewMode === 'years') {
          newDate.setFullYear(prev.getFullYear() - 10);
        } else {
          newDate.setFullYear(prev.getFullYear() - 1);
        }
      } else {
        if (viewMode === 'years') {
          newDate.setFullYear(prev.getFullYear() + 10);
        } else {
          newDate.setFullYear(prev.getFullYear() + 1);
        }
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

  const isSelected = (day: number) => {
    if (!value) return false;
    return (
      day === value.getDate() &&
      currentDate.getMonth() === value.getMonth() &&
      currentDate.getFullYear() === value.getFullYear()
    );
  };

  const isCurrentMonth = (monthIndex: number) => {
    const today = new Date();
    return (
      monthIndex === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedMonth = (monthIndex: number) => {
    return monthIndex === currentDate.getMonth();
  };

  const isCurrentYear = (year: number) => {
    const today = new Date();
    return year === today.getFullYear();
  };

  const isSelectedYear = (year: number) => {
    return year === currentDate.getFullYear();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onChange(selectedDate);
    setInputValue(format(selectedDate, dateFormat, { locale: ptBR }));
    setOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setViewMode('days');
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setViewMode('months');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    
    // Remove tudo que não é número
    const numbersOnly = inputVal.replace(/\D/g, '');
    
    // Aplica a formatação automática
    let formattedValue = '';
    if (numbersOnly.length > 0) {
      if (numbersOnly.length <= 2) {
        formattedValue = numbersOnly;
      } else if (numbersOnly.length <= 4) {
        formattedValue = `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
      } else {
        formattedValue = `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
      }
    }
    
    setInputValue(formattedValue);

    // Tenta fazer o parse da data quando tiver 10 caracteres (dd/MM/yyyy)
    if (formattedValue.length === 10) {
      try {
        const parsed = parse(formattedValue, dateFormat, new Date());
        if (isValid(parsed)) {
          onChange(parsed);
          setCurrentDate(parsed);
        }
      } catch {
        // Invalid date format
      }
    } else if (formattedValue === "") {
      onChange(null);
    }
  };

  const getNavigationFunction = () => {
    if (viewMode === 'days') return navigateMonth;
    return navigateYear;
  };

  const days = getDaysInMonth(currentDate);
  const years = getYearRange();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4 text-red-500" />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => e.stopPropagation()}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0 shadow-xl" align="start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-black text-white p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => getNavigationFunction()('prev')}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {viewMode === 'days' ? (
                <div className="flex items-center space-x-2">
                  <h3 
                    className="text-lg font-semibold cursor-pointer hover:bg-white/20 px-2 py-1 rounded"
                    onClick={() => setViewMode('months')}
                  >
                    {monthNames[currentDate.getMonth()]}
                  </h3>
                  <h3 
                    className="text-lg font-semibold cursor-pointer hover:bg-white/20 px-2 py-1 rounded"
                    onClick={() => setViewMode('years')}
                  >
                    {currentDate.getFullYear()}
                  </h3>
                </div>
              ) : viewMode === 'months' ? (
                <h3 
                  className="text-lg font-semibold cursor-pointer hover:bg-white/20 px-2 py-1 rounded"
                  onClick={() => setViewMode('years')}
                >
                  {currentDate.getFullYear()}
                </h3>
              ) : (
                <h3 className="text-lg font-semibold">
                  {Math.floor(currentDate.getFullYear() / 10) * 10} - {Math.floor(currentDate.getFullYear() / 10) * 10 + 9}
                </h3>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => getNavigationFunction()('next')}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'days' ? (
              <motion.div
                key="days"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Week days */}
                <div className="grid grid-cols-7 bg-gray-50">
                  {weekDays.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {days.map((day, index) => {
                    const isCurrentDay = day ? isToday(day) : false;
                    const isSelectedDay = day ? isSelected(day) : false;
                    
                    return (
                      <motion.button
                        key={index}
                        className={cn(
                          "h-10 w-10 text-sm transition-all duration-200 hover:bg-gradient-to-br hover:from-red-50 hover:to-gray-100",
                          day ? "text-gray-900" : "text-gray-300 cursor-not-allowed",
                          isCurrentDay && "bg-gradient-to-br from-red-100 to-gray-200 font-semibold text-red-700",
                          isSelectedDay && "bg-gradient-to-r from-red-500 to-gray-800 text-white font-semibold"
                        )}
                        onClick={() => day && handleDateSelect(day)}
                        disabled={!day}
                        whileHover={day ? { scale: 1.1 } : {}}
                        whileTap={day ? { scale: 0.95 } : {}}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : viewMode === 'months' ? (
              <motion.div
                key="months"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {/* Months grid */}
                <div className="grid grid-cols-3 gap-2">
                  {monthNamesShort.map((month, index) => {
                    const isCurrentMonthValue = isCurrentMonth(index);
                    const isSelectedMonthValue = isSelectedMonth(index);
                    
                    return (
                      <motion.button
                        key={month}
                        className={cn(
                          "h-12 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gradient-to-br hover:from-red-50 hover:to-gray-100",
                          "text-gray-900",
                          isCurrentMonthValue && "bg-gradient-to-br from-red-100 to-gray-200 font-semibold text-red-700",
                          isSelectedMonthValue && "bg-gradient-to-r from-red-500 to-gray-800 text-white font-semibold"
                        )}
                        onClick={() => handleMonthSelect(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {month}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="years"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {/* Years grid */}
                <div className="grid grid-cols-3 gap-2">
                  {years.map((year) => {
                    const isCurrentYearValue = isCurrentYear(year);
                    const isSelectedYearValue = isSelectedYear(year);
                    
                    return (
                      <motion.button
                        key={year}
                        className={cn(
                          "h-12 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gradient-to-br hover:from-red-50 hover:to-gray-100",
                          "text-gray-900",
                          isCurrentYearValue && "bg-gradient-to-br from-red-100 to-gray-200 font-semibold text-red-700",
                          isSelectedYearValue && "bg-gradient-to-r from-red-500 to-gray-800 text-white font-semibold"
                        )}
                        onClick={() => handleYearSelect(year)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {year}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50">
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange(new Date());
                  setInputValue(format(new Date(), dateFormat, { locale: ptBR }));
                  setCurrentDate(new Date());
                  setViewMode('days');
                  setOpen(false);
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange(null);
                  setInputValue("");
                  setOpen(false);
                }}
                className="text-gray-600 hover:bg-gray-100"
              >
                Limpar
              </Button>
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;