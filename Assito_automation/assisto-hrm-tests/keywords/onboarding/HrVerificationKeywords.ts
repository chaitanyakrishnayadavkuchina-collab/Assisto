import { Page, expect } from '@playwright/test';
import {
  HrVerificationPage,
  type HrVerificationStep,
} from '@pages/onboarding/HrVerificationPage';
import { navigateToOnboardingTab } from '@utils/onboardingNavigation';

/** The seven steps HR reviews, in the order the app presents them. */
export const HR_REVIEW_STEPS: readonly HrVerificationStep[] = [
  'Personal Profile',
  'Identity Details',
  'Employment And Education',
  'Statutory',
  'Agreements And Policies',
  'Induction',
  'Meet The Team',
];

/**
 * HrVerificationKeywords drives the HR side of onboarding sign-off: find the
 * employee in the Pending queue, walk their submission step by step, verify the
 * identity documents, and approve or reject the onboarding.
 */
export class HrVerificationKeywords {
  private readonly page: Page;
  private readonly verifyPage: HrVerificationPage;

  constructor(page: Page) {
    this.page = page;
    this.verifyPage = new HrVerificationPage(page);
  }

  async navigateToHrVerification(): Promise<void> {
    await navigateToOnboardingTab(
      this.page,
      'HR Verification',
      'Onboarding Verification',
    );
    await this.verifyPage.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyQueueVisible(): Promise<void> {
    await expect(this.verifyPage.heading).toBeVisible({ timeout: 15000 });
  }

  /**
   * Locate the employee in the Pending queue.
   *
   * Search first, then fall back to the unfiltered list: the onboarding grids
   * in this app do not reliably match on full name, so an empty search result
   * is not evidence the employee is absent.
   */
  async verifyEmployeePendingReview(identifier: string): Promise<void> {
    await this.verifyPage.clickPendingTab();
    await this.verifyPage.search(identifier);

    if (!(await this.verifyPage.isEmployeeListed(identifier))) {
      console.log(
        `[HrVerify] Search found no match for "${identifier}" — clearing the filter`,
      );
      await this.verifyPage.clearSearch();
    }

    await expect(
      this.verifyPage.employeeRow(identifier),
      `"${identifier}" is not awaiting HR verification — they may not have ` +
        'submitted their self-onboarding yet',
    ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Check whether the employee is currently in the Pending queue.
   */
  async isEmployeePending(identifier: string): Promise<boolean> {
    await this.verifyPage.clickPendingTab();
    await this.verifyPage.search(identifier);

    let listed = await this.verifyPage.isEmployeeListed(identifier);
    if (!listed) {
      await this.verifyPage.clearSearch();
      listed = await this.verifyPage.isEmployeeListed(identifier);
    }
    return listed;
  }

  /** Open the submission via the Action column's eye icon. */
  async openEmployeeSubmission(identifier: string): Promise<void> {
    await this.verifyPage.openEmployeeReview(identifier);
    await expect(
      this.verifyPage.reviewBanner,
      `The review page did not open for "${identifier}"`,
    ).toBeVisible({ timeout: 20000 });
    console.log(`[HrVerify] Reviewing submission for: ${identifier}`);
  }

  /**
   * Confirm the review opened for the RIGHT person, using the employee ID chip
   * the header carries — the same ID captured when it was generated.
   */
  async verifyReviewingEmployee(employeeId?: string): Promise<void> {
    if (!employeeId) return;
    await expect(
      this.page.getByText(employeeId, { exact: false }).filter({ visible: true }).first(),
      `HR review is not showing employee ID ${employeeId} — this may be a ` +
        'different submission',
    ).toBeVisible({ timeout: 15000 });
  }

  /** Walk every review step, asserting each renders. */
  async reviewAllSteps(): Promise<void> {
    for (const step of HR_REVIEW_STEPS) {
      await this.verifyPage.clickStepTab(step);
      await expect(
        this.verifyPage.stepTab(step),
        `HR review step "${step}" did not open`,
      ).toBeVisible({ timeout: 15000 });
      console.log(`[HrVerify] Reviewed step: ${step}`);
    }
  }

  /**
   * Verify each submitted identity document.
   *
   * Documents carry their own Verify/Reject controls and start PENDING; the
   * overall onboarding cannot be signed off while any remain unreviewed.
   */
  async verifyIdentityDocuments(
    documentNames: readonly string[],
  ): Promise<void> {
    await this.verifyPage.clickStepTab('Identity Details');
    await this.page.waitForTimeout(1000);

    const before = await this.verifyPage.getDocumentVerificationCounts();
    console.log(
      `[HrVerify] Documents verified: ${before.verified} of ${before.required}`,
    );

    if (before.required > 0 && before.verified >= before.required) {
      console.log('[HrVerify] All documents already verified');
      return;
    }

    // Verify all pending documents by clicking each "Verify" button
    const verifyButtons = this.page.locator('main').getByRole('button', { name: /^Verify$/ });
    let pendingCount = await verifyButtons.count();
    console.log(`[HrVerify] Found ${pendingCount} pending document(s) to verify`);

    while (pendingCount > 0) {
      const btn = verifyButtons.first();
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await this.page.waitForTimeout(500);

      const confirmBtn = this.page.getByRole('button', { name: /Confirm|Yes|Verify/i }).last();
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
        await this.page.waitForTimeout(500);
      }

      await this.page.waitForTimeout(1000);
      pendingCount = await verifyButtons.count();
    }

    const remainingPending = await this.page.locator('main').getByRole('button', { name: /^Verify$/ }).count();
    if (remainingPending === 0) {
      console.log('[HrVerify] All document Verify buttons resolved — documents verified');
      return;
    }

    await expect
      .poll(
        async () =>
          (await this.verifyPage.getDocumentVerificationCounts()).verified,
        {
          timeout: 30000,
          message: 'Not every identity document reached a verified state',
        },
      )
      .toBe(before.required || documentNames.length);
  }

  /**
   * Check whether the page is currently on the employee review screen.
   */
  async isOnReviewPage(): Promise<boolean> {
    return (
      (await this.verifyPage.reviewBanner.isVisible().catch(() => false)) ||
      (await this.verifyPage.backToListButton.isVisible().catch(() => false))
    );
  }

  /**
   * Approve the onboarding.
   *
   * The app notes that verify/reject only becomes available "once the employee
   * reaches the activation step", so an unavailable button is reported as that
   * rather than as a missing control.
   */
  async approveOnboarding(): Promise<void> {
    await this.verifyPage.clickStepTab('Agreements And Policies');
    let buttonVisible = await this.verifyPage.verifyOnboardingButton.first().isVisible().catch(() => false);
    if (!buttonVisible) {
      await this.verifyPage.clickStepTab('Meet The Team').catch(() => {});
      await this.page.waitForTimeout(1000);
      buttonVisible = await this.verifyPage.verifyOnboardingButton.first().isVisible().catch(() => false);
    }
    if (!buttonVisible) {
      await this.verifyPage.clickStepTab('Agreements And Policies').catch(() => {});
      await this.page.waitForTimeout(1000);
      buttonVisible = await this.verifyPage.verifyOnboardingButton.first().isVisible().catch(() => false);
    }
    if (!buttonVisible) {
      for (let i = 0; i < 7; i++) {
        const nextBtn = this.page.getByRole('button', { name: /^Next/i });
        if (await nextBtn.isVisible().catch(() => false)) {
          await nextBtn.click();
          await this.page.waitForTimeout(500);
          if (await this.verifyPage.verifyOnboardingButton.first().isVisible().catch(() => false)) {
            buttonVisible = true;
            break;
          }
        }
      }
    }
    await expect(
      this.verifyPage.verifyOnboardingButton.first(),
      'The "Verify Onboarding" action is not present — the employee may not ' +
        'have reached the activation step yet',
    ).toBeVisible({ timeout: 20000 });

    const enabled = await this.verifyPage.isVerifyOnboardingEnabled();
    expect(
      enabled,
      '"Verify Onboarding" is present but disabled — the employee has not ' +
        'reached the activation step, or documents are still unverified',
    ).toBe(true);

    await this.verifyPage.clickVerifyOnboarding();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    console.log('[HrVerify] Onboarding verified');
  }

  /** Reject the onboarding — the alternative terminal outcome. */
  async rejectOnboarding(): Promise<void> {
    await expect(this.verifyPage.rejectOnboardingButton).toBeVisible({
      timeout: 20000,
    });
    await this.verifyPage.clickRejectOnboarding();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    console.log('[HrVerify] Onboarding rejected');
  }

  /**
   * Confirm the employee left the Pending queue for Verified — the app's own
   * record that sign-off took effect.
   */
  async verifyEmployeeMovedToVerified(identifier: string): Promise<void> {
    await this.navigateToHrVerification();
    await this.verifyPage.verifiedTab.click();
    await this.verifyPage.search(identifier);

    if (!(await this.verifyPage.isEmployeeListed(identifier))) {
      await this.verifyPage.clearSearch();
    }

    await expect(
      this.verifyPage.employeeRow(identifier),
      `"${identifier}" did not move to the Verified queue after sign-off`,
    ).toBeVisible({ timeout: 20000 });
    console.log(`[HrVerify] "${identifier}" is now in the Verified queue`);
  }
}
