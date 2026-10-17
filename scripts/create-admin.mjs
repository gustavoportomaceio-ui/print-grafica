#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.argv[2];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.mjs');
  console.error('Or pass email and password as arguments: node scripts/create-admin.mjs email@example.com password');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function getUserByEmail(email) {
  // supabase-js v2 exposes an admin API. Try the admin lookup first, fall back to listUsers.
  try {
    if (supabaseAdmin.auth && (supabaseAdmin.auth).admin && typeof supabaseAdmin.auth.admin.getUserByEmail === 'function') {
      const res = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (res.error) throw res.error;
      return res.user ?? null;
    }
  } catch (e) {
    // continue to fallback
  }

  // Fallback: list users (may be paginated). We'll try to query users with filter.
  try {
    if (supabaseAdmin.auth && (supabaseAdmin.auth).admin && typeof supabaseAdmin.auth.admin.listUsers === 'function') {
      const res = await supabaseAdmin.auth.admin.listUsers({ email });
      if (res.error) throw res.error;
      return res.users && res.users.length ? res.users[0] : null;
    }
  } catch (e) {
    // continue to SQL fallback
  }

  // Final fallback: run SQL to find user id in auth.users (requires SQL function access)
  try {
    const sql = `SELECT id FROM auth.users WHERE email = '${email.replace(/'/g, "''")}' LIMIT 1`;
    const { data, error } = await supabaseAdmin.rpc('sql', { q: sql }).catch(() => ({ data: null, error: null }));
    if (error) throw error;
    if (data && data.length) return { id: data[0].id };
  } catch (e) {
    // give up
  }

  return null;
}

async function createUser(email, password) {
  try {
    if (supabaseAdmin.auth && (supabaseAdmin.auth).admin && typeof supabaseAdmin.auth.admin.createUser === 'function') {
      const res = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (res.error) throw res.error;
      return res.user ?? null;
    }
  } catch (e) {
    throw e;
  }

  // If admin.createUser isn't available, attempt to use the REST admin API via SQL (not recommended here)
  throw new Error('Unable to create user: admin API not available in this client.');
}

async function insertAdminRole(userId) {
  const row = { user_id: userId, role: 'admin' };
  // Try insert and ignore conflict
  const { error } = await supabaseAdmin.from('user_roles').insert(row).catch((e) => ({ error: e }));
  if (error) {
    // If it's a conflict error, ignore, else throw
    const msg = error?.message || String(error);
    if (/duplicate|unique|conflict/i.test(msg)) {
      return false; // already existed
    }
    throw error;
  }
  return true;
}

async function main() {
  console.log('Checking for existing user...');
  let user = await getUserByEmail(ADMIN_EMAIL);
  if (user) {
    console.log(`User already exists with id=${user.id}`);
  } else {
    console.log('User not found, creating user...');
    user = await createUser(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`Created user id=${user.id}`);
  }

  console.log('Granting admin role...');
  const inserted = await insertAdminRole(user.id);
  if (inserted) console.log('Admin role inserted.'); else console.log('Admin role already present.');
  console.log('Done. You can now log in at /admin with the provided credentials.');
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
