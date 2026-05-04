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

const localStorageMock = new MemoryLocalStorage();

beforeEach(() => {
  localStorageMock.clear();
  globalThis.window = {} as Window & typeof globalThis;
  globalThis.localStorage = localStorageMock;
  (globalThis as any).window.localStorage = localStorageMock;
});

afterEach(() => {
  localStorageMock.clear();
  if ((globalThis as any).window) {
    delete (globalThis as any).window.localStorage;
  }
  delete (globalThis as Partial<typeof globalThis>).window;
  delete (globalThis as Partial<typeof globalThis>).localStorage;
});

test('coverage: calculateDistance returns zero for identical coordinates', () => {
  assert.equal(calculateDistance(31.5204, 74.3587, 31.5204, 74.3587), 0);
});

test('coverage: calculateDistance returns realistic positive distance for different cities', () => {
  const distance = calculateDistance(31.5204, 74.3587, 24.8607, 67.0011);
  assert.ok(distance > 1000);
});

test('coverage: hasBeenAskedAboutEmergency returns false on server/no window', () => {
  delete (globalThis as Partial<typeof globalThis>).window;
  assert.equal(hasBeenAskedAboutEmergency('emg-1'), false);
});

test('coverage: hasBeenAskedAboutEmergency returns false when localStorage is empty', () => {
  assert.equal(hasBeenAskedAboutEmergency('emg-1'), false);
});

test('coverage: markEmergencyAsAsked saves emergency only once', () => {
  markEmergencyAsAsked('emg-1');
  markEmergencyAsAsked('emg-1');

  assert.deepEqual(JSON.parse(localStorage.getItem('safety_check_asked')!), ['emg-1']);
});

test('coverage: hasBeenAskedAboutEmergency returns true after marking emergency', () => {
  markEmergencyAsAsked('emg-1');

  assert.equal(hasBeenAskedAboutEmergency('emg-1'), true);
});

test('coverage: markEmergencyAsAsked does nothing without window', () => {
  delete (globalThis as Partial<typeof globalThis>).window;

  markEmergencyAsAsked('emg-1');

  assert.equal(localStorage.getItem('safety_check_asked'), null);
});

test('coverage: saveSafetyStatus stores safe response', () => {
  saveSafetyStatus('emg-1', true);

  const saved = JSON.parse(localStorage.getItem('safety_statuses')!);
  assert.equal(saved['emg-1'].isSafe, true);
  assert.equal(typeof saved['emg-1'].timestamp, 'string');
});

test('coverage: saveSafetyStatus updates existing safety statuses', () => {
  saveSafetyStatus('emg-1', true);
  saveSafetyStatus('emg-2', false);

  const saved = JSON.parse(localStorage.getItem('safety_statuses')!);
  assert.equal(saved['emg-1'].isSafe, true);
  assert.equal(saved['emg-2'].isSafe, false);
});

test('coverage: saveSafetyStatus does nothing without window', () => {
  delete (globalThis as Partial<typeof globalThis>).window;

  saveSafetyStatus('emg-1', false);

  assert.equal(localStorage.getItem('safety_statuses'), null);
});

test('coverage: safety check config uses expected polling and proximity values', () => {
  assert.equal(SAFETY_CHECK_CONFIG.PROXIMITY_THRESHOLD_KM, 10);
  assert.equal(SAFETY_CHECK_CONFIG.CHECK_INTERVAL_MS, 30000);
});

test('coverage: Gemini self-help prompt includes emergency details and safety tone', () => {
  const prompt = GEMINI_PROMPTS.selfHelp('Fire', 'Smoke in building');

  assert.equal(GEMINI_API_BASE_URL, 'https://generativelanguage.googleapis.com/v1');
  assert.match(prompt, /Fire/);
  assert.match(prompt, /Smoke in building/);
  assert.match(prompt, /Immediate safety steps/);
});

test('coverage: Gemini helper prompt includes volunteer guidance details', () => {
  const prompt = GEMINI_PROMPTS.helperMode('Flood', 'Street is blocked');

  assert.match(prompt, /VOLUNTEER/);
  assert.match(prompt, /Flood/);
  assert.match(prompt, /Street is blocked/);
  assert.match(prompt, /Safety precautions/);
});

test('coverage: news config targets Pakistan emergency articles', () => {
  assert.equal(GNEWS_API_BASE_URL, 'https://gnews.io/api/v4');
  assert.equal(NEWS_FETCH_INTERVAL, 300000);
  assert.equal(NEWS_SEARCH_PARAMS.country, 'pk');
  assert.equal(NEWS_SEARCH_PARAMS.lang, 'en');
  assert.equal(NEWS_SEARCH_PARAMS.max, 20);
  assert.match(NEWS_SEARCH_PARAMS.q, /Pakistan/);
});

test('coverage: YouTube config targets emergency safety videos', () => {
  assert.equal(YOUTUBE_API_BASE_URL, 'https://www.googleapis.com/youtube/v3');
  assert.equal(YOUTUBE_SEARCH_PARAMS.part, 'snippet');
  assert.equal(YOUTUBE_SEARCH_PARAMS.type, 'video');
  assert.equal(YOUTUBE_SEARCH_PARAMS.maxResults, 6);
  assert.equal(YOUTUBE_SEARCH_PARAMS.safeSearch, 'strict');
  assert.match(YOUTUBE_SEARCH_PARAMS.q, /emergency safety tips/);
});
