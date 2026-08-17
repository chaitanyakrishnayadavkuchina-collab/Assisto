import { expect, Locator, Page } from '@playwright/test';
import {
  generateCompanyName,
  generateDomainName,
  generateFullName,
  generatePhoneNumber,
  generateRegistrationPassword,
  RegistrationTestData,
} from '@utils/testDataGenerator';
import {
  createRegistrationMailbox,
  generateTempEmail,
  randomEmail,
  RegistrationMailbox,
} from '@utils/mailGrabber';

/**
 * Validation messages surfaced by the registration form. Kept next to the
 * locators so the expected copy lives in exactly one place.
 */
export const REGISTRATION_MESSAGES = {
  invalidEmail: 'Please Enter a Valid Email ID',
  mandatoryEmail: 'Email ID Field Is Mandatory, Please Enter Your Email ID',
  mandatoryDomain: 'Domain Name is Mandatory, Please enter Domain Name',
  invalidDomain: 'Domain name cannot have special characters',
  existingDomain: 'Domain name already exist. Please login from here',
  mandatoryCompanyName:
    'Company Name is Mandatory, Please Enter Your Company Name',
  invalidCompanyName: 'Please Enter Valid Company Name',
  mandatoryFullName: 'Full Name is Mandatory, Please Enter Your Full Name',
  invalidFullName:
    'Full Name should Contain Alphabets only. (Min 3 Characters and Max 50 Characters)',
  mandatoryPhoneNumber: 'Phone Number is Mandatory, Please enter phone number',
  invalidPhoneNumber: 'Please Enter Valid Phone Number',
  mandatoryPassword: 'Password Field is Mandatory,Please Enter your Password',
  successEmail:
    'Please click on the verification link in the email to begin your trial.',
} as const;

/**
 * RegisterPage encapsulates the self-service registration ("Start Free
 * Trial") flow: email capture, company details, email verification and
 * password set-up.
 *
 * Playwright equivalent of the Selenium `RegisterPage` page class. Generated
 * values are held on {@link RegisterPage.data} for the lifetime of the test
 * instead of being written back into a config file.
 */
export class RegisterPage {
  private readonly page: Page;

  /** Values generated during the run (email, domain, password, token, ...) */
  readonly data: RegistrationTestData;

  /** Mailbox the verification email is delivered to (set by generateUsername) */
  private mailbox: RegistrationMailbox | null = null;

  // ----- Action elements -----
  private readonly startFreeTrialButton: Locator;
  private readonly emailField: Locator;
  private readonly continueButton: Locator;
  private readonly domainNameField: Locator;
  private readonly fullNameField: Locator;
  private readonly companyNameField: Locator;
  private readonly phoneNumberField: Locator;
  private readonly dialCodeSelect: Locator;
  private readonly consentCheckbox: Locator;
  private readonly registerButton: Locator;
  private readonly newPasswordField: Locator;
  private readonly reTypePasswordField: Locator;
  private readonly submitButton: Locator;
  private readonly assistoBranding: Locator;

  constructor(page: Page) {
    this.page = page;
    this.data = { email: '' };

    // The portal exposes data-testid on every control of this flow, so
    // getByTestId is the primary strategy; role/id fallbacks cover the older
    // build the Selenium suite targeted.
    this.startFreeTrialButton = page
      .getByTestId('start-free-trial-btn')
      .or(page.getByRole('button', { name: /start free trial/i }))
      .first();

    this.emailField = page
      .getByTestId('emailID')
      .or(page.getByPlaceholder(/enter your email id/i))
      .first();

    this.continueButton = page
      .getByTestId('continueBtn')
      .or(page.getByRole('button', { name: /^\s*continue\s*$/i }))
      .first();

    this.domainNameField = page
      .getByTestId('domainName')
      .or(page.locator('#domainName'))
      .first();
    this.fullNameField = page
      .getByTestId('fullName')
      .or(page.locator('#fullName'))
      .first();
    this.companyNameField = page
      .getByTestId('companyName')
      .or(page.locator('#companyName'))
      .first();
    this.phoneNumberField = page
      .getByTestId('phone')
      .or(page.locator('#phone'))
      .first();
    this.dialCodeSelect = page
      .getByTestId('dialCode')
      .or(page.locator('#dialCode'))
      .first();
    this.consentCheckbox = page
      .getByTestId('consent-checkbox')
      .or(page.locator('#consent'))
      .first();

    // "Register" carries data-testid="submit" on the registration form.
    this.registerButton = page
      .getByTestId('submit')
      .or(page.getByRole('button', { name: /^\s*register\s*$/i }))
      .first();

    this.newPasswordField = page
      .locator('#newPassword')
      .or(page.getByPlaceholder(/new password/i))
      .first();
    this.reTypePasswordField = page
      .locator('#reTypePassword')
      .or(page.getByPlaceholder(/re-?type|confirm/i))
      .first();
    this.submitButton = page
      .getByRole('button', { name: /^\s*submit\s*$/i })
      .first();
    this.assistoBranding = page.getByText(/assisto/i).first();
  }

