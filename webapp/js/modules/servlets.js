// Servlet interaction module
import { setLoadingState, displayError, displaySuccess, clearMessages } from './utils.js';
import { updateComponentList, updateSignalLevelDisplay, renderSimulationDetails, updateComponentSection, updateSignalQualitySummary, updateQualityDisplay } from './ui.js';
import { switchTab } from './tabs.js';

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
                switchTab(optimizationTab.id);
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

export async function fetchComponentsByType(type, idConfiguracion = null) {
    const listElement = document.getElementById(`${type}-list`);
    if (!listElement) return;

    try {
        listElement.innerHTML = '<div class="text-gray-500 dark:text-gray-400">Loading...</div>';

        const url = new URL('components', window.location.href);
        url.searchParams.append('type', type);
        if (idConfiguracion) {
            url.searchParams.append('id_configuraciones', idConfiguracion);
        }

        const response = await fetch(url);
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
                configSelect.value = data[0].id_configuraciones || data[0].id;
            }
        } else {
            throw new Error("Invalid response format: expected array of configurations");
        }
    } catch (error) {
        console.error("Error fetching initial data:", error);
        displayError(`Failed to load configurations: ${error.message}`);
        throw error; // Re-throw the error to be caught by the caller
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

export async function loadSignalTypes(qualityForm) {
    try {
        const response = await fetch('validate-quality?get_signal_types=true');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Get the signal type select element
        const signalTypeSelect = qualityForm.querySelector('select[name="tipo_senal"]');
        
        // Clear existing options except the first one (placeholder)
        while (signalTypeSelect.options.length > 1) {
            signalTypeSelect.remove(1);
        }
        
        // Add signal types from database
        data.forEach(margin => {
            const option = document.createElement('option');
            option.value = margin.tipo_senal;
            option.textContent = margin.tipo_senal;
            option.dataset.minimo = margin.nivel_minimo;
            option.dataset.maximo = margin.nivel_maximo;
            signalTypeSelect.appendChild(option);
        });

        // Add change event listener to update min/max values
        signalTypeSelect.addEventListener('change', (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            if (selectedOption.dataset.minimo && selectedOption.dataset.maximo) {
                const nivelMinimoInput = qualityForm.querySelector('input[name="nivel_minimo"]');
                const nivelMaximoInput = qualityForm.querySelector('input[name="nivel_maximo"]');
                if (nivelMinimoInput && nivelMaximoInput) {
                    nivelMinimoInput.value = selectedOption.dataset.minimo;
                    nivelMaximoInput.value = selectedOption.dataset.maximo;
                    nivelMinimoInput.readOnly = true;
                    nivelMaximoInput.readOnly = true;
                }
            }
        });
    } catch (error) {
        console.error("Error loading signal types:", error);
        displayError(`Failed to load signal types: ${error.message}`);
    }
}

export async function updateComponentDetails(idConfiguracion) {
    try {
        const types = ["cable", "derivador", "distribuidor", "amplificador", "toma"];
        await Promise.all(types.map(type => fetchComponentsByType(type, idConfiguracion)));
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