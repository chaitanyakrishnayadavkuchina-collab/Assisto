import { type Page, type Locator, expect } from '@playwright/test';

/**
 * CandidatePreOnboardingPage class encapsulates all locators and atomic UI actions
 * for the candidate-side pre-onboarding portal.
 *
 * Covers 3 phases:
 *  Phase 1 - Personal Information form
 *  Phase 2 - Document Upload (ID Proofs + Education tabs)
 *  Phase 3 - Document Verification (post-submission review page)
 *  Phase 4 - Offer Letter Release (view, accept & upload signed letter / reject offer)
 */
export class CandidatePreOnboardingPage {
  private readonly page: Page;

  // ==========================================
  //  HEADER / WELCOME
  // ==========================================
  readonly welcomeHeading: Locator;
  readonly candidateEmailDisplay: Locator;

  // ==========================================
  //  STEP INDICATOR (sidebar)
  // ==========================================
  readonly step1PersonalInfo: Locator;
  readonly step2DocumentUpload: Locator;
  readonly step3DocumentVerification: Locator;
  readonly step4OfferLetterRelease: Locator;
  readonly step5Completion: Locator;

  // ==========================================
  //  PHASE 1: PERSONAL INFORMATION FORM
  // ==========================================
  readonly personalInfoCard: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly personalEmailInput: Locator;
  readonly alternateEmailInput: Locator;
  readonly mobileDialCodeDropdown: Locator;
  readonly mobileNumberInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly nationalIdInput: Locator;
  readonly saveContinueButton: Locator;

  // ==========================================
  //  PHASE 2: DOCUMENT UPLOAD
  // ==========================================
  readonly documentUploadCard: Locator;
  readonly idProofsTab: Locator;
  readonly educationTab: Locator;

  // ID Proofs sub-sections
  readonly aadhaarCardSection: Locator;
  readonly aadhaarImageUpload: Locator;
  readonly aadhaarNumberInput: Locator;
  readonly aadhaarNameInput: Locator;
  readonly panSection: Locator;
  readonly panNumberInput: Locator;
  readonly panNameInput: Locator;
  readonly panFatherNameInput: Locator;
  readonly addMoreButton: Locator;
  readonly nextButton: Locator;

  // Education sub-section
  readonly educationalDocsSection: Locator;
  readonly degreeCertificateUpload: Locator;
  readonly endYearInput: Locator;
  readonly institutionNameInput: Locator;
  readonly degreeInput: Locator;
  readonly specializationInput: Locator;
  readonly startYearInput: Locator;
  readonly gpaInput: Locator;
  readonly previousButton: Locator;

  // Save / Submit
  readonly saveAsDraftButton: Locator;
  readonly submitDocumentsButton: Locator;

  // ==========================================
  //  PHASE 3: DOCUMENT VERIFICATION (post-submission)
  // ==========================================
  readonly successBanner: Locator;
  readonly verificationInProgressText: Locator;

  // KPI cards row
  readonly totalDocumentsCard: Locator;
  readonly approvedCard: Locator;
  readonly pendingReviewCard: Locator;
  readonly rejectedCard: Locator;

  // Overall Verification Progress
  readonly overallVerificationProgressHeader: Locator;
  readonly overallProgressBar: Locator;
  readonly overallProgressText: Locator;   // e.g. "0% complete"
  readonly overallApprovedText: Locator;  // e.g. "0 of 3 approved"

  // Identity Documents section
  readonly identityDocumentsSection: Locator;
  readonly identityDocCount: Locator;    // e.g. "0/2 approved"
  readonly panDocRow: Locator;
  readonly panStatusBadge: Locator;
  readonly aadhaarDocRow: Locator;
  readonly aadhaarStatusBadge: Locator;

  // Academic Documents section
  readonly academicDocumentsSection: Locator;
  readonly academicDocCount: Locator;    // e.g. "0/1 approved"
  readonly educationalDocRow: Locator;
  readonly educationalDocStatusBadge: Locator;

  // ==========================================
  //  PHASE 4: OFFER LETTER RELEASE (Candidate)
  // ==========================================
  // Offer Letter card
  readonly offerLetterCard: Locator;
  readonly offerLetterTitle: Locator;
  readonly offerLetterTemplate: Locator;
  readonly offerLetterSentOn: Locator;

  // Document Preview
  readonly offerLetterDocumentPreview: Locator;
  readonly offerLetterDownloadButton: Locator;
  readonly offerLetterConfidentialBadge: Locator;