  /** Locator for a validation/notification message by its exact copy */
  private message(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  /** Assert a validation message is visible on the page */
  private async expectMessage(text: string, timeout?: number): Promise<void> {
    await expect(this.message(text)).toBeVisible({ timeout });
  }

  // ============================================================
  // Navigation & actions
  // ============================================================

  /** Open the page that hosts the "Start Free Trial" call to action */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /** Click the "Start Free Trial" button */
  async clickStartFreeButton(): Promise<void> {
    await this.startFreeTrialButton.click();
  }

  /** Type an explicit email address into the email field */
  async enterUsername(email: string): Promise<void> {
    await this.emailField.fill(email);
    this.data.email = email;
  }

  /**
   * Create a fresh disposable mailbox, remember it on {@link data} and type it
   * into the email field.
   * @returns the generated address
   */
  async generateUsername(): Promise<string> {
    this.mailbox = await createRegistrationMailbox();
    await this.enterUsername(this.mailbox.email);
    return this.mailbox.email;
  }

  /**
   * Create a second disposable mailbox for negative/duplicate scenarios,
   * without overwriting the primary registration email.
   * @returns the generated address
   */
  async generateDummyUsername(): Promise<string> {
    const email = randomEmail();
    await generateTempEmail(email);
    await this.emailField.fill(email);
    return email;
  }

  /** Click the "Continue" button after the email step */
  async clickContinueButton(): Promise<void> {
    await this.continueButton.click();
  }

  /** Generate and enter a random domain name */
  async enterDomainName(): Promise<string> {
    const domain = generateDomainName();
    await this.domainNameField.fill(domain);
    this.data.domain = domain;
    return domain;
  }

  /** Re-enter the domain name generated earlier in this test */
  async getDomain(): Promise<void> {
    if (!this.data.domain) {
      throw new Error(
        '[RegisterPage] No domain generated yet — call enterDomainName() first',
      );
    }
    await this.domainNameField.fill(this.data.domain);
  }

  /** Generate and enter a random full name */
  async enterFullName(): Promise<string> {
    const fullName = generateFullName();
    await this.fullNameField.fill(fullName);
    this.data.fullName = fullName;
    return fullName;
  }

  /** Generate and enter a random company name */
  async enterCompanyName(): Promise<string> {
    const companyName = generateCompanyName();
    await this.companyNameField.fill(companyName);
    this.data.companyName = companyName;
    return companyName;
  }

  /** Generate and enter a random 10-digit phone number */
  async enterPhoneNumber(): Promise<string> {
    const phoneNumber = generatePhoneNumber();
    await this.phoneNumberField.fill(phoneNumber);
    this.data.phoneNumber = phoneNumber;
    return phoneNumber;
  }

  /**
   * Select a country from the dial-code dropdown.
   * @param label - Visible option label, e.g. "India (+91)"
   */
  async selectDialCode(label: string = 'India (+91)'): Promise<void> {
    await this.dialCodeSelect.selectOption({ label });
  }

  /** Tick the consent checkbox */
  async checkConsentCheckbox(): Promise<void> {
    await this.consentCheckbox.check({ force: true });
  }

  /** Click the "Register" button */
  async clickRegisterButton(): Promise<void> {
    await this.registerButton.scrollIntoViewIfNeeded();
    await this.registerButton.click();
  }

  /**
   * Wait for the registration email, extract the verification link and store
   * protocol / domain / token / URL on {@link data}.
   * @returns the verification URL
   */
  async storeEmail(timeout: number = 120000): Promise<string> {
    if (!this.mailbox) {
      throw new Error(
        '[RegisterPage] No mailbox created — call generateUsername() first',
      );
    }

    const link = await this.mailbox.waitForVerificationLink(timeout);

    this.data.verificationLink = link.url;
    this.data.verificationDomain = link.domain;
    this.data.token = link.token;
    return link.url;
  }

  /** Navigate to the verification link captured by {@link storeEmail} */
  async openLink(): Promise<void> {
    if (!this.data.verificationLink) {
      throw new Error(
        '[RegisterPage] No verification link captured — call storeEmail() first',
      );
    }
    await this.page.goto(this.data.verificationLink, {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Generate a password (1 uppercase + 10 lowercase + "@" + 3 digits), store
   * it on {@link data} and type it into the "New Password" field.
   */
  async generateNewPassword(): Promise<string> {
    const password = generateRegistrationPassword();
    await this.newPasswordField.fill(password);
    this.data.password = password;
    return password;
  }

  /** Retype the password generated by {@link generateNewPassword} */
  async reEnterPassword(): Promise<void> {
    if (!this.data.password) {
      throw new Error(
        '[RegisterPage] No password generated — call generateNewPassword() first',
      );
    }
    await this.reTypePasswordField.fill(this.data.password);
  }

  /** Click the "Submit" button on the set-password page */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Clear the email field (negative scenarios) */
  async clearEmail(): Promise<void> {
    await this.emailField.clear();
  }

  /** Whether the "Submit" button is disabled */
  async isSubmitDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  // ============================================================
  // Validations
  // ============================================================

  /** Assert the "domain already exists" error is shown */
  async validateExistingDomainError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.existingDomain);
  }

  /** Assert the mandatory-domain error is shown */
  async validateDomainRequiredError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.mandatoryDomain);
  }

