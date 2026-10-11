// Замените на реальные ссылки магазина
const SHOP = 'https://www.nba.com/bulls/shop';

const games = [
  { opp: 'Lincoln Park Lions', home: true,  days: 4,  time: '17:30', place: 'Windy Court' },
  { opp: 'Austin Eagles',      home: false, days: 11, time: '15:00', place: 'Austin Community Gym' },
  { opp: 'Hyde Park Hawks',    home: true,  days: 18, time: '12:00', place: 'Windy Court' },
  { opp: 'Wicker Park Wolves', home: false, days: 25, time: '16:00', place: 'Wicker Gym' },
  { opp: 'South Loop Sharks',  home: true,  days: 32, time: '11:00', place: 'Windy Court' },
].map(g => {
  const d = new Date();
  d.setDate(d.getDate() + g.days);
  const [h, m] = g.time.split(':');
  d.setHours(+h, +m, 0, 0);
  return { ...g, date: d };
});

const MONTHS = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const WD = ['вс','пн','вт','ср','чт','пт','сб'];

// Ближайшая игра + список
const next = games[0];
document.getElementById('ng-opp').textContent = next.opp;
document.getElementById('ng-meta').textContent =
  `${next.date.getDate()} ${MONTHS[next.date.getMonth()]}, ${WD[next.date.getDay()]} · ${next.time} · ${next.place}`;

document.getElementById('games-list').innerHTML = games.slice(1).map(g => `
  <div class="game">
    <div class="date"><b>${g.date.getDate()}</b><span>${MONTHS[g.date.getMonth()]}</span></div>
    <div><h4>Young Bulls vs ${g.opp}</h4><p>${WD[g.date.getDay()]}, ${g.time} · ${g.place}</p></div>
    <span class="badge ${g.home ? 'home' : ''}">${g.home ? 'Дома' : 'Выезд'}</span>
  </div>`).join('');

// Таймер
const cd = document.getElementById('countdown');
function tick() {
  let s = Math.max(0, Math.floor((next.date - Date.now()) / 1000));
  const parts = [['дн', 86400], ['час', 3600], ['мин', 60], ['сек', 1]].map(([l, k]) => {
    const v = Math.floor(s / k); s %= k;
    return `<div><b>${String(v).padStart(2, '0')}</b><small>${l}</small></div>`;
  });
  cd.innerHTML = parts.join('');
}
tick(); setInterval(tick, 1000);

// Состав
const players = [
  ['Маркус', 'Джонсон', 'Разыгрывающий', 1], ['Тайлер', 'Браун', 'Защитник', 3],
  ['Эндрю', 'Миллер', 'Защитник', 7],       ['Дэниел', 'Ким', 'Легкий форвард', 8],
  ['Джейден', 'Уилсон', 'Легкий форвард', 11], ['Лиам', 'Оруэлл', 'Тяжёлый форвард', 14],
  ['Ноа', 'Гарсия', 'Тяжёлый форвард', 21],   ['Итан', 'Купер', 'Центровой', 23],
  ['Лукас', 'Сандерс', 'Защитник', 5],        ['Оливер', 'Грин', 'Форвард', 9],
];
document.getElementById('roster').innerHTML = players.map(([n, s, pos, num]) => `
  <article class="player">
    <div class="pic"><span class="num">#${num}</span><svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="32" r="16" fill="#fff" opacity=".9"/>
      <path d="M18 98c0-22 14-36 32-36s32 14 32 36z" fill="#fff" opacity=".9"/></svg></div>
    <div class="info"><b>${n} ${s}</b><small>${pos}</small></div>
  </article>`).join('');

// Товары (иллюстрации — упрощённые SVG)
const art = {
  jersey: '<path d="M60 20c6 14 14 18 40 18s34-4 40-18l36 22-16 30-14-6v92H54V68l-14 6L24 42z" fill="#ce1141"/><path d="M80 38c4 10 14 14 20 14s16-4 20-14" fill="none" stroke="#fff" stroke-width="5"/><text x="100" y="120" text-anchor="middle" font-family="Oswald,Impact" font-size="30" fill="#fff">BULLS</text><text x="100" y="152" text-anchor="middle" font-family="Oswald,Impact" font-size="30" fill="#fff">23</text>',
  cap: '<path d="M40 110c0-40 28-64 60-64s60 24 60 64z" fill="#ce1141"/><path d="M30 110h150c0 12-30 22-76 22s-74-10-74-22z" fill="#111"/><circle cx="100" cy="86" r="14" fill="#fff"/>',
  hoodie: '<path d="M70 20l30 16 30-16 44 24 12 70-26 6-6-30v70H46v-70l-6 30-26-6 12-70z" fill="#111"/><path d="M76 24c6 16 16 22 24 22s18-6 24-22" fill="none" stroke="#ce1141" stroke-width="6"/><circle cx="100" cy="100" r="16" fill="#ce1141"/>',
  ball: '<circle cx="100" cy="85" r="62" fill="#ce1141"/><path d="M38 85h124M100 23v124M58 40c24 22 24 82 0 90M142 40c-24 22-24 82 0 90" fill="none" stroke="#111" stroke-width="4"/>',
};
const products = [
  ['Игровая джерси Bulls (детская)', 'от $45', 'jersey', '/youth-jerseys'],
  ['Кепка Bulls Icon Snapback', 'от $28', 'cap', '/youth-hats'],
  ['Худи Bulls для подростков', 'от $55', 'hoodie', '/youth-hoodies'],
  ['Мяч Bulls Size 6', 'от $30', 'ball', '/basketballs'],
];
document.getElementById('products').innerHTML = products.map(([t, p, a, path]) => `
  <article class="product">
    <svg viewBox="0 0 200 170" role="img" aria-label="${t}">${art[a]}</svg>
    <h4>${t}</h4><p class="price">${p}</p>
    <a class="btn" href="${SHOP}" target="_blank" rel="noopener" data-path="${path}">Купить</a>
  </article>`).join('');

// Меню
const burger = document.querySelector('.burger'), menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

// Форма
const form = document.getElementById('join-form'), msg = document.getElementById('form-msg');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = form.child, phone = form.phone;
  const okName = name.value.trim().length > 1;
  const okPhone = phone.value.replace(/\D/g, '').length >= 10;
  name.classList.toggle('err', !okName);
  phone.classList.toggle('err', !okPhone);
  msg.className = 'form-msg';
  if (!okName || !okPhone) { msg.textContent = 'Проверьте имя и телефон.'; return; }
  msg.classList.add('ok');
  msg.textContent = `Спасибо! Тренер позвонит по поводу ${name.value.trim()} в течение дня.`;
  form.reset();
});