  // Offer Summary panel
  readonly offerSummaryPanel: Locator;
  readonly offerPosition: Locator;
  readonly offerCompany: Locator;
  readonly offerStartDate: Locator;
  readonly offerCtc: Locator;
  readonly offerStatusBadge: Locator;
  readonly awaitingResponseText: Locator;

  // Candidate Actions
  readonly acceptAndUploadSignedLetterButton: Locator;
  readonly rejectOfferButton: Locator;

  // Accept Offer Letter Modal
  readonly acceptOfferModal: Locator;
  readonly offerLetterInfoHeader: Locator;
  readonly drawTab: Locator;
  readonly uploadTab: Locator;
  readonly signatureCanvas: Locator;
  readonly clearSignatureButton: Locator;
  readonly uploadSignedLetterButton: Locator;
  readonly submitAndAcceptOfferButton: Locator;

  // Rejection form
  readonly reasonForRejectionPanel: Locator;
  readonly rejectionReasonInput: Locator;
  readonly confirmRejectionButton: Locator;
  readonly cancelRejectionButton: Locator;

  // Completion page
  readonly allSetHeading: Locator;
  readonly completionMessage: Locator;

  // ==========================================
  //  CONSTRUCTOR
  // ==========================================
  constructor(page: Page) {
    this.page = page;

    // ── Header / Welcome ──
    this.welcomeHeading = page.getByText(/Hi\s+\w+,\s+welcome/i);
    this.candidateEmailDisplay = page.locator('[class*="email"], [class*="Email"]').first();

    // ── Step Indicator (sidebar list items) ──
    this.step1PersonalInfo = page.getByRole('listitem').filter({ has: page.getByText('Personal Information') }).first();
    this.step2DocumentUpload = page.getByRole('listitem').filter({ has: page.getByText('Document Upload') }).first();
    this.step3DocumentVerification = page.getByRole('listitem').filter({ has: page.getByText('Document Verification') }).first();
    this.step4OfferLetterRelease = page.getByRole('listitem').filter({ has: page.getByText('Offer Letter Release') }).first();
    this.step5Completion = page.getByRole('listitem').filter({ has: page.getByText('Completion') }).first();

    // ── Personal Information Form ──
    this.personalInfoCard = page.getByRole('heading', { name: 'Personal Information' }).locator('..').locator('..');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.personalEmailInput = page.getByRole('textbox', { name: /Personal Email/i });
    this.alternateEmailInput = page.getByRole('textbox', { name: /Alternate Email/i });
    this.mobileDialCodeDropdown = page.getByRole('combobox').filter({ has: page.getByText(/\+\d+/) }).first();
    this.mobileNumberInput = page.getByRole('textbox', { name: 'Mobile Number' });
    this.dateOfBirthInput = page.getByRole('textbox', { name: 'Date of Birth' });
    this.nationalIdInput = page.getByRole('textbox', { name: 'National ID / SSN' });
    this.saveContinueButton = page.getByRole('button', { name: 'Save & Continue' });

    // ── Document Upload ──
    this.documentUploadCard = page.getByRole('heading', { name: 'Document Upload' }).locator('..').locator('..');
    this.idProofsTab = page.getByRole('tab', { name: 'ID Proofs' });
    this.educationTab = page.getByRole('tab', { name: 'Education' });

    // ID Proofs
    this.aadhaarCardSection = page.getByRole('heading', { name: 'Aadhaar Card' }).locator('..');
    this.aadhaarImageUpload = page.getByText('Click to upload or drag and drop');
    this.aadhaarNumberInput = page.getByRole('textbox', { name: 'Aadhaar Number' });
    this.aadhaarNameInput = page.getByRole('textbox', { name: 'Name' }).first();
    this.panSection = page.locator('div').filter({ has: page.getByText('pan', { exact: false }) }).first();
    this.panNumberInput = page.getByRole('textbox', { name: /pan/i });
    this.panNameInput = page.getByRole('textbox', { name: 'pan name' });
    this.panFatherNameInput = page.getByRole('textbox', { name: 'father name' });
    this.addMoreButton = page.getByRole('button', { name: 'Add More' });
    this.nextButton = page.getByRole('button', { name: 'Next' });

    // Education
    this.educationalDocsSection = page.getByRole('heading', { name: 'Educational documents' }).locator('..');
    this.degreeCertificateUpload = page.getByText('Click to upload or drag and drop').first();
    this.endYearInput = page.getByRole('textbox', { name: 'End Year' });
    this.institutionNameInput = page.getByRole('textbox', { name: 'Institution Name' });
    this.degreeInput = page.getByRole('textbox', { name: 'Degree/Qualification' });
    this.specializationInput = page.getByRole('textbox', { name: 'Specialization/Major' });
    this.startYearInput = page.getByRole('textbox', { name: 'Start Year' });
    this.gpaInput = page.getByRole('textbox', { name: 'GPA/Percentage' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });

    // Save / Submit
    this.saveAsDraftButton = page.getByRole('button', { name: 'Save as Draft' });
    this.submitDocumentsButton = page.getByRole('button', { name: 'Submit Documents' });

    // ── Phase 3: Document Verification (post-submission) ──

    // Success banner
    this.successBanner = page.getByText('Your Documents Successfully Uploaded');
    this.verificationInProgressText = page.getByText('Document Verification in Progress');

    // KPI cards — use the numeric value as the key locator, then grab the parent
    this.totalDocumentsCard = page.getByText('Total Documents').locator('..').locator('..');
    this.approvedCard = page.getByText('Approved').locator('..').locator('..');
    this.pendingReviewCard = page.getByText('Pending Review').locator('..').locator('..');
    this.rejectedCard = page.getByText('Rejected').locator('..').locator('..');

    // Overall Verification Progress
    this.overallVerificationProgressHeader = page.getByRole('heading', { name: 'Overall Verification Progress' }).locator('..');
    this.overallProgressBar = this.overallVerificationProgressHeader.locator('[role="progressbar"], [class*="progress"], [class*="bar"]');
    this.overallProgressText = page.getByText(/% complete/);
    this.overallApprovedText = page.getByText(/of \d+ approved/).first();

    // Identity Documents section
    this.identityDocumentsSection = page.getByRole('heading', { name: 'Identity Documents' }).locator('..');
    this.identityDocCount = page.getByText(/0\/\d+ approved/).first();
    this.panDocRow = page.getByRole('listitem').filter({ has: page.getByText('pan', { exact: false }) }).first();
    this.panStatusBadge = page.getByRole('button', { name: 'Under Review' }).first();
    this.aadhaarDocRow = page.getByRole('listitem').filter({ has: page.getByText('Aadhaar Card') }).first();
    this.aadhaarStatusBadge = page.getByRole('button', { name: 'Under Review' }).nth(1);

    // Academic Documents section
    this.academicDocumentsSection = page.getByRole('heading', { name: 'Academic Documents' }).locator('..');
    this.academicDocCount = page.getByText(/0\/\d+ approved/).nth(1);
    this.educationalDocRow = page.getByRole('listitem').filter({ has: page.getByText('Educational documents') }).first();
    this.educationalDocStatusBadge = page.getByRole('button', { name: 'Under Review' }).nth(2);

    // ── Phase 4: Offer Letter Release (Candidate) ──
    this.offerLetterCard = page.getByRole('heading', { name: 'Offer Letter' }).locator('..').locator('..').first();
    this.offerLetterTitle = page.getByRole('heading', { name: 'Offer Letter' }).first();
    this.offerLetterTemplate = page.locator('[class*="template"], [class*="Template"]').filter({ has: page.getByText('Template') }).locator('..').locator('..');
    this.offerLetterSentOn = page.getByText('Sent On').locator('..');
    this.offerLetterDocumentPreview = page.getByRole('heading', { name: 'Document Preview' }).locator('..').locator('..');
    this.offerLetterDownloadButton = this.offerLetterDocumentPreview.getByRole('button', { name: 'Download' }).first();
    this.offerLetterConfidentialBadge = page.getByText('Confidential').first();
    this.offerSummaryPanel = page.getByRole('heading', { name: 'Offer Summary' }).locator('..').locator('..');
    this.offerPosition = page.getByText('Position').locator('..').locator('..');
    this.offerCompany = page.getByText('Company').locator('..').locator('..');
    this.offerStartDate = page.getByText('Start Date').locator('..').locator('..');
    this.offerCtc = page.getByText('CTC').locator('..').locator('..');
    this.offerStatusBadge = page.getByText('Awaiting Response').first();
    this.awaitingResponseText = page.getByText('Awaiting candidate response').first();
    this.acceptAndUploadSignedLetterButton = page.getByRole('button', { name: 'Accept & Upload Signed Letter' });
    this.rejectOfferButton = page.getByRole('button', { name: 'Reject Offer' });

    // Accept Offer Letter Modal
    this.acceptOfferModal = page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').filter({ has: page.getByRole('heading', { name: 'Accept Offer Letter' }) }).first();
    this.offerLetterInfoHeader = this.acceptOfferModal.locator('[class*="info"], [class*="Info"]').first();
    this.drawTab = this.acceptOfferModal.getByRole('tab', { name: 'Draw' });
    this.uploadTab = this.acceptOfferModal.getByRole('tab', { name: 'Upload' });
    this.signatureCanvas = this.acceptOfferModal.locator('canvas').first();
    this.clearSignatureButton = this.acceptOfferModal.getByRole('button', { name: 'Clear' });
    this.uploadSignedLetterButton = this.acceptOfferModal.getByText('Upload Signed Offer Letter').locator('..').locator('input[type="file"]');
    this.submitAndAcceptOfferButton = this.acceptOfferModal.getByRole('button', { name: 'Submit & Accept Offer' });

    // Rejection form
    this.reasonForRejectionPanel = page.getByRole('heading', { name: 'Reason for Rejection' }).locator('..');
    this.rejectionReasonInput = page.getByPlaceholder(/describe your reason/i).first();
    this.confirmRejectionButton = page.getByRole('button', { name: 'Confirm Rejection' });
    this.cancelRejectionButton = page.getByRole('button', { name: 'Cancel' }).last();

    // Completion page
    this.allSetHeading = page.getByRole('heading', { name: "You're All Set!" });
    this.completionMessage = page.getByText(/Your pre-onboarding is now complete/).first();
  }

