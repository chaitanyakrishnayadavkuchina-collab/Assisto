import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { LoginKeywords } from '@keywords/LoginKeywords';
import { SettingsPage } from '@pages/GlobalSettingsPage';
import { BusinessUnitPage } from '@pages/BusinessUnitPage';
import { SettingsKeywords } from '@keywords/GlobalSettingsKeywords';
import { PreOnboardingPage } from '@pages/PreOnboardingPage';
import { PreOnboardingKeywords } from '@keywords/PreOnboardingKeywords';
import { PreOnboardingDashboardPage } from '@pages/PreOnboardingDashboardPage';
import { PreOnboardingDashboardKeywords } from '@keywords/PreOnboardingDashboardKeywords';
import { PreOnboardingWorkflowsPage } from '@pages/PreOnboardingWorkflowsPage';
import { PreOnboardingWorkflowsKeywords } from '@keywords/PreOnboardingWorkflowsKeywords';
import { LetterTemplatesPage } from '@pages/LetterTemplatesPage';
import { LetterTemplatesKeywords } from '@keywords/LetterTemplatesKeywords';
import { CandidateRegistrationPage } from '@pages/CandidateRegistrationPage';
import { CandidateRegistrationKeywords } from '@keywords/CandidateRegistrationKeywords';
import { CandidatePreOnboardingPage } from '@pages/CandidatePreOnboardingPage';
import { CandidatePreOnboardingKeywords } from '@keywords/CandidatePreOnboardingKeywords';
import { MailSacClient } from '@utils/MailSacClient';
import { RegisterPage } from '@pages/RegisterPage';
import { RegisterKeywords } from '@keywords/RegisterKeywords';
import { CompanySettingsPage } from '@pages/CompanySettingsPage';
import { HrDocumentReviewPage } from '@pages/HrDocumentReviewPage';
import { HrDocumentReviewKeywords } from '@keywords/HrDocumentReviewKeywords';
import { LetterGenerationPage } from '@pages/LetterGenerationPage';
import { LetterGenerationKeywords } from '@keywords/LetterGenerationKeywords';
// ===== Employee Onboarding (post offer-acceptance) =====
import { TemporaryRegistrationPage } from '@pages/onboarding/TemporaryRegistrationPage';
import { TemporaryRegistrationKeywords } from '@keywords/onboarding/TemporaryRegistrationKeywords';
import { UpcomingJoineePage } from '@pages/onboarding/UpcomingJoineePage';
import { UpcomingJoineeKeywords } from '@keywords/onboarding/UpcomingJoineeKeywords';
import { EmployeeIdGenerationPage } from '@pages/onboarding/EmployeeIdGenerationPage';
import { EmployeeIdGenerationKeywords } from '@keywords/onboarding/EmployeeIdGenerationKeywords';
import { ItMailProvisioningPage } from '@pages/onboarding/ItMailProvisioningPage';
import { ItMailProvisioningKeywords } from '@keywords/onboarding/ItMailProvisioningKeywords';
import { DayZeroCheckInPage } from '@pages/onboarding/DayZeroCheckInPage';
import { DayZeroCheckInKeywords } from '@keywords/onboarding/DayZeroCheckInKeywords';
import { SetPasswordPage } from '@pages/onboarding/SetPasswordPage';
import { SelfOnboardingPage } from '@pages/onboarding/SelfOnboardingPage';
import { SelfOnboardingKeywords } from '@keywords/onboarding/SelfOnboardingKeywords';
import { HrVerificationPage } from '@pages/onboarding/HrVerificationPage';
import { HrVerificationKeywords } from '@keywords/onboarding/HrVerificationKeywords';
import {
  ensureAuthState,
  sessionStorageInitScript,
  type UserRole,
} from '@utils/authState';

/**
 * Extended test fixture with dependency injection
 *
 * Usage:
 *   import { test } from '@fixtures/test.fixture';
 *
 *   test('my test', async ({ loginPage, loginKeywords, preOnboardingKeywords }) => {
 *     await loginKeywords.openLoginPage('http://example.com/login');
 *     await loginKeywords.login('user@example.com', 'password123');
 *     await preOnboardingKeywords.navigateToPreOnboardingSettings();
 *   });
 *
 * Pre-authenticated tests: opt in with the `role` option and the `page`
 * fixture arrives already logged in — no UI login per test.
 *
 *   test.describe('...', () => {
 *     test.use({ role: 'admin' });   // or 'businessHR' | 'chro' | 'hrManager'
 *     ...
 *   });
 *
 * The default is 'none' (logged out), so specs that test the login flow itself
 * are unaffected.
 */
