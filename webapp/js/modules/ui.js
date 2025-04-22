import { fetchComponentsByModel } from "./servlet.js";
import { displayError } from "./utils.js";

// UI management module
export function updateComponentSection(type, components) {
    const detailsElement = document.getElementById(`${type}-details`);
    if (!detailsElement || !components || components.length === 0) return;

    const list = document.createElement("ul");
    list.className = "space-y-2";

    components.forEach((comp) => {
        const item = document.createElement("li");
        item.className = "flex justify-between items-center";

        // Create the details based on component type
        let details = "";
        switch (type) {
            case "coaxial":
                details = `Pérdida: ${comp.atenuacion_coaxial}dB`;
                break;
            case "derivador":
                details = `IL: ${comp.atenuacion_insercion}dB, BL: ${comp.atenuacion_derivacion}dB`;
                break;
            case "distribuidor":
                details = `Pérdida: ${comp.atenuacion_distribucion}dB`;
                break;
            case "toma":
                details = `Nivel: ${comp.nivel_senal}dB`;
                break;
        }

        item.innerHTML = `
            <span class="font-medium">${comp.modelo || "N/A"}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">${details}</span>
        `;
        list.appendChild(item);
    });

    detailsElement.innerHTML = "";
    detailsElement.appendChild(list);
}

