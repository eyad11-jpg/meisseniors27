/* MEIS Seniors '27 - app (you should not need to edit this file) */
(() => {
'use strict';
const S = window.SITE || {};
const $ = (s, r = document) => r.querySelector(s);
const root = document.documentElement;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WEAK = (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
const LITE = REDUCED || WEAK;
const CAN3D = !!(window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d'));
if (LITE) root.classList.add('lite');

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c)); });
  return n;
}
const rnd = a => a[Math.floor(Math.random() * a.length)];

/* ---------- sound (off by default) ---------- */
let soundOn = false, ac;
function tone(f = 440, d = .08, type = 'sine', vol = .05, slide = 0) {
  if (!soundOn) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f;
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), ac.currentTime + d);
    g.gain.value = vol; g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
  } catch (e) {}
}
const pop = () => tone(520, .09, 'triangle', .06, 300);
const whoosh = () => tone(180, .5, 'sawtooth', .03, 900);

/* ---------- toast + confetti ---------- */
let tt;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2800);
}
function rain(list = ['🎓', '🎉', '✨', '🧢', '💙', '💛'], n = 36) {
  if (REDUCED) return;
  const fx = $('#fx');
  for (let i = 0; i < n; i++) {
    const s = el('span', { class: 'rain', text: list[i % list.length],
      style: `left:${Math.random() * 100}%;animation-duration:${2.2 + Math.random() * 2}s;animation-delay:${Math.random() * .8}s;font-size:${20 + Math.random() * 22}px` });
    fx.append(s); setTimeout(() => s.remove(), 5400);
  }
}

