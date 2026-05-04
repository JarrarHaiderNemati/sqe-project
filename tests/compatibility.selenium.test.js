import assert from 'node:assert/strict';
import { Builder, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { afterAll, beforeAll, test } from 'vitest';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const pages = [
  { path: '/', text: 'Swift Response' },
  { path: '/login', text: 'Welcome Back' },
  { path: '/signup', text: 'Create Account' },
  { path: '/contact', text: 'Contact' },
  { path: '/emergency', text: 'SYSTEM READY' },
];

let driver;

async function bodyText() {
  return driver.findElement(By.css('body')).getText();
}

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
  driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
});

afterAll(async () => {
  if (driver) await driver.quit();
});

for (const viewport of viewports) {
  for (const page of pages) {
    test(`CT-${viewport.name}-${page.path} renders expected content`, async () => {
      await driver.manage().window().setRect({
        width: viewport.width,
        height: viewport.height,
      });
      await driver.get(`${APP_URL}${page.path}`);

      const text = await bodyText();
      assert.equal(text.includes(page.text), true);
    });
  }
}
