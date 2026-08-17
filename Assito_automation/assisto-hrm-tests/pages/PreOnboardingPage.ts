import { type Page, type Locator, expect } from '@playwright/test';

/**
 * PreOnboardingPage class encapsulates all locators and atomic UI actions
 * for the Pre-Onboarding Settings page in the HRM portal.
 */
export class PreOnboardingPage {
  private readonly page: Page;

  /** Pre-Onboarding Settings menu item in sidebar */
  private readonly preOnboardingMenuItem: Locator;

  /** Consent Form Config submenu item */
  private readonly consentFormConfigMenuItem: Locator;

  /** Link Expiry & Access submenu item */
  private readonly linkExpiryAccessMenuItem: Locator;

  /** Add Document button */
  private readonly addDocumentButton: Locator;

  /** Country dropdown */
  private readonly countryDropdown: Locator;

  /** Document Name input */
  private readonly documentNameInput: Locator;

  /** Document Group dropdown */
  private readonly documentGroupDropdown: Locator;

  /** Requested For dropdown */
  private readonly requestedForDropdown: Locator;

  /** Employee Type dropdown */
  private readonly employeeTypeDropdown: Locator;

  /** Mandatory toggle */
  private readonly mandatoryToggle: Locator;

  /** Multiple Sets toggle */
  private readonly multipleSetsToggle: Locator;

  /** Add Manual Property button */
  private readonly addManualPropertyButton: Locator;

  /** Create Document button */
  private readonly createDocumentButton: Locator;

  /** Cancel button */
  private readonly cancelButton: Locator;

  /** Edit button for Consent Form */
  private readonly editConsentFormButton: Locator;

  /** Save button for Consent Form */
  private readonly saveConsentFormButton: Locator;

  /** Expiration Timeframe Duration - Day 1 option */
  private readonly day1Option: Locator;

  /** Expiration Timeframe Duration - Day 5 option */
  private readonly day5Option: Locator;

  /** Expiration Timeframe Duration - Day 7 option */
  private readonly day7Option: Locator;

  /** Expiration Timeframe Duration - Day 15 option */
  private readonly day15Option: Locator;

  /** Expiration Timeframe Duration - Day 30 option */
  private readonly day30Option: Locator;

  /** Slider for dynamic day limit */
  private readonly expirySlider: Locator;

  /** Save Expiry Policy button */
  private readonly saveExpiryPolicyButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.preOnboardingMenuItem = page.getByRole('button', {
      name: 'Pre-Onboarding Settings',
    }).first();

    this.consentFormConfigMenuItem = page.getByRole('button', {
      name: 'Consent Form Config',
    }).first();

    this.linkExpiryAccessMenuItem = page.getByRole('button', {
      name: 'Link Expiry & Access',
    }).first();

    this.addDocumentButton = page.getByRole('button', {
      name: 'Add Document',
    });

    this.countryDropdown = page.getByRole('combobox').nth(0);

    this.documentNameInput = page.getByRole('textbox', {
      name: 'Document Name',
    });

    this.documentGroupDropdown = page.getByRole('combobox', {
      name: 'Document Group',
    });

    this.requestedForDropdown = page.getByRole('combobox', {
      name: 'Requested For',
    });

    this.employeeTypeDropdown = page.getByRole('combobox', {
      name: 'Employee Type',
    });

    // Mandatory switch - no name attribute, use position
    this.mandatoryToggle = page.getByRole('switch').nth(0);

    // Multiple Sets switch - second switch in the form
    this.multipleSetsToggle = page.getByRole('switch').nth(1);

    this.addManualPropertyButton = page.getByRole('button', {
      name: 'Add Manual Property',
    });

