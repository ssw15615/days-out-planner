import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── AUTH ──────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── PROFILES ──────────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Admin creates a user via Supabase Auth admin API (requires service role — done via edge function)
// For simplicity we use standard signUp and set role via profiles table
export async function adminCreateUser(email, password, name, role) {
  // Sign up the new user (they won't be auto-logged in because we're already logged in as admin)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });
  if (error) throw error;
  // Set role in profiles
  await supabase.from('profiles').update({ role }).eq('id', data.user.id);
  return data;
}

export async function deleteUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}

// ── TRIPS ─────────────────────────────────────────────────────────
export async function getTrips(userId, isAdmin) {
  let query = supabase.from('trips').select('*, profiles(name)').order('date', { ascending: true });
  if (!isAdmin) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createTrip(trip) {
  const { data, error } = await supabase.from('trips').insert([trip]).select().single();
  if (error) throw error;
  return data;
}

export async function updateTrip(id, updates) {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTrip(id) {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
}
