import { type Page, type Locator, expect } from '@playwright/test';

/**
 * DocumentVerificationPage class encapsulates all locators and atomic UI actions
 * for the HR Document Verification view within the candidate detail modal.
 *
 * Covers:
 *   - Personal Information tab with Request Correction / Continue buttons
 *   - Document Verification tab with document selection, verification, and rejection
 *   - Reject Document modal with reason input
 *   - Reject Candidate button
 *   - Approve Letter modal (signature upload / download & sign)
 *   - Release to Candidate flow
 */
export class DocumentVerificationPage {
  private readonly page: Page;

  // ==========================================
  //  PERSONAL INFORMATION TAB
  // ==========================================
  readonly personalInfoTab: Locator;
  readonly personalInfoCard: Locator;

  // Personal Info Fields
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly personalEmailField: Locator;
  readonly mobileNumberField: Locator;
  readonly hiringPositionField: Locator;
  readonly countryField: Locator;
  readonly candidateTypeField: Locator;
  readonly employeeTypeField: Locator;
  readonly dateOfJoiningField: Locator;

  // Action Buttons
  readonly requestCorrectionButton: Locator;
  readonly continueToDocumentVerificationButton: Locator;

  // ==========================================
  //  DOCUMENT VERIFICATION TAB
  // ==========================================
  readonly documentVerificationTab: Locator;
  readonly offerLetterTab: Locator;

  // KPI Cards
  readonly idProofsKpi: Locator;
  readonly educationKpi: Locator;
  readonly overallProgressKpi: Locator;

  // Document List (left sidebar)
  readonly documentList: Locator;
  readonly aadhaarCardDoc: Locator;
  readonly panDoc: Locator;
  readonly educationalDocs: Locator;

  // Document Preview Area
  readonly documentPreview: Locator;
  readonly documentPreviewPlaceholder: Locator;

  // Document Details
  readonly panNameField: Locator;
  readonly fatherNameField: Locator;
  readonly aadhaarNumberField: Locator;
  readonly aadhaarNameField: Locator;
  readonly endYearField: Locator;
  readonly institutionNameField: Locator;
  readonly degreeField: Locator;
  readonly specializationField: Locator;
  readonly startYearField: Locator;
  readonly gpaField: Locator;

  // Document Actions
  readonly verifyDocumentButton: Locator;
  readonly rejectDocumentButton: Locator;
  readonly saveAsDraftButton: Locator;
  readonly approveCandidateOnboardingButton: Locator;
  readonly rejectCandidateButton: Locator;

  // AI Features
  readonly aiDeepScanButton: Locator;
  readonly aiHelpButton: Locator;

  // ==========================================
  //  REJECT DOCUMENT MODAL
  // ==========================================
  readonly rejectDocumentModal: Locator;
  readonly rejectDocumentModalTitle: Locator;
  readonly rejectionReasonInput: Locator;
  readonly cancelRejectionButton: Locator;
  readonly confirmRejectionButton: Locator;

  // ==========================================
  //  APPROVE LETTER MODAL (HR/CHRO Sign-off)
  // ==========================================
  readonly approveLetterModal: Locator;
  readonly uploadSignatureTab: Locator;
  readonly downloadAndSignTab: Locator;
  readonly selectFileButton: Locator;
  readonly cancelApprovalButton: Locator;
  readonly approveButton: Locator;

  // ==========================================
  //  DOCUMENT STATUS INDICATORS
  // ==========================================
  readonly documentStatusPending: Locator;
  readonly documentStatusVerified: Locator;
  readonly documentStatusRejected: Locator;

