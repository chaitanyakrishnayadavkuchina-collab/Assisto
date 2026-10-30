import { chromium } from '@playwright/test';
import loginData from './test-data/loginData.json';
import { getLoginUrl } from './utils/helpers';
import { LoginKeywords } from './keywords/LoginKeywords';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginKeywords = new LoginKeywords(page);
  await loginKeywords.openLoginPage(getLoginUrl());
  await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
  await loginKeywords.verifyLoginSuccess();

  // Use page.request which shares context and cookies/tokens
  const resp = await page.request.get('http://nsplus.perf.devassisto.com/api/pre-onboarding/candidate/id/1450');
  const json = await resp.json();
  console.log('CANDIDATE 1450 FULL DATA:', JSON.stringify(json, null, 2));

  await browser.close();
}

main().catch(console.error);

