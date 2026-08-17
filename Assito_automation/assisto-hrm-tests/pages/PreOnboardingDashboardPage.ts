import { type Page, type Locator, expect } from '@playwright/test';
import { isVisibleWithin } from '@utils/visibility';

/**
 * PreOnboardingDashboardPage class encapsulates all locators and atomic UI actions
 * for the Pre-Onboarding Dashboard page in the HRM portal.
 */
export class PreOnboardingDashboardPage {
  private readonly page: Page;

  /** Dashboard page title */
  private readonly dashboardTitle: Locator;

  /** Tab bar containing the Pre-Onboarding navigation tabs */
  private readonly tabBar: Locator;

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
  private readonly preBoardingFunnelCard: Locator;
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

  /** Period header, e.g. "HR Administration · All entities · August 2026" */
  private readonly periodHeader: Locator;

  /** Error boundary shown when the dashboard API fails */
  private readonly errorHeading: Locator;
  private readonly errorMessage: Locator;
  private readonly errorGoBackButton: Locator;
  private readonly errorGoToDashboardButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboardTitle = page.getByText('Pre-Onboarding Dashboard').first();

    this.tabBar = page.locator('main');

    this.dashboardTab = this.tabBar.getByRole('button', { name: 'Dashboard' });
    this.candidateRegistrationTab = this.tabBar.getByRole('button', {
      name: 'Candidate Registration',
    });
    this.aiVerificationTab = this.tabBar.getByRole('button', {
      name: 'AI Verification',
    });
    this.letterGenerationTab = this.tabBar.getByRole('button', {
      name: 'Letter Generation',
    });

    this.initiatePreBoardingButton = page.getByRole('button', {
      name: '+ Initiate Pre-Onboarding',
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
      .locator('text=/\\d+(\\.\\d+)?\\s*MoM/')
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
      .locator('text=/\\d+(\\.\\d+)?\\s*MoM/')
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
      .locator('text=/\\d+(\\.\\d+)?\\s*MoM/')
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
    this.preBoardingFunnelCard = this.preBoardingFunnel
      .locator('..')
      .locator('..');
    this.initiatedStage = this.preBoardingFunnelCard.getByText('Initiated', {
      exact: true,
    });
    this.docsUploadedStage = this.preBoardingFunnelCard.getByText(
      'Docs Uploaded',
      { exact: true },
    );
    this.verifiedStage = this.preBoardingFunnelCard.getByText('Verified', {
      exact: true,
    });
    this.offerSentStage = this.preBoardingFunnelCard.getByText('Offer Sent', {
      exact: true,
    });
    this.signedStage = this.preBoardingFunnelCard.getByText('Signed', {
      exact: true,
    });
    this.joinedStage = this.preBoardingFunnelCard.getByText('Joined', {
      exact: true,
    });

    // Pre-Boarding Monthly Trend
    this.monthlyTrendChart = page.getByText('Pre-Boarding Monthly Trend');

    // Offer Accept vs Decline by Designations
    this.offerAcceptDeclineSection = page
      .getByText(/Offer Accept vs Decline/)
      .first();
    // Scoped to the Offer Accept vs Decline card. Previously this matched
    // "<n> / <m>" anywhere on the page, so it counted unrelated text (and
    // would keep "passing" even if the section rendered nothing at all).
    this.departmentBars = this.offerAcceptDeclineSection
      .locator('..')
      .locator('..')
      .getByText(/^\s*\d+\s*\/\s*\d+\s*$/);

    // "HR Administration · All entities · <Month> <Year>"
    this.periodHeader = page
      .getByText(/HR Administration\s*·.*·\s*\w+\s+\d{4}/)
      .first();

    this.errorHeading = page.getByRole('heading', {
      name: 'Something Went Wrong',
    });
    this.errorMessage = page.getByText(/An unexpected error occurred/i).first();
    this.errorGoBackButton = page.getByRole('button', { name: /Go Back/i });
    this.errorGoToDashboardButton = page.getByRole('button', {
      name: /Go to Dashboard/i,
    });
  }

  /** Text of the period header line */
  async getPeriodHeaderText(): Promise<string> {
    return (await this.periodHeader.textContent())?.trim() ?? '';
  }

  /** Locator for a month label in the monthly trend chart, e.g. "Aug 2026" */
  getTrendMonthLabel(label: string): Locator {
    return this.page.getByText(label, { exact: true }).first();
  }

  /** Whether the application error boundary is showing */
  async isErrorStateVisible(): Promise<boolean> {
    return this.errorHeading.isVisible().catch(() => false);
  }

  /**
   * Assert the dashboard degraded gracefully: the error boundary is shown with
   * its message and both recovery actions, rather than a blank or broken page.
   */
  async verifyErrorState(): Promise<void> {
    // The boundary only renders after the failed request unwinds through the
    // micro-frontend shell, which under parallel workers exceeds the 5s
    // expect default — hence the explicit timeout on the first assertion.
    await expect(this.errorHeading).toBeVisible({ timeout: 20000 });
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorGoBackButton).toBeVisible();
    await expect(this.errorGoToDashboardButton).toBeVisible();
  }

