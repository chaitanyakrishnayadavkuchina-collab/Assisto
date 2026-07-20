import { Page, Locator } from '@playwright/test';

/**
 * YopMailPage encapsulates all locators and atomic UI actions
 * for the YOP Mail (temporary email) web interface.
 *
 * YOP Mail (yopmail.com) is a free disposable email service used here
 * for testing the candidate pre-onboarding email flow.
 *
 * Reference: https://yopmail.com/wm
 */
export class YopMailPage {
  private readonly page: Page;

  /** YOP Mail welcome / alias input */
  private readonly yopMailAliasInput: Locator;
  /** Go button to load the inbox for the alias */
  private readonly goButton: Locator;
  /** Inbox container */
  private readonly inboxContainer: Locator;
  /** Mail list items */
  private readonly mailItem: Locator;
  /** Opened mail subject */
  private readonly mailSubject: Locator;
  /** Opened mail sender */
  private readonly mailSender: Locator;
  /** Opened mail body content */
  private readonly mailBody: Locator;
  /** Refresh button to reload inbox */
  private readonly refreshButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // YOP Mail page is not in an iframe - use page directly
    this.yopMailAliasInput = page.locator('#login').first();
    this.goButton = page.locator('input[type="submit"]').first();
    this.inboxContainer = page.locator('#inbox_body');
    this.mailItem = page.locator('#inbox_body li').or(page.locator('.mail-list .mail-item'));
    this.mailSubject = page.locator('#msg_subject').or(page.locator('.subject')).first();
    this.mailSender = page.locator('#msg_sender').or(page.locator('.sender')).first();
    this.mailBody = page.locator('#msg_body').or(page.locator('.message-body')).first();
    this.refreshButton = page.locator('input[value="Inbox"]').or(
      page.locator('a:has-text("Inbox")').first()
    );
  }

  /**
   * Navigate to YOP Mail web interface
   */
  async gotoYopMail(): Promise<void> {
    await this.page.goto('https://yopmail.com/wm', { waitUntil: 'networkidle', timeout: 45000 });
  }

  /**
   * Enter YOP mail alias and load inbox
   */
  async enterAliasAndLoad(alias: string): Promise<void> {
    // Wait for the input to be visible
    await this.yopMailAliasInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.yopMailAliasInput.fill(alias);
    
    // Wait for button to be visible and click
    await this.goButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.goButton.click();
    
    // Wait for inbox to load
    await this.page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  /**
   * Check if inbox is visible
   */
  async isInboxVisible(): Promise<boolean> {
    return await this.inboxContainer.isVisible();
  }

  /**
   * Get count of emails in inbox
   */
  async getMailCount(): Promise<number> {
    return await this.mailItem.count();
  }

  /**
   * Get latest email subject from inbox
   */
  async getLatestMailSubject(): Promise<string> {
    // Click the first mail item to open it
    await this.mailItem.first().click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.mailSubject.innerText();
  }

  /**
   * Get latest email sender from inbox
   */
  async getLatestMailSender(): Promise<string> {
    await this.mailItem.first().click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.mailSender.innerText();
  }

  /**
   * Get latest email body content from inbox
   */
  async getLatestMailBody(): Promise<string> {
    await this.mailItem.first().click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await this.mailBody.innerText();
  }

  /**
   * Get all email subjects in the inbox
   */
  async getAllMailSubjects(): Promise<string[]> {
    const subjects: string[] = [];
    const count = await this.mailItem.count();
    for (let i = 0; i < count; i++) {
      await this.mailItem.nth(i).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      subjects.push(await this.mailSubject.innerText());
    }
    return subjects;
  }

  /**
   * Find and open mail by subject text (partial match)
   */
  async findAndOpenMailBySubject(subjectSubstring: string): Promise<string> {
    const count = await this.mailItem.count();
    for (let i = 0; i < count; i++) {
      await this.mailItem.nth(i).click();
      await new Promise(resolve => setTimeout(resolve, 500));
      const subject = await this.mailSubject.innerText();
      if (subject.toLowerCase().includes(subjectSubstring.toLowerCase())) {
        return subject;
      }
    }
    throw new Error(`No mail found with subject containing "${subjectSubstring}"`);
  }

  /**
   * Get the preonboarding link from the email body
   */
  async getPreOnboardingLinkFromMailBody(): Promise<string> {
    const body = await this.mailBody.innerText();
    // More flexible regex to capture URLs with query parameters, encoded chars, and HTML context
    const linkRegex = /https?:\/\/[^\s"'<>]+\/preonboarding\/candidate[^\s"'<>]*/i;
    const match = body.match(linkRegex);
    if (match && match[0]) {
      // Clean up any trailing punctuation or HTML entities
      let link = match[0].trim().replace(/[.,;:!?)'"&]+$/, '');
      // Decode HTML entities if present
      link = link.replace(/&/g, '&').replace(/"/g, '"').replace(/'/g, "'");
      return link;
    }
    throw new Error('No preonboarding link found in email body');
  }

  /**
   * Get the submission deadline from the email body
   */
  async getDeadlineFromMailBody(): Promise<string> {
    const body = await this.mailBody.innerText();
    const deadlineRegex = /Deadline:\s*([\d-]+)/;
    const match = body.match(deadlineRegex);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error('No deadline found in email body');
  }

  /**
   * Get contact number from the email body
   */
  async getContactFromMailBody(): Promise<string> {
    const body = await this.mailBody.innerText();
    const contactRegex = /Contact for Queries:\s*([^-\n]+)/;
    const match = body.match(contactRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    throw new Error('No contact info found in email body');
  }

  /**
   * Refresh inbox
   */
  async refreshInbox(): Promise<void> {
    // Use page directly - YOP Mail is not in an iframe
    const refreshBtn = this.page.locator('input[value="Inbox"]').or(
      this.page.locator('a:has-text("Inbox")').first()
    );
    await refreshBtn.waitFor({ state: 'visible', timeout: 10000 });
    await refreshBtn.click();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Wait for a new email to arrive in the inbox
   * @param subjectSubstring - Partial subject text to wait for
   * @param timeout - Maximum wait time in milliseconds (default: 30000)
   */
  async waitForEmail(subjectSubstring: string, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    let previousCount = 0;
    
    while (Date.now() - startTime < timeout) {
      await this.refreshInbox();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait longer for YOP Mail to refresh
      
      const count = await this.mailItem.count();
      // Only proceed if we see new emails (count changed)
      if (count > previousCount) {
        previousCount = count;
        // Check all mail items without clicking (YOP Mail shows subjects in list)
        for (let i = 0; i < count; i++) {
          const subjectElement = this.mailItem.nth(i).locator('.subject, #msg_subject');
          if (await subjectElement.count() > 0) {
            const subject = await subjectElement.first().innerText();
            if (subject.toLowerCase().includes(subjectSubstring.toLowerCase())) {
              // Open the email by clicking the mail item
              await this.mailItem.nth(i).click();
              await new Promise(resolve => setTimeout(resolve, 1000));
              return;
            }
          }
        }
      }
      previousCount = count;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(
      `Timed out after ${timeout}ms waiting for email with subject containing "${subjectSubstring}"`
    );
  }
}


