import {
  CalendarState,
  CalendarSettings,
  Semester,
  Course,
  Holiday,
  COURSE_COLORS,
  HOLIDAY_COLORS,
} from "@/types/calendar";
import { addDays, format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isWeekend, differenceInWeeks } from "date-fns";

// ---------- Default state ----------

export function createDefaultSettings(): CalendarSettings {
  return {
    institution: "My University",
    academicYear: "2025-2026",
    theme: "light",
    primaryColor: "#3B82F6",
    accentColor: "#10B981",
    fontSize: "md",
    showWeekNumbers: true,
    showCourseTime: true,
    showRoom: true,
    showInstructor: false,
    defaultView: "month",
    firstDayOfWeek: 0,
    autoDetectHolidays: true,
    country: "US",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  };
}

export function createDefaultCourse(index: number = 0): Course {
  return {
    id: crypto.randomUUID(),
    name: `Course ${index + 1}`,
    code: `CS${100 + index}`,
    color: COURSE_COLORS[index % COURSE_COLORS.length],
    instructor: "",
    room: "",
    credits: 3,
    meetingDays: [1, 3, 5], // Mon, Wed, Fri
    startTime: "09:00",
    endTime: "09:50",
    notes: "",
  };
}

export function createDefaultSemester(name: string, startDate: string, endDate: string): Semester {
  return {
    id: crypto.randomUUID(),
    name,
    startDate,
    endDate,
    color: COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)],
    courses: [],
    holidays: [],
    weekStart: 0,
    showWeekends: false,
  };
}

export function createDefaultState(): CalendarState {
  const currentYear = new Date().getFullYear();
  const fallSemester = createDefaultSemester(
    "Fall Semester",
    `${currentYear}-08-25`,
    `${currentYear}-12-15`
  );
  const springSemester = createDefaultSemester(
    "Spring Semester",
    `${currentYear + 1}-01-13`,
    `${currentYear + 1}-05-10`
  );

  // Pre-populate with sample holidays
  fallSemester.holidays = getDefaultHolidays(currentYear, "fall");
  springSemester.holidays = getDefaultHolidays(currentYear + 1, "spring");

  return {
    semesters: [fallSemester, springSemester],
    activeSemesterId: fallSemester.id,
    settings: createDefaultSettings(),
    currentView: "month",
    selectedDate: fallSemester.startDate,
  };
}

// ---------- Holiday auto-generation ----------

export function getDefaultHolidays(year: number, term: "fall" | "spring"): Holiday[] {
  const holidays: Holiday[] = [];

  if (term === "fall") {
    holidays.push(
      {
        id: crypto.randomUUID(),
        name: "Labor Day",
        date: getNthWeekdayOfMonth(year, 8, 1, 1), // 1st Monday in September
        type: "holiday",
        color: HOLIDAY_COLORS.holiday,
        recurring: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Fall Break",
        date: `${year}-10-14`,
        endDate: `${year}-10-15`,
        type: "break",
        color: HOLIDAY_COLORS.break,
        recurring: false,
      },
      {
        id: crypto.randomUUID(),
        name: "Thanksgiving Break",
        date: getThursdayOfMonth(year, 10, 4), // 4th Thursday of November
        endDate: addDays(parseISO(getThursdayOfMonth(year, 10, 4)), 2).toISOString().split("T")[0],
        type: "break",
        color: HOLIDAY_COLORS.break,
        recurring: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Final Exams",
        date: `${year}-12-09`,
        endDate: `${year}-12-15`,
        type: "exam",
        color: HOLIDAY_COLORS.exam,
        recurring: false,
      }
    );
  } else {
    holidays.push(
      {
        id: crypto.randomUUID(),
        name: "MLK Day",
        date: getNthWeekdayOfMonth(year, 0, 1, 3), // 3rd Monday in January
        type: "holiday",
        color: HOLIDAY_COLORS.holiday,
        recurring: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Spring Break",
        date: `${year}-03-10`,
        endDate: `${year}-03-14`,
        type: "break",
        color: HOLIDAY_COLORS.break,
        recurring: false,
      },
      {
        id: crypto.randomUUID(),
        name: "Memorial Day",
        date: getLastWeekdayOfMonth(year, 4, 1), // Last Monday in May
        type: "holiday",
        color: HOLIDAY_COLORS.holiday,
        recurring: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Final Exams",
        date: `${year}-05-05`,
        endDate: `${year}-05-10`,
        type: "exam",
        color: HOLIDAY_COLORS.exam,
        recurring: false,
      }
    );
  }

  return holidays;
}

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): string {
  let date = new Date(year, month, 1);
  let count = 0;
  while (date.getMonth() === month) {
    if (date.getDay() === weekday) {
      count++;
      if (count === nth) return format(date, "yyyy-MM-dd");
    }
    date = addDays(date, 1);
  }
  return format(date, "yyyy-MM-dd");
}

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): string {
  let date = new Date(year, month + 1, 0); // last day of month
  while (date.getDay() !== weekday) {
    date = addDays(date, -1);
  }
  return format(date, "yyyy-MM-dd");
}

function getThursdayOfMonth(year: number, month: number, nth: number): string {
  return getNthWeekdayOfMonth(year, month, 4, nth);
}

// ---------- Calendar grid helpers ----------

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  weekNumber: number;
  courses: Course[];
  holidays: Holiday[];
}