/* ---------- tilt that follows finger / phone ---------- */
let raf = 0;
function setM(x, y) {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = 0; root.style.setProperty('--mx', x.toFixed(3)); root.style.setProperty('--my', y.toFixed(3)); });
}
if (!REDUCED) addEventListener('pointermove', e => setM((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2), { passive: true });
let orient = false;
function enableMotion() {
  const D = window.DeviceOrientationEvent;
  if (!D) return toast('This phone says no to tilting. Rude.');
  const go = () => {
    if (orient) return; orient = true;
    addEventListener('deviceorientation', e => { if (e.gamma != null) setM(clamp(e.gamma / 25, -1, 1), clamp(((e.beta || 45) - 50) / 25, -1, 1)); });
    toast('Tilt mode on. Wiggle your phone.');
  };
  if (typeof D.requestPermission === 'function') D.requestPermission().then(r => r === 'granted' ? go() : toast('No tilt permission. Fingers it is.')).catch(() => {});
  else go();
}

/* ---------- real 3D headline (stacked layers) ---------- */
function enhance3D(h, text, n = 14) {
  if (h.dataset.on || LITE || !CAN3D) return;
  h.dataset.on = '1';
  const wob = el('span', { class: 'wob' });
  for (let i = n; i >= 0; i--) {
    const c = i === 0 ? '#fff' : `hsl(${218 + i * 1.2} ${72 - i}% ${64 - i * 2.7}%)`;
    wob.append(el('span', { class: 'lay', text, style: `--z:${-i * 3};color:${c}` }));
  }
  h.append(el('span', { class: 'stack', 'aria-hidden': 'true' }, wob));
  h.classList.add('enh');
}

/* ---------- images + empty states ---------- */
const EMPTY = ['photo coming soon', 'someone was blinking', 'our best side is still loading', 'tape is ready, photo is not', 'the photographer is stuck in traffic'];
function emptyFill(ph, i, txt) {
  ph.classList.add('empty'); ph.classList.remove('init');
  ph.replaceChildren(el('span', { text: '📷' }), el('b', { text: txt || EMPTY[i % EMPTY.length] }));
}
function fillImg(ph, urls, onFail) {
  const im = new Image(); im.alt = ''; im.decoding = 'async'; im.loading = 'lazy';
  let k = 0;
  im.onerror = () => { if (++k < urls.length) im.src = urls[k]; else onFail(); };
  im.src = urls[0]; ph.classList.remove('empty'); ph.replaceChildren(im);
}
function photoFill(ph, src, i, txt) { if (!src) return emptyFill(ph, i, txt); fillImg(ph, [src], () => emptyFill(ph, i, txt)); }
function polaroid(src, cap, i) {
  const ph = el('div', { class: 'ph' }); photoFill(ph, src, i);
  return el('figure', { class: 'polaroid' }, el('i', { class: 'tape', 'aria-hidden': 'true' }), ph, cap ? el('figcaption', { text: cap }) : null);
}
const path = (f, dir) => (/^(https?:)?\/\//.test(f) || f.includes('/')) ? f : dir + '/' + f;
function probe(base, max) {
  return Promise.all(Array.from({ length: max }, (_, i) => new Promise(res => {
    const im = new Image(); const u = `${base}/${i + 1}.jpg`;
    im.onload = () => res(u); im.onerror = () => res(null); im.src = u;
  }))).then(a => a.filter(Boolean));
}

/* ---------- lightbox ---------- */
let lbList = [], lbI = 0;
function renderLB() {
  const it = lbList[lbI]; $('#lbimg').src = it.src; $('#lbimg').alt = it.cap || ''; $('#lbcap').textContent = it.cap || '';
  const multi = lbList.length > 1; $('#lbprev').hidden = !multi; $('#lbnext').hidden = !multi;
}
function openLB(list, i) { lbList = list; lbI = i; renderLB(); $('#lb').hidden = false; $('#lbclose').focus(); }
function closeLB() { $('#lb').hidden = true; $('#lbimg').removeAttribute('src'); }
$('#lbclose').onclick = closeLB;
$('#lb').addEventListener('click', e => { if (e.target.id === 'lb') closeLB(); });
$('#lbprev').onclick = () => { lbI = (lbI - 1 + lbList.length) % lbList.length; renderLB(); };
$('#lbnext').onclick = () => { lbI = (lbI + 1) % lbList.length; renderLB(); };
addEventListener('keydown', e => {
  if ($('#lb').hidden) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') $('#lbprev').click();
  if (e.key === 'ArrowRight') $('#lbnext').click();
});

/* ============ NAVIGATION + PORTAL TRANSITION ============ */
const screens = ['splash', 'countdown', 'home', 'photos', 'people', 'trips', 'mail'];
let current = 'splash', busy = false, pending = null, depth = 0;
let tap = { x: innerWidth / 2, y: innerHeight / 2 };
const hashId = () => { const h = location.hash.slice(1); return screens.includes(h) ? h : null; };

function portal(cur, nxt) {
  const W = innerWidth, H = innerHeight, { x, y } = tap;
  const r = Math.ceil(Math.hypot(Math.max(x, W - x), Math.max(y, H - y))) + 30;
  const D = 1000, E = 'cubic-bezier(.22,.9,.28,1)', fx = $('#fx');
  cur.animate([{ transform: 'none', filter: 'none' },
    { transform: 'perspective(900px) rotateX(9deg) rotateY(-5deg) scale(.86)', filter: 'blur(5px) brightness(.45)' }],
    { duration: D, easing: 'ease-in', fill: 'forwards' });
  ['#FFC83D', '#FF8FB8', '#A9D6F7'].forEach((c, i) => {
    const rd = el('div', { class: 'ring', style: `left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px;border-color:${c}` });
    fx.append(rd);
    const a = rd.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 1, offset: .9 }, { transform: 'scale(1)', opacity: 0 }],
      { duration: 760 + i * 90, easing: E, fill: 'forwards' });
    a.onfinish = () => rd.remove();
  });
  nxt.style.transformOrigin = `${x}px ${y}px`;
  return nxt.animate([
    { clipPath: `circle(0px at ${x}px ${y}px)`, transform: 'perspective(900px) rotateX(-10deg) rotateY(6deg) scale(1.25)' },
    { clipPath: `circle(${r}px at ${x}px ${y}px)`, transform: 'none' }], { duration: D, easing: E }).finished;
}

