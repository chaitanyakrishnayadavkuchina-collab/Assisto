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
import { CandidateRegistrationPage } from '@pages/Hr-Cand-Reg-Page';
import { CandidateRegistrationKeywords } from '@keywords/Hr-Candi-RegKeywords';
import { CandidatePreOnboardingPage } from '@pages/CandidatePreOnboardingPage';
import { CandidatePreOnboardingKeywords } from '@keywords/CandidatePreOnboardingKeywords';
import { YopMailPage } from '@pages/YopMailPage';
import { YopMailKeywords } from '@keywords/YopMailKeywords';
import { MailSacClient } from '@utils/MailSacClient';

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
 */
export const test = base.extend<{
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
  yopMailPage: YopMailPage;
  yopMailKeywords: YopMailKeywords;
  mailSacClient: MailSacClient;
}>({
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
    const preOnboardingDashboardKeywords = new PreOnboardingDashboardKeywords(page);
    await use(preOnboardingDashboardKeywords);
  },

  preOnboardingWorkflowsPage: async ({ page }, use) => {
    const preOnboardingWorkflowsPage = new PreOnboardingWorkflowsPage(page);
    await use(preOnboardingWorkflowsPage);
  },

  preOnboardingWorkflowsKeywords: async ({ page }, use) => {
    const preOnboardingWorkflowsKeywords = new PreOnboardingWorkflowsKeywords(page);
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
    const candidateRegistrationKeywords = new CandidateRegistrationKeywords(page);
    await use(candidateRegistrationKeywords);
  },

  candidatePreOnboardingPage: async ({ page }, use) => {
    const candidatePreOnboardingPage = new CandidatePreOnboardingPage(page);
    await use(candidatePreOnboardingPage);
  },

  candidatePreOnboardingKeywords: async ({ page }, use) => {
    const candidatePreOnboardingKeywords = new CandidatePreOnboardingKeywords(page);
    await use(candidatePreOnboardingKeywords);
  },

  yopMailPage: async ({ page }, use) => {
    const yopMailPage = new YopMailPage(page);
    await use(yopMailPage);
  },

  yopMailKeywords: async ({ page }, use) => {
    const yopMailKeywords = new YopMailKeywords(page);
    await use(yopMailKeywords);
  },

  mailSacClient: async ({}, use) => {
    const mailSacClient = new MailSacClient(process.env.MAIL_SAC_API_KEY || '');
    await use(mailSacClient);
  },
});

export { expect } from '@playwright/test';


