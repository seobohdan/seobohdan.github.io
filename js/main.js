/* THUMBSTOP — без зависимостей. Все эффекты на IntersectionObserver + один rAF на скролл. */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
let lang = 'ru';
const t = k => (window.I18N.msg[lang] || {})[k] || '';

/* ---------- i18n: русский исходник берём из разметки ---------- */
const RU = {}, RU_ARIA = {};
$$('[data-i18n]').forEach(el => { RU[el.dataset.i18n] = el.textContent.trim(); });
$$('[data-i18n-aria]').forEach(el => { RU_ARIA[el.dataset.i18nAria] = el.getAttribute('aria-label'); });

/* ---------- демо-сцены и медиа-слоты ---------- */
const SCENES = {
  orb: '<i class="halo"></i><i class="orb"></i><i class="shadow"></i>',
  bottle: '<i class="ped"></i><i class="bot"></i><i class="shine"></i><i class="spark"></i>',
  blob: '<i class="blob"></i><i class="blob2"></i>',
  tunnel: '<i></i><i></i><i></i><i></i>',
  splash: '<i class="can"></i><i class="drop"></i><i class="drop"></i><i class="drop"></i><i class="drop"></i>',
  grid: '<i class="floor"></i><i class="board"></i>',
  stripes: '<i class="band"></i><i class="band"></i><i class="band"></i>',
  ring: '<i class="torus"></i><i class="dot"></i>'
};
function buildClip(el) {
  if (el.dataset.built) return;
  el.dataset.built = '1';
  const s = SCENES[el.dataset.scene] ? el.dataset.scene : 'orb';
  el.classList.add('s-' + s);
  el.insertAdjacentHTML('afterbegin', SCENES[s]);
  if (el.dataset.video) {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('aria-hidden', 'true');
    if (el.dataset.poster) v.poster = el.dataset.poster;
    v.dataset.src = el.dataset.video;
    el.appendChild(v);
  }
}
// Видео грузится и играет только рядом с экраном; CSS-анимации сцен тоже на паузе вне экрана
const liveIO = new IntersectionObserver(es => es.forEach(e => {
  const el = e.target, v = el.querySelector('video');
  el.classList.toggle('is-live', e.isIntersecting && !RM);
  if (!v) return;
  if (e.isIntersecting) { if (!v.getAttribute('src')) v.src = v.dataset.src; if (!RM) v.play().catch(() => {}); }
  else v.pause();
}), { rootMargin: '150px 0px' });
const initClip = el => { buildClip(el); liveIO.observe(el); };

/* ---------- hero: лента клипов или фоновое видео ---------- */
const feed = $('[data-feed]');
const heroVideo = $('.hero__video');
if (heroVideo && heroVideo.dataset.src) {
  heroVideo.src = heroVideo.dataset.src; heroVideo.classList.add('is-on');
  if (!RM) heroVideo.play().catch(() => {});
} else if (feed) {
  const scenes = ['blob', 'bottle', 'tunnel', 'orb', 'splash', 'grid', 'ring', 'stripes'];
  const themes = ['pink', 'orange', 'violet', 'lime', 'blue'];
  const cols = innerWidth < 760 ? 3 : 4;
  for (let c = 0; c < cols; c++) {
    const col = document.createElement('div');
    col.className = 'feed__col';
    col.style.setProperty('--d', (36 + c * 8) + 's');
    let html = '';
    for (let i = 0; i < 4; i++) html += `<div class="clip" data-scene="${scenes[(c * 3 + i) % 8]}" data-theme="${themes[(c * 2 + i) % 5]}"></div>`;
    col.innerHTML = html + html; // дубль для бесшовного цикла
    feed.appendChild(col);
  }
  // «Thumb-stop»: наведение на ленту останавливает её
  feed.addEventListener('pointerenter', () => feed.classList.add('is-frozen'));
  feed.addEventListener('pointerleave', () => feed.classList.remove('is-frozen'));
}
$$('.clip').forEach(initClip);

