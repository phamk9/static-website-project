/* ============================================================
   GRAPHIC DESIGN SITE — script.js
   ============================================================ */

/* ── EmailJS Init ─────────────────────────────────────────── */
// Sign up free at https://emailjs.com, then replace these 3 values:
const EMAILJS_PUBLIC_KEY  = 'rr5jNaaN9gbCc8u2n';   // Account > API Keys
const EMAILJS_SERVICE_ID  = 'service_o5glqlk';   // Email Services tab
const EMAILJS_TEMPLATE_ID = 'template_ha96h0r';  // Email Templates tab
// In your EmailJS template use these variables: {{from_name}}, {{from_email}}, {{message}}

// Guards against the EmailJS SDK failing to load from the CDN — without this check,
// calling emailjs.init() when the SDK is undefined throws a ReferenceError that halts
// all remaining JavaScript on the page, breaking the quiz, slider, glossary, and every other feature
if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/* ── Modal Windows ────────────────────────────────────────── */
// Opens a modal overlay by id, locks body scroll, and focuses the close button for accessibility
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden'; // prevents background scroll while modal is open
  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

// Closes a modal overlay and restores body scroll
function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = ''; // restores background scroll
}

// Wire up every "Read More →" button to open its target modal
document.querySelectorAll('.modal-open-btn').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.modal));
});

// Wire up every ✕ close button inside modals
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
});

// Click on the dim overlay (outside the panel) to close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay); // only fires if the backdrop itself was clicked
  });
});

// Escape key closes any open modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(overlay => closeModal(overlay));
  }
});

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
}, { threshold: 0.01 });

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

/* ── Contact Form — EmailJS ───────────────────────────────── */
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

  // Guard against the EmailJS SDK not being available — fails gracefully instead of throwing
  if (typeof emailjs === 'undefined') {
    formSuccess.textContent = '✗ Email service unavailable. Please try again later.';
    formSuccess.style.color = '#dc3545';
    formSuccess.classList.remove('hidden');
    formSubmit.disabled    = false;
    formSubmit.textContent = 'Send Message';
    setTimeout(() => formSuccess.classList.add('hidden'), 5000);
    return;
  }

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { //sends the form data to EmailJS using the configured service and template
    from_name:  name,   //maps to {{from_name}} in the EmailJS template
    from_email: email,  //maps to {{from_email}} in the EmailJS template
    message:    message //maps to {{message}} in the EmailJS template
  })
  .then(() => { //if send succeeds, shows success message, resets the form, and hides the message after 5 seconds
    formSuccess.textContent = '✓ Message sent! We\'ll be in touch soon.';
    formSuccess.style.color = '';
    formSuccess.classList.remove('hidden');
    contactForm.reset();
    setTimeout(() => formSuccess.classList.add('hidden'), 5000);
  })
  .catch(err => { //if send fails, logs the error and shows a red error message instead
    console.error('EmailJS error:', err);
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

/* ── Scroll Progress Bar ──────────────────────────────────── */
const scrollBar = document.getElementById('scrollProgressBar'); //gets the thin bar element fixed to the top of the page

window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight; //total scrollable distance = full page height minus the visible viewport height
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0; //expresses current scroll position as a percentage of total scrollable distance; guards against division by zero on very short pages
  scrollBar.style.width = pct + '%'; //sets the bar width to match scroll percentage, filling left to right as the user scrolls down
}, { passive: true }); //passive: true tells the browser this listener never calls preventDefault(), allowing it to optimize scroll performance

/* ── Tooltip Glossary ─────────────────────────────────────── */
// Lookup table mapping each data-term attribute value to a display name and definition.
// To add a new tooltip: give a span class="gd-tooltip" data-term="your-key" in the HTML,
// then add a matching entry here with term (display label) and def (short definition).
const TOOLTIP_GLOSSARY = {
  'raster': { term: 'Raster Graphics', def: 'Images made of a fixed grid of pixels (e.g. JPEG, PNG). Enlarging them causes pixelation. Best for photographs.' },
  'vector': { term: 'Vector Graphics', def: 'Images defined by mathematical paths and shapes (e.g. SVG, AI). They scale to any size without quality loss. Best for logos and icons.' },
  'serif': { term: 'Serif', def: 'A typeface with small decorative strokes ("feet") at the ends of letterforms. Examples: Times New Roman, Garamond, Georgia.' },
  'complementary': { term: 'Complementary Colors', def: 'Colors directly opposite each other on the color wheel (e.g. red & green). Used together they create maximum contrast and vibrancy.' },
  'kerning': { term: 'Kerning', def: 'The manual adjustment of spacing between specific pairs of characters to achieve visually balanced text.' },
  'leading': { term: 'Leading', def: 'The vertical spacing between lines of text, measured from baseline to baseline. Named after the lead strips used in traditional typesetting.' },
  'bleed': { term: 'Bleed', def: 'Extra artwork extending beyond the trim edge of a printed piece, ensuring there are no white borders after cutting.' },
  'pathfinder': { term: 'Pathfinder', def: 'An Illustrator panel that performs Boolean shape operations: Unite, Minus Front, Intersect, and Exclude.' },
  'layers': { term: 'Layers', def: 'Transparent sheets stacked in Photoshop/Illustrator. Each layer holds separate content that can be edited independently.' },
  'blend-modes': { term: 'Blend Modes', def: 'Algorithms that determine how a layer interacts with layers below it. Common modes: Multiply, Screen, Overlay, Soft Light.' },
  'bezier': { term: 'Bézier Curve', def: 'A mathematically defined smooth curve used in vector drawing tools. Controlled by anchor points and directional handles.' },
  'non-destructive': { term: 'Non-Destructive Editing', def: 'Editing that preserves the original image data. Changes can always be undone. Examples: Smart Objects, Adjustment Layers, Layer Masks.' },
};

