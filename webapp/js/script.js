// Main script file
import { initTheme } from "./modules/theme.js";
import { initTabs, switchTab } from "./modules/tabs.js";
import { handleFormSubmit, handleComponentSubmit } from "./modules/forms.js";
import {
    fetchComponents,
    fetchInitialData,
    fetchComponentsByType,
    runSimulation,
    fetchSignalTypes,
    fetchConfigurations,
    submitConfiguration,
    submitComponent,
} from "./modules/servlet.js";
import {
    displayError,
    clearMessages,
    simulationComponentManager,
    updateSelectedComponentsDisplay,
    updateFloorSelector,
    displaySuccess,
} from "./modules/utils.js";
import { updateComponentList, updateConfigSelect, updateSimulationResults } from "./modules/ui.js";
import { updateComponentForm, validateComponentForm } from "./modules/forms.js";

document.addEventListener("DOMContentLoaded", async () => {
    initTheme();

    initTabs();

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
    const simulationFloor = document.getElementById("simulation-floor");

    // --- Configuration Select Change Handler ---
    if (configSelect) {
        configSelect.addEventListener("change", () => {
            const idConfiguracion = configSelect.value;
            if (idConfiguracion) {
                // Update simulation config select with the same value
                if (simulationConfig) {
                    simulationConfig.value = idConfiguracion;

                    // Get the selected configuration data
                    const selectedOption = configSelect.options[configSelect.selectedIndex];
                    if (selectedOption && selectedOption.dataset.config) {
                        const configData = JSON.parse(selectedOption.dataset.config);
                        // Update floor selector based on num_pisos
                        if (configData.num_pisos) {
                            updateFloorSelector(configData.num_pisos);
                        }
                    }
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

    // Add change handler for simulation config select
    if (simulationConfig) {
        simulationConfig.addEventListener("change", () => {
            const selectedOption = simulationConfig.options[simulationConfig.selectedIndex];
            if (selectedOption && selectedOption.dataset.config) {
                const configData = JSON.parse(selectedOption.dataset.config);
                if (configData.num_pisos) {
                    updateFloorSelector(configData.num_pisos);
                    // Reset current floor selection
                    if (simulationFloor) {
                        simulationFloor.value = "";
                        simulationComponentManager.setCurrentFloor(null);
                    }
                    // Clear existing components as they might be invalid for new floor count
                    simulationComponentManager.clearAllFloors();
                    updateSelectedComponentsDisplay();
                }
            }
        });
    }

    // --- Floor Selection Handler ---
    if (simulationFloor) {
        simulationFloor.addEventListener("change", () => {
            const selectedFloor = simulationFloor.value;
            if (selectedFloor) {
                simulationComponentManager.setCurrentFloor(selectedFloor);
            }
        });
    }

    // --- Component List Type Selector Logic ---
    if (componentListType) {
        const componentLists = document.querySelectorAll(".component-list");

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

    if (initialConfigForm) {
        initialConfigForm.addEventListener("submit", (event) =>
            handleFormSubmit(event, initialConfigForm, errorMessageElement, successMessageElement, configSelect)
        );
    }

    if (componentForm) {
        componentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearMessages(errorMessageElement, successMessageElement);

            const formData = new FormData(e.target);

            // Validate form including dynamic fields
            if (!validateComponentForm(formData)) {
                displayError("Por favor, complete todos los campos correctamente", errorMessageElement);
                return;
            }

            try {
                const result = await submitComponent(formData);
                if (result.success) {
                    displaySuccess(result.success, successMessageElement);
                    e.target.reset();
                    // Clear dynamic fields
                    document.getElementById("dynamic-fields").innerHTML = "";
                    // Refresh component lists
                    await fetchComponents();
                } else {
                    displayError(result.error || "Error al añadir el componente", errorMessageElement);
                }
            } catch (error) {
                displayError("Error al añadir el componente: " + error.message, errorMessageElement);
            }
        });
    }

    if (runSimulationButton) {
        runSimulationButton.addEventListener("click", async () => {
            try {
                const selectedConfig = simulationConfig.value;
                const selectedSignalType = signalType.value;

                if (!selectedConfig || !selectedSignalType) {
                    displayError("Por favor, seleccione una configuración y tipo de señal", errorMessageElement);
                    return;
                }

                // Clear any previous messages
                clearMessages(errorMessageElement, successMessageElement);

                const componentsByFloor = simulationComponentManager.getAllComponents();
                if (Object.keys(componentsByFloor).length === 0) {
                    displayError("Por favor, añada componentes a la simulación", errorMessageElement);
                    return;
                }

                // Get the selected configuration data to validate floor numbers
                const selectedOption = simulationConfig.options[simulationConfig.selectedIndex];
                const configData = JSON.parse(selectedOption.dataset.config);

                // Validate that components are only added to valid floors
                const invalidFloors = Object.keys(componentsByFloor)
                    .map(Number)
                    .filter((floor) => floor > configData.num_pisos);

                if (invalidFloors.length > 0) {
                    displayError(
                        `Hay componentes en pisos que exceden el número de pisos de la configuración (${
                            configData.num_pisos
                        }). Pisos inválidos: ${invalidFloors.join(", ")}`,
                        errorMessageElement
                    );
                    return;
                }

                displaySuccess("Simulación completada", successMessageElement, errorMessageElement);

                // Run simulation
                const results = await runSimulation(selectedConfig, selectedSignalType, componentsByFloor);

                updateSimulationResults(results);
                switchTab("results-tab");
            } catch (error) {
                console.error("Error running simulation:", error);
                displayError(`Error en la simulación: ${error.message}`, errorMessageElement);
            }
        });
    }

    // --- Initial Data Load ---
    fetchInitialData(configSelect).then(() => {
        if (configSelect && configSelect.value) {
            // Get the selected configuration data
            const selectedOption = configSelect.options[configSelect.selectedIndex];
            if (selectedOption && selectedOption.dataset.config) {
                const configData = JSON.parse(selectedOption.dataset.config);
                // Update floor selector based on num_pisos
                if (configData.num_pisos) {
                    updateFloorSelector(configData.num_pisos);
                }
            }

            configSelect.dispatchEvent(new Event("change"));

            // Also populate the simulation config select
            if (simulationConfig) {
                // Copy options from configSelect to simulationConfig
                simulationConfig.innerHTML = configSelect.innerHTML;
                simulationConfig.value = configSelect.value;
            }

            isInitialLoad = false;
        }
    });

    if (signalType) {
        fetchSignalTypes(signalType);
    }

    fetchComponents();

    // Add event listener for tab switching to load components when simulation tab is selected
    document.querySelectorAll(".tab-button").forEach((tab) => {
        tab.addEventListener("click", () => {
            if (tab.id === "simulation-tab") {
                const selectedType = simulationComponentListType.value;
                fetchComponentsByType(selectedType);
            }
        });
    });

    // Handle component selection in simulation tab
    document.addEventListener("addComponent", (event) => {
        const { type, model } = event.detail;
        const currentFloor = simulationComponentManager.getCurrentFloor();

        if (!currentFloor) {
            displayError("Por favor, seleccione un piso primero");
            return;
        }

        if (simulationComponentManager.addComponent(type, model, currentFloor)) {
            updateSelectedComponentsDisplay();
        }
    });

    document.addEventListener("removeComponent", (event) => {
        const { type, model, floor } = event.detail;
        if (simulationComponentManager.removeComponent(type, model, floor)) {
            updateSelectedComponentsDisplay();
        }
    });

    // Add event listener for component type selection
    document.getElementById("component-type")?.addEventListener("change", (e) => {
        const selectedType = e.target.value;
        updateComponentForm(selectedType);
    });
});
