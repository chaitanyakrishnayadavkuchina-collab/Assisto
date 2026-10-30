import { type Page, type Locator } from '@playwright/test';

/**
 * EmployeeIdGenerationPage covers Onboarding → Employee IDs: the read-only ID
 * Format Builder on the left and the Batch Generation panel (Pending /
 * Completed) on the right.
 *
 * NOTE ON FORMAT SCOPE: the builder is labelled "Configured format —
 * read-only" and states "To change this format, contact your Admin". The
 * Format Scope dropdown therefore cannot be used to pick a different formatter
 * from a test; the configured value (e.g. NSP_ID, composed of
 * Entity Code-Dept Code-Year-Sequence) is asserted instead of selected.
 *
 * The generated Employee ID is always read back from the UI — never
 * fabricated in test data.
 */
export class EmployeeIdGenerationPage {
  private readonly page: Page;

  readonly heading: Locator;
  readonly formatScopeDropdown: Locator;
  readonly formatScopeReadOnlyNote: Locator;
  readonly currentFormatTokens: Locator;

  // Batch Generation
  readonly batchGenerationHeading: Locator;
  readonly pendingTab: Locator;
  readonly completedTab: Locator;
  readonly searchCandidatesInput: Locator;
  readonly exportButton: Locator;
  readonly generateIdsButton: Locator;
  readonly candidateCards: Locator;
  readonly paginationInfo: Locator;

  constructor(page: Page) {
    this.page = page;

    // Screen titles render as plain text in this app, not heading roles.
    this.heading = page
      .getByText('Employee ID Generator', { exact: true })
      .first();
    this.formatScopeDropdown = page.getByRole('combobox').first();
    this.formatScopeReadOnlyNote = page.getByText(
      'To change this format, contact your Admin.',
    );
    this.currentFormatTokens = page
      .locator('div')
      .filter({ hasText: /^Current format:/ })
      .first();

    // The panel is titled 'ID Generation' in the app; the regex also covers
    // the 'Batch Generation' wording seen in earlier builds.
    this.batchGenerationHeading = page
      .getByText(/^(?:Batch |ID )Generation$/)
      .first();
    this.pendingTab = page.getByRole('tab', { name: /Pending/ });
    this.completedTab = page.getByRole('tab', { name: /Completed/ });
    // Regex, not a literal: the app renders a Unicode ellipsis (…) in these
    // placeholders, so an exact "..." string never matches.
    this.searchCandidatesInput = page.getByPlaceholder(/Search candidates/i);
    this.exportButton = page.getByRole('button', { name: 'Export' });
    // A Fluent SplitButton: "Generate IDs" matches BOTH the primary action and
    // its menu toggle, which fails strict mode. Scoping to the primary action
    // element picks the one that actually generates. The label also carries a
    // selection count ("Generate IDs (1)"), so the match must be a prefix.
    this.generateIdsButton = page
      .locator('button[id$="__primaryActionButton"]')
      .filter({ hasText: /^Generate IDs/ });
    this.candidateCards = page.getByRole('checkbox');
    this.paginationInfo = page.getByText(/\d+–\d+ of \d+ candidates/);
  }

  async isHeadingVisible(): Promise<boolean> {
    return await this.heading.isVisible().catch(() => false);
  }

  /**
   * The configured Format Scope.
   *
   * Read via inputValue() first: this control is an <input role="combobox">,
   * so textContent() comes back empty. Falls back to textContent for the
   * button-style dropdown variant.
   */
  async getFormatScope(): Promise<string> {
    const cb = this.page.getByRole('combobox', { name: /Select scope/i }).or(this.formatScopeDropdown);
    const text = await cb.evaluate((el: HTMLElement) => {
      if ('value' in el && typeof (el as HTMLInputElement).value === 'string' && (el as HTMLInputElement).value) {
        return (el as HTMLInputElement).value.trim();
      }
      return (el.innerText || el.textContent || el.getAttribute('value') || '').trim();
    }).catch(() => '');
    if (text) return text;
    const value = await this.formatScopeDropdown.inputValue().catch(() => '');
    if (value.trim()) return value.trim();
    return (await this.formatScopeDropdown.textContent().catch(() => ''))?.trim() ?? '';
  }

  async selectFormatScope(scopeName: string): Promise<void> {
    const current = await this.getFormatScope();
    if (current && current.toLowerCase().includes(scopeName.toLowerCase())) {
      return;
    }
    const combobox = this.page.locator('.fui-Combobox').first();
    await combobox.click();
    await this.page.waitForTimeout(500);
    const option = this.page.getByRole('option', { name: new RegExp(scopeName, 'i') });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getCurrentFormat(): Promise<string> {
    return (await this.currentFormatTokens.textContent())?.trim() ?? '';
  }

  async clickPendingTab(): Promise<void> {
    await this.pendingTab.click();
  }

  async clickCompletedTab(): Promise<void> {
    await this.completedTab.click();
  }

  /**
   * Filter the candidate list. The search box is not rendered on every tab, so
   * its absence is not fatal — the caller can still match a card by name, just
   * against an unfiltered list.
   */
  async searchCandidate(text: string): Promise<void> {
    const present = await this.searchCandidatesInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!present) {
      console.log(
        '[EmployeeIds] No search box on this tab — matching against the unfiltered list',
      );
      return;
    }
    await this.searchCandidatesInput.fill(text);
    await this.page.waitForTimeout(800);
  }

  /**
   * The Batch Generation entry for a candidate. Each entry is a card (not a
   * grid row) carrying the name, designation, joining date, and either a
   * checkbox + "Not generated" or the generated ID.
   */
  candidateCard(candidateName: string): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(candidateName) })
      .filter({ has: this.page.getByRole('checkbox') })
      .last();
  }

  /**
   * The candidate's entry on the COMPLETED tab, where issued IDs live. Unlike
   * the Pending card this has no checkbox, so it needs its own locator.
   */
  completedCandidateCard(candidateName: string): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(candidateName) })
      .last();
  }

  async isCandidateListed(candidateName: string): Promise<boolean> {
    return await this.candidateCard(candidateName)
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  }

  async selectCandidate(candidateName: string): Promise<void> {
    await this.candidateCard(candidateName).getByRole('checkbox').check();
  }

  async isGenerateIdsEnabled(): Promise<boolean> {
    return await this.generateIdsButton.isEnabled().catch(() => false);
  }

  async clickGenerateIds(): Promise<void> {
    await this.generateIdsButton.click();
  }

  /**
   * Reads the Employee ID shown against a candidate. Returns '' while the card
   * still reads "Not generated", so callers can poll rather than snapshot.
   */
  async getGeneratedEmployeeId(candidateName: string): Promise<string> {
    // Try the Completed entry first (where issued IDs live), then the Pending
    // card, so this works whichever tab the caller is on.
    let text = (await this.completedCandidateCard(candidateName).textContent().catch(() => '')) ?? '';
    if (/Not generated/i.test(text) || !/[A-Z0-9]+(?:-[A-Z0-9]+){2,}/.test(text)) {
      text = (await this.candidateCard(candidateName).textContent().catch(() => '')) ?? '';
    }
    if (/Not generated/i.test(text)) return '';
    // The ID is the format's token output (e.g. NSP-ENG-2026-0007): the only
    // upper-case, hyphen-joined token group on the card.
    const match = text.match(/[A-Z0-9]+(?:-[A-Z0-9]+){2,}/);
    return match ? match[0] : '';
  }
}
