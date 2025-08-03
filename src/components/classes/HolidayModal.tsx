import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateCalculations';

// Função para obter o nome do feriado brasileiro
const getHolidayName = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateString = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const fixedHolidays: { [key: string]: string } = {
    '01-01': 'Confraternização Universal',
    '04-21': 'Tiradentes',
    '04-22': 'Descobrimento do Brasil',
    '05-01': 'Dia do Trabalhador',
    '06-24': 'São João',
    '09-07': 'Independência do Brasil',
    '10-12': 'Nossa Senhora Aparecida',
    '10-15': 'Dia do Professor',
    '11-02': 'Finados',
    '11-15': 'Proclamação da República',
    '11-20': 'Consciência Negra',
    '12-24': 'Véspera de Natal',
    '12-25': 'Natal',
    '12-31': 'Véspera de Ano Novo'
  };
  
  if (fixedHolidays[dateString]) {
    return fixedHolidays[dateString];
  }
  
  // Para feriados móveis, detectar baseado no contexto temporal
  const dayOfWeek = date.getDay();
  // Usar a variável month já declarada acima
  
  // Carnaval (fevereiro/março)
  if ((month === 2 || month === 3) && (dayOfWeek === 1 || dayOfWeek === 2)) {
    return dayOfWeek === 1 ? 'Segunda-feira de Carnaval' : 'Terça-feira de Carnaval';
  }
  
  // Sexta-feira Santa (março/abril)
  if ((month === 3 || month === 4) && dayOfWeek === 5) {
    return 'Sexta-feira Santa';
  }
  
  // Páscoa (março/abril)
  if ((month === 3 || month === 4) && dayOfWeek === 0) {
    return 'Domingo de Páscoa';
  }
  
  // Corpus Christi (maio/junho)
  if ((month === 5 || month === 6) && dayOfWeek === 4) {
    return 'Corpus Christi';
  }
  
  return 'Feriado Nacional';
};

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: Date[];
  onReschedule: (originalDate: Date, newDate: Date) => void;
  onIgnore: () => void;
  classDays: string[]; // Dias da semana da turma (ex: ['segunda', 'quarta'])
}

// Função para converter dias da semana em português para números (0 = domingo, 1 = segunda, etc.)
const getDayNumber = (dayName: string): number => {
  const dayMap: { [key: string]: number } = {
    'domingo': 0,
    'segunda': 1,
    'terca': 2,
    'terça': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sabado': 6,
    'sábado': 6
  };
  return dayMap[dayName.toLowerCase()] ?? -1;
};

const HolidayModal: React.FC<HolidayModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onReschedule,
  onIgnore,
  classDays
}) => {
  const [selectedHoliday, setSelectedHoliday] = useState<Date | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);

  const handleReschedule = () => {
    if (selectedHoliday && newDate) {
      onReschedule(selectedHoliday, newDate);
      setSelectedHoliday(null);
      setNewDate(undefined);
    }
  };

  const handleIgnoreAll = () => {
    onIgnore();
    onClose();
  };

  if (holidays.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Feriados Detectados
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Foram detectados <strong>{holidays.length}</strong> feriado(s) brasileiro(s) que coincidem com os dias de aula da turma.
              Os feriados já foram <strong>compensados automaticamente</strong> na data de fim. Você pode reagendar individualmente se necessário.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Feriados encontrados:</h4>
            <div className="grid gap-2">
              {holidays.map((holiday, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedHoliday?.getTime() === holiday.getTime()
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedHoliday(holiday)}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="font-medium">{formatDateForDisplay(holiday.toISOString().split('T')[0])}</span>
                      <span className="text-xs text-gray-600">{getHolidayName(holiday)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {holiday.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    </Badge>
                  </div>
                  {selectedHoliday?.getTime() === holiday.getTime() && (
                    <Badge className="bg-blue-100 text-blue-800">Selecionado</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedHoliday && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-gray-900">
                Reagendar aula de {formatDateForDisplay(selectedHoliday.toISOString().split('T')[0])}
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Você só pode reagendar para os dias da semana da turma: {classDays.join(', ')}
                </p>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={newDate}
                  onSelect={setNewDate}
                  disabled={(date) => {
                    // Desabilitar datas passadas e feriados
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Verificar se é um feriado
                    const isHoliday = holidays.some(h => 
                      h.toDateString() === date.toDateString()
                    );
                    
                    // Verificar se o dia da semana corresponde aos dias da turma
                    const dayOfWeek = date.getDay();
                    const allowedDays = classDays.map(day => getDayNumber(day));
                    const isValidDay = allowedDays.includes(dayOfWeek);
                    
                    return date < today || isHoliday || !isValidDay;
                  }}
                  className="rounded-md border"
                />
              </div>
              {newDate && (
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800">
                    Nova data: {formatDateForDisplay(newDate.toISOString().split('T')[0])}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleIgnoreAll}>
            Aceitar Compensação
          </Button>
          {selectedHoliday && newDate && (
            <Button onClick={handleReschedule} className="bg-blue-600 hover:bg-blue-700">
              Reagendar Selecionado
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayModal;