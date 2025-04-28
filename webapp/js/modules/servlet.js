// API calls module
import { displayError } from "./utils.js";
import { updateConfigSelect } from "./ui.js";

// Configuration API Calls
export async function fetchConfigurations() {
    try {
        const response = await fetch("configurations");
        if (!response.ok) {
            console.error("Error fetching configurations:", `HTTP error! status: ${response.status}`);
            displayError("Error al cargar las configuraciones. Por favor, intente de nuevo.");
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Error fetching configurations: Invalid response format");
            displayError("Error en el formato de las configuraciones recibidas.");
            throw new Error("Invalid response format: expected array of configurations");
        }

        return data;
    } catch (error) {
        console.error("Error fetching configurations:", error);
        displayError("Error al cargar las configuraciones. Por favor, intente de nuevo.");
        throw error;
    }
}

export async function updateConfiguration(configId, formData) {
    try {
        const response = await fetch("configurations", {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                id_configuraciones: configId,
                ...Object.fromEntries(formData),
            }).toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error updating configuration:", errorData.error);
            displayError(errorData.error);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating configuration:", error);
        displayError("Error al actualizar la configuración. Por favor, intente de nuevo.");
        throw error;
    }
}

export async function deleteConfiguration(configId) {
    try {
        const url = new URL("configurations", window.location.href);
        url.searchParams.append("id_configuraciones", configId);

        const response = await fetch(url, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error deleting configuration:", errorData.error);
            displayError(errorData.error);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting configuration:", error);
        displayError("Error al eliminar la configuración. Por favor, intente de nuevo.");
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
        displayError("Error al cargar los datos iniciales. Por favor, actualice la página.");
        throw error;
    }
}

export async function submitConfiguration(formData) {
    try {
        const response = await fetch("configurations", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error submitting configuration:", errorData.error);
            displayError(errorData.error);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error submitting configuration:", error);
        if (!error.message.includes("Ya existe una configuracion con ese nombre")) {
            displayError("Error al guardar la configuración. Por favor, intente de nuevo.");
        }
        throw error;
    }
}

// Signal Type API Calls
export async function fetchSignalTypes() {
    try {
        const response = await fetch("signal-types");
        if (!response.ok) {
            console.error("Error fetching signal types:", `HTTP error! status: ${response.status}`);
            displayError("Error al cargar los tipos de señal. Por favor, intente de nuevo.");
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const signalTypes = await response.json();
        if (!Array.isArray(signalTypes)) {
            console.error("Error fetching signal types: Invalid response format");
            displayError("Error en el formato de los tipos de señal recibidos.");
            throw new Error("Invalid response format: expected array of signal types");
        }

        return signalTypes;
    } catch (error) {
        console.error("Error fetching signal types:", error);
        displayError("Error al cargar los tipos de señal. Por favor, intente de nuevo.");
        throw error;
    }
}

// Component API Calls
export async function fetchComponents() {
    const types = ["coaxial", "derivador", "distribuidor", "toma"];
    try {
        await Promise.all(types.map((type) => fetchComponentsByType(type)));
    } catch (error) {
        console.error("Error in fetchComponents:", error);
        displayError("Error al cargar algunos componentes. Por favor, intente actualizar la página.");
    }
}

export async function fetchComponentsByType(type, idConfiguracion = null) {
    try {
        const url = new URL("components", window.location.href);
        url.searchParams.append("type", type);
        if (idConfiguracion) {
            url.searchParams.append("id_configuraciones", idConfiguracion);
        }

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching ${type} components:`, `HTTP error! status: ${response.status}`);
            displayError(`Error al cargar los componentes de tipo ${type}. Por favor, intente de nuevo.`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error(`Error fetching ${type} components: Invalid response format`);
            displayError(`Error en el formato de los componentes de tipo ${type} recibidos.`);
            throw new Error("Invalid response format: expected array");
        }

        return data;
    } catch (error) {
        console.error(`Error fetching ${type} components:`, error);
        displayError(`Error al cargar los componentes de tipo ${type}. Por favor, intente de nuevo.`);
        throw error;
    }
}

export async function fetchComponentDetails(idConfiguracion) {
    try {
        const types = ["coaxial", "derivador", "distribuidor", "toma"];
        await Promise.all(types.map((type) => fetchComponentsByType(type, idConfiguracion)));
    } catch (error) {
        console.error("Error fetching component details:", error);
        displayError("Error al cargar los detalles de los componentes. Por favor, intente de nuevo.");
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
            console.error(`Error fetching details for ${type} ${model}:`, `HTTP error! status: ${response.status}`);
            displayError(`Error al cargar los detalles del componente ${model}. Por favor, intente de nuevo.`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for ${type} ${model}:`, error);
        displayError(`Error al cargar los detalles del componente ${model}. Por favor, intente de nuevo.`);
        throw error;
    }
}

export async function submitComponent(formData) {
    try {
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

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error submitting component:", errorData.error);
            displayError(errorData.error);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error submitting component:", error);
        if (!error.message.includes("Ya existe un componente con ese modelo")) {
            displayError("Error al guardar el componente. Por favor, intente de nuevo.");
        }
        throw error;
    }
}

// Simulation API Calls
export async function runSimulation(simulationData) {
    try {
        const simulateResponse = await fetch("calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(simulationData),
        });

        if (!simulateResponse.ok) {
            const errorText = await simulateResponse.text();
            console.error("Error during simulation:", errorText);
            displayError("Error al ejecutar la simulación. Por favor, revise los datos e intente de nuevo.");
            throw new Error(`HTTP error! status: ${simulateResponse.status}. ${errorText}`);
        }

        return await simulateResponse.json();
    } catch (error) {
        console.error("Error during simulation:", error);
        displayError("Error al ejecutar la simulación. Por favor, intente de nuevo.");
        throw error;
    }
}

export async function deleteComponent(type, model) {
    try {
        const url = new URL("components", window.location.href);
        url.searchParams.append("type", type);
        url.searchParams.append("modelo", model);

        const response = await fetch(url, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error deleting ${type} ${model}:`, errorData.error);
            displayError(`Error al eliminar el componente ${model}: ${errorData.error}`);
            throw new Error(errorData.error);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`Error deleting ${type} ${model}:`, error);
        displayError(`Error al eliminar el componente ${model}. Por favor, intente de nuevo.`);
        throw error;
    }
}

export async function updateComponent(type, model, formData) {
    try {
        // Convert form data to an object
        const data = {};
        formData.forEach((value, key) => {
            if (key !== "type" && key !== "modelo") {
                // Convert numeric strings to numbers
                data[key] = !isNaN(value) && value !== "" ? Number(value) : value;
            }
        });

        // Add component-specific properties
        const properties = {};
        switch (type.toLowerCase()) {
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
            type: type,
            modelo: model,
            costo: data.costo,
            properties: JSON.stringify(properties),
        });

        const response = await fetch("components", {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: requestBody.toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error updating ${type} ${model}:`, errorData.error);
            displayError(`Error al actualizar el componente ${model}: ${errorData.error}`);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating ${type} ${model}:`, error);
        displayError(`Error al actualizar el componente ${model}. Por favor, intente de nuevo.`);
        throw error;
    }
}

// Simulation History API Call
export async function fetchSimulationHistory(idConfiguracion) {
    try {
        const url = new URL("history", window.location.href);
        url.searchParams.append("id_configuraciones", idConfiguracion);

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching simulation history:", errorData.error);
            displayError(`Error al cargar el historial de simulaciones: ${errorData.error}`);
            throw new Error(errorData.error || "Error al cargar el historial de simulaciones");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching simulation history:", error);
        displayError("Error al cargar el historial de simulaciones. Por favor, intente de nuevo.");
        throw error;
    }
}

export async function deleteSimulationHistory(idSimulacion) {
    try {
        const url = new URL("history", window.location.href);
        url.searchParams.append("id_simulaciones", idSimulacion);

        const response = await fetch(url, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error deleting simulation history:", errorData.error);
            displayError(`Error al eliminar la simulación: ${errorData.error}`);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting simulation history:", error);
        displayError("Error al eliminar la simulación. Por favor, intente de nuevo.");
        throw error;
    }
}

export async function saveSimulationHistory(simulationData) {
    try {
        const response = await fetch("history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(simulationData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al guardar la simulación");
        }

        return await response.json();
    } catch (error) {
        console.error("Error saving simulation history:", error);
        throw error;
    }
}

// Schematic API Calls
export async function saveSchematicComponent(componentData) {
    try {
        const response = await fetch("schematic", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(componentData).toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error saving schematic component:", errorData.error);
            displayError(`Error al guardar el componente: ${errorData.error}`);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error saving schematic component:", error);
        displayError("Error al guardar el componente. Por favor, intente de nuevo.");
        throw error;
    }
}

export async function loadSchematic(idSimulacion) {
    try {
        const url = new URL("schematic", window.location.href);
        url.searchParams.append("id_simulaciones", idSimulacion);

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error loading schematic:", errorData.error);
            displayError(`Error al cargar el esquemático: ${errorData.error}`);
            throw new Error(errorData.error || "Error al cargar el esquemático");
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading schematic:", error);
        displayError("Error al cargar el esquemático. Por favor, intente de nuevo.");
        throw error;
    }
}

export async function deleteSchematicComponent(idEsquematico) {
    try {
        const url = new URL("schematic", window.location.href);
        url.searchParams.append("id_esquematicos", idEsquematico);

        const response = await fetch(url, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error deleting schematic component:", errorData.error);
            displayError(`Error al eliminar el componente: ${errorData.error}`);
            throw new Error(errorData.error);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting schematic component:", error);
        displayError("Error al eliminar el componente. Por favor, intente de nuevo.");
        throw error;
    }
}
