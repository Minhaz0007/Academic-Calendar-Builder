import React, { useState, useEffect, useRef } from 'react';
import { CalendarHeader } from './components/CalendarHeader';
import { Legend } from './components/Legend';
import { ImportantDates } from './components/ImportantDates';
import { MonthGrid } from './components/MonthGrid';
import { PrintView } from './components/PrintView';
import { LegendItem, ImportantDate, CalendarSettings } from './types';
import { Printer, Undo2, Redo2, Eraser, Download, Upload, Settings, ChevronDown } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const DEFAULT_SETTINGS: CalendarSettings = {
  startMonth: 8, // September
  numMonths: 12,
  accentColor: '#a5f3fc',
  highlightWeekends: false,
};

const STORAGE_KEY = 'academicCalendarState_v3';

// ── Color palette ──────────────────────────────────────────────────────────
const GREEN = '#22c55e';
const RED   = '#ef4444';
const AMBER = '#fbbf24';

const DEFAULT_LEGEND: LegendItem[] = [
  { id: '1', color: GREEN,  label: 'FIRST DAY OF SCHOOL',         description: 'September 3rd',             style: 'solid' },
  { id: '2', color: GREEN,  label: 'LAST DAY OF SCHOOL',          description: 'August 6th',                style: 'solid' },
  { id: '3', color: AMBER,  label: 'ACADEMIC EXAMS',              description: 'See important dates',       style: 'cross' },
  { id: '4', color: RED,    label: 'WINTER BREAK',                description: 'Dec 20th \u2013 Dec 30th', style: 'cross' },
  { id: '5', color: RED,    label: 'RAMADAN & EID AL-FITR BREAK', description: 'March 13th \u2013 29th',   style: 'cross' },
  { id: '6', color: RED,    label: 'EID AL-ADHA BREAK',           description: 'May 23rd \u2013 31st',     style: 'cross' },
  { id: '7', color: RED,    label: 'INDEPENDENCE DAY',            description: 'July 4th',                  style: 'cross' },
  { id: '8', color: RED,    label: 'SUMMER BREAK',                description: 'Aug 7th \u2013 Sep 1st',   style: 'cross' },
];

const DEFAULT_DATES: ImportantDate[] = [
  { id: '1', description: 'November 2025',  dateRange: 'Nov 20 \u2013 Nov 28: Academic First Term Exams' },
  { id: '2', description: 'December 2025',  dateRange: 'Dec 20 \u2013 Dec 30: Winter Break' },
  { id: '3', description: 'February 2026',  dateRange: 'Feb 02 \u2013 Feb 14: Islamic Studies Mid Term Exams' },
  { id: '4', description: 'March 2026',     dateRange: 'Mar 04 \u2013 Mar 06: Hifz Exams\nMar 13 \u2013 Mar 29: Ramadan & Eid al-Fitr Break' },
  { id: '5', description: 'April 2026',     dateRange: 'Apr 06 \u2013 Apr 10: Academic Second Term Exam' },
  { id: '6', description: 'May 2026',       dateRange: 'May 23 \u2013 May 31: Eid al-Adha Break' },
  { id: '7', description: 'July 2026',      dateRange: 'Jul 04: Independence Day\nJul 13 \u2013 Jul 22: Academic Final Term Exams\nJul 24 \u2013 Aug 06: Islamic Studies Final Term Exams' },
  { id: '8', description: 'August 2026',    dateRange: 'Aug 03 \u2013 Aug 06: Hifz Final Exams\nAug 07 \u2013 Sep 01: Summer Break' },
  { id: '9', description: 'September 2026', dateRange: 'Sep 02: Next school year begins' },
];

/** Returns the last day of a given month/year as a Date (UTC). */
function lastDayOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month + 1, 0));
}