  constructor(page: Page) {
    this.page = page;

    // Personal Information Tab
    this.personalInfoTab = page.getByRole('tab', { name: 'Personal Information' });
    this.personalInfoCard = page.locator('[class*="personal-info"], [class*="PersonalInfo"]').first();

    // Personal Info Fields
    this.firstNameField = page.getByText('FIRST NAME').locator('..').locator('input, [class*="value"]');
    this.lastNameField = page.getByText('LAST NAME').locator('..').locator('input, [class*="value"]');
    this.personalEmailField = page.getByText('PERSONAL EMAIL').locator('..').locator('input, [class*="value"]');
    this.mobileNumberField = page.getByText('MOBILE NUMBER').locator('..').locator('input, [class*="value"]');
    this.hiringPositionField = page.getByText('HIRING POSITION').locator('..').locator('input, [class*="value"]');
    this.countryField = page.getByText('COUNTRY').locator('..').locator('input, [class*="value"]');
    this.candidateTypeField = page.getByText('CANDIDATE TYPE').locator('..').locator('input, [class*="value"]');
    this.employeeTypeField = page.getByText('EMPLOYEE TYPE').locator('..').locator('input, [class*="value"]');
    this.dateOfJoiningField = page.getByText('DATE OF JOINING').locator('..').locator('input, [class*="value"]');

    // Action Buttons in Personal Info
    this.requestCorrectionButton = page.getByRole('button', { name: 'Request Correction' });
    this.continueToDocumentVerificationButton = page.getByRole('button', { name: 'Continue to Document Verification' });

    // Document Verification Tab
    this.documentVerificationTab = page.getByRole('tab', { name: 'Document Verification' });
    this.offerLetterTab = page.getByRole('tab', { name: 'Offer Letter' });

    // KPI Cards
    this.idProofsKpi = page.locator('[class*="kpi"], [class*="card"]').filter({ has: page.getByText('ID PROOFS') }).first();
    this.educationKpi = page.locator('[class*="kpi"], [class*="card"]').filter({ has: page.getByText('EDUCATION') }).first();
    this.overallProgressKpi = page.locator('[class*="kpi"], [class*="card"]').filter({ has: page.getByText('OVERALL PROGRESS') }).first();

    // Document List
    this.documentList = page.locator('[class*="document-list"], [class*="DocumentList"]');
    this.aadhaarCardDoc = page.getByRole('button', { name: /aadhaar card/i }).first();
    this.panDoc = page.getByRole('button', { name: /pan$/i }).first();
    this.educationalDocs = page.getByRole('button', { name: /educational documents/i }).first();

    // Document Preview
    this.documentPreview = page.locator('[class*="document-preview"], [class*="DocumentPreview"]');
    this.documentPreviewPlaceholder = page.getByText('Ready for Review').first();

    // Document Details
    this.panNameField = page.getByText('PAN NAME').locator('..').locator('input');
    this.fatherNameField = page.getByText('FATHER NAME').locator('..').locator('input');
    this.aadhaarNumberField = page.getByText('AADHAAR NUMBER').locator('..').locator('input');
    this.aadhaarNameField = page.getByText('NAME').locator('..').locator('input');
    this.endYearField = page.getByText('END YEAR').locator('..').locator('input');
    this.institutionNameField = page.getByText('INSTITUTION NAME').locator('..').locator('input');
    this.degreeField = page.getByText('DEGREE/QUALIFICATION').locator('..').locator('input');
    this.specializationField = page.getByText('SPECIALIZATION/MAJOR').locator('..').locator('input');
    this.startYearField = page.getByText('START YEAR').locator('..').locator('input');
    this.gpaField = page.getByText('GPA/PERCENTAGE').locator('..').locator('input');

    // Document Actions
    this.verifyDocumentButton = page.getByRole('button', { name: 'Verify Document' });
    this.rejectDocumentButton = page.getByRole('button', { name: 'Reject' }).filter({ hasNot: page.getByText('Candidate') }).first();
    this.saveAsDraftButton = page.getByRole('button', { name: 'Save as Draft' });
    this.approveCandidateOnboardingButton = page.getByRole('button', { name: 'Approve Candidate Onboarding' });
    this.rejectCandidateButton = page.getByRole('button', { name: 'Reject Candidate' });

    // AI Features
    this.aiDeepScanButton = page.getByRole('button', { name: /AI Deep Scan/i });
    this.aiHelpButton = page.getByText('Unsure? Let AI help').first();

    // Reject Document Modal
    this.rejectDocumentModal = page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').filter({ has: page.getByText('Reject Document') }).first();
    this.rejectDocumentModalTitle = page.getByRole('heading', { name: 'Reject Document' });
    this.rejectionReasonInput = page.getByPlaceholder(/reason|e\.g\./i).first();
    this.cancelRejectionButton = page.getByRole('button', { name: 'Cancel' }).last();
    this.confirmRejectionButton = page.getByRole('button', { name: 'Confirm Rejection' });

    // Document Status Indicators
    this.documentStatusPending = page.getByText('PENDING').first();
    this.documentStatusVerified = page.getByText('VERIFIED').first();
    this.documentStatusRejected = page.getByText('REJECTED').first();

    // ── Approve Letter Modal ──
    this.approveLetterModal = page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').filter({ has: page.getByRole('heading', { name: 'Approve Letter' }) }).first();
    this.uploadSignatureTab = this.approveLetterModal.getByRole('tab', { name: 'Upload Signature' });
    this.downloadAndSignTab = this.approveLetterModal.getByRole('tab', { name: 'Download and Sign' });
    this.selectFileButton = this.approveLetterModal.getByRole('button', { name: 'Select File' });
    this.cancelApprovalButton = this.approveLetterModal.getByRole('button', { name: 'Cancel' });
    this.approveButton = this.approveLetterModal.getByRole('button', { name: 'Approve' });
  }

