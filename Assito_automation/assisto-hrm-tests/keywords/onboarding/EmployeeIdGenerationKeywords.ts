import { Page, expect } from '@playwright/test';
import { EmployeeIdGenerationPage } from '@pages/onboarding/EmployeeIdGenerationPage';
import { navigateToOnboardingTab } from '@utils/onboardingNavigation';

/**
 * EmployeeIdGenerationKeywords drives Onboarding → Employee IDs.
 *
 * The Employee ID is always read back from the UI after generation — the
 * suite never fabricates one, since downstream steps (IT provisioning, HR
 * verification) must operate on the identifier the app actually issued.
 */
export class EmployeeIdGenerationKeywords {
  private readonly page: Page;
  private readonly idPage: EmployeeIdGenerationPage;

  constructor(page: Page) {
    this.page = page;
    this.idPage = new EmployeeIdGenerationPage(page);
  }

  async navigateToEmployeeIds(): Promise<void> {
    await navigateToOnboardingTab(this.page, 'Employee IDs', 'Employee ID Generator');
    await this.idPage.heading.waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyGeneratorVisible(): Promise<void> {
    await expect(this.idPage.heading).toBeVisible({ timeout: 15000 });
    await expect(this.idPage.batchGenerationHeading).toBeVisible();
  }

  /**
   * Asserts the configured ID format rather than selecting one.
   *
   * The builder is explicitly read-only ("Configured format — read-only … To
   * change this format, contact your Admin"), so choosing a different
   * formatter is not an action available to this role.
   */
  async verifyConfiguredFormatScope(expectedScope?: string): Promise<void> {
    await expect(this.idPage.formatScopeReadOnlyNote).toBeVisible();
    if (expectedScope) {
      await this.idPage.selectFormatScope(expectedScope);
    }
    await expect
      .poll(async () => await this.idPage.getFormatScope(), {
        timeout: 10000,
        message: 'Employee ID format scope was not populated',
      })
      .not.toBe('');
    const scope = await this.idPage.getFormatScope();
    console.log(`[Onboarding] Employee ID format scope: "${scope}"`);
    if (expectedScope) {
      expect(scope.toLowerCase()).toContain(expectedScope.toLowerCase());
    } else {
      expect(scope).toBeTruthy();
    }
  }

  /**
   * The Employee ID for a candidate, generating one only if they do not have
   * one yet.
   *
   * ID generation is one-way, exactly like Temporary Registration: once issued
   * the candidate leaves the Pending tab for good. Insisting on generating
   * therefore breaks every re-run against the same employee, so an existing ID
   * is read and returned instead.
   */
  async ensureEmployeeId(candidateName: string): Promise<string> {
    await this.idPage.clickCompletedTab();
    await this.idPage.searchCandidate(candidateName);
    const existing = await this.idPage.getGeneratedEmployeeId(candidateName);

    if (existing) {
      console.log(
        `[Onboarding] Employee ID already issued for "${candidateName}": ${existing}`,
      );
      return existing;
    }

    await this.verifyCandidatePending(candidateName);
    return await this.generateEmployeeId(candidateName);
  }

  async verifyCandidatePending(candidateName: string): Promise<void> {
    await this.idPage.clickPendingTab();
    await this.idPage.searchCandidate(candidateName);
    await expect(
      this.idPage.candidateCard(candidateName),
      `Candidate "${candidateName}" is not pending Employee ID generation`,
    ).toBeVisible({ timeout: 15000 });
  }

  /**
   * Selects the candidate, generates the ID, and returns the value the app
   * issued.
   */
  async generateEmployeeId(candidateName: string): Promise<string> {
    await this.idPage.selectCandidate(candidateName);

    await expect(
      this.idPage.generateIdsButton,
      'Generate IDs stayed disabled after selecting the candidate',
    ).toBeEnabled({ timeout: 10000 });

    await this.idPage.clickGenerateIds();
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // Once issued, the candidate LEAVES the Pending tab for Completed — the
    // Pending card either disappears or still reads "Not generated", so the ID
    // has to be read from Completed. Polling Pending here reported "never
    // issued" for an ID the app had in fact created.
    await this.idPage.clickCompletedTab();
    await this.idPage.searchCandidate(candidateName);

    await expect
      .poll(
        async () => await this.idPage.getGeneratedEmployeeId(candidateName),
        {
          timeout: 30000,
          message:
            `Employee ID was never issued for "${candidateName}" — not found ` +
            'on the Completed tab either',
        },
      )
      .not.toBe('');

    const employeeId = await this.idPage.getGeneratedEmployeeId(candidateName);
    console.log(`[Onboarding] Employee ID generated: ${employeeId}`);
    return employeeId;
  }

  async verifyEmployeeIdGenerated(
    candidateName: string,
    employeeId: string,
  ): Promise<void> {
    expect(employeeId, 'No Employee ID was captured from the UI').not.toBe('');
    const onCard = await this.idPage.getGeneratedEmployeeId(candidateName);
    expect(onCard).toBe(employeeId);
  }
}
