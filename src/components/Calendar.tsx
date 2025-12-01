import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/types/calendarEvent";
import { format, isSameDay } from 'date-fns';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  events: CalendarEvent[];
  selectedDate: Date | undefined;
}

const Calendar = ({ onDateSelect, events, selectedDate }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventDates = useMemo(() => {
    return new Set(events.map(event => format(new Date(event.date), 'yyyy-MM-dd')));
  }, [events]);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const days = [];
    let day = new Date(firstDayOfMonth);
    day.setDate(day.getDate() - day.getDay());

    for (let i = 0; i < 42; i++) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return { days, month };
  };

  const { days, month } = getDaysInMonth(currentDate);
  const today = new Date();

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect(today);
  };

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {currentDate.getFullYear()}.{(currentDate.getMonth() + 1).toString().padStart(2, '0')}.
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            TODAY
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day, index) => (
          <div
            key={day}
            className={`text-xs font-medium text-center py-2 ${
              index === 0 ? "text-rose-500" : index === 6 ? "text-blue-500" : "text-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const dateString = format(day, 'yyyy-MM-dd');
          const hasEvent = eventDates.has(dateString);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const dayOfWeek = day.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-200
                ${!isCurrentMonth ? "text-muted-foreground/30" : ""}
                ${isCurrentMonth && isWeekend && dayOfWeek === 0 ? "text-rose-500" : ""}
                ${isCurrentMonth && isWeekend && dayOfWeek === 6 ? "text-blue-500" : ""}
                ${isCurrentMonth && !isWeekend ? "text-foreground" : ""}
                ${isToday ? "ring-2 ring-primary" : ""}
                ${hasEvent && isCurrentMonth ? "bg-primary/20 text-primary-foreground" : ""}
                ${isSelected && isCurrentMonth ? "bg-primary text-primary-foreground" : ""}
                ${!isSelected && isCurrentMonth ? "hover:bg-secondary" : ""}
              `}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
