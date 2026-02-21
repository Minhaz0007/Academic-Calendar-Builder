import React, { useState, useEffect } from 'react';
import { CalendarHeader } from './components/CalendarHeader';
import { Legend } from './components/Legend';
import { ImportantDates } from './components/ImportantDates';
import { MonthGrid } from './components/MonthGrid';
import { PrintView } from './components/PrintView';
import { LegendItem, ImportantDate } from './types';
import { Printer, Download } from 'lucide-react';

function App() {
  // State
  const [startYear, setStartYear] = useState(2025);
  const [institutionName, setInstitutionName] = useState('MADINATUL ULOOM');
  const [subtitle, setSubtitle] = useState('995 Fillmore Avenue, Buffalo, NY 14211 Tel: (716) 292-5956 www.madinatululoom.org');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [dayColors, setDayColors] = useState<Record<string, string>>({});
  const [legendItems, setLegendItems] = useState<LegendItem[]>([
    { id: '1', color: '#00ff00', label: 'FIRST DAY OF SCHOOL', description: 'September 3rd' },
    { id: '2', color: '#ff0000', label: 'WINTER BREAK', description: 'Dec 20th - Dec 30th' },
    { id: '3', color: '#ff0000', label: 'SUMMER BREAK', description: 'August 7th - September 1st' },
    { id: '4', color: '#ff0000', label: 'EID AL-ADHA BREAK', description: 'May 23rd - 31st' },
  ]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([
    { id: '1', dateRange: 'Nov 20 Nov 28: Academic First Term Exams', description: 'November 2025' },
    { id: '2', dateRange: 'Dec 20 - Dec 30: Winter Break', description: 'December 2025' },
    { id: '3', dateRange: 'Feb 02 - Feb 14: Islamic Studies Mid Term Exams', description: 'February 2026' },
    { id: '4', dateRange: 'Mar 04 - Mar 06: Hifz Exams\nMar 07- Mar 24: Ramadan & Eid al-Fitr Break', description: 'March 2026' },
  ]);
  
  // UI State
  const [selectedColorId, setSelectedColorId] = useState<string | null>(legendItems[0]?.id || null);
  const [lastClickedDate, setLastClickedDate] = useState<string | null>(null);

  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // Handlers
  const handleRangeApply = () => {
    if (!rangeStart || !rangeEnd || !selectedColorId) return;
    
    const selectedItem = legendItems.find(i => i.id === selectedColorId);
    if (!selectedItem) return;

    // Fix: Use UTC to avoid timezone shifts
    const start = new Date(rangeStart + 'T00:00:00Z');
    const end = new Date(rangeEnd + 'T00:00:00Z');
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const startDate = start < end ? start : end;
      const endDate = start < end ? end : start;
      
      const newColors = { ...dayColors };
      const current = new Date(startDate);
      
      let safety = 0;
      while (current <= endDate && safety < 1000) {
        const dateStr = current.toISOString().split('T')[0];
        newColors[dateStr] = selectedItem.color;
        current.setUTCDate(current.getUTCDate() + 1);
        safety++;
      }
      setDayColors(newColors);
    }
  };

  const handleDayClick = (date: string, isShiftKey: boolean) => {
    if (!selectedColorId) return;
    
    const selectedItem = legendItems.find(i => i.id === selectedColorId);
    if (!selectedItem) return;

    if (isShiftKey && lastClickedDate) {
      // Range selection
      // Fix: Use UTC to avoid timezone shifts
      const start = new Date(lastClickedDate + 'T00:00:00Z');
      const end = new Date(date + 'T00:00:00Z');
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const startDate = start < end ? start : end;
        const endDate = start < end ? end : start;
        
        const newColors = { ...dayColors };
        const current = new Date(startDate);
        
        while (current <= endDate) {
          const dateStr = current.toISOString().split('T')[0];
          newColors[dateStr] = selectedItem.color;
          current.setUTCDate(current.getUTCDate() + 1);
        }

        setDayColors(newColors);
      }
    } else {
      // Single click
      const currentColor = dayColors[date];
      if (currentColor === selectedItem.color) {
        const newColors = { ...dayColors };
        delete newColors[date];
        setDayColors(newColors);
      } else {
        setDayColors({ ...dayColors, [date]: selectedItem.color });
      }
      setLastClickedDate(date);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate 12 months starting from September (8)
  const startMonth = 8; // September
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(startYear, startMonth + i, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });

  return (
    <>
      {/* Main Interactive View - Hidden on Print */}
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans print:hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-lg font-bold text-gray-700">Academic Calendar Builder</h1>
            
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Range:</span>
                <input 
                  type="date" 
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <span className="text-gray-400">to</span>
                <input 
                  type="date" 
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <button 
                onClick={handleRangeApply}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                disabled={!rangeStart || !rangeEnd || !selectedColorId}
              >
                Apply Color
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Printer size={18} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-[297mm] mx-auto p-8 bg-white shadow-xl my-8 min-h-[210mm]">
          <CalendarHeader 
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            startYear={startYear}
            setStartYear={setStartYear}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8 h-full">
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 flex-grow">
                {months.map((m) => (
                  <MonthGrid
                    key={`${m.year}-${m.month}`}
                    year={m.year}
                    month={m.month}
                    dayColors={dayColors}
                    legendItems={legendItems}
                    onDayClick={handleDayClick}
                  />
                ))}
              </div>
              
              <div className="mt-8">
                <Legend 
                  legendItems={legendItems}
                  setLegendItems={setLegendItems}
                  selectedColorId={selectedColorId}
                  setSelectedColorId={setSelectedColorId}
                />
              </div>
            </div>

            <div className="border-l pl-4 border-gray-200 h-full">
              <ImportantDates 
                dates={importantDates}
                setDates={setImportantDates}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Dedicated Print View - Only Visible on Print */}
      <PrintView 
        institutionName={institutionName}
        subtitle={subtitle}
        startYear={startYear}
        logoUrl={logoUrl}
        dayColors={dayColors}
        legendItems={legendItems}
        importantDates={importantDates}
        months={months}
      />
      
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 5mm;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}

export default App;
