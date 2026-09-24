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
 * Class, which wraps all application API calls.
 */
class API{

    /** @type {string} */
    #endpoint;

    /** @type {number} */
    #timeout;

    /**
     * Creates a new API wrapper.
     * @param {string} endpoint API endpoint.
     * @param {number} timeout Request timeout in milliseconds.
     */
    constructor(endpoint, timeout){
        this.#endpoint = endpoint;
        this.#timeout = timeout;
    }

    /**
     * Performs an API request.
     * @param {string} path API path.
     * @returns {Promise<APIResponse<any>>} API response.
     */
    async #request(path){
        const start = Date.now();
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), this.#timeout);
        let reti;
        try{
            const response = await fetch(this.#endpoint + path, {signal: controller.signal, cache: "no-cache"});
            const data = await response.json();
            reti = new APIResponse(Date.now() - start, response.ok, data, response.ok ? "" : (data.detail || response.statusText));
        }
        catch(error){
            const message = error.name === "AbortError" ? "Request timed out." : error.message;
            reti = new APIResponse(Date.now() - start, false, null, message);
        }
        finally{
            window.clearTimeout(timer);
        }
        return reti;
    }

    /**
     * Gets language metadata and the language-base version.
     * @returns {Promise<APIResponse<any>>} API response.
     */
    languages(){
        return this.#request("/languages");
    }

    /**
     * Gets one language base.
     * @param {string} language Language code.
     * @returns {Promise<APIResponse<any>>} API response.
     */
    language(language){
        return this.#request("/languages/" + encodeURIComponent(language));
    }

    /**
     * Fetches the list of available applications.
     * @returns {Promise<APIResponse<Application[]>>} API response.
     */
    applications(){
        return this.#request("/applications").then((response) => {
            if (response.success){
                response = new APIResponse(response.time, true, response.data.map((item) => Application.fromJSON(item)));
            }
            let reti = response;
            return reti;
        });
    }
}
