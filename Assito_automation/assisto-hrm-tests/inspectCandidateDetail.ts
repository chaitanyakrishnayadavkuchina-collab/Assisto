import { chromium } from '@playwright/test';
import loginData from './test-data/loginData.json';
import { getLoginUrl } from './utils/helpers';
import { LoginKeywords } from './keywords/LoginKeywords';
import { CandidateRegistrationKeywords } from './keywords/CandidateRegistrationKeywords';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginKeywords = new LoginKeywords(page);
  await loginKeywords.openLoginPage(getLoginUrl());
  await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
  await loginKeywords.verifyLoginSuccess();

  const regKeywords = new CandidateRegistrationKeywords(page);
  await regKeywords.navigateToCandidateRegistration();
  await regKeywords.clickCandidateRow('Nzwmfj Pqtnqv');
  await page.waitForTimeout(3000);

  console.log('Candidate Detail URL:', page.url());

  // Find all buttons, links, or text on the page
  const buttons = await page.locator('button').allInnerTexts();
  console.log('Buttons on Candidate Detail page:', buttons);

  const links = await page.locator('a').evaluateAll(elements => elements.map(e => ({ text: (e as HTMLElement).innerText, href: (e as HTMLAnchorElement).href })));
  console.log('Links on Candidate Detail page:', links);

  // Check Timeline / Activity
  const timelineBtn = page.getByRole('button', { name: /timeline/i });
  if (await timelineBtn.isVisible()) {
    await timelineBtn.click();
    await page.waitForTimeout(2000);
    console.log('Timeline text:', (await page.locator('[role="dialog"], [class*="drawer"]').innerText()).slice(0, 500));
  }

  await browser.close();
}

main().catch(console.error);

