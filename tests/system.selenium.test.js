import assert from 'node:assert/strict';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { afterAll, beforeAll, test } from 'vitest';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let driver;

async function open(path) {
  await driver.get(`${APP_URL}${path}`);
}

async function pageHasText(text) {
  const body = await driver.findElement(By.css('body')).getText();
  return body.includes(text);
}

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
  driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
});

afterAll(async () => {
  if (driver) await driver.quit();
});

test('SEL-ST-01 home page loads Swift Response brand', async () => {
  await open('/');
  assert.equal(await pageHasText('Swift Response'), true);
});

test('SEL-ST-02 home page shows report emergency call to action', async () => {
  await open('/');
  assert.equal(await pageHasText('Report Emergency'), true);
});

test('SEL-ST-03 login page displays login form fields', async () => {
  await open('/login');
  await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
  await driver.wait(until.elementLocated(By.css('input[type="password"]')), 5000);
  assert.equal(await pageHasText('Welcome Back'), true);
});

test('SEL-ST-04 signup page displays role selection workflow', async () => {
  await open('/signup');
  await driver.wait(until.elementLocated(By.css('select')), 5000);
  assert.equal(await pageHasText('Create Account'), true);
});

test('SEL-ST-05 contact page displays contact form', async () => {
  await open('/contact');
  await driver.wait(until.elementLocated(By.css('form')), 5000);
  assert.equal(await driver.findElements(By.css('input, textarea')).then((items) => items.length > 0), true);
});

test('SEL-ST-06 emergency panic page loads SOS interface', async () => {
  await open('/emergency');
  assert.equal(await pageHasText('SYSTEM READY'), true);
});

test('SEL-ST-07 volunteer page loads volunteer experience', async () => {
  await open('/volunteer');
  assert.equal(await pageHasText('Volunteer'), true);
});

test('SEL-ST-08 news page loads emergency news screen', async () => {
  await open('/news');
  await driver.wait(async () => {
    return (await pageHasText('Emergency News')) || (await pageHasText('Failed to Load News'));
  }, 12000);

  assert.equal(
    (await pageHasText('Emergency News')) || (await pageHasText('Failed to Load News')),
    true
  );
}, 15000);

test('SEL-ST-09 about page loads project information', async () => {
  await open('/about');
  assert.equal(await pageHasText('About'), true);
});

test('SEL-ST-10 privacy page loads policy information', async () => {
  await open('/privacy');
  assert.equal(await pageHasText('Privacy'), true);
});
