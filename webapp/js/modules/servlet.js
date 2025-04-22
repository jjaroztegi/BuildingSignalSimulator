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
                        `<option value="${typeObj.type}" data-min="${typeObj.min}" data-max="${typeObj.max}">${typeObj.type} (${typeObj.min}dB - ${typeObj.max}dB)</option>`,
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
    // Convert form data to an object
    const data = {};
    formData.forEach((value, key) => {
        // Convert numeric strings to numbers
        data[key] = !isNaN(value) && value !== "" ? Number(value) : value;
    });

    // Add component-specific properties
    const properties = {};
    switch (data.type) {
        case "coaxial":
            properties.atenuacion_470mhz = data.atenuacion_470mhz;
            properties.atenuacion_694mhz = data.atenuacion_694mhz;
            break;
        case "derivador":
            properties.atenuacion_derivacion = data.atenuacion_derivacion;
            properties.atenuacion_paso = data.atenuacion_paso;
            properties.directividad = data.directividad;
            properties.desacoplo = data.desacoplo;
            properties.perdidas_retorno = data.perdidas_retorno;
            break;
        case "distribuidor":
            properties.numero_salidas = data.numero_salidas;
            properties.atenuacion_distribucion = data.atenuacion_distribucion;
            properties.desacoplo = data.desacoplo;
            properties.perdidas_retorno = data.perdidas_retorno;
            break;
        case "toma":
            properties.atenuacion = data.atenuacion;
            properties.desacoplo = data.desacoplo;
            break;
    }

    // Create the request body
    const requestBody = new URLSearchParams({
        ...data,
        properties: JSON.stringify(properties),
    });

    const response = await fetch("components", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: requestBody.toString(),
    });
    return await response.json();
}

export async function runSimulation(configId, signalType, componentsByFloor) {
    try {
        const configSelect = document.getElementById("simulation-config");
        const frequencyInput = document.getElementById("signal-frequency");

        if (!configSelect || !frequencyInput) {
            throw new Error("Required elements not found");
        }

        const frequency = parseInt(frequencyInput.value);
        if (isNaN(frequency) || frequency < 470 || frequency > 694) {
            throw new Error("Frecuencia debe ser un valor entero entre 470 y 694 MHz");
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
                    `Floor ${floorNum} exceeds the configuration's number of floors (${configData.num_pisos})`,
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
            frequency: frequency,
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

export async function fetchComponentsByModel(type, model) {
    try {
        const url = new URL("components", window.location.href);
        url.searchParams.append("type", type);
        url.searchParams.append("model", model);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for ${type} model ${model}:`, error);
        throw error;
    }
}
