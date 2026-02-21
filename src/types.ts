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
}

export interface CalendarSettings {
  startMonth: number; // 0-11
  numMonths: number; // number of months to display (6, 9, 12)
  accentColor: string; // hex color for month header background
  highlightWeekends: boolean; // shade weekend columns
}

export interface CalendarState {
  startYear: number;
  startMonth: number; // 0-11
  institutionName: string;
  logoUrl: string | null;
  dayColors: Record<string, string>; // date -> color hex
  legend: LegendItem[];
  importantDates: ImportantDate[];
}
