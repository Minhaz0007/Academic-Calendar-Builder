"use client";

import { useState } from "react";
import { CalendarState, Semester } from "@/types/calendar";
import { generateICalendar, generateCSV, getSemesterStats } from "@/lib/calendarUtils";
import { Calendar, Download, RotateCcw, BarChart2, Grid, List, CalendarDays } from "lucide-react";
import clsx from "clsx";

interface Props {
  settings: CalendarState["settings"];
  semesters: Semester[];
  activeSemester: Semester | null;
  currentView: CalendarState["currentView"];
  onSetView: (v: CalendarState["currentView"]) => void;
  onReset: () => void;
}

export default function Header({ settings, semesters, activeSemester, currentView, onSetView, onReset }: Props) {
  const [showExport, setShowExport] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const stats = activeSemester ? getSemesterStats(activeSemester) : null;

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportIcal() {
    const content = generateICalendar(semesters);
    downloadFile(content, "academic-calendar.ics", "text/calendar");
    setShowExport(false);
  }

  function exportCSV() {
    if (!activeSemester) return;
    const content = generateCSV(activeSemester);
    const name = activeSemester.name.replace(/\s+/g, "-").toLowerCase();
    downloadFile(content, `${name}-schedule.csv`, "text/csv");
    setShowExport(false);
  }

  function exportJSON() {
    const content = JSON.stringify({ settings, semesters }, null, 2);
    downloadFile(content, "academic-calendar.json", "application/json");
    setShowExport(false);
  }

  function printCalendar() {
    window.print();
    setShowExport(false);
  }

  const views: { id: CalendarState["currentView"]; label: string; icon: React.ReactNode }[] = [
    { id: "month", label: "Month", icon: <Grid size={14} /> },
    { id: "semester", label: "Semester", icon: <CalendarDays size={14} /> },
    { id: "list", label: "Agenda", icon: <List size={14} /> },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Logo / title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: settings.primaryColor }}>
          <Calendar size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Academic Calendar</p>
          <p className="text-xs text-gray-400 leading-tight">{settings.institution} · {settings.academicYear}</p>
        </div>
      </div>

      {/* View switcher */}
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => onSetView(v.id)}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              currentView === v.id
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Stats */}
        {stats && (
          <div className="relative">
            <button
              onClick={() => setShowStats((p) => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              <BarChart2 size={14} />
              Stats
            </button>
            {showStats && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStats(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-20 w-56">
                  <p className="text-xs font-semibold text-gray-700 mb-3">{activeSemester?.name}</p>
                  <div className="space-y-2">
                    {[
                      { label: "Total Weeks", value: stats.totalWeeks },
                      { label: "Class Days", value: stats.totalClassDays },
                      { label: "Courses", value: stats.totalCourses },
                      { label: "Total Credits", value: stats.totalCredits },
                      { label: "Course Hours (est.)", value: stats.totalCourseHours },
                      { label: "Holidays/Events", value: stats.totalHolidays },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-semibold text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport((p) => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Download size={14} />
            Export
          </button>
          {showExport && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 w-44">
                {[
                  { label: "iCalendar (.ics)", action: exportIcal, desc: "All semesters" },
                  { label: "CSV Spreadsheet", action: exportCSV, desc: "Active semester" },
                  { label: "JSON Backup", action: exportJSON, desc: "Full data" },
                  { label: "Print / PDF", action: printCalendar, desc: "Browser print" },
                ].map(({ label, action, desc }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-xs font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={() => { if (confirm("Reset all data to defaults?")) onReset(); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </header>
  );
}
