import { studio, variants, getVariant } from '../data/studio.js';
import { variantConfigs } from '../variants/config.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) => String(value).replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[char]));

let activeVariant = getVariant(new URLSearchParams(location.search).get('v') || localStorage.getItem('northstar-variant') || 'v1');

function renderHeader() {
  $('.site-header').innerHTML = `<a class="brand" href="#home" aria-label="Northstar Ink home"><span class="brand-mark">✳</span><span>NORTHSTAR<br>INK</span></a><nav class="main-nav" aria-label="Primary navigation"><div class="nav-home"><a href="#home">Home <span class="nav-caret">⌄</span></a><div class="variant-menu">${Object.entries(variants).map(([id, item]) => `<button class="variant-option" data-variant="${id}"><span>${id.toUpperCase()}</span>${esc(item.label)}</button>`).join('')}</div></div><a href="#work">Work</a><a href="#artists">Artists</a><a href="#process">Process</a><a href="#studio">Studio</a></nav><a class="nav-book" href="#book">Book a session <span>↗</span></a><button class="menu-toggle" aria-label="Toggle menu">Menu</button>`;
  $$('.variant-option').forEach((button) => button.addEventListener('click', () => switchVariant(button.dataset.variant)));
  $('.menu-toggle').addEventListener('click', () => document.body.classList.toggle('menu-open'));
}

function renderHome() {
  const cfg = variantConfigs[activeVariant];
  document.body.dataset.variant = activeVariant;
  document.documentElement.style.setProperty('--accent', variants[activeVariant].accent);
  $('.site-header').className = 'site-header';
  $('.hero').innerHTML = `<div class="hero-copy"><div class="kicker"><span class="kicker-line"></span>${esc(cfg.heroKicker)}</div><h1>${esc(cfg.heroTitle).replace('\n', '<br>')}</h1><p class="hero-text">${esc(cfg.heroText)}</p><div class="hero-actions"><a class="button button-fill" href="#book">${esc(cfg.cta)} <span>↗</span></a><a class="text-link" href="#work">See selected work <span>↓</span></a></div><div class="hero-index">0${Number(activeVariant.slice(1))} <span>/</span> 05</div></div><div class="hero-visual"><img src="${cfg.heroImage}" alt="Tattoo artwork at Northstar Ink"><div class="image-label"><span>${esc(cfg.heroLabel)}</span><span>Scroll to explore ↓</span></div><div class="hero-stamp">${activeVariant === 'v4' ? 'NS / ARCHIVE' : 'N★'}</div></div>`;
  $('.intro').innerHTML = `<div class="eyebrow">/ 01 — The practice</div><div class="intro-statement"><p>${esc(cfg.intro)}</p><a class="circle-link" href="#studio">About the studio <span>↗</span></a></div><div class="intro-meta"><span>New York · Since 2014</span><span>Custom / flash / visual arts</span></div>`;
  renderWork(); renderServices(); renderArtists(); renderProcess(); renderStudio(); renderBooking(); renderFooter();
  $('.variant-label').textContent = variants[activeVariant].label;
  attachInteractions();
}

function renderWork() {
  $('.work-section').innerHTML = `<div class="section-top" id="work"><div class="eyebrow">/ 02 — Selected work</div><a class="text-link" href="#book">Start your piece <span>↗</span></a></div><div class="work-heading"><h2>Healed work.<br><em>Real stories.</em></h2><p>Every piece is drawn for one person, then released into the world to become part of their story.</p></div><div class="work-grid">${studio.work.map((work, index) => `<article class="work-card work-${index + 1}"><div class="work-image"><img src="${work.image}" alt="${esc(work.title)} tattoo work"><span class="work-number">0${index + 1}</span></div><div class="work-caption"><strong>${esc(work.title)}</strong><span>${esc(work.meta)}</span></div></article>`).join('')}</div>`;
}

function renderServices() {
  $('.services-section').innerHTML = `<div class="section-top"><div class="eyebrow">/ 03 — What we do</div><span class="section-note">Choose your direction</span></div><div class="services-layout"><h2>Ink with<br><em>intention.</em></h2><div class="service-list">${studio.services.map((service, index) => `<article class="service-item"><span class="service-index">0${index + 1}</span><div><h3>${esc(service.title)}</h3><p>${esc(service.detail)}</p><small>${esc(service.tags)}</small></div><span class="service-arrow">↗</span></article>`).join('')}</div></div>`;
}

