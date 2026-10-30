import { type Page, type Locator } from '@playwright/test';

/**
 * ItMailProvisioningPage covers Onboarding → Itmail Provisioning
 * ("Organisation Mail Provisioning"), performed by IT:
 *   - KPI tiles: Total Requests / Pending / Provisioned
 *   - Pending Request grid → "Enter Mail" → Assign Organisation Mail modal
 *   - Completed Request grid → row selection → Share
 *
 * FLOW: Pending Request → "Enter Mail" → set organisation mail + temporary
 * password → Finish. The request then moves to Completed Request, where the
 * row is selected and "Share" sends the credentials to the employee PERSONAL
 * mail — the address captured during Pre-Onboarding, not the new org one.
 */
export class ItMailProvisioningPage {
  private readonly page: Page;

  readonly heading: Locator;
  readonly totalRequestsTile: Locator;
  readonly pendingTile: Locator;
  readonly provisionedTile: Locator;

  readonly pendingRequestTab: Locator;
  readonly completedRequestTab: Locator;
  readonly searchCandidatesInput: Locator;
  readonly rows: Locator;

  // Assign Organisation Mail modal
  readonly assignMailModal: Locator;
  readonly assignMailHeading: Locator;
  readonly modalFullName: Locator;
  readonly modalPersonalMail: Locator;
  readonly organisationMailInput: Locator;
  readonly temporaryPasswordInput: Locator;
  readonly finishButton: Locator;
  readonly closeButton: Locator;

  // Completed Request actions
  readonly selectAllCheckbox: Locator;
  readonly shareButton: Locator;
  readonly selectedCountText: Locator;
  readonly clearSelectionButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Screen titles render as plain text in this app, not heading roles.
    this.heading = page
      .getByText('Organisation Mail Provisioning', { exact: true })
      .first();
    this.totalRequestsTile = page
      .locator('div')
      .filter({ hasText: /^TOTAL REQUESTS/ })
      .first();
    this.pendingTile = page.locator('div').filter({ hasText: /^PENDING/ }).first();
    this.provisionedTile = page
      .locator('div')
      .filter({ hasText: /^PROVISIONED/ })
      .first();

    this.pendingRequestTab = page.getByRole('tab', { name: /Pending Request/ });
    this.completedRequestTab = page.getByRole('tab', { name: /Completed Request/ });
    // Regex, not a literal: the app renders a Unicode ellipsis (…) in these
    // placeholders, so an exact "..." string never matches.
    this.searchCandidatesInput = page.getByPlaceholder(/Search candidates/i);
    this.rows = page.getByRole('row');

    this.assignMailModal = page
      .getByRole('dialog')
      .filter({ hasText: 'Assign Organisation Mail' });
    this.assignMailHeading = page.getByText('Assign Organisation Mail', {
      exact: true,
    });
    this.modalFullName = page
      .locator('div')
      .filter({ hasText: /^Full name/ })
      .first();
    this.modalPersonalMail = page
      .locator('div')
      .filter({ hasText: /^Personal mail/ })
      .first();
    this.organisationMailInput = page.getByPlaceholder('Enter organisation email');
    this.temporaryPasswordInput = page.getByPlaceholder('Enter temporary password');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.closeButton = page.getByRole('button', { name: 'Close' });

    this.selectAllCheckbox = page.getByRole('checkbox').first();
    this.shareButton = page.getByRole('button', { name: 'Share', exact: true });
    this.selectedCountText = page.getByText(/\d+ selected/);
    this.clearSelectionButton = page.getByRole('button', { name: 'Clear selection' });
  }

  async isHeadingVisible(): Promise<boolean> {
    return await this.heading.isVisible().catch(() => false);
  }

  async clickPendingRequestTab(): Promise<void> {
    await this.pendingRequestTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async clickCompletedRequestTab(): Promise<void> {
    await this.completedRequestTab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async searchCandidate(text: string): Promise<void> {
    await this.searchCandidatesInput.fill(text);
    await this.page.waitForTimeout(800);
  }

  /** Empty the search box so the full list is shown again. */
  async clearSearch(): Promise<void> {
    const present = await this.searchCandidatesInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!present) return;
    await this.searchCandidatesInput.fill('');
    await this.page.waitForTimeout(800);
  }

  /** Grid row for an employee, matched on name or personal mail. */
  employeeRow(identifier: string): Locator {
    return this.rows.filter({ hasText: identifier }).first();
  }

  async isEmployeeListed(identifier: string): Promise<boolean> {
    return await this.employeeRow(identifier)
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  }

  async clickEnterMail(identifier: string): Promise<void> {
    await this.employeeRow(identifier)
      .getByRole('button', { name: 'Enter Mail' })
      .click();
  }

  // ==========================================
  //  ASSIGN ORGANISATION MAIL MODAL
  // ==========================================

  async isAssignMailModalVisible(): Promise<boolean> {
    return await this.assignMailHeading.isVisible().catch(() => false);
  }

  async fillOrganisationMail(email: string): Promise<void> {
    await this.organisationMailInput.fill(email);
  }

  async fillTemporaryPassword(password: string): Promise<void> {
    await this.temporaryPasswordInput.fill(password);
  }

  async clickFinish(): Promise<void> {
    await this.finishButton.click();
  }

  async clickClose(): Promise<void> {
    await this.closeButton.click();
  }

  // ==========================================
  //  COMPLETED REQUEST — SHARE TO CANDIDATE
  // ==========================================

  async selectEmployeeRow(identifier: string): Promise<void> {
    await this.employeeRow(identifier).getByRole('checkbox').check();
  }

  async isShareButtonVisible(): Promise<boolean> {
    return await this.shareButton.isVisible().catch(() => false);
  }

  async clickShare(): Promise<void> {
    await this.shareButton.click();
  }

  /** Organisation mail recorded against an employee on the Completed grid. */
  async getOrganisationMail(identifier: string): Promise<string> {
    const text = (await this.employeeRow(identifier).textContent()) ?? '';
    const matches = text.match(/[\w.+-]+@[\w.-]+\.\w+/g) ?? [];
    // Row order is: personal mail, then organisation mail.
    const raw = matches.length > 1 ? matches[1] : '';
    // Cells are concatenated without separators, so the joining date runs into
    // the address ("27-08-2026emp_x@mailsac.com"). Strip leading digits and
    // dashes — an email local part never starts with those here.
    return raw.replace(/^[\d-]+/, '');
  }
}
