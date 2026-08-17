import type { Locator } from '@playwright/test';

/**
 * Visibility helpers.
 *
 * BACKGROUND — the most common flake in this suite
 *
 * `Locator.isVisible()` reads the DOM exactly once and never retries. Any
 * assertion built on it therefore races the app's async render: it passes on
 * fast paths and fails intermittently on slow ones, and the failure blames the
 * application ("CHRO cannot see the dashboard") rather than the check.
 *
 * Three real examples from this codebase, all diagnosed as app bugs before the
 * cause was found:
 *   - LetterGenerationKeywords.verifyRejectButtonVisible() raced the Offer
 *     Letter Detail page painting its action buttons.
 *   - PreOnboardingDashboardPage.areAllKPIsVisible() raced the KPI cards, but
 *     only for CHRO / HR Manager, whose slower bootstrap lost the race that
 *     Admin won.
 *   - Several `expect(page.isXVisible()).resolves.toBe(true)` keywords, which
 *     look like assertions but resolve a one-shot boolean.
 *
 * WHICH TO USE
 *
 * Asserting something SHOULD be there    -> isVisibleWithin(), or better,
 *                                           expect(locator).toBeVisible()
 * Asserting something should NOT be there -> isVisibleWithin(locator, 1000);
 *                                            a short window, since you are
 *                                            proving a negative
 * Branching on an OPTIONAL element        -> plain locator.isVisible(); do NOT
 *                                            use this helper. Retrying would
 *                                            add the full timeout every time
 *                                            the element is legitimately
 *                                            absent (e.g. a first-login dialog
 *                                            that only appears once).
 *
 * Prefer `expect(locator).toBeVisible()` in tests and keywords — it retries
 * natively and reports a better message. This helper exists for page objects
 * that must return a boolean rather than assert.
 */

/**
 * Whether `locator` becomes visible within `timeout`, retrying until then.
 *
 * @param locator - Element to wait for
 * @param timeout - Milliseconds to keep retrying (default 10000). Pass a small
 *                  value when asserting absence.
 */
export async function isVisibleWithin(
  locator: Locator,
  timeout = 10000,
): Promise<boolean> {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}
