import { Page, expect } from '@playwright/test';
import { CandidateRegistrationKeywords } from '@keywords/CandidateRegistrationKeywords';
import { dispatchNativeClickOnRowAction } from '@utils/nativeClickHelpers';
import { getBaseUrl } from '@utils/helpers';

/**
 * Employee Onboarding workflow helpers.
 *
 * Counterpart to @workflows/onboardingSetupHelpers (which builds candidates
 * for the Pre-Onboarding suites). This file deliberately contains NO candidate
 * creation: employee onboarding continues with a candidate who has already
 * completed Pre-Onboarding and ACCEPTED their offer.
 */

/**
 * The accepted candidate that onboarding attaches to. Every field is read from
 * the application — nothing here is generated.
 */
export interface AcceptedCandidate {
  /** Application ID from the detail URL, /people/pre-onboarding/candidate/{id} */
  candidateId: string;
  candidateFullName: string;
  /** Personal email captured during Pre-Onboarding registration. */
  email: string;
}

/**
 * Identity accumulated as the employee moves through onboarding. Carried
 * through the spec so every stage can prove it is acting on the same person.
 */
export interface OnboardingIdentity extends AcceptedCandidate {
  /** Issued by the app at Employee ID generation. */
  employeeId?: string;
  /** Organisation mail assigned by IT — a MailSac address, so it is readable. */
  employeeEmail?: string;
}

/**
 * Find the candidate that onboarding should continue with.
 *
 * Resolution order:
 *   1. ONBOARDING_CANDIDATE_ID  — pinned application ID (most deterministic)
 *   2. ONBOARDING_CANDIDATE_EMAIL — pinned candidate, looked up in the grid
 *   3. Otherwise: the most recent candidate whose offer status is Accepted
 *
 * Throws rather than falling back to creating anything, so a misconfigured run
 * fails loudly instead of quietly onboarding the wrong person.
 */
export async function findOfferAcceptedCandidate(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  page: Page,
): Promise<AcceptedCandidate> {
  const pinnedId = process.env.ONBOARDING_CANDIDATE_ID?.trim();
  if (pinnedId) {
    console.log(`[Onboarding] Using pinned candidate ID ${pinnedId}`);
    return await readCandidateFromDetailPage(page, pinnedId);
  }

  const pinnedEmail = process.env.ONBOARDING_CANDIDATE_EMAIL?.trim();

  await candidateRegistrationKeywords.navigateToCandidateRegistration();

  if (pinnedEmail) {
    await candidateRegistrationKeywords.searchCandidates(pinnedEmail);
    await page.waitForTimeout(1000);
  }

  // Wait for the grid to actually populate before counting. It renders its
  // header row immediately and fills in data rows after the fetch resolves, so
  // counting straight away reports zero matches and looks like "no accepted
  // candidate exists" when the grid simply had not loaded.
  await expect
    .poll(async () => await page.getByRole('row').count(), {
      timeout: 20000,
      message: 'Candidate Registration grid never rendered any data rows',
    })
    .toBeGreaterThan(1);

  // Rows whose Offer Letter status reads Accepted. The grid renders status as
  let acceptedRows = page
    .getByRole('row')
    .filter({ hasText: /Accepted/i });

  if (pinnedEmail) {
    acceptedRows = acceptedRows.filter({ hasText: pinnedEmail });
  }

  const count = await acceptedRows.count();

  if (count === 0) {
    // Log what the grid DOES show, so a wording mismatch in the Offer Letter
    // column is diagnosable from the run output instead of guesswork.
    const sample = await page.getByRole('row').allTextContents();
    console.log(
      `[Onboarding] No "Accepted" row matched. Grid rows (first 5):\n` +
        sample.slice(1, 6).map(r => `  - ${r.slice(0, 180)}`).join('\n'),
    );
  }
  if (count === 0) {
    throw new Error(
      '[Onboarding] No candidate with an ACCEPTED offer was found in the ' +
        'Candidate Registration grid. Employee onboarding continues an ' +
        'existing accepted candidate and will not create one — run the ' +
        'Pre-Onboarding E2E flow first, or pin a candidate with ' +
        'ONBOARDING_CANDIDATE_ID / ONBOARDING_CANDIDATE_EMAIL.',
    );
  }

  console.log(`[Onboarding] ${count} candidate row(s) with an accepted offer`);

  // Try each accepted candidate until one is still REGISTERABLE.
  //
  // Accepting an offer is not enough: Temporary Registration is a one-way
  // transition, so a candidate already carried into onboarding by an earlier
  // run keeps its "Accepted" status but no longer offers the button. Picking
  // blindly therefore fails on the second run against the same tenant.
  for (let index = 0; index < count; index++) {
    const candidate = await tryAcceptedCandidateAt(
      candidateRegistrationKeywords,
      page,
      index,
      pinnedEmail,
    );
    if (candidate) return candidate;
  }

  throw new Error(
    `[Onboarding] Found ${count} accepted candidate(s), but none is still ` +
      'available for Temporary Candidate Registration — they have all been ' +
      'carried into onboarding already. Run the Pre-Onboarding E2E flow to ' +
      'produce a fresh accepted candidate, or pin one with ' +
      'ONBOARDING_CANDIDATE_ID.',
  );
}

