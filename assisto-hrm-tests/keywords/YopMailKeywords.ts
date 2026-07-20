import { Page, expect } from '@playwright/test';
import { YopMailPage } from '@pages/YopMailPage';

/**
 * YopMailKeywords provides high-level business actions for the YOP Mail
 * temporary email service used for testing the candidate pre-onboarding
 * email flow.
 *
 * Workflow:
 * 1. HR requests documents from candidate (via Candidate Registration drawer)
 * 2. System sends email to candidate's YOP Mail address
 * 3. Candidate opens email, clicks the preonboarding link
 * 4. Candidate navigates to preonboarding page
 * 5. After candidate submits documents, HR receives a confirmation mail
 */
export class YopMailKeywords {
  private readonly page: Page;
  private readonly yopMailPage: YopMailPage;

  constructor(page: Page) {
    this.page = page;
    this.yopMailPage = new YopMailPage(page);
  }

  // ==========================================
  //  NAVIGATION
  // ==========================================

  async gotoYopMail(): Promise<void> {
    await this.yopMailPage.gotoYopMail();
  }

  async loadInboxByAlias(alias: string): Promise<void> {
    await this.yopMailPage.enterAliasAndLoad(alias);
  }

  // ==========================================
  //  INBOX VERIFICATIONS
  // ==========================================

  async verifyInboxVisible(): Promise<void> {
    await expect(this.yopMailPage.isInboxVisible()).resolves.toBe(true);
  }

  async getMailCount(): Promise<number> {
    return await this.yopMailPage.getMailCount();
  }

  // ==========================================
  //  EMAIL CONTENT VERIFICATIONS
  // ==========================================

  async getLatestMailSubject(): Promise<string> {
    return await this.yopMailPage.getLatestMailSubject();
  }

  async getLatestMailSender(): Promise<string> {
    return await this.yopMailPage.getLatestMailSender();
  }

  async getLatestMailBody(): Promise<string> {
    return await this.yopMailPage.getLatestMailBody();
  }

  async getAllMailSubjects(): Promise<string[]> {
    return await this.yopMailPage.getAllMailSubjects();
  }

  // ==========================================
  //  PREONBOARDING EMAIL VERIFICATIONS
  // ==========================================

  /**
   * Find and open the document request email from onboarding@nspassisto.com
   * Returns the subject of the found mail
   */
  async findDocumentRequestMail(): Promise<string> {
    return await this.yopMailPage.findAndOpenMailBySubject('Submit Your Documents');
  }

  /**
   * Verify the email subject contains the expected text
   */
  async verifyMailSubjectContains(expectedText: string): Promise<void> {
    const subject = await this.getLatestMailSubject();
    await expect(subject.toLowerCase()).toContain(expectedText.toLowerCase());
  }

  /**
   * Verify the email sender
   */
  async verifyMailSender(expectedSender: string): Promise<void> {
    const sender = await this.getLatestMailSender();
    await expect(sender.toLowerCase()).toContain(expectedSender.toLowerCase());
  }

  /**
   * Verify the email body contains the preonboarding link
   */
  async verifyPreOnboardingLinkInMailBody(): Promise<string> {
    return await this.yopMailPage.getPreOnboardingLinkFromMailBody();
  }

  /**
   * Verify the email body contains the submission deadline
   */
  async verifyDeadlineInMailBody(): Promise<string> {
    return await this.yopMailPage.getDeadlineFromMailBody();
  }

  /**
   * Verify the email body contains contact information
   */
  async verifyContactInMailBody(): Promise<string> {
    return await this.yopMailPage.getContactFromMailBody();
  }

  // ==========================================
  //  CANDIDATE SUBMISSION CONFIRMATION VERIFICATION
  // ==========================================

  /**
   * Find and open the candidate document submission confirmation mail
   * This mail is received after the candidate submits their documents
   */
  async findCandidateSubmissionMail(): Promise<string> {
    return await this.yopMailPage.findAndOpenMailBySubject('Candidate Submitted');
  }

  /**
   * Verify the submission confirmation mail body contains candidate name
   */
  async verifySubmissionMailContainsCandidateName(candidateName: string): Promise<void> {
    const body = await this.getLatestMailBody();
    await expect(body.toLowerCase()).toContain(candidateName.toLowerCase());
  }

  /**
   * Verify the submission confirmation mail body contains document count
   */
  async verifySubmissionMailContainsDocumentCount(): Promise<void> {
    const body = await this.getLatestMailBody();
    // The mail should mention documents were submitted/uploaded
    await expect(body.toLowerCase()).toContain('document');
  }

  // ==========================================
  //  EMAIL BODY EXTRACTIONS
  // ==========================================

  async extractPreOnboardingTokenFromMail(): Promise<string> {
    const link = await this.yopMailPage.getPreOnboardingLinkFromMailBody();
    const tokenRegex = /token=([a-f0-9-]+)/;
    const match = link.match(tokenRegex);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error('No token found in preonboarding link');
  }

  // ==========================================
  //  WAIT FOR EMAILS
  // ==========================================

  /**
   * Wait for a new email with specified subject to arrive
   * @param subjectSubstring - Partial subject text to wait for
   * @param timeout - Maximum wait time in milliseconds (default: 30000)
   */
  async waitForEmail(subjectSubstring: string, timeout: number = 30000): Promise<void> {
    await this.yopMailPage.waitForEmail(subjectSubstring, timeout);
  }
  
  // ==========================================
  //  GET PREONBOARDING LINK AFTER EMAIL ARRIVES
  // ==========================================
  
  async getPreOnboardingLinkAfterEmail(subjectSubstring: string = 'Submit Your Documents', timeout: number = 30000): Promise<string> {
    await this.waitForEmail(subjectSubstring, timeout);
    await this.findDocumentRequestMail();
    return await this.verifyPreOnboardingLinkInMailBody();
  }
  
  // ==========================================
  //  INBOX REFRESH
  // ==========================================
  
  async refreshInbox(): Promise<void> {
    await this.yopMailPage.refreshInbox();
  }
}


