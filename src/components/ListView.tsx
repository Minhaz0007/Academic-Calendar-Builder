"use client";

import { useMemo } from "react";
import { Semester, CalendarSettings, MONTH_NAMES } from "@/types/calendar";
import { getCoursesForDay, getHolidaysForDay, formatTime, formatDate } from "@/lib/calendarUtils";
import { parseISO, eachDayOfInterval, format, isWeekend } from "date-fns";
import clsx from "clsx";

interface Props {
  semester: Semester;
  settings: CalendarSettings;
  onSelectDate: (date: string) => void;
}

interface AgendaItem {
  date: string;
  dateObj: Date;
  courses: Semester["courses"];
  holidays: Semester["holidays"][number][];
}

export default function ListView({ semester, settings, onSelectDate }: Props) {
  const items = useMemo<AgendaItem[]>(() => {
    const start = parseISO(semester.startDate);
    const end = parseISO(semester.endDate);
    const days = eachDayOfInterval({ start, end });

    return days
      .filter((d) => !isWeekend(d) || semester.showWeekends)
      .map((d) => {
        const dateStr = format(d, "yyyy-MM-dd");
        return {
          date: dateStr,
          dateObj: d,
          courses: getCoursesForDay(d, semester),
          holidays: getHolidaysForDay(dateStr, semester),
        };
      })
      .filter((item) => item.courses.length > 0 || item.holidays.length > 0);
  }, [semester]);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    items.forEach((item) => {
      const key = item.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm">No events to show.</p>
          <p className="text-xs mt-1">Add courses or holidays in the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {grouped.map(([monthKey, monthItems]) => {
        const [y, m] = monthKey.split("-").map(Number);
        return (
          <div key={monthKey}>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 sticky top-0 bg-gray-50 py-1 px-2 rounded-md">
              {MONTH_NAMES[m - 1]} {y}
            </h3>
            <div className="space-y-1">
              {monthItems.map((item) => (
                <div
                  key={item.date}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-gray-100 hover:border-gray-200 cursor-pointer transition-colors"
                  onClick={() => onSelectDate(item.date)}
                >
                  <div className="flex-shrink-0 text-right w-10">
                    <p className="text-xs font-semibold text-gray-800">
                      {format(item.dateObj, "dd")}
                    </p>
                    <p className="text-xs text-gray-400">{format(item.dateObj, "EEE")}</p>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {item.holidays.map((h) => (
                      <div key={h.id} className="flex items-center gap-1.5 text-xs" style={{ color: h.color }}>
                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: h.color }} />
                        <span className="font-medium">{h.name}</span>
                        <span className="text-gray-400 capitalize">({h.type})</span>
                      </div>
                    ))}
                    {item.courses.map((c) => (
                      <div key={c.id} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="font-medium text-gray-800">{c.code}</span>
                        <span className="text-gray-600">{c.name}</span>
                        {settings.showCourseTime && (
                          <span className="text-gray-400">
                            {formatTime(c.startTime, settings.timeFormat === "12h")}–{formatTime(c.endTime, settings.timeFormat === "12h")}
                          </span>
                        )}
                        {settings.showRoom && c.room && <span className="text-gray-400">· {c.room}</span>}
                        {settings.showInstructor && c.instructor && <span className="text-gray-400">· {c.instructor}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
