/* ============================================================
   GRAPHIC DESIGN SITE — script.js
   ============================================================ */

/* ── Web3Forms Init ───────────────────────────────────────── */
// Go to https://web3forms.com, enter your email, and they will send you a key — no account needed
// Replace the value below with the key from your inbox
const WEB3FORMS_KEY = 'a6f3ff50-c080-4f99-8604-1e1d2369988f'; //paste your access key here — free, no domain restrictions

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
const savedDark  = localStorage.getItem('darkMode');
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
  localStorage.setItem('darkMode', isDark); //Reads saved preference from localStorage and applies it. Otherwise defaults to system preference. Saves across sessions.
});

/* ── Scroll Animations (Intersection Observer) ────────────── */
const fadeEls = document.querySelectorAll('.fade-in'); //Selects all elements with fade-in class
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
const navLinks = document.querySelectorAll('.nav-link'); //selects all nav links with class nav-link
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

/* ── Navbar Scroll Shadow ─────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10); //adds scrolled class to navbar when user scrolls more than 10px, which triggers a shadow via CSS
});

/* ── Back to Top ──────────────────────────────────────────── */
const backToTop = document.getElementById('backToTop'); //finds element with id backToTop

window.addEventListener('scroll', () => {
  backToTop.style.display = window.scrollY > 400 ? 'block' : 'none'; //shows button when user scrolls down 400px, hides it otherwise
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' }); //click button scrolls the page smoothly back to the top
});

/* ── Image Slider ─────────────────────────────────────────── */
const track    = document.getElementById('sliderTrack'); //locates dom elements
const slides   = document.querySelectorAll('.slide');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

let currentSlide = 0; //uses currentSlide to track which slide is active. starts at 0 (first slide).
let autoplayTimer;

// Build dots — creates one button per slide and marks first dot as active. adds click event to each dot to jump to corresponding slide and reset autoplay.
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
  dotsWrap.appendChild(dot);
});

