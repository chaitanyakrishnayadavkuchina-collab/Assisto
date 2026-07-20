import { Page, expect } from '@playwright/test';
import { CandidatePreOnboardingPage } from '@pages/CandidatePreOnboardingPage';

/**
 * CandidatePreOnboardingKeywords provides high-level business actions
 * for the candidate-side Pre-Onboarding portal.
 *
 * Wraps CandidatePreOnboardingPage with semantic operations for:
 *  - Personal Information form
 *  - Document Upload (ID Proofs + Education tabs)
 *  - Document Verification (post-submission review page)
 */
export class CandidatePreOnboardingKeywords {
  private readonly page: Page;
  private readonly candidatePage: CandidatePreOnboardingPage;

  constructor(page: Page) {
    this.page = page;
    this.candidatePage = new CandidatePreOnboardingPage(page);
  }

  // ==========================================
  //  NAVIGATION
  // ==========================================

  async navigateToCandidatePreOnboarding(preOnboardingLink: string): Promise<void> {
    await this.page.goto(preOnboardingLink, { waitUntil: 'networkidle' });
    // Wait for the welcome heading to be visible to ensure React app is fully rendered
    await this.candidatePage.welcomeHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  // ==========================================
  //  WELCOME PAGE VERIFICATIONS
  // ==========================================

  async verifyWelcomeHeadingVisible(): Promise<void> {
    await expect(this.candidatePage.isWelcomeHeadingVisible()).resolves.toBe(true);
  }

  async getWelcomeText(): Promise<string> {
    return await this.candidatePage.getWelcomeText();
  }

  // ==========================================
  //  STEP INDICATOR VERIFICATIONS
  // ==========================================

  async verifyStep1Active(): Promise<void> {
    await expect(this.candidatePage.isStep1Active()).resolves.toBe(true);
  }

  async verifyStep1Completed(): Promise<void> {
    await expect(this.candidatePage.isStep1Completed()).resolves.toBe(true);
  }

  async verifyStep2Active(): Promise<void> {
    await expect(this.candidatePage.isStep2Active()).resolves.toBe(true);
  }

  async verifyStep3Active(): Promise<void> {
    await expect(this.candidatePage.isStep3Active()).resolves.toBe(true);
  }

  async verifyStep2Completed(): Promise<void> {
    await expect(this.candidatePage.isStep2Completed()).resolves.toBe(true);
  }

  // ==========================================
  //  PERSONAL INFORMATION VERIFICATIONS
  // ==========================================

  async verifyPersonalInfoSectionVisible(): Promise<void> {
    await expect(this.candidatePage.isPersonalInfoCardVisible()).resolves.toBe(true);
  }

  async verifyAllPersonalInfoFieldsVisible(): Promise<void> {
    await expect(this.candidatePage.areAllPersonalInfoFieldsVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  PERSONAL INFORMATION FORM ACTIONS
  // ==========================================

  async fillPersonalInformation(data: {
    firstName: string; lastName: string; alternateEmail?: string;
    dialCode: string; mobileNumber: string; dateOfBirth?: string; nationalId?: string;
  }): Promise<void> {
    await this.candidatePage.fillPersonalInformation(data);
  }

  async clickSaveAndContinue(): Promise<void> {
    await this.candidatePage.clickSaveAndContinue();
  }

  // ==========================================
  //  DOCUMENT UPLOAD - VERIFICATIONS
  // ==========================================

  async verifyDocumentUploadSectionVisible(): Promise<void> {
    await expect(this.candidatePage.isDocumentUploadCardVisible()).resolves.toBe(true);
  }

  async verifyIdProofsTabVisible(): Promise<void> {
    await expect(this.candidatePage.isIdProofsTabVisible()).resolves.toBe(true);
  }

  async verifyAadhaarSectionVisible(): Promise<void> {
    await expect(this.candidatePage.isAadhaarCardSectionVisible()).resolves.toBe(true);
  }

  async verifyPanSectionVisible(): Promise<void> {
    await expect(this.candidatePage.isPanSectionVisible()).resolves.toBe(true);
  }

  async verifyEducationalDocsSectionVisible(): Promise<void> {
    await expect(this.candidatePage.isEducationTabVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  DOCUMENT UPLOAD - FORM ACTIONS
  // ==========================================

  async fillIdProofs(data: {
    aadhaarNumber: string; aadhaarName: string;
    panNumber: string; panName: string; panFatherName: string;
  }): Promise<void> {
    await this.candidatePage.fillIdProofs(data);
  }

  async clickNext(): Promise<void> {
    await this.candidatePage.clickNext();
  }

  // ==========================================
  //  EDUCATION TAB
  // ==========================================

  async verifyEducationTabVisible(): Promise<void> {
    await expect(this.candidatePage.isEducationTabVisible()).resolves.toBe(true);
  }

  async clickEducationTab(): Promise<void> {
    await this.candidatePage.clickEducationTab();
  }

  async fillEducation(data: {
    endYear: string; institutionName: string; degree: string;
    specialization: string; startYear: string; gpa: string;
  }): Promise<void> {
    await this.candidatePage.fillEducation(data);
  }

  async clickPrevious(): Promise<void> {
    await this.candidatePage.clickPrevious();
  }

  // ==========================================
  //  COMPLETE FORM FILL
  // ==========================================

  async fillCompleteForm(
    personalData: { firstName: string; lastName: string; alternateEmail?: string; dialCode: string; mobileNumber: string; dateOfBirth?: string; nationalId?: string },
    idProofsData: { aadhaarNumber: string; aadhaarName: string; panNumber: string; panName: string; panFatherName: string },
    educationData: { endYear: string; institutionName: string; degree: string; specialization: string; startYear: string; gpa: string },
  ): Promise<void> {
    await this.candidatePage.fillCompleteForm(personalData, idProofsData, educationData);
  }

  // ==========================================
  //  SAVE AS DRAFT
  // ==========================================

  async clickSaveAsDraft(): Promise<void> {
    await this.candidatePage.clickSaveAsDraft();
  }

  async verifySaveAsDraftButtonVisible(): Promise<void> {
    await expect(this.candidatePage.isSaveAsDraftButtonVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  SUBMIT DOCUMENTS
  // ==========================================

  async clickSubmitDocuments(): Promise<void> {
    await this.candidatePage.clickSubmitDocuments();
  }

  async verifySubmitDocumentsButtonVisible(): Promise<void> {
    await expect(this.candidatePage.isSubmitDocumentsButtonVisible()).resolves.toBe(true);
  }

  async verifySubmitDocumentsButtonEnabled(): Promise<void> {
    await expect(this.candidatePage.isSubmitDocumentsButtonEnabled()).resolves.toBe(true);
  }

  // ==========================================
  //  DOCUMENT VERIFICATION PAGE (POST-SUBMISSION)
  // ==========================================

  async verifySuccessBannerVisible(): Promise<void> {
    await expect(this.candidatePage.isSuccessBannerVisible()).resolves.toBe(true);
  }

  async verifyVerificationInProgressTextVisible(): Promise<void> {
    await expect(this.candidatePage.isVerificationInProgressTextVisible()).resolves.toBe(true);
  }

  async verifyAllKPICardsVisible(): Promise<void> {
    await expect(this.candidatePage.areAllKPICardsVisible()).resolves.toBe(true);
  }

  async getTotalDocumentsCount(): Promise<string> {
    return await this.candidatePage.getTotalDocumentsCount();
  }

  async getApprovedCount(): Promise<string> {
    return await this.candidatePage.getApprovedCount();
  }

  async getPendingReviewCount(): Promise<string> {
    return await this.candidatePage.getPendingReviewCount();
  }

  async getRejectedCount(): Promise<string> {
    return await this.candidatePage.getRejectedCount();
  }

  async verifyOverallVerificationProgressVisible(): Promise<void> {
    await expect(this.candidatePage.isOverallVerificationProgressVisible()).resolves.toBe(true);
  }

  async getOverallProgressPercent(): Promise<string> {
    return await this.candidatePage.getOverallProgressPercent();
  }

  async getOverallApprovedCountText(): Promise<string> {
    return await this.candidatePage.getOverallApprovedCountText();
  }

  async verifyIdentityDocumentsSectionVisible(): Promise<void> {
    await expect(this.candidatePage.isIdentityDocumentsSectionVisible()).resolves.toBe(true);
  }

  async verifyPanDocRowVisible(): Promise<void> {
    await expect(this.candidatePage.isPanDocRowVisible()).resolves.toBe(true);
  }

  async getPanStatus(): Promise<string> {
    return await this.candidatePage.getPanStatus();
  }

  async verifyAadhaarDocRowVisible(): Promise<void> {
    await expect(this.candidatePage.isAadhaarDocRowVisible()).resolves.toBe(true);
  }

  async getAadhaarStatus(): Promise<string> {
    return await this.candidatePage.getAadhaarStatus();
  }

  async verifyAcademicDocumentsSectionVisible(): Promise<void> {
    await expect(this.candidatePage.isAcademicDocumentsSectionVisible()).resolves.toBe(true);
  }

  async verifyEducationalDocRowVisible(): Promise<void> {
    await expect(this.candidatePage.isEducationalDocRowVisible()).resolves.toBe(true);
  }

  async getEducationalDocStatus(): Promise<string> {
    return await this.candidatePage.getEducationalDocStatus();
  }

  // ==========================================
  //  STEP INDICATOR - STEP 4 & 5
  // ==========================================

  async verifyStep3Completed(): Promise<void> {
    await expect(this.candidatePage.isStep3Completed()).resolves.toBe(true);
  }

  async verifyStep4Active(): Promise<void> {
    const cls = await this.candidatePage.step4OfferLetterRelease.getAttribute('class') ?? '';
    await expect(/active|current|Active|Current/i.test(cls)).resolves.toBe(true);
  }

  async verifyStep5Active(): Promise<void> {
    const cls = await this.candidatePage.step5Completion.getAttribute('class') ?? '';
    await expect(/active|current|Active|Current/i.test(cls)).resolves.toBe(true);
  }

  async verifyPersonalInfoCompleted(): Promise<void> {
    await expect(this.candidatePage.isStep1Completed()).resolves.toBe(true);
  }

  async verifyDocumentUploadCompleted(): Promise<void> {
    await expect(this.candidatePage.isStep2Completed()).resolves.toBe(true);
  }

  async verifyUploadSuccessBannerVisible(): Promise<void> {
    await expect(this.candidatePage.isSuccessBannerVisible()).resolves.toBe(true);
  }

  async verifyPanDocumentRowVisible(): Promise<void> {
    await expect(this.candidatePage.isPanDocRowVisible()).resolves.toBe(true);
  }

  async verifyAadhaarDocumentRowVisible(): Promise<void> {
    await expect(this.candidatePage.isAadhaarDocRowVisible()).resolves.toBe(true);
  }

  async getOverallCompletePercent(): Promise<string> {
    return await this.candidatePage.getOverallProgressPercent();
  }

  async getOverallApprovedCount(): Promise<string> {
    return await this.candidatePage.getOverallApprovedCountText();
  }

  async verifyStep4Completed(): Promise<void> {
    const cls = await this.candidatePage.step4OfferLetterRelease.getAttribute('class') ?? '';
    await expect(/completed|Completed/i.test(cls)).resolves.toBe(true);
  }

  async verifyStep5Completed(): Promise<void> {
    const cls = await this.candidatePage.step5Completion.getAttribute('class') ?? '';
    await expect(/completed|Completed/i.test(cls)).resolves.toBe(true);
  }

  // ==========================================
  //  PHASE 4: OFFER LETTER RELEASE - VERIFICATIONS
  // ==========================================

  async verifyOfferLetterCardVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferLetterCardVisible()).resolves.toBe(true);
  }

  async verifyOfferLetterDocumentPreviewVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferLetterDocumentPreviewVisible()).resolves.toBe(true);
  }

  async verifyOfferLetterDownloadButtonVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferLetterDownloadButtonVisible()).resolves.toBe(true);
  }

  async verifyOfferLetterConfidentialBadgeVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferLetterConfidentialBadgeVisible()).resolves.toBe(true);
  }

  async verifyOfferSummaryPanelVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferSummaryPanelVisible()).resolves.toBe(true);
  }

  async verifyOfferPositionVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferPositionVisible()).resolves.toBe(true);
  }

  async verifyOfferCompanyVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferCompanyVisible()).resolves.toBe(true);
  }

  async verifyOfferStartDateVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferStartDateVisible()).resolves.toBe(true);
  }

  async verifyOfferCtcVisible(): Promise<void> {
    await expect(this.candidatePage.isOfferCtcVisible()).resolves.toBe(true);
  }

  async verifyAwaitingResponseVisible(): Promise<void> {
    await expect(this.candidatePage.isAwaitingResponseVisible()).resolves.toBe(true);
  }

  async verifyAcceptAndUploadSignedLetterButtonVisible(): Promise<void> {
    await expect(this.candidatePage.isAcceptAndUploadSignedLetterButtonVisible()).resolves.toBe(true);
  }

  async verifyRejectOfferButtonVisible(): Promise<void> {
    await expect(this.candidatePage.isRejectOfferButtonVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  PHASE 4: OFFER LETTER RELEASE - ACTIONS
  // ==========================================

  async clickAcceptAndUploadSignedLetter(): Promise<void> {
    await this.candidatePage.clickAcceptAndUploadSignedLetter();
  }

  async clickRejectOffer(): Promise<void> {
    await this.candidatePage.clickRejectOffer();
  }

  async verifyAcceptOfferModalVisible(): Promise<void> {
    await expect(this.candidatePage.isAcceptOfferModalVisible()).resolves.toBe(true);
  }

  async clickDrawTab(): Promise<void> {
    await this.candidatePage.clickDrawTab();
  }

  async clickUploadTab(): Promise<void> {
    await this.candidatePage.clickUploadTab();
  }

  async clickClearSignature(): Promise<void> {
    await this.candidatePage.clickClearSignature();
  }

  async clickSubmitAndAcceptOffer(): Promise<void> {
    await this.candidatePage.clickSubmitAndAcceptOffer();
  }

  // ==========================================
  //  REJECTION FORM
  // ==========================================

  async verifyRejectionFormVisible(): Promise<void> {
    await expect(this.candidatePage.isReasonForRejectionVisible()).resolves.toBe(true);
  }

  async verifyRejectionReasonPlaceholderVisible(): Promise<void> {
    const placeholder = await this.candidatePage.rejectionReasonInput.getAttribute('placeholder');
    await expect(placeholder).toBeTruthy();
  }

  async fillRejectionReason(reason: string): Promise<void> {
    await this.candidatePage.fillRejectionReason(reason);
  }

  async verifyConfirmRejectionButtonEnabled(): Promise<void> {
    await expect(this.candidatePage.confirmRejectionButton.isEnabled()).resolves.toBe(true);
  }

  async clickConfirmRejection(): Promise<void> {
    await this.candidatePage.clickConfirmRejection();
  }

  async clickCancelRejection(): Promise<void> {
    await this.candidatePage.clickCancelRejection();
  }

  async rejectOfferWithReason(reason: string): Promise<void> {
    await this.candidatePage.rejectOfferWithReason(reason);
  }

  // ==========================================
  //  COMPLETION PAGE
  // ==========================================

  async verifyCompletionPageVisible(): Promise<void> {
    await expect(this.candidatePage.isAllSetHeadingVisible()).resolves.toBe(true);
  }

  async verifyRejectionConfirmed(): Promise<void> {
    // After rejection, the offer status should change
    const offerStatus = await this.candidatePage.getOfferStatus();
    await expect(offerStatus.toLowerCase()).toContain('rejected');
  }

  // ==========================================
  //  DOCUMENT VERIFICATION STEP INDICATOR
  // ==========================================

  async verifyDocumentVerificationStepActive(): Promise<void> {
    await expect(this.candidatePage.isStep3Active()).resolves.toBe(true);
  }

  // ==========================================
  //  HR VIEW: DOCUMENT VERIFICATION TAB (inside candidate detail modal)
  // ==========================================

  async clickDocumentVerificationTab(): Promise<void> {
    // Click the Document Verification tab inside the candidate detail modal
    await this.page.getByRole('tab', { name: 'Document Verification' }).click();
  }

  async verifyDocumentVerificationTabVisible(): Promise<void> {
    const tab = this.page.getByRole('tab', { name: 'Document Verification' });
    await expect(tab.isVisible()).resolves.toBe(true);
  }

  async verifyIdProofsKpiVisible(): Promise<void> {
    const kpi = this.page.getByRole('heading', { name: 'ID Proofs' }).locator('..').locator('..').first();
    await expect(kpi.isVisible()).resolves.toBe(true);
  }

  async verifyEducationKpiVisible(): Promise<void> {
    const kpi = this.page.getByRole('heading', { name: 'Education' }).locator('..').locator('..').first();
    await expect(kpi.isVisible()).resolves.toBe(true);
  }

  async clickPanDoc(): Promise<void> {
    await this.page.getByRole('listitem').filter({ has: this.page.getByText('pan', { exact: false }) }).first().click();
  }

  async clickAadhaarDoc(): Promise<void> {
    await this.page.getByRole('listitem').filter({ has: this.page.getByText('Aadhaar Card') }).first().click();
  }

  async clickEducationalDoc(): Promise<void> {
    await this.page.getByRole('listitem').filter({ has: this.page.getByText('Educational documents') }).first().click();
  }

  async verifyPanDocDetailsVisible(): Promise<void> {
    // Verify the document details panel shows Pan-related fields
    const panFields = this.page.locator('input[placeholder*="pan"], input[placeholder*="Pan"], input[placeholder*="PAN"]');
    await expect(panFields.first().isVisible()).resolves.toBe(true);
  }

  async verifyAadhaarDocDetailsVisible(): Promise<void> {
    // Verify the document details panel shows Aadhaar-related fields
    const aadhaarFields = this.page.locator('input[placeholder*="Aadhaar"], input[placeholder*="aadhaar"]');
    await expect(aadhaarFields.first().isVisible()).resolves.toBe(true);
  }

  async clickVerifyDocument(): Promise<void> {
    await this.page.getByRole('button', { name: 'Verify Document' }).click();
  }

  async clickRejectDocument(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reject Document' }).click();
  }

  async fillDocumentRejectionReason(reason: string): Promise<void> {
    await this.page.getByRole('textbox', { name: /reason/i }).fill(reason);
  }

  async clickConfirmDocumentRejection(): Promise<void> {
    await this.page.getByRole('button', { name: /Confirm/i }).click();
  }

  async clickApproveCandidateOnboarding(): Promise<void> {
    await this.page.getByRole('button', { name: 'Approve Candidate Onboarding' }).click();
  }

  async clickRejectCandidate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reject Candidate' }).click();
  }

  async verifyDocumentStatusChanged(expectedStatus: string): Promise<void> {
    const status = await this.getPanStatus();
    await expect(status.toLowerCase()).toContain(expectedStatus.toLowerCase());
  }

  // ==========================================
  //  HR VIEW: OFFER LETTER TAB
  // ==========================================

  async clickOfferLetterTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Offer Letter' }).click();
  }

  async verifyOfferLetterTabVisible(): Promise<void> {
    const tab = this.page.getByRole('tab', { name: 'Offer Letter' });
    await expect(tab.isVisible()).resolves.toBe(true);
  }

  async verifyLetterTemplateVisible(): Promise<void> {
    // Verify letter template dropdown/selector is visible
    const template = this.page.locator('[class*="template"], [class*="Template"]').filter({ has: this.page.getByText('Template') }).first();
    await expect(template.isVisible()).resolves.toBe(true);
  }

  async verifyApprovalSummaryVisible(): Promise<void> {
    // Verify approval summary panel is visible
    const summary = this.page.getByRole('heading', { name: /approval/i }).locator('..').first();
    await expect(summary.isVisible()).resolves.toBe(true);
  }

  async verifyReleaseToCandidateButtonVisible(): Promise<void> {
    const btn = this.page.getByRole('button', { name: 'Release to Candidate' });
    await expect(btn.isVisible()).resolves.toBe(true);
  }

  async clickReleaseToCandidate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Release to Candidate' }).click();
  }

  async clickYesInConfirmation(): Promise<void> {
    await this.page.getByRole('button', { name: 'Yes' }).first().click();
  }

  async verifyLetterReleasedSuccessfullyVisible(): Promise<void> {
    // Verify success message after letter release
    const message = this.page.getByText(/Letter released successfully|Letter sent to candidate/i);
    await expect(message.first().isVisible()).resolves.toBe(true);
  }

  async verifyReleaseConfirmationDialogVisible(): Promise<void> {
    const dialog = this.page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').filter({ has: this.page.getByText(/Release to Candidate/i) }).first();
    await expect(dialog.isVisible()).resolves.toBe(true);
  }

  // ==========================================
  //  VALIDATION HELPERS
  // ==========================================

  async verifyFormValidationErrorsVisible(): Promise<void> {
    const errors = this.page.getByRole('alert').or(this.page.getByText(/error|warning/i, { exact: false }));
    await expect(errors.first().isVisible()).resolves.toBe(true);
  }

  async getFormValidationErrorMessage(): Promise<string> {
    const error = this.page.getByRole('alert').first();
    return (await error.textContent() ?? '').trim();
  }

  async verifyFieldError(fieldLocator: any, errorMessage: string): Promise<void> {
    await expect(fieldLocator.locator('..').locator('[class*="error"], [class*="Error"]')).toContainText(errorMessage);
  }
}


