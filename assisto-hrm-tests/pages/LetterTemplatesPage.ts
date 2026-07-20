import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Letter Templates feature
 * Manages all interactions related to letter template CRUD operations
 */
export class LetterTemplatesPage {
  private page: Page;

  // List View Locators
  private readonly letterTemplateTitle = 'Letter Templates';
  private readonly addNewButton: Locator;
  private readonly searchTemplatesInput: Locator;
  private readonly columnVisibilityDropdown: Locator;
  private readonly tableRow: Locator;
  private readonly _rowButtons: (rowIndex: number) => Locator;
  private readonly pagination: {
    previous: Locator;
    next: Locator;
    pageIndicator: Locator;
  };

  // View Template Modal Locators
  private readonly viewModal: {
    container: Locator;
    closeButton: Locator;
    content: Locator;
    zoomControls: {
      zoomIn: Locator;
      zoomOut: Locator;
      fitToWidth: Locator;
    };
  };

  // Create/Edit Template Form Locators (3-Step Wizard)
  private readonly formWizard: {
    container: Locator;
    steps: {
      generalInfo: Locator;
      uploadDocument: Locator;
      previewLetter: Locator;
    };
    backButton: Locator;
    nextButton: Locator;
    submitButton: Locator;
    updateTemplateButton: Locator;
  };

  // Step 1: General Information
  private readonly generalInfoForm: {
    title: Locator;
    letterNumberSeries: Locator;
    prefix: Locator;
    format: Locator;
    suffix: Locator;
    index: Locator;
    letterType: Locator;
  };

  // Step 2: Upload Document
  private readonly uploadDocumentForm: {
    dropZone: Locator;
    browseButton: Locator;
    uploadedFile: Locator;
    fileFormat: Locator;
  };

  // Step 3: Preview Letter
  private readonly previewLetterForm: {
    previewContainer: Locator;
    zoomControls: {
      zoomIn: Locator;
      zoomOut: Locator;
      fitToWidth: Locator;
    };
  };

  // Delete Confirmation Dialog
  private readonly deleteDialog: {
    container: Locator;
    confirmButton: Locator;
    cancelButton: Locator;
  };

  // Validation Messages
  private readonly requiredFieldMessage: string = 'Required';
  private readonly fileValidationError: string = 'Only .doc and .docx files are allowed. Maximum size: 10MB';

  constructor(page: Page) {
    this.page = page;

    // List View Locators
    this.addNewButton = page.getByRole('button', { name: 'Add New' });
    this.searchTemplatesInput = page.getByPlaceholder('Search templates...');
    this.columnVisibilityDropdown = page.getByLabel('Column visibility');
    // Ant Design grid: use getByRole('row') and filter out header rows
    this.tableRow = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
    // Factory function to get all buttons in a specific row
    this._rowButtons = (rowIndex: number) => {
      return this.tableRow.nth(rowIndex).locator('button');
    };
    this.pagination = {
      previous: page.getByLabel('Previous page'),
      next: page.getByLabel('Next page'),
      pageIndicator: page.locator('.ant-pagination').first(),
    };

    // View Template Modal Locators
    const viewModalDialog = page.getByRole('dialog', { name: /View Template/i });
    this.viewModal = {
      container: viewModalDialog,
      closeButton: viewModalDialog.getByRole('button', { name: 'Close', exact: true }).last(),
      content: page.locator('.ant-modal-body'),
      zoomControls: {
        zoomIn: viewModalDialog.getByRole('button', { name: 'Zoom in' }),
        zoomOut: viewModalDialog.getByRole('button', { name: 'Zoom out' }),
        fitToWidth: viewModalDialog.getByRole('button', { name: /100%|Reset zoom/ }),
      },
    };

    // Create/Edit Template Form Locators (3-Step Wizard)
    this.formWizard = {
      container: page.locator('.ant-steps'),
      steps: {
        generalInfo: page.getByRole('heading', { name: 'General Information' }),
        uploadDocument: page.getByRole('heading', { name: 'Upload Document' }),
        previewLetter: page.getByRole('heading', { name: 'Preview Letter' }),
      },
      backButton: page.getByRole('button', { name: '← Back' }),
      nextButton: page.getByRole('button', { name: /Next/ }),
      submitButton: page.getByRole('button', { name: 'Submit' }),
      updateTemplateButton: page.getByRole('button', { name: /Update Template/i }),
    };

    // Step 1: General Information Form
    this.generalInfoForm = {
      title: page.getByRole('textbox', { name: 'Title' }),
      letterNumberSeries: page.getByRole('textbox', { name: 'Letter Number Series' }),
      prefix: page.locator('text=Prefix*').locator('..').locator('input'),
      format: page.locator('text=Format*').locator('..').locator('input'),
      suffix: page.locator('text=Suffix*').locator('..').locator('input'),
      index: page.locator('text=Index*').locator('..').locator('input, spinbutton'),
      letterType: page.getByLabel('Letter Type'),
    };

    // Step 2: Upload Document Form
    this.uploadDocumentForm = {
      dropZone: page.getByRole('button', { name: 'Browse files' }),
      browseButton: page.getByRole('button', { name: 'Browse files' }),
      uploadedFile: page.locator('.ant-upload-list-item'),
      fileFormat: page.getByText(/Only .doc and .docx files are allowed/i),
    };

    // Step 3: Preview Letter Form
    this.previewLetterForm = {
      previewContainer: page.locator('.ant-modal-body'),
      zoomControls: {
        zoomIn: page.getByLabel('Zoom in'),
        zoomOut: page.getByLabel('Zoom out'),
        fitToWidth: page.getByLabel('Fit to width'),
      },
    };

    // Delete Confirmation Dialog
    this.deleteDialog = {
      container: page.locator('.ant-modal-mask').locator('.ant-modal').first(),
      confirmButton: page.getByRole('button', { name: 'OK', exact: true }),
      cancelButton: page.getByRole('button', { name: 'Cancel' }),
    };
  }

