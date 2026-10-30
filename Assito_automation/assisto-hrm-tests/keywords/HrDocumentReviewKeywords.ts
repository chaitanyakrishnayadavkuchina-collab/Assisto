import { Page, expect } from '@playwright/test';
import { HrDocumentReviewPage } from '@pages/HrDocumentReviewPage';

/**
 * HrDocumentReviewKeywords provides high-level business actions
 * for the HR-side Document Review view inside the candidate detail modal.
 *
 * Wraps HrDocumentReviewPage with semantic operations for:
 *  - Personal Information tab navigation
 *  - Document Verification: select a document, verify or reject it
 *  - Reject Document modal
 *  - Approve Candidate Onboarding
 *  - Offer Letter tab, approval summary and Release to Candidate
 */
export class HrDocumentReviewKeywords {
  private readonly page: Page;
  private readonly reviewPage: HrDocumentReviewPage;

  constructor(page: Page) {
    this.page = page;
    this.reviewPage = new HrDocumentReviewPage(page);
  }

  // ==========================================
  //  PERSONAL INFORMATION TAB
  // ==========================================

  async clickPersonalInfoTab(): Promise<void> {
    await this.reviewPage.clickPersonalInfoTab();
  }

  async verifyPersonalInfoTabVisible(): Promise<void> {
    // Auto-retrying assertion, not a one-shot isVisible(): opening a candidate
    // from the grid is a client-side route change, and the Candidate
    // Management grid has grown large enough that the detail page can take a
    // moment to render. The boolean form reported false immediately and the
    // failure looked like "the tab is missing" rather than "not yet".
    await expect(this.reviewPage.personalInfoTab).toBeVisible({ timeout: 20000 });
  }

  async clickContinueToDocumentVerification(): Promise<void> {
    await this.reviewPage.clickContinueToDocumentVerification();
  }

  // ==========================================
  //  DOCUMENT VERIFICATION TAB
  // ==========================================

  async clickDocumentVerificationTab(): Promise<void> {
    await this.reviewPage.clickDocumentVerificationTab();
  }

  async verifyDocumentVerificationTabVisible(): Promise<void> {
    await expect(this.reviewPage.isDocumentVerificationTabVisible()).resolves.toBe(true);
  }

  async verifyIdProofsKpiVisible(): Promise<void> {
    await expect(this.reviewPage.isIdProofsKpiVisible()).resolves.toBe(true);
  }

