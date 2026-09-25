// rpihub - simple RaspberryPi hub for other programs
// Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

/**
 * Manages translated phrases and their IndexedDB cache.
 */
class LanguageBase{

    /** @type {string} IndexedDB database name. */
    static #databaseName = "rpihub";

    /** @type {string} IndexedDB object-store name. */
    static #storeName = "languages";

    /** @type {string} Local-storage key containing the selected language. */
    static #languageKey = "rpihub-language";

    /** @type {Object<string, Object>} Loaded language bases indexed by code. */
    static #bases = {};

    /** @type {Object<string, Object>} Supported language metadata indexed by code. */
    static #metadata = {};

    /**
     * Initializes language metadata and synchronizes each language independently.
     *
     * Only a language whose server version differs from its cached version is
     * downloaded. This prevents changing one language from invalidating all
     * other cached language bases.
     *
     * @param {Object[]} metadata Server metadata for supported languages.
     * @param {API} api API wrapper used to download language bases.
     * @returns {Promise<void>} Promise resolved after synchronization completes.
     */
    static async initialize(metadata, api){
        LanguageBase.#metadata = {};
        LanguageBase.#bases = {};
        for (const language of metadata){
            LanguageBase.#metadata[language.code] = language;
        }

        const cachedLanguages = await LanguageBase.#getCachedLanguages();
        for (const language of metadata){
            const cached = cachedLanguages[language.code];
            if (cached && cached.version === language.version){
                LanguageBase.#bases[language.code] = cached;
                continue;
            }

            const response = await api.language(language.code);
            if (response.success){
                await LanguageBase.#putCachedLanguage(language.code, response.data);
            }
            else if (cached){
                LanguageBase.#bases[language.code] = cached;
            }
        }
    }

    /** @returns {string} Currently selected language code. */
    static get language(){
        const stored = localStorage.getItem(LanguageBase.#languageKey);
        const preferred = stored || (navigator.language || "en").split("-")[0];
        let reti = LanguageBase.#metadata[preferred] ? preferred : "en";
        if (!LanguageBase.#metadata[reti]){
            const first = Object.keys(LanguageBase.#metadata)[0];
            reti = first || "en";
        }
        return reti;
    }

    /** @returns {Object[]} Supported language metadata. */
    static get languages(){
        return Object.values(LanguageBase.#metadata);
    }

    /**
     * Changes the selected language.
     *
     * @param {string} language Language code to select.
     */
    static set language(language){
        if (LanguageBase.#metadata[language]){
            localStorage.setItem(LanguageBase.#languageKey, language);
        }
    }

    /**
     * Returns a translated phrase.
     *
     * @param {string} key Phrase identifier.
     * @returns {string} Translated phrase, English fallback, or the key itself.
     */
    static phrase(key){
        const current = LanguageBase.#bases[LanguageBase.language]?.phrases || {};
        const fallback = LanguageBase.#bases.en?.phrases || {};
        let reti = current[key] ?? fallback[key] ?? key;
        return reti;
    }

    /** Translates all DOM elements carrying a data-phrase attribute. */
    static translate(){
        document.querySelectorAll("[data-phrase]").forEach((element) => {
            element.innerText = LanguageBase.phrase(element.dataset.phrase);
        });
        document.documentElement.lang = LanguageBase.language;
    }

    /**
     * Opens the IndexedDB language cache.
     *
     * @returns {Promise<IDBDatabase>} Open database connection.
     */
    static #openDatabase(){
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(LanguageBase.#databaseName, 1);
            request.onupgradeneeded = () => request.result.createObjectStore(LanguageBase.#storeName);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Reads all cached language bases.
     *
     * @returns {Promise<Object<string, Object>>} Cached language bases indexed by code.
     */
    static async #getCachedLanguages(){
        const db = await LanguageBase.#openDatabase();
        const keys = await LanguageBase.#keys(db);
        const result = {};
        for (const key of keys){
            result[key] = await LanguageBase.#get(db, key);
        }
        db.close();
        let reti = result;
        return reti;
    }

    /**
     * Stores one language base in IndexedDB and in the in-memory cache.
     *
     * @param {string} language Language code.
     * @param {Object} data Downloaded language base.
     * @returns {Promise<void>} Promise resolved after the cache is updated.
     */
    static async #putCachedLanguage(language, data){
        const db = await LanguageBase.#openDatabase();
        await LanguageBase.#put(db, language, data);
        db.close();
        LanguageBase.#bases[language] = data;
    }

    /**
     * Reads a value from an IndexedDB object store.
     *
     * @param {IDBDatabase} db Database connection.
     * @param {string} key Object-store key.
     * @returns {Promise<Object|undefined>} Stored value.
     */
    static #get(db, key){
        return new Promise((resolve, reject) => {
            const request = db.transaction(LanguageBase.#storeName, "readonly").objectStore(LanguageBase.#storeName).get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Stores a value in IndexedDB.
     *
     * @param {IDBDatabase} db Database connection.
     * @param {string} key Object-store key.
     * @param {Object} value Value to store.
     * @returns {Promise<void>} Promise resolved after the write completes.
     */
    static #put(db, key, value){
        return new Promise((resolve, reject) => {
            const request = db.transaction(LanguageBase.#storeName, "readwrite").objectStore(LanguageBase.#storeName).put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Returns all keys in the language cache.
     *
     * @param {IDBDatabase} db Database connection.
     * @returns {Promise<IDBValidKey[]>} Cached language codes.
     */
    static #keys(db){
        return new Promise((resolve, reject) => {
            const request = db.transaction(LanguageBase.#storeName, "readonly").objectStore(LanguageBase.#storeName).getAllKeys();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
