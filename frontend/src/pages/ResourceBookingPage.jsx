import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  getResources,
  getBookings,
  createBooking,
} from '@/services/api.mock';
import {
  CalendarClock,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar as CalendarIcon,
  HelpCircle,
} from 'lucide-react';

const HOURS = [
  { label: '9:00 AM', time: '09:00' },
  { label: '10:00 AM', time: '10:00' },
  { label: '11:00 AM', time: '11:00' },
  { label: '12:00 PM', time: '12:00' },
  { label: '1:00 PM', time: '13:00' },
  { label: '2:00 PM', time: '14:00' },
  { label: '3:00 PM', time: '15:00' },
  { label: '4:00 PM', time: '16:00' },
  { label: '5:00 PM', time: '17:00' },
];

export default function ResourceBookingPage() {
  const user = useAuthStore(s => s.user);

  // Data state
  const [resources, setResources] = useState([]);
  const [selectedResId, setSelectedResId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);

  // Form state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [conflictHours, setConflictHours] = useState([]);

  useEffect(() => {
    getResources().then((resList) => {
      setResources(resList);
      if (resList.length > 0) {
        setSelectedResId(resList[0].id);
      }
      setIsLoading(false);
    });
  }, []);

  // Fetch bookings whenever resource or date changes
  const fetchBookingsList = async () => {
    if (!selectedResId || !selectedDate) return;
    setErrorMsg('');
    setSuccessMsg('');
    setConflictHours([]);
    try {
      const bList = await getBookings(selectedResId, selectedDate);
      setBookings(bList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, [selectedResId, selectedDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResId || !selectedDate || !startTime || !endTime) return;
    setIsSubmitLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setConflictHours([]);

    try {
      await createBooking({
        resourceId: selectedResId,
        date: selectedDate,
        startTime,
        endTime,
        bookedBy: user?.id || 'usr_001',
      });
      setSuccessMsg(`Successfully booked! Time slot confirmed.`);
      setStartTime('');
      setEndTime('');
      fetchBookingsList();
    } catch (err) {
      setErrorMsg(err.message);
      // Highlight the conflict hours
      setConflictHours([startTime, endTime]);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Timeline helper: check if a booking overlaps with a specific hourly block
  const getBookingForHour = (hourTime) => {
    const hourMinutes = hourTimeToMinutes(hourTime);
    return bookings.find((b) => {
      const start = bookingTimeToMinutes(b.startTime);
      const end = bookingTimeToMinutes(b.endTime);
      return hourMinutes >= start && hourMinutes < end;
    });
  };

  // Helper conversion functions
  function hourTimeToMinutes(timeStr) {
    const [h] = timeStr.split(':').map(Number);
    return h * 60;
  }
  function bookingTimeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Check if conflict matches this hour row
  const isRowConflicted = (hourTime) => {
    if (conflictHours.length !== 2) return false;
    const hourMinutes = hourTimeToMinutes(hourTime);
    const start = bookingTimeToMinutes(conflictHours[0]);
    const end = bookingTimeToMinutes(conflictHours[1]);
    return hourMinutes >= start && hourMinutes < end;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
          Time-Slot Resource Booking
        </h1>
        <p className="text-sm text-[#9CA3AF] font-medium">
          Reserve conference rooms, huddle spaces, and shared AV equipment without scheduling conflicts.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Loading booking schedule...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline View (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Top selectors */}
            <div className="bg-white rounded-2xl p-4 border border-[#F0EBE6] shadow-[0_1px_3px_rgba(30,32,34,0.02)] flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="block text-xs font-semibold text-[#9CA3AF]">Select Resource</label>
                <select
                  value={selectedResId}
                  onChange={(e) => setSelectedResId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-xs font-semibold text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-auto min-w-[150px] space-y-1">
                <label className="block text-xs font-semibold text-[#9CA3AF]">Booking Date</label>
                <div className="relative">
                  <CalendarIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-xs font-semibold text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Hourly daily timeline view */}
            <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] overflow-hidden">
              <div className="p-4 border-b border-[#F0EBE6] bg-[#FAF7F5] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#1E2022] uppercase tracking-wider">Schedule Calendar</h3>
                <span className="text-xs text-[#9CA3AF] font-medium">{selectedDate}</span>
              </div>

              <div className="divide-y divide-[#F0EBE6]">
                {HOURS.map((hour) => {
                  const booking = getBookingForHour(hour.time);
                  const isConflict = isRowConflicted(hour.time);
                  
                  return (
                    <div
                      key={hour.time}
                      className={`flex items-stretch min-h-[56px] transition-colors ${
                        isConflict ? 'bg-[#C85C27]/5' : ''
                      }`}
                    >
                      {/* Left Hour Label */}
                      <div className="w-20 px-4 py-3 border-r border-[#F0EBE6] flex items-start justify-end text-xs font-semibold text-[#9CA3AF]">
                        {hour.label}
                      </div>

                      {/* Right Block Area */}
                      <div className="flex-1 p-2 relative flex items-center">
                        {booking ? (
                          <div className="absolute inset-y-1.5 left-2 right-2 bg-[#1E2022] text-white rounded-lg p-2.5 shadow-[0_1px_3px_rgba(30,32,34,0.1)] flex items-center justify-between animate-in fade-in duration-200">
                            <div>
                              <p className="text-xs font-bold">{booking.bookedByName}</p>
                              <p className="text-[10px] text-white/60 flex items-center gap-1">
                                <Clock size={10} />
                                {booking.startTime} - {booking.endTime}
                              </p>
                            </div>
                            <span className="text-[9px] px-2 py-0.5 bg-white/10 rounded-full font-bold text-white/80 uppercase">
                              Reserved
                            </span>
                          </div>
                        ) : isConflict ? (
                          <div className="absolute inset-y-1.5 left-2 right-2 bg-[#C85C27]/10 border border-dashed border-[#C85C27]/30 text-[#C85C27] rounded-lg p-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Requested Overlap Slot
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#C4BEB8]/60 pl-2">Empty Slot</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Side (Right Column) */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
              <CalendarClock size={14} />
              Book Time Slot
            </h2>

            <div className="bg-white rounded-2xl p-6 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Selected Resource Overview */}
                <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F0EBE6]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Active Selection</p>
                  <p className="text-sm font-bold text-[#1E2022] mt-0.5">
                    {resources.find(r => r.id === selectedResId)?.name || 'None'}
                  </p>
                  <p className="text-xs text-[#6B7280]">{selectedDate}</p>
                </div>

                {/* Overlap Error UI */}
                {errorMsg && (
                  <div className="bg-[#C85C27]/[0.06] border border-[#C85C27]/15 rounded-xl p-3.5 flex items-start gap-2 animate-in fade-in duration-200">
                    <AlertTriangle size={15} className="text-[#C85C27] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1E2022]">Booking Blocked</p>
                      <p className="text-[11px] text-[#C85C27] font-semibold mt-0.5 leading-relaxed">
                        {errorMsg}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <div className="bg-[#1E4620]/[0.06] border border-[#1E4620]/10 rounded-xl p-3.5 flex items-center gap-2">
                    <CheckCircle size={15} className="text-[#1E4620]" />
                    <p className="text-xs text-[#1E4620] font-semibold">{successMsg}</p>
                  </div>
                )}

                {/* Time Fields */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#6B7280]">Start Time</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                    >
                      <option value="">Choose Start Time</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#6B7280]">End Time</label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                    >
                      <option value="">Choose End Time</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitLoading || !selectedResId}
                  className="w-full h-11 bg-[#D97736] text-white text-sm font-semibold rounded-xl hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  Reserve Slot
                </button>
              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
