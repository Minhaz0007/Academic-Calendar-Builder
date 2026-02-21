import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ImportantDate, LegendItem } from '../types';

// ── Month helpers ──────────────────────────────────────────────────────────────
const MONTH_ABBR_MAP: Record<string, string> = {
  Jan: 'JANUARY', Feb: 'FEBRUARY', Mar: 'MARCH', Apr: 'APRIL',
  May: 'MAY', Jun: 'JUNE', Jul: 'JULY', Aug: 'AUGUST',
  Sep: 'SEPTEMBER', Oct: 'OCTOBER', Nov: 'NOVEMBER', Dec: 'DECEMBER',
};
const MONTH_ABBR_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
];

/** Returns month+year label like "DECEMBER, 2025" for grouping headers. */
function getMonthLabel(date: ImportantDate, startMonth: number, startYear: number): string | null {
  // Auto-entries store their earliest calendar date
  if (date.firstDate) {
    const d = new Date(date.firstDate + 'T00:00:00Z');
    if (!isNaN(d.getTime())) {
      return `${FULL_MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
    }
  }
  // Manual entries: try to parse month abbreviation from the first line of dateRange
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

interface ImportantDatesProps {
  dates: ImportantDate[];
  setDates: (dates: ImportantDate[]) => void;
  legendItems?: LegendItem[];
  startYear: number;
  startMonth: number;
}

export const ImportantDates: React.FC<ImportantDatesProps> = ({
  dates,
  setDates,
  legendItems = [],
  startYear,
  startMonth,
}) => {
  const addDate = () => {
    const newDate: ImportantDate = {
      id: crypto.randomUUID(),
      dateRange: '',
      description: 'Event Group',
      color: '#888888',
    };
    setDates([...dates, newDate]);
  };

  const updateDate = (id: string, updates: Partial<ImportantDate>) => {
    setDates(dates.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDate = (id: string) => {
    setDates(dates.filter(d => d.id !== id));
  };

  // ── Legend items used in Important Dates (for print legend) ─────────────────
  const usedLegendItems = legendItems.filter(item =>
    dates.some(d => d.legendItemId === item.id)
  );
  const manualColored = dates.filter(d => !d.legendItemId && d.color);
  const hasLegend = usedLegendItems.length > 0 || manualColored.length > 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  let prevMonthLabel: string | null = null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full print:shadow-none print:border-none print:p-0 font-serif flex flex-col">
      {/* Title + Add button */}
      <div className="flex items-center justify-between mb-3 print:mb-1.5 flex-shrink-0">
        <h3 className="font-bold text-gray-900 text-lg uppercase border-b-2 border-black pb-1 w-full print:text-sm print:pb-0.5">
          Important Dates
        </h3>
        <button
          onClick={addDate}
          className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium print:hidden ml-2"
          title="Add manual entry"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-auto print:overflow-visible">
        <div className="space-y-0.5 print:space-y-0.5">
          {dates.map((date) => {
            const isAuto = !!date.legendItemId;

            // Month grouping header
            const monthLabel = getMonthLabel(date, startMonth, startYear);
            const showMonthHeader = monthLabel !== null && monthLabel !== prevMonthLabel;
            prevMonthLabel = monthLabel;

            return (
              <React.Fragment key={date.id}>
                {/* Month label header */}
                {showMonthHeader && (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pt-2 pb-0.5 mt-1 first:mt-0 print:text-[7px] print:pt-1 print:mt-0.5">
                    {monthLabel}
                  </div>
                )}

                {/* Entry row */}
                <div className="group flex flex-col gap-0.5 text-xs py-1 print:py-0.5 print:gap-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {/* Color picker for manual entries (edit view only, for legend assignment) */}
                      {!isAuto && (
                        <input
                          type="color"
                          value={date.color || '#888888'}
                          onChange={(e) => updateDate(date.id, { color: e.target.value })}
                          className="w-4 h-4 rounded cursor-pointer border-none p-0 bg-transparent flex-shrink-0 print:hidden"
                          title="Set legend color"
                        />
                      )}

                      <input
                        type="text"
                        value={date.description}
                        onChange={(e) => updateDate(date.id, {
                          description: e.target.value,
                          ...(isAuto ? { isDescriptionCustomized: true } : {}),
                        })}
                        className="font-bold text-gray-900 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none w-full print:text-[9px]"
                        placeholder="Event name"
                      />
                    </div>

                    {/* Delete button — all entries */}
                    <button
                      onClick={() => deleteDate(date.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Date range */}
                  <textarea
                    value={date.dateRange}
                    onChange={(e) => updateDate(date.id, {
                      dateRange: e.target.value,
                      ...(isAuto ? { isDateRangeCustomized: true } : {}),
                    })}
                    className="text-gray-700 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none w-full resize-none overflow-hidden print:text-[8px] print:leading-tight"
                    placeholder="List dates here…"
                    rows={Math.max(1, (date.dateRange || '').split('\n').length)}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {dates.length === 0 && (
            <p className="text-gray-400 text-sm italic py-4 text-center print:hidden">
              Click <strong>+</strong> to add events manually.
            </p>
          )}
        </div>
      </div>

      {/* ── Print-only Legend at bottom of Important Dates ─────────────────────── */}
      {hasLegend && (
        <div className="hidden print:block flex-shrink-0 border-t-2 border-black mt-2 pt-1.5">
          <div className="text-[8px] font-bold uppercase tracking-widest mb-1">Legend</div>
          <div className="flex flex-col gap-0.5">
            {usedLegendItems.map(item => (
              <div key={item.id} className="flex items-center gap-1.5">
                <span
                  className="inline-block flex-shrink-0"
                  style={{
                    width: '9px', height: '9px',
                    backgroundColor: item.color,
                    border: '0.5px solid rgba(0,0,0,0.25)',
                  }}
                />
                <span className="text-[7px] uppercase font-medium leading-tight">{item.label}</span>
              </div>
            ))}
            {manualColored.map(d => (
              <div key={d.id} className="flex items-center gap-1.5">
                <span
                  className="inline-block flex-shrink-0"
                  style={{
                    width: '9px', height: '9px',
                    backgroundColor: d.color,
                    border: '0.5px solid rgba(0,0,0,0.25)',
                  }}
                />
                <span className="text-[7px] uppercase font-medium leading-tight">{d.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
