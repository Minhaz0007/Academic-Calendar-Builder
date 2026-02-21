import React from 'react';
import { CalendarDay, LegendItem } from '../types';
import { CalendarTheme } from '../themes';

interface MonthGridProps {
  year: number;
  month: number; // 0-11
  dayColors: Record<string, string>;
  legendItems: LegendItem[];
  onDayClick: (date: string) => void;
  onDayHover?: (date: string | null) => void;
  accentColor?: string;
  highlightWeekends?: boolean;
  pendingRangeStart?: string | null;
  hoveredDate?: string | null;
  previewColor?: string;
  theme?: CalendarTheme;
  dateFontSize?: number;
  dateBold?: boolean;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  month,
  dayColors,
  legendItems,
  onDayClick,
  onDayHover,
  accentColor,
  highlightWeekends = false,
  pendingRangeStart = null,
  hoveredDate = null,
  previewColor,
  theme,
  dateFontSize = 10,
  dateBold = false,
}) => {
  const effectiveAccent = accentColor ?? theme?.accentColor ?? '#a5f3fc';
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

  // Determine if a date is inside the hover-preview range
  const isInPreviewRange = (date: string): boolean => {
    if (!pendingRangeStart || !hoveredDate) return false;
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
    const lo = pendingRangeStart <= hoveredDate ? pendingRangeStart : hoveredDate;
    const hi = pendingRangeStart <= hoveredDate ? hoveredDate : pendingRangeStart;
    return date >= lo && date <= hi;
  };

  return (
    <div className="break-inside-avoid font-serif">
      <h4
        className="font-bold text-center mb-1 uppercase tracking-wider text-sm"
        style={{ color: theme?.monthTitleColor ?? '#111827' }}
      >
        {monthName} '{shortYear}
      </h4>
      <div
        className="grid grid-cols-7 gap-px leading-tight"
        style={{
          fontSize: `${dateFontSize}px`,
          backgroundColor: theme?.gridGap ?? '#d1d5db',
          border: `1px solid ${theme?.borderColor ?? '#d1d5db'}`,
        }}
      >
        {/* Weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
          <div
            key={`hdr-${idx}`}
            className="text-center py-0.5 font-bold border-b"
            style={{
              backgroundColor: effectiveAccent,
              color: theme?.headerTextColor ?? '#000000',
              borderColor: theme?.borderColor ?? '#d1d5db',
            }}
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
          const isWeekend = highlightWeekends && (colIdx === 0 || colIdx === 6);

          // Range selection states
          const isPendingStart = day.isCurrentMonth && day.date === pendingRangeStart;
          const inPreview = day.isCurrentMonth && !colorId && isInPreviewRange(day.date);

          let bgColor: string;
          if (!day.isCurrentMonth) {
            bgColor = theme?.nonCurrentBg ?? '#f3f4f6';
          } else if (colorId) {
            bgColor = colorId;
          } else if (inPreview && previewColor) {
            bgColor = previewColor + '55'; // 33% opacity preview
          } else if (isWeekend) {
            bgColor = theme?.weekendBg ?? '#e0f2fe';
          } else {
            bgColor = theme?.dayBg ?? '#ffffff';
          }

          const textColor = !day.isCurrentMonth
            ? (theme?.nonCurrentText ?? '#d1d5db')
            : colorId
            ? '#000000'
            : (theme?.dayText ?? '#111827');

          return (
            <div
              key={day.date + idx}
              onClick={() => day.isCurrentMonth && onDayClick(day.date)}
              onMouseEnter={() => day.isCurrentMonth && onDayHover?.(day.date)}
              onMouseLeave={() => onDayHover?.(null)}
              className={`
                aspect-square flex items-center justify-center transition-colors relative select-none
                ${day.isCurrentMonth ? 'cursor-pointer hover:opacity-80' : ''}
                ${isPendingStart ? 'ring-2 ring-inset ring-blue-500 ring-offset-0 z-10' : ''}
              `}
              style={{
                backgroundColor: bgColor,
                color: textColor,
                fontWeight: dateBold || colorId ? 700 : 500,
              }}
            >
              <span className="relative z-10 tabular-nums">
                {day.isCurrentMonth ? parseInt(day.date.split('-')[2]) : ''}
              </span>
              {showCross && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 24 24" className="w-full h-full opacity-50 p-0.5" style={{ color: textColor }}>
                    <line x1="0" y1="0" x2="24" y2="24" stroke="currentColor" strokeWidth="2" />
                    <line x1="24" y1="0" x2="0" y2="24" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              )}
              {isPendingStart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute top-0.5 right-0.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
