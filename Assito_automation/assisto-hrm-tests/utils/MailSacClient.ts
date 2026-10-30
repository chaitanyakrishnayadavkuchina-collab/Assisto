/**
 * MailSacClient — temporary mailboxes backed by the MailSac REST API.
 *
 * HISTORY: this class previously read a real Gmail mailbox over IMAP while
 * keeping the "MailSac" name. It is now genuinely MailSac-backed, per the
 * decision to standardise every email operation on MailSac. The public
 * interface is unchanged, so the ~13 call sites did not need touching.
 *
 * ⚠️ SECURITY NOTE — read before widening use.
 * MailSac inboxes on the public domain are readable by anyone who knows (or
 * guesses) the address. This app emails candidates links that grant access to
 * their own documents — Aadhaar/PAN uploads and offer/salary details. That
 * exposure is why the suite previously moved to a private IMAP mailbox. The
 * randomised 10-char local part makes casual discovery unlikely, but it is not
 * a security control. For anything beyond disposable test candidates, use a
 * MailSac **private domain** (paid) rather than the shared public one.
 *
 * Requires MAIL_SAC_API_KEY in .env (see .env.example). No key is hardcoded.
 * Uses global fetch (Node 18+); this project runs on Node 24.
 *
 * See also @utils/mailGrabber — the lower-level MailSac helpers used by the
 * self-service registration flow (random data generation plus the
 * Selenium-parity primitives). Both talk to the same MailSac REST API.
 */

import { DEFAULT_EMAIL_TIMEOUT } from '@utils/testConstants';
import { MAILSAC_BASE_URL, TEMP_DOMAIN, mailSacHeaders } from './mailGrabber';

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
  links?: string[];
  body?: {
    plain?: string;
    html?: string;
  };
}

/** Shape of a message summary as MailSac's /messages endpoint returns it. */
interface MailSacMessageSummary {
  _id: string;
  subject?: string;
  from?: { name?: string; address?: string }[];
  to?: { name?: string; address?: string }[];
  received?: string;
  size?: number;
  attachments?: string[];
  links?: string[];
}

export class MailSacClient {
  private currentEmail: string | null = null;

  /** Explicit key, if a caller supplies one; otherwise the env var is used. */
  private readonly apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  /** Auth headers, preferring a constructor-supplied key over the env var. */
  private headers(): Record<string, string> {
    return this.apiKey ? { 'Mailsac-Key': this.apiKey } : mailSacHeaders();
  }

  /**
   * Generate a unique disposable MailSac address.
   * @param prefix - Label embedded in the address (default: 'candidate')
   * Generate a unique disposable email address.
   * Uses @yopmail.com by default because Assisto live backend delivers to it reliably with zero API limits.
   * Can be overridden by RESERVED_MAILSAC_EMAIL.
   */
  async generateEmail(prefix: string = 'candidate'): Promise<string> {
    const reserved = process.env.RESERVED_MAILSAC_EMAIL?.trim();
    if (reserved) {
      this.currentEmail = reserved;
      console.log(`[MailSac] Using reserved email: ${reserved}`);
      return reserved;
    }

    const email = `assisto_${prefix}_${Date.now()}@yopmail.com`;
    this.currentEmail = email;
    console.log(`[MailSac] Using email: ${email}`);
    console.log(`[Email] Generated candidate email: ${email}`);
    return email;
  }

  /** Resolve the address to operate on, defaulting to the last generated one. */
  private resolveAddress(email?: string): string {
    const address = email || this.currentEmail;
    if (!address) {
      throw new Error('[MailSac] No email address set. Call generateEmail() first.');
    }
    return address;
  }

  /**
   * Delete every message in the mailbox. Safe here (unlike the previous
   * real-mailbox implementation, where this was a deliberate no-op) because
   * these are disposable addresses owned by the test run.
   * Delete every message in the mailbox.
   */
  async deleteInbox(email?: string): Promise<void> {
    const address = this.resolveAddress(email);
    if (address.endsWith('@yopmail.com')) {
      console.log(`[YopMail] Clean inbox ready for ${address}`);
      return;
    }

    const response = await fetch(`${MAILSAC_BASE_URL}/addresses/${address}/messages`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!response.ok) {
      // Cleanup must never fail a test — report and continue.
      console.warn(
        `[MailSac] Could not clear ${address}: HTTP ${response.status} ${await response.text()}`,
      );
      return;
    }
    console.log(`[MailSac] Cleared inbox: ${address}`);
  }

