import { test, expect } from '@fixtures/test.fixture';
import { getEnvVar, getLoginUrl } from '@utils/helpers';
import preOnboardingData from '@test-data/preOnboardingData.json';

const loginUrl: string = getLoginUrl();

test.describe('Pre-Onboarding Settings', () => {
  /**
   * Document templates are tenant-wide configuration, not per-test data: a
   * leftover MANDATORY Id Proof template appears on every candidate's Document
   * Upload step and makes it unsubmittable, blocking the entire pre-onboarding
   * suite. Names created here are recorded and removed in afterAll.
   */
  const createdDocumentNames: string[] = [];

  test.beforeEach(async ({ loginKeywords }) => {
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(getEnvVar('TEST_EMAIL'), getEnvVar('TEST_PASSWORD'));
    await loginKeywords.verifyLoginSuccess();
  });

  /**
   * Test 1: Add a new document template
   * Steps: Settings → Pre-Onboarding Settings → Document Configuration → Add Document → Fill fields → Create Document
   */
  test('should add a new document', async ({
    preOnboardingKeywords,
    page,
  }) => {
    // Navigate to Pre-Onboarding Settings > Document Configuration
    await preOnboardingKeywords.navigateToPreOnboardingSettings();
    await page.waitForLoadState('networkidle');
    await preOnboardingKeywords.navigateToDocumentConfiguration();
    await page.waitForLoadState('networkidle');

    // Wait for the Document Configuration page to be visible
    await expect(
      page.getByRole('button', { name: 'Add Document' }),
    ).toBeVisible();

    // Click Add Document button.
    // Use a unique name so repeated runs never collide with previously created
    // documents (the server rejects duplicate names with "Save failed").
    const uniqueDocName = `${preOnboardingData.newDocument.documentName} ${Date.now()}`;
    // Record before creating: if the assertion below fails, afterAll must still
    // clean up whatever reached the server.
    createdDocumentNames.push(uniqueDocName);
    await preOnboardingKeywords.addNewDocument({
      ...preOnboardingData.newDocument,
      documentName: uniqueDocName,
    });

    // Verify the document was created - the modal closes and the app returns to
    // the Document Templates list, where the new document appears.
    await expect(
      page.getByText(uniqueDocName).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * Test 2: Edit Consent Form
   * Steps: Settings → Pre-Onboarding Settings → Consent Form Config → Edit
   */
  test('should edit the consent form', async ({
    preOnboardingKeywords,
    page,
  }) => {
    // Navigate to Pre-Onboarding Settings > Consent Form Config
    await preOnboardingKeywords.navigateToPreOnboardingSettings();
    await page.waitForLoadState('networkidle');
    await preOnboardingKeywords.navigateToConsentFormConfig();
    await page.waitForLoadState('networkidle');

    // Wait for the Consent Form Configuration page to load (table with Description and Action columns)
    await expect(
      page.getByRole('table'),
    ).toBeVisible();

    // Click Edit button (first Edit button in the table)
    await preOnboardingKeywords.editConsentForm();
    await page.waitForLoadState('networkidle');

    // Verify the editor is now visible (we're in edit mode)
    await expect(page.locator('.ql-editor')).toBeVisible();

    // Type a unique marker so the save can actually be verified post-reload.
    // The marker is padded past the 100-char minimum enforced by the server on
    // consent form content (see SEC-002), otherwise the save is rejected.
    // Retry once in case preOnboardingSecurity.spec.ts (SEC-002) overwrites the
    // shared consent form from a parallel worker.
    let marker = `Auto-edited consent ${Date.now()} ${'A'.repeat(120)}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.locator('.ql-editor').fill(marker);

      // Save changes
      await preOnboardingKeywords.saveConsentForm();

      // Reload the page and confirm the edited content persisted
      await page.reload({ waitUntil: 'networkidle' });
      await preOnboardingKeywords.navigateToPreOnboardingSettings();
      await page.waitForLoadState('networkidle');
      await preOnboardingKeywords.navigateToConsentFormConfig();
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('table')).toBeVisible();
      await preOnboardingKeywords.editConsentForm();
      await page.waitForLoadState('networkidle');

      if ((await page.locator('.ql-editor').textContent() ?? '').includes(marker)) {
        break;
      }
      marker = `Auto-edited consent ${Date.now()} ${'A'.repeat(120)}`;
    }
    await expect(page.locator('.ql-editor')).toContainText(marker);
  });

  /**
   * Test 3: Configure Link Expiry & Access policy
   * Steps: Settings → Pre-Onboarding Settings → Link Expiry & Access → Select days → Save
   */
  test('should configure link expiry policy', async ({
    preOnboardingKeywords,
    page,
  }) => {
    // Navigate to Pre-Onboarding Settings > Link Expiry & Access
    await preOnboardingKeywords.navigateToPreOnboardingSettings();
    await page.waitForLoadState('networkidle');
    await preOnboardingKeywords.navigateToLinkExpiryAccess();
    await page.waitForLoadState('networkidle');

    // Wait for the Link Expiry page to load (slider should be visible)
    await expect(
      page.getByRole('slider'),
    ).toBeVisible();

    // Select expiration timeframe (7 days)
    await preOnboardingKeywords.configureLinkExpiry(
      preOnboardingData.linkExpiry.days,
    );

    // Verify the Save Expiry Policy button was clicked and policy is saved
    await expect(
      page.getByRole('button', { name: 'Save Expiry Policy' }),
    ).toBeVisible();

    // Reload the page and re-check the configured days value actually persisted
    await page.reload({ waitUntil: 'networkidle' });
    await preOnboardingKeywords.navigateToPreOnboardingSettings();
    await page.waitForLoadState('networkidle');
    await preOnboardingKeywords.navigateToLinkExpiryAccess();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('slider')).toBeVisible();
    // The persisted limit is rendered as "<n> Days Limit" next to the slider and the
    // slider's value reflects the configured days (the day buttons are not marked active).
    await expect(
      page.getByText(`${preOnboardingData.linkExpiry.days} Days Limit`),
    ).toBeVisible();
    await expect(page.getByRole('slider')).toHaveAttribute(
      'value',
      String(preOnboardingData.linkExpiry.days),
    );
  });

  /**
   * Remove every document template this file created. Runs in its own context
   * because Playwright tears the test page down before afterAll.
   */
  test.afterAll(async ({ browser }) => {
    if (createdDocumentNames.length === 0) return;
    test.setTimeout(120000);

    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      const { LoginKeywords } = await import('@keywords/LoginKeywords');
      const { PreOnboardingKeywords } = await import('@keywords/PreOnboardingKeywords');

      const login = new LoginKeywords(page);
      await login.openLoginPage(loginUrl);
      await login.login(getEnvVar('TEST_EMAIL'), getEnvVar('TEST_PASSWORD'));
      await login.verifyLoginSuccess();

      const keywords = new PreOnboardingKeywords(page);
      await keywords.navigateToDocumentConfiguration();

      for (const name of createdDocumentNames) {
        try {
          const deleted = await keywords.deleteDocument(name);
          console.log(`[cleanup] ${deleted ? 'Deleted' : 'Not found'}: ${name}`);
        } catch (error) {
          // Never fail the suite on cleanup — report loudly instead, so a
          // leftover is visible rather than silently poisoning later runs.
          console.error(`[cleanup] FAILED to delete "${name}":`, error);
        }
      }
    } finally {
      await context.close();
    }
  });
});


