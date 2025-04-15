// Main script file
import { initTheme } from './modules/theme.js';
import { initTabs, switchTab } from './modules/tabs.js';
import { handleFormSubmit, handleOptimization, handleComponentSubmit, fetchComponents, fetchInitialData, fetchQualityMargins, loadSignalTypes } from './modules/servlets.js';
import { renderSimulationDetails } from './modules/ui.js';

document.addEventListener("DOMContentLoaded", () => {
    // Initialize theme
    initTheme();

    // Initialize tabs
    initTabs();

    // Flag to track initial load
    let isInitialLoad = true;

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
    const componentListType = document.getElementById("component-list-type");

    // --- Component List Type Selector Logic ---
    if (componentListType) {
        const componentLists = document.querySelectorAll('.component-list');
        
        // Function to show selected component list and hide others
        const showSelectedComponentList = (selectedValue) => {
            componentLists.forEach(list => {
                if (list.id === `${selectedValue}-list`) {
                    list.classList.remove('hidden');
                } else {
                    list.classList.add('hidden');
                }
            });
        };

        // Initialize with the first option
        showSelectedComponentList(componentListType.value);

        // Add change event listener
        componentListType.addEventListener('change', (event) => {
            showSelectedComponentList(event.target.value);
        });
    }

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
        // Load signal types when the page loads
        loadSignalTypes(qualityForm);
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
                // Only switch tabs if it's not the initial load
                if (!isInitialLoad) {
                    const optimizationTab = document.getElementById("optimization-tab");
                    if (optimizationTab) {
                        switchTab(optimizationTab.id);
                    }
                }
            }
        });
    }

    // --- Initial Data Load ---
    fetchInitialData(configSelect).then(() => {
        // After loading initial data, trigger change event to render simulation details
        if (configSelect && configSelect.value) {
            configSelect.dispatchEvent(new Event('change'));
            // Set the flag to false after initial load
            isInitialLoad = false;
        }
    });
    fetchComponents();
});
