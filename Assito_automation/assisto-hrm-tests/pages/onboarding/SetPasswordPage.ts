import { type Page, type Locator, expect } from '@playwright/test';

/**
 * SetPasswordPage covers the "Set your password" screen the new joiner reaches
 * from the "Joining Confirmed" email, plus the Privacy Policy consent dialog
 * the app shows on their FIRST login.
 *
 * The password rule is stated on the page itself: 8-16 characters with an
 * uppercase, a lowercase, a number and a special character. Passwords are
 * generated (utils/helpers.randomPassword) rather than hardcoded.
 */
export class SetPasswordPage {
  private readonly page: Page;

  // ===== Set your password =====
  readonly heading: Locator;
  readonly settingPasswordForText: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly passwordRuleHint: Locator;
  readonly setPasswordButton: Locator;

  // ===== Privacy Policy dialog (first login) =====
  readonly privacyPolicyDialog: Locator;
  readonly privacyPolicyHeading: Locator;
  readonly privacyPolicyAgreeCheckbox: Locator;
  readonly privacyPolicyContinueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = this.page.getByText('Set your password', { exact: true });
    this.settingPasswordForText = this.page.getByText(/Setting password for/i);
    // Labelled fields — "New password *" / "Confirm password *".
    this.newPasswordInput = this.page.getByLabel(/New password/i);
    this.confirmPasswordInput = this.page.getByLabel(/Confirm password/i);
    this.passwordRuleHint = this.page.getByText(
      /8-16 characters with an uppercase/i,
    );
    this.setPasswordButton = this.page.getByRole('button', {
      name: /Set password & continue/i,
    });

    this.privacyPolicyDialog = this.page
      .getByRole('dialog')
      .filter({ hasText: 'Privacy Policy' });
    this.privacyPolicyHeading = this.page.getByText('Privacy Policy', {
      exact: true,
    });
    this.privacyPolicyAgreeCheckbox = this.page.getByRole('checkbox', {
      name: /I have read and agree to the privacy policy/i,
    });
    this.privacyPolicyContinueButton = this.page.getByRole('button', {
      name: 'Continue',
      exact: true,
    });
  }

  /** The address the app says it is setting a password for. */
  async getSettingPasswordForEmail(): Promise<string> {
    const text = (await this.settingPasswordForText.textContent()) ?? '';
    return (text.match(/[\w.+-]+@[\w.-]+\.\w+/) ?? [''])[0];
  }

  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  async clickSetPassword(): Promise<void> {
    await this.setPasswordButton.click();
  }

  async isPrivacyPolicyShown(): Promise<boolean> {
    return (
      (await this.privacyPolicyHeading.isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await this.privacyPolicyDialog.first().isVisible({ timeout: 5000 }).catch(() => false))
    );
  }

  async acceptPrivacyPolicy(): Promise<void> {
    const dialog = this.privacyPolicyDialog.first();
    const checkbox = dialog.locator('input[type="checkbox"]').first();
    await checkbox.check({ force: true }).catch(async () => {
      await dialog.locator('label').filter({ hasText: /privacy policy/i }).click();
    });
    await expect(this.privacyPolicyContinueButton).toBeEnabled({ timeout: 5000 });
    await this.privacyPolicyContinueButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
}