/**
 * Open the accepted candidate at `index` and return it only if Temporary
 * Candidate Registration is still available for them.
 */
async function tryAcceptedCandidateAt(
  candidateRegistrationKeywords: CandidateRegistrationKeywords,
  page: Page,
  index: number,
  pinnedEmail?: string,
): Promise<AcceptedCandidate | null> {
  await candidateRegistrationKeywords.navigateToCandidateRegistration();
  if (pinnedEmail) {
    await candidateRegistrationKeywords.searchCandidates(pinnedEmail);
    await page.waitForTimeout(1000);
  }
  await expect
    .poll(async () => await page.getByRole('row').count(), { timeout: 20000 })
    .toBeGreaterThan(1);

  let rowsLocator = page.getByRole('row').filter({ hasText: /Accepted/i });
  if (pinnedEmail) {
    rowsLocator = rowsLocator.filter({ hasText: pinnedEmail });
  }
  const row = rowsLocator.nth(index);
  const rowText = (await row.textContent()) ?? '';

  // A plain row.click() does NOT navigate here — this grid is virtualized and
  // clicking the name only toggles an inline accordion. The suite's existing
  // answer is the Actions-column eye icon dispatched as a native DOM click
  // (see CandidateRegistrationPage.openCandidateDetail), which is reused via
  // an <a href> shortcut first when the row exposes one.
  await row.scrollIntoViewIfNeeded();

  const href = await row.evaluate(rowEl => {
    const link = rowEl.querySelector('a[href]') as HTMLAnchorElement | null;
    return link?.getAttribute('href') ?? null;
  });

  if (href) {
    await page.goto(new URL(href, page.url()).toString(), {
      waitUntil: 'domcontentloaded',
    });
  } else {
    const dispatched = await dispatchNativeClickOnRowAction(row);
    expect(
      dispatched,
      'Could not find an action control in the candidate row to open the detail page',
    ).toBe(true);
  }

  await page.waitForLoadState('networkidle').catch(() => {});

  // Navigation is a client-side route change, so poll for the URL rather than
  // reading it once immediately after the click.
  await expect
    .poll(() => candidateIdFromUrl(page.url()), {
      timeout: 15000,
      message: `Opening the accepted candidate never reached a detail page (URL: ${page.url()})`,
    })
    .not.toBe('');

  const candidateId = candidateIdFromUrl(page.url());
  expect(
    candidateId,
    `Clicking the accepted candidate row did not open a detail page (URL: ${page.url()})`,
  ).not.toBe('');

  // Wait for the detail page to finish rendering before judging
  await page
    .getByText('Personal Information', { exact: true })
    .first()
    .waitFor({ state: 'visible', timeout: 15000 })
    .catch(() => {});

  await page
    .getByText(/Loading personal details/i)
    .waitFor({ state: 'hidden', timeout: 15000 })
    .catch(() => {});

  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const tempBtn = page.getByRole('button', { name: 'Temporary Candidate Registration' });
  const isBtnVisible = await tempBtn
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  const isAlreadyRegistered = await page
    .getByText('TEMPORARY REGISTERED')
    .isVisible()
    .catch(() => false);

  if (isAlreadyRegistered) {
    console.log(
      `[Onboarding] Candidate #${candidateId} is already TEMPORARY REGISTERED — trying the next one`,
    );
    return null;
  }

  // Poll for the button to enable once candidate data finishes loading
  const registerable = isBtnVisible && (await expect
    .poll(async () => await tempBtn.isEnabled().catch(() => false), {
      timeout: 10000,
      intervals: [500, 1000],
    })
    .toBe(true)
    .then(() => true)
    .catch(() => false));

  if (!registerable) {
    console.log(
      `[Onboarding] Candidate #${candidateId} is accepted but not registerable (visible: ${isBtnVisible}) — trying the next one`,
    );
    return null;
  }

  // THE CANDIDATE ID IS THE ANCHOR. Name and email are deliberately left empty
  // here and captured in Step 1 from the Temporary Registration modal, whose
  // First Name / Last Name / Personal Mail ID textboxes hold clean values.
  //
  // Neither the grid row nor the detail page is a usable source: the row's
  // cells are concatenated without separators ("…Qlwtwpphase_…@mailsac.com2026
  // 490168…"), so an email regex runs straight through into the next column,
  // and the detail page renders the name with no heading role while showing
  // two MailSac addresses (personal + alternate) a page-wide regex cannot
  // tell apart.
  console.log(
    `[Onboarding] Anchored on candidate #${candidateId} (row: ${rowText.slice(0, 120)}…)`,
  );

  return { candidateId, candidateFullName: '', email: '' };
}

