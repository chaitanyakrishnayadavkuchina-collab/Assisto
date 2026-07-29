/**
 * MailSacClient provides methods to interact with the MailSac API for
 * generating temporary email addresses and retrieving messages during testing.
 *
 * MailSac API Reference:
 * Base URL: https://mailsac.com/api/
 * Documentation: https://docs.mailsac.com
 *
 * Auth: Use header "Mailsac-Key: <your-api-key>"
 * List messages: GET /api/addresses/{email}/messages
 * Read text: GET /api/text/{email}/{messageId}
 * Read dirty HTML: GET /api/dirty/{email}/{messageId}
 * Delete messages: DELETE /api/addresses/{email}/messages
 */

import { DEFAULT_EMAIL_TIMEOUT, DEFAULT_RETRY_COUNT } from '@utils/testConstants';

interface EmailRecipient {
  name?: string;
  address: string;
}

interface EmailMessage {
  _id: string;
  subject: string;
  from: { name?: string; address: string }[];
  to: EmailRecipient[];
  cc?: EmailRecipient[] | null;
  bcc?: EmailRecipient[] | null;
  received: string;
  size: number;
  attachments?: string[];
  body?: {
    plain?: string;
    html?: string;
  };
}

interface EmailBody {
  text?: string;
  html?: string;
}

/**
 * MailSacClient - A wrapper for MailSac API interactions
 */
export class MailSacClient {

  private readonly apiKey: string;
  private readonly baseUrl = 'https://mailsac.com';
  private currentEmail: string | null = null;

  /**
   * Initialize MailSacClient
   * @param apiKey - MailSac API key from environment variables
   */
  constructor(apiKey: string = process.env.MAIL_SAC_API_KEY || '') {
    this.apiKey = apiKey;
  }