export function updateSignalQualitySummary(data) {
    const summaryElement = document.getElementById("signal-quality-summary");
    if (!summaryElement || !data || data.length === 0) return;

    const validFloors = data.filter((floor) => floor.is_valid).length;
    const totalFloors = data.length;
    const averageSignal = data.reduce((sum, floor) => sum + floor.nivel_senal, 0) / totalFloors;

    const summary = document.createElement("div");
    summary.className = "space-y-4";
    summary.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
                <div class="text-2xl font-bold ${
                    validFloors === totalFloors
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                }">
                    ${validFloors}/${totalFloors}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Pisos Válidos</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${averageSignal.toFixed(1)}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Señal Promedio (dB)</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold ${
                    validFloors === totalFloors
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                }">
                    ${validFloors === totalFloors ? "APROBADO" : "REVISAR"}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Estado</div>
            </div>
        </div>
    `;

    summaryElement.innerHTML = "";
    summaryElement.appendChild(summary);
}

export function updateDetailedComponentList(type, data, listId) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    if (!Array.isArray(data) || data.length === 0) {
        listElement.innerHTML = `<div class="text-gray-500 dark:text-gray-400">No hay ${type} disponibles</div>`;
        return;
    }

    const list = document.createElement("ul");
    list.className = "space-y-4";

    data.forEach((modelo) => {
        const item = document.createElement("li");
        item.className = "p-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xs hover:shadow-md transition-shadow";
        item.dataset.modelo = modelo;

        const content = document.createElement("div");
        content.className = "space-y-3";

        // Create header with model name
        const header = document.createElement("div");
        header.className = "flex justify-between items-center";

        const modelName = document.createElement("h3");
        modelName.className = "text-lg font-semibold text-gray-900 dark:text-white";
        modelName.textContent = modelo;
        header.appendChild(modelName);
        content.appendChild(header);

        // Create details section
        const details = document.createElement("div");
        details.className = "text-sm space-y-2";
        details.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Cargando detalles...</p>';

        // Fetch and display component details
        fetchComponentsByModel(type, modelo)
            .then((componentData) => {
                if (!componentData) {
                    console.error("Error loading component details: No data received");
                    details.innerHTML =
                        '<p class="text-red-500 dark:text-red-400">Error al cargar los detalles del componente</p>';
                    return;
                }

                let detailsHTML = `<p class="text-gray-900 dark:text-gray-100">Costo: <span class="font-medium">${componentData.costo.toFixed(2)}€</span></p>`;

                switch (type) {
                    case "coaxial":
                        detailsHTML += `
                            <div class="grid grid-cols-2 gap-2">
                                <p class="text-gray-600 dark:text-gray-400">Atenuación (470MHz): <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.atenuacion_470mhz.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Atenuación (694MHz): <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.atenuacion_694mhz.toFixed(2)} dB</span></p>
                            </div>`;
                        break;
                    case "derivador":
                        detailsHTML += `
                            <div class="grid grid-cols-2 gap-2">
                                <p class="text-gray-600 dark:text-gray-400">Atenuación Derivación: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.atenuacion_derivacion.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Atenuación Paso: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.atenuacion_paso.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Directividad: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.directividad.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Desacoplo: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.desacoplo.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Pérdidas Retorno: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.perdidas_retorno.toFixed(2)} dB</span></p>
                            </div>`;
                        break;
                    case "distribuidor":
                        detailsHTML += `
                            <div class="grid grid-cols-2 gap-2">
                                <p class="text-gray-600 dark:text-gray-400">Número de Salidas: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.numero_salidas}</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Atenuación Distribución: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.atenuacion_distribucion.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Desacoplo: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.desacoplo.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Pérdidas Retorno: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.perdidas_retorno.toFixed(2)} dB</span></p>
                            </div>`;
                        break;
                    case "toma":
                        detailsHTML += `
                            <div class="grid grid-cols-2 gap-2">
                                <p class="text-gray-600 dark:text-gray-400">Atenuación: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.atenuacion.toFixed(2)} dB</span></p>
                                <p class="text-gray-600 dark:text-gray-400">Desacoplo: <span class="font-medium text-gray-900 dark:text-gray-100">${componentData.desacoplo.toFixed(2)} dB</span></p>
                            </div>`;
                        break;
                }

                details.innerHTML = detailsHTML;
            })
            .catch((error) => {
                console.error("Error loading component details:", error);
                details.innerHTML =
                    '<p class="text-red-500 dark:text-red-400">Error al cargar los detalles del componente</p>';
            });

        content.appendChild(details);
        item.appendChild(content);
        list.appendChild(item);
    });

    listElement.innerHTML = "";
    listElement.appendChild(list);
}

export function updateSimpleComponentList(type, data, listId) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    if (!Array.isArray(data) || data.length === 0) {
        listElement.innerHTML = `<div class="text-gray-500 dark:text-gray-400">No hay ${type} disponibles</div>`;
        return;
    }

    const list = document.createElement("ul");
    list.className = "space-y-2";

    data.forEach((modelo) => {
        const item = document.createElement("li");
        item.className =
            "p-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xs hover:shadow-md transition-shadow cursor-pointer";
        item.dataset.modelo = modelo;

        const content = document.createElement("div");
        content.className = "flex justify-between items-center";

        const nameAndCost = document.createElement("div");
        nameAndCost.className = "flex flex-col";

        const name = document.createElement("span");
        name.className = "font-medium text-gray-900 dark:text-white";
        name.textContent = modelo || "Sin nombre";

        const cost = document.createElement("span");
        cost.className = "text-sm text-gray-500 dark:text-gray-400";
        cost.textContent = "Cargando...";

        nameAndCost.appendChild(name);
        nameAndCost.appendChild(cost);
        content.appendChild(nameAndCost);

        const addButton = document.createElement("button");
        addButton.className =
            "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded-md text-sm";
        addButton.textContent = "Añadir";
        content.appendChild(addButton);

        addButton.addEventListener("click", (e) => {
            e.stopPropagation();
            document.dispatchEvent(
                new CustomEvent("addComponent", {
                    detail: {
                        type: type,
                        model: modelo,
                    },
                }),
            );
        });

        // Fetch and display component cost
        fetchComponentsByModel(type, modelo)
            .then((details) => {
                if (details && details.costo) {
                    cost.textContent = `Costo: ${details.costo.toFixed(2)}€`;
                } else {
                    console.error("Error loading component cost: Invalid data format");
                    cost.textContent = "Error al cargar costo";
                }
            })
            .catch((error) => {
                console.error("Error loading component cost:", error);
                cost.textContent = "Error al cargar costo";
            });

        item.appendChild(content);
        list.appendChild(item);
    });

    listElement.innerHTML = "";
    listElement.appendChild(list);
}

export function updateComponentList(type, data, customListId = null) {
    // Determine if this is a simulation list by the ID
    const isSimulationList = customListId?.startsWith("simulation-");

    if (isSimulationList) {
        updateSimpleComponentList(type, data, customListId);
    } else {
        updateDetailedComponentList(type, data, customListId || `${type}-list`);
    }
}

export function updateConfigSelect(configurations, configSelect) {
    if (!configSelect) return;

    configSelect.innerHTML = configurations
        .map((config) => {
            const option = document.createElement("option");
            option.value = config.id_configuraciones || config.id;
            option.textContent = config.nombre;
            option.dataset.config = JSON.stringify(config);
            return option.outerHTML;
        })
        .join("");

    if (configurations.length > 0 && !configSelect.value) {
        configSelect.value = configurations[0].id_configuraciones || configurations[0].id;
    }
}

export function updateSignalTypeSelect(signalTypes, signalTypeSelect) {
    if (!signalTypeSelect) return;

    signalTypeSelect.innerHTML = signalTypes
        .map(
            (typeObj) =>
                `<option value="${typeObj.type}" data-min="${typeObj.min}" data-max="${typeObj.max}">${typeObj.type} (${typeObj.min}dB - ${typeObj.max}dB)</option>`,
        )
        .join("");

    if (signalTypes.length > 0) {
        signalTypeSelect.value = signalTypes[0].type;
    }
}

export function updateSimulationResults(results) {
    const signalLevelsTable = document.getElementById("signal-levels-table");
    const simulationSummary = document.getElementById("simulation-summary");

    if (!signalLevelsTable || !simulationSummary || !results) return;

    // Update signal levels table
    signalLevelsTable.innerHTML = results.signal_levels
        .sort((a, b) => a.floor - b.floor)
        .map(
            (floor) => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    ${floor.floor}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    ${floor.level.toFixed(2)} dBμV
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        floor.status === "ok"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }">
                        ${floor.status === "ok" ? "OK" : "Error"}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    ${floor.floor_cost.toFixed(2)} €
                </td>
            </tr>
        `,
        )
        .join("");

    // Update summary section
    simulationSummary.classList.remove("hidden");

    // Get current configuration data
    const simulationConfig = document.getElementById("simulation-config");
    const selectedOption = simulationConfig.options[simulationConfig.selectedIndex];
    const configData = selectedOption ? JSON.parse(selectedOption.dataset.config) : null;

    // Update headend level from configuration data
    const headendLevel = document.getElementById("headend-level");
    if (headendLevel && configData) {
        headendLevel.textContent = `${configData.nivel_cabecera.toFixed(2)} dBμV`;
    }

    // Update quality margins
    const qualityMargins = document.getElementById("quality-margins");
    if (qualityMargins && results.margins) {
        qualityMargins.textContent = `${results.margins.min} dBμV - ${results.margins.max} dBμV`;
    }

    // Update total cost
    const totalCost = document.getElementById("total-cost");
    if (totalCost) {
        totalCost.textContent = `${results.total_cost.toFixed(2)} €`;
    }
}

