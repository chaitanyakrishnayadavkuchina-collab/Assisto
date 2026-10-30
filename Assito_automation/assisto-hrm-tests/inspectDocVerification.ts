import { chromium } from '@playwright/test';
import loginData from './test-data/loginData.json';
import { getLoginUrl } from './utils/helpers';
import { LoginKeywords } from './keywords/LoginKeywords';
import { CandidateRegistrationKeywords } from './keywords/CandidateRegistrationKeywords';
import { HrDocumentReviewKeywords } from './keywords/HrDocumentReviewKeywords';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginKeywords = new LoginKeywords(page);
  await loginKeywords.openLoginPage(getLoginUrl());
  await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
  await loginKeywords.verifyLoginSuccess();

  await page.goto('http://nsplus.perf.devassisto.com/people/pre-onboarding/candidate/1450');
  await page.waitForTimeout(3000);

  const hrReview = new HrDocumentReviewKeywords(page);
  await hrReview.clickContinueToDocumentVerification();
  await page.waitForTimeout(2000);

  console.log('Current URL after continue:', page.url());
  const buttons = await page.locator('button').allInnerTexts();
  console.log('Buttons on Document Verification tab:', buttons.filter(b => b.trim().length > 0));

  const text = (await page.innerText('body')).slice(0, 800).replace(/\n+/g, ' ');
  console.log('Page text snippet:', text);

  await browser.close();
}

main().catch(console.error);

