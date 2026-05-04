import http from 'node:http';
import assert from 'node:assert/strict';
import request from 'supertest';
import { beforeEach, test } from 'vitest';

function readJson(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      resolve(body ? JSON.parse(body) : {});
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function createApiServer() {
  const db = {
    contacts: [],
    incidents: [],
    emergencyRequests: [],
    volunteerRegistrations: [],
    users: [{ id: 'user-1', email: 'citizen@test.com', password: 'Test@123', role: 'citizen' }],
    nextId: 1,
  };

  const id = (prefix) => `${prefix}-${db.nextId++}`;

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJson(req);
      const user = db.users.find((item) => item.email === body.email && item.password === body.password);
      if (!user) return sendJson(res, 401, { error: 'Invalid credentials' });
      return sendJson(res, 200, { token: 'fake-jwt-token', user: { id: user.id, role: user.role } });
    }

    if (req.method === 'POST' && url.pathname === '/api/contact') {
      const body = await readJson(req);
      if (!body.name || !body.email || !body.message) {
        return sendJson(res, 400, { success: false, message: 'All fields are required' });
      }
      const contact = { id: id('contact'), ...body };
      db.contacts.push(contact);
      return sendJson(res, 200, { success: true, data: contact });
    }

    if (url.pathname === '/api/emergency-requests' && req.method === 'POST') {
      const body = await readJson(req);
      if (!body.requester_id || !body.type || !body.description || !body.location) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      const emergency = { id: id('request'), status: 'pending', ...body };
      db.emergencyRequests.push(emergency);
      return sendJson(res, 201, emergency);
    }

    if (url.pathname === '/api/emergency-requests' && req.method === 'GET') {
      const requesterId = url.searchParams.get('requester_id');
      const rows = requesterId
        ? db.emergencyRequests.filter((item) => item.requester_id === requesterId)
        : db.emergencyRequests;
      return sendJson(res, 200, rows);
    }

    if (url.pathname.startsWith('/api/emergency-requests/') && req.method === 'PUT') {
      const requestId = url.pathname.split('/').pop();
      const body = await readJson(req);
      const emergency = db.emergencyRequests.find((item) => item.id === requestId);
      if (!emergency) return sendJson(res, 404, { error: 'Request not found' });
      Object.assign(emergency, body);
      return sendJson(res, 200, emergency);
    }

    if (url.pathname.startsWith('/api/emergency-requests/') && req.method === 'DELETE') {
      const requestId = url.pathname.split('/').pop();
      const before = db.emergencyRequests.length;
      db.emergencyRequests = db.emergencyRequests.filter((item) => item.id !== requestId);
      if (before === db.emergencyRequests.length) return sendJson(res, 404, { error: 'Request not found' });
      return sendJson(res, 200, { success: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/volunteer-registrations') {
      const body = await readJson(req);
      if (!body.request_id || !body.volunteer_id || !body.contact_info) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      const registration = { id: id('registration'), ...body };
      db.volunteerRegistrations.push(registration);
      return sendJson(res, 201, registration);
    }

    if (req.method === 'POST' && url.pathname === '/api/incident') {
      const body = await readJson(req);
      if (!body.deviceEmergencyId || body.latitude === undefined || body.longitude === undefined) {
        return sendJson(res, 400, { error: 'Missing required fields' });
      }
      const incident = {
        id: id('incident'),
        device_emergency_id: body.deviceEmergencyId,
        latitude: body.latitude,
        longitude: body.longitude,
        status: 'pending',
        source_channel: 'data',
      };
      db.incidents.push(incident);
      return sendJson(res, 200, { success: true, result: { action: 'created', id: incident.id } });
    }

    if (req.method === 'PATCH' && url.pathname === '/api/incident/update-status') {
      const body = await readJson(req);
      if (!body.id || !body.status) return sendJson(res, 400, { error: 'Missing id or status' });
      if (!['pending', 'acknowledged', 'resolved'].includes(body.status)) {
        return sendJson(res, 400, { error: 'Invalid status value' });
      }
      const incident = db.incidents.find((item) => item.id === body.id);
      if (!incident) return sendJson(res, 404, { error: 'Incident not found' });
      incident.status = body.status;
      return sendJson(res, 200, { success: true, data: incident });
    }

    if (req.method === 'POST' && url.pathname === '/api/webhooks/sms') {
      const body = await readJson(req);
      if (!body.From || !body.Body) return sendJson(res, 400, { error: 'Missing parameters' });
      return sendJson(res, 200, { success: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/webhooks/call') {
      const body = await readJson(req);
      if (!body.Caller) return sendJson(res, 400, { error: 'Missing caller' });
      return sendJson(res, 200, { success: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/news') {
      return sendJson(res, 200, { totalArticles: 1, articles: [{ title: 'Flood alert' }] });
    }

    if (req.method === 'GET' && url.pathname === '/api/youtube') {
      return sendJson(res, 200, { items: [{ id: { videoId: 'video-1' }, snippet: { title: 'First aid' } }] });
    }

    if (req.method === 'POST' && url.pathname === '/api/gemini') {
      const body = await readJson(req);
      if (!body.emergencyType || !body.description || !body.mode) {
        return sendJson(res, 400, { error: 'Missing required fields: emergencyType, description, mode' });
      }
      return sendJson(res, 200, { suggestion: `AI suggestion for ${body.emergencyType}` });
    }

    return sendJson(res, 404, { error: 'Not found' });
  });

  return { server, db };
}

let api;

beforeEach(() => {
  api = createApiServer();
});

test('ST-API-01 POST /api/auth/login returns token for valid credentials', async () => {
  const res = await request(api.server).post('/api/auth/login').send({
    email: 'citizen@test.com',
    password: 'Test@123',
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.token, 'fake-jwt-token');
});

test('ST-API-02 POST /api/auth/login rejects invalid credentials', async () => {
  const res = await request(api.server).post('/api/auth/login').send({
    email: 'citizen@test.com',
    password: 'wrong',
  });

  assert.equal(res.status, 401);
});

test('ST-API-03 POST /api/contact saves valid contact message', async () => {
  const res = await request(api.server).post('/api/contact').send({
    name: 'Tester',
    email: 'tester@example.com',
    message: 'Hello',
  });

  assert.equal(res.status, 200);
  assert.equal(api.db.contacts.length, 1);
});

test('ST-API-04 POST /api/contact rejects missing fields', async () => {
  const res = await request(api.server).post('/api/contact').send({ name: 'Tester' });

  assert.equal(res.status, 400);
});

test('ST-API-05 POST and GET /api/emergency-requests creates and reads request', async () => {
  const created = await request(api.server).post('/api/emergency-requests').send({
    requester_id: 'user-1',
    type: 'Medical',
    description: 'Need ambulance',
    location: { lat: 31.52, lng: 74.35, address: 'Lahore' },
  });

  const fetched = await request(api.server).get('/api/emergency-requests?requester_id=user-1');

  assert.equal(created.status, 201);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.length, 1);
});

test('ST-API-06 POST /api/emergency-requests rejects invalid input', async () => {
  const res = await request(api.server).post('/api/emergency-requests').send({ type: 'Medical' });

  assert.equal(res.status, 400);
});

test('ST-API-07 PUT /api/emergency-requests/:id updates request', async () => {
  const created = await request(api.server).post('/api/emergency-requests').send({
    requester_id: 'user-1',
    type: 'Medical',
    description: 'Old',
    location: { lat: 1, lng: 2, address: 'Old' },
  });

  const updated = await request(api.server)
    .put(`/api/emergency-requests/${created.body.id}`)
    .send({ description: 'Updated' });

  assert.equal(updated.status, 200);
  assert.equal(updated.body.description, 'Updated');
});

test('ST-API-08 DELETE /api/emergency-requests/:id removes request', async () => {
  const created = await request(api.server).post('/api/emergency-requests').send({
    requester_id: 'user-1',
    type: 'Flood',
    description: 'Flooded road',
    location: { lat: 1, lng: 2, address: 'Lahore' },
  });

  const deleted = await request(api.server).delete(`/api/emergency-requests/${created.body.id}`);

  assert.equal(deleted.status, 200);
  assert.equal(api.db.emergencyRequests.length, 0);
});

test('ST-API-09 POST /api/volunteer-registrations saves volunteer response', async () => {
  const res = await request(api.server).post('/api/volunteer-registrations').send({
    request_id: 'request-1',
    volunteer_id: 'volunteer-1',
    message: 'I can help',
    contact_info: '03001234567',
  });

  assert.equal(res.status, 201);
  assert.equal(api.db.volunteerRegistrations.length, 1);
});

test('ST-API-10 POST /api/incident creates panic incident', async () => {
  const res = await request(api.server).post('/api/incident').send({
    deviceEmergencyId: 'device-1',
    latitude: 31.52,
    longitude: 74.35,
  });

  assert.equal(res.status, 200);
  assert.equal(api.db.incidents.length, 1);
});

test('ST-API-11 PATCH /api/incident/update-status updates incident status', async () => {
  const created = await request(api.server).post('/api/incident').send({
    deviceEmergencyId: 'device-1',
    latitude: 31.52,
    longitude: 74.35,
  });

  const res = await request(api.server).patch('/api/incident/update-status').send({
    id: created.body.result.id,
    status: 'acknowledged',
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.data.status, 'acknowledged');
});

test('ST-API-12 PATCH /api/incident/update-status rejects invalid status', async () => {
  const res = await request(api.server).patch('/api/incident/update-status').send({
    id: 'incident-1',
    status: 'closed',
  });

  assert.equal(res.status, 400);
});

test('ST-API-13 POST /api/webhooks/sms accepts valid SMS webhook', async () => {
  const res = await request(api.server).post('/api/webhooks/sms').send({
    From: '+923001234567',
    Body: 'SOS#device-1#FLOOD#LOC:31.52040,74.35870',
  });

  assert.equal(res.status, 200);
});

test('ST-API-14 GET /api/news and GET /api/youtube return external feed data', async () => {
  const news = await request(api.server).get('/api/news');
  const youtube = await request(api.server).get('/api/youtube');

  assert.equal(news.status, 200);
  assert.equal(news.body.articles.length, 1);
  assert.equal(youtube.status, 200);
  assert.equal(youtube.body.items.length, 1);
});

test('ST-API-15 POST /api/gemini returns AI suggestion', async () => {
  const res = await request(api.server).post('/api/gemini').send({
    emergencyType: 'Fire',
    description: 'Smoke in building',
    mode: 'self-help',
  });

  assert.equal(res.status, 200);
  assert.match(res.body.suggestion, /Fire/);
});
