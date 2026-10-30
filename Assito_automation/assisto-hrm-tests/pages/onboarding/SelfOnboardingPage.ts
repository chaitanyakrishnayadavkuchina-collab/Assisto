import { type Page, type Locator, expect } from '@playwright/test';

/** The eight steps of the Self-Onboarding wizard, in order. */
export type SelfOnboardingStep =
  | 'Welcome'
  | 'Personal Profile'
  | 'Identity Details'
  | 'Employment And Education'
  | 'Statutory'
  | 'Agreements And Policies'
  | 'Induction'
  | 'Meet The Team';

/**
 * SelfOnboardingPage covers the employee-facing Self-Onboarding wizard at
 * /people/onboarding/self-onboarding — all eight steps in one Page Object,
 * matching how CandidatePreOnboardingPage covers the multi-step candidate
 * wizard rather than one class per step.
 *
 * Locator note: this app renders screen titles as plain text (no heading
 * roles) and its comboboxes are inputs identified by placeholder — both
 * established while automating the Onboarding module. Labelled form fields do
 * expose accessible names, so getByLabel is used for those.
 */
export class SelfOnboardingPage {
  private readonly page: Page;

  // ===== Wizard chrome =====
  readonly stepIndicator: Locator;
  readonly backButton: Locator;
  readonly continueButton: Locator;
  readonly saveAndContinueButton: Locator;
  readonly submittedForApprovalBanner: Locator;

  // ===== Step 1: Welcome =====
  readonly welcomeHeading: Locator;
  readonly beginOnboardingButton: Locator;

  // ===== Step 2: Personal Profile =====
  readonly personalDetailsHeading: Locator;
  readonly fathersNameInput: Locator;
  readonly mothersNameInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly personalEmailInput: Locator;
  readonly placeOfBirthInput: Locator;
  readonly nationalityInput: Locator;
  readonly religionInput: Locator;
  readonly residentialStatusInput: Locator;
  readonly maritalStatusDropdown: Locator;
  readonly differentlyAbledNoRadio: Locator;
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly addressCityInput: Locator;
  readonly addressPinCodeInput: Locator;
  readonly emergencyContactPersonInput: Locator;
  readonly emergencyDialCodeInput: Locator;
  readonly emergencyContactNumberInput: Locator;
  readonly emergencyRelationshipInput: Locator;

  // ===== Step 3: Identity Details =====
  readonly identityHeading: Locator;
  readonly documentsSubmittedChip: Locator;
  readonly missingDocumentsWarning: Locator;
  readonly acknowledgeReceiptCheckbox: Locator;

  // Upload drawer
  readonly uploadSubmitButton: Locator;
  readonly uploadCancelButton: Locator;

  // ===== Step 4: Employment And Education =====
  readonly employmentHeading: Locator;
  readonly employeeIdField: Locator;
  readonly workEmailField: Locator;
  readonly addEducationalDocumentsButton: Locator;

  // ===== Step 5: Statutory =====
  readonly statutoryHeading: Locator;
  readonly accountHolderNameInput: Locator;
  readonly bankNameInput: Locator;
  readonly accountNumberInput: Locator;
  readonly ifscCodeInput: Locator;
  readonly branchInput: Locator;
  readonly statutoryNoteInput: Locator;

  // ===== Step 6: Agreements And Policies =====
  readonly agreementsHeading: Locator;
  readonly overallCompletionText: Locator;

  // ===== Steps 7-8: Induction / Meet The Team =====
  readonly inductionHeading: Locator;
  readonly meetTheTeamHeading: Locator;
  readonly completeOnboardingButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Wizard chrome
    this.stepIndicator = page.getByText(/Step \d+ of 8/);
    this.backButton = page.getByRole('button', { name: 'Back', exact: true });
    this.continueButton = page.getByRole('button', { name: /^Continue/ });
    this.saveAndContinueButton = page.getByRole('button', {
      name: /Save & continue/i,
    });
    this.submittedForApprovalBanner = page.getByText(/Submitted for approval/i);

