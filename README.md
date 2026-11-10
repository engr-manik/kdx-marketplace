# KDX – Khātunganj Digital DO Exchange
Starter publishing package (free-tier deployment path)

## What is included
- Next.js website frontend
- Supabase email/password authentication
- Trader registration (business profile, role, contact and document references)
- Public DO marketplace
- Verified-seller listing gate
- Buyer deal-request starter
- PostgreSQL schema and Row Level Security policies

## Important scope and safety limitations
This is a starter MVP, not a complete production DO exchange. It does NOT include:
- NID document image upload or automated NID verification
- Trade licence verification against government records
- Supplier/issuer portal or cryptographic DO validation
- Full negotiation, buyer/seller dual confirmation, transfer audit trail or completion workflow
- Payment escrow or payment processing
- A dedicated role-protected admin dashboard

The admin review in this starter is done manually in Supabase Table Editor. Do not accept a DO as genuine until its issuer confirms it independently. Do not collect full NID scans or sensitive identity data until you have a privacy policy, access controls, retention rules and a secure document-storage design.

## Prerequisites
- GitHub account: https://github.com
- Supabase account: https://supabase.com
- Vercel account: https://vercel.com
- Node.js 20.9 or newer on your computer

## Step 1 – Create the database
1. Create a Supabase project.
2. Save the Project URL and anon/public key from Project Settings → API.
3. Open SQL Editor → New query.
4. Copy and run all contents of `supabase/schema.sql`.
5. In Authentication → Providers, enable Email. For a quick test, configure email confirmation according to your testing needs. For public use, keep email confirmation enabled and configure SMTP.
6. In Authentication → URL Configuration, add your eventual Vercel URL to the allowed redirect/site URLs.

## Step 2 – Configure the website locally
1. Install Node.js 20.9+.
2. Extract this ZIP.
3. In the project folder, copy `.env.example` to `.env.local`.
4. Add your Supabase Project URL and anon/public key:
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
5. Open a terminal in the project folder and run:
   npm install
   npm run dev
6. Open http://localhost:3000.

## Step 3 – Push source code to GitHub
1. Create a new GitHub repository named `kdx-marketplace`.
2. Upload the extracted project files (including app, lib and supabase folders).
3. Do NOT upload `.env.local`, passwords, service-role keys, NID scans or private documents.
4. Commit the files to the main branch.

## Step 4 – Deploy on Vercel
1. Sign in at https://vercel.com using GitHub.
2. Select Add New → Project and import `kdx-marketplace`.
3. Framework should be detected as Next.js.
4. Add these Environment Variables in Vercel Project Settings → Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL = your Supabase Project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your Supabase anon/public key
5. Deploy. Vercel will provide a public `*.vercel.app` address.
6. Open the public URL and test registration, login and marketplace.

## Step 5 – Admin verification (starter workflow)
1. Register a test trader account on the website.
2. In Supabase → Table Editor → profiles, find the new profile.
3. Verify business documents independently outside the prototype.
4. Only then set `verification_status` to `verified`.
5. A verified seller/both account can publish listings. A verified buyer/both account can request a deal.
6. Never let a user self-approve. The starter policies intentionally do not permit profile users to edit their own verification status.

## Step 6 – Free launch checklist
- Test on desktop and mobile.
- Test buyer and seller accounts separately.
- Check that an unverified seller cannot publish.
- Check that an unverified buyer cannot request a deal.
- Confirm issuer and validity manually before any real-world deal.
- Publish privacy policy, terms of use, contact details and complaint process before public onboarding.
- Back up the database and review Supabase/Vercel free-tier limits.

## Troubleshooting
- `Invalid API key`: confirm you used the Supabase anon/public key, not a service-role key.
- `relation does not exist`: run `supabase/schema.sql` in the correct Supabase project.
- Registration appears stuck: check Supabase Authentication settings and email confirmation.
- Build fails: use Node.js 20.9+ and run `npm install` again.
- Listing insert denied: the account must be verified and have role `seller` or `both`.

## Free tier note
Free-tier terms, limits and availability can change. Check the current pricing pages before launch:
- https://vercel.com/pricing
- https://supabase.com/pricing

## Recommended next development milestone
Before handling genuine DO transactions, add a secure server-side admin role, issuer confirmation workflow, buyer/seller acceptance records, immutable transaction audit log, document storage with strict access control, and legal/privacy review.