  // ==========================================
  //  HEADER / WELCOME HELPERS
  // ==========================================
  async isWelcomeHeadingVisible(): Promise<boolean> {
    return await this.welcomeHeading.isVisible();
  }

  async getWelcomeText(): Promise<string> {
    return await this.welcomeHeading.textContent() ?? '';
  }

  // ==========================================
  //  STEP INDICATOR HELPERS
  // ==========================================
  private async isStepActive(step: Locator): Promise<boolean> {
    const cls = await step.getAttribute('class') ?? '';
    return /active|current|Active|Current/i.test(cls);
  }

  private async isStepCompleted(step: Locator): Promise<boolean> {
    const cls = await step.getAttribute('class') ?? '';
    return /completed|Completed/i.test(cls);
  }

  async isStep1Active(): Promise<boolean> { return await this.isStepActive(this.step1PersonalInfo); }
  async isStep2Active(): Promise<boolean> { return await this.isStepActive(this.step2DocumentUpload); }
  async isStep3Active(): Promise<boolean> { return await this.isStepActive(this.step3DocumentVerification); }
  async isStep1Completed(): Promise<boolean> { return await this.isStepCompleted(this.step1PersonalInfo); }
  async isStep2Completed(): Promise<boolean> { return await this.isStepCompleted(this.step2DocumentUpload); }
  async isStep3Completed(): Promise<boolean> { return await this.isStepCompleted(this.step3DocumentVerification); }

