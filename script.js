const currentPage = document.body.dataset.page;

document.querySelectorAll(".main-nav a").forEach((link) => {
  const active = link.dataset.page === currentPage;

  link.classList.toggle("active", active);

  if (active) {
    link.setAttribute("aria-current", "page");
  }
});


// ------------------------------
// MOBILE NAVIGATION
// ------------------------------

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}


// ------------------------------
// INTERACTIVE OWL
// ------------------------------

const owl = document.querySelector("#owl");
const hero = document.querySelector(".hero");

if (owl && hero) {

  let targetX = 0;
  let targetY = 0;

  let currentX = 0;
  let currentY = 0;

  let animationFrame;


  function animateOwl() {

    // Smooth movement
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;


    // Very small movement so the owl
    // still looks like she is sitting
    // naturally on the branch.

    const moveX = currentX * 13;
    const moveY = currentY * 7;

    const rotate = currentX * 4;


    owl.style.transform = `
      translate3d(${moveX}px, ${moveY}px, 0)
      rotate(${rotate}deg)
    `;


    animationFrame =
      requestAnimationFrame(animateOwl);
  }


  function followCursor(event) {

    const heroRect =
      hero.getBoundingClientRect();


    const mouseX =
      event.clientX - heroRect.left;

    const mouseY =
      event.clientY - heroRect.top;


    targetX =
      (mouseX / heroRect.width - 0.5) * 2;

    targetY =
      (mouseY / heroRect.height - 0.5) * 2;


    // Prevent excessive movement

    targetX =
      Math.max(-1, Math.min(1, targetX));

    targetY =
      Math.max(-1, Math.min(1, targetY));
  }


  // Follow mouse
  hero.addEventListener(
    "mousemove",
    followCursor
  );


  // Return to original position
  hero.addEventListener(
    "mouseleave",
    () => {

      targetX = 0;
      targetY = 0;

    }
  );


  // Gentle touch response for tablets/mobile
  hero.addEventListener(
    "touchmove",
    (event) => {

      if (!event.touches.length) return;

      followCursor(event.touches[0]);

    },
    { passive: true }
  );


  // Start animation
  animateOwl();


  // Stop unnecessary animation
  window.addEventListener(
    "beforeunload",
    () => {
      cancelAnimationFrame(animationFrame);
    }
  );
}