export const test = base.extend<{
  /** Role to pre-authenticate as. Defaults to 'none' (no session). */
  role: UserRole;
  loginPage: LoginPage;
  loginKeywords: LoginKeywords;
  settingsPage: SettingsPage;
  businessUnitPage: BusinessUnitPage;
  settingsKeywords: SettingsKeywords;
  preOnboardingPage: PreOnboardingPage;
  preOnboardingKeywords: PreOnboardingKeywords;
  preOnboardingDashboardPage: PreOnboardingDashboardPage;
  preOnboardingDashboardKeywords: PreOnboardingDashboardKeywords;
  preOnboardingWorkflowsPage: PreOnboardingWorkflowsPage;
  preOnboardingWorkflowsKeywords: PreOnboardingWorkflowsKeywords;
  letterTemplatesPage: LetterTemplatesPage;
  letterTemplatesKeywords: LetterTemplatesKeywords;
  candidateRegistrationPage: CandidateRegistrationPage;
  candidateRegistrationKeywords: CandidateRegistrationKeywords;
  candidatePreOnboardingPage: CandidatePreOnboardingPage;
  candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords;
  mailSacClient: MailSacClient;
  registerPage: RegisterPage;
  registerKeywords: RegisterKeywords;
  companySettingsPage: CompanySettingsPage;
  hrDocumentReviewPage: HrDocumentReviewPage;
  hrDocumentReviewKeywords: HrDocumentReviewKeywords;
  letterGenerationPage: LetterGenerationPage;
  letterGenerationKeywords: LetterGenerationKeywords;
  temporaryRegistrationPage: TemporaryRegistrationPage;
  temporaryRegistrationKeywords: TemporaryRegistrationKeywords;
  upcomingJoineePage: UpcomingJoineePage;
  upcomingJoineeKeywords: UpcomingJoineeKeywords;
  employeeIdGenerationPage: EmployeeIdGenerationPage;
  employeeIdGenerationKeywords: EmployeeIdGenerationKeywords;
  itMailProvisioningPage: ItMailProvisioningPage;
  itMailProvisioningKeywords: ItMailProvisioningKeywords;
  dayZeroCheckInPage: DayZeroCheckInPage;
  dayZeroCheckInKeywords: DayZeroCheckInKeywords;
  setPasswordPage: SetPasswordPage;
  selfOnboardingPage: SelfOnboardingPage;
  selfOnboardingKeywords: SelfOnboardingKeywords;
  hrVerificationPage: HrVerificationPage;
  hrVerificationKeywords: HrVerificationKeywords;
}>({
  role: ['none', { option: true }],

  /**
   * Overrides Playwright's built-in storageState option: for any role other
   * than 'none', the context starts from that role's cached cookies /
   * localStorage.
   */
  storageState: async ({ role }, use) => {
    if (role === 'none') {
      await use(undefined);
      return;
    }
    const session = await ensureAuthState(role);
    await use(session.storageState);
  },

  /**
   * Overrides the built-in `page` to replay the cached sessionStorage before
   * the app boots — this app holds its JWT there, which storageState alone
   * cannot carry. Untouched when role is 'none'.
   */
  page: async ({ page, context, role }, use) => {
    if (role !== 'none') {
      const session = await ensureAuthState(role);
      await context.addInitScript(
        sessionStorageInitScript(session.sessionStorage),
      );
    }
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  loginKeywords: async ({ page }, use) => {
    const loginKeywords = new LoginKeywords(page);
    await use(loginKeywords);
  },

  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },

  businessUnitPage: async ({ page }, use) => {
    const businessUnitPage = new BusinessUnitPage(page);
    await use(businessUnitPage);
  },

  settingsKeywords: async ({ page }, use) => {
    const settingsKeywords = new SettingsKeywords(page);
    await use(settingsKeywords);
  },

  preOnboardingPage: async ({ page }, use) => {
    const preOnboardingPage = new PreOnboardingPage(page);
    await use(preOnboardingPage);
  },

  preOnboardingDashboardPage: async ({ page }, use) => {
    const preOnboardingDashboardPage = new PreOnboardingDashboardPage(page);
    await use(preOnboardingDashboardPage);
  },

  preOnboardingDashboardKeywords: async ({ page }, use) => {
    const preOnboardingDashboardKeywords = new PreOnboardingDashboardKeywords(
      page,
    );
    await use(preOnboardingDashboardKeywords);
  },

  preOnboardingWorkflowsPage: async ({ page }, use) => {
    const preOnboardingWorkflowsPage = new PreOnboardingWorkflowsPage(page);
    await use(preOnboardingWorkflowsPage);
  },

  preOnboardingWorkflowsKeywords: async ({ page }, use) => {
    const preOnboardingWorkflowsKeywords = new PreOnboardingWorkflowsKeywords(
      page,
    );
    await use(preOnboardingWorkflowsKeywords);
  },

  preOnboardingKeywords: async ({ page }, use) => {
    const preOnboardingKeywords = new PreOnboardingKeywords(page);
    await use(preOnboardingKeywords);
  },

  letterTemplatesPage: async ({ page }, use) => {
    const letterTemplatesPage = new LetterTemplatesPage(page);
    await use(letterTemplatesPage);
  },

  letterTemplatesKeywords: async ({ page }, use) => {
    const letterTemplatesKeywords = new LetterTemplatesKeywords(page);
    await use(letterTemplatesKeywords);
  },

  candidateRegistrationPage: async ({ page }, use) => {
    const candidateRegistrationPage = new CandidateRegistrationPage(page);
    await use(candidateRegistrationPage);
  },

  candidateRegistrationKeywords: async ({ page }, use) => {
    const candidateRegistrationKeywords = new CandidateRegistrationKeywords(
      page,
    );
    await use(candidateRegistrationKeywords);
  },

  candidatePreOnboardingPage: async ({ page }, use) => {
    const candidatePreOnboardingPage = new CandidatePreOnboardingPage(page);
    await use(candidatePreOnboardingPage);
  },

  candidatePreOnboardingKeywords: async ({ page }, use) => {
    const candidatePreOnboardingKeywords = new CandidatePreOnboardingKeywords(
      page,
    );
    await use(candidatePreOnboardingKeywords);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  registerKeywords: async ({ page }, use) => {
    const registerKeywords = new RegisterKeywords(page);
    await use(registerKeywords);
  },

  companySettingsPage: async ({ page }, use) => {
    const companySettingsPage = new CompanySettingsPage(page);
    await use(companySettingsPage);
  },

  hrDocumentReviewPage: async ({ page }, use) => {
    const hrDocumentReviewPage = new HrDocumentReviewPage(page);
    await use(hrDocumentReviewPage);
  },

  hrDocumentReviewKeywords: async ({ page }, use) => {
    const hrDocumentReviewKeywords = new HrDocumentReviewKeywords(page);
    await use(hrDocumentReviewKeywords);
  },

  letterGenerationPage: async ({ page }, use) => {
    const letterGenerationPage = new LetterGenerationPage(page);
    await use(letterGenerationPage);
  },

  letterGenerationKeywords: async ({ page }, use) => {
    const letterGenerationKeywords = new LetterGenerationKeywords(page);
    await use(letterGenerationKeywords);
  },

  temporaryRegistrationPage: async ({ page }, use) => {
    await use(new TemporaryRegistrationPage(page));
  },

  temporaryRegistrationKeywords: async ({ page }, use) => {
    await use(new TemporaryRegistrationKeywords(page));
  },

  upcomingJoineePage: async ({ page }, use) => {
    await use(new UpcomingJoineePage(page));
  },

  upcomingJoineeKeywords: async ({ page }, use) => {
    await use(new UpcomingJoineeKeywords(page));
  },

  employeeIdGenerationPage: async ({ page }, use) => {
    await use(new EmployeeIdGenerationPage(page));
  },

  employeeIdGenerationKeywords: async ({ page }, use) => {
    await use(new EmployeeIdGenerationKeywords(page));
  },

  itMailProvisioningPage: async ({ page }, use) => {
    await use(new ItMailProvisioningPage(page));
  },

  itMailProvisioningKeywords: async ({ page }, use) => {
    await use(new ItMailProvisioningKeywords(page));
  },

  dayZeroCheckInPage: async ({ page }, use) => {
    await use(new DayZeroCheckInPage(page));
  },

  dayZeroCheckInKeywords: async ({ page }, use) => {
    await use(new DayZeroCheckInKeywords(page));
  },

  setPasswordPage: async ({ page }, use) => {
    await use(new SetPasswordPage(page));
  },

  selfOnboardingPage: async ({ page }, use) => {
    await use(new SelfOnboardingPage(page));
  },

  selfOnboardingKeywords: async ({ page }, use) => {
    await use(new SelfOnboardingKeywords(page));
  },

  hrVerificationPage: async ({ page }, use) => {
    await use(new HrVerificationPage(page));
  },

  hrVerificationKeywords: async ({ page }, use) => {
    await use(new HrVerificationKeywords(page));
  },

  mailSacClient: async ({}, use) => {
    const mailSacClient = new MailSacClient(process.env.MAIL_SAC_API_KEY || '');
    await use(mailSacClient);
  },
});

export { expect } from '@playwright/test';
