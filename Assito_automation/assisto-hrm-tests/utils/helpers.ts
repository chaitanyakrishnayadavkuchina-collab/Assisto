import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Get environment variable value
 * @param key - Environment variable name
 * @returns Value of the environment variable
 * @throws Error if variable is not set
 */
export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Environment variable "${key}" is not set`);
  }
  return value.trim();
}

/**
 * Get base URL from environment
 */
export function getBaseUrl(): string {
  return getEnvVar('BASE_URL');
}

/**
 * Get login URL from environment
 */
export function getLoginUrl(): string {
  const baseUrl = getBaseUrl();
  const loginPath = getEnvVar('LOGIN_URL');
  return `${baseUrl}${loginPath}`;
}

/**
 * Get the portal URL that hosts the "Start Free Trial" call to action.
 *
 * This is NOT the same host as BASE_URL: BASE_URL points at a provisioned
 * tenant (which only serves /login), whereas self-service registration lives
 * on the public Assisto portal. Override with REGISTRATION_URL in .env.
 */
export function getRegistrationUrl(): string {
  return process.env.REGISTRATION_URL?.trim() || 'https://test.devassisto.com';
}

/**
 * Credentials of the trial admin account used by the login tests.
 *
 * These belong to an account created by the Start Free Trial flow; they live
 * in .env (gitignored), never in source. Provision a fresh one by running
 * tests/registration/registration.spec.ts and copying the generated
 * email/password.
 */
export function getTrialAdminCredentials(): {
  email: string;
  password: string;
} {
  return {
    email: getEnvVar('TRIAL_ADMIN_EMAIL'),
    password: getEnvVar('TRIAL_ADMIN_PASSWORD'),
  };
}

/**
 * Wait for specified milliseconds
 * @param ms - Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random string
 * @param length - Length of random string (default: 8)
 */
export function randomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test-${randomString()}@example.com`;
}

/**
 * Generate random password with complexity
 */
export function randomPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%';

  const pick = (pool: string, count: number): string => {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    return result;
  };

  const base =
    pick(upper, 2) + pick(lower, 4) + pick(numbers, 2) + pick(special, 1);
  const shuffled = base
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
  return shuffled + '!';
}
