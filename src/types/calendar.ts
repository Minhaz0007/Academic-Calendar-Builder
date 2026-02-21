export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  instructor: string;
  room: string;
  credits: number;
  meetingDays: DayOfWeek[];
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  notes: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // ISO date string "YYYY-MM-DD"
  endDate?: string; // For multi-day breaks
  type: "holiday" | "break" | "exam" | "event";
  color: string;
  recurring: boolean;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  color: string;
  courses: Course[];
  holidays: Holiday[];
  weekStart: DayOfWeek;
  showWeekends: boolean;
}

export interface CalendarSettings {
  institution: string;
  academicYear: string;
  theme: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
  fontSize: "sm" | "md" | "lg";
  showWeekNumbers: boolean;
  showCourseTime: boolean;
  showRoom: boolean;
  showInstructor: boolean;
  defaultView: "month" | "week" | "semester" | "list";
  firstDayOfWeek: DayOfWeek;
  autoDetectHolidays: boolean;
  country: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "12h" | "24h";
}

export interface CalendarState {
  semesters: Semester[];
  activeSemesterId: string | null;
  settings: CalendarSettings;
  currentView: "month" | "week" | "semester" | "list";
  selectedDate: string;
}

export const COURSE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16", // lime
];

export const HOLIDAY_COLORS = {
  holiday: "#EF4444",
  break: "#F59E0B",
  exam: "#8B5CF6",
  event: "#10B981",
};

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
