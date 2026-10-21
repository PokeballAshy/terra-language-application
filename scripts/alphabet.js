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