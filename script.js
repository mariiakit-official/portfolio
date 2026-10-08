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
  const geo = { left: 0, top: 0, w: 0, h: 0, W: 0, H: 0, ftop: 0, k: 1 }; // k = screen px per artwork px

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
    Object.assign(geo, { left, top: y, w, h, W, H: hero.clientHeight, ftop: top, k: w / IMG_W });
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
      if (t - lastPointer > 3000) {           // no mouse: look around on its own
        tx = Math.sin(t / 2300) * 0.7 + Math.sin(t / 900) * 0.15;
        ty = Math.sin(t / 3100) * 0.4;
      }
      x += (tx - x) * 0.07; y += (ty - y) * 0.07;
      head.style.transform = `translate3d(${x * 0.35}%, ${y * 0.3}%, 0) rotate(${x * 5}deg)`;
      if (flight) flight.tick();
      if (visible) requestAnimationFrame(frame); else running = false;
    }
    const start = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(hero);
    start();
  }

  // ---------- Flying owl ----------
  function setupFlight() {
    const flyer = hero.querySelector(".flyer");
    const hit = hero.querySelector(".owl-hit");
    if (!flyer) return null;
    const imgs = {};
    flyer.querySelectorAll("img").forEach(im => (imgs[im.dataset.frame] = im));

    // Sprite geometry, in artwork pixels (see images/flight/*.webp, all cut to one cell).
    const CELL = { w: 1588, h: 1250 };          // cell size at full (landed) size
    const EYE = { x: 1052.4, y: 658.3 };        // eye position inside the cell = anchor
    // Landing: the wings-folding frame is centred on the perched owl's body, then cross-fades into it.
    const LAND2 = sc => ({ sp: "s", x: 742 + 361 * sc, y: 580 - 146 * sc });
    const FLAP = ["fly1", "fly2", "fly3", "fly4"];
    const FLAP_MS = 95;

    // Points: "h" = fraction of the hero box, "s" = artwork pixels on the stage.
    const H = (x, y) => ({ sp: "h", x, y });
    const A = (x, y) => ({ sp: "s", x, y });
    // "h" points live inside the picture area (on phones that is below the text).
    const toPx = p => p.sp === "h"
      ? [p.x * geo.W, geo.ftop + p.y * (geo.H - geo.ftop)]
      : [geo.left + p.x * geo.k, geo.top + p.y * geo.k];

    // Each step: duration, start/end point, optional curve point, size, direction, frames.
    const approach = [
      { ms: 1600, a: H(-0.08, 0.06), c: H(0.3, 0.1), b: H(0.58, 0.3), s: [0.15, 0.24], pose: "flap" },
      { ms: 900, a: H(0.58, 0.3), c: H(0.68, 0.34), b: A(840, 470), s: [0.24, 0.3], pose: "glide" },
      { ms: 480, a: A(840, 470), b: A(920, 520), s: [0.3, 0.36], pose: "flap" },
      { ms: 360, a: A(920, 520), b: A(985, 530), s: [0.38, 0.46], pose: ["land1"] },
      { ms: 260, a: A(985, 530), b: LAND2(0.6), s: [0.5, 0.6], pose: ["land2"], perch: true },
    ];
    const takeoff = [
      { ms: 260, a: LAND2(0.6), b: LAND2(0.6), s: [0.6, 0.56], pose: ["land2"], leave: true },
      { ms: 300, a: LAND2(0.6), b: A(1040, 470), s: [0.46, 0.4], pose: ["land1"] },
      { ms: 1400, a: A(1040, 470), c: H(0.95, 0.2), b: H(1.2, 0.0), s: [0.4, 0.22], pose: "flap" },
      { ms: 700, hidden: true },
      // back across the sky, right to left, small and far away (passes the moon)
      { ms: 4400, a: H(1.12, 0.2), c: H(0.5, 0.12), b: H(-0.15, 0.26), s: [0.14, 0.17], pose: "cruise", dir: -1 },
      { ms: 900, hidden: true },
    ];
    const SEQ = { intro: approach, patrol: takeoff.concat(approach) };

    let cell = { w: 0, h: 0 };
    function resize() {
      cell = { w: CELL.w * geo.k, h: CELL.h * geo.k };
      flyer.style.width = `${cell.w}px`;
      flyer.style.height = `${cell.h}px`;
      flyer.style.transformOrigin = `${EYE.x * geo.k}px ${EYE.y * geo.k}px`;
      if (hit) {   // clickable area over the perched owl
        Object.assign(hit.style, {
          left: `${geo.left + 560 * geo.k}px`, top: `${geo.top + 280 * geo.k}px`,
          width: `${380 * geo.k}px`, height: `${560 * geo.k}px`
        });
      }
    }

    let shown = null;
    function show(name) {
      if (shown === name) return;
      if (shown) imgs[shown].classList.remove("show");
      if (name) imgs[name].classList.add("show");
      shown = name;
    }

    const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const lerp = (a, b, t) => a + (b - a) * t;
    function bez(a, c, b, t) {
      const [ax, ay] = toPx(a), [bx, by] = toPx(b), [cx, cy] = c ? toPx(c) : [(ax + bx) / 2, (ay + by) / 2];
      const u = 1 - t;
      return [u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by];
    }

    let run = null;           // { steps, i, t0 }
    let lastY = null, tilt = 0;
    function play(name) {
      if (run || !loaded) return;
      run = { steps: SEQ[name], i: 0, t0: performance.now(), name };
      if (hit) hit.disabled = true;
      if (name === "intro") root.classList.add("owl-intro");
    }
    function finish() {
      run = null; flyer.classList.remove("on");          // fades out (CSS)
      setTimeout(() => { if (!run) show(null); }, 300);
      root.classList.remove("owl-intro", "owl-away");
      if (hit) hit.disabled = false;
      schedule();
    }

    function tick() {
      if (!run) return;
      const now = performance.now();
      let st = run.steps[run.i];
      let el = now - run.t0;
      while (el >= st.ms) {                  // advance to the current step
        run.t0 += st.ms; el -= st.ms; run.i++;
        if (st.perch) { finish(); return; }
        if (run.i >= run.steps.length) { finish(); return; }
        st = run.steps[run.i];
      }
      if (st.leave) root.classList.add("owl-away");
      if (st.perch) root.classList.remove("owl-intro", "owl-away");  // perched owl fades back in
      if (st.hidden) { flyer.classList.remove("on"); show(null); lastY = null; return; }
      flyer.classList.add("on");

      const p = el / st.ms, e = st.pose === "cruise" ? p : ease(p);
      const [x, y] = bez(st.a, st.c, st.b, e);
      const s = lerp(st.s[0], st.s[1], e);
      const dir = st.dir || 1;

      let f;
      if (Array.isArray(st.pose)) f = st.pose[0];
      else if (st.pose === "glide") f = "fly2";
      else if (st.pose === "cruise") {        // flap a few beats, then glide, repeat
        const beat = (el % 1600);
        f = beat < FLAP_MS * 8 ? FLAP[Math.floor(beat / FLAP_MS) % 4] : "fly2";
      } else f = FLAP[Math.floor(el / FLAP_MS) % 4];
      show(f);

      // bank slightly with vertical speed
      if (lastY !== null && !Array.isArray(st.pose)) tilt = lerp(tilt, Math.max(-10, Math.min(10, (y - lastY) * 1.6)), 0.15);
      else tilt = lerp(tilt, 0, 0.3);
      lastY = y;

      const ox = EYE.x * geo.k, oy = EYE.y * geo.k;
      flyer.style.transform =
        `translate3d(${x - ox}px, ${y - oy}px, 0) scale(${s * dir}, ${s}) rotate(${tilt * dir}deg)`;
    }

    // Wait until every frame is decoded so the first flight never flickers.
    let loaded = false;
    Promise.all(Object.values(imgs).map(im => im.decode ? im.decode().catch(() => {}) : Promise.resolve()))
      .then(() => {
        loaded = true;
        let seen = false;
        try { seen = !!sessionStorage.getItem("owlIntro"); sessionStorage.setItem("owlIntro", "1"); } catch (e) {}
        if (!seen) play("intro"); else schedule();
      });

    // Every so often, while the hero is on screen, the owl takes a lap side to side.
    let timer = null;
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const r = hero.getBoundingClientRect();
        if (document.visibilityState === "visible" && r.bottom > 0 && r.top < innerHeight) play("patrol");
        else schedule();
      }, 35000 + Math.random() * 20000);
    }
    if (hit) hit.addEventListener("click", () => { clearTimeout(timer); play("patrol"); });

    return { tick, resize };
  }
}