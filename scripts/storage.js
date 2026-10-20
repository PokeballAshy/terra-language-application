const KEYS = {
    CEFR: 'decoder_cefr_level',
    STRESS: 'decoder_stress_enabled',
    CURSIVE: 'decoder_cursive_enabled'
};

export const Storage = {
    getCefrlevel() {
        return localStorage.getItem(KEYS.CEFR) || 'A1-A2';
    },
    setCefrlevel(level) {
        localStorage.setItem(KEYS.CEFR, level);
    },

    getStressEnabled() {
        const val = localStorage.getItem(KEYS.STRESS);
        return val === null ? true : val === 'true';
    },
    setStressEnabled(bool) {
        localStorage.setItem(KEYS.STRESS, String(bool));
    },

    getCursiveEnabled() {
        return localStorage.getItem(KEYS.CURSIVE) === 'true';
    },
    setCursiveEnabled(bool) {
        localStorage.setItem(KEYS.CURSIVE, String(bool));
    }
};