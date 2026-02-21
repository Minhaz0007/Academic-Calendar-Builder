export interface CalendarTheme {
  id: string;
  name: string;
  appBg: string;          // Overall page background
  canvasBg: string;       // Main A4 canvas background
  accentColor: string;    // Month header & weekday header background
  headerTextColor: string; // Text on header cells
  gridGap: string;        // Color shown in grid gaps between cells
  borderColor: string;    // Grid outer border
  dayBg: string;          // Regular day cell background
  weekendBg: string;      // Weekend cell background (when enabled)
  nonCurrentBg: string;   // Cells from adjacent months
  nonCurrentText: string; // Text for adjacent month cells
  monthTitleColor: string; // Month name text color
  dayText: string;        // Regular day number text
}

export const THEMES: CalendarTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    appBg: '#f3f4f6',
    canvasBg: '#ffffff',
    accentColor: '#a5f3fc',
    headerTextColor: '#000000',
    gridGap: '#d1d5db',
    borderColor: '#d1d5db',
    dayBg: '#ffffff',
    weekendBg: '#e0f2fe',
    nonCurrentBg: '#f3f4f6',
    nonCurrentText: '#d1d5db',
    monthTitleColor: '#111827',
    dayText: '#111827',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    appBg: '#dde3f4',
    canvasBg: '#f8f9ff',
    accentColor: '#3949ab',
    headerTextColor: '#ffffff',
    gridGap: '#9fa8da',
    borderColor: '#9fa8da',
    dayBg: '#f8f9ff',
    weekendBg: '#e8eaf6',
    nonCurrentBg: '#eef0f8',
    nonCurrentText: '#c5cae9',
    monthTitleColor: '#1a237e',
    dayText: '#1a237e',
  },
  {
    id: 'forest',
    name: 'Forest',
    appBg: '#dceee0',
    canvasBg: '#f9fdf9',
    accentColor: '#2e7d32',
    headerTextColor: '#ffffff',
    gridGap: '#a5d6a7',
    borderColor: '#a5d6a7',
    dayBg: '#f9fdf9',
    weekendBg: '#e8f5e9',
    nonCurrentBg: '#f1f8f2',
    nonCurrentText: '#c8e6c9',
    monthTitleColor: '#1b5e20',
    dayText: '#1b5e20',
  },
  {
    id: 'parchment',
    name: 'Parchment',
    appBg: '#e8dcc8',
    canvasBg: '#fffde7',
    accentColor: '#6d4c41',
    headerTextColor: '#fff9c4',
    gridGap: '#bcaaa4',
    borderColor: '#bcaaa4',
    dayBg: '#fffde7',
    weekendBg: '#fff9c4',
    nonCurrentBg: '#f5f0e8',
    nonCurrentText: '#d7ccc8',
    monthTitleColor: '#3e2723',
    dayText: '#3e2723',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    appBg: '#d0eef8',
    canvasBg: '#f0faff',
    accentColor: '#0277bd',
    headerTextColor: '#ffffff',
    gridGap: '#81d4fa',
    borderColor: '#81d4fa',
    dayBg: '#f0faff',
    weekendBg: '#e1f5fe',
    nonCurrentBg: '#eaf6fd',
    nonCurrentText: '#b3e5fc',
    monthTitleColor: '#01579b',
    dayText: '#01579b',
  },
  {
    id: 'rosegold',
    name: 'Rose Gold',
    appBg: '#f5d5e4',
    canvasBg: '#fff8fb',
    accentColor: '#ad1457',
    headerTextColor: '#fce4ec',
    gridGap: '#f48fb1',
    borderColor: '#f48fb1',
    dayBg: '#fff8fb',
    weekendBg: '#fce4ec',
    nonCurrentBg: '#fdf0f5',
    nonCurrentText: '#f8bbd0',
    monthTitleColor: '#880e4f',
    dayText: '#880e4f',
  },
  {
    id: 'autumn',
    name: 'Autumn',
    appBg: '#f5e8d0',
    canvasBg: '#fffbf5',
    accentColor: '#e65100',
    headerTextColor: '#fff8e1',
    gridGap: '#ffab91',
    borderColor: '#ffab91',
    dayBg: '#fffbf5',
    weekendBg: '#fff3e0',
    nonCurrentBg: '#fdf5ea',
    nonCurrentText: '#ffccbc',
    monthTitleColor: '#bf360c',
    dayText: '#bf360c',
  },
];

export const DEFAULT_THEME = THEMES[0];

export const getTheme = (id: string): CalendarTheme =>
  THEMES.find(t => t.id === id) ?? DEFAULT_THEME;
