const questionEl = document.getElementById('question');
const choiceButtons = Array.from(document.querySelectorAll('.choice-container'));
const questionCounterText = document.getElementById('questionCounter');
const scoreText = document.getElementById('score');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const catagoryEl = document.getElementById('catagory');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const loadError = document.getElementById('loadError');
const loadErrorText = document.getElementById('loadErrorText');

const CORRECT_BONUS = 1;
const CORRECT_ADVANCE_MS = 1200;

const category = localStorage.getItem('currentCatagory');
const quizLength = localStorage.getItem('quizLength') || '10';

let questions = [];
let questionIndex = -1;
let score = 0;
let acceptingAnswers = false;
let advanceTimer = null;
let results = [];

if (!category) window.location.replace('/');

const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

// Put the answer at a random position among the distractors; `answer` is a 1-based slot.
const formatQuestion = (raw) => {
    const choices = shuffle(raw.distractors).slice(0, 3);
    const answer = Math.floor(Math.random() * (choices.length + 1)) + 1;
    choices.splice(answer - 1, 0, raw.answer);
    return { question: raw.question, choices, answer, source: raw };
};

const showError = (message) => {
    loader.classList.add('hidden');
    game.classList.add('hidden');
    loadErrorText.textContent = message;
    loadError.classList.remove('hidden');
};

async function loadQuestions() {
    loadError.classList.add('hidden');
    loader.classList.remove('hidden');

    // "Retry missed" on the results page replays just the questions the player got wrong.
    const retry = readJson(sessionStorage, 'retryQuestions', null);
    if (Array.isArray(retry) && retry.length) {
        sessionStorage.removeItem('retryQuestions');
        return retry;
    }

    const res = await fetch(`${API_BASE}/learn/${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error(`The server responded with ${res.status}.`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('This category has no questions yet.');
    const shuffled = shuffle(data);
    return quizLength === 'all' ? shuffled : shuffled.slice(0, Number(quizLength) || 10);
}

async function startGame() {
    let loaded;
    try {
        loaded = await loadQuestions();
    } catch (err) {
        console.error(err);
        showError(err instanceof TypeError ? 'Check your connection and try again.' : err.message);
        return;
    }
    questions = loaded.map(formatQuestion);
    questionIndex = -1;
    score = 0;
    results = [];
    scoreText.innerText = score;
    catagoryEl.innerText = categoryLabel(category);
    loader.classList.add('hidden');
    game.classList.remove('hidden');
    getNewQuestion();
}

const finishGame = () => {
    localStorage.setItem('mostRecentScore', score);
    localStorage.setItem('mostRecentTotal', questions.length);
    writeJson(localStorage, 'savedResults', results);
    window.removeEventListener('beforeunload', confirmLeave);
    window.location.assign('/end.html');
};

const getNewQuestion = () => {
    clearTimeout(advanceTimer);
    questionIndex++;
    if (questionIndex >= questions.length) return finishGame();

    const current = questions[questionIndex];
    questionCounterText.innerText = `${questionIndex + 1}/${questions.length}`;
    progressFill.style.width = `${(questionIndex / questions.length) * 100}%`;
    questionEl.innerText = current.question;

    choiceButtons.forEach((button, i) => {
        const text = current.choices[i];
        button.classList.remove('correct', 'incorrect', 'dimmed');
        button.querySelector('.choice-text').innerText = text ?? '';
        button.querySelector('.choice-mark').textContent = '';
        button.hidden = text === undefined;
        button.disabled = false;
        button.removeAttribute('aria-label');
    });

    feedback.textContent = '';
    feedback.className = 'feedback';
    nextBtn.classList.add('hidden');
    acceptingAnswers = true;
    questionEl.focus();
};

const markChoice = (button, state, label) => {
    button.classList.add(state);
    button.querySelector('.choice-mark').textContent = state === 'correct' ? '✓' : '✗';
    button.setAttribute('aria-label', `${button.innerText.trim()} – ${label}`);
};

const answer = (selected) => {
    if (!acceptingAnswers) return;
    acceptingAnswers = false;

    const current = questions[questionIndex];
    const isCorrect = selected === current.answer;
    const correctButton = choiceButtons[current.answer - 1];
    const selectedButton = choiceButtons[selected - 1];

    choiceButtons.forEach((button) => {
        button.disabled = true;
        if (button !== correctButton && button !== selectedButton) button.classList.add('dimmed');
    });
    markChoice(correctButton, 'correct', 'correct answer');
    if (!isCorrect) markChoice(selectedButton, 'incorrect', 'your answer');

    if (isCorrect) score += CORRECT_BONUS;
    scoreText.innerText = score;
    results.push({ question: current.question, choices: current.choices, answer: current.answer, selected, raw: current.source });
    progressFill.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;

    const correctText = `${LETTERS[current.answer - 1]}: ${current.choices[current.answer - 1]}`;
    feedback.textContent = isCorrect ? 'Correct!' : `Not quite – the answer is ${correctText}`;
    feedback.className = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;

    const last = questionIndex === questions.length - 1;
    nextBtn.textContent = last ? 'See results' : 'Next';
    nextBtn.classList.remove('hidden');
    nextBtn.focus();
    // Right answers move on by themselves; wrong ones wait so the player can read the correction.
    if (isCorrect) advanceTimer = setTimeout(getNewQuestion, CORRECT_ADVANCE_MS);
};

choiceButtons.forEach((button) => {
    button.addEventListener('click', () => answer(Number(button.dataset.number)));
});

nextBtn.addEventListener('click', getNewQuestion);

document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const key = e.key.toUpperCase();
    const slot = '1234'.indexOf(key) + 1 || LETTERS.indexOf(key) + 1;
    if (slot && acceptingAnswers && !choiceButtons[slot - 1].hidden) {
        e.preventDefault();
        answer(slot);
    }
});

const confirmLeave = (e) => {
    if (questionIndex >= 0 && questionIndex < questions.length) {
        e.preventDefault();
        e.returnValue = '';
    }
};
window.addEventListener('beforeunload', confirmLeave);

document.getElementById('retryLoad').addEventListener('click', startGame);

if (category) startGame();
