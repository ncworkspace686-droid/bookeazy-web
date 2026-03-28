/** // BookEazy slots v2 — open_mon fix
 * slots.js — mirrors Flutter's SupabaseService.slotOptionsForDay exactly.
 */

function timeToMins(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

function slotKey(dateLike) {
  const dt = new Date(dateLike);
  return new Date(Date.UTC(
    dt.getUTCFullYear(),
    dt.getUTCMonth(),
    dt.getUTCDate(),
    dt.getUTCHours(),
    dt.getUTCMinutes(),
    0,
    0
  )).toISOString();
}

function rowBlocksSlot(row, slot, slotDurationMins) {
  const slotMins = slot.getUTCHours() * 60 + slot.getUTCMinutes();
  const slotEndMins = slotMins + slotDurationMins;

  if (row.is_recurring) {
    const blockStart = timeToMins(row.block_start_time);
    const blockEnd = timeToMins(row.block_end_time);
    return slotMins < blockEnd && slotEndMins > blockStart;
  }

  const slotDate =
    `${slot.getUTCFullYear()}-${String(slot.getUTCMonth() + 1).padStart(2, '0')}-${String(slot.getUTCDate()).padStart(2, '0')}`;
  const blockDate = row.block_date?.split('T')[0];
  if (!blockDate || slotDate !== blockDate) return false;

  if (!row.block_from_time || !row.block_to_time) return true;

  const blockFrom = timeToMins(row.block_from_time);
  const blockTo = timeToMins(row.block_to_time);
  return slotMins < blockTo && slotEndMins > blockFrom;
}

/**
 * generateSlots(schedule, blockedHours, appointments, date)
 */
export function generateSlots(schedule, blockedHours, appointments, date) {
  if (!schedule) return [];

  const jsDay = date.getDay();
  const flutterDay = jsDay === 0 ? 7 : jsDay;

  const openDaysCols = {
    1: schedule.open_mon,
    2: schedule.open_tue,
    3: schedule.open_wed,
    4: schedule.open_thu,
    5: schedule.open_fri,
    6: schedule.open_sat,
    7: schedule.open_sun,
  };

  const openDaysJson = schedule.open_days || {};
  const hasColData = Object.values(openDaysCols).some(
    v => v !== null && v !== undefined
  );

  if (hasColData) {
    const isOpen = openDaysCols[flutterDay];
    if (!isOpen) return [];
  } else if (Object.keys(openDaysJson).length > 0) {
    const isOpen = openDaysJson[String(flutterDay)] ?? openDaysJson[flutterDay];
    if (!isOpen) return [];
  }

  const dayHoursPrefix = '__DAY_HOURS__';
  let workStart = schedule.work_start || '09:00';
  let workEnd = schedule.work_end || '18:00';

  const dayTemplate = (blockedHours || []).find(
    r => r.label === `${dayHoursPrefix}${flutterDay}`
  );
  if (dayTemplate?.block_start_time) workStart = dayTemplate.block_start_time;
  if (dayTemplate?.block_end_time) workEnd = dayTemplate.block_end_time;

  const slotDuration = Math.max(schedule.slot_duration_mins || 30, 5);
  const maxPerSlot = Math.max(schedule.max_per_slot || 1, 1);

  const [startH, startM] = workStart.split(':').map(Number);
  const [endH, endM] = workEnd.split(':').map(Number);

  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  if (endMins <= startMins) return [];

  const endTime = new Date(date);
  endTime.setHours(endH, endM, 0, 0);

  const now = new Date();

  const slotCounts = {};
  for (const appt of appointments || []) {
    const raw = appt.slot_start || appt.date_time;
    if (!raw) continue;
    const key = slotKey(raw);
    slotCounts[key] = (slotCounts[key] || 0) + 1;
  }

  const effectiveBlocks = (blockedHours || []).filter(
    r => !r.label?.startsWith(dayHoursPrefix)
  );

  const slots = [];
  const cursor = new Date(date);
  cursor.setHours(startH, startM, 0, 0);

  while (cursor < endTime) {
    const slotEnd = new Date(cursor.getTime() + slotDuration * 60000);
    if (slotEnd > endTime) break;

    const slotCopy = new Date(cursor);
    const isPast = slotCopy <= now;
    const isBlocked = !isPast && effectiveBlocks.some(
      b => rowBlocksSlot(b, slotCopy, slotDuration)
    );

    const booked = slotCounts[slotKey(slotCopy)] || 0;
    const isFull = !isPast && !isBlocked && booked >= maxPerSlot;

    const isSelectable = !isPast && !isBlocked && !isFull;
    const reason = isPast
      ? 'Past'
      : isBlocked
      ? 'Blocked'
      : isFull
      ? 'Full'
      : null;

    slots.push({
      start: new Date(slotCopy),
      isSelectable,
      reason,
    });

    cursor.setTime(cursor.getTime() + slotDuration * 60000);
  }

  return slots;
}

// ─── Phone validation ─────────────────────────────────────────────────────────

const DIAL_CODES = [
  { dialCode: '+971', name: 'UAE', digitCount: 9 },
  { dialCode: '+966', name: 'Saudi Arabia', digitCount: 9 },
  { dialCode: '+974', name: 'Qatar', digitCount: 8 },
  { dialCode: '+973', name: 'Bahrain', digitCount: 8 },
  { dialCode: '+968', name: 'Oman', digitCount: 8 },
  { dialCode: '+965', name: 'Kuwait', digitCount: 8 },
  { dialCode: '+977', name: 'Nepal', digitCount: 10 },
  { dialCode: '+880', name: 'Bangladesh', digitCount: 10 },
  { dialCode: '+233', name: 'Ghana', digitCount: 9 },
  { dialCode: '+234', name: 'Nigeria', digitCount: 10 },
  { dialCode: '+254', name: 'Kenya', digitCount: 9 },
  { dialCode: '+91', name: 'India', digitCount: 10 },
  { dialCode: '+44', name: 'UK', digitCount: 10 },
  { dialCode: '+61', name: 'Australia', digitCount: 9 },
  { dialCode: '+65', name: 'Singapore', digitCount: 8 },
  { dialCode: '+60', name: 'Malaysia', digitCount: 10 },
  { dialCode: '+92', name: 'Pakistan', digitCount: 10 },
  { dialCode: '+94', name: 'Sri Lanka', digitCount: 9 },
  { dialCode: '+62', name: 'Indonesia', digitCount: 11 },
  { dialCode: '+63', name: 'Philippines', digitCount: 10 },
  { dialCode: '+66', name: 'Thailand', digitCount: 9 },
  { dialCode: '+84', name: 'Vietnam', digitCount: 9 },
  { dialCode: '+49', name: 'Germany', digitCount: 10 },
  { dialCode: '+33', name: 'France', digitCount: 9 },
  { dialCode: '+39', name: 'Italy', digitCount: 10 },
  { dialCode: '+34', name: 'Spain', digitCount: 9 },
  { dialCode: '+27', name: 'South Africa', digitCount: 9 },
  { dialCode: '+55', name: 'Brazil', digitCount: 11 },
  { dialCode: '+52', name: 'Mexico', digitCount: 10 },
  { dialCode: '+1', name: 'USA/Canada', digitCount: 10 },
].sort((a, b) => b.dialCode.length - a.dialCode.length);

export function getCountryFromWhatsapp(businessWhatsapp) {
  if (!businessWhatsapp) return null;
  return DIAL_CODES.find(c => businessWhatsapp.startsWith(c.dialCode)) || null;
}

export function validatePhone(digits, businessWhatsapp) {
  const clean = (digits || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!clean) return 'Phone number is required.';
  const country = getCountryFromWhatsapp(businessWhatsapp);
  if (country && country.digitCount > 0 && clean.length !== country.digitCount) {
    return `Enter a valid ${country.digitCount}-digit number for ${country.name}.`;
  }
  if (!country && clean.length < 6) return 'Enter a valid phone number.';
  return null;
}

export function formatTime(date) {
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
