import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ImportantDate, PrintLegendItem } from '../types';

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
  // Manual entries: parse month abbreviation from the first line of dateRange.
  // Months that come strictly AFTER startMonth belong to startYear (same calendar year).
  // Months at or before startMonth wrap into startYear + 1 (the next calendar year).
  const firstLine = (date.dateRange || '').split('\n')[0].trim();
  for (const abbr of MONTH_ABBR_KEYS) {
    if (firstLine.startsWith(abbr)) {
      const monthIdx = MONTH_ABBR_KEYS.indexOf(abbr);
      const year = monthIdx > startMonth ? startYear : startYear + 1;
      return `${MONTH_ABBR_MAP[abbr]}, ${year}`;
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

export const ImportantDates: React.FC<ImportantDatesProps> = ({
  dates,
  setDates,
  printLegendItems,
  setPrintLegendItems,
  startYear,
  startMonth,
}) => {
  const addDate = () => {
    const newDate: ImportantDate = {
      id: crypto.randomUUID(),
      dateRange: '',
      description: 'Event Group',
    };
    setDates([...dates, newDate]);
  };

  const updateDate = (id: string, updates: Partial<ImportantDate>) => {
    setDates(dates.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDate = (id: string) => {
    setDates(dates.filter(d => d.id !== id));
  };

  const addLegendItem = () => {
    const newItem: PrintLegendItem = {
      id: crypto.randomUUID(),
      color: '#888888',
      label: 'Legend Item',
    };
    setPrintLegendItems([...printLegendItems, newItem]);
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

                    {/* Delete button */}
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

      {/* ── Legend Section ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t-2 border-black mt-3 pt-2 print:mt-2 print:pt-1.5">
        {/* Header + Add button */}
        <div className="flex items-center justify-between mb-1.5 print:mb-1">
          <div className="text-[10px] font-bold uppercase tracking-widest print:text-[7px]">Legend</div>
          <button
            onClick={addLegendItem}
            className="text-blue-600 hover:text-blue-700 print:hidden"
            title="Add legend item"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Legend items */}
        <div className="flex flex-col gap-1 print:gap-0.5">
          {printLegendItems.map(item => (
            <div key={item.id} className="group flex items-center gap-1.5">
              {/* Color picker — edit view only */}
              <input
                type="color"
                value={item.color}
                onChange={(e) => updateLegendItem(item.id, { color: e.target.value })}
                className="w-4 h-4 rounded cursor-pointer border-none p-0 bg-transparent flex-shrink-0 print:hidden"
                title="Pick color"
              />
              {/* Colored square — print view only */}
              <span
                className="hidden print:inline-block flex-shrink-0"
                style={{
                  width: '9px', height: '9px',
                  backgroundColor: item.color,
                  border: '0.5px solid rgba(0,0,0,0.25)',
                }}
              />
              {/* Label input — edit view only */}
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateLegendItem(item.id, { label: e.target.value })}
                className="text-xs font-medium text-gray-800 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none flex-1 min-w-0 print:hidden"
                placeholder="Label"
              />
              {/* Label text — print view only */}
              <span className="hidden print:inline text-[7px] uppercase font-medium leading-tight">
                {item.label}
              </span>
              {/* Delete — edit view only */}
              <button
                onClick={() => deleteLegendItem(item.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {printLegendItems.length === 0 && (
            <p className="text-gray-400 text-xs italic print:hidden">
              Click + to add legend items.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
