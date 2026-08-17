import { expect, Locator, Page } from '@playwright/test';

/**
 * CompanySettingsPage — the Company Settings / Company Details landing page a
 * trial admin reaches after their first successful login.
 *
 * Playwright equivalent of the Selenium `CompanySettingsPage.test_companypagecheck()`,
 * which asserted the text "Company Settings".
 *
 * Deliberately separate from `@pages/GlobalSettingsPage` (`SettingsPage`):
 * that class drives the provisioned HRM tenant's settings area, reached by
 * navigating the Global Settings dropdown, and owns the whole edit/save form.
 * This one only verifies the post-login landing page on the trial portal.
 */
export class CompanySettingsPage {
  private readonly page: Page;

  /** "Company Settings" entry in the settings sidebar */
  private readonly companySettingsNavItem: Locator;

  /** "Company Details" page heading */
  private readonly companyDetailsHeading: Locator;

  /** The company details form */
  private readonly companyDetailsForm: Locator;

  /** Company Name input */
  private readonly companyNameInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.companySettingsNavItem = page
      .getByText('Company Settings', { exact: false })
      .first();
    this.companyDetailsHeading = page
      .getByRole('heading', { name: /company details/i })
      .or(page.getByTestId('company_details_text'))
      .first();
    this.companyDetailsForm = page.getByTestId('company-details-form');
    this.companyNameInput = page.getByTestId('company-name-input-field');
  }

  /**
   * Verify the user landed on the Company Settings page.
   *
   * Checks the real page rather than merely "no error": the URL, the
   * "Company Settings" navigation entry the Selenium test asserted on, and
   * the Company Details form itself.
   */
  async verifyCompanySettingsPage(): Promise<void> {
    await this.page.waitForURL(/\/company-details/, { timeout: 60000 });
    await expect(this.companySettingsNavItem).toBeVisible();
    await expect(this.companyDetailsHeading).toBeVisible();
    await expect(this.companyDetailsForm).toBeVisible();
  }

  /** Whether the Company Settings page is currently displayed */
  async isCompanySettingsPageDisplayed(): Promise<boolean> {
    return this.companyDetailsForm.isVisible().catch(() => false);
  }

  /** Read the pre-filled company name */
  async getCompanyName(): Promise<string> {
    return this.companyNameInput.inputValue();
  }
}
