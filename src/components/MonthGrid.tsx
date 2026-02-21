import React from 'react';
import { CalendarDay, LegendItem } from '../types';

interface MonthGridProps {
  year: number;
  month: number; // 0-11
  dayColors: Record<string, string>;
  legendItems: LegendItem[];
  onDayClick: (date: string, isShiftKey: boolean) => void;
  accentColor?: string;
  highlightWeekends?: boolean;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  month,
  dayColors,
  legendItems,
  onDayClick,
  accentColor = '#a5f3fc',
  highlightWeekends = false,
}) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const shortYear = String(year).slice(-2);

  // Build days array
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pad start (Sunday = 0)
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ date: `pad-start-${i}`, isCurrentMonth: false });
  }

  // Days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      isCurrentMonth: true,
    });
  }

  // Pad end to fill 6-row grid
  const remaining = 42 - days.length;
  for (let i = 0; i < remaining; i++) {
    days.push({ date: `pad-end-${i}`, isCurrentMonth: false });
  }

  return (
    <div className="break-inside-avoid font-serif">
      <h4 className="font-bold text-center mb-1 text-gray-900 uppercase tracking-wider text-sm">
        {monthName} '{shortYear}
      </h4>
      <div className="grid grid-cols-7 gap-px bg-gray-300 border border-gray-300 text-[10px] leading-tight">
        {/* Weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
          <div
            key={`hdr-${idx}`}
            className="text-center py-0.5 font-bold text-black border-b border-gray-300"
            style={{ backgroundColor: accentColor }}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, idx) => {
          const colorId = day.isCurrentMonth ? dayColors[day.date] : undefined;
          const legendItem = colorId ? legendItems.find(i => i.color === colorId) : undefined;
          const showCross = legendItem?.style === 'cross';
          const colIdx = idx % 7;
          const isWeekend = highlightWeekends && (colIdx === 0 || colIdx === 6) && day.isCurrentMonth && !colorId;

          return (
            <div
              key={day.date + idx}
              onClick={(e) => day.isCurrentMonth && onDayClick(day.date, e.shiftKey)}
              className={`
                aspect-square flex items-center justify-center transition-colors relative
                ${day.isCurrentMonth ? 'cursor-pointer hover:opacity-75' : 'bg-gray-100 text-gray-300'}
                ${colorId ? 'text-black font-bold' : 'text-gray-900 font-medium'}
              `}
              style={{
                backgroundColor: colorId || (isWeekend ? '#e0f2fe' : day.isCurrentMonth ? 'white' : undefined),
              }}
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
