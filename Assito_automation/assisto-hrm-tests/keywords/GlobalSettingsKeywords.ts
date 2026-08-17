import { type Page, expect } from '@playwright/test';
import { SettingsPage } from '@pages/GlobalSettingsPage';
import { BusinessUnitPage } from '@pages/BusinessUnitPage';

/**
 * SettingsKeywords provides high-level business actions for the Settings page.
 *
 * These methods combine multiple page interactions into readable operations
 * for navigating and interacting with the Settings module, covering:
 * - Company Settings (Basic Information + Regulatory & Statutory Numbers)
 * - Business Unit CRUD operations
 * - Column visibility management
 * - View / Edit / Add modal interactions
 * - Edge cases and negative scenarios
 */
export class SettingsKeywords {
  private readonly page: Page;
  private readonly settingsPage: SettingsPage;
  private readonly businessUnitPage: BusinessUnitPage;

  constructor(page: Page) {
    this.page = page;
    this.settingsPage = new SettingsPage(page);
    this.businessUnitPage = new BusinessUnitPage(page);
  }

  /**
   * Business unit codes must be unique (the API rejects duplicates with 409,
   * which keeps the modal open). Fixed test data would collide across runs,
   * so append a random suffix to the name and regenerate the code digits.
   */
  private uniqueUnitData(unitData: {
    name: string;
    code: string;
    unitHead: string;
    description?: string;
  }): {
    name: string;
    code: string;
    unitHead: string;
    description?: string;
  } {
    const suffix = String(Date.now() % 1000000) + Math.floor(Math.random() * 100);
    const dash = unitData.code.lastIndexOf('-');
    const prefix = (dash > -1 ? unitData.code.slice(0, dash) : 'BU')
      .replace(/[^a-zA-Z]/g, '');
    const paddedPrefix = (prefix + 'XXX').slice(0, 3).toUpperCase();
    return {
      ...unitData,
      name: `${unitData.name} ${suffix.slice(-4)}`,
      code: `${paddedPrefix}-${suffix.slice(-3)}`,
    };
  }

  // ==================== Navigation ====================

  /** Click the Global Settings dropdown to open it */
  async openGlobalSettingsDropdown(): Promise<void> {
    await this.settingsPage.clickGlobalSettingsDropdown();
  }

  /** Navigate to the Company Settings page */
  async navigateToCompanySettings(): Promise<void> {
    await this.settingsPage.goToCompanySettings();
  }

  /** Navigate to the Business Unit page */
  async navigateToBusinessUnit(): Promise<void> {
    await this.settingsPage.goToBusinessUnit();
  }

  // ==================== Company Settings - Basic Information ====================

  /**
   * Fill in the company profile basic information fields
   */
  async fillCompanyProfile(profile: {
    legalEntityName: string;
    superAdminEmail: string;
    publicContactEmail: string;
    registeredCountry: string;
    registeredState: string;
    operationalTimezone: string;
    corporateHeadquartersAddress: string;
  }): Promise<void> {
    await this.settingsPage.fillLegalEntityName(profile.legalEntityName);
    await this.settingsPage.fillSuperAdminEmail(profile.superAdminEmail);
    await this.settingsPage.fillPublicContactEmail(profile.publicContactEmail);
    await this.settingsPage.selectRegisteredCountry(profile.registeredCountry);
    await this.settingsPage.selectRegisteredState(profile.registeredState);
    await this.settingsPage.selectOperationalTimezone(profile.operationalTimezone);
    await this.settingsPage.fillCorporateHeadquartersAddress(
      profile.corporateHeadquartersAddress,
    );
  }

  /**
   * Fill in only the Regulatory & Statutory Numbers fields
   */
  async fillRegulatoryNumbers(regulatory: {
    pfRegistrationId?: string;
    incomeTaxRegistration?: string;
    panCardNumber?: string;
    esiRegistrationCode?: string;
    linLabourIdentification?: string;
    gstin?: string;
    cinCorporateIdentity?: string;
  }): Promise<void> {
    if (regulatory.pfRegistrationId) {
      await this.settingsPage.fillPfRegistrationId(regulatory.pfRegistrationId);
    }
    if (regulatory.incomeTaxRegistration) {
      await this.settingsPage.fillIncomeTaxRegistration(regulatory.incomeTaxRegistration);
    }
    if (regulatory.panCardNumber) {
      await this.settingsPage.fillPanCardNumber(regulatory.panCardNumber);
    }
    if (regulatory.esiRegistrationCode) {
      await this.settingsPage.fillEsiRegistrationCode(regulatory.esiRegistrationCode);
    }
    if (regulatory.linLabourIdentification) {
      await this.settingsPage.fillLinLabourIdentification(regulatory.linLabourIdentification);
    }
    if (regulatory.gstin) {
      await this.settingsPage.fillGstin(regulatory.gstin);
    }
    if (regulatory.cinCorporateIdentity) {
      await this.settingsPage.fillCinCorporateIdentity(regulatory.cinCorporateIdentity);
    }
  }

