# Tattoo Studio — Production MVP

## Purpose

This repo now contains a reusable tattoo-studio website + booking system, not only static visual references.

The application has three pieces:

1. Public studio site
2. Public booking-request flow
3. Staff admin portal

The system is configuration-first: a new client should mostly require studio details, images, links, and settings rather than new application code.

## Main flow

Instagram/TikTok → bio link → public studio → work/services → Book → booking request → Supabase → staff dashboard → approve/decline → contact client.

If the studio already uses another booking provider, choose the External booking mode and paste its booking URL. The branded public site remains yours while the existing provider remains the scheduling engine.

For payments, this MVP stores an external deposit/payment URL only. The artist owns the real payment account. No payment credentials are required.

## Implemented

### Public site
- Five visual themes: v1–v5
- Studio name, tagline, location and contacts
- Portfolio
- Artist roster
- Services
- Native request-to-book mode
- External booking mode
- Deposit/payment link
- Responsive layout
- Supabase-backed configuration

### Booking request
Captures:
- name
- email
- phone
- preferred artist
- tattoo idea
- preferred dates
- reference links

The form creates a pending row in booking_requests.

### Staff portal
- Supabase email/password login
- Studio membership authorization
- Pending / approved / all counters
- Booking inbox
- Approve / decline
- Email / phone shortcuts
- Studio settings editor
- Theme selector
- Booking mode selector
- External booking URL
- External deposit/payment URL
- Services, artists and portfolio configuration without code edits

### Security
- Browser uses only the Supabase publishable key.
- RLS is enabled on all exposed tables.
- Signed-in staff can only read/update data belonging to their assigned studio.
- Anonymous visitors can create booking requests but cannot read booking rows.
- Secret/service-role keys are not used in browser code.

## Deliberately not included

To keep this small and deployable, this release does not implement:
- Stripe API
- Paystack API
- automatic calendar synchronization
- live slot-generation engine
- OAuth integrations
- automatic SMS/email
- customer accounts
- file uploads
- automated deposit collection

Those should be added only when a paying client actually requires them.

## Deployment

1. Create a dedicated Supabase project for this product. Do not use the Dabo Soccer Academy project for tattoo clients.
2. Run the migration file in supabase/migrations.
3. Create a staff account in Supabase Authentication.
4. Run the one-time membership SQL from the bottom of the migration.
5. Edit app/config.js with the dedicated project's URL, publishable key and studio slug.
6. Open admin.html and configure the studio.
7. Deploy the repository on Cloudflare.
8. Point the client's domain at the deployment.

The same code can then serve the next client by changing the studio configuration and deployment values.

## Why this is the right first version

The commercial requirement is speed and low trust friction.

The artist keeps:
- Instagram/TikTok
- booking-provider account
- payment account

You provide:
- branded public site
- booking lead capture
- staff inbox
- simple management settings

That means you do not need a client's password or API key just to launch.

The system is intentionally designed around configuration instead of custom development. The target is roughly 90% configuration and 10% client-specific changes.

## Files

- index.html: production entrypoint
- studio.html: public studio page
- admin.html: staff portal
- production.css: public/admin styling foundation
- app/config.js: client deployment configuration
- app/supabase.js: Supabase browser client
- app/production.js: public website and booking flow
- app/admin.js: staff portal
- supabase/migrations/20261004090000_tattoo_booking_mvp.sql: database schema and RLS
