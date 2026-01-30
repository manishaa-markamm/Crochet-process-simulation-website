const DATA_FILE = 'data.json';

// --- UTILITY: FETCH DATA ---
async function fetchData() {
    try {
        const res = await fetch(DATA_FILE);
        return await res.json();
    } catch (error) {
        console.error("Error loading data.json:", error);
        return [];
    }
}

// --- PAGE 1: EXPLORE (homepage.html) ---
async function loadGallery() {
    const container = document.getElementById('product-list');
    if (!container) return; // Stop if not on Explore page

    const data = await fetchData();
    const searchInput = document.getElementById('search-input');

    // Function to draw the grid
    const render = (items) => {
        container.innerHTML = '';
        if(items.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No patterns found matching that name.</p>';
            return;
        }

        items.forEach(item => {
            const card = `
                <div class="card">
                    <div class="card-img" style="background-image: url('${item.image}')"></div>
                    <div class="card-info">
                        <h3>${item.name}</h3>
                        <div style="margin-bottom:10px;">
                            <span class="badge">${item.difficulty}</span>
                            <span class="badge" style="background:#f0f2f5; color:#555;">${item.category}</span>
                        </div>
                        <a href="pattern.html?id=${item.id}" class="btn-primary">View Pattern</a>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    };

    // Initial Load
    render(data);

    // Search Feature
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = data.filter(item => 
                item.name.toLowerCase().includes(term) || 
                item.category.toLowerCase().includes(term)
            );
            render(filtered);
        });
    }
}

// --- PAGE 2: PATTERN DETAILS (pattern.html) ---
async function loadPatternDetails() {
    const title = document.getElementById('p-title');
    if (!title) return; // Stop if not on Pattern page

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const data = await fetchData();
    const item = data.find(i => i.id === id);

    if (item) {
        // Fill Text Info
        document.getElementById('p-title').innerText = item.name;
        document.getElementById('p-difficulty').innerText = item.difficulty;
        document.getElementById('p-category').innerText = item.category;
        document.getElementById('p-time').innerText = "⏱️ Time: " + item.details.time;
        document.getElementById('p-image').src = item.image;
        
        // Fill Lists (Materials, Tools, Techniques)
        const matList = document.getElementById('p-materials');
        item.details.materials.forEach(m => matList.innerHTML += `<li>${m}</li>`);

        const toolList = document.getElementById('p-tools');
        item.details.tools.forEach(t => toolList.innerHTML += `<li>${t}</li>`);

        const techDiv = document.getElementById('p-techs');
        item.details.techniques.forEach(t => techDiv.innerHTML += `<span>${t}</span>`);

        // Enable "Start" Button
        document.getElementById('start-tutorial-btn').onclick = () => {
            window.location.href = `working.html?id=${item.id}`;
        };
    } else {
        document.querySelector('.pattern-container').innerHTML = '<h2>Pattern not found!</h2>';
    }
}

// --- PAGE 3: TUTORIAL SIMULATION (working.html) ---
let currentStep = 0;
let currentItem = null;

async function loadTutorial() {
    const title = document.getElementById('tut-title');
    if (!title) return; // Stop if not on Working page

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const data = await fetchData();
    currentItem = data.find(i => i.id === id);

    if (currentItem) {
        // Setup Header
        title.innerText = currentItem.name;
        document.getElementById('nav-item-name').innerText = currentItem.name;
        
        // Load first step
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    if (!currentItem) return;

    const step = currentItem.steps[currentStep];
    const total = currentItem.steps.length;

    // 1. Update Text
    document.getElementById('step-count').innerText = `Step ${currentStep + 1} of ${total}`;
    document.getElementById('step-instruction').innerText = step.text;
    document.getElementById('step-detail').innerText = step.detail;
    
    // 2. SMART MEDIA HANDLER (Video vs Image)
    const mediaFile = step.media ? step.media : currentItem.image; // Fallback
    const imgEl = document.getElementById('step-image');
    const videoEl = document.getElementById('step-video');

    // Check if the file is a video
    if (mediaFile.endsWith('.mp4') || mediaFile.endsWith('.webm')) {
        // It is a VIDEO
        imgEl.style.display = 'none';      // Hide Image
        videoEl.style.display = 'block';   // Show Video
        videoEl.src = mediaFile;           // Load Video
    } else {
        // It is an IMAGE or GIF
        videoEl.style.display = 'none';    // Hide Video
        videoEl.pause();                   // Stop any playing video
        imgEl.style.display = 'block';     // Show Image
        imgEl.src = mediaFile;             // Load Image
    }

    // 3. Linear Progress Bar
    const percent = ((currentStep + 1) / total) * 100;
    document.getElementById('progress-fill').style.width = `${percent}%`;

    // 4. Circular Graph
    const chart = document.getElementById('chart-circle');
    chart.style.background = `conic-gradient(#FF8E53 ${percent}%, #eee ${percent}% 100%)`; // Orange fill
    document.getElementById('percent-text').innerText = `${Math.round(percent)}%`;

    // 5. Button Logic
    document.getElementById('btn-prev').disabled = (currentStep === 0);
    const nextBtn = document.getElementById('btn-next');
    
    if (currentStep === total - 1) {
        nextBtn.innerText = "Finish Pattern 🎉";
        nextBtn.onclick = () => {
            alert("Congratulations! You have completed the " + currentItem.name + "!");
            window.location.href = 'homepage.html';
        };
    } else {
        nextBtn.innerText = "Next Step";
        nextBtn.onclick = nextStep;
    }
}


function nextStep() {
    if (currentItem && currentStep < currentItem.steps.length - 1) {
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on and run the correct function
    if (document.getElementById('product-list')) loadGallery();
    if (document.getElementById('p-title')) loadPatternDetails();
    if (document.getElementById('tut-title')) loadTutorial();

    // Global Event Listener for Previous Button (exists on working page)
    const prevBtn = document.getElementById('btn-prev');
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
});
            
