# Days Out Planner — Setup Guide

A complete step-by-step guide to get your app live on the internet for free.
**No experience needed — follow each step in order.**

---

## What you'll set up

| Service | What it does | Cost |
|---|---|---|
| **Supabase** | Database + user logins | Free |
| **GitHub** | Stores your code | Free |
| **Vercel** | Hosts your website | Free |

Total time: ~30–45 minutes

---

## PART 1 — Supabase (your database)

### Step 1.1 — Create a free account
1. Go to **https://supabase.com**
2. Click **Start your project** → sign up with GitHub or email
3. Once logged in, click **New project**
4. Fill in:
   - **Name:** `days-out-planner`
   - **Database Password:** choose a strong password (save it somewhere safe)
   - **Region:** `West Europe (Ireland)` — closest to the UK
5. Click **Create new project** — wait about 2 minutes for it to set up

---

### Step 1.2 — Create the database tables

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the entire block below and click **Run** (▶ button):

```sql
-- Profiles table (one row per user, auto-created on signup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Trips table
create table public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text,
  date date,
  time time,
  location text,
  lat double precision,
  lng double precision,
  price text,
  website text,
  ticket_url text,
  notes text,
  created_at timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

4. You should see **Success. No rows returned** — that means it worked ✅

---

### Step 1.3 — Set up Row Level Security (keeps data safe)

1. Still in **SQL Editor**, click **New query** again
2. Paste this block and click **Run**:

```sql
-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.trips enable row level security;

-- Profiles: users can read/update their own profile; admins can read all
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Trips: users manage their own; admins manage all
create policy "Users manage own trips"
  on trips for all using (auth.uid() = user_id);

create policy "Admins manage all trips"
  on trips for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
```

3. You should see **Success** again ✅

---

### Step 1.4 — Create your admin account

1. In the left sidebar, click **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email and a password → click **Create user**
4. Copy the **User UID** shown (it looks like: `a1b2c3d4-...`)
5. Go to **SQL Editor** → **New query**, paste this (replace the UID):

```sql
update public.profiles
set role = 'admin'
where id = 'PASTE-YOUR-UID-HERE';
```

6. Click **Run** — you're now an admin ✅

---

### Step 1.5 — Get your API keys

1. In the left sidebar, click **Settings** → **API**
2. Copy these two values — you'll need them in a moment:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (long string starting with `eyJ...`)

---

## PART 2 — GitHub (stores your code)

### Step 2.1 — Create a GitHub account
If you don't have one: go to **https://github.com** and sign up (free).

### Step 2.2 — Upload the project code

**Option A — GitHub Desktop (easiest for beginners)**
1. Download **GitHub Desktop** from https://desktop.github.com
2. Install and sign in to your GitHub account
3. Click **File** → **Add local repository**
4. Navigate to your `days-out-planner` folder → click **Add repository**
   - If it says "not a git repo", click **create a repository** instead
5. Click **Publish repository** → uncheck "Keep code private" if you want (doesn't matter) → **Publish**

**Option B — Command line**
```bash
cd days-out-planner
git init
git add .
git commit -m "Initial commit"
# Go to github.com, create a new repo called "days-out-planner"
# Then follow the "push existing repo" instructions shown on GitHub
```

---

## PART 3 — Add your secret keys

In your `days-out-planner` folder:

1. Find the file called `.env.example`
2. Make a copy of it and name the copy `.env.local`
3. Open `.env.local` in any text editor (Notepad is fine)
4. Replace the placeholder values with your real Supabase keys from Step 1.5:

```
REACT_APP_SUPABASE_URL=https://YOUR_REAL_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJyour_real_key_here...
```

5. Save the file

> ⚠️ **Important:** `.env.local` is in `.gitignore` so it will NOT be uploaded to GitHub — your keys stay private.

---

## PART 4 — Vercel (publishes your website)

### Step 4.1 — Create a free account
1. Go to **https://vercel.com**
2. Click **Sign Up** → **Continue with GitHub** (use the same GitHub account)

### Step 4.2 — Import your project
1. On the Vercel dashboard, click **Add New** → **Project**
2. Find `days-out-planner` in the list and click **Import**
3. Leave all settings as default — Vercel detects React automatically
4. **Before clicking Deploy**, click **Environment Variables**
5. Add two variables:

| Name | Value |
|---|---|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key |

6. Click **Deploy** 🚀

Wait about 2 minutes. When it says **Congratulations**, your app is live!

### Step 4.3 — Visit your app
Vercel gives you a URL like `https://days-out-planner-abc123.vercel.app`

Click it — your app is live on the internet! 🎉

---

## PART 5 — Final Supabase config

### Allow your Vercel URL in Supabase
1. Go back to **Supabase** → **Authentication** → **URL Configuration**
2. Under **Site URL**, enter your Vercel URL (e.g. `https://days-out-planner-abc123.vercel.app`)
3. Under **Redirect URLs**, add the same URL
4. Click **Save**

---

## You're done! 🎊

Your app is now live. Here's what you have:

- ✅ Secure login with real passwords (hashed by Supabase)
- ✅ Admin account to manage users
- ✅ Add/edit/delete trips with all details
- ✅ Interactive map showing all trips
- ✅ Google Calendar integration
- ✅ Data stored safely in a real database
- ✅ Free hosting on Vercel

---

## Making updates in the future

Whenever you change the code:
1. Save your changes
2. In GitHub Desktop: write a commit message → click **Commit** → **Push origin**
3. Vercel automatically detects the push and redeploys within 2 minutes

---

## Troubleshooting

**"Invalid API key" error**
→ Check your `.env.local` file has the correct keys with no extra spaces

**"relation does not exist" error**
→ Re-run the SQL from Step 1.2

**Page is blank after login**
→ Check the Supabase URL Configuration in Step 5

**Can't create users as admin**
→ Make sure you ran the admin SQL in Step 1.4

---

## Need a custom domain?

1. Buy a domain (e.g. from Namecheap ~£10/year)
2. In Vercel → your project → **Settings** → **Domains** → add your domain
3. Follow the DNS instructions Vercel provides

---

*Built with React + Supabase + Vercel + OpenStreetMap*
