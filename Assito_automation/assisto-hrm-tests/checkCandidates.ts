import { chromium } from '@playwright/test';
import loginData from './test-data/loginData.json';
import { getLoginUrl } from './utils/helpers';
import { LoginKeywords } from './keywords/LoginKeywords';
import { CandidateRegistrationKeywords } from './keywords/CandidateRegistrationKeywords';
import { CandidateRegistrationPage } from './pages/CandidateRegistrationPage';

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
  await page.waitForTimeout(3000);

  const regPage = new CandidateRegistrationPage(page);
  const rows = regPage.candidateRows;
  const count = await rows.count();
  console.log(`Found ${count} candidate rows.`);

  for (let i = 0; i < Math.min(count, 15); i++) {
    const text = await rows.nth(i).innerText();
    console.log(`Row ${i + 1}: ${text.replace(/\t+/g, ' | ').replace(/\n+/g, ' | ')}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
