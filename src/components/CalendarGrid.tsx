"use client";

import { useState, useMemo } from "react";
import { Semester, CalendarSettings, MONTH_NAMES, DAY_NAMES } from "@/types/calendar";
import { getMonthGrid, formatTime, CalendarDay } from "@/lib/calendarUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { format, parseISO, addMonths, subMonths } from "date-fns";

interface Props {
  semester: Semester | null;
  settings: CalendarSettings;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function CalendarGrid({ semester, settings, selectedDate, onSelectDate }: Props) {
  const initialDate = selectedDate ? parseISO(selectedDate) : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const weeks = useMemo(
    () => getMonthGrid(year, month, semester, settings.firstDayOfWeek),
    [year, month, semester, settings.firstDayOfWeek]
  );

  // Adjusted day headers based on firstDayOfWeek
  const dayHeaders = useMemo(() => {
    const headers = [...DAY_NAMES];
    return [...headers.slice(settings.firstDayOfWeek), ...headers.slice(0, settings.firstDayOfWeek)];
  }, [settings.firstDayOfWeek]);

  const fontSizeClass = settings.fontSize === "sm" ? "text-xs" : settings.fontSize === "lg" ? "text-sm" : "text-xs";

  function DayCell({ day }: { day: CalendarDay }) {
    const isSelected = day.date === selectedDate;
    const isSemesterDay = semester
      ? day.date >= semester.startDate && day.date <= semester.endDate
      : false;

    return (
      <div
        onClick={() => onSelectDate(day.date)}
        className={clsx(
          "relative min-h-[90px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors overflow-hidden",
          !day.isCurrentMonth && "bg-gray-50/60",
          day.isWeekend && day.isCurrentMonth && !semester?.showWeekends && "bg-gray-50",
          day.isToday && "bg-blue-50/50",
          isSelected && "ring-2 ring-inset ring-blue-400",
          day.isCurrentMonth && !day.isWeekend && "hover:bg-gray-50",
          isSemesterDay && day.isCurrentMonth && !day.isWeekend && "hover:bg-blue-50/30"
        )}
      >
        {/* Date number */}
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={clsx(
              "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium",
              day.isToday ? "bg-blue-500 text-white" : !day.isCurrentMonth ? "text-gray-300" : "text-gray-700"
            )}
          >
            {parseInt(day.date.split("-")[2])}
          </span>
          {settings.showWeekNumbers && day.date.endsWith(day.date.split("-")[2]) && (
            <span className="text-gray-300 text-[9px] leading-none">{""}</span>
          )}
        </div>

        {/* Holidays / breaks */}
        {day.holidays.map((h) => (
          <div
            key={h.id}
            className="mb-0.5 px-1 py-0.5 rounded text-white truncate"
            style={{ backgroundColor: h.color, fontSize: "9px" }}
          >
            {h.name}
          </div>
        ))}

        {/* Courses */}
        {day.courses.slice(0, 3).map((course) => (
          <div
            key={course.id}
            className={clsx("mb-0.5 px-1 py-0.5 rounded truncate text-white", fontSizeClass)}
            style={{ backgroundColor: course.color, fontSize: "9px" }}
          >
            <span className="font-semibold">{course.code}</span>
            {settings.showCourseTime && (
              <span className="ml-0.5 opacity-90">
                {" "}{formatTime(course.startTime, settings.timeFormat === "12h")}
              </span>
            )}
            {settings.showRoom && course.room && (
              <span className="ml-0.5 opacity-80"> · {course.room}</span>
            )}
          </div>
        ))}
        {day.courses.length > 3 && (
          <div className="text-gray-400 text-[9px]">+{day.courses.length - 3} more</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewDate((d) => subMonths(d, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-base font-semibold text-gray-800 w-36 text-center">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={() => setViewDate(new Date())}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {settings.showWeekNumbers && <div className="py-2 text-center text-xs font-medium text-gray-400">Wk</div>}
        {dayHeaders.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className={clsx("grid", settings.showWeekNumbers ? "grid-cols-[32px_1fr_1fr_1fr_1fr_1fr_1fr_1fr]" : "grid-cols-7")}>
            {settings.showWeekNumbers && (
              <div className="border-b border-r border-gray-100 flex items-start justify-center pt-2">
                <span className="text-[10px] text-gray-300 font-medium">
                  {week[0] ? getWeekNumber(week[0].date) : ""}
                </span>
              </div>
            )}
            {week.map((day) => (
              <DayCell key={day.date} day={day} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function getWeekNumber(dateStr: string): number {
  const date = parseISO(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff / oneWeek) + 1);
}
