"use client";

import { useState } from "react";
import { Semester, Course, Holiday, COURSE_COLORS, HOLIDAY_COLORS } from "@/types/calendar";
import { CalendarSettings } from "@/types/calendar";
import { formatDate, formatTime } from "@/lib/calendarUtils";
import {
  Plus, Trash2, ChevronDown, ChevronRight, Sparkles, Settings,
  BookOpen, Calendar, Coffee, Palette
} from "lucide-react";
import clsx from "clsx";

interface Props {
  semesters: Semester[];
  activeSemesterId: string | null;
  settings: CalendarSettings;
  onAddSemester: (name: string, start: string, end: string) => void;
  onRemoveSemester: (id: string) => void;
  onUpdateSemester: (id: string, updates: Partial<Semester>) => void;
  onSetActiveSemester: (id: string) => void;
  onAddCourse: (semId: string) => void;
  onUpdateCourse: (semId: string, courseId: string, updates: Partial<Course>) => void;
  onRemoveCourse: (semId: string, courseId: string) => void;
  onAddHoliday: (semId: string, holiday: Omit<Holiday, "id">) => void;
  onUpdateHoliday: (semId: string, hId: string, updates: Partial<Holiday>) => void;
  onRemoveHoliday: (semId: string, hId: string) => void;
  onAutoPopulateHolidays: (semId: string) => void;
  onUpdateSettings: (updates: Partial<CalendarSettings>) => void;
}

type Panel = "semesters" | "courses" | "holidays" | "settings" | "customize";

