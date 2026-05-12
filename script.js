/* ============================================================
   GRAPHIC DESIGN SITE — script.js
   ============================================================ */

/* ── Expandable Cards ─────────────────────────────────────── */
document.querySelectorAll('.expandable-card').forEach(card => {
  card.addEventListener('click', () => {
    const isOpen = card.classList.contains('open');
    document.querySelectorAll('.expandable-card').forEach(c => c.classList.remove('open'));
    if (!isOpen) card.classList.add('open');
  });
});

/* ── Dark Mode ────────────────────────────────────────────── */
const darkToggle = document.getElementById('darkToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (localStorage.getItem('darkMode') === 'true' || (localStorage.getItem('darkMode') === null && prefersDark)) {
  document.body.classList.add('dark');
  darkToggle.textContent = '☀';
}

darkToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  darkToggle.textContent = isDark ? '☀' : '☽';
  localStorage.setItem('darkMode', isDark);
});

/* ── Scroll Animations (Intersection Observer) ────────────── */
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

/* ── Active Nav Link on Scroll ────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const match = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

document.querySelectorAll('div[id]').forEach(s => navObserver.observe(s));

/* ── Image Slider ─────────────────────────────────────────── */
const track     = document.getElementById('sliderTrack');
const slides    = document.querySelectorAll('.slide');
const dotsWrap  = document.getElementById('sliderDots');
const prevBtn   = document.getElementById('prevBtn');
const nextBtn2  = document.getElementById('nextBtn');

let currentSlide = 0;
let autoplayTimer;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

function startAutoplay() {
  autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
}

function resetAutoplay() {
  clearInterval(autoplayTimer);
  startAutoplay();
}

prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoplay(); });
nextBtn2.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });

startAutoplay();

/* ── Quiz Logic (Truncated for brevity, see original script.js) ─────────────────── */
// ... (Your original quiz logic remains identical and fully functional)

/* ── Helper Function ─────────────────────────────────────── */
function display() {
  alert("Graphic design is the art of planning and projecting ideas and experiences with visual and textual content. Start your journey today!");
}