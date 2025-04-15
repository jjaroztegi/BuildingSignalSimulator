// UI management module
export function updateSignalLevelDisplay(data, simulationDetailsElement) {
    if (!simulationDetailsElement) return;

    // Create the signal level visualization
    const container = document.createElement("div");
    container.className = "space-y-6";

    // Add floor-by-floor visualization
    const floorViz = document.createElement("div");
    floorViz.className = "relative bg-gray-100 dark:bg-gray-700 p-4 rounded-lg";

    // Sort floors in descending order (top floor first)
    const sortedData = [...data].sort((a, b) => b.piso - a.piso);

    sortedData.forEach((floor) => {
        const floorElement = document.createElement("div");
        floorElement.className = `flex items-center space-x-4 mb-4 p-3 rounded-lg ${
            floor.is_valid ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"
        }`;

        // Floor number
        const floorNum = document.createElement("div");
        floorNum.className = "w-16 font-medium";
        floorNum.textContent = `Piso ${floor.piso}`;

        // Signal level bar
        const barContainer = document.createElement("div");
        barContainer.className = "flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden";

        const bar = document.createElement("div");
        // Calculate percentage based on min (40dB) and max (80dB) possible values
        const percentage = Math.min(100, Math.max(0, ((floor.nivel_senal - 40) / (80 - 40)) * 100));
        bar.className = `h-full ${floor.is_valid ? "bg-green-500" : "bg-red-500"}`;
        bar.style.width = `${percentage}%`;
        barContainer.appendChild(bar);

        // Signal level value
        const levelValue = document.createElement("div");
        levelValue.className = "w-24 text-right";
        levelValue.textContent = `${floor.nivel_senal.toFixed(1)} dB`;

        // Status indicator
        const status = document.createElement("div");
        status.className = `w-20 text-center px-2 py-1 rounded-full text-xs font-medium ${
            floor.is_valid
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`;
        status.textContent = floor.is_valid ? "Válido" : "Inválido";

        floorElement.appendChild(floorNum);
        floorElement.appendChild(barContainer);
        floorElement.appendChild(levelValue);
        floorElement.appendChild(status);
        floorViz.appendChild(floorElement);
    });

    container.appendChild(floorViz);

    // Add legend
    const legend = document.createElement("div");
    legend.className = "flex justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400";
    legend.innerHTML = `
        <div class="flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Señal Válida</span>
        </div>
        <div class="flex items-center">
            <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Señal Inválida</span>
        </div>
    `;
    container.appendChild(legend);

    simulationDetailsElement.innerHTML = "";
    simulationDetailsElement.appendChild(container);
}

export function renderSimulationDetails(data, simulationDetailsElement) {
    if (!simulationDetailsElement) return;

    // Format the date if it exists
    let formattedDate = "N/A";
    if (data.fecha_creacion) {
        try {
            const date = new Date(data.fecha_creacion);
            if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleString();
            }
        } catch (e) {
            console.error("Error formatting date:", e);
        }
    }

    const detailsHtml = `
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Detalles de la Simulación</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Configuración</p>
                    <p class="font-medium">${data.nombre}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Nivel de Cabecera</p>
                    <p class="font-medium">${data.nivel_cabecera} dB</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Número de Pisos</p>
                    <p class="font-medium">${data.num_pisos}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Creado</p>
                    <p class="font-medium">${formattedDate}</p>
                </div>
            </div>
        </div>
    `;

    simulationDetailsElement.innerHTML = detailsHtml;
}

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
            case "cable":
                details = `Longitud: ${comp.longitud_cable}m`;
                break;
            case "derivador":
                details = `IL: ${comp.atenuacion_insercion}dB, BL: ${comp.atenuacion_derivacion}dB`;
                break;
            case "distribuidor":
                details = `Pérdida: ${comp.atenuacion_distribucion}dB`;
                break;
            case "amplificador":
                details = `Gain: ${comp.ganancia}dB, NF: ${comp.figura_ruido}dB`;
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

export function updateComponentList(type, componentModelos) {
    const listElement = document.getElementById(`${type}-list`);
    if (!listElement) return;

    // Clear existing content
    listElement.innerHTML = "";

    if (!Array.isArray(componentModelos)) {
        listElement.innerHTML = '<div class="text-red-500 dark:text-red-400">Formato de datos inválido</div>';
        return;
    }

    if (componentModelos.length === 0) {
        listElement.innerHTML = '<div class="text-gray-500 dark:text-gray-400">No hay componentes disponibles</div>';
        return;
    }

    // Add each component as a card
    componentModelos.forEach((modelo) => {
        const card = document.createElement("div");
        card.className =
            "bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600";

        card.innerHTML = `
            <div class="font-medium text-gray-900 dark:text-gray-100">${modelo}</div>
        `;
        listElement.appendChild(card);
    });
}

export function updateQualityDisplay(data) {
    const qualityTable = document.createElement('table');
    qualityTable.className = 'min-w-full divide-y divide-gray-200 dark:divide-gray-700';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50 dark:bg-gray-800';
    thead.innerHTML = `
        <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Piso</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nivel de Señal (dB)</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
        </tr>
    `;
    qualityTable.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700';

    data.forEach((floor, index) => {
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
        
        const statusClass = floor.is_valid 
            ? 'text-green-800 dark:text-green-400' 
            : 'text-red-800 dark:text-red-400';
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Piso ${floor.piso}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${floor.nivel_senal.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${statusClass} font-medium">
                ${floor.is_valid ? 'Válido' : 'Inválido'}
            </td>
        `;
        tbody.appendChild(tr);
    });

    qualityTable.appendChild(tbody);

    // Update the simulation details section
    const simulationDetails = document.getElementById('simulation-details');
    if (simulationDetails) {
        simulationDetails.innerHTML = '';
        simulationDetails.appendChild(qualityTable);
    }
} 