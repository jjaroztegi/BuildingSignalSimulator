// Form handling module
import { setLoadingState, displayError, displaySuccess, clearMessages } from "./utils.js";
import { switchTab } from "./tabs.js";
import { submitConfiguration, fetchConfigurations } from "./servlet.js";
import { updateConfigSelect } from "./ui.js";

// --- Component Field Definitions ---
const componentFields = {
    coaxial: [
        {
            name: "atenuacion_470mhz",
            label: "Atenuación 470MHz (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 12.30",
        },
        {
            name: "atenuacion_694mhz",
            label: "Atenuación 694MHz (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 15.57",
        },
    ],
    derivador: [
        {
            name: "atenuacion_derivacion",
            label: "Atenuación de Derivación (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 14.0",
        },
        {
            name: "atenuacion_paso",
            label: "Atenuación de Paso (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 4.5",
        },
        {
            name: "directividad",
            label: "Directividad (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 13.0",
        },
        {
            name: "desacoplo",
            label: "Desacoplo (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 16.0",
        },
        {
            name: "perdidas_retorno",
            label: "Pérdidas de Retorno (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 12.0",
        },
    ],
    distribuidor: [
        {
            name: "numero_salidas",
            label: "Número de Salidas",
            type: "number",
            step: "1",
            placeholder: "ej., 2",
        },
        {
            name: "atenuacion_distribucion",
            label: "Atenuación de Distribución (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 4.0",
        },
        {
            name: "desacoplo",
            label: "Desacoplo (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 19.0",
        },
        {
            name: "perdidas_retorno",
            label: "Pérdidas de Retorno (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 16.0",
        },
    ],
    toma: [
        {
            name: "atenuacion",
            label: "Atenuación (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 1.0",
        },
        {
            name: "desacoplo",
            label: "Desacoplo (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 14.0",
        },
    ],
};

// --- Form Validation ---
export function validateComponentForm(formData) {
    const type = formData.get("type");
    if (!type || !componentFields[type]) return false;

    // Check if all required fields are present and valid
    return componentFields[type].every((field) => {
        const value = formData.get(field.name);
        return value !== null && value !== "" && !isNaN(value);
    });
}

// --- Form Update ---
export function updateComponentForm(type) {
    const dynamicFieldsContainer = document.getElementById("dynamic-fields");
    if (!dynamicFieldsContainer) return;

    // Clear existing fields
    dynamicFieldsContainer.innerHTML = "";

    // If no type selected or invalid type, return
    if (!type || !componentFields[type]) return;

    // Add new fields
    componentFields[type].forEach((field) => {
        const fieldContainer = document.createElement("div");
        fieldContainer.className = "mb-4";

        const label = document.createElement("label");
        label.className = "block text-sm font-medium text-gray-700 dark:text-gray-300";
        label.htmlFor = field.name;
        label.textContent = field.label;

        const input = document.createElement("input");
        input.className =
            "mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-2xs focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400";
        input.type = field.type;
        input.id = field.name;
        input.name = field.name;
        input.step = field.step;
        input.required = true;
        input.placeholder = field.placeholder;

        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);
        dynamicFieldsContainer.appendChild(fieldContainer);
    });
}

// --- Form Data Preparation ---
export function prepareSimulationData(configId, signalType, componentsByFloor) {
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
            throw new Error(`Floor ${floorNum} exceeds the configuration's number of floors (${configData.num_pisos})`);
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
    configSelect,
) {
    event.preventDefault();
    clearMessages(errorMessageElement, successMessageElement);

    const formData = new FormData(initialConfigForm);
    const configName = formData.get("nombre");
    const nivelCabecera = formData.get("nivel_cabecera");
    const numPisos = formData.get("num_pisos");

    if (
        !configName ||
        !nivelCabecera ||
        !numPisos ||
        isNaN(nivelCabecera) ||
        isNaN(numPisos) ||
        parseInt(numPisos) <= 0 ||
        parseFloat(nivelCabecera) < 70 ||
        parseFloat(nivelCabecera) > 120
    ) {
        displayError(
            "Por favor complete todos los campos con valores válidos (Pisos > 0, Nivel de Cabecera entre 70 y 120 dBμV).",
            errorMessageElement,
            successMessageElement,
        );
        return;
    }

    const submitButton = initialConfigForm.querySelector('button[type="submit"]');
    setLoadingState(submitButton, true);

    try {
        const data = await submitConfiguration(formData);

        if (data.success) {
            displaySuccess(data.success, successMessageElement, errorMessageElement);
            initialConfigForm.reset();

            const configurations = await fetchConfigurations();

            updateConfigSelect(configurations, configSelect);
            const simulationConfig = document.getElementById("simulation-config");
            if (simulationConfig) {
                updateConfigSelect(configurations, simulationConfig);
            }

            const newConfigOption = Array.from(configSelect.options).find(
                (option) => option.textContent === configName,
            );

            if (newConfigOption) {
                configSelect.value = newConfigOption.value;
                if (simulationConfig) {
                    simulationConfig.value = newConfigOption.value;
                }
                configSelect.dispatchEvent(new Event("change"));
            }

            const simulationTab = document.getElementById("simulation-tab");
            if (simulationTab) {
                switchTab(simulationTab.id);
            }
        } else {
            const errorMsg = data?.error || `Error en la solicitud`;
            displayError(`Error de Configuración: ${errorMsg}`, errorMessageElement, successMessageElement);
        }
    } catch (error) {
        console.error("Error submitting configuration:", error);
        displayError(
            `Ocurrió un error de red o inesperado: ${error.message}`,
            errorMessageElement,
            successMessageElement,
        );
    } finally {
        setLoadingState(submitButton, false);
    }
}
