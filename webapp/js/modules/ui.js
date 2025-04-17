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

export function updateComponentList(type, data, customListId = null) {
    const listElement = document.getElementById(customListId || `${type}-list`);
    if (!listElement) return;

    if (!Array.isArray(data) || data.length === 0) {
        listElement.innerHTML = `<div class="text-gray-500 dark:text-gray-400">No hay ${type} disponibles</div>`;
        return;
    }

    const list = document.createElement("ul");
    list.className = "space-y-2";

    // Check if this is a simulation list by the ID
    const isSimulationList = customListId?.startsWith('simulation-');

    data.forEach((modelo) => {
        const item = document.createElement("li");
        item.className = "p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer";
        item.dataset.modelo = modelo;
        
        const content = document.createElement("div");
        content.className = "flex justify-between items-center";
        
        const name = document.createElement("span");
        name.className = "font-medium text-gray-900 dark:text-white";
        name.textContent = modelo || "Sin nombre";
        
        content.appendChild(name);

        if (isSimulationList) {
            const addButton = document.createElement("button");
            addButton.className = "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded-md text-sm";
            addButton.textContent = "Añadir";
            content.appendChild(addButton);

            // Add click handler for selection in simulation tab
            addButton.addEventListener("click", (e) => {
                e.stopPropagation();
                // Dispatch a custom event for component selection
                document.dispatchEvent(new CustomEvent('addComponent', {
                    detail: {
                        type: type,
                        model: modelo
                    }
                }));
            });
        } else {
            // For the components tab, add the selection behavior
            item.addEventListener("click", () => {
                // Remove selected class from all items
                list.querySelectorAll("li").forEach(li => {
                    li.classList.remove("bg-blue-50", "dark:bg-blue-900/30", "border", "border-blue-200", "dark:border-blue-800");
                });
                
                // Add selected class to clicked item
                item.classList.add("bg-blue-50", "dark:bg-blue-900/30", "border", "border-blue-200", "dark:border-blue-800");
                
                // Store the selected model in a hidden input or data attribute
                const container = listElement.closest(".space-y-4");
                if (container) {
                    let modelInput = container.querySelector("input[name='selected_model']");
                    if (!modelInput) {
                        modelInput = document.createElement("input");
                        modelInput.type = "hidden";
                        modelInput.name = "selected_model";
                        container.appendChild(modelInput);
                    }
                    modelInput.value = modelo;
                }
            });
        }

        item.appendChild(content);
        list.appendChild(item);
    });

    listElement.innerHTML = "";
    listElement.appendChild(list);
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

export function updateSimulationResults(results) {
    const signalLevelsTable = document.getElementById('signal-levels-table');
    const simulationSummary = document.getElementById('simulation-summary');
    
    if (!signalLevelsTable || !simulationSummary || !results) return;

    // Update signal levels table
    signalLevelsTable.innerHTML = results.signal_levels
        .sort((a, b) => a.floor - b.floor)
        .map(floor => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    ${floor.floor}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    ${floor.level.toFixed(2)} dBm
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        floor.status === 'ok' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }">
                        ${floor.status === 'ok' ? 'OK' : 'Error'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    ${floor.floor_cost.toFixed(2)} €
                </td>
            </tr>
        `).join('');

    // Update summary section
    simulationSummary.classList.remove('hidden');
    
    // Get current configuration data
    const simulationConfig = document.getElementById('simulation-config');
    const selectedOption = simulationConfig.options[simulationConfig.selectedIndex];
    const configData = selectedOption ? JSON.parse(selectedOption.dataset.config) : null;
    
    // Update headend level from configuration data
    const headendLevel = document.getElementById('headend-level');
    if (headendLevel && configData) {
        headendLevel.textContent = `${configData.nivel_cabecera.toFixed(2)} dBm`;
    }

    // Update quality margins
    const qualityMargins = document.getElementById('quality-margins');
    if (qualityMargins && results.margins) {
        qualityMargins.textContent = `${results.margins.min} dBm - ${results.margins.max} dBm`;
    }

    // Update total cost
    const totalCost = document.getElementById('total-cost');
    if (totalCost) {
        totalCost.textContent = `${results.total_cost.toFixed(2)} €`;
    }
}
