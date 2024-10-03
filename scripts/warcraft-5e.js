/**
 * Create object of language of Azeroth to be registered in Foundry modules.
 * @param {string} name Language Name
 * @param {string} font Font from Polyglot Module
 * @param {boolean} isStandard if language is standard (exotic if false)
 * @param {'none'|'unique'|'default'} rng [From Polyglot module] Defines randomization used for the language. The other options are unique (strings are always unique) and none (strings are never randomized).
 * @returns {object} Structure for `CONFIG.DND5E.languages` and Polyglot module
 * 
 * @see {@link https://github.com/foundryvtt/dnd5e/wiki/Modifying-Your-Game-with-Scripts#modify-languages}
 * @see {@link https://github.com/mclemente/fvtt-module-polyglot/wiki/API#additional-capabilities-of-the-api}
 */
function initLang(name, font, isStandard = true, rng = 'default') {
    const key = name.replace(/\W/g, '').toLowerCase();
    const label = 'WC5E.Languages.' + key;
    return {
        key,
        isStandard,
        dnd: label,
        polyglot: { label, font, rng }
    };
}

/**
 * Scripts of languages of Azeroth
 */
const LANG_SCRIPTS = {
    common: 'Thorass',
    darnassian: 'Thassilonian',
    eredic: 'Elthrin',
    dwarvish: 'Dethek',
    mogu: 'Oriental',
    taurahe: 'Barazhad',
    zandali: 'Daedra',
    celestial: 'Celestial',
    draconic: 'Ar Ciela',
    kalimag: 'Olde Thorass',
    other: 'Espruar',
}

/**
 * Language of Azeroth to be registered in Foundry modules.
 */
const LANGUAGES = [
    initLang('Common', LANG_SCRIPTS.common),
    initLang('Darnassian', LANG_SCRIPTS.darnassian),
    initLang('Draenei', LANG_SCRIPTS.eredic),
    initLang('Dwarven', LANG_SCRIPTS.dwarvish),
    initLang('Goblin', LANG_SCRIPTS.common),
    initLang('Gnomish', LANG_SCRIPTS.common),
    initLang('Gutterspeak', LANG_SCRIPTS.other),
    initLang('Mogu', LANG_SCRIPTS.mogu),
    initLang('Orcish', LANG_SCRIPTS.common),
    initLang('Shalassian', LANG_SCRIPTS.darnassian),
    initLang('Taur-ahe', LANG_SCRIPTS.taurahe),
    initLang('Thalassian', LANG_SCRIPTS.darnassian),
    initLang('Zandali', LANG_SCRIPTS.zandali),

    initLang('Celestial', LANG_SCRIPTS.celestial, false),
    initLang('Draconic', LANG_SCRIPTS.draconic, false),
    initLang('Eredun', LANG_SCRIPTS.eredic, false),
    initLang('Giant', LANG_SCRIPTS.other, false),
    initLang('Kalimag', LANG_SCRIPTS.kalimag, false),
    initLang('Low Common', LANG_SCRIPTS.common, false),
];

/**
 * Register languages of Azeroth in DnD5e system
 * 
 * @see {@link https://github.com/foundryvtt/dnd5e/wiki/Modifying-Your-Game-with-Scripts#modify-languages}
 */
function dndLanguageSetup() {
    delete CONFIG.DND5E.languages.druidic;
    delete CONFIG.DND5E.languages.cant;
    for (const key in CONFIG.DND5E.languages.standard.children) {
        delete CONFIG.DND5E.languages.standard.children[key];
    }
    for (const key in CONFIG.DND5E.languages.exotic.children) {
        delete CONFIG.DND5E.languages.exotic.children[key];
    }

    for (const lang of LANGUAGES) {
        CONFIG.DND5E.languages[lang.isStandard ? 'standard' : 'exotic'].children[lang.key] = game.i18n.localize(lang.dnd);
    }
}

/**
 * Register languages of Azeroth in Polyglot module (if installed).
 * 
 * @param {class} LanguageProvider Base class for Polyglot module language provider
 * 
 * @see {@link https://github.com/mclemente/fvtt-module-polyglot/wiki/API#additional-capabilities-of-the-api}
 */
function polyglotSetup(LanguageProvider) {
    class WC5ELanguageProvider extends LanguageProvider {
        languages = {};

        async getLanguages() {
            const langs = {};

            for (const lang of LANGUAGES) {
                lang.polyglot.label = game.i18n.localize(lang.polyglot.label);
                langs[lang.key] = lang.polyglot;
            }

            this.languages = langs;
        }

        getUserLanguages(actor) {
            let known_languages = new Set();
            let literate_languages = new Set();
            for (let lang of actor.system.attributes.languages.value) {
                known_languages.add(lang);
            }
            return [known_languages, literate_languages];
        }
    }

    game.polyglot.api.registerModule('warcraft-5e', WC5ELanguageProvider);
}

// ======================================================================

// Initialize module
Hooks.once('init', async () => {
    console.log('warcraft-5e | Initializing warcraft-5e');
    
    dndLanguageSetup();
});

// Additional hook for Polyglot module
Hooks.once('polyglot.init', polyglotSetup);