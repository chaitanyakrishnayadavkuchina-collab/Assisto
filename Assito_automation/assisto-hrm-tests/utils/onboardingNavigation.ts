import { type Page } from '@playwright/test';
import { getBaseUrl } from '@utils/helpers';

/**
 * Navigation for the Onboarding module.
 *
 * Every Onboarding screen lives behind the same horizontal tab strip
 * (Onboarding · Upcoming Joinee · Activation · Employee IDs · Day-0 Check-In ·
 * Itmail Provisioning · HR Verification · Self-Onboarding · Induction), so a
 * single helper resolves them all rather than each keywords class hard-coding
 * a route.
 *
 * Deep links are attempted first (fast, and survives an already-open module),
 * with a tab click as the fallback. Route slugs are kept in ONE place here:
 * if the app's paths differ from the guesses below, this is the only file to
 * change — the tab-click fallback keeps the suite working meanwhile.
 */
export type OnboardingTab =
  | 'Upcoming Joinee'
  | 'Activation'
  | 'Employee IDs'
  | 'Day-0 Check-In'
  | 'Itmail Provisioning'
  | 'HR Verification'
  | 'Self-Onboarding'
  | 'Induction';

/** Route slug per tab, relative to /people/onboarding. */
const TAB_ROUTES: Record<OnboardingTab, string> = {
  'Upcoming Joinee': 'upcoming-joinee',
  Activation: 'activation',
  'Employee IDs': 'employee-id', // singular — confirmed from the live URL
  'Day-0 Check-In': 'day-zero', // confirmed from the live URL
  'Itmail Provisioning': 'itmail-provisioning',
  'HR Verification': 'hr-verification',
  'Self-Onboarding': 'self-onboarding',
  Induction: 'induction',
};

/** Base route of the Onboarding module. */
export function onboardingModuleUrl(): string {
  return `${getBaseUrl()}/people/onboarding`;
}

/**
 * Open an Onboarding tab and wait for it to settle.
 *
 * @param verifyLocatorText Text that proves the target screen rendered; when
 *   the deep link lands somewhere else, the tab is clicked instead.
 */
export async function navigateToOnboardingTab(
  page: Page,
  tab: OnboardingTab,
  verifyLocatorText: string | RegExp,
): Promise<void> {
  await page.goto(`${onboardingModuleUrl()}/${TAB_ROUTES[tab]}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForLoadState('networkidle').catch(() => {});

  const landed = await page
    .getByText(verifyLocatorText)
    .first()
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (!landed) {
    // Deep link did not resolve — fall back to the module's tab strip. The
    // tabs render as styled elements rather than ARIA tabs on some screens,
    // so match on text and take the first hit in the strip.
    console.log(
      `[Onboarding] Deep link for "${tab}" did not land; falling back to tab click`,
    );
    await page.goto(onboardingModuleUrl(), { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.getByText(tab, { exact: true }).first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  console.log(`[Onboarding] "${tab}" — URL: ${page.url()}`);
}
