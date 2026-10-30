import { Page, expect } from '@playwright/test';
import { DayZeroCheckInPage } from '@pages/onboarding/DayZeroCheckInPage';
import { navigateToOnboardingTab } from '@utils/onboardingNavigation';

/**
 * DayZeroCheckInKeywords drives Onboarding → Day-0 Check-In.
 *
 * Marking a joiner as Arrived is what triggers the "Create Password" mail to
 * their organisation address, so this is the last HR action before the
 * employee takes over their own onboarding.
 */
export class DayZeroCheckInKeywords {
  private readonly page: Page;
  private readonly checkInPage: DayZeroCheckInPage;

  constructor(page: Page) {
    this.page = page;
    this.checkInPage = new DayZeroCheckInPage(page);
  }

  async navigateToDayZeroCheckIn(): Promise<void> {
    await navigateToOnboardingTab(
      this.page,
      'Day-0 Check-In',
      'Day-0 Check-In Console',
    );
    await this.checkInPage.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyConsoleVisible(): Promise<void> {
    await expect(this.checkInPage.heading).toBeVisible({ timeout: 15000 });
  }

  /**
   * Asserts the employee is on today's check-in list.
   *
   * A miss here almost always means the Date of Joining is not today: the
   * console is scoped to joiners expected today, so a future-dated employee
   * simply is not on it.
   */
  async verifyJoinerListed(employeeName: string): Promise<void> {
    // Search first, then fall back to the unfiltered list: these onboarding
    // grids do not reliably match on full name, so an empty search result is
    // not evidence the joiner is absent.
    await this.checkInPage.searchJoiner(employeeName);
    const foundBySearch = await this.checkInPage
      .isJoinerListed(employeeName)
      .catch(() => false);
    if (!foundBySearch) {
      console.log(
        `[Day0] Search found no match for "${employeeName}" — clearing the filter`,
      );
      await this.checkInPage.clearSearch();
    }

    await expect(
      this.checkInPage.joinerCard(employeeName),
      `"${employeeName}" is not on today's Day-0 Check-In list — ` +
        'check that Date of Joining was set to today during Temporary Registration',
    ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Whether the joiner appears on today list, without asserting — for callers
   * that must branch (a resumed run after the joining date has passed).
   */
  async isJoinerListed(employeeName: string): Promise<boolean> {
    await this.checkInPage.searchJoiner(employeeName);
    if (await this.checkInPage.isJoinerListed(employeeName)) return true;
    await this.checkInPage.clearSearch();
    return await this.checkInPage.isJoinerListed(employeeName);
  }

  async verifyJoinerStatus(
    employeeName: string,
    expectedStatus: string,
  ): Promise<void> {
    await expect
      .poll(async () => await this.checkInPage.getJoinerStatus(employeeName), {
        timeout: 20000,
      })
      .toBe(expectedStatus);
  }

  /**
   * Check the joiner in, unless they already are.
   *
   * Arrival is one-way: once marked, the app renders the switch as
   * `checked disabled`, so clicking again just times out waiting for an
   * element that will never be enabled.
   */
  async markAsArrived(employeeName: string): Promise<void> {
    if (await this.checkInPage.isMarkedAsArrived(employeeName)) {
      console.log(
        `[Onboarding] "${employeeName}" is already checked in — nothing to do`,
      );
      return;
    }

    await this.checkInPage.markAsArrived(employeeName);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    console.log(`[Onboarding] Marked as arrived: ${employeeName}`);
  }

  /**
   * Confirms arrival registered. The toggle flipping is the immediate signal;
   * the status chip and the ARRIVED tile follow, so both are polled.
   */
  async verifyMarkedAsArrived(employeeName: string): Promise<void> {
    await expect
      .poll(
        async () => await this.checkInPage.isMarkedAsArrived(employeeName),
        { timeout: 20000, message: 'Mark as Arrived toggle did not switch on' },
      )
      .toBe(true);
  }

  async getArrivedCount(): Promise<number> {
    return await this.checkInPage.getTileCount('ARRIVED');
  }

  async getPendingCount(): Promise<number> {
    return await this.checkInPage.getTileCount('PENDING');
  }
}
