import { Page, expect } from '@playwright/test';
import { LetterGenerationPage } from '@pages/LetterGenerationPage';
import { getBaseUrl } from '@utils/helpers';

/**
 * LetterGenerationKeywords provides high-level business actions for the
 * standalone Letter Generation module: the Letter Dashboard grid, the
 * per-candidate Offer Letter detail/approval page, and the Release-to-candidate flow.
 *
 * Used by CHRO, HR Manager (approvals) and Business HR (release).
 */
export class LetterGenerationKeywords {
  private readonly page: Page;
  private readonly letterPage: LetterGenerationPage;

  constructor(page: Page) {
    this.page = page;
    this.letterPage = new LetterGenerationPage(page);
  }

  // ==========================================
  //  NAVIGATION
  // ==========================================

  async navigateToLetterGeneration(): Promise<void> {
    await this.page.goto(`${getBaseUrl()}/people/pre-onboarding/offer-letter`, {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForLoadState('networkidle');
    await this.letterPage.letterDashboardHeading.waitFor({ state: 'visible', timeout: 15000 });
  }

  // ==========================================
  //  LETTER DASHBOARD
  // ==========================================

  async verifyLetterDashboardVisible(): Promise<void> {
    await expect(this.letterPage.isLetterDashboardVisible()).resolves.toBe(true);
  }

  async searchLetters(text: string): Promise<void> {
    await this.letterPage.searchLetters(text);
  }

  async verifyLetterStatus(candidateName: string, expectedStatus: string): Promise<void> {
    await expect
      .poll(async () => await this.letterPage.getLetterStatus(candidateName), { timeout: 15000 })
      .toBe(expectedStatus);
  }

  async selectLetterRow(candidateName: string): Promise<void> {
    await this.letterPage.selectLetterRow(candidateName);
  }

  async isLetterRowSelectable(candidateName: string): Promise<boolean> {
    return await this.letterPage.isLetterRowSelectable(candidateName);
  }

  async clickViewLetter(candidateName: string): Promise<void> {
    await this.letterPage.clickViewLetter(candidateName);
    await this.page.waitForLoadState('networkidle');
  }

  async verifyReleaseButtonVisible(): Promise<void> {
    await expect(this.letterPage.isReleaseButtonVisible()).resolves.toBe(true);
  }

  async clickRelease(): Promise<void> {
    await this.letterPage.clickRelease();
  }

  async confirmRelease(): Promise<void> {
    await this.letterPage.confirmRelease();
  }

  async cancelRelease(): Promise<void> {
    await this.letterPage.cancelRelease();
  }

  /**
   * Full release flow: select the candidate's row, click Release, confirm "Yes"
   * on the "reaching letter to N candidate(s)" dialog.
   */
  async releaseLetterToCandidate(candidateName: string): Promise<void> {
    await this.selectLetterRow(candidateName);
    await this.clickRelease();
    await this.confirmRelease();
  }

  async getSelectedCountText(): Promise<string> {
    return await this.letterPage.getSelectedCountText();
  }

  // ==========================================
  //  OFFER LETTER DETAIL PAGE
  // ==========================================

  async getOfferLetterStatus(): Promise<string> {
    return await this.letterPage.getOfferLetterStatus();
  }

  async verifyOfferLetterStatus(expectedStatus: string): Promise<void> {
    await expect
      .poll(async () => await this.letterPage.getOfferLetterStatus(), { timeout: 15000 })
      .toBe(expectedStatus);
  }

  async getLevelsApprovedText(): Promise<string> {
    return await this.letterPage.getLevelsApprovedText();
  }

  async getApproverStatus(approverNameOrRole: string): Promise<string> {
    return await this.letterPage.getApproverStatus(approverNameOrRole);
  }

  // Assert on the locator rather than on a resolved isVisible() boolean:
  // expect(promise).resolves.toBe(true) reads visibility exactly once, so it
  // races the Offer Letter Detail page still rendering its action buttons.
  // toBeVisible() auto-retries until the timeout instead.
  async verifyApproveButtonVisible(): Promise<void> {
    await expect(this.letterPage.approveButton).toBeVisible();
  }

  async verifyRejectButtonVisible(): Promise<void> {
    await expect(this.letterPage.rejectButton).toBeVisible();
  }

  async getLatestActivityText(): Promise<string> {
    return await this.letterPage.getLatestActivityText();
  }

  // ==========================================
  //  CHRO APPROVAL (signature required)
  // ==========================================

  async verifyApproveLetterModalVisible(): Promise<void> {
    await expect(this.letterPage.isApproveLetterModalVisible()).resolves.toBe(true);
  }

  async uploadSignatureFile(filePath: string): Promise<void> {
    await this.letterPage.uploadSignatureFile(filePath);
  }

  async uploadSignedOfferLetterFile(filePath: string): Promise<void> {
    await this.letterPage.uploadSignedOfferLetterFile(filePath);
  }

  async clickApproveLetterModalConfirm(): Promise<void> {
    await this.letterPage.clickApproveLetterModalConfirm();
  }

  async clickApproveLetterModalCancel(): Promise<void> {
    await this.letterPage.clickApproveLetterModalCancel();
  }

  /**
   * CHRO approves via the "Upload Signature" tab of the Approve Letter modal.
   */
  async approveAsChro(signatureFilePath: string): Promise<void> {
    await this.letterPage.approveWithSignatureUpload(signatureFilePath);
  }

  // ==========================================
  //  HR MANAGER APPROVAL (simple confirm, no signature)
  // ==========================================

  async verifySimpleApproveModalVisible(): Promise<void> {
    await expect(this.letterPage.isSimpleApproveModalVisible()).resolves.toBe(true);
  }

  async clickSimpleApproveConfirm(): Promise<void> {
    await this.letterPage.clickSimpleApproveConfirm();
  }

  async clickSimpleApproveCancel(): Promise<void> {
    await this.letterPage.clickSimpleApproveCancel();
  }

  /**
   * HR Manager approves via the simple Yes/No-style confirmation modal
   * (no signature — role is configured as "Cannot sign").
   */
  async approveAsHrManager(): Promise<void> {
    await this.letterPage.approveWithSimpleConfirm();
  }

  // ==========================================
  //  REJECT LETTER (CHRO / HR MANAGER)
  // ==========================================

  async verifyRejectLetterModalVisible(): Promise<void> {
    await expect(this.letterPage.isRejectLetterModalVisible()).resolves.toBe(true);
  }

  async fillRejectLetterReason(reason: string): Promise<void> {
    await this.letterPage.fillRejectLetterReason(reason);
  }

  async isRejectLetterConfirmButtonEnabled(): Promise<boolean> {
    return await this.letterPage.isRejectLetterConfirmButtonEnabled();
  }

  async clickRejectLetterConfirm(): Promise<void> {
    await this.letterPage.clickRejectLetterConfirm();
  }

  async clickRejectLetterCancel(): Promise<void> {
    await this.letterPage.clickRejectLetterCancel();
  }

  async rejectLetterWithReason(reason: string): Promise<void> {
    await this.letterPage.rejectWithReason(reason);
  }
}
