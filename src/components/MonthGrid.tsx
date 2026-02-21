import React from 'react';
import { CalendarDay, LegendItem } from '../types';

interface MonthGridProps {
  year: number;
  month: number; // 0-11
  dayColors: Record<string, string>;
  legendItems: LegendItem[];
  onDayClick: (date: string, isShiftKey: boolean) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({ 
  year, 
  month, 
  dayColors, 
  legendItems,
  onDayClick 
}) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const shortYear = String(year).slice(-2);
  
  // Calculate days
  const days: CalendarDay[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Pad start
  const startPadding = firstDayOfMonth.getDay(); // 0 = Sunday
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: `pad-start-${i}`, isCurrentMonth: false });
  }
  
  // Days of month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ date: dateStr, isCurrentMonth: true });
  }
  
  // Pad end (optional, to fill grid)
  const remainingCells = 42 - days.length; // 6 rows * 7 cols
  for (let i = 0; i < remainingCells; i++) {
    days.push({ date: `pad-end-${i}`, isCurrentMonth: false });
  }

  return (
    <div className="break-inside-avoid font-serif">
      <h4 className="font-bold text-center mb-1 text-gray-900 uppercase tracking-wider text-sm border-b-2 border-transparent">
        {monthName} '{shortYear}
      </h4>
      <div className="grid grid-cols-7 gap-px bg-gray-300 border border-gray-300 text-[10px] leading-tight">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
          <div key={`${d}-${idx}`} className="bg-cyan-200 text-center py-0.5 font-bold text-black border-b border-gray-300">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const colorId = day.isCurrentMonth ? dayColors[day.date] : undefined;
          const legendItem = colorId ? legendItems.find(i => i.color === colorId) : undefined;
          
          const isColored = !!colorId;
          const showCross = legendItem?.style === 'cross';
          
          return (
            <div
              key={day.date}
              onClick={(e) => day.isCurrentMonth && onDayClick(day.date, e.shiftKey)}
              className={`
                aspect-square flex items-center justify-center cursor-pointer transition-colors relative
                ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-300'}
                ${isColored ? 'text-black font-bold' : 'text-gray-900 font-medium'}
              `}
              style={{ backgroundColor: colorId }}
            >
              <span className="relative z-10">
                {day.isCurrentMonth ? parseInt(day.date.split('-')[2]) : ''}
              </span>
              {showCross && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-black opacity-50 p-0.5">
                    <line x1="0" y1="0" x2="24" y2="24" stroke="currentColor" strokeWidth="2" />
                    <line x1="24" y1="0" x2="0" y2="24" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