  // ==========================================
  //  PHASE 1: PERSONAL INFORMATION HELPERS
  // ==========================================
  async isPersonalInfoCardVisible(): Promise<boolean> { return await this.personalInfoCard.isVisible(); }

  async areAllPersonalInfoFieldsVisible(): Promise<boolean> {
    const [a, b, c, d, e, f, g, h] = await Promise.all([
      this.firstNameInput.isVisible(),
      this.lastNameInput.isVisible(),
      this.personalEmailInput.isVisible(),
      this.alternateEmailInput.isVisible(),
      this.mobileDialCodeDropdown.isVisible(),
      this.mobileNumberInput.isVisible(),
      this.dateOfBirthInput.isVisible(),
      this.nationalIdInput.isVisible(),
    ]);
    return a && b && c && d && e && f && g && h;
  }

  // Input methods
  async fillFirstName(v: string): Promise<void> { await this.firstNameInput.fill(v); }
  async fillLastName(v: string): Promise<void> { await this.lastNameInput.fill(v); }
  async fillPersonalEmail(v: string): Promise<void> { await this.personalEmailInput.fill(v); }
  async fillAlternateEmail(v: string): Promise<void> { await this.alternateEmailInput.fill(v); }

  async selectDialCode(value: string): Promise<void> {
    await this.mobileDialCodeDropdown.click();
    await this.page.getByText(value).first().click();
  }

