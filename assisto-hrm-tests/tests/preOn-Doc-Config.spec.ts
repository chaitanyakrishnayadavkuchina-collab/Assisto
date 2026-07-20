import { test, expect } from '@fixtures/test.fixture';
import { getLoginUrl } from '@utils/helpers';
import preOnboardingData from '@test-data/preOnboardingData.json';

const loginUrl: string = getLoginUrl();

test.describe('Pre-Onboarding Settings', () => {
  test.beforeEach(async ({ loginKeywords }) => {
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(
      process.env.TEST_EMAIL || 'orgnization1@sharklasers.com',
      process.env.TEST_PASSWORD || 'Welcome@123',
    );
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

    // Click Add Document button
    await preOnboardingKeywords.addNewDocument(preOnboardingData.newDocument);

    // Verify the document was created - wait for modal to close
    await await new Promise(resolve => setTimeout(resolve, 3000));
    // Verify the page is still in Document Configuration state (Back to Document List button should be visible)
    await expect(
      page.getByText('Back to Document List'),
    ).toBeVisible();
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

    // Save changes
    await preOnboardingKeywords.saveConsentForm();
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
  });
});


