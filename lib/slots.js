/**
 * Generates available time slots for a given day,
 * mirroring the Flutter slotOptionsForDay logic.
 */
export function generateSlots(schedule, blockedTimes, existingAppts, date) {
  if (!schedule) return [];

  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const dayKey   = dayNames[date.getDay()];
  const daySchedule = schedule.weekly_hours?.[dayKey];

  // Day is closed
  if (!daySchedule?.open || !daySchedule?.start || !daySchedule?.end) return [];

  const [startH, startM] = daySchedule.start.split(':').map(Number);
  const [endH,   endM]   = daySchedule.end.split(':').map(Number);
  const slotDuration     = schedule.slot_duration_minutes || 30;
  const bufferMinutes    = schedule.buffer_minutes || 0;

  const slots = [];
  let cursor  = new Date(date);
  cursor.setHours(startH, startM, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endH, endM, 0, 0);

  const now = new Date();

  while (cursor < endTime) {
    const slotEnd = new Date(cursor.getTime() + slotDuration * 60000);
    if (slotEnd > endTime) break;

    const slotCopy = new Date(cursor);

    // Past check
    const isPast = slotCopy <= now;

    // Blocked time check
    const isBlocked = (blockedTimes || []).some(b => {
      const bs = new Date(b.start_time);
      const be = new Date(b.end_time);
      return slotCopy >= bs && slotCopy < be;
    });

    // Existing appointment check
    const isBooked = (existingAppts || []).some(a => {
      const at = new Date(a.date_time);
      return Math.abs(at - slotCopy) < slotDuration * 60000;
    });

    const isSelectable = !isPast && !isBlocked && !isBooked;
    const reason = isPast ? 'Past' : isBlocked ? 'Blocked' : isBooked ? 'Booked' : null;

    slots.push({ start: new Date(slotCopy), isSelectable, reason });

    cursor = new Date(cursor.getTime() + (slotDuration + bufferMinutes) * 60000);
  }

  return slots;
}

export function formatTime(date) {
  let h = date.getHours();
  const m   = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric',
    month: 'short', year: 'numeric',
  });
}
