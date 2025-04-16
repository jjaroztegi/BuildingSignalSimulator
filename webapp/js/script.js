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
import { 
    displayError, 
    simulationComponentManager, 
    updateSelectedComponentsDisplay,
    displaySuccess
} from "./modules/utils.js";
import { updateComponentList, updateConfigSelect } from "./modules/ui.js";

document.addEventListener("DOMContentLoaded", async () => {
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
    const runSimulationButton = document.getElementById("run-simulation");

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
        simulationComponentListType.addEventListener("change", async () => {
            const type = simulationComponentListType.value;
            // Hide all component lists
            document.querySelectorAll(".component-list").forEach((list) => {
                list.classList.add("hidden");
            });
            // Show selected type list
            const selectedList = document.getElementById(`simulation-${type}-list`);
            if (selectedList) {
                selectedList.classList.remove("hidden");
            }
            // Fetch and update components for the selected type
            try {
                const components = await fetchComponentsByType(type);
                updateComponentList(type, components, `simulation-${type}-list`);
            } catch (error) {
                console.error(`Error fetching ${type} components:`, error);
            }
        });

        // Trigger initial load of components
        simulationComponentListType.dispatchEvent(new Event("change"));
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

    if (runSimulationButton) {
        runSimulationButton.addEventListener("click", () => {
            const selectedComponents = simulationComponentManager.getAllSelectedComponents();
            displaySuccess("Simulación iniciada", successMessageElement, errorMessageElement);
            // Switch to results tab
            const resultsTab = document.getElementById("results-tab");
            if (resultsTab) {
                switchTab(resultsTab.id);
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

    // Handle component selection in simulation tab
    document.addEventListener('addComponent', (event) => {
        const { type, model } = event.detail;
        if (simulationComponentManager.addComponent(type, model)) {
            updateSelectedComponentsDisplay();
        }
    });

    document.addEventListener('removeComponent', (event) => {
        const { type, model } = event.detail;
        if (simulationComponentManager.removeComponent(type, model)) {
            updateSelectedComponentsDisplay();
        }
    });
});
