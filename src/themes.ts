export interface CalendarTheme {
  id: string;
  name: string;
  appBg: string;           // Overall page background
  canvasBg: string;        // Main A4 canvas background
  accentColor: string;     // Month header & weekday header background
  headerTextColor: string; // Text on header cells
  gridGap: string;         // Color shown in grid gaps between cells
  borderColor: string;     // Grid outer border
  dayBg: string;           // Regular day cell background
  weekendBg: string;       // Weekend cell background (when enabled)
  nonCurrentBg: string;    // Cells from adjacent months
  nonCurrentText: string;  // Text for adjacent month cells
  monthTitleColor: string; // Month name text color
  dayText: string;         // Regular day number text
  fontFamily: string;      // CSS font-family stack for the whole calendar
  cellRadius: string;      // border-radius for individual day cells
}

// Every theme keeps day cells light (near-white/cream) — the bulk of a printed
// calendar page — and reserves rich color for the header/accent bar only, so
// printing stays ink-light. Text/background pairs are chosen for strong
// contrast (dark ink on light paper, light ink on a solid dark accent bar).
export const THEMES: CalendarTheme[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    appBg: '#f5f5f4',
    canvasBg: '#ffffff',
    accentColor: '#18181b',
    headerTextColor: '#ffffff',
    gridGap: '#e4e4e7',
    borderColor: '#71717a',
    dayBg: '#ffffff',
    weekendBg: '#f4f4f5',
    nonCurrentBg: '#fafafa',
    nonCurrentText: '#d4d4d8',
    monthTitleColor: '#18181b',
    dayText: '#27272a',
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    cellRadius: '0px',
  },
  {
    id: 'ivory',
    name: 'Ivory Elegance',
    appBg: '#f0ebe1',
    canvasBg: '#fffdf8',
    accentColor: '#3d3229',
    headerTextColor: '#f5ead2',
    gridGap: '#d8cdb8',
    borderColor: '#9c8a6a',
    dayBg: '#fffdf8',
    weekendBg: '#f5efe0',
    nonCurrentBg: '#f7f2e8',
    nonCurrentText: '#dcd0b8',
    monthTitleColor: '#3d3229',
    dayText: '#2b241c',
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    cellRadius: '0px',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    appBg: '#e5e5e5',
    canvasBg: '#fafafa',
    accentColor: '#0a0a0a',
    headerTextColor: '#f5f0e0',
    gridGap: '#d4d4d4',
    borderColor: '#525252',
    dayBg: '#fafafa',
    weekendBg: '#ececec',
    nonCurrentBg: '#f2f2f2',
    nonCurrentText: '#c4c4c4',
    monthTitleColor: '#0a0a0a',
    dayText: '#171717',
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
    cellRadius: '0px',
  },

  // ─── Kept from the original set ─────────────────────────────────────────
  {
    id: 'navygold',
    name: 'Navy & Gold',
    appBg: '#e4e0cc',
    canvasBg: '#fefdf4',
    accentColor: '#1a2a6c',
    headerTextColor: '#f0c840',
    gridGap: '#c8b870',
    borderColor: '#8b7536',
    dayBg: '#fefdf4',
    weekendBg: '#f5f0d0',
    nonCurrentBg: '#f0ece0',
    nonCurrentText: '#c8b860',
    monthTitleColor: '#1a2a6c',
    dayText: '#1a2a6c',
    fontFamily: "'Lora', Georgia, 'Times New Roman', serif",
    cellRadius: '1px',
  },

  {
    id: 'emerald',
    name: 'Emerald',
    appBg: '#dbe9e0',
    canvasBg: '#f7fcf9',
    accentColor: '#0f5132',
    headerTextColor: '#ffffff',
    gridGap: '#bfe0cc',
    borderColor: '#4d8b68',
    dayBg: '#f7fcf9',
    weekendBg: '#e7f5ec',
    nonCurrentBg: '#eff8f2',
    nonCurrentText: '#bfe0cc',
    monthTitleColor: '#0f5132',
    dayText: '#0d3b26',
    fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    cellRadius: '0px',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    appBg: '#ecdcdc',
    canvasBg: '#fdf7f7',
    accentColor: '#5c1a2b',
    headerTextColor: '#f5e6c8',
    gridGap: '#dcbcc0',
    borderColor: '#8a4a56',
    dayBg: '#fdf7f7',
    weekendBg: '#f6e8e8',
    nonCurrentBg: '#f8f0f0',
    nonCurrentText: '#e0c0c4',
    monthTitleColor: '#5c1a2b',
    dayText: '#3d0f1a',
    fontFamily: "'Playfair Display', Georgia, serif",
    cellRadius: '0px',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    appBg: '#f0ddd0',
    canvasBg: '#fef9f5',
    accentColor: '#a3441e',
    headerTextColor: '#fff4ea',
    gridGap: '#e8c4ac',
    borderColor: '#c07a4e',
    dayBg: '#fef9f5',
    weekendBg: '#fbeee2',
    nonCurrentBg: '#faf2ea',
    nonCurrentText: '#eac7ac',
    monthTitleColor: '#8a3818',
    dayText: '#4a2010',
    fontFamily: "'Lora', Georgia, serif",
    cellRadius: '0px',
  },
  {
    id: 'sage',
    name: 'Sage',
    appBg: '#e4e8df',
    canvasBg: '#f9faf7',
    accentColor: '#4a5d43',
    headerTextColor: '#f5f7f0',
    gridGap: '#d0d8c8',
    borderColor: '#8a9a80',
    dayBg: '#f9faf7',
    weekendBg: '#eef1e8',
    nonCurrentBg: '#f3f5ef',
    nonCurrentText: '#cdd6c4',
    monthTitleColor: '#3a4a34',
    dayText: '#2c3a28',
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    cellRadius: '2px',
  },
  {
    id: 'steel',
    name: 'Steel Blue',
    appBg: '#dde3e8',
    canvasBg: '#f7fafc',
    accentColor: '#2f4858',
    headerTextColor: '#f0f4f7',
    gridGap: '#c6d0d8',
    borderColor: '#6b8494',
    dayBg: '#f7fafc',
    weekendBg: '#e9eef2',
    nonCurrentBg: '#eef2f5',
    nonCurrentText: '#c2ccd2',
    monthTitleColor: '#1c2e38',
    dayText: '#1c2e38',
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    cellRadius: '2px',
  },
  {
    id: 'espresso',
    name: 'Espresso',
    appBg: '#e5dcd0',
    canvasBg: '#faf6f0',
    accentColor: '#3e2a1e',
    headerTextColor: '#f0e2cc',
    gridGap: '#d6c4ac',
    borderColor: '#8a6a4a',
    dayBg: '#faf6f0',
    weekendBg: '#f2e8dc',
    nonCurrentBg: '#f5efe6',
    nonCurrentText: '#ddc9ae',
    monthTitleColor: '#3e2a1e',
    dayText: '#2a1c12',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    cellRadius: '0px',
  },
];

export const DEFAULT_THEME = THEMES[0];

export const getTheme = (id: string): CalendarTheme =>
  THEMES.find(t => t.id === id) ?? DEFAULT_THEME;
