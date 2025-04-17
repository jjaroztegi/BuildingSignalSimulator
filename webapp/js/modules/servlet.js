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
        throw error;
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
        throw error;
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

        if (signalTypeSelect) {
            signalTypeSelect.innerHTML = signalTypes
                .map(
                    (typeObj) =>
                        `<option value="${typeObj.type}" data-min="${typeObj.min}" data-max="${typeObj.max}">${typeObj.type} (${typeObj.min}dB - ${typeObj.max}dB)</option>`
                )
                .join("");

            if (signalTypes.length > 0) {
                signalTypeSelect.value = signalTypes[0].type;
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

export async function runSimulation(configId, signalType, componentsByFloor) {
    try {
        const configSelect = document.getElementById("simulation-config");
        if (!configSelect) {
            throw new Error("Configuration select element not found");
        }

        const selectedOption = Array.from(configSelect.options).find((option) => option.value === configId);

        if (!selectedOption) {
            throw new Error("Selected configuration not found");
        }

        const configData = JSON.parse(selectedOption.dataset.config);

        const components = [];
        Object.entries(componentsByFloor).forEach(([floor, floorComponents]) => {
            const floorNum = parseInt(floor);
            if (floorNum > configData.num_pisos) {
                throw new Error(
                    `Floor ${floorNum} exceeds the configuration's number of floors (${configData.num_pisos})`
                );
            }

            Object.entries(floorComponents).forEach(([type, models]) => {
                models.forEach((model) => {
                    components.push({
                        type: type,
                        model: model,
                        floor: floorNum,
                    });
                });
            });
        });

        const requestBody = {
            num_pisos: configData.num_pisos,
            nivel_cabecera: configData.nivel_cabecera,
            tipo_senal: signalType,
            components: components,
        };

        const simulateResponse = await fetch("calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!simulateResponse.ok) {
            const errorText = await simulateResponse.text();
            console.error("Server response:", errorText);
            throw new Error(`HTTP error! status: ${simulateResponse.status}. ${errorText}`);
        }

        return await simulateResponse.json();
    } catch (error) {
        console.error("Error during simulation:", error);
        throw error;
    }
}
