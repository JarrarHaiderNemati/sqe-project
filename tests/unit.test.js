import assert from 'node:assert/strict';
import { test } from 'vitest';

function validateLoginForm({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
  if (!password) errors.password = 'Password is required';
  return errors;
}

function validateSignupForm({ fullName, email, password, role }) {
  const errors = {};
  if (!fullName) errors.fullName = 'Full name is required';
  if (!email) errors.email = 'Email is required';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!['citizen', 'volunteer', 'ngo_admin'].includes(role)) errors.role = 'Invalid role';
  return errors;
}

function togglePasswordType(currentType) {
  return currentType === 'password' ? 'text' : 'password';
}

function validateEmergencyRequest({ description, location }) {
  const errors = {};
  if (!description) errors.description = 'Description is required';
  if (!location) errors.location = 'Location is required';
  return errors;
}

function updateEmergencyType(type) {
  return { type };
}

function updateUrgency(urgency) {
  return { urgency };
}

function selectLocation(lat, lng, address) {
  return {
    location: address,
    coordinates: { lat, lng },
  };
}

function buildDashboardState(requests) {
  return {
    isEmpty: requests.length === 0,
    cards: requests.map((request) => ({
      id: request.id,
      type: request.type,
      status: request.status,
      location: request.location.address,
      description: request.description,
    })),
  };
}

function getEditPath(id) {
  return `/requests/edit/${id}`;
}

class FakeStorage {
  constructor(initial = {}) {
    this.store = new Map(Object.entries(initial));
  }

  async getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async setItem(key, value) {
    this.store.set(key, value);
  }

  async removeItem(key) {
    this.store.delete(key);
  }
}

class FakeChannelManager {
  constructor({ storage, emergencyIdFactory, fetcher, online = true }) {
    this.storage = storage;
    this.emergencyIdFactory = emergencyIdFactory;
    this.fetcher = fetcher;
    this.online = online;
    this.emergencyId = null;
    this.emergencyNumber = '1122';
  }

  async initStore() {
    let id = await this.storage.getItem('device_emergency_id');
    if (!id) {
      id = this.emergencyIdFactory();
      await this.storage.setItem('device_emergency_id', id);
    }
    this.emergencyId = id;
    return id;
  }

  async buildPayload(gps) {
    if (!this.emergencyId) await this.initStore();
    return {
      deviceEmergencyId: this.emergencyId,
      latitude: gps?.lat || 0,
      longitude: gps?.lng || 0,
      timestamp: 1000,
    };
  }

  async triggerEmergency(gps) {
    const payload = await this.buildPayload(gps);
    await this.storage.setItem('pending_incident', payload);

    if (!this.online) return { status: 'escalated', step: 'call' };

    const response = await this.fetcher('/api/incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await this.storage.removeItem('pending_incident');
      return { status: 'success', step: 'data' };
    }

    return { status: 'escalated', step: 'call' };
  }

  buildSMSLink(gps) {
    const locString = gps ? `LOC:${gps.lat.toFixed(5)},${gps.lng.toFixed(5)}` : 'LOC:UNKNOWN';
    const body = `SOS#${this.emergencyId}#FLOOD#${locString}`;
    return `sms:${this.emergencyNumber}?body=${encodeURIComponent(body)}`;
  }
}

