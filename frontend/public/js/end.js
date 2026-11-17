export function init() {
const username = document.getElementById('username');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const finalScore = document.getElementById('finalScore');
const summary = document.getElementById('summary');
const container = document.getElementById('container');
const resultsBox = document.getElementById('savedResults');
const resultsList = document.getElementById('results');
const wrongOnly = document.getElementById('wrongOnly');
const retryMissedBtn = document.getElementById('retryMissedBtn');

const MAX_HIGH_SCORES = 50;

const correct = Number(localStore.getItem('mostRecentScore')) || 0;
const total = Number(localStore.getItem('mostRecentTotal')) || 0;
const category = localStore.getItem('currentCatagory') || '';
const pct = total ? Math.round((correct / total) * 100) : 0;
const savedResults = readJson(localStore, 'savedResults', []);
const results = Array.isArray(savedResults) ? savedResults.filter(isResult) : [];
const missed = results.filter((r) => r.selected !== r.answer);

const verdict = (p) => {
    if (p === 100) return 'Perfect score!';
    if (p >= 80) return 'Great work.';
    if (p >= 50) return 'Good effort – review the misses below.';
    return 'Keep practising – try the questions you missed.';
};

finalScore.textContent = total ? `${correct} / ${total} (${pct}%)` : 'No game played yet';
summary.textContent = total ? `${categoryLabel(category)} · ${verdict(pct)}` : '';

if (!total) {
    document.getElementById('saveForm').classList.add('hidden');
    document.getElementById('reviewBtn').classList.add('hidden');
}

if (missed.length && missed.every((r) => isQuestion(r.raw))) {
    retryMissedBtn.textContent = `Retry missed (${missed.length})`;
    retryMissedBtn.classList.remove('hidden');
}

username.addEventListener('input', () => {
    saveScoreBtn.disabled = !username.value.trim();
});
username.focus();

document.getElementById('saveForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = username.value.trim();
    if (!name || !total) return;

    const savedScores = readJson(localStore, 'highScores', []);
    const highScores = Array.isArray(savedScores) ? savedScores.filter(isScore) : [];
    highScores.push({ name, correct, total, pct, category, date: new Date().toISOString() });
    // Rank by percentage, then by how many questions were answered.
    highScores.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1) || (b.total ?? 0) - (a.total ?? 0));
    writeJson(localStore, 'highScores', highScores.slice(0, MAX_HIGH_SCORES));
    navigate('./highscores.html');
});

retryMissedBtn.addEventListener('click', () => {
    writeJson(sessionStore, 'retryQuestions', missed.map((r) => r.raw));
    navigate('./game.html');
});

const renderResults = () => {
    const fragment = document.createDocumentFragment();
    const rows = wrongOnly.checked ? missed : results;
    if (!rows.length) fragment.append(el('p', wrongOnly.checked ? 'No wrong answers – nice!' : 'Nothing to review.'));

    rows.forEach((row) => {
        const isCorrect = row.selected === row.answer;
        const item = el('article', undefined, 'review-item');
        item.append(el('h3', `${isCorrect ? '✓' : '✗'} ${row.question}`, `savedQuestion ${isCorrect ? 'correctAnswer' : 'incorrectAnswer'}`));
        const list = el('ol', undefined, 'review-choices');
        row.choices.forEach((choice, i) => {
            const slot = i + 1;
            let note = '';
            let cls = '';
            if (slot === row.answer) { note = ' ✓ correct answer'; cls = 'correctAnswer'; }
            if (slot === row.selected && !isCorrect) { note = ' ✗ your answer'; cls = 'incorrectAnswer'; }
            const li = el('li', undefined, cls);
            li.append(el('span', `${LETTERS[i]}. ${choice}`), el('strong', note));
            list.append(li);
        });
        item.append(list);
        fragment.append(item);
    });
    resultsList.replaceChildren(fragment);
};

document.getElementById('reviewBtn').addEventListener('click', () => {
    container.classList.add('hidden');
    resultsBox.classList.remove('hidden');
    renderResults();
    document.getElementById('reviewTitle').focus();
});

document.getElementById('backBtn').addEventListener('click', () => {
    resultsBox.classList.add('hidden');
    container.classList.remove('hidden');
});

wrongOnly.addEventListener('change', renderResults);

}