  async fillMobileNumber(v: string): Promise<void> { await this.mobileNumberInput.fill(v); }
  async fillDateOfBirth(v: string): Promise<void> { await this.dateOfBirthInput.fill(v); }
  async fillNationalId(v: string): Promise<void> { await this.nationalIdInput.fill(v); }

  async clickSaveAndContinue(): Promise<void> { await this.saveContinueButton.click(); }

  async fillPersonalInformation(data: {
    firstName: string; lastName: string; alternateEmail?: string;
    dialCode: string; mobileNumber: string; dateOfBirth?: string; nationalId?: string;
  }): Promise<void> {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    if (data.alternateEmail) await this.fillAlternateEmail(data.alternateEmail);
    await this.selectDialCode(data.dialCode);
    await this.fillMobileNumber(data.mobileNumber);
    if (data.dateOfBirth) await this.fillDateOfBirth(data.dateOfBirth);
    if (data.nationalId) await this.fillNationalId(data.nationalId);
    await this.clickSaveAndContinue();
  }

  // ==========================================
  //  PHASE 2: DOCUMENT UPLOAD HELPERS
  // ==========================================
  async isDocumentUploadCardVisible(): Promise<boolean> { return await this.documentUploadCard.isVisible(); }
  async isIdProofsTabVisible(): Promise<boolean> { return await this.idProofsTab.isVisible(); }
  async isEducationTabVisible(): Promise<boolean> { return await this.educationTab.isVisible(); }
  async isAadhaarCardSectionVisible(): Promise<boolean> { return await this.aadhaarCardSection.isVisible(); }
  async isPanSectionVisible(): Promise<boolean> { return await this.panSection.isVisible(); }
  async isNextButtonVisible(): Promise<boolean> { return await this.nextButton.isVisible(); }
  async isSaveAsDraftButtonVisible(): Promise<boolean> { return await this.saveAsDraftButton.isVisible(); }
  async isSubmitDocumentsButtonVisible(): Promise<boolean> { return await this.submitDocumentsButton.isVisible(); }
  async isSubmitDocumentsButtonEnabled(): Promise<boolean> { return await this.submitDocumentsButton.isEnabled(); }

  async clickIdProofsTab(): Promise<void> { await this.idProofsTab.click(); }
  async clickEducationTab(): Promise<void> { await this.educationTab.click(); }
  async clickNext(): Promise<void> { await this.nextButton.click(); }
  async clickPrevious(): Promise<void> { await this.previousButton.click(); }
  async clickSaveAsDraft(): Promise<void> { await this.saveAsDraftButton.click(); }
  async clickSubmitDocuments(): Promise<void> { await this.submitDocumentsButton.click(); }

  // ID Proofs input methods
  async fillAadhaarNumber(v: string): Promise<void> { await this.aadhaarNumberInput.fill(v); }
  async fillAadhaarName(v: string): Promise<void> { await this.aadhaarNameInput.fill(v); }
  async fillPanNumber(v: string): Promise<void> { await this.panNumberInput.fill(v); }
  async fillPanName(v: string): Promise<void> { await this.panNameInput.fill(v); }
  async fillPanFatherName(v: string): Promise<void> { await this.panFatherNameInput.fill(v); }

  async fillIdProofs(data: {
    aadhaarNumber: string; aadhaarName: string;
    panNumber: string; panName: string; panFatherName: string;
  }): Promise<void> {
    await this.fillAadhaarNumber(data.aadhaarNumber);
    await this.fillAadhaarName(data.aadhaarName);
    await this.fillPanNumber(data.panNumber);
    await this.fillPanName(data.panName);
    await this.fillPanFatherName(data.panFatherName);
  }

  // Education input methods
  async fillEndYear(v: string): Promise<void> { await this.endYearInput.fill(v); }
  async fillInstitutionName(v: string): Promise<void> { await this.institutionNameInput.fill(v); }
  async fillDegree(v: string): Promise<void> { await this.degreeInput.fill(v); }
  async fillSpecialization(v: string): Promise<void> { await this.specializationInput.fill(v); }
  async fillStartYear(v: string): Promise<void> { await this.startYearInput.fill(v); }
  async fillGpa(v: string): Promise<void> { await this.gpaInput.fill(v); }

