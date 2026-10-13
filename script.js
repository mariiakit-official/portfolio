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

  function startBlinking() {
    if (!blink || reduced) return;
    // decode the hidden closed-eye frame first so the very first blink is never skipped
    (blink.decode ? blink.decode().catch(() => {}) : Promise.resolve()).then(blinkLoop);
  }

  // ---------- Landing video: first visit of the session only ----------
  // The video's first frame is the empty branch (same as the background) and its last
  // frame is the perched owl (same as owl-perched.webp), so nothing jumps at either end.
  const video = stage.querySelector(".owl-video");
  const showPerched = () => root.classList.remove("owl-intro");

  function playLanding() {
    return new Promise(done => {
      let finished = false;
      const finish = () => {
        if (finished) return; finished = true;
        clearTimeout(giveUp);
        showPerched();                                   // perched owl fades in over the matching last frame
        setTimeout(() => {                               // then the video is removed
          video.classList.remove("playing"); video.pause();
          video.removeAttribute("src"); video.load();
        }, 700);
        done();
      };
      const giveUp = setTimeout(finish, 6000);         // slow network or blocked autoplay: just show the owl
      video.addEventListener("playing", () => { clearTimeout(giveUp); video.classList.add("playing"); }, { once: true });
      video.addEventListener("ended", () => setTimeout(finish, 350), { once: true });
      video.addEventListener("error", finish, { once: true });
      video.muted = true;
      video.src = "videos/owl-landing.mp4";
      video.play().catch(finish);
    });
  }

  async function start() {
    if (video && root.classList.contains("owl-intro")) {
      try { sessionStorage.setItem("owlIntro", "1"); } catch (e) {}
      await playLanding();
    } else {
      showPerched();
    }
    startBlinking();
  }
  start();
}
