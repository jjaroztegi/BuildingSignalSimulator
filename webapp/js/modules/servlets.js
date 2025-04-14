// Servlet interaction module
import { setLoadingState, displayError, displaySuccess, clearMessages } from './utils.js';
import { updateComponentList, updateSignalLevelDisplay, renderSimulationDetails, updateComponentSection, updateSignalQualitySummary } from './ui.js';

export async function handleFormSubmit(event, initialConfigForm, errorMessageElement, successMessageElement, configSelect) {
    event.preventDefault();
    clearMessages(errorMessageElement, successMessageElement);

    const formData = new FormData(initialConfigForm);
    const configName = formData.get("nombre");
    const nivelCabecera = formData.get("nivel_cabecera");
    const numPisos = formData.get("num_pisos");

    // Basic client-side validation
    if (!configName || !nivelCabecera || !numPisos || isNaN(nivelCabecera) || isNaN(numPisos) || parseInt(numPisos) <= 0) {
        displayError("Please fill in all fields with valid values (Floors > 0).", errorMessageElement, successMessageElement);
        return;
    }

    const submitButton = initialConfigForm.querySelector('button[type="submit"]');
    setLoadingState(submitButton, true);

    try {
        const response = await fetch("configurations", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        });
        const data = await response.json();

        if (response.ok && data.success) {
            displaySuccess(data.success, successMessageElement, errorMessageElement);
            initialConfigForm.reset();
            await fetchInitialData(configSelect); // Wait for the data to be fetched

            // Find the newly created configuration in the select options
            const newConfigOption = Array.from(configSelect.options).find(
                (option) => option.textContent === configName
            );

            if (newConfigOption) {
                configSelect.value = newConfigOption.value;
                // Trigger the change event to update the UI
                configSelect.dispatchEvent(new Event("change"));
            }

            // Switch to the optimization tab
            const optimizationTab = document.getElementById("optimization-tab");
            if (optimizationTab) {
                optimizationTab.click();
            }
        } else {
            const errorMsg = data?.error || `Request failed with status ${response.status}`;
            displayError(`Configuration Error: ${errorMsg}`, errorMessageElement, successMessageElement);
        }
    } catch (error) {
        console.error("Error submitting configuration:", error);
        displayError(`A network or unexpected error occurred: ${error.message}`, errorMessageElement, successMessageElement);
    } finally {
        setLoadingState(submitButton, false);
    }
}

export async function handleOptimization(configSelect, optimizeButton, simulationDetailsElement, errorMessageElement, successMessageElement) {
    const idConfiguracion = configSelect.value;
    const signalType = document.getElementById("signal-type")?.value || "TV Digital";

    if (!idConfiguracion) {
        displayError("Please select a configuration.", errorMessageElement, successMessageElement);
        return;
    }

    setLoadingState(optimizeButton, true);

    try {
        // First optimize the configuration
        const optimizeResponse = await fetch("optimize", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                id_configuraciones: idConfiguracion,
                id_frecuencias: "1", // Default frequency ID
            }).toString(),
        });
        const optimizeData = await optimizeResponse.json();

        if (!optimizeResponse.ok) {
            throw new Error(optimizeData?.error || "Optimization failed");
        }

        // Then validate the signal quality
        const validateResponse = await fetch(
            `validate-quality?id_configuraciones=${idConfiguracion}&tipo_senal=${signalType}`
        );
        const validationData = await validateResponse.json();

        if (!validateResponse.ok) {
            throw new Error(validationData?.error || "Validation failed");
        }

        // Update the UI with the results
        updateSignalLevelDisplay(validationData, simulationDetailsElement);
        updateComponentDetails(idConfiguracion);
        updateSignalQualitySummary(validationData);
        displaySuccess("Configuration optimized and validated successfully", successMessageElement, errorMessageElement);
    } catch (error) {
        console.error("Error during optimization:", error);
        displayError(`Failed to optimize configuration: ${error.message}`, errorMessageElement, successMessageElement);
    } finally {
        setLoadingState(optimizeButton, false);
    }
}

export async function handleComponentSubmit(event, componentForm, errorMessageElement, successMessageElement) {
    event.preventDefault();
    clearMessages(errorMessageElement, successMessageElement);

    const formData = new FormData(componentForm);
    const type = formData.get("type");
    const modelo = formData.get("modelo");
    const costo = formData.get("costo");

    if (!type || !modelo || !costo || isNaN(costo)) {
        displayError("Please fill in all fields with valid values.", errorMessageElement, successMessageElement);
        return;
    }

    const submitButton = componentForm.querySelector('button[type="submit"]');
    setLoadingState(submitButton, true);

    try {
        const response = await fetch("components", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        });
        const data = await response.json();

        if (response.ok && data.success) {
            displaySuccess(data.success, successMessageElement, errorMessageElement);
            componentForm.reset();
            // Refresh only the relevant component list
            await fetchComponentsByType(type);
        } else {
            const errorMsg = data?.error || `Request failed with status ${response.status}`;
            displayError(`Component Error: ${errorMsg}`, errorMessageElement, successMessageElement);
        }
    } catch (error) {
        console.error("Error adding component:", error);
        displayError(`A network or unexpected error occurred: ${error.message}`, errorMessageElement, successMessageElement);
    } finally {
        setLoadingState(submitButton, false);
    }
}

