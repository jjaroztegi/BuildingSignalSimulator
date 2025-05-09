import {
  fetchComponentsByModel,
  fetchComponentsByType,
  deleteComponent,
  updateComponent,
} from './servlet.js';
import { displayError, displaySuccess, clearMessages } from './utils.js';
import { componentFields } from './forms.js';

// UI management module
export function updateComponentSection(type, components) {
  const detailsElement = document.getElementById(`${type}-details`);
  if (!detailsElement || !components || components.length === 0) return;

  const list = document.createElement('ul');
  list.className = 'space-y-2';

  components.forEach((comp) => {
    const item = document.createElement('li');
    item.className = 'flex justify-between items-center';

    // Show details based on component type
    let details = '';
    switch (type) {
      case 'coaxial':
        details = `Pérdida: ${comp.atenuacion_coaxial}dB`;
        break;
      case 'derivador':
        details = `IL: ${comp.atenuacion_insercion}dB, BL: ${comp.atenuacion_derivacion}dB`;
        break;
      case 'distribuidor':
        details = `Pérdida: ${comp.atenuacion_distribucion}dB`;
        break;
      case 'toma':
        details = `Nivel: ${comp.nivel_senal}dB`;
        break;
    }

    item.innerHTML = `
            <span class="font-medium">${comp.modelo || 'N/A'}</span>
            <span class="text-sm text-zinc-500 dark:text-zinc-400">${details}</span>
        `;
    list.appendChild(item);
  });

  detailsElement.innerHTML = '';
  detailsElement.appendChild(list);
}

