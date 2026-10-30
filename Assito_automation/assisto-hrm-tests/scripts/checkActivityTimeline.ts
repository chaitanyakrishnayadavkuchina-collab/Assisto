import { chromium } from '@playwright/test';
import loginData from '@test-data/loginData.json';
import { getLoginUrl } from '@utils/helpers';
import { LoginKeywords } from '@keywords/LoginKeywords';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const loginKeywords = new LoginKeywords(page);
  await loginKeywords.openLoginPage(getLoginUrl());
  await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
  await loginKeywords.verifyLoginSuccess();

  await page.goto('http://nsplus.perf.devassisto.com/people/pre-onboarding/candidate/1450');
  await page.waitForTimeout(3000);

  // Click Activity
  const activityBtn = page.getByRole('button', { name: 'Activity' });
  if (await activityBtn.isVisible()) {
    await activityBtn.click();
    await page.waitForTimeout(2000);
    const drawer = page.locator('[role="dialog"], [class*="drawer"], [class*="panel"]').last();
    console.log('Activity text:', await drawer.innerText());
    console.log('Activity HTML:', await drawer.innerHTML());
    const closeBtn = drawer.getByRole('button', { name: /close|cancel/i }).first();
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  // Click Timeline
  const timelineBtn = page.getByRole('button', { name: 'Timeline' });
  if (await timelineBtn.isVisible()) {
    await timelineBtn.click();
    await page.waitForTimeout(2000);
    const drawer = page.locator('[role="dialog"], [class*="drawer"], [class*="panel"]').last();
    console.log('Timeline text:', await drawer.innerText());
    console.log('Timeline HTML:', await drawer.innerHTML());
  }

  await browser.close();
}

main().catch(console.error);

