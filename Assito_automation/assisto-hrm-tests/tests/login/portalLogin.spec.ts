import { test, expect } from '@fixtures/test.fixture';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import loginData from '@test-data/loginData.json';
import { getRegistrationUrl, getTrialAdminCredentials } from '@utils/helpers';

/**
 * Trial-portal login.
 *
 * Playwright equivalent of the Selenium suite's
 * `test_cases/test_cases_login_page.py::TestRegisterPage`.
 *
 * Entry point matches the reference flow: the public portal's "Start Free
 * Trial" CTA is given an already-registered email, which the portal answers by
 * redirecting to that tenant's login page.
 */
test.describe('Login Page', () => {
  const portalUrl = getRegistrationUrl();
  const { email: trialEmail, password: trialPassword } =
    getTrialAdminCredentials();
  const negative = loginData.trialPortal;

  /**
   * Walk the portal entry point until the tenant login form is on screen.
   * Shared by every test below — it is the reference flow's Steps 1-2.
   */
  async function openTenantLoginPage(
    registerPage: import('@pages/RegisterPage').RegisterPage,
    loginKeywords: import('@keywords/LoginKeywords').LoginKeywords,
    email: string,
  ): Promise<void> {
    await registerPage.goto(portalUrl);
    await registerPage.clickStartFreeButton();
    await registerPage.enterUsername(email);
    await registerPage.clickContinueButton();
    await loginKeywords.waitForTenantLoginPage();
  }

  test('15722 - Verify user can able to login with valid credentials', async ({
    page,
    registerPage,
    loginPage,
    loginKeywords,
    companySettingsPage,
  }) => {
    // Portal redirect, login, and first-login setup each involve a server
    // round-trip on a freshly provisioned tenant.
    test.setTimeout(3 * 60 * 1000);

    await allure.epic('Assisto Portal');
    await allure.feature('Login');
    await allure.story('Login page validation');
    await allure.severity(Severity.BLOCKER);
    await allure.tags('regression', 'login');

    await test.step('Step 1: Enter user name', async () => {
      await registerPage.goto(portalUrl);
      await registerPage.clickStartFreeButton();
      await registerPage.enterUsername(trialEmail);
    });

    await test.step('Step 2: Click Continue', async () => {
      await registerPage.clickContinueButton();
    });

    await test.step('Step 3: User should navigate to the login page', async () => {
      await expect(page).toHaveTitle('Assisto');
      await expect(page).toHaveURL(/\/login/);
      await loginKeywords.waitForTenantLoginPage();
    });

    await test.step('Step 4: Enter user name and password', async () => {
      await loginPage.enterUsername(trialEmail);
      await loginPage.enterPassword(trialPassword);
    });

    await test.step('Step 5: Click Login', async () => {
      await loginPage.clickLoginButton();
      // One-time Privacy Policy consent and plan selection sit between login
      // and Company Settings for a brand-new tenant; both are no-ops once done.
      await loginPage.completeFirstLoginSetup();
    });

    await test.step('Step 6: Verify Company Settings page', async () => {
      await companySettingsPage.verifyCompanySettingsPage();
    });
  });

  test.describe('Negative scenarios', () => {
    test.beforeEach(async () => {
      await allure.epic('Assisto Portal');
      await allure.feature('Login');
      await allure.story('Login page validation');
      await allure.severity(Severity.NORMAL);
      await allure.tags('regression', 'login', 'negative');
    });

    /**
     * The Selenium suite expected
     * "Email ID Field Is Mandatory, Please Enter Your Email ID"; this build
     * enforces the same rule by keeping Login disabled instead.
     */
    test('should block login when the username is empty', async ({
      registerPage,
      loginPage,
      loginKeywords,
    }) => {
      await openTenantLoginPage(registerPage, loginKeywords, trialEmail);
      await loginPage.enterUsername('');
      await loginPage.enterPassword(trialPassword);
      await loginPage.verifyUsernameRequiredError();
    });

    /**
     * Selenium expected "Password Field is Mandatory,Please Enter your Password";
     * this build disables Login instead.
     */
    test('should block login when the password is empty', async ({
      registerPage,
      loginPage,
      loginKeywords,
    }) => {
      await openTenantLoginPage(registerPage, loginKeywords, trialEmail);
      await loginPage.enterUsername(trialEmail);
      await loginPage.enterPassword('');
      await loginPage.verifyPasswordRequiredError();
    });

    test('should show a validation error for a malformed username', async ({
      registerPage,
      loginPage,
      loginKeywords,
    }) => {
      await openTenantLoginPage(registerPage, loginKeywords, trialEmail);
      await loginPage.enterInvalidUsername(negative.malformedUsername);
      await loginPage.blurUsernameField();
      await loginPage.verifyInvalidUsernameError();
      expect(await loginPage.isLoginButtonDisabled()).toBe(true);
    });

    test('should show a validation error for a username with special characters', async ({
      registerPage,
      loginPage,
      loginKeywords,
    }) => {
      await openTenantLoginPage(registerPage, loginKeywords, trialEmail);
      await loginPage.enterInvalidUsername(negative.invalidUsername);
      await loginPage.blurUsernameField();
      await loginPage.verifyInvalidUsernameError();
    });

    test('should reject a valid username with an invalid password', async ({
      registerPage,
      loginPage,
      loginKeywords,
    }) => {
      await openTenantLoginPage(registerPage, loginKeywords, trialEmail);
      await loginPage.enterUsername(trialEmail);
      await loginPage.enterInvalidPassword(negative.invalidPassword);
      await loginPage.clickLoginButton();
      await loginPage.verifyInvalidCredentialsError();
    });

    test('should reject a non-registered username and password', async ({
      page,
      registerPage,
      loginPage,
      loginKeywords,
    }) => {
      await openTenantLoginPage(registerPage, loginKeywords, trialEmail);
      await loginPage.enterNonRegisteredUsername(
        negative.nonRegisteredUsername,
      );
      await loginPage.enterNonRegisteredPassword(
        negative.nonRegisteredPassword,
      );
      await loginPage.clickLoginButton();
      await loginPage.verifyInvalidCredentialsError();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
