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
}) => {
  return (
    <div className="hidden print:flex flex-col w-full h-full bg-white text-black font-serif p-0 box-border">
      {/* Header */}
      <header className="flex flex-col items-center mb-2 border-b-2 border-transparent relative">
        <div className="flex items-center justify-center gap-4 w-full">
           {logoUrl && (
             <img src={logoUrl} alt="Logo" className="h-24 w-24 object-contain absolute left-0 top-0" />
           )}
           <div className="text-center">
             <h1 className="text-4xl font-bold uppercase tracking-wider">{institutionName}</h1>
             <p className="text-sm italic mt-1">{subtitle}</p>
             <h2 className="text-3xl font-bold mt-1">{startYear}/{startYear + 1}</h2>
           </div>
        </div>
      </header>

      <div className="flex flex-1 gap-4 items-stretch">
        {/* Left Column: Calendar + Legend */}
        <div className="flex flex-col flex-[3] gap-2">
           {/* Calendar Grid */}
           <div className="grid grid-cols-4 gap-x-2 gap-y-2 flex-1">
             {months.map(m => (
               <PrintMonth 
                 key={`${m.year}-${m.month}`} 
                 year={m.year} 
                 month={m.month} 
                 dayColors={dayColors} 
                 legendItems={legendItems} 
               />
             ))}
           </div>

           {/* Legend */}
           <div className="mt-2">
             <div className="grid grid-cols-4 gap-0 border border-black text-[9px]">
               {legendItems.map(item => (
                 <div key={item.id} className="flex border-r border-b border-black last:border-r-0 [&:nth-child(4n)]:border-r-0 [&:nth-last-child(-n+4)]:border-b-0">
                   <div 
                     className="w-1/3 p-1 font-bold uppercase flex items-center justify-center text-center leading-tight"
                     style={{ backgroundColor: item.color }}
                   >
                     {item.label}
                   </div>
                   <div className="w-2/3 p-1 flex items-center justify-center text-center leading-tight bg-white">
                     {item.description}
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Right Column: Important Dates */}
        <div className="flex-1 border-l-2 border-gray-800 pl-3 flex flex-col pt-2">
          <h3 className="text-sm font-bold uppercase border-b-2 border-black mb-2 pb-0.5">Important Dates</h3>
          <div className="space-y-2 text-[10px]">
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

const PrintMonth: React.FC<{
  year: number;
  month: number;
  dayColors: Record<string, string>;
  legendItems: LegendItem[];
}> = ({ year, month, dayColors, legendItems }) => {
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const shortYear = String(year).slice(-2);
  
  // Calculate days
  const days: CalendarDay[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const startPadding = firstDayOfMonth.getDay(); 
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: `pad-start-${i}`, isCurrentMonth: false });
  }
  
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ date: dateStr, isCurrentMonth: true });
  }
  
  const remainingCells = 42 - days.length;
  for (let i = 0; i < remainingCells; i++) {
    days.push({ date: `pad-end-${i}`, isCurrentMonth: false });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cyan-200 text-black font-bold text-center text-[10px] uppercase py-0.5 border border-black border-b-0">
        {monthName} '{shortYear}
      </div>
      <div className="grid grid-cols-7 border border-black text-[8px] flex-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center font-bold bg-gray-200 border-b border-black border-r last:border-r-0 border-gray-400 py-0.5">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const colorId = day.isCurrentMonth ? dayColors[day.date] : undefined;
          const legendItem = colorId ? legendItems.find(i => i.color === colorId) : undefined;
          const showCross = legendItem?.style === 'cross';
          
          return (
            <div 
              key={idx} 
              className={`
                aspect-square flex items-center justify-center border-r border-b border-gray-300 last:border-r-0 relative
                ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                ${day.isCurrentMonth ? '' : 'bg-gray-100'}
              `}
              style={{ backgroundColor: colorId }}
            >
              <span className={`z-10 ${colorId ? 'font-bold' : ''}`}>
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
