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
  legendItemId?: string;
  isDescriptionCustomized?: boolean;
  isDateRangeCustomized?: boolean;
  sortDate?: string;  // YYYY-MM-DD: first date of this entry (used for month grouping)
  color?: string;     // custom color hex for manual entries
}

export interface CalendarSettings {
  startMonth: number; // 0-11
  numMonths: number; // number of months to display (6, 9, 12)
  accentColor: string; // hex color for month header background
  highlightWeekends: boolean; // shade weekend columns
  theme: string; // theme id from themes.ts
  dateFontSize: number; // font size (px) for day numbers in grid
  dateBold: boolean; // render day numbers bold
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
