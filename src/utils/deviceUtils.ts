/**
 * Helper to identify user device and browser for activity audit logs
 */
export const getDeviceDetails = (): string => {
  if (typeof window === 'undefined' || !navigator) return 'Browser Perangkat';
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Perangkat';

  // Detect Browser
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Google Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  // Detect Operating System / Device
  if (ua.includes('Windows NT 10.0') || ua.includes('Windows NT 11.0')) os = 'Windows PC';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android Mobile';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'MacBook / MacOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} di ${os}`;
};

/**
 * Format relative time in Indonesian
 */
export const formatRelativeTime = (isoDate: string): string => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '-';
  
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 10) return 'Baru saja';
  if (diffSec < 60) return `${diffSec} detik lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
