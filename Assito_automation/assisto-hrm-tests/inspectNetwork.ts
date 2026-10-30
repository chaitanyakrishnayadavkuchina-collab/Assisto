import { chromium } from '@playwright/test';
import loginData from './test-data/loginData.json';
import { getLoginUrl } from './utils/helpers';
import { LoginKeywords } from './keywords/LoginKeywords';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('candidate') || url.includes('pre-onboard') || url.includes('api')) {
      try {
        const text = await resp.text();
        if (text.includes('token') || text.includes('http') || text.includes('1450')) {
          console.log(`[API RESPONSE] ${resp.status()} ${url}:`, text.slice(0, 500));
        }
      } catch (e) {}
    }
  });

  const loginKeywords = new LoginKeywords(page);
  await loginKeywords.openLoginPage(getLoginUrl());
  await loginKeywords.login(loginData.roles.businessHR.email, loginData.roles.businessHR.password);
  await loginKeywords.verifyLoginSuccess();

  await page.goto('http://nsplus.perf.devassisto.com/people/pre-onboarding/candidate/1450');
  await page.waitForTimeout(5000);

  await browser.close();
}

main().catch(console.error);

