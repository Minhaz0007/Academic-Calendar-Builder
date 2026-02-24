export interface CalendarDay {
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
}

export interface LegendItem {
  id: string;
  color: string;
  label: string;
  style?: 'solid' | 'cross';
  description?: string;
}

export interface ImportantDate {
  id: string;
  dateRange: string;
  description: string;
  legendItemId?: string; // set on auto-generated entries; undefined for manual entries
  isDescriptionCustomized?: boolean; // true when user has manually edited the auto-entry description
  isDateRangeCustomized?: boolean;   // true when user has manually edited the auto-entry date range
  color?: string;      // custom color for manual entries (used in print legend)
  firstDate?: string;  // earliest date (YYYY-MM-DD) for month grouping (auto-entries only)
  customMonthLabel?: string; // user-overridden month group header (e.g. "SEPTEMBER, 2025")
  highlight?: string;  // background highlight color for this entry row
}

export interface CalendarSettings {
  startMonth: number; // 0-11
  numMonths: number; // number of months to display (6, 9, 12)
  accentColor: string; // hex color for month header background
  highlightWeekends: boolean; // shade weekend columns
  theme: string; // theme id from themes.ts
  dateFontSize: number; // font size (px) for day numbers in grid
  dateBold: boolean; // render day numbers bold
  eventsFontSize?: number; // base font size (px) for the Important Dates sidebar
}

export interface PrintLegendItem {
  id: string;
  color: string;
  label: string;
}

export interface CalendarState {
  startYear: number;
  startMonth: number; // 0-11
  institutionName: string;
  logoUrl: string | null;
  dayColors: Record<string, string>; // date -> legendItemId
  legend: LegendItem[];
  importantDates: ImportantDate[];
}
