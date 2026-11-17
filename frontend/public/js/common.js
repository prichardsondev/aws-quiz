// Shared helpers for the quiz pages.

const API_BASE = (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';
    return 'https://awsquizapi.raspberrynode.com';
})();

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

const LETTERS = ['A', 'B', 'C', 'D'];
