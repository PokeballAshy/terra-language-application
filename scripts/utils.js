import { Storage } from "./storage.js";

/*strips combining \u0301 if stress marks are off */
export function formatRussianText(text) {
    if (!text) return '';
    const stressActive = Storage.getStressEnabled();
    return stressActive ? text : text.normalize('NFD').replace(/\u0301/g, '').normalize('NFC');
}

function iniNavigation() {
    const header = document.getElementById('global-header');
    if (!header) return;

    const currentCefr = Storage.getCefrlevel();
    const stressActive = Storage.getStressEnabled();
    const cursiveActive = Storage.getCursiveEnabled();

    //1. Injecting Nav Html here
    header.innerHTML = `
    <div class="nav-brand">
     <strong>Cyrillic Decoder</strong>
    </div>

    <div class="nav-controls" style="display: flex; gap: 1rem; align-items: center;">
     <!-- CEFR segmented toggle -->
     <div class="toggle-group cefr-toggle" role="group" aria-label="CEFR level">
      <button type="button" class="cefr-btn ${currentCefr === 'A1-A2' ? 'active' : ''}" data-level="A1-A2">A1-A2</button>
      <button type="button" class="cefr-btn ${currentCefr === 'B1-B2' ? 'active' : ''}" data-level="B1-B2">B1-B2</button>
      <button type="button" class="cefr-btn ${currentCefr === 'C1-C2' ? 'active' : ''}" data-level="C1-C2">C1-C2</button>
    </div>

    <!-- Stress accent toggle -->
    <button type="button" id="stress-toggle" class="toggle-btn ${stressActive ? 'active' : ''}">
     Ударе́ние: <span id="stress-status">${stressActive ? 'ON' : 'OFF'}</span>
    </button>

    <!-- Cursive toddle -->
    <button type="button" id="cursive-toggle" class="toggle-btn" ${cursiveActive ? 'active' : ''}">
     Режим: <span id="cursive-status">${cursiveActive ? 'Курси́в' : 'Блок'}</span>
    </button>
   </div>
  `;
    //Apply initial cursive mode to body if stored as true imsotiredbrowhat
    if (cursiveActive) {
      document.body.classList.add('cursive-mode');
    }

    //2. Apply initial cursive mode to body if stored as true iwantoeepy
    const cefrButtons = header.querySelectorAll('.cefr-btn');
    cefrButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            cefrButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const level = btn.dataset.level;
            Storage.setCefrlevel(level);

            window.dispatchEvent(new CustomEvent('cefrChanged', { detail: {level}}));
        });
    });

    //3. Apply stress mark toggle listener thingy why'sthissotedious
    const stressBtn = header.querySelector('#stress-toggle');
    const stressStatus = header.querySelector('#stress-status');
    stressBtn.addEventListener('click', () => {
        const nextState = !Storage.getStressEnabled();
        Storage.setStressEnabled(nextState);

        stressBtn.classList.toggle('active', nextState);
        stressStatus.textContent = nextState ? 'ON' : 'OFF'

        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { stress:nextState, cursive: Storage.getCursiveEnabled()}
        }));
    });

    //4. Cursive Toggle listener ugh
    const cursiveBtn = header.querySelector('#cursive-toggle');
    const cursiveStatus = header.querySelector('#cursive-status');
    cursiveBtn.addEventListener('click', () => {
        const nextState = !Storage.getCursiveEnabled();
        Storage.setCursiveEnabled(nextState);

        cursiveBtn.classList.toggle('active', nextState);
        cursiveStatus.textContent = nextState ? 'Курси́в' : 'Блок';
        document.body.classList.toggle('cursive-mode', nextState);

        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: {stress: Storage.getStressEnabled(), cursive: nextState}
        }));
    });
}

//Initialize when DOM is parsed AAAAAAAAAA
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniNavigation);
} else {
    iniNavigation();
}