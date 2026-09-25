// rpihub - simple RaspberryPi hub for other programs
// Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
// 
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; version 2 of the License.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.


/**
 * Class, which represents single application instzalled on the system.
 */
class Application{

    /**
     * Names of the application in different languages.
     * @type {Map<string, string>}
     */
    #names;

    /**
     * Descriptions of the application in different languages.
     * @type {Map<string, string>}
     */
    #descriptons;

    /**
     * Icon of the application.
     * @type {string}
     */
    #icon;

    /**
     * Target of the application.
     * @type {string}
     */
    #target;

    /**
     * Accent color of the application.
     * @type {string}
     */
    #accentColor;

    /**
     * Factor used to create accent color based on the current dark/light mode.
     * @type {number}
     */
    #coloringFactor = 10;

    /**
     * Placeholder for the value of the default language, which is used when the application does not have a name in the current language.
     * @type {string}
     */
    #defaultLang = "_default";

    /**
     * Creates a new representation of the single installed application.
     * @param {Map<string, string>} names Names of the application in different languages.
     * @param {Map<string, string>} descriptions Descriptions of the application in different languages.
     * @param {string} icon Icon of the application.
     * @param {string} target Target of the application.
     * @param {string} accentColor Accent color of the application.
     */
    /**
     * Creates an application from an API JSON object.
     * @param {Object} data Application data.
     * @returns {Application} Application instance.
     */
    static fromJSON(data){
        const names = new Map(Object.entries(data.name || {}));
        const descriptions = new Map(Object.entries(data.description || {}));
        const reti = new Application(names, descriptions, data.icon || "", data.target || "#", data.accentColor || "#808080");
        return reti;
    }

    constructor(names, descriptions, icon, target, accentColor){
        this.#names = names;
        this.#descriptons = descriptions;
        this.#icon = icon;
        this.#target = target;
        this.#accentColor = accentColor;
    }

    /** @returns {Map<string, string>} Original names for caching. */
    get namesForCache(){
        return this.#names;
    }

    /** @returns {Map<string, string>} Original descriptions for caching. */
    get descriptionsForCache(){
        return this.#descriptons;
    }

    /** @returns {string} Original accent color for caching. */
    get accentColorForCache(){
        return this.#accentColor;
    }

    /**
     * Gets the name of the application in the specified language.
     * @param {*} lang The language for which to get the name.
     * @returns {string} The name of the application in the specified language.
     */
    getName(lang){
        let reti = "<UNKNOWN_NAME(lang='" + lang + "')>";
        if (this.#names.has(lang)){
            reti = this.#names.get(lang);
        }
        else if (this.#names.has(this.#defaultLang)){
            reti = this.#names.get(this.#defaultLang);
        }
        return reti;
    }

    /**
     * Gets the description of the application in the specified language.
     * @param {*} lang The language for which to get the description.
     * @returns {string} The description of the application in the specified language.
     */
    getDescription(lang){
        let reti = "<UNKNOWN_DESCRIPTION(lang='" + lang + "')>";
        if (this.#descriptons.has(lang)){
            reti = this.#descriptons.get(lang);
        }
        else if (this.#descriptons.has(this.#defaultLang)){
            reti = this.#descriptons.get(this.#defaultLang);
        }
        return reti;
    }

    /**
     * Gets the icon of the application.
     * @returns Icon of the application.
     */
    getIcon(){
        return this.#icon;
    }

    /**
     * Gets the target of the application.
     * @returns Target of the application.
     */
    getTarget(){
        return this.#target;
    }

    /**
     * Gets the light variant of the accent color of the application.
     * @returns {string} Light variant of the accent color of the application.
     */
    getLightAccentColor(){
        const hex = this.#accentColor.replace("#", "");

        let red = parseInt(hex.substring(0, 2), 16);
        let green = parseInt(hex.substring(2, 4), 16);
        let blue = parseInt(hex.substring(4, 6), 16);

        const factor = this.#coloringFactor / 100;

        red = Math.round(red + (255 - red) * factor);
        green = Math.round(green + (255 - green) * factor);
        blue = Math.round(blue + (255 - blue) * factor);

        const reti = "#" +
            red.toString(16).padStart(2, "0") +
            green.toString(16).padStart(2, "0") +
            blue.toString(16).padStart(2, "0");

        return reti;
    }

    /**
     * Gets the dark variant of the accent color of the application.
     * @returns {string} Dark variant of the accent color of the application.
     */
    getDarkAccentColor(){
        const hex = this.#accentColor.replace("#", "");

        let red = parseInt(hex.substring(0, 2), 16);
        let green = parseInt(hex.substring(2, 4), 16);
        let blue = parseInt(hex.substring(4, 6), 16);

        const factor = this.#coloringFactor / 100;

        red = Math.round(red * (1 - factor));
        green = Math.round(green * (1 - factor));
        blue = Math.round(blue * (1 - factor));

        const reti = "#" +
            red.toString(16).padStart(2, "0") +
            green.toString(16).padStart(2, "0") +
            blue.toString(16).padStart(2, "0");

        return reti;
    }
}