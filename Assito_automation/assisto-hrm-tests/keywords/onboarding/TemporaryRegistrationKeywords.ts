import { Page, expect } from '@playwright/test';
import { TemporaryRegistrationPage } from '@pages/onboarding/TemporaryRegistrationPage';
import { getBaseUrl } from '@utils/helpers';

/** Values the operator must supply on the Temporary Registration modal. */
export interface TemporaryRegistrationData {
  reportingManager: string;
  location: string;
  department: string;
  /** dd/MM/yyyy. Defaults to today — see fillDateOfJoining for why. */
  dateOfJoining?: string;
  businessUnit?: string;
  virtualOnboarding?: 'Yes' | 'No';
  laptopRequired?: 'Yes' | 'No';
}

/**
 * TemporaryRegistrationKeywords drives the transition of an accepted candidate
 * into the employee onboarding process.
 *
 * This never creates a candidate: it opens an existing candidate who has
 * already accepted their offer and registers them into the ERP system.
 */
export class TemporaryRegistrationKeywords {
  private readonly page: Page;
  private readonly tempRegPage: TemporaryRegistrationPage;

  constructor(page: Page) {
    this.page = page;
    this.tempRegPage = new TemporaryRegistrationPage(page);
  }

  // ==========================================
  //  NAVIGATION
  // ==========================================

  /** Open a candidate's pre-onboarding detail page by its application ID. */
  async navigateToCandidateDetail(candidateId: string): Promise<void> {
    await this.page.goto(
      `${getBaseUrl()}/people/pre-onboarding/candidate/${candidateId}`,
      { waitUntil: 'domcontentloaded' },
    );
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // ==========================================
  //  VERIFICATIONS
  // ==========================================

  /**
   * Confirm the candidate is in the accepted state.
   *
   * The authoritative signal is the Temporary Candidate Registration BUTTON:
   * the app only offers it once an offer has been accepted, so its presence is
   * the gate that actually governs this flow. The "Offer Accepted" chip is
   * checked too, but only as corroboration — its casing and placement vary
   * between candidate records, and a missing chip on an otherwise registerable
   * candidate is a cosmetic difference, not a reason to abort onboarding.
   */
  async verifyOfferAccepted(): Promise<void> {
    await expect(
      this.tempRegPage.temporaryCandidateRegistrationButton,
      'Candidate is not in an accepted state — Temporary Candidate ' +
        'Registration is not offered for them',
    ).toBeVisible({ timeout: 15000 });

    const badgeVisible = await this.tempRegPage
      .isOfferAcceptedBadgeVisible()
      .catch(() => false);
    console.log(
      `[Onboarding] Offer-accepted chip ${badgeVisible ? 'shown' : 'not shown'} ` +
        'on the candidate header',
    );
  }

  async verifyTemporaryRegistrationAvailable(): Promise<void> {
    await expect(
      this.tempRegPage.temporaryCandidateRegistrationButton,
    ).toBeVisible({ timeout: 15000 });
  }

  async verifyModalVisible(): Promise<void> {
    await expect(this.tempRegPage.modalHeading).toBeVisible({ timeout: 15000 });
  }

  /**
   * Read the candidate's identity off the modal's pre-filled, read-only
   * fields — the authoritative source in this app.
   *
   * The Candidate Registration grid concatenates its cells without separators
   * and the detail page renders the name without a heading role, so neither
   * can be parsed reliably. These textboxes hold clean single values, and the
   * modal is reached via /candidate/{id}, so what it shows is by construction
   * the candidate this run anchored on.
   */
  async captureIdentityFromModal(): Promise<{
    candidateFullName: string;
    email: string;
  }> {
    const first = await this.tempRegPage.getFirstName();
    const last = await this.tempRegPage.getLastName();
    const email = await this.tempRegPage.getPersonalMailId();
    const candidateFullName = `${first} ${last}`.trim();

    expect(
      candidateFullName,
      'Temporary Registration modal carried no candidate name — ' +
        'it may have opened for the wrong record',
    ).not.toBe('');
    expect(
      email,
      'Temporary Registration modal carried no personal mail ID',
    ).not.toBe('');

    console.log(
      `[Onboarding] Identity from Temporary Registration: "${candidateFullName}" <${email}>`,
    );
    return { candidateFullName, email };
  }

  // ==========================================
  //  ACTIONS
  // ==========================================

  async openTemporaryRegistration(): Promise<void> {
    await this.tempRegPage.clickTemporaryCandidateRegistration();
    await this.verifyModalVisible();
    // The modal re-renders as its dropdown data loads; interacting before that
    // settles makes every click race a detached element.
    await this.tempRegPage.waitForModalReady();
  }

  /**
   * Fills every required field and submits.
   *
   * Date of Joining defaults to TODAY: the Day-0 Check-In console only lists
   * joiners expected today, so a future date makes that step unreachable.
   */
  async completeTemporaryRegistration(
    data: TemporaryRegistrationData,
  ): Promise<void> {
    const joiningDate = data.dateOfJoining ?? todayAsDdMmYyyy();

    await this.tempRegPage.selectReportingManager(data.reportingManager);
    await this.tempRegPage.selectLocation(data.location);
    await this.tempRegPage.selectDepartment(data.department);
    await this.tempRegPage.fillDateOfJoining(joiningDate);

    if (data.businessUnit) {
      await this.tempRegPage.fillBusinessUnit(data.businessUnit);
    }
    if (data.virtualOnboarding) {
      await this.tempRegPage.chooseVirtualOnboarding(data.virtualOnboarding);
    }
    if (data.laptopRequired) {
      await this.tempRegPage.chooseLaptopRequired(data.laptopRequired);
    }

    console.log(
      `[Onboarding] Registering temporarily — manager "${data.reportingManager}", ` +
        `location "${data.location}", department "${data.department}", joining ${joiningDate}`,
    );

    await this.tempRegPage.clickRegisterTemporarily();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * The modal closing is the app's own confirmation that the registration was
   * accepted.
   *
   * Asserted on the "Register Temporarily" BUTTON rather than the heading
   * text: submitting navigates onward, and the destination page still renders
   * the words "Temporary Registration", so a text-based check never goes
   * hidden even on success. The button exists only inside the dialog.
   */
  async verifyRegistrationSucceeded(): Promise<void> {
    await expect(
      this.tempRegPage.registerTemporarilyButton,
      'Temporary Registration did not complete — the modal stayed open',
    ).toBeHidden({ timeout: 30000 });

    await this.page.waitForLoadState('networkidle').catch(() => {});
    console.log(`[Onboarding] Temporary registration complete — URL: ${this.page.url()}`);
  }
}

/** Today in the picker's dd/MM/yyyy format. */
export function todayAsDdMmYyyy(now: Date = new Date()): string {
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${now.getFullYear()}`;
}
