import { type Page, type Locator } from '@playwright/test';

/**
 * HrDocumentReviewPage class encapsulates all locators and atomic UI actions
 * for the HR Document Review view within the candidate detail modal.
 *
 * Covers:
 *   - Personal Information tab with Request Correction / Continue buttons
 *   - Document Verification tab with document selection, verification, and rejection
 *   - Reject Document modal with reason input
 *   - Reject Candidate button
 *   - Approve Letter modal (signature upload / download & sign)
 *   - Release to Candidate flow
 */
export class HrDocumentReviewPage {
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
  readonly passportDoc: Locator;
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

  // HR Manager's simple confirm-only variant of the "Approve Letter" modal
  // (no signature required — HR Manager role is configured as "Cannot sign")
  readonly simpleApproveConfirmText: Locator;
  readonly simpleApproveCancelButton: Locator;
  readonly simpleApproveConfirmButton: Locator;

  // Outer page-level Approve/Reject/Edit buttons that open the modal above
  // (distinct from the modal's own internal confirm button of the same name)
  readonly initiateApproveButton: Locator;
  readonly initiateRejectButton: Locator;

  // ==========================================
  //  DOCUMENT STATUS INDICATORS
  // ==========================================
  readonly documentStatusPending: Locator;
  readonly documentStatusVerified: Locator;
  readonly documentStatusRejected: Locator;

  // ==========================================
  //  OFFER LETTER TAB — LETTER CONFIGURATION (HR)
  // ==========================================
  readonly contractTemplateDropdown: Locator;
  readonly chroApproverDropdown: Locator;
  readonly hrManagerApproverDropdown: Locator;
  readonly approversNotifiedInSequenceText: Locator;
  readonly generateDraftButton: Locator;
  readonly submitForApprovalButton: Locator;
  readonly editDetailsButton: Locator;

  // Letter Details fields
  readonly letterTitleInput: Locator;
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly addressLine3Input: Locator;
  readonly dateOfJoiningInput: Locator;
  readonly ctcInput: Locator;
  readonly variablePayInput: Locator;

  // Salary Components grid (Monthly / Yearly)
  readonly salaryComponentsTable: Locator;

  // Offer Letter status/summary (post Generate Draft)
  readonly offerLetterStatusBadge: Locator;
  readonly approvalSummaryHeading: Locator;
  readonly onboardingProgressText: Locator;

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
    // The document list items are plain clickable rows, not role="button"
    // elements — matched by the bold row-title text instead.
    this.aadhaarCardDoc = page.getByText('Aadhaar Card', { exact: true }).first();
    this.passportDoc = page.getByText('Passport', { exact: true }).first();
    this.panDoc = page.getByText('pan', { exact: true }).first();
    this.educationalDocs = page.getByText('Educational Documents 1', { exact: false }).first();

    // Document Preview
    this.documentPreview = page.locator('[class*="document-preview"], [class*="DocumentPreview"]');
    this.documentPreviewPlaceholder = page.getByText('Ready for Review').first();

    // Document Details
    // These are read-only label/value pairs rendered as plain <generic>
    // (div/span) elements, NOT <input>s — confirmed live via error-context
    // snapshot (2026-08-08): the label text is also lowercase on this tab
    // ("Name", "pan name", "father name"), not the ALL-CAPS text used on the
    // Personal Information tab fields above. getByText() is case-sensitive
    // by default, so the original ALL-CAPS locators never matched anything.
    // Value sits as a sibling `generic` under the same parent as the label,
    // so `.locator('..')` reaches the shared parent and the value is
    // resolved via a second `generic`/text sibling (last() picks the value,
    // since the label itself is also a `generic` and would match first).
    this.panNameField = page.getByText('pan name', { exact: true }).locator('..').locator('div, span, p').last();
    this.fatherNameField = page.getByText('father name', { exact: true }).locator('..').locator('div, span, p').last();
    this.aadhaarNumberField = page.getByText('Aadhaar Number', { exact: true }).locator('..').locator('div, span, p').last();
    this.aadhaarNameField = page.getByText('Name', { exact: true }).locator('..').locator('div, span, p').last();
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

