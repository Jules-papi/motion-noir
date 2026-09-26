import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  Ticket,
  ArrowRight
} from 'lucide-react';
import { PlatformEvent, UserProfile } from '../types';

export type CalendarSubView = 'month' | 'week' | 'agenda';

interface EventCalendarProps {
  events: PlatformEvent[];
  currentUser: UserProfile;
  onSelectEvent: (event: PlatformEvent) => void;
  onApplyClick?: (event: PlatformEvent) => void;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  currentUser,
  onSelectEvent,
  onApplyClick,
}) => {
  const [subView, setSubView] = useState<CalendarSubView>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // If events exist, default to the month of the first upcoming event, else now
    if (events.length > 0) {
      const firstDate = new Date(events[0].startsAt);
      if (!isNaN(firstDate.getTime())) return firstDate;
    }
    return new Date();
  });
  const [selectedDayEvents, setSelectedDayEvents] = useState<PlatformEvent[] | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Helper date navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = useMemo(() => {
    return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(currentDate);
  }, [currentDate]);

  const handlePrev = () => {
    if (subView === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() - 7);
      setCurrentDate(next);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
    setSelectedDayEvents(null);
    setSelectedDayKey(null);
  };

  const handleNext = () => {
    if (subView === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
    setSelectedDayEvents(null);
    setSelectedDayKey(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayEvents(null);
    setSelectedDayKey(null);
  };

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, PlatformEvent[]>();
    events.forEach(evt => {
      const d = new Date(evt.startsAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const list = map.get(key) || [];
      list.push(evt);
      map.set(key, list);
    });
    return map;
  }, [events]);

  // Generate Month Grid (Monday-first)
  const monthGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday is 1, Sunday is 0 -> convert so Monday is 0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dateKey: string;
      isToday: boolean;
      events: PlatformEvent[];
    }> = [];

    // Leading days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        dateKey: key,
        isToday: false,
        events: eventsByDate.get(key) || [],
      });
    }

    // Days of current month
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const d = new Date(year, month, day);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: true,
        dateKey: key,
        isToday: key === todayKey,
        events: eventsByDate.get(key) || [],
      });
    }

    // Trailing days to complete 35 or 42 grid cells
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days.push({
          date: d,
          isCurrentMonth: false,
          dateKey: key,
          isToday: false,
          events: eventsByDate.get(key) || [],
        });
      }
    }

    return days;
  }, [year, month, eventsByDate]);

  // Week View Days
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    let dayOfWeek = d.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      days.push({
        date: cur,
        dateKey: key,
        isToday: key === todayKey,
        events: eventsByDate.get(key) || [],
      });
    }
    return days;
  }, [currentDate, eventsByDate]);

  // Agenda View: All events in chronological order grouped by date
  const agendaDates = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    const groups: Array<{ dateKey: string; formattedDate: string; items: PlatformEvent[] }> = [];

    sorted.forEach(evt => {
      const d = new Date(evt.startsAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const existing = groups.find(g => g.dateKey === key);
      if (existing) {
        existing.items.push(evt);
      } else {
        const formatted = new Intl.DateTimeFormat('tr-TR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d);
        groups.push({ dateKey: key, formattedDate: formatted, items: [evt] });
      }
    });

    return groups;
  }, [events]);

  const weekDayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'swinger': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'trio': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'sexparty': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'cocktail': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'dinner': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default: return 'bg-[#C5A880]/20 text-[#C5A880] border-[#C5A880]/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CALENDAR CONTROLS & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
        {/* Navigation & Month Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
              title="Önceki"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#9A9996] hover:text-[#F1EFEA] transition-colors cursor-pointer"
              title="Sonraki"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="font-serif text-lg sm:text-xl text-[#F1EFEA] font-light capitalize tracking-wide">
            {monthName}
          </h2>

          <button
            onClick={handleToday}
            className="px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider text-[#C5A880] border border-[#C5A880]/30 hover:bg-[#C5A880]/10 transition-colors cursor-pointer ml-1"
          >
            Bugün
          </button>
        </div>

        {/* View Mode Buttons (Month / Week / Agenda) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => setSubView('month')}
            className={`px-3 py-1 rounded-md text-xs font-serif tracking-wider uppercase transition-all cursor-pointer ${
              subView === 'month'
                ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            Ay
          </button>
          <button
            onClick={() => setSubView('week')}
            className={`px-3 py-1 rounded-md text-xs font-serif tracking-wider uppercase transition-all cursor-pointer ${
              subView === 'week'
                ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            Hafta
          </button>
          <button
            onClick={() => setSubView('agenda')}
            className={`px-3 py-1 rounded-md text-xs font-serif tracking-wider uppercase transition-all cursor-pointer ${
              subView === 'agenda'
                ? 'bg-[#1A1A1E] text-[#C5A880] border border-[#C5A880]/30 shadow-sm'
                : 'text-[#9A9996] hover:text-[#F1EFEA]'
            }`}
          >
            Ajanda
          </button>
        </div>
      </div>

      {/* 2. MONTH VIEW */}
      {subView === 'month' && (
        <div className="rounded-xl bg-[#111113] border border-white/[0.08] overflow-hidden">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b border-white/[0.08] bg-[#09090B]">
            {weekDayNames.map((name, i) => (
              <div
                key={i}
                className="py-2.5 text-center text-[11px] font-mono tracking-widest text-[#9A9996] uppercase"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/[0.06]">
            {monthGridDays.map((day, idx) => {
              const isSelected = selectedDayKey === day.dateKey;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (day.events.length > 0) {
                      setSelectedDayEvents(day.events);
                      setSelectedDayKey(day.dateKey);
                    }
                  }}
                  className={`min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                    day.isCurrentMonth ? 'bg-[#111113]' : 'bg-[#09090B]/50 opacity-40'
                  } ${day.events.length > 0 ? 'cursor-pointer hover:bg-white/[0.02]' : ''} ${
                    isSelected ? 'ring-1 ring-[#C5A880] bg-[#C5A880]/[0.03]' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                        day.isToday
                          ? 'bg-[#C5A880] text-[#09090B] font-bold shadow-sm'
                          : isSelected
                          ? 'text-[#C5A880]'
                          : day.isCurrentMonth
                          ? 'text-[#F1EFEA]'
                          : 'text-[#66666A]'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>

                    {day.events.some(e => e.isUserRegistered) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Katıldığınız Salon" />
                    )}
                  </div>

                  {/* Event Chips */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {day.events.slice(0, 2).map(evt => {
                      const timeStr = new Date(evt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(evt);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-sans truncate border flex items-center gap-1 transition-transform active:scale-95 cursor-pointer ${getCategoryColor(
                            evt.category
                          )}`}
                          title={`${timeStr} - ${evt.title}`}
                        >
                          <span className="font-mono text-[9px] opacity-80 shrink-0">{timeStr}</span>
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}

                    {day.events.length > 2 && (
                      <span className="text-[9px] font-mono text-[#C5A880] block pl-1">
                        +{day.events.length - 2} salon daha
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. WEEK VIEW */}
      {subView === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between min-h-[220px] ${
                day.isToday
                  ? 'bg-[#1A1A1E] border-[#C5A880]/40'
                  : 'bg-[#111113] border-white/[0.08]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
                  <span className="text-xs font-mono text-[#9A9996] uppercase">{weekDayNames[idx]}</span>
                  <span
                    className={`text-sm font-mono font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                      day.isToday ? 'bg-[#C5A880] text-[#09090B] font-bold' : 'text-[#F1EFEA]'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                </div>

                <div className="space-y-2 mt-2">
                  {day.events.length === 0 ? (
                    <span className="text-[11px] text-[#66666A] font-sans block pt-4 text-center">
                      Planlanan salon yok
                    </span>
                  ) : (
                    day.events.map(evt => {
                      const timeStr = new Date(evt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className="p-2 rounded-lg bg-black/40 border border-white/[0.06] hover:border-[#C5A880]/30 transition-all cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono text-[#C5A880]">{timeStr}</span>
                            <span className="font-mono text-[#9A9996] text-[9px] uppercase">{evt.city}</span>
                          </div>
                          <p className="text-xs font-serif text-[#F1EFEA] line-clamp-2 leading-tight">
                            {evt.title}
                          </p>
                          {evt.isUserRegistered && (
                            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Davetlisiniz
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {day.events.length > 0 && (
                <span className="text-[10px] font-mono text-[#9A9996] pt-2 block border-t border-white/[0.04]">
                  {day.events.length} Etkinlik
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. AGENDA VIEW (Chronological List) */}
      {subView === 'agenda' && (
        <div className="space-y-6">
          {agendaDates.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#111113] border border-white/[0.08] text-[#9A9996]">
              <CalendarIcon className="w-8 h-8 text-[#C5A880] mx-auto mb-3 opacity-60" />
              <p className="font-serif text-base text-[#F1EFEA]">Henüz planlanmış etkinlik bulunmuyor.</p>
              <p className="text-xs text-[#66666A] mt-1">Yeni salon davetiyeleri açıldığında burada listelenecektir.</p>
            </div>
          ) : (
            agendaDates.map(group => (
              <div key={group.dateKey} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                  <h3 className="text-xs font-mono tracking-widest text-[#C5A880] uppercase">
                    {group.formattedDate}
                  </h3>
                  <div className="h-px bg-white/[0.08] flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map(evt => {
                    const timeStr = new Date(evt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] hover:border-[#C5A880]/40 transition-all cursor-pointer flex gap-4 group"
                      >
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-20 h-20 rounded-lg object-cover shrink-0 border border-white/[0.08] group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#9A9996]">
                              <span className="flex items-center gap-1 text-[#C5A880]">
                                <Clock className="w-3 h-3" />
                                {timeStr}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {evt.city}
                              </span>
                            </div>
                            <h4 className="font-serif text-sm text-[#F1EFEA] font-light mt-1 line-clamp-1 group-hover:text-[#C5A880] transition-colors">
                              {evt.title}
                            </h4>
                            <p className="text-xs text-[#9A9996] line-clamp-1 mt-0.5 font-sans">
                              {evt.venue}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px]">
                            <span className="text-[#9A9996] font-mono flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#C5A880]" />
                              {evt.attendeesCount} / {evt.capacity || '∞'} Katılımcı
                            </span>

                            {evt.isUserRegistered ? (
                              <span className="text-emerald-400 font-mono flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Davetli
                              </span>
                            ) : (
                              <span className="text-[#C5A880] font-mono flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                İncele <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Day Floating Inspector */}
      {selectedDayEvents && selectedDayEvents.length > 0 && subView === 'month' && (
        <div className="p-4 rounded-xl bg-[#1A1A1E] border border-[#C5A880]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <h4 className="font-serif text-sm text-[#F1EFEA] font-light">
                {selectedDayKey} — Planlanan Salonlar ({selectedDayEvents.length})
              </h4>
            </div>
            <button
              onClick={() => {
                setSelectedDayEvents(null);
                setSelectedDayKey(null);
              }}
              className="text-xs text-[#9A9996] hover:text-[#F1EFEA] cursor-pointer"
            >
              Kapat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedDayEvents.map(evt => (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="p-3 rounded-lg bg-black/40 border border-white/[0.08] hover:border-[#C5A880]/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="font-serif text-xs text-[#F1EFEA] font-light line-clamp-1">{evt.title}</p>
                  <p className="text-[10px] font-mono text-[#9A9996]">
                    {new Date(evt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {evt.venue}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C5A880] shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
