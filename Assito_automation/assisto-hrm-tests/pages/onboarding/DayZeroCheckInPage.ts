import { type Page, type Locator } from '@playwright/test';

/**
 * DayZeroCheckInPage covers Onboarding → Day-0 Check-In ("Day-0 Check-In
 * Console"): the Arrived / Pending / No-Show tiles and one card per joiner
 * carrying a "Mark as Arrived" toggle and a "No-Show" button. A Cards/Table
 * view switch sits top-right; the card view is the default and the one
 * automated here.
 *
 * SCHEDULING CONSTRAINT: this console lists only joiners expected TODAY
 * ("HR Admin · N joiner expected today"). An employee whose Date of Joining is
 * in the future will not appear at all — which is why the onboarding workflow
 * sets Date of Joining to today during Temporary Registration.
 */
export class DayZeroCheckInPage {
  private readonly page: Page;

  readonly heading: Locator;
  readonly expectedTodaySubtitle: Locator;
  readonly cardsViewButton: Locator;
  readonly tableViewButton: Locator;

  readonly arrivedTile: Locator;
  readonly pendingTile: Locator;
  readonly noShowTile: Locator;

  readonly searchJoinersInput: Locator;
  readonly joinerCards: Locator;
  readonly paginationInfo: Locator;

  constructor(page: Page) {
    this.page = page;

    // Screen titles render as plain text in this app, not heading roles.
    this.heading = page
      .getByText('Day-0 Check-In Console', { exact: true })
      .first();
    this.expectedTodaySubtitle = page.getByText(/joiner[s]? expected today/);
    this.cardsViewButton = page.getByRole('button', { name: 'Cards' });
    this.tableViewButton = page.getByRole('button', { name: 'Table' });

    this.arrivedTile = page.locator('div').filter({ hasText: /^ARRIVED/ }).first();
    this.pendingTile = page.locator('div').filter({ hasText: /^PENDING/ }).first();
    this.noShowTile = page.locator('div').filter({ hasText: /^NO-SHOW/ }).first();

    // Regex, not a literal: the app renders a Unicode ellipsis (…) in these
    // placeholders, so an exact "..." string never matches.
    this.searchJoinersInput = page.getByPlaceholder(/Search joiners/i);
    this.joinerCards = page.locator('div').filter({ hasText: /Mark as Arrived|Arrived/i });
    this.paginationInfo = page.getByText(/\d+–\d+ of \d+ joiners/);
  }

  async isHeadingVisible(): Promise<boolean> {
    return await this.heading.isVisible().catch(() => false);
  }

  async searchJoiner(text: string): Promise<void> {
    await this.searchJoinersInput.fill(text);
    await this.page.waitForTimeout(800);
  }

  /** Empty the search box so every joiner is shown again. */
  async clearSearch(): Promise<void> {
    const present = await this.searchJoinersInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!present) return;
    await this.searchJoinersInput.fill('');
    await this.page.waitForTimeout(800);
  }

  /** The joiner's check-in card, matched on employee name (pending or arrived). */
  joinerCard(employeeName: string): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(employeeName) })
      .filter({ hasText: /Mark as Arrived|Arrived/i })
      .last();
  }

  async isJoinerListed(employeeName: string): Promise<boolean> {
    return await this.joinerCard(employeeName)
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  }

  /** Status chip on the card — e.g. "Not Yet", "Arrived", "No-Show". */
  async getJoinerStatus(employeeName: string): Promise<string> {
    const card = this.joinerCard(employeeName);
    // 'Not Yet' first: a card in that state can still contain the word
    // 'Arrived' via the 'Mark as Arrived' label, which would misread as done.
    for (const status of ['Not Yet', 'No-Show', 'Arrived']) {
      const visible = await card
        .getByText(status, { exact: true })
        .first()
        .isVisible()
        .catch(() => false);
      if (visible) return status;
    }
    return '';
  }

  async markAsArrived(employeeName: string): Promise<void> {
    // "Mark as Arrived" is a toggle (switch), not a button — clicking the
    // label text would miss it.
    const toggle = this.joinerCard(employeeName).getByRole('switch').first();
    await toggle.click();
  }

  /**
   * Whether the joiner is checked in.
   *
   * Checked multiple robust ways:
   * 1. The switch element is checked, aria-checked="true", or disabled (arrival disables the toggle).
   * 2. The card displays the "Arrived ✓" or "Arrived" status badge.
   * 3. The top ARRIVED tile count is > 0.
   */
  async isMarkedAsArrived(employeeName: string): Promise<boolean> {
    const cardOrRow = this.page
      .locator('div')
      .filter({ hasText: new RegExp(employeeName) });

    const toggle = cardOrRow.getByRole('switch').first();
    if (await toggle.isChecked().catch(() => false)) return true;
    if ((await toggle.getAttribute('aria-checked').catch(() => null)) === 'true') {
      return true;
    }
    if (await toggle.isDisabled().catch(() => false)) {
      return true;
    }

    const arrivedBadge = cardOrRow.getByText(/Arrived/i).first();
    if (await arrivedBadge.isVisible().catch(() => false)) return true;

    const count = await this.getTileCount('ARRIVED').catch(() => 0);
    if (count > 0) return true;

    const status = await this.getJoinerStatus(employeeName);
    return /arrived/i.test(status);
  }

  async clickNoShow(employeeName: string): Promise<void> {
    await this.joinerCard(employeeName)
      .getByRole('button', { name: 'No-Show' })
      .click();
  }

  /** Numeric value from one of the console tiles. */
  async getTileCount(tile: 'ARRIVED' | 'PENDING' | 'NO-SHOW'): Promise<number> {
    const locator =
      tile === 'ARRIVED'
        ? this.arrivedTile
        : tile === 'PENDING'
          ? this.pendingTile
          : this.noShowTile;
    const text = (await locator.textContent()) ?? '';
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
}
