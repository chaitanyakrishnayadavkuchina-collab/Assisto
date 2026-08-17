import { type Page, type Locator, expect } from '@playwright/test';

/**
 * PreOnboardingWorkflowsPage class encapsulates all locators and atomic UI actions
 * for the Pre-Onboarding Workflow Configurations page (Milestones & Workflows tab)
 * in the HRM portal.
 */
export class PreOnboardingWorkflowsPage {
  private readonly page: Page;

  /** Page header and type selector */
  private readonly pageTitle: Locator;
  private readonly hireTypeDropdown: Locator;
  private readonly hireTypeActiveBadge: Locator;

  /** Save Configuration button */
  private readonly saveConfigurationButton: Locator;

  /** Milestone sections */
  private readonly personalInformationSection: Locator;
  private readonly documentUploadSection: Locator;
  private readonly documentVerificationSection: Locator;
  private readonly backgroundVerificationSection: Locator;
  private readonly payrollBenefitsSection: Locator;
  private readonly offerLetterReleaseSection: Locator;

  /** Section toggles (Enabled/Coming soon badges) */
  private readonly personalInformationToggle: Locator;
  private readonly documentUploadToggle: Locator;
  private readonly documentVerificationToggle: Locator;
  private readonly offerLetterReleaseToggle: Locator;

  /** Coming soon badges */
  private readonly backgroundVerificationComingSoon: Locator;
  private readonly payrollBenefitsComingSoon: Locator;

  /** Sequence Order and SLA inputs per section */
  private readonly personalInformationSequence: Locator;
  private readonly personalInformationSLA: Locator;
  private readonly documentUploadSequence: Locator;
  private readonly documentUploadSLA: Locator;
  private readonly documentVerificationSequence: Locator;
  private readonly documentVerificationSLA: Locator;
  private readonly offerLetterReleaseSequence: Locator;
  private readonly offerLetterReleaseSLA: Locator;

  /** CHRO Bypass toggle */
  private readonly personalInformationChroBypass: Locator;
  private readonly documentUploadChroBypass: Locator;
  private readonly documentVerificationChroBypass: Locator;
  private readonly offerLetterReleaseChroBypass: Locator;

  /** CHRO Bypass status text */
  private readonly personalInformationChroBypassStatus: Locator;
  private readonly documentUploadChroBypassStatus: Locator;
  private readonly documentVerificationChroBypassStatus: Locator;
  private readonly offerLetterReleaseChroBypassStatus: Locator;

  /** Form sections within Personal Information */
  private readonly personalInfoFormSectionToggle: Locator;
  private readonly emergencyContactToggle: Locator;
  private readonly addressInfoToggle: Locator;
  private readonly additionalInfoToggle: Locator;
  private readonly candidatePhotoToggle: Locator;

  /** Document Verification settings */
  private readonly managedByDropdown: Locator;
  private readonly aiConfidenceSlider: Locator;
  private readonly aiConfidenceValue: Locator;

  /** Offer Letter Release settings */
  private readonly offerLetterTemplatesDropdown: Locator;
  private readonly offerExpiryInput: Locator;
  private readonly eSignatureProviderDropdown: Locator;
  private readonly requireManagementApprovalToggle: Locator;

  /** Approval Chain */
  private readonly approvalChainNameInput: Locator;
  private readonly approvalChainLevel1Name: Locator;
  private readonly approvalChainLevel1Type: Locator;
  private readonly approvalChainLevel1Role: Locator;
  private readonly approvalChainLevel1CanSign: Locator;
  private readonly approvalChainLevel2Name: Locator;
  private readonly approvalChainLevel2Type: Locator;
  private readonly approvalChainLevel2Role: Locator;
  private readonly approvalChainLevel2CanSign: Locator;
  private readonly addApprovalLevelButton: Locator;
  private readonly approvalChainLevel3: Locator;
  private readonly approvalChainLevel4: Locator;

  /** Dropdown options */
  private readonly singleApproverOption: Locator;
  private readonly anyOneOption: Locator;
  private readonly allMustApproveOption: Locator;

  /** Template list */
  private readonly templateList: Locator;
  private readonly searchTemplatesInput: Locator;

  /** E-signature provider options */
  private readonly eSignatureProviderOptions: Locator;

