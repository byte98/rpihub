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
 * Class, which represents the user interface of the application.
 */
class UI{

    /**
     * Template for the dialog.
     * @type {HTMLTemplateElement}
     */
    #dialogTemplate;

    /**
     * Container for the dialogs.
     * @type {HTMLElement}
     */
    #dialogsContainer;

    /**
     * First element shown to the user, which is used to show the title of the application.
     * @type {HTMLElement}
     */
    #titleElement;

    /**
     * Placeholder for the applications, which are installed on the system.
     * @type {HTMLElement}
     */
    #appsPlaceholder;

    /**
     * Container for the applications, which are installed on the system.
     * @type {HTMLElement}
     */
    #appsContainer;

    /**
     * Creates new wrapper of the user interface.
     * @param {HTMLElement} titleElement Element, which is used to show the title of the application.
     * @param {HTMLTemplateElement} dialogTemplate Template for the dialog.
     * @param {HTMLElement} dialogsContainer Container for the dialogs.
     * @param {HTMLElement} appsPlaceholder Placeholder for the applications, which are installed on the system.
     * @param {HTMLElement} appsContainer Container for the applications, which are installed on the system.
     */
    constructor(titleElement, dialogTemplate, dialogsContainer, appsPlaceholder, appsContainer){
        this.#titleElement = titleElement;
        this.#dialogTemplate = dialogTemplate;
        this.#dialogsContainer = dialogsContainer;
        this.#appsPlaceholder = appsPlaceholder;
        this.#appsContainer = appsContainer;
    }

    /**
     * Builds the custom language dropdown.
     *
     * @param {Object[]} languages Supported language metadata.
     * @param {Function} onChange Called with the selected language code.
     */
    setLanguages(languages, onChange){
        const container = document.querySelector("#language-switcher");
        if (!container){
            return;
        }
        container.innerHTML = "";

        const selected = document.createElement("button");
        selected.type = "button";
        selected.className = "language-selected";
        selected.setAttribute("aria-haspopup", "listbox");
        selected.setAttribute("aria-expanded", "false");

        const menu = document.createElement("div");
        menu.className = "language-menu hidden";
        menu.setAttribute("role", "listbox");

        for (const language of languages){
            const option = document.createElement("button");
            option.type = "button";
            option.className = "language-option";
            option.dataset.language = language.code;
            option.setAttribute("role", "option");
            option.innerHTML = `<img src="/flags/${language.flag}.svg" alt=""> <span>${language.nativeName}</span>`;
            option.addEventListener("click", () => {
                onChange(language.code);
                menu.classList.add("hidden");
                selected.setAttribute("aria-expanded", "false");
                this.updateLanguageSwitcher();
            });
            menu.appendChild(option);
        }

        selected.addEventListener("click", () => {
            const hidden = menu.classList.toggle("hidden");
            selected.setAttribute("aria-expanded", String(!hidden));
        });

        document.addEventListener("click", (event) => {
            if (!container.contains(event.target)) {
                menu.classList.add("hidden");
                selected.setAttribute("aria-expanded", "false");
            }
        });

        container.appendChild(selected);
        container.appendChild(menu);
        this.updateLanguageSwitcher();
    }

    /** Updates the selected language shown by the custom dropdown. */
    updateLanguageSwitcher(){
        const language = LanguageBase.languages.find((item) => item.code === LanguageBase.language);
        const container = document.querySelector("#language-switcher");
        if (!language || !container){
            return;
        }
        const selected = container.querySelector(".language-selected");
        if (selected){
            selected.innerHTML = `<img src="/flags/${language.flag}.svg" alt=""> <span>${language.nativeName}</span><i class="las la-angle-down"></i>`;
        }
        container.querySelectorAll(".language-option").forEach((option) => {
            option.classList.toggle("selected", option.dataset.language === language.code);
            option.setAttribute("aria-selected", String(option.dataset.language === language.code));
        });
    }

