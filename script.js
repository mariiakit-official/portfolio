// ---------- Navigation ----------
const page = document.body.dataset.page;
document.querySelectorAll(".main-nav a").forEach(link => {
  const active = link.dataset.page === page;
  link.classList.toggle("active", active);
  if (active) link.setAttribute("aria-current", "page");
});
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }));
}

// ---------- Snowy owl ----------
const hero = document.querySelector(".hero");
const stage = document.querySelector(".owl-stage");
const head = document.querySelector(".owl-head");
const copy = document.querySelector(".hero-copy");
const root = document.documentElement;

if (hero && stage && head) {
  const IMG_W = 1536, IMG_H = 1024;
  const OWL = { x: 0.483, y: 0.565 };   // perched owl centre in the artwork (fractions)
  const HEAD = { x: 0.479, y: 0.40 };   // face centre, used for aiming
  const mobile = window.matchMedia("(max-width: 700px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const geo = { left: 0, top: 0, w: 0, h: 0, W: 0, H: 0, ftop: 0, k: 1, os: 1 };
  const PIVOT = { x: 0.495 * IMG_W, y: 0.84 * IMG_H };   // .owl-figure scales around the feet // k = screen px per artwork px

  // Size the stage so it covers the hero (like background-size: cover),
  // then slide it so the owl lands at --owl-x / --owl-y without exposing edges.
  function layout() {
    const W = hero.clientWidth;
    const top = mobile.matches && copy ? copy.offsetTop + copy.offsetHeight + 8 : 0;
    const H = hero.clientHeight - top;
    const css = getComputedStyle(hero);
    const px = parseFloat(css.getPropertyValue("--owl-x")) || 0.5;
    const py = parseFloat(css.getPropertyValue("--owl-y")) || 0.5;
    const cover = Math.max(W, H * IMG_W / IMG_H);
    let w = Math.max(cover, (px * W) / OWL.x, ((1 - px) * W) / (1 - OWL.x));
    w = Math.min(w, cover * 1.45);
    const h = w * IMG_H / IMG_W;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const left = clamp(px * W - OWL.x * w, W - w, 0);
    const y = top + clamp(py * H - OWL.y * h, H - h, 0);
    Object.assign(stage.style, { left: `${left}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, right: "auto", bottom: "auto" });
    hero.style.setProperty("--frame-top", `${top}px`);
    const os = parseFloat(css.getPropertyValue("--owl-scale")) || 1;
    Object.assign(geo, { left, top: y, w, h, W, H: hero.clientHeight, ftop: top, k: w / IMG_W, os });
    if (flight) flight.resize();
  }

  let flight = null;
  if (!reduced.matches) flight = setupFlight();
  layout();
  new ResizeObserver(layout).observe(hero);
  mobile.addEventListener("change", layout);

  // ---------- Head follows the cursor ----------
  if (!reduced.matches) {
    let tx = 0, ty = 0, x = 0, y = 0;
    let lastPointer = 0, running = false, visible = true;
    window.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      const r = stage.getBoundingClientRect();
      const fx = r.left + HEAD.x * r.width, fy = r.top + HEAD.y * r.height;
      tx = Math.max(-1, Math.min(1, (e.clientX - fx) / (window.innerWidth * 0.45)));
      ty = Math.max(-1, Math.min(1, (e.clientY - fy) / (window.innerHeight * 0.45)));
      lastPointer = performance.now();
    }, { passive: true });
    document.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
    window.addEventListener("blur", () => { tx = 0; ty = 0; });

    function frame(t) {
      const fp = flight && flight.pos();
      if (fp && t - lastPointer > 1500) {     // mouse still: watch the owl flying past
        const r = stage.getBoundingClientRect(), h = hero.getBoundingClientRect();
        const fx = r.left + HEAD.x * r.width, fy = r.top + HEAD.y * r.height;
        tx = Math.max(-1, Math.min(1, (h.left + fp.x - fx) / (window.innerWidth * 0.35)));
        ty = Math.max(-1, Math.min(1, (h.top + fp.y - fy) / (window.innerHeight * 0.45)));
      } else if (t - lastPointer > 3000) {    // no mouse: look around on its own
        tx = Math.sin(t / 2300) * 0.7 + Math.sin(t / 900) * 0.15;
        ty = Math.sin(t / 3100) * 0.4;
      }
      x += (tx - x) * 0.09; y += (ty - y) * 0.09;
      head.style.transform = `translate3d(${x * 0.28}%, ${y * 0.25}%, 0) rotate(${x * 5}deg)`;
      if (flight) flight.tick();
      if (visible) requestAnimationFrame(frame); else running = false;
    }
    const start = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(hero);
    start();
  }

  // ---------- Flying owl ----------
  // A second owl crosses the sky side to side; the perched owl turns its head to watch it.
  function setupFlight() {
    const flyer = hero.querySelector(".flyer");
    const hit = hero.querySelector(".owl-hit");
    if (!flyer) return null;
    const imgs = {};
    flyer.querySelectorAll("img").forEach(im => (imgs[im.dataset.frame] = im));

    // Side-view frames (images/flight/fly1-4.webp), all cut to one cell, anchored on the eye.
    const CELL = { w: 1588, h: 1250 }, EYE = { x: 1052.4, y: 658.3 };
    const FLAP = ["fly1", "fly2", "fly3", "fly4"];
    const FLAP_MS = 110;
    const toPx = p => [p.x * geo.W, geo.ftop + p.y * (geo.H - geo.ftop)];   // fractions of the picture area

    function resize() {
      flyer.style.width = `${CELL.w * geo.k}px`;
      flyer.style.height = `${CELL.h * geo.k}px`;
      flyer.style.transformOrigin = `${EYE.x * geo.k}px ${EYE.y * geo.k}px`;
      if (hit) {   // clickable area over the perched owl
        const P = (x, y) => [geo.left + (PIVOT.x + (x - PIVOT.x) * geo.os) * geo.k, geo.top + (PIVOT.y + (y - PIVOT.y) * geo.os) * geo.k];
        const [x0, y0] = P(560, 280), [x1, y1] = P(940, 840);
        Object.assign(hit.style, { left: `${x0}px`, top: `${y0}px`, width: `${x1 - x0}px`, height: `${y1 - y0}px` });
      }
    }

    let shown = null;
    function show(name) {
      if (shown === name) return;
      if (shown) imgs[shown].classList.remove("show");
      if (name) imgs[name].classList.add("show");
      shown = name;
    }

    let run = null, pos = null, nextDir = 1, tilt = 0, lastY = null;
    function flyby() {
      if (run || !loaded) return;
      const dir = nextDir; nextDir = -nextDir;
      const r = Math.random;
      const y1 = 0.08 + r() * 0.14, y2 = 0.06 + r() * 0.16;      // stays high in the sky
      const from = dir > 0 ? -0.18 : 1.18, to = 1 - from;
      run = {
        t0: performance.now(), ms: 6200 + r() * 1800, dir,
        a: { x: from, y: y1 }, c: { x: 0.5, y: Math.min(y1, y2) - 0.05 - r() * 0.05 }, b: { x: to, y: y2 },
        s: 0.26 + r() * 0.06, phase: r() * 1000,
      };
      if (hit) hit.disabled = true;
    }
    function finish() {
      run = null; pos = null; lastY = null;
      flyer.classList.remove("on");
      setTimeout(() => { if (!run) show(null); }, 300);
      if (hit) hit.disabled = false;
      schedule();
    }

    function tick() {
      if (!run) return;
      const el = performance.now() - run.t0, p = el / run.ms;
      if (p >= 1) { finish(); return; }
      flyer.classList.add("on");
      const [ax, ay] = toPx(run.a), [cx, cy] = toPx(run.c), [bx, by] = toPx(run.b);
      const u = 1 - p;
      let x = u * u * ax + 2 * u * p * cx + p * p * bx;
      let y = u * u * ay + 2 * u * p * cy + p * p * by;
      const s = run.s * geo.os;

      // a few wingbeats, then a glide; the body bobs slightly with each beat
      const beat = (el + run.phase) % 2200;
      const flapping = beat < FLAP_MS * 12;
      const f = flapping ? FLAP[Math.floor(beat / FLAP_MS) % 4] : "fly2";
      show(f);
      if (flapping) y += Math.sin((beat / (FLAP_MS * 4)) * Math.PI * 2) * 3 * geo.k;   // gentle bob

      if (lastY !== null) tilt += (Math.max(-8, Math.min(8, (y - lastY) * 1.5)) - tilt) * 0.12;
      lastY = y;
      pos = { x, y };
      const ox = EYE.x * geo.k, oy = EYE.y * geo.k;
      flyer.style.transform = `translate3d(${x - ox}px, ${y - oy}px, 0) scale(${s * run.dir}, ${s}) rotate(${tilt * run.dir}deg)`;
    }

    // Wait until every frame is decoded so the first flight never flickers.
    let loaded = false;
    Promise.all(Object.values(imgs).map(im => im.decode ? im.decode().catch(() => {}) : Promise.resolve()))
      .then(() => { loaded = true; schedule(2200); });

    let timer = null;
    function schedule(delay) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const r = hero.getBoundingClientRect();
        if (document.visibilityState === "visible" && r.bottom > 0 && r.top < innerHeight) flyby();
        else schedule();
      }, delay ?? 12000 + Math.random() * 8000);
    }
    if (hit) hit.addEventListener("click", () => { clearTimeout(timer); flyby(); });

    // where the flying owl is, in hero coordinates (for the perched owl to watch it)
    return { tick, resize, pos: () => pos };
  }
}