function show(id) {
  if (id === current) return;
  if (busy) { pending = id; return; }
  const cur = $('#' + current), nxt = $('#' + id);
  if (!nxt) return;
  busy = true; document.body.classList.add('busy');
  nxt.scrollTop = 0; nxt.classList.add('on', 'incoming');
  onEnter(id); whoosh();
  let anim;
  if (typeof nxt.animate !== 'function') anim = Promise.resolve();
  else if (LITE) anim = nxt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 }).finished;
  else anim = portal(cur, nxt);
  Promise.race([Promise.resolve(anim).catch(() => {}), new Promise(r => setTimeout(r, 1500))]).then(() => {
    if (cur.getAnimations) cur.getAnimations().forEach(a => a.cancel());
    cur.classList.remove('on'); nxt.classList.remove('incoming'); nxt.style.transformOrigin = '';
    current = id; busy = false; document.body.classList.remove('busy');
    if (id === 'photos' && carCtl) carCtl();
    const h = nxt.querySelector('h1,h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    if (pending) { const p = pending; pending = null; show(p); }
  });
}
function navigate(id) { if (busy || id === current) return; depth++; history.pushState({ id, d: depth }, '', '#' + id); show(id); }
function goBack() {
  if (busy) return;
  if (depth > 0) history.back();
  else { history.replaceState({ id: 'home', d: 0 }, '', '#home'); show('home'); }
}
addEventListener('popstate', e => { const st = e.state; depth = st ? st.d : 0; show((st && st.id) || hashId() || 'splash'); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go],[data-back]'); if (!b) return;
  e.preventDefault(); if (busy) return;
  if (e.detail === 0 || (!e.clientX && !e.clientY)) { const r = b.getBoundingClientRect(); tap = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  else tap = { x: e.clientX, y: e.clientY };
  pop();
  if (b.dataset.go) navigate(b.dataset.go); else goBack();
});

/* ---------- cap sticker easter egg ---------- */
let mt = 0;
const MQ = ['You tapped the cap five times. Nothing is wrong with you. Probably.', 'Congratulations, you found the confetti. It was in your pocket the whole time.', 'This cap is not a real graduation. Yet.'];
document.addEventListener('click', e => {
  const m = e.target.closest('[data-m]'); if (!m) return;
  pop(); m.classList.remove('wiggle'); void m.offsetWidth; m.classList.add('wiggle');
  if (++mt >= 5) { mt = 0; rain(); toast(rnd(MQ)); }
  else if (mt === 2) toast('Careful. It bites. (It does not.)');
});

/* ============ FRONT DOOR ============ */
(function initSplash() {
  const w = S.welcome || [];
  $('#l4').textContent = w[0] || 'you found us.';
  const t = w[1] || 'Welcome in. Make yourself at home';
  $('#l5').setAttribute('aria-label', t);
  $('#ovaltxt').textContent = S.ovalButton || "Don't Look Down";
  $('#ovallab').textContent = S.ovalLabel || "yes it's scary. tap anyway.";
  if (LITE) $('#l5t').textContent = t;
  else setTimeout(() => { let i = 0; const iv = setInterval(() => { $('#l5t').textContent = t.slice(0, ++i); if (i >= t.length) clearInterval(iv); }, 38); }, 2200);
  const go = () => enhance3D($('#l1'), "MEIS'27");
  (window.requestIdleCallback || (f => setTimeout(f, 200)))(go);
})();

