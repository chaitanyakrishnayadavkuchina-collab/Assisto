/**
 * mailGrabber - MailSac-backed temporary mailbox utility.
 *
 * TypeScript equivalent of the Selenium framework's `utils/mail_grabber.py`,
 * used by the self-service registration ("Start Free Trial") flow where the
 * product emails a one-time verification link to a brand-new, never-seen
 * address. A disposable MailSac address is the right fit there: the mailbox
 * must not exist before the test and carries nothing but the verification
 * token.
 *
 * NOTE: this is deliberately separate from `@utils/MailSacClient`, which
 * despite its name is now backed by a real IMAP mailbox and serves the
 * candidate pre-onboarding flows (those emails carry links to real candidate
 * documents, so they must not land in a public disposable inbox). Do not
 * merge the two.
 *
 * Requires MAIL_SAC_API_KEY in .env (see .env.example). The key is never
 * hardcoded here.
 *
 * Uses the global `fetch` (Node 18+); the project runs on Node 24.
 */

import { getEnvVar } from './helpers';

/** MailSac REST base URL */
export const MAILSAC_BASE_URL = 'https://mailsac.com/api';

/** Disposable domain used for generated addresses */
export const TEMP_DOMAIN = '@mailsac.com';

const ADDRESS_PATH = '/addresses';
const VALIDATIONS_PATH = '/validations';
const MESSAGES_PATH = '/messages';
const TEXT_PATH = '/text';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Verification link parts extracted from a registration email, matching the
 * Python pattern:
 *   (https?)://([a-z0-9]+)\.?(.+)?\.devassisto\.com/verify\?token=([\w-]+)
 */
export interface VerificationLink {
  /** e.g. "https" */
  protocol: string;
  /** the tenant sub-domain, e.g. "yytnthoufs" */
  domain: string;
  /** the verification token */
  token: string;
  /** the full verification URL */
  url: string;
}

const VERIFICATION_URL_PATTERN =
  /(https?):\/\/([a-z0-9]+)\.?([^\s/]+)?\.devassisto\.com\/verify\?token=([\w-]+)/i;

/** MailSac message summary (only the fields this utility relies on) */
interface MailSacMessage {
  _id: string;
  subject?: string;
}

/** Build the MailSac auth headers from the environment. Shared with MailSacClient. */
export function mailSacHeaders(): Record<string, string> {
  return { 'Mailsac-Key': getEnvVar('MAIL_SAC_API_KEY') };
}

/** Pick `length` characters at random from `pool` */
function pick(pool: string, length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += pool.charAt(Math.floor(Math.random() * pool.length));
  }
  return result;
}

/** Random uppercase-alphabetic string (default length 10) */
export function randomStringUpperCase(length: number = 10): string {
  return pick(UPPERCASE, length);
}

/** Random lowercase-alphabetic string (default length 10) */
export function randomString(length: number = 10): string {
  return pick(LOWERCASE, length);
}

/**
 * Random numeric string whose first digit is 6-9 (valid Indian mobile prefix).
 * @param length - Number of digits (default 10, minimum 1)
 */
export function randomNum(length: number = 10): string {
  if (length < 1) {
    throw new Error('[mailGrabber] randomNum length must be at least 1');
  }
  const firstDigit = String(6 + Math.floor(Math.random() * 4));
  return firstDigit + pick('0123456789', length - 1);
}

/** Random disposable address, e.g. "abcdefghij742@mailsac.com" */
export function randomEmail(): string {
  return `${randomString(10)}${randomNum(3)}${TEMP_DOMAIN}`;
}

/**
 * Create/claim the temporary mailbox and assert MailSac recognises it as a
 * disposable address.
 * @param email - Address returned by {@link randomEmail}
 */
export async function generateTempEmail(email: string): Promise<void> {
  const headers = mailSacHeaders();

  const addressResponse = await fetch(`${MAILSAC_BASE_URL}${ADDRESS_PATH}/${email}`, {
    headers,
  });
  if (!addressResponse.ok) {
    throw new Error(
      `[mailGrabber] Failed to create mailbox ${email}: ` +
        `HTTP ${addressResponse.status} ${await addressResponse.text()}`,
    );
  }

  const validationResponse = await fetch(
    `${MAILSAC_BASE_URL}${VALIDATIONS_PATH}${ADDRESS_PATH}/${email}`,
    { headers },
  );
  if (!validationResponse.ok) {
    throw new Error(
      `[mailGrabber] Failed to validate mailbox ${email}: ` +
        `HTTP ${validationResponse.status} ${await validationResponse.text()}`,
    );
  }

  const validation = (await validationResponse.json()) as {
    isDisposable?: boolean;
  };
  if (validation.isDisposable !== true) {
    throw new Error(
      `[mailGrabber] ${email} is not reported as a disposable address`,
    );
  }

  console.log(`[mailGrabber] Temporary mailbox ready: ${email}`);
}

