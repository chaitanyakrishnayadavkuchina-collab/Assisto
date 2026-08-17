/**
 * Date helpers for assertions that must track the calendar instead of
 * hardcoding a month — the Pre-Onboarding Dashboard labels its period header
 * and trend chart with real month names, so fixed strings become time bombs.
 */

const MONTH_LONG = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: 'UTC',
});
const MONTH_SHORT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});

/**
 * Current period as the dashboard header renders it, e.g. "August 2026".
 * @param now - Reference date (defaults to today); accepted for testability
 */
export function currentMonthYearLabel(now: Date = new Date()): string {
  return `${MONTH_LONG.format(now)} ${now.getUTCFullYear()}`;
}

/**
 * The trailing `count` month labels ending with the current month, formatted
 * as the trend chart renders them, e.g. ["Mar 2026", ..., "Aug 2026"].
 *
 * @param count - How many months to return (default 6, matching the chart)
 * @param now - Reference date (defaults to today)
 */
export function recentMonthLabels(
  count: number = 6,
  now: Date = new Date(),
): string[] {
  const labels: string[] = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const month = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    labels.push(`${MONTH_SHORT.format(month)} ${month.getUTCFullYear()}`);
  }
  return labels;
}
