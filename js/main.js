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

/* ---------- static campaign artwork; videos load only on request ---------- */
const ART = ['attention', 'social', 'studio', 'perfume', 'sneaker', 'headphones', 'soda', 'storyboard'];
function artwork(name, eager = false) {
  const pic = document.createElement('picture'); pic.className = 'art';
  const source = document.createElement('source'); source.type = 'image/webp'; source.srcset = `assets/images/${name}.webp`;
  const im = document.createElement('img'); im.src = `assets/images/${name}.png`;
  im.alt = ''; im.width = 1024; im.height = 1024; im.decoding = 'async'; im.loading = eager ? 'eager' : 'lazy';
  pic.append(source, im); return pic;
}
function buildClip(el) {
  if (el.dataset.built) return;
  el.dataset.built = '1';
  const name = ART.includes(el.dataset.art) ? el.dataset.art : 'social';
  if (!el.querySelector('picture, .media-poster')) el.appendChild(artwork(name, el.closest('.feed') !== null));
}
const feed = $('[data-feed]');
if (feed) {
  const names = ['sneaker', 'perfume', 'headphones', 'soda', 'social', 'studio', 'storyboard', 'attention'];
  const themes = ['pink', 'orange', 'violet', 'blue'];
  // Two compact columns on phones, three on desktop. No generated geometry or canvas.
  const cols = matchMedia('(max-width: 760px)').matches ? 2 : 3;
  for (let c = 0; c < cols; c++) {
    const col = document.createElement('div'); col.className = 'feed__col';
    col.style.setProperty('--d', (48 + c * 8) + 's');
    for (let i = 0; i < 6; i++) {
      const clip = document.createElement('div'); clip.className = 'clip';
      clip.dataset.art = names[(c * 2 + i % 3) % names.length];
      clip.dataset.theme = themes[c]; col.appendChild(clip); buildClip(clip);
    }
    feed.appendChild(col);
  }
}
$$('.clip').forEach(buildClip);
const heroIO = new IntersectionObserver(entries => entries.forEach(e => feed && feed.classList.toggle('is-paused', !e.isIntersecting)));
heroIO.observe($('.hero'));

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
function onIn(el) {
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
menu.inert = true;
function setMenu(open) {
  menu.inert = !open;
  $('#main').inert = open;
  $('.foot').inert = open;
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? (lang === 'ru' ? 'Закрыть меню' : 'Close menu') : (lang === 'ru' ? 'Открыть меню' : 'Open menu'));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) requestAnimationFrame(() => $('a', menu).focus());
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => {
  if (e.key === 'Tab' && menu.classList.contains('is-open')) {
    const items = [burger, ...$$('a,button', menu)];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

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
const WIDE = matchMedia('(min-width: 1101px)');
WIDE.addEventListener('change', e => { if (e.matches && menu.classList.contains('is-open')) setMenu(false); });
function openPane(p, fromTap) {
  if (p.classList.contains('is-open')) return;
  panes.forEach(x => { const on = x === p; x.classList.toggle('is-open', on); $('.pane__tab', x).setAttribute('aria-expanded', String(on)); });
  const body = $('.pane__body', p);
  body.tabIndex = -1;
  if (fromTap) body.focus({ preventScroll: true });
  // в колонке соседние карточки схлопываются, поэтому возвращаем открытую в поле зрения
  if (fromTap && !WIDE.matches) requestAnimationFrame(() => {
    if (p.getBoundingClientRect().top < 70) p.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
  });
}
panes.forEach(p => {
  $('.pane__tab', p).addEventListener('click', () => openPane(p, true));
  if (FINE) p.addEventListener('pointerenter', () => { if (WIDE.matches) openPane(p); });
});

/* ---------- фильтр портфолио ---------- */
const works = $('.works');
$$('.chip').forEach(ch => ch.addEventListener('click', () => {
  const f = ch.dataset.filter;
  $$('.chip').forEach(c => { c.classList.toggle('is-on', c === ch); c.setAttribute('aria-pressed', String(c === ch)); });
  works.classList.toggle('is-filtered', f !== 'all');
  $$('.work', works).forEach(w => w.classList.toggle('is-out', f !== 'all' && w.dataset.cat !== f));
}));

/* ---------- media viewer: local MP4s and transparent PNGs ---------- */
const viewer = $('#viewer'), stage = $('.viewer__stage', viewer), cap = $('.viewer__cap', viewer);
const credit = $('.viewer__credit', viewer), sourceLink = $('.viewer__source', viewer);
let lastFocus = null, previousOverflow = '';
document.addEventListener('click', e => {
  const b = e.target.closest('[data-open-viewer]');
  if (!b) return;
  const src = b.dataset.art ? b : $('.clip', b);
  if (!src) return;
  const meta = b.closest('.work');
  stage.replaceChildren();
  viewer.classList.toggle('has-video', !!src.dataset.video);
  if (src.dataset.video) {
    const v = document.createElement('video');
    v.src = src.dataset.video; v.controls = true; v.playsInline = true; v.preload = 'metadata';
    // Preserve the original aspect ratio rather than cropping reference videos.
    v.addEventListener('loadedmetadata', () => viewer.classList.toggle('is-portrait', v.videoHeight > v.videoWidth));
    v.addEventListener('error', () => {
      if (!viewer.open || !v.isConnected) return;
      const note = document.createElement('p'); note.className = 'media-error';
      note.textContent = lang === 'ru' ? 'Не удалось загрузить видео. Открой источник ниже.' : 'Video could not load. Open the source below.';
      stage.replaceChildren(note);
    });
    stage.appendChild(v); v.play().catch(() => {});
  } else {
    const c = document.createElement('div'); c.className = 'clip';
    c.dataset.art = src.dataset.art; c.dataset.theme = src.dataset.theme || 'violet';
    stage.appendChild(c); buildClip(c); viewer.classList.remove('is-portrait');
  }
  cap.textContent = meta ? $('.work__name', meta).textContent : b.dataset.title || 'THUMBSTOP';
  credit.textContent = src.dataset.credit || (lang === 'ru' ? 'THUMBSTOP · AI-визуальный концепт' : 'THUMBSTOP · AI visual concept');
  sourceLink.hidden = !src.dataset.source;
  if (src.dataset.source) sourceLink.href = src.dataset.source; else sourceLink.removeAttribute('href');
  lastFocus = b; previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden'; viewer.showModal();
});
viewer.addEventListener('close', () => {
  const v = $('video', stage); if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
  stage.replaceChildren(); document.body.style.overflow = previousOverflow;
  if (lastFocus) lastFocus.focus({ preventScroll: true });
});
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
  if (!form.dataset.endpoint) { status.className = 'form__status'; status.textContent = t('noEndpoint'); return; }
  const submit = $('button[type=submit]', form); if (submit.disabled) return; submit.disabled = true;
  status.className = 'form__status'; status.textContent = t('sending');
  const data = Object.fromEntries(new FormData(form));
  try {
    // Подключите обработчик: <form data-endpoint="https://formspree.io/f/xxxx">
    if (form.dataset.endpoint) {
      const r = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(r.status);
    }
    status.classList.add('ok'); status.textContent = t('ok'); form.reset();
  } catch { status.textContent = t('fail'); } finally { submit.disabled = false; }
});