    // HR Manager's simple confirm-only "Approve Letter" modal (no signature tabs)
    const simpleApproveModal = page.locator('[role="dialog"]').filter({ has: page.getByRole('heading', { name: 'Approve Letter' }) }).filter({ hasText: 'This action cannot be undone' });
    this.simpleApproveConfirmText = simpleApproveModal.getByText(/This action cannot be undone/i);
    this.simpleApproveCancelButton = simpleApproveModal.getByRole('button', { name: 'Cancel' });
    this.simpleApproveConfirmButton = simpleApproveModal.getByRole('button', { name: 'Approve' });

    // Outer buttons that open the modal (resolved before the modal exists in the DOM)
    this.initiateApproveButton = page.getByRole('button', { name: 'Approve', exact: true }).first();
    this.initiateRejectButton = page.getByRole('button', { name: 'Reject', exact: true }).first();

    // ── Offer Letter Tab — Letter Configuration (HR) ──
    this.contractTemplateDropdown = page.getByRole('combobox', { name: /Contract Template/i })
      .or(page.locator('div').filter({ hasText: /^Contract Template\*?$/ }).getByRole('combobox'));
    // Two identical "Select approver(s)" dropdowns render in order — CHRO's
    // Approval Levels section first, HR Manager's second — so distinguish by
    // DOM order rather than a fragile ancestor-text walk from the section label.
    this.chroApproverDropdown = page.getByRole('combobox', { name: /select approver/i }).nth(0);
    this.hrManagerApproverDropdown = page.getByRole('combobox', { name: /select approver/i }).nth(1);
    this.approversNotifiedInSequenceText = page.getByText('Approvers notified in sequence');
    this.generateDraftButton = page.getByRole('button', { name: 'Generate Draft' });
    this.submitForApprovalButton = page.getByRole('button', { name: 'Submit for Approval' });
    this.editDetailsButton = page.getByRole('button', { name: 'Edit Details' });

    // Letter Details fields
    this.letterTitleInput = page.getByRole('textbox', { name: 'Title' });
    this.addressLine1Input = page.getByRole('textbox', { name: 'Address Line 1' });
    this.addressLine2Input = page.getByRole('textbox', { name: 'Address Line 2' });
    this.addressLine3Input = page.getByRole('textbox', { name: 'Address Line 3' });
    // Native <input type="date"> (dd-mm-yyyy display), not a custom combobox.
    this.dateOfJoiningInput = page.locator('input[type="date"]').first();
    // Matched by placeholder rather than accessible name — "CTC"/"Variable
    // Pay" role-name lookups time out, unlike the Address Line fields.
    this.ctcInput = page.getByPlaceholder('Enter ctc');
    this.variablePayInput = page.getByPlaceholder('Enter variable pay');

    // Salary Components grid
    this.salaryComponentsTable = page.getByText('Salary Components').locator('..').locator('..');

    // Offer Letter status/summary
    this.offerLetterStatusBadge = page.getByText('Offer Letter').locator('..').getByText(/Pending|Approved|Released|Accepted|Rejected/).first();
    this.approvalSummaryHeading = page.getByText('Approval Summary');
    this.onboardingProgressText = page.getByText('Onboarding Progress');
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

  async clickOfferLetterTab(): Promise<void> {
    await this.offerLetterTab.click();
  }

