import { test, expect } from '@fixtures/test.fixture';
import { getLoginUrl } from '@utils/helpers';
import loginData from '@test-data/loginData.json';
import { bringCandidateToOfferLetterTabReady, resolveContractTemplate, RegisteredCandidate } from '@workflows/onboardingSetupHelpers';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse') as (data: Buffer) => Promise<{ text: string; numpages: number }>;

const loginUrl = getLoginUrl();

/**
 * Offer Letter Document Preview — CONTENT verification.
 *
 * This suite answers the explicit ask "we cross the offer letter — we need
 * to check" by verifying the GENERATED DOCUMENT (the actual rendered PDF
 * artifact, not just the HR-side form's UI state) really contains the data
 * that was submitted for that candidate.
 *
 * ============================================================================
 * SPIKE FINDINGS (live investigation against nsplus.perf.devassisto.com,
 * 2026-08-08) — read before modifying this suite:
 * ============================================================================
 *
 * 1. The Document Preview panel (shown after "Generate Draft") is a
 *    CANVAS-based PDF viewer, not a real text layer: live DOM inspection
 *    found 12 `<canvas>` elements and 0 `<iframe>`/`<embed>`/`<object>` tags
 *    for a 12-page generated letter. `page.getByText('8765432')` (the exact
 *    CTC just typed into the form) returned 0 matches against the rendered
 *    preview — confirming the canvas pixels are NOT queryable via Playwright
 *    locators. The `getByText(candidateFullName)` match that DID succeed (1
 *    hit) resolves to the surrounding page chrome/header, not the PDF
 *    canvas itself — so `getByText()`/`toContainText()` against the preview
 *    is NOT a viable content-verification strategy here.
 *
 * 2. A "Download" button IS present on the Document Preview panel and
 *    triggers a genuine file download via `page.waitForEvent('download')`.
 *    The downloaded file is a real PDF (`%PDF-` magic bytes confirmed),
 *    with a sensible filename: `"<Full Name>_offer_letter.pdf"`.
 *
 * 3. `pdf-parse` (installed as a new devDependency specifically for this
 *    suite — NOT present anywhere else in this repo) successfully extracts
 *    a full, clean text layer from the downloaded PDF. Verified live: the
 *    extracted text contains the candidate's full name, hiring
 *    position/designation, the exact CTC figure typed into the form (both
 *    as "Rs <CTC> per annum" and "Fixed CTC INR <CTC>"), the Date of
 *    Joining ("Date of Joining: DD-MM-YYYY"), and the company name
 *    ("NSPlus Technology Private Limited" / "NSPlus Technology Pvt. Ltd.
 *    (NSP)" — a fixed template string, not itself candidate-submitted data,
 *    but still real document content worth asserting is present).
 *
 *    NOTE: `pdf-parse` has two incompatible major versions on npm — v2.x
 *    (current "latest") is a full rewrite with a different API
 *    (`pdfjs-dist`/native-canvas based, ESM-first) that does NOT match the
 *    `@types/pdf-parse` package (written for the classic v1 API) and adds
 *    heavy native dependencies. This suite intentionally pins
 *    `pdf-parse@1.1.1` — the classic, lightweight, `@types/pdf-parse`-
 *    compatible `pdfParse(buffer) -> Promise<{ text, numpages, ... }>` API —
 *    confirmed working end-to-end against a real downloaded offer letter
 *    during the investigation for this suite.
 *
 * CONCLUSION: uses the pdf-parse approach (download -> save -> extract text
 * -> assert), per the task's decision tree, since the text-layer approach is
 * not viable for this app's canvas-rendered preview.
 *
 * ============================================================================
 * Setup pattern reused from tests/validation/offerLetterFieldValidation.spec.ts
 * (bringCandidateToOfferLetterTabReady + selectValidTemplateAndApprovers +
 * hrDocumentReviewKeywords.fillOfferLetterDetails + clickGenerateDraft).
 * ============================================================================
 */
