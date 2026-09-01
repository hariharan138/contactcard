// Sun Nutrition — digital contact card

const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Sun Nutrition;;;;',
  'FN:Sun Nutrition',
  'ORG:Sun Nutrition',
  'TITLE:Health & Wellness Awareness Camp',
  'TEL;TYPE=WORK,VOICE:+917010183611',
  'TEL;TYPE=WORK,VOICE:+919361271303',
  'ADR;TYPE=WORK:;;No 7 First Floor\\, Mandhai Karai\\, A. Kaspa\\, Auto Stand Opp.;Ambur;;635802;India',
  'NOTE:Health & Wellness Awareness Camp — nutrition coaching\\, weight management\\, lifestyle guidance and family wellness.',
  'URL:' + location.href,
  'END:VCARD',
].join('\r\n');

const toastEl = document.querySelector('[data-toast]');
let toastTimer;
const toast = msg => {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('on'), 2400);
};

// ── Save Contact → download .vcf ──────────────────
document.querySelectorAll('[data-save]').forEach(btn => btn.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([VCARD], { type: 'text/vcard;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'Sun-Nutrition.vcf' });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Contact saved to your downloads');
}));

// ── Share ─────────────────────────────────────────
document.querySelectorAll('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
  const data = { title: 'Sun Nutrition', text: 'Sun Nutrition — Health & Wellness Awareness Camp', url: location.href };
  try {
    if (navigator.share) return await navigator.share(data);
    await navigator.clipboard.writeText(location.href);
    toast('Link copied');
  } catch (e) {
    if (e.name !== 'AbortError') toast('Copy this link: ' + location.href);
  }
}));

// ── Button ripple ─────────────────────────────────
document.addEventListener('pointerdown', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const ink = document.createElement('span');
  ink.className = 'ripple';
  ink.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
  btn.append(ink);
  ink.addEventListener('animationend', () => ink.remove());
});

// ── Gallery: native scroll-snap for swipe, JS only for autoplay + dots ──
const car = document.querySelector('.carousel');
const dots = document.querySelector('[data-dots]');
if (car) {
  const slides = [...car.children];
  dots.innerHTML = slides.map(() => '<i></i>').join('');
  const pips = [...dots.children];

  const index = () => Math.round(car.scrollLeft / car.clientWidth);
  const paint = () => pips.forEach((p, i) => p.classList.toggle('on', i === index()));
  car.addEventListener('scroll', paint, { passive: true });
  paint();

  // ponytail: pause on any user interaction, never resume — a card is glanced at, not watched
  let timer = setInterval(() => {
    const next = (index() + 1) % slides.length;
    car.scrollTo({ left: next * car.clientWidth, behavior: 'smooth' });
  }, 3500);
  ['pointerdown', 'keydown', 'wheel'].forEach(ev =>
    car.addEventListener(ev, () => clearInterval(timer), { once: true, passive: true }));

  // keyboard support
  car.addEventListener('keydown', e => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!step) return;
    e.preventDefault();
    car.scrollTo({ left: (index() + step) * car.clientWidth, behavior: 'smooth' });
  });
}

// ── Image Zoom ───────────────────────────────────
const tamilImage = document.querySelector('.tamil-image img');
const zoomModal = document.getElementById('zoomModal');
const zoomedImage = document.getElementById('zoomedImage');

if (tamilImage && zoomModal && zoomedImage) {
  tamilImage.addEventListener('click', () => {
    zoomedImage.src = tamilImage.src;
    zoomModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  zoomModal.addEventListener('click', () => {
    zoomModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && zoomModal.classList.contains('active')) {
      zoomModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ── PWA ───────────────────────────────────────────
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
