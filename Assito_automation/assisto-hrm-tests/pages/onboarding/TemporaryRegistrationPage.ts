import { type Page, type Locator, expect } from '@playwright/test';

/**
 * TemporaryRegistrationPage covers the "Temporary Candidate Registration"
 * action on the pre-onboarding candidate detail page, and the "Temporary
 * Registration" modal it opens.
 *
 * This is the hand-off point between Pre-Onboarding and Onboarding: it
 * registers a candidate who has ACCEPTED their offer into the ERP system for
 * onboarding activation. It does NOT create a candidate — First Name, Last
 * Name, Hiring Position, Mobile Number, Personal Mail ID and Date of Birth
 * arrive pre-filled and read-only from the accepted candidate's record.
 *
 * Fields the operator must supply (marked * and empty on open):
 *   Reporting Manager, Location, Department
 * Optional: Business Unit.
 * Pre-filled but editable: Date of Joining.
 * Defaulted to Yes: Virtual Onboarding, Laptop Required.
 */
export class TemporaryRegistrationPage {
  private readonly page: Page;

  // ===== Candidate detail page (entry point) =====
  readonly offerAcceptedBadge: Locator;
  readonly temporaryCandidateRegistrationButton: Locator;
  readonly candidateNameHeading: Locator;
  readonly personalEmailValue: Locator;

  // ===== Temporary Registration modal =====
  readonly modal: Locator;
  readonly modalHeading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly hiringPositionInput: Locator;
  readonly reportingManagerDropdown: Locator;
  readonly countryCodeDropdown: Locator;
  readonly mobileNumberInput: Locator;
  readonly personalMailIdInput: Locator;
  readonly dateOfJoiningInput: Locator;
  readonly employmentTypeDropdown: Locator;
  readonly dateOfBirthInput: Locator;
  readonly locationDropdown: Locator;
  readonly departmentDropdown: Locator;
  readonly businessUnitInput: Locator;
  readonly virtualOnboardingYesRadio: Locator;
  readonly virtualOnboardingNoRadio: Locator;
  readonly laptopRequiredYesRadio: Locator;
  readonly laptopRequiredNoRadio: Locator;
  readonly registerTemporarilyButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ===== Candidate detail page =====
    // Case-insensitive: the chip's casing varies between candidate records
    // ("OFFER ACCEPTED" vs "Offer Accepted").
    this.offerAcceptedBadge = page.getByText(/offer\s*accepted/i);
    this.temporaryCandidateRegistrationButton = page.getByRole('button', {
      name: 'Temporary Candidate Registration',
    });
    this.candidateNameHeading = page.getByRole('heading', { level: 1 });
    // The Personal Email value sits in the field block labelled PERSONAL EMAIL.
    this.personalEmailValue = page
      .locator('div')
      .filter({ hasText: /^PERSONAL EMAIL/ })
      .last();

