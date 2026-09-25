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
 * Class representing a response from the server.
 */
class APIResponse{
    
    /**
     * Time needed for the response in milliseconds.
     * @type {number}
     */
    #time;

    /**
     * Indicates if the response was successful.
     * @type {boolean}
     */
    #success;

    /**
     * Data of the response.
     * @type {any}
     */
    #data;

    /**
     * Message of the response.
     * @type {string}
     */
    #message;

    /**
     * Creates a new response from the server.
     * @param {number} time Time needed for the response in milliseconds.
     * @param {boolean} success Flag indicating if the response was successful.
     * @param {any} data Data of the response.
     * @param {string} message Message of the response.
     */
    constructor(time, success, data, message = ""){
        this.#time = time;
        this.#success = success;
        this.#data = data;
        this.#message = message;
    }

    /**
     * Gets the time needed for the response in milliseconds.
     * @returns {number} Time needed for the response in milliseconds.
     */
    get time(){
        return this.#time;
    }

    /**
     * Gets the flag indicating if the response was successful.
     * @returns {boolean} Flag indicating if the response was successful.
     */
    get success(){
        return this.#success;
    }

    /**
     * Gets the data of the response.
     * @returns {any} Data of the response.
     */
    get data(){
        return this.#data;
    }

    /**
     * Gets the message of the response.
     * @returns {string} Message of the response.
     */
    get message(){
        return this.#message;
    }
}