const tooltipPopover = document.getElementById('gdTooltipPopover'); //the floating popover element that appears near hovered terms
const tooltipTerm    = document.getElementById('gdTooltipTerm');    //span inside the popover that shows the term label
const tooltipDef     = document.getElementById('gdTooltipDef');     //paragraph inside the popover that shows the definition

let tooltipTimeout; //used to delay hiding so the popover doesn't flicker when the mouse briefly leaves a term

// Show popover — uses event delegation on the document so any .gd-tooltip added dynamically also works
document.addEventListener('mouseover', e => {
  const el = e.target.closest('.gd-tooltip'); //finds the nearest ancestor with class gd-tooltip, handles cases where the mouse is over a child element
  if (!el) return; //ignore any mouseover that isn't on or inside a tooltip term
  const key  = el.dataset.term; //reads the data-term attribute to look up the right definition
  const data = TOOLTIP_GLOSSARY[key];
  if (!data) return; //silently skip if the key has no entry in the lookup table

  clearTimeout(tooltipTimeout); //cancel any pending hide so the popover stays visible when moving between nearby terms
  tooltipTerm.textContent = data.term; //populate the popover with the looked-up term and definition
  tooltipDef.textContent  = data.def;

  const rect = el.getBoundingClientRect(); //gets the hovered element's position relative to the viewport
  let left = rect.left + window.scrollX;   //converts to absolute page coordinates by adding scroll offset
  let top  = rect.bottom + window.scrollY + 8; //positions the popover just below the term with an 8px gap

  tooltipPopover.style.left = left + 'px';
  tooltipPopover.style.top  = top  + 'px';

  // Nudge the popover left if it would overflow the right edge of the viewport
  requestAnimationFrame(() => { //waits one frame so the popover has been painted and offsetWidth is accurate
    const pw = tooltipPopover.offsetWidth;
    if (left + pw > window.innerWidth - 16) {
      tooltipPopover.style.left = (window.innerWidth - pw - 16) + 'px'; //clamps to 16px from the right edge
    }
  });

  tooltipPopover.classList.add('visible'); //triggers the CSS opacity/transform transition to fade the popover in
});

// Hide popover with a short delay so it doesn't vanish instantly when the mouse moves between the term and the popover
document.addEventListener('mouseout', e => {
  const el = e.target.closest('.gd-tooltip');
  if (!el) return;
  tooltipTimeout = setTimeout(() => tooltipPopover.classList.remove('visible'), 150); //150ms grace period before hiding
});

/* ── Color Palette Generator ──────────────────────────────── */
// Converts a hex color string (e.g. "#c94b2c") to an HSL array [hue, saturation, lightness].
// HSL is much easier to work with for generating harmonious palettes than raw RGB values
// because hue is a single number from 0–360 representing position on the color wheel.
function hexToHSL(hex) {
  let r = parseInt(hex.slice(1,3),16)/255; //extracts the red channel from hex and normalizes it to 0–1
  let g = parseInt(hex.slice(3,5),16)/255; //extracts the green channel
  let b = parseInt(hex.slice(5,7),16)/255; //extracts the blue channel
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2; //lightness is the average of the brightest and darkest channels
  if (max === min) { h = s = 0; } //achromatic (gray): hue and saturation are both 0
  else {
    const d = max - min; //d is the range between brightest and darkest channel, used to calculate saturation
    s = l > 0.5 ? d/(2-max-min) : d/(max+min); //saturation formula differs depending on whether lightness is above or below 50%
    switch(max){ //which channel is brightest determines the hue sector (0–60° per channel pair)
      case r: h = ((g-b)/d + (g<b?6:0))/6; break; //red is dominant; +6 corrects negative values to keep hue positive
      case g: h = ((b-r)/d + 2)/6; break;          //green is dominant
      case b: h = ((r-g)/d + 4)/6; break;          //blue is dominant
    }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)]; //returns hue as degrees (0–360), saturation and lightness as percentages (0–100)
}