    this.createDocumentButton = page.getByRole('button', {
      name: 'Create Document',
    });

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel',
    });

    // Consent Form Edit button is the first icon button in the Action cell of the table
    this.editConsentFormButton = page.locator('table button').first();

    this.saveConsentFormButton = page.getByRole('button', {
      name: 'Save',
    });

    this.day1Option = page.getByRole('button', {
      name: '1 Day',
    });

    this.day5Option = page.getByRole('button', {
      name: '5 Days',
    });

    this.day7Option = page.getByRole('button', {
      name: '7 Days',
    });

    this.day15Option = page.getByRole('button', {
      name: '15 Days',
    });

    this.day30Option = page.getByRole('button', {
      name: '30 Days',
    });

    this.expirySlider = page.getByRole('slider');

    this.saveExpiryPolicyButton = page.getByRole('button', {
      name: 'Save Expiry Policy',
    });
  }

  /** Click Pre-Onboarding Settings menu item */
  async clickPreOnboardingSettings(): Promise<void> {
    await this.preOnboardingMenuItem.click();
  }

  /**
   * Navigate to the Document Configuration page.
   * Document Templates is served at /system/settings/documents/employee-docs under Settings → Documents.
   */
  async clickDocumentConfiguration(): Promise<void> {
    await this.page.goto('/system/settings/documents/employee-docs', {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForLoadState('networkidle');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  /** Click Consent Form Config menu item */
  async clickConsentFormConfig(): Promise<void> {
    await this.ensurePreOnboardingSubmenuExpanded(this.consentFormConfigMenuItem);
    await this.consentFormConfigMenuItem.click();
  }

  /** Click Link Expiry & Access menu item */
  async clickLinkExpiryAccess(): Promise<void> {
    await this.ensurePreOnboardingSubmenuExpanded(this.linkExpiryAccessMenuItem);
    await this.linkExpiryAccessMenuItem.click();
  }

  /**
   * Expand the Pre-Onboarding Settings submenu in the sidebar if the given
   * submenu item is not currently visible (e.g. after a full page navigation
   * collapsed the sidebar submenu).
   */
  private async ensurePreOnboardingSubmenuExpanded(target: Locator): Promise<void> {
    try {
      await target.waitFor({ state: 'visible', timeout: 2000 });
      return;
    } catch {
      // Submenu is collapsed - expand it below
    }
    await this.preOnboardingMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.preOnboardingMenuItem.click();
    await this.page.waitForLoadState('networkidle');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /** Click Add Document button */
  async clickAddDocument(): Promise<void> {
    await this.addDocumentButton.click();
  }

  /** Select country from dropdown (tag-picker with search) */
  async selectCountry(country: string): Promise<void> {
    const countryCombo = this.page.getByPlaceholder('Select countries');
    await countryCombo.waitFor({ state: 'visible', timeout: 10000 });
    await countryCombo.click();
    await countryCombo.fill(country);
    // Wait for filtered option and click
    await this.page.getByRole('option', { name: country, exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('option', { name: country, exact: true }).click();
  }

  /** Fill document name */
  async fillDocumentName(name: string): Promise<void> {
    await this.documentNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.documentNameInput.fill(name);
  }

  /** Select document group from combobox */
  async selectDocumentGroup(group: string): Promise<void> {
    const groupCombo = this.page.getByRole('combobox', { name: 'Document Group' });
    await groupCombo.waitFor({ state: 'visible', timeout: 10000 });
    await groupCombo.click();
    await groupCombo.fill(group);
    await this.page.getByRole('option', { name: group, exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('option', { name: group, exact: true }).click();
  }

  /** Select requested for type from combobox */
  async selectRequestedFor(type: string): Promise<void> {
    const reqCombo = this.page.getByRole('combobox', { name: 'Requested For' });
    await reqCombo.waitFor({ state: 'visible', timeout: 10000 });
    await reqCombo.click();
    await reqCombo.fill(type);
    await this.page.getByRole('option', { name: type, exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('option', { name: type, exact: true }).click();
  }

  /** Select employee type from dropdown (tag-picker) */
  async selectEmployeeType(type: string): Promise<void> {
    const empCombo = this.page.getByPlaceholder('Select employee types');
    await empCombo.waitFor({ state: 'visible', timeout: 10000 });
    await empCombo.click();
    await empCombo.fill(type);
    await this.page.getByRole('option', { name: type, exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByRole('option', { name: type, exact: true }).click();
  }

  /** Toggle mandatory */
  async toggleMandatory(enabled: boolean): Promise<void> {
    await this.mandatoryToggle.waitFor({ state: 'visible', timeout: 10000 });
    const isChecked = await this.mandatoryToggle.isChecked();
    if (isChecked !== enabled) {
      await this.mandatoryToggle.click();
    }
  }

  /** Toggle multiple sets */
  async toggleMultipleSets(enabled: boolean): Promise<void> {
    await this.multipleSetsToggle.waitFor({ state: 'visible', timeout: 10000 });
    const isChecked = await this.multipleSetsToggle.isChecked();
    if (isChecked !== enabled) {
      await this.multipleSetsToggle.click();
    }
  }

  /** Click Add Manual Property button */
  async clickAddManualProperty(): Promise<void> {
    await this.addManualPropertyButton.click();
  }

  /**
   * Delete a document template from Settings > Documents > Employee Documents.
   *
   * Templates created by tests are tenant-wide configuration: a leftover
   * MANDATORY Id Proof template makes every candidate's Document Upload step
   * unsubmittable, which blocks the whole pre-onboarding suite. So anything a
   * test creates here has to be removed again.
   *
   * The row's trailing red icon button opens a "Delete Document" confirmation
   * naming the template; the confirmation text is checked before confirming so
   * this can never delete the wrong row.
   *
   * @param documentName - Exact template name as shown in the grid
   * @returns true if the template was found and deleted, false if absent
   */
  async deleteDocumentTemplate(documentName: string): Promise<boolean> {
    const row = this.page
      .getByRole('row')
      .filter({ hasText: documentName })
      .first();

    if ((await row.count()) === 0) {
      return false;
    }

    const buttons = row.locator('button');
    const buttonCount = await buttons.count();
    if (buttonCount === 0) {
      return false;
    }
    await buttons.nth(buttonCount - 1).click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 10000 });

    // Guard against deleting a different template than intended.
    const dialogText = (await dialog.textContent()) ?? '';
    if (!dialogText.includes(documentName)) {
      throw new Error(
        `[deleteDocumentTemplate] Confirmation dialog does not name "${documentName}" ` +
          `— refusing to delete. Dialog said: ${dialogText.trim().slice(0, 200)}`,
      );
    }

    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    return true;
  }

  /** Click Create Document button */
  async clickCreateDocument(): Promise<void> {
    await this.createDocumentButton.click();

    // The app shows a "Create Document" confirmation dialog - confirm it so the
    // document is actually created and the modal closes.
    const dialogConfirm = this.page
      .getByRole('dialog', { name: 'Create Document' })
      .getByRole('button', { name: 'Create Document' });
    try {
      await dialogConfirm.waitFor({ state: 'visible', timeout: 5000 });
      await dialogConfirm.click();
    } catch {
      // No confirmation dialog (e.g. client-side validation blocked the save) - ignore
    }
  }

  /** Click Cancel button */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Click Edit button for Consent Form */
  async clickEditConsentForm(): Promise<void> {
    await this.editConsentFormButton.click();
  }

  /** Click Save button for Consent Form, confirming the save dialog if shown */
  async clickSaveConsentForm(): Promise<void> {
    await this.saveConsentFormButton.click();
    // The app shows a "Save Consent Form" confirmation dialog - confirm it
    const dialogSave = this.page
      .getByRole('dialog', { name: 'Save Consent Form' })
      .getByRole('button', { name: 'Save' });
    try {
      await dialogSave.waitFor({ state: 'visible', timeout: 3000 });
      await dialogSave.click();
    } catch {
      // No confirmation dialog (e.g. validation blocked the save) - ignore
    }
  }

  /** Select expiration timeframe */
  async selectExpirationTimeframe(days: number): Promise<void> {
    switch (days) {
      case 1:
        await this.day1Option.click();
        break;
      case 5:
        await this.day5Option.click();
        break;
      case 7:
        await this.day7Option.click();
        break;
      case 15:
        await this.day15Option.click();
        break;
      case 30:
        await this.day30Option.click();
        break;
      default:
        // Use slider for custom days
        const box = await this.expirySlider.boundingBox();
        if (box) {
          const clickX = (days / 90) * box.width;
          await this.expirySlider.click({
            clickCount: 1,
            delay: 10,
            force: false,
            modifiers: [],
            position: {
              x: clickX,
              y: 5,
            },
          });
        }
    }
  }

  /** Save Expiry Policy */
  async saveExpiryPolicy(): Promise<void> {
    await this.saveExpiryPolicyButton.click();
  }

  /** Check if Add Document modal is visible */
  async isAddDocumentModalVisible(): Promise<boolean> {
    return this.documentNameInput.isVisible();
  }

  /** Check if Consent Form edit mode is active */
  async isConsentFormEditMode(): Promise<boolean> {
    return this.saveConsentFormButton.isVisible();
  }

  /** Check if Link Expiry page is visible */
  async isLinkExpiryPageVisible(): Promise<boolean> {
    return this.saveExpiryPolicyButton.isVisible();
  }
}