/** Fill a date range with a color into an accumulator object. */
function fillDates(from: string, to: string, color: string, acc: Record<string, string>): void {
  const start = new Date(from + 'T00:00:00Z');
  const end   = new Date(to   + 'T00:00:00Z');
  const cur   = new Date(start);
  while (cur <= end) {
    acc[cur.toISOString().split('T')[0]] = color;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
}

/** Pre-populated day colors matching the 2025/2026 academic year. */
const DEFAULT_DAY_COLORS = (() => {
  const c: Record<string, string> = {};
  // Previous summer break (Aug 7–Sep 1, 2025) – Sep 1 visible in the calendar
  c['2025-09-01'] = RED;
  // First Day of School
  c['2025-09-03'] = GREEN;
  // Academic First Term Exams
  fillDates('2025-11-20', '2025-11-28', AMBER, c);
  // Winter Break
  fillDates('2025-12-20', '2025-12-30', RED, c);
  // Islamic Studies Mid Term Exams
  fillDates('2026-02-02', '2026-02-14', AMBER, c);
  // Hifz Exams
  fillDates('2026-03-04', '2026-03-06', AMBER, c);
  // Ramadan & Eid al-Fitr Break (Mar 13–29)
  fillDates('2026-03-13', '2026-03-29', RED, c);
  // Academic Second Term Exam
  fillDates('2026-04-06', '2026-04-10', AMBER, c);
  // Eid al-Adha Break
  fillDates('2026-05-23', '2026-05-31', RED, c);
  // Independence Day
  c['2026-07-04'] = RED;
  // Academic Final Term Exams
  fillDates('2026-07-13', '2026-07-22', AMBER, c);
  // Islamic Studies Final Term Exams + Hifz Final (Jul 24–Aug 5; Aug 6 = Last Day)
  fillDates('2026-07-24', '2026-08-05', AMBER, c);
  // Last Day of School – overrides exam amber
  c['2026-08-06'] = GREEN;
  // Summer Break 2026
  fillDates('2026-08-07', '2026-09-01', RED, c);
  return c;
})();

function App() {
  // Core state
  const [startYear, setStartYear] = useState(2025);
  const [institutionName, setInstitutionName] = useState('MADINATUL ULOOM');
  const [subtitle, setSubtitle] = useState('995 Fillmore Avenue, Buffalo, NY 14211 Tel: (716) 292-5956 www.madinatululoom.org');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [dayColors, setDayColors] = useState<Record<string, string>>(DEFAULT_DAY_COLORS);
  const [legendItems, setLegendItems] = useState<LegendItem[]>(DEFAULT_LEGEND);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>(DEFAULT_DATES);
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);

  // UI / interaction state
  const [selectedColorId, setSelectedColorId] = useState<string | null>(DEFAULT_LEGEND[0].id);
  const [lastClickedDate, setLastClickedDate] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Date range mode: 'date' = individual date pickers, 'month' = whole-month selectors
  const [rangeMode, setRangeMode] = useState<'date' | 'month'>('date');

  // Date range state
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // Month range state (year + month selects)
  const currentYear = new Date().getFullYear();
  const [mrStartYear, setMrStartYear] = useState(startYear);
  const [mrStartMonth, setMrStartMonth] = useState(settings.startMonth);
  const [mrEndYear, setMrEndYear] = useState(startYear);
  const [mrEndMonth, setMrEndMonth] = useState(settings.startMonth);

  // Undo / Redo stack (starts with the pre-populated defaults)
  const [colorHistory, setColorHistory] = useState<Record<string, string>[]>([DEFAULT_DAY_COLORS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const importRef = useRef<HTMLInputElement>(null);

  // ── Persist & restore ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (typeof s.startYear === 'number') setStartYear(s.startYear);
        if (typeof s.institutionName === 'string') setInstitutionName(s.institutionName);
        if (typeof s.subtitle === 'string') setSubtitle(s.subtitle);
        if (typeof s.logoUrl === 'string') setLogoUrl(s.logoUrl);
        if (s.dayColors && typeof s.dayColors === 'object') {
          const dc = s.dayColors as Record<string, string>;
          setDayColors(dc);
          setColorHistory([dc]);
        }
        if (Array.isArray(s.legendItems)) setLegendItems(s.legendItems);
        if (Array.isArray(s.importantDates)) setImportantDates(s.importantDates);
        if (s.settings && typeof s.settings === 'object') {
          setSettings(prev => ({ ...DEFAULT_SETTINGS, ...s.settings }));
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        startYear, institutionName, subtitle, logoUrl,
        dayColors, legendItems, importantDates, settings,
      }));
    } catch { /* ignore quota errors */ }
  }, [startYear, institutionName, subtitle, logoUrl, dayColors, legendItems, importantDates, settings]);

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const pushToHistory = (newColors: Record<string, string>) => {
    const trimmed = colorHistory.slice(0, historyIndex + 1);
    const next = [...trimmed, newColors].slice(-50);
    setColorHistory(next);
    setHistoryIndex(next.length - 1);
    setDayColors(newColors);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setDayColors(colorHistory[idx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < colorHistory.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setDayColors(colorHistory[idx]);
    }
  };

  // ── Shared color range fill ────────────────────────────────────────────────
  const fillRange = (
    base: Record<string, string>,
    fromISO: string,
    toISO: string,
    color: string,
  ): Record<string, string> => {
    const a = new Date(fromISO + 'T00:00:00Z');
    const b = new Date(toISO + 'T00:00:00Z');
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return base;
    const s = a <= b ? a : b;
    const e = a <= b ? b : a;
    const result = { ...base };
    const cur = new Date(s);
    let guard = 0;
    while (cur <= e && guard < 1000) {
      result[cur.toISOString().split('T')[0]] = color;
      cur.setUTCDate(cur.getUTCDate() + 1);
      guard++;
    }
    return result;
  };

  // ── Range handlers ─────────────────────────────────────────────────────────
  const handleDateRangeApply = () => {
    if (!rangeStart || !rangeEnd || !selectedColorId) return;
    const item = legendItems.find(i => i.id === selectedColorId);
    if (!item) return;
    pushToHistory(fillRange(dayColors, rangeStart, rangeEnd, item.color));
  };

  const handleMonthRangeApply = () => {
    if (!selectedColorId) return;
    const item = legendItems.find(i => i.id === selectedColorId);
    if (!item) return;

    // Build full date strings: 1st of start month → last day of end month
    const fromISO = `${mrStartYear}-${String(mrStartMonth + 1).padStart(2, '0')}-01`;
    const lastDay = lastDayOfMonth(mrEndYear, mrEndMonth);
    const toISO = lastDay.toISOString().split('T')[0];

    pushToHistory(fillRange(dayColors, fromISO, toISO, item.color));
  };

  // ── Day click ──────────────────────────────────────────────────────────────
  const handleDayClick = (date: string, isShiftKey: boolean) => {
    if (!selectedColorId) return;
    const item = legendItems.find(i => i.id === selectedColorId);
    if (!item) return;

    if (isShiftKey && lastClickedDate) {
      pushToHistory(fillRange(dayColors, lastClickedDate, date, item.color));
    } else {
      const newColors = { ...dayColors };
      if (newColors[date] === item.color) {
        delete newColors[date];
      } else {
        newColors[date] = item.color;
      }
      pushToHistory(newColors);
      setLastClickedDate(date);
    }
  };

  // ── Clear handlers ─────────────────────────────────────────────────────────
  const handleClearSelected = () => {
    if (!selectedColorId) return;
    const item = legendItems.find(i => i.id === selectedColorId);
    if (!item) return;
    const filtered: Record<string, string> = {};
    for (const date in dayColors) {
      if (dayColors[date] !== item.color) filtered[date] = dayColors[date];
    }
    pushToHistory(filtered);
  };

  const handleClearAll = () => {
    if (Object.keys(dayColors).length > 0) pushToHistory({});
  };

  // ── Export / Import ────────────────────────────────────────────────────────
  const handleExport = () => {
    const data = { startYear, institutionName, subtitle, dayColors, legendItems, importantDates, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-${startYear}-${startYear + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const s = JSON.parse(reader.result as string);
        if (typeof s.startYear === 'number') setStartYear(s.startYear);
        if (typeof s.institutionName === 'string') setInstitutionName(s.institutionName);
        if (typeof s.subtitle === 'string') setSubtitle(s.subtitle);
        if (s.dayColors && typeof s.dayColors === 'object') pushToHistory(s.dayColors);
        if (Array.isArray(s.legendItems)) setLegendItems(s.legendItems);
        if (Array.isArray(s.importantDates)) setImportantDates(s.importantDates);
        if (s.settings && typeof s.settings === 'object') {
          setSettings(prev => ({ ...DEFAULT_SETTINGS, ...s.settings }));
        }
      } catch {
        alert('Invalid or corrupted calendar file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Generate months ────────────────────────────────────────────────────────
  const months = Array.from({ length: settings.numMonths }, (_, i) => {
    const d = new Date(startYear, settings.startMonth + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Year options for month-range picker
  const yearOptions = [startYear - 1, startYear, startYear + 1, startYear + 2];

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < colorHistory.length - 1;

  return (
    <>
      {/* ── Interactive View (hidden on print) ──────────────────────────── */}
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans print:hidden">

        {/* ── Sticky Toolbar ─────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">

              <h1 className="text-lg font-bold text-gray-700 shrink-0">Academic Calendar Builder</h1>

              {/* ── Range Picker ──────────────────────────────────────────── */}
              <div className="flex flex-col gap-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 text-xs mb-1">
                  <button
                    onClick={() => setRangeMode('date')}
                    className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
                      rangeMode === 'date'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Date Range
                  </button>
                  <button
                    onClick={() => setRangeMode('month')}
                    className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
                      rangeMode === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Month Range
                  </button>
                </div>

                {rangeMode === 'date' ? (
                  /* Individual Date Pickers */
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-400 text-sm">→</span>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleDateRangeApply}
                      disabled={!rangeStart || !rangeEnd || !selectedColorId}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  /* Month + Year Selectors */
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Start */}
                    <select
                      value={mrStartMonth}
                      onChange={(e) => setMrStartMonth(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-1.5 py-1 text-sm bg-white"
                    >
                      {MONTH_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                      value={mrStartYear}
                      onChange={(e) => setMrStartYear(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-1.5 py-1 text-sm bg-white"
                    >
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <span className="text-gray-400 text-sm">→</span>
                    {/* End */}
                    <select
                      value={mrEndMonth}
                      onChange={(e) => setMrEndMonth(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-1.5 py-1 text-sm bg-white"
                    >
                      {MONTH_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                      value={mrEndYear}
                      onChange={(e) => setMrEndYear(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-1.5 py-1 text-sm bg-white"
                    >
                      {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button
                      onClick={handleMonthRangeApply}
                      disabled={!selectedColorId}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* ── Action Buttons ────────────────────────────────────────── */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button onClick={handleUndo} disabled={!canUndo} title="Undo"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors">
                  <Undo2 size={16} />
                </button>
                <button onClick={handleRedo} disabled={!canRedo} title="Redo"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors">
                  <Redo2 size={16} />
                </button>
                <button onClick={handleClearSelected} disabled={!selectedColorId} title="Clear selected color"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors">
                  <Eraser size={16} />
                </button>
                <button onClick={handleClearAll} title="Clear all colors"
                  className="px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 text-xs font-medium transition-colors">
                  Clear All
                </button>

                <div className="w-px h-5 bg-gray-300" />

                <button onClick={handleExport} title="Export as JSON"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors">
                  <Download size={16} />
                </button>
                <button onClick={() => importRef.current?.click()} title="Import from JSON"
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors">
                  <Upload size={16} />
                </button>
                <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

                <div className="w-px h-5 bg-gray-300" />

                <button
                  onClick={() => setShowSettings(!showSettings)} title="Settings"
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-lg border transition-colors ${
                    showSettings ? 'bg-blue-50 border-blue-400 text-blue-600' : 'border-gray-300 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Settings size={15} />
                  <ChevronDown size={11} className={`transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                </button>

                <button onClick={() => window.print()}
                  className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors">
                  <Printer size={17} /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>

          {/* ── Collapsible Settings Panel ────────────────────────────────── */}
          {showSettings && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 text-sm">

                {/* Start Month */}
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600 whitespace-nowrap">Start Month:</label>
                  <select
                    value={settings.startMonth}
                    onChange={(e) => setSettings(s => ({ ...s, startMonth: parseInt(e.target.value) }))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  >
                    {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>

                {/* Months to show */}
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600 whitespace-nowrap">Months:</label>
                  <div className="flex gap-1">
                    {[6, 9, 12].map(n => (
                      <button key={n} onClick={() => setSettings(s => ({ ...s, numMonths: n }))}
                        className={`px-2.5 py-1 rounded border text-sm font-medium transition-colors ${
                          settings.numMonths === n
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                {/* Header Color */}
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600 whitespace-nowrap">Header Color:</label>
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings(s => ({ ...s, accentColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                  />
                  <span className="text-xs text-gray-400">month headers</span>
                </div>

                {/* Highlight Weekends */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="highlight-weekends"
                    checked={settings.highlightWeekends}
                    onChange={(e) => setSettings(s => ({ ...s, highlightWeekends: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <label htmlFor="highlight-weekends" className="font-medium text-gray-600 cursor-pointer">
                    Highlight Weekends
                  </label>
                </div>

                <span className="text-xs text-gray-400 ml-auto italic">All changes auto-saved to browser</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Main Canvas ───────────────────────────────────────────────────── */}
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
                    accentColor={settings.accentColor}
                    highlightWeekends={settings.highlightWeekends}
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

      {/* ── Print View ──────────────────────────────────────────────────────── */}
      <PrintView
        institutionName={institutionName}
        subtitle={subtitle}
        startYear={startYear}
        logoUrl={logoUrl}
        dayColors={dayColors}
        legendItems={legendItems}
        importantDates={importantDates}
        months={months}
        accentColor={settings.accentColor}
        highlightWeekends={settings.highlightWeekends}
      />

      <style>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
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
