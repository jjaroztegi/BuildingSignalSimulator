// Form handling module
import { setLoadingState, displayError, displaySuccess, clearMessages } from "./utils.js";
import { switchTab } from "./tabs.js";
import { submitConfiguration, fetchConfigurations } from "./servlet.js";
import { updateConfigSelect } from "./ui.js";

// Component field configurations
export const componentFields = {
    coaxial: [
        {
            name: "atenuacion_470mhz",
            label: "Aten. 470MHz (dB/100m)",
            type: "number",
            step: "0.01",
            placeholder: "ej., 12.30",
        },
        {
            name: "atenuacion_694mhz",
            label: "Aten. 694MHz (dB/100m)",
            type: "number",
            step: "0.01",
            placeholder: "ej., 15.57",
        },
    ],
    derivador: [
        {
            name: "atenuacion_derivacion",
            label: "Aten. Derivación (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 14.0",
        },
        { name: "atenuacion_paso", label: "Aten. Paso (dB)", type: "number", step: "0.1", placeholder: "ej., 4.5" },
        { name: "directividad", label: "Directividad (dB)", type: "number", step: "0.1", placeholder: "ej., 13.0" },
        { name: "desacoplo", label: "Desacoplo (dB)", type: "number", step: "0.1", placeholder: "ej., 16.0" },
        {
            name: "perdidas_retorno",
            label: "Pérdidas Retorno (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 12.0",
        },
    ],
    distribuidor: [
        { name: "numero_salidas", label: "Nº Salidas", type: "number", step: "1", min: "2", placeholder: "ej., 2" },
        {
            name: "atenuacion_distribucion",
            label: "Aten. Distribución (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 4.0",
        },
        { name: "desacoplo", label: "Desacoplo (dB)", type: "number", step: "0.1", placeholder: "ej., 19.0" },
        {
            name: "perdidas_retorno",
            label: "Pérdidas Retorno (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 16.0",
        },
    ],
    toma: [
        { name: "atenuacion", label: "Atenuación (dB)", type: "number", step: "0.1", placeholder: "ej., 1.0" },
        { name: "desacoplo", label: "Desacoplo (dB)", type: "number", step: "0.1", placeholder: "ej., 14.0" },
    ],
};

// --- Form Validation ---
export function validateComponentForm(formData) {
    const type = formData.get("type");
    if (!type || !componentFields[type]) return false;

    // Check if all required fields are present and valid
    return componentFields[type].every((field) => {
        const value = formData.get(field.name);
        // Ensure value exists and if it's a number type, it's a valid number
        return value !== null && value !== "" && (field.type !== "number" || !isNaN(value));
    });
}

// --- Form Update ---
export function updateComponentForm(type) {
    const dynamicFieldsContainer = document.getElementById("dynamic-fields");
    if (!dynamicFieldsContainer) return;

    // Clear existing fields
    dynamicFieldsContainer.innerHTML = "";

    // If no type selected or invalid type, show placeholder
    if (!type || !componentFields[type]) {
        dynamicFieldsContainer.innerHTML =
            '<p class="text-sm text-zinc-400 dark:text-zinc-500 italic">Seleccione un tipo de componente para ver sus propiedades.</p>';
        return;
    }

    // Add new fields
    componentFields[type].forEach((field) => {
        const fieldWrapper = document.createElement("div");
        // No extra margin needed here if parent container uses space-y

        const label = document.createElement("label");
        label.htmlFor = field.name;
        label.textContent = field.label;
        // Apply consistent label styling
        label.className = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

        const input = document.createElement("input");
        input.type = field.type;
        input.id = field.name;
        input.name = field.name;
        input.placeholder = field.placeholder;
        input.required = true;
        if (field.type === "number") {
            input.step = field.step || "any"; // Default step for number
            if (field.min) input.min = field.min;
            if (field.max) input.max = field.max;
        }
        // Apply consistent input styling
        input.className =
            "block w-full rounded-lg border-zinc-300 bg-zinc-50 shadow-sm transition focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400";

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(input);
        dynamicFieldsContainer.appendChild(fieldWrapper);
    });
}

