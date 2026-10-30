import { Page, expect } from '@playwright/test';
import { UpcomingJoineePage } from '@pages/onboarding/UpcomingJoineePage';
import { navigateToOnboardingTab } from '@utils/onboardingNavigation';

/**
 * UpcomingJoineeKeywords drives Onboarding → Upcoming Joinee, the first screen
 * that proves a temporarily-registered candidate crossed over from
 * Pre-Onboarding into Onboarding.
 */
export class UpcomingJoineeKeywords {
  private readonly page: Page;
  private readonly joineePage: UpcomingJoineePage;

  constructor(page: Page) {
    this.page = page;
    this.joineePage = new UpcomingJoineePage(page);
  }

  async navigateToUpcomingJoinee(): Promise<void> {
    await navigateToOnboardingTab(this.page, 'Upcoming Joinee', 'Upcoming Joinees');
    await this.joineePage.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyDashboardVisible(): Promise<void> {
    await expect(this.joineePage.heading).toBeVisible({ timeout: 15000 });
  }

  /**
   * Asserts the SAME candidate appears, searching first so the assertion does
   * not depend on where the row lands in a paginated grid.
   */
  async verifyJoineeListed(candidateName: string): Promise<void> {
    await this.joineePage.searchJoinee(candidateName);
    await expect(
      this.joineePage.joineeRow(candidateName),
      `Candidate "${candidateName}" did not appear on the Upcoming Joinees dashboard`,
    ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Whether the joinee appears on the grid, without asserting.
   *
   * For callers that need to branch rather than fail — e.g. a resumed employee
   * whose joining date has arrived is no longer "upcoming", which is correct
   * behaviour, not a defect.
   */
  async isJoineeListed(candidateName: string): Promise<boolean> {
    await this.joineePage.searchJoinee(candidateName);
    return await this.joineePage.isJoineeListed(candidateName);
  }

  /** Confirms the joinee row carries the reporting manager that was selected. */
  async verifyJoineeDetails(
    candidateName: string,
    expected: { reportingManager?: string; location?: string; email?: string },
  ): Promise<void> {
    const rowText = await this.joineePage.getJoineeRowText(candidateName);
    console.log(`[Onboarding] Upcoming joinee row: ${rowText}`);

    if (expected.reportingManager) {
      expect(rowText).toContain(expected.reportingManager);
    }
    if (expected.location) {
      // The modal stores a code-suffixed label ("Bengaluru - BEN-001") while
      // the grid renders just the city, so compare on the city portion.
      const city = expected.location.split(' - ')[0].trim();
      expect(rowText).toContain(city);
    }
    if (expected.email) {
      expect(rowText.toLowerCase()).toContain(expected.email.toLowerCase());
    }
  }
}
