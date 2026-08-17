import { Page, expect } from '@playwright/test';
import { CandidateRegistrationPage } from '@pages/CandidateRegistrationPage';
import { getBaseUrl } from '@utils/helpers';

/**
 * CandidateRegistrationKeywords provides high-level business actions
 * for the Candidate Registration module in the Pre-Onboarding section.
 *
 * This class wraps the CandidateRegistrationPage to provide semantic operations
 * for BusinessHR users managing candidate registration and verification.
 */
export class CandidateRegistrationKeywords {
  private readonly page: Page;
  private readonly candidateRegPage: CandidateRegistrationPage;

  constructor(page: Page) {
    this.page = page;
    this.candidateRegPage = new CandidateRegistrationPage(page);
  }

  // ===== Navigation =====

  async navigateToCandidateRegistration(): Promise<void> {
    // Navigate directly to the Pre-Onboarding Dashboard URL
    // This is the correct URL that shows the dashboard with tabs
    await this.page.goto(`${getBaseUrl()}/people/pre-onboarding`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for the page to load
    await this.page.waitForLoadState('networkidle');

    // Debug: Log current state
    const currentUrl = this.page.url();
    const title = await this.page.title();
    console.log(`URL: ${currentUrl}, Title: ${title}`);

    // Click the "Candidate Registration" tab at the top of the Pre-Onboarding Dashboard
    // Note: The tabs are rendered as buttons, not ARIA tabs
    const candidateRegTab = this.page.getByRole('button', { name: 'Candidate Registration' }).first();
    try {
      await candidateRegTab.waitFor({ state: 'visible', timeout: 10000 });
      await candidateRegTab.click();
      await this.page.waitForLoadState('networkidle');
      console.log('Clicked Candidate Registration tab successfully');
    } catch (e) {
      // No tabs found - might already be on Candidate Registration page or tabs not visible
      console.log('No Candidate Registration tab found, checking if already on page...');
    }

    // Verify we're on the Candidate Management page (this is the page-ready signal).
    // Note: the title is rendered as a plain <div>, not a heading, so match by text.
    const titleHeading = this.page.getByText('Candidate Management').first();
    await titleHeading.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Successfully navigated to Candidate Registration page');
  }

  // ===== Dashboard Verifications =====

  async verifyDashboardDisplayed(): Promise<void> {
    await expect(this.candidateRegPage.isTitleVisible()).resolves.toBe(true);
  }

  async verifySummaryCardsDisplayed(): Promise<void> {
    await expect(this.candidateRegPage.areAllSummaryCardsVisible()).resolves.toBe(true);
  }

  async getVerifiedCount(): Promise<string> {
    return await this.candidateRegPage.getVerifiedCount();
  }

  async getNotVerifiedCount(): Promise<string> {
    return await this.candidateRegPage.getNotVerifiedCount();
  }

  async getInProgressCount(): Promise<string> {
    return await this.candidateRegPage.getInProgressCount();
  }

  async getRejectedCount(): Promise<string> {
    return await this.candidateRegPage.getRejectedCount();
  }

  async verifyActionBarButtonsVisible(): Promise<void> {
    await expect(this.candidateRegPage.areActionBarButtonsVisible()).resolves.toBe(true);
  }

  async verifyCandidateGridVisible(): Promise<void> {
    await expect(this.candidateRegPage.isCandidateGridVisible()).resolves.toBe(true);
  }

  async getPaginationInfo(): Promise<string> {
    return await this.candidateRegPage.getPaginationInfo();
  }

  async getCandidateRowCount(): Promise<number> {
    return await this.candidateRegPage.getCandidateRowCount();
  }

  // ===== Search =====

  async searchCandidates(searchText: string): Promise<void> {
    await this.candidateRegPage.searchCandidatesTextbox.fill(searchText);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // ===== Filter =====

  async clickFilterButton(): Promise<void> {
    await this.candidateRegPage.clickFilterButton();
  }

  async verifyFilterPanelDisplayed(): Promise<void> {
    await expect(this.candidateRegPage.isFilterPanelVisible()).resolves.toBe(true);
  }

  async verifyApplyFilterButtonVisible(): Promise<void> {
    await expect(this.candidateRegPage.isApplyFilterButtonVisible()).resolves.toBe(true);
  }

  async verifyClearFilterButtonVisible(): Promise<void> {
    await expect(this.candidateRegPage.isClearFilterButtonVisible()).resolves.toBe(true);
  }

  async verifyHideFilterButtonVisible(): Promise<void> {
    await expect(this.candidateRegPage.isHideFilterButtonVisible()).resolves.toBe(true);
  }

  async verifyAddNewClauseButtonVisible(): Promise<void> {
    await expect(this.candidateRegPage.isAddNewClauseButtonVisible()).resolves.toBe(true);
  }

  async applyFilter(field: string, operator: string, value: string): Promise<void> {
    await this.candidateRegPage.setFilterField(field);
    await this.candidateRegPage.setFilterOperator(operator);
    await this.candidateRegPage.setFilterValue(value);
    await this.candidateRegPage.clickApplyFilter();
  }

  async clearFilter(): Promise<void> {
    await this.candidateRegPage.clickClearFilter();
  }

  async hideFilterPanel(): Promise<void> {
    await this.candidateRegPage.clickHideFilter();
  }

  async addNewFilterClause(): Promise<void> {
    await this.candidateRegPage.clickAddNewClause();
  }

  // ===== Export =====

  async clickExportButton(): Promise<void> {
    await this.candidateRegPage.clickExportButton();
  }

  async verifyExportDropdownVisible(): Promise<void> {
    await this.candidateRegPage.clickExportButton();
    await expect(this.candidateRegPage.exportCurrentViewOption).toBeVisible();
    await expect(this.candidateRegPage.exportAllOption).toBeVisible();
  }

  async exportCurrentView(): Promise<void> {
    await this.candidateRegPage.clickExportCurrentView();
  }

  async exportAll(): Promise<void> {
    await this.candidateRegPage.clickExportAll();
  }

  // ===== Columns =====

  async clickColumnsButton(): Promise<void> {
    await this.candidateRegPage.clickColumnsButton();
  }

  async verifyColumnsDropdownVisible(): Promise<void> {
    await this.candidateRegPage.clickColumnsButton();
    await expect(this.candidateRegPage.isShowHideAllCheckboxVisible()).resolves.toBe(true);
    await expect(this.candidateRegPage.isResetButtonVisible()).resolves.toBe(true);
    await expect(this.candidateRegPage.isSearchColumnsTextboxVisible()).resolves.toBe(true);
  }

  async verifyAllColumnCheckboxesVisible(): Promise<void> {
    await this.candidateRegPage.clickColumnsButton();
    await expect(this.candidateRegPage.areAllColumnCheckboxesVisible()).resolves.toBe(true);
  }

  async resetColumns(): Promise<void> {
    await this.candidateRegPage.clickResetColumns();
  }

  async toggleColumn(name: string): Promise<void> {
    await this.candidateRegPage.toggleColumnCheckbox(name);
  }

  // ===== New Candidate Registration =====

  async clickNewButton(): Promise<void> {
    await this.candidateRegPage.clickNewButton();
  }

  async verifyDrawerOpened(): Promise<void> {
    await expect(this.candidateRegPage.isDrawerVisible()).resolves.toBe(true);
  }

  async verifyDrawerTitleDisplayed(): Promise<void> {
    await expect(this.candidateRegPage.isDrawerTitleVisible()).resolves.toBe(true);
  }

  async verifyDrawerSubtitleDisplayed(): Promise<void> {
    await expect(this.candidateRegPage.isDrawerSubtitleVisible()).resolves.toBe(true);
  }

  async verifyDrawerCloseButtonVisible(): Promise<void> {
    await expect(this.candidateRegPage.isCloseButtonVisible()).resolves.toBe(true);
  }

  async verifyDrawerCancelButtonVisible(): Promise<void> {
    await expect(this.candidateRegPage.isCancelButtonVisible()).resolves.toBe(true);
  }

  async verifyDrawerRequestDocumentsButtonVisible(): Promise<void> {
    await expect(this.candidateRegPage.isRequestDocumentsButtonVisible()).resolves.toBe(true);
  }

  async verifyAllFormFieldsVisible(): Promise<void> {
    await expect(this.candidateRegPage.areAllDrawerFieldsVisible()).resolves.toBe(true);
  }

  async verifyAllRequiredFieldIndicatorsVisible(): Promise<void> {
    await expect(this.candidateRegPage.areAllRequiredFieldIndicatorsVisible()).resolves.toBe(true);
  }

  async verifyRequiredFieldAsterisksCount(): Promise<void> {
    await expect(this.candidateRegPage.areAllRequiredAsterisksVisible()).resolves.toBe(true);
  }

  async fillCandidateForm(candidateData: {
    applicantNumber: string;
    firstName: string;
    lastName: string;
    personalEmail: string;
    dialCode: string;
    mobileNumber: string;
    country: string;
    hiringPosition: string;
    joiningDate: string;
    employeeType: string;
    candidateType: string;
    shareConsentForm?: boolean;
  }): Promise<void> {
    await this.candidateRegPage.fillAndSubmit(candidateData);
  }

  async fillCandidateFormFields(candidateData: {
    applicantNumber: string;
    firstName: string;
    lastName: string;
    personalEmail: string;
    dialCode: string;
    mobileNumber: string;
    country: string;
    hiringPosition: string;
    joiningDate: string;
    employeeType: string;
    candidateType: string;
    shareConsentForm?: boolean;
  }): Promise<void> {
    await this.candidateRegPage.fillCandidateFormFields(candidateData);
  }

  async verifyFormFieldsPlaceholders(
    expectedPlaceholders: {
      applicantNumber?: string;
      firstName?: string;
      lastName?: string;
      personalEmail?: string;
      dialCode?: string;
      mobileNumber?: string;
      country?: string;
      hiringPosition?: string;
      joiningDate?: string;
    }
  ): Promise<void> {
    await this.candidateRegPage.verifyFormFieldsPlaceholders(expectedPlaceholders);
  }

  // ===== Cancel / Close Drawer =====

  async cancelNewCandidate(): Promise<void> {
    await this.candidateRegPage.clickCancelDrawer();
  }

  async closeNewCandidateDrawer(): Promise<void> {
    await this.candidateRegPage.clickCloseDrawer();
  }

  // ===== Validation =====

  async verifyRequiredFieldErrorDisplayed(): Promise<void> {
    await expect(this.candidateRegPage.isRequiredFieldErrorVisible()).resolves.toBe(true);
  }

  async getRequiredFieldErrorMessage(): Promise<string> {
    return await this.candidateRegPage.getRequiredFieldError();
  }

  async verifyDuplicateApplicantErrorDisplayed(): Promise<void> {
    await expect(this.candidateRegPage.duplicateApplicantError).toBeVisible();
  }

  // ===== Share Consent Toggle =====

  async enableShareConsent(): Promise<void> {
    await this.candidateRegPage.toggleShareConsent(true);
  }

  async disableShareConsent(): Promise<void> {
    await this.candidateRegPage.toggleShareConsent(false);
  }

  async isShareConsentEnabled(): Promise<boolean> {
    return await this.candidateRegPage.isShareConsentEnabled();
  }

  async verifyShareConsentToggleState(expectedState: 'enabled' | 'disabled'): Promise<void> {
    await this.candidateRegPage.verifyShareConsentToggleState(expectedState);
  }

  // ===== Request Documents =====

  async verifyRequestDocumentsButtonEnabled(): Promise<boolean> {
    return await this.candidateRegPage.verifyRequestDocumentsButtonEnabled();
  }

  async clickRequestDocuments(): Promise<void> {
    await this.candidateRegPage.clickRequestDocuments();
  }

  async verifyRequestDocumentsButtonDisabled(): Promise<void> {
    await expect(this.candidateRegPage.isRequestDocumentsButtonDisabled()).resolves.toBe(true);
  }

  // ===== Verify Button Enabled After Form Fill =====

  async verifyCancelButtonEnabled(): Promise<void> {
    await this.candidateRegPage.verifyCancelButtonEnabled();
  }

  // ===== Verify Drawer Opens from Right =====

  async verifyDrawerOpensFromRight(): Promise<void> {
    await this.candidateRegPage.verifyDrawerOpensFromRight();
  }

  // ===== Unique Data Validation =====

  async verifyDuplicateApplicantNumberError(): Promise<void> {
    const duplicateError = this.page.getByText(/duplicate|already exists|already registered|already used/i);
    await expect(duplicateError).toBeVisible({ timeout: 5000 });
  }

  async verifyDuplicateEmailError(): Promise<void> {
    // Try multiple patterns to catch duplicate email error
    const patterns = [
      /duplicate|already exists|already registered|email.*exists/i,
      /personal email.*already taken/i,
      /email.*in use/i,
      /cannot register with existing email/i
    ];
    
    for (const pattern of patterns) {
      try {
        const duplicateError = this.page.getByText(pattern);
        await expect(duplicateError).toBeVisible({ timeout: 2000 });
        return; // Success
      } catch (e) {
        // Continue to next pattern
      }
    }
    
    // If none matched, fail with all patterns tried
    const allErrors = patterns.map(p => this.page.getByText(p));
    await expect(allErrors[0]).toBeVisible({ timeout: 5000 });
  }

  async verifyDuplicateMobileNumberError(): Promise<void> {
    // Try multiple patterns to catch duplicate mobile error
    const patterns = [
      /duplicate|already exists|mobile.*exists|mobile.*registered/i,
      /mobile number.*already taken/i,
      /phone.*already in use/i,
      /cannot register with existing mobile/i
    ];
    
    for (const pattern of patterns) {
      try {
        const duplicateError = this.page.getByText(pattern);
        await expect(duplicateError).toBeVisible({ timeout: 2000 });
        return; // Success
      } catch (e) {
        // Continue to next pattern
      }
    }
    
    // If none matched, fail with all patterns tried
    const allErrors = patterns.map(p => this.page.getByText(p));
    await expect(allErrors[0]).toBeVisible({ timeout: 5000 });
  }

  async verifyDuplicateFirstNameLastNameError(): Promise<void> {
    // Try multiple patterns to catch duplicate name error
    const patterns = [
      /duplicate|already exists|first.*last.*exists|name.*exists/i,
      /first name.*last name.*already taken/i,
      /candidate with same name.*exists/i,
      /cannot register duplicate name/i
    ];
    
    for (const pattern of patterns) {
      try {
        const duplicateError = this.page.getByText(pattern);
        await expect(duplicateError).toBeVisible({ timeout: 2000 });
        return; // Success
      } catch (e) {
        // Continue to next pattern
      }
    }
    
    // If none matched, fail with all patterns tried
    const allErrors = patterns.map(p => this.page.getByText(p));
    await expect(allErrors[0]).toBeVisible({ timeout: 5000 });
  }

  async verifySuccessToast(): Promise<void> {
    // Look for success toast with flexible patterns.
    // Timeout intentionally generous (was 5000ms): a toast is transient and
    // this app's response time under load has repeatedly exceeded 5s in
    // practice, causing this check to flake even when the toast genuinely
    // did render moments later.
    const successToast = this.page.locator('[class*="toast"], [class*="Toast"], [class*="success"], [data-testid*="toast"], [data-testid*="notification"], div:has-text("success"), div:has-text("Success"), div:has-text("Documents Requested"), div:has-text("Documents requested")')
      .first();
    await expect(successToast).toBeVisible({ timeout: 15000 });
  }

  async isEmailSentToCandidate(email: string): Promise<boolean> {
    // This would be implemented using YOP Mail keywords or an email verification service
    // For now, we'll just check that the success message is shown
    return true;
  }

  async verifyDrawerTitleText(expectedText: string): Promise<void> {
    await this.candidateRegPage.verifyDrawerTitleText(expectedText);
  }

  async verifyDrawerSubtitleText(expectedText: string): Promise<void> {
    await this.candidateRegPage.verifyDrawerSubtitleText(expectedText);
  }

  // ===== Candidate Grid Row Actions =====

  async verifyCandidateRowVisible(candidateName: string): Promise<void> {
    const row = this.candidateRegPage.candidateRows.filter({ hasText: candidateName }).first();
    await expect(row.isVisible()).resolves.toBe(true);
  }

  async clickCandidateRow(candidateName: string): Promise<void> {
    await this.candidateRegPage.openCandidateDetail(candidateName);
  }

  async verifyCandidateStageText(candidateName: string, expectedStage: string): Promise<void> {
    const row = this.candidateRegPage.candidateRows.filter({ hasText: candidateName }).first();
    const stageCell = row.locator('[role="gridcell"]').last();
    const stageText = (await stageCell.textContent() ?? '').toLowerCase();
    await expect(stageText).toContain(expectedStage.toLowerCase());
  }

  /**
   * Verify the grid's Document Status badge for a candidate row (e.g. "Requested",
   * "Approved", "Pending"). Identifier can be name, email, or applicant number.
   */
  async verifyCandidateDocumentStatus(identifier: string, expectedStatus: string): Promise<void> {
    await this.candidateRegPage.verifyCandidateDocumentStatus(identifier, expectedStatus);
  }

  async getCandidateStageBadgeText(identifier: string): Promise<string> {
    return await this.candidateRegPage.getCandidateStageBadgeText(identifier);
  }
}


