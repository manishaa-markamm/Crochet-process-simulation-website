const DATA_FILE = 'data.json';

// --- UTILS ---
async function fetchData() {
    const res = await fetch(DATA_FILE);
    return await res.json();
}

// --- PAGE 1: EXPLORE (homepage.html) ---
async function loadGallery() {
    const container = document.getElementById('product-list');
    if (!container) return;

    const data = await fetchData();
    const searchInput = document.getElementById('search-input');

    const render = (items) => {
        container.innerHTML = '';
        items.forEach(item => {
            // Note the link goes to pattern.html now, NOT working.html
            const card = `
                <div class="card">
                    <div class="card-img" style="background-image: url('${item.image}')"></div>
                    <div class="card-info">
                        <h3>${item.name}</h3>
                        <span class="badge">${item.difficulty}</span>
                        <p style="font-size:0.8rem; color:#666; margin-bottom:10px;">⏱️ ${item.details.time}</p>
                        <a href="pattern.html?id=${item.id}" class="btn-primary">View Pattern</a>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    };

    render(data);

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            render(data.filter(i => i.name.toLowerCase().includes(term)));
        });
    }
}

// --- PAGE 2: PATTERN DETAILS (pattern.html) ---
async function loadPatternDetails() {
    const title = document.getElementById('p-title');
    if (!title) return; // Not on pattern page

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const data = await fetchData();
    const item = data.find(i => i.id === id);

    if (item) {
        // Text Info
        document.getElementById('p-title').innerText = item.name;
        document.getElementById('p-time').innerText = "⏱️ Time: " + item.details.time;
        document.getElementById('p-image').src = item.image;
        
        // Lists
        const matList = document.getElementById('p-materials');
        item.details.materials.forEach(m => matList.innerHTML += `<li>${m}</li>`);

        const toolList = document.getElementById('p-tools');
        item.details.tools.forEach(t => toolList.innerHTML += `<li>${t}</li>`);

        const techDiv = document.getElementById('p-techs');
        item.details.techniques.forEach(t => techDiv.innerHTML += `<span>${t}</span>`);

        // Start Button Link
        document.getElementById('start-tutorial-btn').onclick = () => {
            window.location.href = `working.html?id=${item.id}`;
        };
    }
}

// --- PAGE 3: TUTORIAL (working.html) ---
let currentStep = 0;
let currentItem = null;

async function loadTutorial() {
    const title = document.getElementById('tut-title');
    if (!title) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const data = await fetchData();
    currentItem = data.find(i => i.id === id);

    if (currentItem) {
        title.innerText = currentItem.name;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    if (!currentItem) return;

    const step = currentItem.steps[currentStep];
    const total = currentItem.steps.length;

    // Text & Image
    document.getElementById('step-count').innerText = `Step ${currentStep + 1}`;
    document.getElementById('step-instruction').innerText = step.text;
    document.getElementById('step-detail').innerText = step.detail;
    document.getElementById('step-media').src = step.media;

    // 1. Linear Progress Bar
    const percent = ((currentStep + 1) / total) * 100;
    document.getElementById('progress-fill').style.width = `${percent}%`;

    // 2. Circular Graph (The Advanced Part)
    // We use conic-gradient to draw the chart dynamically
    const chart = document.getElementById('chart-circle');
    chart.style.background = `conic-gradient(#E67E22 ${percent}%, #eee ${percent}% 100%)`;
    document.getElementById('percent-text').innerText = `${Math.round(percent)}%`;

    // Buttons
    document.getElementById('btn-prev').disabled = (currentStep === 0);
    const nextBtn = document.getElementById('btn-next');
    
    if (currentStep === total - 1) {
        nextBtn.innerText = "Finish 🎉";
        nextBtn.onclick = () => alert("Congratulations! You finished the project!");
    } else {
        nextBtn.innerText = "Next Step";
        nextBtn.onclick = nextStep;
    }
}

function nextStep() {
    if (currentStep < currentItem.steps.length - 1) {
        currentStep++;
        updateStepDisplay();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStepDisplay();
    }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    loadPatternDetails();
    loadTutorial();

    const prevBtn = document.getElementById('btn-prev');
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
});
                               
