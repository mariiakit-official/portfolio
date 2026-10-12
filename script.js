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
// Layers (images/winter/): forest background, perched owl, blink and head-turn patches,
// and four flight poses. All share the 1672x941 artwork, so they line up exactly.
const hero = document.querySelector(".hero");
const stage = document.querySelector(".owl-stage");
const copy = document.querySelector(".hero-copy");
const root = document.documentElement;

if (hero && stage) {
  const IMG_W = 1672, IMG_H = 941;
  const OWL = { x: 0.725, y: 0.47 };              // perched owl centre in the artwork
  const mobile = window.matchMedia("(max-width: 700px), (max-width: 1050px) and (orientation: portrait)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const geo = { left: 0, top: 0, k: 1 };          // k = screen px per artwork px

  // Cover the hero like background-size: cover, keeping the owl near --owl-x.
  function layout() {
    const W = hero.clientWidth;
    const top = mobile.matches && copy ? copy.offsetTop + copy.offsetHeight + 8 : 0;
    const H = hero.clientHeight - top;
    const css = getComputedStyle(hero);
    const px = parseFloat(css.getPropertyValue("--owl-x")) || 0.5;
    const py = parseFloat(css.getPropertyValue("--owl-y")) || 0.5;
    const cover = Math.max(W, H * IMG_W / IMG_H);
    let w = Math.max(cover, (px * W) / OWL.x, ((1 - px) * W) / (1 - OWL.x));
    w = Math.min(w, cover * 1.6);
    const h = w * IMG_H / IMG_W;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const left = clamp(px * W - OWL.x * w, W - w, 0);
    const y = top + clamp(py * H - OWL.y * h, H - h, 0);
    Object.assign(stage.style, { left: `${left}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, right: "auto", bottom: "auto" });
    hero.style.setProperty("--frame-top", `${top}px`);
    Object.assign(geo, { left, top: y, k: w / IMG_W });
  }
  layout();
  new ResizeObserver(layout).observe(hero);
  mobile.addEventListener("change", layout);

  const blink = stage.querySelector(".owl-blink");
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);

  // The fly-in entrance is temporarily disabled (it will come back as a short video),
  // and the head stays upright and facing forward: no head movement.
  root.classList.remove("owl-intro");

  // ---------- Natural blinking: irregular, quick, sometimes a double blink ----------
  async function blinkOnce() { blink.classList.add("on"); await wait(rand(110, 150)); blink.classList.remove("on"); }
  async function blinkLoop() {
    while (true) {
      await wait(rand(2600, 7200));
      if (document.hidden) continue;
      await blinkOnce();
      if (Math.random() < 0.18) { await wait(rand(140, 220)); await blinkOnce(); }
    }
  }

  if (blink && !reduced) {
    // decode the hidden closed-eye frame first so the very first blink is never skipped
    (blink.decode ? blink.decode().catch(() => {}) : Promise.resolve()).then(blinkLoop);
  }
}