// Converts HSL values back to a hex color string for rendering swatches.
// This is the reverse of hexToHSL and uses the standard HSL-to-RGB algorithm.
function hslToHex(h, s, l) {
  s /= 100; l /= 100; //normalize saturation and lightness from percentages back to 0–1
  const k = n => (n + h/30) % 12; //maps each of the three color channels to a position on the hue wheel
  const a = s * Math.min(l, 1-l); //chroma — how far the color is from gray; zero at l=0 (black) and l=1 (white)
  const f = n => l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n),1))); //computes each RGB channel value using a piecewise linear approximation of the hue wheel
  const toHex = x => Math.round(x*255).toString(16).padStart(2,'0'); //converts a 0–1 float to a two-character hex string, padding single digits with a leading zero
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4)); //assembles the final hex string for red (0), green (8), and blue (4) channels
}

// Generates four named palettes from a single base hex color using color theory relationships.
// All palette types are derived by rotating the hue wheel by specific amounts:
// complementary = 180°, analogous = ±20°/40°, triadic = 120°/240°, shades = same hue, varying lightness.
function generatePalettes(hex) {
  const [h, s, l] = hexToHSL(hex); //converts the base color to HSL so we can manipulate individual components
  return {
    'Complementary': [ //base color + its opposite on the wheel + two softened tints for practical use
      hex,
      hslToHex((h+180)%360, s, l),                               //opposite hue (180° away); % 360 keeps it within the 0–360 range
      hslToHex((h+180)%360, Math.max(10,s-15), Math.min(90,l+15)), //softer version of the complement: less saturated, lighter
      hslToHex(h, Math.max(10,s-15), Math.min(90,l+20)),          //soft tint of the base: same hue, pulled toward white
    ],
    'Analogous': [ //five neighboring hues spread ±40° around the base, creating a harmonious low-contrast range
      hslToHex((h-40+360)%360, s, l), //+360 before modulo prevents negative hue values in JS
      hslToHex((h-20+360)%360, s, l),
      hex,                             //base color sits in the center
      hslToHex((h+20)%360, s, l),
      hslToHex((h+40)%360, s, l),
    ],
    'Triadic': [ //three hues evenly spaced 120° apart on the wheel — vibrant but balanced
      hex,
      hslToHex((h+120)%360, s, l),
      hslToHex((h+240)%360, s, l),
      hslToHex(h, Math.max(10,s-20), Math.min(90,l+20)), //a lighter neutral version of the base to ease the vibrancy
    ],
    'Shades': [ //five steps from light to dark using the same hue and saturation; useful for UI elevation and backgrounds
      hslToHex(h, s, Math.min(90,l+30)), //lightest — capped at 90% so it never becomes pure white
      hslToHex(h, s, Math.min(90,l+15)),
      hex,                                //base color in the middle
      hslToHex(h, s, Math.max(5,l-15)),  //darker — floored at 5% so it never becomes pure black
      hslToHex(h, s, Math.max(5,l-30)),  //darkest
    ],
  };
}

