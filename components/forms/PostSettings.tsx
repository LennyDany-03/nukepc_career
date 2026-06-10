'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Calendar, Clock, Bell, Send, Save, FileText,
  AlertCircle, Check, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface PostSettingsProps {
  status: string;
  scheduleDate: string;
  notifyTeam: boolean;
  errors: Record<string, string>;
  onStatusChange: (status: string) => void;
  onScheduleDateChange: (date: string) => void;
  onNotifyTeamChange: (notify: boolean) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft', icon: FileText, desc: 'Save without publishing', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { value: 'Publish', label: 'Publish', icon: Send, desc: 'Post live immediately', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { value: 'Schedule', label: 'Schedule', icon: Clock, desc: 'Set a future publish date', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
];

export default function PostSettings({
  status, scheduleDate, notifyTeam, errors,
  onStatusChange, onScheduleDateChange, onNotifyTeamChange,
}: PostSettingsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selected = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];
  const StatusIcon = selected.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day);
    const local = new Date(selected.getTime() - selected.getTimezoneOffset() * 60000);
    onScheduleDateChange(local.toISOString().slice(0, 16));
    setCalendarOpen(false);
  };

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5A2C] to-[#FF7A4A] text-white flex items-center justify-center text-sm font-bold shadow-[0_0_12px_rgba(255,90,44,0.25)]">
            6
          </span>
          <div>
            <h3 className="font-bold text-white">Post Settings</h3>
            <p className="text-xs text-white/50">Configure visibility and notifications</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Status Cards */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-3">Post Status</label>
          <div className="grid grid-cols-3 gap-3">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onStatusChange(opt.value);
                    setDropdownOpen(false);
                  }}
                  className={`relative rounded-xl p-3 sm:p-4 text-left transition-all duration-200 border ${
                    active
                      ? `${opt.bg} ${opt.border} ring-1 ring-inset ring-white/[0.05]`
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.10]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="statusPill"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF5A2C] flex items-center justify-center"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  <Icon className={`w-5 h-5 mb-2 ${active ? opt.color : 'text-white/40'}`} />
                  <p className={`text-xs font-bold ${active ? 'text-white' : 'text-white/60'}`}>{opt.label}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 leading-tight hidden sm:block">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Date — only shown when Schedule is selected */}
        <AnimatePresence>
          {status === 'Schedule' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div id="scheduleDate" className="pt-1">
                <label className="block text-sm font-semibold text-white/80 mb-2">Schedule Date & Time</label>
                <div className="relative" ref={calendarRef}>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(!calendarOpen)}
                    className={`w-full flex items-center gap-3 bg-white/[0.05] border rounded-xl px-4 py-3 text-left transition-all hover:bg-white/[0.08] ${
                      errors.scheduleDate ? 'border-red-500/50' : 'border-white/[0.08]'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-[#FF5A2C] shrink-0" />
                    <span className={`flex-1 text-sm ${scheduleDate ? 'text-white' : 'text-white/30'}`}>
                      {scheduleDate
                        ? new Date(scheduleDate).toLocaleString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : 'Pick a date and time'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${calendarOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {errors.scheduleDate && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />{errors.scheduleDate}
                    </p>
                  )}

                  <AnimatePresence>
                    {calendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50"
                      >
                        <div className="bg-[#1A1A1A] border border-white/[0.10] rounded-2xl p-4 shadow-2xl shadow-black/50">
                          {/* Month header */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={prevMonth}
                              className="p-1.5 hover:bg-white/[0.08] rounded-lg text-white/60 hover:text-white transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold text-white">
                              {MONTHS[month]} {year}
                            </span>
                            <button
                              type="button"
                              onClick={nextMonth}
                              className="p-1.5 hover:bg-white/[0.08] rounded-lg text-white/60 hover:text-white transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Day headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map((d) => (
                              <div key={d} className="text-center text-[10px] font-semibold text-white/40 py-1">
                                {d}
                              </div>
                            ))}
                          </div>

                          {/* Date grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startDay }).map((_, i) => (
                              <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                              const selectedDate = scheduleDate
                                ? new Date(scheduleDate)
                                : null;
                              const isSelected = selectedDate &&
                                selectedDate.getDate() === day &&
                                selectedDate.getMonth() === month &&
                                selectedDate.getFullYear() === year;
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleDateClick(day)}
                                  className={`relative w-full aspect-square rounded-xl text-xs font-medium transition-all ${
                                    isSelected
                                      ? 'bg-gradient-to-br from-[#FF5A2C] to-[#FF7A4A] text-white shadow-[0_0_12px_rgba(255,90,44,0.3)]'
                                      : isToday(day)
                                      ? 'bg-white/[0.08] text-white border border-white/[0.15]'
                                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>

                          {/* Time picker */}
                          <div className="mt-4 pt-4 border-t border-white/[0.08]">
                            <label className="block text-xs text-white/50 mb-2">Select time</label>
                            <input
                              type="time"
                              value={scheduleDate ? scheduleDate.slice(11, 16) : ''}
                              onChange={(e) => {
                                const existing = scheduleDate ? scheduleDate.slice(0, 11) : '';
                                const newDate = existing + e.target.value;
                                onScheduleDateChange(newDate);
                              }}
                              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2C]/30 [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notify team toggle */}
        <div className="flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent border border-white/[0.06] rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              notifyTeam ? 'bg-[#FF5A2C]/15 text-[#FF5A2C]' : 'bg-white/[0.04] text-white/40'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white/90">Email Notifications</span>
              <p className="text-xs text-white/40">Alert hiring team on new applications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNotifyTeamChange(!notifyTeam)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shrink-0 ${
              notifyTeam ? 'bg-[#FF5A2C] shadow-[0_0_12px_rgba(255,90,44,0.3)]' : 'bg-white/10'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              notifyTeam ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
