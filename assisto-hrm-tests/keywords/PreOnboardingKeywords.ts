import { type Page } from '@playwright/test';
import { PreOnboardingPage } from '@pages/PreOnboardingPage';

/**
 * PreOnboardingKeywords provides high-level business actions for the Pre-Onboarding Settings page.
 *
 * These methods combine multiple page interactions into readable operations
 * for the Pre-Onboarding Settings module (Document Configuration, Consent Form Config, Link Expiry & Access).
 */
export class PreOnboardingKeywords {
  private readonly page: Page;
  private readonly preOnboardingPage: PreOnboardingPage;

  constructor(page: Page) {
    this.page = page;
    this.preOnboardingPage = new PreOnboardingPage(page);
  }

  /**
    * Navigate to the Settings page and open Pre-Onboarding Settings
    */
   async navigateToPreOnboardingSettings(): Promise<void> {
     // Step 1: Click sidebar toggle to expand the sidebar if collapsed
     try {
       const sidebarToggle = this.page.locator('button:has-text(">")').last();
       await sidebarToggle.waitFor({ state: 'visible', timeout: 3000 });
       await sidebarToggle.click();
       await await new Promise(resolve => setTimeout(resolve, 500));
     } catch (e) {
       // Sidebar may already be expanded
     }

     // Step 2: Click Settings in the sidebar navigation
     const settingsBtn = this.page.getByRole('button', { name: 'Settings', exact: true }).first();
     try {
       await settingsBtn.waitFor({ state: 'visible', timeout: 5000 });
       await settingsBtn.click();
       await this.page.waitForLoadState('networkidle');
       await await new Promise(resolve => setTimeout(resolve, 1000));
     } catch (e) {
       // Already on Settings page or Settings button not found, continue
     }

     // Step 3: Scroll down to bring Pre-Onboarding Settings into view
     await this.page.evaluate(() => {
       window.scrollBy(0, document.body.scrollHeight * 0.3);
     });
     await await new Promise(resolve => setTimeout(resolve, 1000));

     // Step 4: Click Pre-Onboarding Settings to expand the dropdown
     const preOnboardingDropdown = this.page.getByRole('button', { name: 'Pre-Onboarding Settings' }).first();
     await preOnboardingDropdown.waitFor({ state: 'visible', timeout: 10000 });
     await preOnboardingDropdown.click();
     await this.page.waitForLoadState('networkidle');
     await await new Promise(resolve => setTimeout(resolve, 1000));

     // Step 5: Click Dashboard sub-item
     const dashboardBtn = this.page.getByRole('button', { name: 'Dashboard' }).first();
     await dashboardBtn.waitFor({ state: 'visible', timeout: 10000 });
     await dashboardBtn.click();
     await this.page.waitForLoadState('networkidle');
     await await new Promise(resolve => setTimeout(resolve, 2000));
   }

  /**
   * Navigate to Document Configuration page
   */
  async navigateToDocumentConfiguration(): Promise<void> {
    await this.preOnboardingPage.clickDocumentConfiguration();
  }

  /**
   * Navigate to Consent Form Config page
   */
  async navigateToConsentFormConfig(): Promise<void> {
    await this.preOnboardingPage.clickConsentFormConfig();
  }

  /**
   * Navigate to Link Expiry & Access page
   */
  async navigateToLinkExpiryAccess(): Promise<void> {
    await this.preOnboardingPage.clickLinkExpiryAccess();
  }

  /**
   * Add a new document with the specified configuration
   */
  async addNewDocument(config: {
    country: string;
    documentName: string;
    documentGroup: string;
    requestedFor: string;
    employeeType: string;
    mandatory: boolean;
  }): Promise<void> {
    await this.preOnboardingPage.clickAddDocument();
    await this.preOnboardingPage.selectCountry(config.country);
    await this.preOnboardingPage.fillDocumentName(config.documentName);
    await this.preOnboardingPage.selectDocumentGroup(config.documentGroup);
    await this.preOnboardingPage.selectRequestedFor(config.requestedFor);
    await this.preOnboardingPage.selectEmployeeType(config.employeeType);
    await this.preOnboardingPage.toggleMandatory(config.mandatory);
    await this.preOnboardingPage.clickCreateDocument();
  }

  /**
   * Edit the Consent Form
   */
  async editConsentForm(): Promise<void> {
    await this.preOnboardingPage.clickEditConsentForm();
  }

  /**
   * Save the Consent Form changes
   */
  async saveConsentForm(): Promise<void> {
    await this.preOnboardingPage.clickSaveConsentForm();
  }

  /**
   * Configure Link Expiry policy
   */
  async configureLinkExpiry(days: number): Promise<void> {
    await this.preOnboardingPage.selectExpirationTimeframe(days);
    await this.preOnboardingPage.saveExpiryPolicy();
  }

  /**
   * Cancel the Add Document form
   */
  async cancelAddDocument(): Promise<void> {
    await this.preOnboardingPage.clickCancel();
  }
}


