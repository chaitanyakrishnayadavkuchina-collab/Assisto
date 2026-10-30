import { type Page, type Locator } from '@playwright/test';

/**
 * UpcomingJoineePage covers Onboarding → Upcoming Joinee: the grid of
 * candidates scheduled to join, plus the KPI tiles above it (Total Upcoming,
 * Joining This Week, Joining Next Week, This Month).
 *
 * A temporarily-registered candidate lands here, which makes this the first
 * proof that the Pre-Onboarding → Onboarding hand-off actually took effect.
 */
export class UpcomingJoineePage {
  private readonly page: Page;

  readonly heading: Locator;
  readonly searchJoineesInput: Locator;
  readonly filterButton: Locator;
  readonly exportButton: Locator;
  readonly columnsButton: Locator;
  readonly rows: Locator;
  readonly paginationInfo: Locator;

  // KPI tiles
  readonly totalUpcomingTile: Locator;
  readonly joiningThisWeekTile: Locator;
  readonly joiningNextWeekTile: Locator;
  readonly thisMonthTile: Locator;

  constructor(page: Page) {
    this.page = page;

    // This app renders screen titles as plain text, not heading roles — a
    // getByRole('heading') lookup finds nothing anywhere in the Onboarding
    // module (the candidate detail page has no <h1> either).
    this.heading = page.getByText('Upcoming Joinees', { exact: true }).first();
    // Regex, not a literal: the app renders a Unicode ellipsis (…) in these
    // placeholders, so an exact "..." string never matches.
    this.searchJoineesInput = page.getByPlaceholder(/Search joinees/i);
    this.filterButton = page.getByRole('button', { name: 'Filter' });
    this.exportButton = page.getByRole('button', { name: 'Export' });
    this.columnsButton = page.getByRole('button', { name: 'Columns' });
    this.rows = page.getByRole('row');
    this.paginationInfo = page.getByText(/\d+–\d+ of \d+ joinees/);

    this.totalUpcomingTile = page
      .locator('div')
      .filter({ hasText: /^TOTAL UPCOMING/ })
      .first();
    this.joiningThisWeekTile = page
      .locator('div')
      .filter({ hasText: /^JOINING THIS WEEK/ })
      .first();
    this.joiningNextWeekTile = page
      .locator('div')
      .filter({ hasText: /^JOINING NEXT WEEK/ })
      .first();
    this.thisMonthTile = page
      .locator('div')
      .filter({ hasText: /^THIS MONTH/ })
      .first();
  }

  async isHeadingVisible(): Promise<boolean> {
    return await this.heading.isVisible().catch(() => false);
  }

  async searchJoinee(text: string): Promise<void> {
    await this.searchJoineesInput.fill(text);
    // The grid filters client-side as you type; give it a beat to settle
    // rather than asserting against the pre-filter row set.
    await this.page.waitForTimeout(800);
  }

  /** The grid row for a joinee, matched on the candidate's name. */
  joineeRow(candidateName: string): Locator {
    return this.rows.filter({ hasText: candidateName }).first();
  }

  async isJoineeListed(candidateName: string): Promise<boolean> {
    return await this.joineeRow(candidateName)
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  }

  /** Full text of the joinee's row — designation, date, manager, location. */
  async getJoineeRowText(candidateName: string): Promise<string> {
    return (await this.joineeRow(candidateName).textContent())?.trim() ?? '';
  }
}