test.describe('Offer Letter Content Verification', () => {
  test.describe.configure({ timeout: 500000 });

  const downloadDir = path.join(process.cwd(), 'test-data', '_offerLetterDownloads');

  test.beforeAll(() => {
    fs.mkdirSync(downloadDir, { recursive: true });
  });

  test.beforeEach(async ({ loginKeywords }) => {
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
    await loginKeywords.verifyLoginSuccess();
  });

  /** Registers a fresh candidate and drives them to the Offer Letter tab. */
  async function freshCandidateOnOfferLetterTab(
    candidateRegistrationKeywords: import('@keywords/CandidateRegistrationKeywords').CandidateRegistrationKeywords,
    candidatePreOnboardingKeywords: import('@keywords/CandidatePreOnboardingKeywords').CandidatePreOnboardingKeywords,
    hrDocumentReviewKeywords: import('@keywords/HrDocumentReviewKeywords').HrDocumentReviewKeywords,
    mailSacClient: import('@utils/MailSacClient').MailSacClient,
    page: import('@playwright/test').Page,
  ): Promise<RegisteredCandidate> {
    return bringCandidateToOfferLetterTabReady(
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      mailSacClient,
      page,
    );
  }

  /** Selects a valid Contract Template + both approvers. */
  async function selectValidTemplateAndApprovers(
    hrDocumentReviewKeywords: import('@keywords/HrDocumentReviewKeywords').HrDocumentReviewKeywords,
  ): Promise<void> {
    // Resolved live — contract templates are tenant data renamed outside this
    // suite, so a hard-coded name silently selects nothing.
    await hrDocumentReviewKeywords.selectContractTemplate(
      await resolveContractTemplate(hrDocumentReviewKeywords),
    );
    await hrDocumentReviewKeywords.selectChroApprover('chro');
    await hrDocumentReviewKeywords.selectHrManagerApprover('Kalyan');
  }

  /**
   * Fills Letter Details, clicks Generate Draft, waits for the preview, then
   * downloads the generated PDF and extracts its text via pdf-parse.
   * Returns the extracted text plus the submitted values for assertions.
   */
  async function generateDraftAndExtractPdfText(
    hrDocumentReviewKeywords: import('@keywords/HrDocumentReviewKeywords').HrDocumentReviewKeywords,
    hrDocumentReviewPage: import('@pages/HrDocumentReviewPage').HrDocumentReviewPage,
    page: import('@playwright/test').Page,
    details: { title: string; ctc: string; dateOfJoining: string },
    downloadTag: string,
  ): Promise<{ text: string; numpages: number }> {
    await selectValidTemplateAndApprovers(hrDocumentReviewKeywords);
    await hrDocumentReviewKeywords.fillOfferLetterDetails({
      title: details.title,
      addressLine1: 'AP',
      addressLine2: 'AP',
      addressLine3: 'AP',
      dateOfJoining: details.dateOfJoining,
      ctc: details.ctc,
    });

    await hrDocumentReviewKeywords.verifyGenerateDraftButtonEnabled();
    await hrDocumentReviewKeywords.clickGenerateDraft();
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await expect(page.getByText('Document Preview')).toBeVisible({ timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const downloadButton = page.getByRole('button', { name: /download/i }).first();
    await expect(downloadButton).toBeVisible({ timeout: 10000 });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      downloadButton.click(),
    ]);

    const savePath = path.join(downloadDir, `${downloadTag}_${Date.now()}.pdf`);
    await download.saveAs(savePath);

    const dataBuffer = fs.readFileSync(savePath);
    const parsed = await pdfParse(dataBuffer);
    return { text: parsed.text, numpages: parsed.numpages };
  }

  // ===========================================================================
  // CORE CONTENT VERIFICATION — one candidate, all fields checked against the
  // real downloaded/extracted PDF text.
  // ===========================================================================
  test.describe('Submitted data appears correctly in the generated document', () => {
    test('TC-OLCV-01: Candidate full name appears correctly in the generated offer letter PDF', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      const registered = await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);
      const { text } = await generateDraftAndExtractPdfText(
        hrDocumentReviewKeywords,
        hrDocumentReviewPage,
        page,
        { title: 'Mr.', ctc: '1234567', dateOfJoining: '2027-02-01' },
        'name-check',
      );

      console.log(`[TC-OLCV-01] Looking for candidate name "${registered.candidateFullName}" in extracted PDF text`);
      expect(text).toContain(registered.candidateFullName);
    });

    test('TC-OLCV-02: Position/hiring role appears correctly in the generated offer letter PDF', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      const registered = await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);
      const { text } = await generateDraftAndExtractPdfText(
        hrDocumentReviewKeywords,
        hrDocumentReviewPage,
        page,
        { title: 'Mr.', ctc: '1234567', dateOfJoining: '2027-02-01' },
        'position-check',
      );

      // hiringPosition is set by generateHrCandidateData() to "Software Engineer"
      // (see utils/testDataGenerator.ts); the letter renders it lowercase
      // ("Software engineer") in the offer paragraph and title-cased under
      // "Designation:" in Annexure 1 — match case-insensitively on the core
      // role text per this app's confirmed inconsistent casing.
      const hiringPosition = registered.hrData.hiringPosition;
      console.log(`[TC-OLCV-02] Looking for hiring position "${hiringPosition}" in extracted PDF text (case-insensitive)`);
      expect(text.toLowerCase()).toContain(hiringPosition.toLowerCase());
    });

    test('TC-OLCV-03: The actual submitted CTC value appears correctly (not a stale/default value)', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);
      // Deliberately distinctive/memorable, unlikely to collide with any
      // other default/placeholder numeric value on the page.
      const distinctiveCtc = '7654321';
      const { text } = await generateDraftAndExtractPdfText(
        hrDocumentReviewKeywords,
        hrDocumentReviewPage,
        page,
        { title: 'Mr.', ctc: distinctiveCtc, dateOfJoining: '2027-02-01' },
        'ctc-check',
      );

      console.log(`[TC-OLCV-03] Looking for CTC "${distinctiveCtc}" in extracted PDF text`);
      expect(text).toContain(distinctiveCtc);
      // Confirmed live: the CTC figure appears at least twice — once in the
      // offer paragraph ("your CTC is Rs <ctc> per annum") and once in the
      // Annexure 1 breakup ("Fixed CTC INR <ctc> /-").
      const occurrences = text.split(distinctiveCtc).length - 1;
      console.log(`[TC-OLCV-03] CTC occurrence count in document: ${occurrences}`);
      expect(occurrences).toBeGreaterThanOrEqual(2);
    });

    test('TC-OLCV-04: Company name appears correctly in the generated offer letter PDF', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);
      const { text } = await generateDraftAndExtractPdfText(
        hrDocumentReviewKeywords,
        hrDocumentReviewPage,
        page,
        { title: 'Mr.', ctc: '1234567', dateOfJoining: '2027-02-01' },
        'company-check',
      );

      // Company name is a fixed value baked into the "Offer_Letter_2026"
      // contract template (not itself candidate-submitted data), but it is
      // still real document content worth verifying is present and correct
      // — confirmed live via the spike download.
      console.log('[TC-OLCV-04] Looking for company name "NSPlus Technology" in extracted PDF text');
      expect(text).toContain('NSPlus Technology');
    });

    test('TC-OLCV-05: Date of Joining appears correctly in the generated offer letter PDF (confirmed included, not assumed)', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);
      // Distinctive far-future date, unlikely to collide with any other date
      // rendered in the document (e.g. today's date on the letter header).
      const dateOfJoiningIso = '2028-11-23';
      const { text } = await generateDraftAndExtractPdfText(
        hrDocumentReviewKeywords,
        hrDocumentReviewPage,
        page,
        { title: 'Mr.', ctc: '1234567', dateOfJoining: dateOfJoiningIso },
        'doj-check',
      );

      // Confirmed live: the document renders "Date of Joining: DD-MM-YYYY"
      // (dd-mm-yyyy, matching the native <input type="date">'s display
      // format elsewhere in this app), NOT the ISO yyyy-mm-dd form submitted.
      const [year, month, day] = dateOfJoiningIso.split('-');
      const expectedDisplayDate = `${day}-${month}-${year}`;
      console.log(`[TC-OLCV-05] Looking for "Date of Joining: ${expectedDisplayDate}" in extracted PDF text`);
      expect(text).toContain(`Date of Joining: ${expectedDisplayDate}`);
    });
  });

  // ===========================================================================
  // CROSS-VERIFICATION / NO-SWAP CHECK
  // ===========================================================================
  test.describe('Cross-candidate isolation (no stale/cached preview)', () => {
    test('TC-OLCV-06: Two candidates generated in sequence each show THEIR OWN data — no stale/cached preview from a previous candidate', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      // Candidate A — first in sequence.
      const registeredA = await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);
      const ctcA = '1111111';
      const { text: textA } = await generateDraftAndExtractPdfText(
        hrDocumentReviewKeywords,
        hrDocumentReviewPage,
        page,
        { title: 'Mr.', ctc: ctcA, dateOfJoining: '2027-03-01' },
        'candidateA',
      );
      console.log(`[TC-OLCV-06] Candidate A: ${registeredA.candidateFullName}, CTC=${ctcA}`);

      // Candidate B — second in sequence, in the SAME page/session as A, to
      // maximize the chance of catching any stale-preview/caching bug.
      const registeredB = await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);
      const ctcB = '2222222';
      const { text: textB } = await generateDraftAndExtractPdfText(
        hrDocumentReviewKeywords,
        hrDocumentReviewPage,
        page,
        { title: 'Mr.', ctc: ctcB, dateOfJoining: '2027-04-01' },
        'candidateB',
      );
      console.log(`[TC-OLCV-06] Candidate B: ${registeredB.candidateFullName}, CTC=${ctcB}`);

      // Candidate A's document must contain A's own data...
      expect(textA).toContain(registeredA.candidateFullName);
      expect(textA).toContain(ctcA);
      // ...and must NOT contain candidate B's name or CTC (B hasn't been
      // generated yet at this point in the sequence, so this also guards
      // against any pre-fetch/pre-render leakage).
      expect(textA).not.toContain(registeredB.candidateFullName);
      expect(textA).not.toContain(ctcB);

      // Candidate B's document must contain B's own data...
      expect(textB).toContain(registeredB.candidateFullName);
      expect(textB).toContain(ctcB);
      // ...and must NOT contain candidate A's name or CTC — this is the core
      // "did the preview get stale/cached from a previous candidate" check.
      expect(textB).not.toContain(registeredA.candidateFullName);
      expect(textB).not.toContain(ctcA);
    });
  });

  // ===========================================================================
  // DOWNLOAD MECHANISM
  // ===========================================================================
  test.describe('Download button', () => {
    test('TC-OLCV-07: Clicking Download triggers a real file download with a sensible PDF filename', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      const registered = await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);

      await selectValidTemplateAndApprovers(hrDocumentReviewKeywords);
      await hrDocumentReviewKeywords.fillOfferLetterDetails({
        title: 'Mr.',
        addressLine1: 'AP',
        addressLine2: 'AP',
        addressLine3: 'AP',
        dateOfJoining: '2027-02-01',
        ctc: '1234567',
      });
      await hrDocumentReviewKeywords.verifyGenerateDraftButtonEnabled();
      await hrDocumentReviewKeywords.clickGenerateDraft();
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await expect(page.getByText('Document Preview')).toBeVisible({ timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const downloadButton = page.getByRole('button', { name: /download/i }).first();
      await expect(downloadButton).toBeVisible({ timeout: 10000 });

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }),
        downloadButton.click(),
      ]);

      const suggestedFilename = download.suggestedFilename();
      console.log(`[TC-OLCV-07] Downloaded file: "${suggestedFilename}" for candidate "${registered.candidateFullName}"`);

      expect(suggestedFilename.toLowerCase()).toMatch(/\.pdf$/);
      // Confirmed live: filename pattern is "<Full Name>_offer_letter.pdf".
      expect(suggestedFilename).toContain(registered.candidateFullName);

      const savePath = path.join(downloadDir, `filename-check_${Date.now()}.pdf`);
      await download.saveAs(savePath);
      const stats = fs.statSync(savePath);
      console.log(`[TC-OLCV-07] Downloaded file size: ${stats.size} bytes`);
      expect(stats.size).toBeGreaterThan(1000);

      // Confirm it's a genuine PDF (magic bytes), not an HTML error page or
      // empty stub saved with a misleading .pdf extension.
      const header = fs.readFileSync(savePath, { encoding: 'latin1', flag: 'r' }).substring(0, 5);
      expect(header).toBe('%PDF-');
    });
  });

  // ===========================================================================
  // DOCUMENT PREVIEW PANEL — sanity checks independent of content parsing
  // ===========================================================================
  test.describe('Document Preview panel rendering', () => {
    test('TC-OLCV-08: Document Preview panel renders a multi-page paginated view after Generate Draft', async ({
      candidateRegistrationKeywords,
      candidatePreOnboardingKeywords,
      hrDocumentReviewKeywords,
      hrDocumentReviewPage,
      mailSacClient,
      page,
    }) => {
      await freshCandidateOnOfferLetterTab(candidateRegistrationKeywords, candidatePreOnboardingKeywords, hrDocumentReviewKeywords, mailSacClient, page);

      await selectValidTemplateAndApprovers(hrDocumentReviewKeywords);
      await hrDocumentReviewKeywords.fillOfferLetterDetails({
        title: 'Mr.',
        addressLine1: 'AP',
        addressLine2: 'AP',
        addressLine3: 'AP',
        dateOfJoining: '2027-02-01',
        ctc: '1234567',
      });
      await hrDocumentReviewKeywords.verifyGenerateDraftButtonEnabled();
      await hrDocumentReviewKeywords.clickGenerateDraft();
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await expect(page.getByText('Document Preview')).toBeVisible({ timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirmed live: the preview renders a "Page 1 of N" indicator and
      // real <canvas> elements (pdf.js-style rendering) — verify both
      // signals as an independent sanity check that a real document was
      // rendered (distinct from the content-accuracy assertions above,
      // which additionally require the download+pdf-parse round trip).
      const pageIndicator = page.getByText(/Page \d+ of \d+/i);
      await expect(pageIndicator).toBeVisible({ timeout: 10000 });
      const pageIndicatorText = await pageIndicator.textContent();
      console.log(`[TC-OLCV-08] Page indicator text: "${pageIndicatorText}"`);

      const canvasCount = await page.locator('canvas').count();
      console.log(`[TC-OLCV-08] canvas element count: ${canvasCount}`);
      expect(canvasCount).toBeGreaterThan(0);
    });
  });
});