// Builds the palette UI by generating all four palette groups and injecting their swatches into the DOM.
// Called on page load with the default color, and again every time the color picker changes.
function renderPalettes(hex) {
  const sections = document.getElementById('paletteSections');
  if (!sections) return;
  const palettes = generatePalettes(hex); //compute all four palettes from the current base color
  sections.innerHTML = Object.entries(palettes).map(([name, colors]) => `
    <div class="palette-group">
      <div class="palette-group-label">${name}</div>
      <div class="palette-swatches">
        ${colors.map(c => `
          <button class="palette-swatch" style="background:${c};" data-hex="${c}" title="Copy ${c}" aria-label="Copy ${c}">
            <span class="palette-swatch-hex">${c}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');

  sections.querySelectorAll('.palette-swatch').forEach(btn => {
    btn.addEventListener('click', () => copyHex(btn.dataset.hex)); //each swatch copies its own hex value to the clipboard when clicked
  });
}

// Copies a hex string to the clipboard and briefly shows a confirmation toast notification
function copyHex(hex) {
  navigator.clipboard.writeText(hex).catch(() => {}); //writes to clipboard; catch suppresses errors in non-HTTPS or unsupported environments
  const note = document.getElementById('copyNotification');
  note.textContent = `${hex} copied!`; //shows which specific color was copied
  note.classList.add('show');           //triggers the CSS fade-in transition
  setTimeout(() => note.classList.remove('show'), 2000); //removes the show class after 2 seconds, fading the toast back out
}

const baseColorPicker = document.getElementById('baseColorPicker'); //the native <input type="color"> element
const baseHexDisplay  = document.getElementById('baseHexDisplay');  //the text label next to the picker showing the current hex value

if (baseColorPicker) {
  renderPalettes(baseColorPicker.value); //render palettes immediately on load using the picker's default value
  baseColorPicker.addEventListener('input', e => {
    baseHexDisplay.textContent = e.target.value; //keeps the hex label in sync as the user drags the color picker
    renderPalettes(e.target.value);              //regenerates all four palettes instantly on every color change
  });
}

/* ── Typography Playground ────────────────────────────────── */
// Grab all control elements and the live preview div up front so they don't need to be looked up on every keystroke
const typoPreview = document.getElementById('typoPreview'); //the contenteditable div where the sample text is displayed
const typoFont    = document.getElementById('typoFont');    //font family dropdown
const typoSize    = document.getElementById('typoSize');    //font size range slider
const typoWeight  = document.getElementById('typoWeight');  //font weight dropdown
const typoLead    = document.getElementById('typoLead');    //line height (leading) range slider
const typoTrack   = document.getElementById('typoTrack');   //letter spacing (tracking) range slider
const typoSizeVal  = document.getElementById('typoSizeVal');  //label showing the current size value next to its slider
const typoLeadVal  = document.getElementById('typoLeadVal');  //label showing the current leading value
const typoTrackVal = document.getElementById('typoTrackVal'); //label showing the current tracking value

// Reads all control values and applies them to the preview element as inline styles.
// Called once on load and again on every control change so the preview stays in sync.
function applyTypo() {
  if (!typoPreview) return;
  typoPreview.style.fontFamily     = typoFont.value;               //sets the font from the dropdown
  typoPreview.style.fontSize       = typoSize.value + 'px';        //converts the slider integer to a pixel value
  typoSizeVal.textContent          = typoSize.value;               //updates the numeric label beside the slider
  typoPreview.style.fontWeight     = typoWeight.value;             //sets weight as a numeric value (300, 400, 700 etc.)
  typoPreview.style.lineHeight     = typoLead.value;               //unitless line height multiplier applied directly
  typoLeadVal.textContent          = parseFloat(typoLead.value).toFixed(1); //shows one decimal place for leading
  typoPreview.style.letterSpacing  = typoTrack.value + 'em';       //em units keep tracking proportional to font size
  typoTrackVal.textContent         = parseFloat(typoTrack.value).toFixed(2); //shows two decimal places for tracking
}

if (typoFont) {
  [typoFont, typoSize, typoWeight, typoLead, typoTrack].forEach(el =>
    el.addEventListener('input', applyTypo) //attaches a single applyTypo handler to every control so any change triggers a preview update
  );
  applyTypo(); //run once on load so the preview reflects the HTML default values immediately

  document.querySelectorAll('.typo-align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.typo-align-btn').forEach(b => b.classList.remove('active')); //clears active state from all alignment buttons before marking the clicked one
      btn.classList.add('active');
      typoPreview.style.textAlign = btn.dataset.align; //reads the data-align attribute (left, center, right) and applies it directly
    });
  });
}

