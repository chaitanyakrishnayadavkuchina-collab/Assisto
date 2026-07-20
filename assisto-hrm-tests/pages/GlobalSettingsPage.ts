import { type Page, type Locator, expect } from '@playwright/test';

/**
 * SettingsPage class encapsulates all locators and atomic UI actions
 * for the Company Profile/Settings page in the HRM portal.
 */
export class SettingsPage {
  private readonly page: Page;

  /** Global Settings dropdown */
  private readonly globalSettingsDropdown: Locator;

  /** Sidebar expand/toggle button (the '>' chevron at bottom of collapsed sidebar) */
  private readonly sidebarToggleButton: Locator;

  /** Settings link in the main sidebar navigation */
  private readonly sidebarSettingsLink: Locator;

  /** Company Settings button within dropdown */
  private readonly companySettingsLink: Locator;

  /** Business Unit button within dropdown */
  private readonly businessUnitLink: Locator;

  /** Brand Asset upload area */
  private readonly brandAssetUpload: Locator;

  /** Basic Information - Legal Entity Name input */
  private readonly legalEntityNameInput: Locator;

  /** Basic Information - Super-Admin Email input */
  private readonly superAdminEmailInput: Locator;

  /** Basic Information - Public Contact Email input */
  private readonly publicContactEmailInput: Locator;

  /** Basic Information - Registered Country select */
  private readonly registeredCountrySelect: Locator;

  /** Basic Information - Registered State select */
  private readonly registeredStateSelect: Locator;

  /** Basic Information - Operational Timezone select */
  private readonly operationalTimezoneSelect: Locator;

  /** Basic Information - Corporate Headquarters Address input */
  private readonly corporateHeadquartersAddressInput: Locator;

  /** Regulatory & Statutory Numbers - PF Registration ID */
  private readonly pfRegistrationIdInput: Locator;

  /** Regulatory & Statutory Numbers - Income Tax Registration */
  private readonly incomeTaxRegistrationInput: Locator;

  /** Regulatory & Statutory Numbers - PAN Card Number */
  private readonly panCardNumberInput: Locator;

  /** Regulatory & Statutory Numbers - ESI Registration Code */
  private readonly esiRegistrationCodeInput: Locator;

  /** Regulatory & Statutory Numbers - LIN (Labour Identification) */
  private readonly linLabourIdentificationInput: Locator;

  /** Regulatory & Statutory Numbers - GSTIN */
  private readonly gstinInput: Locator;

  /** Regulatory & Statutory Numbers - CIN (Corporate Identity Certificate) */
  private readonly cinCorporateIdentityInput: Locator;

  /** Save Settings button */
  private readonly saveSettingsButton: Locator;

  /** Discard button */
  private readonly discardButton: Locator;

  /** Add Unit button on Business Units page */
  private readonly addUnitButton: Locator;

  /** Columns dropdown toggle on Business Units page */
  private readonly columnsDropdownButton: Locator;

  /** Show/Hide All checkbox in columns dropdown */
  private readonly showHideAllCheckbox: Locator;

  /** Business Unit column checkbox */
  private readonly businessUnitColumnCheckbox: Locator;

  /** Unit Code column checkbox */
  private readonly unitCodeColumnCheckbox: Locator;

  /** Unit Head column checkbox */
  private readonly unitHeadColumnCheckbox: Locator;

  /** Status column checkbox */
  private readonly statusColumnCheckbox: Locator;

  /** Reset button in columns dropdown */
  private readonly columnsResetButton: Locator;

  /** View button (eye icon) per row in Business Unit table */
  private readonly viewButton: Locator;

  /** Edit button (pen icon) per row in Business Unit table */
  private readonly editButton: Locator;

  /** View modal dialog */
  private readonly viewModal: Locator;

  /** View modal Close button */
  private readonly viewModalCloseButton: Locator;

  /** View modal Unit Head display */
  private readonly viewModalUnitHead: Locator;

  /** View modal Status display */
  private readonly viewModalStatus: Locator;

  /** View modal Description display */
  private readonly viewModalDescription: Locator;

  /** Total Units counter */
  private readonly totalUnitsCounter: Locator;