  /** Save the company profile settings */
  async saveCompanyProfile(): Promise<void> {
    await this.settingsPage.clickSaveSettings();
  }

  /** Click the Discard button to discard changes */
  async discardChanges(): Promise<void> {
    await this.settingsPage.clickDiscard();
  }

  /** Upload a brand asset image */
  async uploadBrandAsset(): Promise<void> {
    await this.settingsPage.clickBrandAssetUpload();
  }

  // ==================== Company Settings - Validation ====================

  /**
   * Attempt to save with empty basic info fields and expect validation errors.
   * This tests that required fields prevent saving.
   */
  async saveEmptyCompanyProfile(): Promise<void> {
    await this.settingsPage.fillLegalEntityName('');
    await this.settingsPage.fillSuperAdminEmail('');
    await this.settingsPage.fillPublicContactEmail('');
    await this.settingsPage.fillCorporateHeadquartersAddress('');
    await this.settingsPage.clickSaveSettings();
  }

  /**
   * Fill only required fields (legal entity name + corporate headquarters address)
   * and save to check that required-only validation passes.
   */
  async saveRequiredFieldsOnly(profile: {
    legalEntityName: string;
    corporateHeadquartersAddress: string;
  }): Promise<void> {
    await this.settingsPage.fillLegalEntityName(profile.legalEntityName);
    await this.settingsPage.fillCorporateHeadquartersAddress(profile.corporateHeadquartersAddress);
    await this.settingsPage.clickSaveSettings();
  }

  /**
   * Fill in invalid email formats and try to save.
   */
  async fillInvalidEmails(
    invalidSuperAdminEmail: string,
    invalidPublicContactEmail: string,
  ): Promise<void> {
    await this.settingsPage.fillSuperAdminEmail(invalidSuperAdminEmail);
    await this.settingsPage.fillPublicContactEmail(invalidPublicContactEmail);
  }

  /**
   * Fill in an extremely long legal entity name (over 255 chars) and save.
   */
  async fillExcessivelyLongName(longName: string): Promise<void> {
    await this.settingsPage.fillLegalEntityName(longName);
    await this.settingsPage.clickSaveSettings();
  }

  // ==================== Business Units - Add ====================

  /** Navigate to Business Unit page and click Add Unit button */
  async openAddUnitModal(): Promise<void> {
    await this.settingsPage.clickAddUnit();
  }

  /**
   * Fill in the New Business Unit form and save.
   * Steps: open modal -> fill name/code -> search & select unit head -> save.
   */
  async addBusinessUnit(unitData: {
    name: string;
    code: string;
    unitHead: string;
  }): Promise<void> {
    const data = this.uniqueUnitData(unitData);
    await this.openAddUnitModal();

    // Wait for the modal to appear
    await this.businessUnitPage.waitForModalVisible();

    // Fill name and code
    await this.businessUnitPage.fillBusinessUnitName(data.name);
    await this.businessUnitPage.fillBusinessUnitCode(data.code);

    // Search for and select the unit head
    await this.businessUnitPage.searchEmployee(data.unitHead);
    await this.businessUnitPage.selectEmployee(data.unitHead);

    // Save the record
    await this.businessUnitPage.clickSaveRecord();
  }

  /**
   * Fill in the New Business Unit form with a description and save.
   */
  async addBusinessUnitWithDescription(unitData: {
    name: string;
    code: string;
    unitHead: string;
    description: string;
  }): Promise<void> {
    const data = this.uniqueUnitData(unitData);
    await this.openAddUnitModal();

    // Wait for the modal to appear
    await this.businessUnitPage.waitForModalVisible();

    // Fill name and code
    await this.businessUnitPage.fillBusinessUnitName(data.name);
    await this.businessUnitPage.fillBusinessUnitCode(data.code);

    // Search for and select the unit head
    await this.businessUnitPage.searchEmployee(data.unitHead);
    await this.businessUnitPage.selectEmployee(data.unitHead);

    // Fill description
    await this.businessUnitPage.fillDescription(data.description!);

    // Save the record
    await this.businessUnitPage.clickSaveRecord();
  }

  /**
   * Attempt to add a Business Unit with empty name and code (validation test).
   */
  async addBusinessUnitWithEmptyFields(): Promise<void> {
    await this.openAddUnitModal();

    // Wait for the modal to appear
    await this.businessUnitPage.waitForModalVisible();

    // Leave fields empty, just click save
    await this.businessUnitPage.clickSaveRecord();
  }

  /**
   * Attempt to add a Business Unit with only name (code empty).
   */
  async addBusinessUnitWithMissingCode(): Promise<void> {
    await this.openAddUnitModal();

    await this.businessUnitPage.waitForModalVisible();
    await this.businessUnitPage.fillBusinessUnitName('Test Missing Code');

    // Save without filling code
    await this.businessUnitPage.clickSaveRecord();
  }

  /**
   * Cancel the New Business Unit modal without saving.
   */
  async cancelAddUnit(): Promise<void> {
    await this.businessUnitPage.clickCancel();
  }