  async fillEducation(data: {
    endYear: string; institutionName: string; degree: string;
    specialization: string; startYear: string; gpa: string;
  }): Promise<void> {
    await this.fillEndYear(data.endYear);
    await this.fillInstitutionName(data.institutionName);
    await this.fillDegree(data.degree);
    await this.fillSpecialization(data.specialization);
    await this.fillStartYear(data.startYear);
    await this.fillGpa(data.gpa);
  }

  async fillCompleteForm(
    personalData: { firstName: string; lastName: string; alternateEmail?: string; dialCode: string; mobileNumber: string; dateOfBirth?: string; nationalId?: string },
    idProofsData: { aadhaarNumber: string; aadhaarName: string; panNumber: string; panName: string; panFatherName: string },
    educationData: { endYear: string; institutionName: string; degree: string; specialization: string; startYear: string; gpa: string },
  ): Promise<void> {
    await this.fillPersonalInformation(personalData);
    await this.page.waitForLoadState('networkidle');
    await await new Promise(resolve => setTimeout(resolve, 1000));

    await this.fillIdProofs(idProofsData);
    await await new Promise(resolve => setTimeout(resolve, 500));

    await this.clickEducationTab();
    await await new Promise(resolve => setTimeout(resolve, 500));

    await this.fillEducation(educationData);
  }

  // ==========================================
  //  PHASE 3: DOCUMENT VERIFICATION HELPERS (post-submission)
  // ==========================================

  // Banner
  async isSuccessBannerVisible(): Promise<boolean> { return await this.successBanner.isVisible(); }
  async isVerificationInProgressTextVisible(): Promise<boolean> { return await this.verificationInProgressText.isVisible(); }

  // KPI Cards
  async isTotalDocumentsCardVisible(): Promise<boolean> { return await this.totalDocumentsCard.isVisible(); }
  async isApprovedCardVisible(): Promise<boolean> { return await this.approvedCard.isVisible(); }
  async isPendingReviewCardVisible(): Promise<boolean> { return await this.pendingReviewCard.isVisible(); }
  async isRejectedCardVisible(): Promise<boolean> { return await this.rejectedCard.isVisible(); }

  async areAllKPICardsVisible(): Promise<boolean> {
    const [a, b, c, d] = await Promise.all([
      this.isTotalDocumentsCardVisible(),
      this.isApprovedCardVisible(),
      this.isPendingReviewCardVisible(),
      this.isRejectedCardVisible(),
    ]);
    return a && b && c && d;
  }

  async getTotalDocumentsCount(): Promise<string> {
    const card = this.totalDocumentsCard.locator('text=\\d+').first();
    return (await card.textContent() ?? '').trim();
  }

  async getApprovedCount(): Promise<string> {
    const card = this.approvedCard.locator('text=\\d+').first();
    return (await card.textContent() ?? '').trim();
  }

  async getPendingReviewCount(): Promise<string> {
    const card = this.pendingReviewCard.locator('text=\\d+').first();
    return (await card.textContent() ?? '').trim();
  }

  async getRejectedCount(): Promise<string> {
    const card = this.rejectedCard.locator('text=\\d+').first();
    return (await card.textContent() ?? '').trim();
  }

  // Overall Verification Progress
  async isOverallVerificationProgressVisible(): Promise<boolean> { return await this.overallVerificationProgressHeader.isVisible(); }
  async getOverallProgressPercent(): Promise<string> { return (await this.overallProgressText.textContent() ?? '').trim(); }
  async getOverallApprovedCountText(): Promise<string> { return (await this.overallApprovedText.textContent() ?? '').trim(); }

  // Identity Documents
  async isIdentityDocumentsSectionVisible(): Promise<boolean> { return await this.identityDocumentsSection.isVisible(); }
  async isPanDocRowVisible(): Promise<boolean> { return await this.panDocRow.isVisible(); }
  async getPanStatus(): Promise<string> { return (await this.panStatusBadge.textContent() ?? '').trim(); }
  async isAadhaarDocRowVisible(): Promise<boolean> { return await this.aadhaarDocRow.isVisible(); }
  async getAadhaarStatus(): Promise<string> { return (await this.aadhaarStatusBadge.textContent() ?? '').trim(); }

