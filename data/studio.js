export const studio = {
  name: 'NORTHSTAR INK',
  eyebrow: 'Tattoo studio · visual arts · New York',
  location: '148 Orchard Street, New York, NY 10002',
  hours: 'Tue—Sat · 11:00—19:00',
  phone: '+1 212 555 0194',
  email: 'hello@northstar.ink',
  intro: 'A considered tattoo practice for people who want their story to live in the details.',
  about: 'Northstar is a private tattoo studio and visual arts space where custom ink, painting, and printmaking share the same table. Every piece begins with a conversation, a point of view, and the patience to get the line right.',
  services: [
    { title: 'Custom tattooing', detail: 'One-off compositions built around your body, your reference points, and your story.', tags: 'bespoke · all scales' },
    { title: 'Fine line & micro realism', detail: 'Quiet marks, intricate shading, and detail that rewards a closer look.', tags: 'fine line · detail' },
    { title: 'Blackwork & ornamental', detail: 'Graphic contrast, geometry, and bold pieces designed to hold their presence.', tags: 'blackwork · ornamental' },
    { title: 'Cover-ups & reworks', detail: 'Thoughtful redesigns that turn old ink into something you are proud to keep.', tags: 'rework · consultation' },
  ],
  artists: [
    { name: 'Mara Vela', role: 'Fine line · botanical · script', image: 'assets/seidu/instagram-1-C6zisb9o6lG.jpg' },
    { name: 'Ren Okada', role: 'Blackwork · irezumi · large scale', image: 'assets/seidu/instagram-2-DdCuf7WoTin.jpg' },
    { name: 'Sage Lacroix', role: 'Traditional · flash · bold line', image: 'assets/seidu/instagram-3-Dc9ZtlTiIJz.jpg' },
    { name: 'Noor Idowu', role: 'Geometric · dotwork · ornamental', image: 'assets/seidu/instagram-4-DcyU1S8IT72.jpg' },
  ],
  work: [
    { title: 'Night Garden', meta: 'Mara Vela · healed 4 months', image: 'assets/seidu/instagram-5-DcaGgjtiIhT.jpg' },
    { title: 'The Long Way Home', meta: 'Ren Okada · healed 7 months', image: 'assets/tattoo-process.jpg' },
    { title: 'Fever Dream', meta: 'Sage Lacroix · custom composition', image: 'assets/seidu/instagram-1-C6zisb9o6lG.jpg' },
    { title: 'Small Hours', meta: 'Noor Idowu · ornamental study', image: 'assets/seidu/instagram-2-DdCuf7WoTin.jpg' },
  ],
  testimonials: [
    { quote: 'They translated a loose idea into something that feels like it always belonged to me.', name: 'Mina K.', note: 'Custom tattoo client' },
    { quote: 'The studio is calm, exacting, and genuinely warm. The work speaks for itself.', name: 'Jordan L.', note: 'Fine line client' },
    { quote: 'From first email to healed photo, every detail was handled with care.', name: 'Alex R.', note: 'Rework client' },
  ],
  faq: [
    ['How do I book?', 'Send a short note through the booking form with your idea, placement, approximate size, and reference images. We reply within 48 hours.'],
    ['Do you take walk-ins?', 'We are appointment-led. A limited flash window opens every Saturday when noted in our booking calendar.'],
    ['Can I bring my own design?', 'Yes. We love working from your references, then refining scale, placement, and line quality with you.'],
    ['What about aftercare?', 'Every session includes a printed aftercare guide and a follow-up check-in. Your artist will tailor it to the piece.'],
  ]
};

export const variants = {
  v1: { label: 'Obsidian Editorial', note: 'Dark, typographic, image-led', accent: '#e5ff4a' },
  v2: { label: 'Gallery White', note: 'Bright, spacious, art-forward', accent: '#e95d3f' },
  v3: { label: 'Rust & Ritual', note: 'Warm, tactile, story-driven', accent: '#e6b28c' },
  v4: { label: 'Ink Index', note: 'Monochrome, precise, archive-like', accent: '#b9c7ff' },
  v5: { label: 'Electric Flash', note: 'High-contrast, kinetic, bold', accent: '#ff69a8' },
};

export const nav = [
  { label: 'Home', href: '#home', children: Object.entries(variants).map(([id, item]) => ({ id, label: item.label })) },
  { label: 'Work', href: '#work' },
  { label: 'Artists', href: '#artists' },
  { label: 'Process', href: '#process' },
  { label: 'Studio', href: '#studio' },
  { label: 'Book', href: '#book' },
];

export const variantMeta = variants;

export function getVariant(id) { return variants[id] ? id : 'v1'; }

export function initData() { return { studio, variants, nav }; }

if (typeof window !== 'undefined') window.NorthstarData = { studio, variants, nav, variantMeta, getVariant, initData };

export default studio;

// Shared foundation contract: variants own presentation; data owns the business.
// Add a future variant under variants/<id> without duplicating pages or content.
