import { type Page, expect } from '@playwright/test';
import { RegisterPage } from '@pages/RegisterPage';
import { RegistrationTestData } from '@utils/testDataGenerator';

/**
 * RegisterKeywords provides high-level business actions for the self-service
 * registration ("Start Free Trial") flow, combining the atomic RegisterPage
 * interactions into readable steps.
 */
export class RegisterKeywords {
  private readonly page: Page;
  private readonly registerPage: RegisterPage;

  constructor(page: Page) {
    this.page = page;
    this.registerPage = new RegisterPage(page);
  }

  /** The values generated during this run */
  get data(): RegistrationTestData {
    return this.registerPage.data;
  }

  /** The underlying page object, for step-level assertions in specs */
  get page_(): RegisterPage {
    return this.registerPage;
  }

  /** Open the portal page hosting the "Start Free Trial" CTA */
  async openRegistrationEntryPoint(url: string): Promise<void> {
    await this.registerPage.goto(url);
  }

  /**
   * Start the trial, create a disposable mailbox, submit the email.
   * @returns the generated email address
   */
  async startFreeTrialWithNewEmail(): Promise<string> {
    await this.registerPage.clickStartFreeButton();
    const email = await this.registerPage.generateUsername();
    await this.registerPage.clickContinueButton();
    return email;
  }

  /**
   * Fill the company details form and accept consent.
   *
   * Dial code and phone number are included because the current portal keeps
   * the Register button disabled until every mandatory field is filled — the
   * Selenium suite skipped them against an older build that did not.
   */
  async fillCompanyDetails(): Promise<void> {
    await this.registerPage.enterDomainName();
    await this.registerPage.enterFullName();
    await this.registerPage.enterCompanyName();
    await this.registerPage.selectDialCode();
    await this.registerPage.enterPhoneNumber();
    await this.registerPage.checkConsentCheckbox();
  }

  /**
   * Submit the registration form, confirm the "check your email" notice and
   * pull the verification link out of the delivered email.
   * @returns the verification URL
   */
  async submitRegistrationAndCaptureVerificationLink(): Promise<string> {
    await this.registerPage.clickRegisterButton();
    await this.registerPage.validateSuccessEmail();
    return this.registerPage.storeEmail();
  }

  /** Open the verification link and confirm the set-password page rendered */
  async openVerificationLink(): Promise<void> {
    await this.registerPage.openLink();
    await this.registerPage.verifyEmailPage();
  }

  /**
   * Generate a password, enter it twice and submit.
   * @returns the generated password
   */
  async setNewPassword(): Promise<string> {
    const password = await this.registerPage.generateNewPassword();
    await this.registerPage.reEnterPassword();
    await this.registerPage.clickSubmit();
    return password;
  }

  /**
   * Verify registration completed: the app leaves the /verify page once the
   * password is accepted (typically landing on login or the new tenant home).
   */
  async verifyRegistrationCompleted(): Promise<void> {
    await this.page.waitForURL((url) => !url.pathname.includes('/verify'), {
      timeout: 30000,
    });
    expect(this.page.url()).not.toContain('/verify');
  }
}
