const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  const d = new Date(iso + 'T00:00:00');
  if (style === 'long') {
    return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
  }
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateRange(date: string): { day: string; month: string } {
  const d = new Date(date + 'T00:00:00');
  return { day: String(d.getDate()), month: MONTHS[d.getMonth()] };
}

export function daysUntil(iso: string, from: Date = new Date('2026-08-21T00:00:00')): number {
  const target = new Date(iso + 'T00:00:00');
  const diff = target.getTime() - from.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function relativeDeadline(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return 'Past';
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d <= 7) return `In ${d} days`;
  return `In ${Math.round(d / 7)} weeks`;
}

export function classForPriority(p: 'high' | 'medium' | 'low'): string {
  if (p === 'high') return 'bg-ink-charcoal text-ink-white';
  if (p === 'medium') return 'bg-ink-dark-grey text-ink-white';
  return 'bg-ink-grey text-ink-dark-grey';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