/* ============ COUNTDOWN ============ */
const CDS = (S.countdowns && S.countdowns.length) ? S.countdowns : [{ id: 'grad', label: 'Graduation Day', date: '2027-07-21T18:00:00', sub: '', joke: '', done: '' }];
const START = new Date(S.startDate || '2026-09-12T08:00:00');
let mode = CDS[CDS.length - 1].id, last = {};
const modeObj = () => CDS.find(c => c.id === mode) || CDS[0];
function pad(n) { return String(n).padStart(2, '0'); }
function tick() {
  const m = modeObj(), target = new Date(m.date);
  let ms = target - Date.now(); const done = ms <= 0 || isNaN(ms); if (done) ms = 0;
  const s = Math.floor(ms / 1000);
  const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  for (const k in v) {
    const e = $('#cd-' + k), t = k === 'd' ? String(v[k]) : pad(v[k]);
    if (last[k] !== t) { e.textContent = t; if (!REDUCED) { e.classList.remove('t'); void e.offsetWidth; e.classList.add('t'); } last[k] = t; }
  }
  $('#cdfin').hidden = !done; if (done) $('#cdfin').textContent = m.done || 'WE DID IT.';
}
function roadProgress() {
  const t = new Date(modeObj().date); const p = (Date.now() - START) / (t - START);
  return isNaN(p) ? 0 : clamp(p, 0.02, 1);
}
const ROADNOTES = ['we just left the driveway', 'still on the easy part', 'halfway. the snacks are gone', 'the road gets steep (and funny)', 'nearly there. do not look down', 'THE FLAG. IT IS RIGHT THERE'];
function moveRider(animate) {
  const path = $('#roadp'), rider = $('#rider'), len = path.getTotalLength(), p = roadProgress();
  const set = q => { const pt = path.getPointAtLength(len * q); rider.setAttribute('transform', `translate(${pt.x} ${pt.y})`); };
  $('#roadnote').textContent = ROADNOTES[Math.min(ROADNOTES.length - 1, Math.floor(p * ROADNOTES.length))];
  if (!animate || LITE) return set(p);
  const t0 = performance.now();
  (function step(now) { const k = clamp((now - t0) / 1300, 0, 1); set(p * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
}
function setMode(id, animate) {
  mode = id; const m = modeObj(); last = {};
  $('#cdsub').textContent = m.sub || ''; $('#cdjoke').textContent = m.joke || '';
  document.querySelectorAll('#cdtabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  tick(); moveRider(animate);
}
(function initCountdown() {
  const tabs = $('#cdtabs');
  if (CDS.length < 2) tabs.hidden = true;
  CDS.forEach(c => tabs.append(el('button', { class: 'tabbtn', type: 'button', 'data-id': c.id, text: c.label, 'aria-pressed': 'false', onclick: () => { pop(); setMode(c.id, true); } })));
  setMode(mode, false); setInterval(tick, 1000);
})();

/* ============ HOME ============ */
let homeBuilt = false;
const EXC = S.excuses && S.excuses.length ? S.excuses : ['My alarm went off. I went off too.'];
function initHome() {
  if (homeBuilt) return; homeBuilt = true;
  $('#warntxt').textContent = S.warning || 'warning: contains pure legends';
  $('#bubble').textContent = S.bubble || 'Yes, we really are graduating.';
  photoFill($('#grouppol .ph'), S.groupPhoto, 0, 'group photo coming soon (we are still arguing about who blinked)');
  $('#groupcap').textContent = S.groupCaption || 'the whole crew (on a good day)';
  const items = S.band || ['SCAN. SMILE. REMEMBER.'];
  const unit = items.map(t => t + '   ★   ').join('').repeat(3);
  $('#band').append(el('span', { text: unit }), el('span', { text: unit }));
  const ol = $('#rules'); (S.rules || []).forEach(r => ol.append(el('li', { text: r })));
  $('#excusetxt').textContent = rnd(EXC);
  $('#excuse').onclick = () => { pop(); $('#excusetxt').textContent = rnd(EXC); };
  $('#sndbtn').onclick = e => { soundOn = !soundOn; e.currentTarget.setAttribute('aria-pressed', String(soundOn)); e.currentTarget.textContent = 'sound: ' + (soundOn ? 'on' : 'off'); pop(); };
  $('#tiltbtn').onclick = enableMotion;
}
initHome();

/* ============ PHOTOS (3D carousel) ============ */
let photosBuilt = false, photoItems = [], carRunning = false, carCtl = null;
const CAPS = ['bad angle, great people', 'we were so young (last week)', 'caught in 4K', 'nobody asked for this photo', 'peak chaos', 'the group chat, but real'];
async function initPhotos() {
  if (photosBuilt) return; photosBuilt = true;
  const items = [], seen = new Set();
  (S.photos || []).forEach(p => { const f = Array.isArray(p) ? p[0] : p, cap = Array.isArray(p) ? p[1] : ''; const src = path(f, 'photos'); seen.add(src); items.push({ src, cap }); });
  const found = await probe('photos', 30);
  found.forEach((src, i) => { if (!seen.has(src)) items.push({ src, cap: CAPS[i % CAPS.length] }); });
  photoItems = items; buildCarousel(items);
}
function buildCarousel(items) {
  const wrap = $('#carousel'); wrap.replaceChildren();
  const N = Math.max(items.length, 7), slots = Array.from({ length: N }, (_, i) => items[i] || null);
  let moved = 0;
  const card = (it, i) => {
    const b = el('button', { class: 'cc', type: 'button', 'aria-label': it ? 'Open photo: ' + (it.cap || i + 1) : 'Empty polaroid. Photo coming soon.' }, polaroid(it ? it.src : null, it ? it.cap : '', i));
    b.addEventListener('click', () => { if (moved > 8) return; pop(); if (it) openLB(items, i); else toast("Still empty. Somebody send photos!"); });
    return b;
  };
  if (LITE || !CAN3D) { wrap.classList.add('flat'); slots.forEach((it, i) => wrap.append(card(it, i))); return; }
  const step = 360 / N, R = Math.round((170 * 1.12 / 2) / Math.tan(Math.PI / N));
  const ring = el('div', { class: 'ring3d' }); wrap.append(ring);
  slots.forEach((it, i) => { const c = card(it, i); c.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; ring.append(c); });
  let ang = 0, vel = 0, mode = 'auto', target = 0, rest = 0, sx = 0, sa = 0, lx = 0;
  const apply = () => { ring.style.transform = `translateZ(${-R}px) rotateY(${ang}deg)`; };
  apply();
  wrap.addEventListener('pointerdown', e => { mode = 'drag'; moved = 0; sx = lx = e.clientX; sa = ang; vel = 0; });
  addEventListener('pointermove', e => { if (mode !== 'drag') return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); vel = (e.clientX - lx) * .35; lx = e.clientX; ang = sa + dx * .35; apply(); });
  const up = () => { if (mode === 'drag') mode = 'coast'; };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  const nudge = d => { target = Math.round(ang / step) * step + d * step; mode = 'snap'; };
  $('#carprev').onclick = () => { pop(); nudge(1); }; $('#carnext').onclick = () => { pop(); nudge(-1); };
  function frame() {
    if (current !== 'photos') { carRunning = false; return; }
    if (mode === 'auto') ang -= .12;
    else if (mode === 'coast') { ang += vel; vel *= .94; if (Math.abs(vel) < .05) { mode = 'snap'; target = Math.round(ang / step) * step; } }
    else if (mode === 'snap') { ang += (target - ang) * .15; if (Math.abs(target - ang) < .1) { ang = target; mode = 'rest'; rest = performance.now(); } }
    else if (mode === 'rest' && performance.now() - rest > 2500) mode = 'auto';
    if (mode !== 'drag') apply();
    requestAnimationFrame(frame);
  }
  carCtl = () => { if (!carRunning) { carRunning = true; requestAnimationFrame(frame); } };
  carCtl();
}

/* ============ PEOPLE ============ */
let peopleBuilt = false;
const slug = n => n.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const EXTS = ['jpg', 'jpeg', 'png', 'webp'];
const BGS = ['#A9D6F7', '#FFC83D', '#FF8FB8', '#cfe6fa'];
function initPeople() {
  if (peopleBuilt) return; peopleBuilt = true;
  const grid = $('#pgrid'), list = (S.people || []).map(p => typeof p === 'string' ? { name: p } : p);
  if (!list.length) { grid.append(el('p', { class: 'hand', text: 'WANTED: everyone. Names coming soon.' })); return; }
  list.forEach((p, i) => {
    const sl = p.file || slug(p.name) || ('person-' + (i + 1));
    const fph = el('div', { class: 'ph' }), bph = el('div', { class: 'ph' });
    const faceUrls = p.photo ? [path(p.photo, 'people')] : EXTS.map(e => `people/${sl}.${e}`);
    const babyUrls = p.baby ? [path(p.baby, 'people')] : EXTS.map(e => `people/${sl}-baby.${e}`);
    const ini = p.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const initFill = () => { fph.classList.add('init'); fph.classList.remove('empty'); fph.style.setProperty('--bg', BGS[i % BGS.length]); fph.replaceChildren(el('b', { class: 'ini', text: ini }), el('small', { text: 'photo: soon' })); };
    fillImg(fph, faceUrls, initFill);
    fillImg(bph, babyUrls, () => emptyFill(bph, i, 'baby photo still developing 🍼'));
    const first = p.name.split(/\s+/)[0];
    const front = el('div', { class: 'face front' }, el('figure', { class: 'polaroid' }, fph, el('figcaption', { text: p.name })));
    const back = el('div', { class: 'face back' }, el('figure', { class: 'polaroid' }, bph, el('figcaption', { text: 'baby ' + first })));
    const b = el('button', { class: 'pcard', type: 'button', 'aria-pressed': 'false', 'data-name': p.name.toLowerCase(), 'aria-label': p.name + '. Tap to flip and see the baby photo.' }, el('div', { class: 'inner' }, front, back));
    b.addEventListener('click', () => { pop(); b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); });
    grid.append(b);
  });
  $('#psearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase(); let any = false;
    grid.querySelectorAll('.pcard').forEach(c => { const ok = !q || c.dataset.name.includes(q); c.hidden = !ok; if (ok) any = true; });
    $('#pnone').hidden = any;
  });
}

/* ============ TRIPS ============ */
let tripsBuilt = false;
function initTrips() {
  if (tripsBuilt) return; tripsBuilt = true;
  const box = $('#tripl'), trips = S.trips || [];
  if (!trips.length) { box.append(el('p', { class: 'hand', text: 'No trips yet. We were busy being legends at home.' })); return; }
  trips.forEach((t, i) => {
    const strip = el('div', { class: 'strip' });
    [0, 1].forEach(k => strip.append(polaroid(null, '', i * 2 + k)));
    const stop = el('div', { class: 'stop' },
      el('span', { class: 'pinm', 'aria-hidden': 'true', text: i === 0 ? '✈️' : '📍' }),
      el('div', { class: 'ticket' }, el('h3', { text: t.name }), t.date ? el('span', { class: 'stamp', text: t.date }) : null, t.note ? el('p', { text: t.note }) : null, strip));
    box.append(stop);
    const base = t.folder ? 'trips/' + t.folder : null;
    const explicit = (t.photos || []).map(f => path(f, base || 'trips'));
    (base ? probe(base, 12) : Promise.resolve([])).then(found => {
      const srcs = [...new Set([...explicit, ...found])];
      if (!srcs.length) return;
      const items = srcs.map((src, k) => ({ src, cap: t.name }));
      strip.replaceChildren(...items.map((it, k) => { const b = el('button', { type: 'button', 'aria-label': 'Open photo from ' + t.name }, polaroid(it.src, '', k)); b.onclick = () => { pop(); openLB(items, k); }; return b; }));
    });
  });
}

/* ============ SECRET MAIL ============ */
const api = () => (S.mailApi || '').trim();
let names = null;
async function post(body) {
  const r = await fetch(api(), { method: 'POST', body: JSON.stringify(body) });
  return r.json();
}
async function loadNames() {
  if (names) return names;
  let list = [];
  if (api()) { try { const r = await fetch(api() + '?a=names'); const j = await r.json(); if (j.ok && Array.isArray(j.names)) list = j.names; } catch (e) {} }
  if (!list.length) list = (S.people || []).map(p => typeof p === 'string' ? p : p.name);
  return names = list;
}
function fillSelect(sel, list, ph) {
  sel.replaceChildren(el('option', { value: '', text: ph }), ...list.map(n => el('option', { value: n, text: n })));
}
let mailBuilt = false;
function initMail() {
  if (mailBuilt) return; mailBuilt = true;
  if (!api()) $('#mailclosed').hidden = false;
  loadNames().then(l => { fillSelect($('#to'), l, 'pick a victim…'); fillSelect($('#who'), l, 'pick your name…'); });
  const tabw = $('#tabw'), tabr = $('#tabr');
  const tab = w => { tabw.setAttribute('aria-pressed', String(w)); tabr.setAttribute('aria-pressed', String(!w)); $('#panelw').hidden = !w; $('#panelr').hidden = w; pop(); };
  tabw.onclick = () => tab(true); tabr.onclick = () => tab(false);
  const say = (id, t, ok) => { const m = $(id); m.textContent = t; m.classList.toggle('ok', !!ok); };

  $('#sendform').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    if (!api()) return say('#sendmsg', "The post office isn't connected yet. Tell the admin!");
    const to = f.to.value, text = f.text.value.trim(); if (!to || !text) return say('#sendmsg', 'Pick a name and write something nice.');
    const btn = $('#sendbtn'); btn.disabled = true; say('#sendmsg', 'sending…');
    try {
      const j = await post({ a: 'send', to, text, from: f.from.value.trim(), hp: f.hp.value });
      if (j.ok) {
        say('#sendmsg', f.from.value.trim() ? 'Delivered. They will know it was you. 💌' : 'Delivered. They will never know it was you. 🕵️', true);
        f.text.value = ''; flyEnvelope(btn); tone(660, .2, 'triangle', .06, 400);
      } else say('#sendmsg', j.error === 'noname' ? "That name isn't on the list. Pick again?" : 'The pigeon dropped it. Try again.');
    } catch (err) { say('#sendmsg', 'The pigeon got lost. Check your internet and try again.'); }
    btn.disabled = false;
  });

  const box = $('#box');
  const lock = () => { box.hidden = true; $('#letters').replaceChildren(); $('#readform').hidden = false; $('#readform').code.value = ''; $('#adminform').acode.value = ''; adminCode = ''; say('#readmsg', ''); };
  let adminCode = '';
  $('#lockbtn').onclick = () => { pop(); lock(); };
  $('#adminlink').onclick = () => { $('#readform').hidden = true; $('#adminform').hidden = false; };
  $('#adminback').onclick = () => { $('#adminform').hidden = true; $('#readform').hidden = false; };

  const showLetters = (list, admin) => {
    $('#readform').hidden = true; $('#adminform').hidden = true; box.hidden = false;
    $('#boxhead').textContent = admin ? 'Manager view 🛡️ (all letters)' : 'Your mailbox. Eyes only. 👀';
    const L = $('#letters'); L.replaceChildren();
    if (!list.length) { L.append(el('p', { class: 'hand boxhead', text: admin ? 'No letters yet.' : "Nothing yet. Your mailbox is as empty as our group chat on exam day. Check again later." })); return; }
    list.forEach(m => {
      const meta = admin ? `to ${m.to} · from ${m.from || 'mystery person'} · ${m.when}` : `${m.from ? 'from ' + m.from : 'from a mystery person 🕵️'} · ${m.when}`;
      const card = el('div', { class: 'letter' }, el('p', { class: 'txt', text: m.text }), el('p', { class: 'meta', text: meta }));
      if (admin) card.append(el('button', { class: 'del', type: 'button', text: 'delete', onclick: async () => {
        if (!confirm('Delete this letter for good?')) return;
        try { const j = await post({ a: 'del', code: adminCode, id: m.id }); if (j.ok) { card.remove(); toast('Gone. Poof.'); } else toast("Couldn't delete that one."); } catch (e) { toast('The pigeon got lost.'); }
      } }));
      L.append(card);
    });
  };
  const errText = j => j.error === 'locked' ? 'Too many wrong tries. Cool off for 10 minutes ☕' : "That code doesn't open this mailbox. Check WhatsApp.";

  $('#readform').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    if (!api()) return say('#readmsg', "The post office isn't connected yet.");
    if (!f.who.value || !f.code.value) return say('#readmsg', 'Pick your name and type your code.');
    const btn = $('#readbtn'); btn.disabled = true; say('#readmsg', 'knocking…');
    try { const j = await post({ a: 'read', name: f.who.value, code: f.code.value }); if (j.ok) { say('#readmsg', ''); showLetters(j.messages || [], false); f.code.value = ''; } else say('#readmsg', errText(j)); }
    catch (err) { say('#readmsg', 'The pigeon got lost. Try again.'); }
    btn.disabled = false;
  });
  $('#adminform').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    if (!api()) return say('#adminmsg', "The post office isn't connected yet.");
    const btn = $('#adminbtn'); btn.disabled = true; say('#adminmsg', 'checking your badge…');
    try { const j = await post({ a: 'admin', code: f.acode.value }); if (j.ok) { adminCode = f.acode.value; f.acode.value = ''; say('#adminmsg', ''); showLetters(j.messages || [], true); } else say('#adminmsg', errText(j)); }
    catch (err) { say('#adminmsg', 'The pigeon got lost. Try again.'); }
    btn.disabled = false;
  });
}
function flyEnvelope(from) {
  if (REDUCED) return;
  const r = from.getBoundingClientRect(), n = el('div', { class: 'env', text: '✉️', style: `left:${r.left + r.width / 2 - 22}px;top:${r.top}px` });
  document.body.append(n);
  n.animate([{ transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 }, { transform: 'translate(120px,-300px) rotate(35deg) scale(.3)', opacity: 0 }], { duration: 1100, easing: 'ease-in' }).onfinish = () => n.remove();
}

/* ============ SCREEN ENTER HOOKS ============ */
function onEnter(id) {
  if (id === 'home') { const h = $('#meis'); (window.requestIdleCallback || (f => setTimeout(f, 150)))(() => enhance3D(h, "MEIS'27")); }
  if (id === 'countdown') { tick(); moveRider(true); }
  if (id === 'photos') { initPhotos().then(() => carCtl && carCtl()); }
  if (id === 'people') initPeople();
  if (id === 'trips') initTrips();
  if (id === 'mail') initMail();
}

/* ============ START ============ */
const start = hashId() || 'splash';
history.replaceState({ id: start, d: 0 }, '', start === 'splash' ? location.pathname : '#' + start);
if (start !== 'splash') { $('#splash').classList.remove('on'); $('#' + start).classList.add('on'); current = start; onEnter(start); }
})();