  // Academic Documents
  async isAcademicDocumentsSectionVisible(): Promise<boolean> { return await this.academicDocumentsSection.isVisible(); }
  async isEducationalDocRowVisible(): Promise<boolean> { return await this.educationalDocRow.isVisible(); }
  async getEducationalDocStatus(): Promise<string> { return (await this.educationalDocStatusBadge.textContent() ?? '').trim(); }

  // ==========================================
  //  PHASE 4: OFFER LETTER RELEASE HELPERS (Candidate)
  // ==========================================

  // Offer Letter Card visibility
  async isOfferLetterCardVisible(): Promise<boolean> { return await this.offerLetterCard.isVisible(); }
  async isOfferLetterDocumentPreviewVisible(): Promise<boolean> { return await this.offerLetterDocumentPreview.isVisible(); }
  async isOfferLetterDownloadButtonVisible(): Promise<boolean> { return await this.offerLetterDownloadButton.isVisible(); }
  async isOfferLetterConfidentialBadgeVisible(): Promise<boolean> { return await this.offerLetterConfidentialBadge.isVisible(); }
  async isOfferSummaryPanelVisible(): Promise<boolean> { return await this.offerSummaryPanel.isVisible(); }
  async isOfferPositionVisible(): Promise<boolean> { return await this.offerPosition.isVisible(); }
  async isOfferCompanyVisible(): Promise<boolean> { return await this.offerCompany.isVisible(); }
  async isOfferStartDateVisible(): Promise<boolean> { return await this.offerStartDate.isVisible(); }
  async isOfferCtcVisible(): Promise<boolean> { return await this.offerCtc.isVisible(); }
  async isAwaitingResponseVisible(): Promise<boolean> { return await this.awaitingResponseText.isVisible(); }
  async isAcceptAndUploadSignedLetterButtonVisible(): Promise<boolean> { return await this.acceptAndUploadSignedLetterButton.isVisible(); }
  async isRejectOfferButtonVisible(): Promise<boolean> { return await this.rejectOfferButton.isVisible(); }

  // Offer Summary data
  async getOfferPosition(): Promise<string> { return (await this.offerPosition.textContent() ?? '').trim(); }
  async getOfferCompany(): Promise<string> { return (await this.offerCompany.textContent() ?? '').trim(); }
  async getOfferStartDate(): Promise<string> { return (await this.offerStartDate.textContent() ?? '').trim(); }
  async getOfferCtc(): Promise<string> { return (await this.offerCtc.textContent() ?? '').trim(); }
  async getOfferStatus(): Promise<string> { return (await this.offerStatusBadge.textContent() ?? '').trim(); }

  async clickAcceptAndUploadSignedLetter(): Promise<void> { await this.acceptAndUploadSignedLetterButton.click(); }
  async clickRejectOffer(): Promise<void> { await this.rejectOfferButton.click(); }

  // Accept Offer Modal
  async isAcceptOfferModalVisible(): Promise<boolean> { return await this.acceptOfferModal.isVisible(); }
  async clickDrawTab(): Promise<void> { await this.drawTab.click(); }
  async clickUploadTab(): Promise<void> { await this.uploadTab.click(); }
  async clickClearSignature(): Promise<void> { await this.clearSignatureButton.click(); }
  async clickSubmitAndAcceptOffer(): Promise<void> { await this.submitAndAcceptOfferButton.click(); }

  async uploadSignatureFile(filePath: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    // Click on the upload area within the modal to trigger file chooser
    const uploadArea = this.acceptOfferModal.getByText('Upload Signed Offer Letter');
    await uploadArea.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  // Rejection flow
  async isReasonForRejectionVisible(): Promise<boolean> { return await this.reasonForRejectionPanel.isVisible(); }
  async fillRejectionReason(reason: string): Promise<void> { await this.rejectionReasonInput.fill(reason); }
  async clickConfirmRejection(): Promise<void> { await this.confirmRejectionButton.click(); }
  async clickCancelRejection(): Promise<void> { await this.cancelRejectionButton.click(); }

  async rejectOfferWithReason(reason: string): Promise<void> {
    await this.clickRejectOffer();
    await await new Promise(resolve => setTimeout(resolve, 500));
    await this.fillRejectionReason(reason);
    await this.clickConfirmRejection();
  }

  // Completion page
  async isAllSetHeadingVisible(): Promise<boolean> { return await this.allSetHeading.isVisible(); }
  async isCompletionMessageVisible(): Promise<boolean> { return await this.completionMessage.isVisible(); }
}


