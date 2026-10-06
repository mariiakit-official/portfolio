const currentPage = document.body.dataset.page;
document.querySelectorAll(".main-nav a").forEach(link => {
  const active = link.dataset.page === currentPage;
  link.classList.toggle("active", active);
  if (active) link.setAttribute("aria-current", "page");
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

const owl = document.querySelector("#owl");
const owlHead = document.querySelector("#owlHead");
const leftPupil = document.querySelector("#leftPupil");
const rightPupil = document.querySelector("#rightPupil");

if (owl && owlHead && leftPupil && rightPupil) {
  let resetTimer;
  let rafId;

  const setEye = (el, baseX, baseY, dx, dy) => {
    el.setAttribute("cx", baseX + dx);
    el.setAttribute("cy", baseY + dy);
  };

  const follow = (x, y) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const rect = owl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.38;

      const nx = Math.max(-1, Math.min(1, (x - cx) / Math.max(240, window.innerWidth * .42)));
      const ny = Math.max(-1, Math.min(1, (y - cy) / Math.max(220, window.innerHeight * .42)));

      owlHead.style.transform = `rotate(${nx * 15}deg) translate(${nx * 4}px, ${ny * 7}px)`;
      setEye(leftPupil, 205, 216, nx * 9, ny * 7);
      setEye(rightPupil, 315, 216, nx * 9, ny * 7);
    });

    clearTimeout(resetTimer);
    resetTimer = setTimeout(resetOwl, 1500);
  };

  const resetOwl = () => {
    owlHead.style.transform = "rotate(0deg) translate(0,0)";
    setEye(leftPupil, 205, 216, 0, 0);
    setEye(rightPupil, 315, 216, 0, 0);
  };

  window.addEventListener("mousemove", e => follow(e.clientX, e.clientY), { passive: true });
  window.addEventListener("mouseleave", resetOwl);

  // Mobile/tablet: owl reacts gently to touch position.
  window.addEventListener("touchmove", e => {
    if (e.touches && e.touches[0]) follow(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}