export default function Sidebar(props: Props) {
  const [activePanel, setActivePanel] = useState<Panel>("semesters");
  const [newSemName, setNewSemName] = useState("Summer Session");
  const [newSemStart, setNewSemStart] = useState("2025-06-02");
  const [newSemEnd, setNewSemEnd] = useState("2025-08-08");
  const [showAddSem, setShowAddSem] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedHolidays, setExpandedHolidays] = useState(true);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", endDate: "", type: "holiday" as Holiday["type"] });
  const [showAddHoliday, setShowAddHoliday] = useState(false);

  const activeSemester = props.semesters.find((s) => s.id === props.activeSemesterId) ?? null;

  const navItems: { id: Panel; label: string; icon: React.ReactNode }[] = [
    { id: "semesters", label: "Semesters", icon: <Calendar size={16} /> },
    { id: "courses", label: "Courses", icon: <BookOpen size={16} /> },
    { id: "holidays", label: "Breaks & Events", icon: <Coffee size={16} /> },
    { id: "customize", label: "Appearance", icon: <Palette size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function toggleCourse(id: string) {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Nav tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-0.5 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={clsx(
                "flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors",
                activePanel === item.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">

        {/* ---- SEMESTERS PANEL ---- */}
        {activePanel === "semesters" && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Semesters</h3>
              <button
                onClick={() => setShowAddSem((p) => !p)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <Plus size={14} />
              </button>
            </div>

            {showAddSem && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-100">
                <p className="text-xs font-medium text-blue-700">New Semester</p>
                <input
                  className="input-sm w-full"
                  placeholder="Name"
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                />
                <label className="block text-xs text-gray-600">Start Date</label>
                <input type="date" className="input-sm w-full" value={newSemStart} onChange={(e) => setNewSemStart(e.target.value)} />
                <label className="block text-xs text-gray-600">End Date</label>
                <input type="date" className="input-sm w-full" value={newSemEnd} onChange={(e) => setNewSemEnd(e.target.value)} />
                <button
                  className="btn-primary w-full text-xs"
                  onClick={() => {
                    props.onAddSemester(newSemName, newSemStart, newSemEnd);
                    setShowAddSem(false);
                  }}
                >
                  Add Semester
                </button>
              </div>
            )}

            <div className="space-y-2">
              {props.semesters.map((sem) => (
                <div
                  key={sem.id}
                  className={clsx(
                    "rounded-lg border p-2.5 cursor-pointer transition-all",
                    sem.id === props.activeSemesterId
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  )}
                  onClick={() => props.onSetActiveSemester(sem.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sem.color }} />
                      <span className="text-sm font-medium text-gray-800 truncate">{sem.name}</span>
                    </div>
                    {props.semesters.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); props.onRemoveSemester(sem.id); }}
                        className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-4.5">
                    {formatDate(sem.startDate, props.settings.dateFormat)} – {formatDate(sem.endDate, props.settings.dateFormat)}
                  </p>
                  {sem.id === props.activeSemesterId && (
                    <div className="mt-2 ml-4.5 space-y-1.5">
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Name</label>
                        <input
                          className="input-sm w-full"
                          value={sem.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => props.onUpdateSemester(sem.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">Start</label>
                          <input
                            type="date"
                            className="input-sm w-full"
                            value={sem.startDate}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => props.onUpdateSemester(sem.id, { startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-0.5">End</label>
                          <input
                            type="date"
                            className="input-sm w-full"
                            value={sem.endDate}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => props.onUpdateSemester(sem.id, { endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Color</label>
                        <div className="flex flex-wrap gap-1">
                          {COURSE_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={(e) => { e.stopPropagation(); props.onUpdateSemester(sem.id, { color: c }); }}
                              className={clsx("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", sem.color === c ? "border-gray-700" : "border-transparent")}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="weekends"
                          checked={sem.showWeekends}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => props.onUpdateSemester(sem.id, { showWeekends: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor="weekends" className="text-xs text-gray-600">Show weekends</label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- COURSES PANEL ---- */}
        {activePanel === "courses" && activeSemester && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Courses — {activeSemester.name}</h3>
              <button
                onClick={() => props.onAddCourse(activeSemester.id)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <Plus size={14} />
              </button>
            </div>

            {activeSemester.courses.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <BookOpen size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">No courses yet. Click + to add one.</p>
              </div>
            )}

            <div className="space-y-2">
              {activeSemester.courses.map((course) => (
                <div key={course.id} className="rounded-lg border border-gray-200 overflow-hidden">
                  <div
                    className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleCourse(course.id)}
                  >
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: course.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{course.code}</p>
                      <p className="text-xs text-gray-500 truncate">{course.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); props.onRemoveCourse(activeSemester.id, course.id); }}
                        className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                      {expandedCourses.has(course.id) ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                    </div>
                  </div>

                  {expandedCourses.has(course.id) && (
                    <div className="p-2.5 pt-0 space-y-2 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="label-xs">Code</label>
                          <input className="input-sm w-full" value={course.code} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { code: e.target.value })} />
                        </div>
                        <div>
                          <label className="label-xs">Credits</label>
                          <input type="number" min={0} max={12} className="input-sm w-full" value={course.credits} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { credits: parseInt(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <div>
                        <label className="label-xs">Course Name</label>
                        <input className="input-sm w-full" value={course.name} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { name: e.target.value })} />
                      </div>
                      <div>
                        <label className="label-xs">Instructor</label>
                        <input className="input-sm w-full" value={course.instructor} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { instructor: e.target.value })} placeholder="Prof. Smith" />
                      </div>
                      <div>
                        <label className="label-xs">Room / Location</label>
                        <input className="input-sm w-full" value={course.room} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { room: e.target.value })} placeholder="Room 101" />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="label-xs">Start Time</label>
                          <input type="time" className="input-sm w-full" value={course.startTime} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { startTime: e.target.value })} />
                        </div>
                        <div>
                          <label className="label-xs">End Time</label>
                          <input type="time" className="input-sm w-full" value={course.endTime} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { endTime: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="label-xs">Meeting Days</label>
                        <div className="flex gap-1 mt-0.5">
                          {DAY_LABELS.map((d, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const days = course.meetingDays.includes(i as 0)
                                  ? course.meetingDays.filter((x) => x !== i)
                                  : [...course.meetingDays, i as 0];
                                props.onUpdateCourse(activeSemester.id, course.id, { meetingDays: days.sort() as typeof course.meetingDays });
                              }}
                              className={clsx(
                                "w-7 h-7 rounded text-xs font-medium transition-colors",
                                course.meetingDays.includes(i as 0)
                                  ? "text-white"
                                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                              )}
                              style={course.meetingDays.includes(i as 0) ? { backgroundColor: course.color } : {}}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="label-xs">Color</label>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {COURSE_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => props.onUpdateCourse(activeSemester.id, course.id, { color: c })}
                              className={clsx("w-5 h-5 rounded-full border-2 transition-transform hover:scale-110", course.color === c ? "border-gray-700" : "border-transparent")}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="label-xs">Notes</label>
                        <textarea className="input-sm w-full resize-none" rows={2} value={course.notes} onChange={(e) => props.onUpdateCourse(activeSemester.id, course.id, { notes: e.target.value })} placeholder="Optional notes..." />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- HOLIDAYS PANEL ---- */}
        {activePanel === "holidays" && activeSemester && (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Breaks & Events</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => props.onAutoPopulateHolidays(activeSemester.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs hover:bg-amber-100 transition-colors"
                  title="Auto-populate common holidays"
                >
                  <Sparkles size={11} />
                  Auto-fill
                </button>
                <button
                  onClick={() => setShowAddHoliday((p) => !p)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-500"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {showAddHoliday && (
              <div className="bg-amber-50 rounded-lg p-3 space-y-2 border border-amber-100">
                <p className="text-xs font-medium text-amber-700">New Break / Event</p>
                <input className="input-sm w-full" placeholder="Name (e.g. Spring Break)" value={newHoliday.name} onChange={(e) => setNewHoliday((p) => ({ ...p, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="label-xs">Start Date</label>
                    <input type="date" className="input-sm w-full" value={newHoliday.date} onChange={(e) => setNewHoliday((p) => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-xs">End Date</label>
                    <input type="date" className="input-sm w-full" value={newHoliday.endDate} onChange={(e) => setNewHoliday((p) => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label-xs">Type</label>
                  <select className="input-sm w-full" value={newHoliday.type} onChange={(e) => setNewHoliday((p) => ({ ...p, type: e.target.value as Holiday["type"] }))}>
                    <option value="holiday">Holiday</option>
                    <option value="break">Break</option>
                    <option value="exam">Exam Period</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <button
                  className="btn-primary w-full text-xs"
                  onClick={() => {
                    if (!newHoliday.name || !newHoliday.date) return;
                    props.onAddHoliday(activeSemester.id, {
                      name: newHoliday.name,
                      date: newHoliday.date,
                      endDate: newHoliday.endDate || undefined,
                      type: newHoliday.type,
                      color: HOLIDAY_COLORS[newHoliday.type],
                      recurring: false,
                    });
                    setNewHoliday({ name: "", date: "", endDate: "", type: "holiday" });
                    setShowAddHoliday(false);
                  }}
                >
                  Add
                </button>
              </div>
            )}

            {activeSemester.holidays.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                <Coffee size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">No holidays yet.</p>
                <p className="text-xs mt-0.5">Use Auto-fill to add common US holidays.</p>
              </div>
            )}

            <div className="space-y-1.5">
              {[...activeSemester.holidays]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((h) => (
                  <div key={h.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-gray-200 bg-white group">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: HOLIDAY_COLORS[h.type] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{h.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(h.date, props.settings.dateFormat)}
                        {h.endDate && ` – ${formatDate(h.endDate, props.settings.dateFormat)}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 capitalize hidden group-hover:inline">{h.type}</span>
                    <button
                      onClick={() => props.onRemoveHoliday(activeSemester.id, h.id)}
                      className="p-0.5 rounded hover:bg-red-100 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ---- APPEARANCE PANEL ---- */}
        {activePanel === "customize" && (
          <div className="p-3 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Appearance</h3>

            <div>
              <label className="label-xs">Institution Name</label>
              <input className="input-sm w-full" value={props.settings.institution} onChange={(e) => props.onUpdateSettings({ institution: e.target.value })} placeholder="My University" />
            </div>
            <div>
              <label className="label-xs">Academic Year</label>
              <input className="input-sm w-full" value={props.settings.academicYear} onChange={(e) => props.onUpdateSettings({ academicYear: e.target.value })} placeholder="2025-2026" />
            </div>

            <div>
              <label className="label-xs">Theme</label>
              <select className="input-sm w-full" value={props.settings.theme} onChange={(e) => props.onUpdateSettings({ theme: e.target.value as CalendarSettings["theme"] })}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="label-xs">Font Size</label>
              <select className="input-sm w-full" value={props.settings.fontSize} onChange={(e) => props.onUpdateSettings({ fontSize: e.target.value as CalendarSettings["fontSize"] })}>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>

            <div>
              <label className="label-xs">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-8 h-8 rounded cursor-pointer border border-gray-200" value={props.settings.primaryColor} onChange={(e) => props.onUpdateSettings({ primaryColor: e.target.value })} />
                <span className="text-xs text-gray-500">{props.settings.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="label-xs">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-8 h-8 rounded cursor-pointer border border-gray-200" value={props.settings.accentColor} onChange={(e) => props.onUpdateSettings({ accentColor: e.target.value })} />
                <span className="text-xs text-gray-500">{props.settings.accentColor}</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Display Options</p>
              {[
                { key: "showWeekNumbers", label: "Show week numbers" },
                { key: "showCourseTime", label: "Show course times" },
                { key: "showRoom", label: "Show room/location" },
                { key: "showInstructor", label: "Show instructor name" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={props.settings[key as keyof CalendarSettings] as boolean}
                    onChange={(e) => props.onUpdateSettings({ [key]: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ---- SETTINGS PANEL ---- */}
        {activePanel === "settings" && (
          <div className="p-3 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Settings</h3>

            <div>
              <label className="label-xs">Date Format</label>
              <select className="input-sm w-full" value={props.settings.dateFormat} onChange={(e) => props.onUpdateSettings({ dateFormat: e.target.value as CalendarSettings["dateFormat"] })}>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div>
              <label className="label-xs">Time Format</label>
              <select className="input-sm w-full" value={props.settings.timeFormat} onChange={(e) => props.onUpdateSettings({ timeFormat: e.target.value as CalendarSettings["timeFormat"] })}>
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>

            <div>
              <label className="label-xs">First Day of Week</label>
              <select className="input-sm w-full" value={props.settings.firstDayOfWeek} onChange={(e) => props.onUpdateSettings({ firstDayOfWeek: parseInt(e.target.value) as CalendarSettings["firstDayOfWeek"] })}>
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>

            <div>
              <label className="label-xs">Country (for holidays)</label>
              <select className="input-sm w-full" value={props.settings.country} onChange={(e) => props.onUpdateSettings({ country: e.target.value })}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={props.settings.autoDetectHolidays}
                onChange={(e) => props.onUpdateSettings({ autoDetectHolidays: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="text-xs text-gray-600">Auto-detect holidays for country</span>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
}
