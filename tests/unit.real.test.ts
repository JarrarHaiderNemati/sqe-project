import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'vitest';
import {
  calculateDistance,
  hasBeenAskedAboutEmergency,
  markEmergencyAsAsked,
  SAFETY_CHECK_CONFIG,
  saveSafetyStatus,
} from '../src/utils/safety-check';
import { GEMINI_API_BASE_URL, GEMINI_PROMPTS } from '../src/utils/gemini-config';
import { GNEWS_API_BASE_URL, NEWS_FETCH_INTERVAL, NEWS_SEARCH_PARAMS } from '../src/utils/news-config';
import { YOUTUBE_API_BASE_URL, YOUTUBE_SEARCH_PARAMS } from '../src/utils/youtube-config';

class MemoryLocalStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.has(key) ? this.values.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  clear() {
    this.values.clear();
  }
}

const storage = new MemoryLocalStorage();

beforeEach(() => {
  storage.clear();
  globalThis.window = {} as Window & typeof globalThis;
  globalThis.localStorage = storage as Storage;
});

afterEach(() => {
  storage.clear();
  delete (globalThis as Partial<typeof globalThis>).window;
  delete (globalThis as Partial<typeof globalThis>).localStorage;
});

test('REAL-UT-01 calculateDistance returns zero for the same coordinates', () => {
  assert.equal(calculateDistance(31.5204, 74.3587, 31.5204, 74.3587), 0);
});

test('REAL-UT-02 calculateDistance returns positive distance for Lahore to Karachi', () => {
  assert.ok(calculateDistance(31.5204, 74.3587, 24.8607, 67.0011) > 1000);
});

test('REAL-UT-03 hasBeenAskedAboutEmergency returns false before an emergency is marked', () => {
  assert.equal(hasBeenAskedAboutEmergency('emg-1'), false);
});

test('REAL-UT-04 markEmergencyAsAsked stores emergency id in localStorage', () => {
  markEmergencyAsAsked('emg-1');

  assert.equal(hasBeenAskedAboutEmergency('emg-1'), true);
});

test('REAL-UT-05 markEmergencyAsAsked does not duplicate emergency ids', () => {
  markEmergencyAsAsked('emg-1');
  markEmergencyAsAsked('emg-1');

  assert.deepEqual(JSON.parse(localStorage.getItem('safety_check_asked')!), ['emg-1']);
});

test('REAL-UT-06 saveSafetyStatus stores safe response', () => {
  saveSafetyStatus('emg-1', true);

  const saved = JSON.parse(localStorage.getItem('safety_statuses')!);
  assert.equal(saved['emg-1'].isSafe, true);
});

test('REAL-UT-07 saveSafetyStatus stores need-help response', () => {
  saveSafetyStatus('emg-1', false);

  const saved = JSON.parse(localStorage.getItem('safety_statuses')!);
  assert.equal(saved['emg-1'].isSafe, false);
});

test('REAL-UT-08 safety check constants match app thresholds', () => {
  assert.equal(SAFETY_CHECK_CONFIG.PROXIMITY_THRESHOLD_KM, 10);
  assert.equal(SAFETY_CHECK_CONFIG.CHECK_INTERVAL_MS, 30000);
});

test('REAL-UT-09 Gemini self-help prompt includes emergency type and description', () => {
  const prompt = GEMINI_PROMPTS.selfHelp('Fire', 'Smoke in building');

  assert.equal(GEMINI_API_BASE_URL, 'https://generativelanguage.googleapis.com/v1');
  assert.match(prompt, /Fire/);
  assert.match(prompt, /Smoke in building/);
});

test('REAL-UT-10 Gemini helper prompt is written for volunteers', () => {
  const prompt = GEMINI_PROMPTS.helperMode('Flood', 'Street blocked');

  assert.match(prompt, /VOLUNTEER/);
  assert.match(prompt, /Flood/);
  assert.match(prompt, /Street blocked/);
});

test('REAL-UT-11 news config targets Pakistan emergency news', () => {
  assert.equal(GNEWS_API_BASE_URL, 'https://gnews.io/api/v4');
  assert.equal(NEWS_FETCH_INTERVAL, 300000);
  assert.equal(NEWS_SEARCH_PARAMS.country, 'pk');
  assert.match(NEWS_SEARCH_PARAMS.q, /Pakistan/);
});

test('REAL-UT-12 YouTube config targets safety videos', () => {
  assert.equal(YOUTUBE_API_BASE_URL, 'https://www.googleapis.com/youtube/v3');
  assert.equal(YOUTUBE_SEARCH_PARAMS.type, 'video');
  assert.equal(YOUTUBE_SEARCH_PARAMS.safeSearch, 'strict');
  assert.match(YOUTUBE_SEARCH_PARAMS.q, /emergency safety tips/);
});

test('REAL-UT-13 calculateDistance is symmetrical', () => {
  const lahoreToKarachi = calculateDistance(31.5204, 74.3587, 24.8607, 67.0011);
  const karachiToLahore = calculateDistance(24.8607, 67.0011, 31.5204, 74.3587);

  assert.equal(Math.round(lahoreToKarachi), Math.round(karachiToLahore));
});

test('REAL-UT-14 calculateDistance returns small value for nearby coordinates', () => {
  const distance = calculateDistance(31.5204, 74.3587, 31.521, 74.359);

  assert.ok(distance < 1);
});

test('REAL-UT-15 hasBeenAskedAboutEmergency returns false without browser window', () => {
  delete (globalThis as Partial<typeof globalThis>).window;

  assert.equal(hasBeenAskedAboutEmergency('emg-1'), false);
});

