"use client";

import { useCalendar } from "@/hooks/useCalendar";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CalendarGrid from "@/components/CalendarGrid";
import SemesterView from "@/components/SemesterView";
import ListView from "@/components/ListView";

export default function Home() {
  const {
    state,
    activeSemester,
    addSemester,
    removeSemester,
    updateSemester,
    setActiveSemester,
    addCourse,
    updateCourse,
    removeCourse,
    addHoliday,
    updateHoliday,
    removeHoliday,
    autoPopulateHolidays,
    updateSettings,
    setView,
    setSelectedDate,
    resetState,
  } = useCalendar();

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="no-print">
        <Header
          settings={state.settings}
          semesters={state.semesters}
          activeSemester={activeSemester}
          currentView={state.currentView}
          onSetView={setView}
          onReset={resetState}
        />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="no-print">
          <Sidebar
            semesters={state.semesters}
            activeSemesterId={state.activeSemesterId}
            settings={state.settings}
            onAddSemester={addSemester}
            onRemoveSemester={removeSemester}
            onUpdateSemester={updateSemester}
            onSetActiveSemester={setActiveSemester}
            onAddCourse={addCourse}
            onUpdateCourse={updateCourse}
            onRemoveCourse={removeCourse}
            onAddHoliday={addHoliday}
            onUpdateHoliday={updateHoliday}
            onRemoveHoliday={removeHoliday}
            onAutoPopulateHolidays={autoPopulateHolidays}
            onUpdateSettings={updateSettings}
          />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white shadow-sm">
          {state.currentView === "month" && (
            <CalendarGrid
              semester={activeSemester}
              settings={state.settings}
              selectedDate={state.selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}

          {state.currentView === "semester" && activeSemester && (
            <SemesterView
              semester={activeSemester}
              settings={state.settings}
              onSelectDate={setSelectedDate}
            />
          )}

          {state.currentView === "list" && activeSemester && (
            <ListView
              semester={activeSemester}
              settings={state.settings}
              onSelectDate={setSelectedDate}
            />
          )}

          {!activeSemester && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-sm font-medium">No semester selected</p>
                <p className="text-xs mt-1">Add a semester from the sidebar to get started.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
