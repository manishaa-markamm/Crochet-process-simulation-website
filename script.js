// --- CONFIGURATION ---
const DATA_FILE = 'data.json';

// --- MAIN FUNCTIONS ---

// 1. Load the "Explore" Page (homepage.html)
async function loadGallery() {
    const galleryContainer = document.querySelector('.card-container');
    const searchInput = document.getElementById('search-input');

    if (!galleryContainer) return; // Stop if we aren't on the gallery page

    try {
        const response = await fetch(DATA_FILE);
        const data = await response.json();

        // Function to render cards
        const render = (items) => {
            galleryContainer.innerHTML = '';
            items.forEach(item => {
                const card = `
                    <div class="card">
                        <div class="card-img" style="background-image: url('${item.image}')"></div>
                        <div class="card-info">
                            <h3>${item.name}</h3>
                            <span class="badge">${item.difficulty}</span>
                            <a href="working.html?id=${item.id}" class="btn-primary">View Steps</a>
                        </div>
                    </div>
                `;
                galleryContainer.innerHTML += card;
            });
        };

        // Initial Render
        render(data);

        // Search Feature
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = data.filter(item => item.name.toLowerCase().includes(term));
                render(filtered);
            });
        }

    } catch (error) {
        console.error("Error loading gallery:", error);
    }
}

// 2. Load the "Tutorial" Page (working.html)
let currentStep = 0;
let currentTutorial = null;

async function loadTutorial() {
    const titleEl = document.getElementById('tut-title');
    if (!titleEl) return; // Stop if we aren't on the tutorial page

    // Get ID from URL (e.g., working.html?id=teddy)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    try {
        const response = await fetch(DATA_FILE);
        const data = await response.json();
        currentTutorial = data.find(t => t.id === id);

        if (currentTutorial) {
            // Setup Page
            titleEl.textContent = currentTutorial.name;
            updateStep(); // Show first step
        }
    } catch (error) {
        console.error("Error loading tutorial:", error);
    }
}

// 3. Update the Step (Logic for Next/Prev)
function updateStep() {
    if (!currentTutorial) return;

    const stepData = currentTutorial.steps[currentStep];
    const totalSteps = currentTutorial.steps.length;
    
    // Update Text
    document.getElementById('step-count').textContent = `Step ${currentStep + 1} of ${totalSteps}`;
    document.getElementById('step-instruction').textContent = stepData.text;
    document.getElementById('step-detail').textContent = stepData.detail;
    
    // Update Image/Video (You can change 'img' to 'video' in HTML if needed)
    const mediaEl = document.getElementById('step-media');
    // For now, if you don't have GIFs, we use the main product image as fallback
    mediaEl.src = stepData.media || currentTutorial.image; 

    // Update Progress Bar
    const percent = ((currentStep + 1) / totalSteps) * 100;
    document.getElementById('progress-fill').style.width = `${percent}%`;

    // Button States
    document.getElementById('btn-prev').disabled = (currentStep === 0);
    document.getElementById('btn-next').innerText = (currentStep === totalSteps - 1) ? "Finish" : "Next Step";
}

// 4. Button Actions
function nextStep() {
    if (currentTutorial && currentStep < currentTutorial.steps.length - 1) {
        currentStep++;
        updateStep();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStep();
    }
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    loadGallery();
    loadTutorial();

    // Attach Click Listeners
    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (prevBtn) prevBtn.addEventListener('click', prevStep);
});
