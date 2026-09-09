const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu');

if (menu && header) {
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.prepend(progress);

const updateScrollState = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.setProperty('--progress', `${percent}%`);
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
};
window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

const revealTargets = document.querySelectorAll(
  'main > section, .work-card, .gallery-item, .service-row, .steps > div, .about-copy > *, .contact-info > div'
);
revealTargets.forEach((element, index) => {
  element.classList.add('reveal');
  element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((element) => observer.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.art-panel, .mock-img').forEach((panel) => {
    panel.addEventListener('pointermove', (event) => {
      const rect = panel.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      panel.style.setProperty('--pointer-x', `${x * 1.4}deg`);
      panel.style.setProperty('--pointer-y', `${y * -1.4}deg`);
    });
    panel.addEventListener('pointerleave', () => {
      panel.style.setProperty('--pointer-x', '0deg');
      panel.style.setProperty('--pointer-y', '0deg');
    });
  });
}

const filters = document.querySelectorAll('.filter');
const items = document.querySelectorAll('.gallery-item');
filters.forEach((button) => button.addEventListener('click', () => {
  filters.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  items.forEach((item) => {
    const visible = filter === 'all' || item.dataset.cat === filter;
    item.hidden = !visible;
    if (visible) requestAnimationFrame(() => item.classList.add('is-visible'));
  });
}));

const lightbox = document.querySelector('#lightbox');
if (lightbox) {
  const title = document.querySelector('#lb-title');
  const desc = document.querySelector('#lb-desc');
  const art = document.querySelector('#lightbox-art');
  const close = lightbox.querySelector('.close');
  const closeLightbox = () => {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
  };
  document.querySelectorAll('.gallery-item').forEach((item) => item.addEventListener('click', () => {
    art.innerHTML = item.querySelector('.mock-img').outerHTML;
    title.textContent = item.dataset.title;
    desc.textContent = item.dataset.desc;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    close?.focus();
  }));
  close?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
}

const form = document.querySelector('#projectForm');
if (form) {
  const params = new URLSearchParams(location.search);
  const serviceSelect = form.querySelector('[name="service"]');
  const map = { tattoo: 'Tattoo / Custom Tattoo', painting: 'Canvas Painting', pencil: 'Pencil Artwork' };
  const serviceParam = params.get('service');
  if (serviceParam && serviceSelect) serviceSelect.value = map[serviceParam] || '';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '');
    const message = [
      "Hi Seidu, I'd like to discuss a project.", '',
      `Name: ${value('name')}`,
      `WhatsApp: ${value('phone')}`,
      `Service: ${value('service')}`, '',
      `Brief:\n${value('brief')}`,
      value('reference') ? `\nReference: ${value('reference')}` : ''
    ].join('\n');
    const status = document.querySelector('#formMessage');
    if (status) status.textContent = 'Opening WhatsApp with your project brief…';
    window.open(`https://wa.me/233257231812?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
}