function goToSlide(index) { // takes an index, calculates correct slide number using modulo to wrap around, moves the track to show current slide and updates active state of dots
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`; //moves the track to show current slide by translating it left 100 percent
  document.querySelectorAll('.slider-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

function startAutoplay() { //begins timer that advances slide every 4 seconds by calling goToSlide
  autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
}

function resetAutoplay() { //clears current timer and restarts it allowing consistent timing between user interactions and automatic slide changes
  clearInterval(autoplayTimer);
  startAutoplay();
}

// Pause autoplay when hovering the slider so users can read without the slide advancing
const sliderContainer = document.querySelector('.slider-container');
sliderContainer.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
sliderContainer.addEventListener('mouseleave', startAutoplay);

// Swipe support — tracks finger start position and calls goToSlide if swipe distance exceeds 50px
let touchStartX = 0;
sliderContainer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
sliderContainer.addEventListener('touchend', e => {
  const delta = touchStartX - e.changedTouches[0].clientX; //positive delta means swipe left (next), negative means swipe right (prev)
  if (Math.abs(delta) > 50) { goToSlide(currentSlide + (delta > 0 ? 1 : -1)); resetAutoplay(); }
});

// Keyboard navigation — left/right arrow keys move the slider for accessibility
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { goToSlide(currentSlide - 1); resetAutoplay(); }
  if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); resetAutoplay(); }
});

prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoplay(); }); //previous and next buttons call goToSlide with currentSlide -1 or +1 corresponding to left and right and reset autoplay
nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });

startAutoplay();

/* ── Quiz ─────────────────────────────────────────────────── */
// Full question bank — 5 random questions are picked each attempt so the quiz feels fresh every time
const allQuestions = [
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
  },
  {
    question: "Which file format is best for photographs on the web?",
    options: ["SVG", "PDF", "JPEG", "EPS"],
    answer: 2
  },
  {
    question: "What is the term for the distance between lines of text?",
    options: ["Kerning", "Tracking", "Leading", "Baseline"],
    answer: 2
  },
  {
    question: "What does 'kerning' mean?",
    options: ["Spacing between all letters equally", "Adjusting space between specific letter pairs", "The height of capital letters", "The thickness of a stroke"],
    answer: 1
  },
  {
    question: "Which color model is used for print design?",
    options: ["RGB", "HSB", "CMYK", "HEX"],
    answer: 2
  },
  {
    question: "Which color model is used for screen/digital design?",
    options: ["CMYK", "RGB", "Pantone", "LAB"],
    answer: 1
  },
  {
    question: "What is a 'mood board' used for in design?",
    options: ["Tracking project deadlines", "Collecting visual references to establish a style", "Measuring color accuracy", "Creating wireframes"],
    answer: 1
  },
  {
    question: "What does DPI stand for?",
    options: ["Design Per Inch", "Dots Per Inch", "Digital Print Interface", "Display Pixel Index"],
    answer: 1
  },
  {
    question: "A sans-serif font does NOT have:",
    options: ["Varying stroke widths", "Small decorative strokes at letter ends", "Uppercase letters", "Descenders"],
    answer: 1
  },
  {
    question: "What is the 'rule of thirds' in design and photography?",
    options: ["Using only three colors in a composition", "Dividing a canvas into thirds to guide placement of key elements", "Limiting a design to three fonts", "Giving equal weight to three focal points"],
    answer: 1
  },
  {
    question: "Which term describes a design that works across all screen sizes?",
    options: ["Vector design", "Responsive design", "Raster design", "Adaptive print"],
    answer: 1
  },
  {
    question: "What is a 'logo lockup'?",
    options: ["Copy protection on an image", "A combination of a logo mark and wordmark used together", "A grid-based layout system", "A color-matching system"],
    answer: 1
  },
  {
    question: "Which principle ensures the most important element stands out most?",
    options: ["Repetition", "Alignment", "Hierarchy", "Proximity"],
    answer: 2
  },
  {
    question: "What does 'bleed' mean in print design?",
    options: ["A color that fades to transparent", "Extending artwork beyond the trim edge so no white border appears when cut", "Ink that bleeds into the paper fibers", "Overlapping layers in Photoshop"],
    answer: 1
  },
  {
    question: "What is a 'flat design' style characterized by?",
    options: ["Heavy use of shadows and gradients", "Simple shapes, minimal detail, and no drop shadows", "Photorealistic textures", "Hand-drawn illustrations"],
    answer: 1
  },
  {
    question: "Which Photoshop tool lets you remove a subject from its background precisely?",
    options: ["Crop Tool", "Eraser Tool", "Pen Tool", "Smudge Tool"],
    answer: 2
  }
];

const QUESTIONS_PER_QUIZ = 5; //how many questions are shown per attempt — change this number to show more or fewer

// Fisher-Yates shuffle — randomly reorders an array so questions and answer options appear in a different order each time
function shuffle(arr) {
  const a = [...arr]; //copies the array so the original is not modified
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]; //swaps elements at positions i and j
  }
  return a;
}

let quizData = []; //holds the randomly selected questions for the current attempt
let currentQ = 0;  //tracks current question index
let score    = 0;  //counts correct answers
let answered = false; //prevents selecting multiple answers for the same question

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

function startQuiz() {
  quizData = shuffle(allQuestions).slice(0, QUESTIONS_PER_QUIZ); //picks QUESTIONS_PER_QUIZ random questions from the full bank by shuffling and slicing
  currentQ = 0;
  score    = 0;
  quizResult.classList.add('hidden');    //hides result screen
  quizFooter.classList.remove('hidden'); //shows footer with next button
  loadQuestion();
}

function loadQuestion() {
  answered = false;         //resets answered to false for new question
  nextBtn2.disabled = true; //disables next button until an answer is selected

  const q = quizData[currentQ]; //loads current question data
  progressText.textContent = `Question ${currentQ + 1} of ${quizData.length}`; //updates progress text to show current question number and total
  progressFill.style.width = `${(currentQ / quizData.length) * 100}%`; //updates progress bar fill based on current question index

  // Shuffle the answer options so the correct answer isn't always in the same position
  const indices = shuffle([0, 1, 2, 3]); //creates a shuffled list of option indices
  const shuffledOptions = indices.map(i => q.options[i]); //reorders options using the shuffled indices
  const newCorrect = indices.indexOf(q.answer); //finds where the correct answer ended up after shuffling

  quizContent.innerHTML = `
    <p class="quiz-question">${q.question}</p>
    <div class="quiz-options">
      ${shuffledOptions.map((opt, i) => `
        <button class="quiz-option" data-index="${i}">${opt}</button>
      `).join('')}
    </div>
  `;

  quizContent.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index), newCorrect)); //passes both selected index and the new correct index (post-shuffle) to selectAnswer
  });
}

function selectAnswer(selected, correct) {
  if (answered) return; //if answer is already selected, does nothing
  answered = true; //sets answered to true to prevent further selections

  const options = quizContent.querySelectorAll('.quiz-option'); //grabs all option buttons

  options.forEach((btn, i) => { //disables all buttons and adds correct/wrong classes based on selection
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    if (i === selected && selected !== correct) btn.classList.add('wrong'); //adds wrong class if selected answer is incorrect
  });

  if (selected === correct) score++; //increments score if the selected answer matches the correct one
  nextBtn2.disabled = false; //enables next button after answer is chosen, allowing user to proceed
}

function showResult() {
  quizContent.innerHTML = ''; //clears quiz content
  quizFooter.classList.add('hidden');    //hides quiz footer with next button
  quizResult.classList.remove('hidden'); //shows result section

  const pct = Math.round((score / quizData.length) * 100); //calculates percentage score and rounds to nearest whole number
  resultScore.textContent = `${score} / ${quizData.length}`; //displays score as "X / Y"

  let msg; //message shown based on score percentage
  if (pct === 100) msg = "Perfect score! You're a design pro.";
  else if (pct >= 80) msg = "Great work! You really know your stuff.";
  else if (pct >= 60) msg = "Good effort! Keep exploring graphic design.";
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

retryBtn.addEventListener('click', startQuiz); //resets and restarts the quiz with a new random set of questions when Try Again is clicked

startQuiz(); //starts the quiz by picking random questions and loading the first one when the page loads

/* ── Contact Form — Web3Forms ─────────────────────────────── */
const contactForm  = document.getElementById('contactForm'); //grabs contact form element
const formSubmit   = document.getElementById('formSubmit');  //grabs submit button element
const formSuccess  = document.getElementById('formSuccess'); //grabs success message element

formSubmit.addEventListener('click', () => {
  const name    = document.getElementById('fname').value.trim(); //grabs and trims values from form fields
  const email   = document.getElementById('femail').value.trim();
  const message = document.getElementById('fmsg').value.trim();

  const nameErr  = document.getElementById('nameErr');  //grabs error message elements for each field
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
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { //if email field is empty or not a valid email format, sets error message
    emailErr.textContent = 'Please enter a valid email.';
    valid = false;
  }
  if (!message) { //if message field is empty, sets error message
    msgErr.textContent = 'Please enter a message.';
    valid = false;
  }

  if (!valid) return; //stops here if any field failed validation

  // Disable button and show sending state so user knows the request is in progress
  formSubmit.disabled    = true;
  formSubmit.textContent = 'Sending…';

  // Sends form data using FormData instead of JSON — avoids CORS preflight issues
  // Simple POST requests with FormData don't trigger a preflight check unlike JSON requests
  const formData = new FormData();
  formData.append('access_key', WEB3FORMS_KEY); //your access key tells Web3Forms which email address to deliver to
  formData.append('name',    name);
  formData.append('email',   email);
  formData.append('message', message);

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData //FormData sends as multipart instead of JSON, skipping the preflight CORS check
  })
  .then(res => res.json()) //parses the JSON response from Web3Forms
  .then(data => {
    if (data.success) { //if Web3Forms confirms success, shows success message and resets the form
      formSuccess.textContent = '✓ Message sent! We\'ll be in touch soon.';
      formSuccess.style.color = '';
      formSuccess.classList.remove('hidden');
      contactForm.reset();
      setTimeout(() => formSuccess.classList.add('hidden'), 5000); //hides success message after 5 seconds
    } else { //if Web3Forms returns a non-success response, shows an error message
      throw new Error(data.message || 'Submission failed');
    }
  })
  .catch(err => { //if the fetch itself fails or an error was thrown, shows a red error message
    console.error('Web3Forms error:', err);
    formSuccess.textContent = '✗ Something went wrong. Please try again.';
    formSuccess.style.color = '#dc3545';
    formSuccess.classList.remove('hidden');
    setTimeout(() => formSuccess.classList.add('hidden'), 5000);
  })
  .finally(() => { //always re-enables the button and restores its label after success or failure
    formSubmit.disabled    = false;
    formSubmit.textContent = 'Send Message';
  });
});

/* ── Helper ───────────────────────────────────────────────── */
function display() { //shows an alert about graphic design when called by the welcome button
  alert("Graphic design is the art of planning and projecting ideas and experiences with visual and textual content. Start your journey today!");
}
