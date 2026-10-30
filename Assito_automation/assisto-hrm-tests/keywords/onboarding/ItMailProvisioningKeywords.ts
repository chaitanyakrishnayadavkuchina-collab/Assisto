import { Page, expect } from '@playwright/test';
import { ItMailProvisioningPage } from '@pages/onboarding/ItMailProvisioningPage';
import { navigateToOnboardingTab } from '@utils/onboardingNavigation';

/**
 * ItMailProvisioningKeywords drives Onboarding → Itmail Provisioning, the IT
 * role's part of employee onboarding: assigning an organisation mail ID and a
 * temporary password, then sharing the credentials with the joiner.
 */
export class ItMailProvisioningKeywords {
  private readonly page: Page;
  private readonly mailPage: ItMailProvisioningPage;

  constructor(page: Page) {
    this.page = page;
    this.mailPage = new ItMailProvisioningPage(page);
  }

  async navigateToItMailProvisioning(): Promise<void> {
    await navigateToOnboardingTab(
      this.page,
      'Itmail Provisioning',
      'Organisation Mail Provisioning',
    );
    await this.mailPage.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyProvisioningDashboardVisible(): Promise<void> {
    await expect(this.mailPage.heading).toBeVisible({ timeout: 15000 });
  }

  /**
   * The employee's organisation mail, provisioning it only if IT has not
   * already done so.
   *
   * Provisioning is one-way — once done the employee moves from Pending
   * Request to Completed Request permanently — so a re-run must reuse the
   * existing address rather than insist on assigning one.
   *
   * The domain does not matter: Share delivers the joining mail to the
   * employee PERSONAL address, so an org mail on any domain is usable.
   *
   * @param preferredMail Address to assign when none exists yet.
   */
  async ensureOrganisationMail(
    identifier: string,
    preferredMail: string,
    temporaryPassword: string,
  ): Promise<string> {
    await this.mailPage.clickCompletedRequestTab();
    const alreadyListed = await this.locateEmployee(identifier);
    if (alreadyListed) {
      const existing = await this.mailPage.getOrganisationMail(identifier);
      console.log(
        `[Onboarding] Organisation mail already provisioned for "${identifier}": ${existing}`,
      );

      return existing;
    }

    await this.verifyEmployeePending(identifier);
    await this.provisionOrganisationMail(
      identifier,
      preferredMail,
      temporaryPassword,
    );
    await this.verifyProvisioningSucceeded();
    return preferredMail;
  }

  /**
   * Locate an employee on the current tab, searching first and falling back to
   * the unfiltered list.
   *
   * This grid's search does NOT match on full name — filtering by
   * "Vnbjqv Qlwtwp" returns zero rows for an employee who is plainly listed —
   * so a failed search must not be read as "not in the queue". Clearing it and
   * matching the row directly is what actually works.
   */
  private async locateEmployee(identifier: string): Promise<boolean> {
    await this.mailPage.searchCandidate(identifier);
    if (await this.mailPage.isEmployeeListed(identifier)) return true;

    console.log(
      `[ItMail] Search returned no match for "${identifier}" — clearing the ` +
        'filter and matching against the full list',
    );
    await this.mailPage.clearSearch();
    return await this.mailPage.isEmployeeListed(identifier);
  }

  async verifyEmployeePending(identifier: string): Promise<void> {
    await this.mailPage.clickPendingRequestTab();
    const found = await this.locateEmployee(identifier);
    expect(
      found,
      `"${identifier}" is not awaiting organisation mail provisioning`,
    ).toBe(true);
  }

  /**
   * Assigns the organisation mail and temporary password.
   *
   * Sets the organisation mail ID and temporary password. After Finish the
   * request moves from Pending Request to Completed Request, where selecting
   * the row and clicking Share sends the credentials to the joiner.
   */
  async provisionOrganisationMail(
    identifier: string,
    organisationMail: string,
    temporaryPassword: string,
  ): Promise<void> {
    await this.mailPage.clickEnterMail(identifier);
    await expect(this.mailPage.assignMailHeading).toBeVisible({ timeout: 15000 });

    // Confirms the modal opened for the SAME person before anything is typed.
    const modalText = (await this.mailPage.assignMailModal.textContent()) ?? '';
    console.log(`[Onboarding] Assign Organisation Mail opened for: ${identifier}`);
    expect(modalText).toContain(identifier);

    await this.mailPage.fillOrganisationMail(organisationMail);
    await this.mailPage.fillTemporaryPassword(temporaryPassword);
    await this.mailPage.clickFinish();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    console.log(
      `[Onboarding] Organisation mail provisioned: ${organisationMail} (temp password set)`,
    );
  }

  async verifyProvisioningSucceeded(): Promise<void> {
    await expect(this.mailPage.assignMailHeading).toBeHidden({ timeout: 20000 });
  }

  /** The employee moves from Pending Request to Completed Request once provisioned. */
  async verifyEmployeeCompleted(identifier: string): Promise<void> {
    await this.mailPage.clickCompletedRequestTab();
    const found = await this.locateEmployee(identifier);
    expect(
      found,
      `"${identifier}" did not move to Completed Request after provisioning`,
    ).toBe(true);
  }

  /** Reads back the organisation mail the app recorded, to confirm what was saved. */
  async verifyOrganisationMailRecorded(
    identifier: string,
    expectedMail: string,
  ): Promise<void> {
    const recorded = await this.mailPage.getOrganisationMail(identifier);
    console.log(`[Onboarding] Organisation mail on record: ${recorded}`);
    // toContain, not toBe: the grid concatenates adjacent cells, so a stray
    // date fragment can still cling to the value even after trimming.
    expect(
      recorded.toLowerCase(),
      `Organisation mail on record ("${recorded}") does not match what was assigned`,
    ).toContain(expectedMail.toLowerCase());
  }

  /** Step 5: select the employee on Completed Request and share the credentials. */
  async shareCredentialsToCandidate(identifier: string): Promise<void> {
    await this.mailPage.selectEmployeeRow(identifier);
    await expect(this.mailPage.shareButton).toBeVisible({ timeout: 10000 });
    await this.mailPage.clickShare();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    console.log(`[Onboarding] Credentials shared to: ${identifier}`);
  }

  /**
   * Confirm the share went through.
   *
   * The row selection does NOT clear after sharing — the app leaves "N
   * selected" in place — so that cannot be the signal. A success toast is
   * checked when the app raises one, but the definitive proof is the joining
   * email landing in the employee's personal mailbox, which the next step
   * waits for.
   */
  async verifyShareSucceeded(): Promise<void> {
    const toast = this.page
      .getByText(/shared|success/i)
      .first();
    const toastShown = await toast
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    console.log(
      toastShown
        ? `[ItMail] Share confirmation: "${(await toast.textContent())?.trim()}"`
        : '[ItMail] No share confirmation toast — the joining email is the real check',
    );
  }
}
