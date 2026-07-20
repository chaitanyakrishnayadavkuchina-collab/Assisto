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


