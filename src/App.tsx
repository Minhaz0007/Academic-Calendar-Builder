import React, { useState, useEffect, useRef } from 'react';
import { CalendarHeader } from './components/CalendarHeader';
import { Legend } from './components/Legend';
import { ImportantDates } from './components/ImportantDates';
import { MonthGrid } from './components/MonthGrid';
import { PrintView } from './components/PrintView';
import { LegendItem, ImportantDate, CalendarSettings } from './types';
import { supabase, getSessionKey } from './lib/supabase';
import { THEMES, getTheme } from './themes';
import { Printer, Undo2, Redo2, Eraser, Download, Upload, Settings, ChevronDown, CloudUpload, Check, AlertCircle } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const DEFAULT_SETTINGS: CalendarSettings = {
  startMonth: 8, // September
  numMonths: 12,
  accentColor: '#a5f3fc',
  highlightWeekends: false,
  theme: 'classic',
  dateFontSize: 14,
  dateBold: false,
};

const STORAGE_KEY = 'academicCalendarState_v2';

const DEFAULT_LEGEND: LegendItem[] = [
  { id: '1', color: '#00ff00', label: 'FIRST DAY OF SCHOOL', description: 'September 3rd', style: 'cross' },
  { id: '2', color: '#ff0000', label: 'WINTER BREAK', description: 'Dec 20th - Dec 30th', style: 'cross' },
  { id: '3', color: '#ff6600', label: 'SUMMER BREAK', description: 'August 7th - September 1st', style: 'cross' },
  { id: '4', color: '#ff99cc', label: 'EID AL-ADHA BREAK', description: 'May 23rd - 31st', style: 'cross' },
];

const DEFAULT_DATES: ImportantDate[] = [];

// ── Date range helpers for auto Important Dates ────────────────────────────
const DATE_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  if (start === end) return `${DATE_MONTHS[s.getUTCMonth()]} ${s.getUTCDate()}`;
  return `${DATE_MONTHS[s.getUTCMonth()]} ${s.getUTCDate()} - ${DATE_MONTHS[e.getUTCMonth()]} ${e.getUTCDate()}`;
}

function computeDateRangesText(dayColors: Record<string, string>, legendItemId: string): string {
  const dates = Object.keys(dayColors).filter(d => dayColors[d] === legendItemId).sort();
  if (dates.length === 0) return '';
  const ranges: string[] = [];
  let start = dates[0];
  let prev = dates[0];
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (new Date(dates[i] + 'T00:00:00Z').getTime() - new Date(prev + 'T00:00:00Z').getTime()) /
      86400000;
    if (diff === 1) {
      prev = dates[i];
    } else {
      ranges.push(formatDateRange(start, prev));
      start = dates[i];
      prev = dates[i];
    }
  }
  ranges.push(formatDateRange(start, prev));
  return ranges.join('\n');
}

/** Returns the last day of a given month/year as a Date (UTC). */
function lastDayOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month + 1, 0));
}

/**
 * Inserts ' | ' separators into legacy subtitle strings that used plain spaces
 * between the address, telephone, and website segments.
 */
function migrateSubtitle(raw: string): string {
  if (raw.includes('|')) return raw; // already has separators
  return raw
    .replace(/\s+(Tel:)/i, '  |  $1')
    .replace(/\s+(www\.|https?:\/\/)/gi, '  |  $1');
}

/**
 * Migrates legacy dayColors (date → hexColor) to the current format
 * (date → legendItemId). Values that already look like IDs are left untouched.
 */
function migrateDayColors(
  raw: Record<string, string>,
  items: LegendItem[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [date, value] of Object.entries(raw)) {
    if (value.startsWith('#')) {
      // Old format: find the matching legend item by color
      const item = items.find(i => i.color === value);
      if (item) result[date] = item.id;
      // Dates with no matching legend item are dropped (color was deleted)
    } else {
      result[date] = value;
    }
  }
  return result;
}

