import { initTheme } from "./modules/theme.js";
import { initTabs, switchTab } from "./modules/tabs.js";
import { handleFormSubmit as handleInitialConfigFormSubmit } from "./modules/forms.js";
import { updateComponentForm, validateComponentForm, prepareSimulationData } from "./modules/forms.js";
import {
    fetchConfigurations,
    fetchSignalTypes,
    fetchComponentsByType,
    submitComponent,
    runSimulation,
    fetchComponentDetails,
} from "./modules/servlet.js";
import { displayError, displaySuccess, clearMessages, formatDate } from "./modules/utils.js";
import {
    updateConfigSelect,
    updateSignalTypeSelect,
    updateFloorSelector,
    updateDetailedComponentList,
    updateSimulationResults,
} from "./modules/ui.js";
import { SchematicEditor } from "./modules/schematic.js";

document.addEventListener("DOMContentLoaded", async () => {
    // --- Core Initializations ---
    initTheme();
    initTabs();

    // --- DOM Element References ---
    const errorMessageElement = document.getElementById("error-message");
    const successMessageElement = document.getElementById("success-message");

    // Configuration Tab Elements
    const initialConfigForm = document.getElementById("initial-config-form");
    const configSelect = document.getElementById("id_configuraciones");
    const configDetailsDiv = document.getElementById("config-details");
    const configNameDisplay = document.getElementById("config-name-display");
    const configHeadendDisplay = document.getElementById("config-headend-display");
    const configFloorsDisplay = document.getElementById("config-floors-display");
    const configDateDisplay = document.getElementById("config-date-display");

    // Components Tab Elements
    const componentForm = document.getElementById("component-form");
    const componentTypeSelect = document.getElementById("component-type");
    const dynamicFieldsContainer = document.getElementById("dynamic-fields");
    const componentListTypeSelect = document.getElementById("component-list-type");
    const componentListsContainer = {
        // Map IDs to list elements
        coaxial: document.getElementById("coaxial-list"),
        derivador: document.getElementById("derivador-list"),
        distribuidor: document.getElementById("distribuidor-list"),
        toma: document.getElementById("toma-list"),
    };

    // Simulation Tab Elements
    const simulationConfigSelect = document.getElementById("simulation-config");
    const signalTypeSelect = document.getElementById("signal-type");
    const signalFrequencyInput = document.getElementById("signal-frequency"); // Needed for prepareSimulationData
    const simulationFloorSelect = document.getElementById("simulation-floor");
    const cableSelect = document.getElementById("cable-select");
    const runSimulationButton = document.getElementById("run-simulation");
    const schematicCanvas = document.getElementById("schematic-canvas");

    // Results Tab Elements

    // --- Global State ---
    let currentConfigurations = []; // Store fetched configurations
    let schematicEditor;
    let componentModels = {
        coaxial: [],
        derivador: [],
        distribuidor: [],
        toma: [],
    };

    // --- Helper Functions ---

    /** Fetches component models needed for schematic and UI */
    async function loadComponentModels() {
        try {
            const types = ["coaxial", "derivador", "distribuidor", "toma"];
            const results = await Promise.all(types.map(fetchComponentsByType));
            componentModels.coaxial = results[0] || [];
            componentModels.derivador = results[1] || [];
            componentModels.distribuidor = results[2] || [];
            componentModels.toma = results[3] || [];

            // Update cable selector in Simulation tab
            if (cableSelect) {
                cableSelect.innerHTML = componentModels.coaxial
                    .map((model) => `<option value="${model}">${model}</option>`)
                    .join("");
            }
        } catch (error) {
            console.error("Error fetching component models:", error);
            displayError("Error al cargar modelos de componentes.", errorMessageElement, successMessageElement);
        }
    }

    /** Updates UI elements based on the selected configuration */
    function handleConfigurationChange(selectedId) {
        const selectedConfig = currentConfigurations.find((c) => (c.id_configuraciones || c.id) == selectedId);

        if (selectedConfig) {
            // Update Config Tab Details Display
            if (configDetailsDiv) {
                configNameDisplay.textContent = selectedConfig.nombre || "-";
                configHeadendDisplay.textContent = selectedConfig.nivel_cabecera
                    ? `${selectedConfig.nivel_cabecera.toFixed(1)} dBμV`
                    : "-";
                configFloorsDisplay.textContent = selectedConfig.num_pisos || "-";
                configDateDisplay.textContent = selectedConfig.fecha_creacion
                    ? formatDate(selectedConfig.fecha_creacion)
                    : "-";
                configDetailsDiv.classList.remove("hidden");
            }

            // Update Simulation Tab Selectors
            if (simulationConfigSelect) {
                simulationConfigSelect.value = selectedId; // Sync selection
            }
            if (simulationFloorSelect && selectedConfig.num_pisos) {
                updateFloorSelector(selectedConfig.num_pisos);
                simulationFloorSelect.value = "";
                schematicEditor?.setCurrentFloor(null);
            }

            // Clear schematic if new config is selected
            schematicEditor?.clearSchematic();
        } else {
            // Hide details if no config is selected
            if (configDetailsDiv) configDetailsDiv.classList.add("hidden");
            if (simulationFloorSelect)
                simulationFloorSelect.innerHTML = '<option value="">Seleccione Configuración</option>';
        }
    }

    /** Fetches and displays the detailed list for the selected component type */
    async function updateDetailedComponentView(type) {
        const listElement = componentListsContainer[type];
        if (!listElement) return;

        // Show the correct list, hide others
        Object.values(componentListsContainer).forEach((list) => list.classList.add("hidden"));
        listElement.classList.remove("hidden");

        // Fetch component models (simple list) and then details for each
        try {
            const models = await fetchComponentsByType(type); // Gets ["model1", "model2"]
            // Pass models and fetch details function to UI updater
            updateDetailedComponentList(type, models, listElement.id); // ui.js handles fetching details now
        } catch (error) {
            console.error(`Error fetching or displaying ${type} components:`, error);
            displayError(`Error al cargar ${type}: ${error.message}`, errorMessageElement, successMessageElement);
            listElement.innerHTML = `<div class="text-zinc-500 dark:text-zinc-400">Error al cargar componentes.</div>`;
        }
    }

    // --- Initial Data Loading & Setup ---
    try {
        clearMessages(errorMessageElement, successMessageElement);
        // Fetch configs and signal types first
        const [configurations, signalTypes] = await Promise.all([fetchConfigurations(), fetchSignalTypes()]);

        currentConfigurations = configurations; // Store fetched configurations

        updateConfigSelect(currentConfigurations, configSelect);
        updateConfigSelect(currentConfigurations, simulationConfigSelect); // Keep them in sync

        updateSignalTypeSelect(signalTypes, signalTypeSelect);

        await loadComponentModels();

        // Initialize Schematic Editor *after* models are loaded
        schematicEditor = new SchematicEditor("schematic-canvas", {
            cables: componentModels.coaxial,
            derivadores: componentModels.derivador,
            distribuidores: componentModels.distribuidor,
            tomas: componentModels.toma,
        });
        // Set default cable type in schematic editor
        if (componentModels.coaxial.length > 0 && cableSelect) {
            schematicEditor.setCableType(cableSelect.value);
        }

        if (configSelect && configSelect.value) {
            handleConfigurationChange(configSelect.value);
        }

        if (componentListTypeSelect) {
            updateDetailedComponentView(componentListTypeSelect.value);
        }
    } catch (error) {
        console.error("Error during initial data load:", error);
        displayError(
            "Error crítico al inicializar la aplicación. Por favor, recargue.",
            errorMessageElement,
            successMessageElement,
        );
        // Disable parts of the UI if initialization failed?
        runSimulationButton?.setAttribute("disabled", "true");
        initialConfigForm?.querySelector('button[type="submit"]')?.setAttribute("disabled", "true");
        componentForm?.querySelector('button[type="submit"]')?.setAttribute("disabled", "true");
    }

    // --- Event Listeners ---

    // **Configuration Tab**
    if (initialConfigForm) {
        initialConfigForm.addEventListener("submit", async (event) => {
            await handleInitialConfigFormSubmit(
                event,
                initialConfigForm,
                errorMessageElement,
                successMessageElement,
                configSelect,
            );
            // After successful submission, re-fetch configurations and update UI
            try {
                currentConfigurations = await fetchConfigurations();
                updateConfigSelect(currentConfigurations, configSelect);
                updateConfigSelect(currentConfigurations, simulationConfigSelect);
            } catch (error) {
                console.error("Error refetching configurations after submit:", error);
            }
        });
    }

    if (configSelect) {
        configSelect.addEventListener("change", () => {
            handleConfigurationChange(configSelect.value);
        });
        // Add listener for the custom configurationChanged event
        configSelect.addEventListener("configurationChanged", (event) => {
            handleConfigurationChange(event.detail.configId);
        });
    }

    // **Components Tab**
    if (componentTypeSelect) {
        componentTypeSelect.addEventListener("change", (e) => {
            updateComponentForm(e.target.value);
        });
    }

    if (componentForm) {
        componentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearMessages(errorMessageElement, successMessageElement);
            const formData = new FormData(e.target);

            // Basic validation (assuming your module function handles details)
            if (!formData.get("type") || !formData.get("modelo") || !formData.get("costo")) {
                displayError(
                    "Por favor complete los campos básicos (Tipo, Modelo, Costo).",
                    errorMessageElement,
                    successMessageElement,
                );
                return;
            }

            try {
                const result = await submitComponent(formData); // servlet.js handles formatting
                if (result.success) {
                    displaySuccess(result.success, successMessageElement, errorMessageElement);
                    e.target.reset();
                    dynamicFieldsContainer.innerHTML = ""; // Clear dynamic fields
                    // Refresh component models and the current list view
                    await loadComponentModels(); // Reload all models
                    if (componentListTypeSelect) {
                        updateDetailedComponentView(componentListTypeSelect.value); // Refresh the view
                    }
                    // Update schematic editor models if needed
                    schematicEditor?.updateModels({
                        cables: componentModels.coaxial,
                        derivadores: componentModels.derivador,
                        distribuidores: componentModels.distribuidor,
                        tomas: componentModels.toma,
                    });
                } else {
                    displayError(
                        result.error || "Error al añadir el componente",
                        errorMessageElement,
                        successMessageElement,
                    );
                }
            } catch (error) {
                console.error("Error submitting component:", error);
                displayError(
                    `Error al añadir el componente: ${error.message || "Error desconocido"}`,
                    errorMessageElement,
                    successMessageElement,
                );
            }
        });
    }

    if (componentListTypeSelect) {
        componentListTypeSelect.addEventListener("change", (event) => {
            updateDetailedComponentView(event.target.value);
        });
    }

    // **Simulation Tab**
    if (simulationConfigSelect) {
        // When simulation config select changes, sync with main configSelect and update UI
        simulationConfigSelect.addEventListener("change", () => {
            const newConfigId = simulationConfigSelect.value;
            if (configSelect.value !== newConfigId) {
                configSelect.value = newConfigId; // Keep selects in sync
            }
            handleConfigurationChange(newConfigId); // Update UI based on selection
        });
    }

    if (cableSelect) {
        cableSelect.addEventListener("change", (e) => {
            schematicEditor?.setCableType(e.target.value);
        });
    }

    if (simulationFloorSelect) {
        simulationFloorSelect.addEventListener("change", () => {
            const selectedFloor = simulationFloorSelect.value;
            schematicEditor?.setCurrentFloor(selectedFloor ? parseInt(selectedFloor) : null);
        });
    }

    if (schematicCanvas) {
        // schematicCanvas.addEventListener('click', (e) => {
        //     schematicEditor?.handleClick(e); // Delegate click handling to the editor
        // });
        // Add listeners for schematic controls (zoom, pan, reset) if they exist
        document.getElementById("zoom-in")?.addEventListener("click", () => schematicEditor?.zoom(1.2));
        document.getElementById("zoom-out")?.addEventListener("click", () => schematicEditor?.zoom(1 / 1.2));
        document.getElementById("reset-view")?.addEventListener("click", () => schematicEditor?.resetView());
    }

    if (runSimulationButton) {
        runSimulationButton.addEventListener("click", async () => {
            clearMessages(errorMessageElement, successMessageElement);
            if (!schematicEditor) {
                displayError(
                    "El editor de esquemático no está inicializado.",
                    errorMessageElement,
                    successMessageElement,
                );
                return;
            }

            const selectedConfigId = simulationConfigSelect.value;
            const selectedSignalType = signalTypeSelect.value;
            const frequency = parseInt(signalFrequencyInput.value);

            if (!selectedConfigId || !selectedSignalType) {
                displayError(
                    "Por favor, seleccione una configuración y tipo de señal.",
                    errorMessageElement,
                    successMessageElement,
                );
                return;
            }
            if (isNaN(frequency) || frequency < 470 || frequency > 694) {
                displayError(
                    "Frecuencia inválida (debe ser entre 470 y 694 MHz).",
                    errorMessageElement,
                    successMessageElement,
                );
                return;
            }

            const componentsData = schematicEditor.getAllComponents();

            // Check if any components were actually placed
            if (Object.keys(componentsData.floors).length === 0) {
                displayError(
                    "No se han añadido componentes al diseño en el esquemático.",
                    errorMessageElement,
                    successMessageElement,
                );
                return;
            }

            // Prepare data structure for the API
            try {
                // Find the full config data locally first
                const selectedConfigData = currentConfigurations.find(
                    (c) => (c.id_configuraciones || c.id) == selectedConfigId,
                );
                if (!selectedConfigData) {
                    throw new Error("Configuración seleccionada no encontrada localmente.");
                }

                // Flatten component data for the API request
                const apiComponents = [];
                Object.entries(componentsData.floors).forEach(([floorStr, floorComps]) => {
                    const floorNum = parseInt(floorStr);

                    // Add derivador if present
                    if (floorComps.derivador) {
                        apiComponents.push({ type: "derivador", model: floorComps.derivador, floor: floorNum });
                    }
                    // Add distribuidores if present
                    if (Array.isArray(floorComps.distribuidores)) {
                        floorComps.distribuidores.forEach((model) => {
                            if (model) apiComponents.push({ type: "distribuidor", model: model, floor: floorNum });
                        });
                    }
                    // Add tomas (left and right) if present
                    if (Array.isArray(floorComps.tomasLeft)) {
                        floorComps.tomasLeft.forEach((model) => {
                            if (model) apiComponents.push({ type: "toma", model: model, floor: floorNum });
                        });
                    }
                    if (Array.isArray(floorComps.tomasRight)) {
                        floorComps.tomasRight.forEach((model) => {
                            if (model) apiComponents.push({ type: "toma", model: model, floor: floorNum });
                        });
                    }
                    // Add Coaxial Cable information (implicit based on schematic and API calculation logic)
                    // We might need to pass the selected *cable model*.
                    // Let's assume the backend primarily needs the *type* of cable used universally.
                    // If specific lengths/models per connection are needed, the schematic/API interaction needs adjustment.
                    // For now, ensure the selected cable model is available if needed, but don't add explicit 'coaxial' entries per floor here.
                });

                const simulationPayload = {
                    num_pisos: selectedConfigData.num_pisos,
                    nivel_cabecera: selectedConfigData.nivel_cabecera,
                    tipo_senal: selectedSignalType,
                    frequency: frequency,
                    selected_cable_model: cableSelect.value, // Add the selected cable model
                    components: apiComponents,
                };

                // Run simulation API call
                const results = await runSimulation(simulationPayload); // Pass the prepared data

                results.nivel_cabecera = selectedConfigData.nivel_cabecera;

                switchTab("results-tab");
                updateSimulationResults(results);
                displaySuccess("Simulación completada con éxito.", successMessageElement, errorMessageElement);
            } catch (error) {
                console.error("Error preparing or running simulation:", error);
                displayError(
                    `Error en simulación: ${error.message || "Error desconocido"}`,
                    errorMessageElement,
                    successMessageElement,
                );
            }
        });
    }

    // **Tab Switching Logic**
    document.querySelectorAll(".tab-button").forEach((button) => {
        button.addEventListener("click", () => {
            const tabIdBase = button.id.replace("-mobile", ""); // Handle mobile buttons too

            // Specific actions on tab switch
            if (tabIdBase === "simulation-tab") {
                // Ensure canvas is sized correctly when switching *to* simulation tab
                // Use requestAnimationFrame to allow layout adjustments before resizing
                requestAnimationFrame(() => schematicEditor?.initializeCanvas());
            } else if (tabIdBase === "components-tab") {
                // Refresh the component list *if needed* (optional, could rely on explicit user action)
                // updateDetailedComponentView(componentListTypeSelect.value);
            } else if (tabIdBase === "config-tab") {
                // Ensure the displayed config details match the selection
                if (configSelect.value) {
                    handleConfigurationChange(configSelect.value);
                }
            }
        });
    });
}); // End DOMContentLoaded
