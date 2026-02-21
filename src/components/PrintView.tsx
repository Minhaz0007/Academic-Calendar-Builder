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
  dateFontSize?: number;
  dateBold?: boolean;
  headerTextColor?: string;
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
  dateFontSize = 10,
  dateBold = false,
  headerTextColor = '#000000',
}) => {
  const cols = months.length <= 6 ? 3 : months.length <= 9 ? 3 : 4;

  return (
    <div className="hidden print:flex print:flex-col w-full h-screen bg-white text-black font-serif overflow-hidden box-border">

      {/* ── Banner Header ── */}
      <header
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        {/* Logo — same fallback as CalendarHeader */}
        <div className="w-12 h-12 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 flex-shrink-0">
          <img
            src={logoUrl || '/logo.png'}
            alt="School Logo"
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Name + address */}
        <div className="flex-1 text-center leading-tight min-w-0">
          <div
            className="font-bold uppercase tracking-widest text-2xl leading-none"
            style={{ color: headerTextColor }}
          >
            {institutionName}
          </div>
          <div
            className="text-[9px] italic mt-0.5 opacity-85"
            style={{ color: headerTextColor }}
          >
            {subtitle}
          </div>
        </div>

        {/* Year */}
        <div className="text-right flex-shrink-0" style={{ color: headerTextColor }}>
          <div className="font-bold text-xl uppercase tracking-wide leading-tight">Academic Calendar</div>
          <div className="font-bold text-xl leading-none mt-0.5">
            {startYear} – {startYear + 1}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 gap-2 px-2 pb-2 min-h-0 overflow-hidden mt-1.5">

        {/* Left: Calendar grid + Legend */}
        <div className="flex flex-col flex-[4] gap-1.5 min-h-0">

          {/* Month grid */}
          <div
            className="flex-1 grid gap-x-1.5 gap-y-1 min-h-0"
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
                dateFontSize={dateFontSize}
                dateBold={dateBold}
                headerTextColor={headerTextColor}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="border border-black text-[8px] flex-shrink-0">
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${Math.min(legendItems.length, 4)}, 1fr)` }}
            >
              {legendItems.map((item, i) => {
                const cols4 = Math.min(legendItems.length, 4);
                const totalRows = Math.ceil(legendItems.length / cols4);
                const row = Math.floor(i / cols4);
                const col = i % cols4;
                const isLastRow = row === totalRows - 1;
                const isLastCol = col === cols4 - 1 || i === legendItems.length - 1;
                return (
                  <div
                    key={item.id}
                    className="flex"
                    style={{
                      borderRight: isLastCol ? 'none' : '1px solid black',
                      borderBottom: isLastRow ? 'none' : '1px solid black',
                    }}
                  >
                    <div
                      className="flex items-center justify-center text-center font-bold uppercase leading-tight p-0.5"
                      style={{ backgroundColor: item.color, width: '38%', borderRight: '1px solid black', wordBreak: 'break-word' }}
                    >
                      {item.label}
                    </div>
                    <div className="flex items-center justify-center text-center leading-tight p-0.5 bg-white" style={{ width: '62%' }}>
                      {item.description || ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Important Dates */}
        <div className="flex flex-col border-l-2 border-black pl-2 min-h-0 overflow-hidden" style={{ width: '18%', flexShrink: 0 }}>
          <h3 className="text-[9px] font-bold uppercase border-b-2 border-black mb-1 pb-0.5 flex-shrink-0">
            Important Dates
          </h3>
          <div className="space-y-1.5 text-[8px] overflow-hidden flex-1">
            {importantDates.map(date => (
              <div key={date.id}>
                <div className="font-bold uppercase text-[7.5px] leading-tight">{date.description}</div>
                <div className="whitespace-pre-wrap leading-tight text-gray-800 text-[7.5px]">{date.dateRange}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Print-specific Month Component ─────────────────────────────────────────
const PrintMonth: React.FC<{
  year: number;
  month: number;
  dayColors: Record<string, string>;
  legendItems: LegendItem[];
  accentColor?: string;
  highlightWeekends?: boolean;
  dateFontSize?: number;
  dateBold?: boolean;
  headerTextColor?: string;
}> = ({
  year, month, dayColors, legendItems,
  accentColor = '#a5f3fc', highlightWeekends = false,
  dateFontSize = 10, dateBold = false,
  headerTextColor = '#000000',
}) => {
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
    <div className="flex flex-col h-full">
      {/* Month title */}
      <div
        className="font-bold text-center uppercase leading-tight py-0.5 border border-black border-b-0"
        style={{ backgroundColor: accentColor, color: headerTextColor, fontSize: `${dateFontSize + 1}px` }}
      >
        {monthName} '{shortYear}
      </div>

      {/* Day grid */}
      <div
        className="grid grid-cols-7 border border-black flex-1"
        style={{ gridTemplateRows: 'auto repeat(6, 1fr)', fontSize: `${dateFontSize}px` }}
      >
        {/* Weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center font-bold bg-gray-200 border-b border-black leading-tight py-px"
            style={{ borderRight: i < 6 ? '1px solid #9ca3af' : 'none' }}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, idx) => {
          const legendItemId = day.isCurrentMonth ? dayColors[day.date] : undefined;
          const legendItem = legendItemId ? legendItems.find(i => i.id === legendItemId) : undefined;
          const colorId = legendItem?.color; // hex color for background
          const showCross = legendItem?.style === 'cross';
          const colIdx = idx % 7;
          const isWeekend = highlightWeekends && (colIdx === 0 || colIdx === 6) && day.isCurrentMonth && !colorId;

          return (
            <div
              key={idx}
              className={`flex items-center justify-center relative ${day.isCurrentMonth ? '' : 'bg-gray-100'}`}
              style={{
                backgroundColor: colorId || (isWeekend ? '#e0f2fe' : undefined),
                borderRight: colIdx < 6 ? '1px solid #e5e7eb' : 'none',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: dateBold || colorId ? 700 : 400,
              }}
            >
              <span className="z-10 leading-none">
                {day.isCurrentMonth ? parseInt(day.date.split('-')[2]) : ''}
              </span>
              {showCross && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-black opacity-50 p-px">
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
