import { Page, expect } from '@playwright/test';
import { CandidateRegistrationKeywords } from '@keywords/Hr-Candi-RegKeywords';
import { CandidatePreOnboardingKeywords } from '@keywords/CandidatePreOnboardingKeywords';
import { CandidateData, HrCandidateData } from '@utils/testDataGenerator';
import { MailSacClient } from '@utils/MailSacClient';

/**
 * Candidate Pre-Onboarding Workflow
 * Encapsulates common test steps for the E2E flow
 */
export class CandidatePreOnboardingWorkflow {
  private page: Page;
  private candidateRegistrationKeywords: CandidateRegistrationKeywords;
  private mailSacClient: MailSacClient;
  private candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords;

  constructor(
    page: Page,
    candidateRegistrationKeywords: CandidateRegistrationKeywords,
    mailSacClient: MailSacClient,
    candidatePreOnboardingKeywords: CandidatePreOnboardingKeywords
  ) {
    this.page = page;
    this.candidateRegistrationKeywords = candidateRegistrationKeywords;
    this.mailSacClient = mailSacClient;
    this.candidatePreOnboardingKeywords = candidatePreOnboardingKeywords;
  }

  // ==========================================
  //  PHASE 1: HR REGISTRATION
  // ==========================================

  /**
   * Perform HR candidate registration and request documents
   */
  async hrRegisterCandidate(candidateData: HrCandidateData): Promise<void> {
    console.log('[HR Registration] Starting candidate registration...');
    
    // Navigate to Candidate Registration
    await this.candidateRegistrationKeywords.navigateToCandidateRegistration();
    await this.candidateRegistrationKeywords.verifyDashboardDisplayed();
    await this.candidateRegistrationKeywords.verifySummaryCardsDisplayed();

    // Open new candidate drawer
    await this.page.screenshot({ path: 'test-results/hr-before-new-button.png' });
    await this.candidateRegistrationKeywords.clickNewButton();
    await this.page.screenshot({ path: 'test-results/hr-after-new-button.png' });
    await this.candidateRegistrationKeywords.verifyDrawerOpened();

    // Verify drawer UI elements
    await this.candidateRegistrationKeywords.verifyDrawerTitleDisplayed();
    await this.candidateRegistrationKeywords.verifyDrawerSubtitleDisplayed();

    // Fill candidate form
    await this.page.screenshot({ path: 'test-results/hr-before-fill-form.png' });
    await this.candidateRegistrationKeywords.fillCandidateForm(candidateData);
    await this.page.screenshot({ path: 'test-results/hr-after-fill-form.png' });

    console.log(`[HR Registration] Candidate ${candidateData.firstName} ${candidateData.lastName} registered successfully`);
  }

  // ==========================================
  //  PHASE 2: EMAIL RETRIEVAL
  // ==========================================

  /**
   * Retrieve preonboarding link from email using MailSac API
   */
  async retrieveEmailLink(candidateEmail: string): Promise<string> {
    console.log('[Email Retrieval] Fetching email for:', candidateEmail);
    
    // Use MailSac API to wait for email and extract the link
    const preOnboardingLink = await this.mailSacClient.waitForEmailAndExtractLink(
      candidateEmail,
      'Submit Your Documents',
      60000,
    );
    
    console.log('[Email Retrieval] Preonboarding link extracted successfully');
    return preOnboardingLink;
  }

  // ==========================================
  //  PHASE 3: CANDIDATE PREONBOARDING
  // ==========================================

  /**
   * Navigate candidate to preonboarding page and fill personal information
   */
  async candidateFillPersonalInfo(preOnboardingLink: string, personalData: {
    firstName: string;
    lastName: string;
    alternateEmail?: string;
    dialCode: string;
    mobileNumber: string;
    dateOfBirth?: string;
    nationalId?: string;
  }): Promise<void> {
    console.log('[Candidate Onboarding] Navigating to preonboarding page...');
    
    // Navigate candidate to pre-onboarding page
    await this.candidatePreOnboardingKeywords.navigateToCandidatePreOnboarding(preOnboardingLink);
    await this.page.waitForLoadState('networkidle');

    // Verify welcome page
    await this.candidatePreOnboardingKeywords.verifyWelcomeHeadingVisible();
    await this.candidatePreOnboardingKeywords.verifyStep1Active();

    // Fill Personal Information
    await this.candidatePreOnboardingKeywords.fillPersonalInformation(personalData);
    
    // Save & Continue
    await this.candidatePreOnboardingKeywords.clickSaveAndContinue();
    await this.page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify Step 1 completed, Step 2 active
    await this.candidatePreOnboardingKeywords.verifyStep1Completed();
    await this.candidatePreOnboardingKeywords.verifyStep2Active();
    await this.candidatePreOnboardingKeywords.verifyDocumentUploadSectionVisible();
    
    console.log('[Candidate Onboarding] Personal information submitted successfully');
  }