  /** Check if the dashboard page is visible */
  async isDashboardVisible(timeout = 10000): Promise<boolean> {
    return isVisibleWithin(this.dashboardTitle, timeout);
  }

  /** Check if navigation tabs are visible */
  async areNavigationTabsVisible(): Promise<boolean> {
    const [dashboard, registration, verification, letter] = await Promise.all([
      isVisibleWithin(this.dashboardTab),
      isVisibleWithin(this.candidateRegistrationTab),
      isVisibleWithin(this.aiVerificationTab),
      isVisibleWithin(this.letterGenerationTab),
    ]);
    return dashboard && registration && verification && letter;
  }

  /** Check if the initiate button is visible */
  async isInitiateButtonVisible(): Promise<boolean> {
    return isVisibleWithin(this.initiatePreBoardingButton);
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
    return isVisibleWithin(stage);
  }

  /** Get funnel stage data (count and percentage) */
  async getFunnelStageData(
    stageName: string,
  ): Promise<{ count: string; percentage: string }> {
    const nameSpan = this.preBoardingFunnelCard
      .getByText(stageName, { exact: true })
      .first();
    const row = nameSpan.locator('..');
    const text = await row.textContent();
    const match = text?.match(/(\d+)\s*·\s*(\d+\.?\d*)%/);
    if (match) {
      return { count: match[1], percentage: match[2] + '%' };
    }
    return { count: '', percentage: '' };
  }

  /** Check if monthly trend chart is visible */
  async isMonthlyTrendChartVisible(): Promise<boolean> {
    return isVisibleWithin(this.monthlyTrendChart);
  }

  /** Check if offer accept/decline section is visible */
  async isOfferAcceptDeclineVisible(): Promise<boolean> {
    return isVisibleWithin(this.offerAcceptDeclineSection);
  }

  /** Get department name from bar */
  async getDepartmentName(index: number): Promise<string> {
    const departmentNames = await this.page
      .locator('.department-name, text=Accepted')
      .allTextContents();
    return departmentNames[index]?.trim() ?? '';
  }

  /** Check if a navigation tab is active */
  async isTabActive(tabName: string): Promise<boolean> {
    const tab = this.tabBar.getByRole('button', { name: tabName }).first();
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      const selected = await tab.getAttribute('aria-selected');
      if (selected === 'true') return true;
      const current = await tab.getAttribute('aria-current');
      if (current === 'true' || current === 'page' || current === 'tab')
        return true;
      const cls = ((await tab.getAttribute('class')) ?? '').toLowerCase();
      if (cls.includes('active') || cls.includes('selected')) return true;
      await this.page.waitForTimeout(200);
    }
    return false;
  }

  /** Click on a navigation tab */
  async clickTab(tabName: string): Promise<void> {
    const tab = this.tabBar.getByRole('button', { name: tabName }).first();
    await tab.click();
  }

  /** Verify all KPI cards are visible */
  async areAllKPIsVisible(): Promise<boolean> {
    const [total, aiFlagged, avgTime, offerAccept, readyReview] =
      await Promise.all([
        isVisibleWithin(this.totalCandidatesCard),
        isVisibleWithin(this.aiFlaggedCasesCard),
        isVisibleWithin(this.avgTimeToHireCard),
        isVisibleWithin(this.offerAcceptanceCard),
        isVisibleWithin(this.readyForReviewCard),
      ]);
    return total && aiFlagged && avgTime && offerAccept && readyReview;
  }

  async isPreBoardingFunnelVisible(): Promise<boolean> {
    return isVisibleWithin(this.preBoardingFunnel);
  }

  async getMoMIndicator(
    cardName: 'totalCandidates' | 'aiFlaggedCases' | 'offerAcceptance',
  ): Promise<string | null> {
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
      Dashboard: this.dashboardTab,
      'Candidate Registration': this.candidateRegistrationTab,
      'AI Verification': this.aiVerificationTab,
      'Letter Generation': this.letterGenerationTab,
    };
    if (!tabs[tabName as keyof typeof tabs]) return false;
    return isVisibleWithin(tabs[tabName as keyof typeof tabs]);
  }

  /** Get funnel stage locator by name */
  async getFunnelStageLocator(stageName: string): Promise<Locator> {
    const stageMap: Record<string, Locator> = {
      Initiated: this.initiatedStage,
      'Docs Uploaded': this.docsUploadedStage,
      Verified: this.verifiedStage,
      'Offer Sent': this.offerSentStage,
      Signed: this.signedStage,
      Joined: this.joinedStage,
    };
    return stageMap[stageName] ?? this.page.locator(':root');
  }
}
