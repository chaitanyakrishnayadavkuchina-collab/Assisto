import { Page, expect } from '@playwright/test';
import { PreOnboardingDashboardPage } from '@pages/PreOnboardingDashboardPage';

export class PreOnboardingDashboardKeywords {
  private dashboardPage: PreOnboardingDashboardPage;

  constructor(page: Page) {
    this.dashboardPage = new PreOnboardingDashboardPage(page);
  }

  async verifyDashboardVisible(): Promise<void> {
    await expect(this.dashboardPage.isDashboardVisible()).resolves.toBe(true);
  }

  async verifyKPIsVisible(): Promise<void> {
    await expect(this.dashboardPage.areAllKPIsVisible()).resolves.toBe(true);
  }

  async verifyTabVisible(tabName: string): Promise<void> {
    await expect(this.dashboardPage.areNavigationTabsVisible()).resolves.toBe(true);
  }

  async verifyTabActive(tabName: string): Promise<void> {
    await expect(this.dashboardPage.isTabActive(tabName)).resolves.toBe(true);
  }

  async clickTab(tabName: string): Promise<void> {
    await this.dashboardPage.clickTab(tabName);
  }

  async verifyFunnelStageVisible(stageName: string): Promise<void> {
    await expect(this.dashboardPage.isFunnelStageVisible(stageName)).resolves.toBe(true);
  }

  async verifyInitiateButtonVisible(): Promise<void> {
    await expect(this.dashboardPage.isInitiateButtonVisible()).resolves.toBe(true);
  }

  async clickInitiatePreBoarding(): Promise<void> {
    await this.dashboardPage.clickInitiatePreBoarding();
  }

  async getTotalCandidatesCount(): Promise<string> {
    return await this.dashboardPage.getTotalCandidatesCount();
  }

  async getAiFlaggedCasesCount(): Promise<string> {
    return await this.dashboardPage.getAiFlaggedCasesCount();
  }

  async getAvgTimeToHire(): Promise<string> {
    return await this.dashboardPage.getAvgTimeToHire();
  }

  async getOfferAcceptancePercent(): Promise<string> {
    return await this.dashboardPage.getOfferAcceptancePercent();
  }

  async getReadyForReviewCount(): Promise<string> {
    return await this.dashboardPage.getReadyForReviewCount();
  }

  async getFunnelStageData(stageName: string): Promise<{ count: string; percentage: string }> {
    return await this.dashboardPage.getFunnelStageData(stageName);
  }
}


