import { type Page, type Locator, expect } from '@playwright/test';
import { dispatchNativeClickOnRowAction } from '@utils/nativeClickHelpers';

/**
 * LetterGenerationPage encapsulates the standalone "Letter Generation" module —
 * distinct from the HR candidate-detail modal (HrDocumentReviewPage). Covers:
 *   - Letter Dashboard grid (search/filter/columns, row selection, Release)
 *   - Offer Letter detail page (Approve/Reject/Edit, Approval Summary, Activity log)
 *   - "Approve Letter" modal (CHRO: signature required) and the simple
 *     confirm-only variant (HR Manager: "Cannot sign")
 *   - Release-to-candidate confirmation
 */
export class LetterGenerationPage {
  private readonly page: Page;

  // ===== Letter Dashboard (grid) =====
  readonly letterDashboardHeading: Locator;
  readonly searchLettersTextbox: Locator;
  readonly filterButton: Locator;
  readonly exportButton: Locator;
  readonly columnsButton: Locator;
  readonly letterRows: Locator;
  readonly selectedCountText: Locator;
  readonly releaseButton: Locator;
  readonly clearSelectionButton: Locator;
  readonly paginationInfo: Locator;

  // Release confirmation modal
  readonly releaseConfirmDialog: Locator;
  readonly releaseConfirmYesButton: Locator;
  readonly releaseConfirmNoButton: Locator;

  // ===== Offer Letter Detail Page =====
  readonly candidateNameHeading: Locator;
  readonly offerLetterStatusBadge: Locator;
  readonly templateNameText: Locator;
  readonly approvalSummaryHeading: Locator;
  readonly levelsApprovedText: Locator;
  readonly documentPreviewHeading: Locator;

  // Outer action buttons (open the Approve Letter modal / trigger reject)
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly editButton: Locator;

  // Activity panel
  readonly activityHeading: Locator;
  readonly activityEntries: Locator;
  readonly noActivityText: Locator;

  // ===== Approve Letter Modal (CHRO — signature required) =====
  readonly approveLetterModal: Locator;
  readonly approveLetterModalHeading: Locator;
  readonly uploadSignatureTab: Locator;
  readonly downloadAndSignTab: Locator;
  readonly uploadSignatureArea: Locator;
  readonly signatureSelectFileButton: Locator;
  readonly signatureFileInput: Locator;
  readonly signatureConsentText: Locator;
  readonly downloadOfferLetterButton: Locator;
  readonly uploadSignedLetterSelectFileButton: Locator;
  readonly uploadSignedLetterFileInput: Locator;
  readonly approveLetterModalCancelButton: Locator;
  readonly approveLetterModalConfirmButton: Locator;
  readonly removeAttachedSignatureButton: Locator;

  // ===== Simple Confirm Modal (HR Manager — no signature) =====
  readonly simpleApproveModal: Locator;
  readonly simpleApproveModalHeading: Locator;
  readonly simpleApproveCannotBeUndoneText: Locator;
  readonly simpleApproveCancelButton: Locator;
  readonly simpleApproveConfirmButton: Locator;

  // ===== Reject Letter Modal (CHRO / HR Manager) =====
  // Mirrors the "Reject Document" / candidate "Reason for Rejection" pattern
  // used elsewhere in this app: a reason textarea gates the confirm action.
  readonly rejectLetterModal: Locator;
  readonly rejectLetterReasonInput: Locator;
  readonly rejectLetterConfirmButton: Locator;
  readonly rejectLetterCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Letter Dashboard ──
    // Rendered as a plain styled <div>, not a semantic heading (same pattern
    // as "Candidate Management" on the Candidate Registration grid).
    this.letterDashboardHeading = page.getByText('Letter Dashboard', { exact: true });
    this.searchLettersTextbox = page.getByPlaceholder('Search letters...');
    this.filterButton = page.getByRole('button', { name: 'Filter' });
    this.exportButton = page.getByRole('button', { name: 'Export' }).first();
    this.columnsButton = page.getByRole('button', { name: 'Columns' }).first();
    this.letterRows = page.locator('div[role="row"]').filter({ hasNot: page.locator('[role="columnheader"]') }).filter({ visible: true });
    this.selectedCountText = page.getByText(/\d+ selected/);
    this.releaseButton = page.getByRole('button', { name: 'Release' });
    this.clearSelectionButton = page.getByRole('button', { name: 'Clear selection' });
    this.paginationInfo = page.getByText(/\d+\s*[–-]\s*\d+\s*of\s*\d+\s*letters/);