    // ===== Modal =====
    this.modal = page.getByRole('dialog').filter({ hasText: 'Temporary Registration' });
    this.modalHeading = page.getByText('Temporary Registration', { exact: true });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.hiringPositionInput = page.getByRole('combobox', { name: /Hiring Position/i });
    // These three render with placeholder text ("Select reporting manager")
    // rather than an accessible name tied to their label, so a
    // getByRole('combobox', { name }) lookup finds nothing. Placeholder first,
    // with role-name and label-scoped fallbacks so the locator survives either
    // markup.
    this.reportingManagerDropdown = page
      .getByPlaceholder(/select reporting manager/i)
      .or(page.getByRole('combobox', { name: /Reporting Manager/i }))
      .first();
    this.countryCodeDropdown = page.getByRole('combobox', { name: /Country Code/i });
    this.mobileNumberInput = page.getByRole('textbox', { name: /Mobile Number/i });
    this.personalMailIdInput = page.getByRole('textbox', { name: /Personal Mail ID/i });
    // Both date pickers carry placeholder "DD/MM/YYYY" and NO accessible name,
    // so they can only be told apart by document order: Date of Joining first,
    // Date of Birth second (confirmed against the live modal).
    this.dateOfJoiningInput = page
      .locator('input[id^="datePicker-input"]')
      .first();
    this.employmentTypeDropdown = page.getByPlaceholder(/select employment type/i);
    this.dateOfBirthInput = page.locator('input[id^="datePicker-input"]').last();
    this.locationDropdown = page
      .getByPlaceholder(/select location/i)
      .or(page.getByRole('combobox', { name: /Location/i }))
      .first();
    this.departmentDropdown = page
      .getByPlaceholder(/select department/i)
      .or(page.getByRole('combobox', { name: /Department/i }))
      .first();
    this.businessUnitInput = page.getByRole('textbox', { name: /Business Unit/i });
    // The radios carry no label or aria-label — they are grouped by the `name`
    // attribute with value "true"/"false", which is how they must be targeted.
    this.virtualOnboardingYesRadio = page.locator(
      'input[name="virtualOnboarding"][value="true"]',
    );
    this.virtualOnboardingNoRadio = page.locator(
      'input[name="virtualOnboarding"][value="false"]',
    );
    this.laptopRequiredYesRadio = page.locator(
      'input[name="laptopRequired"][value="true"]',
    );
    this.laptopRequiredNoRadio = page.locator(
      'input[name="laptopRequired"][value="false"]',
    );
    this.registerTemporarilyButton = page.getByRole('button', {
      name: 'Register Temporarily',
    });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.closeButton = page.getByRole('button', { name: /close/i }).last();
  }

  // ==========================================
  //  ENTRY POINT
  // ==========================================

  async isOfferAcceptedBadgeVisible(): Promise<boolean> {
    return await this.offerAcceptedBadge.first().isVisible().catch(() => false);
  }

  async isTemporaryRegistrationButtonVisible(): Promise<boolean> {
    return await this.temporaryCandidateRegistrationButton
      .isVisible()
      .catch(() => false);
  }

  async clickTemporaryCandidateRegistration(): Promise<void> {
    await this.temporaryCandidateRegistrationButton.click();
  }

  /**
   * Wait for the modal to stop re-rendering before any field is touched.
   *
   * On open it fetches reporting managers, locations and departments and
   * re-renders as each arrives, which detaches the inputs mid-click — a click
   * issued too early spends its whole timeout on "element was detached from
   * the DOM, retrying". Settling on the Reporting Manager input being visible
   * and stable is enough, since it is the first control the flow touches.
   */
  async waitForModalReady(): Promise<void> {
    await this.reportingManagerDropdown.waitFor({
      state: 'visible',
      timeout: 20000,
    });
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // Two consecutive identical bounding boxes = the re-render churn is over.
    let previous = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      const box = await this.reportingManagerDropdown
        .boundingBox()
        .catch(() => null);
      const current = box ? `${box.x},${box.y},${box.width},${box.height}` : '';
      if (current && current === previous) return;
      previous = current;
      await this.page.waitForTimeout(300);
    }
  }

  async isModalVisible(): Promise<boolean> {
    return await this.modalHeading.isVisible().catch(() => false);
  }

  // ==========================================
  //  PRE-FILLED VALUES (identity carried from the accepted candidate)
  // ==========================================

  async getFirstName(): Promise<string> {
    return (await this.firstNameInput.inputValue()).trim();
  }

  async getLastName(): Promise<string> {
    return (await this.lastNameInput.inputValue()).trim();
  }

  async getPersonalMailId(): Promise<string> {
    return (await this.personalMailIdInput.inputValue()).trim();
  }

  // ==========================================
  //  FIELD ACTIONS
  // ==========================================

  /**
   * Select a value in one of the modal's comboboxes — by TYPING and pressing
   * Enter, never by clicking the option.
   *
   * All three (Reporting Manager, Location, Department) are editable
   * `<input role="combobox">` controls identified by placeholder, confirmed
   * against the live DOM. The reason for the keyboard approach is specific and
   * non-obvious: the dropdown's listbox renders in a PORTAL outside
   * [role="dialog"], so clicking an option — as selectComboboxOption does —
   * counts as a click outside the dialog and dismisses the whole modal. The
   * probe was unambiguous: after one option click, dialogCount went 1 → 0 and
   * every later field "vanished".
   *
   * Keyboard events go to the focused input INSIDE the dialog, so the modal
   * survives. This mirrors CandidateRegistrationPage.selectDropdownByLabel,
   * which reaches the same conclusion for the candidate registration drawer.
   */
  private async selectModalCombobox(
    combobox: Locator,
    value: string,
    label: string,
  ): Promise<void> {
    await combobox.waitFor({ state: 'visible', timeout: 20000 });
    await combobox.scrollIntoViewIfNeeded();

    await combobox.click({ force: true, timeout: 5000 });
    await this.page.waitForTimeout(300);
    await combobox.fill('');
    await this.page.waitForTimeout(200);
    await combobox.fill(value);
    // Let the filtered listbox settle so Enter lands on the intended option.
    await this.page.waitForTimeout(600);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(400);

    let selected = await combobox.inputValue().catch(() => '');

    if (!selected) {
      // Enter alone did not commit — highlight the first match explicitly.
      await combobox.click({ force: true });
      await this.page.keyboard.press('ArrowDown');
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(400);
      selected = await combobox.inputValue().catch(() => '');
    }

    console.log(`[TempReg] ${label} → "${selected || '(empty)'}"`);

    // A value that is merely TYPED, not selected, survives in the input but is
    // discarded the moment the form validates — the submit then silently does
    // nothing and the field resets to empty. Catching it here names the real
    // problem ("Finance" is a valid department, "Engineering" is not) instead
    // of surfacing later as an unexplained modal that will not close.
    expect(
      selected,
      `${label}: "${value}" did not commit — it is probably not one of the ` +
        'options this tenant offers. Check the configured values.',
    ).not.toBe('');
  }

  async selectReportingManager(name: string): Promise<void> {
    await this.selectModalCombobox(
      this.reportingManagerDropdown,
      name,
      'Reporting Manager',
    );
  }

  async selectLocation(location: string): Promise<void> {
    await this.selectModalCombobox(this.locationDropdown, location, 'Location');
  }

  async selectDepartment(department: string): Promise<void> {
    await this.selectModalCombobox(
      this.departmentDropdown,
      department,
      'Department',
    );
  }

  /**
   * Sets Date of Joining. Day-0 Check-In only lists joiners expected TODAY, so
   * the onboarding workflow deliberately joins the employee today — otherwise
   * the flow can never reach that step.
   *
   * @param date dd/MM/yyyy, matching the picker's displayed format.
   */
  async fillDateOfJoining(date: string): Promise<void> {
    await this.dateOfJoiningInput.click();
    await this.dateOfJoiningInput.fill('');
    await this.dateOfJoiningInput.type(date, { delay: 30 });
    // Dismiss the date picker by clicking the modal's own heading. Escape
    // would close the whole dialog, not just the picker.
    await this.modalHeading.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async getDateOfJoining(): Promise<string> {
    return (await this.dateOfJoiningInput.inputValue()).trim();
  }

  async fillBusinessUnit(value: string): Promise<void> {
    await this.businessUnitInput.fill(value);
  }

  async chooseVirtualOnboarding(choice: 'Yes' | 'No'): Promise<void> {
    const radio =
      choice === 'Yes' ? this.virtualOnboardingYesRadio : this.virtualOnboardingNoRadio;
    await radio.check();
  }

  async chooseLaptopRequired(choice: 'Yes' | 'No'): Promise<void> {
    const radio =
      choice === 'Yes' ? this.laptopRequiredYesRadio : this.laptopRequiredNoRadio;
    await radio.check();
  }

  async clickRegisterTemporarily(): Promise<void> {
    await this.registerTemporarilyButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