  /** Assert the special-characters domain error is shown */
  async validateInvalidDomainError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.invalidDomain);
  }

  /** Assert the mandatory-company-name error is shown */
  async validateCompanyNameError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.mandatoryCompanyName);
  }

  /** Assert the invalid-company-name error is shown */
  async validateInvalidCompanyNameError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.invalidCompanyName);
  }

  /** Assert the invalid-email error is shown */
  async validateEmailError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.invalidEmail);
  }

  /** Assert the mandatory-email error is shown */
  async validateMandatoryEmailError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.mandatoryEmail);
  }

  /** Assert the mandatory-full-name error is shown */
  async validateFullNameError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.mandatoryFullName);
  }

  /** Assert the alphabets-only full-name error is shown */
  async validateInvalidFullNameError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.invalidFullName);
  }

  /** Assert the mandatory-phone-number error is shown */
  async validatePhoneNumberError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.mandatoryPhoneNumber);
  }

  /** Assert the invalid-phone-number error is shown */
  async validateInvalidPhoneNumberError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.invalidPhoneNumber);
  }

  /** Assert the mandatory-password error is shown */
  async validatePasswordError(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.mandatoryPassword);
  }

  /**
   * Assert the "check your email to begin your trial" confirmation is shown.
   * Tenant provisioning runs behind this call and took ~8s in practice, so the
   * assertion gets more headroom than the 5s expect default.
   */
  async validateSuccessEmail(): Promise<void> {
    await this.expectMessage(REGISTRATION_MESSAGES.successEmail, 60000);
  }

  /** Assert the verification page rendered (Assisto branding is present) */
  async verifyEmailPage(): Promise<void> {
    await expect(this.assistoBranding).toBeVisible();
  }
}