    // Release confirmation modal
    this.releaseConfirmDialog = page.locator('[role="dialog"]').filter({ hasText: 'Are you sure you want to proceed?' }).first();
    this.releaseConfirmYesButton = this.releaseConfirmDialog.getByRole('button', { name: 'Yes' });
    this.releaseConfirmNoButton = this.releaseConfirmDialog.getByRole('button', { name: 'No' });

    // ── Offer Letter Detail Page ──
    this.candidateNameHeading = page.getByRole('heading').first();
    this.offerLetterStatusBadge = page.getByText('Offer Letter').locator('..').getByText(/^(Pending|Approved|Released|Accepted|Rejected)$/).first();
    this.templateNameText = page.getByText('TEMPLATE').locator('..');
    this.approvalSummaryHeading = page.getByText('Approval Summary');
    this.levelsApprovedText = page.getByText(/of \d+ levels approved/i);
    this.documentPreviewHeading = page.getByText('Document Preview');

    this.approveButton = page.getByRole('button', { name: 'Approve', exact: true }).first();
    this.rejectButton = page.getByRole('button', { name: 'Reject', exact: true }).first();
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true }).first();

    this.activityHeading = page.getByText('Activity', { exact: true });
    // Entries have no distinguishing class name — matched directly by their
    // title text pattern (e.g. "CHRO Cleared", "Offer Letter Approved — CHRO").
    this.activityEntries = page.getByText(/Cleared|Offer Letter (Approved|Rejected|Fully Approved)/i);
    this.noActivityText = page.getByText('No offer-letter activity yet.');

    // ── Approve Letter Modal (CHRO) ──
    this.approveLetterModal = page.locator('[role="dialog"]').filter({ has: page.getByRole('heading', { name: 'Approve Letter' }) }).filter({ has: page.getByText('Attach your signature') }).first();
    this.approveLetterModalHeading = this.approveLetterModal.getByRole('heading', { name: 'Approve Letter' });
    this.uploadSignatureTab = this.approveLetterModal.getByRole('tab', { name: 'Upload Signature' });
    this.downloadAndSignTab = this.approveLetterModal.getByRole('tab', { name: 'Download and Sign' });
    this.uploadSignatureArea = this.approveLetterModal.getByText('Upload your Signature');
    this.signatureSelectFileButton = this.approveLetterModal.getByRole('button', { name: 'Select File' }).first();
    this.signatureFileInput = this.approveLetterModal.locator('input[type="file"]').first();
    this.signatureConsentText = this.approveLetterModal.getByText(/legally binding/i);
    this.downloadOfferLetterButton = this.approveLetterModal.getByRole('button', { name: 'Download' });
    this.uploadSignedLetterSelectFileButton = this.approveLetterModal.getByRole('button', { name: 'Select File' }).last();
    this.uploadSignedLetterFileInput = this.approveLetterModal.locator('input[type="file"]').last();
    this.approveLetterModalCancelButton = this.approveLetterModal.getByRole('button', { name: 'Cancel' });
    this.approveLetterModalConfirmButton = this.approveLetterModal.getByRole('button', { name: 'Approve' });
    this.removeAttachedSignatureButton = this.approveLetterModal.getByRole('button', { name: 'x', exact: true }).or(this.approveLetterModal.locator('button').filter({ hasText: '×' }));

    // ── Simple Confirm Modal (HR Manager) ──
    this.simpleApproveModal = page.locator('[role="dialog"]').filter({ has: page.getByRole('heading', { name: 'Approve Letter' }) }).filter({ hasText: 'This action cannot be undone' }).first();
    this.simpleApproveModalHeading = this.simpleApproveModal.getByRole('heading', { name: 'Approve Letter' });
    this.simpleApproveCannotBeUndoneText = this.simpleApproveModal.getByText(/This action cannot be undone/i);
    this.simpleApproveCancelButton = this.simpleApproveModal.getByRole('button', { name: 'Cancel' });
    this.simpleApproveConfirmButton = this.simpleApproveModal.getByRole('button', { name: 'Approve' });

    // ── Reject Letter Modal (CHRO / HR Manager) ──
    this.rejectLetterModal = page.locator('[role="dialog"]').filter({ hasText: /Reject/i }).first();
    this.rejectLetterReasonInput = this.rejectLetterModal.getByPlaceholder(/reason|e\.g\./i).first()
      .or(this.rejectLetterModal.getByRole('textbox').last());
    this.rejectLetterConfirmButton = this.rejectLetterModal.getByRole('button', { name: /Confirm|Reject/i }).last();
    this.rejectLetterCancelButton = this.rejectLetterModal.getByRole('button', { name: 'Cancel' });
  }

  // ==========================================
  //  LETTER DASHBOARD — NAVIGATION & VISIBILITY
  // ==========================================

  async isLetterDashboardVisible(): Promise<boolean> {
    return await this.letterDashboardHeading.isVisible();
  }

  async searchLetters(text: string): Promise<void> {
    await this.searchLettersTextbox.fill(text);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  getLetterRow(candidateName: string): Locator {
    return this.letterRows.filter({ hasText: candidateName }).first();
  }

  async getLetterStatus(candidateName: string): Promise<string> {
    const row = this.getLetterRow(candidateName);
    const statusCell = row.getByText(/^(Pending|Accepted|Released|Approved|Rejected)$/).first();
    return (await statusCell.textContent() ?? '').trim();
  }

  async selectLetterRow(candidateName: string): Promise<void> {
    const row = this.getLetterRow(candidateName);
    await row.locator('input[type="checkbox"], [role="checkbox"]').first().click();
  }

  /**
   * A letter still Pending approval renders its row checkbox disabled
   * (it cannot be selected for Release), so selectLetterRow() would hang
   * waiting for it to become clickable. Callers must check this first.
   */
  async isLetterRowSelectable(candidateName: string): Promise<boolean> {
    const row = this.getLetterRow(candidateName);
    return await row.locator('input[type="checkbox"], [role="checkbox"]').first().isEnabled();
  }

  async clickViewLetter(candidateName: string): Promise<void> {
    // See the detailed comment in CandidateRegistrationPage.openCandidateDetail
    // for why a native DOM click (bypassing Playwright's positional
    // actionability engine) is used instead of a locator-driven click.
    const row = this.getLetterRow(candidateName);
    await row.scrollIntoViewIfNeeded();
    const dispatched = await dispatchNativeClickOnRowAction(row);
    if (!dispatched) {
      throw new Error('View action button not found in the row');
    }
  }

  async isReleaseButtonVisible(): Promise<boolean> { return await this.releaseButton.isVisible(); }
  async clickRelease(): Promise<void> { await this.releaseButton.click(); }

  async confirmRelease(): Promise<void> {
    await this.releaseConfirmDialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.releaseConfirmYesButton.click();
  }

  async cancelRelease(): Promise<void> {
    await this.releaseConfirmDialog.waitFor({ state: 'visible', timeout: 10000 });
    await this.releaseConfirmNoButton.click();
  }

  async getSelectedCountText(): Promise<string> {
    return (await this.selectedCountText.textContent() ?? '').trim();
  }

  // ==========================================
  //  OFFER LETTER DETAIL PAGE
  // ==========================================

  async getOfferLetterStatus(): Promise<string> {
    return (await this.offerLetterStatusBadge.textContent() ?? '').trim();
  }

  async getLevelsApprovedText(): Promise<string> {
    return (await this.levelsApprovedText.textContent() ?? '').trim();
  }

  async getApproverStatus(approverNameOrRole: string): Promise<string> {
    const row = this.page.getByText(approverNameOrRole, { exact: false }).locator('..');
    const badge = row.getByText(/^(Pending|Approved)$/).first();
    return (await badge.textContent() ?? '').trim();
  }

  async isApproveButtonVisible(): Promise<boolean> { return await this.approveButton.isVisible(); }
  async isRejectButtonVisible(): Promise<boolean> { return await this.rejectButton.isVisible(); }
  async isEditButtonVisible(): Promise<boolean> { return await this.editButton.isVisible(); }

  async clickApprove(): Promise<void> { await this.approveButton.click(); }
  async clickReject(): Promise<void> { await this.rejectButton.click(); }
  async clickEdit(): Promise<void> { await this.editButton.click(); }

  async getLatestActivityText(): Promise<string> {
    const first = this.activityEntries.first();
    return (await first.textContent() ?? '').trim();
  }

  // ==========================================
  //  APPROVE LETTER MODAL (CHRO — signature)
  // ==========================================

  async isApproveLetterModalVisible(): Promise<boolean> {
    return await this.approveLetterModal.isVisible().catch(() => false);
  }

  async clickUploadSignatureTab(): Promise<void> { await this.uploadSignatureTab.click(); }
  async clickDownloadAndSignTab(): Promise<void> { await this.downloadAndSignTab.click(); }

  async uploadSignatureFile(filePath: string): Promise<void> {
    await this.signatureFileInput.setInputFiles(filePath);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async uploadSignedOfferLetterFile(filePath: string): Promise<void> {
    await this.clickDownloadAndSignTab();
    await this.uploadSignedLetterFileInput.setInputFiles(filePath);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async isApproveLetterModalConfirmButtonEnabled(): Promise<boolean> {
    return await this.approveLetterModalConfirmButton.isEnabled();
  }

  async clickApproveLetterModalConfirm(): Promise<void> { await this.approveLetterModalConfirmButton.click(); }
  async clickApproveLetterModalCancel(): Promise<void> { await this.approveLetterModalCancelButton.click(); }

  async approveWithSignatureUpload(filePath: string): Promise<void> {
    await this.clickApprove();
    await this.approveLetterModal.waitFor({ state: 'visible', timeout: 10000 });
    await this.uploadSignatureFile(filePath);
    await this.clickApproveLetterModalConfirm();
  }

  // ==========================================
  //  SIMPLE CONFIRM MODAL (HR MANAGER — no signature)
  // ==========================================

  async isSimpleApproveModalVisible(): Promise<boolean> {
    return await this.simpleApproveModal.isVisible().catch(() => false);
  }

  async clickSimpleApproveConfirm(): Promise<void> { await this.simpleApproveConfirmButton.click(); }
  async clickSimpleApproveCancel(): Promise<void> { await this.simpleApproveCancelButton.click(); }

  async approveWithSimpleConfirm(): Promise<void> {
    await this.clickApprove();
    await this.simpleApproveModal.waitFor({ state: 'visible', timeout: 10000 });
    await this.clickSimpleApproveConfirm();
  }

  // ==========================================
  //  REJECT LETTER MODAL (CHRO / HR MANAGER)
  // ==========================================

  async isRejectLetterModalVisible(): Promise<boolean> {
    return await this.rejectLetterModal.isVisible().catch(() => false);
  }

  async fillRejectLetterReason(reason: string): Promise<void> {
    await this.rejectLetterReasonInput.fill(reason);
  }

  async isRejectLetterConfirmButtonEnabled(): Promise<boolean> {
    return await this.rejectLetterConfirmButton.isEnabled();
  }

  async clickRejectLetterConfirm(): Promise<void> { await this.rejectLetterConfirmButton.click(); }
  async clickRejectLetterCancel(): Promise<void> { await this.rejectLetterCancelButton.click(); }

  async rejectWithReason(reason: string): Promise<void> {
    await this.clickReject();
    await this.rejectLetterModal.waitFor({ state: 'visible', timeout: 10000 });
    await this.fillRejectLetterReason(reason);
    await this.clickRejectLetterConfirm();
  }
}
