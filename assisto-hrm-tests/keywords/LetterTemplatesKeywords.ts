import { Page } from '@playwright/test';
import { LetterTemplatesPage } from '@pages/LetterTemplatesPage';

/**
 * High-level keyword methods for Letter Templates feature
 * Follows the framework's Keyword-Driven Testing pattern
 */
export class LetterTemplatesKeywords {
  private letterTemplatesPage: LetterTemplatesPage;

  constructor(page: Page) {
    this.letterTemplatesPage = new LetterTemplatesPage(page);
  }

  // ==================== Navigation ====================

  /**
   * Navigate to Letter Templates page
   * Path: Settings > Pre-Onboarding Settings > Letter Template
   */
  async navigateToLetterTemplates(): Promise<void> {
    await this.letterTemplatesPage.navigateToLetterTemplates();
  }

  /**
   * Check if page is loaded
   */
  async isPageLoaded(): Promise<boolean> {
    return await this.letterTemplatesPage.isPageLoaded();
  }

  // ==================== List View Operations ====================

  /**
   * Check if Letter Templates title is visible
   */
  async isLetterTemplatesTitleVisible(): Promise<boolean> {
    return await this.letterTemplatesPage.isLetterTemplatesTitleVisible();
  }

  /**
   * Check if Add New button is visible
   */
  async isAddNewButtonVisible(): Promise<boolean> {
    return await this.letterTemplatesPage.isAddNewButtonVisible();
  }

  /**
   * Search templates by name
   */
  async searchTemplates(query: string): Promise<void> {
    await this.letterTemplatesPage.searchTemplates(query);
  }

  /**
   * Get current search text
   */
  async getSearchText(): Promise<string> {
    return await this.letterTemplatesPage.getSearchText();
  }

  /**
   * Clear search input
   */
  async clearSearch(): Promise<void> {
    await this.letterTemplatesPage.clearSearch();
  }

  /**
   * Get total number of rows in the table
   */
  async getTableRowCount(): Promise<number> {
    return await this.letterTemplatesPage.getTableRowCount();
  }

  /**
   * Get pagination information
   */
  async getPagingInfo(): Promise<string> {
    return await this.letterTemplatesPage.getPagingInfo();
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    await this.letterTemplatesPage.goToNextPage();
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.letterTemplatesPage.goToPreviousPage();
  }

  /**
   * Get all visible columns
   */
  async getVisibleColumns(): Promise<string[]> {
    return await this.letterTemplatesPage.getVisibleColumns();
  }

  // ==================== View Operations ====================

  /**
   * View template by row index
   */
  async viewTemplate(rowIndex: number): Promise<void> {
    await this.letterTemplatesPage.clickViewIcon(rowIndex);
  }

  /**
   * Check if View Template modal is visible
   */
  async isViewModalVisible(): Promise<boolean> {
    return await this.letterTemplatesPage.isViewModalVisible();
  }

  /**
   * Close View Template modal
   */
  async closeViewModal(): Promise<void> {
    await this.letterTemplatesPage.clickCloseButton();
  }

  /**
   * Zoom in on template view
   */
  async zoomIn(): Promise<void> {
    await this.letterTemplatesPage.zoomIn();
  }

  /**
   * Zoom out on template view
   */
  async zoomOut(): Promise<void> {
    await this.letterTemplatesPage.zoomOut();
  }

  /**
   * Fit to width on template view
   */
  async fitToWidth(): Promise<void> {
    await this.letterTemplatesPage.fitToWidth();
  }

  // ==================== Create New Template ====================

  /**
   * Click Add New button to start creating a new template
   */
  async clickAddNewButton(): Promise<void> {
    await this.letterTemplatesPage.clickAddNewButton();
  }

  /**
   * Fill in general information form (Step 1)
   */
  async fillGeneralInfo(form: {
    title: string;
    prefix: string;
    format: string;
    suffix: string;
    index: string;
    letterType: string;
  }): Promise<void> {
    await this.letterTemplatesPage.fillGeneralInfo(form);
  }

  /**
   * Click Next button to proceed to Step 2
   */
  async clickNextToUploadDocument(): Promise<void> {
    await this.letterTemplatesPage.clickNextButton();
  }

  /**
   * Check if Upload Document step is visible
   */
  async isUploadDocumentStepVisible(): Promise<boolean> {
    return await this.letterTemplatesPage.isUploadDocumentStepVisible();
  }

  /**
   * Upload document file
   */
  async uploadDocument(filePath: string): Promise<void> {
    await this.letterTemplatesPage.uploadDocument(filePath);
  }

  /**
   * Check if file was uploaded successfully
   */
  async isFileUploaded(): Promise<boolean> {
    return await this.letterTemplatesPage.isFileUploaded();
  }

  /**
   * Get uploaded file name
   */
  async getUploadedFileName(): Promise<string> {
    return await this.letterTemplatesPage.getUploadedFileName();
  }

  /**
   * Click Next button to proceed to Step 3 (Preview)
   */
  async clickNextToPreview(): Promise<void> {
    await this.letterTemplatesPage.clickNextButton();
  }

  /**
   * Check if Preview Letter step is visible
   */
  async isPreviewLetterStepVisible(): Promise<boolean> {
    return await this.letterTemplatesPage.isPreviewLetterStepVisible();
  }

  /**
   * Submit the template
   */
  async submitTemplate(): Promise<void> {
    await this.letterTemplatesPage.submitTemplate();
  }

  // ==================== Edit Template ====================

  /**
   * Edit template by row index
   */
  async editTemplate(rowIndex: number): Promise<void> {
    await this.letterTemplatesPage.clickEditIcon(rowIndex);
  }

  /**
   * Update template after modifications
   */
  async updateTemplate(): Promise<void> {
    await this.letterTemplatesPage.updateTemplate();
  }

  // ==================== Delete Template ====================

  /**
   * Delete template by row index
   */
  async deleteTemplate(rowIndex: number): Promise<void> {
    await this.letterTemplatesPage.clickDeleteIcon(rowIndex);
  }

  /**
   * Check if delete confirmation dialog is visible
   */
  async isDeleteDialogVisible(): Promise<boolean> {
    return await this.letterTemplatesPage.isDeleteDialogVisible();
  }

  /**
   * Confirm deletion
   */
  async confirmDeletion(): Promise<void> {
    await this.letterTemplatesPage.confirmDeletion();
  }

  /**
   * Cancel deletion
   */
  async cancelDeletion(): Promise<void> {
    await this.letterTemplatesPage.cancelDeletion();
  }

  /**
   * Get delete dialog message
   */
  async getDeleteDialogMessage(): Promise<string> {
    return await this.letterTemplatesPage.getDeleteDialogMessage();
  }

  // ==================== Form Validation ====================

  /**
   * Get validation error message for a field
   */
  async getValidationErrorMessage(field: string): Promise<string> {
    return await this.letterTemplatesPage.getValidationErrorMessage(field);
  }

  /**
   * Get current step in wizard
   */
  async getCurrentStep(): Promise<string> {
    return await this.letterTemplatesPage.getCurrentStep();
  }

  /**
   * Check if General Information step is visible
   */
  async isGeneralInfoStepVisible(): Promise<boolean> {
    return await this.letterTemplatesPage.isGeneralInfoStepVisible();
  }

  /**
   * Click Back button in wizard
   */
  async clickBackInWizard(): Promise<void> {
    await this.letterTemplatesPage.clickBackButton();
  }
}