  /** Managed by dropdown options */
  private readonly managedByOptions: Locator;

  /** Role dropdown options within approval chain */
  private readonly roleDropdownOptions: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page header
    this.pageTitle = page.getByRole('heading', { name: 'Standard Full-Time Hire' }).first();
    this.hireTypeDropdown = page.getByRole('button', { name: /Standard Full-Time Hire/ }).first();
    this.hireTypeActiveBadge = page.locator('text=Active').first();

    // Save Configuration
    this.saveConfigurationButton = page.getByRole('button', { name: 'Save Configuration' });

    // Milestone sections
    this.personalInformationSection = page.locator('text=1. Personal Information').first().locator('..');
    this.documentUploadSection = page.locator('text=2. Document Upload').first().locator('..');
    this.documentVerificationSection = page.locator('text=3. Document Verification').first().locator('..');
    this.backgroundVerificationSection = page.locator('text=4. Background Verification').first().locator('..');
    this.payrollBenefitsSection = page.locator('text=5. Payroll & Benefits').first().locator('..');
    this.offerLetterReleaseSection = page.locator('text=6. Offer Letter Release').first().locator('..');

    // Section toggles
    this.personalInformationToggle = page.locator('text=1. Personal Information').first().locator('..').locator('[role="switch"], .toggle').first();
    this.documentUploadToggle = page.locator('text=2. Document Upload').first().locator('..').locator('[role="switch"], .toggle').first();
    this.documentVerificationToggle = page.locator('text=3. Document Verification').first().locator('..').locator('[role="switch"], .toggle').first();
    this.offerLetterReleaseToggle = page.locator('text=6. Offer Letter Release').first().locator('..').locator('[role="switch"], .toggle').first();

    // Coming soon badges
    this.backgroundVerificationComingSoon = page.locator('text=Coming soon').nth(0);
    this.payrollBenefitsComingSoon = page.locator('text=Coming soon').nth(1);

    // Sequence Order and SLA
    this.personalInformationSequence = page.locator('text=1. Personal Information').first().locator('..').locator('label:has-text("Sequence Order")~* input, text=1. Personal Information').locator('..').locator('input[type="number"]').first();
    this.personalInformationSLA = page.locator('label:has-text("SLA Hours")').locator('..').locator('input[type="number"]').first();
    this.documentUploadSequence = page.locator('label:has-text("Sequence Order")').nth(1).locator('..').locator('input[type="number"]').first();
    this.documentUploadSLA = page.locator('label:has-text("SLA Hours")').nth(1).locator('..').locator('input[type="number"]').first();
    this.documentVerificationSequence = page.locator('label:has-text("Sequence Order")').nth(2).locator('..').locator('input[type="number"]').first();
    this.documentVerificationSLA = page.locator('label:has-text("SLA Hours")').nth(2).locator('..').locator('input[type="number"]').first();
    this.offerLetterReleaseSequence = page.locator('label:has-text("Sequence Order")').nth(3).locator('..').locator('input[type="number"]').first();
    this.offerLetterReleaseSLA = page.locator('label:has-text("SLA Hours")').nth(3).locator('..').locator('input[type="number"]').first();

    // CHRO Bypass
    this.personalInformationChroBypass = page.locator('label:has-text("CHRO Bypass")').locator('..').locator('[role="switch"]').first();
    this.documentUploadChroBypass = page.locator('label:has-text("CHRO Bypass")').nth(1).locator('..').locator('[role="switch"]').first();
    this.documentVerificationChroBypass = page.locator('label:has-text("CHRO Bypass")').nth(2).locator('..').locator('[role="switch"]').first();
    this.offerLetterReleaseChroBypass = page.locator('label:has-text("CHRO Bypass")').nth(3).locator('..').locator('[role="switch"]').first();

    // CHRO Bypass status text
    this.personalInformationChroBypassStatus = page.locator('label:has-text("CHRO Bypass")').locator('..').locator('text=Not Allowed, text=Allowed').first();
    this.documentUploadChroBypassStatus = page.locator('label:has-text("CHRO Bypass")').nth(1).locator('..').locator('text=Not Allowed, text=Allowed').first();
    this.documentVerificationChroBypassStatus = page.locator('label:has-text("CHRO Bypass")').nth(2).locator('..').locator('text=Not Allowed, text=Allowed').first();
    this.offerLetterReleaseChroBypassStatus = page.locator('label:has-text("CHRO Bypass")').nth(3).locator('..').locator('text=Not Allowed, text=Allowed').first();

