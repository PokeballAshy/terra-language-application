import { Storage } from "./storage.js";
import { formatRussianText } from "./utils.js";

let alphabetData = []
let selectedLetter = null;

const CATEGORIES = {
    "true-friends": new Set(["А", "К", "М", "О", "Т"]),
    "false-friends": new Set(["В", "Е", "Н", "Р", "С", "У", "Х"]),
    "slavic": new Set(["Б", "Г", "Д", "Ж", "З", "И", "Й", "Л", "П", "Ф", "Ц", "Ч", "Ш", "Щ", "Э", "Ю", "Я"]),
    "modifiers": new Set(["Ъ", "Ы", "Ь"])
};
let currentCategory = "all";

const grid = document.getElementById("alphabet-grid");
const inspector = document.getElementById("inspector-panel");

//Fetch the 33 letters AAAAAAAAAAAAAAAAA im genuinely gonna fall asleep sitting atp
async function loadAlphabet() {
    try {
        const response = await fetch("./data/alphabet.json");
        alphabetData = await response.json();
        renderGrid();
        setupCategoryFilters();
        loadTraps();

        //Select first letter by default if none is selected
        if (alphabetData.length > 0) {
            selectLetter(alphabetData[0]);
        }
    } catch (err) {
        console.error("Failed to load alphabet data:", err);
    }
}

//Render the 33 cards .·´¯`(>▂<)´¯`·. 
function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";

    alphabetData.forEach(item => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `letter-card ${item.isFalseFriend ? 'false-friend' : ''} ${selectedLetter?.letter === item.letter ? 'selected' : ''}`;

        card.innerHTML = `
            <span class="letter ru-text">${item.letter} </span>
            <span class="sound-hint">${item.soundHint.split(' ')[0]} </span>
            ${item.isFalseFriend ? '<span class="warning-badge" title="False Friend!">!</span>' : ''}
        `;
        
        card.addEventListener("click", () => selectLetter(item));
        grid.appendChild(card);
    });
}

//Open inspector panel with letter details Ijuststartedandimalreadytired
function selectLetter(item) {
    selectedLetter = item;
    inspector.hidden = false;

    //Update active highlight on cards :3
    document.querySelectorAll(".letter-card").forEach(c => c.classList.remove("selected"));
    const activeBtn = Array.from(grid.children).find(b => b.querySelector(".letter")?.textContent === item.letter);
    if (activeBtn) activeBtn.classList.add("selected");

    updateInspector();
}

//Fill inspector content based on active CEFR level and stress settings
function updateInspector() {
    if (!selectedLetter || !inspector) return;
    
    const currentCefr = Storage.getCefrlevel();
    let cefrNote = selectedLetter.a1Note
    if (currentCefr === "B1-B2") cefrNote = selectedLetter.b1Note;
    if (currentCefr === "C1-C2") cefrNote = selectedLetter.c1Note;

    const formattedWord = formatRussianText(selectedLetter.exampleWord);

    inspector.innerHTML = `
        <div class="inspector-header">
            <h2 class="letter ru-text">${selectedLetter.letter}</h2>
            <div class="letter-meta">
                <span class="name ru-text">${selectedLetter.name}</span>
                <span class="sound">${selectedLetter.soundHint}</span>
            </div>
        </div>
    
       ${selectedLetter.isFalseFriend ?`
           <div class="false-friend-alert">
               <strong>⚠️ False Friend Alert:</strong> This Cyrillic letter looks like an English letter but has a completely different sound!
            </div>
        `: ''}

        <div class="inspector-section">
            <h3>Handwriting/Cursive</h3>
            <p class="cursive-lookalike">${selectedLetter.cursiveLookalike}</p>
        </div>

        <div class="inspector-section">
            <h3>Example Word</h3>
            <p class="example-box">
                <span class="example-word ru-text">${formattedWord}</span>
                <span class="phonetic">(${selectedLetter.phoneticSpelling})</span>
            </p> 
        </div>

        <div class="inspector-section">
            <h3> Phonetics (${currentCefr}) </h3>
            <p class="cefr-note">${cefrNote}</p>
        </div>
   `;
}

//Listen for global navbar toggle changes 
window.addEventListener("cefrChanged", () => {
    updateInspector();
});

window.addEventListener("settingsChanged", () => {
    updateInspector();
});

//Initialize on DOM load 
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAlphabet);
} else {
    loadAlphabet();
}

// Foonctions for the Category filters (⌐■_■)
function setupCategoryFilters() {
    const filterBar = document.getElementById("category-filters");
    if (!filterBar) return;
    
    filterBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-pill");
        if (!btn) return;

        filterBar.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");

        currentCategory = btn.dataset.category;
        applyCategoryFilter();
    });
}

function applyCategoryFilter() {
    const cards = document.querySelectorAll(".letter-card");
    cards.forEach(card => {
        const letter = card.querySelector(".letter")?.textContent.trim();
        if (currentCategory === "all") {
            card.classList.remove("is-filtered-out");
        } else {
            const allowedLetters = CATEGORIES[currentCategory];
            if (allowedLetters && allowedLetters.has(letter)) {
                card.classList.remove("is-filtered-out");
            } else {
                card.classList.add("is-filtered-out");
            }
        }
    })
}

// --- Cursive Trap decodey logic yippie ---
let trapsData = [];
let currentTrapIndex = 0;

async function loadTraps() {
    try {
        const response = await fetch("./data/traps.json");
        trapsData = await response.json();
        if (trapsData.lenght > 0) {
            renderTrapSelector();
            displayTrapWord;
        }
    } catch (err) {
        console.error("Failed to load cursive traps:", err);
    }
}

function renderTrapSelector() {
    const bar= document.getElementById("trap-selector-bar");
    if (!bar) return;
    bar.innerHTML = "";

    trapsData.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `trap-pill ru-text ${index === 0 ? 'active' : ''}`;
        btn.textContent = item.word;
        btn.addEventListener("click", () => {
            bar.querySelectorAll(".trap-pill").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            displayTrapWord(index);
        });
        bar.appendChild(btn);
    });
}

function displayTrapWord(index) {
    currentTrapIndex = index;
    const trap = trapsData[index];
    if (!trap) return;

    const displayEl = document.getElementById("trap-word-display");
    const metaEl = document.getElementById("trap-meta");
    const noteEl = document.getElementById("trap-note");

    if (displayEl) {
        displayEl.innerHTML = "";
        trap.letters.forEach(char => {
            const span = document.createElement("span");
            span.className = "trap-letter-span";
            span.textContent = char;
            span.title = `Letter: ${char}`;
            displayEl.appendChild(span);
        });
    }

    if (metaEl) {
        metaEl.textContent = `${trap.word} — "${trap.translation}"`;
    }
    if (noteEl) {
        noteEl.textContent = trap.trapNote;
    }
}