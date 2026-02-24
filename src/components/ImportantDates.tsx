import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ImportantDate, PrintLegendItem } from '../types';

// ── Month helpers ──────────────────────────────────────────────────────────────
// Title-case, no comma — e.g.  "November 2025"
const MONTH_ABBR_MAP: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March',  Apr: 'April',
  May: 'May',     Jun: 'June',     Jul: 'July',    Aug: 'August',
  Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
};
const MONTH_ABBR_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/** Returns a label like "November 2025" for grouping headers. */
function getMonthLabel(date: ImportantDate, startMonth: number, startYear: number): string | null {
  // Custom user-override takes priority
  if (date.customMonthLabel !== undefined) return date.customMonthLabel;

  // Auto-entries: use firstDate
  if (date.firstDate) {
    const d = new Date(date.firstDate + 'T00:00:00Z');
    if (!isNaN(d.getTime())) {
      return `${FULL_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    }
  }
  // Manual entries: parse month abbreviation from first line of dateRange.
  const firstLine = (date.dateRange || '').split('\n')[0].trim();
  for (const abbr of MONTH_ABBR_KEYS) {
    if (firstLine.startsWith(abbr)) {
      const monthIdx = MONTH_ABBR_KEYS.indexOf(abbr);
      // If the date string contains an explicit 4-digit year (e.g. "Sep 2, 2026"), use it
      // directly rather than guessing from startYear — prevents Sep 2026 → 2025 confusion.
      const explicitYear = firstLine.match(/\b(20\d{2})\b/);
      const year = explicitYear
        ? parseInt(explicitYear[1], 10)
        : monthIdx >= startMonth ? startYear : startYear + 1;
      return `${MONTH_ABBR_MAP[abbr]} ${year}`;
    }
  }
  return null;
}

interface ImportantDatesProps {
  dates: ImportantDate[];
  setDates: (dates: ImportantDate[]) => void;
  printLegendItems: PrintLegendItem[];
  setPrintLegendItems: (items: PrintLegendItem[]) => void;
  startYear: number;
  startMonth: number;
}

const SERIF = "'Times New Roman', Times, Georgia, serif";

export const ImportantDates: React.FC<ImportantDatesProps> = ({
  dates,
  setDates,
  printLegendItems,
  setPrintLegendItems,
  startYear,
  startMonth,
}) => {
  const addDate = () => {
    setDates([...dates, {
      id: crypto.randomUUID(),
      dateRange: '',
      description: 'Event Name',
    }]);
  };

  const updateDate = (id: string, updates: Partial<ImportantDate>) => {
    setDates(dates.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDate = (id: string) => {
    setDates(dates.filter(d => d.id !== id));
  };

  /** Edit a month-group label — propagates to ALL entries that share that label. */
  const updateMonthLabel = (currentLabel: string | null, newLabel: string) => {
    if (currentLabel === null) return;
    setDates(dates.map(d =>
      getMonthLabel(d, startMonth, startYear) === currentLabel
        ? { ...d, customMonthLabel: newLabel }
        : d
    ));
  };

  const addLegendItem = () => {
    setPrintLegendItems([...printLegendItems, {
      id: crypto.randomUUID(),
      color: '#4A90D9',
      label: 'Legend Item',
    }]);
  };

  const updateLegendItem = (id: string, updates: Partial<PrintLegendItem>) => {
    setPrintLegendItems(printLegendItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteLegendItem = (id: string) => {
    setPrintLegendItems(printLegendItems.filter(item => item.id !== id));
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  let prevMonthLabel: string | null = null;

  return (
    <div
      className="bg-white h-full print:shadow-none print:border-none print:p-0 flex flex-col"
      style={{ fontFamily: SERIF }}
    >

      {/* ══ IMPORTANT DATES ══ */}
      <div className="flex items-start justify-between gap-2 flex-shrink-0 mb-2">
        <div className="flex-1 border-b-[3px] border-black pb-1">
          <h3
            className="font-bold uppercase text-black leading-tight"
            style={{ fontSize: '15px', letterSpacing: '0.12em', fontFamily: SERIF }}
          >
            Important Dates
          </h3>
        </div>
        <button
          onClick={addDate}
          className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium print:hidden mt-0.5 flex-shrink-0"
          title="Add entry"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto print:overflow-visible min-h-0">
        {dates.length === 0 && (
          <p className="text-gray-400 text-sm italic py-3 text-center print:hidden">
            Click <strong>+</strong> to add events.
          </p>
        )}

        {dates.map((date) => {
          const isAuto = !!date.legendItemId;
          const monthLabel = getMonthLabel(date, startMonth, startYear);
          const showMonthHeader = monthLabel !== null && monthLabel !== prevMonthLabel;
          const groupLabel = monthLabel;
          prevMonthLabel = monthLabel;

          return (
            <React.Fragment key={date.id}>

              {/* ── Month header: bold + italic (cursive), title-case, no comma ── */}
              {showMonthHeader && (
                <div
                  className="mt-3 mb-0.5 first:mt-1"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  {/* Edit mode — editable input, styled bold+italic */}
                  <input
                    type="text"
                    value={groupLabel ?? ''}
                    onChange={(e) => updateMonthLabel(groupLabel, e.target.value)}
                    className="bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none w-full print:hidden"
                    style={{
                      fontFamily: SERIF,
                      fontSize: '11px',
                      fontWeight: 'bold',
                      fontStyle: 'italic',
                      color: '#111827',
                    }}
                    title="Click to edit month label"
                  />
                  {/* Print mode — static bold+italic text */}
                  <div
                    className="hidden print:block leading-tight"
                    style={{
                      fontFamily: SERIF,
                      fontSize: '8.5px',
                      fontWeight: 'bold',
                      fontStyle: 'italic',
                      color: '#111827',
                    }}
                  >
                    {groupLabel}
                  </div>
                </div>
              )}

              {/* ── Entry: [dateRange] : [description]  — normal weight, not italic ── */}
              <div
                className="group mb-1"
                style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                {/* Edit mode */}
                <div className="flex items-baseline gap-1 print:hidden">
                  <input
                    type="text"
                    value={date.dateRange}
                    onChange={(e) => updateDate(date.id, {
                      dateRange: e.target.value,
                      ...(isAuto ? { isDateRangeCustomized: true } : {}),
                    })}
                    className="text-gray-800 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none"
                    style={{
                      fontFamily: SERIF,
                      fontSize: '9px',
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                      width: '38%',
                      flexShrink: 0,
                    }}
                    placeholder="Dates"
                  />
                  <span style={{ fontSize: '9px', color: '#374151', flexShrink: 0 }}>:</span>
                  <input
                    type="text"
                    value={date.description}
                    onChange={(e) => updateDate(date.id, {
                      description: e.target.value,
                      ...(isAuto ? { isDescriptionCustomized: true } : {}),
                    })}
                    className="text-gray-800 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none flex-1 min-w-0"
                    style={{
                      fontFamily: SERIF,
                      fontSize: '9px',
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                    }}
                    placeholder="Event name"
                  />
                  <button
                    onClick={() => deleteDate(date.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1 print:hidden"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                {/* Print mode — "dateRange: description" in normal style */}
                <div
                  className="hidden print:block leading-snug"
                  style={{ fontFamily: SERIF }}
                >
                  <span style={{ fontSize: '7px', fontWeight: 'normal', fontStyle: 'normal', color: '#1f2937' }}>
                    {date.dateRange}
                  </span>
                  {date.dateRange && date.description && (
                    <span style={{ fontSize: '7px', color: '#1f2937' }}>: </span>
                  )}
                  <span style={{ fontSize: '7px', fontWeight: 'normal', fontStyle: 'normal', color: '#1f2937' }}>
                    {date.description}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ══ COLOR LEGEND ══ */}
      <div
        className="flex-shrink-0 mt-3 pt-2"
        style={{ borderTop: '3px solid black', pageBreakInside: 'avoid', breakInside: 'avoid' }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex-1 border-b border-black pb-0.5">
            <h4
              className="font-bold uppercase text-black leading-tight"
              style={{ fontSize: '12px', letterSpacing: '0.12em', fontFamily: SERIF }}
            >
              Color Legend
            </h4>
          </div>
          <button
            onClick={addLegendItem}
            className="text-blue-600 hover:text-blue-700 print:hidden flex-shrink-0"
            title="Add legend item"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 print:gap-1">
          {printLegendItems.map(item => (
            <div key={item.id} className="group flex items-center gap-2">
              {/* Edit mode: clickable color square */}
              <label
                className="flex-shrink-0 cursor-pointer print:hidden"
                style={{
                  width: '18px', height: '18px',
                  backgroundColor: item.color,
                  border: '1.5px solid rgba(0,0,0,0.3)',
                  display: 'block',
                  position: 'relative',
                }}
              >
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => updateLegendItem(item.id, { color: e.target.value })}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              {/* Print mode: colored square */}
              <span
                className="hidden print:inline-block flex-shrink-0"
                style={{
                  width: '10px', height: '10px', minWidth: '10px',
                  backgroundColor: item.color,
                  border: '0.75px solid rgba(0,0,0,0.35)',
                }}
              />
              {/* Edit mode: label input */}
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateLegendItem(item.id, { label: e.target.value })}
                className="font-medium text-black bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none flex-1 min-w-0 print:hidden"
                style={{ fontSize: '10px', fontFamily: SERIF }}
                placeholder="Label"
              />
              {/* Print mode: label */}
              <span
                className="hidden print:inline font-medium text-black uppercase leading-tight"
                style={{ fontSize: '7.5px', fontFamily: SERIF, letterSpacing: '0.05em' }}
              >
                {item.label}
              </span>
              <button
                onClick={() => deleteLegendItem(item.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {printLegendItems.length === 0 && (
            <p className="text-gray-400 italic print:hidden" style={{ fontSize: '11px' }}>
              Click + to add legend colors.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
