import { supabase, supabaseConfigured, studioSlug } from "./supabase.js";

const app = document.getElementById("app");
const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));
const list = (value) => Array.isArray(value) ? value : [];

function applyTheme(studio) {
  const theme = ["v1","v2","v3","v4","v5"].includes(studio.theme) ? studio.theme : "v1";
  document.body.className = "theme-" + theme;
}

function safeUrl(value) {
  try {
    const url = new URL(value, location.href);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch (_) {}
  return "";
}

function render(studio) {
  const content = studio.content || {};
  const portfolio = list(content.portfolio);
  const artists = list(content.artists);
  const services = list(content.services);
  const heroImage = safeUrl(content.heroImage || (portfolio[0] && portfolio[0].image));
  applyTheme(studio);

  document.title = studio.name + " — Tattoo Studio";
  document.getElementById("brand").textContent = (studio.name || "Tattoo Studio").toUpperCase();

  const workHtml = portfolio.length
    ? portfolio.slice(0, 9).map((item) => {
        const image = safeUrl(item.image);
        return '<article class="portfolio">' +
          '<div class="portfolio-image">' + (image ? '<img src="' + esc(image) + '" alt="' + esc(item.title || "Tattoo work") + '" loading="lazy">' : "") + '</div>' +
          '<div class="portfolio-copy"><strong>' + esc(item.title || "Featured work") + '</strong><span>' + esc(item.detail || "") + '</span></div>' +
        '</article>';
      }).join("")
    : '<p class="muted">Portfolio will appear here after the studio adds work.</p>';

  const artistHtml = artists.length
    ? artists.slice(0, 6).map((item) => {
        const image = safeUrl(item.image);
        return '<article class="artist"><div class="artist-photo">' + (image ? '<img src="' + esc(image) + '" alt="' + esc(item.name || "Tattoo artist") + '" loading="lazy">' : "") + '</div><div class="artist-copy"><strong>' + esc(item.name || "Artist") + '</strong><br><span>' + esc(item.role || "") + '</span></div></article>';
      }).join("")
    : '<p class="muted">Artist information will appear here.</p>';

  const serviceHtml = services.length
    ? services.slice(0, 8).map((item) => '<article class="service"><h3>' + esc(item.title || "Service") + '</h3><p>' + esc(item.detail || "") + '</p></article>').join("")
    : '<p class="muted">Custom tattoo sessions available by enquiry.</p>';

  const bookingUrl = safeUrl(studio.booking_url || "");
  const depositUrl = safeUrl(studio.deposit_url || "");
  const externalButton = bookingUrl ? '<a class="btn" href="' + esc(bookingUrl) + '" target="_blank" rel="noopener noreferrer">Open booking system ↗</a>' : '<p class="muted">No external booking link configured yet.</p>';

  const bookingForm = studio.booking_mode === "external"
    ? externalButton
    : '<form class="form" id="booking-form">' +
        '<input class="honeypot" name="website" tabindex="-1" autocomplete="off">' +
        '<div class="field"><label>Name</label><input name="name" required maxlength="100"></div>' +
        '<div class="field"><label>Email</label><input name="email" type="email" required maxlength="180"></div>' +
        '<div class="field"><label>Phone / WhatsApp</label><input name="phone" maxlength="50"></div>' +
        '<div class="field"><label>Preferred artist</label><input name="artist" maxlength="100" placeholder="Anyone / not sure"></div>' +
        '<div class="field"><label>Tattoo idea</label><textarea name="idea" required maxlength="3000" placeholder="Style, placement, size, references, budget, and anything important…"></textarea></div>' +
        '<div class="field"><label>Preferred dates</label><input name="preferred_dates" maxlength="200" placeholder="e.g. Friday evening or 14–18 October"></div>' +
        '<div class="field"><label>Reference links</label><textarea name="reference_links" maxlength="1500" placeholder="Paste Instagram, Pinterest, Drive, or other reference links"></textarea></div>' +
        '<button class="btn" type="submit">Send booking request ↗</button>' +
        '<p class="message" id="booking-message"></p>' +
      '</form>';

  app.innerHTML =
    '<section class="hero" id="home"><div class="wrap hero-grid"><div><div class="eyebrow">' + esc(studio.location || "By appointment") + '</div><h1>' + esc(studio.name) + '</h1><p>' + esc(studio.tagline || content.intro || "Custom tattoos and considered studio work.") + '</p><div class="hero-actions">' +
      (studio.booking_mode === "external" ? externalButton : '<a class="btn" href="#book">Request a session ↗</a>') +
      '<a class="text-link" href="#work">View work ↓</a></div></div>' +
      (heroImage ? '<div class="hero-media"><img src="' + esc(heroImage) + '" alt="' + esc(studio.name) + '" fetchpriority="high"></div>' : '<div class="hero-media"></div>') +
    '</div></section>' +

    '<section id="work"><div class="wrap"><div class="section-head"><div><div class="label">Selected work</div><h2>Made to be kept.</h2></div><p>Custom pieces, healed work, and studio highlights.</p></div><div class="grid">' + workHtml + '</div></div></section>' +

    '<section id="artists"><div class="wrap"><div class="section-head"><div><div class="label">Artists</div><h2>Find your artist.</h2></div><p>Choose a style, then start with a conversation.</p></div><div class="artists">' + artistHtml + '</div></div></section>' +

    '<section id="services"><div class="wrap"><div class="section-head"><div><div class="label">Services</div><h2>What we do.</h2></div></div><div class="service-list">' + serviceHtml + '</div></div></section>' +

    '<section id="studio"><div class="wrap"><div class="section-head"><div><div class="label">Studio</div><h2>' + esc(studio.location || "By appointment") + '</h2></div><p>' + esc(content.about || "A focused studio for custom work.") + '</p></div><p class="label">' + esc(studio.email || "") + ' · ' + esc(studio.phone || "") + '</p></div></section>' +

    '<section id="book"><div class="wrap booking-layout"><div class="booking-copy"><div class="label">Book</div><h2>Ready when you are.</h2><p>Send the idea first. The studio can review it before confirming an appointment or deposit.</p>' +
      (depositUrl ? '<p><a class="text-link" href="' + esc(depositUrl) + '" target="_blank" rel="noopener noreferrer">Deposit / payment link ↗</a></p>' : '') +
    '</div><div>' + bookingForm + '</div></div></section>' +

    '<footer class="footer"><div class="wrap"><div class="footer-grid"><div><strong>' + esc(studio.name) + '</strong><p>' + esc(studio.location || "") + '<br>' + esc(studio.email || "") + '<br>' + esc(studio.phone || "") + '</p></div><div><p>Instagram<br>' + esc(studio.instagram || "Not configured") + '</p></div><div><p>Booking<br>' +
      (bookingUrl ? '<a href="' + esc(bookingUrl) + '" target="_blank" rel="noopener noreferrer">Open booking ↗</a>' : 'Request form online') +
    '</p></div></div></div></footer>';

  document.getElementById("booking-form")?.addEventListener("submit", submitBooking);
}

async function submitBooking(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById("booking-message");
  const values = Object.fromEntries(new FormData(form).entries());

  if (values.website) {
    form.reset();
    message.textContent = "Thanks — your request was received.";
    return;
  }

  if (!supabaseConfigured || !supabase) {
    message.textContent = "Booking is not connected yet. Please contact the studio directly.";
    return;
  }

  message.textContent = "Sending…";

  const studioResult = await supabase
    .from("studios")
    .select("id")
    .eq("slug", studioSlug)
    .eq("is_active", true)
    .single();

  if (studioResult.error) {
    message.textContent = "The studio is not configured correctly yet.";
    return;
  }

  const result = await supabase.from("booking_requests").insert({
    studio_id: studioResult.data.id,
    customer_name: values.name,
    customer_email: values.email,
    customer_phone: values.phone || null,
    preferred_artist: values.artist || null,
    idea: values.idea,
    preferred_dates: values.preferred_dates || null,
    reference_links: values.reference_links || null,
    status: "pending"
  });

  if (result.error) {
    message.textContent = "We could not send the request. Please try again or contact the studio directly.";
    return;
  }

  form.reset();
  message.textContent = "Request sent. The studio will review it and contact you.";
}

async function boot() {
  if (!supabaseConfigured || !supabase) {
    render({
      name: "YOUR STUDIO",
      tagline: "Production booking system ready to connect.",
      location: "Set app/config.js before client deployment",
      email: "",
      phone: "",
      theme: "v1",
      booking_mode: "request",
      content: {
        intro: "Connect a dedicated Supabase project, run the migration, then configure this site in admin.html.",
        about: "This build is the real application structure; the connection is simply not configured in this repository copy yet.",
        services: [],
        artists: [],
        portfolio: []
      }
    });
    return;
  }

  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .eq("slug", studioSlug)
    .eq("is_active", true)
    .single();

  if (error) {
    app.innerHTML = '<div class="wrap" style="padding:90px 24px"><h1>Studio not found</h1><p>Check STUDIO_SLUG in app/config.js and make sure the studio exists in Supabase.</p></div>';
    return;
  }

  render(data);
}

boot();