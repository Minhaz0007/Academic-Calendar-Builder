import React from 'react';
import { Plus, Trash2, Highlighter } from 'lucide-react';
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

/**
 * Returns an array of month-group labels for all dates in sequence order.
 * Tracks year transitions by detecting when the month index drops below the
 * previous one (e.g. Dec → Jan), so a 13-month calendar like Sep 2025 → Sep 2026
 * correctly labels the second September as "September 2026" instead of "September 2025".
 */
function computeMonthLabels(
  dates: ImportantDate[],
  startMonth: number,
  startYear: number,
): (string | null)[] {
  let seqYear = startYear;
  // Initialise to startMonth so the very first entry never falsely triggers a rollover.
  let prevMonthIdx = startMonth;

  return dates.map(date => {
    // Priority 1: custom user override
    if (date.customMonthLabel !== undefined) return date.customMonthLabel;

    // Priority 2: auto-entries with an explicit firstDate ISO string
    if (date.firstDate) {
      const d = new Date(date.firstDate + 'T00:00:00Z');
      if (!isNaN(d.getTime())) {
        return `${FULL_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      }
    }

    // Priority 3: parse the first line of dateRange
    const firstLine = (date.dateRange || '').split('\n')[0].trim();
    for (const abbr of MONTH_ABBR_KEYS) {
      if (firstLine.startsWith(abbr)) {
        const monthIdx = MONTH_ABBR_KEYS.indexOf(abbr);
        // Explicit 4-digit year in the string (e.g. "Sep 2, 2026") takes priority.
        const explicitYear = firstLine.match(/\b(20\d{2})\b/);
        if (explicitYear) {
          return `${MONTH_ABBR_MAP[abbr]} ${parseInt(explicitYear[1], 10)}`;
        }
        // Sequence-aware year: when the month index drops below the previous one
        // the calendar year has rolled over (handles both Dec→Jan and the second
        // occurrence of the start-month in a >12-month calendar).
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

interface ImportantDatesProps {
  dates: ImportantDate[];
  setDates: (dates: ImportantDate[]) => void;
  printLegendItems: PrintLegendItem[];
  setPrintLegendItems: (items: PrintLegendItem[]) => void;
  startYear: number;
  startMonth: number;
  fontSize?: number; // base font size for the entire section (default 9)
}

const SERIF = "'Times New Roman', Times, Georgia, serif";

export const ImportantDates: React.FC<ImportantDatesProps> = ({
  dates,
  setDates,
  printLegendItems,
  setPrintLegendItems,
  startYear,
  startMonth,
  fontSize = 9,
}) => {
  // ── Derived sizes (all relative to `fontSize`) ───────────────────────────
  const fs = fontSize;
  const titleSize   = Math.round(fs * 1.65);  // section title "Important Dates"
  const monthSize   = Math.round(fs * 1.2);   // month-group header
  const legendTitle = Math.round(fs * 1.35);  // "Color Legend" title
  const legendLabel = Math.round(fs * 1.1);   // legend item labels
  const squareSize  = Math.round(fs * 2);     // legend color square (px)
  const entryMb     = Math.max(1, Math.round(fs * 0.2));   // margin-bottom per entry
  const headerMt    = Math.round(fs * 0.55);  // margin-top for month headers

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
    const labels = computeMonthLabels(dates, startMonth, startYear);
    setDates(dates.map((d, i) =>
      labels[i] === currentLabel
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
  const monthLabels = computeMonthLabels(dates, startMonth, startYear);
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
            style={{ fontSize: `${titleSize}px`, letterSpacing: '0.12em', fontFamily: SERIF }}
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

        {dates.map((date, idx) => {
          const isAuto = !!date.legendItemId;
          const monthLabel = monthLabels[idx];
          const showMonthHeader = monthLabel !== null && monthLabel !== prevMonthLabel;
          const groupLabel = monthLabel;
          prevMonthLabel = monthLabel;

          return (
            <React.Fragment key={date.id}>

              {/* ── Month header: bold + italic, title-case ── */}
              {showMonthHeader && (
                <div
                  style={{
                    marginTop: `${headerMt}px`,
                    marginBottom: '1px',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}
                >
                  <input
                    type="text"
                    value={groupLabel ?? ''}
                    onChange={(e) => updateMonthLabel(groupLabel, e.target.value)}
                    className="bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none w-full"
                    style={{
                      fontFamily: SERIF,
                      fontSize: `${monthSize}px`,
                      fontWeight: 'bold',
                      fontStyle: 'italic',
                      color: '#111827',
                    }}
                    title="Click to edit month label"
                  />
                </div>
              )}

              {/* ── Entry row ── */}
              <div
                className="group"
                style={{
                  marginBottom: `${entryMb}px`,
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  backgroundColor: date.highlight ?? 'transparent',
                  borderRadius: date.highlight ? '2px' : '0',
                  padding: date.highlight ? '0 2px' : '0',
                }}
              >
                <div className="flex items-baseline gap-1">
                  {/* Date range */}
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
                      fontSize: `${fs}px`,
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                      width: '38%',
                      flexShrink: 0,
                    }}
                    placeholder="Dates"
                  />
                  <span style={{ fontSize: `${fs}px`, color: '#374151', flexShrink: 0 }}>:</span>
                  {/* Description */}
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
                      fontSize: `${fs}px`,
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                    }}
                    placeholder="Event name"
                  />

                  {/* ── Highlight color picker ── */}
                  <label
                    className="flex-shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      width: `${Math.round(fs * 1.3)}px`,
                      height: `${Math.round(fs * 1.3)}px`,
                      backgroundColor: date.highlight ?? '#ffffff',
                      border: date.highlight
                        ? `1.5px solid rgba(0,0,0,0.4)`
                        : `1.5px dashed rgba(0,0,0,0.25)`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: '2px',
                    }}
                    title="Highlight color"
                  >
                    {!date.highlight && (
                      <Highlighter
                        size={Math.round(fs * 0.85)}
                        style={{ color: 'rgba(0,0,0,0.35)', pointerEvents: 'none' }}
                      />
                    )}
                    <input
                      type="color"
                      value={date.highlight ?? '#ffff99'}
                      onChange={(e) => updateDate(date.id, { highlight: e.target.value })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  {/* Clear highlight */}
                  {date.highlight && (
                    <button
                      onClick={() => updateDate(date.id, { highlight: undefined })}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 leading-none"
                      style={{ fontSize: `${Math.round(fs * 1.2)}px`, lineHeight: 1 }}
                      title="Clear highlight"
                    >
                      ×
                    </button>
                  )}

                  {/* Delete entry */}
                  <button
                    onClick={() => deleteDate(date.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-0.5"
                  >
                    <Trash2 size={Math.round(fs * 1.1)} />
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ══ COLOR LEGEND ══ */}
      <div
        className="flex-shrink-0 pt-2"
        style={{
          marginTop: `${Math.round(fs * 0.4)}px`,
          borderTop: '3px solid black',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex-1 border-b border-black pb-0.5">
            <h4
              className="font-bold uppercase text-black leading-tight"
              style={{ fontSize: `${legendTitle}px`, letterSpacing: '0.12em', fontFamily: SERIF }}
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

        <div className="flex flex-col" style={{ gap: `${Math.max(2, Math.round(fs * 0.3))}px` }}>
          {printLegendItems.map(item => (
            <div key={item.id} className="group flex items-center gap-2">
              {/* Color swatch (edit mode) */}
              <label
                className="flex-shrink-0 cursor-pointer"
                style={{
                  width: `${squareSize}px`,
                  height: `${squareSize}px`,
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
              {/* Label */}
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateLegendItem(item.id, { label: e.target.value })}
                className="font-medium text-black bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none flex-1 min-w-0"
                style={{ fontSize: `${legendLabel}px`, fontFamily: SERIF }}
                placeholder="Label"
              />
              <button
                onClick={() => deleteLegendItem(item.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {printLegendItems.length === 0 && (
            <p className="text-gray-400 italic print:hidden" style={{ fontSize: `${legendLabel}px` }}>
              Click + to add legend colors.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