// Simulation Component Management
export const simulationComponentManager = {
    components: {},
    componentsByFloor: {},
    currentFloor: null,

    addComponent(type, model, floor) {
        if (!floor) return false;

        // Initialize floor if not exists
        if (!this.componentsByFloor[floor]) {
            this.componentsByFloor[floor] = {};
        }
        if (!this.componentsByFloor[floor][type]) {
            this.componentsByFloor[floor][type] = new Set();
        }

        // Add component to floor
        this.componentsByFloor[floor][type].add(model);
        return true;
    },

    removeComponent(type, model, floor) {
        if (!floor || !this.componentsByFloor[floor] || !this.componentsByFloor[floor][type]) {
            return false;
        }

        return this.componentsByFloor[floor][type].delete(model);
    },

    getComponentsByFloor(floor) {
        return this.componentsByFloor[floor] || {};
    },

    getAllComponents() {
        return this.componentsByFloor;
    },

    setCurrentFloor(floor) {
        this.currentFloor = floor;
    },

    getCurrentFloor() {
        return this.currentFloor;
    },

    clearFloor(floor) {
        if (this.componentsByFloor[floor]) {
            delete this.componentsByFloor[floor];
        }
    },

    clearAllFloors() {
        this.componentsByFloor = {};
        this.currentFloor = null;
    },
};

// Component Display Helper Functions
function getComponentTypeName(type) {
    switch (type) {
        case "coaxial":
            return "Cables Coaxiales";
        case "derivador":
            return "Derivadores";
        case "distribuidor":
            return "Distribuidores";
        case "toma":
            return "Tomas";
        default:
            return type;
    }
}

export function updateSelectedComponentsDisplay() {
    const componentsByFloor = document.getElementById("components-by-floor");
    if (!componentsByFloor) return;

    const allComponents = simulationComponentManager.getAllComponents();
    const floors = Object.keys(allComponents).sort((a, b) => a - b);

    if (floors.length === 0) {
        componentsByFloor.innerHTML =
            '<p class="text-gray-500 dark:text-gray-400">No hay componentes seleccionados</p>';
        return;
    }

    let html = "";
    floors.forEach((floor) => {
        const floorComponents = allComponents[floor];
        if (!floorComponents) return;

        html += `
            <div class="py-3 first:pt-0">
                <h3 class="mb-2 font-medium text-gray-900 dark:text-gray-100">Piso ${floor}</h3>
                <div class="space-y-2">
        `;

        Object.entries(floorComponents).forEach(([type, models]) => {
            if (models.length === 0) return;

            html += `
                <div class="pl-4">
                    <h4 class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">${getComponentTypeName(type)}</h4>
                    <ul class="space-y-1">
            `;

            models.forEach((model) => {
                html += `
                    <li class="flex items-center justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">${model}</span>
                        <button
                            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onclick="document.dispatchEvent(new CustomEvent('removeComponent', {
                                detail: {
                                    type: '${type}',
                                    model: '${model}',
                                    floor: ${floor}
                                }
                            }))"
                        >
                            Eliminar
                        </button>
                    </li>
                `;
            });

            html += `
                    </ul>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    componentsByFloor.innerHTML = html;
}

export function updateFloorSelector(numPisos) {
    const floorSelect = document.getElementById("simulation-floor");
    if (!floorSelect) return;

    floorSelect.innerHTML = '<option value="">Seleccionar Piso</option>';

    for (let i = 1; i <= numPisos; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Piso ${i}`;
        floorSelect.appendChild(option);
    }
}
