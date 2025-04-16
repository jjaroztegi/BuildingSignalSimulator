// Main script file
import { initTheme } from "./modules/theme.js";
import { initTabs, switchTab } from "./modules/tabs.js";
import { handleFormSubmit, handleComponentSubmit } from "./modules/forms.js";
import { 
    fetchComponents, 
    fetchInitialData, 
    fetchComponentsByType,
    runSimulation,
    fetchSignalTypes
} from "./modules/servlet.js";
import { displayError } from "./modules/utils.js";

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
    const configurationSummaryElement = document.getElementById("configuration-summary");
    const componentForm = document.getElementById("component-form");
    const configSelect = document.getElementById("id_configuraciones");
    const simulationConfig = document.getElementById("simulation-config");
    const componentListType = document.getElementById("component-list-type");
    const simulationComponentListType = document.getElementById("simulation-component-list-type");
    const signalType = document.getElementById("signal-type");
    const runSimulation = document.getElementById("run-simulation");

    // --- Configuration Select Change Handler ---
    if (configSelect) {
        configSelect.addEventListener("change", () => {
            const idConfiguracion = configSelect.value;
            if (idConfiguracion) {
                // Update simulation config select with the same value
                if (simulationConfig) {
                    simulationConfig.value = idConfiguracion;
                }
                // Only switch tabs if it's not the initial load
                if (!isInitialLoad) {
                    const simulationTab = document.getElementById("simulation-tab");
                    if (simulationTab) {
                        switchTab(simulationTab.id);
                    }
                }
            }
        });
    }

    // --- Component List Type Selector Logic ---
    if (componentListType) {
        const componentLists = document.querySelectorAll(".component-list");

        // Function to show selected component list and hide others
        const showSelectedComponentList = (selectedValue) => {
            componentLists.forEach((list) => {
                if (list.id === `${selectedValue}-list`) {
                    list.classList.remove("hidden");
                } else {
                    list.classList.add("hidden");
                }
            });
        };

        // Initialize with the first option
        showSelectedComponentList(componentListType.value);

        // Add change event listener
        componentListType.addEventListener("change", (event) => {
            showSelectedComponentList(event.target.value);
        });
    }

    // --- Simulation Component List Type Selector Logic ---
    if (simulationComponentListType) {
        const simulationComponentLists = document.querySelectorAll("#simulation-tab-content .component-list");

        // Function to show selected component list and hide others
        const showSelectedSimulationComponentList = (selectedValue) => {
            simulationComponentLists.forEach((list) => {
                if (list.id === `simulation-${selectedValue}-list`) {
                    list.classList.remove("hidden");
                } else {
                    list.classList.add("hidden");
                }
            });
            
            // Fetch components for the selected type
            fetchComponentsByType(selectedValue, null, `simulation-${selectedValue}-list`);
        };

        // Initialize with the first option
        showSelectedSimulationComponentList(simulationComponentListType.value);

        // Add change event listener
        simulationComponentListType.addEventListener("change", (event) => {
            showSelectedSimulationComponentList(event.target.value);
        });
    }

    // --- Form Submission Logic ---
    if (initialConfigForm) {
        initialConfigForm.addEventListener("submit", (event) =>
            handleFormSubmit(event, initialConfigForm, errorMessageElement, successMessageElement, configSelect)
        );
    }

    if (componentForm) {
        componentForm.addEventListener("submit", (event) =>
            handleComponentSubmit(event, componentForm, errorMessageElement, successMessageElement)
        );
    }

    if (runSimulation) {
        runSimulation.addEventListener("click", async () => {
            const configId = simulationConfig.value;
            const signalTypeValue = signalType.value;
            const componentType = simulationComponentListType.value;
            const componentModel = document.getElementById("simulation-component-model").value;

            if (!configId || !signalTypeValue || !componentType || !componentModel) {
                errorMessageElement.textContent = "Por favor seleccione una configuración, tipo de señal, tipo de componente y modelo";
                errorMessageElement.classList.remove("hidden");
                return;
            }

            try {
                // Run the simulation
                await runSimulation(configId, signalTypeValue);
                // Switch to results tab
                switchTab("results-tab");
            } catch (error) {
                displayError(`Error en la simulación: ${error.message}`, errorMessageElement, successMessageElement);
            }
        });
    }

    // --- Initial Data Load ---
    fetchInitialData(configSelect).then(() => {
        if (configSelect && configSelect.value) {
            configSelect.dispatchEvent(new Event("change"));

            // Also populate the simulation config select
            if (simulationConfig) {
                // Copy options from configSelect to simulationConfig
                simulationConfig.innerHTML = configSelect.innerHTML;
                simulationConfig.value = configSelect.value;
            }

            // Set the flag to false after initial load
            isInitialLoad = false;
        }
    });

    // Load signal types
    if (signalType) {
        fetchSignalTypes(signalType);
    }

    // Load components
    fetchComponents();
    
    // Add event listener for tab switching to load components when simulation tab is selected
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.id === 'simulation-tab') {
                // When simulation tab is selected, fetch components for the current selected type
                const selectedType = simulationComponentListType.value;
                fetchComponentsByType(selectedType);
            }
        });
    });
});
