import { Page, Locator, expect } from '@playwright/test';
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
    console.log(`Goto pre-onboarding link: ${preOnboardingLink}`);
    await this.page.goto(preOnboardingLink, { waitUntil: 'networkidle' });
    console.log(`Goto completed. URL: ${this.page.url()}. Title: ${await this.page.title()}`);
    
    try {
      await this.candidatePage.welcomeHeading.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Welcome heading visible - React app loaded successfully');
    } catch (error) {
      console.log('Welcome heading not found, checking page state...');
      console.log('Current URL:', this.page.url());
      console.log('Current title:', await this.page.title());
      // Try waiting for any heading
      try {
        await this.page.waitForSelector('h1', { state: 'visible', timeout: 5000 });
        console.log('h1 element found');
      } catch (innerError) {
        console.log('No h1 element found either. Page may not be rendering correctly.');
      }
    }
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

  async isStep1Active(): Promise<boolean> {
    return await this.candidatePage.isStep1Active();
  }

  async isStep2Active(): Promise<boolean> {
    return await this.candidatePage.isStep2Active();
  }

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
    address?: { addressLine1: string; country: string; state: string; city: string; pinCode: string };
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
    // Retry until visible: this is called right after the "Submit & Continue"
    // navigation, so a single-shot isVisible() check would race the page load.
    await expect(this.candidatePage.documentUploadCard).toBeVisible();
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
    passportDocumentType?: string; passportIdNumber?: string; passportName?: string; passportExpiryDate?: string;
  }): Promise<void> {
    await this.candidatePage.fillIdProofs(data);
  }

  async fillAdditionalDocuments(): Promise<void> {
    await this.candidatePage.fillAdditionalDocuments();
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
    specialization: string; startYear: string; gpa: string; gradingSystem: string;
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
    personalData: { firstName: string; lastName: string; alternateEmail?: string; dialCode: string; mobileNumber: string; dateOfBirth?: string; nationalId?: string; address?: { addressLine1: string; country: string; state: string; city: string; pinCode: string } },
    idProofsData: { aadhaarNumber: string; aadhaarName: string; panNumber: string; panName: string; panFatherName: string },
    educationData: { endYear: string; institutionName: string; degree: string; specialization: string; startYear: string; gpa: string; gradingSystem: string },
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
    // isSuccessBannerVisible() is a one-shot, non-retrying isVisible() check —
    // asserting on the locator directly with an explicit timeout instead
    // avoids a race against the banner still rendering right after submit.
    await expect(this.candidatePage.successBanner).toBeVisible({ timeout: 15000 });
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

  async drawSignature(): Promise<void> {
    await this.candidatePage.drawSignature();
  }

  async verifySignatureCanvasDrawn(): Promise<void> {
    await expect(this.candidatePage.isSignatureCanvasDrawn()).resolves.toBe(true);
  }

  async uploadSignatureFile(filePath: string): Promise<void> {
    await this.candidatePage.uploadSignatureFile(filePath);
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
    // Auto-retrying assertion (not a one-shot boolean check) — submission
    // shows a "Submitting..." spinner state for a few seconds before the
    // Completion step actually renders.
    await expect(this.candidatePage.allSetHeading).toBeVisible({ timeout: 20000 });
  }

  async verifyAllStepsCompletedBadgeVisible(): Promise<void> {
    await expect(this.candidatePage.isAllStepsCompletedBadgeVisible()).resolves.toBe(true);
  }

  async verifyDownloadSignedOfferLetterButtonVisible(): Promise<void> {
    await expect(this.candidatePage.isDownloadSignedOfferLetterButtonVisible()).resolves.toBe(true);
  }

  async getJoiningSummaryOfferStatus(): Promise<string> {
    return await this.candidatePage.getJoiningSummaryOfferStatus();
  }

  async verifyRejectionConfirmed(): Promise<void> {
    // Status update can lag briefly after Confirm Rejection, so poll rather
    // than taking a single snapshot.
    // The app records a candidate rejection as "Declined" (completion heading
    // "Offer Letter Declined", Offer Status "Declined") — it never renders the
    // word "Rejected" here, so asserting only on 'rejected' could not pass.
    await expect
      .poll(async () => (await this.candidatePage.getOfferStatus()).toLowerCase(), { timeout: 20000 })
      .toMatch(/rejected|declined/);
  }

  // ==========================================
  //  DOCUMENT VERIFICATION STEP INDICATOR
  // ==========================================

  async verifyDocumentVerificationStepActive(): Promise<void> {
    await expect(this.candidatePage.isStep3Active()).resolves.toBe(true);
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

  async verifyFieldError(fieldLocator: Locator, errorMessage: string): Promise<void> {
    await expect(fieldLocator.locator('..').locator('[class*="error"], [class*="Error"]')).toContainText(errorMessage);
  }
}


