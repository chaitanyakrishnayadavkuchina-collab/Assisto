import { expect, Locator, Page } from '@playwright/test';

/**
 * Login validation messages.
 *
 * Every string here was read off the running application — none are invented.
 * Where the current build's copy differs from the Selenium suite's expected
 * text, the legacy string is recorded in the comment so the divergence is
 * traceable rather than silently dropped.
 */
export const LOGIN_MESSAGES = {
  /**
   * Shown under the Email field for a malformed address.
   * Selenium expected: "This Email ID is not Valid,Please Enter a Valid Email ID"
   * — that copy no longer exists in this build.
   */
  invalidEmail: 'Please enter a valid Email ID',

  /**
   * Toast shown for a wrong password or an unknown account. Resolves the
   * reference framework's empty `txt_invalidCredentialError` locator: the
   * API answers 401 {"message":"Invalid Credentials"} and the UI renders
   * "Invalid credentials".
   */
  invalidCredentials: 'Invalid credentials',

  /**
   * Mandatory-field copy from the Selenium suite. This build does NOT render
   * these messages — it keeps the Login button disabled until both fields are
   * valid instead (see `isLoginButtonDisabled`). Kept for traceability and for
   * environments still running the older build.
   */
  mandatoryEmail: 'Email ID Field Is Mandatory, Please Enter Your Email ID',
  mandatoryPassword: 'Password Field is Mandatory,Please Enter your Password',
} as const;

/**
 * LoginPage class encapsulates all locators and atomic UI actions
 * for the login page.
 */
export class LoginPage {
  private readonly page: Page;

  /** "Login to your account" heading */
  private readonly loginHeading: Locator;

  /** Email input field */
  private readonly emailField: Locator;

  /** Password input field */
  private readonly passwordField: Locator;

  /** Login button */
  private readonly loginButton: Locator;

  /** Remember me checkbox */
  private readonly rememberMeCheckbox: Locator;

  /** Forgot password link */
  private readonly forgotPasswordLink: Locator;

  /** Create one link */
  private readonly createOneLink: Locator;

  /** Error message element */
  private readonly errorMessage: Locator;

  /** Field error indicators */
  private readonly fieldError: Locator;

  /** Success message */
  private readonly successMessage: Locator;

  // ----- Trial-portal login (test.devassisto.com tenant build) -----
  // That build exposes data-testid on every control, so these are testid-first
  // with fallbacks to the `name` attributes the Selenium suite used.

  /** Email / Login ID input */
  private readonly usernameInput: Locator;

  /** Password input */
  private readonly passwordInput: Locator;

  /** Login button */
  private readonly loginSubmitButton: Locator;

  /** Inline "please enter a valid Email ID" error */
  private readonly invalidEmailError: Locator;

  /** Inline password error region */
  private readonly passwordErrorRegion: Locator;

  /** "Invalid credentials" toast */
  private readonly invalidCredentialsToast: Locator;

  /** First-login Privacy Policy consent checkbox */
  private readonly privacyConsentCheckbox: Locator;

  /** First-login Privacy Policy "Continue" button */
  private readonly privacyConsentButton: Locator;

  /** First-login plan cards */
  private readonly planCard: Locator;

  /** First-login "Get Started" button on the plan modal */
  private readonly planGetStartedButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page
      .getByTestId('login-email')
      .or(page.locator('input[name="email"]'))
      .first();
    this.passwordInput = page
      .getByTestId('login-password')
      .or(page.locator('input[name="password"]'))
      .first();
    this.loginSubmitButton = page
      .getByTestId('login-button')
      .or(page.getByRole('button', { name: /^\s*login\s*$/i }))
      .first();
    this.invalidEmailError = page
      .getByText(LOGIN_MESSAGES.invalidEmail, { exact: false })
      .first();
    this.passwordErrorRegion = page.getByTestId('password-error');
    this.invalidCredentialsToast = page
      .getByText(LOGIN_MESSAGES.invalidCredentials, { exact: false })
      .first();
    this.privacyConsentCheckbox = page.getByTestId('consent-checkbox');
    this.privacyConsentButton = page.getByTestId('consent-button');
    this.planCard = page.getByTestId('module-card');
    this.planGetStartedButton = page.getByTestId('save');