// --- Form Data Preparation ---
export function prepareSimulationData(configId, signalType, componentsByFloor) {
    const configSelect = document.getElementById("simulation-config");
    const frequencyInput = document.getElementById("signal-frequency");

    if (!configSelect || !frequencyInput) {
        throw new Error("Required elements not found (config select or frequency input)");
    }

    const frequency = parseInt(frequencyInput.value);
    if (isNaN(frequency) || frequency < 470 || frequency > 694) {
        throw new Error("Frecuencia debe ser un valor entero entre 470 y 694 MHz");
    }

    const selectedOption = Array.from(configSelect.options).find((option) => option.value === configId);

    if (!selectedOption || !selectedOption.dataset.config) {
        throw new Error("Selected configuration data not found in dropdown");
    }

    let configData;
    try {
        configData = JSON.parse(selectedOption.dataset.config);
    } catch (e) {
        throw new Error("Failed to parse configuration data from dropdown");
    }

    const components = [];
    Object.entries(componentsByFloor).forEach(([floor, floorComponents]) => {
        const floorNum = parseInt(floor);
        if (isNaN(floorNum) || floorNum <= 0) {
            console.warn(`Skipping invalid floor number: ${floor}`);
            return;
        }
        if (floorNum > configData.num_pisos) {
            // This shouldn't happen if UI prevents it, but check anyway
            throw new Error(`Floor ${floorNum} exceeds the configuration's number of floors (${configData.num_pisos})`);
        }

        // Iterate through component types on the floor (derivador, distribuidores, tomasLeft, tomasRight)
        Object.entries(floorComponents).forEach(([compKey, compValue]) => {
            if (compKey === "derivador" && compValue) {
                components.push({ type: "derivador", model: compValue, floor: floorNum });
            } else if (compKey === "distribuidores" && Array.isArray(compValue)) {
                compValue.forEach((model) => {
                    if (model) components.push({ type: "distribuidor", model: model, floor: floorNum });
                });
            } else if (compKey === "tomasLeft" && Array.isArray(compValue)) {
                compValue.forEach((model) => {
                    if (model) components.push({ type: "toma", model: model, floor: floorNum });
                });
            } else if (compKey === "tomasRight" && Array.isArray(compValue)) {
                compValue.forEach((model) => {
                    if (model) components.push({ type: "toma", model: model, floor: floorNum });
                });
            }
        });
    });

    return {
        num_pisos: configData.num_pisos,
        nivel_cabecera: configData.nivel_cabecera,
        tipo_senal: signalType,
        frequency: frequency,
        components: components,
    };
}

// --- Form Submission Handlers ---
export async function handleFormSubmit(
    event,
    initialConfigForm,
    errorMessageElement,
    successMessageElement,
    configSelect, // Reference to the main config select in the Config Tab
) {
    event.preventDefault();
    clearMessages(errorMessageElement, successMessageElement);

    const formData = new FormData(initialConfigForm);
    const configName = formData.get("nombre")?.trim();
    const nivelCabeceraStr = formData.get("nivel_cabecera");
    const numPisosStr = formData.get("num_pisos");

    // Basic client-side validation (align with input attributes)
    const nivelCabecera = parseFloat(nivelCabeceraStr);
    const numPisos = parseInt(numPisosStr);

    let errors = [];
    if (!configName) {
        errors.push("El nombre de la configuración es requerido.");
    }
    if (isNaN(nivelCabecera) || nivelCabecera < 70 || nivelCabecera > 120) {
        errors.push("Nivel de Cabecera debe ser un número entre 70 y 120.");
    }
    if (isNaN(numPisos) || numPisos < 1 || numPisos > 50) {
        errors.push("Número de Pisos debe ser un número entero entre 1 y 50.");
    }

    if (errors.length > 0) {
        displayError(errors.join(" "), errorMessageElement, successMessageElement);
        return;
    }

    const submitButton = initialConfigForm.querySelector('button[type="submit"]');
    // Store original text if not already stored
    if (!submitButton.dataset.originalText) {
        submitButton.dataset.originalText = submitButton.innerHTML;
    }
    setLoadingState(submitButton, true);

    try {
        // Assuming submitConfiguration function correctly sends data to backend
        const result = await submitConfiguration(formData);

        if (result.success && result.id) {
            // Check for success and the returned ID
            displaySuccess(
                result.success || "Configuración creada con éxito.",
                successMessageElement,
                errorMessageElement,
            );
            initialConfigForm.reset();

            // Refetch configurations to include the new one
            const configurations = await fetchConfigurations();

            // Update both configuration dropdowns
            updateConfigSelect(configurations, configSelect); // Update Config tab select
            const simulationConfigSelect = document.getElementById("simulation-config");
            if (simulationConfigSelect) {
                updateConfigSelect(configurations, simulationConfigSelect); // Update Simulation tab select
            }

            // Select the newly created configuration in both dropdowns
            const newConfigId = result.id; // Use the ID returned from the backend
            if (configSelect.querySelector(`option[value="${newConfigId}"]`)) {
                configSelect.value = newConfigId;
                // Manually trigger change event to update details view
                configSelect.dispatchEvent(new Event("change"));
            }
            if (simulationConfigSelect && simulationConfigSelect.querySelector(`option[value="${newConfigId}"]`)) {
                simulationConfigSelect.value = newConfigId;
                // Manually trigger change event to update simulation panel (floor selector etc)
                simulationConfigSelect.dispatchEvent(new Event("change"));
            }

            // Optionally switch to the simulation tab or configuration details view
            // switchTab("simulation-tab"); // Example: Switch to simulation tab
        } else {
            const errorMsg = result?.error || "Error desconocido al crear la configuración.";
            displayError(`Error: ${errorMsg}`, errorMessageElement, successMessageElement);
        }
    } catch (error) {
        console.error("Error submitting configuration:", error);
        displayError(`Error de red o del servidor: ${error.message}`, errorMessageElement, successMessageElement);
    } finally {
        setLoadingState(submitButton, false); // Restore button state
    }
}
