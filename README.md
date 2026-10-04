# Tattoo Studio

Reusable production-ready tattoo studio website + booking MVP.

## Production entrypoints

- `index.html` → redirects to the production public site.
- `studio.html` → public studio website and booking request form.
- `admin.html` → staff portal.
- `gallery.html` → preserved visual reference gallery.
- `app/config.js` → deployment-specific Supabase URL, publishable key, and studio slug.
- `supabase/migrations/20261004090000_tattoo_booking_mvp.sql` → schema and RLS.
- `PRODUCTION_SYSTEM.md` → full implementation and deployment report.

## Product scope

The MVP is intentionally small:

- Public portfolio / artists / services
- Native request-to-book form
- External booking URL mode
- External deposit/payment URL
- Staff login
- Booking inbox
- Approve/decline
- Studio configuration
- Five visual themes

Payment processors, scheduling APIs, OAuth, calendar sync, email/SMS automation and file storage are deliberately not required for the first sale.

## Important

Do not use the Dabo Soccer Academy Supabase project for this product. Use a dedicated Supabase project per production environment.
