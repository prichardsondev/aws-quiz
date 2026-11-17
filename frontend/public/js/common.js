// Shared helpers for the quiz pages.

// The read-only question bank ships with the site; no API or Pi is needed.
let bankPromise;
const getBank = () => bankPromise ||= fetch('./questions.json')
    .then((res) => { if (!res.ok) throw new Error('Could not load questions.'); return res.json(); })
    .then((data) => data.catagory)
    .catch((err) => { bankPromise = null; throw err; });

// Guard the storage getter as well as every operation. Memory remains authoritative
// after a failed write, so stale disk values cannot replace the current round.
const safeStorage = (name) => {
    const memory = new Map();
    return {
        getItem(key) {
            if (memory.has(key)) return memory.get(key);
            try { return window[name].getItem(`awsQuiz:${key}`); } catch { return null; }
        },
        setItem(key, value) {
            memory.set(key, String(value));
            try { window[name].setItem(`awsQuiz:${key}`, String(value)); } catch { showStorageNotice(); }
        },
        removeItem(key) {
            memory.set(key, null);
            try { window[name].removeItem(`awsQuiz:${key}`); } catch { showStorageNotice(); }
        }
    };
};
let storageUnavailable = false;
const showStorageNotice = () => {
    storageUnavailable = true;
    if (document.getElementById('storageNotice')) return;
    const note = document.createElement('p');
    note.id = 'storageNotice';
    note.className = 'hint storage-notice';
    note.setAttribute('role', 'status');
    note.textContent = 'Browser storage is unavailable. You can play and review in this tab; progress and scores will be lost when you reload or close it.';
    document.body.append(note);
};
const localStore = safeStorage('localStorage');
const sessionStore = safeStorage('sessionStorage');

// Single-letter categories hold acronym questions.
const isAcronymCategory = (id) => /^[a-z]$/.test(id);

const ACRONYM_WORDS = { ai: 'AI', ar: 'AR', vr: 'VR', iot: 'IoT', aws: 'AWS' };

const categoryLabel = (id) => {
    if (!id) return '';
    if (isAcronymCategory(id)) return `Acronyms: ${id.toUpperCase()}`;
    return id
        .split('_')
        .map((word, i) => ACRONYM_WORDS[word] || (word === 'and' && i > 0 ? 'and' : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(' ');
};

const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
};

// localStorage can be unavailable or hold corrupt JSON; never let that break a page.
const readJson = (storage, key, fallback) => {
    try {
        const value = JSON.parse(storage.getItem(key));
        return value === null ? fallback : value;
    } catch (err) {
        return fallback;
    }
};

const writeJson = (storage, key, value) => {
    try {
        storage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.warn(`could not save ${key}`, err);
    }
};

const isScore = (s) => s && typeof s.name === 'string' &&
    (!s.category || typeof s.category === 'string') &&
    (Number.isFinite(s.score) || (Number.isFinite(s.correct) && Number.isFinite(s.total) && Number.isFinite(s.pct)));
const isQuestion = (q) => q && typeof q.question === 'string' && typeof q.answer === 'string' &&
    Array.isArray(q.distractors) && q.distractors.length >= 3 && q.distractors.every((c) => typeof c === 'string');
const isResult = (r) => r && typeof r.question === 'string' &&
    Array.isArray(r.choices) && r.choices.every((c) => typeof c === 'string') &&
    Number.isInteger(r.answer) && Number.isInteger(r.selected);

const LETTERS = ['A', 'B', 'C', 'D'];

// Keep page transitions in this document so quizzes also work when both storage
// APIs are blocked. Static HTML pages remain valid direct entry points.
const pageNames = { 'index.html': 'index', 'game.html': 'game', 'end.html': 'end', 'highscores.html': 'highscores' };
let disposePage = () => {};
let navigating = false;
const pageName = () => pageNames[location.pathname.split('/').pop() || 'index.html'];
const bootPage = async () => {
    const page = await import(`./${pageName()}.js`);
    disposePage = page.init() || (() => {});
    if (storageUnavailable) showStorageNotice();
};
const navigate = async (target, historyMode = 'pushState') => {
    if (navigating) return;
    navigating = true;
    try {
        const url = new URL(target, location.href);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Page unavailable');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        doc.querySelectorAll('script').forEach((script) => script.remove());
        disposePage();
        document.body.replaceChildren(...doc.body.childNodes);
        document.title = doc.title;
        if (historyMode) history[historyMode](null, '', url);
        await bootPage();
        window.scrollTo(0, 0);
    } catch (err) {
        const note = el('p', 'Could not open the page. Check your connection and try again.', 'error');
        note.setAttribute('role', 'alert');
        document.body.append(note);
        console.error(err);
    } finally { navigating = false; }
};
document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.download) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !pageNames[url.pathname.split('/').pop() || 'index.html']) return;
    event.preventDefault();
    navigate(url.href);
});
window.addEventListener('popstate', () => navigate(location.href, null));
bootPage();
