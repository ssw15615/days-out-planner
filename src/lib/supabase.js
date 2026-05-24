const USERS_KEY = 'daysout_users';
const TRIPS_KEY = 'daysout_trips';
const SESSION_KEY = 'daysout_session';

function loadStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function dispatchAuthChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('daysout-auth-change'));
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeUsername(username) {
  return (username || '').trim().toLowerCase();
}

function getUsers() {
  return loadStorage(USERS_KEY, []);
}

function saveUsers(users) {
  saveStorage(USERS_KEY, users);
}

function getTripsStorage() {
  return loadStorage(TRIPS_KEY, []);
}

function saveTrips(trips) {
  saveStorage(TRIPS_KEY, trips);
}

function safeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export function getSession() {
  return loadStorage(SESSION_KEY, null);
}

export function onAuthStateChange(callback) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('daysout-auth-change', callback);
  return () => window.removeEventListener('daysout-auth-change', callback);
}

export async function signIn(username, password) {
  const normalized = normalizeUsername(username);
  const users = getUsers();
  const user = users.find(u => u.username === normalized);
  if (!user || user.password !== password) {
    throw new Error('Invalid username or password');
  }

  const session = { user: safeUser(user) };
  saveStorage(SESSION_KEY, session);
  dispatchAuthChange();
  return { data: { user: safeUser(user), session }, error: null };
}

export async function signUp(username, password, name) {
  const normalized = normalizeUsername(username);
  if (!normalized) throw new Error('Username is required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const users = getUsers();
  if (users.some(u => u.username === normalized)) {
    throw new Error('Username already exists');
  }

  const user = {
    id: generateId('user'),
    username: normalized,
    name: name.trim() || normalized,
    password,
    role: 'user',
    email: '',
    created_at: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);

  const session = { user: safeUser(user) };
  saveStorage(SESSION_KEY, session);
  dispatchAuthChange();
  return { data: { user: safeUser(user), session }, error: null };
}

export async function signOut() {
  saveStorage(SESSION_KEY, null);
  dispatchAuthChange();
}

export async function getProfile(userId) {
  const users = getUsers();
  return safeUser(users.find(u => u.id === userId) || null);
}

export async function getAllProfiles() {
  const users = getUsers();
  return users.map(safeUser).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function updateProfile(userId, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error('Profile not found');

  const user = users[index];
  users[index] = {
    ...user,
    ...updates,
    username: updates.username ? normalizeUsername(updates.username) : user.username,
    name: updates.name !== undefined ? updates.name : user.name,
    email: updates.email !== undefined ? updates.email : user.email,
    role: updates.role !== undefined ? updates.role : user.role,
  };
  saveUsers(users);
  return safeUser(users[index]);
}

export async function adminCreateUser(username, password, name, role) {
  const normalized = normalizeUsername(username);
  if (!normalized) throw new Error('Username is required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const users = getUsers();
  if (users.some(u => u.username === normalized)) {
    throw new Error('Username already exists');
  }

  const user = {
    id: generateId('user'),
    username: normalized,
    name: name.trim() || normalized,
    password,
    role: role || 'user',
    email: '',
    created_at: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return safeUser(user);
}

export async function deleteUser(userId) {
  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  saveUsers(users);

  let trips = getTripsStorage();
  trips = trips.filter(t => t.user_id !== userId);
  saveTrips(trips);
}

export async function getTrips(userId, isAdmin) {
  const trips = getTripsStorage();
  const users = getUsers();

  const filtered = isAdmin
    ? trips
    : trips.filter(t => t.user_id === userId);

  return filtered
    .slice()
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .map(t => {
      const result = { ...t };
      if (isAdmin) {
        const user = users.find(u => u.id === t.user_id);
        result.profiles = { name: user?.name || 'Unknown' };
      }
      return result;
    });
}

export async function createTrip(trip) {
  const trips = getTripsStorage();
  const item = {
    id: generateId('trip'),
    ...trip,
  };
  trips.push(item);
  saveTrips(trips);
  return item;
}

export async function updateTrip(id, updates) {
  const trips = getTripsStorage();
  const index = trips.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trip not found');
  trips[index] = { ...trips[index], ...updates };
  saveTrips(trips);
  return trips[index];
}

export async function deleteTrip(id) {
  const trips = getTripsStorage().filter(t => t.id !== id);
  saveTrips(trips);
}
