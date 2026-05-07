/* ============================================================
   GRAPHIC DESIGN SITE — script.js
   - Expandable cards
   - 5-question graphic design quiz
   ============================================================ */

/* ── Expandable Cards ─────────────────────────────────────── */
document.querySelectorAll('.expandable-card').forEach(card => {
  card.addEventListener('click', () => {
    const isOpen = card.classList.contains('open');

    // Close all other cards
    document.querySelectorAll('.expandable-card').forEach(c => {
      c.classList.remove('open');
    });

    // Toggle clicked card
    if (!isOpen) card.classList.add('open');
  });
});

/* ── Quiz Data ────────────────────────────────────────────── */
const questions = [
  {
    q: "What does 'vector graphic' mean?",
    options: [
      "An image made of pixels",
      "An image defined by mathematical paths that scale without losing quality",
      "A photograph edited in Photoshop",
      "A graphic with only two colors"
    ],
    answer: 1
  },
  {
    q: "Which color pairing is an example of complementary colors?",
    options: [
      "Red and orange",
      "Blue and navy",
      "Blue and orange",
      "Green and teal"
    ],
    answer: 2
  },
  {
    q: "What is 'kerning' in typography?",
    options: [
      "The height of capital letters",
      "The spacing between individual letter pairs",
      "The thickness of a font's strokes",
      "The distance between lines of text"
    ],
    answer: 1
  },
  {
    q: "Which Adobe tool is best suited for creating a scalable logo?",
    options: [
      "Adobe Photoshop",
      "Adobe Premiere",
      "Adobe Illustrator",
      "Adobe Lightroom"
    ],
    answer: 2
  },
  {
    q: "What does the 'rule of thirds' help designers with?",
    options: [
      "Choosing a color palette",
      "Selecting the right font",
      "Composing balanced and visually interesting layouts",
      "Calculating print margins"
    ],
    answer: 2
  }
];

/* ── Quiz State ───────────────────────────────────────────── */
let current = 0;
let selected = null;
let score = 0;

const content    = document.getElementById('quiz-content');
const footer     = document.getElementById('quiz-footer');
const nextBtn    = document.getElementById('next-btn');
const resultBox  = document.getElementById('quiz-result');
const resultScore= document.getElementById('result-score');
const resultMsg  = document.getElementById('result-msg');
const retryBtn   = document.getElementById('retry-btn');
const progressTxt= document.getElementById('progress-text');
const progressFill=document.getElementById('progress-fill');

/* ── Render Question ─────────────────────────────────────── */
function renderQuestion() {
  selected = null;
  nextBtn.disabled = true;

  const q = questions[current];
  progressTxt.textContent = `Question ${current + 1} of ${questions.length}`;
  progressFill.style.width = `${(current / questions.length) * 100}%`;

  content.innerHTML = `
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" data-index="${i}">${opt}</button>
      `).join('')}
    </div>
  `;

  content.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(btn, q));
  });
}

/* ── Select Answer ───────────────────────────────────────── */
function selectAnswer(btn, q) {
  if (selected !== null) return; // already answered

  selected = parseInt(btn.dataset.index);
  const correct = selected === q.answer;
  if (correct) score++;

  // Style all options
  content.querySelectorAll('.quiz-option').forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('correct');
    else if (i === selected) b.classList.add('wrong');
  });

  nextBtn.disabled = false;
  nextBtn.textContent = current === questions.length - 1 ? 'See Results' : 'Next';
}

/* ── Next Button ─────────────────────────────────────────── */
nextBtn.addEventListener('click', () => {
  current++;
  if (current < questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

/* ── Show Result ─────────────────────────────────────────── */
function showResult() {
  content.classList.add('hidden');
  footer.classList.add('hidden');
  resultBox.classList.remove('hidden');

  resultScore.textContent = `${score} / ${questions.length}`;

  const pct = score / questions.length;
  if (pct === 1)       resultMsg.textContent = "Perfect score! You're a design expert.";
  else if (pct >= 0.8) resultMsg.textContent = "Great work! You know your design fundamentals.";
  else if (pct >= 0.6) resultMsg.textContent = "Good effort! Review a few concepts and try again.";
  else                 resultMsg.textContent = "Keep studying — you'll get there!";
}

/* ── Retry ───────────────────────────────────────────────── */
retryBtn.addEventListener('click', () => {
  current = 0;
  score = 0;
  selected = null;
  resultBox.classList.add('hidden');
  content.classList.remove('hidden');
  footer.classList.remove('hidden');
  nextBtn.textContent = 'Next';
  renderQuestion();
});

/* ── Init ────────────────────────────────────────────────── */
renderQuestion();
