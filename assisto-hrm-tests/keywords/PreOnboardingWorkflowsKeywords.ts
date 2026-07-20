import { type Page } from '@playwright/test';
import { PreOnboardingWorkflowsPage } from '@pages/PreOnboardingWorkflowsPage';

/**
 * PreOnboardingWorkflowsKeywords provides high-level business actions
 * for the Pre-Onboarding Milestones & Workflows configuration page.
 *
 * Admin actions include configuring milestones, sequence order, SLA hours,
 * form sections, document verification, offer letter settings, and approval chains.
 */
export class PreOnboardingWorkflowsKeywords {
  private readonly page: Page;
  private readonly workflowsPage: PreOnboardingWorkflowsPage;

  constructor(page: Page) {
    this.page = page;
    this.workflowsPage = new PreOnboardingWorkflowsPage(page);
  }

  /** Navigate to Settings → Pre-Onboarding Settings → Milestones & Workflows */
  async navigateToMilestonesWorkflows(): Promise<void> {
    // Step 0: Click sidebar toggle to expand the sidebar if collapsed
    try {
      const sidebarToggle = this.page.locator('button:has-text(">")').last();
      await sidebarToggle.waitFor({ state: 'visible', timeout: 3000 });
      await sidebarToggle.click();
      await await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      // Sidebar may already be expanded
    }

    // Step 1: Click Settings in the sidebar navigation
    const settingsBtn = this.page.getByRole('button', { name: 'Settings', exact: true }).first();
    try {
      await settingsBtn.waitFor({ state: 'visible', timeout: 5000 });
      await settingsBtn.click();
      await this.page.waitForLoadState('networkidle');
      await await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      // Already on Settings page or Settings button not found, continue
    }

    // Step 2: Scroll down to bring Pre-Onboarding Settings into view
    await this.page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight * 0.3);
    });
    await await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Click Pre-Onboarding Settings to expand the dropdown
    const preOnboardingDropdown = this.page.getByRole('button', { name: 'Pre-Onboarding Settings' }).first();
    await preOnboardingDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await preOnboardingDropdown.click();
    await this.page.waitForLoadState('networkidle');
    await await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Click Milestones & Workflows button (sub-item under Pre-Onboarding Settings)
    const milestonesWorkflowsBtn = this.page.getByRole('button', { name: 'Milestones & Workflows' }).first();
    await milestonesWorkflowsBtn.waitFor({ state: 'visible', timeout: 10000 });
    await milestonesWorkflowsBtn.click();
    await this.page.waitForLoadState('networkidle');
    await await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // ===== MILESTONE CONFIGURATION =====

  /** Get the current sequence order for a milestone section */
  async getSequenceOrder(sectionIndex: number): Promise<string> {
    return await this.workflowsPage.getSequenceOrder(sectionIndex);
  }

  /** Set the sequence order for a milestone section */
  async setSequenceOrder(sectionIndex: number, order: number): Promise<void> {
    await this.workflowsPage.setSequenceOrder(sectionIndex, order);
  }

  /** Get the SLA hours for a milestone section */
  async getSLAHours(sectionIndex: number): Promise<string> {
    return await this.workflowsPage.getSLAHours(sectionIndex);
  }

  /** Set the SLA hours for a milestone section */
  async setSLAHours(sectionIndex: number, hours: number): Promise<void> {
    await this.workflowsPage.setSLAHours(sectionIndex, hours);
  }

  /** Toggle CHRO Bypass for a section */
  async toggleChroBypass(sectionIndex: number): Promise<void> {
    await this.workflowsPage.toggleChroBypass(sectionIndex);
  }

  /** Check if CHRO Bypass is enabled */
  async isChroBypassEnabled(sectionIndex: number): Promise<boolean> {
    return await this.workflowsPage.isChroBypassEnabled(sectionIndex);
  }

  /** Get the CHRO Bypass status text */
  async getChroBypassStatus(sectionIndex: number): Promise<string> {
    return await this.workflowsPage.getChroBypassStatus(sectionIndex);
  }

  // ===== FORM SECTIONS =====

  /** Toggle a form section within Personal Information */
  async toggleFormSection(sectionName: string): Promise<void> {
    await this.workflowsPage.toggleFormSection(sectionName);
  }

  /** Check if a form section is enabled */
  async isFormSectionEnabled(sectionName: string): Promise<boolean> {
    return await this.workflowsPage.isFormSectionEnabled(sectionName);
  }

  // ===== DOCUMENT VERIFICATION =====

  /** Set the AI Confidence Threshold */
  async setAiConfidenceThreshold(value: number): Promise<void> {
    await this.workflowsPage.setAiConfidenceThreshold(value);
  }

  /** Get the current AI Confidence Threshold value */
  async getAiConfidenceValue(): Promise<string> {
    return await this.workflowsPage.getAiConfidenceValue();
  }

  /** Select Managed By option */
  async selectManagedBy(option: string): Promise<void> {
    await this.workflowsPage.selectManagedBy(option);
  }

  /** Get the current Managed By value */
  async getManagedBy(): Promise<string> {
    return await this.workflowsPage.getManagedBy();
  }

  // ===== OFFER LETTER SETTINGS =====

  /** Set the Offer Expiry days */
  async setOfferExpiry(days: number): Promise<void> {
    await this.workflowsPage.setOfferExpiry(days);
  }

  /** Get the Offer Expiry value */
  async getOfferExpiry(): Promise<string> {
    return await this.workflowsPage.getOfferExpiry();
  }

  /** Toggle Require Management Approval */
  async toggleRequireManagementApproval(): Promise<void> {
    await this.workflowsPage.toggleRequireManagementApproval();
  }

  /** Check if Require Management Approval is enabled */
  async isRequireManagementApprovalEnabled(): Promise<boolean> {
    return await this.workflowsPage.isRequireManagementApprovalEnabled();
  }

  /** Select an E-Signature provider */
  async selectESignatureProvider(provider: string): Promise<void> {
    await this.workflowsPage.selectESignatureProvider(provider);
  }

  /** Get the current E-Signature provider */
  async getESignatureProvider(): Promise<string> {
    return await this.workflowsPage.getESignatureProvider();
  }

  // ===== APPROVAL CHAIN =====

  /** Set the Approval Chain name */
  async setApprovalChainName(name: string): Promise<void> {
    await this.workflowsPage.setApprovalChainName(name);
  }

  /** Get the Approval Chain name */
  async getApprovalChainName(): Promise<string> {
    return await this.workflowsPage.getApprovalChainName();
  }

  /** Get the number of approval levels */
  async getApprovalLevelCount(): Promise<number> {
    return await this.workflowsPage.getApprovalLevelCount();
  }

  /** Click Add Level button */
  async clickAddApprovalLevel(): Promise<void> {
    await this.workflowsPage.clickAddApprovalLevel();
  }

  /** Select approval type for a level */
  async selectApprovalType(levelIndex: number, type: string): Promise<void> {
    await this.workflowsPage.selectApprovalType(levelIndex, type);
  }

  /** Get the approval type for a level */
  async getApprovalType(levelIndex: number): Promise<string> {
    return await this.workflowsPage.getApprovalType(levelIndex);
  }

  /** Toggle Can Sign for an approval level */
  async toggleCanSign(levelIndex: number): Promise<void> {
    await this.workflowsPage.toggleCanSign(levelIndex);
  }

  /** Check if Can Sign is enabled for a level */
  async isCanSignEnabled(levelIndex: number): Promise<boolean> {
    return await this.workflowsPage.isCanSignEnabled(levelIndex);
  }

  /** Delete an approval level */
  async deleteApprovalLevel(levelIndex: number): Promise<void> {
    await this.workflowsPage.deleteApprovalLevel(levelIndex);
  }

  // ===== TEMPLATES =====

  /** Open the offer letter templates dropdown */
  async openTemplatesDropdown(): Promise<void> {
    await this.workflowsPage.openTemplatesDropdown();
  }

  /** Search for a template */
  async searchTemplate(query: string): Promise<void> {
    await this.workflowsPage.searchTemplate(query);
  }

  /** Select a template from the list */
  async selectTemplate(templateName: string): Promise<void> {
    await this.workflowsPage.selectTemplate(templateName);
  }

  /** Get the list of visible template names */
  async getTemplateList(): Promise<string[]> {
    return await this.workflowsPage.getTemplateList();
  }

  // ===== SAVE/VALIDATE =====

  /** Save the configuration */
  async saveConfiguration(): Promise<void> {
    await this.workflowsPage.clickSaveConfiguration();
  }

  /** Check if the page is loaded */
  async isPageLoaded(): Promise<boolean> {
    return await this.workflowsPage.isPageLoaded();
  }

  /** Check if the Save Configuration button is visible */
  async isSaveButtonVisible(): Promise<boolean> {
    return await this.workflowsPage.isSaveButtonVisible();
  }

  /** Check if a milestone section is visible */
  async isMilestoneSectionVisible(sectionName: string): Promise<boolean> {
    return await this.workflowsPage.isMilestoneSectionVisible(sectionName);
  }

  /** Check if Coming soon badge is visible for a section */
  async isComingSoonBadgeVisible(sectionIndex: number): Promise<boolean> {
    return await this.workflowsPage.isComingSoonBadgeVisible(sectionIndex);
  }

  /** Get the order of visible milestone sections */
  async getMilestoneOrder(): Promise<string[]> {
    return await this.workflowsPage.getMilestoneOrder();
  }

  /** Check if the Approval Chain section is visible */
  async isApprovalChainVisible(): Promise<boolean> {
    return await this.workflowsPage.isApprovalChainVisible();
  }

  /** Check if the Offer Letter Settings section is visible */
  async isOfferLetterSettingsVisible(): Promise<boolean> {
    return await this.workflowsPage.isOfferLetterSettingsVisible();
  }

  /** Check if the Verification Settings section is visible */
  async isVerificationSettingsVisible(): Promise<boolean> {
    return await this.workflowsPage.isVerificationSettingsVisible();
  }
}


