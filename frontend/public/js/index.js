export function init() {
const select = document.getElementById('catagories');
const lengthSelect = document.getElementById('quizLength');
const playBtn = document.getElementById('playBtn');
const loadError = document.getElementById('loadError');

async function getCatagories() {
    const categories = Object.keys(await getBank());
    if (!Array.isArray(categories) || categories.length === 0) throw new Error('no categories');
    return categories;
}

const option = (value) => {
    const node = el('option', categoryLabel(value));
    node.value = value;
    return node;
};

async function loadCatagories() {
    select.disabled = true;
    playBtn.disabled = true;
    loadError.classList.add('hidden');

    let cats;
    try {
        cats = await getCatagories();
    } catch (err) {
        console.warn('getCatagories failed', err);
        select.replaceChildren(el('option', 'Unavailable'));
        loadError.classList.remove('hidden');
        return;
    }

    const services = cats.filter((c) => !isAcronymCategory(c))
        .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b)));
    const acronyms = cats.filter(isAcronymCategory).sort();
    const acronymGroup = el('optgroup');
    acronymGroup.label = 'Acronyms';
    acronymGroup.append(...acronyms.map(option));
    select.replaceChildren(...services.map(option), ...(acronyms.length ? [acronymGroup] : []));

    const current = localStore.getItem('currentCatagory');
    select.value = current && cats.includes(current) ? current : (services[0] || acronyms[0]);
    const savedLength = localStore.getItem('quizLength');
    if (savedLength) lengthSelect.value = savedLength;

    select.disabled = false;
    playBtn.disabled = false;
}

document.getElementById('startForm').addEventListener('submit', (e) => {
    e.preventDefault();
    localStore.setItem('currentCatagory', select.value);
    localStore.setItem('quizLength', lengthSelect.value);
    sessionStore.removeItem('retryQuestions');
    navigate('./game.html');
});

document.getElementById('retryCategories').addEventListener('click', loadCatagories);

loadCatagories();

}