test('REAL-UT-16 markEmergencyAsAsked does not write without browser window', () => {
  delete (globalThis as Partial<typeof globalThis>).window;

  markEmergencyAsAsked('emg-1');

  assert.equal(localStorage.getItem('safety_check_asked'), null);
});

test('REAL-UT-17 saveSafetyStatus does not write without browser window', () => {
  delete (globalThis as Partial<typeof globalThis>).window;

  saveSafetyStatus('emg-1', true);

  assert.equal(localStorage.getItem('safety_statuses'), null);
});

test('REAL-UT-18 markEmergencyAsAsked stores multiple unique emergency ids', () => {
  markEmergencyAsAsked('emg-1');
  markEmergencyAsAsked('emg-2');

  assert.deepEqual(JSON.parse(localStorage.getItem('safety_check_asked')!), ['emg-1', 'emg-2']);
});

test('REAL-UT-19 hasBeenAskedAboutEmergency returns false for unmarked id', () => {
  markEmergencyAsAsked('emg-1');

  assert.equal(hasBeenAskedAboutEmergency('emg-2'), false);
});

test('REAL-UT-20 saveSafetyStatus preserves existing statuses when adding another', () => {
  saveSafetyStatus('emg-1', true);
  saveSafetyStatus('emg-2', false);

  const saved = JSON.parse(localStorage.getItem('safety_statuses')!);
  assert.equal(saved['emg-1'].isSafe, true);
  assert.equal(saved['emg-2'].isSafe, false);
});

test('REAL-UT-21 saveSafetyStatus stores ISO-like timestamp value', () => {
  saveSafetyStatus('emg-1', true);

  const saved = JSON.parse(localStorage.getItem('safety_statuses')!);
  assert.equal(Number.isNaN(Date.parse(saved['emg-1'].timestamp)), false);
});

test('REAL-UT-22 safety check interval equals 30 seconds', () => {
  assert.equal(SAFETY_CHECK_CONFIG.CHECK_INTERVAL_MS / 1000, 30);
});

test('REAL-UT-23 safety proximity threshold is a positive kilometer value', () => {
  assert.equal(typeof SAFETY_CHECK_CONFIG.PROXIMITY_THRESHOLD_KM, 'number');
  assert.ok(SAFETY_CHECK_CONFIG.PROXIMITY_THRESHOLD_KM > 0);
});

test('REAL-UT-24 Gemini base URL points to Google generative language API', () => {
  assert.match(GEMINI_API_BASE_URL, /^https:\/\/generativelanguage\.googleapis\.com/);
});

test('REAL-UT-25 Gemini self-help prompt asks for immediate action', () => {
  const prompt = GEMINI_PROMPTS.selfHelp('Medical', 'Person is unconscious');

  assert.match(prompt, /RIGHT NOW/);
  assert.match(prompt, /Immediate safety steps/);
});

test('REAL-UT-26 Gemini self-help prompt asks for things to avoid', () => {
  const prompt = GEMINI_PROMPTS.selfHelp('Fire', 'Kitchen fire');

  assert.match(prompt, /Important things to avoid/);
});

test('REAL-UT-27 Gemini helper prompt asks for supplies and resources', () => {
  const prompt = GEMINI_PROMPTS.helperMode('Flood', 'People stranded');

  assert.match(prompt, /supplies or resources/i);
});

test('REAL-UT-28 Gemini helper prompt asks when to call professional help', () => {
  const prompt = GEMINI_PROMPTS.helperMode('Rescue', 'Person trapped');

  assert.match(prompt, /professional help/i);
});

test('REAL-UT-29 Gemini helper and self-help prompts are different', () => {
  const selfHelpPrompt = GEMINI_PROMPTS.selfHelp('Fire', 'Smoke');
  const helperPrompt = GEMINI_PROMPTS.helperMode('Fire', 'Smoke');

  assert.notEqual(selfHelpPrompt, helperPrompt);
});

test('REAL-UT-30 news config uses Pakistan country code', () => {
  assert.equal(NEWS_SEARCH_PARAMS.country, 'pk');
});

test('REAL-UT-31 news config uses English language', () => {
  assert.equal(NEWS_SEARCH_PARAMS.lang, 'en');
});

test('REAL-UT-32 news config fetches maximum 20 articles', () => {
  assert.equal(NEWS_SEARCH_PARAMS.max, 20);
});

test('REAL-UT-33 news config sorts by publish date', () => {
  assert.equal(NEWS_SEARCH_PARAMS.sortby, 'publishedAt');
});

test('REAL-UT-34 news query includes flood emergencies', () => {
  assert.match(NEWS_SEARCH_PARAMS.q, /flood/);
});

test('REAL-UT-35 news query includes earthquake emergencies', () => {
  assert.match(NEWS_SEARCH_PARAMS.q, /earthquake/);
});

test('REAL-UT-36 YouTube config requests snippet data', () => {
  assert.equal(YOUTUBE_SEARCH_PARAMS.part, 'snippet');
});

test('REAL-UT-37 YouTube config requests six videos', () => {
  assert.equal(YOUTUBE_SEARCH_PARAMS.maxResults, 6);
});

test('REAL-UT-38 YouTube config orders by relevance', () => {
  assert.equal(YOUTUBE_SEARCH_PARAMS.order, 'relevance');
});

test('REAL-UT-39 YouTube config uses English relevance language', () => {
  assert.equal(YOUTUBE_SEARCH_PARAMS.relevanceLanguage, 'en');
});

test('REAL-UT-40 YouTube config requests medium-duration videos', () => {
  assert.equal(YOUTUBE_SEARCH_PARAMS.videoDuration, 'medium');
});
