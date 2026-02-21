import React, { useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ImportantDate, LegendItem } from '../types';

interface ImportantDatesProps {
  dates: ImportantDate[];
  setDates: (dates: ImportantDate[]) => void;
  legendItems?: LegendItem[];
}

const MONTH_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function groupByMonth(dates: ImportantDate[]) {
  const map = new Map<string, ImportantDate[]>();
  const ungrouped: ImportantDate[] = [];
  for (const d of dates) {
    if (d.sortDate) {
      const key = d.sortDate.slice(0, 7); // "YYYY-MM"
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    } else {
      ungrouped.push(d);
    }
  }
  const groups = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, entries]) => {
      const [y, m] = key.split('-').map(Number);
      return { key, label: `${MONTH_FULL[m]} ${y}`, entries };
    });
  if (ungrouped.length > 0) groups.push({ key: '__other', label: 'Other', entries: ungrouped });
  return groups;
}

// Small color-picker dot for manual entries
const ColorDot: React.FC<{ color: string; onChange: (c: string) => void }> = ({ color, onChange }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        title="Pick color"
        onClick={() => ref.current?.click()}
        className="w-3 h-3 rounded-sm flex-shrink-0 border border-black/20 cursor-pointer"
        style={{ backgroundColor: color }}
      />
      <input
        ref={ref}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </>
  );
};

export const ImportantDates: React.FC<ImportantDatesProps> = ({ dates, setDates, legendItems = [] }) => {
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

  const groups = groupByMonth(dates);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full print:shadow-none print:border-none print:p-0 font-serif">
      <div className="flex items-center justify-between mb-3 print:mb-2">
        <h3 className="font-bold text-gray-900 text-lg uppercase border-b-2 border-black pb-1 w-full print:text-sm print:pb-0.5">
          Important Dates
        </h3>
        <button
          onClick={addDate}
          className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium print:hidden ml-2"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3 print:space-y-1.5">
        {groups.map(group => (
          <div key={group.key}>
            {/* Month header */}
            <div className="text-xs font-bold italic text-gray-500 uppercase tracking-wide mb-1 print:text-[8px] print:mb-0.5">
              {group.label}
            </div>

            <div className="space-y-3 print:space-y-1.5 pl-1">
              {group.entries.map((date) => {
                const isAuto = !!date.legendItemId;
                const legendItem = isAuto ? legendItems.find(i => i.id === date.legendItemId) : undefined;
                const dotColor = date.color || legendItem?.color;

                return (
                  <div key={date.id} className="group flex flex-col gap-0.5 text-xs print:gap-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {/* Color indicator */}
                        {isAuto && legendItem ? (
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: legendItem.color }}
                          />
                        ) : (
                          <ColorDot
                            color={dotColor || '#888888'}
                            onChange={(c) => updateDate(date.id, { color: c })}
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
                          placeholder="Month / Event Group"
                        />
                      </div>
                      {!isAuto && (
                        <button
                          onClick={() => deleteDate(date.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    <textarea
                      value={date.dateRange}
                      onChange={(e) => updateDate(date.id, {
                        dateRange: e.target.value,
                        ...(isAuto ? { isDateRangeCustomized: true } : {}),
                      })}
                      className="text-gray-800 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none w-full resize-none overflow-hidden print:text-[8px] print:leading-tight"
                      placeholder="List events here..."
                      rows={Math.max(1, date.dateRange.split('\n').length)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {dates.length === 0 && (
          <p className="text-gray-400 text-sm italic py-4 text-center print:hidden">
            Apply colors to calendar dates to auto-populate.
          </p>
        )}
      </div>
    </div>
  );
};