export function updateSignalQualitySummary(data) {
  const summaryElement = document.getElementById('signal-quality-summary');
  if (!summaryElement || !data || data.length === 0) return;

  const validFloors = data.filter((floor) => floor.is_valid).length;
  const totalFloors = data.length;
  const averageSignal = data.reduce((sum, floor) => sum + floor.nivel_senal, 0) / totalFloors;

  const summary = document.createElement('div');
  summary.className = 'space-y-4';
  summary.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
                <div class="text-2xl font-bold ${
                  validFloors === totalFloors
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }">
                    ${validFloors}/${totalFloors}
                </div>
                <div class="text-sm text-zinc-600 dark:text-zinc-400">Pisos Válidos</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${averageSignal.toFixed(1)}
                </div>
                <div class="text-sm text-zinc-600 dark:text-zinc-400">Señal Promedio (dB)</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold ${
                  validFloors === totalFloors
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }">
                    ${validFloors === totalFloors ? 'APROBADO' : 'REVISAR'}
                </div>
                <div class="text-sm text-zinc-600 dark:text-zinc-400">Estado</div>
            </div>
        </div>
    `;

  summaryElement.innerHTML = '';
  summaryElement.appendChild(summary);
}

// Helper: Generate property details for a component
function generateComponentPropertyDetails(type, componentData) {
  const propertyDefinitions = {
    coaxial: [
      { label: 'Aten. 470MHz', key: 'atenuacion_470mhz', unit: 'dB/100m', decimals: 2 },
      { label: 'Aten. 694MHz', key: 'atenuacion_694mhz', unit: 'dB/100m', decimals: 2 },
    ],
    derivador: [
      { label: 'Aten. Deriv.', key: 'atenuacion_derivacion', unit: 'dB', decimals: 1 },
      { label: 'Aten. Paso', key: 'atenuacion_paso', unit: 'dB', decimals: 1 },
      { label: 'Directividad', key: 'directividad', unit: 'dB', decimals: 1 },
      { label: 'Desacoplo', key: 'desacoplo', unit: 'dB', decimals: 1 },
      { label: 'Pérd. Retorno', key: 'perdidas_retorno', unit: 'dB', decimals: 1 },
    ],
    distribuidor: [
      { label: 'Nº Salidas', key: 'numero_salidas', unit: '', decimals: 0 },
      { label: 'Aten. Distrib.', key: 'atenuacion_distribucion', unit: 'dB', decimals: 1 },
      { label: 'Desacoplo', key: 'desacoplo', unit: 'dB', decimals: 1 },
      { label: 'Pérd. Retorno', key: 'perdidas_retorno', unit: 'dB', decimals: 1 },
    ],
    toma: [
      { label: 'Atenuación', key: 'atenuacion', unit: 'dB', decimals: 1 },
      { label: 'Desacoplo', key: 'desacoplo', unit: 'dB', decimals: 1 },
    ],
  };

  const properties = propertyDefinitions[type] || [];
  return properties
    .map((prop) => {
      const value = componentData[prop.key];
      const formattedValue =
        value != null ? (prop.decimals > 0 ? value.toFixed(prop.decimals) : value) : '-';
      const displayValue = prop.unit ? `${formattedValue} ${prop.unit}` : formattedValue;
      return `<div class="flex justify-between items-center">
            <span class="text-zinc-600 dark:text-zinc-400">${prop.label}:</span>
            <span class="font-medium text-zinc-800 dark:text-zinc-200">${displayValue}</span>
        </div>`;
    })
    .join('');
}

export function updateDetailedComponentList(type, models, listId) {
  const listElement = document.getElementById(listId);
  if (!listElement) return;

  listElement.innerHTML = '';
  if (!Array.isArray(models) || models.length === 0) {
    listElement.innerHTML = `<div class="text-center text-sm text-zinc-500 dark:text-zinc-400 italic py-4">No hay ${type} disponibles.</div>`;
    return;
  }
  listElement.className = 'space-y-2 pb-4';
  const fragment = document.createDocumentFragment();

  models.forEach((modelo) => {
    const item = document.createElement('li');
    item.className =
      'bg-zinc-200 dark:bg-zinc-800/50 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-4';
    item.dataset.modelo = modelo;

    const content = document.createElement('div');
    content.className = 'space-y-2';

    // Model name header
    const modelName = document.createElement('h3');
    modelName.className = 'text-base font-semibold text-primary-700 dark:text-primary-400';
    modelName.textContent = modelo;
    content.appendChild(modelName);

    // Details section (populated async)
    const details = document.createElement('div');
    details.className = 'text-xs space-y-1 border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2';
    details.innerHTML =
      '<p class="text-zinc-400 dark:text-zinc-500 italic">Cargando detalles...</p>';
    content.appendChild(details);

    // Action buttons
    const actions = document.createElement('div');
    actions.className =
      'flex justify-end space-x-2 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700';

    // Edit
    const editButton = document.createElement('button');
    editButton.className =
      'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded-md text-sm';
    editButton.textContent = 'Editar';
    editButton.onclick = () => handleEditComponent(type, modelo);
    actions.appendChild(editButton);

    // Delete
    const deleteButton = document.createElement('button');
    deleteButton.className =
      'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded-md text-sm';
    deleteButton.textContent = 'Eliminar';
    deleteButton.onclick = () => handleDeleteComponent(type, modelo);
    actions.appendChild(deleteButton);

    content.appendChild(actions);
    item.appendChild(content);
    fragment.appendChild(item);

    // Fetch and display component details
    fetchComponentsByModel(type, modelo)
      .then((componentData) => {
        if (!componentData || typeof componentData.costo === 'undefined') {
          details.innerHTML =
            '<p class="text-red-500 dark:text-red-400">Error al cargar detalles.</p>';
          return;
        }
        let detailsHTML = `<div class="flex justify-between items-center">
                                    <span class="text-zinc-600 dark:text-zinc-400">Costo:</span>
                                    <span class="font-medium text-zinc-800 dark:text-zinc-200">${componentData.costo.toFixed(2)} €</span>
                                  </div>`;
        detailsHTML += generateComponentPropertyDetails(type, componentData);
        details.innerHTML = detailsHTML;
      })
      .catch(() => {
        details.innerHTML =
          '<p class="text-red-500 dark:text-red-400">Error al cargar detalles.</p>';
      });
  });
  listElement.appendChild(fragment);
}

export function updateSimpleComponentList(type, data, listId) {
  const listElement = document.getElementById(listId);
  if (!listElement) return;

  if (!Array.isArray(data) || data.length === 0) {
    listElement.innerHTML = `<div class="text-zinc-500 dark:text-zinc-400">No hay ${type} disponibles</div>`;
    return;
  }

  const list = document.createElement('ul');
  list.className = 'space-y-2';

  data.forEach((modelo) => {
    const item = document.createElement('li');
    item.className =
      'p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg shadow-2xs hover:shadow-md transition-shadow cursor-pointer';
    item.dataset.modelo = modelo;

    const content = document.createElement('div');
    content.className = 'flex justify-between items-center';

    const nameAndCost = document.createElement('div');
    nameAndCost.className = 'flex flex-col';

    const name = document.createElement('span');
    name.className = 'font-medium text-zinc-900 dark:text-white';
    name.textContent = modelo || 'Sin nombre';

    const cost = document.createElement('span');
    cost.className = 'text-sm text-zinc-500 dark:text-zinc-400';
    cost.textContent = 'Cargando...';

    nameAndCost.appendChild(name);
    nameAndCost.appendChild(cost);
    content.appendChild(nameAndCost);

    const addButton = document.createElement('button');
    addButton.className =
      'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded-md text-sm';
    addButton.textContent = 'Añadir';
    content.appendChild(addButton);

    addButton.addEventListener('click', (e) => {
      e.stopPropagation();
      document.dispatchEvent(
        new CustomEvent('addComponent', {
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
          cost.textContent = 'Error al cargar costo';
        }
      })
      .catch(() => {
        cost.textContent = 'Error al cargar costo';
      });

    item.appendChild(content);
    list.appendChild(item);
  });

  listElement.innerHTML = '';
  listElement.appendChild(list);
}

export function updateComponentList(type, data, customListId = null) {
  // Use simple or detailed list depending on context
  const isSimulationList = customListId?.startsWith('simulation-');
  if (isSimulationList) {
    updateSimpleComponentList(type, data, customListId);
  } else {
    updateDetailedComponentList(type, data, customListId || `${type}-list`);
  }
}

export function updateConfigSelect(configurations, configSelect) {
  if (!configSelect) return;
  const currentVal = configSelect.value;
  configSelect.innerHTML =
    '<option value="">-- Seleccione --</option>' +
    configurations
      .map((config) => {
        const id = config.id_configuraciones || config.id;
        const name = config.nombre || `Configuración ${id}`;
        const dataString = JSON.stringify(config);
        return `<option value="${id}" data-config='${dataString}'>${name}</option>`;
      })
      .join('');
  if (configSelect.querySelector(`option[value="${currentVal}"]`)) {
    configSelect.value = currentVal;
    configSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

export function updateSignalTypeSelect(signalTypes, signalTypeSelect) {
  if (!signalTypeSelect) return;
  const currentVal = signalTypeSelect.value;
  signalTypeSelect.innerHTML =
    '<option value="">-- Seleccione --</option>' +
    signalTypes
      .map(
        (typeObj) =>
          `<option value="${typeObj.type}" data-min="${typeObj.min}" data-max="${typeObj.max}">${typeObj.type} (${typeObj.min}-${typeObj.max} dB)</option>`,
      )
      .join('');
  if (signalTypeSelect.querySelector(`option[value="${currentVal}"]`)) {
    signalTypeSelect.value = currentVal;
  }
}

export function updateSimulationResults(results) {
  const signalLevelsTableBody = document.getElementById('signal-levels-table');
  const simulationSummaryContainer = document.getElementById('simulation-summary');
  const headendLevelEl = document.getElementById('headend-level');
  const qualityMarginsEl = document.getElementById('quality-margins');
  const totalCostEl = document.getElementById('total-cost');
  const overallStatusEl = document.getElementById('overall-status');

  // If any required element is missing, reset display
  if (
    !signalLevelsTableBody ||
    !simulationSummaryContainer ||
    !headendLevelEl ||
    !qualityMarginsEl ||
    !totalCostEl ||
    !overallStatusEl ||
    !results
  ) {
    if (signalLevelsTableBody)
      signalLevelsTableBody.innerHTML =
        '<tr><td colspan="4" class="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">No hay resultados disponibles.</td></tr>';
    if (simulationSummaryContainer)
      simulationSummaryContainer.querySelector('p.text-xs')?.classList.remove('hidden');
    if (headendLevelEl) headendLevelEl.textContent = '-';
    if (qualityMarginsEl) qualityMarginsEl.textContent = '-';
    if (totalCostEl) totalCostEl.textContent = '-';
    if (overallStatusEl) overallStatusEl.textContent = '-';
    updateChartPlaceholder(true);
    return;
  }

  // --- Update Signal Levels Table ---
  if (results.signal_levels && results.signal_levels.length > 0) {
    signalLevelsTableBody.innerHTML = results.signal_levels
      .sort((a, b) => a.floor - b.floor)
      .map((floor) => {
        const level = typeof floor.level === 'number' ? floor.level.toFixed(1) : 'N/A';
        const cost = typeof floor.floor_cost === 'number' ? floor.floor_cost.toFixed(2) : 'N/A';
        const statusText = floor.status === 'ok' ? 'OK' : 'Error';
        const statusClass =
          floor.status === 'ok'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        return `
                        <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-50/5 transition-colors duration-150">
                            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-zinc-800 dark:text-zinc-200">${floor.floor}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">${level} dBμV</td>
                            <td class="px-4 py-2 whitespace-nowrap text-center">
                                <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                    ${statusText}
                                </span>
                            </td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300 text-right">${cost} €</td>
                        </tr>
                    `;
      })
      .join('');
  } else {
    signalLevelsTableBody.innerHTML =
      '<tr><td colspan="4" class="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">No se generaron niveles de señal.</td></tr>';
  }

  // --- Update Summary Section ---
  simulationSummaryContainer.querySelector('p.text-xs')?.classList.add('hidden');
  headendLevelEl.textContent = results.nivel_cabecera
    ? `${results.nivel_cabecera.toFixed(1)} dBμV`
    : '-';
  qualityMarginsEl.textContent = results.margins
    ? `${results.margins.min.toFixed(1)} - ${results.margins.max.toFixed(1)} dBμV`
    : '-';
  totalCostEl.textContent =
    typeof results.total_cost === 'number' ? `${results.total_cost.toFixed(2)} €` : '-';
  const allOk = results.signal_levels && results.signal_levels.every((f) => f.status === 'ok');
  overallStatusEl.textContent = allOk ? 'OK' : 'Revisar';
  overallStatusEl.className = `font-medium text-right ${
    allOk ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }`;

  // --- Update Chart ---
  const chartCanvas = document.getElementById('results-chart');
  if (
    chartCanvas &&
    typeof Chart !== 'undefined' &&
    results.signal_levels &&
    results.signal_levels.length > 0
  ) {
    updateChartPlaceholder(false);
    const floorLabels = results.signal_levels.map((f) => `Piso ${f.floor}`);
    const signalData = results.signal_levels.map((f) => f.level);
    const minMargin = results.margins?.min;
    const maxMargin = results.margins?.max;

    // Destroy previous chart instance if it exists
    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) {
      existingChart.destroy();
    }

    // Get current theme colors
    const getThemeColors = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      return {
        gridColor: isDarkMode ? 'rgba(113, 113, 122, 0.2)' : 'rgba(212, 212, 216, 0.4)',
        textColor: isDarkMode ? 'rgb(228, 228, 231)' : 'rgb(63, 63, 70)',
        pointColor: isDarkMode ? 'rgb(161, 161, 170)' : 'rgb(82, 82, 91)',
      };
    };

    const themeColors = getThemeColors();
    const chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: floorLabels,
        datasets: [
          {
            label: 'Nivel de Señal (dBμV)',
            data: signalData,
            borderColor: themeColors.pointColor,
            backgroundColor: themeColors.pointColor + '33',
            tension: 0.1,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: themeColors.gridColor },
            ticks: { color: themeColors.textColor, padding: 10 },
            title: {
              display: true,
              text: 'Nivel Señal (dBμV)',
              color: themeColors.textColor,
              font: { size: 10 },
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: themeColors.textColor, padding: 10 },
            title: {
              display: true,
              text: 'Piso',
              color: themeColors.textColor,
              font: { size: 10 },
            },
          },
        },
        plugins: {
          legend: { display: false },
          annotation: {
            annotations: {
              ...(minMargin !== undefined && {
                lineMin: {
                  type: 'line',
                  yMin: minMargin,
                  yMax: minMargin,
                  borderColor: 'rgba(239, 68, 68, 0.6)',
                  borderWidth: 1,
                  borderDash: [6, 6],
                  label: {
                    content: `Min: ${minMargin.toFixed(1)}`,
                    enabled: true,
                    position: 'start',
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    color: 'white',
                    font: { size: 9 },
                    xPadding: 3,
                    yPadding: 3,
                    borderRadius: 2,
                  },
                },
              }),
              ...(maxMargin !== undefined && {
                lineMax: {
                  type: 'line',
                  yMin: maxMargin,
                  yMax: maxMargin,
                  borderColor: 'rgba(239, 68, 68, 0.6)',
                  borderWidth: 1,
                  borderDash: [6, 6],
                  label: {
                    content: `Max: ${maxMargin.toFixed(1)}`,
                    enabled: true,
                    position: 'start',
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    color: 'white',
                    font: { size: 9 },
                    xPadding: 3,
                    yPadding: 3,
                    borderRadius: 2,
                  },
                },
              }),
            },
          },
        },
      },
    });

    // Update chart colors on theme change
    const themeObserver = new MutationObserver(() => {
      const newColors = getThemeColors();
      chart.options.scales.y.grid.color = newColors.gridColor;
      chart.options.scales.y.ticks.color = newColors.textColor;
      chart.options.scales.y.title.color = newColors.textColor;
      chart.options.scales.x.ticks.color = newColors.textColor;
      chart.options.scales.x.title.color = newColors.textColor;
      chart.data.datasets[0].borderColor = newColors.pointColor;
      chart.data.datasets[0].backgroundColor = newColors.pointColor + '33';
      chart.update();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    chart.themeObserver = themeObserver;
  } else {
    updateChartPlaceholder(true);
  }
}

// --- Simulation Component Management ---
export const simulationComponentManager = {
  components: {},
  componentsByFloor: {},
  currentFloor: null,

  addComponent(type, model, floor) {
    if (!floor) return false;
    if (!this.componentsByFloor[floor]) {
      this.componentsByFloor[floor] = {};
    }
    if (!this.componentsByFloor[floor][type]) {
      this.componentsByFloor[floor][type] = new Set();
    }
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

// Helper: Get display name for component type
function getComponentTypeName(type) {
  switch (type) {
    case 'coaxial':
      return 'Cables Coaxiales';
    case 'derivador':
      return 'Derivadores';
    case 'distribuidor':
      return 'Distribuidores';
    case 'toma':
      return 'Tomas';
    default:
      return type;
  }
}

export function updateSelectedComponentsDisplay() {
  const componentsByFloor = document.getElementById('components-by-floor');
  if (!componentsByFloor) return;
  const allComponents = simulationComponentManager.getAllComponents();
  const floors = Object.keys(allComponents).sort((a, b) => a - b);
  if (floors.length === 0) {
    componentsByFloor.innerHTML =
      '<p class="text-zinc-500 dark:text-zinc-400">No hay componentes seleccionados</p>';
    return;
  }
  let html = '';
  floors.forEach((floor) => {
    const floorComponents = allComponents[floor];
    if (!floorComponents) return;
    html += `
            <div class="py-3 first:pt-0">
                <h3 class="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Piso ${floor}</h3>
                <div class="space-y-2">
        `;
    Object.entries(floorComponents).forEach(([type, models]) => {
      if (models.length === 0) return;
      html += `
                <div class="pl-4">
                    <h4 class="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">${getComponentTypeName(
                      type,
                    )}</h4>
                    <ul class="space-y-1">
            `;
      models.forEach((model) => {
        html += `
                    <li class="flex items-center justify-between text-sm">
                        <span class="text-zinc-600 dark:text-zinc-400">${model}</span>
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
  const floorSelect = document.getElementById('simulation-floor');
  if (!floorSelect) return;
  const currentVal = floorSelect.value;
  floorSelect.innerHTML = '<option value="">-- Seleccione Piso --</option>';
  if (numPisos && numPisos > 0) {
    for (let i = 1; i <= numPisos; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Piso ${i}`;
      floorSelect.appendChild(option);
    }
    if (floorSelect.querySelector(`option[value="${currentVal}"]`)) {
      floorSelect.value = currentVal;
    }
  } else {
    floorSelect.innerHTML = '<option value="">-- Seleccione Configuración --</option>';
  }
}

// --- Chart Placeholder ---
function updateChartPlaceholder(show = true) {
  const canvas = document.getElementById('results-chart');
  const placeholder = document.getElementById('chart-placeholder-text');
  if (canvas && placeholder) {
    canvas.style.display = show ? 'none' : 'block';
    placeholder.style.display = show ? 'block' : 'none';
  }
}

// --- Component Delete/Edit Handlers ---
async function handleDeleteComponent(type, model) {
  if (!confirm(`¿Está seguro de que desea eliminar el componente ${model}?`)) {
    return;
  }
  const errorMessageElement = document.getElementById('error-message');
  const successMessageElement = document.getElementById('success-message');
  try {
    const response = await deleteComponent(type, model);
    clearMessages(errorMessageElement, successMessageElement);
    displaySuccess(
      response.message || `Componente ${model} eliminado correctamente.`,
      successMessageElement,
      errorMessageElement,
    );
    const componentListType = document.getElementById('component-list-type');
    if (componentListType) {
      const components = await fetchComponentsByType(componentListType.value);
      updateDetailedComponentList(
        componentListType.value,
        components,
        `${componentListType.value}-list`,
      );
    }
  } catch (error) {
    clearMessages(errorMessageElement, successMessageElement);
    displayError(
      `Error al eliminar el componente: ${error.message}`,
      errorMessageElement,
      successMessageElement,
    );
  }
}

async function handleEditComponent(type, model) {
  const errorMessageElement = document.getElementById('error-message');
  const successMessageElement = document.getElementById('success-message');
  try {
    const componentData = await fetchComponentsByModel(type, model);
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.id = 'edit-component-form';
    // Hidden fields
    const typeInput = document.createElement('input');
    typeInput.type = 'hidden';
    typeInput.name = 'type';
    typeInput.value = type;
    form.appendChild(typeInput);
    const modelInput = document.createElement('input');
    modelInput.type = 'hidden';
    modelInput.name = 'modelo';
    modelInput.value = model;
    form.appendChild(modelInput);
    // Cost field
    const costField = document.createElement('div');
    costField.innerHTML = `
            <label for="costo" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Costo (€)</label>
            <input type="number" step="0.01" id="costo" name="costo" value="${componentData.costo}" required
                class="block w-full rounded-lg border-zinc-300 bg-zinc-200 shadow-sm transition focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400">
        `;
    form.appendChild(costField);
    // Component-specific fields
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'space-y-4';
    if (componentFields[type]) {
      componentFields[type].forEach((field) => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.innerHTML = `
                    <label for="${
                      field.name
                    }" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">${field.label}</label>
                    <input type="${field.type}" id="${field.name}" name="${field.name}" 
                        value="${componentData[field.name]}" required
                        ${field.step ? `step="${field.step}"` : ''}
                        class="block w-full rounded-lg border-zinc-300 bg-zinc-200 shadow-sm transition focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400">
                `;
        fieldsContainer.appendChild(fieldWrapper);
      });
    }
    form.appendChild(fieldsContainer);
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className =
      'w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-400 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900';
    submitButton.textContent = 'Guardar Cambios';
    form.appendChild(submitButton);
    // Modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
            <div class="bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">Editar ${model}</h3>
                    <button class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300" onclick="this.closest('.fixed').remove()">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    modal.querySelector('.rounded-lg').appendChild(form);
    document.body.appendChild(modal);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        const response = await updateComponent(type, model, formData);
        clearMessages(errorMessageElement, successMessageElement);
        displaySuccess(
          response.message || `Componente ${model} actualizado correctamente.`,
          successMessageElement,
          errorMessageElement,
        );
        modal.remove();
        const componentListType = document.getElementById('component-list-type');
        if (componentListType) {
          const components = await fetchComponentsByType(componentListType.value);
          updateDetailedComponentList(
            componentListType.value,
            components,
            `${componentListType.value}-list`,
          );
        }
      } catch (error) {
        clearMessages(errorMessageElement, successMessageElement);
        displayError(
          `Error al actualizar el componente: ${error.message}`,
          errorMessageElement,
          successMessageElement,
        );
      }
    });
  } catch (error) {
    clearMessages(errorMessageElement, successMessageElement);
    displayError(
      'Error al cargar los datos del componente. Por favor, intente de nuevo.',
      errorMessageElement,
      successMessageElement,
    );
  }
}

export function updateSimulationHistoryTable(simulations) {
  const tableBody = document.getElementById('simulation-history-table');
  if (!tableBody) return;
  if (!simulations || simulations.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No hay simulaciones guardadas.
                </td>
            </tr>
        `;
    return;
  }
  let html = '';
  simulations.forEach((simulation) => {
    html += `
            <tr class="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <td class="px-4 py-2.5">${simulation.nombre_edificio || '-'}</td>
                <td class="px-4 py-2.5">${simulation.nivel_cabecera ? `${simulation.nivel_cabecera} dBμV` : '-'}</td>
                <td class="px-4 py-2.5">${simulation.num_pisos || '-'}</td>
                <td class="px-4 py-2.5">${simulation.frecuencia ? `${simulation.frecuencia} MHz` : '-'}</td>
                <td class="px-4 py-2.5">${simulation.costo_total ? `€${simulation.costo_total}` : '-'}</td>
                <td class="px-4 py-2.5">
                    <span class="px-2 py-1 rounded-full text-xs ${
                      simulation.estado === 'ok'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }">
                        ${simulation.estado || '-'}
                    </span>
                </td>
                <td class="px-4 py-2.5">
                    <div class="flex flex-col space-y-2">
                        <button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 load-schematic" 
                                data-simulation-id="${simulation.id_simulaciones}">
                            Ver Esquemático
                        </button>
                        <button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 load-results" 
                                data-simulation-id="${simulation.id_simulaciones}">
                            Ver Resultados
                        </button>
                        <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 delete-simulation" 
                                data-simulation-id="${simulation.id_simulaciones}">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
  });
  tableBody.innerHTML = html;
}

// Helper: Generate configuration form fields
function generateConfigFormFields(configData) {
  const fieldDefinitions = [
    {
      id: 'edit-config-name',
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      value: configData.nombre,
      required: true,
    },
    {
      id: 'edit-nivel-cabecera',
      name: 'nivel_cabecera',
      label: 'Nivel de Cabecera (70-120 dBμV)',
      type: 'number',
      value: configData.nivel_cabecera,
      required: true,
      min: 70,
      max: 120,
      step: 0.1,
    },
    {
      id: 'edit-num-pisos',
      name: 'num_pisos',
      label: 'Número de Pisos',
      type: 'number',
      value: configData.num_pisos,
      required: true,
      min: 1,
    },
  ];
  return fieldDefinitions
    .map(
      (field) => `
        <div>
            <label for="${field.id}" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">${field.label}</label>
            <input type="${field.type}"
                   id="${field.id}"
                   name="${field.name}"
                   value="${field.value}"
                   ${field.required ? 'required' : ''}
                   ${field.min !== undefined ? `min="${field.min}"` : ''}
                   ${field.max !== undefined ? `max="${field.max}"` : ''}
                   ${field.step !== undefined ? `step="${field.step}"` : ''}
                   class="block w-full rounded-lg border-zinc-300 bg-zinc-200 shadow-sm transition focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400">
        </div>
    `,
    )
    .join('');
}

export async function handleEditConfiguration(configId, configData, updateCallback) {
  const errorMessageElement = document.getElementById('error-message');
  const successMessageElement = document.getElementById('success-message');
  try {
    // Create edit form modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
            <div class="bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">Editar ${configData.nombre}</h3>
                    <button class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300" onclick="this.closest('.fixed').remove()">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form id="edit-config-form" class="space-y-4">
                    ${generateConfigFormFields(configData)}
                    <div class="pt-2">
                        <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-400 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        `;
    document.body.appendChild(modal);
    const editForm = document.getElementById('edit-config-form');
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(editForm);
      try {
        await updateCallback(configId, formData);
        modal.remove();
      } catch (error) {
        displayError(
          `Error al actualizar la configuración: ${error.message}`,
          errorMessageElement,
          successMessageElement,
        );
      }
    });
  } catch (error) {
    displayError(
      'Error al crear el formulario de edición. Por favor, intente de nuevo.',
      errorMessageElement,
      successMessageElement,
    );
  }
}
