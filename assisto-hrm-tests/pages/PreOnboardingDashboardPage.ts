import { type Page, type Locator, expect } from '@playwright/test';

/**
 * PreOnboardingDashboardPage class encapsulates all locators and atomic UI actions
 * for the Pre-Onboarding Dashboard page in the HRM portal.
 */
export class PreOnboardingDashboardPage {
  private readonly page: Page;

  /** Dashboard page title */
  private readonly dashboardTitle: Locator;

  /** Navigation tabs */
  private readonly dashboardTab: Locator;
  private readonly candidateRegistrationTab: Locator;
  private readonly aiVerificationTab: Locator;
  private readonly letterGenerationTab: Locator;

  /** Action button */
  private readonly initiatePreBoardingButton: Locator;

  /** KPI Cards */
  private readonly totalCandidatesCard: Locator;
  private readonly totalCandidatesCount: Locator;
  private readonly totalCandidatesMoM: Locator;

  private readonly aiFlaggedCasesCard: Locator;
  private readonly aiFlaggedCasesCount: Locator;
  private readonly aiFlaggedCasesMoM: Locator;

  private readonly avgTimeToHireCard: Locator;
  private readonly avgTimeToHireValue: Locator;
  private readonly avgTimeToHireMoM: Locator;

  private readonly offerAcceptanceCard: Locator;
  private readonly offerAcceptancePercent: Locator;
  private readonly offerAcceptanceMoM: Locator;

  private readonly readyForReviewCard: Locator;
  private readonly readyForReviewCount: Locator;
  private readonly readyForReviewMoM: Locator;

  /** Pre-Boarding Funnel */
  private readonly preBoardingFunnel: Locator;
  private readonly initiatedStage: Locator;
  private readonly docsUploadedStage: Locator;
  private readonly verifiedStage: Locator;
  private readonly offerSentStage: Locator;
  private readonly signedStage: Locator;
  private readonly joinedStage: Locator;

  /** Pre-Boarding Monthly Trend */
  private readonly monthlyTrendChart: Locator;

  /** Offer Accept vs Decline by Department */
  private readonly offerAcceptDeclineSection: Locator;
  private readonly departmentBars: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboardTitle = page.getByRole('heading', {
      name: 'Pre-Onboarding Dashboard',
    });

    this.dashboardTab = page.getByRole('tab', { name: 'Dashboard' });
    this.candidateRegistrationTab = page.getByRole('tab', {
      name: 'Candidate Registration',
    });
    this.aiVerificationTab = page.getByRole('tab', {
      name: 'AI Verification',
    });
    this.letterGenerationTab = page.getByRole('tab', {
      name: 'Letter Generation',
    });

    this.initiatePreBoardingButton = page.getByRole('button', {
      name: '+ Initiate Pre-Boarding',
    });

    // Total Candidates
    this.totalCandidatesCard = page
      .getByText('Total Candidates')
      .first()
      .locator('..');
    this.totalCandidatesCount = page
      .locator('text=Total Candidates')
      .locator('..')
      .locator('text=/^\\d+$/')
      .first();
    this.totalCandidatesMoM = page
      .locator('text=Total Candidates')
      .locator('..')
      .locator('text=/↑|↓/')
      .first();

    // AI Flagged Cases
    this.aiFlaggedCasesCard = page
      .getByText('AI Flagged Cases')
      .first()
      .locator('..');
    this.aiFlaggedCasesCount = page
      .locator('text=AI Flagged Cases')
      .locator('..')
      .locator('text=/^\\d+$/')
      .first();
    this.aiFlaggedCasesMoM = page
      .locator('text=AI Flagged Cases')
      .locator('..')
      .locator('text=/↑|↓/')
      .first();

    // Avg Time to Hire
    this.avgTimeToHireCard = page
      .getByText('Avg Time to Hire')
      .first()
      .locator('..');
    this.avgTimeToHireValue = page
      .locator('text=Avg Time to Hire')
      .locator('..')
      .locator('text=/\\d+d/')
      .first();
    this.avgTimeToHireMoM = page
      .locator('text=Avg Time to Hire')
      .locator('..')
      .locator('text=/↑|↓/')
      .first();

