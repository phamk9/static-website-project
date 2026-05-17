/* ============================================================
   GRAPHIC DESIGN SITE — script.js  (fixed)
   ============================================================ */

/* ── Expandable Cards ─────────────────────────────────────── */
document.querySelectorAll('.expandable-card').forEach(card => { //selects all elements with class expandable-card
  card.addEventListener('click', () => { //click event listener to each card
    const isOpen = card.classList.contains('open'); //checks if card has open class
    // closes all cards by removing open from every expandable card
    document.querySelectorAll('.expandable-card').forEach(c => c.classList.remove('open'));
    // If card wasn't open, adds open to it
    if (!isOpen) card.classList.add('open');
  });
}); //Allows one card to be open at a time. Clicking one card will close any other open.

/* ── Dark Mode ────────────────────────────────────────────── */
const darkToggle = document.getElementById('darkToggle'); //gets dark mode toggle button

// Apply saved preference (or system preference) on load
const savedDark = localStorage.getItem('darkMode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedDark === 'true' || (savedDark === null && prefersDark)) { //If the user chose dark mode before, or there is no saved preference and the system prefers dark, adds dark to document body and sets toggle to sun icon
  document.body.classList.add('dark');
  darkToggle.textContent = '☀';
} else {
  darkToggle.textContent = '☽'; //otherwise, sets toggle to moon icon
}

darkToggle.addEventListener('click', () => { //click handler toggles dark class on body, updates toggle icon, and saves preference to localStorage
  const isDark = document.body.classList.toggle('dark');
  darkToggle.textContent = isDark ? '☀' : '☽';
  localStorage.setItem('darkMode', isDark);//Reads saved preference from localStorage and applies it. Otherwise defaults to system preference. Saves across sessions.
});

/* ── Scroll Animations (Intersection Observer) ────────────── */
const fadeEls = document.querySelectorAll('.fade-in'); //Selects all element with fade-in class
const fadeObserver = new IntersectionObserver((entries) => { //watches when elements come into view
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target); //once an element is visible, adds visible class and stops observing it to prevent repeated animation
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => fadeObserver.observe(el)); //starts observing each fade-in element

/* ── Active Nav Link on Scroll ────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link'); //selects all nav links with class nav-lin
const sections = document.querySelectorAll('div[id]'); //selects all div elements with an id

const navObserver = new IntersectionObserver((entries) => { //watches when sections come into view
  entries.forEach(entry => { 
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const match = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (match) match.classList.add('active'); //when a section is in view, removes active from all nav links and adds it to the one that matches the section's id
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' }); //allows the active state to change when a section is near the viewport center instead of waiting for it to be fully in view

sections.forEach(s => navObserver.observe(s));

/* ── Back to Top ──────────────────────────────────────────── */
const backToTop = document.getElementById('backToTop'); //finds element with id backToTop

window.addEventListener('scroll', () => { 
  backToTop.style.display = window.scrollY > 400 ? 'block' : 'none'; //shows button when user scrolls down 400px, hides it otherwise
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}); //click button scrolls the page smoothly back to the top

/* ── Image Slider ─────────────────────────────────────────── */
const track    = document.getElementById('sliderTrack'); //locates dom elements
const slides   = document.querySelectorAll('.slide');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

let currentSlide = 0; //uses currentSlide to track which slide is active. starts at 0 (first slide).
let autoplayTimer;

// Build dots , creates one button per slide and marks first dot as active. adds click event to each dot to jump to corresponding slide and reset autoplay.
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
  dotsWrap.appendChild(dot);
});

