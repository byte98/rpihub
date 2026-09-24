// rpihub - simple RaspberryPi hub for other programs
// Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

/**
 * Class representing the language base and its IndexedDB cache.
 */
class LanguageBase{

    /** @type {string} */
    static #databaseName = "rpihub";

    /** @type {string} */
    static #storeName = "languages";

    /** @type {string} */
    static #languageKey = "rpihub-language";

    /** @type {Object<string, Object>} */
    static #bases = {};

    /** @type {Object<string, Object>} */
    static #metadata = {};

    /** @type {string} */
    static #version = "";

    /**
     * Initializes language metadata and cached language data.
     * @param {Object} metadata Server language metadata.
     * @param {string} version Current server language-base version.
     * @param {API} api API wrapper.
     * @returns {Promise<void>} Initialization promise.
     */
    static async initialize(metadata, version, api){
        LanguageBase.#version = version;
        LanguageBase.#metadata = {};
        for (const language of metadata){
            LanguageBase.#metadata[language.code] = language;
        }

        const cachedVersion = await LanguageBase.#getCachedVersion();
        if (cachedVersion !== version){
            for (const language of metadata){
                const response = await api.language(language.code);
                if (response.success){
                    await LanguageBase.#putCachedLanguage(language.code, response.data);
                }
            }
        }
        else{
            const cached = await LanguageBase.#getCachedLanguages();
            LanguageBase.#bases = cached;
        }

        if (Object.keys(LanguageBase.#bases).length === 0){
            for (const language of metadata){
                const response = await api.language(language.code);
                if (response.success){
                    await LanguageBase.#putCachedLanguage(language.code, response.data);
                }
            }
        }
        await LanguageBase.#setCachedVersion(version);
    }

    /** @returns {string} Current language. */
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

    /** @returns {string} Current language-base version. */
    static get version(){
        return LanguageBase.#version;
    }

    /** @returns {Object[]} Supported languages. */
    static get languages(){
        return Object.values(LanguageBase.#metadata);
    }

    /**
     * Sets the current language.
     * @param {string} language Language code.
     */
    static set language(language){
        if (LanguageBase.#metadata[language]){
            localStorage.setItem(LanguageBase.#languageKey, language);
        }
    }

    /**
     * Gets a phrase in the current language.
     * @param {string} key Phrase key.
     * @returns {string} Translated phrase or the key.
     */
    static phrase(key){
        const current = LanguageBase.#bases[LanguageBase.language]?.phrases || {};
        const fallback = LanguageBase.#bases.en?.phrases || {};
        let reti = current[key] ?? fallback[key] ?? key;
        return reti;
    }

    /** Translates all elements carrying data-phrase. */
    static translate(){
        document.querySelectorAll("[data-phrase]").forEach((element) => {
            element.innerText = LanguageBase.phrase(element.dataset.phrase);
        });
        document.documentElement.lang = LanguageBase.language;
    }

    /** @returns {Promise<IDBDatabase>} Opens the language cache. */
    static #openDatabase(){
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(LanguageBase.#databaseName, 1);
            request.onupgradeneeded = () => request.result.createObjectStore(LanguageBase.#storeName);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /** @returns {Promise<string>} Cached language-base version. */
    static async #getCachedVersion(){
        const db = await LanguageBase.#openDatabase();
        const value = await LanguageBase.#get(db, "version");
        db.close();
        let reti = value || "";
        return reti;
    }

    /** @returns {Promise<Object<string, Object>>} Cached language data. */
    static async #getCachedLanguages(){
        const db = await LanguageBase.#openDatabase();
        const keys = await LanguageBase.#keys(db);
        const result = {};
        for (const key of keys){
            if (key !== "version"){
                result[key] = await LanguageBase.#get(db, key);
            }
        }
        db.close();
        let reti = result;
        return reti;
    }

    static async #putCachedLanguage(language, data){
        const db = await LanguageBase.#openDatabase();
        await LanguageBase.#put(db, language, data);
        db.close();
        LanguageBase.#bases[language] = data;
    }

    static async #setCachedVersion(version){
        const db = await LanguageBase.#openDatabase();
        await LanguageBase.#put(db, "version", version);
        db.close();
    }

    static #get(db, key){
        return new Promise((resolve, reject) => {
            const request = db.transaction(LanguageBase.#storeName, "readonly").objectStore(LanguageBase.#storeName).get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    static #put(db, key, value){
        return new Promise((resolve, reject) => {
            const request = db.transaction(LanguageBase.#storeName, "readwrite").objectStore(LanguageBase.#storeName).put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    static #keys(db){
        return new Promise((resolve, reject) => {
            const request = db.transaction(LanguageBase.#storeName, "readonly").objectStore(LanguageBase.#storeName).getAllKeys();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
