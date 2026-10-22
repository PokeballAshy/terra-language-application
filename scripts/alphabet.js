import { Storage } from "./storage.js";
import { formatRussianText } from "./utils.js";

let alphabetData = []
let selectedLetter = null;

const grid = document.getElementById("alphabet-grid");
const inspector = document.getElementById("inspector-panel");

//Fetch the 33 letters AAAAAAAAAAAAAAAAA im genuinely gonna fall asleep sitting atp
async function loadAlphabet() {
    try {
        const response = await fetch("./data/alphabet.json");
        alphabetData = await response.json();
        renderGrid();

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