    // Welcome
    this.welcomeHeading = page.getByText(/Welcome to the team/i);
    this.beginOnboardingButton = page.getByRole('button', {
      name: /Begin onboarding/i,
    });

    // Personal Profile
    this.personalDetailsHeading = page.getByText('Personal Details', {
      exact: true,
    });
    // PERSONAL PROFILE FIELDS.
    //
    // Verified against the live DOM: these inputs carry NO label association,
    // no name, no id and no placeholder — getByLabel finds nothing. Only the
    // comboboxes and a few inputs expose placeholders. The two name fields are
    // therefore addressed positionally, which is the only handle the app
    // gives; textFields excludes radios/checkboxes so the order is stable:
    //   0 = Father's Name, 1 = Mother's Name, 2 = Date of Birth (picker),
    //   3 = Personal Email, 4 = Place of Birth, 5 = Nationality.
    const textFields = page.locator(
      'input:not([type="radio"]):not([type="checkbox"])',
    );
    this.fathersNameInput = textFields.nth(0);
    this.mothersNameInput = textFields.nth(1);
    this.dateOfBirthInput = page.getByPlaceholder('DD/MM/YYYY');
    this.personalEmailInput = textFields.nth(3);
    this.placeOfBirthInput = textFields.nth(4);
    this.nationalityInput = textFields.nth(5);
    this.religionInput = textFields.nth(7);
    this.residentialStatusInput = page.getByPlaceholder('e.g. Resident');
    this.maritalStatusDropdown = page.getByPlaceholder(/Select status/i);
    // The radio group is the one element here with a usable attribute.
    this.differentlyAbledNoRadio = page.locator('input[name="abled"][value="no"]');
    // Address renders TWICE (current + permanent), so these take the first
    // block. Both are pre-filled from Pre-Onboarding.
    this.addressLine1Input = page
      .getByPlaceholder('House / Flat No., Building')
      .first();
    this.addressLine2Input = page
      .getByPlaceholder('Street, Area (optional)')
      .first();
    this.addressCityInput = page.getByPlaceholder('Select city').first();
    this.addressPinCodeInput = page
      .getByPlaceholder('Enter PIN / ZIP code')
      .first();

    // EMERGENCY CONTACT — required, and the app blocks Save & continue
    // without it. Person and Relationship expose nothing at all, so they are
    // positional like the name fields; the other two do have handles.
    // Index map (current + permanent address blocks occupy 10-21):
    //   22 = Contact person, 25 = Relationship.
    this.emergencyContactPersonInput = textFields.nth(22);
    this.emergencyDialCodeInput = page.getByPlaceholder('Search country code');
    this.emergencyContactNumberInput = page.locator('input[type="tel"]');
    this.emergencyRelationshipInput = textFields.nth(25);

    // Identity Details
    this.identityHeading = page.getByText('Your Identity Details', {
      exact: true,
    });
    this.documentsSubmittedChip = page.getByText(/\d+ of \d+ submitted/);
    this.missingDocumentsWarning = page.getByText(
      /required documents? (have|has) not been submitted/i,
    );
    this.acknowledgeReceiptCheckbox = page.getByRole('checkbox', {
      name: /I confirm all documents listed above are correct/i,
    });

