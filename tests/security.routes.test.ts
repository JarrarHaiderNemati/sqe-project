import assert from 'node:assert/strict';
import { afterEach, beforeEach, test, vi } from 'vitest';

function jsonRequest(body: unknown) {
  return new Request('http://localhost/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function responseJson(response: Response) {
  return response.json();
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('REAL-SEC-01 contact route rejects missing email/message fields', async () => {
  vi.doMock('@/utils/supabase', () => ({ //Use fake version of supabase to avoid actual DB calls
    supabase: { from: vi.fn() },
  }));

  const { POST } = await import('../src/app/api/contact/route');
  const response = await POST(jsonRequest({ name: 'Attacker' }));
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
});

test('REAL-SEC-02 contact route treats XSS payload as data passed to database layer', async () => {
  const insert = vi.fn().mockResolvedValue({ error: null });
  vi.doMock('@/utils/supabase', () => ({
    supabase: { from: vi.fn(() => ({ insert })) },
  }));

  const payload = '<script>alert("xss")</script>';
  const { POST } = await import('../src/app/api/contact/route');
  const response = await POST(jsonRequest({
    name: 'Tester',
    email: 'tester@example.com',
    message: payload,
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(insert.mock.calls[0][0], [{
    name: 'Tester',
    email: 'tester@example.com',
    message: payload,
  }]);
});

test('REAL-SEC-03 incident route rejects missing device emergency id', async () => {
  vi.doMock('@/services/incident-service', () => ({
    IncidentService: { mergeOrCreate: vi.fn() },
  }));

  const { POST } = await import('../src/app/api/incident/route');
  const response = await POST(jsonRequest({ latitude: 31.52, longitude: 74.35 }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Missing required fields');
});

test('REAL-SEC-04 update-status route rejects missing incident id', async () => {
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({})),
  }));

  const { PATCH } = await import('../src/app/api/incident/update-status/route');
  const response = await PATCH(jsonRequest({ status: 'resolved' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Missing id or status');
});

test('REAL-SEC-05 update-status route rejects invalid status enum', async () => {
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({})),
  }));

  const { PATCH } = await import('../src/app/api/incident/update-status/route');
  const response = await PATCH(jsonRequest({ id: 'incident-1', status: 'closed' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Invalid status value');
});

test('REAL-SEC-06 Gemini route refuses requests when API key is absent', async () => {
  vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', '');

  const { POST } = await import('../src/app/api/gemini/route');
  const response = await POST(jsonRequest({
    emergencyType: 'Fire',
    description: 'Smoke',
    mode: 'self-help',
  }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 500);
  assert.equal(body.error, 'Gemini API key not configured');
});

test('REAL-SEC-07 Gemini route rejects incomplete payload before external call', async () => {
  vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', 'fake-key');
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  const { POST } = await import('../src/app/api/gemini/route');
  const response = await POST(jsonRequest({ emergencyType: 'Fire' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.match(body.error, /Missing required fields/);
  assert.equal(fetchMock.mock.calls.length, 0);
});

test('REAL-SEC-08 news route does not call external API without key', async () => {
  vi.stubEnv('NEXT_PUBLIC_GNEWS_API_KEY', '');
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  const { GET } = await import('../src/app/api/news/route');
  const response = await GET(new Request('http://localhost/api/news'));
  const body = await responseJson(response);

  assert.equal(response.status, 500);
  assert.equal(body.error, 'API key not configured');
  assert.equal(fetchMock.mock.calls.length, 0);
});

test('REAL-SEC-09 YouTube route does not call external API without key', async () => {
  vi.stubEnv('NEXT_PUBLIC_YOUTUBE_API_KEY', '');
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);

  const { GET } = await import('../src/app/api/youtube/route');
  const response = await GET();
  const body = await responseJson(response);

  assert.equal(response.status, 500);
  assert.equal(body.error, 'YouTube API key not configured');
  assert.equal(fetchMock.mock.calls.length, 0);
});

test('REAL-SEC-10 SMS webhook rejects missing sender or body', async () => {
  vi.doMock('@/services/incident-service', () => ({
    IncidentService: { mergeOrCreate: vi.fn() },
  }));

  const { POST } = await import('../src/app/api/webhooks/sms/route');
  const response = await POST(jsonRequest({ Body: 'SOS#device-1#FLOOD#LOC:31.52,74.35' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Missing parameters');
});

test('REAL-SEC-11 SMS webhook parses valid payload and passes sanitized values to IncidentService', async () => {
  const mergeOrCreate = vi.fn().mockResolvedValue({ action: 'created', id: 'incident-1' });
  vi.doMock('@/services/incident-service', () => ({
    IncidentService: { mergeOrCreate },
  }));

  const { POST } = await import('../src/app/api/webhooks/sms/route');
  const response = await POST(jsonRequest({
    From: '+923001234567',
    Body: 'SOS#device-1#FLOOD#LOC:31.52040,74.35870',
  }) as never);

  assert.equal(response.status, 200);
  assert.equal(mergeOrCreate.mock.calls[0][0].deviceEmergencyId, 'device-1');
  assert.equal(mergeOrCreate.mock.calls[0][0].phoneNumber, '+923001234567');
  assert.equal(mergeOrCreate.mock.calls[0][0].source, 'sms');
});

test('REAL-SEC-12 call webhook handles missing cell region as unknown coordinates', async () => {
  const mergeOrCreate = vi.fn().mockResolvedValue({ action: 'created', id: 'incident-1' });
  vi.doMock('@/services/incident-service', () => ({
    IncidentService: { mergeOrCreate },
  }));

  const { POST } = await import('../src/app/api/webhooks/call/route');
  const response = await POST(jsonRequest({ Caller: '+923001234567' }) as never);

  assert.equal(response.status, 200);
  assert.equal(mergeOrCreate.mock.calls[0][0].deviceEmergencyId, 'UNKNOWN_CALL');
  assert.equal(mergeOrCreate.mock.calls[0][0].latitude, 0);
  assert.equal(mergeOrCreate.mock.calls[0][0].longitude, 0);
  assert.equal(mergeOrCreate.mock.calls[0][0].source, 'call');
});
