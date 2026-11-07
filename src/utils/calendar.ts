import { InvitationData } from '../types/invitation';

export function getGoogleCalendarUrl(invitation: InvitationData): string {
  const dateStr = invitation.eventDate.replace(/-/g, '');
  // Format start time e.g., 20:00 -> 200000
  let timeStr = '200000';
  if (invitation.eventTime) {
    const cleanTime = invitation.eventTime.replace(/\s[AP]M/i, '').trim();
    const parts = cleanTime.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      if (invitation.eventTime.toLowerCase().includes('pm') && hours < 12) hours += 12;
      if (invitation.eventTime.toLowerCase().includes('am') && hours === 12) hours = 0;
      timeStr = `${String(hours).padStart(2, '0')}${parts[1].padStart(2, '0')}00`;
    }
  }

  const startIso = `${dateStr}T${timeStr}`;
  // 4 hours duration
  const endHours = Math.min(23, parseInt(timeStr.slice(0, 2), 10) + 4);
  const endIso = `${dateStr}T${String(endHours).padStart(2, '0')}${timeStr.slice(2, 4)}00`;

  const details = encodeURIComponent(
    `${invitation.welcomeQuote ? invitation.welcomeQuote + '\n\n' : ''}${invitation.invitationBody}\n\nالموقع: ${invitation.venueName} - ${invitation.city}\nرابط الدعوة التفاعلية: ${window.location.origin}/#invitation-${invitation.slug}`
  );
  const location = encodeURIComponent(`${invitation.venueName}, ${invitation.city}, ${invitation.addressDetails || ''}`);
  const title = encodeURIComponent(invitation.title);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

export function downloadIcsFile(invitation: InvitationData): void {
  const dateStr = invitation.eventDate.replace(/-/g, '');
  let timeStr = '200000';
  if (invitation.eventTime) {
    const cleanTime = invitation.eventTime.replace(/\s[AP]M/i, '').trim();
    const parts = cleanTime.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      if (invitation.eventTime.toLowerCase().includes('pm') && hours < 12) hours += 12;
      if (invitation.eventTime.toLowerCase().includes('am') && hours === 12) hours = 0;
      timeStr = `${String(hours).padStart(2, '0')}${parts[1].padStart(2, '0')}00`;
    }
  }

  const startIso = `${dateStr}T${timeStr}`;
  const endHours = Math.min(23, parseInt(timeStr.slice(0, 2), 10) + 4);
  const endIso = `${dateStr}T${String(endHours).padStart(2, '0')}${timeStr.slice(2, 4)}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Maraseem Platform//Digital Invitations//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:maraseem-${invitation.id}-${Date.now()}@maraseem.iq`,
    `DTSTAMP:${dateStr}T000000Z`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${invitation.title}`,
    `DESCRIPTION:${invitation.invitationBody.replace(/\n/g, '\\n')}\\n\\nرابط الدعوة: ${window.location.origin}/#invitation-${invitation.slug}`,
    `LOCATION:${invitation.venueName}\\, ${invitation.city}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'DESCRIPTION:تذكير بموعد الدعوة',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${invitation.slug || 'invitation'}-calendar.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
