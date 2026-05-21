export function fmtDate(s) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return s; }
}

export function isUpcoming(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

export function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export const CATEGORIES = [
  'Theme Park', 'Nature', 'Heritage', 'Museum',
  'Beach', 'Sports', 'Zoo & Wildlife', 'Food & Drink', 'Other'
];

export function catBadge(cat) {
  const goldCats = ['Heritage', 'Museum', 'Food & Drink'];
  return goldCats.includes(cat) ? 'badge-gold' : 'badge-teal';
}

export function buildGCalUrl(trip) {
  if (!trip.date) return null;
  const startDate = trip.date.replace(/-/g, '');
  let startStr, endStr;
  if (trip.time) {
    const [h, m] = trip.time.split(':');
    const pad = n => String(n).padStart(2, '0');
    startStr = `${startDate}T${pad(h)}${pad(m)}00`;
    endStr = `${startDate}T${pad(parseInt(h) + 4)}${pad(m)}00`;
  } else {
    startStr = startDate;
    endStr = startDate;
  }
  const details = [
    trip.notes,
    trip.website ? `Website: ${trip.website}` : '',
    trip.ticket_url ? `Tickets: ${trip.ticket_url}` : '',
    trip.price ? `Price: ${trip.price} per person` : '',
  ].filter(Boolean).join('\n');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(trip.name)}` +
    `&dates=${startStr}/${endStr}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(trip.location || '')}`;
}
