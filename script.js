const slides = [...document.querySelectorAll(".slide")];
const prevButton = document.querySelector(".slide-arrow.prev");
const nextButton = document.querySelector(".slide-arrow.next");
const currentLabel = document.querySelector(".current-label");
const currentHeroTitle = document.querySelector(".current-hero-title");
const exploreButton = document.querySelector(".outline-button");
const heroLine = document.querySelector(".hero-line");
const menuButton = document.querySelector(".menu-button");
const menuClose = document.querySelector(".menu-close");
const menuScrim = document.querySelector(".menu-scrim");
const mobilePanel = document.querySelector(".mobile-panel");
const slideDuration = 5000;
const slideSwitchLead = 1000;
let active = 0;
let switchTimer;
let cycleTimer;

function loadImage(image) {
  if (!image || image.hasAttribute("src") || !image.dataset.src) return;
  image.src = image.dataset.src;
}

function loadImages(container) {
  container?.querySelectorAll("img[data-src]").forEach(loadImage);
}

function prepareSlide(index) {
  const slide = slides[(index + slides.length) % slides.length];
  loadImages(slide);
}

function showSlide(index) {
  active = (index + slides.length) % slides.length;
  prepareSlide(active);
  prepareSlide(active + 1);
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === active);
  });
  const slide = slides[active];
  currentLabel.textContent = slide.dataset.label;
  currentHeroTitle.textContent = slide.dataset.title;
  exploreButton.setAttribute("href", `#${slide.dataset.target}`);
}

function setMenuOpen(isOpen) {
  mobilePanel.classList.toggle("open", isOpen);
  menuScrim.classList.toggle("open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  mobilePanel.setAttribute("aria-hidden", String(!isOpen));
}

function restartProgress() {
  heroLine.classList.remove("progress-running");
  void heroLine.offsetWidth;
  heroLine.classList.add("progress-running");
}

function restartTimer() {
  window.clearTimeout(switchTimer);
  window.clearTimeout(cycleTimer);
  restartProgress();
  switchTimer = window.setTimeout(() => showSlide(active + 1), slideDuration - slideSwitchLead);
  cycleTimer = window.setTimeout(restartTimer, slideDuration);
}

prevButton.addEventListener("click", () => {
  showSlide(active - 1);
  restartTimer();
});

nextButton.addEventListener("click", () => {
  showSlide(active + 1);
  restartTimer();
});

menuButton.addEventListener("click", () => {
  setMenuOpen(!mobilePanel.classList.contains("open"));
});

menuClose.addEventListener("click", () => setMenuOpen(false));
menuScrim.addEventListener("click", () => setMenuOpen(false));

mobilePanel.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    setMenuOpen(false);
  });
});

function updateSubpages() {
  const hash = window.location.hash;
  const showStudio = hash === "#designer";
  const showProjects = hash === "#private-projects" || /^#project-\d+/.test(hash);
  const caseMatch = hash.match(/^#case-(0[1-6])$/);
  const showCase = Boolean(caseMatch);
  document.body.classList.toggle("show-studio", showStudio);
  document.body.classList.toggle("show-projects", showProjects);
  document.body.classList.toggle("show-case", showCase);
  document.body.classList.remove("case-01", "case-02", "case-03", "case-04", "case-05", "case-06");
  if (showStudio || showProjects || showCase) {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }
  if (caseMatch) {
    document.body.classList.add(`case-${caseMatch[1]}`);
    loadImages(document.querySelector(`#case-${caseMatch[1]}`));
  }
}

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    image.closest(".slide, .project-card")?.classList.add("image-missing");
  });
});

updateSubpages();
showSlide(0);
if (document.readyState === "complete") {
  restartTimer();
} else {
  window.addEventListener("load", restartTimer, { once: true });
}
window.addEventListener("hashchange", updateSubpages);
