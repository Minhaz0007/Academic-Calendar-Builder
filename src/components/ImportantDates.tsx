import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ImportantDate, LegendItem } from '../types';

interface ImportantDatesProps {
  dates: ImportantDate[];
  setDates: (dates: ImportantDate[]) => void;
  legendItems?: LegendItem[];
}

export const ImportantDates: React.FC<ImportantDatesProps> = ({ dates, setDates, legendItems = [] }) => {
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

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full print:shadow-none print:border-none print:p-0 font-serif">
      <div className="flex items-center justify-between mb-4 print:mb-2">
        <h3 className="font-bold text-gray-900 text-lg uppercase border-b-2 border-black pb-1 w-full print:text-sm print:pb-0.5">Important Dates</h3>
        <button
          onClick={addDate}
          className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium print:hidden ml-2"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-4 print:space-y-2">
        {dates.map((date) => {
          const isAuto = !!date.legendItemId;
          const legendItem = isAuto ? legendItems.find(i => i.id === date.legendItemId) : undefined;

          return (
            <div key={date.id} className="group flex flex-col gap-1 text-xs print:gap-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {/* Color swatch for auto-generated entries */}
                  {legendItem && (
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0 print:hidden"
                      style={{ backgroundColor: legendItem.color }}
                    />
                  )}
                  <input
                    type="text"
                    value={date.description}
                    onChange={(e) => updateDate(date.id, {
                      description: e.target.value,
                      ...(isAuto ? { isDescriptionCustomized: true } : {}),
                    })}
                    className="font-bold text-gray-900 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none w-full print:text-[10px]"
                    placeholder="Month / Event Group"
                  />
                </div>
                {/* Only show delete on manual entries */}
                {!isAuto && (
                  <button
                    onClick={() => deleteDate(date.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Auto entries: plain text (always in sync with calendar) */}
              {isAuto ? (
                <p className="text-gray-800 whitespace-pre-line print:text-[9px] print:leading-tight leading-relaxed">
                  {date.dateRange}
                </p>
              ) : (
                <textarea
                  value={date.dateRange}
                  onChange={(e) => updateDate(date.id, { dateRange: e.target.value })}
                  className="text-gray-800 bg-transparent border-none hover:bg-gray-50 focus:bg-blue-50 focus:outline-none w-full resize-none overflow-hidden print:text-[9px] print:leading-tight"
                  placeholder="List events here..."
                  rows={Math.max(2, date.dateRange.split('\n').length)}
                />
              )}
            </div>
          );
        })}

        {dates.length === 0 && (
          <p className="text-gray-400 text-sm italic py-4 text-center print:hidden">
            Apply colors to calendar dates to auto-populate.
          </p>
        )}
      </div>
    </div>
  );
};
