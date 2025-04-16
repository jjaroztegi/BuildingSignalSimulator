// API calls module
import { updateComponentList } from "./ui.js";
import { displayError } from "./utils.js";
import { updateConfigSelect } from "./ui.js";

export async function fetchConfigurations() {
    try {
        const response = await fetch("configurations");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid response format: expected array of configurations");
        }
        
        return data;
    } catch (error) {
        console.error("Error fetching configurations:", error);
        displayError(`Error al cargar configuraciones: ${error.message}`);
        throw error; // Re-throw the error to be caught by the caller
    }
}

export async function fetchInitialData(configSelect) {
    try {
        const configurations = await fetchConfigurations();
        updateConfigSelect(configurations, configSelect);
        if (configurations.length > 0) {
            configSelect.value = configurations[0].id_configuraciones || configurations[0].id;
        }
        return configurations;
    } catch (error) {
        console.error("Error fetching initial data:", error);
        displayError(`Error al cargar configuraciones: ${error.message}`);
        throw error; // Re-throw the error to be caught by the caller
    }
}

export async function fetchSignalTypes(signalTypeSelect) {
    try {
        const response = await fetch("signal-types");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const signalTypes = await response.json();
        if (!Array.isArray(signalTypes)) {
            throw new Error("Invalid response format: expected array of signal types");
        }
        
        // Update the select element with the signal types
        if (signalTypeSelect) {
            signalTypeSelect.innerHTML = signalTypes
                .map(type => `<option value="${type}">${type}</option>`)
                .join("");
                
            // Set default value if available
            if (signalTypes.length > 0) {
                signalTypeSelect.value = signalTypes[0];
            }
        }
        
        return signalTypes;
    } catch (error) {
        console.error("Error fetching signal types:", error);
        displayError(`Error al cargar tipos de señal: ${error.message}`);
        throw error;
    }
}

export async function fetchComponentsByType(type, idConfiguracion = null, customListId = null) {
    const listElement = document.getElementById(customListId || `${type}-list`);
    if (!listElement) return;

    try {
        listElement.innerHTML = '<div class="text-gray-500 dark:text-gray-400">Cargando...</div>';

        const url = new URL("components", window.location.href);
        url.searchParams.append("type", type);
        if (idConfiguracion) {
            url.searchParams.append("id_configuraciones", idConfiguracion);
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Invalid response format: expected array");
        }

        updateComponentList(type, data, customListId);
        return data;
    } catch (error) {
        console.error(`Error al obtener ${type}:`, error);
        listElement.innerHTML = `<div class="text-red-500 dark:text-red-400">Error al cargar ${type}: ${error.message}</div>`;
        throw error;
    }
}

export async function fetchComponents() {
    const types = ["coaxial", "derivador", "distribuidor", "toma"];
    try {
        await Promise.all(types.map((type) => fetchComponentsByType(type)));
    } catch (error) {
        console.error("Error in fetchComponents:", error);
        displayError("Error al cargar algunos componentes. Por favor, intente actualizar la página.");
    }
}

export async function fetchComponentDetails(idConfiguracion) {
    try {
        const types = ["coaxial", "derivador", "distribuidor", "toma"];
        await Promise.all(types.map((type) => fetchComponentsByType(type, idConfiguracion)));
    } catch (error) {
        console.error("Error fetching component details:", error);
        displayError("Failed to load component details");
    }
}

export async function submitConfiguration(formData) {
    const response = await fetch("configurations", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
    });
    return await response.json();
}

export async function submitComponent(formData) {
    const response = await fetch("components", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
    });
    return await response.json();
}

export async function runSimulation(configId, signalType) {
    try {
        const response = await fetch(`/simulate?id_configuraciones=${configId}&tipo_senal=${signalType}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error during simulation:", error);
        throw error;
    }
} 