/**
 * Read identity off the candidate detail page. Navigates there first when the
 * page is not already open, so this works for both resolution paths above.
 */
export async function readCandidateFromDetailPage(
  page: Page,
  candidateId: string,
): Promise<AcceptedCandidate> {
  if (candidateIdFromUrl(page.url()) !== candidateId) {
    await page.goto(
      `${getBaseUrl()}/people/pre-onboarding/candidate/${candidateId}`,
      { waitUntil: 'domcontentloaded' },
    );
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  // The detail header renders the candidate name as an unlabelled generic —
  // there is no heading role to target — but the avatar beside it carries the
  // name as its accessible name, which is stable and unambiguous.
  const candidateFullName = (
    (await page
      .getByRole('img')
      .filter({ hasNotText: /logo/i })
      .first()
      .getAttribute('alt')) ?? ''
  ).trim();

  // First Name / Last Name are shown as labelled fields; used as the fallback
  // when the avatar carries no alt text.
  const nameFallback = (
    (await page
      .locator('div')
      .filter({ hasText: /^First Name/ })
      .last()
      .textContent()
      .catch(() => '')) ?? ''
  ).replace(/First Name/i, '').trim();

  // The page shows BOTH a personal and an alternate MailSac address, so scope
  // to the Personal Email field rather than regexing the whole page.
  const personalBlock =
    (await page
      .locator('div')
      .filter({ hasText: /^Personal Email/i })
      .last()
      .textContent()
      .catch(() => '')) ?? '';
  const email = (personalBlock.match(/[\w.+-]+@[\w.-]+\.\w+/) ?? [''])[0];

  const candidate: AcceptedCandidate = {
    candidateId,
    candidateFullName: candidateFullName || nameFallback,
    email,
  };

  expect(
    candidate.candidateFullName,
    'Could not read the candidate name from the detail page',
  ).not.toBe('');
  expect(
    candidate.email,
    'Could not read the candidate personal email from the detail page',
  ).not.toBe('');

  console.log(
    `[Onboarding] Continuing with candidate #${candidate.candidateId} — ` +
      `"${candidate.candidateFullName}" <${candidate.email}>`,
  );

  return candidate;
}

/** Extract the application ID from a candidate detail URL; '' when absent. */
export function candidateIdFromUrl(url: string): string {
  const match = url.match(/\/candidate\/(\d+)/);
  return match ? match[1] : '';
}

/**
 * Assert two stages are operating on the same person.
 *
 * Called between stages so a mis-targeted row cannot silently switch the run
 * onto a different employee.
 */
export function assertSameEmployee(
  stage: string,
  identity: OnboardingIdentity,
  observed: string,
): void {
  const haystack = observed.toLowerCase();
  const nameMatch = haystack.includes(identity.candidateFullName.toLowerCase());
  const emailMatch = identity.employeeEmail
    ? haystack.includes(identity.employeeEmail.toLowerCase())
    : false;
  const idMatch = identity.employeeId
    ? haystack.includes(identity.employeeId.toLowerCase())
    : false;

  expect(
    nameMatch || emailMatch || idMatch,
    `[${stage}] Expected to be acting on "${identity.candidateFullName}"` +
      `${identity.employeeId ? ` (${identity.employeeId})` : ''}, but the ` +
      `screen showed: ${observed.slice(0, 200)}`,
  ).toBe(true);
}
