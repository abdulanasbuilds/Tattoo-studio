import { supabase, supabaseConfigured } from "./supabase.js";

const $ = (id) => document.getElementById(id);
let studio = null;
let membership = null;
let bookings = [];

const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));

function parseLineObjects(value, keys) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split("|").map((x) => x.trim());
    const item = {};
    keys.forEach((key, index) => item[key] = parts[index] || "");
    return item;
  });
}

function loadSettings() {
  const content = studio.content || {};
  $("studio-title").textContent = studio.name;
  $("s-name").value = studio.name || "";
  $("s-slug").value = studio.slug || "";
  $("s-location").value = studio.location || "";
  $("s-timezone").value = studio.timezone || "";
  $("s-email").value = studio.email || "";
  $("s-phone").value = studio.phone || "";
  $("s-instagram").value = studio.instagram || "";
  $("s-tiktok").value = studio.tiktok || "";
  $("s-theme").value = studio.theme || "v1";
  $("s-booking-mode").value = studio.booking_mode || "request";
  $("s-booking-url").value = studio.booking_url || "";
  $("s-deposit-url").value = studio.deposit_url || "";
  $("c-tagline").value = studio.tagline || "";
  $("c-about").value = content.about || "";
  $("c-services").value = (content.services || []).map((x) => [x.title, x.detail].filter(Boolean).join(" | ")).join("\n");
  $("c-artists").value = (content.artists || []).map((x) => [x.name, x.role, x.image].filter(Boolean).join(" | ")).join("\n");
  $("c-portfolio").value = (content.portfolio || []).map((x) => [x.title, x.detail, x.image].filter(Boolean).join(" | ")).join("\n");
}

function renderBookings() {
  $("pending-count").textContent = String(bookings.filter((b) => b.status === "pending").length);
  $("approved-count").textContent = String(bookings.filter((b) => b.status === "approved").length);
  $("all-count").textContent = String(bookings.length);

  $("booking-rows").innerHTML = bookings.length ? bookings.map((b) =>
    '<tr>' +
      '<td><strong>' + esc(b.customer_name) + '</strong><br><span class="muted">' + esc(b.customer_email) + '</span><br>' + esc(b.customer_phone || "") + '</td>' +
      '<td>' + esc(b.idea) + '<br><span class="muted">' + esc(b.preferred_artist || "Any artist") + '</span></td>' +
      '<td>' + esc(b.preferred_dates || "Flexible") + '</td>' +
      '<td><span class="status">' + esc(b.status) + '</span></td>' +
      '<td><div class="row-actions"><button class="btn small" data-action="approve" data-id="' + b.id + '">Approve</button><button class="btn small" data-action="decline" data-id="' + b.id + '">Decline</button><a class="btn small" href="mailto:' + encodeURIComponent(b.customer_email) + '?subject=Your tattoo booking request">Email</a>' + (b.customer_phone ? '<a class="btn small" href="tel:' + encodeURIComponent(b.customer_phone) + '">Call</a>' : '') + '</div></td>' +
    '</tr>'
  ).join("") : '<tr><td colspan="5" class="muted">No booking requests yet.</td></tr>';

  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => updateBooking(button.dataset.id, button.dataset.action === "approve" ? "approved" : "declined")));
}

async function loadBookings() {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("studio_id", membership.studio_id)
    .order("created_at", { ascending: false });

  if (error) {
    $("booking-rows").innerHTML = '<tr><td colspan="5">' + esc(error.message) + '</td></tr>';
    return;
  }

  bookings = data || [];
  renderBookings();
}

async function updateBooking(id, status) {
  const { error } = await supabase
    .from("booking_requests")
    .update({ status })
    .eq("id", id)
    .eq("studio_id", membership.studio_id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadBookings();
}

async function saveSettings(event) {
  event.preventDefault();

  const content = {
    ...(studio.content || {}),
    intro: $("c-tagline").value.trim(),
    about: $("c-about").value.trim(),
    services: parseLineObjects($("c-services").value, ["title", "detail"]),
    artists: parseLineObjects($("c-artists").value, ["name", "role", "image"]),
    portfolio: parseLineObjects($("c-portfolio").value, ["title", "detail", "image"])
  };

  const patch = {
    name: $("s-name").value.trim(),
    location: $("s-location").value.trim(),
    timezone: $("s-timezone").value.trim(),
    email: $("s-email").value.trim(),
    phone: $("s-phone").value.trim(),
    instagram: $("s-instagram").value.trim(),
    tiktok: $("s-tiktok").value.trim(),
    theme: $("s-theme").value,
    booking_mode: $("s-booking-mode").value,
    booking_url: $("s-booking-url").value.trim() || null,
    deposit_url: $("s-deposit-url").value.trim() || null,
    tagline: $("c-tagline").value.trim(),
    content
  };

  $("settings-message").textContent = "Saving…";

  const result = await supabase
    .from("studios")
    .update(patch)
    .eq("id", studio.id);

  if (result.error) {
    $("settings-message").textContent = result.error.message;
    return;
  }

  studio = { ...studio, ...patch };
  loadSettings();
  $("settings-message").textContent = "Saved.";
}

async function boot() {
  if (!supabaseConfigured || !supabase) {
    $("login-message").textContent = "Configure app/config.js first.";
    return;
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    $("login-view").classList.remove("hidden");
    $("app-view").classList.add("hidden");
    return;
  }

  const membershipResult = await supabase
    .from("studio_users")
    .select("*")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (membershipResult.error || !membershipResult.data) {
    $("login-view").classList.remove("hidden");
    $("app-view").classList.add("hidden");
    $("login-message").textContent = "This account is not assigned to a studio yet. Add it to public.studio_users in the Supabase SQL Editor.";
    return;
  }

  membership = membershipResult.data;

  const studioResult = await supabase
    .from("studios")
    .select("*")
    .eq("id", membership.studio_id)
    .single();

  if (studioResult.error) {
    $("login-message").textContent = studioResult.error.message;
    return;
  }

  studio = studioResult.data;
  $("login-view").classList.add("hidden");
  $("app-view").classList.remove("hidden");
  loadSettings();
  await loadBookings();
}

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("login-message").textContent = "Signing in…";

  const { error } = await supabase.auth.signInWithPassword({
    email: $("login-email").value.trim(),
    password: $("login-password").value
  });

  if (error) {
    $("login-message").textContent = error.message;
    return;
  }

  await boot();
});

$("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

$("refresh").addEventListener("click", loadBookings);
$("settings-form").addEventListener("submit", saveSettings);
boot();