

// Dynamically load categories from backend /categories endpoint
async function getCatagories() {
    try {
        const host = window.location.hostname;
        const apiBase = host === 'awsquiz.raspberrynode.com' ? 'https://awsquizapi.raspberrynode.com' : (host === 'localhost' ? 'http://localhost:5000' : '');
        const url = (apiBase || '') + '/categories';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const categories = await res.json();
        return Array.isArray(categories) ? categories : [];
    } catch (err) {
        // Fallback to a conservative default list if backend isn't reachable
        console.warn('getCatagories failed, using fallback list', err);
        return [
            'analytics','application_integration','compute','database','security_and_compliance','storage','networking_and_content_delivery','generative_ai','containers_and_orchestration','serverless','observability','other'
        ];
    }
}

async function loadCatagories () {
    const select = document.getElementById('catagories');
    const cats = await getCatagories();
    const options = cats.map(c => `<option value="${c}">${c}</option>`).join('\n');
    select.innerHTML = options;
    // set stored value if exists
    const current = localStorage.getItem('currentCatagory');
    if (current && cats.includes(current)) select.value = current;
    else if (cats.length) {
        select.value = cats[0];
        localStorage.setItem('currentCatagory', cats[0]);
    }
    // update on change
    select.addEventListener('change', () => {
        localStorage.setItem('currentCatagory', select.value);
    });
}

loadCatagories();