/* ---------- переключение языка ---------- */
const langBtns = $$('[data-lang-toggle]');
langBtns.forEach(b => b.addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru';
  const dict = lang === 'ru' ? RU : window.I18N.en;
  root.lang = lang;
  $$('[data-i18n]').forEach(el => { const v = dict[el.dataset.i18n]; if (v) el.textContent = v; });
  $$('[data-i18n-aria]').forEach(el => { const v = lang === 'ru' ? RU_ARIA[el.dataset.i18nAria] : window.I18N.en[el.dataset.i18nAria]; if (v) el.setAttribute('aria-label', v); });
  $$('[data-split]').forEach(el => { split(el); });
  langBtns.forEach(b => { b.textContent = lang === 'ru' ? 'EN' : 'RU'; b.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский'); });
}));

/* ---------- горизонтальный скролл «Как это работает» ---------- */
const proc = $('.process'), track = $('.process__track');
let procMax = 0;
track.addEventListener('scroll', () => {
  if (proc.classList.contains('is-pinned')) return;
  const m = track.scrollWidth - track.clientWidth;
  proc.style.setProperty('--p', m > 0 ? (track.scrollLeft / m).toFixed(3) : '0');
}, { passive: true });
function layoutProcess() {
  const pin = !RM && innerWidth > 1100 && innerHeight > 780;
  proc.classList.toggle('is-pinned', pin);
  if (!pin) { track.style.transform = ''; proc.style.removeProperty('--h'); return; }
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
let lastW = innerWidth;
addEventListener('resize', () => { if (innerWidth !== lastW || proc.classList.contains('is-pinned')) { lastW = innerWidth; layoutProcess(); } req(); });

/* ---------- старт ---------- */
$('[data-year]').textContent = new Date().getFullYear();
layoutProcess(); frame();
if (document.fonts) document.fonts.ready.then(() => { layoutProcess(); req(); });
const start = () => {
  if (root.classList.contains('is-loaded')) return;
  root.classList.add('is-loaded');
  setTimeout(() => $('#hero-title').classList.add('is-in'), RM ? 0 : 120);
};
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
setTimeout(start, 1500);
})();