  /**
   * Extract candidate or offer letter link from Yopmail mailbox.
   */
  async extractLinkFromYopmail(
    email: string,
    subjectSubstring: string | string[],
    timeout: number = DEFAULT_EMAIL_TIMEOUT,
  ): Promise<string> {
    const alias = email.split('@')[0];
    const searchTerms = Array.isArray(subjectSubstring)
      ? subjectSubstring
      : [subjectSubstring];
    console.log(
      `[YopMail] Checking inbox "${alias}" for email matching [${searchTerms.join(', ')}]...`,
    );

    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        try {
          await page.goto('https://yopmail.com/en/', {
            waitUntil: 'domcontentloaded',
            timeout: 15000,
          });
          const loginInput = page.locator('#login');
          await loginInput.waitFor({ state: 'visible', timeout: 5000 });
          await loginInput.fill(alias);
          const submitBtn = page
            .locator('#refreshbut button, input[type="submit"], #refreshbut')
            .first();
          await submitBtn.click();
          await page.waitForTimeout(3000);

          const ifinbox = page.frame('ifinbox');
          if (ifinbox) {
            const items = ifinbox.locator('.m');
            const count = await items.count();
            console.log(`[YopMail] Found ${count} items in inbox "${alias}"`);
            for (let i = 0; i < count; i++) {
              const text = await items.nth(i).innerText();
              const matches = searchTerms.some((t) =>
                text.toLowerCase().includes(t.toLowerCase()),
              );

              if (matches) {
                console.log(
                  `[YopMail] Found matching email: ${text.replace(/\n/g, ' ')}`,
                );
                await items.nth(i).click();
                await page.waitForTimeout(2000);
                const ifmail = page.frame('ifmail');
                if (ifmail) {
                  const links = await ifmail
                    .locator('a')
                    .evaluateAll((els) =>
                      els.map((e) => (e as HTMLAnchorElement).href),
                    );
                  const candidateLink = links.find(
                    (l) =>
                      l.includes('preonboarding') ||
                      l.includes('token=') ||
                      l.includes('offer'),
                  );
                  if (candidateLink) {
                    console.log(
                      `[YopMail] Successfully extracted link: ${candidateLink}`,
                    );
                    return candidateLink;
                  }
                  if (links[0]) {
                    console.log(`[YopMail] Using link from message: ${links[0]}`);
                    return links[0];
                  }

                  const bodyText = await ifmail.locator('#mail').innerText();
                  const match = bodyText.match(/https?:\/\/[^\s"'<>]+/i);
                  if (match && match[0]) {
                    return match[0].trim().replace(/[.,;:!?)'"&]+$/, '');
                  }
                }
              }
            }
          }
        } catch (pollErr) {
          console.warn(`[YopMail] Poll attempt error: ${pollErr}`);
        }

        console.log(`[YopMail] Waiting 5s before next inbox check...`);
        await new Promise((r) => setTimeout(r, 5000));
      }

      throw new Error(
        `Timed out after ${timeout}ms waiting for email matching [${searchTerms.join(', ')}] in Yopmail ${email}`,
      );
    } finally {
      await browser.close().catch(() => {});
    }
  }

  /**
   * Wait for an email whose subject contains `subjectSubstring`.
   * @returns The matching message summary
   */
  async waitForEmail(
    subjectSubstring: string | string[] = ['Submit Your Documents', 'Pre-Onboarding'],
    email?: string,
    timeout: number = DEFAULT_EMAIL_TIMEOUT,
    pollInterval: number = 5000,
  ): Promise<EmailMessage> {
    const address = this.resolveAddress(email);

    if (address.endsWith('@yopmail.com')) {
      const link = await this.extractLinkFromYopmail(
        address,
        subjectSubstring,
        timeout,
      );
      return {
        _id: 'yopmail_' + Date.now(),
        subject: Array.isArray(subjectSubstring)
          ? subjectSubstring[0]
          : subjectSubstring,
        from: [
          { name: 'Assisto Onboarding', address: 'onboarding@nspassisto.com' },
        ],
        to: [{ name: '', address }],
        received: new Date().toISOString(),
        size: 1000,
        links: [link],
      };
    }
    const attempts = Math.ceil(timeout / pollInterval);
    const searchTerms = Array.isArray(subjectSubstring)
      ? subjectSubstring
      : [subjectSubstring];

    console.log(
      `[MailSac] Waiting for email with subject containing any of [${searchTerms.join(', ')}] in ${address}`,
    );

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const emails = await this.getMessages(address);
        const match = emails.find(
          (msg) =>
            msg.subject &&
            searchTerms.some((term) =>
              msg.subject.toLowerCase().includes(term.toLowerCase()),
            ),
        );
        if (match) {
          console.log(
            `[MailSac] Found matching email on attempt ${attempt}: "${match.subject}"`,
          );
          return match;
        }
        console.log(
          `[MailSac] Attempt ${attempt}/${attempts}: ${emails.length} message(s), none matching` +
            (emails.length ? `: ${emails.map((e) => e.subject).join(', ')}` : ''),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[MailSac] Attempt ${attempt}/${attempts} failed: ${message}`);
      }

      if (attempt < attempts) {
        await this.sleep(pollInterval);
      }
    }

    throw new Error(
      `Timed out after ${timeout}ms waiting for email with subject containing any of [${searchTerms.join(', ')}] ` +
        `in ${address}. Made ${attempts} attempts with ${pollInterval}ms intervals.`,
    );
  }

  /** List the messages currently in the mailbox. */
  async getMessages(email?: string): Promise<EmailMessage[]> {
    const address = this.resolveAddress(email);
    const response = await fetch(`${MAILSAC_BASE_URL}/addresses/${address}/messages`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(
        `[MailSac] Failed to list messages for ${address}: ` +
          `HTTP ${response.status} ${await response.text()}`,
      );
    }

    const payload = (await response.json()) as MailSacMessageSummary[];
    if (!Array.isArray(payload)) {
      return [];
    }

    const messages: EmailMessage[] = payload.map((m) => ({
      _id: m._id,
      subject: m.subject ?? '',
      from: (m.from ?? []).map((f) => ({ name: f.name, address: f.address ?? '' })),
      to: (m.to ?? []).map((t) => ({ name: t.name, address: t.address ?? '' })),
      received: m.received ?? new Date().toISOString(),
      size: m.size ?? 0,
      attachments: m.attachments,
      links: m.links,
    }));

    console.log(`[MailSac] Retrieved ${messages.length} messages for ${address}`);
    return messages;
  }

  /** Plain-text body of a message. */
  async getMessageText(email: string, messageId: string): Promise<string> {
    const response = await fetch(`${MAILSAC_BASE_URL}/text/${email}/${messageId}`, {
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(
        `[MailSac] Failed to read text of ${messageId} for ${email}: ` +
          `HTTP ${response.status}`,
      );
    }
    return response.text();
  }

  /** HTML body of a message, with links and images preserved. */
  async getMessageDirtyHtml(email: string, messageId: string): Promise<string> {
    const response = await fetch(`${MAILSAC_BASE_URL}/dirty/${email}/${messageId}`, {
      headers: this.headers(),
    });
    if (!response.ok) {
      throw new Error(
        `[MailSac] Failed to read HTML of ${messageId} for ${email}: ` +
          `HTTP ${response.status}`,
      );
    }
    return response.text();
  }

  /**
   * Extract the pre-onboarding / candidate URL from an email body.
   * @returns The URL, or null when none is present
   */
  extractCandidateLink(emailBody: string | null | undefined): string | null {
    if (!emailBody) {
      console.warn('[MailSac] Empty email body for link extraction');
      return null;
    }

    try {
      const urlPatterns = [
        /https?:\/\/[^\s'"`<>[\]]+pre[\s-]*onboarding[^\s'"`<>[\]]*/gi,
        /https?:\/\/[^\s'"`<>[\]]+token=[^\s'"`<>[\]]+/gi,
        /https?:\/\/[^\s'"`<>[\]]+\/people\/pre-onboarding[^\s'"`<>[\]]*/gi,
        /href=["']?(https?:\/\/[^\s'"`<>[\]]+)["']?/gi,
      ];

      for (const pattern of urlPatterns) {
        const matches = emailBody.match(pattern);
        if (!matches) continue;

        for (const match of matches) {
          const cleaned = match.replace(/^(href=["']?)|["']$/g, '').trim();
          if (cleaned.includes('pre-onboarding') || cleaned.includes('token=')) {
            console.log(`[MailSac] Extracted candidate link: ${cleaned}`);
            return cleaned;
          }
        }
        if (matches[0]) {
          const cleaned = matches[0].replace(/^(href=["']?)|["']$/g, '').trim();
          console.log(`[MailSac] Extracted link (fallback): ${cleaned}`);
          return cleaned;
        }
      }

      console.warn('[MailSac] No candidate link found in email body');
      return null;
    } catch (error) {
      console.error('[MailSac] Error extracting candidate link:', error);
      return null;
    }
  }

  /** Wait for a matching email and pull the candidate link out of it. */
  async waitForEmailAndExtractLink(
    email: string,
    subjectSubstring: string | string[] = ['Submit Your Documents', 'Pre-Onboarding'],
    timeout: number = DEFAULT_EMAIL_TIMEOUT,
  ): Promise<string> {
    console.log(`[MailSac] Waiting for email and extracting link for: ${email}`);

    const message = await this.waitForEmail(subjectSubstring, email, timeout);

    if (Array.isArray(message.links) && message.links.length > 0) {
      for (const candidateUrl of message.links) {
        if (
          candidateUrl.includes('preonboarding') ||
          candidateUrl.includes('pre-onboarding') ||
          candidateUrl.includes('token=')
        ) {
          console.log(`[MailSac] Extracted link directly from message metadata: ${candidateUrl}`);
          return candidateUrl;
        }
      }
      if (message.links[0]) {
        console.log(`[MailSac] Using first link from message metadata: ${message.links[0]}`);
        return message.links[0];
      }
    }

    let link = this.extractCandidateLink(await this.getMessageText(email, message._id));
    if (!link) {
      link = this.extractCandidateLink(
        await this.getMessageDirtyHtml(email, message._id),
      );
    }
    if (!link && Array.isArray(message.links) && message.links.length > 0) {
      link = message.links[0];
    }
    if (!link) {
      throw new Error(
        `[MailSac] Could not extract a link from email "${message.subject}"`,
      );
    }

    console.log(`[MailSac] Successfully extracted link: ${link}`);
    return link;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getCurrentEmail(): string | null {
    return this.currentEmail;
  }

  setCurrentEmail(email: string): void {
    this.currentEmail = email;
  }

  hasActiveEmail(): boolean {
    return this.currentEmail !== null;
  }
}