function goToSlide(index) { // takes an index, calculates correct slide number using modulo to wrap around, moves the track to show current slide and updates active state of dots
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`; //moves the track to show current slide by transalating it left 100 percent
  document.querySelectorAll('.slider-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

function startAutoplay() { //begins timer that advances slide every 4 seconds by calling goToSlide
  autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
}

function resetAutoplay() { //clears current timer and restarts it allowing consistent timing betwen user interactions and automatic slide changes
  clearInterval(autoplayTimer);
  startAutoplay();
}

prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoplay(); }); //previous and next buttons call goToSlide with currentSlide -1 or +1 correspond to left and right and reset autoplay
nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });

startAutoplay();

/* ── Quiz ─────────────────────────────────────────────────── */
const quizData = [ //array of quiz questions, options, and correct answers
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

let currentQ = 0; //tracks current question index
let score = 0; //for correct answers
let answered = false; //to prevent multiple answers for the same question

//grabs dom elements for quiz content, result display, and controls
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
  answered = false; //resets answered to false for new question
  nextBtn2.disabled = true; //disables next button until an answer is selected

  const q = quizData[currentQ]; //loads current question data
  progressText.textContent = `Question ${currentQ + 1} of ${quizData.length}`; //updates progress text to show current question number and total questions
  progressFill.style.width = `${(currentQ / quizData.length) * 100}%`; //updates progress bar fill based on current question index

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

function selectAnswer(selected) { //prevents multiple answers for same question
  if (answered) return; //if answer is already selected, does nothing
  answered = true; //sets answered to true to prevent further selections

  const correct = quizData[currentQ].answer; //finds correct answer index for current question
  const options = quizContent.querySelectorAll('.quiz-option'); //grabs all option buttons

  options.forEach((btn, i) => { //disables all buttons and adds correct/wrong classes based on selection
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    if (i === selected && selected !== correct) btn.classList.add('wrong'); //adds wrong class if selected question is incorrect
  });

  if (selected === correct) score++; 
  nextBtn2.disabled = false; //enables next button after answer is chosen, allowing user to proceed to next question/see results
}

function showResult() {
  quizContent.innerHTML = ''; //clears quiz content
  quizFooter.classList.add('hidden'); //hides quiz footer with next button
  quizResult.classList.remove('hidden'); // shows result section

  const pct = Math.round((score / quizData.length) * 100); //calculates percentage score and rounds it to nearest whole number
  resultScore.textContent = `${score} / ${quizData.length}`; //displays score as "X / Y"

  let msg; //messages based on score percentage
  if (pct === 100) msg = "Perfect score! You're a design pro.";
  else if (pct >= 60) msg = "Good work! Keep exploring graphic design.";
  else msg = "Keep learning — you'll get there!";

  resultMsg.textContent = msg;
}

nextBtn2.addEventListener('click', () => { //adds click event to next button to advance quiz or show results
  currentQ++; //advances to next question index
  if (currentQ < quizData.length) { //if there are more questions, loads next question
    loadQuestion();
  } else {
    progressFill.style.width = '100%'; //fills progress bar to 100% when quiz is complete
    showResult();
  }
});

retryBtn.addEventListener('click', () => { //resets quiz state to allow user to retake the quiz
  currentQ = 0;
  score = 0;
  quizResult.classList.add('hidden');
  quizFooter.classList.remove('hidden');
  loadQuestion();
});

// Kick off the quiz
loadQuestion(); //starts the quiz by loading the first question when the page loads

/* ── Contact Form ─────────────────────────────────────────── */
const contactForm  = document.getElementById('contactForm'); //grabs contact form element
const formSubmit   = document.getElementById('formSubmit');//grabs submit button element
const formSuccess  = document.getElementById('formSuccess');///grabs success message element

formSubmit.addEventListener('click', () => {
  const name    = document.getElementById('fname').value.trim(); //grabs and trims values from form fields
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmsg').value.trim();

  const nameErr  = document.getElementById('nameErr'); //grabs error message elements for each field
  const emailErr = document.getElementById('emailErr');
  const msgErr   = document.getElementById('msgErr');

  // Clear previous errors on submit
  nameErr.textContent  = '';
  emailErr.textContent = '';
  msgErr.textContent   = '';

  let valid = true;

  if (!name) { //if name field is empty, sets error message
    nameErr.textContent = 'Please enter your name.';
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { //if email field is empty or invalid email, sets error message
    emailErr.textContent = 'Please enter a valid email.';
    valid = false;
  }
  if (!message) { //if message field is empty, sets error message
    msgErr.textContent = 'Please enter a message.';
    valid = false;
  }

  if (valid) { //if all fields are valid, shows success message, resets form, and hides success message after 4 seconds
    formSuccess.classList.remove('hidden');
    contactForm.reset();
    setTimeout(() => formSuccess.classList.add('hidden'), 4000);
  }
});

/* ── Helper ───────────────────────────────────────────────── */
function display() { //shows an alert about graphic design when called.
  alert("Graphic design is the art of planning and projecting ideas and experiences with visual and textual content. Start your journey today!");
}