/**
 * Read the plain-text body of the most recent message in the mailbox.
 * @param email - Mailbox address
 * @returns The email body, or null when the mailbox is empty
 */
export async function readEmail(email: string): Promise<string | null> {
  const headers = mailSacHeaders();

  const messagesResponse = await fetch(
    `${MAILSAC_BASE_URL}${ADDRESS_PATH}/${email}${MESSAGES_PATH}`,
    { headers },
  );
  if (!messagesResponse.ok) {
    throw new Error(
      `[mailGrabber] Failed to list messages for ${email}: ` +
        `HTTP ${messagesResponse.status} ${await messagesResponse.text()}`,
    );
  }

  const messages = (await messagesResponse.json()) as MailSacMessage[];
  if (!Array.isArray(messages) || messages.length === 0) {
    console.log(`[mailGrabber] No mails in the mailbox ${email}`);
    return null;
  }

  const messageId = messages[0]._id;
  const textResponse = await fetch(
    `${MAILSAC_BASE_URL}${TEXT_PATH}/${email}/${messageId}`,
    { headers },
  );
  if (!textResponse.ok) {
    throw new Error(
      `[mailGrabber] Failed to read message ${messageId} for ${email}: ` +
        `HTTP ${textResponse.status} ${await textResponse.text()}`,
    );
  }

  return textResponse.text();
}

/**
 * Poll the mailbox until a message containing a verification link arrives.
 *
 * Replaces the Python implementation's fixed `time.sleep(10)` — polling means
 * a fast delivery is picked up immediately and a slow one still succeeds.
 *
 * @param email - Mailbox address
 * @param timeout - Maximum wait in ms (default 120000)
 * @param pollInterval - Delay between polls in ms (default 5000)
 */
export async function waitForRegistrationEmail(
  email: string,
  timeout: number = 120000,
  pollInterval: number = 5000,
): Promise<string> {
  const deadline = Date.now() + timeout;
  let attempt = 0;
  let lastBody: string | null = null;

  while (Date.now() < deadline) {
    attempt++;
    try {
      lastBody = await readEmail(email);
      if (lastBody && VERIFICATION_URL_PATTERN.test(lastBody)) {
        console.log(
          `[mailGrabber] Registration email received on attempt ${attempt}`,
        );
        return lastBody;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[mailGrabber] Attempt ${attempt} failed: ${message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(
    `[mailGrabber] Timed out after ${timeout}ms waiting for a registration email ` +
      `with a verification link in ${email}` +
      (lastBody
        ? ` (last body did not match the verify-link pattern)`
        : ' (mailbox stayed empty)'),
  );
}

/**
 * Extract protocol / tenant domain / token / full URL from an email body.
 * @throws when the body contains no verification link
 */
export function extractVerificationLink(emailBody: string): VerificationLink {
  const match = VERIFICATION_URL_PATTERN.exec(emailBody);
  if (!match) {
    throw new Error(
      '[mailGrabber] No verification link found in the email body',
    );
  }

  const link: VerificationLink = {
    protocol: match[1],
    domain: match[2],
    token: match[4],
    url: match[0],
  };
  console.log(`[mailGrabber] Verification link: ${link.url}`);
  return link;
}

// ============================================================
// Mailbox provider selection
// ============================================================

/**
 * A mailbox the registration flow can register with and later read.
 *
 * Always a MailSac disposable address — every email operation in this suite is
 * standardised on MailSac. A `REGISTRATION_MAIL_PROVIDER` switch used to select
 * an `imap` alternative back when MailSacClient was Gmail-backed; it is gone
 * now that MailSacClient talks to MailSac too, since it would only have chosen
 * between two identical paths.
 *
 * Relevant constraint: the Assisto trial signup rejects gmail/yahoo/outlook
 * addresses ("yahoo, gmail and outlook emails are not allowed"), so a
 * disposable MailSac address is the only workable option for this flow.
 */
export interface RegistrationMailbox {
  /** The address to register with */
  email: string;
  /** Poll until the verification email lands, then parse the link out of it */
  waitForVerificationLink(timeout?: number): Promise<VerificationLink>;
}

function mailSacMailbox(email: string): RegistrationMailbox {
  return {
    email,
    async waitForVerificationLink(timeout: number = 120000) {
      return extractVerificationLink(
        await waitForRegistrationEmail(email, timeout),
      );
    },
  };
}

/** Create the disposable MailSac mailbox the registration flow will use. */
export async function createRegistrationMailbox(): Promise<RegistrationMailbox> {
  const email = randomEmail();
  await generateTempEmail(email);
  return mailSacMailbox(email);
}
