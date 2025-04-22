// Main script file
import { initTheme } from "./modules/theme.js";
import { initTabs, switchTab } from "./modules/tabs.js";
import {
    handleFormSubmit,
    updateComponentForm,
    validateComponentForm,
    prepareSimulationData,
} from "./modules/forms.js";
import {
    fetchComponents,
    fetchInitialData,
    fetchComponentsByType,
    runSimulation,
    fetchSignalTypes,
    submitComponent,
} from "./modules/servlet.js";
import { displayError, clearMessages, displaySuccess } from "./modules/utils.js";
import {
    updateSimpleComponentList,
    updateDetailedComponentList,
    updateSimulationResults,
    simulationComponentManager,
    updateSelectedComponentsDisplay,
    updateFloorSelector,
    updateSignalTypeSelect,
} from "./modules/ui.js";

document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    initTabs();

    let isInitialLoad = true;

    // --- DOM Element References ---
    const errorMessageElement = document.getElementById("error-message"); // Error Message Display
    const successMessageElement = document.getElementById("success-message"); // Success Message Display

    const initialConfigForm = document.getElementById("initial-config-form"); // New Configuration Form
    const configSelect = document.getElementById("id_configuraciones"); // Existing Configurations Select
    const componentForm = document.getElementById("component-form"); // Add New Component Form
    const componentListType = document.getElementById("component-list-type"); // Available Components Type Selector
    const simulationConfig = document.getElementById("simulation-config"); // Simulation Config Select
    const simulationComponentListType = document.getElementById("simulation-component-list-type"); // Simulation Component Type Selector
    const signalType = document.getElementById("signal-type"); // Simulation Signal Type Select

    const simulationFloor = document.getElementById("simulation-floor"); // Simulation Floor Select
    const runSimulationButton = document.getElementById("run-simulation"); // Run Simulation Button

    // --- Initial Configuration Form Submit Handler ---
    if (initialConfigForm) {
        initialConfigForm.addEventListener("submit", (event) =>
            handleFormSubmit(event, initialConfigForm, errorMessageElement, successMessageElement, configSelect),
        );
    }

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

    // --- Component Form Submit Handler ---
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
                    componentListType.dispatchEvent(new Event("change"));
                } else {
                    displayError(result.error || "Error al añadir el componente", errorMessageElement);
                }
            } catch (error) {
                displayError("Error al añadir el componente: " + error.message, errorMessageElement);
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
        componentListType.addEventListener("change", async (event) => {
            const type = event.target.value;
            showSelectedComponentList(type);
            // Fetch and update components for the selected type with detailed view
            try {
                const components = await fetchComponentsByType(type);
                updateDetailedComponentList(type, components, `${type}-list`);
            } catch (error) {
                console.error(`Error fetching ${type} components:`, error);
                displayError(`Error al cargar ${type}: ${error.message}`, errorMessageElement);
            }
        });

        // Trigger initial load
        componentListType.dispatchEvent(new Event("change"));
    }

    // --- Simulation Config Select Change Handler ---
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
            // Fetch and update components for the selected type with simple view
            try {
                const components = await fetchComponentsByType(type);
                updateSimpleComponentList(type, components, `simulation-${type}-list`);
            } catch (error) {
                console.error(`Error fetching ${type} components:`, error);
                displayError(`Error al cargar ${type}: ${error.message}`, errorMessageElement);
            }
        });

        // Trigger initial load of components
        simulationComponentListType.dispatchEvent(new Event("change"));
    }

    // --- Signal Types Load Handler ---
    if (signalType) {
        try {
            const signalTypes = await fetchSignalTypes();
            updateSignalTypeSelect(signalTypes, signalType);
        } catch (error) {
            console.error("Error loading signal types:", error);
            displayError("Error al cargar tipos de señal", errorMessageElement);
        }
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

    // --- Run Simulation Button Click Handler ---
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

                // Prepare simulation data
                const simulationData = prepareSimulationData(selectedConfig, selectedSignalType, componentsByFloor);

                displaySuccess("Simulación completada", successMessageElement);

                // Run simulation
                const results = await runSimulation(simulationData);

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

    // --- Initial Component Load ---
    fetchComponents().catch((error) => {
        console.error("Error loading components:", error);
        displayError("Error al cargar componentes", errorMessageElement);
    });

    // --- Component Type Selection Event Listener ---
    document.getElementById("component-type")?.addEventListener("change", (e) => {
        const selectedType = e.target.value;
        updateComponentForm(selectedType);
    });

    // --- Tab Switching Event Listener ---
    document.querySelectorAll(".tab-button").forEach((tab) => {
        tab.addEventListener("click", () => {
            if (tab.id === "simulation-tab") {
                const selectedType = simulationComponentListType.value;
                fetchComponentsByType(selectedType).then((components) => {
                    updateSimpleComponentList(selectedType, components, `simulation-${selectedType}-list`);
                });
            } else if (tab.id === "components-tab") {
                const selectedType = componentListType.value;
                fetchComponentsByType(selectedType).then((components) => {
                    updateDetailedComponentList(selectedType, components, `${selectedType}-list`);
                });
            }
        });
    });

    // --- Add Component Event Listener ---
    document.addEventListener("addComponent", (event) => {
        const { type, model } = event.detail;
        const currentFloor = simulationComponentManager.getCurrentFloor();

        if (!currentFloor) {
            displayError("Por favor, seleccione un piso primero", errorMessageElement);
            return;
        }

        if (simulationComponentManager.addComponent(type, model, currentFloor)) {
            updateSelectedComponentsDisplay();
        }
    });

    // --- Remove Component Event Listener ---
    document.addEventListener("removeComponent", (event) => {
        const { type, model, floor } = event.detail;
        if (simulationComponentManager.removeComponent(type, model, floor)) {
            updateSelectedComponentsDisplay();
        }
    });
});
