// Main script file
import { initTheme } from './modules/theme.js';
import { initTabs } from './modules/tabs.js';
import { handleFormSubmit, handleOptimization, handleComponentSubmit, handleQualitySubmit, fetchComponents, fetchInitialData, fetchQualityMargins } from './modules/servlets.js';
import { renderSimulationDetails } from './modules/ui.js';

document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme
    initTheme();

    // Initialize tabs
    initTabs();

    // --- DOM Element References ---
    const initialConfigForm = document.getElementById("initial-config-form");
    const errorMessageElement = document.getElementById("error-message");
    const successMessageElement = document.getElementById("success-message");
    const simulationDetailsElement = document.getElementById("simulation-details");
    const configurationSummaryElement = document.getElementById("configuration-summary");
    const optimizeButton = document.getElementById("optimize-button");
    const componentForm = document.getElementById("component-form");
    const qualityForm = document.getElementById("quality-form");
    const configSelect = document.getElementById("id_configuraciones");

    // --- Form Submission Logic ---
    if (initialConfigForm) {
        initialConfigForm.addEventListener("submit", (event) => 
            handleFormSubmit(event, initialConfigForm, errorMessageElement, successMessageElement, configSelect)
        );
    }

    if (optimizeButton) {
        optimizeButton.addEventListener("click", () => 
            handleOptimization(configSelect, optimizeButton, simulationDetailsElement, errorMessageElement, successMessageElement)
        );
    }

    if (componentForm) {
        componentForm.addEventListener("submit", (event) => 
            handleComponentSubmit(event, componentForm, errorMessageElement, successMessageElement)
        );
    }

    if (qualityForm) {
        qualityForm.addEventListener("submit", (event) => 
            handleQualitySubmit(event, qualityForm, errorMessageElement, successMessageElement)
        );
    }

    if (configSelect) {
        configSelect.addEventListener("change", () => {
            const idConfiguracion = configSelect.value;
            if (idConfiguracion) {
                const selectedConfig = Array.from(configSelect.options).find((option) => option.value === idConfiguracion);
                if (selectedConfig) {
                    renderSimulationDetails(JSON.parse(selectedConfig.dataset.config), simulationDetailsElement);
                }
                const tipoSenal = qualityForm?.querySelector('select[name="tipo_senal"]')?.value;
                if (tipoSenal) {
                    fetchQualityMargins(configSelect, qualityForm);
                }
            }
        });
    }

    // --- Initial Data Load ---
    fetchInitialData(configSelect);
    fetchComponents();
});
