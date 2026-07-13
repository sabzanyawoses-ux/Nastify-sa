# Nastify SA

Room bookings & listings for South Africa — black/gold design, live Supabase
database (shared between web and installed PWA), WhatsApp/email contact per
listing, and PayFast checkout for deposits.

## 1. Set up Supabase (database + accounts)

Your project is already created: `https://mnevdjhleeslwnedeyqb.supabase.co`

1. In the Supabase dashboard, go to **SQL Editor → New query**
2. Paste the contents of `supabase-schema.sql` and run it — this creates
   the `profiles`, `listings`, and `payments` tables with the right
   permissions.
3. Go to **Settings → API** and copy:
   - `Project URL` (already in `.env.example`)
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret,
     never expose it in client code — it's only used in the PayFast
     webhook route)

## 2. Set up PayFast

You mentioned you're still waiting on authorization — that's fine, the app
works right now against **PayFast's public sandbox** with no setup needed.
Once your merchant account is approved:

1. Get your **Merchant ID**, **Merchant Key**, and set a **Passphrase** in
   your PayFast dashboard (Settings → Integration)
2. Add them to your environment variables (see below)
3. Set `NEXT_PUBLIC_PAYFAST_SANDBOX=false` to go live

## 3. Environment variables

Copy `.env.example` to `.env.local` for local development, and add the same
variables in **Vercel → Project → Settings → Environment Variables** for
production.

## 4. Push to GitHub / deploy

Your Vercel project is already connected to
`github.com/sabzanyawoses-ux/Nastify-sa`. To go live:

1. Replace the contents of that repo with everything in this folder
   (or `git init`, add this as the remote, and force-push if the repo is
   otherwise empty)
2. Push to the `main` branch — Vercel will auto-build and deploy
3. Add the environment variables in Vercel before or right after the first
   deploy, then redeploy so they take effect

## 5. Local development

```bash
npm install
cp .env.example .env.local   # then fill in your real keys
npm run dev
```

Visit http://localhost:3000

## How data stays in sync everywhere

Every account, listing, and payment writes directly to your Supabase
database — there's no separate storage for the website vs. the installed
PWA. Whether someone signs up on desktop Chrome or the installed home-screen
app on their phone, they're hitting the same Supabase project, so their
account, saved listings, and booking history are identical on both.

## What still needs real data

- Listings shown on the homepage/browse page fall back to sample rooms
  until real listings exist in Supabase — once landlords start publishing
  via "List Your Property", real data takes over automatically.
- Listing photos: the form currently accepts a photo URL. If you want
  direct photo uploads from a phone, that needs Supabase Storage wired in
  — say the word and I'll add it.
