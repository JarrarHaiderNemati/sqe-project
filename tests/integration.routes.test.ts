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
  vi.restoreAllMocks();
});

test('REAL-IT-01 contact route returns 400 when required fields are missing', async () => {
  vi.doMock('@/utils/supabase', () => ({
    supabase: {
      from: vi.fn(),
    },
  }));

  const { POST } = await import('../src/app/api/contact/route');
  const response = await POST(jsonRequest({ name: 'Ali' }));
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
});

test('REAL-IT-02 contact route inserts valid contact message', async () => {
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ insert }));

  vi.doMock('@/utils/supabase', () => ({
    supabase: { from },
  }));

  const { POST } = await import('../src/app/api/contact/route');
  const response = await POST(jsonRequest({
    name: 'Ali',
    email: 'ali@example.com',
    message: 'Hello',
  }));
  const body = await responseJson(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(from.mock.calls[0][0], 'contact');
  assert.deepEqual(insert.mock.calls[0][0], [{ name: 'Ali', email: 'ali@example.com', message: 'Hello' }]);
});

test('REAL-IT-03 contact route returns 500 when database insert fails', async () => {
  const insert = vi.fn().mockResolvedValue({ error: { message: 'db failed' } });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.doMock('@/utils/supabase', () => ({
    supabase: { from: vi.fn(() => ({ insert })) },
  }));

  const { POST } = await import('../src/app/api/contact/route');
  const response = await POST(jsonRequest({
    name: 'Ali',
    email: 'ali@example.com',
    message: 'Hello',
  }));
  const body = await responseJson(response);

  assert.equal(response.status, 500);
  assert.equal(body.success, false);
});

test('REAL-IT-04 incident route returns 400 for missing coordinates', async () => {
  vi.doMock('@/services/incident-service', () => ({
    IncidentService: {
      mergeOrCreate: vi.fn(),
    },
  }));

  const { POST } = await import('../src/app/api/incident/route');
  const response = await POST(jsonRequest({ deviceEmergencyId: 'device-1' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Missing required fields');
});

test('REAL-IT-05 incident route calls IncidentService for valid data', async () => {
  const mergeOrCreate = vi.fn().mockResolvedValue({ action: 'created', id: 'incident-1' });
  vi.doMock('@/services/incident-service', () => ({
    IncidentService: { mergeOrCreate },
  }));

  const { POST } = await import('../src/app/api/incident/route');
  const response = await POST(jsonRequest({
    deviceEmergencyId: 'device-1',
    latitude: 31.52,
    longitude: 74.35,
    timestamp: 123,
  }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.deepEqual(mergeOrCreate.mock.calls[0][0], {
    deviceEmergencyId: 'device-1',
    latitude: 31.52,
    longitude: 74.35,
    timestamp: 123,
    source: 'data',
    voiceUrl: undefined,
  });
});

test('REAL-IT-06 update-status route rejects missing id or status', async () => {
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({})),
  }));

  const { PATCH } = await import('../src/app/api/incident/update-status/route');
  const response = await PATCH(jsonRequest({ id: 'incident-1' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Missing id or status');
});

test('REAL-IT-07 update-status route rejects invalid status value', async () => {
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({})),
  }));

  const { PATCH } = await import('../src/app/api/incident/update-status/route');
  const response = await PATCH(jsonRequest({ id: 'incident-1', status: 'closed' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Invalid status value');
});

test('REAL-IT-08 update-status route updates incident status through Supabase client', async () => {
  const single = vi.fn().mockResolvedValue({
    data: { id: 'incident-1', status: 'acknowledged' },
    error: null,
  });
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));

  vi.doMock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({ from })),
  }));

  const { PATCH } = await import('../src/app/api/incident/update-status/route');
  const response = await PATCH(jsonRequest({ id: 'incident-1', status: 'acknowledged' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(from.mock.calls[0][0], 'incidents');
  assert.deepEqual(update.mock.calls[0][0], { status: 'acknowledged' });
  assert.deepEqual(eq.mock.calls[0], ['id', 'incident-1']);
});

test('REAL-IT-09 Gemini route returns 500 when API key is missing', async () => {
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

test('REAL-IT-10 Gemini route validates required request fields', async () => {
  vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', 'fake-key');

  const { POST } = await import('../src/app/api/gemini/route');
  const response = await POST(jsonRequest({ emergencyType: 'Fire' }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 400);
  assert.match(body.error, /Missing required fields/);
});

test('REAL-IT-11 Gemini route returns generated suggestion from mocked external API', async () => {
  vi.stubEnv('NEXT_PUBLIC_GEMINI_API_KEY', 'fake-key');
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      candidates: [
        { content: { parts: [{ text: 'Stay low and leave the building safely.' }] } },
      ],
    }),
  });
  vi.stubGlobal('fetch', fetchMock);

  const { POST } = await import('../src/app/api/gemini/route');
  const response = await POST(jsonRequest({
    emergencyType: 'Fire',
    description: 'Smoke in building',
    mode: 'self-help',
  }) as never);
  const body = await responseJson(response);

  assert.equal(response.status, 200);
  assert.equal(body.suggestion, 'Stay low and leave the building safely.');
  assert.match(fetchMock.mock.calls[0][0], /gemini-2\.0-flash/);
});