  // ==========================================
  //  PERSONAL INFORMATION ACTIONS
  // ==========================================

  async clickPersonalInfoTab(): Promise<void> {
    await this.personalInfoTab.click();
  }

  async clickContinueToDocumentVerification(): Promise<void> {
    await this.continueToDocumentVerificationButton.click();
  }

  async clickRequestCorrection(): Promise<void> {
    await this.requestCorrectionButton.click();
  }

  async isRequestCorrectionButtonVisible(): Promise<boolean> {
    return await this.requestCorrectionButton.isVisible();
  }

  async isContinueToDocumentVerificationButtonVisible(): Promise<boolean> {
    return await this.continueToDocumentVerificationButton.isVisible();
  }

  // ==========================================
  //  DOCUMENT VERIFICATION ACTIONS
  // ==========================================

  async clickDocumentVerificationTab(): Promise<void> {
    await this.documentVerificationTab.click();
  }

  async selectDocument(documentName: 'Aadhaar Card' | 'pan' | 'Educational documents'): Promise<void> {
    const docMap: Record<string, Locator> = {
      'Aadhaar Card': this.aadhaarCardDoc,
      'pan': this.panDoc,
      'Educational documents': this.educationalDocs,
    };
    await docMap[documentName].click();
  }

  async clickVerifyDocument(): Promise<void> {
    await this.verifyDocumentButton.click();
  }

  async clickRejectDocument(): Promise<void> {
    await this.rejectDocumentButton.click();
  }

  async clickRejectCandidate(): Promise<void> {
    await this.rejectCandidateButton.click();
  }

  async clickApproveCandidateOnboarding(): Promise<void> {
    await this.approveCandidateOnboardingButton.click();
  }

  async clickSaveAsDraft(): Promise<void> {
    await this.saveAsDraftButton.click();
  }

  async isVerifyDocumentButtonVisible(): Promise<boolean> {
    return await this.verifyDocumentButton.isVisible();
  }

  async isRejectDocumentButtonVisible(): Promise<boolean> {
    return await this.rejectDocumentButton.isVisible();
  }

  async isRejectCandidateButtonVisible(): Promise<boolean> {
    return await this.rejectCandidateButton.isVisible();
  }

  async isApproveCandidateOnboardingButtonVisible(): Promise<boolean> {
    return await this.approveCandidateOnboardingButton.isVisible();
  }

  async isSaveAsDraftButtonVisible(): Promise<boolean> {
    return await this.saveAsDraftButton.isVisible();
  }

  // ==========================================
  //  REJECT DOCUMENT MODAL ACTIONS
  // ==========================================

  async fillRejectionReason(reason: string): Promise<void> {
    await this.rejectionReasonInput.fill(reason);
  }

  async clickConfirmRejection(): Promise<void> {
    await this.confirmRejectionButton.click();
  }

  async clickCancelRejection(): Promise<void> {
    await this.cancelRejectionButton.click();
  }

  async isRejectDocumentModalVisible(): Promise<boolean> {
    return await this.rejectDocumentModal.isVisible();
  }

  async isConfirmRejectionButtonEnabled(): Promise<boolean> {
    return await this.confirmRejectionButton.isEnabled();
  }

  // ==========================================
  //  VERIFICATIONS
  // ==========================================

  async isPersonalInfoTabVisible(): Promise<boolean> {
    return await this.personalInfoTab.isVisible();
  }

  async isDocumentVerificationTabVisible(): Promise<boolean> {
    return await this.documentVerificationTab.isVisible();
  }

  async isOfferLetterTabVisible(): Promise<boolean> {
    return await this.offerLetterTab.isVisible();
  }

  async isIdProofsKpiVisible(): Promise<boolean> {
    return await this.idProofsKpi.isVisible();
  }

  async isEducationKpiVisible(): Promise<boolean> {
    return await this.educationKpi.isVisible();
  }

  async isOverallProgressKpiVisible(): Promise<boolean> {
    return await this.overallProgressKpi.isVisible();
  }

  async isDocumentPreviewVisible(): Promise<boolean> {
    return await this.documentPreview.isVisible();
  }

  async isDocumentListVisible(): Promise<boolean> {
    return await this.documentList.isVisible();
  }

  async isAadhaarCardDocVisible(): Promise<boolean> {
    return await this.aadhaarCardDoc.isVisible();
  }