  /**
   * Generate a unique random email address on mailsac.com
   * @param prefix - Optional prefix for the email (default: 'candidate')
   * @returns Email address in the format prefix_timestamp@mailsac.com
   */
  async generateEmail(prefix: string = 'candidate'): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const email = `${prefix}_${timestamp}_${random}@mailsac.com`;
    this.currentEmail = email;
    console.log(`[MailSac] Generated email: ${email}`);
    return email;
  }

  /**
   * Delete all messages in an inbox
   * @param email - The email address to clean (optional, defaults to current)
   */
  async deleteInbox(email?: string): Promise<void> {
    const emailAddress = email || this.currentEmail;

    if (!emailAddress) {
      console.log('[MailSac] No email to delete');
      return;
    }

    try {
      await this.makeApiRequest(`/api/addresses/${emailAddress}/messages`, 'DELETE');
      console.log(`[MailSac] Deleted inbox for: ${emailAddress}`);
    } catch (error) {
      console.error(`[MailSac] Error deleting inbox for ${emailAddress}:`, error);
    }
  }

  /**
   * Wait for an email to arrive with retry logic
   * @param subjectSubstring - Subject text to wait for
   * @param email - Email address to check (optional, defaults to current)
   * @param timeout - Maximum wait time in milliseconds (default: 120000)
   * @param pollInterval - Time between polls in milliseconds (default: 5000)
   * @returns The matching EmailMessage
   */
  async waitForEmail(
    subjectSubstring: string = 'Submit Your Documents',
    email?: string,
    timeout: number = DEFAULT_EMAIL_TIMEOUT,
    pollInterval: number = 5000
  ): Promise<EmailMessage> {
    const emailAddress = email || this.currentEmail;
    if (!emailAddress) {
      throw new Error('[MailSac] No email address set. Call generateEmail() first.');
    }

    const startTime = Date.now();
    const attempts = Math.ceil(timeout / pollInterval);

    console.log(`[MailSac] Waiting for email with subject containing "${subjectSubstring}" in ${emailAddress}`);

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const emails = await this.getMessages(emailAddress);

        if (emails.length > 0) {
          const matchingEmail = emails.find(msg =>
            msg.subject && msg.subject.toLowerCase().includes(subjectSubstring.toLowerCase())
          );

          if (matchingEmail) {
            console.log(`[MailSac] Found matching email on attempt ${attempt}: "${matchingEmail.subject}"`);
            return matchingEmail;
          }

          console.log(`[MailSac] Attempt ${attempt}/${attempts}: No matching email (found ${emails.length} total):`,
            emails.map(e => e.subject).join(', '));
        } else {
          console.log(`[MailSac] Attempt ${attempt}/${attempts}: No emails in inbox yet`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[MailSac] Attempt ${attempt}/${attempts} failed:`, errorMessage);
      }

      if (attempt < attempts) {
        await this.sleep(pollInterval);
      }
    }

    throw new Error(
      `Timed out after ${timeout}ms waiting for email with subject containing "${subjectSubstring}" ` +
      `in ${emailAddress}. Made ${attempts} attempts with ${pollInterval}ms intervals.`
    );
  }

  /**
   * Retrieve messages from an inbox
   * @param email - Email address to check (optional, defaults to current)
   * @returns Array of email messages
   */
  async getMessages(email?: string): Promise<EmailMessage[]> {
    const emailAddress = email || this.currentEmail;

    if (!emailAddress) {
      throw new Error('[MailSac] No email address set. Call generateEmail() first.');
    }

    try {
      const response = await this.makeApiRequest(
        `/api/addresses/${emailAddress}/messages`,
        'GET'
      );

      if (Array.isArray(response)) {
        const emails: EmailMessage[] = response.map((msg: any) => ({
          _id: msg._id,
          subject: msg.subject,
          from: msg.from || [],
          to: msg.to || [],
          cc: msg.cc,
          bcc: msg.bcc,
          received: msg.received,
          size: msg.size,
          attachments: msg.attachments,
        }));

        console.log(`[MailSac] Retrieved ${emails.length} messages from ${emailAddress}`);
        return emails;
      }

      console.log('[MailSac] No messages found in inbox');
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[MailSac] Error fetching messages:', errorMessage);

      if (errorMessage.includes('404')) {
        return [];
      }

      throw error;
    }
  }

  /**
   * Read the plain text body of a specific email message
   * @param email - Email address
   * @param messageId - Message ID from getMessages()
   * @returns Plain text body
   */
  async getMessageText(email: string, messageId: string): Promise<string> {
    try {
      const response = await this.makeApiRequest(
        `/api/text/${email}/${messageId}`,
        'GET'
      );
      return typeof response === 'string' ? response : JSON.stringify(response);
    } catch (error) {
      console.error(`[MailSac] Error reading message text:`, error);
      return '';
    }
  }

  /**
   * Read the dirty HTML body of a specific email message (links/images preserved)
   * @param email - Email address
   * @param messageId - Message ID from getMessages()
   * @returns HTML body
   */
  async getMessageDirtyHtml(email: string, messageId: string): Promise<string> {
    try {
      const response = await this.makeApiRequest(
        `/api/dirty/${email}/${messageId}`,
        'GET'
      );
      return typeof response === 'string' ? response : JSON.stringify(response);
    } catch (error) {
      console.error(`[MailSac] Error reading dirty HTML:`, error);
      return '';
    }
  }

  /**
   * Extract the pre-onboarding URL from an email body
   * @param emailBody - The email body (plain text or HTML)
   * @returns The pre-onboarding URL or null
   */
  extractCandidateLink(emailBody: string | null | undefined): string | null {
    if (!emailBody) {
      console.warn('[MailSac] Empty email body for link extraction');
      return null;
    }

    try {
      const urlPatterns = [
        /https?:\/\/[^\s'"`<>\[\]]+pre[\s-]*onboarding[^\s'"`<>\[\]]*/gi,
        /https?:\/\/[^\s'"`<>\[\]]+token=[^\s'"`<>\[\]]+/gi,
        /https?:\/\/[^\s'"`<>\[\]]+\/people\/pre-onboarding[^\s'"`<>\[\]]*/gi,
        /href=["']?(https?:\/\/[^\s'"`<>\[\]]+)["']?/gi,
      ];
      
      for (const pattern of urlPatterns) {
        const matches = emailBody.match(pattern);
        
        if (matches) {
          for (const match of matches) {
            const cleaned = match.replace(/^(href=["']?)|["']$/g, '').trim();
            if (cleaned.includes('pre-onboarding') || cleaned.includes('token=')) {
              console.log(`[MailSac] Extracted candidate pre-onboarding link: ${cleaned}`);
              return cleaned;
            }
          }
          if (matches[0]) {
            const cleaned = matches[0].replace(/^(href=["']?)|["']$/g, '').trim();
            console.log(`[MailSac] Extracted link (fallback): ${cleaned}`);
            return cleaned;
          }
        }
      }

      console.warn('[MailSac] Pre-onboarding link not found in email body');
      return null;
    } catch (error) {
      console.error('[MailSac] Error extracting candidate link:', error);
      return null;
    }
  }

  /**
   * Wait for email and extract the pre-onboarding link in one call
   * @param email - Email address to check
   * @param subjectSubstring - Subject to wait for
   * @param timeout - Max wait time in ms
   * @returns The extracted pre-onboarding URL
   */
  async waitForEmailAndExtractLink(
    email: string,
    subjectSubstring: string = 'Submit Your Documents',
    timeout: number = DEFAULT_EMAIL_TIMEOUT
  ): Promise<string> {
    console.log(`[MailSac] Waiting for email and extracting link for: ${email}`);

    const emailMessage = await this.waitForEmail(subjectSubstring, email, timeout);

    const plainBody = await this.getMessageText(email, emailMessage._id);
    let link = this.extractCandidateLink(plainBody);

    if (!link) {
      const htmlBody = await this.getMessageDirtyHtml(email, emailMessage._id);
      link = this.extractCandidateLink(htmlBody);
    }

    if (!link) {
      throw new Error(`[MailSac] Could not extract pre-onboarding link from email "${emailMessage.subject}"`);
    }

    console.log(`[MailSac] Successfully extracted pre-onboarding link: ${link}`);
    return link;
  }

  /**
   * Make a generic API request to MailSac
   * @param endpoint - API endpoint path
   * @param method - HTTP method
   * @param body - Request body (optional)
   * @returns Response data or null
   */
  private async makeApiRequest(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<any | null> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Mailsac-Key': this.apiKey,
      'Accept': 'application/json',
    };

    if (body && method !== 'GET' && method !== 'DELETE') {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET' && method !== 'DELETE') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 204 || response.status === 205) {
        return null;
      }

      if (response.status === 404) {
        throw new Error('404');
      }

      const errorBody = await response.text();
      throw new Error(`MailSac API error: ${response.status} - ${errorBody}`);
    }

    if (response.status === 204 || response.status === 205) {
      return null;
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current email address
   */
  getCurrentEmail(): string | null {
    return this.currentEmail;
  }

  /**
   * Set the current email address (for using pre-generated emails)
   */
  setCurrentEmail(email: string): void {
    this.currentEmail = email;
  }

  /**
   * Check if the client has an active email session
   */
  hasActiveEmail(): boolean {
    return this.currentEmail !== null;
  }
}
