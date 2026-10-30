import { type Page, type Locator } from '@playwright/test';

/** Review steps HR walks through, in order. */
export type HrVerificationStep =
  | 'Personal Profile'
  | 'Identity Details'
  | 'Employment And Education'
  | 'Statutory'
  | 'Agreements And Policies'
  | 'Induction'
  | 'Meet The Team';

/**
 * HrVerificationPage covers Onboarding → HR Verification ("Onboarding
 * Verification"): the Pending / Verified / Rejected queues, and the per-employee
 * review that walks the seven submitted steps before approving or rejecting.
 *
 * Two behaviours worth knowing:
 *  - The review is READ-ONLY. Every field is for inspection; the only actions
 *    are per-document Verify/Reject on Identity Details, and the overall
 *    Verify Onboarding / Reject in the footer.
 *  - The app states "Verify or reject once the employee reaches the activation
 *    step", so the overall action can legitimately be unavailable on an
 *    employee who has not got that far.
 */
export class HrVerificationPage {
  private readonly page: Page;

  // ===== Queue =====
  readonly heading: Locator;
  readonly totalJoinersTile: Locator;
  readonly pendingReviewTile: Locator;
  readonly verifiedTile: Locator;
  readonly rejectedTile: Locator;

  readonly pendingTab: Locator;
  readonly verifiedTab: Locator;
  readonly rejectedTab: Locator;
  readonly searchInput: Locator;
  readonly rows: Locator;

  // ===== Employee review =====
  readonly backToListButton: Locator;
  readonly reviewBanner: Locator;
  readonly employeeIdChip: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly verifyOnboardingButton: Locator;
  readonly rejectOnboardingButton: Locator;

  // Identity Details review
  readonly documentsVerifiedChip: Locator;
  readonly verificationSummary: Locator;

  constructor(page: Page) {
    this.page = page;

    // Screen titles render as plain text in this app, not heading roles.
    this.heading = page
      .getByText('Onboarding Verification', { exact: true })
      .first();
    this.totalJoinersTile = page
      .locator('div')
      .filter({ hasText: /^TOTAL JOINERS/ })
      .first();
    this.pendingReviewTile = page
      .locator('div')
      .filter({ hasText: /^PENDING REVIEW/ })
      .first();
    this.verifiedTile = page.locator('div').filter({ hasText: /^VERIFIED/ }).first();
    this.rejectedTile = page.locator('div').filter({ hasText: /^REJECTED/ }).first();

    this.pendingTab = page.getByRole('tab', { name: /Pending/ });
    this.verifiedTab = page.getByRole('tab', { name: /Verified/ });
    this.rejectedTab = page.getByRole('tab', { name: /Rejected/ });
    // Regex: the placeholder is truncated in the UI ("Search by name or em…").
    this.searchInput = page.getByPlaceholder(/Search by name/i);
    this.rows = page.getByRole('row');

    this.backToListButton = page.getByRole('button', { name: /Back to List/i });
    this.reviewBanner = page.getByText(/You are reviewing .* onboarding submission/i);
    this.employeeIdChip = page.getByText(/^[A-Z0-9]+(?:-[A-Z0-9]+){3,}$/);
    this.nextButton = page.getByRole('button', { name: /^Next/ });
    this.backButton = page.getByRole('button', { name: '^Back$' });
    this.verifyOnboardingButton = page.getByRole('button', {
      name: /Verify Onboarding|Verify & Approve|Approve Onboarding/i,
    });
    this.rejectOnboardingButton = page.getByRole('button', {
      name: /^Reject$/,
    });

    this.documentsVerifiedChip = page.getByText(/\d+\/\d+ verified/);
    this.verificationSummary = page
      .locator('div')
      .filter({ hasText: /^Document Verification Summary/ })
      .first();
  }

  // ==========================================
  //  QUEUE
  // ==========================================

  async isHeadingVisible(): Promise<boolean> {
    return await this.heading.isVisible().catch(() => false);
  }

  async clickPendingTab(): Promise<void> {
    await this.pendingTab.click();
  }

  async search(text: string): Promise<void> {
    const present = await this.searchInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!present) return;
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(800);
  }

  /** Empty the search box so the full queue is shown again. */
  async clearSearch(): Promise<void> {
    const present = await this.searchInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!present) return;
    await this.searchInput.fill('');
    await this.page.waitForTimeout(800);
  }

  employeeRow(identifier: string): Locator {
    return this.rows.filter({ hasText: identifier }).first();
  }

  async isEmployeeListed(identifier: string): Promise<boolean> {
    return await this.employeeRow(identifier)
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  }

  /**
   * Open an employee's submission via the Action column's eye icon.
   *
   * The icon carries no accessible name, so it is reached as the row's action
   * control rather than by role+name.
   */
  async openEmployeeReview(identifier: string): Promise<void> {
    const row = this.employeeRow(identifier);
    const eyeIcon = row.getByRole('button').last();
    await eyeIcon.click();
  }

  // ==========================================
  //  EMPLOYEE REVIEW
  // ==========================================

  /** A review step tab, e.g. "Identity Details". */
  stepTab(step: HrVerificationStep): Locator {
    return this.page.getByRole('button', { name: step }).last();
  }

  async clickStepTab(step: HrVerificationStep): Promise<void> {
    await this.stepTab(step).click();
    await this.page.waitForTimeout(500);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  /** Documents verified so far, from the "N/M verified" chip. */
  /** Documents verified so far, from Document Verification Summary or the "N/M verified" chip. */
  async getDocumentVerificationCounts(): Promise<{
    verified: number;
    required: number;
  }> {
    const summaryText = (await this.verificationSummary.textContent().catch(() => '')) ?? '';
    const vMatch = summaryText.match(/(\d+)\s*Verified/i);
    const pMatch = summaryText.match(/(\d+)\s*Pending/i);
    if (vMatch) {
      const verified = Number(vMatch[1]);
      const pending = pMatch ? Number(pMatch[1]) : 0;
      return { verified, required: verified + pending };
    }

    const text =
      (await this.documentsVerifiedChip.textContent().catch(() => '')) ?? '';
    const match = text.match(/(\d+)\/(\d+) verified/);
    return match
      ? { verified: Number(match[1]), required: Number(match[2]) }
      : { verified: 0, required: 0 };
  }

  /** The review block for one submitted document. */
  documentBlock(documentName: string): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(`^${documentName}`) })
      .filter({ has: this.page.getByRole('button', { name: /^Verify$/ }) })
      .last();
  }

  async verifyDocument(documentName: string): Promise<void> {
    await this.documentBlock(documentName)
      .getByRole('button', { name: /^Verify$/ })
      .click();
    const confirmBtn = this.page.getByRole('button', { name: /Confirm/i });
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
    }
  }

  async rejectDocument(documentName: string): Promise<void> {
    await this.documentBlock(documentName)
      .getByRole('button', { name: /^Reject$/ })
      .click();
  }

  async isVerifyOnboardingEnabled(): Promise<boolean> {
    return await this.verifyOnboardingButton.isEnabled().catch(() => false);
  }

  async clickVerifyOnboarding(): Promise<void> {
    await this.verifyOnboardingButton.click();
    const confirmBtn = this.page.getByRole('button', { name: /Confirm|Yes|Verify/i }).last();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
    }
  }

  async clickRejectOnboarding(): Promise<void> {
    await this.rejectOnboardingButton.click();
  }
}