    // Offer Acceptance
    this.offerAcceptanceCard = page
      .getByText('Offer Acceptance')
      .first()
      .locator('..');
    this.offerAcceptancePercent = page
      .locator('text=Offer Acceptance')
      .locator('..')
      .locator('text=/\\d+\\.?\\d*%/')
      .first();
    this.offerAcceptanceMoM = page
      .locator('text=Offer Acceptance')
      .locator('..')
      .locator('text=/↑|↓/')
      .first();

    // Ready for Review
    this.readyForReviewCard = page
      .getByText('Ready for Review')
      .first()
      .locator('..');
    this.readyForReviewCount = page
      .locator('text=Ready for Review')
      .locator('..')
      .locator('text=/^\\d+$/')
      .first();
    this.readyForReviewMoM = page
      .locator('text=Ready for Review')
      .locator('..')
      .locator('text=/↑|↓/')
      .first();

    // Pre-Boarding Funnel
    this.preBoardingFunnel = page.getByText('Pre-Boarding Funnel');
    this.initiatedStage = page.getByText('Initiated');
    this.docsUploadedStage = page.getByText('Docs Uploaded');
    this.verifiedStage = page.getByText('Verified');
    this.offerSentStage = page.getByText('Offer Sent');
    this.signedStage = page.getByText('Signed');
    this.joinedStage = page.getByText('Joined');

    // Pre-Boarding Monthly Trend
    this.monthlyTrendChart = page.getByText('Pre-Boarding Monthly Trend');

