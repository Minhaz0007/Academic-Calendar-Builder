import React from 'react';
import { CalendarDay, LegendItem, ImportantDate } from '../types';

interface PrintViewProps {
  institutionName: string;
  subtitle: string;
  startYear: number;
  logoUrl: string | null;
  dayColors: Record<string, string>;
  legendItems: LegendItem[];
  importantDates: ImportantDate[];
  months: { year: number; month: number }[];
  accentColor?: string;
  highlightWeekends?: boolean;
}

export const PrintView: React.FC<PrintViewProps> = ({
  institutionName,
  subtitle,
  startYear,
  logoUrl,
  dayColors,
  legendItems,
  importantDates,
  months,
  accentColor = '#a5f3fc',
  highlightWeekends = false,
}) => {
  // Determine grid columns for different month counts
  const cols = months.length <= 6 ? 3 : months.length <= 9 ? 3 : 4;

  return (
    <div className="hidden print:flex flex-col w-full h-full bg-white text-black font-serif p-0 box-border">
      {/* Header */}
      <header className="flex items-center justify-center mb-2 border-b-2 border-black pb-2 relative">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-20 w-20 object-contain absolute left-0 top-0" />
        )}
        <div className="text-center">
          <h1 className="text-4xl font-bold uppercase tracking-wider">{institutionName}</h1>
          <p className="text-sm italic mt-0.5">{subtitle}</p>
          <h2 className="text-2xl font-bold mt-0.5">{startYear} / {startYear + 1}</h2>
        </div>
      </header>

      <div className="flex flex-1 gap-3 items-stretch min-h-0">
        {/* Left: Calendar Grid + Legend */}
        <div className="flex flex-col flex-[3] gap-2 min-h-0">

          {/* Month Grid */}
          <div
            className="flex-1 grid gap-x-2 gap-y-1"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {months.map(m => (
              <PrintMonth
                key={`${m.year}-${m.month}`}
                year={m.year}
                month={m.month}
                dayColors={dayColors}
                legendItems={legendItems}
                accentColor={accentColor}
                highlightWeekends={highlightWeekends}
              />
            ))}
          </div>

          {/* Legend Grid */}
          <div className="border border-black text-[9px]">
            <div
              className="grid"
              style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
            >
              {legendItems.map((item, i) => {
                const totalRows = Math.ceil(legendItems.length / 4);
                const row = Math.floor(i / 4);
                const col = i % 4;
                const isLastRow = row === totalRows - 1;
                const isLastCol = col === 3 || i === legendItems.length - 1;
                return (
                  <div
                    key={item.id}
                    className="flex"
                    style={{
                      borderRight: isLastCol ? 'none' : '1px solid black',
                      borderBottom: isLastRow ? 'none' : '1px solid black',
                    }}
                  >
                    {/* Colored label box */}
                    <div
                      className="flex items-center justify-center text-center font-bold uppercase leading-tight p-1"
                      style={{
                        backgroundColor: item.color,
                        width: '35%',
                        borderRight: '1px solid black',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.label}
                    </div>
                    {/* Description */}
                    <div className="flex items-center justify-center text-center leading-tight p-1 bg-white" style={{ width: '65%' }}>
                      {item.description || ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Important Dates */}
        <div className="flex-1 border-l-2 border-black pl-3 flex flex-col pt-1 min-h-0" style={{ maxWidth: '22%' }}>
          <h3 className="text-sm font-bold uppercase border-b-2 border-black mb-2 pb-0.5">
            Important Dates
          </h3>
          <div className="space-y-2 text-[10px] overflow-hidden">
            {importantDates.map(date => (
              <div key={date.id}>
                <div className="font-bold uppercase text-[9px]">{date.description}</div>
                <div className="whitespace-pre-wrap leading-tight text-gray-800">{date.dateRange}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Print-specific Month Component ────────────────────────────────────────────
const PrintMonth: React.FC<{
  year: number;
  month: number;
  dayColors: Record<string, string>;
  legendItems: LegendItem[];
  accentColor?: string;
  highlightWeekends?: boolean;
}> = ({ year, month, dayColors, legendItems, accentColor = '#a5f3fc', highlightWeekends = false }) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const shortYear = String(year).slice(-2);

  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ date: `pad-start-${i}`, isCurrentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      isCurrentMonth: true,
    });
  }
  const remaining = 42 - days.length;
  for (let i = 0; i < remaining; i++) {
    days.push({ date: `pad-end-${i}`, isCurrentMonth: false });
  }

  return (
    <div className="flex flex-col">
      {/* Month title bar */}
      <div
        className="text-black font-bold text-center text-[10px] uppercase py-0.5 border border-black border-b-0 leading-tight"
        style={{ backgroundColor: accentColor }}
      >
        {monthName} '{shortYear}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7 border border-black text-[7.5px] flex-1">
        {/* Weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center font-bold bg-gray-200 border-b border-black py-0.5 leading-tight"
            style={{ borderRight: i < 6 ? '1px solid #d1d5db' : 'none' }}
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
              key={idx}
              className={`aspect-square flex items-center justify-center relative ${day.isCurrentMonth ? '' : 'bg-gray-100'}`}
              style={{
                backgroundColor: colorId || (isWeekend ? '#e0f2fe' : undefined),
                borderRight: colIdx < 6 ? '1px solid #e5e7eb' : 'none',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <span className={`z-10 leading-none ${colorId ? 'font-bold' : ''}`}>
                {day.isCurrentMonth ? parseInt(day.date.split('-')[2]) : ''}
              </span>
              {showCross && (
                <div className="absolute inset-0 flex items-center justify-center">
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