/* ---------- разбивка заголовков на слова / буквы ---------- */
function split(el) {
  const mode = el.dataset.split;
  let i = 0;
  el.setAttribute('aria-label', $$('.line', el).map(l => l.textContent.trim()).join(' '));
  $$('.line', el).forEach(line => {
    line.setAttribute('aria-hidden', 'true');
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      if (mode === 'chars') {
        w.className = 'wc';
        [...word].forEach(ch => {
          const c = document.createElement('span');
          c.className = 'c'; c.textContent = ch; c.style.setProperty('--i', i++);
          w.appendChild(c);
        });
      } else {
        w.className = 'w';
        const s = document.createElement('span');
        s.textContent = word; s.style.setProperty('--i', i++);
        w.appendChild(s);
      }
      line.appendChild(w);
      if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });
}
$$('[data-split]').forEach(split);

/* ---------- reveal-наблюдатель ---------- */
const cal = $('.cal');
if (cal) for (let i = 0; i < 28; i++) cal.appendChild(document.createElement('i'));
$$('.cross li').forEach((li, i) => li.style.setProperty('--i', i));
function onIn(el) {
  if (el.querySelector('.cal')) $$('.cal i').forEach((c, i) => {
    if ([0, 2, 4].includes(i % 7)) setTimeout(() => c.classList.add('on'), RM ? 0 : 300 + i * 40);
  });
  $$('[data-count]', el).forEach(n => {
    const to = +n.dataset.count; let k = 1;
    if (RM || to <= 1) return;
    const step = () => { n.textContent = k; if (k++ < to) setTimeout(step, 220); };
    step();
  });
}
const revIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('is-in'); onIn(e.target); revIO.unobserve(e.target);
}), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
$$('.reveal, [data-split]').forEach(el => {
  if (el.id === 'hero-title') return;
  if (RM) { el.classList.add('is-in'); onIn(el); } else revIO.observe(el);
});

/* ---------- marquee: дублируем ленту, ускоряем при скролле ---------- */
const tapes = $$('[data-marquee]');
tapes.forEach(el => { const h = el.innerHTML; el.innerHTML = h + h + h + h; });
const tapeAnims = tapes.map(el => el.getAnimations ? el.getAnimations()[0] : null).filter(Boolean);

/* ---------- навигация, меню, плавающая CTA ---------- */
const nav = $('#nav'), burger = $('.burger'), menu = $('#menu');
function setMenu(open) {
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? (lang === 'ru' ? 'Закрыть меню' : 'Close menu') : (lang === 'ru' ? 'Открыть меню' : 'Open menu'));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) setTimeout(() => $('a', menu).focus(), 300);
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

const floatCta = $('.float-cta');
// Появляется после hero, прячется у формы и футера
const blockers = new Set();
const ctaIO = new IntersectionObserver(es => {
  es.forEach(e => e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target));
  const on = blockers.size === 0;
  floatCta.classList.toggle('is-on', on);
  floatCta.setAttribute('aria-hidden', String(!on));
  floatCta.tabIndex = on ? 0 : -1;
});
[$('.hero'), $('#contact'), $('.foot')].forEach(el => ctaIO.observe(el));

