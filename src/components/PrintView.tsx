import React from 'react';
import { CalendarDay, LegendItem, ImportantDate } from '../types';
import { CalendarTheme } from '../themes';

// ── Month helpers (mirrors ImportantDates.tsx) ─────────────────────────────────
const MONTH_ABBR_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_ABBR_MAP: Record<string, string> = {
  Jan: 'JANUARY', Feb: 'FEBRUARY', Mar: 'MARCH', Apr: 'APRIL',
  May: 'MAY', Jun: 'JUNE', Jul: 'JULY', Aug: 'AUGUST',
  Sep: 'SEPTEMBER', Oct: 'OCTOBER', Nov: 'NOVEMBER', Dec: 'DECEMBER',
};
const FULL_MONTHS = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
];

function getMonthLabel(date: ImportantDate, startMonth: number, startYear: number): string | null {
  if (date.firstDate) {
    const d = new Date(date.firstDate + 'T00:00:00Z');
    if (!isNaN(d.getTime())) {
      return `${FULL_MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
    }
  }
  const firstLine = (date.dateRange || '').split('\n')[0].trim();
  for (const abbr of MONTH_ABBR_KEYS) {
    if (firstLine.startsWith(abbr)) {
      const monthIdx = MONTH_ABBR_KEYS.indexOf(abbr);
      const year = monthIdx >= startMonth ? startYear : startYear + 1;
      return `${MONTH_ABBR_MAP[abbr]}, ${year}`;
    }
  }
  return null;
}

interface PrintViewProps {
  institutionName: string;
  subtitle: string;
  startYear: number;
  startMonth: number;
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
  theme?: CalendarTheme;
}

export const PrintView: React.FC<PrintViewProps> = ({
  institutionName,
  subtitle,
  startYear,
  startMonth,
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
  theme,
}) => {
  const cols = months.length <= 6 ? 3 : months.length <= 9 ? 3 : 4;

  return (
    <div
      className="hidden print:flex print:flex-col w-full h-screen bg-white text-black overflow-hidden box-border"
      style={{ fontFamily: theme?.fontFamily ?? "ui-serif, Georgia, serif" }}
    >

      {/* ── Banner Header ── */}
      <header
        className="flex items-center gap-3 px-4 py-1.5 flex-shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        {/* Logo */}
        <div className="w-9 h-9 rounded-full border-2 border-white/50 overflow-hidden bg-white/10 flex-shrink-0">
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
            className="font-bold uppercase tracking-widest text-lg leading-none"
            style={{ color: headerTextColor }}
          >
            {institutionName}
          </div>
          <div
            className="text-[8px] italic mt-0.5 opacity-85 tracking-wide"
            style={{ color: headerTextColor }}
          >
            {subtitle.split('|').map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span className="mx-2 opacity-50 not-italic font-light">|</span>
                )}
                {part.trim()}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Year */}
        <div className="text-right flex-shrink-0" style={{ color: headerTextColor }}>
          <div className="font-bold text-base uppercase tracking-wide leading-tight">Academic Calendar</div>
          <div className="font-bold text-base leading-none mt-0.5">
            {startYear} – {startYear + 1}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 gap-1.5 px-2 pb-1.5 min-h-0 overflow-hidden mt-1">

        {/* Left: Calendar grid only (legend removed) */}
        <div className="flex flex-col flex-[4] min-h-0">
          <div
            className="flex-1 grid gap-x-1 gap-y-0.5 min-h-0"
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
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Right: Important Dates */}
        <div
          className="flex flex-col border-l-2 border-black pl-2.5 min-h-0"
          style={{ width: '22%', flexShrink: 0 }}
        >
          <h3 className="text-[11px] font-bold uppercase border-b-2 border-black mb-1.5 pb-0.5 flex-shrink-0 tracking-wider">
            Important Dates
          </h3>

          {/* Entries with month-label grouping */}
          <div className="flex-1 overflow-hidden">
            {(() => {
              let prevMonth: string | null = null;
              return importantDates.map(date => {
                const monthLabel = getMonthLabel(date, startMonth, startYear);
                const showMonthHeader = monthLabel !== null && monthLabel !== prevMonth;
                prevMonth = monthLabel;

                return (
                  <React.Fragment key={date.id}>
                    {/* Month section header */}
                    {showMonthHeader && (
                      <div className="text-[7px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-400 pt-1.5 pb-px mt-0.5 first:mt-0 leading-tight">
                        {monthLabel}
                      </div>
                    )}

                    <div className="mt-0.5">
                      {/* Description row — no color bullet */}
                      <div className="leading-tight">
                        <span className="font-bold uppercase text-[9px] leading-tight">
                          {date.description}
                        </span>
                      </div>
                      {/* Date range */}
                      <div
                        className="whitespace-pre-wrap leading-snug text-gray-700 text-[8px] mt-px"
                      >
                        {date.dateRange}
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()}
          </div>

          {/* Legend at bottom of Important Dates */}
          {(() => {
            const usedLegendItems = legendItems.filter(item =>
              importantDates.some(d => d.legendItemId === item.id)
            );
            const manualColored = importantDates.filter(d => !d.legendItemId && d.color);
            if (usedLegendItems.length === 0 && manualColored.length === 0) return null;
            return (
              <div className="flex-shrink-0 border-t-2 border-black mt-1.5 pt-1">
                <div className="text-[7px] font-bold uppercase tracking-widest mb-0.5">Legend</div>
                <div className="flex flex-col gap-0.5">
                  {usedLegendItems.map(item => (
                    <div key={item.id} className="flex items-center gap-1">
                      <span
                        className="inline-block flex-shrink-0"
                        style={{
                          width: '8px', height: '8px', minWidth: '8px',
                          backgroundColor: item.color,
                          border: '0.5px solid rgba(0,0,0,0.25)',
                        }}
                      />
                      <span className="text-[7px] uppercase font-medium leading-tight">{item.label}</span>
                    </div>
                  ))}
                  {manualColored.map(d => (
                    <div key={d.id} className="flex items-center gap-1">
                      <span
                        className="inline-block flex-shrink-0"
                        style={{
                          width: '8px', height: '8px', minWidth: '8px',
                          backgroundColor: d.color,
                          border: '0.5px solid rgba(0,0,0,0.25)',
                        }}
                      />
                      <span className="text-[7px] uppercase font-medium leading-tight">{d.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
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
  theme?: CalendarTheme;
}> = ({
  year, month, dayColors, legendItems,
  accentColor = '#a5f3fc', highlightWeekends = false,
  dateFontSize = 10, dateBold = false,
  headerTextColor = '#000000',
  theme,
}) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const shortYear = String(year).slice(-2);

  const border = `1px solid ${theme?.borderColor ?? '#000000'}`;
  const cellBorder = `1px solid ${theme?.gridGap ?? '#e5e7eb'}`;
  const cellRadius = theme?.cellRadius ?? '0px';

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
        className="font-bold text-center uppercase leading-tight py-px"
        style={{
          backgroundColor: accentColor,
          color: headerTextColor,
          fontSize: `${dateFontSize + 1}px`,
          border,
          borderBottom: 'none',
        }}
      >
        {monthName} '{shortYear}
      </div>

      {/* Day grid */}
      <div
        className="grid grid-cols-7 flex-1"
        style={{ gridTemplateRows: 'auto repeat(6, 1fr)', fontSize: `${dateFontSize}px`, border }}
      >
        {/* Weekday headers — use accent color like the interactive grid */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center font-bold leading-tight py-px"
            style={{
              backgroundColor: accentColor,
              color: headerTextColor,
              borderBottom: border,
              borderRight: i < 6 ? cellBorder : 'none',
            }}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day, idx) => {
          const legendItemId = day.isCurrentMonth ? dayColors[day.date] : undefined;
          const legendItem = legendItemId ? legendItems.find(i => i.id === legendItemId) : undefined;
          const colorId = legendItem?.color;
          const showCross = legendItem?.style === 'cross';
          const colIdx = idx % 7;
          const isWeekend = highlightWeekends && (colIdx === 0 || colIdx === 6) && day.isCurrentMonth && !colorId;

          const bgColor = colorId
            ? colorId
            : isWeekend
            ? (theme?.weekendBg ?? '#e0f2fe')
            : day.isCurrentMonth
            ? (theme?.dayBg ?? '#ffffff')
            : (theme?.nonCurrentBg ?? '#f3f4f6');

          const textColor = !day.isCurrentMonth
            ? (theme?.nonCurrentText ?? '#d1d5db')
            : colorId
            ? '#000000'
            : (theme?.dayText ?? '#111827');

          return (
            <div
              key={idx}
              className="flex items-center justify-center relative"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                borderRight: colIdx < 6 ? cellBorder : 'none',
                borderBottom: cellBorder,
                fontWeight: dateBold || colorId ? 700 : 400,
                borderRadius: cellRadius,
              }}
            >
              <span className="z-10 leading-none">
                {day.isCurrentMonth ? parseInt(day.date.split('-')[2]) : ''}
              </span>
              {showCross && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full opacity-50 p-px" style={{ color: textColor }}>
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