    // Use multiple strategies: h1 first, then text-based fallback
    this.loginHeading = page
      .locator('h1')
      .first()
      .or(page.getByText('Login to your account', { exact: true }).first());
    this.emailField = page
      .locator('#login-email')
      .or(page.getByTestId('login-email'))
      .or(page.getByRole('textbox', { name: /email/i }))
      .or(
        page.locator(
          'input[type="email"], input[name="email"], input[placeholder*="email" i]',
        ),
      )
      .first();
    this.passwordField = page
      .locator('#login-password')
      .or(page.getByTestId('login-password'))
      .or(
        page.locator(
          'input[type="password"], input[name="password"]',
        ),
      )
      .first();
    this.loginButton = page.getByRole('button', { name: 'Login' }).first();
    this.rememberMeCheckbox = page.getByRole('checkbox', {
      name: 'Remember me',
    });
    this.forgotPasswordLink = page
      .getByRole('button', { name: 'Forgot password?' })
      .first();
    this.createOneLink = page.getByRole('link', { name: 'Create one' });
    this.errorMessage = page
      .getByRole('alert')
      .first()
      .or(
        page
          .getByText(
            /login failed|invalid credentials|invalid email or password/i,
          )
          .first(),
      );
    this.fieldError = page
      .locator('[role="alert"], .error, .field-error')
      .first();
    this.successMessage = page
      .getByText(
        /login successful|welcome back|you have logged in successfully/i,
      )
      .first();
  }

  /** Wait for the page to be fully loaded */
  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForURL(/\/login/, { timeout: 30000 });
    await this.loginHeading.waitFor({ state: 'visible', timeout: 10000 });
  }

  /** Fill in the email field */
  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  /** Fill in the password field */
  async fillPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  /**
   * Click the login button.
   *
   * Uses the testid-first locator so it works on both builds: the trial-portal
   * tenant exposes data-testid="login-button", and on the HRM build the `.or()`
   * fallback resolves to the same role/name match as before.
   */
  async clickLoginButton(): Promise<void> {
    await this.loginSubmitButton.click();
  }

  /** Check the remember me checkbox */
  async checkRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.check({ force: true });
  }

  /** Click the forgot password link */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /** Click the Create one link */
  async clickCreateOne(): Promise<void> {
    await this.createOneLink.click();
  }

  /** Verify if the login heading is visible */
  async isLoginHeadingVisible(): Promise<boolean> {
    try {
      await this.loginHeading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Get the email field locator */
  getEmailField(): Locator {
    return this.emailField;
  }

  /** Get the password field locator */
  getPasswordField(): Locator {
    return this.passwordField;
  }

  /** Check if field error is visible */
  async isFieldErrorVisible(): Promise<boolean> {
    return this.fieldError.isVisible().catch(() => false);
  }

  /** Get the error message text */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  /** Check if login was successful by verifying URL change */
  async isLoginSuccess(): Promise<boolean> {
    try {
      await this.page.waitForURL((url) => !url.pathname.includes('/login'), {
        timeout: 15000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /** Navigate to the login page */
  async goto(loginUrl: string): Promise<void> {
    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    await this.emailField.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  /** Check if the error message is visible */
  async isErrorMessageVisible(): Promise<boolean> {
    return this.errorMessage.isVisible().catch(() => false);
  }

  /** Check if the login button is visible */
  async isLoginButtonVisible(): Promise<boolean> {
    return this.loginButton.isVisible().catch(() => false);
  }

  // ============================================================
  // Trial-portal login — Playwright conversion of the Selenium
  // `LoginPage` (pages/login_page_class.py).
  //
  // No scroll_to_bottom_page() equivalent: Playwright scrolls elements into
  // view automatically before acting on them. No sleeps: every method relies
  // on auto-waiting or an explicit assertion.
  // ============================================================

  /** Wait for the tenant login form to be ready */
  async waitForLoginForm(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.loginSubmitButton).toBeVisible();
  }

  /** Enter the username / Email ID */
  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /** Enter the password */
  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Enter a malformed username (Selenium: `invalid_usernamee`).
   * Separate from {@link enterUsername} only to keep the test's intent
   * readable — the underlying action is the same field.
   */
  async enterInvalidUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * Enter an invalid password (Selenium: `invalid_password`).
   * Note: the Python original typed the password into the *username* field —
   * that is a bug in the reference, not behaviour worth preserving.
   */
  async enterInvalidPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /** Enter a non-registered username (Selenium: `nonRegister_usernamee`) */
  async enterNonRegisteredUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /** Enter a non-registered password (Selenium: `nonRegister_password`) */
  async enterNonRegisteredPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /** Move focus off the email field so its validation runs */
  async blurUsernameField(): Promise<void> {
    await this.usernameInput.blur();
  }

  /**
   * Whether the Login button is disabled.
   *
   * This build enforces the mandatory email/password rules by disabling the
   * button rather than rendering the Selenium-era mandatory messages.
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    return this.loginSubmitButton.isDisabled();
  }

  /** Assert the malformed-email error is shown */
  async verifyInvalidUsernameError(): Promise<void> {
    await expect(this.invalidEmailError).toBeVisible();
    await expect(this.invalidEmailError).toContainText(
      LOGIN_MESSAGES.invalidEmail,
    );
  }

  /**
   * Assert the mandatory-email rule is enforced.
   *
   * The Selenium suite asserted LOGIN_MESSAGES.mandatoryEmail; this build has
   * no such message and blocks submission instead, so that is what is checked.
   */
  async verifyUsernameRequiredError(): Promise<void> {
    await expect(this.loginSubmitButton).toBeDisabled();
  }

  /** Assert the mandatory-password rule is enforced (see above) */
  async verifyPasswordRequiredError(): Promise<void> {
    await expect(this.loginSubmitButton).toBeDisabled();
  }

  /** Assert the "Invalid credentials" toast is shown */
  async verifyInvalidCredentialsError(): Promise<void> {
    await expect(this.invalidCredentialsToast).toBeVisible();
  }

  /** Whether the inline password error region is present */
  async isPasswordErrorVisible(): Promise<boolean> {
    return this.passwordErrorRegion.isVisible().catch(() => false);
  }

  /**
   * Clear the first-login interstitials that stand between a successful login
   * and the Company Settings page: the Privacy Policy consent dialog and the
   * plan-selection modal. Both are one-time per account, so each is handled
   * only if actually present.
   */
  async completeFirstLoginSetup(): Promise<void> {
    if (await this.privacyConsentCheckbox.isVisible().catch(() => false)) {
      await this.privacyConsentCheckbox.check({ force: true });
      await this.privacyConsentButton.click();
    }

    if (
      await this.planCard
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await this.planCard.first().click();
      await this.planGetStartedButton.click();
    }
  }
}

/**
 * ForgotPasswordPage class encapsulates all locators and atomic UI actions
 * for the forgot password page.
 */
export class ForgotPasswordPage {
  private readonly page: Page;

  /** "Reset your password" heading */
  private readonly resetPasswordHeading: Locator;

  /** Subheading text */
  private readonly subheading: Locator;

  /** Email input field */
  private readonly emailField: Locator;

  /** Send reset link button */
  private readonly sendResetLinkButton: Locator;

  /** Back to sign in link */
  private readonly backToSignInLink: Locator;

  /** Success message */
  private readonly successMessage: Locator;

  /** No account found message */
  private readonly noAccountFoundMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.resetPasswordHeading = page
      .locator('h1')
      .first()
      .or(page.getByText(/reset your password/i).first());
    this.subheading = page
      .getByText(
        /enter your email address to receive a reset link|we will send you a reset link/i,
      )
      .first();
    this.emailField = page.getByRole('textbox', { name: /email/i }).first();
    this.sendResetLinkButton = page
      .getByRole('button', { name: /send reset link/i })
      .first();
    // The "Back to sign in" element is a <button> on the page, so use button role first
    this.backToSignInLink = page.getByRole('button', {
      name: /back to sign in/i,
    });
    this.successMessage = page
      .getByText(
        /password reset link sent|check your email|we sent you a link|reset link sent|email sent successfully|a reset link has been sent/i,
      )
      .first();
    // For non-existent email case, the page shows a generic "No account found" message
    // Use a broader approach: check any notification/toast element that contains relevant text
    this.noAccountFoundMessage = page
      .locator(
        '[role="alert"], [class*="toast"], [class*="notification"], [class*="message"]',
      )
      .filter({ hasText: /no account found/i })
      .first();
  }

  /** Check if success message or no-account message is visible */
  async isSuccessOrNoAccountVisible(): Promise<boolean> {
    // Wait for the notification/toast to appear, then check page text
    await this.page
      .waitForFunction(
        (pattern: string) => {
          const text =
            document.body?.innerText || document.body?.textContent || '';
          const re = new RegExp(pattern, 'i');
          return re.test(text);
        },
        'password reset link sent|no account found|check your email',
        { timeout: 15000 },
      )
      .catch(() => false);

    // Verify the text actually exists after the wait
    try {
      const found = await this.page.evaluate(() => {
        const text =
          document.body?.innerText || document.body?.textContent || '';
        return (
          /password reset link sent/i.test(text) ||
          /no account found/i.test(text) ||
          /check your email/i.test(text)
        );
      });
      if (found) return true;
    } catch {}
    return false;
  }

  /** Wait for the forgot password page to be fully loaded */
  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForURL(/\/login\/forgot-password/i, { timeout: 15000 });
    await this.resetPasswordHeading.waitFor({
      state: 'visible',
      timeout: 10000,
    });
  }

  /** Fill in the email field on forgot password page */
  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  /** Click the Send reset link button */
  async clickSendResetLink(): Promise<void> {
    await this.sendResetLinkButton.waitFor({ state: 'visible' });
    await this.sendResetLinkButton.click({ force: true });
  }

  /** Click the Back to sign in link */
  async clickBackToSignIn(): Promise<void> {
    // The button may have disappeared after sending reset link (success toast covers it)
    try {
      await this.backToSignInLink.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // Button may no longer be visible - page might have navigated already
      return;
    }
    await this.backToSignInLink.click({ force: true });
    // Wait for navigation to login page
    await this.page.waitForURL((url) => url.href.includes('/login'), {
      timeout: 15000,
    });
  }

  /** Get the email field locator */
  getEmailField(): Locator {
    return this.emailField;
  }

  /** Check if the forgot password page is displayed */
  async isOnForgotPasswordPage(): Promise<boolean> {
    return this.resetPasswordHeading.isVisible().catch(() => false);
  }

  /** Check if success message is visible */
  async isSuccessMessageVisible(): Promise<boolean> {
    return this.successMessage.isVisible().catch(() => false);
  }

  /** Check if back to sign in link is visible */
  async isBackToSignInVisible(): Promise<boolean> {
    return this.backToSignInLink.isVisible().catch(() => false);
  }

  /** Check if send reset link button is visible */
  async isSendResetLinkVisible(): Promise<boolean> {
    return this.sendResetLinkButton.isVisible().catch(() => false);
  }
}

/**
 * EmailInboxPage class encapsulates all locators and atomic UI actions
 * for the SharkLasers email inbox.
 */
export class EmailInboxPage {
  private readonly page: Page;

  /** Email input field on SharkLasers login */
  private readonly emailInput: Locator;

  /** Login button on SharkLasers */
  private readonly loginButton: Locator;

  /** Inbox email list */
  private readonly inboxList: Locator;

  /** Password reset email from the inbox */
  private readonly passwordResetEmail: Locator;

  /** Reset password link inside the email */
  private readonly resetPasswordLink: Locator;

  /** Email subject text */
  private readonly emailSubject: Locator;

  /** Inbox URL */
  private readonly inboxUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.inboxUrl = 'https://www.sharklasers.com/';

    // SharkLasers login page locators
    this.emailInput = page.getByRole('textbox', { name: /email/i }).first();
    this.loginButton = page.getByText('Login', { exact: true }).first();

    // Inbox locators
    this.inboxList = page
      .locator('[class*="message-list"], [class*="inbox"] li')
      .first();
    this.passwordResetEmail = page
      .getByText(
        /password reset|reset your password|reset link|password reset requested/i,
      )
      .first();
    this.resetPasswordLink = page.getByRole('link', { name: /reset/i }).first();
    this.emailSubject = page
      .locator(
        '[class*="subject"], [class*="email-subject"], [class*="message-subject"]',
      )
      .first();
  }

  /** Navigate to SharkLasers inbox and log in */
  async navigateToInboxAndLogin(
    email: string,
    timeout: number = 30000,
  ): Promise<void> {
    await this.page.goto(this.inboxUrl, { waitUntil: 'domcontentloaded' });

    // Wait for email input and fill it
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.emailInput.fill(email);

    // Click login button
    await this.loginButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.loginButton.click({ force: true });

    // Wait for inbox to load
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await this.page.waitForURL((url) => url.href.includes('sharklasers.com'), {
      timeout: 15000,
    });
  }

  /** Wait for the password reset email to appear in the inbox */
  async waitForPasswordResetEmail(timeout: number = 30000): Promise<void> {
    await this.passwordResetEmail.waitFor({
      state: 'visible',
      timeout,
    });
  }

  /** Click on the password reset email to open it */
  async clickPasswordResetEmail(): Promise<void> {
    await this.passwordResetEmail.click();
  }

  /** Click the "Reset Password" link inside the email */
  async clickResetPasswordLink(): Promise<void> {
    await this.resetPasswordLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.resetPasswordLink.click({ force: true });
  }

  /** Verify the password reset email is visible in the inbox */
  async isPasswordResetEmailVisible(): Promise<boolean> {
    return this.passwordResetEmail.isVisible().catch(() => false);
  }

  /** Get the email subject text */
  async getEmailSubject(): Promise<string> {
    return (await this.emailSubject.textContent()) ?? '';
  }

  /** Get the current URL */
  getCurrentUrl(): string {
    return this.page.url();
  }
}

/**
 * ResetPasswordPage class encapsulates all locators and atomic UI actions
 * for setting a new password after clicking the reset link.
 */
export class ResetPasswordPage {
  private readonly page: Page;

  /** "Reset Password" heading */
  private readonly resetPasswordHeading: Locator;

  /** New password input field */
  private readonly newPasswordField: Locator;

  /** Confirm password input field */
  private readonly confirmPasswordField: Locator;

  /** "Submit" or "Reset Password" button */
  private readonly submitButton: Locator;

  /** Error message for password mismatch */
  private readonly passwordMismatchError: Locator;

  /** Success message after password reset */
  private readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.resetPasswordHeading = page.getByRole('heading', {
      name: /reset password/i,
    });

    this.newPasswordField = page.getByRole('textbox', {
      name: /new password/i,
    });

    this.confirmPasswordField = page.getByRole('textbox', {
      name: /confirm password/i,
    });

    this.submitButton = page.getByRole('button', {
      name: /submit|reset password/i,
    });

    this.passwordMismatchError = page
      .getByText(/passwords do not match|password mismatch/i)
      .first();

    this.successMessage = page
      .getByText(
        /password has been successfully reset|password reset successful|password has been changed/i,
      )
      .first();
  }

  /** Fill in the new password field */
  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordField.fill(password);
  }

  /** Fill in the confirm password field */
  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordField.fill(password);
  }

  /** Click the submit button */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click({ force: true });
  }

  /** Check if password mismatch error is visible */
  async isPasswordMismatchErrorVisible(): Promise<boolean> {
    return this.passwordMismatchError.isVisible().catch(() => false);
  }

  /** Check if success message is visible */
  async isSuccessMessageVisible(): Promise<boolean> {
    return this.successMessage.isVisible().catch(() => false);
  }

  /** Check if the page is the reset password page */
  async isOnResetPasswordPage(): Promise<boolean> {
    return this.resetPasswordHeading.isVisible().catch(() => false);
  }
}
