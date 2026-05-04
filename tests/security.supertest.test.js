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

function createSecurityServer() {
  const db = {
    users: [{ email: 'citizen@test.com', password: 'Test@123' }],
    contacts: [],
    incidents: [{ id: 'incident-1', status: 'pending' }],
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJson(req);
      const user = db.users.find((item) => item.email === body.email && item.password === body.password);
      if (!user) return sendJson(res, 401, { error: 'Invalid credentials' });
      return sendJson(res, 200, { token: 'fake-jwt-token' });
    }

    if (req.method === 'POST' && url.pathname === '/api/contact') {
      const body = await readJson(req);
      if (!body.name || !body.email || !body.message) {
        return sendJson(res, 400, { success: false, message: 'All fields are required' });
      }
      db.contacts.push(body);
      return sendJson(res, 200, { success: true, data: body });
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

    return sendJson(res, 404, { error: 'Not found' });
  });

  return { server, db };
}

let app;

beforeEach(() => {
  app = createSecurityServer();
});

test('SEC-01 login rejects SQL injection-style credentials', async () => {
  const res = await request(app.server).post('/api/auth/login').send({
    email: "' OR '1'='1",
    password: "' OR '1'='1",
  });

  assert.equal(res.status, 401);
});

test('SEC-02 contact API accepts XSS payload as plain data only', async () => {
  const payload = '<script>alert(1)</script>';

  const res = await request(app.server).post('/api/contact').send({
    name: 'Tester',
    email: 'tester@example.com',
    message: payload,
  });

  assert.equal(res.status, 200);
  assert.equal(app.db.contacts[0].message, payload);
});

test('SEC-03 contact API rejects missing email and message', async () => {
  const res = await request(app.server).post('/api/contact').send({ name: 'Tester' });

  assert.equal(res.status, 400);
});

test('SEC-04 incident API rejects invalid status value', async () => {
  const res = await request(app.server).patch('/api/incident/update-status').send({
    id: 'incident-1',
    status: 'closed',
  });

  assert.equal(res.status, 400);
});

test('SEC-05 incident API rejects missing incident ID', async () => {
  const res = await request(app.server).patch('/api/incident/update-status').send({
    status: 'resolved',
  });

  assert.equal(res.status, 400);
});

test('SEC-06 SMS webhook rejects missing sender', async () => {
  const res = await request(app.server).post('/api/webhooks/sms').send({
    Body: 'SOS#device-1#FLOOD#LOC:31.52040,74.35870',
  });

  assert.equal(res.status, 400);
});

test('SEC-07 call webhook rejects missing caller', async () => {
  const res = await request(app.server).post('/api/webhooks/call').send({
    CellRegion: '31.52040,74.35870',
  });

  assert.equal(res.status, 400);
});

test('SEC-08 unknown endpoint returns 404', async () => {
  const res = await request(app.server).get('/api/admin/secrets');

  assert.equal(res.status, 404);
});

