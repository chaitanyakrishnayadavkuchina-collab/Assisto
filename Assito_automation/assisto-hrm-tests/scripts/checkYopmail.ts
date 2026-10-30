import { chromium } from '@playwright/test';

async function checkYopmail(inbox: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log(`Checking Yopmail for ${inbox}...`);
  await page.goto(`https://yopmail.com/en/wm?login=${inbox}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const iframes = page.frames();
  console.log(`Found ${iframes.length} frames.`);

  // In Yopmail, inbox list is in iframe 'ifinbox' and mail content is in iframe 'ifmail'
  const inboxFrame = page.frame('ifinbox');
  if (inboxFrame) {
    const mails = await inboxFrame.locator('.m').allInnerTexts();
    console.log(`Mails in inbox for ${inbox}:`, mails);
  } else {
    console.log('No ifinbox frame found.');
    // Check main page content
    const text = await page.innerText('body');
    console.log('Body text snippet:', text.slice(0, 300));
  }

  await browser.close();
}

checkYopmail('matthew.ross.4079').catch(console.error);
