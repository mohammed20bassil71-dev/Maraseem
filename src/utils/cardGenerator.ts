import { InvitationData } from '../types/invitation';
import QRCodeLib from 'qrcode';

export async function generateInvitationCardImage(invitation: InvitationData): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1520;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient: deep luxury obsidian/charcoal
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0c0e12');
  bgGrad.addColorStop(0.5, '#161922');
  bgGrad.addColorStop(1, '#08090c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Gold Border
  ctx.lineWidth = 4;
  const goldGrad = ctx.createLinearGradient(50, 50, width - 50, height - 50);
  goldGrad.addColorStop(0, '#f9e8a2');
  goldGrad.addColorStop(0.3, '#d4af37');
  goldGrad.addColorStop(0.7, '#aa771c');
  goldGrad.addColorStop(1, '#e6c875');
  ctx.strokeStyle = goldGrad;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  // Inner Thin Accent Border
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.strokeRect(66, 66, width - 132, height - 132);

  // Corner Gold Accents
  const cornerSize = 40;
  const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dirY * cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dirX * cornerSize, y);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.stroke();
  };
  drawCorner(50, 50, 1, 1);
  drawCorner(width - 50, 50, -1, 1);
  drawCorner(50, height - 50, 1, -1);
  drawCorner(width - 50, height - 50, -1, -1);

  // Top Platform Emblem / Bismillah
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d4af37';
  ctx.font = '26px Amiri, serif';
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 130);

  // Decorative divider
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 160);
  ctx.lineTo(width / 2 + 120, 160);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Welcome Quote
  if (invitation.welcomeQuote) {
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'italic 24px Amiri, serif';
    ctx.fillText(invitation.welcomeQuote, width / 2, 220);
  }

  // Invitation Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px Cairo, sans-serif';
  ctx.fillText(invitation.title, width / 2, 300);

  // Primary Names (Couple / Graduate / Star)
  let primaryName = '';
  if (invitation.groomName && invitation.brideName) {
    primaryName = `${invitation.groomName}  &  ${invitation.brideName}`;
  } else if (invitation.graduateName) {
    primaryName = invitation.graduateName;
  } else if (invitation.birthdayStarName) {
    primaryName = invitation.birthdayStarName;
  } else if (invitation.businessName) {
    primaryName = invitation.businessName;
  }

  if (primaryName) {
    ctx.fillStyle = '#f5d372';
    ctx.font = 'bold 58px Amiri, serif';
    ctx.fillText(primaryName, width / 2, 410);

    // Subtitle / Family
    if (invitation.groomFamily && invitation.brideFamily) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '24px Cairo, sans-serif';
      ctx.fillText(`عائلة ${invitation.groomFamily}  •  عائلة ${invitation.brideFamily}`, width / 2, 465);
    }
  }

  // Invitation Body text (wrapped)
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '24px Cairo, sans-serif';
  const bodyText = invitation.invitationBody || '';
  const maxBodyWidth = width - 240;
  const words = bodyText.split(' ');
  let line = '';
  let yPos = 550;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxBodyWidth && n > 0) {
      ctx.fillText(line, width / 2, yPos);
      line = words[n] + ' ';
      yPos += 40;
      if (yPos > 720) break; // keep space for details
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, yPos);

  // Decorative Ornament Box for Date & Location
  const boxY = 780;
  const boxH = 240;
  const boxW = width - 200;
  const boxX = 100;

  ctx.fillStyle = 'rgba(212, 175, 55, 0.05)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Date column
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 22px Cairo, sans-serif';
  ctx.fillText('التاريخ والموعد', boxX + boxW * 0.75, boxY + 55);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Cairo, sans-serif';
  ctx.fillText(invitation.eventDate, boxX + boxW * 0.75, boxY + 110);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '22px Cairo, sans-serif';
  ctx.fillText(invitation.eventTime || '08:00 مساءً', boxX + boxW * 0.75, boxY + 155);

  if (invitation.hijriDate) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '19px Amiri, serif';
    ctx.fillText(invitation.hijriDate, boxX + boxW * 0.75, boxY + 195);
  }

  // Vertical separator in box
  ctx.beginPath();
  ctx.moveTo(boxX + boxW * 0.5, boxY + 25);
  ctx.lineTo(boxX + boxW * 0.5, boxY + boxH - 25);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
  ctx.stroke();

  // Venue column
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 22px Cairo, sans-serif';
  ctx.fillText('مكان الحفل', boxX + boxW * 0.25, boxY + 55);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Cairo, sans-serif';
  ctx.fillText(invitation.venueName, boxX + boxW * 0.25, boxY + 110);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '22px Cairo, sans-serif';
  ctx.fillText(invitation.city, boxX + boxW * 0.25, boxY + 155);

  if (invitation.addressDetails) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px Cairo, sans-serif';
    ctx.fillText(invitation.addressDetails, boxX + boxW * 0.25, boxY + 195);
  }

  // QR Code Generation
  const inviteUrl = `${window.location.origin}/#invitation-${invitation.slug}`;
  try {
    const qrDataUrl = await QRCodeLib.toDataURL(inviteUrl, {
      width: 170,
      margin: 1,
      color: { dark: '#0b0c10', light: '#f5d372' },
    });
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });

    // Draw QR Code
    const qrSize = 150;
    const qrX = width / 2 - qrSize / 2;
    const qrY = 1090;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // QR Code caption
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 18px Cairo, sans-serif';
    ctx.fillText('امسح الرمز لفتح الدعوة التفاعلية وتأكيد الحضور', width / 2, 1275);
  } catch {
    // fallback if QR fails
  }

  // Dress code notice if available
  if (invitation.dressCode) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '18px Cairo, sans-serif';
    ctx.fillText(`رمز اللباس: ${invitation.dressCode}`, width / 2, 1335);
  }

  // Footer branding
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Cairo, sans-serif';
  ctx.fillText('منصة مراسيم للدعوات الإلكترونية الفاخرة • Maraseem.iq', width / 2, 1420);

  return canvas.toDataURL('image/png');
}

export async function downloadInvitationCard(invitation: InvitationData): Promise<void> {
  const dataUrl = await generateInvitationCardImage(invitation);
  if (!dataUrl) return;

  const link = document.createElement('a');
  link.download = `maraseem-card-${invitation.slug || 'invitation'}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
