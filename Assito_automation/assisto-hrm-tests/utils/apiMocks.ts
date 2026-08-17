/**
 * Network interception helpers for driving the UI into states the live data
 * cannot produce on demand — an all-zero dashboard, or a failing backend.
 *
 * Without these, "handles zero values" and "handles API failure" tests can
 * only re-assert the happy path against whatever the shared tenant happens to
 * contain, which is how the original TC008/TC013 ended up as duplicates of
 * TC001.
 */

import type { Page } from '@playwright/test';
import { recentMonthLabels } from './dateHelpers';

/** Glob matching the single endpoint that backs the Pre-Onboarding Dashboard. */
export const DASHBOARD_API = '**/api/pre-onboarding/dashboard*';

/** Funnel stages, in the order the API returns them. */
const FUNNEL_STAGES = [
  'INITIATED',
  'DOCS_UPLOADED',
  'VERIFIED',
  'OFFER_SENT',
  'SIGNED',
  'JOINED',
] as const;

/**
 * A structurally valid dashboard payload with every metric at zero, mirroring
 * the live response shape (kpis / funnel / monthlyTrend / offerByDepartment /
 * documentBottleneck).
 */
export function buildZeroDashboardPayload(now: Date = new Date()): unknown {
  return buildDashboardPayload(
    {
      totalCandidates: 0,
      aiFlaggedCases: 0,
      avgTimeToHireDays: 0.0,
      offerAcceptanceRate: 0.0,
      readyForReview: 0,
      funnelCounts: FUNNEL_STAGES.map(() => 0),
      departments: [],
    },
    now,
  );
}

/** Metric values a test wants the dashboard to render. */
export interface DashboardValues {
  totalCandidates: number;
  aiFlaggedCases: number;
  avgTimeToHireDays: number;
  offerAcceptanceRate: number;
  readyForReview: number;
  /** Funnel counts, in FUNNEL_STAGES order */
  funnelCounts: number[];
  /** Departments shown in the Offer Accept vs Decline card */
  departments: { department: string; accepted: number; declined: number }[];
}

/**
 * Build a dashboard payload from chosen values, mirroring the live response
 * shape. Funnel percentages are derived from the counts so the payload stays
 * internally consistent — which is what lets a test assert the UI renders the
 * API's numbers faithfully, instead of guessing at whatever the shared tenant
 * happens to hold today.
 */
export function buildDashboardPayload(
  values: DashboardValues,
  now: Date = new Date(),
): unknown {
  const initiated = values.funnelCounts[0] || 0;
  return {
    status: 'OK',
    data: {
      kpis: {
        totalCandidates: values.totalCandidates,
        totalCandidatesMoM: 0,
        aiFlaggedCases: values.aiFlaggedCases,
        aiFlaggedCasesMoM: 0,
        avgTimeToHireDays: values.avgTimeToHireDays,
        avgTimeToHireMoMDays: 0.0,
        offerAcceptanceRate: values.offerAcceptanceRate,
        offerAcceptanceRateMoM: 0.0,
        readyForReview: values.readyForReview,
        readyForReviewMoM: 0,
      },
      funnel: FUNNEL_STAGES.map((stage, i) => {
        const count = values.funnelCounts[i] ?? 0;
        return {
          stage,
          count,
          percentage:
            initiated === 0
              ? 0.0
              : Number(((count / initiated) * 100).toFixed(1)),
        };
      }),
      monthlyTrend: recentMonthLabels(6, now).map((month) => ({
        month,
        initiated: 0,
        completed: 0,
        declined: 0,
      })),
      offerByDepartment: values.departments,
      documentBottleneck: { pendingUploadsCount: 0, overdueCount: 0 },
    },
  };
}

/** Serve a fixed payload for the dashboard endpoint. */
export async function mockDashboardApi(
  page: Page,
  payload: unknown,
): Promise<void> {
  await page.route(DASHBOARD_API, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    }),
  );
}

/**
 * Make the dashboard endpoint fail.
 * @param mode - 'server-error' returns HTTP 500; 'network-error' drops the
 *               request the way a connectivity failure would.
 */
export async function failDashboardApi(
  page: Page,
  mode: 'server-error' | 'network-error' = 'server-error',
): Promise<void> {
  await page.route(DASHBOARD_API, (route) =>
    mode === 'network-error'
      ? route.abort('failed')
      : route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'ERROR',
            message: 'Internal Server Error',
          }),
        }),
  );
}