  // ==================== Public Methods ====================

  /**
   * Navigate to Letter Templates page
   * Path: Settings > Pre-Onboarding Settings > Letter Template
   */
  async navigateToLetterTemplates(): Promise<void> {
    // Step 0: Click sidebar toggle to expand the sidebar if collapsed
    try {
      const sidebarToggle = this.page.locator('button:has-text(">")').last();
      await sidebarToggle.waitFor({ state: 'visible', timeout: 3000 });
      await sidebarToggle.click();
      await await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      // Sidebar may already be expanded
    }

    // Step 1: Click Settings in the sidebar navigation
    const settingsBtn = this.page.getByRole('button', { name: 'Settings', exact: true }).first();
    try {
      await settingsBtn.waitFor({ state: 'visible', timeout: 5000 });
      await settingsBtn.click();
      await this.page.waitForLoadState('networkidle');
      await await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      // Already on Settings page or Settings button not found, continue
    }

    // Step 2: Scroll down to bring Pre-Onboarding Settings into view
    await this.page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight * 0.3);
    });
    await await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Click Pre-Onboarding Settings to expand the dropdown
    const preOnboardingDropdown = this.page.getByRole('button', { name: 'Pre-Onboarding Settings' }).first();
    await preOnboardingDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await preOnboardingDropdown.click();
    await this.page.waitForLoadState('networkidle');
    await await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Click Letter Template sub-item (under Pre-Onboarding Settings)
    const letterTemplateBtn = this.page.getByRole('button', { name: 'Letter Template' }).first();
    await letterTemplateBtn.waitFor({ state: 'visible', timeout: 10000 });
    await letterTemplateBtn.click();
    
    // Wait for the Letter Templates page to fully load
    await this.waitForPageLoad();
  }

  /**
   * Check if Letter Templates title is visible
   */
  async isLetterTemplatesTitleVisible(): Promise<boolean> {
    try {
      const title = await this.page.getByText(this.letterTemplateTitle, { exact: true }).isVisible();
      return title;
    } catch {
      return false;
    }
  }

  /**
   * Check if Add New button is visible
   */
  async isAddNewButtonVisible(): Promise<boolean> {
    try {
      return await this.addNewButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Click Add New button
   */
  async clickAddNewButton(): Promise<void> {
    await this.addNewButton.click();
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string): Promise<void> {
    await this.searchTemplatesInput.fill(query);
  }

  /**
   * Get search templates input text
   */
  async getSearchText(): Promise<string> {
    return (await this.searchTemplatesInput.inputValue()) ?? '';
  }

  /**
   * Clear search input
   */
  async clearSearch(): Promise<void> {
    await this.searchTemplatesInput.clear();
  }

  /**
   * Get table row count
   */
  async getTableRowCount(): Promise<number> {
    return await this.tableRow.count();
  }

  /**
   * Get action icons from table row (0-indexed)
   */
  async getActionIconsFromRow(index: number): Promise<{ view: boolean; edit: boolean; delete: boolean }> {
    const buttons = await this._rowButtons(index).all();
    if (buttons.length < 3) return { view: false, edit: false, delete: false };
    const view = await buttons[0].isVisible();
    const edit = await buttons[1].isVisible();
    const deleteIcon = await buttons[2].isVisible();
    return { view, edit, delete: deleteIcon };
  }

  /**
   * Click view icon (0-indexed row)
   */
  async clickViewIcon(rowIndex: number): Promise<void> {
    const buttons = await this._rowButtons(rowIndex).all();
    await buttons[0].click();
  }

  /**
   * Click edit icon (0-indexed row)
   */
  async clickEditIcon(rowIndex: number): Promise<void> {
    const buttons = await this._rowButtons(rowIndex).all();
    await buttons[1].click();
  }

  /**
   * Click delete icon (0-indexed row)
   */
  async clickDeleteIcon(rowIndex: number): Promise<void> {
    const buttons = await this._rowButtons(rowIndex).all();
    // Wait a bit for buttons to be available
    await await new Promise(resolve => setTimeout(resolve, 500));
    if (buttons.length > 2) {
      await buttons[2].click();
    } else {
      // Fallback: try to find delete icon by role
      await this.page.getByRole('button', { name: /delete/i, exact: false }).nth(rowIndex).click();
    }
  }

  /**
   * Check if View Template modal is visible
   */
  async isViewModalVisible(): Promise<boolean> {
    try {
      return await this.viewModal.container.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Click close button in View Template modal
   */
  async clickCloseButton(): Promise<void> {
    await this.viewModal.closeButton.click();
    // Wait for the modal to close
    await this.viewModal.container.waitFor({ state: 'detached', timeout: 10000 });
  }

  /**
   * Check if close button is visible
   */
  async isCloseButtonVisible(): Promise<boolean> {
    try {
      return await this.viewModal.closeButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get zoom control visibility
   */
  async getZoomControlVisibility(): Promise<{ zoomIn: boolean; zoomOut: boolean; fitToWidth: boolean }> {
    return {
      zoomIn: await this.viewModal.zoomControls.zoomIn.isVisible(),
      zoomOut: await this.viewModal.zoomControls.zoomOut.isVisible(),
      fitToWidth: await this.viewModal.zoomControls.fitToWidth.isVisible(),
    };
  }

  /**
   * Zoom in on template view
   */
  async zoomIn(): Promise<void> {
    await this.viewModal.zoomControls.zoomIn.click();
  }

  /**
   * Zoom out on template view
   */
  async zoomOut(): Promise<void> {
    await this.viewModal.zoomControls.zoomOut.click();
  }

  /**
   * Fit to width on template view
   */
  async fitToWidth(): Promise<void> {
    await this.viewModal.zoomControls.fitToWidth.click();
  }

  /**
   * Get general information form title value
   */
  async getFormTitle(): Promise<string> {
    return (await this.generalInfoForm.title.inputValue()) ?? '';
  }

  /**
   * Fill in general information form
   */
  async fillGeneralInfo(form: {
    title: string;
    prefix?: string;
    format?: string;
    suffix?: string;
    index?: string;
    letterType: string;
  }): Promise<void> {
    // Fill title field
    await this.generalInfoForm.title.fill(form.title);
    
    // Fill required number series fields - use provided values or defaults
    // Only use default if field is undefined, not if it's empty string
    // Prefix*
    try {
      const prefixValue = form.prefix === undefined ? 'OL' : form.prefix;
      await this.generalInfoForm.prefix.fill(prefixValue);
    } catch {
      // Prefix field not found, continue
    }
    
    // Format*
    try {
      const formatValue = form.format === undefined ? 'YYYYMMDD' : form.format;
      await this.generalInfoForm.format.fill(formatValue);
    } catch {
      // Format field not found, continue
    }
    
    // Suffix*
    try {
      const suffixValue = form.suffix === undefined ? '2025' : form.suffix;
      await this.generalInfoForm.suffix.fill(suffixValue);
    } catch {
      // Suffix field not found, continue
    }
    
    // Index*
    try {
      const indexValue = form.index === undefined ? '001' : form.index;
      await this.generalInfoForm.index.fill(indexValue);
    } catch {
      // Index field not found, continue
    }
    
    // Handle Letter Type dropdown - custom combobox needs special handling
    try {
      // First try standard select
      const tagName = await this.generalInfoForm.letterType.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await this.generalInfoForm.letterType.selectOption({ label: form.letterType });
      } else {
        // Custom combobox - click to open dropdown
        await this.generalInfoForm.letterType.click({ timeout: 3000 });
        await await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to find and click the option
        try {
          await this.page.getByRole('option', { name: form.letterType, exact: true }).click({ timeout: 2000 });
        } catch {
          // Try clicking the open button if dropdown needs to be opened first
          const openBtn = this.page.getByRole('button', { name: 'Open' });
          if (await openBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await openBtn.click();
            await await new Promise(resolve => setTimeout(resolve, 500));
            await this.page.getByRole('option', { name: form.letterType, exact: true }).click({ timeout: 2000 });
          }
        }
      }
    } catch {
      // Letter type field not found or selection failed, continue
    }
  }

  /**
    * Get validation error message
    */
  async getValidationErrorMessage(field: string): Promise<string> {
    // Wait for validation to trigger - increase wait time
    await await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Try to find error message by looking at the field's label or input element
      // and then finding the associated alert/sibling element
      // Include labels with asterisk
      const fieldLocators = [
        this.page.locator(`text=${field}`),
        this.page.locator(`text=contains("${field}")`),
        this.page.locator(`text=${field}*`),
        this.page.locator(`[placeholder*="${field}"]`),
        this.page.locator(`[aria-label*="${field}"]`),
      ];

      for (const locator of fieldLocators) {
        try {
          const count = await locator.count();
          if (count > 0) {
            // Find the alert that is a direct sibling or within the same container
            // Look for alert within 2 levels of parent
            const parentAlert = locator.locator('xpath=../../..//alert[contains(.,"required") or @role="alert"]').first();
            if (await parentAlert.count() > 0) {
              const text = await parentAlert.textContent();
              if (text && text.toLowerCase().includes('required')) {
                return text.trim();
              }
            }
            
            // Also check following siblings
            const siblingAlert = locator.locator('xpath=../following-sibling::alert[contains(.,"required")]').first();
            if (await siblingAlert.count() > 0) {
              const text = await siblingAlert.textContent();
              if (text && text.toLowerCase().includes('required')) {
                return text.trim();
              }
            }
            
            // Check immediate parent's alert
            const immediateAlert = locator.locator('xpath=../alert[contains(.,"required") or @role="alert"]').first();
            if (await immediateAlert.count() > 0) {
              const text = await immediateAlert.textContent();
              if (text && text.toLowerCase().includes('required')) {
                return text.trim();
              }
            }
            
            // Check if parent has alert as direct child
            const parent = await locator.locator('xpath=..').first();
            if (await parent.count() > 0) {
              const parentAlert = parent.locator('alert[contains(.,"required") or @role="alert"]').first();
              if (await parentAlert.count() > 0) {
                const text = await parentAlert.textContent();
                if (text && text.toLowerCase().includes('required')) {
                  return text.trim();
                }
              }
            }
          }
        } catch {
          continue;
        }
      }

      // Fallback: Look for any alert element containing "required" and match by variations
      const alerts = await this.page.locator('alert, [role="alert"], .ant-form-item-explain, .ant-alert-message').all();
      
      for (const alert of alerts) {
        const text = await alert.textContent();
        if (text && text.toLowerCase().includes('required')) {
          const lowerText = text.toLowerCase();
          const lowerField = field.toLowerCase();
          
          // Direct match
          if (lowerText.includes(lowerField)) {
            return text.trim();
          }
          
          // Handle field name variations (e.g., "letterType" -> "letter type")
          const variations = [
            lowerField,
            field.replace(/([A-Z])/g, ' $1').trim().toLowerCase(),
            field.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().trim(),
          ];
          
          for (const variant of variations) {
            if (lowerText.includes(variant)) {
              return text.trim();
            }
          }
        }
      }

      // If no field-specific match found, return the first generic "Required" error
      const firstAlert = await this.page.locator('alert, [role="alert"], .ant-form-item-explain, .ant-alert-message').first();
      const firstText = await firstAlert.textContent();
      if (firstText && firstText.toLowerCase().includes('required')) {
        return firstText.trim();
      }
    } catch {
      // Continue
    }

    return '';
  }

  /**
   * Click Next button in form wizard
   */
  async clickNextButton(): Promise<void> {
    await this.formWizard.nextButton.click();
  }

  /**
   * Click Back button in form wizard
   */
  async clickBackButton(): Promise<void> {
    await this.formWizard.backButton.click();
  }

  /**
   * Check if General Information step is visible
   */
  async isGeneralInfoStepVisible(): Promise<boolean> {
    try {
      return await this.formWizard.steps.generalInfo.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if Upload Document step is visible
   */
  async isUploadDocumentStepVisible(): Promise<boolean> {
    try {
      return await this.formWizard.steps.uploadDocument.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if Preview Letter step is visible
   */
  async isPreviewLetterStepVisible(): Promise<boolean> {
    try {
      return await this.formWizard.steps.previewLetter.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get current step in wizard
   */
  async getCurrentStep(): Promise<string> {
    // Try getting the heading text which indicates current step
    try {
      const heading = await this.page.getByRole('heading', { level: 2 }).first().textContent();
      if (heading) return heading.trim();
    } catch {
      // Ignore and try next selector
    }
    
    // Try getting text from step indicator
    try {
      const activeSteps = await this.page.locator('[class*="active"], [class*="process"]').allTextContents();
      for (const text of activeSteps) {
        const trimmed = text.trim();
        if (trimmed && trimmed.length > 0 && trimmed.length < 50) {
          return trimmed;
        }
      }
    } catch {
      // Ignore
    }
    
    return '';
  }

  /**
   * Upload document file
   */
  async uploadDocument(filePath: string): Promise<void> {
    // Click the browse button to open file dialog
    await this.uploadDocumentForm.browseButton.click();
    await await new Promise(resolve => setTimeout(resolve, 500));
    
    // Use file input upload
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Click Browse files button
   */
  async clickBrowseFiles(): Promise<void> {
    await this.uploadDocumentForm.browseButton.click();
  }

  /**
   * Check if file upload is successful
   */
  async isFileUploaded(): Promise<boolean> {
    try {
      return await this.uploadDocumentForm.uploadedFile.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get uploaded file name
   */
  async getUploadedFileName(): Promise<string> {
    return (await this.uploadDocumentForm.uploadedFile.textContent()) ?? '';
  }

  /**
   * Submit template
   */
  async submitTemplate(): Promise<void> {
    await this.formWizard.submitButton.click();
  }

  /**
   * Update template
   */
  async updateTemplate(): Promise<void> {
    await this.formWizard.updateTemplateButton.click();
  }

  /**
   * Check if delete confirmation dialog is visible
   */
  async isDeleteDialogVisible(): Promise<boolean> {
    try {
      await await new Promise(resolve => setTimeout(resolve, 1000));
      const isVisible = await this.deleteDialog.container.isVisible();
      return isVisible;
    } catch {
      return false;
    }
  }

  /**
   * Confirm deletion
   */
  async confirmDeletion(): Promise<void> {
    await this.deleteDialog.confirmButton.click();
  }

  /**
   * Cancel deletion
   */
  async cancelDeletion(): Promise<void> {
    await this.deleteDialog.cancelButton.click();
  }

  /**
   * Get delete dialog message
   */
  async getDeleteDialogMessage(): Promise<string> {
    try {
      const message = await this.deleteDialog.container.textContent();
      return message ?? '';
    } catch {
      return '';
    }
  }

  /**
   * Get pagination info
   */
  async getPagingInfo(): Promise<string> {
    return (await this.pagination.pageIndicator.textContent()) ?? '';
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    await this.pagination.next.click();
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.pagination.previous.click();
  }

  /**
   * Check if pagination is active
   */
  async isPaginationActive(): Promise<boolean> {
    try {
      const nextDisabled = await this.pagination.next.isDisabled();
      return !nextDisabled;
    } catch {
      return false;
    }
  }

  /**
   * Get all visible columns in table
   */
  async getVisibleColumns(): Promise<string[]> {
    // Ant Design grid: columnheaders are in the first rowgroup
    const headers = await this.page.getByRole('columnheader').allTextContents();
    return headers.map(h => h.trim()).filter(h => h !== '');
  }

  /**
   * Toggle column visibility
   */
  async toggleColumnVisibility(columnName: string): Promise<void> {
    await this.columnVisibilityDropdown.click();
    await this.page.getByRole('checkbox', { name: columnName }).check();
    await this.columnVisibilityDropdown.click(); // Close dropdown
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for the Letter Templates title to be visible
    await this.page.waitForSelector('text=Letter Templates', { state: 'visible', timeout: 15000 });
    // Wait for the Add New button to be visible (indicates page is loaded)
    await this.addNewButton.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for the table container - try multiple selectors for different table implementations
    try {
      await this.page.waitForSelector('table', { state: 'visible', timeout: 5000 });
    } catch {
      // Table might not be present, continue anyway
    }
  }

  /**
   * Check if page is loaded (public method for keywords)
   */
  async isPageLoaded(): Promise<boolean> {
    try {
      await this.waitForPageLoad();
      return true;
    } catch {
      return false;
    }
  }
}