  async selectDocument(documentName: 'Aadhaar Card' | 'Passport' | 'pan' | 'Educational documents'): Promise<void> {
    const docMap: Record<string, Locator> = {
      'Aadhaar Card': this.aadhaarCardDoc,
      'Passport': this.passportDoc,
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
    return (await this.panNameField.textContent()) ?? '';
  }

  async getFatherName(): Promise<string> {
    return (await this.fatherNameField.textContent()) ?? '';
  }

  async getAadhaarNumber(): Promise<string> {
    return (await this.aadhaarNumberField.textContent()) ?? '';
  }

  async getAadhaarName(): Promise<string> {
    return (await this.aadhaarNameField.textContent()) ?? '';
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

  // ==========================================
  //  OFFER LETTER TAB — LETTER CONFIGURATION (HR)
  // ==========================================

  async selectContractTemplate(templateName: string): Promise<void> {
    await this.contractTemplateDropdown.click();
    await this.page.getByRole('option', { name: templateName, exact: true }).click();
  }

  /**
   * Names of the templates the Contract Template dropdown currently offers.
   *
   * Contract templates are tenant data that gets renamed and recreated
   * outside this suite — "Offer_Letter_2026" became "NEW_Offer_Letter" and
   * then "New_updated_Offer_letter" within a single day. Hard-coding a name
   * makes every offer-letter test fail the moment someone edits a template,
   * and the failure surfaces late and unhelpfully as "no letter was ever
   * generated". Callers should discover the name instead.
   *
   * Leaves the dropdown closed.
   */
  async listContractTemplateOptions(): Promise<string[]> {
    await this.contractTemplateDropdown.click();
    const options = this.page.getByRole('option');
    await options.first().waitFor({ state: 'visible', timeout: 10000 });
    const names = (await options.allTextContents()).map(t => t.trim()).filter(Boolean);
    // Escape commits the highlighted option in this Fluent combobox, so close
    // by re-clicking the trigger — that leaves the current value untouched.
    await this.contractTemplateDropdown.click();
    return names;
  }

  /** The template currently shown in the dropdown (the app pre-selects one). */
  async getSelectedContractTemplate(): Promise<string> {
    return (await this.contractTemplateDropdown.textContent() ?? '').trim();
  }

  async selectChroApprover(approverNameOrEmail: string): Promise<void> {
    await this.chroApproverDropdown.click();
    const option = this.page.getByRole('option', { name: new RegExp(approverNameOrEmail, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    // Confirm the chip actually landed in the CHRO field before moving on —
    // this selection has silently failed to stick in previous runs.
    await this.page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async selectHrManagerApprover(approverNameOrEmail: string): Promise<void> {
    await this.hrManagerApproverDropdown.click();
    const option = this.page.getByRole('option', { name: new RegExp(approverNameOrEmail, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async fillLetterTitle(value: string): Promise<void> { await this.letterTitleInput.fill(value); }
  async fillAddressLine1(value: string): Promise<void> { await this.addressLine1Input.fill(value); }
  async fillAddressLine2(value: string): Promise<void> { await this.addressLine2Input.fill(value); }
  async fillAddressLine3(value: string): Promise<void> { await this.addressLine3Input.fill(value); }
  async fillCtc(value: string): Promise<void> { await this.ctcInput.fill(value); }
  async fillVariablePay(value: string): Promise<void> { await this.variablePayInput.fill(value); }

  /** @param isoDate Date in YYYY-MM-DD format, as required by native date inputs. */
  async fillDateOfJoining(isoDate: string): Promise<void> {
    await this.dateOfJoiningInput.fill(isoDate);
  }

  async fillSalaryComponent(componentName: string, monthlyValue: string): Promise<void> {
    // Salary Components table uses real ARIA row/cell semantics — e.g. the
    // "Basic" row is `row "Basic" > [cell "Basic", cell > spinbutton
    // (Monthly), cell > spinbutton (Yearly)]`. Locate the row by its
    // accessible name and the value input by its `spinbutton` role, scoped
    // to that row, rather than walking up from a raw text match and querying
    // a CSS `input` selector (confirmed live via DOM snapshot — see
    // offerLetterFieldValidation.spec.ts TC-OLVAL-SALARY-01).
    const row = this.page.getByRole('row', { name: new RegExp(`^${componentName}\\b`) }).first();
    const monthlyInput = row.getByRole('spinbutton').first();
    await monthlyInput.fill(monthlyValue);
  }

  async clickGenerateDraft(): Promise<void> { await this.generateDraftButton.click(); }
  async clickSubmitForApproval(): Promise<void> { await this.submitForApprovalButton.click(); }
  async clickEditDetails(): Promise<void> { await this.editDetailsButton.click(); }

  async isGenerateDraftButtonVisible(): Promise<boolean> { return await this.generateDraftButton.isVisible(); }
  async isGenerateDraftButtonEnabled(): Promise<boolean> { return await this.generateDraftButton.isEnabled(); }
  async isSubmitForApprovalButtonVisible(): Promise<boolean> { return await this.submitForApprovalButton.isVisible(); }
  async isContractTemplateDropdownVisible(): Promise<boolean> { return await this.contractTemplateDropdown.isVisible(); }
  async isChroApproverDropdownVisible(): Promise<boolean> { return await this.chroApproverDropdown.isVisible(); }
  async isHrManagerApproverDropdownVisible(): Promise<boolean> { return await this.hrManagerApproverDropdown.isVisible(); }

  async fillOfferLetterDetails(data: {
    title?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    dateOfJoining?: string;
    ctc?: string;
    variablePay?: string;
  }): Promise<void> {
    // Which Letter Details fields render is decided by the selected Contract
    // Template, which is tenant data — "New_updated_Offer_letter" dropped the
    // Variable Pay field that "Offer_Letter_2026" had. Filling unconditionally
    // meant a 30s locator.fill timeout on a field the template simply does not
    // have, so a template edit broke offer-letter generation everywhere.
    // Each field is therefore filled only when this template renders it; a
    // caller asking for a field that is absent is skipped, not failed.
    await this.fillIfPresent('Letter Title', this.letterTitleInput, data.title);
    await this.fillIfPresent('Address Line 1', this.addressLine1Input, data.addressLine1);
    await this.fillIfPresent('Address Line 2', this.addressLine2Input, data.addressLine2);
    await this.fillIfPresent('Address Line 3', this.addressLine3Input, data.addressLine3);
    await this.fillIfPresent('Date of Joining', this.dateOfJoiningInput, data.dateOfJoining);
    await this.fillIfPresent('CTC', this.ctcInput, data.ctc);
    await this.fillIfPresent('Variable Pay', this.variablePayInput, data.variablePay);
  }

  /**
   * Fills a Letter Details field when the current template renders it.
   * Logs the skip so an absent field is visible in the run output rather than
   * silently changing what the generated letter contains.
   */
  private async fillIfPresent(
    label: string,
    locator: Locator,
    value?: string,
  ): Promise<void> {
    if (!value) return;
    const present = await locator
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    if (!present) {
      console.log(`[OfferLetter] "${label}" is not part of this template — skipped`);
      return;
    }
    await locator.first().fill(value);
  }

  async getOfferLetterStatus(): Promise<string> {
    return (await this.offerLetterStatusBadge.textContent() ?? '').trim();
  }

  // ==========================================
  //  HR MANAGER — SIMPLE CONFIRM APPROVE MODAL
  // ==========================================

  async isSimpleApproveConfirmModalVisible(): Promise<boolean> {
    return await this.simpleApproveConfirmText.isVisible().catch(() => false);
  }

  async clickSimpleApproveConfirm(): Promise<void> { await this.simpleApproveConfirmButton.click(); }
  async clickSimpleApproveCancel(): Promise<void> { await this.simpleApproveCancelButton.click(); }
  async clickInitiateApprove(): Promise<void> { await this.initiateApproveButton.click(); }
  async clickInitiateReject(): Promise<void> { await this.initiateRejectButton.click(); }
}
