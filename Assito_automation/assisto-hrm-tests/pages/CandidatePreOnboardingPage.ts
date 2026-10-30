import { type Page, type Locator, expect } from '@playwright/test';
import { selectComboboxOption } from '@utils/dropdownHelpers';

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
  //  ADDRESS INFORMATION FORM
  // ==========================================
  readonly addressLine1Input: Locator;
  readonly addressCountryDropdown: Locator;
  readonly addressStateDropdown: Locator;
  readonly addressCityDropdown: Locator;
  readonly addressPinCodeInput: Locator;
  readonly permanentAddressSameCheckbox: Locator;

  /** Photograph upload on the Personal Information step (mandatory) */
  readonly photographSection: Locator;
  readonly photographUploadButton: Locator;
  readonly photographFileInput: Locator;

  // ==========================================
  //  PHASE 2: DOCUMENT UPLOAD
  // ==========================================
  readonly documentUploadCard: Locator;
  readonly idProofsTab: Locator;
  readonly educationTab: Locator;

  // ID Proofs sub-sections
  readonly aadhaarCardSection: Locator;
  readonly aadhaarImageUpload: Locator;
  readonly aadhaarImageFileInput: Locator;
  readonly aadhaarNumberInput: Locator;
  readonly aadhaarNameInput: Locator;
  readonly passportSection: Locator;
  readonly passportFrontImageInput: Locator;
  readonly passportBackImageInput: Locator;
  readonly passportDocumentTypeInput: Locator;
  readonly passportIdNumberInput: Locator;
  readonly passportNameInput: Locator;
  readonly passportExpiryDateInput: Locator;
  readonly panSection: Locator;
  readonly panCardImageFileInput: Locator;
  readonly panPdfFileInput: Locator;
  readonly panNumberInput: Locator;
  readonly panNameInput: Locator;
  readonly panFatherNameInput: Locator;
  readonly addMoreButton: Locator;
  readonly nextButton: Locator;

  // Education sub-section
  readonly educationalDocsSection: Locator;
  readonly degreeCertificateUpload: Locator;
  readonly degreeCertificateFileInput: Locator;
  readonly endYearInput: Locator;
  readonly institutionNameInput: Locator;
  readonly degreeInput: Locator;
  readonly specializationInput: Locator;
  readonly startYearInput: Locator;
  readonly gpaInput: Locator;
  readonly gradingSystemInput: Locator;
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
  readonly allStepsCompletedBadge: Locator;
  readonly downloadSignedOfferLetterButton: Locator;
  readonly downloadExpiryText: Locator;
  readonly joiningSummarySection: Locator;
  readonly joiningSummaryFullName: Locator;
  readonly joiningSummaryRole: Locator;
  readonly joiningSummaryStartDate: Locator;
  readonly joiningSummaryOfferStatus: Locator;

  // ==========================================
  //  CONSTRUCTOR
  // ==========================================
  constructor(page: Page) {
    this.page = page;

    // ── Header / Welcome ──
    this.welcomeHeading = page.getByText(/Hi\s+\w+,\s+welcome/i);
    this.candidateEmailDisplay = page.locator('[class*="email"], [class*="Email"]').first();

    // ── Step Indicator (sidebar) — steps are direct children of "Pre Onboarding Steps" container
    const sidebarChild = (name: string) =>
      page.getByText('Pre Onboarding Steps').locator('..').locator('> *').filter({ hasText: name }).first();
    this.step1PersonalInfo = sidebarChild('Personal Information');
    this.step2DocumentUpload = sidebarChild('Document Upload');
    this.step3DocumentVerification = sidebarChild('Document Verification');
    this.step4OfferLetterRelease = sidebarChild('Offer Letter Release');
    this.step5Completion = sidebarChild('Completion');

    // ── Personal Information Form ──
    // Card title is a <p>, not a heading; locate via the unique subtitle then go up to the card
    this.personalInfoCard = page
      .getByText('Fill in your details', { exact: false })
      .locator('..')
      .locator('..')
      .locator('..');
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.personalEmailInput = page.getByRole('textbox', { name: /Personal Email/i });
    this.alternateEmailInput = page.getByRole('textbox', { name: /Alternate Email/i });
    this.mobileDialCodeDropdown = page.locator('div').filter({ hasText: /^Mobile Number\s*\*?/ }).getByRole('combobox').first();
    this.mobileNumberInput = page.getByRole('textbox', { name: 'Enter mobile number' });
    this.dateOfBirthInput = page.getByRole('combobox', { name: 'DD/MM/YYYY' });
    this.nationalIdInput = page.getByRole('textbox', { name: 'National ID / SSN' });
    this.saveContinueButton = page.getByRole('button', { name: /Submit & Continue/ });

    // ── Address Information ──
    this.addressLine1Input = page.getByRole('textbox', { name: 'Address Line 1' }).first();
    this.addressCountryDropdown = page.locator('div').filter({ hasText: /^Country\s*\*?/ }).getByRole('combobox').first();
    this.addressStateDropdown = page.locator('div').filter({ hasText: /^State\s*\*?/ }).getByRole('combobox').first();
    this.addressCityDropdown = page.locator('div').filter({ hasText: /^City\s*\*?/ }).getByRole('combobox').first();
    this.addressPinCodeInput = page.getByRole('textbox', { name: 'PIN / ZIP Code' }).first();
    this.permanentAddressSameCheckbox = page.getByRole('checkbox', { name: /Permanent address is the same as current address/i });

    // Photograph is a mandatory field on Personal Information ("Photograph is
    // required" blocks Submit & Continue). The visible control is an "Upload
    // Photo" button with the real <input type="file"> hidden alongside it, so
    // the input is reached through the enclosing section — the same idiom used
    // for the Aadhaar/PAN/Passport uploads above.
    this.photographUploadButton = page.getByRole('button', { name: 'Upload Photo' });
    this.photographSection = this.photographUploadButton.locator('..');
    this.photographFileInput = this.photographSection.locator('input[type="file"]').first();

    // ── Document Upload ──
    // No "Document Upload" heading in main content; the card wraps the tablist
    this.documentUploadCard = page.getByRole('tablist').locator('..').locator('..');
    this.idProofsTab = page.getByRole('tab', { name: /ID Proofs/i });
    this.educationTab = page.getByRole('tab', { name: /Education/i });

    // ID Proofs
    // Section titles are <span>s, not headings; go up to the section card
    this.aadhaarCardSection = page
      .getByText('Aadhaar Card', { exact: true })
      .locator('..')
      .locator('..')
      .locator('..');
    this.aadhaarImageUpload = page.getByText('Click to upload or drag and drop');
    // Scoped to the Aadhaar section so it can't collide with the Passport/PAN
    // file inputs that sit between it and the PAN section in the DOM.
    this.aadhaarImageFileInput = this.aadhaarCardSection.locator('input[type="file"]').first();
    this.aadhaarNumberInput = page.getByRole('spinbutton', { name: 'Aadhaar Number' });
    this.aadhaarNameInput = page.getByRole('textbox', { name: 'Name' }).first();

    // Passport section — a required document between Aadhaar and PAN. Scoped
    // file inputs are essential here: an earlier bug used page-wide nth()
    // indices for PAN's file input, which actually landed on Passport's
    // "Front Image" field once this section was added, leaving PAN's real
    // image and Passport's Back Image / text fields empty and blocking submission.
    this.passportSection = page
      .getByText('Passport', { exact: true })
      .locator('..')
      .locator('..')
      .locator('..');
    this.passportFrontImageInput = this.passportSection.locator('input[type="file"]').nth(0);
    this.passportBackImageInput = this.passportSection.locator('input[type="file"]').nth(1);
    this.passportDocumentTypeInput = this.passportSection.getByRole('textbox', { name: 'Document Type' });
    this.passportIdNumberInput = this.passportSection.getByRole('textbox', { name: 'ID Number' });
    this.passportNameInput = this.passportSection.getByRole('textbox', { name: 'Name on Document' });
    this.passportExpiryDateInput = this.passportSection.getByRole('combobox', { name: 'DD/MM/YYYY' });

    // Scoped the same way as aadhaarCardSection/passportSection (exact text
    // match, walk up to the section wrapper) — the previous broad substring
    // filter resolved to an oversized ancestor, so nth(0) on file inputs
    // within it kept re-targeting Aadhaar's already-filled input instead of
    // PAN's own "Pan Card Image" upload.
    this.panSection = page
      .getByText('pan', { exact: true })
      .locator('..')
      .locator('..')
      .locator('..');
    // Scoped to the PAN section — see the Passport comment above for why this matters.
    this.panCardImageFileInput = this.panSection.locator('input[type="file"]').nth(0);
    this.panPdfFileInput = this.panSection.locator('input[type="file"]').nth(1);
    this.panNumberInput = page.getByRole('textbox', { name: /pan/i });
    this.panNameInput = page.getByRole('textbox', { name: 'pan name' });
    this.panFatherNameInput = page.getByRole('textbox', { name: 'father name' });
    this.addMoreButton = page.getByRole('button', { name: 'Add More' });
    this.nextButton = page.getByRole('button', { name: 'Next' });

    // Education
    this.educationalDocsSection = page
      .getByText('Educational documents', { exact: true })
      .locator('..')
      .locator('..')
      .locator('..');
    this.degreeCertificateUpload = page.getByText('Click to upload or drag and drop').first();
    this.degreeCertificateFileInput = page.locator('input[type="file"]').last();
    // The End Year / Start Year date pickers must be scoped by an END-ANCHORED
    // label regex. Without the trailing $, /^End Year\s*\*?/ also matches the
    // group wrapper — whose text merely *starts* with "End Year" — and that
    // wrapper holds all three education comboboxes, so the locator resolved to
    // 3 elements and failed strict mode once the later fields had rendered.
    // With $ it matches only this field's own group (text is exactly the
    // label while the picker is still empty), leaving one combobox inside.
    // getByRole(name) can't separate the two pickers: both are named
    // "DD/MM/YYYY".
    this.endYearInput = page
      .getByRole('combobox', { name: /End Year/i })
      .or(page.locator('div').filter({ hasText: /^End Year\s*\*?$/ }).getByRole('combobox'));
    this.institutionNameInput = page.getByRole('textbox', { name: 'Institution Name' });
    this.degreeInput = page.getByRole('textbox', { name: 'Degree/Qualification' });
    this.specializationInput = page.getByRole('textbox', { name: 'Specialization/Major' });
    this.startYearInput = page
      .getByRole('combobox', { name: /Start Year/i })
      .or(page.locator('div').filter({ hasText: /^Start Year\s*\*?$/ }).getByRole('combobox'));
    this.gpaInput = page.getByRole('textbox', { name: /CGPA|Percentage|GPA/i });
    // Unlike the date pickers, this combobox carries its own accessible name,
    // so it needs no wrapper scoping at all.
    this.gradingSystemInput = page.getByRole('combobox', {
      name: 'Grading System',
    });
    this.previousButton = page.getByRole('button', { name: 'Previous' });

    // Save / Submit
    this.saveAsDraftButton = page.getByRole('button', { name: 'Save as Draft' });
    this.submitDocumentsButton = page.getByRole('button', { name: 'Submit Documents' });

    // ── Phase 3: Document Verification (post-submission) ──

    // Success / Verification landing page
    this.successBanner = page.getByText('Documents Pending for Verification');
    this.verificationInProgressText = page.getByText('Your documents are awaiting verification');

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
    this.panStatusBadge = this.panDocRow.getByRole('button', { name: 'Under Review' });
    this.aadhaarDocRow = page.getByRole('listitem').filter({ has: page.getByText('Aadhaar Card') }).first();
    this.aadhaarStatusBadge = this.aadhaarDocRow.getByRole('button', { name: 'Under Review' });

    // Academic Documents section
    this.academicDocumentsSection = page.getByRole('heading', { name: 'Academic Documents' }).locator('..');
    this.academicDocCount = page.getByText(/0\/\d+ approved/).nth(1);
    this.educationalDocRow = page.getByRole('listitem').filter({ has: page.getByText('Educational documents') }).first();
    this.educationalDocStatusBadge = this.educationalDocRow.getByRole('button', { name: 'Under Review' });

    // ── Phase 4: Offer Letter Release (Candidate) ──
    // Titles/section headers throughout this app render as plain styled
    // <div>/<span> text, not semantic ARIA headings — matched by text instead.
    this.offerLetterCard = page.getByText('Offer Letter', { exact: true }).first().locator('..').locator('..');
    this.offerLetterTitle = page.getByText('Offer Letter', { exact: true }).first();
    this.offerLetterTemplate = page.locator('[class*="template"], [class*="Template"]').filter({ has: page.getByText('Template') }).locator('..').locator('..');
    this.offerLetterSentOn = page.getByText('Sent On').locator('..');
    this.offerLetterDocumentPreview = page.getByText('Document Preview', { exact: true }).locator('..').locator('..');
    this.offerLetterDownloadButton = this.offerLetterDocumentPreview.getByRole('button', { name: 'Download' }).first();
    this.offerLetterConfidentialBadge = page.getByText('Confidential').first();
    this.offerSummaryPanel = page.getByText('Offer Summary', { exact: true }).locator('..').locator('..');
    this.offerPosition = page.getByText('Position').locator('..').locator('..');
    this.offerCompany = page.getByText('Company').locator('..').locator('..');
    this.offerStartDate = page.getByText('Start Date').locator('..').locator('..');
    this.offerCtc = page.getByText('CTC').locator('..').locator('..');
    // Must match the status VALUE whatever it currently is. Pinning this to
    // the literal 'Awaiting Response' meant getOfferStatus() could only ever
    // return that one string — so a candidate who had actually declined still
    // read back as "awaiting response", and any assertion on a post-response
    // status could never pass. The app's wording for a candidate rejection is
    // "Declined" (heading "Offer Letter Declined", Offer Status "Declined"),
    // not "Rejected".
    this.offerStatusBadge = page
      .getByText(/^(Awaiting Response|Accepted|Declined|Rejected)$/i)
      .first();
    this.awaitingResponseText = page.getByText('Awaiting Response').first();
    this.acceptAndUploadSignedLetterButton = page.getByRole('button', {
      name: /Accept & (Upload Signed|Sign Offer) Letter/i,
    });
    this.rejectOfferButton = page.getByRole('button', { name: 'Reject Offer' });

    // Accept Offer Letter Modal
    this.acceptOfferModal = page
      .locator('[class*="modal"], [class*="Modal"], [role="dialog"]')
      .filter({ has: page.getByText(/Accept.*Offer/i) })
      .first();
    this.offerLetterInfoHeader = this.acceptOfferModal.locator('[class*="info"], [class*="Info"]').first();
    this.drawTab = this.acceptOfferModal.getByRole('tab', { name: /Draw/i });
    this.uploadTab = this.acceptOfferModal.getByRole('tab', { name: /Upload/i });
    this.signatureCanvas = this.acceptOfferModal.locator('canvas').first();
    this.clearSignatureButton = this.acceptOfferModal.getByRole('button', { name: 'Clear' });
    this.uploadSignedLetterButton = this.acceptOfferModal.getByText('Upload Signed Offer Letter').locator('..').locator('input[type="file"]');
    this.submitAndAcceptOfferButton = this.acceptOfferModal.getByRole('button', {
      name: /Submit & Accept Offer|Accept Offer|Submit/i,
    });

    // Rejection form
    this.reasonForRejectionPanel = page.getByText('Reason for Rejection', { exact: true }).locator('..');
    this.rejectionReasonInput = page.getByPlaceholder(/does not meet my expectations/i).first();
    this.confirmRejectionButton = page.getByRole('button', { name: 'Confirm Rejection' });
    this.cancelRejectionButton = page.getByRole('button', { name: 'Cancel' }).last();

    this.allSetHeading = page.getByText(/Pre Onboarding Complete!?|All Set|Congratulations/i).first();
    this.completionMessage = page.getByText(/Welcome to .* Pvt Ltd/i).first();
    this.allStepsCompletedBadge = page.getByText(/All Steps Completed|Completed/i).first();
    this.downloadSignedOfferLetterButton = page.getByRole('button', { name: 'Download Signed Offer Letter' });
    this.downloadExpiryText = page.getByText(/Expires in \d+s/);
    this.joiningSummarySection = page.getByText('YOUR JOINING SUMMARY').locator('..');
    this.joiningSummaryFullName = page.getByText('Full Name').locator('..').locator('..');
    this.joiningSummaryRole = page.getByText('Role').locator('..').locator('..');
    this.joiningSummaryStartDate = page.getByText('Start Date').locator('..').locator('..');
    this.joiningSummaryOfferStatus = page.getByText('Offer Status').locator('..').locator('..');
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
    if (/active|current/i.test(cls)) return true;
    const text = await step.textContent() ?? '';
    return /In Progress/i.test(text);
  }

  private async isStepCompleted(step: Locator): Promise<boolean> {
    const cls = await step.getAttribute('class') ?? '';
    if (/completed/i.test(cls)) return true;
    const text = await step.textContent() ?? '';
    return /Completed/i.test(text);
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
    console.log(`Selecting dial code: "${value}"`);
    await selectComboboxOption(this.page, this.mobileDialCodeDropdown, value, {
      filterText: `${value} `,
    });
    const actual = await this.mobileDialCodeDropdown.inputValue();
    console.log(`Dial code value after selection: "${actual}"`);
  }

  async fillMobileNumber(v: string): Promise<void> { await this.mobileNumberInput.fill(v); }
  async fillDateOfBirth(v: string): Promise<void> {
    await this.dateOfBirthInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.dateOfBirthInput.click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.type(v, { delay: 50 });
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  async fillNationalId(v: string): Promise<void> { await this.nationalIdInput.fill(v); }

  // ==========================================
  //  SUBMIT DIAGNOSTICS
  // ==========================================

  /**
   * Collect visible validation errors on the current page. Checks standard
   * error containers (role=alert, error classes, aria-invalid) and, as a
   * fallback, scans visible body text for typical validation phrases — some
   * required-field errors on this app (e.g. "Photograph is required") are
   * rendered as plain paragraphs with no error class or role.
   */
  private async collectValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const seen = new Set<string>();

    const containers = this.page.locator(
      '[role="alert"], [class*="error" i], [class*="Error"], [class*="Mui-error"], [aria-invalid="true"]',
    );
    const count = await containers.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const el = containers.nth(i);
      if (!(await el.isVisible().catch(() => false))) continue;
      const text = ((await el.textContent().catch(() => '')) ?? '').trim();
      if (text && !seen.has(text)) {
        seen.add(text);
        errors.push(text);
      }
    }

    const bodyText = await this.page.locator('body').innerText().catch(() => '');
    const validationPattern =
      /is required|are required|please (enter|select)|cannot be empty|is invalid|is not valid|must (be|enter|select|contain|match|have)|not be (empty|blank)|(is|are) mandatory/i;
    for (const line of bodyText.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 4) continue;
      if (/marked with \*/.test(trimmed)) continue;
      if (validationPattern.test(trimmed) && !seen.has(trimmed)) {
        seen.add(trimmed);
        errors.push(trimmed);
      }
    }

    return errors;
  }

  async clickSaveAndContinue(): Promise<void> {
    await this.saveContinueButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Handle confirmation dialog
    const confirmDialog = this.page.getByRole('button', { name: 'Yes, submit' });
    if (await confirmDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Clicking "Yes, submit" on confirmation dialog');
      await confirmDialog.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Confirm we actually left the Personal Information form (don't just assume)
    await this.firstNameInput.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const stillOnPersonalInfo = await this.firstNameInput.isVisible().catch(() => false);
    const idProofsVisible = await this.page.getByRole('tab', { name: /ID Proofs/i }).isVisible().catch(() => false);

    if (stillOnPersonalInfo && !idProofsVisible) {
      const validationErrors = await this.collectValidationErrors();
      if (validationErrors.length > 0) {
        throw new Error(
          `[clickSaveAndContinue] Personal Information submission failed with validation error(s): ${validationErrors.join(' | ')}`,
        );
      }
      throw new Error(
        '[clickSaveAndContinue] Still on Personal Information form after submit — submission did not advance the flow, but no validation error was detected. Check for a silent failure (network error, disabled field, or unhandled dropdown state).',
      );
    }
  }

  async fillPersonalInformation(data: {
    firstName: string; lastName: string; alternateEmail?: string;
    dialCode: string; mobileNumber: string; dateOfBirth?: string; nationalId?: string;
    address?: { addressLine1: string; country: string; state: string; city: string; pinCode: string };
    /** Image to attach to the mandatory Photograph field (default: test-upload.png) */
    photograph?: string;
  }): Promise<void> {
    await this.fillFirstName(data.firstName);
    await this.fillLastName(data.lastName);
    if (data.alternateEmail) await this.fillAlternateEmail(data.alternateEmail);
    await this.selectDialCode(data.dialCode);
    await this.fillMobileNumber(data.mobileNumber);
    if (data.dateOfBirth) await this.fillDateOfBirth(data.dateOfBirth);
    if (data.nationalId) await this.fillNationalId(data.nationalId);
    
    if (data.address) {
      await this.fillAddressInformation(data.address);
    }

    await this.uploadPhotograph(data.photograph);
  }

  /**
   * Attach the mandatory Photograph. Skipped only if the control is absent
   * (older builds without the field), so this stays safe for any caller.
   */
  async uploadPhotograph(file: string = 'test-data/test-upload.png'): Promise<void> {
    if (!(await this.photographUploadButton.isVisible().catch(() => false))) {
      return;
    }
    await this.photographFileInput.setInputFiles(file);
    // The preview replaces the "Photograph is required" message once accepted.
    await expect(this.photographSection.getByText('Photograph is required')).toBeHidden({
      timeout: 15000,
    });
  }

  async waitForDropdownEnabled(combobox: Locator): Promise<void> {
    const startTime = Date.now();
    const timeout = 10000;
    while (Date.now() - startTime < timeout) {
      const isDisabled = await combobox.evaluate(el => el.hasAttribute('disabled'));
      if (!isDisabled) {
        console.log('Dropdown enabled after', Date.now() - startTime, 'ms');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.warn('Dropdown did not become enabled within timeout');
  }

  async selectDropdownByLabel(combobox: Locator, value: string): Promise<void> {
    await combobox.waitFor({ state: 'visible', timeout: 10000 });
    await combobox.scrollIntoViewIfNeeded();

    const isDisabled = await combobox.evaluate(el => el.hasAttribute('disabled'));
    if (isDisabled) {
      console.log(`Dropdown for "${value}" is disabled, cannot select`);
      return;
    }

    await selectComboboxOption(this.page, combobox, value);
    const actual = await combobox.inputValue();
    console.log(`Dropdown value after selection "${value}": "${actual}"`);
  }

  async fillAddressInformation(data: {
    addressLine1: string; country: string; state: string; city: string; pinCode: string;
  }): Promise<void> {
    await this.addressLine1Input.fill(data.addressLine1);
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log(`[Address] Filling country: "${data.country}"`);
    console.log(`[Address] Country combobox visible: ${await this.addressCountryDropdown.isVisible().catch(() => false)}`);
    await this.selectDropdownByLabel(this.addressCountryDropdown, data.country);

    // Wait for cascading dropdowns to update after country selection
    console.log('[Address] Waiting for State dropdown to enable...');
    await this.page.waitForTimeout(3000);

    // Reload State locator to get updated element reference
    const stateCombo = this.page.getByRole('combobox', { name: 'State' }).first();
    await this.waitForDropdownEnabled(stateCombo);

    const stateDisabled = await stateCombo.evaluate(el => el.hasAttribute('disabled')).catch(() => true);
    if (stateDisabled) {
      console.log('[Address] State is still disabled after country selection, filling what we can');
      await this.addressPinCodeInput.fill(data.pinCode);
      await this.permanentAddressSameCheckbox.click({ force: true });
      return;
    }

    await this.selectDropdownByLabel(stateCombo, data.state);
    await this.page.waitForTimeout(2000);

    const cityCombo = this.page.getByRole('combobox', { name: 'City' }).first();
    await this.waitForDropdownEnabled(cityCombo);
    const cityDisabled = await cityCombo.evaluate(el => el.hasAttribute('disabled')).catch(() => true);
    if (cityDisabled) {
      console.log('[Address] City is still disabled, skipping');
      await this.addressPinCodeInput.fill(data.pinCode);
      await this.permanentAddressSameCheckbox.click({ force: true });
      return;
    }

    await this.selectDropdownByLabel(cityCombo, data.city);
    await new Promise(resolve => setTimeout(resolve, 500));

    await this.addressPinCodeInput.fill(data.pinCode);
    await new Promise(resolve => setTimeout(resolve, 500));

    await this.permanentAddressSameCheckbox.click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('[Address] Address information filled');
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
  async clickSubmitDocuments(): Promise<void> {
    // Check consent checkbox if needed
    const consentCheckbox = this.page.getByRole('checkbox', { name: /I have read and agree/i });
    if (await consentCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isChecked = await consentCheckbox.isChecked();
      if (!isChecked) {
        console.log('Checking consent declaration checkbox');
        await consentCheckbox.check({ force: true });
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    await this.submitDocumentsButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Handle confirmation dialog if present
    const confirmDialog = this.page.getByRole('button', { name: 'Yes, submit' });
    if (await confirmDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking "Yes, submit" on submission confirmation dialog');
      await confirmDialog.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Confirm we actually left the Document Upload form (don't just assume)
    const stillOnDocumentUpload = await this.submitDocumentsButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (stillOnDocumentUpload) {
      const validationErrors = await this.collectValidationErrors();
      if (validationErrors.length > 0) {
        throw new Error(
          `[clickSubmitDocuments] Document submission failed with validation error(s): ${validationErrors.join(' | ')}`,
        );
      }
      throw new Error(
        '[clickSubmitDocuments] Still on Document Upload form after submit — submission did not advance the flow, but no validation error was detected. Check for a silent failure (network error, un-attached upload, or unhandled form state).',
      );
    }
  }

  // ID Proofs input methods
  async fillAadhaarNumber(v: string): Promise<void> {
    await this.aadhaarNumberInput.click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 200));
    await this.page.keyboard.type(v, { delay: 20 });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  async fillAadhaarName(v: string): Promise<void> { await this.aadhaarNameInput.fill(v); }
  async fillPanNumber(v: string): Promise<void> { await this.panNumberInput.fill(v); }
  async fillPanName(v: string): Promise<void> { await this.panNameInput.fill(v); }
  async fillPanFatherName(v: string): Promise<void> { await this.panFatherNameInput.fill(v); }

  async uploadAadhaarImage(): Promise<void> {
    await this.aadhaarImageFileInput.setInputFiles('test-data/test-upload.png');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  async uploadPanImage(): Promise<void> {
    // The tenant's document configuration can render MORE THAN ONE required
    // upload slot inside the PAN section (observed: "PAN Card Dispaly" plus a
    // separate mandatory "Pan Card Image"). Filling only the first input left
    // the second empty, and the failure surfaced far downstream as "success
    // banner not found" after Submit Documents — the real cause being an
    // inline "Pan Card Image is required" validation on the ID Proofs tab.
    //
    // So: keep uploading into the section's file inputs while any empty
    // dropzone remains, rather than assuming a fixed slot count. Indexing by
    // input alone isn't safe because each filled slot also owns an "Add more
    // files" input, so the loop re-checks the dropzones after every upload.
    const inputs = this.panSection.locator('input[type="file"]');
    const total = await inputs.count();
    for (let i = 0; i < total; i++) {
      const emptyDropzones = await this.panSection
        .getByText('Click to upload or drag and drop')
        .count();
      if (emptyDropzones === 0) break;
      await inputs.nth(i).setInputFiles('test-data/test-upload.png');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Passport input methods
  async uploadPassportFrontImage(): Promise<void> {
    await this.passportFrontImageInput.setInputFiles('test-data/test-upload.png');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  async uploadPassportBackImage(): Promise<void> {
    await this.passportBackImageInput.setInputFiles('test-data/test-upload.png');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  async fillPassportDocumentType(v: string): Promise<void> { await this.passportDocumentTypeInput.fill(v); }
  async fillPassportIdNumber(v: string): Promise<void> { await this.passportIdNumberInput.fill(v); }
  async fillPassportName(v: string): Promise<void> { await this.passportNameInput.fill(v); }
  async fillPassportExpiryDate(v: string): Promise<void> {
    await this.passportExpiryDateInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.passportExpiryDateInput.click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    await this.page.keyboard.type(v, { delay: 30 });
    await new Promise(resolve => setTimeout(resolve, 300));
    await this.page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));
    await this.page.keyboard.press('Escape');
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  async fillPassport(data: {
    documentType: string;
    idNumber: string;
    nameOnDocument: string;
    expiryDate: string;
  }): Promise<void> {
    await this.uploadPassportFrontImage();
    await this.uploadPassportBackImage();
    await this.fillPassportDocumentType(data.documentType);
    await this.fillPassportIdNumber(data.idNumber);
    await this.fillPassportName(data.nameOnDocument);
    await this.fillPassportExpiryDate(data.expiryDate);
  }

  async fillIdProofs(data: {
    aadhaarNumber: string; aadhaarName: string;
    panNumber: string; panName: string; panFatherName: string;
    passportDocumentType?: string; passportIdNumber?: string; passportName?: string; passportExpiryDate?: string;
  }): Promise<void> {
    if (await this.aadhaarCardSection.isVisible().catch(() => false)) {
      await this.uploadAadhaarImage();
      await this.fillAadhaarNumber(data.aadhaarNumber);
      await this.fillAadhaarName(data.aadhaarName);
    }

    // Passport is a required section between Aadhaar and PAN in the current Figma.
    if (await this.passportSection.isVisible().catch(() => false)) {
      await this.fillPassport({
        documentType: data.passportDocumentType ?? 'Passport',
        idNumber: data.passportIdNumber ?? `P${Date.now().toString().slice(-8)}`,
        nameOnDocument: data.passportName ?? data.aadhaarName,
        expiryDate: data.passportExpiryDate ?? '31/12/2032',
      });
    }

    if (await this.panSection.isVisible().catch(() => false)) {
      await this.uploadPanImage();
      await this.fillPanNumber(data.panNumber);
      await this.fillPanName(data.panName);
      await this.fillPanFatherName(data.panFatherName);
    }
  }

  /**
   * Fill every additional (config-driven) document section rendered in the
   * ID Proofs tab. The shared Document Configuration may contain extra
   * mandatory documents (added via Pre-Onboarding Settings) that render as
   * required sections here; each exposes Front Image / Back Image uploads plus
   * Document Type / ID Number / Name on Document / Expiry Date fields. This is
   * deliberately generic so it works regardless of how many documents are
   * configured (or none).
   */
  async fillAdditionalDocuments(): Promise<void> {
    const docTypeInputs = this.page.getByRole('textbox', { name: 'Document Type' });
    const count = await docTypeInputs.count();

    if (count === 0) {
      console.log('[Docs] No additional configured documents - skipping');
      return;
    }

    console.log(`[Docs] Found ${count} additional configured document(s)`);
    for (let i = 0; i < count; i++) {
      const docTypeInput = docTypeInputs.nth(i);
      const currentVal = await docTypeInput.inputValue().catch(() => '');
      if (currentVal.trim() !== '') {
        console.log(`[Docs] Additional document ${i + 1} already has Document Type "${currentVal}" - skipping`);
        continue;
      }

      const section = docTypeInput.locator('xpath=ancestor::div[.//input[@type="file"] or .//button[contains(., "upload")]][1]');
      const hasSection = (await section.count()) > 0;

      const fileInputs = hasSection ? section.locator('input[type="file"]') : this.page.locator('input[type="file"]');
      const fileCount = await fileInputs.count();
      console.log(`[Docs] Additional document ${i + 1}: uploading ${fileCount} file(s)`);
      for (let f = 0; f < fileCount; f++) {
        await fileInputs.nth(f).setInputFiles('test-data/test-upload.png');
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      await docTypeInput.fill('Government ID');

      const idInput = hasSection
        ? section.getByRole('textbox', { name: 'ID Number' })
        : this.page.getByRole('textbox', { name: 'ID Number' }).nth(i);
      if (await idInput.isVisible().catch(() => false)) {
        await idInput.fill(`98765${String(43210 + i * 137).slice(0, 5)}`);
      }

      const nameInput = hasSection
        ? section.getByRole('textbox', { name: 'Name on Document' })
        : this.page.getByRole('textbox', { name: 'Name on Document' }).nth(i);
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('Test User');
      }

      const expiryPickers = hasSection
        ? section.getByRole('combobox', { name: /DD\/MM\/YYYY|Expiry/i }).or(section.locator('input[placeholder*="YYYY"], input[placeholder*="yyyy"]'))
        : this.page.getByRole('combobox', { name: /DD\/MM\/YYYY|Expiry/i });
      const expCount = await expiryPickers.count();
      for (let e = 0; e < expCount; e++) {
        const picker = expiryPickers.nth(e);
        if (await picker.isVisible().catch(() => false)) {
          const val = await picker.inputValue().catch(() => '');
          if (!val) {
            await picker.click({ force: true });
            await new Promise(resolve => setTimeout(resolve, 300));
            await picker.fill('31/12/2030').catch(async () => {
              await this.page.keyboard.type('31/12/2030', { delay: 30 });
            });
            await new Promise(resolve => setTimeout(resolve, 300));
            await this.page.keyboard.press('Enter');
            await new Promise(resolve => setTimeout(resolve, 300));
            await this.page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      console.log(`[Docs] Successfully filled additional document ${i + 1}`);
    }
  }

  // Education input methods
  async fillEndYear(v: string): Promise<void> {
    await this.endYearInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.endYearInput.click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.type(v, { delay: 30 });
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  async fillInstitutionName(v: string): Promise<void> { await this.institutionNameInput.fill(v); }
  async fillDegree(v: string): Promise<void> { await this.degreeInput.fill(v); }
  async fillSpecialization(v: string): Promise<void> { await this.specializationInput.fill(v); }
  async fillStartYear(v: string): Promise<void> {
    await this.startYearInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.startYearInput.click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.type(v, { delay: 30 });
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  async fillGpa(v: string): Promise<void> { await this.gpaInput.fill(v); }
  async fillGradingSystem(v: string): Promise<void> {
    await this.gradingSystemInput.waitFor({ state: 'visible', timeout: 10000 });
    await selectComboboxOption(this.page, this.gradingSystemInput, v, { noFilter: true });
  }

  async uploadDegreeCertificate(): Promise<void> {
    await this.degreeCertificateFileInput.setInputFiles('test-data/test-upload.png');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async fillEducation(data: {
    endYear: string; institutionName: string; degree: string;
    specialization: string; startYear: string; gpa: string;
    gradingSystem: string;
  }): Promise<void> {
    await this.uploadDegreeCertificate();
    await this.fillStartYear(data.startYear);
    await this.fillEndYear(data.endYear);
    await this.fillInstitutionName(data.institutionName);
    await this.fillDegree(data.degree);
    await this.fillSpecialization(data.specialization);
    await this.fillGradingSystem(data.gradingSystem);
    await this.fillGpa(data.gpa);
  }

  async fillCompleteForm(
    personalData: { firstName: string; lastName: string; alternateEmail?: string; dialCode: string; mobileNumber: string; dateOfBirth?: string; nationalId?: string; address?: { addressLine1: string; country: string; state: string; city: string; pinCode: string } },
    idProofsData: { aadhaarNumber: string; aadhaarName: string; panNumber: string; panName: string; panFatherName: string },
    educationData: { endYear: string; institutionName: string; degree: string; specialization: string; startYear: string; gpa: string; gradingSystem: string },
  ): Promise<void> {
    await this.fillPersonalInformation(personalData);
    await this.page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.fillIdProofs(idProofsData);
    await new Promise(resolve => setTimeout(resolve, 500));

    await this.clickEducationTab();
    await new Promise(resolve => setTimeout(resolve, 500));

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

  /**
   * Draw a simple signature stroke on the canvas in the "Draw" tab of the
   * Accept Offer Letter modal (default active tab — no file upload needed).
   */
  async drawSignature(): Promise<void> {
    await this.signatureCanvas.waitFor({ state: 'visible', timeout: 10000 });
    const box = await this.signatureCanvas.boundingBox();
    if (!box) throw new Error('[drawSignature] Signature canvas has no bounding box');

    const startX = box.x + box.width * 0.2;
    const startY = box.y + box.height * 0.5;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      const x = box.x + box.width * (0.2 + (0.6 * i) / 10);
      const y = box.y + box.height * (0.5 + 0.2 * Math.sin(i));
      await this.page.mouse.move(x, y);
    }
    await this.page.mouse.up();
  }

  async isSignatureCanvasDrawn(): Promise<boolean> {
    return await this.signatureCanvas.evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      return data.some((value, index) => index % 4 === 3 && value !== 0);
    });
  }

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
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.fillRejectionReason(reason);
    await this.clickConfirmRejection();
  }

  // Completion page
  async isAllSetHeadingVisible(): Promise<boolean> { return await this.allSetHeading.isVisible(); }
  async isCompletionMessageVisible(): Promise<boolean> { return await this.completionMessage.isVisible(); }
  async isAllStepsCompletedBadgeVisible(): Promise<boolean> { return await this.allStepsCompletedBadge.isVisible(); }
  async isDownloadSignedOfferLetterButtonVisible(): Promise<boolean> { return await this.downloadSignedOfferLetterButton.isVisible(); }
  async getJoiningSummaryOfferStatus(): Promise<string> { return (await this.joiningSummaryOfferStatus.textContent() ?? '').trim(); }
  async getJoiningSummaryFullName(): Promise<string> { return (await this.joiningSummaryFullName.textContent() ?? '').trim(); }
}