export async function handleQualitySubmit(event, qualityForm, errorMessageElement, successMessageElement) {
    event.preventDefault();
    clearMessages(errorMessageElement, successMessageElement);

    const formData = new FormData(qualityForm);
    const tipoSenal = formData.get("tipo_senal");
    const nivelMinimo = formData.get("nivel_minimo");
    const nivelMaximo = formData.get("nivel_maximo");

    if (!tipoSenal || !nivelMinimo || !nivelMaximo || isNaN(nivelMinimo) || isNaN(nivelMaximo)) {
        displayError("Please fill in all fields with valid values.", errorMessageElement, successMessageElement);
        return;
    }

    const submitButton = qualityForm.querySelector('button[type="submit"]');
    setLoadingState(submitButton, true);

    try {
        const response = await fetch("validate-quality", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        });
        const data = await response.json();

        if (response.ok && data.success) {
            displaySuccess(data.success, successMessageElement, errorMessageElement);
            qualityForm.reset();
            fetchQualityMargins(configSelect, qualityForm);
        } else {
            const errorMsg = data?.error || `Request failed with status ${response.status}`;
            displayError(`Quality Error: ${errorMsg}`, errorMessageElement, successMessageElement);
        }
    } catch (error) {
        console.error("Error adding quality margins:", error);
        displayError(`A network or unexpected error occurred: ${error.message}`, errorMessageElement, successMessageElement);
    } finally {
        setLoadingState(submitButton, false);
    }
}

export async function fetchComponentsByType(type) {
    const listElement = document.getElementById(`${type}-list`);
    if (!listElement) return;

    try {
        listElement.innerHTML = '<div class="text-gray-500 dark:text-gray-400">Loading...</div>';

        const response = await fetch(`components?type=${type}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Invalid response format: expected array");
        }

        updateComponentList(type, data);
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        listElement.innerHTML = `<div class="text-red-500 dark:text-red-400">Error loading ${type}: ${error.message}</div>`;
    }
}

export async function fetchComponents() {
    const types = ["cable", "derivador", "distribuidor", "amplificador", "toma"];
    try {
        await Promise.all(types.map((type) => fetchComponentsByType(type)));
    } catch (error) {
        console.error("Error in fetchComponents:", error);
        displayError("Failed to load some components. Please try refreshing the page.");
    }
}

export async function fetchInitialData(configSelect) {
    try {
        const response = await fetch("configurations");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
            updateConfigSelect(data, configSelect);
            if (data.length > 0) {
                const selectedConfig = configSelect.value || data[0].id;
                renderSimulationDetails(data[0]);
            }
        } else {
            throw new Error("Invalid response format: expected array of configurations");
        }
    } catch (error) {
        console.error("Error fetching initial data:", error);
        displayError(`Failed to load configurations: ${error.message}`);
    }
}

export async function fetchQualityMargins(configSelect, qualityForm) {
    const idConfiguracion = configSelect?.value;
    const tipoSenal = qualityForm?.querySelector('select[name="tipo_senal"]')?.value;

    if (!idConfiguracion || !tipoSenal) {
        console.warn("Missing required parameters for quality margins");
        return;
    }

    try {
        const response = await fetch(
            `validate-quality?id_configuraciones=${idConfiguracion}&tipo_senal=${tipoSenal}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateQualityDisplay(data);
    } catch (error) {
        console.error("Error fetching quality margins:", error);
        displayError(`Failed to load quality margins: ${error.message}`);
    }
}

export async function updateComponentDetails(idConfiguracion) {
    try {
        const response = await fetch(`components/details?id_configuraciones=${idConfiguracion}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Update each component section
        updateComponentSection("cable", data.cables);
        updateComponentSection("derivador", data.derivadores);
        updateComponentSection("distribuidor", data.distribuidores);
        updateComponentSection("amplificador", data.amplificadores);
    } catch (error) {
        console.error("Error fetching component details:", error);
        displayError("Failed to load component details");
    }
}

function updateConfigSelect(configurations, configSelect) {
    if (!configSelect) return;

    configSelect.innerHTML = configurations
        .map((config) => {
            const option = document.createElement("option");
            option.value = config.id_configuraciones || config.id;
            option.textContent = config.nombre;
            option.dataset.config = JSON.stringify(config);
            return option.outerHTML;
        })
        .join("");

    if (configurations.length > 0 && !configSelect.value) {
        configSelect.value = configurations[0].id_configuraciones || configurations[0].id;
    }
} 