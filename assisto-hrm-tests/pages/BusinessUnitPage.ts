import { type Page, type Locator, expect } from '@playwright/test';

/**
 * BusinessUnitPage class encapsulates all locators and atomic UI actions
 * for the Business Unit management pages - both the list view and the
 * New/Edit Business Unit modal dialogs.
 */
export class BusinessUnitPage {
  private readonly page: Page;

  /** New Business Unit button/link */
  private readonly newBusinessUnitButton: Locator;

  /** Business Unit Name input */
  private readonly businessUnitNameInput: Locator;

  /** Business Unit Code input */
  private readonly businessUnitCodeInput: Locator;

  /** Unit Head search field */
  private readonly unitHeadSearchField: Locator;

  /** Unit Head dropdown/list */
  private readonly unitHeadDropdown: Locator;

  /** Employee option in the Unit Head dropdown */
  private readonly employeeOption: Locator;

  /** Cancel button in the modal */
  private readonly cancelButton: Locator;

  /** Save Record button in the modal */
  private readonly saveRecordButton: Locator;

  /** Close button in the view modal */
  private readonly viewModalCloseButton: Locator;

  /** View modal container */
  private readonly viewModal: Locator;

  /** View modal unit head info */
  private readonly viewModalUnitHead: Locator;

  /** View modal status info */
  private readonly viewModalStatus: Locator;

  /** View modal description info */
  private readonly viewModalDescription: Locator;

  /** Edit Business Unit dialog title */
  private readonly editDialogTitle: Locator;

  /** New Business Unit dialog title */
  private readonly newDialogTitle: Locator;

  /** Edit form description textarea */
  private readonly editDescriptionTextarea: Locator;

  /** Unit Head dropdown with placeholder in the New/Edit dialog */
  private readonly unitHeadSelect: Locator;