  /** With Unit Head counter */
  private readonly withUnitHeadCounter: Locator;

  /** Pending Head counter */
  private readonly pendingHeadCounter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar toggle button (expand collapsed sidebar) - the '>' chevron at bottom-left
    this.sidebarToggleButton = page.locator('button.sidebar-toggle, button[aria-label="expand"], button:has-text(">")').last();

    // Settings button in the main sidebar navigation (visible when sidebar is expanded)
    // Note: Settings is a button element in the sidebar, not a link
    this.sidebarSettingsLink = page.getByRole('button', { name: 'Settings', exact: true }).first();

    // The dropdown button is labeled "Settings" with class "hrm-nav-btn" and aria-label="Settings"
    // Using both class and aria-label to uniquely identify it among multiple "Settings" text elements
    this.globalSettingsDropdown = page
      .locator('button.hrm-nav-btn[aria-label="Settings"]')
      .first();

    // These are buttons in the dropdown, not links (confirmed via page snapshot)
    this.companySettingsLink = page.getByRole('button', {
      name: 'Company Settings',
    });

    this.businessUnitLink = page.getByRole('button', {
      name: 'Business Unit',
    });

    this.brandAssetUpload = page.getByRole('button', {
      name: 'Upload',
    });

    // Basic Information fields - labels are in sibling generic elements, not aria-label
    // Use XPath to navigate from label text to parent container, then find textbox inside
    this.legalEntityNameInput = page.locator('xpath=//*[contains(text(),"Legal Entity Name")]/..//input').first();

    this.superAdminEmailInput = page.locator('xpath=//*[contains(text(),"Super-Admin Email")]/..//input').first();

    this.publicContactEmailInput = page.locator('xpath=//*[contains(text(),"Public Contact Email")]/..//input').first();

    // Basic Information - Dropdown fields
    // Use the same XPath pattern as text inputs, targeting the combobox input
    this.registeredCountrySelect = page.locator('xpath=//*[contains(text(),"Registered Country")]/..//input[@role="combobox"]');
    this.registeredStateSelect = page.locator('xpath=//*[contains(text(),"Registered State")]/..//input[@role="combobox"]');
    this.operationalTimezoneSelect = page.locator('xpath=//*[contains(text(),"Operational Timezone")]/..//input[@role="combobox"]');

    // Corporate Headquarters Address - actually a textarea, not an input element
    this.corporateHeadquartersAddressInput = page.locator('xpath=//*[contains(text(),"Corporate Headquarters Address")]/..//textarea');

    // Regulatory & Statutory Numbers fields - use XPath pattern
    this.pfRegistrationIdInput = page.locator('xpath=//*[contains(text(),"PF Registration ID")]/..//input');
    this.incomeTaxRegistrationInput = page.locator('xpath=//*[contains(text(),"Income Tax Registration")]/..//input');
    this.panCardNumberInput = page.locator('xpath=//*[contains(text(),"PAN Card Number")]/..//input');
    this.esiRegistrationCodeInput = page.locator('xpath=//*[contains(text(),"ESI Registration Code")]/..//input');
    this.linLabourIdentificationInput = page.locator('xpath=//*[contains(text(),"LIN (Labour Identification)")]/..//input');
    this.gstinInput = page.locator('xpath=//*[contains(text(),"GSTIN")]/..//input');
    this.cinCorporateIdentityInput = page.locator('xpath=//*[contains(text(),"CIN (Corporate Identity Certificate)")]/..//input');

    // Save / Discard
    this.saveSettingsButton = page.getByRole('button', {
      name: 'Save Settings',
    });

    this.discardButton = page.getByRole('button', {
      name: 'Discard',
    });

    // Business Units page - Add Unit
    this.addUnitButton = page.getByRole('button', {
      name: 'Add Unit',
    });

    // Business Units page - Columns dropdown
    this.columnsDropdownButton = page.getByRole('button', {
      name: 'Columns',
    });

    this.showHideAllCheckbox = page.getByRole('checkbox', {
      name: 'SHOW/HIDE ALL',
    });

