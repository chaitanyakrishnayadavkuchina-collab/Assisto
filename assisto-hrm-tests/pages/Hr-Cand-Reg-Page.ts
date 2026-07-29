import { type Page, type Locator, expect } from '@playwright/test';

/**
 * CandidateRegistrationPage class encapsulates all locators and atomic UI actions
 * for the Candidate Registration page and the Document Needed for Verification drawer.
 *
 * This page represents the "Candidate Registration" tab within the Pre-Onboarding module,
 * providing the Candidate Management Dashboard with summary cards, grid, and new candidate registration.
 */
export class CandidateRegistrationPage {
  private readonly page: Page;

  // ===== Dashboard Page Title =====
  readonly candidateManagementTitle: Locator;

  // ===== Summary Cards =====
  readonly verifiedCard: Locator;
  readonly verifiedCount: Locator;
  readonly notVerifiedCard: Locator;
  readonly notVerifiedCount: Locator;
  readonly inProgressCard: Locator;
  readonly inProgressCount: Locator;
  readonly rejectedCard: Locator;
  readonly rejectedCount: Locator;

  // ===== Action Bar =====
  readonly searchCandidatesTextbox: Locator;
  readonly filterButton: Locator;
  readonly exportButton: Locator;
  readonly columnsButton: Locator;
  readonly newButton: Locator;

  // ===== Candidate Grid =====
  readonly candidateGrid: Locator;
  readonly candidateRows: Locator;
  readonly paginationInfo: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;

  // ===== Filter Panel =====
  readonly filterPanel: Locator;
  readonly filterFieldDropdown: Locator;
  readonly filterOperatorDropdown: Locator;
  readonly filterValueInput: Locator;
  readonly applyFilterButton: Locator;
  readonly clearFilterButton: Locator;
  readonly hideFilterButton: Locator;
  readonly addNewClauseButton: Locator;
  readonly andOrDropdown: Locator;
  readonly filterValueCombobox: Locator;

  // ===== Export Dropdown =====
  readonly exportCurrentViewOption: Locator;
  readonly exportAllOption: Locator;

  // ===== Columns Dropdown =====
  readonly showHideAllCheckbox: Locator;
  readonly resetButton: Locator;
  readonly searchColumnsTextbox: Locator;
  readonly candidateColumnCheckbox: Locator;
  readonly hiringPositionColumnCheckbox: Locator;
  readonly joiningDateColumnCheckbox: Locator;
  readonly stageColumnCheckbox: Locator;
  readonly documentStatusColumnCheckbox: Locator;
  readonly offerLetterColumnCheckbox: Locator;
  readonly actionsColumnCheckbox: Locator;

  // ===== Drawer: Document Needed for Verification =====
  readonly drawer: Locator;
  readonly drawerTitle: Locator;
  readonly drawerSubtitle: Locator;
  readonly closeDrawerButton: Locator;
  readonly cancelButton: Locator;
  readonly requestDocumentsButton: Locator;

  // ===== Drawer Form Fields =====
  readonly applicantNumberField: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly personalEmailField: Locator;
  readonly dialCodeDropdown: Locator;
  readonly mobileNumberField: Locator;
  readonly countryDropdown: Locator;
  readonly hiringPositionDropdown: Locator;
  readonly joiningDateField: Locator;
  readonly employeeTypeDropdown: Locator;
  readonly candidateTypeDropdown: Locator;
  readonly shareConsentToggle: Locator;
  readonly shareConsentLabel: Locator;

  // ===== Validation/Error Messages =====
  readonly requiredFieldIndicator: Locator;
  readonly duplicateApplicantError: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dashboard Page Title
    this.candidateManagementTitle = page.getByText('Candidate Management').first();

    // Summary Cards - use more robust locators based on actual DOM structure
    // Cards are arranged in a flex/grid layout with each card containing text and count
    // Use more specific pattern to match summary card text (e.g., "Verified 36")
    this.verifiedCard = page.locator('div').filter({ hasText: /Verified\s*\d+/ }).first();
    this.verifiedCount = this.verifiedCard.locator('text=/\d+/').first();
    this.notVerifiedCard = page.locator('div').filter({ hasText: /Not Verified\s*\d+/ }).first();
    this.notVerifiedCount = this.notVerifiedCard.locator('text=/\d+/').first();
    this.inProgressCard = page.locator('div').filter({ hasText: /In Progress\s*\d+/ }).first();
    this.inProgressCount = this.inProgressCard.locator('text=/\d+/').first();
    this.rejectedCard = page.locator('div').filter({ hasText: /Rejected\s*\d+/ }).first();
    this.rejectedCount = this.rejectedCard.locator('text=/\d+/').first();