    /**
     * Shows a dialog.
     * @param {"error"} type Type of the dialog.
     * @param {string} header Header of the dialog.
     * @param {string} body Body of the dialog.
     * @param {Map<string, Function>} actions Actions of the dialog.
     * @param {Map<string, string>} actionIcons Icons of the actions of the dialog.
     * @param {boolean} closeable  Flag, which indicates, whether the dialog can be closed by the user.
     * @param {string} details Details of the dialog, which can be shown by the user.
     */
    showDialog(type, header, body, actions, actionIcons, closeable, details = ""){
        const icons = {
            "error": "las la-times-circle"
        };
        const classes = {
            "error": "err-dialog"
        };
        const icon = icons[type] !== undefined ? icons[type] : "las la-info-circle";
        const className = classes[type] !== undefined ? classes[type] : "";
        const dialog = this.#dialogTemplate.content.cloneNode(true).querySelector(".dialog");
        dialog.classList.add(className);
        const aside = dialog.querySelector("aside");
        const iconElement = document.createElement("i");
        iconElement.className = icon;
        aside.appendChild(iconElement);
        const dialogHeader = dialog.querySelector("h1");
        dialogHeader.innerText = header;
        const dialogBody = dialog.querySelector("p");
        dialogBody.innerText = body;
        const dialogActions = dialog.querySelector("ul");
        for (const [actionName, actionFunction] of actions){
            const actionElement = document.createElement("li");
            const actionButton = document.createElement("button");
            const actionIconClass = actionIcons.get(actionName) !== undefined ? actionIcons.get(actionName) : "";
            if (actionIconClass !== ""){
                const actionIcon = document.createElement("i");
                actionIcon.className = actionIconClass;
                actionButton.appendChild(actionIcon);
            }
            const actionButtonText = document.createTextNode(actionName);
            actionButton.appendChild(actionButtonText);
            actionButton.type = "button";
            actionButton.addEventListener("click", () => {
                actionFunction();
                this.#dialogsContainer.removeChild(dialog);
            });
            actionElement.appendChild(actionButton);
            dialogActions.appendChild(actionElement);
        }
        if (closeable){
            const closeIcon = document.createElement("i");
            closeIcon.className = "las la-times";
            const closeActionElement = document.createElement("li");
            const closeActionButton = document.createElement("button");
            closeActionButton.type = "cancel";
            closeActionButton.appendChild(closeIcon);
            closeActionButton.title = "Close";
            const closeButtonText = document.createTextNode("Close");
            closeActionButton.appendChild(closeButtonText);
            closeActionButton.addEventListener("click", () => {
                this.#dialogsContainer.removeChild(dialog);
            });
            closeActionElement.appendChild(closeActionButton);
            dialogActions.appendChild(closeActionElement);
        }
        if (details !== ""){
            const detailsElement = dialog.querySelector(".details");
            const detailsActionElement = document.createElement("li");
            const detailsActionButton = document.createElement("button");
            const caretDownClass = "las la-caret-down";
            const caretUpClass = "las la-caret-up";
            const detailsIcon = document.createElement("i");
            detailsIcon.className = caretDownClass;
            detailsActionButton.type = "button";
            detailsActionButton.innerText = "Show details";
            detailsActionButton.appendChild(detailsIcon);
            detailsActionButton.addEventListener("click", () => {
                detailsElement.classList.toggle("hidden");
                if (detailsElement.classList.contains("hidden")){
                    detailsIcon.className = caretDownClass;
                }
                else{
                    detailsIcon.className = caretUpClass;
                }
            });
            detailsActionElement.appendChild(detailsActionButton);
            dialogActions.appendChild(detailsActionElement);
            const detailsParagraph = detailsElement.querySelector("p");
            detailsParagraph.innerText = details;
        }
        this.#dialogsContainer.appendChild(dialog);
    }

    /**
     * Hides the spinner in the title element.
     */
    hideTitleSpinner(){
        const spinner = this.#titleElement.querySelector(".loader");
        if (spinner) {
            spinner.classList.add("hidden");
        }
    }

    /**
     * Hides the title element.
     */
    hideTitle(){
        this.#titleElement.classList.add("hidden");
    }

    /**
     * Shows the main content of the application.
     */
    showMainContent(){
        const mainContent = document.querySelector("main");
        if (mainContent) {
            mainContent.classList.remove("hidden");
        }
    }

    /**
     * Hides the placeholder for the applications, which are installed on the system.
     */
    hideAppsPlaceholder(){
        if (this.#appsPlaceholder) {
            this.#appsPlaceholder.classList.add("hidden");
        }
    }

    /**
     * Shows the container for the applications, which are installed on the system.
     */
    showAppsContainer(){
        if (this.#appsContainer) {
            this.#appsContainer.classList.remove("hidden");
        }
    }

    /**
     * Clears the container for the applications, which are installed on the system.
     */
    clearAppsContainer(){
        if (this.#appsContainer) {
            this.#appsContainer.innerHTML = "";
        }
    }

    /**
     * Adds an application to the container.
     * @param {Application} app Application to add to the container.
     */
    addAppToContainer(app){
        if (this.#appsContainer) {
            const appList = this.#appsContainer.querySelector("ul") || document.createElement("ul");
            const dataName = "app-" + app.getName("en").replaceAll(" ", "-").toLowerCase();
            const appItem = document.createElement("li");
            const appLink = document.createElement("a");
            appLink.href = app.getTarget();
            const icon = document.createElement("img");
            icon.src = app.getIcon();
            icon.alt = app.getName(LanguageBase.language);
            const name = document.createElement("h3");
            name.innerText = app.getName(LanguageBase.language);
            name.setAttribute("data-phrase", dataName + "-name");
            const description = document.createElement("span");
            description.innerText = app.getDescription(LanguageBase.language);
            description.setAttribute("data-phrase", dataName + "-description");
            appItem.style.setProperty("--accent-color-light", app.getLightAccentColor());
            appItem.style.setProperty("--accent-color-dark", app.getDarkAccentColor());
            appLink.appendChild(icon);
            appLink.appendChild(name);
            appLink.appendChild(description);
            appItem.appendChild(appLink);
            appList.appendChild(appItem);
            if (this.#appsContainer.contains(appList) == false) {
                this.#appsContainer.appendChild(appList);
            }
        }
    }
}