    this.businessUnitColumnCheckbox = page.getByRole('checkbox', {
      name: 'Business Unit',
    });

    this.unitCodeColumnCheckbox = page.getByRole('checkbox', {
      name: 'Unit Code',
    });

    this.unitHeadColumnCheckbox = page.getByRole('checkbox', {
      name: 'Unit Head',
    });

    this.statusColumnCheckbox = page.getByRole('checkbox', {
      name: 'Status',
    });

    this.columnsResetButton = page.getByRole('button', {
      name: 'Reset',
    });

    // Business Units page - view/edit action buttons (first row)
    // Use aria-label with exact match on the button's actual label text
    this.viewButton = page.getByRole('button', { name: 'View', exact: true }).first();
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true }).first();

    // View modal - more specific locator targeting the modal with heading and Unit Head content
    this.viewModal = page
      .locator('[role="dialog"]')
      .filter({ has: page.getByRole('heading', { level: 2 }) })
      .first();

    // Close button scoped to view modal - use data-testid to avoid strict mode violation
    // The actual Close button in the modal footer has data-testid="modal-secondary-action-btn"
    this.viewModalCloseButton = this.viewModal.getByTestId('modal-secondary-action-btn');

    // View modal Unit Head - find the label text and get the value next to it
    this.viewModalUnitHead = this.viewModal.locator('text=Unit Head').locator('..').locator('text=Active').first();

    // View modal Status - find the status value
    this.viewModalStatus = this.viewModal.locator('text=Active').first();

    // View modal Description - find the description value
    this.viewModalDescription = this.viewModal.locator('text=Description').locator('..').locator('text=Active').first();

    // Counters - the DOM structure is:
    // container > label ("TOTAL UNITS") + number ("28") as sibling elements
    // Note: "generic" in Playwright snapshots is not a real HTML tag; use * wildcard
    this.totalUnitsCounter = page.locator('xpath=//*[contains(.,"TOTAL UNITS")]/following-sibling::*[1]');
    this.withUnitHeadCounter = page.locator('xpath=//*[contains(.,"WITH UNIT HEAD")]/following-sibling::*[1]');
    this.pendingHeadCounter = page.locator('xpath=//*[contains(.,"PENDING HEAD")]/following-sibling::*[1]');
  }

  // ==================== Global Settings Dropdown ====================

  /** Navigate to Company Settings page */
  async goToCompanySettings(): Promise<void> {
    // Step 1: Click the sidebar toggle button to expand the sidebar
    try {
      await this.sidebarToggleButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.sidebarToggleButton.click();
      await await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      // Sidebar might already be expanded, continue
    }

    // Step 2: Scroll down to find Settings in the sidebar
    await this.page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Click Settings in the sidebar navigation
    await this.sidebarSettingsLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.sidebarSettingsLink.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    await await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Now click Company Settings button (in the Settings sub-navigation dropdown)
    await this.companySettingsLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.companySettingsLink.click();
    // Wait for the Legal Entity Name input to be visible
    await this.legalEntityNameInput.waitFor({ state: 'visible', timeout: 15000 });
    // Wait for the page to fully load
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }

  /** Navigate to Business Unit page */
  async goToBusinessUnit(): Promise<void> {
    // Step 1: Click the sidebar toggle button to expand the sidebar
    try {
      await this.sidebarToggleButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.sidebarToggleButton.click();
      await await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      // Sidebar might already be expanded, continue
    }

    // Step 2: Scroll down to find Settings in the sidebar
    await this.page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Click Settings in the sidebar navigation
    await this.sidebarSettingsLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.sidebarSettingsLink.click();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    await await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Click Business Unit in the settings dropdown
    await this.businessUnitLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.businessUnitLink.click();
    // Wait for the page to fully load
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    // Wait for the Add Unit button to be visible
    await this.addUnitButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  // ==================== Company Settings - Basic Information ====================

  /** Click the brand asset upload button */
  async clickBrandAssetUpload(): Promise<void> {
    await this.brandAssetUpload.click();
  }

  /** Fill Legal Entity Name */
  async fillLegalEntityName(name: string): Promise<void> {
    // Wait for the input to be visible before filling
    await this.legalEntityNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.legalEntityNameInput.fill(name, { force: name !== '' });
  }

  /** Fill Super-Admin Email */
  async fillSuperAdminEmail(email: string): Promise<void> {
    // Super-Admin Email is a disabled field showing the org email
    // Remove disabled attribute via JS before filling
    if (email !== '') {
      await this.superAdminEmailInput.evaluate((el) => el.removeAttribute('disabled'));
      await this.superAdminEmailInput.fill(email);
    }
  }

  /** Fill Public Contact Email */
  async fillPublicContactEmail(email: string): Promise<void> {
    await this.publicContactEmailInput.fill(email);
  }

  /** Helper: select from a combobox dropdown by text */
  async selectFromDropdown(comboboxLocator: Locator, value: string): Promise<void> {
    // Click the combobox to open the dropdown
    await comboboxLocator.click();
    
    // Wait a brief moment for the listbox to render
    await await new Promise(resolve => setTimeout(resolve, 300));
    
    // Use evaluate to find the option with matching text anywhere on the page and click it
    const clicked = await this.page.evaluate((searchText: string) => {
      const allElements = document.querySelectorAll('[role="option"]');
      for (const el of allElements) {
        const text = (el.textContent || '').trim();
        if (text === searchText) {
          (el as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, value);
    
    if (clicked) {
      await await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    
    // Fallback: try broader text match
    const option = this.page.locator(`[role="option"]:has-text("${value}")`).first();
    await option.waitFor({ state: 'visible', timeout: 8000 });
    await option.click();
    await await new Promise(resolve => setTimeout(resolve, 300));
  }

  /** Select a country from the dropdown */
  async selectRegisteredCountry(country: string): Promise<void> {
    if (country === '') return;
    await this.selectFromDropdown(this.registeredCountrySelect, country);
    await await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Select a state from the dropdown */
  async selectRegisteredState(state: string): Promise<void> {
    if (state === '') return;
    await this.selectFromDropdown(this.registeredStateSelect, state);
    await await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Select a timezone from the dropdown */
  async selectOperationalTimezone(timezone: string): Promise<void> {
    if (timezone === '') return;
    await this.selectFromDropdown(this.operationalTimezoneSelect, timezone);
    await await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Fill Corporate Headquarters Address */
  async fillCorporateHeadquartersAddress(address: string): Promise<void> {
    await this.corporateHeadquartersAddressInput.fill(address);
  }

  // ==================== Company Settings - Regulatory & Statutory Numbers ====================

  /** Fill PF Registration ID */
  async fillPfRegistrationId(pfId: string): Promise<void> {
    await this.pfRegistrationIdInput.fill(pfId);
  }

  /** Fill Income Tax Registration */
  async fillIncomeTaxRegistration(taxReg: string): Promise<void> {
    await this.incomeTaxRegistrationInput.fill(taxReg);
  }

  /** Fill PAN Card Number */
  async fillPanCardNumber(pan: string): Promise<void> {
    await this.panCardNumberInput.fill(pan);
  }

  /** Fill ESI Registration Code */
  async fillEsiRegistrationCode(code: string): Promise<void> {
    await this.esiRegistrationCodeInput.fill(code);
  }

  /** Fill LIN (Labour Identification) */
  async fillLinLabourIdentification(lin: string): Promise<void> {
    await this.linLabourIdentificationInput.fill(lin);
  }

  /** Fill GSTIN */
  async fillGstin(gstin: string): Promise<void> {
    await this.gstinInput.fill(gstin);
  }

  /** Fill CIN (Corporate Identity Certificate) */
  async fillCinCorporateIdentity(cin: string): Promise<void> {
    await this.cinCorporateIdentityInput.fill(cin);
  }

  // ==================== Company Settings - Save / Discard ====================

  /** Click Save Settings button */
  async clickSaveSettings(): Promise<void> {
    await this.saveSettingsButton.click();
  }

  /** Click Discard button */
  async clickDiscard(): Promise<void> {
    await this.discardButton.click();
  }

  // ==================== Business Units - Add Unit ====================

  /** Click Add Unit button on Business Units page */
  async clickAddUnit(): Promise<void> {
    await this.addUnitButton.click();
  }

  // ==================== Business Units - Columns Dropdown ====================

  /** Open the columns dropdown */
  async openColumnsDropdown(): Promise<void> {
    await this.columnsDropdownButton.click();
  }

  /** Check/Uncheck SHOW/HIDE ALL */
  async toggleShowHideAll(): Promise<void> {
    await this.showHideAllCheckbox.check({ force: true });
  }

  /** Check/Uncheck Business Unit column */
  async toggleBusinessUnitColumn(checked: boolean): Promise<void> {
    if (checked) {
      await this.businessUnitColumnCheckbox.check({ force: true });
    } else {
      await this.businessUnitColumnCheckbox.uncheck({ force: true });
    }
  }

  /** Check/Uncheck Unit Code column */
  async toggleUnitCodeColumn(checked: boolean): Promise<void> {
    if (checked) {
      await this.unitCodeColumnCheckbox.check({ force: true });
    } else {
      await this.unitCodeColumnCheckbox.uncheck({ force: true });
    }
  }

  /** Check/Uncheck Unit Head column */
  async toggleUnitHeadColumn(checked: boolean): Promise<void> {
    if (checked) {
      await this.unitHeadColumnCheckbox.check({ force: true });
    } else {
      await this.unitHeadColumnCheckbox.uncheck({ force: true });
    }
  }

  /** Check/Uncheck Status column */
  async toggleStatusColumn(checked: boolean): Promise<void> {
    if (checked) {
      await this.statusColumnCheckbox.check({ force: true });
    } else {
      await this.statusColumnCheckbox.uncheck({ force: true });
    }
  }

  /** Click Reset in columns dropdown */
  async clickColumnsReset(): Promise<void> {
    await this.columnsResetButton.click();
  }

  // ==================== Business Units - View Modal ====================

  /** Click the View button on the first row */
  async clickViewButton(): Promise<void> {
    await this.viewButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.viewButton.click();
  }

  /** Check if the view modal is visible */
  async isViewModalVisible(): Promise<boolean> {
    return this.viewModal.isVisible().catch(() => false);
  }

  /** Click the Close button in the view modal */
  async clickViewModalClose(): Promise<void> {
    await this.viewModalCloseButton.click();
  }

  /** Get the Unit Head value from the view modal */
  async getViewModalUnitHead(): Promise<string> {
    const text = await this.viewModalUnitHead.textContent();
    return text ? text.trim() : '';
  }

  /** Get the Status value from the view modal */
  async getViewModalStatus(): Promise<string> {
    const text = await this.viewModalStatus.textContent();
    return text ? text.trim() : '';
  }

  /** Get the Description value from the view modal */
  async getViewModalDescription(): Promise<string> {
    const text = await this.viewModalDescription.textContent();
    return text ? text.trim() : '';
  }

  // ==================== Business Units - Edit Form ====================

  /** Click the Edit button on the first row */
  async clickEditButton(): Promise<void> {
    await this.editButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.editButton.click();
  }

  // ==================== Business Units - Counters ====================

  /** Helper to get a counter value from its label text */
  private async getCounterValue(labelText: string): Promise<string> {
    // Use Playwright's evaluate to find the card container and extract the number.
    // The DOM structure from snapshots shows label and number as sibling elements
    // within a card container.
    const value = await this.page.evaluate((label: string) => {
      const allElements: Element[] = [];
      const walk = (node: Node) => {
        allElements.push(node as Element);
        node.childNodes.forEach(walk);
      };
      walk(document.body);

      for (const el of allElements) {
        const text = (el.textContent || '').trim();
        if (text !== label) continue;

        // Found the label element. Look for a sibling or child that contains only digits.
        // Strategy 1: Check next sibling
        let sibling = el.nextElementSibling;
        while (sibling) {
          const t = sibling.textContent?.trim();
          if (t && t.match(/^\d+$/)) return t;
          sibling = sibling.nextElementSibling;
        }

        // Strategy 2: Check children of next sibling
        let ns = el.nextElementSibling;
        if (ns) {
          for (const child of Array.from(ns.children)) {
            const ct = child.textContent?.trim();
            if (ct && ct.match(/^\d+$/)) return ct;
          }
        }

        // Strategy 3: Check parent's other children
        let parent = el.parentElement;
        if (parent) {
          for (const child of Array.from(parent.children)) {
            if (child !== el) {
              const ct = child.textContent?.trim();
              if (ct && ct.match(/^\d+$/)) return ct;
              // Also check deeper
              const deepMatch = child.querySelector('[class*="number"]') || child;
              const dt = deepMatch.textContent?.trim();
              if (dt && dt.match(/^\d+$/)) return dt;
            }
          }
        }

        // Strategy 4: Search siblings for element whose text contains the label
        for (const candidate of allElements) {
          const cText = (candidate.textContent || '').trim();
          if (cText === label && candidate !== el) {
            // Walk up from this candidate to find a sibling with digits
            let cParent = candidate.parentElement;
            if (cParent) {
              for (const child of Array.from(cParent.children)) {
                if (child !== candidate) {
                  const ct = child.textContent?.trim();
                  if (ct && ct.match(/^\d+$/)) return ct;
                }
              }
            }
          }
        }
      }
      return '';
    }, labelText);
    return value || '';
  }

  /** Get the Total Units count */
  async getTotalUnitsCount(): Promise<string> {
    return this.getCounterValue('TOTAL UNITS');
  }

  /** Get the With Unit Head count */
  async getWithUnitHeadCount(): Promise<string> {
    return this.getCounterValue('WITH UNIT HEAD');
  }

  /** Get the Pending Head count */
  async getPendingHeadCount(): Promise<string> {
    return this.getCounterValue('PENDING HEAD');
  }

  // ==================== Utility Methods ====================

  /** Check if the page is the Company Settings page */
  async isCompanySettingsPage(): Promise<boolean> {
    try {
      await this.legalEntityNameInput.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Check if the page is the Business Unit page */
  async isBusinessUnitPage(): Promise<boolean> {
    try {
      await this.addUnitButton.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  // ==================== Public Accessors ====================

  /** Get the Legal Entity Name input locator */
  getLegalEntityNameInput(): Locator {
    return this.legalEntityNameInput;
  }

  /** Get the Super-Admin Email input locator */
  getSuperAdminEmailInput(): Locator {
    return this.superAdminEmailInput;
  }

  /** Get the Public Contact Email input locator */
  getPublicContactEmailInput(): Locator {
    return this.publicContactEmailInput;
  }

  /** Get the Registered Country select locator */
  getRegisteredCountrySelect(): Locator {
    return this.registeredCountrySelect;
  }

  /** Get the Registered State select locator */
  getRegisteredStateSelect(): Locator {
    return this.registeredStateSelect;
  }

  /** Get the Operational Timezone select locator */
  getOperationalTimezoneSelect(): Locator {
    return this.operationalTimezoneSelect;
  }

  /** Get the Corporate Headquarters Address input locator */
  getCorporateHeadquartersAddressInput(): Locator {
    return this.corporateHeadquartersAddressInput;
  }

  /** Get the PF Registration ID input locator */
  getPfRegistrationIdInput(): Locator {
    return this.pfRegistrationIdInput;
  }

  /** Get the Income Tax Registration input locator */
  getIncomeTaxRegistrationInput(): Locator {
    return this.incomeTaxRegistrationInput;
  }

  /** Get the PAN Card Number input locator */
  getPanCardNumberInput(): Locator {
    return this.panCardNumberInput;
  }

  /** Get the ESI Registration Code input locator */
  getEsiRegistrationCodeInput(): Locator {
    return this.esiRegistrationCodeInput;
  }

  /** Get the LIN (Labour Identification) input locator */
  getLinLabourIdentificationInput(): Locator {
    return this.linLabourIdentificationInput;
  }

  /** Get the GSTIN input locator */
  getGstinInput(): Locator {
    return this.gstinInput;
  }

  /** Get the CIN (Corporate Identity Certificate) input locator */
  getCinCorporateIdentityInput(): Locator {
    return this.cinCorporateIdentityInput;
  }
}


