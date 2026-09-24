// rpihub - simple RaspberryPi hub for other programs
// Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

/**
 * Main function of the application.
 */
async function main(){
    const api = new API("/api", 8000);
    const ui = new UI(
        document.querySelector("#title"),
        document.querySelector("template#dialog-template"),
        document.querySelector(".dialogs"),
        document.querySelector("#apps-placeholder"),
        document.querySelector("#apps")
    );

    let applications = [];
    try{
        const languageResponse = await api.languages();
        if (!languageResponse.success){
            throw new Error(languageResponse.message);
        }

        await LanguageBase.initialize(languageResponse.data.languages, languageResponse.data.version, api);
        LanguageBase.translate();
        ui.setLanguages(LanguageBase.languages, async (language) => {
            LanguageBase.language = language;
            LanguageBase.translate();
            ui.updateLanguageSwitcher();
            renderApplications(ui, applications);
            updateDate();
        });

        ui.hideTitle();
        ui.showMainContent();
        updateDate();

        const applicationResponse = await api.applications();
        if (!applicationResponse.success){
            throw new Error(applicationResponse.message);
        }
        applications = applicationResponse.data;
        cacheApplications(applications);
        renderApplications(ui, applications);
    }
    catch(error){
        ui.hideTitleSpinner();
        const cachedApplications = getCachedApplications();
        if (cachedApplications.length > 0){
            applications = cachedApplications;
            LanguageBase.translate();
            ui.hideTitle();
            ui.showMainContent();
            renderApplications(ui, applications);
        }
        else{
            ui.showDialog("error", LanguageBase.phrase("error_start"), LanguageBase.phrase("error_language"), new Map([[LanguageBase.phrase("retry"), () => {location.reload();}]]), new Map([[LanguageBase.phrase("retry"), "las la-redo-alt"]]), false, error.message);
        }
    }
}

/** Updates the date shown on the page. */
function updateDate(){
    const today = document.querySelector("#today");
    if (today){
        today.innerText = new Date().toLocaleDateString(LanguageBase.language, {weekday: "long", year: "numeric", month: "long", day: "numeric"});
    }
}

/** Renders all applications. */
function renderApplications(ui, applications){
    ui.clearAppsContainer();
    for (const app of applications){
        ui.addAppToContainer(app);
    }
    ui.hideAppsPlaceholder();
    ui.showAppsContainer();
}

/** Caches application definitions locally for an offline fallback. */
function cacheApplications(applications){
    const data = applications.map((app) => ({
        name: Object.fromEntries(app.namesForCache || []),
        description: Object.fromEntries(app.descriptionsForCache || []),
        icon: app.getIcon(),
        target: app.getTarget(),
        accentColor: app.accentColorForCache || "#808080"
    }));
    // Application objects expose their original JSON through this small cache helper.
    if (data.length === applications.length){
        localStorage.setItem("rpihub-applications", JSON.stringify(data));
    }
}

/** Gets cached application definitions. */
function getCachedApplications(){
    let reti = [];
    try{
        const raw = localStorage.getItem("rpihub-applications");
        if (raw){
            reti = JSON.parse(raw).map((item) => Application.fromJSON(item));
        }
    }
    catch(error){
        reti = [];
    }
    return reti;
}

document.addEventListener("DOMContentLoaded", main);