    this.uploadSubmitButton = page.getByRole('button', {
      name: /Upload & Submit/i,
    });
    this.uploadCancelButton = page.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });

    // Employment And Education
    this.employmentHeading = page.getByText('Employment And Education', {
      exact: true,
    });
    this.employeeIdField = page.getByLabel(/Employee ID/i);
    this.workEmailField = page.getByLabel(/Work Email/i);
    this.addEducationalDocumentsButton = page.getByRole('button', {
      name: /Add Educational Documents/i,
    });

    // Statutory
    this.statutoryHeading = page.getByText('Statutory Details', {
      exact: true,
    });
    this.accountHolderNameInput = page.getByLabel(/Account Holder Name/i);
    this.bankNameInput = page.getByLabel(/Bank Name/i);
    this.accountNumberInput = page.getByLabel(/Account Number/i);
    this.ifscCodeInput = page.getByLabel(/IFSC Code/i);
    this.branchInput = page.getByLabel(/Branch/i);
    const payrollBankCard = page
      .locator('div')
      .filter({ has: page.getByText('Payroll Bank Account') })
      .last();
    const bankInputs = payrollBankCard.locator('input:not([type="checkbox"])');
    this.accountHolderNameInput = bankInputs.nth(0);
    this.bankNameInput = bankInputs.nth(1);
    this.accountNumberInput = bankInputs.nth(2);
    this.ifscCodeInput = bankInputs.nth(3);
    this.branchInput = bankInputs.nth(4);
    this.statutoryNoteInput = page.getByPlaceholder(
      /Any additional statutory note/i,
    );

    // Agreements And Policies
    this.agreementsHeading = page.getByText('Policies & Agreements', {
      exact: true,
    });
    this.overallCompletionText = page.getByText(/Overall completion/i);

    // Induction / Meet The Team
    this.inductionHeading = page.locator('main').getByText('Induction', { exact: false }).first()
      .or(page.getByRole('heading', { name: /induction/i }).first())
      .or(page.getByText('Induction', { exact: true }));
    this.meetTheTeamHeading = page.locator('main').getByText('Meet The Team', { exact: false }).first()
      .or(page.getByRole('heading', { name: /meet the team/i }).first())
      .or(page.getByText('Meet The Team', { exact: true }));
    this.completeOnboardingButton = page.getByRole('button', {
      name: /Complete onboarding|submit for approval|complete/i,
    });
  }

  // ==========================================
  //  WIZARD NAVIGATION / STATE
  // ==========================================

  /** The step tab, e.g. "Identity Details" — used to assert progression. */
  stepTab(step: SelfOnboardingStep): Locator {
    return this.page.getByText(step, { exact: true });
  }

  /** Current step number from the "Step N of 8" indicator; 0 when absent. */
  async getCurrentStepNumber(): Promise<number> {
    const text = (await this.stepIndicator.textContent().catch(() => '')) ?? '';
    const match = text.match(/Step (\d+) of 8/);
    return match ? Number(match[1]) : 0;
  }

  /**
   * Advance to the next wizard step.
   *
   * The footer control is not named consistently across steps — some render
   * "Continue", others "Save & continue" (Statutory, for one). Whichever is
   * present is used, so a step's wording does not need to be known up front.
   */
  async clickContinue(): Promise<void> {
    // Pick the ENABLED control, not simply the first match. Steps such as
    // Employment And Education render more than one advance-style button — a
    // disabled one belonging to an inner sub-form (Educational Documents) plus
    // the real footer action — and .first() can land on the sub-form's, which
    // never enables.
    const candidates = this.continueButton.or(this.saveAndContinueButton);
    await candidates.first().waitFor({ state: 'visible', timeout: 20000 });

    let advance = candidates.first();
    const total = await candidates.count();
    for (let index = 0; index < total; index++) {
      const option = candidates.nth(index);
      if (await option.isEnabled().catch(() => false)) {
        advance = option;
        break;
      }
    }
    if (total > 1) {
      console.log(
        `[SelfOnboarding] ${total} advance buttons on this step — using the enabled one`,
      );
    }

    // Wait for it to become ENABLED, not merely present. The button renders
    // disabled while the step saves, so clicking straight away spends the whole
    // timeout on an element that was about to become clickable anyway.
    if (!(await advance.isEnabled().catch(() => false))) {
      // Capture the employee page: Playwright's own failure snapshot shows the
      // default page fixture (the HR session), not this context.
      await this.page
        .screenshot({ path: 'test-results/wizard-step.png', fullPage: true })
        .catch(() => {});
    }

    await expect(
      advance,
      "The wizard's advance button stayed disabled — the step did not become " +
        'ready to submit (see test-results/wizard-step.png)',
      // 90s: the Employment And Education step in particular sits behind a
      // loading overlay for a long time while it fetches employment,
      // education and project data — the button is disabled until it settles.
    ).toBeEnabled({ timeout: 90000 });

    const label = (await advance.textContent())?.trim() ?? '';
    console.log(`[SelfOnboarding] Advancing via "${label}"`);
    await advance.click();
  }

  /** Whether the step's advance control is currently clickable. */
  async isAdvanceEnabled(): Promise<boolean> {
    const candidates = this.continueButton.or(this.saveAndContinueButton);
    const total = await candidates.count().catch(() => 0);
    for (let index = 0; index < total; index++) {
      if (await candidates.nth(index).isEnabled().catch(() => false)) return true;
    }
    return false;
  }

  async clickSaveAndContinue(): Promise<void> {
    await this.saveAndContinueButton.click();
  }

  async clickBeginOnboarding(): Promise<void> {
    await this.beginOnboardingButton.click();
  }

  async clickCompleteOnboarding(): Promise<void> {
    await this.completeOnboardingButton.click();
    await this.completeOnboardingButton.first().click();
    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes|submit|agree/i }).last();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
    }
  }

  // ==========================================
  //  IDENTITY DETAILS
  // ==========================================

  /**
   * Identity documents the app considers submitted, from the "N of M
   * submitted" chip. This is what decides whether anything needs uploading.
   */
  async getDocumentSubmissionCounts(): Promise<{
    submitted: number;
    required: number;
  }> {
    const text =
      (await this.documentsSubmittedChip.textContent().catch(() => '')) ?? '';
    const match = text.match(/(\d+) of (\d+) submitted/);
    return match
      ? { submitted: Number(match[1]), required: Number(match[2]) }
      : { submitted: 0, required: 0 };
  }

  /** The row for a configured identity document, e.g. "Aadhaar Card". */
  documentRow(documentName: string): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(`^${documentName}\\s*\\*?`) })
      .last();
  }

  /** True when the document already carries a submitted state. */
  async isDocumentSubmitted(documentName: string): Promise<boolean> {
    const text =
      (await this.documentRow(documentName).textContent().catch(() => '')) ?? '';
    if (/Not submitted|Missing/i.test(text)) return false;
    return /Submitted|Pending|Verified|Under review/i.test(text);
  }

  async clickUploadForDocument(documentName: string): Promise<void> {
    // documentRow() narrows to the innermost block carrying the name, which
    // does NOT contain the action button. Constrain to the row that actually
    // has an Upload/Replace control instead.
    const actionButton = this.page.getByRole('button', {
      name: /^(Upload|Replace)$/,
    });
    await this.page
      .locator('div')
      .filter({ hasText: new RegExp(documentName) })
      .filter({ has: actionButton })
      .last()
      .getByRole('button', { name: /^(Upload|Replace)$/ })
      .click();
  }

  async acknowledgeDocumentReceipt(): Promise<void> {
    await this.acknowledgeReceiptCheckbox.check();
  }

  // ==========================================
  //  EMPLOYMENT AND EDUCATION
  // ==========================================

  /**
   * Add one Educational Documents record.
   *
   * The step's "Save & continue" is disabled while the education, project and
   * skill tables are all empty — verified on the live page, where the button
   * stayed disabled with nothing loading and no failed requests. Adding a
   * record is therefore what unblocks the step.
   *
   * The row form is filled generically for the same reason as the identity
   * drawers: its fields come from tenant configuration rather than a fixed
   * shape.
   */
  async addEducationRecord(value: string, filePath: string): Promise<void> {
    await this.addEducationalDocumentsButton.first().click();
    await this.page.waitForTimeout(1500);

    // The form may open as a dialog or expand inline; prefer the dialog when
    // one appears, otherwise fill within the page.
    const dialog = this.page.getByRole('dialog').last();
    const inDialog = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
    const scope = inDialog ? dialog : this.page.locator('body');

    await this.fillFormFields(scope, value, filePath);

    // Commit the row. The label varies by form ("Add", "Save", "Save & add",
    // "Submit"), so match on a prefix rather than an exact word — an unmatched
    // button leaves the dialog open, which then hides the step's own advance
    // control and looks like the wizard has broken.
    const commit = scope
      .getByRole('button', { name: /^(Add|Save|Submit|Done)/ })
      .last();

    if (await commit.isVisible({ timeout: 5000 }).catch(() => false)) {
      const label = (await commit.textContent())?.trim() ?? '';

      // Report WHICH fields are still blocking rather than timing out on a
      // disabled button with no explanation.
      if (!(await commit.isEnabled().catch(() => false))) {
        // File inputs are included: excluding them previously reported
        // "Empty fields: []" while an unattached upload was the actual gate.
        const empty = await scope
          .locator('input, textarea')
          .evaluateAll(nodes =>
            nodes
              .map(n => n as HTMLInputElement)
              .filter(n =>
                n.type === 'file'
                  ? (n.files?.length ?? 0) === 0
                  : !n.value.trim(),
              )
              .map(n =>
                n.type === 'file'
                  ? `FILE:${n.id || '(unnamed)'}`
                  : n.placeholder || n.id || '(unnamed)',
              ),
          )
          .catch(() => [] as string[]);
        console.log(
          `[SelfOnboarding] Education form "${label}" is disabled. ` +
            `Empty fields: ${JSON.stringify(empty)}`,
        );
      }

      await commit.click();
      console.log(`[SelfOnboarding] Education record committed via "${label}"`);
      await this.page.waitForTimeout(1500);
    }

    if (inDialog) {
      // The dialog must close before the wizard footer is reachable again.
      const closed = await dialog
        .waitFor({ state: 'hidden', timeout: 15000 })
        .then(() => true)
        .catch(() => false);

      if (!closed) {
        const remaining = await dialog
          .getByRole('button')
          .allTextContents()
          .catch(() => [] as string[]);
        console.log(
          '[SelfOnboarding] Education dialog stayed open after commit. ' +
            `Buttons present: ${JSON.stringify(remaining)}`,
        );
        await this.page
          .screenshot({ path: 'test-results/education-dialog.png', fullPage: true })
          .catch(() => {});
      }
    }

    console.log('[SelfOnboarding] Educational Documents record added');
  }

  /**
   * Fill every empty field inside a container — files, dates, numbers, text.
   * Shared by the identity upload drawers and the education row form, which
   * are both tenant-configured and so cannot be addressed field by field.
   */
  private async fillFormFields(
    scope: Locator,
    value: string,
    filePath: string,
  ): Promise<void> {
    const fileInputs = scope.locator('input[type="file"]');
    const fileCount = await fileInputs.count();
    for (let index = 0; index < fileCount; index++) {
      const input = fileInputs.nth(index);
      const attached = await input.evaluate(
        node => (node as HTMLInputElement).files?.length ?? 0,
      );
      if (attached === 0) await input.setInputFiles(filePath).catch(() => {});
    }
    await this.page.waitForTimeout(1200);

    // Some dropzones ignore a programmatic attach and only register a file
    // chosen through their own control — the identity drawers behaved this way.
    // Retry through "browse" while any dropzone still advertises itself.
    const emptyDropzone = scope.getByText(/Drag your files/i).first();
    if (await emptyDropzone.isVisible().catch(() => false)) {
      const browse = scope.getByText(/browse/i);
      const browseCount = await browse.count();
      for (let index = 0; index < browseCount; index++) {
        const chooserPromise = this.page.waitForEvent('filechooser');
        await browse.nth(index).click().catch(() => {});
        const chooser = await chooserPromise.catch(() => null);
        if (chooser) {
          await chooser.setFiles(filePath);
          await this.page.waitForTimeout(1200);
        }
      }
    }

    const fields = scope.locator(
      'input[type="text"], input[type="number"], input:not([type]), textarea',
    );
    const fieldCount = await fields.count();
    for (let index = 0; index < fieldCount; index++) {
      const field = fields.nth(index);
      const current = await field.inputValue().catch(() => 'skip');
      if (current === 'skip' || current.trim()) continue;

      const type = (await field.getAttribute('type').catch(() => '')) ?? '';
      const id = (await field.getAttribute('id').catch(() => '')) ?? '';
      const placeholder =
        (await field.getAttribute('placeholder').catch(() => '')) ?? '';
      const isDatePicker =
        /DD\/MM\/YYYY/i.test(placeholder) || id.startsWith('datePicker-input');

      if (isDatePicker) {
        await field.click();
        await this.page.waitForTimeout(500);
        const day = this.page
          .getByRole('gridcell')
          .filter({ hasText: /^\d+$/ })
          .first();
        if (await day.isVisible().catch(() => false)) await day.click();
        await this.page.waitForTimeout(300);
        continue;
      }

      // Some placeholders enumerate the valid choices, e.g.
      // "Options: CGPA, Percentage, GPA". A generic word typed into one of
      // those matches nothing, so Enter commits nothing and the field reads
      // empty on validation — the first listed option is used instead.
      const optionsMatch = placeholder.match(/Options:\s*(.+)/i);
      const optionValue = optionsMatch
        ? optionsMatch[1].split(',')[0].trim()
        : '';

      const textToType =
        optionValue || (type === 'number' ? '85' : value);

      await field.click().catch(() => {});
      await field.pressSequentially(textToType, { delay: 25 }).catch(() => {});

      // Comboboxes (e.g. Grading System) keep typed text as an uncommitted
      // filter: without Enter the app never registers a selection, the field
      // reads as empty on validation, and the form's "Done" stays disabled.
      const role = (await field.getAttribute('role').catch(() => '')) ?? '';
      if (role === 'combobox' || optionValue) {
        await this.page.waitForTimeout(500);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(300);
      }
    }
  }

  /**
   * Fill and submit the upload drawer for one identity document.
   *
   * Deliberately generic: each configured document asks for different fields
   * (pan wants PAN name + father name, Passport wants type / ID / expiry), and
   * those forms come from tenant configuration rather than being fixed. Rather
   * than hard-code three shapes that break whenever the configuration changes,
   * every empty text input is given a value and every file input the sample
   * upload.
   *
   * @param value Text used for the drawer's free-text fields.
   * @param filePath Sample image/PDF used for every upload slot.
   */
  async uploadDocument(
    documentName: string,
    value: string,
    filePath: string,
  ): Promise<void> {
    await this.clickUploadForDocument(documentName);

    // Everything below is scoped to the DIALOG. Querying the whole page also
    // matches the fields behind the drawer, so the required ones inside it
    // were left empty and "Upload & Submit" stayed disabled.
    // Identified by its OWN title. Several dialogs coexist in the DOM (some
    // stale/hidden), so both getByRole('dialog') alone and .last() can target
    // the wrong node: actions then succeed against a detached drawer while the
    // visible one stays empty — exactly what the field dump showed.
    const drawer = this.page
      .getByRole('dialog')
      .filter({ hasText: `Upload ${documentName}` })
      .first();
    await drawer.waitFor({ state: 'visible', timeout: 15000 });

    // ATTACH THE FILE.
    //
    // A screenshot of the live drawer proved the text fields DO fill here, so
    // this node is the right one. Only the image slot was empty, so the file
    // input is driven directly first and the visible "browse" control is kept
    // as a fallback for slots that ignore a programmatic attach.
    const fileInputs = drawer.locator('input[type="file"]');
    const fileCount = await fileInputs.count();
    for (let index = 0; index < fileCount; index++) {
      const input = fileInputs.nth(index);
      // Skip slots that already hold a file: these inputs accept multiple, so
      // attaching unconditionally adds the same file twice.
      const attached = await input.evaluate(
        node => (node as HTMLInputElement).files?.length ?? 0,
      );
      if (attached === 0) await input.setInputFiles(filePath);
    }
    await this.page.waitForTimeout(1500);

    // Did the dropzone accept it? It still offers "Drag your files" if not.
    const stillEmpty = await drawer
      .getByText(/Drag your files/i)
      .first()
      .isVisible()
      .catch(() => false);

    if (stillEmpty) {
      console.log(
         +
          '— retrying through the browse control',
      );
      const browseControls = drawer.getByText(/browse/i);
      const browseCount = await browseControls.count();
      for (let index = 0; index < browseCount; index++) {
        const chooserPromise = this.page.waitForEvent('filechooser');
        await browseControls.nth(index).click();
        const chooser = await chooserPromise;
        await chooser.setFiles(filePath);
        await this.page.waitForTimeout(1500);
      }
    }
    // Text-ish fields. NOTE the number type: the Aadhaar/PAN number inputs are
    // type="number", so a text-only selector misses them and the form stays
    // incomplete. Date pickers are detected by placeholder.
    const fields = drawer.locator(
      'input[type="text"], input[type="number"], input[type="tel"], input:not([type]), textarea',
    );
    const fieldCount = await fields.count();
    for (let index = 0; index < fieldCount; index++) {
      const field = fields.nth(index);
      const current = await field.inputValue().catch(() => 'skip');
      if (current === 'skip' || current.trim()) continue;

      const type = (await field.getAttribute('type').catch(() => '')) ?? '';
      const placeholder =
        (await field.getAttribute('placeholder').catch(() => '')) ?? '';
      const id = (await field.getAttribute('id').catch(() => '')) ?? '';
      // This app renders date pickers with an id of datePicker-input* and
      // often no placeholder — a word typed into one is rejected outright
      // (the Passport expiry field showed "zpyrt" and blocked submission).
      const isDatePicker =
        /DD\/MM\/YYYY/i.test(placeholder) || id.startsWith('datePicker-input');

      if (isDatePicker) {
        // Picker-only: it reads "Select a date" and ignores typed input, so the
        // calendar must be opened and a day chosen. Any enabled day satisfies
        // the field, so the first in the grid is taken.
        await field.click();
        await this.page.waitForTimeout(600);
        const day = this.page
          .getByRole('gridcell')
          .filter({ hasText: /^\d+$/ })
          .first();
        if (await day.isVisible().catch(() => false)) {
          await day.click();
        } else {
          // Fall back to typing, for pickers that do accept text.
          await field.pressSequentially('31/12/2032', { delay: 30 });
          await this.page.keyboard.press('Escape');
        }
        await this.page.waitForTimeout(400);
        continue;
      }

      let fillValue = value;
      if (type === 'number') fillValue = '123456789012';

      // pressSequentially, not fill(): these are controlled inputs and a
      // programmatic value set can be discarded on the next render.
      await field.click();
      await field.pressSequentially(fillValue, { delay: 30 });
    }

    // Attach again: slots such as Passport BACK IMAGE only render once the
    // front one holds a file, so the first pass could not have seen them.
    const laterFileInputs = drawer.locator('input[type="file"]');
    const laterCount = await laterFileInputs.count();
    for (let index = 0; index < laterCount; index++) {
      const input = laterFileInputs.nth(index);
      const attached = await input.evaluate(
        node => (node as HTMLInputElement).files?.length ?? 0,
      );
      if (attached === 0) await input.setInputFiles(filePath);
    }
    await this.page.waitForTimeout(1500);

    // The button enabling is the app confirming the drawer is satisfied. If it
    // does not, report what the drawer actually contains — "still disabled"
    // alone gives nothing to act on.
    const enabled = await this.uploadSubmitButton
      .isEnabled()
      .catch(() => false);

    if (!enabled) {
      const state = await drawer
        .evaluate(node => {
          const fields = Array.from(
            node.querySelectorAll('input, textarea'),
          ).map(el => {
            const e = el as HTMLInputElement;
            const files = e.type === 'file' ? `files=${e.files?.length ?? 0}` : '';
            return `${e.getAttribute('type') ?? 'text'}:"${e.value}" ${files}`.trim();
          });
          const messages = Array.from(node.querySelectorAll('*'))
            .filter(el => {
              const t = (el.textContent ?? '').trim();
              return (
                el.children.length === 0 &&
                t.length > 0 &&
                t.length < 60 &&
                /required|invalid|must|error/i.test(t)
              );
            })
            .map(el => (el.textContent ?? '').trim());
          return { fields, messages: [...new Set(messages)] };
        })
        .catch(() => null);

      // Capture the EMPLOYEE page: Playwright's own failure snapshot shows the
      // default page fixture (the HR session), not this browser context.
      await this.page
        .screenshot({ path: 'test-results/upload-drawer.png', fullPage: true })
        .catch(() => {});

      console.log(
        `[SelfOnboarding] Upload drawer for "${documentName}" is incomplete:\n` +
          `  fields: ${JSON.stringify(state?.fields ?? [])}\n` +
          `  messages: ${JSON.stringify(state?.messages ?? [])}`,
      );
    }

    await expect(
      this.uploadSubmitButton,
      `"Upload & Submit" stayed disabled for "${documentName}" — a required ` +
        'field in the drawer is still empty (see the drawer dump logged above)',
    ).toBeEnabled({ timeout: 20000 });
    await this.uploadSubmitButton.click();
    await drawer.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  }
  // ==========================================
  //  AGREEMENTS AND POLICIES
  // ==========================================

  /** "0/2"-style completion counter above the agreement list. */
  async getAgreementsCompletion(): Promise<{ done: number; total: number }> {
    const text =
      (await this.page
        .getByText(/^\d+\/\d+$/)
        .first()
        .textContent()
        .catch(() => '')) ?? '';
    const match = text.match(/(\d+)\/(\d+)/);
    return match
      ? { done: Number(match[1]), total: Number(match[2]) }
      : { done: 0, total: 0 };
  }

  documentActionRow(title: string): Locator {
    return this.page.locator('div').filter({ hasText: title }).last();
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText(title) })
      .filter({ has: this.page.getByRole('button') })
      .last();
  }

  async isAgreementSigned(title: string): Promise<boolean> {
    const row = this.page.locator('div').filter({ has: this.page.getByText(title) }).last();
    return await row.getByText('Signed', { exact: true }).isVisible().catch(() => false);
  }

  async isPolicyAcknowledged(title: string): Promise<boolean> {
    const row = this.page.locator('div').filter({ has: this.page.getByText(title) }).last();
    return await row.getByText('Acknowledged', { exact: true }).isVisible().catch(() => false);
  }

  async uploadSignedAgreement(title: string, filePath: string = 'test-data/test-upload.png'): Promise<void> {
    if (await this.isAgreementSigned(title)) {
      console.log(`[SelfOnboarding] Agreement "${title}" is already signed — skipping upload`);
      return;
    }
    const uploadBtn = this.documentActionRow(title)
      .getByRole('button', { name: /upload signed|sign/i })
      .or(this.page.getByRole('button', { name: /upload signed|sign/i }));
    if (await uploadBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadBtn.first().scrollIntoViewIfNeeded();
      const fileChooserPromise = this.page.waitForEvent('filechooser');
      await uploadBtn.first().click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filePath);
      await this.page.waitForTimeout(1500);
    } else {
      console.log(`[SelfOnboarding] No upload button found for "${title}" — may already be signed`);
    }
  }

  async clickSignAgreement(title: string): Promise<void> {
    await this.uploadSignedAgreement(title);
  }

  async clickAcknowledgePolicy(title: string): Promise<void> {
    if (await this.isPolicyAcknowledged(title)) {
      console.log(`[SelfOnboarding] Policy "${title}" is already acknowledged — skipping`);
      return;
    }
    const ackBtn = this.documentActionRow(title)
      .getByRole('button', { name: 'Acknowledge', exact: true })
      .or(this.page.getByRole('button', { name: 'Acknowledge', exact: true }));
    if (await ackBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await ackBtn.first().click();
      await this.page.waitForTimeout(1000);
    }
  }
}