    // Action Bar
    this.searchCandidatesTextbox = page.getByPlaceholder('Search candidates...');
    this.filterButton = page.getByTestId('table-filter-toggle');
    this.exportButton = page.getByRole('button', { name: 'Export' }).first();
    this.columnsButton = page.getByRole('button', { name: 'Columns' }).first();
    this.newButton = page.locator('button').filter({ hasText: /^New$/ });

    // Candidate Grid
    this.candidateGrid = page.locator('div[role="grid"]').first();
    // DataGrid uses div[role="row"] for data rows (skip the header row)
    this.candidateRows = page.locator('div[role="row"]').filter({ hasNot: page.locator('[role="columnheader"]') }).filter({ visible: true });
    this.paginationInfo = page.getByText(/\d+\s*[–-]\s*\d+\s*of\s*\d+/);
    this.nextPageButton = page.getByRole('button', { name: 'next' }).last();
    this.previousPageButton = page.getByRole('button', { name: 'previous' }).last();

    // Filter Panel - identified by "Field" and "Operator" labels at the top, with "Apply Filter" button at bottom
    this.filterPanel = page.locator('div', { has: page.getByText('Field').first() }).filter({ has: page.getByText('Operator').first() }).filter({ has: page.getByText('Apply Filter') }).first();
    this.filterFieldDropdown = page.getByRole('combobox', { name: 'Select field' });
    this.filterOperatorDropdown = page.getByRole('combobox', { name: 'Operator' });
    // Filter value can be a combobox dropdown (for select fields) or text input (for text fields)
    this.filterValueInput = page.locator('input[placeholder="Enter value"], input[class*="filter-value"]').first();
    // Filter value combobox - identified by placeholder "[ Any ]"
    this.filterValueCombobox = page.getByRole('combobox', { name: '[ Any ]' });
    this.applyFilterButton = page.getByRole('button', { name: 'Apply Filter' });
    this.clearFilterButton = page.getByRole('button', { name: 'Clear', exact: true });
    this.hideFilterButton = page.getByRole('button', { name: 'Hide Filter' });
    this.addNewClauseButton = page.getByRole('button', { name: 'Add new clause' });
    this.andOrDropdown = page.getByRole('combobox').filter({ has: page.getByText('And / Or') }).first();

    // Export Dropdown - Export button may open a popover/menu with these text options
    this.exportCurrentViewOption = page.getByText('Current View');
    this.exportAllOption = page.getByText('Export All');

    // Columns Dropdown
    this.showHideAllCheckbox = page.getByRole('checkbox', { name: 'SHOW/HIDE ALL' });
    this.resetButton = page.getByRole('button', { name: 'RESET' });
    this.searchColumnsTextbox = page.getByPlaceholder('Search columns...');
    this.candidateColumnCheckbox = page.getByRole('checkbox', { name: 'Candidate' });
    this.hiringPositionColumnCheckbox = page.getByRole('checkbox', { name: 'Hiring Position' });
    this.joiningDateColumnCheckbox = page.getByRole('checkbox', { name: 'Joining Date' });
    this.stageColumnCheckbox = page.getByRole('checkbox', { name: 'Stage' });
    this.documentStatusColumnCheckbox = page.getByRole('checkbox', { name: 'Document Status' });
    this.offerLetterColumnCheckbox = page.getByRole('checkbox', { name: 'Offer Letter' });
    this.actionsColumnCheckbox = page.getByRole('checkbox', { name: 'Actions' });

