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

export interface CalendarState {
  startYear: number;
  startMonth: number; // 0-11 (usually 7 or 8 for academic year)
  institutionName: string;
  logoUrl: string | null;
  dayColors: Record<string, string>; // date -> color hex
  legend: LegendItem[];
  importantDates: ImportantDate[];
}