  constructor(page: Page) {
    this.page = page;

    this.newBusinessUnitButton = page.getByRole('button', {
      name: '+ Add Unit',
    });

    // Use XPath pattern to find textboxes by label text
    this.businessUnitNameInput = page.locator('xpath=//*[contains(text(),"Business Unit Name")]/..//input');
    this.businessUnitCodeInput = page.locator('xpath=//*[contains(text(),"Business Unit Code")]/..//input');

    this.unitHeadSearchField = page.getByPlaceholder('Search & select an employee');

    this.unitHeadDropdown = page.getByRole('listbox', {
      name: 'Unit Head',
    });

    this.employeeOption = page.getByRole('option');

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel',
    });

    this.saveRecordButton = page.getByRole('button', {
      name: 'Save Record',
    });

    // View modal locators - use data-testid to avoid strict mode violation
    this.viewModalCloseButton = page.getByTestId('modal-secondary-action-btn');

    // View modal - use a more specific locator
    this.viewModal = page
      .locator('[role="dialog"]')
      .filter({ has: page.getByRole('heading', { level: 2 }) })
      .first();

    // View modal Unit Head - find the row containing "Unit Head" label and get its value
    this.viewModalUnitHead = page
      .locator('[role="dialog"]')
      .filter({ has: page.getByRole('heading', { level: 2 }) })
      .first()
      .locator('text=Unit Head')
      .locator('..');

    // View modal Status - find the row containing "Status" label and get its value
    this.viewModalStatus = page
      .locator('[role="dialog"]')
      .filter({ has: page.getByRole('heading', { level: 2 }) })
      .first()
      .locator('text=Status')
      .locator('..');

    // View modal Description - find the row containing "Description" label and get its value
    this.viewModalDescription = page
      .locator('[role="dialog"]')
      .filter({ has: page.getByRole('heading', { level: 2 }) })
      .first()
      .locator('text=Description')
      .locator('..');

    // Dialog title locators
    this.editDialogTitle = page.getByRole('heading', {
      name: 'Edit Business Unit',
    });

    this.newDialogTitle = page.getByRole('heading', {
      name: 'New Business Unit',
    });

    // Edit form description textarea
    this.editDescriptionTextarea = page
      .getByRole('textbox', { name: 'Description' })
      .first();

    // Unit head select in edit/new dialog
    this.unitHeadSelect = page.getByRole('combobox', {
      name: 'Unit Head',
    });
  }

  /** Click the Add Business Unit button */
  async clickAddBusinessUnit(): Promise<void> {
    await this.newBusinessUnitButton.click();
  }

  /** Fill in the Business Unit Name field */
  async fillBusinessUnitName(name: string): Promise<void> {
    await this.businessUnitNameInput.fill(name);
  }

  /** Fill in the Business Unit Code field */
  async fillBusinessUnitCode(code: string): Promise<void> {
    await this.businessUnitCodeInput.fill(code);
  }

  /** Search for an employee in the Unit Head dropdown */
  async searchEmployee(name: string): Promise<void> {
    await this.unitHeadSearchField.fill(name);
  }

  /** Select an employee from the dropdown */
  async selectEmployee(name: string): Promise<void> {
    // Since searchEmployee already fills the field and opens the dropdown,
    // we just need to find the option and click it directly.
    
    // Strategy 1: Click on the option using evaluate - most reliable approach
    const clicked = await this.page.evaluate((employeeName: string) => {
      // Look for options within the dropdown that appears after typing
      const allElements = document.querySelectorAll('[role="option"]');
      for (const el of allElements) {
        const text = (el.textContent || '').trim();
        if (text.includes(employeeName)) {
          // Use native click to avoid React's synthetic event issues
          (el as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, name);
    
    if (clicked) {
      await await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    
    // Strategy 2: Click the search field, then wait and try again
    await this.unitHeadSearchField.click();
    await await new Promise(resolve => setTimeout(resolve, 500));
    await this.unitHeadSearchField.fill(name);
    await await new Promise(resolve => setTimeout(resolve, 1500));
    
    const clicked2 = await this.page.evaluate((employeeName: string) => {
      const allElements = document.querySelectorAll('[role="option"]');
      for (const el of allElements) {
        const text = (el.textContent || '').trim();
        if (text.includes(employeeName)) {
          (el as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, name);
    
    if (clicked2) {
      await await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    
    // Strategy 3: Try clicking the option via Playwright locator
    const option = this.page.locator(`[role="option"]:has-text("${name}")`).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await await new Promise(resolve => setTimeout(resolve, 300));
  }

  /** Click the Cancel button */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Click the Save Record button */
  async clickSaveRecord(): Promise<void> {
    await this.saveRecordButton.click();
  }

  /** Check if the New Business Unit modal is visible */
  async isModalVisible(): Promise<boolean> {
    return this.businessUnitNameInput.isVisible().catch(() => false);
  }

  /** Get the text of a specific employee option */
  async getEmployeeOptionText(index: number): Promise<string> {
    const text = await this.employeeOption.nth(index).textContent();
    return text ?? '';
  }

  /** Check if the Unit Head dropdown is open */
  async isUnitHeadDropdownOpen(): Promise<boolean> {
    return this.unitHeadDropdown.isVisible().catch(() => false);
  }

  /** Wait for the modal to be visible */
  async waitForModalVisible(): Promise<void> {
    await this.businessUnitNameInput.waitFor({
      state: 'visible',
      timeout: 10000,
    });
  }

  /** Wait for the view modal to be visible */
  async waitForViewModalVisible(): Promise<void> {
    await this.viewModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  /** Click the Close button in the view modal */
  async clickViewModalClose(): Promise<void> {
    await this.viewModalCloseButton.click();
  }

  /** Check if the view modal is visible */
  async isViewModalVisible(): Promise<boolean> {
    return this.viewModal.isVisible().catch(() => false);
  }

  /** Get the unit head text from the view modal */
  async getViewModalUnitHead(): Promise<string> {
    const text = await this.viewModalUnitHead.textContent();
    return text ? text.trim() : '';
  }

  /** Get the status text from the view modal */
  async getViewModalStatus(): Promise<string> {
    const text = await this.viewModalStatus.textContent();
    return text ? text.trim() : '';
  }

  /** Get the description text from the view modal */
  async getViewModalDescription(): Promise<string> {
    const text = await this.viewModalDescription.textContent();
    return text ? text.trim() : '';
  }

  /** Check if the Edit Business Unit dialog is visible */
  async isEditDialogVisible(): Promise<boolean> {
    return this.editDialogTitle.isVisible().catch(() => false);
  }

  /** Check if the New Business Unit dialog is visible */
  async isNewDialogVisible(): Promise<boolean> {
    return this.newDialogTitle.isVisible().catch(() => false);
  }

  /** Fill the description in the edit form */
  async fillDescription(description: string): Promise<void> {
    await this.editDescriptionTextarea.fill(description);
  }

  /** Click the Unit Head select field in the dialog */
  async clickUnitHeadSelect(): Promise<void> {
    await this.unitHeadSelect.click();
  }
}