    // Form sections within Personal Information
    this.personalInfoFormSectionToggle = page.locator('text=Personal Information').locator('..').locator('[role="switch"]').first();
    this.emergencyContactToggle = page.locator('text=Emergency Contact').locator('..').locator('[role="switch"]');
    this.addressInfoToggle = page.locator('text=Address Information').locator('..').locator('[role="switch"]');
    this.additionalInfoToggle = page.locator('text=Additional Info').locator('..').locator('[role="switch"]');
    this.candidatePhotoToggle = page.locator('text=Candidate Photo').locator('..').locator('[role="switch"]');

    // Document Verification settings
    this.managedByDropdown = page.locator('text=Managed By').locator('..').locator('select, [role="combobox"]').first();
    this.aiConfidenceSlider = page.locator('text=AI Confidence Threshold').locator('..').locator('input[type="range"], [role="slider"]');
    this.aiConfidenceValue = page.locator('text=AI Confidence Threshold').locator('..').locator('text=/\\d+%/');

    // Offer Letter Release settings
    this.offerLetterTemplatesDropdown = page.locator('text=Offer Letter Templates').locator('..').locator('input, [role="combobox"]').first();
    this.offerExpiryInput = page.locator('label:has-text("Offer expiry")').locator('..').locator('input[type="number"]');
    this.eSignatureProviderDropdown = page.locator('text=E-Signature provider').locator('..').locator('select, [role="combobox"]');
    this.requireManagementApprovalToggle = page.locator('text=Require management approval').locator('..').locator('[role="switch"]');

    // Approval Chain
    this.approvalChainNameInput = page.locator('text=Chain name').locator('..').locator('input');
    this.approvalChainLevel1Name = page.locator('[data-approval-level="1"] input, .approval-level:nth-child(1) input').first();
    this.approvalChainLevel1Type = page.locator('[data-approval-level="1"] select, .approval-level:nth-child(1) select').first();
    this.approvalChainLevel1Role = page.locator('[data-approval-level="1"] select').nth(1).first();
    this.approvalChainLevel1CanSign = page.locator('[data-approval-level="1"] [role="switch"], .approval-level:nth-child(1) [role="switch"]').first();
    this.approvalChainLevel2Name = page.locator('[data-approval-level="2"] input, .approval-level:nth-child(2) input').first();
    this.approvalChainLevel2Type = page.locator('[data-approval-level="2"] select, .approval-level:nth-child(2) select').first();
    this.approvalChainLevel2Role = page.locator('[data-approval-level="2"] select').nth(1).first();
    this.approvalChainLevel2CanSign = page.locator('[data-approval-level="2"] [role="switch"], .approval-level:nth-child(2) [role="switch"]').first();
    this.addApprovalLevelButton = page.getByRole('button', { name: '+ Add level' });
    this.approvalChainLevel3 = page.locator('.approval-level:nth-child(3), [data-approval-level="3"]').first();
    this.approvalChainLevel4 = page.locator('.approval-level:nth-child(4), [data-approval-level="4"]').first();

    // Dropdown options
    this.singleApproverOption = page.getByRole('option', { name: 'Single approver' }).first();
    this.anyOneOption = page.getByRole('option', { name: 'Any one (first wins)' }).first();
    this.allMustApproveOption = page.getByRole('option', { name: 'All must approve' }).first();

    // Template list
    this.templateList = page.locator('[role="listbox"], .template-list');
    this.searchTemplatesInput = page.locator('input[placeholder="Search templates..."]');

    // E-signature provider options
    this.eSignatureProviderOptions = page.locator('[role="listbox"] option');

    // Managed by options
    this.managedByOptions = page.locator('[role="listbox"] option');

