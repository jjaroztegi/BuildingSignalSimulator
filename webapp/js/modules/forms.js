// Form handling module
import { setLoadingState, displayError, displaySuccess, clearMessages } from "./utils.js";
import { switchTab } from "./tabs.js";
import { 
    submitConfiguration, 
    submitComponent, 
    fetchConfigurations, 
    fetchComponentsByType 
} from "./servlet.js";
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

    // Basic client-side validation
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
            
            // Fetch updated configurations
            const configurations = await fetchConfigurations();
            
            // Update both config selects
            updateConfigSelect(configurations, configSelect);
            const simulationConfig = document.getElementById("simulation-config");
            if (simulationConfig) {
                updateConfigSelect(configurations, simulationConfig);
            }

            // Find the newly created configuration in the select options
            const newConfigOption = Array.from(configSelect.options).find(
                (option) => option.textContent === configName
            );

            if (newConfigOption) {
                configSelect.value = newConfigOption.value;
                // Update simulation config value as well
                if (simulationConfig) {
                    simulationConfig.value = newConfigOption.value;
                }
                // Trigger the change event to update the UI
                configSelect.dispatchEvent(new Event("change"));
            }

            // Switch to the simulation tab
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
            // Refresh only the relevant component list
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