export function getMonthGrid(
  year: number,
  month: number,
  semester: Semester | null,
  firstDayOfWeek: number = 0
): CalendarDay[][] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const today = format(new Date(), "yyyy-MM-dd");

  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];

  days.forEach((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const courses = semester ? getCoursesForDay(day, semester) : [];
    const holidays = semester ? getHolidaysForDay(dateStr, semester) : [];
    const weekNum = differenceInWeeks(day, gridStart) + 1;

    week.push({
      date: dateStr,
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: dateStr === today,
      isWeekend: isWeekend(day),
      weekNumber: weekNum,
      courses,
      holidays,
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  return weeks;
}

export function getCoursesForDay(day: Date, semester: Semester): Course[] {
  const dayOfWeek = day.getDay();
  const dateStr = format(day, "yyyy-MM-dd");

  // Don't show courses on holidays/breaks
  const isHoliday = semester.holidays.some((h) => {
    if (h.endDate) {
      return dateStr >= h.date && dateStr <= h.endDate;
    }
    return h.date === dateStr;
  });

  if (isHoliday) return [];

  // Don't show courses outside semester range
  if (dateStr < semester.startDate || dateStr > semester.endDate) return [];

  return semester.courses.filter((c) => c.meetingDays.includes(dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6));
}

export function getHolidaysForDay(dateStr: string, semester: Semester): Holiday[] {
  return semester.holidays.filter((h) => {
    if (h.endDate) {
      return dateStr >= h.date && dateStr <= h.endDate;
    }
    return h.date === dateStr;
  });
}

// ---------- iCal export ----------

export function generateICalendar(semesters: Semester[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Academic Calendar Builder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  semesters.forEach((semester) => {
    // Add courses as recurring events
    semester.courses.forEach((course) => {
      const startISO = semester.startDate.replace(/-/g, "");
      const endISO = semester.endDate.replace(/-/g, "");
      const byday = course.meetingDays
        .map((d) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][d])
        .join(",");

      const startTime = course.startTime.replace(":", "") + "00";
      const endTime = course.endTime.replace(":", "") + "00";

      lines.push(
        "BEGIN:VEVENT",
        `UID:${course.id}@academic-calendar`,
        `DTSTART;TZID=America/New_York:${startISO}T${startTime}`,
        `DTEND;TZID=America/New_York:${startISO}T${endTime}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${endISO}T235959Z`,
        `SUMMARY:${course.code} - ${course.name}`,
        `LOCATION:${course.room}`,
        `DESCRIPTION:Instructor: ${course.instructor}\\nCredits: ${course.credits}`,
        "END:VEVENT"
      );
    });

    // Add holidays as events
    semester.holidays.forEach((holiday) => {
      const startISO = holiday.date.replace(/-/g, "");
      const endISO = (holiday.endDate || holiday.date).replace(/-/g, "");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${holiday.id}@academic-calendar`,
        `DTSTART;VALUE=DATE:${startISO}`,
        `DTEND;VALUE=DATE:${endISO}`,
        `SUMMARY:${holiday.name}`,
        "END:VEVENT"
      );
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// ---------- CSV export ----------

export function generateCSV(semester: Semester): string {
  const rows: string[][] = [
    ["Date", "Day", "Course Code", "Course Name", "Instructor", "Room", "Start Time", "End Time", "Notes"],
  ];

  const start = parseISO(semester.startDate);
  const end = parseISO(semester.endDate);
  const days = eachDayOfInterval({ start, end });

  days.forEach((day) => {
    const courses = getCoursesForDay(day, semester);
    courses.forEach((course) => {
      rows.push([
        format(day, "MM/dd/yyyy"),
        format(day, "EEEE"),
        course.code,
        course.name,
        course.instructor,
        course.room,
        course.startTime,
        course.endTime,
        course.notes,
      ]);
    });
  });

  return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}

// ---------- Semester stats ----------

export function getSemesterStats(semester: Semester) {
  const start = parseISO(semester.startDate);
  const end = parseISO(semester.endDate);
  const days = eachDayOfInterval({ start, end });

  const totalWeeks = Math.ceil(days.length / 7);
  const totalClassDays = days.filter((d) => {
    const dateStr = format(d, "yyyy-MM-dd");
    const dayOfWeek = d.getDay();
    const isHoliday = semester.holidays.some((h) => {
      if (h.endDate) return dateStr >= h.date && dateStr <= h.endDate;
      return h.date === dateStr;
    });
    const isWeekendDay = isWeekend(d);
    return !isHoliday && !isWeekendDay;
  }).length;

  const totalCourseHours = semester.courses.reduce((total, course) => {
    const meetDays = course.meetingDays.length;
    const [startH, startM] = course.startTime.split(":").map(Number);
    const [endH, endM] = course.endTime.split(":").map(Number);
    const durationMins = (endH * 60 + endM) - (startH * 60 + startM);
    return total + (meetDays * totalWeeks * durationMins) / 60;
  }, 0);

  return {
    totalWeeks,
    totalClassDays,
    totalCourseHours: Math.round(totalCourseHours),
    totalCourses: semester.courses.length,
    totalHolidays: semester.holidays.length,
    totalCredits: semester.courses.reduce((s, c) => s + c.credits, 0),
  };
}

// ---------- Format helpers ----------

export function formatTime(time: string, format12h: boolean): string {
  const [h, m] = time.split(":").map(Number);
  if (!format12h) return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatDate(dateStr: string, fmt: string): string {
  try {
    const d = parseISO(dateStr);
    switch (fmt) {
      case "DD/MM/YYYY": return format(d, "dd/MM/yyyy");
      case "YYYY-MM-DD": return format(d, "yyyy-MM-dd");
      default: return format(d, "MM/dd/yyyy");
    }
  } catch {
    return dateStr;
  }
}
