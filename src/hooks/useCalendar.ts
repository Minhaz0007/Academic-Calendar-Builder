"use client";

import { useState, useCallback, useEffect } from "react";
import { CalendarState, Semester, Course, Holiday, CalendarSettings } from "@/types/calendar";
import { createDefaultState, createDefaultCourse, createDefaultSemester, getDefaultHolidays } from "@/lib/calendarUtils";

const STORAGE_KEY = "academic-calendar-state";

function loadState(): CalendarState {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CalendarState;
  } catch {}
  return createDefaultState();
}

function saveState(state: CalendarState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useCalendar() {
  const [state, setState] = useState<CalendarState>(createDefaultState);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setState(loadState());
  }, []);

  // Persist on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeSemester = state.semesters.find((s) => s.id === state.activeSemesterId) ?? null;

  // ---- Semester operations ----

  const addSemester = useCallback((name: string, startDate: string, endDate: string) => {
    const semester = createDefaultSemester(name, startDate, endDate);
    setState((prev) => ({
      ...prev,
      semesters: [...prev.semesters, semester],
      activeSemesterId: semester.id,
    }));
  }, []);

  const removeSemester = useCallback((id: string) => {
    setState((prev) => {
      const filtered = prev.semesters.filter((s) => s.id !== id);
      return {
        ...prev,
        semesters: filtered,
        activeSemesterId: filtered[0]?.id ?? null,
      };
    });
  }, []);

  const updateSemester = useCallback((id: string, updates: Partial<Semester>) => {
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const setActiveSemester = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeSemesterId: id }));
  }, []);

  // ---- Course operations ----

  const addCourse = useCallback((semesterId: string) => {
    setState((prev) => {
      const semester = prev.semesters.find((s) => s.id === semesterId);
      if (!semester) return prev;
      const course = createDefaultCourse(semester.courses.length);
      return {
        ...prev,
        semesters: prev.semesters.map((s) =>
          s.id === semesterId ? { ...s, courses: [...s.courses, course] } : s
        ),
      };
    });
  }, []);

  const updateCourse = useCallback((semesterId: string, courseId: string, updates: Partial<Course>) => {
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)) }
          : s
      ),
    }));
  }, []);

  const removeCourse = useCallback((semesterId: string, courseId: string) => {
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s
      ),
    }));
  }, []);

  // ---- Holiday operations ----

  const addHoliday = useCallback((semesterId: string, holiday: Omit<Holiday, "id">) => {
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) =>
        s.id === semesterId
          ? { ...s, holidays: [...s.holidays, { ...holiday, id: crypto.randomUUID() }] }
          : s
      ),
    }));
  }, []);

  const updateHoliday = useCallback((semesterId: string, holidayId: string, updates: Partial<Holiday>) => {
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) =>
        s.id === semesterId
          ? { ...s, holidays: s.holidays.map((h) => (h.id === holidayId ? { ...h, ...updates } : h)) }
          : s
      ),
    }));
  }, []);

  const removeHoliday = useCallback((semesterId: string, holidayId: string) => {
    setState((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) =>
        s.id === semesterId
          ? { ...s, holidays: s.holidays.filter((h) => h.id !== holidayId) }
          : s
      ),
    }));
  }, []);

  const autoPopulateHolidays = useCallback((semesterId: string) => {
    setState((prev) => {
      const semester = prev.semesters.find((s) => s.id === semesterId);
      if (!semester) return prev;
      const year = parseInt(semester.startDate.split("-")[0]);
      const month = parseInt(semester.startDate.split("-")[1]);
      const term = month >= 6 ? "fall" : "spring";
      const autoHolidays = getDefaultHolidays(year, term);
      const existingIds = new Set(semester.holidays.map((h) => h.name));
      const newHolidays = autoHolidays.filter((h) => !existingIds.has(h.name));
      return {
        ...prev,
        semesters: prev.semesters.map((s) =>
          s.id === semesterId
            ? { ...s, holidays: [...s.holidays, ...newHolidays] }
            : s
        ),
      };
    });
  }, []);

  // ---- Settings ----

  const updateSettings = useCallback((updates: Partial<CalendarSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, []);

  // ---- View ----

  const setView = useCallback((view: CalendarState["currentView"]) => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  const setSelectedDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const resetState = useCallback(() => {
    setState(createDefaultState());
  }, []);

  return {
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
  };
}
