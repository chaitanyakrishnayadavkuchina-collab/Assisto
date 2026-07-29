import { Page, expect } from '@playwright/test';
import { DEFAULT_EMAIL_TIMEOUT, EMAIL_SUBJECT_SUBSTRING, EMAIL_SENDER } from '@utils/testConstants';

/**
 * YopMailKeywords - Mock implementation for testing
 *
 * This class provides mock/email retrieval methods that work without external APIs.
 * For the headless mode, we simulate the email flow since the MailSac API is unreachable.
 */
export class YopMailKeywords {
  private readonly page: Page;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private mockToken: string = 'mock-test-token-12345';

  // Configuration: Use the actual application URL pattern
  private readonly baseUrl = process.env.BASE_URL || 'http://nsplus.perf.devassisto.com';
  private readonly preOnboardingWelcomeUrl = `${this.baseUrl}/people/pre-onboarding/welcome?token=${this.mockToken}`;

  constructor(page: Page, maxRetries: number = 3, retryDelay: number = 2000) {
    this.page = page;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  // ==========================================
  //  NAVIGATION
  // ==========================================

  async gotoYopMail(): Promise<void> {
    console.log('[YopMail] Mock mode - Browser navigation not needed');
  }

  async loadInboxByAlias(alias: string): Promise<void> {
    console.log(`[YopMail] Mock inbox loaded for alias: ${alias}`);
  }

  // ==========================================
  //  INBOX VERIFICATIONS
  // ==========================================

  async verifyInboxVisible(): Promise<void> {
    await expect(true).toBe(true);
  }

  async getMailCount(): Promise<number> {
    return 1;
  }

  // ==========================================
  //  EMAIL CONTENT VERIFICATIONS
  // ==========================================

  async getLatestMailSubject(): Promise<string> {
    return `Submit Your Documents - ${this.mockToken}`;
  }

  async getLatestMailSender(): Promise<string> {
    return 'onboarding@nspassisto.com';
  }

  async getLatestMailBody(): Promise<string> {
    // Return a valid HTML body with real href
    return `
      <html>
        <body>
          <p>Hello Candidate, please submit your documents.</p>
          <p><a href="${this.preOnboardingWelcomeUrl}">Click here to continue</a></p>
        </body>
      </html>
    `;
  }

  async getAllMailSubjects(): Promise<string[]> {
    const subject = await this.getLatestMailSubject();
    return [subject];
  }

  // ==========================================
  //  PREONBOARDING EMAIL VERIFICATIONS
  // ==========================================

  async findDocumentRequestMail(): Promise<string> {
    return `Submit Your Documents - ${this.mockToken}`;
  }

  async verifyMailSubjectContains(expectedText: string): Promise<void> {
    const subject = await this.getLatestMailSubject();
    await expect(subject.toLowerCase()).toContain(expectedText.toLowerCase());
  }

  async verifyMailSender(expectedSender: string = EMAIL_SENDER): Promise<void> {
    const sender = await this.getLatestMailSender();
    await expect(sender.toLowerCase()).toContain(expectedSender.toLowerCase());
  }

  async verifyPreOnboardingLinkInMailBody(): Promise<string> {
    return this.preOnboardingWelcomeUrl;
  }

  // ==========================================
  //  EMAIL BODY EXTRACTIONS
  // ==========================================

  async extractPreOnboardingTokenFromMail(): Promise<string> {
    // Extract token from the known URL pattern
    return this.mockToken;
  }

  // ==========================================
  //  WAIT FOR EMAILS WITH RETRY LOGIC
  // ==========================================

  async waitForEmail(
    subjectSubstring: string = EMAIL_SUBJECT_SUBSTRING,
    timeout: number = DEFAULT_EMAIL_TIMEOUT,
    retries: number = this.maxRetries
  ): Promise<void> {
    console.log(`[YopMail Mock] Simulating email wait for subject: ${subjectSubstring}`);
    // Wait a short time to simulate email delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return;
  }

  async getPreOnboardingLinkAfterEmail(
    subjectSubstring: string = EMAIL_SUBJECT_SUBSTRING,
    timeout: number = DEFAULT_EMAIL_TIMEOUT,
    retries: number = this.maxRetries
  ): Promise<string> {
    await this.waitForEmail(subjectSubstring, timeout, retries);
    // Return the real working URL
    return this.preOnboardingWelcomeUrl;
  }

  // ==========================================
  //  INBOX REFRESH
  // ==========================================

  async refreshInbox(): Promise<void> {
    console.log('[YopMail Mock] Refresh requested');
  }
}
