/**
 * Role-keyed authentication state.
 *
 * Performs a UI login once per role and caches the resulting session on disk,
 * so specs restore it instead of re-logging in through the UI in every
 * `beforeEach`.
 *
 * IMPORTANT: this app keeps its entire session in **sessionStorage**
 * (`userData` carries the JWT, plus `hasAccess` and `subDomain`) and sets no
 * auth cookies or localStorage. Playwright's `storageState` only captures
 * cookies + localStorage, so it comes back empty here — the sessionStorage
 * snapshot must be captured separately and replayed with `addInitScript`.
 * The cookie/localStorage half is still captured and applied, so this keeps
 * working if the app later moves to cookies.
 *
 * Roles come from the accounts already declared in test-data/loginData.json
 * (`roles.businessHR`, `roles.chro`, `roles.hrManager`); the `admin` role uses
 * TEST_EMAIL / TEST_PASSWORD from .env. No credentials are hardcoded here.
 *
 * Wired up in fixtures/test.fixture.ts via the `role` option — see that file
 * for usage.
 */

import { chromium, type BrowserContextOptions } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import loginData from '../test-data/loginData.json';
import { getLoginUrl } from './helpers';

/** Roles a spec can authenticate as. 'none' means "stay logged out". */
export type UserRole =
  | 'none'
  | 'admin'
  | 'businessHR'
  | 'chro'
  | 'hrManager'
  /** IT operator who provisions organisation mail during employee onboarding. */
  | 'it';

/** A cached session: the cookie/localStorage half plus a sessionStorage snapshot. */
export interface CachedSession {
  /** Playwright storageState (cookies + localStorage) */
  storageState: NonNullable<BrowserContextOptions['storageState']>;
  /** JSON snapshot of sessionStorage, replayed via addInitScript */
  sessionStorage: string;
}

/** Where cached sessions live (gitignored via /playwright/.auth/). */
const AUTH_DIR = path.resolve(__dirname, '..', 'playwright', '.auth');

/**
 * How long a cached session is trusted before being re-created. Kept well
 * inside the app's session lifetime so a long run never picks up an expired
 * token from an earlier run.
 */
const MAX_AGE_MS = 20 * 60 * 1000;

/** Resolve the credentials for a role. */
function credentialsFor(role: Exclude<UserRole, 'none'>): {
  email: string;
  password: string;
} {
  if (role === 'admin') {
    const email = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL;
    const password = process.env.TEST_PASSWORD || process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error('[authState] Missing TEST_EMAIL/ADMIN_EMAIL or TEST_PASSWORD/ADMIN_PASSWORD in environment');
    }
    return { email, password };
  }

  const account = loginData.roles[role];
  if (!account) {
    throw new Error(`[authState] No credentials configured for role "${role}"`);
  }
  const rolePrefix = role.toUpperCase();
  return {
    email: process.env[`${rolePrefix}_EMAIL`] || account.email,
    password: process.env[`${rolePrefix}_PASSWORD`] || account.password,
  };
}

/** Path of the cached storageState file for a role. */
export function authStatePath(role: Exclude<UserRole, 'none'>): string {
  return path.join(AUTH_DIR, `${role}.json`);
}

/** Whether a cached session exists and is still within MAX_AGE_MS. */
function isFresh(file: string): boolean {
  try {
    return Date.now() - fs.statSync(file).mtimeMs < MAX_AGE_MS;
  } catch {
    return false;
  }
}

/**
 * Return a valid session for `role`, logging in through the UI first if there
 * is no fresh cached one.
 */
export async function ensureAuthState(
  role: Exclude<UserRole, 'none'>,
): Promise<CachedSession> {
  const file = authStatePath(role);
  if (isFresh(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as CachedSession;
  }

  const { email, password } = credentialsFor(role);
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    // Deliberately uses raw locators rather than LoginPage: this runs while the
    // fixture container is being built, so importing a page object here would
    // make that container depend on itself.
    await page.goto(getLoginUrl(), { waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox', { name: /email/i }).first().fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.getByRole('button', { name: 'Login' }).first().click();

    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 30000,
    });
    // The token is written to sessionStorage as the post-login route settles.
    await page.waitForFunction(
      () => !!window.sessionStorage.getItem('userData'),
      null,
      {
        timeout: 30000,
      },
    );

    const session: CachedSession = {
      storageState: await context.storageState(),
      sessionStorage: await page.evaluate(() =>
        JSON.stringify(window.sessionStorage),
      ),
    };

    await context.close();
    fs.writeFileSync(file, JSON.stringify(session), 'utf-8');
    console.log(`[authState] Cached session for role "${role}"`);
    return session;
  } finally {
    await browser.close();
  }
}

/**
 * Build the init script that replays a cached sessionStorage snapshot into a
 * fresh browser context, before any application code runs.
 */
export function sessionStorageInitScript(snapshot: string): string {
  return `(() => {
    try {
      const entries = JSON.parse(${JSON.stringify(snapshot)});
      for (const [key, value] of Object.entries(entries)) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {
      // A malformed snapshot must not break page bootstrap; the test will
      // simply land on the login page and fail with a clear reason.
    }
  })();`;
}