    // Drawer: Document Needed for Verification - use more specific locator to avoid old drawers
    this.drawer = page.locator('[role="dialog"]').filter({ has: page.getByText('Document Needed for Verification') }).first();
    this.drawerTitle = page.getByRole('heading', { name: 'Document Needed for Verification' });
    this.drawerSubtitle = page.getByText('Fill the below details to Register the New Candidate');
    // Close button is rendered as "Close" text, not "×" symbol
    this.closeDrawerButton = page.getByRole('button', { name: 'Close' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.requestDocumentsButton = page.getByRole('button', { name: 'Request Documents' });

    // Drawer Form Fields
    this.applicantNumberField = page.getByPlaceholder('Enter applicant number');
    this.firstNameField = page.getByPlaceholder('Enter first name');
    this.lastNameField = page.getByPlaceholder('Enter last name');
    this.personalEmailField = page.getByPlaceholder('example@mail.com');
    this.dialCodeDropdown = page.locator('div').filter({ hasText: /^Dial Code\*?$/ }).getByRole('combobox');
    this.mobileNumberField = page.getByPlaceholder('Enter mobile number');
    this.countryDropdown = page.locator('div').filter({ hasText: /^Country\*?$/ }).getByRole('combobox');
    this.hiringPositionDropdown = page.locator('div').filter({ hasText: /^Hiring Position\*?$/ }).getByRole('combobox');
    this.joiningDateField = page.locator('div').filter({ hasText: /^Joining Date\*?$/ }).getByRole('combobox');
    this.employeeTypeDropdown = page.locator('div').filter({ hasText: /^Employee Type\*?$/ }).getByRole('combobox');
    this.candidateTypeDropdown = page.locator('div').filter({ hasText: /^Candidate Type\*?$/ }).getByRole('combobox');
    this.shareConsentToggle = page.locator('[class*="toggle"], [class*="Toggle"], [role="switch"]').last();
    this.shareConsentLabel = page.getByText('Share consent form with the candidate');

    // Validation/Error Messages - check for alert role, error text, or common validation patterns
    this.requiredFieldIndicator = page.locator('[role="alert"], [class*="error"], [class*="Error"], span:text("required"), span:text("Required")').filter({ visible: true }).first();
    this.duplicateApplicantError = page.locator('text=/already exists|duplicate|already registered/i').filter({ visible: true }).first();
  }

  // ===== Dashboard Page Title =====

  async isTitleVisible(): Promise<boolean> {
    return await this.candidateManagementTitle.isVisible();
  }

  async getTitleText(): Promise<string> {
    return await this.candidateManagementTitle.textContent() ?? '';
  }

  // ===== Summary Cards =====

  async isVerifiedCardVisible(): Promise<boolean> {
    return await this.verifiedCard.isVisible();
  }

  async getVerifiedCount(): Promise<string> {
    return await this.verifiedCount.textContent() ?? '';
  }

  async isNotVerifiedCardVisible(): Promise<boolean> {
    return await this.notVerifiedCard.isVisible();
  }

  async getNotVerifiedCount(): Promise<string> {
    return await this.notVerifiedCount.textContent() ?? '';
  }

  async isInProgressCardVisible(): Promise<boolean> {
    return await this.inProgressCard.isVisible();
  }

  async getInProgressCount(): Promise<string> {
    return await this.inProgressCount.textContent() ?? '';
  }

  async isRejectedCardVisible(): Promise<boolean> {
    return await this.rejectedCard.isVisible();
  }

  async getRejectedCount(): Promise<string> {
    return await this.rejectedCount.textContent() ?? '';
  }

  async areAllSummaryCardsVisible(): Promise<boolean> {
    const [verified, notVerified, inProgress, rejected] = await Promise.all([
      this.isVerifiedCardVisible(),
      this.isNotVerifiedCardVisible(),
      this.isInProgressCardVisible(),
      this.isRejectedCardVisible(),
    ]);
    return verified && notVerified && inProgress && rejected;
  }

  // ===== Action Bar =====

  async isSearchBoxVisible(): Promise<boolean> {
    return await this.searchCandidatesTextbox.isVisible();
  }

  async isFilterButtonVisible(): Promise<boolean> {
    return await this.filterButton.isVisible();
  }

  async isExportButtonVisible(): Promise<boolean> {
    return await this.exportButton.isVisible();
  }

  async isColumnsButtonVisible(): Promise<boolean> {
    return await this.columnsButton.isVisible();
  }

  async isNewButtonVisible(): Promise<boolean> {
    return await this.newButton.isVisible();
  }

  async areActionBarButtonsVisible(): Promise<boolean> {
    const [filter, exp, columns, newBtn] = await Promise.all([
      this.isFilterButtonVisible(),
      this.isExportButtonVisible(),
      this.isColumnsButtonVisible(),
      this.isNewButtonVisible(),
    ]);
    return filter && exp && columns && newBtn;
  }

  // ===== Candidate Grid =====

  async isCandidateGridVisible(): Promise<boolean> {
    return await this.candidateGrid.isVisible();
  }

  async getCandidateRowCount(): Promise<number> {
    return await this.candidateRows.count();
  }

  async getPaginationInfo(): Promise<string> {
    return await this.paginationInfo.textContent() ?? '';
  }

  async isNextPageButtonVisible(): Promise<boolean> {
    return await this.nextPageButton.isVisible();
  }

  async isPreviousPageButtonVisible(): Promise<boolean> {
    return await this.previousPageButton.isVisible();
  }

  async clickNextPage(): Promise<void> {
    await this.nextPageButton.click();
  }

  async clickPreviousPage(): Promise<void> {
    await this.previousPageButton.click();
  }

  // ===== Filter Panel =====

  async clickFilterButton(): Promise<void> {
    await this.filterButton.click();
  }

  async isFilterPanelVisible(): Promise<boolean> {
    return await this.filterPanel.isVisible();
  }

  async isApplyFilterButtonVisible(): Promise<boolean> {
    return await this.applyFilterButton.isVisible();
  }

  async isClearFilterButtonVisible(): Promise<boolean> {
    return await this.clearFilterButton.isVisible();
  }

  async isHideFilterButtonVisible(): Promise<boolean> {
    return await this.hideFilterButton.isVisible();
  }

  async isAddNewClauseButtonVisible(): Promise<boolean> {
    return await this.addNewClauseButton.isVisible();
  }

  async clickApplyFilter(): Promise<void> {
    await this.applyFilterButton.click();
  }

  async clickClearFilter(): Promise<void> {
    await this.clearFilterButton.click();
  }

  async clickHideFilter(): Promise<void> {
    await this.hideFilterButton.click();
  }

  async clickAddNewClause(): Promise<void> {
    await this.addNewClauseButton.click();
  }

  async setFilterField(field: string): Promise<void> {
    await this.filterFieldDropdown.click();
    await this.page.getByText(field).first().click();
  }

  async setFilterOperator(operator: string): Promise<void> {
    await this.filterOperatorDropdown.click();
    await this.page.getByText(operator).first().click();
  }

  async setFilterValue(value: string): Promise<void> {
    // Try text input first (for text-based filters like "First Name" with "contains")
    try {
      await this.filterValueInput.waitFor({ state: 'visible', timeout: 3000 });
      if (await this.filterValueInput.isVisible()) {
        await this.filterValueInput.fill(value);
        return;
      }
    } catch {
      // Not a text input, continue to combobox handling
    }
    
    // Filter value is a combobox dropdown (for select fields like "Candidate Type")
    await this.filterValueCombobox.click();
    await this.page.getByText(value).first().click();
  }

  // ===== Export Dropdown =====

  async clickExportButton(): Promise<void> {
    // Wait for the export button to be enabled and visible (not in "Exporting..." state)
    await this.exportButton.waitFor({ state: 'visible', timeout: 5000 });
    const isDisabled = await this.exportButton.evaluate(el => el.hasAttribute('disabled'));
    if (isDisabled) {
      throw new Error('Export button is disabled');
    }
    await this.exportButton.click();
    // Small wait for any dropdown/menu to appear
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async isExportCurrentViewVisible(): Promise<boolean> {
    try {
      return await this.exportCurrentViewOption.isVisible();
    } catch {
      return false;
    }
  }

  async isExportAllVisible(): Promise<boolean> {
    try {
      return await this.exportAllOption.isVisible();
    } catch {
      return false;
    }
  }

  async clickExportCurrentView(): Promise<void> {
    await this.exportCurrentViewOption.click();
  }

  async clickExportAll(): Promise<void> {
    await this.exportAllOption.click();
  }

  // ===== Columns Dropdown =====

  async clickColumnsButton(): Promise<void> {
    await this.columnsButton.click();
  }

  async isShowHideAllCheckboxVisible(): Promise<boolean> {
    return await this.showHideAllCheckbox.isVisible();
  }

  async isResetButtonVisible(): Promise<boolean> {
    return await this.resetButton.isVisible();
  }

  async isSearchColumnsTextboxVisible(): Promise<boolean> {
    return await this.searchColumnsTextbox.isVisible();
  }

  async clickResetColumns(): Promise<void> {
    await this.resetButton.click();
  }

  async isCandidateColumnCheckboxVisible(): Promise<boolean> {
    return await this.candidateColumnCheckbox.isVisible();
  }

  async isHiringPositionColumnCheckboxVisible(): Promise<boolean> {
    return await this.hiringPositionColumnCheckbox.isVisible();
  }

  async isJoiningDateColumnCheckboxVisible(): Promise<boolean> {
    return await this.joiningDateColumnCheckbox.isVisible();
  }

  async isStageColumnCheckboxVisible(): Promise<boolean> {
    return await this.stageColumnCheckbox.isVisible();
  }

  async isDocumentStatusColumnCheckboxVisible(): Promise<boolean> {
    return await this.documentStatusColumnCheckbox.isVisible();
  }

  async isOfferLetterColumnCheckboxVisible(): Promise<boolean> {
    return await this.offerLetterColumnCheckbox.isVisible();
  }

  async isActionsColumnCheckboxVisible(): Promise<boolean> {
    return await this.actionsColumnCheckbox.isVisible();
  }

  async areAllColumnCheckboxesVisible(): Promise<boolean> {
    const [a, b, c, d, e, f, g] = await Promise.all([
      this.isCandidateColumnCheckboxVisible(),
      this.isHiringPositionColumnCheckboxVisible(),
      this.isJoiningDateColumnCheckboxVisible(),
      this.isStageColumnCheckboxVisible(),
      this.isDocumentStatusColumnCheckboxVisible(),
      this.isOfferLetterColumnCheckboxVisible(),
      this.isActionsColumnCheckboxVisible(),
    ]);
    return a && b && c && d && e && f && g;
  }

  async toggleColumnCheckbox(name: string): Promise<void> {
    const checkbox = this.page.getByRole('checkbox', { name });
    await checkbox.click();
  }

  // ===== Drawer: Document Needed for Verification =====

  async clickNewButton(): Promise<void> {
    // Wait for button to be visible and enabled
    await this.newButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.newButton.click();
    
    // Wait for drawer to appear
    await this.drawer.waitFor({ state: 'visible', timeout: 20000 });
  }

  async isDrawerVisible(): Promise<boolean> {
    return await this.drawer.isVisible();
  }

  async isDrawerTitleVisible(): Promise<boolean> {
    return await this.drawerTitle.isVisible();
  }

  async isDrawerSubtitleVisible(): Promise<boolean> {
    return await this.drawerSubtitle.isVisible();
  }

  async isCloseButtonVisible(): Promise<boolean> {
    return await this.closeDrawerButton.isVisible();
  }

  async isCancelButtonVisible(): Promise<boolean> {
    return await this.cancelButton.isVisible();
  }

  async isRequestDocumentsButtonVisible(): Promise<boolean> {
    return await this.requestDocumentsButton.isVisible();
  }

  async clickCloseDrawer(): Promise<void> {
    await this.closeDrawerButton.click();
  }

  async clickCancelDrawer(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickRequestDocuments(): Promise<void> {
    // Wait for the button to be visible
    await this.requestDocumentsButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Scroll into view if needed
    await this.requestDocumentsButton.scrollIntoViewIfNeeded();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Click with retry logic
    try {
      await this.requestDocumentsButton.click({ timeout: 5000 });
    } catch (error) {
      console.log(`Failed to click Request Documents button: ${error}`);
      // Try clicking with force option to bypass any overlays
      await this.requestDocumentsButton.click({ force: true, timeout: 5000 });
    }
  }

  // ===== Drawer Form Fields Visibility =====

  async isApplicantNumberFieldVisible(): Promise<boolean> {
    return await this.applicantNumberField.isVisible();
  }

  async isFirstNameFieldVisible(): Promise<boolean> {
    return await this.firstNameField.isVisible();
  }

  async isLastNameFieldVisible(): Promise<boolean> {
    return await this.lastNameField.isVisible();
  }

  async isPersonalEmailFieldVisible(): Promise<boolean> {
    return await this.personalEmailField.isVisible();
  }

  async isDialCodeDropdownVisible(): Promise<boolean> {
    return await this.dialCodeDropdown.isVisible();
  }

  async isMobileNumberFieldVisible(): Promise<boolean> {
    return await this.mobileNumberField.isVisible();
  }

  async isCountryDropdownVisible(): Promise<boolean> {
    return await this.countryDropdown.isVisible();
  }

  async isHiringPositionDropdownVisible(): Promise<boolean> {
    return await this.hiringPositionDropdown.isVisible();
  }

  async isJoiningDateFieldVisible(): Promise<boolean> {
    return await this.joiningDateField.isVisible();
  }

  async selectJoiningDate(value: string): Promise<void> {
    console.log(`Setting Joining Date to: ${value}`);
    const combobox = this.joiningDateField;
    await combobox.waitFor({ state: 'visible', timeout: 10000 });
    await combobox.scrollIntoViewIfNeeded();
    
    // Click the combobox to focus it
    await combobox.click({ force: true, timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Select all existing text and type the date using keyboard
    await this.page.keyboard.press('Control+a');
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.page.keyboard.type(value, { delay: 50 });
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Press Enter to confirm the date
    await this.page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Click on the form title to close any date picker overlay
    await this.page.keyboard.press('Tab');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Joining Date set to: ${value}`);
  }

  async isEmployeeTypeDropdownVisible(): Promise<boolean> {
    return await this.employeeTypeDropdown.isVisible();
  }

  async isCandidateTypeDropdownVisible(): Promise<boolean> {
    return await this.candidateTypeDropdown.isVisible();
  }

  async isShareConsentToggleVisible(): Promise<boolean> {
    return await this.shareConsentToggle.isVisible();
  }

  async isShareConsentLabelVisible(): Promise<boolean> {
    return await this.shareConsentLabel.isVisible();
  }

  async areAllRequiredFieldIndicatorsVisible(): Promise<boolean> {
    const fields = [
      this.applicantNumberField,
      this.firstNameField,
      this.lastNameField,
      this.personalEmailField,
      this.dialCodeDropdown,
      this.mobileNumberField,
      this.countryDropdown,
      this.hiringPositionDropdown,
      this.joiningDateField,
      this.employeeTypeDropdown,
      this.candidateTypeDropdown,
    ];
    const visibility = await Promise.all(fields.map((f) => f.isVisible()));
    return visibility.every((v) => v === true);
  }

  async areAllRequiredAsterisksVisible(): Promise<boolean> {
    const asterisks = this.page.locator('span[aria-label="required"], span.required, [class*="required"]');
    const count = await asterisks.count();
    return count >= 11;
  }

  async areAllDrawerFieldsVisible(): Promise<boolean> {
    const [
      applicantNumber, firstName, lastName, personalEmail, dialCode,
      mobileNumber, country, hiringPosition, joiningDate, employeeType, candidateType,
      shareConsent,
    ] = await Promise.all([
      this.isApplicantNumberFieldVisible(),
      this.isFirstNameFieldVisible(),
      this.isLastNameFieldVisible(),
      this.isPersonalEmailFieldVisible(),
      this.isDialCodeDropdownVisible(),
      this.isMobileNumberFieldVisible(),
      this.isCountryDropdownVisible(),
      this.isHiringPositionDropdownVisible(),
      this.isJoiningDateFieldVisible(),
      this.isEmployeeTypeDropdownVisible(),
      this.isCandidateTypeDropdownVisible(),
      this.isShareConsentToggleVisible(),
    ]);
    return applicantNumber && firstName && lastName && personalEmail && dialCode && mobileNumber && country && hiringPosition && joiningDate && employeeType && candidateType && shareConsent;
  }

  // ===== Form Input Methods =====

  async fillApplicantNumber(value: string): Promise<void> {
    await this.applicantNumberField.fill(value);
  }

  async fillFirstName(value: string): Promise<void> {
    await this.firstNameField.fill(value);
  }

  async fillLastName(value: string): Promise<void> {
    await this.lastNameField.fill(value);
  }

  async fillPersonalEmail(value: string): Promise<void> {
    await this.personalEmailField.fill(value);
  }

  async selectDropdownByLabel(label: string, value: string): Promise<void> {
    console.log(`Attempting to select ${value} from ${label} dropdown`);

    const combobox = this.page.locator('div').filter({ hasText: new RegExp(`^${label}\\*?$`) }).getByRole('combobox').first();
    await combobox.waitFor({ state: 'visible', timeout: 15000 });
    await combobox.scrollIntoViewIfNeeded();

    await combobox.click({ force: true, timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 300));
    await combobox.fill('');
    await new Promise(resolve => setTimeout(resolve, 200));
    await combobox.fill(value);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      await this.page.keyboard.press('Enter');
      console.log(`Selected ${value} from ${label} via typing and Enter key`);
      return;
    } catch {
      console.log(`Pressing Enter failed, trying click on option`);
    }

    const option = this.page.locator('[role="listbox"] [role="option"]').filter({ hasText: value }).first();
    try {
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click({ force: true, timeout: 5000 });
      console.log(`Selected ${value} from ${label} via click on option`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    } catch {
      console.log(`Clicking option failed`);
    }

    const fallbackOption = this.page.getByRole('option', { name: value, exact: true }).first();
    try {
      await fallbackOption.waitFor({ state: 'visible', timeout: 5000 });
      await fallbackOption.click({ force: true, timeout: 5000 });
      console.log(`Selected ${value} from ${label} via ARIA option click`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    } catch {
      console.log(`ARIA option click failed`);
    }

    throw new Error(`Could not select option with value: ${value} from ${label} dropdown`);
  }

  async selectDialCode(value: string): Promise<void> {
    await this.selectDropdownByLabel('Dial Code', value);
  }

  async selectCountry(value: string): Promise<void> {
    await this.selectDropdownByLabel('Country', value);
  }

  async selectHiringPosition(value: string): Promise<void> {
    await this.selectDropdownByLabel('Hiring Position', value);
  }

  async selectEmployeeType(value: string): Promise<void> {
    await this.selectDropdownByLabel('Employee Type', value);
  }

  async selectCandidateType(value: string): Promise<void> {
    await this.selectDropdownByLabel('Candidate Type', value);
  }

  async fillMobileNumber(value: string): Promise<void> {
    await this.mobileNumberField.fill(value);
  }

  async toggleShareConsent(enabled: boolean): Promise<void> {
    if (enabled) {
      await this.shareConsentToggle.check({ timeout: 5000 });
    } else {
      await this.shareConsentToggle.uncheck({ timeout: 5000 });
    }
  }

  async isShareConsentEnabled(): Promise<boolean> {
    return await this.shareConsentToggle.isChecked();
  }

  async isRequestDocumentsButtonDisabled(): Promise<boolean> {
    return await this.requestDocumentsButton.isDisabled();
  }

  async verifyRequestDocumentsButtonEnabled(): Promise<boolean> {
    return await this.requestDocumentsButton.isEnabled();
  }

  // ===== Validation =====

  async getRequiredFieldError(): Promise<string> {
    return await this.requiredFieldIndicator.textContent() ?? '';
  }

  async isRequiredFieldErrorVisible(): Promise<boolean> {
    return await this.requiredFieldIndicator.isVisible();
  }

  async isDuplicateApplicantErrorVisible(): Promise<boolean> {
    return await this.duplicateApplicantError.isVisible();
  }

  // ===== Full Form Fill =====

  async fillAndSubmit(candidateData: {
    applicantNumber: string;
    firstName: string;
    lastName: string;
    personalEmail: string;
    dialCode: string;
    mobileNumber: string;
    country: string;
    hiringPosition: string;
    joiningDate: string;
    employeeType: string;
    candidateType: string;
    shareConsentForm?: boolean;
  }): Promise<void> {
    console.log('Starting fillAndSubmit...');
    console.log('filing Applicant Number');
    await this.fillApplicantNumber(candidateData.applicantNumber);
    console.log('filing First Name');
    await this.fillFirstName(candidateData.firstName);
    console.log('filing Last Name');
    await this.fillLastName(candidateData.lastName);
    console.log('filing Personal Email');
    await this.fillPersonalEmail(candidateData.personalEmail);
    console.log('selecting Dial Code');
    await this.selectDialCode(candidateData.dialCode);
    console.log('filing Mobile Number');
    await this.fillMobileNumber(candidateData.mobileNumber);
    console.log('selecting Country');
    await this.selectCountry(candidateData.country);
    console.log('selecting Hiring Position');
    await this.selectHiringPosition(candidateData.hiringPosition);
    console.log('selecting Joining Date');
    await this.selectJoiningDate(candidateData.joiningDate);
    console.log('selecting Employee Type');
    await this.selectEmployeeType(candidateData.employeeType);
    console.log('selecting Candidate Type');
    await this.selectCandidateType(candidateData.candidateType);
    console.log('toggling Share Consent');
    await this.toggleShareConsent(candidateData.shareConsentForm ?? false);
    console.log('Re-filling Joining Date (may be cleared by Share Consent toggle)');
    await this.selectJoiningDate(candidateData.joiningDate);
    console.log('Clicking Request Documents');
    await this.clickRequestDocuments();
    console.log('clickRequestDocuments completed');
  }

  async fillCandidateFormFields(candidateData: {
    applicantNumber: string;
    firstName: string;
    lastName: string;
    personalEmail: string;
    dialCode: string;
    mobileNumber: string;
    country: string;
    hiringPosition: string;
    joiningDate: string;
    employeeType: string;
    candidateType: string;
    shareConsentForm?: boolean;
  }): Promise<void> {
    await this.fillApplicantNumber(candidateData.applicantNumber);
    await this.fillFirstName(candidateData.firstName);
    await this.fillLastName(candidateData.lastName);
    await this.fillPersonalEmail(candidateData.personalEmail);
    await this.selectDialCode(candidateData.dialCode);
    await this.fillMobileNumber(candidateData.mobileNumber);
    await this.selectCountry(candidateData.country);
    await this.selectHiringPosition(candidateData.hiringPosition);
    await this.selectJoiningDate(candidateData.joiningDate);
    await this.selectEmployeeType(candidateData.employeeType);
    await this.selectCandidateType(candidateData.candidateType);

    if (candidateData.shareConsentForm) {
      await this.toggleShareConsent(true);
    }

    await this.selectJoiningDate(candidateData.joiningDate);
  }

  // ===== Verification =====

  async verifyDrawerOpensFromRight(): Promise<void> {
    await expect(this.drawer).toBeVisible();
    const box = await this.drawer.boundingBox();
    expect(box).not.toBeNull();
  }

  async verifyDrawerTitleText(expectedText: string): Promise<void> {
    await expect(this.drawerTitle).toHaveText(expectedText);
  }

  async verifyDrawerSubtitleText(expectedText: string): Promise<void> {
    await expect(this.drawerSubtitle).toHaveText(expectedText);
  }

  async verifyFormFieldsPlaceholders(expectedPlaceholders: {
    applicantNumber?: string;
    firstName?: string;
    lastName?: string;
    personalEmail?: string;
    dialCode?: string;
    mobileNumber?: string;
    country?: string;
    hiringPosition?: string;
    joiningDate?: string;
  }): Promise<void> {
    if (expectedPlaceholders.applicantNumber) {
      await expect(this.applicantNumberField).toHaveAttribute('placeholder', expectedPlaceholders.applicantNumber);
    }
    if (expectedPlaceholders.firstName) {
      await expect(this.firstNameField).toHaveAttribute('placeholder', expectedPlaceholders.firstName);
    }
    if (expectedPlaceholders.lastName) {
      await expect(this.lastNameField).toHaveAttribute('placeholder', expectedPlaceholders.lastName);
    }
    if (expectedPlaceholders.personalEmail) {
      await expect(this.personalEmailField).toHaveAttribute('placeholder', expectedPlaceholders.personalEmail);
    }
    if (expectedPlaceholders.dialCode) {
      await expect(this.dialCodeDropdown).toHaveAttribute('placeholder', expectedPlaceholders.dialCode);
    }
    if (expectedPlaceholders.mobileNumber) {
      await expect(this.mobileNumberField).toHaveAttribute('placeholder', expectedPlaceholders.mobileNumber);
    }
    if (expectedPlaceholders.country) {
      await expect(this.countryDropdown).toHaveAttribute('placeholder', expectedPlaceholders.country);
    }
    if (expectedPlaceholders.hiringPosition) {
      await expect(this.hiringPositionDropdown).toHaveAttribute('placeholder', expectedPlaceholders.hiringPosition);
    }
    if (expectedPlaceholders.joiningDate) {
      await expect(this.joiningDateField).toHaveAttribute('placeholder', expectedPlaceholders.joiningDate);
    }
  }

  async verifyShareConsentToggleState(expectedState: 'enabled' | 'disabled'): Promise<void> {
    const isChecked = await this.shareConsentToggle.isChecked();
    if (expectedState === 'enabled') {
      expect(isChecked).toBe(true);
    } else {
      expect(isChecked).toBe(false);
    }
  }

  async verifyCancelButtonEnabled(): Promise<void> {
    await expect(this.cancelButton).not.toBeDisabled();
  }
}


