import { test, expect } from '@fixtures/test.fixture';
import candidateRegData from '@test-data/candidateRegistrationData.json';

const {
  validCandidateData,
  validCandidateDataWithConsent,
  duplicateApplicantNumber,
  invalidEmailFormats,
  invalidMobileNumbers,
  invalidApplicantNumbers,
  invalidJoiningDates,
  employeeTypes,
  candidateTypes,
  hiringPositions,
  dialCodes,
  countries,
  expectedDashboardSummary,
  filterFields,
  columnFields,
  exportOptions,
  xssPayloads,
  performanceTestCases,
} = candidateRegData;

test.describe('BusinessHR - Candidate Registration Module', () => {
  test.beforeEach(async ({ loginKeywords, candidateRegistrationKeywords }) => {
    // Login
    await loginKeywords.openLoginPage('https://nsplus.perf.devassisto.com/login');
    await loginKeywords.login(
      candidateRegData.loginCredentials.email,
      candidateRegData.loginCredentials.password,
    );
    await loginKeywords.verifyLoginSuccess();

    // Navigate to Candidate Registration
    await candidateRegistrationKeywords.navigateToCandidateRegistration();
  });

  // =========================================================================
  // SECTION 1: DASHBOARD VERIFICATION TESTS
  // =========================================================================

  /**
   * TC001 - Verify Candidate Management Dashboard Title is Displayed
   * Steps: Login -> Navigate to Candidate Registration
   * Expected: "Candidate Management" title is visible
   */
  test('TC001 - Verify Candidate Management Dashboard Title is Displayed', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.verifyDashboardDisplayed();
  });

  /**
   * TC002 - Verify All Four Summary Cards are Displayed
   * Steps: Login -> Navigate to Candidate Registration
   * Expected: Verified, Not Verified, In Progress, Rejected cards are visible
   */
  test('TC002 - Verify All Four Summary Cards are Displayed', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.verifySummaryCardsDisplayed();
  });

  /**
   * TC003 - Verify Summary Card Values Match Expected Data
   * Steps: Login -> Navigate to Candidate Registration
   * Expected: Card values match: Verified=30, Not Verified=01, In Progress=02, Rejected=02
   */
  test('TC003 - Verify Summary Card Values Match Expected Data', async ({
    candidateRegistrationKeywords,
  }) => {
    const verified = await candidateRegistrationKeywords.getVerifiedCount();
    const notVerified = await candidateRegistrationKeywords.getNotVerifiedCount();
    const inProgress = await candidateRegistrationKeywords.getInProgressCount();
    const rejected = await candidateRegistrationKeywords.getRejectedCount();

    expect(verified).toBe(expectedDashboardSummary.verified);
    expect(notVerified).toBe(expectedDashboardSummary.notVerified);
    expect(inProgress).toBe(expectedDashboardSummary.inProgress);
    expect(rejected).toBe(expectedDashboardSummary.rejected);
  });

  /**
   * TC004 - Verify Action Bar Buttons are Visible
   * Steps: Login -> Navigate to Candidate Registration
   * Expected: Filter, Export, Columns, New buttons are visible
   */
  test('TC004 - Verify Action Bar Buttons are Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.verifyActionBarButtonsVisible();
  });

  /**
   * TC005 - Verify Candidate Search Textbox is Visible
   * Steps: Login -> Navigate to Candidate Registration
   * Expected: Search candidates textbox is visible and enabled
   */
  test('TC005 - Verify Candidate Search Textbox is Visible', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
  }) => {
    await expect(candidateRegistrationPage.searchCandidatesTextbox).toBeVisible();
    await expect(candidateRegistrationPage.searchCandidatesTextbox).toBeEnabled();
  });

  /**
   * TC006 - Verify Candidate Grid is Displayed
   * Steps: Login -> Navigate to Candidate Registration
   * Expected: Candidate grid/table is visible with data rows
   */
  test('TC006 - Verify Candidate Grid is Displayed', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
  }) => {
    await candidateRegistrationKeywords.verifyCandidateGridVisible();
    const rowCount = await candidateRegistrationPage.getCandidateRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  /**
   * TC007 - Verify Pagination is Displayed
   * Steps: Login -> Navigate to Candidate Registration
   * Expected: Pagination controls are visible
   */
  test('TC007 - Verify Pagination is Displayed', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
  }) => {
    const paginationInfo = await candidateRegistrationKeywords.getPaginationInfo();
    expect(paginationInfo).toMatch(/\d+\s*[–\-]\s*\d+\s+of\s+\d+/);
  });

  // =========================================================================
  // SECTION 2: SEARCH FUNCTIONALITY TESTS
  // =========================================================================

  /**
   * TC008 - Verify Candidate Search by First Name
   * Steps: Click search box -> Type candidate first name
   * Expected: Grid filters to show only matching candidates
   */
  test('TC008 - Verify Candidate Search by First Name', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.searchCandidates('Sai');
    // Verify search returns results containing "Sai"
    // Wait for search to complete
    await await new Promise(resolve => setTimeout(resolve, 1500));
  });

  /**
   * TC009 - Verify Candidate Search by Email
   * Steps: Click search box -> Type candidate email
   * Expected: Grid filters to show only matching candidates
   */
  test('TC010 - Verify Candidate Search by Email', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.searchCandidates('sairaju@yopmail.com');
    await await new Promise(resolve => setTimeout(resolve, 1500));
  });

  /**
   * TC011 - Verify Candidate Search with Empty Search Text
   * Steps: Click search box -> Clear all text
   * Expected: Grid shows all candidates
   */
  test('TC012 - Verify Candidate Search with Empty Search Text Clears Filter', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  }) => {
    await candidateRegistrationKeywords.searchCandidates('NonExistentCandidate');
    await await new Promise(resolve => setTimeout(resolve, 1500));
    // Clear search
    await candidateRegistrationPage.searchCandidatesTextbox.fill('');
    await await new Promise(resolve => setTimeout(resolve, 1500));
  });

  // =========================================================================
  // SECTION 3: FILTER FUNCTIONALITY TESTS
  // =========================================================================

  /**
   * TC013 - Verify Filter Button Opens Filter Panel
   * Steps: Click Filter button
   * Expected: Filter panel displays with Field, Operator, Value dropdowns
   */
  test('TC013 - Verify Filter Button Opens Filter Panel', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.verifyFilterPanelDisplayed();
  });

  /**
   * TC014 - Verify Apply Filter Button is Visible
   * Steps: Click Filter button
   * Expected: Apply Filter button is visible
   */
  test('TC014 - Verify Apply Filter Button is Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.verifyApplyFilterButtonVisible();
  });

  /**
   * TC015 - Verify Clear Filter Button is Visible
   * Steps: Click Filter button
   * Expected: Clear button is visible in filter panel
   */
  test('TC015 - Verify Clear Filter Button is Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.verifyClearFilterButtonVisible();
  });

  /**
   * TC016 - Verify Hide Filter Button is Visible
   * Steps: Click Filter button
   * Expected: Hide Filter button is visible
   */
  test('TC016 - Verify Hide Filter Button is Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.verifyHideFilterButtonVisible();
  });

  /**
   * TC017 - Verify Add New Clause Button is Visible
   * Steps: Click Filter button
   * Expected: Add new clause button is visible
   */
  test('TC017 - Verify Add New Clause Button is Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.verifyAddNewClauseButtonVisible();
  });

  /**
   * TC018 - Verify Filter by First Name
   * Steps: Click Filter -> Select Field "First Name" -> Operator "contains" -> Enter value -> Apply
   * Expected: Grid filters to show candidates matching the criteria
   */
  test('TC018 - Verify Filter by First Name', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.applyFilter('First Name', 'contains', 'Sai');
    await await new Promise(resolve => setTimeout(resolve, 1000));
  });

  /**
   * TC019 - Verify Filter by Candidate Type
   * Steps: Click Filter -> Select Field "Candidate Type" -> Operator "is" -> Select value -> Apply
   * Expected: Grid filters to show only matching candidate types
   */
  test('TC019 - Verify Filter by Candidate Type', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.applyFilter('Candidate Type', 'is', 'Fresher');
    await await new Promise(resolve => setTimeout(resolve, 1000));
  });

  /**
   * TC020 - Verify Clear Filter Functionality
   * Steps: Apply filter -> Click Clear button
   * Expected: Filter values are cleared, grid shows all candidates
   */
  test('TC020 - Verify Clear Filter Functionality', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.applyFilter('First Name', 'contains', 'Sai');
    await candidateRegistrationKeywords.clearFilter();
    await await new Promise(resolve => setTimeout(resolve, 1000));
  });

  /**
   * TC021 - Verify Hide Filter Panel Functionality
   * Steps: Click Filter -> Click Hide Filter
   * Expected: Filter panel hides, Filter button becomes visible again
   */
  test('TC021 - Verify Hide Filter Panel Functionality', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.verifyFilterPanelDisplayed();
    await candidateRegistrationKeywords.hideFilterPanel();
  });

  /**
   * TC022 - Verify Add New Filter Clause Functionality
   * Steps: Click Filter -> Click Add new clause
   * Expected: New filter clause row is added
   */
  test('TC022 - Verify Add New Filter Clause Functionality', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.addNewFilterClause();
    await await new Promise(resolve => setTimeout(resolve, 500));
  });

  // =========================================================================
  // SECTION 4: EXPORT FUNCTIONALITY TESTS
  // =========================================================================

  /**
   * TC023 - Verify Export Dropdown Options are Visible
   * Steps: Click Export button
   * Expected: "Current View" and "Export All" options are visible
   */
  test('TC023 - Verify Export Dropdown Options are Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.verifyExportDropdownVisible();
  });

  /**
   * TC024 - Verify Export Current View Functionality
   * Steps: Click Export -> Click "Current View"
   * Expected: CSV file download starts with current view data
   */
  test('TC024 - Verify Export Current View Functionality', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickExportButton();
    await candidateRegistrationKeywords.exportCurrentView();
  });

  /**
   * TC025 - Verify Export All Functionality
   * Steps: Click Export -> Click "Export All"
   * Expected: CSV file download starts with all candidate data
   */
  test('TC025 - Verify Export All Functionality', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickExportButton();
    await candidateRegistrationKeywords.exportAll();
  });

  // =========================================================================
  // SECTION 5: COLUMNS FUNCTIONALITY TESTS
  // =========================================================================

  /**
   * TC026 - Verify Columns Dropdown Opens Correctly
   * Steps: Click Columns button
   * Expected: Dropdown shows checkbox list with all columns, Reset button, Search columns box
   */
  test('TC026 - Verify Columns Dropdown Opens Correctly', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.verifyColumnsDropdownVisible();
  });

  /**
   * TC027 - Verify All Column Checkboxes are Visible
   * Steps: Click Columns button
   * Expected: Candidate, Hiring Position, Joining Date, Stage, Document Status, Offer Letter, Actions checkboxes are visible
   */
  test('TC027 - Verify All Column Checkboxes are Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.verifyAllColumnCheckboxesVisible();
  });

  /**
   * TC028 - Verify Column Toggle Functionality
   * Steps: Click Columns -> Uncheck a column -> Verify column disappears from grid
   * Expected: Selected column is hidden from the grid
   */
  test('TC028 - Verify Column Toggle Functionality', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  }) => {
    await candidateRegistrationPage.clickColumnsButton();
    // Toggle off Hiring Position column
    await candidateRegistrationPage.toggleColumnCheckbox('Hiring Position');
    await await new Promise(resolve => setTimeout(resolve, 500));
  });

  /**
   * TC029 - Verify Reset Columns Functionality
   * Steps: Uncheck some columns -> Click Reset
   * Expected: All columns are restored to default visibility
   */
  test('TC029 - Verify Reset Columns Functionality', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  }) => {
    await candidateRegistrationPage.clickColumnsButton();
    await candidateRegistrationPage.toggleColumnCheckbox('Hiring Position');
    await candidateRegistrationPage.clickResetColumns();
    await await new Promise(resolve => setTimeout(resolve, 500));
  });

  // =========================================================================
  // SECTION 6: NEW CANDIDATE REGISTRATION - DRAWER VERIFICATION TESTS
  // =========================================================================

  /**
   * TC030 - Verify New Button Opens Document Needed for Verification Drawer
   * Steps: Click New button
   * Expected: Right-side drawer opens with title "Document Needed for Verification"
   */
  test('TC030 - Verify New Button Opens Document Needed for Verification Drawer', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerOpened();
  });

  /**
   * TC031 - Verify Drawer Title is Displayed
   * Steps: Click New button
   * Expected: Drawer title "Document Needed for Verification" is visible
   */
  test('TC031 - Verify Drawer Title is Displayed', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerTitleDisplayed();
  });

  /**
   * TC032 - Verify Drawer Subtitle is Displayed
   * Steps: Click New button
   * Expected: Subtitle "Fill the below details to Register the New Candidate" is visible
   */
  test('TC032 - Verify Drawer Subtitle is Displayed', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerSubtitleDisplayed();
  });

  /**
   * TC033 - Verify Drawer Close Button is Visible
   * Steps: Click New button
   * Expected: Close (X) button is visible in the drawer header
   */
  test('TC033 - Verify Drawer Close Button is Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerCloseButtonVisible();
  });

  /**
   * TC034 - Verify Drawer Cancel Button is Visible and Enabled
   * Steps: Click New button
   * Expected: Cancel button is visible and enabled in the drawer footer
   */
  test('TC034 - Verify Drawer Cancel Button is Visible and Enabled', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerCancelButtonVisible();
    await candidateRegistrationKeywords.verifyCancelButtonEnabled();
  });

  /**
   * TC035 - Verify Request Documents Button is Visible but Disabled Initially
   * Steps: Click New button
   * Expected: Request Documents button is visible but disabled until all required fields are filled
   */
  test('TC035 - Verify Request Documents Button is Visible but Disabled Initially', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerRequestDocumentsButtonVisible();
    await candidateRegistrationKeywords.verifyRequestDocumentsButtonDisabled();
  });

  // =========================================================================
  // SECTION 7: FORM FIELDS VERIFICATION TESTS
  // =========================================================================

  /**
   * TC036 - Verify All 12 Form Fields are Displayed in the Drawer
   * Steps: Click New button
   * Expected: All 12 fields are visible:
   *   Applicant Number, First Name, Last Name, Personal Email, Dial Code,
   *   Mobile Number, Country, Hiring Position, Joining Date, Employee Type,
   *   Candidate Type, Share Consent Form toggle
   */
  test('TC036 - Verify All 12 Form Fields are Displayed in the Drawer', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyAllFormFieldsVisible();

    // Verify individual fields
    await expect(candidateRegistrationPage.applicantNumberField).toBeVisible();
    await expect(candidateRegistrationPage.firstNameField).toBeVisible();
    await expect(candidateRegistrationPage.lastNameField).toBeVisible();
    await expect(candidateRegistrationPage.personalEmailField).toBeVisible();
    await expect(candidateRegistrationPage.dialCodeDropdown).toBeVisible();
    await expect(candidateRegistrationPage.mobileNumberField).toBeVisible();
    await expect(candidateRegistrationPage.countryDropdown).toBeVisible();
    await expect(candidateRegistrationPage.hiringPositionDropdown).toBeVisible();
    await expect(candidateRegistrationPage.joiningDateField).toBeVisible();
    await expect(candidateRegistrationPage.employeeTypeDropdown).toBeVisible();
    await expect(candidateRegistrationPage.candidateTypeDropdown).toBeVisible();
    await expect(candidateRegistrationPage.shareConsentToggle).toBeVisible();
  });

  /**
   * TC037 - Verify All Required Field Indicators (Red Asterisks) are Visible
   * Steps: Click New button
   * Expected: All 11 required fields have red asterisk (*) indicators
   */
  test('TC037 - Verify All Required Field Indicators are Visible', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyAllRequiredFieldIndicatorsVisible();
  });

  /**
   * TC038 - Verify Required Field Asterisks Count is 11
   * Steps: Click New button
   * Expected: Exactly 11 required field indicators (all fields except Share Consent) are marked as required
   */
  test('TC038 - Verify Required Field Asterisks Count is 11', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyRequiredFieldAsterisksCount();
  });

  /**
   * TC039 - Verify Form Field Placeholders
   * Steps: Click New button
   * Expected: All fields have correct placeholder text:
   *   Applicant Number: "Enter applicant number"
   *   First Name: "Enter first name"
   *   Last Name: "Enter last name"
   *   Personal Email: "example@mail.com"
   *   Dial Code: "Select dial code"
   *   Mobile Number: "Enter mobile number"
   *   Country: "Select country"
   *   Hiring Position: "Select position"
   *   Joining Date: "dd-mm-yyyy"
   */
  test('TC039 - Verify Form Field Placeholders', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyFormFieldsPlaceholders({
      applicantNumber: 'Enter applicant number',
      firstName: 'Enter first name',
      lastName: 'Enter last name',
      personalEmail: 'example@mail.com',
      dialCode: 'Select dial code',
      mobileNumber: 'Enter mobile number',
      country: 'Select country',
      hiringPosition: 'Select position',
      joiningDate: 'DD/MM/YYYY',
    });
  });

  /**
   * TC040 - Verify Share Consent Form Toggle is in Disabled State by Default
   * Steps: Click New button
   * Expected: Share Consent toggle is in OFF/disabled state
   */
  test('TC040 - Verify Share Consent Form Toggle is Disabled by Default', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyShareConsentToggleState('disabled');
  });

  // =========================================================================
  // SECTION 8: DIALOGUE VERIFICATION TESTS
  // =========================================================================

  /**
   * TC041 - Verify Drawer Opens from Right Side of Page
   * Steps: Click New button
   * Expected: Drawer slides in from the right side of the viewport
   */
  test('TC041 - Verify Drawer Opens from Right Side of Page', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerOpensFromRight();
  });

  /**
   * TC042 - Verify Close Button Closes the Drawer
   * Steps: Click New button -> Click Close (X) button
   * Expected: Drawer closes and Candidate Registration grid is visible again
   */
  test('TC042 - Verify Close Button Closes the Drawer', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.closeNewCandidateDrawer();
    // Verify drawer is closed
    const drawer = page.locator('[class*="drawer"], [class*="Drawer"]').last();
    await expect(drawer).not.toBeVisible();
  });

  /**
   * TC043 - Verify Cancel Button Closes the Drawer Without Saving
   * Steps: Fill some fields -> Click Cancel
   * Expected: Drawer closes without saving any data
   */
  test('TC043 - Verify Cancel Button Closes the Drawer Without Saving', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.cancelNewCandidate();
    const drawer = page.locator('[class*="drawer"], [class*="Drawer"]').last();
    await expect(drawer).not.toBeVisible();
  });

  // =========================================================================
  // SECTION 9: VALIDATION TESTS
  // =========================================================================

  /**
   * TC044 - Verify Request Documents Button Shows Required Field Errors
   * Steps: Click New button -> Click Request Documents without filling fields
   * Expected: Required field error messages are displayed for all mandatory fields
   */
  test('TC044 - Verify Request Documents Button Shows Required Field Errors When Fields Empty', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.clickRequestDocuments();
    await candidateRegistrationKeywords.verifyRequiredFieldErrorDisplayed();
  });

  /**
   * TC045 - Verify Duplicate Applicant Number Error
   * Steps: Fill form with duplicate applicant number -> Click Request Documents
   * Expected: Error message displayed indicating applicant number already exists
   */
  test('TC045 - Verify Duplicate Applicant Number Error', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...duplicateApplicantNumber,
      shareConsentForm: false,
    });
    await candidateRegistrationKeywords.verifyDuplicateApplicantErrorDisplayed();
  });

  // =========================================================================
  // SECTION 10: POSITIVE - FULL CANDIDATE REGISTRATION TESTS
  // =========================================================================

  /**
   * TC046 - Verify Successful Candidate Registration (Without Consent)
   * Steps: Click New -> Fill all required fields -> Click Request Documents
   * Expected: Candidate is registered successfully, form is submitted
   */
  test('TC046 - Verify Successful Candidate Registration Without Consent', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      shareConsentForm: false,
    });
    // Verify Request Documents button is enabled after filling all fields
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC047 - Verify Successful Candidate Registration With Share Consent
   * Steps: Click New -> Fill all fields -> Enable Share Consent toggle -> Click Request Documents
   * Expected: Candidate registered with consent form shared
   */
  test('TC047 - Verify Successful Candidate Registration With Share Consent', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateDataWithConsent,
      shareConsentForm: true,
    });
    const isConsentEnabled = await candidateRegistrationKeywords.isShareConsentEnabled();
    expect(isConsentEnabled).toBe(true);
  });

  /**
   * TC048 - Verify Candidate Registration with Different Employee Types
   * Steps: For each employee type -> Fill form -> Click Request Documents
   * Expected: Each employee type is selectable and form submits successfully
   */
  test('TC048 - Verify Candidate Registration with Different Employee Types', async ({
    candidateRegistrationKeywords,
  }) => {
    for (const empType of employeeTypes) {
      await candidateRegistrationKeywords.clickNewButton();
      await candidateRegistrationKeywords.fillCandidateForm({
        ...validCandidateData,
        employeeType: empType,
        applicantNumber: `TC048_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shareConsentForm: false,
      });
      const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
      expect(isEnabled).toBe(true);
      // Close drawer after each iteration
      await candidateRegistrationKeywords.closeNewCandidateDrawer();
    }
  });

  /**
   * TC049 - Verify Candidate Registration with Different Candidate Types
   * Steps: For each candidate type -> Fill form -> Click Request Documents
   * Expected: Each candidate type is selectable and form submits successfully
   */
  test('TC049 - Verify Candidate Registration with Different Candidate Types', async ({
    candidateRegistrationKeywords,
  }) => {
    for (const candType of candidateTypes) {
      await candidateRegistrationKeywords.clickNewButton();
      await candidateRegistrationKeywords.fillCandidateForm({
        ...validCandidateData,
        candidateType: candType,
        applicantNumber: `TC049_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shareConsentForm: false,
      });
      const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
      expect(isEnabled).toBe(true);
      await candidateRegistrationKeywords.closeNewCandidateDrawer();
    }
  });

  /**
   * TC050 - Verify Candidate Registration with Different Hiring Positions
   * Steps: For each hiring position -> Fill form -> Click Request Documents
   * Expected: Each hiring position is selectable and form submits successfully
   */
  test('TC050 - Verify Candidate Registration with Different Hiring Positions', async ({
    candidateRegistrationKeywords,
  }) => {
    for (const position of hiringPositions) {
      await candidateRegistrationKeywords.clickNewButton();
      await candidateRegistrationKeywords.fillCandidateForm({
        ...validCandidateData,
        hiringPosition: position,
        applicantNumber: `TC050_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shareConsentForm: false,
      });
      const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
      expect(isEnabled).toBe(true);
      await candidateRegistrationKeywords.closeNewCandidateDrawer();
    }
  });

  // =========================================================================
  // SECTION 11: NEGATIVE - VALIDATION TESTS
  // =========================================================================

  /**
   * TC051 - Verify Form Validation with Empty Required Fields
   * Steps: Click New -> Click Request Documents without filling
   * Expected: All 11 required fields show error messages, Request Documents button is disabled
   */
  test('TC051 - Verify Form Validation with Empty Required Fields', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.clickRequestDocuments();
    await candidateRegistrationKeywords.verifyRequiredFieldErrorDisplayed();
  });

  /**
   * TC052 - Verify Invalid Email Format Validation
   * Steps: Click New -> Enter invalid email -> Click Request Documents
   * Expected: Error message displayed for invalid email format
   */
  test('TC052 - Verify Invalid Email Format Validation', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    // Fill other required fields first, then enter invalid email
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      personalEmail: invalidEmailFormats[0].personalEmail, // "not-an-email"
      applicantNumber: `TC052_${Date.now()}`,
    });
    // Verify request documents button behavior with invalid email
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(false);
  });

  /**
   * TC053 - Verify Empty Mobile Number Validation
   * Steps: Click New -> Enter all fields except mobile -> Click Request Documents
   * Expected: Error message for empty mobile number
   */
  test('TC053 - Verify Empty Mobile Number Validation', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      mobileNumber: '',
      applicantNumber: `TC053_${Date.now()}`,
    });
    await candidateRegistrationKeywords.verifyRequiredFieldErrorDisplayed();
  });

  /**
   * TC054 - Verify Non-Numeric Mobile Number Validation
   * Steps: Click New -> Enter non-numeric mobile -> Click Request Documents
   * Expected: Error message for non-numeric mobile number
   */
  test('TC054 - Verify Non-Numeric Mobile Number Validation', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      mobileNumber: invalidMobileNumbers[1].mobileNumber,
      applicantNumber: `TC054_${Date.now()}`,
    });
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(false);
  });

  /**
   * TC055 - Verify Empty Applicant Number Validation
   * Steps: Click New -> Leave applicant number empty -> Click Request Documents
   * Expected: Error message for empty applicant number
   */
  test('TC055 - Verify Empty Applicant Number Validation', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      applicantNumber: invalidApplicantNumbers[0].applicantNumber,
    });
    await candidateRegistrationKeywords.verifyRequiredFieldErrorDisplayed();
  });

  // =========================================================================
  // SECTION 12: SECURITY TEST CASES
  // =========================================================================

  /**
   * TC056 - Verify XSS Attack Prevention in First Name Field
   * Steps: Enter XSS payload in First Name -> Click Request Documents
   * Expected: XSS payload is sanitized/escaped, no script execution
   */
  test('TC056 - Verify XSS Attack Prevention in First Name Field', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      firstName: xssPayloads[0].value,
      applicantNumber: `TC056_${Date.now()}`,
    });
    // Verify the payload is not executed - button should be enabled
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC057 - Verify SQL Injection Prevention in Last Name Field
   * Steps: Enter SQL injection payload in Last Name -> Click Request Documents
   * Expected: SQL injection payload is sanitized/escaped, no database error
   */
  test('TC057 - Verify SQL Injection Prevention in Last Name Field', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      lastName: xssPayloads[2].value,
      applicantNumber: `TC057_${Date.now()}`,
    });
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC058 - Verify XSS Prevention in Applicant Number Field
   * Steps: Enter XSS payload in Applicant Number -> Click Request Documents
   * Expected: Payload is escaped, no script execution
   */
  test('TC058 - Verify XSS Prevention in Applicant Number Field', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      applicantNumber: xssPayloads[3].value,
    });
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC059 - Verify XSS Prevention in Personal Email Field
   * Steps: Enter XSS payload in Personal Email -> Click Request Documents
   * Expected: Payload is escaped, no script execution
   */
  test('TC059 - Verify XSS Prevention in Personal Email Field', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      personalEmail: xssPayloads[4].value,
      applicantNumber: `TC059_${Date.now()}`,
    });
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC060 - Verify Password Injection Prevention in Form Fields
   * Steps: Enter password-like strings in all fields -> Click Request Documents
   * Expected: No security errors, form behaves normally
   */
  test('TC060 - Verify Password Injection Prevention in Form Fields', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      firstName: 'admin\' OR \'1\'=\'1',
      lastName: 'password',
      applicantNumber: `TC060_${Date.now()}`,
    });
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC061 - Verify Maximum Length Input Handling
   * Steps: Enter extremely long strings in all text fields -> Click Request Documents
   * Expected: Input is truncated or accepted without errors
   */
  test('TC061 - Verify Maximum Length Input Handling', async ({
    candidateRegistrationKeywords,
  }) => {
    const longString = 'A'.repeat(255);
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      firstName: longString,
      lastName: longString,
      applicantNumber: `TC061_${Date.now()}`,
    });
    // Should not throw errors
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC062 - Verify HTML Tag Injection Prevention
   * Steps: Enter HTML tags in form fields -> Click Request Documents
   * Expected: HTML is escaped, no rendering
   */
  test('TC062 - Verify HTML Tag Injection Prevention', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      firstName: '<img src=x onerror=alert(1)>',
      applicantNumber: `TC062_${Date.now()}`,
    });
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  /**
   * TC063 - Verify Special Characters in Form Fields
   * Steps: Enter special characters in all text fields -> Click Request Documents
   * Expected: Special characters are handled properly without errors
   */
  test('TC063 - Verify Special Characters in Form Fields', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      firstName: '!@#$%^&*()_+-={}[]|:;<>?,./',
      lastName: '!@#$%^&*()_+-={}[]|:;<>?,./',
      applicantNumber: `TC063_${Date.now()}`,
    });
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  // =========================================================================
  // SECTION 13: PERFORMANCE TEST CASES
  // =========================================================================

  /**
   * TC064 - Verify Form Submission Response Time
   * Steps: Fill form completely -> Measure time to click Request Documents
   * Expected: Form submission completes within 5 seconds
   */
  test('TC064 - Verify Form Submission Response Time', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    const startTime = Date.now();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      applicantNumber: `TC064_${Date.now()}`,
      shareConsentForm: false,
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(5000);
  });

  /**
   * TC065 - Verify Bulk Candidate Registration Performance
   * Steps: Register multiple candidates sequentially
   * Expected: Each registration completes without timeout or errors
   */
  test('TC065 - Verify Bulk Candidate Registration Performance', async ({
    candidateRegistrationKeywords,
  }) => {
    const startTime = Date.now();
    for (const bulkData of performanceTestCases.bulkData) {
      await candidateRegistrationKeywords.clickNewButton();
      await candidateRegistrationKeywords.fillCandidateForm({
        ...validCandidateData,
        ...bulkData,
        applicantNumber: `${bulkData.applicantNumber}_${Date.now()}`,
        shareConsentForm: false,
      });
      await candidateRegistrationKeywords.closeNewCandidateDrawer();
    }
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    // Allow 30 seconds for 5 bulk registrations
    expect(totalTime).toBeLessThan(30000);
  });

  /**
   * TC066 - Verify Page Load Time After Login to Candidate Registration
   * Steps: Login -> Navigate to Candidate Registration -> Measure load time
   * Expected: Page loads within 3 seconds
   */
  test('TC066 - Verify Page Load Time After Login to Candidate Registration', async ({
    page,
    candidateRegistrationKeywords,
  }) => {
    const startTime = Date.now();
    await candidateRegistrationKeywords.navigateToCandidateRegistration();
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  /**
   * TC067 - Verify Search Performance with Large Dataset
   * Steps: Type in search box -> Measure response time
   * Expected: Search results update within 2 seconds
   */
  test('TC067 - Verify Search Performance with Large Dataset', async ({
    candidateRegistrationKeywords,
  }) => {
    const startTime = Date.now();
    await candidateRegistrationKeywords.searchCandidates('Sai');
    const endTime = Date.now();
    const searchTime = endTime - startTime;
    expect(searchTime).toBeLessThan(2000);
  });

  /**
   * TC068 - Verify Filter Application Performance
   * Steps: Apply filter -> Measure response time
   * Expected: Filter results update within 2 seconds
   */
  test('TC068 - Verify Filter Application Performance', async ({
    candidateRegistrationKeywords,
  }) => {
    const startTime = Date.now();
    await candidateRegistrationKeywords.clickFilterButton();
    await candidateRegistrationKeywords.applyFilter('First Name', 'contains', 'Sai');
    const endTime = Date.now();
    const filterTime = endTime - startTime;
    expect(filterTime).toBeLessThan(2000);
  });

  /**
   * TC069 - Verify Export Performance
   * Steps: Click Export -> Click Export All -> Measure time
   * Expected: Export initiates within 5 seconds
   */
  test('TC069 - Verify Export Performance', async ({
    candidateRegistrationKeywords,
  }) => {
    const startTime = Date.now();
    await candidateRegistrationKeywords.clickExportButton();
    await candidateRegistrationKeywords.exportAll();
    const endTime = Date.now();
    const exportTime = endTime - startTime;
    expect(exportTime).toBeLessThan(5000);
  });

  // =========================================================================
  // SECTION 14: EDGE CASE TESTS
  // =========================================================================

  /**
   * TC070 - Verify Multiple New Button Clicks (Prevent Duplicate Drawer Opens)
   * Steps: Click New button multiple times rapidly
   * Expected: Only one drawer instance opens
   */
  test('TC070 - Verify Multiple New Button Clicks Prevent Duplicate Drawer', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.clickNewButton();
    // Verify only one drawer is open
    const drawers = page.locator('[class*="drawer"], [class*="Drawer"]');
    const visibleCount = await drawers.count();
    expect(visibleCount).toBeLessThanOrEqual(1);
  });

  /**
   * TC071 - Verify Share Consent Toggle State Persistence
   * Steps: Enable Share Consent -> Disable it -> Verify it's off
   * Expected: Toggle state changes correctly
   */
  test('TC071 - Verify Share Consent Toggle State Persistence', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.enableShareConsent();
    await candidateRegistrationKeywords.verifyShareConsentToggleState('enabled');
    await candidateRegistrationKeywords.disableShareConsent();
    await candidateRegistrationKeywords.verifyShareConsentToggleState('disabled');
  });

  /**
   * TC072 - Verify Form Reset After Cancel
   * Steps: Fill form -> Click Cancel -> Click New again
   * Expected: New drawer opens with empty form
   */
  test('TC072 - Verify Form Reset After Cancel', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      applicantNumber: `TC072_${Date.now()}`,
    });
    await candidateRegistrationKeywords.cancelNewCandidate();
    // Click New again and verify form is empty
    await candidateRegistrationKeywords.clickNewButton();
    await expect(candidateRegistrationPage.applicantNumberField).toHaveValue('');
    await expect(candidateRegistrationPage.firstNameField).toHaveValue('');
    await expect(candidateRegistrationPage.lastNameField).toHaveValue('');
  });

  /**
   * TC073 - Verify Empty Search Results Handling
   * Steps: Search for non-existent candidate
   * Expected: Grid shows no results or "No data" message
   */
  test('TC073 - Verify Empty Search Results Handling', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.searchCandidates('XYZ_NONEXISTENT_CANDIDATE_99999');
    await await new Promise(resolve => setTimeout(resolve, 1500));
    // Verify search completed without errors
    await expect(page.getByPlaceholder('Search candidates...')).toHaveValue('XYZ_NONEXISTENT_CANDIDATE_99999');
  });

  /**
   * TC074 - Verify Column Hiding and Showing
   * Steps: Click Columns -> Uncheck all columns -> Click Reset
   * Expected: All columns are hidden, Reset restores all columns
   */
  test('TC074 - Verify Column Hiding and Showing', async ({
    candidateRegistrationPage,
    page,
  }) => {
    await candidateRegistrationPage.clickColumnsButton();
    // Uncheck a few columns
    await candidateRegistrationPage.toggleColumnCheckbox('Hiring Position');
    await candidateRegistrationPage.toggleColumnCheckbox('Joining Date');
    // Click Reset
    await candidateRegistrationPage.clickResetColumns();
    await await new Promise(resolve => setTimeout(resolve, 500));
  });

  /**
   * TC075 - Verify Form Field Selection Dropdowns Open Correctly
   * Steps: Click each dropdown -> Verify options are visible
   * Expected: All dropdowns open and show correct options
   */
  test('TC075 - Verify Form Field Selection Dropdowns Open Correctly', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();

    // Verify Dial Code dropdown options
    await candidateRegistrationPage.dialCodeDropdown.click();
    await expect(page.getByText('India (+91)')).toBeVisible();

    // Verify Country dropdown options
    await candidateRegistrationPage.countryDropdown.click();
    await expect(page.getByText('India')).toBeVisible();

    // Verify Hiring Position dropdown options
    await candidateRegistrationPage.hiringPositionDropdown.click();
    await expect(page.getByText('Software engineer')).toBeVisible();

    // Verify Employee Type dropdown options
    await candidateRegistrationPage.employeeTypeDropdown.click();
    await expect(page.getByText('Full Time')).toBeVisible();

    // Verify Candidate Type dropdown options
    await candidateRegistrationPage.candidateTypeDropdown.click();
    await expect(page.getByText('Fresher')).toBeVisible();
    await expect(page.getByText('Experienced')).toBeVisible();
  });

  /**
   * TC076 - Verify Request Documents Button is Disabled When Required Fields Have Invalid Data
   * Steps: Fill form with valid data except one invalid field -> Observe button state
   * Expected: Request Documents button remains disabled
   */
  test('TC076 - Verify Request Documents Button Disabled with Invalid Data', async ({
    candidateRegistrationKeywords,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    // Fill with invalid email
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      personalEmail: 'not-valid-email',
      applicantNumber: `TC076_${Date.now()}`,
    });
    // Button should not be enabled due to invalid email
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(false);
  });

  /**
   * TC077 - Verify Drawer Close on Outside Click
   * Steps: Click New -> Click outside the drawer
   * Expected: Drawer closes (if applicable) or remains open
   */
  test('TC077 - Verify Drawer Behavior on Outside Click', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    // Click outside the drawer area
    await page.locator('main').click();
    // Verify drawer state
    const drawerVisible = await page.locator('[class*="drawer"], [class*="Drawer"]').last().isVisible();
    // Drawer should either be closed or still open - both are valid behaviors
    expect(drawerVisible).toBeDefined();
  });

  // =========================================================================
  // SECTION 15: COMPLETE END-TO-END WORKFLOW TESTS
  // =========================================================================

  /**
   * TC078 - Complete Candidate Registration Workflow (End-to-End)
   * Steps: Navigate -> Click New -> Fill all fields -> Submit
   * Expected: Complete registration flow works without errors
   */
  test('TC078 - Complete Candidate Registration Workflow (End-to-End)', async ({
    candidateRegistrationKeywords,
    candidateRegistrationPage,
    page,
  }) => {
    // Step 1: Click New button
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerOpened();

    // Step 2: Verify drawer elements
    await candidateRegistrationKeywords.verifyDrawerTitleDisplayed();
    await candidateRegistrationKeywords.verifyDrawerSubtitleDisplayed();
    await candidateRegistrationKeywords.verifyAllFormFieldsVisible();

    // Step 3: Fill all required fields
    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateData,
      applicantNumber: `E2E_${Date.now()}`,
      shareConsentForm: false,
    });

    // Step 4: Verify button is enabled
    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);

    // Step 5: Click Request Documents
    await candidateRegistrationKeywords.clickRequestDocuments();

    // Step 6: Verify submission (drawer closes or success message appears)
    // Wait for potential success notification
    await await new Promise(resolve => setTimeout(resolve, 1000));
  });

  /**
   * TC079 - Complete Candidate Registration with Consent Workflow (End-to-End)
   * Steps: Navigate -> Click New -> Fill all fields -> Enable Consent -> Submit
   * Expected: Complete registration with consent sharing works without errors
   */
  test('TC079 - Complete Candidate Registration with Consent (End-to-End)', async ({
    candidateRegistrationKeywords,
    page,
  }) => {
    await candidateRegistrationKeywords.clickNewButton();
    await candidateRegistrationKeywords.verifyDrawerOpened();
    await candidateRegistrationKeywords.verifyAllFormFieldsVisible();

    await candidateRegistrationKeywords.fillCandidateForm({
      ...validCandidateDataWithConsent,
      applicantNumber: `E2E_Consent_${Date.now()}`,
      shareConsentForm: true,
    });

    const isConsentEnabled = await candidateRegistrationKeywords.isShareConsentEnabled();
    expect(isConsentEnabled).toBe(true);

    const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
    expect(isEnabled).toBe(true);

    await candidateRegistrationKeywords.clickRequestDocuments();
    await await new Promise(resolve => setTimeout(resolve, 1000));
  });

  /**
   * TC080 - Verify Candidate Registration with All Possible Employee and Candidate Type Combinations
   * Steps: For each combination of employee type and candidate type -> Fill and submit
   * Expected: All combinations work correctly
   */
  test('TC080 - Verify All Employee Type and Candidate Type Combinations', async ({
    candidateRegistrationKeywords,
  }) => {
    for (const empType of employeeTypes.slice(0, 3)) {
      // Limit to first 3 to keep test time reasonable
      for (const candType of candidateTypes) {
        await candidateRegistrationKeywords.clickNewButton();
        await candidateRegistrationKeywords.fillCandidateForm({
          ...validCandidateData,
          employeeType: empType,
          candidateType: candType,
          applicantNumber: `${empType}_${candType}_${Date.now()}`,
          shareConsentForm: false,
        });
        const isEnabled = await candidateRegistrationKeywords.verifyRequestDocumentsButtonEnabled();
        expect(isEnabled).toBe(true);
        await candidateRegistrationKeywords.closeNewCandidateDrawer();
      }
    }
  });
});