/* ── Design Principles Interactive Demo ───────────────────── */
// Each principle has two properties:
//   caption — the explanatory sentence shown below the stage
//   render  — a function that receives the stage element and injects an animated HTML demo into it.
// Inline styles are used intentionally here so each demo is fully self-contained and not
// affected by external CSS classes. Animation delays stagger the elements so they appear one by one.
const PRINCIPLES = {
  contrast: {
    caption: 'Contrast makes elements stand out by opposing light vs dark, large vs small, or bold vs thin — guiding the viewer\'s eye instantly.',
    render: (stage) => {
      stage.style.background = '#1a1a1a';
      stage.innerHTML = `
        <div style="display:flex;gap:2rem;align-items:center;flex-wrap:wrap;justify-content:center;">
          <div style="background:#c94b2c;color:#fff;padding:1.2rem 2.5rem;font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;letter-spacing:-0.02em;animation:fadeUp 0.5s ease both;">BOLD</div>
          <div style="color:rgba(255,255,255,0.25);font-family:'DM Sans',sans-serif;font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;animation:fadeUp 0.5s 0.15s ease both;opacity:0;animation-fill-mode:both;">subtle text</div>
          <div style="width:4px;height:80px;background:#c94b2c;animation:fadeUp 0.5s 0.3s ease both;opacity:0;animation-fill-mode:both;"></div>
          <div style="width:4px;height:24px;background:rgba(255,255,255,0.2);animation:fadeUp 0.5s 0.45s ease both;opacity:0;animation-fill-mode:both;"></div>
        </div>`;
    }
  },
  alignment: {
    caption: 'Alignment connects elements visually even when they\'re not touching, creating an invisible grid that brings order and calm to a layout.',
    render: (stage) => {
      stage.style.background = '#f0ede8';
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.6rem;align-items:flex-start;width:280px;">
          ${['HEADLINE TEXT','Supporting subheading here','Body copy paragraph line one','Body copy paragraph line two','Small caption label'].map((t,i)=>
            `<div style="font-family:${i===0?"'Playfair Display',serif":"'DM Sans',sans-serif"};font-size:${[1.6,1,0.85,0.85,0.7][i]}rem;font-weight:${[900,500,400,400,400][i]};color:${i===0?'#1a1a1a':'#7a7065'};animation:fadeUp 0.4s ${i*0.1}s ease both;opacity:0;animation-fill-mode:both;border-left:3px solid ${i===0?'#c94b2c':'transparent'};padding-left:${i===0?'0.6rem':'0.75rem'};">${t}</div>`
          ).join('')}
        </div>`;
    }
  },
  proximity: {
    caption: 'Proximity groups related items together. Elements close to each other are perceived as a unit, reducing visual noise and aiding comprehension.',
    render: (stage) => {
      stage.style.background = '#f0ede8';
      stage.innerHTML = `
        <div style="display:flex;gap:3rem;justify-content:center;flex-wrap:wrap;">
          <div style="animation:fadeUp 0.5s ease both;">
            <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:0.15em;color:#c94b2c;margin-bottom:0.4rem;font-family:'DM Sans',sans-serif;">Group A</div>
            <div style="display:flex;flex-direction:column;gap:0.2rem;">
              ${['●  Item one','●  Item two','●  Item three'].map(t=>`<div style="font-size:0.82rem;color:#1a1a1a;font-family:'DM Sans',sans-serif;">${t}</div>`).join('')}
            </div>
          </div>
          <div style="animation:fadeUp 0.5s 0.2s ease both;opacity:0;animation-fill-mode:both;">
            <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:0.15em;color:#c94b2c;margin-bottom:0.4rem;font-family:'DM Sans',sans-serif;">Group B</div>
            <div style="display:flex;flex-direction:column;gap:0.2rem;">
              ${['◆  Alpha','◆  Beta','◆  Gamma'].map(t=>`<div style="font-size:0.82rem;color:#1a1a1a;font-family:'DM Sans',sans-serif;">${t}</div>`).join('')}
            </div>
          </div>
        </div>`;
    }
  },
  repetition: {
    caption: 'Repetition of colors, shapes, and fonts creates cohesion and brand recognition — turning a collection of elements into a unified system.',
    render: (stage) => {
      stage.style.background = '#1a1a1a';
      stage.innerHTML = `
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center;">
          ${Array.from({length:6},(_,i)=>`
            <div style="width:70px;height:90px;background:#c94b2c;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0.5rem;animation:fadeUp 0.4s ${i*0.08}s ease both;opacity:0;animation-fill-mode:both;">
              <div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:50%;margin-bottom:0.5rem;"></div>
              <div style="width:40px;height:4px;background:rgba(255,255,255,0.6);margin-bottom:3px;"></div>
              <div style="width:28px;height:3px;background:rgba(255,255,255,0.35);"></div>
            </div>`).join('')}
        </div>`;
    }
  },
  hierarchy: {
    caption: 'Visual hierarchy guides the reader\'s eye in a deliberate order — what to read first, second, and third — through size, weight, and contrast.',
    render: (stage) => {
      stage.style.background = '#f0ede8';
      stage.innerHTML = `
        <div style="max-width:320px;text-align:left;">
          <div style="font-size:0.6rem;text-transform:uppercase;letter-spacing:0.2em;color:#c94b2c;font-family:'DM Sans',sans-serif;animation:fadeUp 0.4s ease both;">Category Label</div>
          <div style="font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:900;color:#1a1a1a;line-height:1.05;margin:0.3rem 0;animation:fadeUp 0.4s 0.1s ease both;opacity:0;animation-fill-mode:both;">Main Headline<br>Goes Here</div>
          <div style="font-size:0.92rem;color:#7a7065;font-family:'DM Sans',sans-serif;margin-bottom:0.75rem;animation:fadeUp 0.4s 0.2s ease both;opacity:0;animation-fill-mode:both;">A subheading that supports the headline and draws the reader in.</div>
          <div style="font-size:0.75rem;color:#aaa;font-family:'DM Sans',sans-serif;animation:fadeUp 0.4s 0.3s ease both;opacity:0;animation-fill-mode:both;line-height:1.6;">Body text sits lowest in the hierarchy — readable but unobtrusive, letting the headline lead.</div>
        </div>`;
    }
  },
  whitespace: {
    caption: 'White space (negative space) isn\'t empty — it\'s a powerful design element that gives content room to breathe and signals quality and clarity.',
    render: (stage) => {
      stage.style.background = '#fafafa';
      stage.innerHTML = `
        <div style="padding:3rem;text-align:center;animation:fadeUp 0.5s ease both;">
          <div style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:900;color:#1a1a1a;letter-spacing:-0.02em;">Less</div>
          <div style="width:2rem;height:2px;background:#c94b2c;margin:1rem auto;"></div>
          <div style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.2em;color:#aaa;font-family:'DM Sans',sans-serif;">is more</div>
        </div>`;
    }
  },
};

// Clears the stage, runs the selected principle's render function, then fades the caption in after a
// short delay so it doesn't compete visually with the animated demo elements appearing
function renderPrinciple(key) {
  const stage   = document.getElementById('principlesStage');
  const caption = document.getElementById('principlesCaption');
  if (!stage || !caption) return;
  const p = PRINCIPLES[key];
  if (!p) return; //guard against unknown keys
  caption.style.opacity = '0'; //hide caption immediately so it doesn't linger from the previous principle
  stage.innerHTML = '';         //clear any previous demo before injecting the new one
  p.render(stage);              //call the principle's render function to inject its animated HTML
  setTimeout(() => {
    caption.textContent  = p.caption;
    caption.style.opacity = '1'; //fades caption in 200ms after the demo starts rendering, giving elements time to appear first
  }, 200);
}

document.querySelectorAll('.principle-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.principle-tab').forEach(b => b.classList.remove('active')); //clears active state from all tabs before marking the clicked one
    btn.classList.add('active');
    renderPrinciple(btn.dataset.principle); //reads the data-principle attribute to know which entry in PRINCIPLES to render
  });
});

if (document.getElementById('principlesStage')) renderPrinciple('contrast'); //render the contrast demo on page load so the stage isn't empty when the user first sees it

/* ── Glossary ──────────────────────────────────────────────── */
// Master list of all glossary entries. Each object has a term (display name) and def (definition).
// Entries are sorted alphabetically here so renderGlossary can group them without needing to sort the data.
// To add a new term: insert a new object anywhere in the array — renderGlossary handles grouping automatically.
const GLOSSARY_TERMS = [
  { term: 'Alignment',         def: 'The positioning of design elements so they line up along a common edge or axis, creating order and visual connection.' },
  { term: 'Analogous Colors',  def: 'Colors that sit adjacent to each other on the color wheel, creating harmonious, low-contrast color schemes.' },
  { term: 'Asymmetry',         def: 'A layout approach using intentional imbalance to create visual tension, dynamism, and a sense of movement.' },
  { term: 'Balance',           def: 'The distribution of visual weight across a design — can be symmetrical (formal) or asymmetrical (dynamic).' },
  { term: 'Baseline',          def: 'The invisible line on which most letters sit in a line of text. Descenders (g, p, y) dip below it.' },
  { term: 'Bézier Curve',      def: 'A mathematically defined smooth curve controlled by anchor points and handles, used in vector illustration tools.' },
  { term: 'Bleed',             def: 'Extra artwork extending beyond the printed trim edge to ensure no white borders appear after cutting.' },
  { term: 'Blend Mode',        def: 'An algorithm determining how a layer\'s pixels interact with the layers beneath it (e.g. Multiply, Screen, Overlay).' },
  { term: 'Brand Identity',    def: 'The complete visual system representing a brand: logo, color palette, typography, imagery, and tone.' },
  { term: 'CMYK',              def: 'Cyan, Magenta, Yellow, Key (Black). The subtractive color model used in print production.' },
  { term: 'Color Theory',      def: 'The study of how colors relate to and interact with each other — including the color wheel, harmony, and psychology.' },
  { term: 'Complementary Colors', def: 'Colors directly opposite on the color wheel. When paired, they create maximum contrast and vibrant visual energy.' },
  { term: 'Contrast',          def: 'The degree of difference between elements — in color, size, weight, or texture — used to create emphasis and clarity.' },
  { term: 'Crop',              def: 'Trimming or masking away parts of an image to improve composition, remove distractions, or fit a layout.' },
  { term: 'Display Font',      def: 'A typeface designed for large sizes like headlines, posters, or logos — prioritizing visual impact over body text readability.' },
  { term: 'DPI',               def: 'Dots Per Inch. A measure of print resolution. 300 DPI is the standard for professional print; 72 DPI for screen.' },
  { term: 'Drop Shadow',       def: 'A visual effect that adds a shadow behind an element, creating the illusion of depth or elevation.' },
  { term: 'Em',                def: 'A scalable unit in typography equal to the current font size. 1em at 16px equals 16px. Used for relative sizing.' },
  { term: 'Emphasis',          def: 'Making a specific element stand out — through size, color, weight, or isolation — to direct the viewer\'s attention.' },
  { term: 'Font',              def: 'A specific weight, width, and style of a typeface (e.g. Helvetica Bold Italic is one font within the Helvetica typeface family).' },
  { term: 'Gestalt Principles', def: 'Psychological laws describing how humans perceive visual information as unified wholes (proximity, similarity, closure, continuity).' },
  { term: 'Golden Ratio',      def: 'A mathematical ratio (≈1.618) found throughout nature and classical art, often used to create aesthetically pleasing proportions.' },
  { term: 'Grid',              def: 'An invisible framework of horizontal and vertical lines used to align and organize design elements consistently.' },
  { term: 'Gutter',            def: 'The space between columns in a grid layout, or the inner margins of facing pages in a printed book.' },
  { term: 'Hierarchy',         def: 'Organizing visual elements by importance so the viewer reads them in a deliberate sequence — what\'s most important first.' },
  { term: 'Hue',               def: 'The pure color family a color belongs to — red, yellow, blue, etc. — before any lightness or saturation adjustments.' },
  { term: 'Kerning',           def: 'Manual adjustment of space between specific character pairs to achieve optically balanced, visually even text.' },
  { term: 'Layer',             def: 'A transparent sheet in Photoshop or Illustrator that holds individual design elements, stackable and editable independently.' },
  { term: 'Layer Mask',        def: 'A non-destructive method to hide or reveal parts of a Photoshop layer by painting with black (hide) or white (reveal).' },
  { term: 'Leading',           def: 'The vertical space between lines of type, measured baseline to baseline. Named after the lead strips of traditional typesetting.' },
  { term: 'Legibility',        def: 'How easily individual letterforms can be distinguished from each other, especially at small sizes.' },
  { term: 'Letterform',        def: 'The specific shape or design of an individual letter in a typeface.' },
  { term: 'Ligature',          def: 'A single glyph formed by joining two or more letters (e.g. "fi", "fl") to improve visual flow in typesetting.' },
  { term: 'Logotype',          def: 'A logo design based entirely on a stylized typographic treatment of the brand name, without a separate symbol.' },
  { term: 'Margin',            def: 'The empty space around the outer edges of a design or page, creating a visual boundary and breathing room.' },
  { term: 'Mockup',            def: 'A realistic preview showing a design applied to a product, device, or environment (e.g. a phone screen, T-shirt, billboard).' },
  { term: 'Monochromatic',     def: 'A color scheme using variations in lightness and saturation of a single hue — creating a unified, harmonious look.' },
  { term: 'Negative Space',    def: 'The empty space around and between subjects in a composition, used intentionally to define shapes and create balance.' },
  { term: 'Opacity',           def: 'The degree to which a layer or element is transparent. 100% is fully visible; 0% is completely invisible.' },
  { term: 'Orphan',            def: 'A single word or short line stranded at the top of a column or page, separated from the rest of its paragraph.' },
  { term: 'Pantone',           def: 'A standardized color-matching system (PMS) that gives each color a unique number, ensuring consistent printing across vendors.' },
  { term: 'Pathfinder',        def: 'An Illustrator panel that performs Boolean shape operations: Unite, Minus Front, Intersect, and Exclude.' },
  { term: 'Point (pt)',        def: 'A typographic unit of measurement. 72 points = 1 inch. Traditionally used for type size and leading in print design.' },
  { term: 'Proximity',         def: 'Grouping related elements close together so viewers perceive them as a unit, reducing visual clutter.' },
  { term: 'Raster',            def: 'An image made of a fixed pixel grid (e.g. JPEG, PNG). Enlarging causes pixelation. Best for photographs.' },
  { term: 'Readability',       def: 'How easily a block of text can be read — influenced by font choice, line length, leading, and contrast.' },
  { term: 'Repetition',        def: 'Consistently reusing visual elements (colors, fonts, shapes) throughout a design to create unity and brand cohesion.' },
  { term: 'Resolution',        def: 'The amount of detail an image holds, measured in DPI (print) or PPI (screen). Higher resolution = more detail.' },
  { term: 'RGB',               def: 'Red, Green, Blue. The additive color model used for screens and digital displays.' },
  { term: 'Rule of Thirds',    def: 'A compositional guideline dividing a frame into a 3×3 grid and placing key subjects along the lines or at their intersections.' },
  { term: 'Sans-Serif',        def: 'A typeface without the small decorative strokes ("serifs") at letter ends. Examples: Helvetica, Futura, DM Sans.' },
  { term: 'Saturation',        def: 'The intensity or purity of a color. Highly saturated colors are vivid; desaturated colors appear washed out or gray.' },
  { term: 'Scale',             def: 'The relative size of elements in relation to each other or to the overall design, used to create emphasis and hierarchy.' },
  { term: 'Script',            def: 'A typeface that mimics handwriting or calligraphy. Ranges from formal (Copperplate) to casual (Pacifico).' },
  { term: 'Serif',             def: 'A typeface with small decorative strokes at the ends of letterforms. Examples: Times New Roman, Garamond, Georgia.' },
  { term: 'Smart Object',      def: 'A special Photoshop layer that preserves original image data, allowing non-destructive transformations and Smart Filters.' },
  { term: 'Stroke',            def: 'An outline or border applied to a shape or text in vector design software like Illustrator.' },
  { term: 'Tracking',          def: 'Uniform adjustment of spacing across a range of characters or words, affecting the overall density of a text block.' },
  { term: 'Tint',              def: 'A color lightened by mixing with white, or in digital design, by reducing opacity against a white background.' },
  { term: 'Tone',              def: 'A color that has been darkened by mixing with black, reducing its lightness while preserving its hue.' },
  { term: 'Trim',              def: 'The final edge of a printed piece after cutting. Artwork must account for bleed to avoid white borders after trimming.' },
  { term: 'Typeface',          def: 'A family of fonts sharing a common design (e.g. Helvetica). A single typeface can include many fonts: weights, widths, and styles.' },
  { term: 'Typography',        def: 'The art and technique of arranging type — choosing typefaces, sizes, line lengths, and spacing — to make written language readable and visually appealing.' },
  { term: 'Value',             def: 'The lightness or darkness of a color. High contrast between values creates strong visual hierarchy.' },
  { term: 'Vector',            def: 'Graphics defined by mathematical paths, not pixels. They scale infinitely without quality loss. Best for logos and icons.' },
  { term: 'Visual Weight',     def: 'The perceived heaviness of an element in a composition, influenced by its size, color, darkness, and complexity.' },
  { term: 'White Space',       def: 'Empty space in a design — not wasted, but intentional. It aids legibility, directs attention, and signals quality.' },
  { term: 'Widow',             def: 'A single line of a paragraph stranded at the bottom of a page or column, separated from the rest of the paragraph.' },
  { term: 'x-height',          def: 'The height of lowercase letters (like "x") in a typeface, excluding ascenders and descenders. Affects readability at small sizes.' },
];

// Renders the glossary list and alphabetical nav into the DOM.
// Accepts an optional filter string — when provided, it searches both term names and definitions
// and hides the alpha nav since grouped letters may be incomplete and misleading under a search.
function renderGlossary(filter = '') {
  const list  = document.getElementById('glossaryList');
  const alpha = document.getElementById('glossaryAlphaNav');
  if (!list) return;

  const query = filter.toLowerCase().trim();
  const filtered = query
    ? GLOSSARY_TERMS.filter(e => e.term.toLowerCase().includes(query) || e.def.toLowerCase().includes(query)) //searches both term and definition so users can find entries by concept as well as name
    : GLOSSARY_TERMS; //no filter — show all terms

  if (filtered.length === 0) {
    list.innerHTML = `<p class="glossary-no-results">No terms match "${filter}".</p>`; //show a message instead of an empty list when search yields nothing
    return;
  }

  // Group filtered terms by their first letter to build the A–Z section structure
  const groups = {};
  filtered.forEach(e => {
    const letter = e.term[0].toUpperCase();
    if (!groups[letter]) groups[letter] = []; //create a new array for this letter if one doesn't exist yet
    groups[letter].push(e);
  });

  // Build the HTML for each letter group and its entries, sorted alphabetically by letter
  list.innerHTML = Object.entries(groups).sort(([a],[b]) => a.localeCompare(b)).map(([letter, terms]) => `
    <div class="glossary-group" id="glossary-${letter}">
      <div class="glossary-group-letter">${letter}</div>
      ${terms.map(e => `
        <div class="glossary-entry">
          <span class="glossary-term">${e.term}</span>
          <p class="glossary-def">${e.def}</p>
        </div>`).join('')}
    </div>
  `).join('');

  // Build the A–Z jump nav — only shown when there's no active search filter
  if (alpha && !query) {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alpha.innerHTML = allLetters.map(l => `
      <button class="glossary-alpha-btn" data-letter="${l}" ${!groups[l] ? 'disabled' : ''}>${l}</button>
    `).join(''); //disables any letter that has no matching terms so only active letters are clickable

    alpha.querySelectorAll('.glossary-alpha-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(`glossary-${btn.dataset.letter}`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); //smoothly scrolls the matching letter group into view
      });
    });
  } else if (alpha && query) {
    alpha.innerHTML = ''; //hide the alpha nav entirely during search so it doesn't show incomplete or misleading letter groups
  }
}

// Entry point for the glossary — called once on page load.
// Forces the section visible immediately (it has no fade-in so opacity:0 would permanently hide it),
// then renders the full term list and wires up the search input.
function initGlossary() {
  const glossaryList = document.getElementById('glossaryList');
  if (!glossaryList) return; //bail out if the glossary section isn't in the DOM
  const section = document.getElementById('glossary');
  if (section) section.classList.add('visible'); //explicitly marks the section visible so the fade-in system can't leave it at opacity:0
  renderGlossary(); //populate the list with all terms on first load
  const glossarySearch = document.getElementById('glossarySearch');
  if (glossarySearch) {
    glossarySearch.addEventListener('input', e => renderGlossary(e.target.value)); //re-render the list on every keystroke, passing the current search value as the filter
  }
}

// Runs initGlossary as soon as the DOM is ready.
// The script tag is at the bottom of <body> so readyState is usually 'complete' by the time this runs,
// but the DOMContentLoaded fallback ensures it works even if the script is ever moved to the <head>.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlossary);
} else {
  initGlossary();
}
