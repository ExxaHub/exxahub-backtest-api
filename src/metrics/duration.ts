import dayjs from 'dayjs';

export const formatDuration = (startUnix: number, endUnix: number): string => {
  const start = dayjs.unix(startUnix);
  const end = dayjs.unix(endUnix);

  const totalMonths = end.diff(start, 'month');
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearStr = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
  const monthStr = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

  return [yearStr, monthStr].filter(Boolean).join(' ');
}