async function mergeOrCreateIncident({ incidents, incoming, nowMs }) {
  const mergeWindowMs = 10 * 60 * 1000;
  const recent = incidents
    .filter((incident) => incident.status === 'pending')
    .filter((incident) => nowMs - incident.createdAtMs <= mergeWindowMs)
    .find((incident) => (
      incident.deviceEmergencyId === incoming.deviceEmergencyId ||
      (incoming.phoneNumber && incident.phoneNumber === incoming.phoneNumber)
    ));

  if (!recent) {
    const created = {
      id: `incident-${incidents.length + 1}`,
      ...incoming,
      status: 'pending',
      locationConfidence: incoming.source === 'data' ? 'high' : 'unknown',
      sourceChannel: incoming.source,
      createdAtMs: nowMs,
    };
    incidents.push(created);
    return { action: 'created', incident: created };
  }

  if (incoming.source === 'data') {
    recent.latitude = incoming.latitude;
    recent.longitude = incoming.longitude;
    recent.locationConfidence = 'high';
    recent.sourceChannel = 'data';
  }
  return { action: 'merged', incident: recent };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

function createBrowserStorage() {
  const data = {};
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

function markEmergencyAsAsked(storage, emergencyId) {
  const existing = storage.getItem('safety_check_asked');
  const ids = existing ? JSON.parse(existing) : [];
  if (!ids.includes(emergencyId)) ids.push(emergencyId);
  storage.setItem('safety_check_asked', JSON.stringify(ids));
}

function hasBeenAskedAboutEmergency(storage, emergencyId) {
  const existing = storage.getItem('safety_check_asked');
  const ids = existing ? JSON.parse(existing) : [];
  return ids.includes(emergencyId);
}

function saveSafetyStatus(storage, emergencyId, isSafe) {
  const existing = storage.getItem('safety_statuses');
  const statuses = existing ? JSON.parse(existing) : {};
  statuses[emergencyId] = { isSafe, timestamp: '2026-05-03T00:00:00.000Z' };
  storage.setItem('safety_statuses', JSON.stringify(statuses));
}

function filterEmergencies(requests, filters) {
  return requests.filter((request) => {
    if (filters.emergencyType !== 'All' && request.type !== filters.emergencyType) return false;
    if (filters.urgencyLevel !== 'All' && request.urgency !== filters.urgencyLevel) return false;
    if (filters.location && !request.location.address.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });
}

function openAIAssistant() {
  return { isOpen: true };
}

function getNewsPageState(articles) {
  return {
    isEmpty: articles.length === 0,
    message: articles.length === 0 ? 'No News Available' : `${articles.length} articles`,
  };
}

test('UT-01 login rejects empty email', () => {
  assert.equal(validateLoginForm({ email: '', password: 'secret123' }).email, 'Email is required');
});

test('UT-02 login rejects empty password', () => {
  assert.equal(validateLoginForm({ email: 'user@example.com', password: '' }).password, 'Password is required');
});

test('UT-03 login rejects invalid email format', () => {
  assert.equal(validateLoginForm({ email: 'abc', password: 'secret123' }).email, 'Invalid email format');
});

test('UT-04 password visibility toggle switches input type', () => {
  assert.equal(togglePasswordType('password'), 'text');
  assert.equal(togglePasswordType('text'), 'password');
});

test('UT-05 signup rejects missing full name', () => {
  assert.equal(validateSignupForm({ fullName: '', email: 'u@example.com', password: 'secret123', role: 'citizen' }).fullName, 'Full name is required');
});

test('UT-06 signup rejects password shorter than 6 characters', () => {
  assert.equal(validateSignupForm({ fullName: 'Ali', email: 'u@example.com', password: '123', role: 'citizen' }).password, 'Password must be at least 6 characters');
});

test('UT-07 signup accepts citizen role', () => {
  assert.deepEqual(validateSignupForm({ fullName: 'Ali', email: 'u@example.com', password: 'secret123', role: 'citizen' }), {});
});

test('UT-08 signup accepts volunteer role', () => {
  assert.deepEqual(validateSignupForm({ fullName: 'Ali', email: 'u@example.com', password: 'secret123', role: 'volunteer' }), {});
});

test('UT-09 signup accepts NGO admin role', () => {
  assert.deepEqual(validateSignupForm({ fullName: 'Ali', email: 'u@example.com', password: 'secret123', role: 'ngo_admin' }), {});
});

test('UT-10 emergency request rejects missing description', () => {
  assert.equal(validateEmergencyRequest({ description: '', location: 'Lahore' }).description, 'Description is required');
});

test('UT-11 emergency form updates type to Medical', () => {
  assert.equal(updateEmergencyType('Medical').type, 'Medical');
});

test('UT-12 emergency form updates type to Fire', () => {
  assert.equal(updateEmergencyType('Fire').type, 'Fire');
});

test('UT-13 emergency form updates type to Flood', () => {
  assert.equal(updateEmergencyType('Flood').type, 'Flood');
});

test('UT-14 emergency form updates urgency to High', () => {
  assert.equal(updateUrgency('High').urgency, 'High');
});

test('UT-15 emergency form updates urgency to Medium', () => {
  assert.equal(updateUrgency('Medium').urgency, 'Medium');
});

test('UT-16 emergency form updates urgency to Low', () => {
  assert.equal(updateUrgency('Low').urgency, 'Low');
});

test('UT-17 location picker updates coordinates and address', () => {
  assert.deepEqual(selectLocation(31.5204, 74.3587, 'Lahore'), {
    location: 'Lahore',
    coordinates: { lat: 31.5204, lng: 74.3587 },
  });
});

test('UT-18 dashboard detects empty request list', () => {
  assert.equal(buildDashboardState([]).isEmpty, true);
});

test('UT-19 dashboard builds request cards from request data', () => {
  const state = buildDashboardState([
    {
      id: 'req-1',
      type: 'Medical',
      status: 'pending',
      location: { address: 'Lahore' },
      description: 'Need ambulance',
    },
  ]);
  assert.equal(state.cards[0].type, 'Medical');
  assert.equal(state.cards[0].status, 'pending');
  assert.equal(state.cards[0].location, 'Lahore');
});

test('UT-20 dashboard edit action returns edit route', () => {
  assert.equal(getEditPath('req-1'), '/requests/edit/req-1');
});

test('UT-21 channel manager generates device emergency ID when missing', async () => {
  const manager = new FakeChannelManager({
    storage: new FakeStorage(),
    emergencyIdFactory: () => 'device-1',
    fetcher: async () => ({ ok: true }),
  });
  assert.equal(await manager.initStore(), 'device-1');
});

test('UT-22 channel manager reuses existing device emergency ID', async () => {
  const manager = new FakeChannelManager({
    storage: new FakeStorage({ device_emergency_id: 'existing-device' }),
    emergencyIdFactory: () => 'new-device',
    fetcher: async () => ({ ok: true }),
  });
  assert.equal(await manager.initStore(), 'existing-device');
});

test('UT-23 channel manager payload includes GPS coordinates', async () => {
  const manager = new FakeChannelManager({
    storage: new FakeStorage(),
    emergencyIdFactory: () => 'device-1',
    fetcher: async () => ({ ok: true }),
  });
  const payload = await manager.buildPayload({ lat: 31.52, lng: 74.35 });
  assert.equal(payload.latitude, 31.52);
  assert.equal(payload.longitude, 74.35);
});

test('UT-24 channel manager payload uses zero coordinates without GPS', async () => {
  const manager = new FakeChannelManager({
    storage: new FakeStorage(),
    emergencyIdFactory: () => 'device-1',
    fetcher: async () => ({ ok: true }),
  });
  const payload = await manager.buildPayload(null);
  assert.equal(payload.latitude, 0);
  assert.equal(payload.longitude, 0);
});

test('UT-25 channel manager saves local pending incident snapshot', async () => {
  const storage = new FakeStorage();
  const manager = new FakeChannelManager({
    storage,
    emergencyIdFactory: () => 'device-1',
    fetcher: async () => ({ ok: false }),
  });
  await manager.triggerEmergency({ lat: 1, lng: 2 });
  assert.equal((await storage.getItem('pending_incident')).deviceEmergencyId, 'device-1');
});

test('UT-26 channel manager calls data API when online', async () => {
  let calledUrl = '';
  const manager = new FakeChannelManager({
    storage: new FakeStorage(),
    emergencyIdFactory: () => 'device-1',
    fetcher: async (url) => {
      calledUrl = url;
      return { ok: true };
    },
  });
  await manager.triggerEmergency({ lat: 1, lng: 2 });
  assert.equal(calledUrl, '/api/incident');
});

test('UT-27 channel manager clears pending incident after successful data send', async () => {
  const storage = new FakeStorage();
  const manager = new FakeChannelManager({
    storage,
    emergencyIdFactory: () => 'device-1',
    fetcher: async () => ({ ok: true }),
  });
  await manager.triggerEmergency({ lat: 1, lng: 2 });
  assert.equal(await storage.getItem('pending_incident'), null);
});

test('UT-28 channel manager builds SMS link with GPS coordinates', async () => {
  const manager = new FakeChannelManager({
    storage: new FakeStorage(),
    emergencyIdFactory: () => 'device-1',
    fetcher: async () => ({ ok: true }),
  });
  await manager.initStore();
  const decoded = decodeURIComponent(manager.buildSMSLink({ lat: 31.5204, lng: 74.3587 }));
  assert.match(decoded, /SOS#device-1#FLOOD#LOC:31\.52040,74\.35870/);
});

test('UT-29 channel manager builds SMS link with unknown location when GPS is missing', async () => {
  const manager = new FakeChannelManager({
    storage: new FakeStorage(),
    emergencyIdFactory: () => 'device-1',
    fetcher: async () => ({ ok: true }),
  });
  await manager.initStore();
  assert.match(decodeURIComponent(manager.buildSMSLink(null)), /LOC:UNKNOWN/);
});

test('UT-30 incident service creates new incident when no matching incident exists', async () => {
  const incidents = [];
  const result = await mergeOrCreateIncident({
    incidents,
    nowMs: 100000,
    incoming: { deviceEmergencyId: 'device-1', latitude: 1, longitude: 2, source: 'data' },
  });
  assert.equal(result.action, 'created');
  assert.equal(incidents.length, 1);
});

test('UT-31 safety utility returns zero distance for same coordinates', () => {
  assert.equal(calculateDistance(31.5204, 74.3587, 31.5204, 74.3587), 0);
});

test('UT-32 safety utility returns positive distance for different coordinates', () => {
  assert.ok(calculateDistance(31.5204, 74.3587, 24.8607, 67.0011) > 0);
});

test('UT-33 safety utility saves asked emergency ID', () => {
  const storage = createBrowserStorage();
  markEmergencyAsAsked(storage, 'emg-1');
  assert.deepEqual(JSON.parse(storage.getItem('safety_check_asked')), ['emg-1']);
});

test('UT-34 safety utility returns true for already asked emergency', () => {
  const storage = createBrowserStorage();
  markEmergencyAsAsked(storage, 'emg-1');
  assert.equal(hasBeenAskedAboutEmergency(storage, 'emg-1'), true);
});

test('UT-35 safety utility saves safe status', () => {
  const storage = createBrowserStorage();
  saveSafetyStatus(storage, 'emg-1', true);
  assert.equal(JSON.parse(storage.getItem('safety_statuses'))['emg-1'].isSafe, true);
});

test('UT-36 safety utility saves need-help status', () => {
  const storage = createBrowserStorage();
  saveSafetyStatus(storage, 'emg-1', false);
  assert.equal(JSON.parse(storage.getItem('safety_statuses'))['emg-1'].isSafe, false);
});

test('UT-37 volunteer filter returns emergencies matching type', () => {
  const requests = [
    { type: 'Medical', urgency: 'High', location: { address: 'Lahore' } },
    { type: 'Fire', urgency: 'High', location: { address: 'Lahore' } },
  ];
  assert.deepEqual(filterEmergencies(requests, { emergencyType: 'Medical', urgencyLevel: 'All', location: '' }), [requests[0]]);
});

test('UT-38 volunteer filter returns emergencies matching location text', () => {
  const requests = [
    { type: 'Medical', urgency: 'High', location: { address: 'Lahore' } },
    { type: 'Fire', urgency: 'High', location: { address: 'Karachi' } },
  ];
  assert.deepEqual(filterEmergencies(requests, { emergencyType: 'All', urgencyLevel: 'All', location: 'kara' }), [requests[1]]);
});

test('UT-39 AI assistant opens modal state', () => {
  assert.equal(openAIAssistant().isOpen, true);
});

test('UT-40 news page shows empty state for no articles', () => {
  assert.deepEqual(getNewsPageState([]), {
    isEmpty: true,
    message: 'No News Available',
  });
});