    // Offer Accept vs Decline by Department
    this.offerAcceptDeclineSection = page.getByText(
      'Offer Accept vs Decline by Department',
    );
    this.departmentBars = page.locator(
      '.bar-chart .bar, [class*="bar"], text=Accepted',
    );
  }

  /** Check if the dashboard page is visible */
  async isDashboardVisible(): Promise<boolean> {
    return this.dashboardTitle.isVisible();
  }

  /** Check if navigation tabs are visible */
  async areNavigationTabsVisible(): Promise<boolean> {
    const [dashboard, registration, verification, letter] = await Promise.all([
      this.dashboardTab.isVisible(),
      this.candidateRegistrationTab.isVisible(),
      this.aiVerificationTab.isVisible(),
      this.letterGenerationTab.isVisible(),
    ]);
    return dashboard && registration && verification && letter;
  }

  /** Check if the initiate button is visible */
  async isInitiateButtonVisible(): Promise<boolean> {
    return this.initiatePreBoardingButton.isVisible();
  }

  /** Click the initiate pre-board button */
  async clickInitiatePreBoarding(): Promise<void> {
    await this.initiatePreBoardingButton.click();
  }

  /** Get Total Candidates count */
  async getTotalCandidatesCount(): Promise<string> {
    const text = await this.totalCandidatesCount.textContent();
    return text?.trim() ?? '';
  }

  /** Get AI Flagged Cases count */
  async getAiFlaggedCasesCount(): Promise<string> {
    const text = await this.aiFlaggedCasesCount.textContent();
    return text?.trim() ?? '';
  }

  /** Get Avg Time to Hire value */
  async getAvgTimeToHire(): Promise<string> {
    const text = await this.avgTimeToHireValue.textContent();
    return text?.trim() ?? '';
  }

  /** Get Offer Acceptance percentage */
  async getOfferAcceptancePercent(): Promise<string> {
    const text = await this.offerAcceptancePercent.textContent();
    return text?.trim() ?? '';
  }

  /** Get Ready for Review count */
  async getReadyForReviewCount(): Promise<string> {
    const text = await this.readyForReviewCount.textContent();
    return text?.trim() ?? '';
  }

  /** Check if a funnel stage is visible */
  async isFunnelStageVisible(stageName: string): Promise<boolean> {
    const stage = this.page.getByText(stageName, { exact: false }).first();
    return stage.isVisible();
  }

  /** Get funnel stage data (count and percentage) */
  async getFunnelStageData(stageName: string): Promise<{ count: string; percentage: string }> {
    const stage = this.page.getByText(stageName, { exact: false }).first();
    const parent = stage.locator('..');
    const text = await parent.textContent();
    const match = text?.match(/(\d+)\s*-\s*(\d+\.?\d*)%/);
    if (match) {
      return { count: match[1], percentage: match[2] + '%' };
    }
    return { count: '', percentage: '' };
  }

  /** Check if monthly trend chart is visible */
  async isMonthlyTrendChartVisible(): Promise<boolean> {
    return this.monthlyTrendChart.isVisible();
  }

  /** Check if offer accept/decline section is visible */
  async isOfferAcceptDeclineVisible(): Promise<boolean> {
    return this.offerAcceptDeclineSection.isVisible();
  }

  /** Get department name from bar */
  async getDepartmentName(index: number): Promise<string> {
    const departmentNames = await this.page.locator(
      '.department-name, text=Accepted',
    ).allTextContents();
    return departmentNames[index]?.trim() ?? '';
  }

  /** Check if a navigation tab is active */
  async isTabActive(tabName: string): Promise<boolean> {
    const tab = this.page.getByRole('tab', { name: tabName }).first();
    const selected = await tab.getAttribute('aria-selected');
    return selected === 'true';
  }

  /** Click on a navigation tab */
  async clickTab(tabName: string): Promise<void> {
    const tab = this.page.getByRole('tab', { name: tabName }).first();
    await tab.click();
  }

  /** Verify all KPI cards are visible */
  async areAllKPIsVisible(): Promise<boolean> {
    const [total, aiFlagged, avgTime, offerAccept, readyReview] = await Promise.all([
      this.totalCandidatesCard.isVisible(),
      this.aiFlaggedCasesCard.isVisible(),
      this.avgTimeToHireCard.isVisible(),
      this.offerAcceptanceCard.isVisible(),
      this.readyForReviewCard.isVisible(),
    ]);
    return total && aiFlagged && avgTime && offerAccept && readyReview;
  }

  async isPreBoardingFunnelVisible(): Promise<boolean> {
    return await this.preBoardingFunnel.isVisible();
  }

  async getMoMIndicator(cardName: 'totalCandidates' | 'aiFlaggedCases' | 'offerAcceptance'): Promise<string | null> {
    const indicators = {
      totalCandidates: this.totalCandidatesMoM,
      aiFlaggedCases: this.aiFlaggedCasesMoM,
      offerAcceptance: this.offerAcceptanceMoM,
    };
    return await indicators[cardName].textContent();
  }

  async getDepartmentBarCount(): Promise<number> {
    return await this.departmentBars.count();
  }

  async isTabVisible(tabName: string): Promise<boolean> {
    const tabs = {
      'Candidate Registration': this.candidateRegistrationTab,
      'AI Verification': this.aiVerificationTab,
      'Letter Generation': this.letterGenerationTab,
    };
    if (!tabs[tabName as keyof typeof tabs]) return false;
    return await tabs[tabName as keyof typeof tabs].isVisible();
  }

  /** Get funnel stage locator by name */
  async getFunnelStageLocator(stageName: string): Promise<Locator> {
    const stageMap: Record<string, Locator> = {
      'Initiated': this.initiatedStage,
      'Docs Uploaded': this.docsUploadedStage,
      'Verified': this.verifiedStage,
      'Offer Sent': this.offerSentStage,
      'Signed': this.signedStage,
      'Joined': this.joinedStage,
    };
    return stageMap[stageName] ?? this.page.locator(':root');
  }

  /** Check if the dashboard title is visible */
  async isDashboardTitleVisible(): Promise<boolean> {
    return await this.dashboardTitle.isVisible();
  }

  /** Get total candidates MoM indicator text */
  async getTotalCandidatesMoMText(): Promise<string | null> {
    return await this.totalCandidatesMoM.textContent();
  }

  /** Get AI flagged cases MoM indicator text */
  async getAiFlaggedCasesMoMText(): Promise<string | null> {
    return await this.aiFlaggedCasesMoM.textContent();
  }

  /** Get offer acceptance MoM indicator text */
  async getOfferAcceptanceMoMText(): Promise<string | null> {
    return await this.offerAcceptanceMoM.textContent();
  }

  /** Check if offer accept/decline section is visible */
  async isOfferAcceptDeclineSectionVisible(): Promise<boolean> {
    return await this.offerAcceptDeclineSection.isVisible();
  }
}