  /**
   * Open Add Unit modal, fill name, then cancel.
   */
  async openAndCancelAddUnit(): Promise<void> {
    await this.openAddUnitModal();
    await this.businessUnitPage.waitForModalVisible();
    await this.businessUnitPage.fillBusinessUnitName('Cancelled Unit');
    await this.cancelAddUnit();
  }

  // ==================== Business Units - Edit ====================

  /**
   * Edit an existing Business Unit: click edit button on a row, fill description, save.
   */
  async editBusinessUnit(description?: string): Promise<void> {
    await this.settingsPage.clickEditButton();

    // Wait for the Edit Business Unit dialog
    await this.businessUnitPage.isEditDialogVisible();

    // Fill description if provided
    if (description) {
      await this.businessUnitPage.fillDescription(description);
    }

    // Save the record
    await this.businessUnitPage.clickSaveRecord();
  }

  /**
   * Edit an existing Business Unit by clicking the edit button and canceling.
   */
  async editAndCancelBusinessUnit(): Promise<void> {
    await this.settingsPage.clickEditButton();

    // Fill some data then cancel
    await this.businessUnitPage.fillDescription('Edited but cancelled');
    await this.businessUnitPage.clickCancel();
  }

  // ==================== Business Units - View ====================

  /**
   * Click the View (eye) button on the first row to open the view modal.
   */
  async viewBusinessUnit(): Promise<void> {
    await this.settingsPage.clickViewButton();
    await this.businessUnitPage.waitForViewModalVisible();
  }

  /**
   * Close the view modal.
   */
  async closeViewModal(): Promise<void> {
    await this.businessUnitPage.clickViewModalClose();
  }

  /**
   * Get the Unit Head value from the view modal.
   */
  async getViewModalUnitHead(): Promise<string> {
    return this.businessUnitPage.getViewModalUnitHead();
  }

  /**
   * Get the Status value from the view modal.
   */
  async getViewModalStatus(): Promise<string> {
    return this.businessUnitPage.getViewModalStatus();
  }

  /**
   * Get the Description value from the view modal.
   */
  async getViewModalDescription(): Promise<string> {
    return this.businessUnitPage.getViewModalDescription();
  }

  // ==================== Business Units - Columns ====================

  /** Open the columns dropdown to manage visible columns */
  async openColumnsDropdown(): Promise<void> {
    await this.settingsPage.openColumnsDropdown();
  }

  /** Toggle the SHOW/HIDE ALL checkbox */
  async toggleShowHideAll(): Promise<void> {
    await this.settingsPage.toggleShowHideAll();
  }

  /** Toggle a specific column (Business Unit, Unit Code, etc.) */
  async toggleBusinessUnitColumn(checked: boolean): Promise<void> {
    await this.settingsPage.toggleBusinessUnitColumn(checked);
  }

  /** Toggle Unit Code column */
  async toggleUnitCodeColumn(checked: boolean): Promise<void> {
    await this.settingsPage.toggleUnitCodeColumn(checked);
  }

  /** Toggle Unit Head column */
  async toggleUnitHeadColumn(checked: boolean): Promise<void> {
    await this.settingsPage.toggleUnitHeadColumn(checked);
  }

  /** Toggle Status column */
  async toggleStatusColumn(checked: boolean): Promise<void> {
    await this.settingsPage.toggleStatusColumn(checked);
  }

  /** Click the Reset button in columns dropdown */
  async resetColumns(): Promise<void> {
    await this.settingsPage.clickColumnsReset();
  }

  // ==================== Business Units - Counters ====================

  /** Get the Total Units count */
  async getTotalUnitsCount(): Promise<string> {
    return this.settingsPage.getTotalUnitsCount();
  }

  /** Get the With Unit Head count */
  async getWithUnitHeadCount(): Promise<string> {
    return this.settingsPage.getWithUnitHeadCount();
  }

  /** Get the Pending Head count */
  async getPendingHeadCount(): Promise<string> {
    return this.settingsPage.getPendingHeadCount();
  }

  // ==================== Network Error Detection ====================

  /**
   * Set up a network error listener that captures 4xx/5xx responses and
   * takes a DevTools screenshot on failure. Returns a function to remove the listener.
   */
  onNetworkError(handler: (response: import('@playwright/test').APIResponse) => void): () => void {
    const listener = (response: import('@playwright/test').APIResponse) => {
      const status = response.status();
      if (status >= 400 && status < 600) {
        handler(response);
      }
    };

    // Use the page's response event system
    (this.page as any).on('response', listener);

    // Return cleanup function
    return () => {
      (this.page as any).off('response', listener);
    };
  }

  /**
   * Take a screenshot with DevTools panel open (Console tab) for debugging.
   */
  async takeDevToolsScreenshot(screenshotPath: string): Promise<void> {
    // Open DevTools
    const context = this.page.context();
    await context.tracing.stop().catch(() => {});
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
  }

  /**
   * Wait for the page to fully load and all network requests to settle.
   */
  async waitForPageFullyLoaded(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  // ==================== Utility ====================

  /** Get the page locator for advanced operations */
  getPage(): Page {
    return this.page;
  }
}


