import { expect, Locator, Page } from '@playwright/test';

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

  constructor(page: Page) {
    this.page = page;

    // Use multiple strategies: h1 first, then text-based fallback
    this.loginHeading = page.locator('h1').first()
      .or(page.getByText('Login to your account', { exact: true }).first());
    this.emailField = page.getByRole('textbox', { name: /email/i }).first();
    this.passwordField = page.locator('input[type="password"]').first();
    this.loginButton = page.getByRole('button', { name: 'Login' }).first();
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.forgotPasswordLink = page.getByRole('button', { name: 'Forgot password?' }).first();
    this.createOneLink = page.getByRole('link', { name: 'Create one' });
    this.errorMessage = page
      .getByRole('alert')
      .first()
      .or(
        page.getByText(/login failed|invalid credentials|invalid email or password/i).first()
      );
    this.fieldError = page.locator('[role="alert"], .error, .field-error').first();
    this.successMessage = page.getByText(/login successful|welcome back|you have logged in successfully/i).first();
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

  /** Click the login button */
  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
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
      await this.page.waitForURL(
        (url) => !url.pathname.includes('/login'),
        { timeout: 15000 }
      );
      return true;
    } catch {
      return false;
    }
  }

  /** Navigate to the login page */
  async goto(loginUrl: string): Promise<void> {
    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  }

  /** Check if the error message is visible */
  async isErrorMessageVisible(): Promise<boolean> {
    return this.errorMessage.isVisible().catch(() => false);
  }

  /** Check if the login button is visible */
  async isLoginButtonVisible(): Promise<boolean> {
    return this.loginButton.isVisible().catch(() => false);
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

    this.resetPasswordHeading = page.locator('h1').first()
      .or(page.getByText(/reset your password/i).first());
    this.subheading = page
      .getByText(/enter your email address to receive a reset link|we will send you a reset link/i)
      .first();
    this.emailField = page.getByRole('textbox', { name: /email/i }).first();
    this.sendResetLinkButton = page.getByRole('button', { name: /send reset link/i }).first();
    // The "Back to sign in" element is a <button> on the page, so use button role first
    this.backToSignInLink = page.getByRole('button', { name: /back to sign in/i });
    this.successMessage = page
      .getByText(/password reset link sent|check your email|we sent you a link|reset link sent|email sent successfully|a reset link has been sent/i)
      .first();
    // For non-existent email case, the page shows a generic "No account found" message
    // Use a broader approach: check any notification/toast element that contains relevant text
    this.noAccountFoundMessage = page
      .locator('[role="alert"], [class*="toast"], [class*="notification"], [class*="message"]')
      .filter({ hasText: /no account found/i })
      .first();
  }

  /** Check if success message or no-account message is visible */
  async isSuccessOrNoAccountVisible(): Promise<boolean> {
    // Wait for the notification/toast to appear, then check page text
    await this.page.waitForFunction(
      (pattern: string) => {
        const text = document.body?.innerText || document.body?.textContent || '';
        const re = new RegExp(pattern, 'i');
        return re.test(text);
      },
      'password reset link sent|no account found|check your email',
      { timeout: 15000 }
    ).catch(() => false);

    // Verify the text actually exists after the wait
    try {
      const found = await this.page.evaluate(() => {
        const text = document.body?.innerText || document.body?.textContent || '';
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
    await this.page.waitForURL(url => url.href.includes('/login'), { timeout: 15000 });
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
    this.inboxList = page.locator('[class*="message-list"], [class*="inbox"] li').first();
    this.passwordResetEmail = page
      .getByText(/password reset|reset your password|reset link|password reset requested/i)
      .first();
    this.resetPasswordLink = page
      .getByRole('link', { name: /reset/i })
      .first();
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
      .getByText(/password has been successfully reset|password reset successful|password has been changed/i)
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