function App() {
  // Core state
  const [startYear, setStartYear] = useState(2025);
  const [institutionName, setInstitutionName] = useState('MADINATUL ULOOM');
  const [subtitle, setSubtitle] = useState('995 Fillmore Avenue, Buffalo, NY 14211  |  Tel: (716) 292-5956  |  www.madinatululoom.org');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [dayColors, setDayColors] = useState<Record<string, string>>({});
  const [legendItems, setLegendItems] = useState<LegendItem[]>(DEFAULT_LEGEND);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>(DEFAULT_DATES);
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);

  // UI / interaction state
  const [selectedColorId, setSelectedColorId] = useState<string | null>(DEFAULT_LEGEND[0].id);
  const [showSettings, setShowSettings] = useState(false);

  // Click-click range selection
  const [pendingRangeStart, setPendingRangeStart] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

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

  // Undo / Redo stack
  const [colorHistory, setColorHistory] = useState<Record<string, string>[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const importRef = useRef<HTMLInputElement>(null);

  // Clear pending range when selected color changes
  useEffect(() => {
    setPendingRangeStart(null);
  }, [selectedColorId]);

  // Escape key cancels pending range start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingRangeStart(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Auto-sync Important Dates from dayColors + legendItems ─────────────────
  useEffect(() => {
    setImportantDates(prev => {
      // Preserve manually-added entries (no legendItemId)
      const manual = prev.filter(d => !d.legendItemId);
      // Build one auto-entry per legend item that has at least one date applied
      const autoWithDate: Array<{ entry: ImportantDate; firstDate: string }> = [];
      for (const item of legendItems) {
        const rangeText = computeDateRangesText(dayColors, item.id);
        if (!rangeText) continue;
        const existing = prev.find(d => d.legendItemId === item.id);
        // Preserve user-customised description; otherwise sync with the item label
        const description = existing?.isDescriptionCustomized
          ? existing.description
          : item.label;
        // Preserve user-customised date range; otherwise sync from calendar colors
        const dateRange = existing?.isDateRangeCustomized
          ? existing.dateRange
          : rangeText;
        const firstDate = Object.keys(dayColors)
          .filter(d => dayColors[d] === item.id)
          .sort()[0] ?? '';
        autoWithDate.push({
          entry: {
            id: `auto-${item.id}`,
            legendItemId: item.id,
            description,
            dateRange,
            isDescriptionCustomized: existing?.isDescriptionCustomized,
            isDateRangeCustomized: existing?.isDateRangeCustomized,
            sortDate: firstDate || existing?.sortDate,
          },
          firstDate,
        });
      }
      // Sort auto entries chronologically by their earliest calendar date
      autoWithDate.sort((a, b) => a.firstDate.localeCompare(b.firstDate));
      return [...autoWithDate.map(x => x.entry), ...manual];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayColors, legendItems]);

  // ── Persist & restore (Supabase) ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('calendars')
        .select('*')
        .eq('session_key', getSessionKey())
        .maybeSingle();
      if (data) {
        if (typeof data.start_year === 'number') setStartYear(data.start_year);
        if (typeof data.institution_name === 'string') setInstitutionName(data.institution_name);
        if (typeof data.subtitle === 'string') setSubtitle(migrateSubtitle(data.subtitle));
        if (typeof data.logo_url === 'string') setLogoUrl(data.logo_url);
        const loadedItems: LegendItem[] = Array.isArray(data.legend_items)
          ? data.legend_items
          : DEFAULT_LEGEND;
        if (Array.isArray(data.legend_items)) setLegendItems(loadedItems);
        if (data.day_colors && typeof data.day_colors === 'object') {
          const migrated = migrateDayColors(data.day_colors, loadedItems);
          setDayColors(migrated);
          setColorHistory([migrated]);
        }
        if (Array.isArray(data.important_dates)) setImportantDates(data.important_dates);
        if (data.settings && typeof data.settings === 'object') {
          setSettings(prev => ({ ...DEFAULT_SETTINGS, ...data.settings }));
        }
      }
    };
    load();
  }, []);

  // Debounced auto-save — waits 1 s after last change before writing to Supabase
  useEffect(() => {
    const timer = setTimeout(async () => {
      await supabase.from('calendars').upsert({
        session_key:      getSessionKey(),
        institution_name: institutionName,
        subtitle,
        logo_url:         logoUrl,
        start_year:       startYear,
        settings,
        day_colors:       dayColors,
        legend_items:     legendItems,
        important_dates:  importantDates,
      }, { onConflict: 'session_key' });
    }, 1000);
    return () => clearTimeout(timer);
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
    legendItemId: string,
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
      result[cur.toISOString().split('T')[0]] = legendItemId;
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
    pushToHistory(fillRange(dayColors, rangeStart, rangeEnd, item.id));
  };

  const handleMonthRangeApply = () => {
    if (!selectedColorId) return;
    const item = legendItems.find(i => i.id === selectedColorId);
    if (!item) return;

    // Build full date strings: 1st of start month → last day of end month
    const fromISO = `${mrStartYear}-${String(mrStartMonth + 1).padStart(2, '0')}-01`;
    const lastDay = lastDayOfMonth(mrEndYear, mrEndMonth);
    const toISO = lastDay.toISOString().split('T')[0];

    pushToHistory(fillRange(dayColors, fromISO, toISO, item.id));
  };

  // ── Click-click range selection ────────────────────────────────────────────
  const handleDayClick = (date: string) => {
    if (!selectedColorId) return;
    const item = legendItems.find(i => i.id === selectedColorId);
    if (!item) return;

    if (!pendingRangeStart) {
      // First click: set range start anchor
      setPendingRangeStart(date);
    } else {
      // Second click: apply range
      if (date === pendingRangeStart) {
        // Same date clicked: toggle single day
        const newColors = { ...dayColors };
        if (newColors[date] === item.id) {
          delete newColors[date];
        } else {
          newColors[date] = item.id;
        }
        pushToHistory(newColors);
      } else {
        // Different date: fill range
        pushToHistory(fillRange(dayColors, pendingRangeStart, date, item.id));
      }
      setPendingRangeStart(null);
    }
  };

  // ── Clear handlers ─────────────────────────────────────────────────────────
  const handleClearSelected = () => {
    if (!selectedColorId) return;
    const filtered: Record<string, string> = {};
    for (const date in dayColors) {
      if (dayColors[date] !== selectedColorId) filtered[date] = dayColors[date];
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
        const importedItems: LegendItem[] = Array.isArray(s.legendItems) ? s.legendItems : legendItems;
        if (Array.isArray(s.legendItems)) setLegendItems(importedItems);
        if (s.dayColors && typeof s.dayColors === 'object') {
          pushToHistory(migrateDayColors(s.dayColors, importedItems));
        }
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

  // ── Manual Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const { error } = await supabase.from('calendars').upsert({
        session_key:      getSessionKey(),
        institution_name: institutionName,
        subtitle,
        logo_url:         logoUrl,
        start_year:       startYear,
        settings,
        day_colors:       dayColors,
        legend_items:     legendItems,
        important_dates:  importantDates,
      }, { onConflict: 'session_key' });
      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
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

  // Active theme
  const activeTheme = getTheme(settings.theme ?? 'classic');

  // Effective accent: if user has manually overridden via the color picker, use that;
  // otherwise fall back to the theme's accent color.
  // We track a manual override: if settings.accentColor differs from the classic default,
  // the user has chosen it explicitly. Here we just always let the theme accent apply
  // unless the user changed it after picking the theme (settings.accentColor takes priority
  // only for the 'classic' theme behaviour – we honour it as an override across all themes).
  const effectiveAccent = settings.accentColor !== DEFAULT_SETTINGS.accentColor
    ? settings.accentColor
    : activeTheme.accentColor;

  // Preview color for hover range
  const previewColor = selectedColorId
    ? legendItems.find(i => i.id === selectedColorId)?.color
    : undefined;

  return (
    <>
      {/* ── Interactive View (hidden on print) ──────────────────────────── */}
      <div
        className="min-h-screen text-gray-900 font-sans print:hidden"
        style={{ backgroundColor: activeTheme.appBg }}
      >

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

                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  title="Save to cloud"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed ${
                    saveStatus === 'saved'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : saveStatus === 'error'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : saveStatus === 'saving'
                      ? 'bg-blue-400 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saveStatus === 'saved' ? (
                    <><Check size={16} /> Saved!</>
                  ) : saveStatus === 'error' ? (
                    <><AlertCircle size={16} /> Error</>
                  ) : saveStatus === 'saving' ? (
                    <><CloudUpload size={16} className="animate-pulse" /> Saving…</>
                  ) : (
                    <><CloudUpload size={16} /> Save</>
                  )}
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

                {/* Theme Picker */}
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600 whitespace-nowrap">Theme:</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSettings(s => ({
                            ...s,
                            theme: t.id,
                            accentColor: DEFAULT_SETTINGS.accentColor, // reset manual override
                          }));
                        }}
                        title={t.name}
                        className={`px-2.5 py-1 rounded border text-xs font-medium transition-all ${
                          settings.theme === t.id
                            ? 'ring-2 ring-blue-500 ring-offset-1 scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: t.accentColor,
                          color: t.headerTextColor,
                          borderColor: t.borderColor,
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-px h-5 bg-gray-300" />

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

                {/* Header Color override */}
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600 whitespace-nowrap">Header Color:</label>
                  <input
                    type="color"
                    value={effectiveAccent}
                    onChange={(e) => setSettings(s => ({ ...s, accentColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0.5 bg-white"
                  />
                  <span className="text-xs text-gray-400">override</span>
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

                <div className="w-px h-5 bg-gray-300" />

                {/* Date font size */}
                <div className="flex items-center gap-2">
                  <label className="font-medium text-gray-600 whitespace-nowrap">Date Size:</label>
                  <input
                    type="range"
                    min={7}
                    max={16}
                    step={1}
                    value={settings.dateFontSize ?? 14}
                    onChange={(e) => setSettings(s => ({ ...s, dateFontSize: parseInt(e.target.value) }))}
                    className="w-24 accent-blue-600"
                  />
                  <span className="text-xs text-gray-500 w-6">{settings.dateFontSize ?? 14}px</span>
                </div>

                {/* Date bold */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="date-bold"
                    checked={settings.dateBold ?? false}
                    onChange={(e) => setSettings(s => ({ ...s, dateBold: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <label htmlFor="date-bold" className="font-medium text-gray-600 cursor-pointer">
                    Bold Dates
                  </label>
                </div>

                <span className="text-xs text-gray-400 ml-auto italic">Use the Save button to persist changes to the cloud</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Pending range hint ─────────────────────────────────────────────── */}
        {pendingRangeStart && (
          <div className="sticky top-[57px] z-10 bg-blue-50 border-b border-blue-200 px-4 py-1.5 text-center text-sm text-blue-700 font-medium">
            Range start: <strong>{pendingRangeStart}</strong> — click another date to complete the range, or click the same date to select just that day.{' '}
            <button
              onClick={() => setPendingRangeStart(null)}
              className="underline hover:text-blue-900 ml-2"
            >
              Cancel (Esc)
            </button>
          </div>
        )}

        {/* ── Main Canvas ───────────────────────────────────────────────────── */}
        <main
          className="max-w-[297mm] mx-auto p-8 shadow-xl my-8 min-h-[210mm]"
          style={{ backgroundColor: activeTheme.canvasBg }}
        >
          <CalendarHeader
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            startYear={startYear}
            setStartYear={setStartYear}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            accentColor={effectiveAccent}
            headerTextColor={activeTheme.headerTextColor}
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
                    onDayHover={setHoveredDate}
                    accentColor={effectiveAccent}
                    highlightWeekends={settings.highlightWeekends}
                    pendingRangeStart={pendingRangeStart}
                    hoveredDate={hoveredDate}
                    previewColor={previewColor}
                    theme={activeTheme}
                    dateFontSize={settings.dateFontSize ?? 14}
                    dateBold={settings.dateBold ?? false}
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

            <div className="border-l pl-4 h-full" style={{ borderColor: activeTheme.borderColor }}>
              <ImportantDates
                dates={importantDates}
                setDates={setImportantDates}
                legendItems={legendItems}
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
        accentColor={effectiveAccent}
        highlightWeekends={settings.highlightWeekends}
        dateFontSize={settings.dateFontSize ?? 14}
        dateBold={settings.dateBold ?? false}
        headerTextColor={activeTheme.headerTextColor}
        theme={activeTheme}
      />

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 4mm; }
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
