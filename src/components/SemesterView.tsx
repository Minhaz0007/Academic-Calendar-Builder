"use client";

import { useMemo } from "react";
import { Semester, CalendarSettings, MONTH_NAMES, DAY_NAMES } from "@/types/calendar";
import { getMonthGrid, getSemesterStats, formatTime } from "@/lib/calendarUtils";
import { parseISO } from "date-fns";
import clsx from "clsx";

interface Props {
  semester: Semester;
  settings: CalendarSettings;
  onSelectDate: (date: string) => void;
}

export default function SemesterView({ semester, settings, onSelectDate }: Props) {
  const stats = useMemo(() => getSemesterStats(semester), [semester]);

  const startYear = parseInt(semester.startDate.split("-")[0]);
  const startMonth = parseInt(semester.startDate.split("-")[1]) - 1;
  const endYear = parseInt(semester.endDate.split("-")[0]);
  const endMonth = parseInt(semester.endDate.split("-")[1]) - 1;

  // Generate all months in the semester
  const months: { year: number; month: number }[] = [];
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 11) { m = 0; y++; }
  }

  const dayHeaders = [...DAY_NAMES.slice(settings.firstDayOfWeek), ...DAY_NAMES.slice(0, settings.firstDayOfWeek)];

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Stats bar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        {[
          { label: "Weeks", value: stats.totalWeeks },
          { label: "Class Days", value: stats.totalClassDays },
          { label: "Courses", value: stats.totalCourses },
          { label: "Credits", value: stats.totalCredits },
          { label: "Course Hours", value: stats.totalCourseHours },
          { label: "Events", value: stats.totalHolidays },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-lg font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Mini calendars grid */}
      <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map(({ year, month }) => {
          const weeks = getMonthGrid(year, month, semester, settings.firstDayOfWeek);
          return (
            <div key={`${year}-${month}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-700">{MONTH_NAMES[month]} {year}</h3>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-7 mb-1">
                  {dayHeaders.map((d) => (
                    <div key={d} className="text-center text-[9px] font-medium text-gray-400 py-0.5">{d}</div>
                  ))}
                </div>
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7">
                    {week.map((day) => {
                      const hasCourses = day.courses.length > 0;
                      const hasHoliday = day.holidays.length > 0;
                      const isSemDay = day.date >= semester.startDate && day.date <= semester.endDate;
                      return (
                        <button
                          key={day.date}
                          onClick={() => onSelectDate(day.date)}
                          className={clsx(
                            "relative aspect-square flex items-center justify-center rounded-sm text-[10px] transition-colors",
                            !day.isCurrentMonth && "opacity-25",
                            day.isToday && "ring-1 ring-blue-400",
                            day.isWeekend && "text-gray-400",
                            !day.isWeekend && day.isCurrentMonth && "text-gray-700",
                            hasCourses && "font-semibold",
                            !hasCourses && !hasHoliday && "hover:bg-gray-50"
                          )}
                          style={
                            hasCourses
                              ? { backgroundColor: day.courses[0].color + "30", color: day.courses[0].color }
                              : hasHoliday
                              ? { backgroundColor: day.holidays[0].color + "20", color: day.holidays[0].color }
                              : {}
                          }
                        >
                          {parseInt(day.date.split("-")[2])}
                          {day.courses.length > 1 && (
                            <span className="absolute bottom-0 right-0 w-1 h-1 rounded-full bg-current opacity-60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Legend for this month */}
              <div className="px-2 pb-2 flex flex-wrap gap-1">
                {semester.holidays
                  .filter((h) => {
                    const hYear = parseInt(h.date.split("-")[0]);
                    const hMonth = parseInt(h.date.split("-")[1]) - 1;
                    return hYear === year && hMonth === month;
                  })
                  .map((h) => (
                    <span key={h.id} className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded" style={{ backgroundColor: h.color + "20", color: h.color }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                      {h.name}
                    </span>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course legend */}
      {semester.courses.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white">
          <p className="text-xs font-medium text-gray-600 mb-2">Courses</p>
          <div className="flex flex-wrap gap-2">
            {semester.courses.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-gray-700 font-medium">{c.code}</span>
                <span className="text-gray-500">{c.name}</span>
                <span className="text-gray-400">
                  {c.meetingDays.map((d) => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d]).join("/")}
                  {" "}
                  {formatTime(c.startTime, settings.timeFormat === "12h")}–{formatTime(c.endTime, settings.timeFormat === "12h")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