  /**
   * Fill ID proofs (Aadhaar + PAN)
   */
  async candidateFillIdProofs(idProofsData: {
    aadhaarNumber: string;
    aadhaarName: string;
    panNumber: string;
    panName: string;
    panFatherName: string;
  }): Promise<void> {
    console.log('[Candidate Onboarding] Filling ID proofs...');
    
    // Verify ID proofs tab sections
    await this.candidatePreOnboardingKeywords.verifyIdProofsTabVisible();
    await this.candidatePreOnboardingKeywords.verifyAadhaarSectionVisible();
    await this.candidatePreOnboardingKeywords.verifyPanSectionVisible();

    // Fill ID proofs
    await this.candidatePreOnboardingKeywords.fillIdProofs(idProofsData);

    // Click Next to proceed to Education tab
    await this.candidatePreOnboardingKeywords.clickNext();
    await this.page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('[Candidate Onboarding] ID proofs submitted successfully');
  }

  /**
   * Fill education details
   */
  async candidateFillEducation(educationData: {
    endYear: string;
    institutionName: string;
    degree: string;
    specialization: string;
    startYear: string;
    gpa: string;
  }): Promise<void> {
    console.log('[Candidate Onboarding] Filling education details...');
    
    // Verify education tab
    await this.candidatePreOnboardingKeywords.verifyEducationTabVisible();
    await this.candidatePreOnboardingKeywords.fillEducation(educationData);
    
    // Verify submit button
    await this.candidatePreOnboardingKeywords.verifySubmitDocumentsButtonVisible();
    await this.candidatePreOnboardingKeywords.verifySubmitDocumentsButtonEnabled();
    
    console.log('[Candidate Onboarding] Education details filled successfully');
  }

  /**
   * Submit complete form
   */
  async candidateSubmitDocuments(): Promise<void> {
    console.log('[Candidate Onboarding] Submitting documents...');
    
    // Submit the complete form
    await this.candidatePreOnboardingKeywords.clickSubmitDocuments();
    await this.page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('[Candidate Onboarding] Documents submitted successfully');
  }

  // ==========================================
  //  PHASE 4: VERIFICATION
  // ==========================================

  /**
   * Verify document verification page after submission
   */
  async verifyDocumentVerificationPage(): Promise<void> {
    console.log('[Verification] Verifying document verification page...');
    
    // Verify Step 3 active
    await this.candidatePreOnboardingKeywords.verifyStep3Active();
    await this.candidatePreOnboardingKeywords.verifyStep1Completed();
    await this.candidatePreOnboardingKeywords.verifyStep2Completed();

    // Verify success banner
    await this.candidatePreOnboardingKeywords.verifySuccessBannerVisible();
    await this.candidatePreOnboardingKeywords.verifyVerificationInProgressTextVisible();

    // Verify KPI cards
    await this.candidatePreOnboardingKeywords.verifyAllKPICardsVisible();
    await this.candidatePreOnboardingKeywords.verifyOverallVerificationProgressVisible();

    // Verify Identity Documents section
    await this.candidatePreOnboardingKeywords.verifyIdentityDocumentsSectionVisible();
    await this.candidatePreOnboardingKeywords.verifyPanDocRowVisible();
    await expect(this.candidatePreOnboardingKeywords.getPanStatus()).resolves.toBe('Under Review');
    
    await this.candidatePreOnboardingKeywords.verifyAadhaarDocRowVisible();
    await expect(this.candidatePreOnboardingKeywords.getAadhaarStatus()).resolves.toBe('Under Review');

    // Verify Academic Documents section
    await this.candidatePreOnboardingKeywords.verifyAcademicDocumentsSectionVisible();
    await this.candidatePreOnboardingKeywords.verifyEducationalDocRowVisible();
    await expect(this.candidatePreOnboardingKeywords.getEducationalDocStatus()).resolves.toBe('Under Review');

    // Verify KPI counts
    const totalDocs = await this.candidatePreOnboardingKeywords.getTotalDocumentsCount();
    const approved = await this.candidatePreOnboardingKeywords.getApprovedCount();
    const pending = await this.candidatePreOnboardingKeywords.getPendingReviewCount();
    const rejected = await this.candidatePreOnboardingKeywords.getRejectedCount();

    expect(totalDocs).toBe('3');
    expect(approved).toBe('0');
    expect(pending).toBe('3');
    expect(rejected).toBe('0');
    
    console.log('[Verification] Document verification page verified successfully');
  }

  // ==========================================
  //  UTILITY METHODS
  // ==========================================

  /**
   * Generate and log unique candidate data
   */
  static logCandidateData(data: CandidateData): void {
    console.log('Using unique candidate data:');
    console.log(`- Email: ${data.uniqueEmail}`);
    console.log(`- Applicant Number: ${data.applicantNumber}`);
    console.log(`- Name: ${data.firstName} ${data.lastName}`);
    console.log(`- Mobile: ${data.mobileNumber}`);
  }
}
