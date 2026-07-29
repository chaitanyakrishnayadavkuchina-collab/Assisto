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
  /** Alternate domain link/button */
  private readonly alternateDomainLink: Locator;

  constructor(page: Page) {
    this.page = page;
  
    // YOP Mail page is not in an iframe - use page directly
    this.yopMailAliasInput = page.locator('input[placeholder*="inbox"], input[placeholder*="Enter your inbox"], input[id="login"], input[type="text"]').first();
    // Use multiple strategies for the Go button - it might be an icon button with no text
    this.goButton = page.locator('input[type="submit"], button:has-text("Go"), button:has-text("Inbox"), input[value="Inbox"], button:has-text("View Inbox"), button[aria-label*="View Inbox"], button:has-text(""), button:has-text("↻"), button[aria-label*="Submit"], button[aria-label*="Search"]').first();
    this.inboxContainer = page.locator('#inbox_body, [class*="inbox"], div[role="main"]').first();
    this.mailItem = page.locator('#inbox_body li, .mail-list .mail-item, [class*="mail-item"], [class*="mail-row"], li[class*="mail"], li[role="button"], div[role="button"], .mail-item');
    this.mailSubject = page.locator('#msg_subject, .subject, [class*="subject"], [data-testid="subject"], [class*="Subject"], [class*="SubjectName"], .mail-subject, .mail-subject-name').first();
    this.mailSender = page.locator('#msg_sender, .sender, [class*="sender"], [data-testid="sender"], [class*="Sender"], [class*="SenderName"], .mail-sender, [class*="SenderName"]').first();
    this.mailBody = page.locator('#msg_body, .message-body, [class*="message-body"], [data-testid="body"], [class*="Body"], .mail-body, [class*="MessageBody"], .mail-message-body').first();
    this.refreshButton = page.locator('input[value="Inbox"], a:has-text("Inbox"), button:has-text("Inbox"), [class*="Inbox"], button:has-text("Refresh"), a:has-text("Refresh"), button[aria-label*="Refresh"], a:has-text(""), a:has-text("↻")');
    // Alternate domain link/button
    this.alternateDomainLink = page.locator('a:has-text("Alternate domain"), a:has-text("Alternate Domains"), button:has-text("Alternate domain"), button[aria-label*="Alternate"]');
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
    
    // Strategy 1: Try force fill (bypass readonly attribute)
    try {
      await this.yopMailAliasInput.fill(alias, { force: true });
      console.log('[YOP Mail] Alias filled with force=true');
    } catch (error) {
      // Strategy 2: Use JavaScript evaluation to set value directly and dispatch events
      console.warn('[YOP Mail] Force fill failed, using JavaScript eval:', error);
      await this.page.evaluate((alias) => {
        const input = document.querySelector('input[placeholder*="inbox"], input[placeholder*="Enter your inbox"], input[id="login"], input[type="text"]');
        if (input) {
          const htmlInput = input as HTMLInputElement;
          htmlInput.value = alias;
          htmlInput.dispatchEvent(new Event('input', { bubbles: true }));
          htmlInput.dispatchEvent(new Event('change', { bubbles: true }));
          // For readonly inputs, we might need to remove the attribute
          if (htmlInput.readOnly) {
            htmlInput.removeAttribute('readonly');
          }
        }
      }, alias);
      console.log('[YOP Mail] Value set via JavaScript evaluation');
    }

    // Submit the form using multiple strategies
    let submitted = false;
    
    // Strategy 1: Click the Go button (most reliable)
    try {
      const goButton = this.page.locator('input[type="submit"], button:has-text("Go"), button:has-text("Inbox"), input[value="Inbox"], button:has-text("View Inbox"), button[aria-label*="View Inbox"], button:has-text(""), button:has-text("↻"), button[aria-label*="Submit"], button[aria-label*="Search"]').first();
      await goButton.waitFor({ state: 'visible', timeout: 5000 });
      await goButton.scrollIntoViewIfNeeded();
      await new Promise(resolve => setTimeout(resolve, 300));
      await goButton.click({ force: true, timeout: 3000 });
      submitted = true;
      console.log('[YOP Mail] Form submitted via Go button click');
    } catch (error) {
      console.warn('[YOP Mail] Go button click failed:', error);
    }
    
    // Strategy 2: Try pressing Enter
    if (!submitted) {
      try {
        await this.page.keyboard.press('Enter');
        submitted = true;
        console.log('[YOP Mail] Form submitted via Enter key');
      } catch (error) {
        console.warn('[YOP Mail] Enter key submission failed:', error);
      }
    }
    
    // Strategy 3: Submit form via JavaScript
    if (!submitted) {
      try {
        await this.page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            form.submit();
          }
        });
        submitted = true;
        console.log('[YOP Mail] Form submitted via JavaScript');
      } catch (error) {
        console.warn('[YOP Mail] JavaScript submit failed:', error);
      }
    }
    
    if (!submitted) {
      throw new Error('Failed to submit YOP Mail form after multiple attempts');
    }
    
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
   * Switch to alternate domain if current domain is blocking emails
   * This addresses the issue where YOP Mail warns "Some websites block disposable email addresses"
   */
  async switchToAlternateDomain(): Promise<void> {
    console.log('[YOP Mail] Attempting to switch to alternate domain...');
    
    // Check if alternate domain link is visible
    try {
      await this.alternateDomainLink.waitFor({ state: 'visible', timeout: 5000 });
      await this.alternateDomainLink.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Look for a dropdown or input to select a domain
      const domainInput = this.page.locator('input[placeholder*="domain"], input[placeholder*="alternate"]');
      if (await domainInput.count() > 0) {
        await domainInput.waitFor({ state: 'visible', timeout: 5000 });
        // Try to enter an alternate domain or select from dropdown
        await domainInput.fill('yopmail.com'); // Use a known alternate
        await this.page.keyboard.press('Enter');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('[YOP Mail] Attempted alternate domain selection');
      } else {
        // If no input found, try to select from a dropdown
        const domainSelect = this.page.locator('select');
        if (await domainSelect.count() > 0) {
          await domainSelect.waitFor({ state: 'visible', timeout: 5000 });
          // Select first option
          await domainSelect.first().locator('option').first().click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Look for a confirm/switch button
      const confirmButton = this.page.locator('button:has-text("Switch"), button:has-text("OK"), button:has-text("Go"), button:has-text("Confirm")').first();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('[YOP Mail] Switched to alternate domain successfully');
      }
    } catch (error) {
      console.warn('[YOP Mail] Failed to switch to alternate domain:', error);
    }
  }

  /**
   * Check if YOP Mail is blocking emails from the sender
   * Returns true if the page shows a warning about blocked emails
   */
  async isEmailBlocked(): Promise<boolean> {
    // Get all paragraph text
    const paragraphs = await this.page.locator('p').allTextContents();
    const fullText = paragraphs.join(' ').toLowerCase();
    
    const warningTexts = [
      'some websites block disposable email addresses',
      'web sites block disposable email addresses',
      'this inbox is empty',
      'the messages you receive will be displayed here'
    ];
    
    return warningTexts.some(text => fullText.includes(text));
  }

  /**
   * Wait for a new email to arrive in the inbox
   * @param subjectSubstring - Partial subject text to wait for
   * @param timeout - Maximum wait time in milliseconds (default: 30000)
   */
  async waitForEmail(subjectSubstring: string, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    let previousCount = 0;
    let emailFound = false;
    
    console.log(`[YOP Mail] Waiting for email with subject containing: "${subjectSubstring}"`);
    
    // Check if emails are being blocked
    const blocked = await this.isEmailBlocked();
    if (blocked) {
      console.warn('[YOP Mail] WARNING: YOP Mail indicates emails may be blocked!');
      console.warn('[YOP Mail] Attempting to switch to alternate domain...');
      await this.switchToAlternateDomain();
      await this.refreshInbox();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    while (Date.now() - startTime < timeout) {
      await this.refreshInbox();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for YOP Mail to refresh
      
      const count = await this.mailItem.count();
      console.log(`[YOP Mail] Inbox refresh - Email count: ${count} (previous: ${previousCount})`);
      
      // Check ALL emails, not just when count changes
      for (let i = 0; i < count; i++) {
        const mailItem = this.mailItem.nth(i);
        const subjectElement = mailItem.locator('.subject, #msg_subject, [class*="subject"]');
        
        if (await subjectElement.count() > 0) {
          try {
            const subject = await subjectElement.first().innerText();
            console.log(`[YOP Mail] Checking email #${i}: "${subject}"`);
            
            if (subject.toLowerCase().includes(subjectSubstring.toLowerCase())) {
              console.log(`[YOP Mail] Found matching email! Opening...`);
              await mailItem.click();
              await new Promise(resolve => setTimeout(resolve, 1000));
              emailFound = true;
              break;
            }
          } catch (error) {
            console.warn(`[YOP Mail] Error reading subject for email #${i}:`, error);
          }
        }
      }
      
      if (emailFound) {
        return;
      }
      
      previousCount = count;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Log all subjects found for debugging
    const allCount = await this.mailItem.count();
    const allSubjects = [];
    for (let i = 0; i < allCount; i++) {
      const subjectElement = this.mailItem.nth(i).locator('.subject, #msg_subject, [class*="subject"]');
      if (await subjectElement.count() > 0) {
        try {
          allSubjects.push(await subjectElement.first().innerText());
        } catch (error) {
          // Ignore errors
        }
      }
    }
    console.error(`[YOP Mail] Email not found. All subjects in inbox:`, allSubjects);
    
    // Check again if blocked after timeout
    const stillBlocked = await this.isEmailBlocked();
    if (stillBlocked) {
      console.error('[YOP Mail] FINAL WARNING: Emails appear to be blocked from this sender.');
      console.error('[YOP Mail] Consider using an alternate domain or a different email service for testing.');
    }
    
    throw new Error(
      `Timed out after ${timeout}ms waiting for email with subject containing "${subjectSubstring}". ` +
      `Found ${allSubjects.length} emails but none matched.` +
      (stillBlocked ? ' YOP Mail may be blocking the sender.' : '')
    );
  }
}