function renderArtists() {
  $('.artists-section').innerHTML = `<div class="section-top" id="artists"><div class="eyebrow">/ 04 — The residents</div><span class="section-note">Book by artist · replies in 48h</span></div><div class="artists-heading"><h2>Find your<br><em>artist.</em></h2><p>Different hands. One shared standard for craft, care, and a studio experience that feels like yours.</p></div><div class="artist-grid">${studio.artists.map((artist, index) => `<article class="artist-card"><div class="artist-photo"><img src="${artist.image}" alt="${esc(artist.name)} portrait or tattoo work"><span>0${index + 1}</span></div><div class="artist-info"><h3>${esc(artist.name)}</h3><p>${esc(artist.role)}</p><a href="#book">Book with ${esc(artist.name.split(' ')[0])} ↗</a></div></article>`).join('')}</div>`;
}

function renderProcess() {
  $('.process-section').innerHTML = `<div class="section-top" id="process"><div class="eyebrow">/ 05 — How it runs</div><span class="section-note">No surprises · just good work</span></div><div class="process-layout"><h2>From idea<br>to <em>ink.</em></h2><div class="process-list"><article><span>01</span><div><h3>Consult</h3><p>We talk placement, size, references, budget, and the feeling you want the piece to hold.</p></div><b>20 min</b></article><article><span>02</span><div><h3>Design</h3><p>Your artist translates the idea into a clear direction and a stencil you can approve on skin.</p></div><b>sketch first</b></article><article><span>03</span><div><h3>Ink</h3><p>We make the mark in a calm, considered session with time for every line to land correctly.</p></div><b>by session</b></article><article><span>04</span><div><h3>Heal</h3><p>Aftercare is part of the work. Leave with a guide, a check-in, and a piece built to last.</p></div><b>4 weeks</b></article></div></div>`;
}

function renderStudio() {
  $('.studio-section').innerHTML = `<div class="studio-image"><img src="assets/tattoo-process.jpg" alt="Artist working in the Northstar studio"><div class="studio-image-note">A working studio<br>for living art.</div></div><div class="studio-copy" id="studio"><div class="eyebrow">/ 06 — The studio</div><h2>More than<br>a <em>tattoo.</em></h2><p>${esc(studio.about)}</p><div class="studio-details"><div><span>Find us</span><strong>${esc(studio.location)}</strong></div><div><span>Open</span><strong>${esc(studio.hours)}</strong></div></div><a class="button button-outline" href="#book">Come say hello <span>↗</span></a></div>`;
}

function renderBooking() {
  $('.book-section').innerHTML = `<div class="booking-intro" id="book"><div class="eyebrow">/ 07 — Book in</div><h2>Ready when<br><em>you are.</em></h2><p>Tell us a little about what you are thinking. We’ll match you with the right artist and get back to you within 48 hours.</p><div class="booking-contact"><span>${esc(studio.email)}</span><span>${esc(studio.phone)}</span></div></div><form class="booking-form"><label>Name<input required name="name" placeholder="Your name"></label><label>Email<input required type="email" name="email" placeholder="you@example.com"></label><label>What are you thinking?<textarea required name="idea" placeholder="Placement, size, style, references..."></textarea></label><button class="button button-fill" type="submit">Send inquiry <span>↗</span></button><p class="form-message" role="status"></p></form>`;
}

function renderFooter() {
  $('.site-footer').innerHTML = `<div class="footer-top"><a class="brand" href="#home"><span class="brand-mark">✳</span><span>NORTHSTAR<br>INK</span></a><p>Custom tattooing, visual arts,<br>and a good reason to come back.</p><a class="footer-up" href="#home">Back to top ↑</a></div><div class="footer-bottom"><span>© 2026 Northstar Ink</span><span>New York, NY</span><div><a href="#studio">Instagram</a><a href="#studio">Aftercare</a><a href="#studio">Policies</a></div></div>`;
}

function switchVariant(id) {
  activeVariant = getVariant(id); localStorage.setItem('northstar-variant', activeVariant); history.replaceState(null, '', `${location.pathname}?v=${activeVariant}`); renderHome(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachInteractions() {
  $$('.faq-item').forEach((item) => item.addEventListener('click', () => item.classList.toggle('open')));
  const form = $('.booking-form');
  form?.addEventListener('submit', (event) => { event.preventDefault(); $('.form-message').textContent = 'Thanks — your note is in. We’ll be in touch within 48 hours.'; form.reset(); });
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: 0.12 });
  $$('.reveal').forEach((node) => observer.observe(node));
}

function boot() {
  renderHeader(); renderHome();
}

boot();