    // Role dropdown options
    this.roleDropdownOptions = page.locator('[role="listbox"] option');
  }

  // ==================== Public Methods ====================

  /** Check if the workflow configurations page is loaded */
  async isPageLoaded(): Promise<boolean> {
    return await this.saveConfigurationButton.isVisible();
  }

  /** Check if the page title is visible */
  async isPageTitleVisible(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  /** Check if the Save Configuration button is visible */
  async isSaveButtonVisible(): Promise<boolean> {
    return await this.saveConfigurationButton.isVisible();
  }

  /** Click the Save Configuration button */
  async clickSaveConfiguration(): Promise<void> {
    await this.saveConfigurationButton.click();
  }

  /** Check if a milestone section is visible */
  async isMilestoneSectionVisible(sectionName: string): Promise<boolean> {
    const section = this.page.locator(`text=${sectionName}`).first();
    return await section.isVisible();
  }

  /** Check if Coming soon badge is visible for a section */
  async isComingSoonBadgeVisible(sectionIndex: number): Promise<boolean> {
    const badge = this.page.locator('text=Coming soon').nth(sectionIndex);
    return await badge.isVisible();
  }

  /** Get the enabled/disabled status of a section toggle */
  async getSectionToggleStatus(sectionName: string): Promise<'Enabled' | 'Disabled'> {
    const section = this.page.locator(`text=${sectionName}`).first().locator('..');
    const toggle = section.locator('[role="switch"]').first();
    const ariaChecked = await toggle.getAttribute('aria-checked');
    return ariaChecked === 'true' ? 'Enabled' : 'Disabled';
  }

  /** Section names for indexing */
  private readonly sectionNames: string[] = [
    '1. Personal Information',
    '2. Document Upload',
    '3. Document Verification',
    '4. Background Verification',
    '5. Payroll & Benefits',
    '6. Offer Letter Release',
  ];

  /** Helper: get the section heading locator for a given index */
  private sectionLocator(sectionIndex: number): Locator {
    const name = this.sectionNames[sectionIndex] || this.sectionNames[0];
    return this.page.locator(`text=${name}`).first();
  }

  /** Helper: get the section card locator for a given index (the full card container) */
  private sectionCardLocator(sectionIndex: number): Locator {
    const heading = this.sectionLocator(sectionIndex);
    // heading -> div.flex-1 -> div.flex.items-center.gap-3 -> div.bg-white (card)
    return heading.locator('..').locator('..').locator('..');
  }

  /** Get the Sequence Order input locator for a specific section */
  private async getSequenceOrderInput(sectionIndex: number): Promise<Locator> {
    const sectionCard = this.sectionCardLocator(sectionIndex);
    const seqLabel = sectionCard.locator('text=Sequence Order').first();
    return seqLabel.locator('..').locator('input[type="number"]').first();
  }

  /** Get the SLA Hours input locator for a specific section */
  private async getSLAHoursInput(sectionIndex: number): Promise<Locator> {
    const sectionCard = this.sectionCardLocator(sectionIndex);
    const slaLabel = sectionCard.locator('text=SLA Hours').first();
    return slaLabel.locator('..').locator('input[type="number"]').first();
  }

  /** Get the CHRO Bypass switch locator for a specific section */
  private async getChroBypassSwitch(sectionIndex: number): Promise<Locator> {
    const sectionCard = this.sectionCardLocator(sectionIndex);
    const chroLabel = sectionCard.locator('text=CHRO Bypass').first();
    return chroLabel.locator('..').locator('input[type="checkbox"][role="switch"]').first();
  }

  /** Expand a milestone section so its inner fields become visible */
  async expandSection(sectionIndex: number): Promise<void> {
    // Use page.evaluate to find and click the expand/collapse icon for a given section name.
    // From the DOM, each section card header row has the structure:
    //   <div class="flex items-center gap-3">
    //     <svg class="lucide-chevron-..."> or similar chevron icon (expand toggle)
    //     <img src="...">
    //     <div class="flex-1">  section title
    //     ...right side controls (toggle switch, etc.)
    await this.page.evaluate((sectionName: string) => {
      // First scroll into view
      const allElements = document.querySelectorAll('div, span, h3, h4, h5, h6');
      for (const el of Array.from(allElements)) {
        const t = (el as HTMLElement).textContent?.trim() || '';
        if (t === sectionName) {
          el.scrollIntoView({ behavior: 'instant', block: 'center' });
          break;
        }
      }

      // Find the section heading element
      const headingEl = Array.from(document.querySelectorAll('div, span')).find((el) => {
        return (el as HTMLElement).textContent?.trim() === sectionName;
      });

      if (!headingEl) return false;

      // Walk up to find the section row (the container that holds the chevron + title + toggle)
      let row: HTMLElement | null = headingEl.parentElement;
      let depth = 0;
      while (row && depth < 8) {
        const cls = row.className || '';
        // Stop when we find a flex row container or a card container
        if (cls.includes('flex') && cls.includes('items-center')) break;
        row = row.parentElement;
        depth++;
      }

      if (!row) return false;

      // Find the chevron icon (expand/collapse toggle) inside this row
      // The chevron is typically an SVG with lucide class or an img element
      const chevronSvg = row.querySelector('svg.lucide-chevron');
      if (chevronSvg && chevronSvg instanceof HTMLElement) {
        chevronSvg.click();
        return true;
      }

      // Also try finding any lucide chevron SVG or img with expand/collapse alt
      const anyChevron = row.querySelector('svg[class*="chevron"]');
      if (anyChevron && anyChevron instanceof HTMLElement) {
        anyChevron.click();
        return true;
      }

      const expandImg = row.querySelector('img');
      if (expandImg && expandImg instanceof HTMLElement) {
        // Only click if it's not the section icon (left-side icon like user, folder, etc.)
        // The expand/collapse icon is typically positioned separately
        return false;
      }

      // Fallback: click the heading itself
      (headingEl as HTMLElement).click();
      return true;
    }, this.sectionNames[sectionIndex] || '');

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /** Get the Sequence Order value for a section (readonly number input) - visible when expanded */
  async getSequenceOrder(sectionIndex: number): Promise<string> {
    await this.expandSection(sectionIndex);
    const input = await this.getSequenceOrderInput(sectionIndex);
    return await input.inputValue();
  }

  /** Get the SLA Hours value for a section (readonly number input) - visible when expanded */
  async getSLAHours(sectionIndex: number): Promise<string> {
    await this.expandSection(sectionIndex);
    const input = await this.getSLAHoursInput(sectionIndex);
    return await input.inputValue();
  }

  /** Set the Sequence for a section (readonly number input - use keyboard to clear and type) */
  async setSequenceOrder(sectionIndex: number, order: number): Promise<void> {
    await this.expandSection(sectionIndex);
    const input = await this.getSequenceOrderInput(sectionIndex);
    await input.focus();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.type(String(order));
  }

  /** Set the SLA Hours for a section (readonly number input - use keyboard to clear and type) */
  async setSLAHours(sectionIndex: number, hours: number): Promise<void> {
    await this.expandSection(sectionIndex);
    const input = await this.getSLAHoursInput(sectionIndex);
    await input.focus();
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.type(String(hours));
  }

  /** Get CHRO Bypass status (toggle switch) - visible when expanded */
  async getChroBypassStatus(sectionIndex: number): Promise<string> {
    await this.expandSection(sectionIndex);
    const switchInput = await this.getChroBypassSwitch(sectionIndex);
    const ariaChecked = await switchInput.getAttribute('aria-checked');
    return ariaChecked === 'true' ? 'Allowed' : 'Not Allowed';
  }

  /** Toggle the CHRO Bypass switch */
  async toggleChroBypass(sectionIndex: number): Promise<void> {
    await this.expandSection(sectionIndex);
    const switchInput = await this.getChroBypassSwitch(sectionIndex);
    await switchInput.click();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Check if CHRO Bypass is set to "Allowed" (switch is on) */
  async isChroBypassEnabled(sectionIndex: number): Promise<boolean> {
    const status = await this.getChroBypassStatus(sectionIndex);
    return status === 'Allowed';
  }

  /** Toggle a form section within Personal Information */
  async toggleFormSection(sectionName: string): Promise<void> {
    // Expand Personal Information section first to reveal form sections
    await this.expandSection(0);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use JS to find and click the form section switch.
    // Strategy: find the form section row by looking for div with class "flex items-start justify-between gap-3"
    // that contains the section name text, then find the switch within that row.
    await this.page.evaluate((name: string) => {
      const allDivs = document.querySelectorAll('div');
      for (const div of Array.from(allDivs)) {
        const cls = div.className || '';
        if (cls.includes('flex items-start justify-between gap-3')) {
          const text = div.textContent || '';
          if (text.includes(name)) {
            // Find the switch by walking up from the switch input
            const sw = div.querySelector('[role="switch"]');
            if (sw) {
              // Click the switch's closest clickable element
              const clickable = sw.closest('[class*="Switch"]') || sw as HTMLElement;
              (clickable as HTMLElement).click();
              return;
            }
          }
        }
      }
    }, sectionName);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /** Get the enabled status of a form section */
  async isFormSectionEnabled(sectionName: string): Promise<boolean> {
    // Expand Personal Information section to reveal form sections if not already expanded
    // (expandSection toggles the chevron, so only expand when the rows are absent)
    const rowsVisible = await this.page.evaluate(() => {
      for (const div of Array.from(document.querySelectorAll('div'))) {
        const cls = div.className || '';
        if (cls.includes('flex items-start justify-between gap-3')) return true;
      }
      return false;
    });
    if (!rowsVisible) {
      await this.expandSection(0);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Find the form section row (div with class "flex items-start justify-between gap-3")
    // that contains the section name, then read its switch state. Mirrors toggleFormSection.
    return await this.page.evaluate((name: string) => {
      const allDivs = document.querySelectorAll('div');
      for (const div of Array.from(allDivs)) {
        const cls = div.className || '';
        if (cls.includes('flex items-start justify-between gap-3')) {
          const text = div.textContent || '';
          if (text.includes(name)) {
            const sw = div.querySelector('[role="switch"], input[type="checkbox"]');
            if (sw) {
              const aria = sw.getAttribute('aria-checked');
              if (aria !== null) return aria === 'true';
              return (sw as HTMLInputElement).checked === true;
            }
          }
        }
      }
      return false;
    }, sectionName);
  }

  /** Set the AI Confidence Threshold slider value */
  async setAiConfidenceThreshold(value: number): Promise<void> {
    const slider = this.page.locator('text=AI Confidence Threshold').locator('..').locator('input[type="range"], [role="slider"]');
    await slider.fill(String(value));
  }

  /** Get the current AI Confidence Threshold value */
  async getAiConfidenceValue(): Promise<string> {
    const value = this.page.locator('text=AI Confidence Threshold').locator('..').locator('text=/\\d+%/');
    return (await value.textContent())?.trim() ?? '';
  }

  /** Set the Offer Expiry days */
  async setOfferExpiry(days: number): Promise<void> {
    const input = this.page.locator('label:has-text("Offer expiry")').locator('..').locator('input[type="number"]');
    await input.clear();
    await input.fill(String(days));
  }

  /** Get the Offer Expiry value */
  async getOfferExpiry(): Promise<string> {
    const input = this.page.locator('label:has-text("Offer expiry")').locator('..').locator('input[type="number"]');
    return await input.inputValue();
  }

  /** Toggle Require Management Approval */
  async toggleRequireManagementApproval(): Promise<void> {
    const toggle = this.page.locator('text=Require management approval').locator('..').locator('[role="switch"]');
    await toggle.click();
  }

  /** Check if Require Management Approval is enabled */
  async isRequireManagementApprovalEnabled(): Promise<boolean> {
    const toggle = this.page.locator('text=Require management approval').locator('..').locator('[role="switch"]');
    const ariaChecked = await toggle.getAttribute('aria-checked');
    return ariaChecked === 'true';
  }

  /** Get the Approval Chain name */
  async getApprovalChainName(): Promise<string> {
    const input = this.page.locator('text=Chain name').locator('..').locator('input');
    return await input.inputValue();
  }

  /** Set the Approval Chain name */
  async setApprovalChainName(name: string): Promise<void> {
    const input = this.page.locator('text=Chain name').locator('..').locator('input');
    await input.clear();
    await input.fill(name);
  }

  /** Get the number of approval levels */
  async getApprovalLevelCount(): Promise<number> {
    return await this.page.locator('.approval-level, [data-approval-level]').count();
  }

  /** Click Add Level button in Approval Chain */
  async clickAddApprovalLevel(): Promise<void> {
    await this.addApprovalLevelButton.click();
  }

  /** Select approval type for a level */
  async selectApprovalType(levelIndex: number, type: string): Promise<void> {
    const select = this.page.locator('.approval-level').nth(levelIndex).locator('select').first();
    await select.selectOption({ label: type });
  }

  /** Get the approval type for a level */
  async getApprovalType(levelIndex: number): Promise<string> {
    const select = this.page.locator('.approval-level').nth(levelIndex).locator('select').first();
    return await select.inputValue();
  }

  /** Toggle Can Sign for an approval level */
  async toggleCanSign(levelIndex: number): Promise<void> {
    const toggle = this.page.locator('.approval-level').nth(levelIndex).locator('[role="switch"]').first();
    await toggle.click();
  }

  /** Check if Can Sign is enabled for a level */
  async isCanSignEnabled(levelIndex: number): Promise<boolean> {
    const toggle = this.page.locator('.approval-level').nth(levelIndex).locator('[role="switch"]').first();
    const ariaChecked = await toggle.getAttribute('aria-checked');
    return ariaChecked === 'true';
  }

  /** Open the offer letter templates dropdown */
  async openTemplatesDropdown(): Promise<void> {
    await this.offerLetterTemplatesDropdown.click();
  }

  /** Search for a template */
  async searchTemplate(query: string): Promise<void> {
    await this.searchTemplatesInput.fill(query);
  }

  /** Select a template from the list */
  async selectTemplate(templateName: string): Promise<void> {
    const option = this.page.getByRole('option', { name: templateName }).first();
    await option.click();
  }

  /** Get the list of visible template names */
  async getTemplateList(): Promise<string[]> {
    const options = this.page.locator('[role="listbox"] option, .template-option');
    const texts = await options.allTextContents();
    return texts.map(t => t.trim()).filter(t => t !== '');
  }

  /** Select an E-Signature provider */
  async selectESignatureProvider(provider: string): Promise<void> {
    const select = this.page.locator('text=E-Signature provider').locator('..').locator('select, [role="combobox"]');
    await select.selectOption({ label: provider });
  }

  /** Get the current E-Signature provider */
  async getESignatureProvider(): Promise<string> {
    const label = this.page.locator('text=E-Signature provider').first();
    const select = label.locator('..').locator('select, [role="combobox"]').first();
    return await select.inputValue();
  }

  /** Select Managed By option for Document Verification */
  async selectManagedBy(option: string): Promise<void> {
    const select = this.page.locator('text=Managed By').locator('..').locator('select, [role="combobox"]');
    await select.selectOption({ label: option });
  }

  /** Get the current Managed By value */
  async getManagedBy(): Promise<string> {
    const select = this.page.locator('text=Managed By').locator('..').locator('select, [role="combobox"]');
    return await select.inputValue();
  }

  /** Get the order of visible milestone sections */
  async getMilestoneOrder(): Promise<string[]> {
    const sections = await this.page.locator('text=/^\\d+\\. .+/').allTextContents();
    return sections.map((s: string) => s.trim());
  }

  /** Check if the Approval Chain section is visible */
  async isApprovalChainVisible(): Promise<boolean> {
    const chain = this.page.locator('text=APPROVAL CHAIN').first();
    return await chain.isVisible();
  }

  /** Check if the Offer Letter Settings section is visible */
  async isOfferLetterSettingsVisible(): Promise<boolean> {
    const settings = this.page.locator('text=OFFER LETTER SETTINGS').first();
    return await settings.isVisible();
  }

  /** Check if the Verification Settings section is visible */
  async isVerificationSettingsVisible(): Promise<boolean> {
    const settings = this.page.locator('text=VERIFICATION SETTINGS').first();
    return await settings.isVisible();
  }

  /** Check if the Form Sections header is visible */
  async isFormSectionsVisible(): Promise<boolean> {
    const header = this.page.locator('text=FORM SECTIONS').first();
    return await header.isVisible();
  }

  /** Delete an approval level by clicking its delete button */
  async deleteApprovalLevel(levelIndex: number): Promise<void> {
    const deleteBtn = this.page.locator('.approval-level').nth(levelIndex).locator('[data-icon="delete"], button:has-text("×"), button[aria-label*="delete"]').first();
    await deleteBtn.click();
  }

  /** Check if a section is expanded (has its details visible) */
  async isSectionExpanded(sectionName: string): Promise<boolean> {
    const section = this.page.locator(`text=${sectionName}`).first().locator('..');
    const collapseIcon = section.locator('[role="button"][aria-expanded="true"]').first();
    return await collapseIcon.count() > 0;
  }

}


