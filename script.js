/* ============================================================
   GRAPHIC DESIGN SITE — script.js  (fixed)
   ============================================================ */

/* ── Expandable Cards ─────────────────────────────────────── */
document.querySelectorAll('.expandable-card').forEach(card => {
  card.addEventListener('click', () => {
    const isOpen = card.classList.contains('open');
    // Close all cards first
    document.querySelectorAll('.expandable-card').forEach(c => c.classList.remove('open'));
    // If it wasn't open, open it
    if (!isOpen) card.classList.add('open');
  });
});

/* ── Dark Mode ────────────────────────────────────────────── */
const darkToggle = document.getElementById('darkToggle');

// Apply saved preference (or system preference) on load
const savedDark = localStorage.getItem('darkMode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedDark === 'true' || (savedDark === null && prefersDark)) {
  document.body.classList.add('dark');
  darkToggle.textContent = '☀';
} else {
  darkToggle.textContent = '☽';
}

darkToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  darkToggle.textContent = isDark ? '☀' : '☽';
  localStorage.setItem('darkMode', isDark);
});

/* ── Scroll Animations (Intersection Observer) ────────────── */
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => fadeObserver.observe(el));

/* ── Active Nav Link on Scroll ────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('div[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const match = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (match) match.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ── Back to Top ──────────────────────────────────────────── */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.style.display = window.scrollY > 400 ? 'block' : 'none';
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Image Slider ─────────────────────────────────────────── */
const track    = document.getElementById('sliderTrack');
const slides   = document.querySelectorAll('.slide');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

let currentSlide = 0;
let autoplayTimer;

// Build dots
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
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
nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });

startAutoplay();

/* ── Quiz ─────────────────────────────────────────────────── */
const quizData = [
  {
    question: "What does 'typography' refer to in graphic design?",
    options: ["The use of color in a design", "The arrangement and style of text", "Creating photographic effects", "Designing website layouts"],
    answer: 1
  },
  {
    question: "Which color pairing is considered complementary?",
    options: ["Red and orange", "Blue and green", "Red and green", "Yellow and beige"],
    answer: 2
  },
  {
    question: "What is a vector graphic?",
    options: ["A photo made of pixels", "An image that loses quality when scaled", "A math-based image that scales without losing quality", "A scanned drawing"],
    answer: 2
  },
  {
    question: "Which software is best known for creating vector illustrations?",
    options: ["Adobe Photoshop", "Adobe Premiere", "Adobe Illustrator", "Adobe Lightroom"],
    answer: 2
  },
  {
    question: "What does 'white space' (negative space) do in a design?",
    options: ["Wastes space on the page", "Improves readability and focuses attention", "Makes designs look unfinished", "Increases file size"],
    answer: 1
  }
];

let currentQ = 0;
let score = 0;
let answered = false;

const quizContent  = document.getElementById('quiz-content');
const quizResult   = document.getElementById('quiz-result');
const quizFooter   = document.getElementById('quiz-footer');
const resultScore  = document.getElementById('result-score');
const resultMsg    = document.getElementById('result-msg');
const nextBtn2     = document.getElementById('next-btn');
const retryBtn     = document.getElementById('retry-btn');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');

function loadQuestion() {
  answered = false;
  nextBtn2.disabled = true;

  const q = quizData[currentQ];
  progressText.textContent = `Question ${currentQ + 1} of ${quizData.length}`;
  progressFill.style.width = `${(currentQ / quizData.length) * 100}%`;

  quizContent.innerHTML = `
    <p class="quiz-question">${q.question}</p>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" data-index="${i}">${opt}</button>
      `).join('')}
    </div>
  `;

  quizContent.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
  });
}

function selectAnswer(selected) {
  if (answered) return;
  answered = true;

  const correct = quizData[currentQ].answer;
  const options = quizContent.querySelectorAll('.quiz-option');

  options.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    if (i === selected && selected !== correct) btn.classList.add('wrong');
  });

  if (selected === correct) score++;
  nextBtn2.disabled = false;
}

function showResult() {
  quizContent.innerHTML = '';
  quizFooter.classList.add('hidden');
  quizResult.classList.remove('hidden');

  const pct = Math.round((score / quizData.length) * 100);
  resultScore.textContent = `${score} / ${quizData.length}`;

  let msg;
  if (pct === 100) msg = "Perfect score! You're a design pro.";
  else if (pct >= 60) msg = "Good work! Keep exploring graphic design.";
  else msg = "Keep learning — you'll get there!";

  resultMsg.textContent = msg;
}

nextBtn2.addEventListener('click', () => {
  currentQ++;
  if (currentQ < quizData.length) {
    loadQuestion();
  } else {
    progressFill.style.width = '100%';
    showResult();
  }
});

retryBtn.addEventListener('click', () => {
  currentQ = 0;
  score = 0;
  quizResult.classList.add('hidden');
  quizFooter.classList.remove('hidden');
  loadQuestion();
});

// Kick off the quiz
loadQuestion();

/* ── Contact Form ─────────────────────────────────────────── */
const contactForm  = document.getElementById('contactForm');
const formSubmit   = document.getElementById('formSubmit');
const formSuccess  = document.getElementById('formSuccess');

formSubmit.addEventListener('click', () => {
  const name    = document.getElementById('fname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmsg').value.trim();

  const nameErr  = document.getElementById('nameErr');
  const emailErr = document.getElementById('emailErr');
  const msgErr   = document.getElementById('msgErr');

  // Clear previous errors
  nameErr.textContent  = '';
  emailErr.textContent = '';
  msgErr.textContent   = '';

  let valid = true;

  if (!name) {
    nameErr.textContent = 'Please enter your name.';
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailErr.textContent = 'Please enter a valid email.';
    valid = false;
  }
  if (!message) {
    msgErr.textContent = 'Please enter a message.';
    valid = false;
  }

  if (valid) {
    formSuccess.classList.remove('hidden');
    contactForm.reset();
    setTimeout(() => formSuccess.classList.add('hidden'), 4000);
  }
});

/* ── Helper ───────────────────────────────────────────────── */
function display() {
  alert("Graphic design is the art of planning and projecting ideas and experiences with visual and textual content. Start your journey today!");
}
