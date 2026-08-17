import { type Page, expect } from '@playwright/test';
import {
  LoginPage,
  ForgotPasswordPage,
  EmailInboxPage,
  ResetPasswordPage,
} from '@pages/LoginPage';

/**
 * LoginKeywords provides high-level business actions for the login feature.
 *
 * These methods combine multiple page interactions into readable operations.
 */
export class LoginKeywords {
  private readonly page: Page;
  private readonly loginPage: LoginPage;
  private readonly forgotPasswordPage: ForgotPasswordPage;
  private readonly emailInboxPage: EmailInboxPage;
  private readonly resetPasswordPage: ResetPasswordPage;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.forgotPasswordPage = new ForgotPasswordPage(page);
    this.emailInboxPage = new EmailInboxPage(page);
    this.resetPasswordPage = new ResetPasswordPage(page);
  }

  // ========== Login Page Actions ==========

  /**
   * Open the login page with the given URL
   */
  async openLoginPage(loginUrl: string): Promise<void> {
    await this.loginPage.goto(loginUrl);
  }

  /**
   * Perform a login with the given credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.loginPage.fillEmail(email);
    await this.loginPage.fillPassword(password);
    await this.loginPage.clickLoginButton();
  }

  /**
   * Perform a login with the "Remember me" checkbox checked
   */
  async loginWithRememberMe(email: string, password: string): Promise<void> {
    await this.loginPage.fillEmail(email);
    await this.loginPage.fillPassword(password);
    await this.loginPage.checkRememberMe();
    await this.loginPage.clickLoginButton();
  }

  /**
   * Login with invalid credentials and expect error message
   */
  async loginWithInvalidCredentials(
    email: string,
    password: string,
  ): Promise<void> {
    await this.loginPage.fillEmail(email);
    await this.loginPage.fillPassword(password);
    await this.loginPage.clickLoginButton();

    // Wait for the page to either show an error message or stay on the login URL.
    const startUrl = this.page.url();
    const startPath = new URL(startUrl).pathname;

    await expect(async () => {
      const isVisible = await this.loginPage.isErrorMessageVisible();
      const currentUrl = this.page.url();
      const currentPath = new URL(currentUrl).pathname;
      const stillOnLogin = currentPath === startPath;

      if (!isVisible && !stillOnLogin) {
        throw new Error('Error message is not visible and URL has changed');
      }
    }).toPass({
      intervals: [1000, 2000, 3000],
      timeout: 10000,
    });
  }

  /**
   * Login with empty fields and verify validation
   */
  async loginWithEmptyFields(): Promise<void> {
    // Don't fill any fields, just click login
    await this.loginPage.clickLoginButton();

    // Verify user stays on the login page (validation prevents navigation)
    await expect(async () => {
      const url = this.page.url();
      if (!url.includes('/login')) {
        throw new Error(
          'User was navigated away from login page with empty fields',
        );
      }
    }).toPass({
      intervals: [1000, 2000, 3000],
      timeout: 10000,
    });
  }

  /**
   * Login with only email (empty password) and verify validation
   */
  async loginWithOnlyEmail(email: string): Promise<void> {
    await this.loginPage.fillEmail(email);
    await this.loginPage.clickLoginButton();

    // Verify user stays on the login page (validation prevents navigation)
    await expect(async () => {
      const url = this.page.url();
      if (!url.includes('/login')) {
        throw new Error(
          'User was navigated away from login page with empty password',
        );
      }
    }).toPass({
      intervals: [1000, 2000, 3000],
      timeout: 10000,
    });
  }

  /**
   * Login with only password (empty email) and verify validation
   */
  async loginWithOnlyPassword(password: string): Promise<void> {
    await this.loginPage.fillPassword(password);
    await this.loginPage.clickLoginButton();

    // Verify user stays on the login page (validation prevents navigation)
    await expect(async () => {
      const url = this.page.url();
      if (!url.includes('/login')) {
        throw new Error(
          'User was navigated away from login page with empty email',
        );
      }
    }).toPass({
      intervals: [1000, 2000, 3000],
      timeout: 10000,
    });
  }

  /**
   * Login with valid credentials and verify the URL does not contain /login
   */
  async loginAndVerifySuccess(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.verifyLoginSuccess();
  }

  /**
   * Verify that login was successful (page should not be on login page)
   */
  async verifyLoginSuccess(): Promise<void> {
    // Wait for navigation to complete after successful login.
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    // Wait for the URL to change away from the login page.
    await this.page.waitForURL((url) => !url.pathname.includes('login'), {
      timeout: 30000,
    });
  }

  /**
   * Click the "Create one" link on the login page
   */
  async clickCreateOne(): Promise<void> {
    await this.loginPage.clickCreateOne();
  }

  /**
   * Verify the welcome heading is visible on the login page
   */
  async verifyWelcomeHeadingVisible(): Promise<void> {
    const visible = await this.loginPage.isLoginHeadingVisible();
    await expect(visible).toBeTruthy();
  }

  // ========== Forgot Password Flow ==========

  /**
   * Open the forgot password page by clicking the forgot password link
   */
  async openForgotPassword(): Promise<void> {
    await this.loginPage.clickForgotPassword();
  }

  /**
   * Verify the forgot password page is displayed
   */
  async verifyForgotPasswordPageDisplayed(): Promise<void> {
    const visible = await this.forgotPasswordPage.isOnForgotPasswordPage();
    await expect(visible).toBeTruthy();
  }

  /**
   * Enter an email address on the forgot password page
   */
  async enterEmailForForgotPassword(email: string): Promise<void> {
    await this.forgotPasswordPage.fillEmail(email);
  }

  /**
   * Click the "Send reset link" button on the forgot password page
   */
  async clickSendResetLink(): Promise<void> {
    await this.forgotPasswordPage.clickSendResetLink();
  }

  /**
   * Verify the success message is displayed after sending reset link
   */
  async verifyResetLinkSentSuccessMessage(): Promise<void> {
    const visible = await this.forgotPasswordPage.isSuccessOrNoAccountVisible();
    await expect(visible).toBeTruthy();
  }

  /**
   * Click "Back to sign in" link on the forgot password page
   */
  async clickBackToSignIn(): Promise<void> {
    await this.forgotPasswordPage.clickBackToSignIn();
  }

  /**
   * Verify we're back on the login page after clicking "Back to sign in"
   */
  async verifyBackOnLoginPage(): Promise<void> {
    await expect(async () => {
      const url = this.page.url();
      if (!url.includes('/login')) {
        throw new Error('URL does not contain /login: ' + url);
      }
    }).toPass({ intervals: [500, 1000, 2000], timeout: 10000 });
  }

  /**
   * Full forgot password flow: open page, enter email, send reset link
   */
  async forgotPassword(email: string): Promise<void> {
    await this.openForgotPassword();
    await this.verifyForgotPasswordPageDisplayed();
    await this.enterEmailForForgotPassword(email);
    await this.clickSendResetLink();
    await this.verifyResetLinkSentSuccessMessage();
  }

  /**
   * Full forgot password flow then return to sign in
   */
  async forgotPasswordAndReturn(email: string): Promise<void> {
    await this.forgotPassword(email);
    // After sending reset link, the page may already navigate back to login
    // Check if we're already on the login page before clicking back to sign in
    try {
      await this.page.waitForURL((url) => url.href.includes('/login'), {
        timeout: 5000,
      });
    } catch {
      // If we're not on login yet, try clicking back to sign in
    }
    try {
      await this.clickBackToSignIn();
    } catch {
      // Back to sign in may not be available if page already navigated to login
    }
    await this.verifyBackOnLoginPage();
  }

  /**
   * Verify the email on the forgot password page is a valid format
   */
  async verifyEmailFieldEditable(): Promise<void> {
    await this.forgotPasswordPage.fillEmail('test@example.com');
    const value = await this.forgotPasswordPage.getEmailField().inputValue();
    expect(value).toBe('test@example.com');
  }

  // ========== Email Inbox Actions (SharkLasers) ==========

  /**
   * Navigate to the email inbox and wait for the reset password email
   */
  async goToInboxAndVerifyResetEmail(
    email: string,
    timeout: number = 30000,
  ): Promise<void> {
    await this.emailInboxPage.navigateToInboxAndLogin(email, timeout);
    await this.emailInboxPage.waitForPasswordResetEmail(timeout);
    const isVisible = await this.emailInboxPage.isPasswordResetEmailVisible();
    await expect(isVisible).toBeTruthy();
  }

  /**
   * Open the reset password email in the inbox
   */
  async openPasswordResetEmail(): Promise<void> {
    await this.emailInboxPage.clickPasswordResetEmail();
  }

  /**
   * Get the email subject
   */
  async getEmailSubject(): Promise<string> {
    return await this.emailInboxPage.getEmailSubject();
  }

  // ========== Reset Password Page Actions ==========

  /**
   * Fill in new password and confirm password, then submit
   */
  async submitNewPassword(
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    await this.resetPasswordPage.fillNewPassword(newPassword);
    await this.resetPasswordPage.fillConfirmPassword(confirmPassword);
    await this.resetPasswordPage.clickSubmit();
  }

  /**
   * Verify the reset password page is displayed
   */
  async verifyResetPasswordPageDisplayed(): Promise<void> {
    const visible = await this.resetPasswordPage.isOnResetPasswordPage();
    await expect(visible).toBeTruthy();
  }

  /**
   * Submit mismatched passwords and verify error
   */
  async submitMismatchedPasswords(
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    await this.resetPasswordPage.fillNewPassword(newPassword);
    await this.resetPasswordPage.fillConfirmPassword(confirmPassword);
    await this.resetPasswordPage.clickSubmit();

    await expect(async () => {
      const isVisible =
        await this.resetPasswordPage.isPasswordMismatchErrorVisible();
      if (!isVisible) {
        throw new Error('Password mismatch error should be visible');
      }
    }).toPass({ intervals: [500, 1000, 2000], timeout: 10000 });
  }

  /**
   * Verify password reset success message
   */
  async verifyPasswordResetSuccess(): Promise<void> {
    const visible = await this.resetPasswordPage.isSuccessMessageVisible();
    await expect(visible).toBeTruthy();
  }

  /**
   * Verify the "Create one" link is visible on the login page
   */
  async verifyCreateOneLinkVisible(): Promise<void> {
    await expect(async () => {
      const createOneLink =
        this.loginPage['createOneLink'] ??
        this.page.getByRole('link', { name: 'Create one' });
      await createOneLink.waitFor({ state: 'visible', timeout: 10000 });
    }).toPass({ intervals: [500, 1000, 2000], timeout: 15000 });
  }

  /**
   * Clear the email field
   */
  async clearEmail(): Promise<void> {
    await this.loginPage.getEmailField().clear();
  }

  /**
   * Clear the password field
   */
  async clearPassword(): Promise<void> {
    await this.loginPage.getPasswordField().clear();
  }

  // ============================================================
  // Trial-portal login (test.devassisto.com tenant build)
  // ============================================================

  /** Wait until the tenant login form is ready to be filled */
  async waitForTenantLoginPage(): Promise<void> {
    await this.loginPage.waitForLoginForm();
  }

  /** Enter credentials and submit */
  async loginToTenant(username: string, password: string): Promise<void> {
    await this.loginPage.enterUsername(username);
    await this.loginPage.enterPassword(password);
    await this.loginPage.clickLoginButton();
  }

  /**
   * Log in and clear the one-time Privacy Policy / plan-selection
   * interstitials so the admin lands on Company Settings.
   */
  async loginToTenantAndCompleteFirstLoginSetup(
    username: string,
    password: string,
  ): Promise<void> {
    await this.loginToTenant(username, password);
    await this.loginPage.completeFirstLoginSetup();
  }

  /** Attempt a login expected to fail, and assert the error */
  async loginExpectingInvalidCredentials(
    username: string,
    password: string,
  ): Promise<void> {
    await this.loginToTenant(username, password);
    await this.loginPage.verifyInvalidCredentialsError();
  }
}