/* ---------- курсор, магнитные кнопки, 3D tilt (только мышь) ---------- */
if (FINE && !RM) {
  root.classList.add('has-cursor');
  const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate3d(${mx}px,${my}px,0)`; }, { passive: true });
  (function loop() { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); })();
  document.addEventListener('pointerover', e => {
    const lab = e.target.closest('[data-cursor]') ? t('view') : e.target.closest('.feed') ? t('stop') : '';
    label.textContent = lab;
    cur.classList.toggle('is-label', !!lab);
    cur.classList.toggle('is-hover', !lab && !!e.target.closest('a,button,label,input,textarea'));
  });
  root.addEventListener('mouseleave', () => { dot.style.transform = ring.style.transform = 'translate3d(-100px,-100px,0)'; mx = my = -100; });

  $$('.magnetic').forEach(el => {
    const k = el.classList.contains('mega') ? .12 : .3;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * k}px,${(e.clientY - r.top - r.height / 2) * k}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--ry', (x * 14) + 'deg'); el.style.setProperty('--rx', (-y * 12) + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/* ---------- аккордеон услуг ---------- */
const panes = $$('[data-acc] .pane');
function openPane(p) {
  panes.forEach(x => { const on = x === p; x.classList.toggle('is-open', on); $('.pane__tab', x).setAttribute('aria-expanded', String(on)); });
}
panes.forEach(p => {
  $('.pane__tab', p).addEventListener('click', () => openPane(p));
  if (FINE) p.addEventListener('pointerenter', () => openPane(p));
});

/* ---------- фильтр портфолио ---------- */
const works = $('.works');
$$('.chip').forEach(ch => ch.addEventListener('click', () => {
  const f = ch.dataset.filter;
  $$('.chip').forEach(c => { c.classList.toggle('is-on', c === ch); c.setAttribute('aria-pressed', String(c === ch)); });
  works.classList.toggle('is-filtered', f !== 'all');
  $$('.work', works).forEach(w => w.classList.toggle('is-out', f !== 'all' && w.dataset.cat !== f));
}));

/* ---------- полноэкранный просмотр ---------- */
const viewer = $('#viewer'), stage = $('.viewer__stage', viewer), cap = $('.viewer__cap', viewer);
let lastFocus = null;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-open-viewer]');
  if (!b) return;
  const src = b.dataset.scene ? b : $('.clip', b);
  const meta = b.closest('.work');
  stage.innerHTML = '';
  const c = document.createElement('div');
  c.className = 'clip';
  ['scene', 'theme', 'video', 'poster'].forEach(k => { if (src.dataset[k]) c.dataset[k] = src.dataset[k]; });
  stage.appendChild(c); buildClip(c); c.classList.toggle('is-live', !RM);
  const v = $('video', c);
  if (v) { v.src = v.dataset.src; v.controls = true; v.muted = false; v.play().catch(() => {}); }
  cap.textContent = meta ? `${$('.work__name', meta).textContent} — ${$('.work__cat', meta).textContent}` : 'Showreel';
  lastFocus = b;
  viewer.showModal();
});
viewer.addEventListener('close', () => { stage.innerHTML = ''; lastFocus && lastFocus.focus(); });
$('.viewer__close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });

/* ---------- предзаполнение формы из CTA ---------- */
const msg = $('#f-msg');
$$('[data-prefill]').forEach(a => a.addEventListener('click', () => {
  if (!msg.value.trim() || msg.dataset.auto === msg.value) { msg.value = t('prefill') + a.dataset.prefill; msg.dataset.auto = msg.value; }
}));

/* ---------- форма: валидация и отправка ---------- */
const form = $('#lead-form'), status = $('.form__status', form);
const RULES = {
  name: v => v.trim().length >= 2,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  link: v => !v.trim() || /^(@[\w.]{2,}|(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#]\S*)?)$/i.test(v.trim()),
  message: v => v.trim().length >= 10
};
const ERR = { name: 'name', email: 'email', link: 'link', message: 'msg' };
function check(input) {
  const ok = RULES[input.name](input.value);
  const field = input.closest('.field');
  field.classList.toggle('is-bad', !ok);
  input.setAttribute('aria-invalid', String(!ok));
  $('.field__err', field).textContent = ok ? '' : t(ERR[input.name]);
  return ok;
}
$$('input, textarea', form).forEach(i => {
  i.addEventListener('blur', () => { if (i.value || i.required) check(i); });
  i.addEventListener('input', () => { if (i.closest('.is-bad')) check(i); });
});
form.addEventListener('submit', async e => {
  e.preventDefault();
  const inputs = $$('input, textarea', form);
  const bad = inputs.filter(i => !check(i));
  if (bad.length) { bad[0].focus(); return; }
  status.className = 'form__status'; status.textContent = t('sending');
  const data = Object.fromEntries(new FormData(form));
  try {
    // Подключите обработчик: <form data-endpoint="https://formspree.io/f/xxxx">
    if (form.dataset.endpoint) {
      const r = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(r.status);
    } else console.info('[THUMBSTOP] data-endpoint не указан, заявка не отправлена:', data);
    status.classList.add('ok'); status.textContent = t('ok'); form.reset();
  } catch { status.textContent = t('fail'); }
});

/* ---------- переключение языка ---------- */
const langBtn = $('[data-lang-toggle]');
langBtn.addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru';
  const dict = lang === 'ru' ? RU : window.I18N.en;
  root.lang = lang;
  $$('[data-i18n]').forEach(el => { const v = dict[el.dataset.i18n]; if (v) el.textContent = v; });
  $$('[data-i18n-aria]').forEach(el => { const v = lang === 'ru' ? RU_ARIA[el.dataset.i18nAria] : window.I18N.en[el.dataset.i18nAria]; if (v) el.setAttribute('aria-label', v); });
  $$('[data-split]').forEach(el => { split(el); });
  langBtn.textContent = lang === 'ru' ? 'EN' : 'RU';
  langBtn.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
});

/* ---------- горизонтальный скролл «Как это работает» ---------- */
const proc = $('.process'), track = $('.process__track');
let procMax = 0;
function layoutProcess() {
  const pin = !RM && innerWidth > 760;
  proc.classList.toggle('is-pinned', pin);
  if (!pin) { track.style.transform = ''; return; }
  procMax = Math.max(0, track.scrollWidth - innerWidth);
  proc.style.setProperty('--h', (innerHeight + procMax) + 'px');
}

/* ---------- единый цикл скролла ---------- */
const heroInner = $('.hero__inner');
const para = $$('[data-parallax]');
let lastY = scrollY, ticking = false, speed = 0;
function frame() {
  ticking = false;
  const y = scrollY, vh = innerHeight, dy = y - lastY;
  nav.classList.toggle('is-solid', y > 40);
  nav.classList.toggle('is-hidden', dy > 4 && y > 500 && !menu.classList.contains('is-open'));
  if (dy < -4) nav.classList.remove('is-hidden');
  if (!RM) {
    if (y < vh * 1.2) {
      if (feed) feed.style.translate = `0 ${y * .25}px`;
      heroInner.style.translate = `0 ${y * .12}px`;
      heroInner.style.opacity = String(Math.max(0, 1 - y / (vh * .9)));
    }
    para.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.style.translate = `0 ${((r.top + r.height / 2) - vh / 2) * -(+el.dataset.parallax)}px`;
    });
    speed = Math.min(6, Math.abs(dy) / 8);
    tapeAnims.forEach(a => { a.playbackRate = 1 + speed; });
  }
  if (proc.classList.contains('is-pinned')) {
    const r = proc.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, procMax)));
    track.style.transform = `translate3d(${-p * procMax}px,0,0)`;
    proc.style.setProperty('--p', p.toFixed(3));
  }
  lastY = y;
}
const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
addEventListener('scroll', req, { passive: true });
// после остановки скролла возвращаем marquee к обычной скорости
setInterval(() => { if (speed > 0 && !RM) { speed = Math.max(0, speed - .6); tapeAnims.forEach(a => { a.playbackRate = 1 + speed; }); } }, 120);
addEventListener('resize', () => { layoutProcess(); req(); });

/* ---------- старт ---------- */
$('[data-year]').textContent = new Date().getFullYear();
layoutProcess(); frame();
const start = () => {
  if (root.classList.contains('is-loaded')) return;
  root.classList.add('is-loaded');
  setTimeout(() => $('#hero-title').classList.add('is-in'), RM ? 0 : 120);
};
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
setTimeout(start, 1500);
})();
