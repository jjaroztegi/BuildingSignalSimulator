// Form handling module
import { setLoadingState, displayError, displaySuccess, clearMessages } from "./utils.js";
import { switchTab } from "./tabs.js";
import { submitConfiguration, submitComponent, fetchConfigurations, fetchComponentsByType } from "./servlet.js";
import { updateConfigSelect } from "./ui.js";

export async function handleFormSubmit(
    event,
    initialConfigForm,
    errorMessageElement,
    successMessageElement,
    configSelect
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
        parseInt(numPisos) <= 0
    ) {
        displayError(
            "Por favor complete todos los campos con valores válidos (Pisos > 0).",
            errorMessageElement,
            successMessageElement
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
                (option) => option.textContent === configName
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
            successMessageElement
        );
    } finally {
        setLoadingState(submitButton, false);
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
        displayError(
            "Por favor complete todos los campos con valores válidos.",
            errorMessageElement,
            successMessageElement
        );
        return;
    }

    const submitButton = componentForm.querySelector('button[type="submit"]');
    setLoadingState(submitButton, true);

    try {
        const data = await submitComponent(formData);

        if (data.success) {
            displaySuccess(data.success, successMessageElement, errorMessageElement);
            componentForm.reset();
            await fetchComponentsByType(type);
        } else {
            const errorMsg = data?.error || `Error en la solicitud`;
            displayError(`Error de Componente: ${errorMsg}`, errorMessageElement, successMessageElement);
        }
    } catch (error) {
        console.error("Error adding component:", error);
        displayError(
            `A network or unexpected error occurred: ${error.message}`,
            errorMessageElement,
            successMessageElement
        );
    } finally {
        setLoadingState(submitButton, false);
    }
}

// Component type specific fields configuration
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
        { name: "directividad", label: "Directividad (dB)", type: "number", step: "0.1", placeholder: "ej., 13.0" },
        { name: "desacoplo", label: "Desacoplo (dB)", type: "number", step: "0.1", placeholder: "ej., 16.0" },
        {
            name: "perdidas_retorno",
            label: "Pérdidas de Retorno (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 12.0",
        },
    ],
    distribuidor: [
        { name: "numero_salidas", label: "Número de Salidas", type: "number", step: "1", placeholder: "ej., 2" },
        {
            name: "atenuacion_distribucion",
            label: "Atenuación de Distribución (dB)",
            type: "number",
            step: "0.1",
            placeholder: "ej., 4.0",
        },
        { name: "desacoplo", label: "Desacoplo (dB)", type: "number", step: "0.1", placeholder: "ej., 19.0" },
        {
            name: "perdidas_retorno",
            label: "Pérdidas de Retorno (dB)",
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

// Function to update form fields based on component type
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
            "mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400";
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

// Function to validate component form
export function validateComponentForm(formData) {
    const type = formData.get("type");
    if (!type || !componentFields[type]) return false;

    // Check if all required fields are present and valid
    return componentFields[type].every((field) => {
        const value = formData.get(field.name);
        return value !== null && value !== "" && !isNaN(value);
    });
}