  async verifyEducationKpiVisible(): Promise<void> {
    await expect(this.reviewPage.isEducationKpiVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  DOCUMENT SELECTION
  // ==========================================

  async selectDocument(name: string): Promise<void> {
    await this.reviewPage.selectDocument(name);
  }

  async verifyPanDocDetailsVisible(): Promise<void> {
    // Matched by the extracted-field label rather than an input placeholder —
    // the document image itself can fail to render ("Failed to load image")
    // for this test's placeholder upload file, but the metadata fields below
    // it render independently. Auto-retrying since these still take a moment.
    const panLabel = this.page.getByText(/PAN NAME|ID NUMBER/i).first();
    await expect(panLabel).toBeVisible({ timeout: 15000 });
  }

  async verifyAadhaarDocDetailsVisible(): Promise<void> {
    const aadhaarLabel = this.page.getByText(/AADHAAR NUMBER/i).first();
    await expect(aadhaarLabel).toBeVisible({ timeout: 15000 });
  }

  // ==========================================
  //  VERIFY / REJECT DOCUMENT
  // ==========================================

  async clickVerifyDocument(): Promise<void> {
    await this.reviewPage.clickVerifyDocument();
  }

  async clickRejectDocument(): Promise<void> {
    await this.reviewPage.clickRejectDocument();
  }

  async fillDocumentRejectionReason(reason: string): Promise<void> {
    await this.reviewPage.fillRejectionReason(reason);
  }

  async clickConfirmDocumentRejection(): Promise<void> {
    await this.reviewPage.clickConfirmRejection();
  }

  async verifyDocumentStatusChanged(expectedStatus: string): Promise<void> {
    const status = await this.page.getByText('PENDING').first().isVisible()
      ? 'Pending'
      : await this.page.getByText('VERIFIED').first().isVisible()
        ? 'Verified'
        : await this.page.getByText('REJECTED').first().isVisible()
          ? 'Rejected'
          : '';
    await expect(status.toLowerCase()).toContain(expectedStatus.toLowerCase());
  }

  // ==========================================
  //  FINAL APPROVAL / REJECTION
  // ==========================================

  async clickApproveCandidateOnboarding(): Promise<void> {
    await this.reviewPage.clickApproveCandidateOnboarding();
  }

  async verifyApproveCandidateOnboardingButtonVisible(): Promise<void> {
    await expect(this.reviewPage.isApproveCandidateOnboardingButtonVisible()).resolves.toBe(true);
  }

  async clickRejectCandidate(): Promise<void> {
    await this.reviewPage.clickRejectCandidate();
  }

  async verifyRejectCandidateButtonVisible(): Promise<void> {
    await expect(this.reviewPage.isRejectCandidateButtonVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  OFFER LETTER TAB
  // ==========================================

  async clickOfferLetterTab(): Promise<void> {
    await this.reviewPage.clickOfferLetterTab();
  }

  async verifyOfferLetterTabVisible(): Promise<void> {
    await expect(this.reviewPage.isOfferLetterTabVisible()).resolves.toBe(true);
  }

  async verifyLetterTemplateVisible(): Promise<void> {
    const template = this.page.locator('[class*="template"], [class*="Template"]').filter({ has: this.page.getByText('Template') }).first();
    await expect(template.isVisible()).resolves.toBe(true);
  }

  async verifyApprovalSummaryVisible(): Promise<void> {
    await expect(this.reviewPage.isApprovalSummaryVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  RELEASE TO CANDIDATE
  // ==========================================

  async verifyReleaseToCandidateButtonVisible(): Promise<void> {
    await expect(this.reviewPage.isReleaseToCandidateButtonVisible()).resolves.toBe(true);
  }

  async clickReleaseToCandidate(): Promise<void> {
    await this.reviewPage.clickReleaseToCandidate();
  }

  async clickYesInConfirmation(): Promise<void> {
    await this.reviewPage.clickYesInConfirmation();
  }

  async verifyReleaseConfirmationDialogVisible(): Promise<void> {
    const dialog = this.page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').filter({ has: this.page.getByText(/Release to Candidate/i) }).first();
    await expect(dialog.isVisible()).resolves.toBe(true);
  }

  async verifyLetterReleasedSuccessfullyVisible(): Promise<void> {
    const message = this.page.getByText(/Letter released successfully|Letter sent to candidate/i);
    await expect(message.first().isVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  APPROVE LETTER MODAL (HR/CHRO SIGN-OFF)
  // ==========================================

  async verifyApproveLetterModalVisible(): Promise<void> {
    await expect(this.reviewPage.isApproveLetterModalVisible()).resolves.toBe(true);
  }

  async clickUploadSignatureTab(): Promise<void> {
    await this.reviewPage.clickUploadSignatureTab();
  }

  async uploadSignatureFile(filePath: string): Promise<void> {
    await this.reviewPage.uploadSignatureFile(filePath);
  }

  async clickApprove(): Promise<void> {
    await this.reviewPage.clickApprove();
  }

  // ==========================================
  //  HR MANAGER — SIMPLE CONFIRM APPROVE MODAL
  // ==========================================

  async verifySimpleApproveConfirmModalVisible(): Promise<void> {
    await expect(this.reviewPage.isSimpleApproveConfirmModalVisible()).resolves.toBe(true);
  }

  async clickSimpleApproveConfirm(): Promise<void> {
    await this.reviewPage.clickSimpleApproveConfirm();
  }

  async clickSimpleApproveCancel(): Promise<void> {
    await this.reviewPage.clickSimpleApproveCancel();
  }

  async clickInitiateApprove(): Promise<void> {
    await this.reviewPage.clickInitiateApprove();
  }

  async clickInitiateReject(): Promise<void> {
    await this.reviewPage.clickInitiateReject();
  }

  /**
   * CHRO approval — clicks the outer Approve button, then attaches a
   * signature file in the "Upload Signature" tab of the resulting modal, and confirms.
   */
  async approveOfferLetterWithSignature(signatureFilePath: string): Promise<void> {
    await this.clickInitiateApprove();
    await this.verifyApproveLetterModalVisible();
    await this.uploadSignatureFile(signatureFilePath);
    await this.clickApprove();
  }

  /**
   * HR Manager approval — clicks the outer Approve button, which shows a simple
   * Yes/No-style confirmation modal (no signature required, per "Cannot sign" role config).
   */
  async approveOfferLetterSimple(): Promise<void> {
    await this.clickInitiateApprove();
    await this.verifySimpleApproveConfirmModalVisible();
    await this.clickSimpleApproveConfirm();
  }

  // ==========================================
  //  OFFER LETTER TAB — LETTER CONFIGURATION (HR)
  // ==========================================

  async selectContractTemplate(templateName: string): Promise<void> {
    await this.reviewPage.selectContractTemplate(templateName);
  }

  async listContractTemplateOptions(): Promise<string[]> {
    return await this.reviewPage.listContractTemplateOptions();
  }

  async getSelectedContractTemplate(): Promise<string> {
    return await this.reviewPage.getSelectedContractTemplate();
  }

  async selectChroApprover(approverNameOrEmail: string): Promise<void> {
    await this.reviewPage.selectChroApprover(approverNameOrEmail);
  }

  async selectHrManagerApprover(approverNameOrEmail: string): Promise<void> {
    await this.reviewPage.selectHrManagerApprover(approverNameOrEmail);
  }

  async fillOfferLetterDetails(data: {
    title?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    dateOfJoining?: string;
    ctc?: string;
    variablePay?: string;
  }): Promise<void> {
    await this.reviewPage.fillOfferLetterDetails(data);
  }

  async fillSalaryComponent(componentName: string, monthlyValue: string): Promise<void> {
    await this.reviewPage.fillSalaryComponent(componentName, monthlyValue);
  }

  async clickGenerateDraft(): Promise<void> {
    await this.reviewPage.clickGenerateDraft();
  }

  async clickSubmitForApproval(): Promise<void> {
    await this.reviewPage.clickSubmitForApproval();
  }

  async clickEditDetails(): Promise<void> {
    await this.reviewPage.clickEditDetails();
  }

  async verifyGenerateDraftButtonVisible(): Promise<void> {
    await expect(this.reviewPage.isGenerateDraftButtonVisible()).resolves.toBe(true);
  }

  async verifyGenerateDraftButtonEnabled(): Promise<void> {
    await expect(this.reviewPage.isGenerateDraftButtonEnabled()).resolves.toBe(true);
  }

  async verifyContractTemplateDropdownVisible(): Promise<void> {
    // Auto-retrying — the Offer Letter tab briefly shows a "Loading template
    // fields..." placeholder before the form (including this dropdown) renders.
    await expect(this.reviewPage.contractTemplateDropdown).toBeVisible({ timeout: 15000 });
  }

  async verifyChroApproverDropdownVisible(): Promise<void> {
    await expect(this.reviewPage.chroApproverDropdown).toBeVisible({ timeout: 15000 });
  }

  async verifyHrManagerApproverDropdownVisible(): Promise<void> {
    await expect(this.reviewPage.hrManagerApproverDropdown).toBeVisible({ timeout: 15000 });
  }

  async getOfferLetterStatus(): Promise<string> {
    return await this.reviewPage.getOfferLetterStatus();
  }

  /**
   * Full generate + submit flow: select template, pick CHRO + HR Manager approvers,
   * fill letter details + salary basics, generate the draft, then submit for approval.
   */
  async generateAndSubmitOfferLetter(data: {
    template: string;
    chroApprover: string;
    hrManagerApprover: string;
    title?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    dateOfJoining?: string;
    ctc?: string;
    variablePay?: string;
  }): Promise<void> {
    await this.selectContractTemplate(data.template);
    await this.selectChroApprover(data.chroApprover);
    await this.selectHrManagerApprover(data.hrManagerApprover);
    await this.fillOfferLetterDetails(data);
    await this.clickGenerateDraft();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.clickSubmitForApproval();
  }
}