  async isPanDocVisible(): Promise<boolean> {
    return await this.panDoc.isVisible();
  }

  async isEducationalDocsVisible(): Promise<boolean> {
    return await this.educationalDocs.isVisible();
  }

  async isDocumentStatusPendingVisible(): Promise<boolean> {
    return await this.documentStatusPending.isVisible();
  }

  async isDocumentStatusVerifiedVisible(): Promise<boolean> {
    return await this.documentStatusVerified.isVisible();
  }

  async isDocumentStatusRejectedVisible(): Promise<boolean> {
    return await this.documentStatusRejected.isVisible();
  }

  async getPanName(): Promise<string> {
    return await this.panNameField.inputValue();
  }

  async getFatherName(): Promise<string> {
    return await this.fatherNameField.inputValue();
  }

  async getAadhaarNumber(): Promise<string> {
    return await this.aadhaarNumberField.inputValue();
  }

  async getAadhaarName(): Promise<string> {
    return await this.aadhaarNameField.inputValue();
  }

  async isAwaitingDocumentSubmissionTextVisible(): Promise<boolean> {
    return await this.page.getByText('Awaiting document submission from candidate').isVisible();
  }

  async isReadyForReviewTextVisible(): Promise<boolean> {
    return await this.documentPreviewPlaceholder.isVisible();
  }

  // ==========================================
  //  APPROVE LETTER MODAL ACTIONS (HR/CHRO)
  // ==========================================

  async isApproveLetterModalVisible(): Promise<boolean> {
    return await this.approveLetterModal.isVisible();
  }

  async clickUploadSignatureTab(): Promise<void> {
    await this.uploadSignatureTab.click();
  }

  async clickDownloadAndSignTab(): Promise<void> {
    await this.downloadAndSignTab.click();
  }

  async clickSelectFile(): Promise<void> {
    await this.selectFileButton.click();
  }

  async clickCancelApproval(): Promise<void> {
    await this.cancelApprovalButton.click();
  }

  async clickApprove(): Promise<void> {
    await this.approveButton.click();
  }

  async uploadSignatureFile(filePath: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.selectFileButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  async clickDownloadOfferLetter(): Promise<void> {
    await this.downloadAndSignTab.getByRole('button', { name: 'Download' }).click();
  }

  async uploadSignedDocument(filePath: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    // In "Download and Sign" tab, there's a second Select File button for the signed document
    const signedSelectButtons = this.approveLetterModal.getByRole('button', { name: 'Select File' });
    await signedSelectButtons.last().click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  // ==========================================
  //  RELEASE TO CANDIDATE (HR Action)
  // ==========================================

  async clickReleaseToCandidate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Release to Candidate' }).click();
  }

  async clickYesInConfirmation(): Promise<void> {
    // After clicking "Release to Candidate", a confirmation dialog appears with Yes/No
    await this.page.getByRole('button', { name: 'Yes' }).click();
  }

  async clickNoInConfirmation(): Promise<void> {
    await this.page.getByRole('button', { name: 'No' }).click();
  }

  async isReleaseToCandidateButtonVisible(): Promise<boolean> {
    return await this.page.getByRole('button', { name: 'Release to Candidate' }).isVisible();
  }

  async isConfirmationDialogVisible(): Promise<boolean> {
    return await this.page.getByRole('dialog', { name: /Are you sure/i }).isVisible();
  }

  async isLetterReleasedSuccessfullyVisible(): Promise<boolean> {
    return await this.page.getByText('Letter released to candidate successfully').isVisible();
  }

  async isAwaitingCandidateResponseVisible(): Promise<boolean> {
    return await this.page.getByText('Awaiting candidate response').isVisible();
  }

  // ==========================================
  //  LETTER STATUS
  // ==========================================

  async isOfferLetterStatusApproved(): Promise<boolean> {
    return await this.page.getByText('Approved').first().isVisible();
  }

  async isOfferLetterStatusSent(): Promise<boolean> {
    return await this.page.getByText('Sent').first().isVisible();
  }

  async isAllLevelsApprovedVisible(): Promise<boolean> {
    return await this.page.getByText('All levels approved').isVisible();
  }

  // ==========================================
  //  APPROVAL SUMMARY
  // ==========================================

  async isApprovalSummaryVisible(): Promise<boolean> {
    return await this.page.getByRole('heading', { name: 'Approval Summary' }).isVisible();
  }

  async isApprovalPendingForApprover(approverName: string): Promise<boolean> {
    return await this.page.locator('[class*="approval"], [class*="Approval"]').filter({ hasText: approverName }).locator('[class*="pending"], [class*="Pending"]').isVisible();
  }
}


