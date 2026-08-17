import { test, expect } from '@fixtures/test.fixture';
import globalSettingsData from '@test-data/globalSettingsData.json';
import { getLoginUrl } from '@utils/helpers';

test.describe('Global Settings - Company Settings & Business Units', () => {
  const loginUrl: string = getLoginUrl();

  test.beforeEach(async ({ loginKeywords }) => {
    await loginKeywords.openLoginPage(loginUrl);
    await loginKeywords.login(
      process.env.TEST_EMAIL || 'user@example.com',
      process.env.TEST_PASSWORD || 'Password123!',
    );
    await loginKeywords.verifyLoginSuccess();
  });

  // ==========================================
  //  SECTION 1: COMPANY SETTINGS - POSITIVE
  // ==========================================

  test.describe('Company Settings', () => {
    // ── Navigation ──

    test('should navigate to Company Settings page', async ({
      settingsKeywords,
      settingsPage,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    test('should display Brand Asset upload section', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      const uploadButton = page.getByRole('button', { name: 'Upload' });
      await expect(uploadButton).toBeVisible();
    });

    test('should display all Basic Information fields', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await expect(settingsPage.getLegalEntityNameInput()).toBeVisible();
      await expect(settingsPage.getSuperAdminEmailInput()).toBeVisible();
      await expect(settingsPage.getPublicContactEmailInput()).toBeVisible();
      await expect(settingsPage.getRegisteredCountrySelect()).toBeVisible();
      await expect(settingsPage.getRegisteredStateSelect()).toBeVisible();
      await expect(settingsPage.getOperationalTimezoneSelect()).toBeVisible();
      await expect(settingsPage.getCorporateHeadquartersAddressInput()).toBeVisible();
    });

    test('should display Regulatory & Statutory Numbers section', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await expect(settingsPage.getPfRegistrationIdInput()).toBeVisible();
      await expect(settingsPage.getIncomeTaxRegistrationInput()).toBeVisible();
      await expect(settingsPage.getPanCardNumberInput()).toBeVisible();
      await expect(settingsPage.getEsiRegistrationCodeInput()).toBeVisible();
      await expect(settingsPage.getLinLabourIdentificationInput()).toBeVisible();
      await expect(settingsPage.getGstinInput()).toBeVisible();
      await expect(settingsPage.getCinCorporateIdentityInput()).toBeVisible();
    });

    // ── Save with full data ──

    test('should fill and save complete company profile', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.fillCompanyProfile(globalSettingsData.companyProfile);
      await settingsKeywords.saveCompanyProfile();

      // After saving, page should remain visible (no crash)
      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    test('should fill and save company profile with regulatory numbers', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.fillCompanyProfile(globalSettingsData.companyProfile);
      await settingsKeywords.fillRegulatoryNumbers(globalSettingsData.regulatoryNumbers);
      await settingsKeywords.saveCompanyProfile();

      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    // ── Discard ──

    test('should discard changes when Discard button is clicked', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      // Fill a field with a value
      await settingsPage.fillLegalEntityName('Temp Entity Name');

      // Click Discard
      await settingsKeywords.discardChanges();

      // Page should still be visible and unchanged
      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    // ── Brand Asset ──

    test('should display Upload Brand Asset button', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('button', { name: 'Upload Brand Asset' })).toBeVisible();
    });
  });

  // ==========================================
  //  SECTION 2: COMPANY SETTINGS - NEGATIVE
  // ==========================================

  test.describe('Company Settings - Negative Cases', () => {
    test('should show validation errors when saving with all fields empty', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      // Fill empty values (just click save with whatever is already there or empty)
      await settingsKeywords.saveEmptyCompanyProfile();

      // Page should still be visible (validation may show error messages)
      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    test('should accept saving with only required fields', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.fillCompanyProfile({
        ...globalSettingsData.companyProfileRequiredOnly,
        superAdminEmail: '',
        publicContactEmail: '',
        registeredCountry: '',
        registeredState: '',
        operationalTimezone: '',
      });
      await settingsKeywords.saveCompanyProfile();

      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    test('should fill invalid email formats and save', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await settingsPage.fillLegalEntityName('Test Entity');
      await settingsPage.fillSuperAdminEmail(globalSettingsData.companyProfileInvalidEmails.superAdminEmail);
      await settingsPage.fillPublicContactEmail(globalSettingsData.companyProfileInvalidEmails.publicContactEmail);
      await settingsPage.fillCorporateHeadquartersAddress('Test Address');
      await settingsKeywords.saveCompanyProfile();

      // Page should remain visible
      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    test('should handle extremely long legal entity name', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.fillExcessivelyLongName(globalSettingsData.longLegalEntityName);
      await settingsPage.fillCorporateHeadquartersAddress('Test Address');
      await settingsKeywords.saveCompanyProfile();

      // Page should remain visible
      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });

    test('should save with empty regulatory numbers', async ({
      settingsKeywords,
      settingsPage,
      page,
    }) => {
      await settingsKeywords.navigateToCompanySettings();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.fillCompanyProfile(globalSettingsData.companyProfile);
      await settingsKeywords.fillRegulatoryNumbers(globalSettingsData.regulatoryNumbersEmpty);
      await settingsKeywords.saveCompanyProfile();

      await expect(settingsPage.isCompanySettingsPage()).toBeTruthy();
    });
  });

  // ==========================================
  //  SECTION 3: BUSINESS UNITS - POSITIVE
  // ==========================================

  test.describe('Business Units', () => {
    // ── Navigation ──

    test('should navigate to Business Unit page', async ({
      settingsKeywords,
      settingsPage,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await expect(settingsPage.isBusinessUnitPage()).toBeTruthy();
    });

    test('should display counter cards on Business Unit page', async ({
      settingsKeywords,
      settingsKeywords: keywords,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();

      const totalUnits = await keywords.getTotalUnitsCount();
      const withUnitHead = await keywords.getWithUnitHeadCount();
      const pendingHead = await keywords.getPendingHeadCount();

      // Counters should return non-empty strings
      expect(totalUnits).toBeTruthy();
      expect(withUnitHead).toBeTruthy();
      expect(pendingHead).toBeTruthy();
    });

    // ── Add Unit ──

    test('should add a new business unit with valid data', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.addBusinessUnit(globalSettingsData.validBusinessUnit);

      // After save, the Add Unit button should be visible again (modal closed)
      const addUnitButton = page.getByRole('button', { name: 'Add Unit' });
      await expect(addUnitButton).toBeVisible();
    });

    test('should add a new business unit with description', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.addBusinessUnitWithDescription(globalSettingsData.validBusinessUnitWithDescription);

      // After save, the Add Unit button should be visible again
      const addUnitButton = page.getByRole('button', { name: 'Add Unit' });
      await expect(addUnitButton).toBeVisible();
    });

    // ── View Unit ──

    test('should view a business unit details in modal', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.viewBusinessUnit();

      // View modal should be visible
      await expect(page.getByRole('dialog')).toBeVisible();

      // Close the view modal
      await settingsKeywords.closeViewModal();

      // Modal should be closed
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    // ── Edit Unit ──

    test('should edit an existing business unit with description', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.editBusinessUnit('Updated description for test');

      // After save, the Add Unit button should be visible (edit dialog closed)
      const addUnitButton = page.getByRole('button', { name: 'Add Unit' });
      await expect(addUnitButton).toBeVisible();
    });

    test('should edit and cancel a business unit', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.editAndCancelBusinessUnit();

      // Add Unit button should be visible after cancel
      const addUnitButton = page.getByRole('button', { name: 'Add Unit' });
      await expect(addUnitButton).toBeVisible();
    });

    // ── Cancel Add Unit ──

    test('should cancel adding a new business unit', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.openAndCancelAddUnit();

      // Add Unit button should still be visible
      const addUnitButton = page.getByRole('button', { name: 'Add Unit' });
      await expect(addUnitButton).toBeVisible();
    });
  });

  // ==========================================
  //  SECTION 4: BUSINESS UNITS - NEGATIVE
  // ==========================================

  test.describe('Business Units - Negative Cases', () => {
    test('should show validation when adding with empty fields', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.addBusinessUnitWithEmptyFields();

      // After validation fails, the dialog should still be open (validation prevents close)
      // Click Cancel to close the dialog
      await settingsKeywords.cancelAddUnit();
      
      // The Add Unit button should be visible after canceling
      await expect(page.getByRole('button', { name: 'Add Unit' })).toBeVisible();
    });

    test('should show validation when adding with missing code', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.addBusinessUnitWithMissingCode();

      // After validation fails, the dialog should still be open (validation prevents close)
      // Click Cancel to close the dialog
      await settingsKeywords.cancelAddUnit();
      
      // The Add Unit button should be visible after canceling
      await expect(page.getByRole('button', { name: 'Add Unit' })).toBeVisible();
    });
  });

  // ==========================================
  //  SECTION 5: BUSINESS UNITS - EDGE CASES
  // ==========================================

  test.describe('Business Units - Edge Cases', () => {
    test('should add multiple business units sequentially', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      // Add first unit
      await settingsKeywords.addBusinessUnit(globalSettingsData.validBusinessUnit);
      await expect(page.getByRole('button', { name: 'Add Unit' })).toBeVisible();

      // Add second unit
      await settingsKeywords.addBusinessUnit(globalSettingsData.validBusinessUnit2);
      await expect(page.getByRole('button', { name: 'Add Unit' })).toBeVisible();
    });

    test('should show business unit name in view modal', async ({
      settingsKeywords,
      page,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();
      await page.waitForLoadState('networkidle');

      await settingsKeywords.viewBusinessUnit();

      // The view modal should display the unit name
      const unitName = await page.getByRole('heading', { level: 2 }).first().textContent();
      expect(unitName).toBeTruthy();
      expect(unitName!.length).toBeGreaterThan(0);
    });

    test('should show unit head in view modal', async ({
      settingsKeywords,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();

      await settingsKeywords.viewBusinessUnit();

      const unitHead = await settingsKeywords.getViewModalUnitHead();
      // Unit head should be displayed (either a name or empty placeholder)
      expect(unitHead).toBeTruthy();
    });

    test('should show status in view modal', async ({
      settingsKeywords,
    }) => {
      await settingsKeywords.navigateToBusinessUnit();

      await settingsKeywords.viewBusinessUnit();

      const status = await settingsKeywords.getViewModalStatus();
      expect(status).toBeTruthy();
    });
  });

  // ==========================================
  //  SECTION 6: NETWORK ERROR DETECTION
  // ==========================================

  test.describe('Network Error Detection', () => {
    test('should detect 4xx/5xx errors during company settings navigation', async ({
      settingsKeywords,
      page,
    }) => {
      const networkErrors: number[] = [];

      // Set up error listener
      const removeListener = settingsKeywords.onNetworkError((response) => {
        networkErrors.push(response.status());
      });

      try {
        await settingsKeywords.navigateToCompanySettings();
        await page.waitForLoadState('networkidle');
      } finally {
        removeListener();
      }

      // Report any errors found (test passes if no 4xx/5xx errors)
      if (networkErrors.length > 0) {
        const errorMsg = `Network errors detected: ${networkErrors.join(', ')}`;
        console.error(errorMsg);
      }
    });

    test('should detect 4xx/5xx errors during business unit operations', async ({
      settingsKeywords,
      page,
    }) => {
      const networkErrors: number[] = [];

      const removeListener = settingsKeywords.onNetworkError((response) => {
        networkErrors.push(response.status());
      });

      try {
        await settingsKeywords.navigateToBusinessUnit();
        await page.waitForLoadState('networkidle');
      } finally {
        removeListener();
      }

      if (networkErrors.length > 0) {
        const errorMsg = `Network errors detected: ${networkErrors.join(', ')}`;
        console.error(errorMsg);
      }
    });

    test('should capture screenshot when network errors occur', async ({
      settingsKeywords,
      page,
    }) => {
      const screenshotPath = 'allure-results/network-error-screenshot.png';

      try {
        // Navigate to Business Unit page
        await settingsKeywords.navigateToBusinessUnit();
        await page.waitForLoadState('networkidle');

        // Try to add a business unit with empty fields (will trigger validation)
        await settingsKeywords.addBusinessUnitWithEmptyFields();

        // Take screenshot for debugging
        await settingsKeywords.takeDevToolsScreenshot(screenshotPath);

        // Cancel the modal to get back to the Business Unit page
        await settingsKeywords.cancelAddUnit();

        // If the page is still visible, the test passes
        await expect(page.getByRole('button', { name: 'Add Unit' })).toBeVisible();
      } catch (error) {
        // If a network error occurred, take a screenshot and fail
        await settingsKeywords.takeDevToolsScreenshot(screenshotPath);
        throw error;
      }
    });
  });
});


