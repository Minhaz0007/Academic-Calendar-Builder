import React from 'react';
import { CalendarDay, LegendItem, ImportantDate, PrintLegendItem } from '../types';
import { CalendarTheme } from '../themes';
import { getImportantDatesSizes, dateColumnWidth } from '../lib/importantDatesSizes';

// ── Month helpers (mirrors ImportantDates.tsx) ─────────────────────────────────
const MONTH_ABBR_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_ABBR_MAP: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March',  Apr: 'April',
  May: 'May',     Jun: 'June',     Jul: 'July',    Aug: 'August',
  Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
};
const FULL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const SERIF = "'Times New Roman', Times, Georgia, serif";

/**
 * Returns an array of month-group labels for all dates in sequence order.
 * Mirrors the logic in ImportantDates.tsx — see that file for full comments.
 */
function computeMonthLabels(
  dates: ImportantDate[],
  startMonth: number,
  startYear: number,
): (string | null)[] {
  let seqYear = startYear;
  let prevMonthIdx = startMonth;

  return dates.map(date => {
    if (date.customMonthLabel !== undefined) return date.customMonthLabel;

    if (date.firstDate) {
      const d = new Date(date.firstDate + 'T00:00:00Z');
      if (!isNaN(d.getTime())) {
        return `${FULL_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      }
    }

    const firstLine = (date.dateRange || '').split('\n')[0].trim();
    for (const abbr of MONTH_ABBR_KEYS) {
      if (firstLine.startsWith(abbr)) {
        const monthIdx = MONTH_ABBR_KEYS.indexOf(abbr);
        const explicitYear = firstLine.match(/\b(20\d{2})\b/);
        if (explicitYear) {
          return `${MONTH_ABBR_MAP[abbr]} ${parseInt(explicitYear[1], 10)}`;
        }
        if (monthIdx < prevMonthIdx) {
          seqYear++;
        }
        prevMonthIdx = monthIdx;
        return `${MONTH_ABBR_MAP[abbr]} ${seqYear}`;
      }
    }
    return null;
  });
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
  printLegendItems: PrintLegendItem[];
  months: { year: number; month: number }[];
  accentColor?: string;
  highlightWeekends?: boolean;
  dateFontSize?: number;
  dateBold?: boolean;
  headerTextColor?: string;
  theme?: CalendarTheme;
  eventsFontSize?: number; // base font size for the Important Dates sidebar
  printScale?: number; // master zoom (0.5-1.1) applied to the whole page, to shrink-to-fit
  // When true, forces the (normally print-only) page to render visibly off-screen at
  // scale 1, so its true unscaled height can be measured for the "Fit to Page" button.
  measuring?: boolean;
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
  printLegendItems,
  months,
  accentColor = '#a5f3fc',
  highlightWeekends = false,
  dateFontSize = 10,
  dateBold = false,
  headerTextColor = '#000000',
  theme,
  eventsFontSize = 14,
  printScale = 1,
  measuring = false,
}) => {
  // Derived sizes for the sidebar — shared with ImportantDates.tsx so the
  // editor and the printed output are pixel-identical.
  const fs = eventsFontSize;
  const {
    titleSize: evTitleSize,
    monthSize: evMonthSize,
    legendTitle: evLegendTitle,
    legendLabel: evLegendLabel,
    squareSize: evSquareSize,
    entryMb: evEntryMb,
    headerMt: evHeaderMt,
    legendGap: evLegendGap,
    legendTopMargin: evLegendTopMargin,
  } = getImportantDatesSizes(fs);
  const cols = months.length <= 6 ? 3 : months.length <= 9 ? 3 : 4;
  // The measurement pass always renders at scale 1 (true, unscaled size) regardless
  // of the configured printScale, since that's what "Fit to Page" needs to measure.
  const effectiveScale = measuring ? 1 : printScale;

  return (
    <div
      id="print-view-root"
      className={measuring ? 'flex flex-col bg-white text-black box-border' : 'hidden print:flex print:flex-col bg-white text-black box-border'}
      style={{
        // A4 landscape (297mm x 210mm) minus the @page margin (4mm each side, see
        // the print stylesheet) = the true printable area, in physical units — not
        // 100vh, which varies with the browser window and doesn't match A4's
        // aspect ratio. This keeps the on-screen preview, Fit to Page's
        // measurement, and the actual printed page all pixel-for-pixel identical.
        width: '289mm',
        height: '202mm',
        overflow: 'hidden',
        ...(measuring ? { position: 'fixed', top: '-10000px', left: '0', visibility: 'hidden' } : {}),
      }}
    >
      {/* Scaled content — a single wrapper around the whole page so "Print Scale"
          shrinks (or grows) everything uniformly: fonts, spacing, the calendar
          grid, and the Important Dates sidebar all together. */}
      <div
        data-print-scaled
        style={{
          transform: `scale(${effectiveScale})`,
          transformOrigin: 'top center',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          fontFamily: theme?.fontFamily ?? "ui-serif, Georgia, serif",
        }}
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
            className="text-[12px] italic mt-0.5 opacity-85 tracking-wide"
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
      {/* overflow left as visible (not hidden): Print Scale needs the sidebar's
          content free to spill past this row's box at scale 1 so the transform
          below actually shrinks it — the true clip boundary is the outer page
          div's overflow:hidden, which acts on the already-scaled result. */}
      <div
        className="flex gap-1 px-2 pb-1.5 mt-1"
        style={{ flex: 1, minHeight: 0 }}
      >

        {/* Left: Calendar grid */}
        <div
          className="flex flex-col min-h-0"
          style={{ flex: 4 }}
        >
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

        {/* Right: Important Dates + Color Legend sidebar — widened from 22% to 28%
            (calendar grid absorbs the difference) since the calendar is elastic and
            never overflows, while this sidebar's text content is the only part that
            can, so giving it more width directly reduces how often entries wrap. */}
        <div
          data-print-sidebar
          className="flex flex-col min-h-0"
          style={{
            width: '28%',
            flexShrink: 0,
            borderLeft: '2px solid black',
            paddingLeft: '5px',
          }}
        >

          {/* ── IMPORTANT DATES ── */}
          <div className="flex-shrink-0">
            <div style={{ borderBottom: '3px solid black', paddingBottom: '2px', marginBottom: '3px' }}>
              <h3
                className="font-bold uppercase text-black leading-tight"
                style={{ fontSize: `${evTitleSize}px`, letterSpacing: '0.12em', fontFamily: SERIF }}
              >
                Important Dates
              </h3>
            </div>
          </div>

          {/* Entries — sizes to its own natural content (not stretched to fill the
              sidebar, which is what pushed Color Legend down to the bottom with a
              big gap). Left free to overflow past the page at scale 1: Print
              Scale + the outer page's overflow:hidden are what decide whether it
              fits, not a clip here. */}
          <div data-print-entries>
            {(() => {
              const monthLabels = computeMonthLabels(importantDates, startMonth, startYear);
              let prevMonth: string | null = null;
              return importantDates.map((date, idx) => {
                const monthLabel = monthLabels[idx];
                const showMonthHeader = monthLabel !== null && monthLabel !== prevMonth;
                prevMonth = monthLabel;

                return (
                  <React.Fragment key={date.id}>
                    {/* Month header — bold + italic */}
                    {showMonthHeader && (
                      <div
                        style={{
                          marginTop: `${evHeaderMt}px`,
                          marginBottom: '1px',
                          pageBreakInside: 'avoid',
                          breakInside: 'avoid',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: SERIF,
                            fontSize: `${evMonthSize}px`,
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            color: '#111827',
                          }}
                        >
                          {monthLabel}
                        </span>
                      </div>
                    )}

                    {/* Entry row — same content-fit date column as the editor, so wrapping breaks identically */}
                    <div
                      style={{
                        marginBottom: `${evEntryMb}px`,
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid',
                        lineHeight: '1.25',
                        backgroundColor: date.highlight ?? 'transparent',
                        borderRadius: date.highlight ? '2px' : '0',
                        padding: date.highlight ? '0 2px' : '0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '4px',
                      }}
                    >
                      {/* Date + colon grouped with zero gap so the colon sits right against the date */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                        <span style={{ fontFamily: SERIF, fontSize: `${fs}px`, fontWeight: 'normal', fontStyle: 'normal', color: '#1f2937', width: `${dateColumnWidth(date.dateRange, fs, SERIF)}px`, wordBreak: 'break-word' }}>
                          {date.dateRange}
                        </span>
                        {date.dateRange && date.description && (
                          <span style={{ fontFamily: SERIF, fontSize: `${fs}px`, color: '#1f2937' }}>:</span>
                        )}
                      </div>
                      <span style={{ fontFamily: SERIF, fontSize: `${fs}px`, fontWeight: 'normal', fontStyle: 'normal', color: '#1f2937', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                        {date.description}
                      </span>
                    </div>
                  </React.Fragment>
                );
              });
            })()}
          </div>

          {/* ── COLOR LEGEND ── */}
          {printLegendItems.length > 0 && (
            <div
              className="flex-shrink-0"
              style={{
                borderTop: '2.5px solid black',
                paddingTop: '3px',
                marginTop: `${evLegendTopMargin}px`,
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              }}
            >
              <div style={{ borderBottom: '1px solid black', paddingBottom: '1px', marginBottom: '2px' }}>
                <h4
                  className="font-bold uppercase text-black leading-tight"
                  style={{ fontSize: `${evLegendTitle}px`, letterSpacing: '0.1em', fontFamily: SERIF }}
                >
                  Color Legend
                </h4>
              </div>

              <div className="flex flex-col" style={{ gap: `${evLegendGap}px` }}>
                {printLegendItems.map(item => (
                  <div key={item.id} className="flex items-center" style={{ gap: '4px' }}>
                    <span
                      className="inline-block flex-shrink-0"
                      style={{
                        width: `${evSquareSize}px`,
                        height: `${evSquareSize}px`,
                        minWidth: `${evSquareSize}px`,
                        backgroundColor: item.color,
                        border: '0.5px solid rgba(0,0,0,0.3)',
                      }}
                    />
                    <span
                      className="font-medium uppercase text-black leading-tight"
                      style={{ fontSize: `${evLegendLabel}px`, fontFamily: SERIF, letterSpacing: '0.03em', lineHeight: '1.2' }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
        className="grid grid-cols-7 flex-1 gap-px"
        style={{
          gridTemplateRows: 'auto repeat(6, 1fr)',
          fontSize: `${dateFontSize}px`,
          border,
          backgroundColor: theme?.gridGap ?? '#e5e7eb',
        }}
      >
        {/* Weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center font-bold leading-tight py-px"
            style={{
              backgroundColor: accentColor,
              color: headerTextColor,
              borderBottom: border,
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
