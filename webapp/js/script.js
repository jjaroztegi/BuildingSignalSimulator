import { initTheme } from './modules/theme.js';
import { initTabs, switchTab } from './modules/tabs.js';
import { handleFormSubmit as handleInitialConfigFormSubmit } from './modules/forms.js';
import { updateComponentForm } from './modules/forms.js';
import {
  fetchConfigurations,
  fetchSignalTypes,
  fetchComponentsByType,
  submitComponent,
  runSimulation,
  fetchSimulationHistory,
  deleteSimulationHistory,
  saveSchematicComponent,
  loadSchematic,
  deleteSchematicComponent,
  saveSimulationHistory,
  updateConfiguration,
  deleteConfiguration,
  saveSimulationResults,
  loadSimulationResults,
  deleteSimulationResults,
} from './modules/servlet.js';
import { displayError, displaySuccess, clearMessages, formatDate } from './modules/utils.js';
import {
  updateConfigSelect,
  updateSignalTypeSelect,
  updateFloorSelector,
  updateDetailedComponentList,
  updateSimulationResults,
  updateSimulationHistoryTable,
  handleEditConfiguration,
} from './modules/ui.js';
import { SchematicEditor } from './modules/schematic.js';

document.addEventListener('DOMContentLoaded', async () => {
  // --- Core Initializations ---
  initTheme();
  initTabs();

  // --- DOM Element References ---
  const errorMessageElement = document.getElementById('error-message');
  const successMessageElement = document.getElementById('success-message');

  // Close message handlers
  document.querySelectorAll('.message-close').forEach((button) => {
    button.addEventListener('click', () => {
      const messageElement = button.closest('#error-message, #success-message');
      if (messageElement) {
        messageElement.classList.add('hidden');
      }
    });
  });

  // Configuration Tab Elements
  const initialConfigForm = document.getElementById('initial-config-form');
  const configSelect = document.getElementById('id_configuraciones');
  const configDetailsDiv = document.getElementById('config-details');
  const configNameDisplay = document.getElementById('config-name-display');
  const configHeadendDisplay = document.getElementById('config-headend-display');
  const configFloorsDisplay = document.getElementById('config-floors-display');
  const configDateDisplay = document.getElementById('config-date-display');

  // Components Tab Elements
  const componentForm = document.getElementById('component-form');
  const componentTypeSelect = document.getElementById('component-type');
  const dynamicFieldsContainer = document.getElementById('dynamic-fields');
  const componentListTypeSelect = document.getElementById('component-list-type');
  const componentListsContainer = {
    coaxial: document.getElementById('coaxial-list'),
    derivador: document.getElementById('derivador-list'),
    distribuidor: document.getElementById('distribuidor-list'),
    toma: document.getElementById('toma-list'),
  };

  // Simulation Tab Elements
  const simulationConfigSelect = document.getElementById('simulation-config');
  const signalTypeSelect = document.getElementById('signal-type');
  const signalFrequencyInput = document.getElementById('signal-frequency');
  const simulationFloorSelect = document.getElementById('simulation-floor');
  const cableSelect = document.getElementById('cable-select');
  const runSimulationButton = document.getElementById('run-simulation');
  const schematicCanvas = document.getElementById('schematic-canvas');

  // Results Tab Elements

  // --- Global State ---
  let currentConfigurations = [];
  let schematicEditor;
  let componentModels = {
    coaxial: [],
    derivador: [],
    distribuidor: [],
    toma: [],
  };

  // --- Helper Functions ---

  // Fetches component models for schematic and UI
  async function loadComponentModels() {
    try {
      const types = ['coaxial', 'derivador', 'distribuidor', 'toma'];
      const results = await Promise.all(types.map(fetchComponentsByType));
      componentModels.coaxial = results[0] || [];
      componentModels.derivador = results[1] || [];
      componentModels.distribuidor = results[2] || [];
      componentModels.toma = results[3] || [];

      // Update cable selector in Simulation tab
      if (cableSelect) {
        cableSelect.innerHTML = componentModels.coaxial
          .map((model) => `<option value="${model}">${model}</option>`)
          .join('');
      }
    } catch (error) {
      console.error('Error fetching component models:', error);
      displayError(
        'Error al cargar modelos de componentes.',
        errorMessageElement,
        successMessageElement,
      );
    }
  }

  // Updates UI elements based on the selected configuration
  function handleConfigurationChange(selectedId) {
    const selectedConfig = currentConfigurations.find(
      (c) => (c.id_configuraciones || c.id) == selectedId,
    );

    if (selectedConfig) {
      if (configDetailsDiv) {
        configNameDisplay.textContent = selectedConfig.nombre || '-';
        configHeadendDisplay.textContent = selectedConfig.nivel_cabecera
          ? `${selectedConfig.nivel_cabecera.toFixed(1)} dBμV`
          : '-';
        configFloorsDisplay.textContent = selectedConfig.num_pisos || '-';
        configDateDisplay.textContent = selectedConfig.fecha_creacion
          ? formatDate(selectedConfig.fecha_creacion)
          : '-';
        configDetailsDiv.classList.remove('hidden');
      }
      if (simulationConfigSelect) {
        simulationConfigSelect.value = selectedId;
      }
      if (simulationFloorSelect && selectedConfig.num_pisos) {
        updateFloorSelector(selectedConfig.num_pisos);
        simulationFloorSelect.value = '';
        schematicEditor?.setCurrentFloor(null);
      }
      schematicEditor?.clearSchematic();
    } else {
      if (configDetailsDiv) configDetailsDiv.classList.add('hidden');
      if (simulationFloorSelect)
        simulationFloorSelect.innerHTML = '<option value="">Seleccione Configuración</option>';
    }
  }

  // Fetches and displays the detailed list for the selected component type
  async function updateDetailedComponentView(type) {
    const listElement = componentListsContainer[type];
    if (!listElement) return;
    Object.values(componentListsContainer).forEach((list) => list.classList.add('hidden'));
    listElement.classList.remove('hidden');
    try {
      const models = await fetchComponentsByType(type);
      updateDetailedComponentList(type, models, listElement.id);
    } catch (error) {
      console.error(`Error fetching or displaying ${type} components:`, error);
      displayError(
        `Error al cargar ${type}: ${error.message}`,
        errorMessageElement,
        successMessageElement,
      );
      listElement.innerHTML = `<div class="text-zinc-500 dark:text-zinc-400">Error al cargar componentes.</div>`;
    }
  }

  // --- Initial Data Loading & Setup ---
  try {
    clearMessages(errorMessageElement, successMessageElement);
    const [configurations, signalTypes] = await Promise.all([
      fetchConfigurations(),
      fetchSignalTypes(),
    ]);
    currentConfigurations = configurations;
    updateConfigSelect(currentConfigurations, configSelect);
    updateConfigSelect(currentConfigurations, simulationConfigSelect);
    updateSignalTypeSelect(signalTypes, signalTypeSelect);
    await loadComponentModels();
    schematicEditor = new SchematicEditor('schematic-canvas', {
      cables: componentModels.coaxial,
      derivadores: componentModels.derivador,
      distribuidores: componentModels.distribuidor,
      tomas: componentModels.toma,
    });
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
    console.error('Error during initial data load:', error);
    displayError(
      'Error crítico al inicializar la aplicación. Por favor, recargue.',
      errorMessageElement,
      successMessageElement,
    );
    runSimulationButton?.setAttribute('disabled', 'true');
    initialConfigForm?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
    componentForm?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
  }

  // --- Event Listeners ---

  // Configuration Tab
  if (initialConfigForm) {
    initialConfigForm.addEventListener('submit', async (event) => {
      await handleInitialConfigFormSubmit(
        event,
        initialConfigForm,
        errorMessageElement,
        successMessageElement,
        configSelect,
      );
      try {
        currentConfigurations = await fetchConfigurations();
        updateConfigSelect(currentConfigurations, configSelect);
        updateConfigSelect(currentConfigurations, simulationConfigSelect);
      } catch (error) {
        console.error('Error refetching configurations after submit:', error);
      }
    });
  }

  // Edit and delete configuration buttons
  const editConfigButton = document.getElementById('edit-config');
  const deleteConfigButton = document.getElementById('delete-config');

  if (editConfigButton) {
    editConfigButton.addEventListener('click', async () => {
      const selectedConfigId = configSelect.value;
      if (!selectedConfigId) return;
      const selectedConfig = currentConfigurations.find(
        (c) => (c.id_configuraciones || c.id) == selectedConfigId,
      );
      if (!selectedConfig) return;
      await handleEditConfiguration(
        selectedConfigId,
        selectedConfig,
        async (configId, formData) => {
          const response = await updateConfiguration(selectedConfigId, formData);
          displaySuccess(
            response.success || 'Configuración actualizada correctamente',
            successMessageElement,
            errorMessageElement,
          );
          currentConfigurations = await fetchConfigurations();
          updateConfigSelect(currentConfigurations, configSelect);
          updateConfigSelect(currentConfigurations, simulationConfigSelect);
          handleConfigurationChange(selectedConfigId);
        },
      );
    });
  }

  if (deleteConfigButton) {
    deleteConfigButton.addEventListener('click', async () => {
      const selectedConfigId = configSelect.value;
      if (!selectedConfigId) return;
      const selectedConfig = currentConfigurations.find(
        (c) => (c.id_configuraciones || c.id) == selectedConfigId,
      );
      if (!selectedConfig) return;
      try {
        const simulations = await fetchSimulationHistory(selectedConfigId);
        if (simulations && simulations.length > 0) {
          displayError(
            'No se puede eliminar esta configuración porque tiene simulaciones asociadas. Por favor, elimine primero las simulaciones.',
            errorMessageElement,
            successMessageElement,
          );
          return;
        }
        if (
          !confirm(
            `¿Está seguro de que desea eliminar la configuración "${selectedConfig.nombre}"?`,
          )
        ) {
          return;
        }
        const response = await deleteConfiguration(selectedConfigId);
        displaySuccess(
          response.success || 'Configuración eliminada correctamente',
          successMessageElement,
          errorMessageElement,
        );
        currentConfigurations = await fetchConfigurations();
        updateConfigSelect(currentConfigurations, configSelect);
        updateConfigSelect(currentConfigurations, simulationConfigSelect);
        if (configDetailsDiv) configDetailsDiv.classList.add('hidden');
      } catch (error) {
        console.error('Error deleting configuration:', error);
        displayError(
          'Error al eliminar la configuración. Por favor, intente de nuevo.',
          errorMessageElement,
          successMessageElement,
        );
      }
    });
  }

  if (configSelect) {
    configSelect.addEventListener('change', () => {
      handleConfigurationChange(configSelect.value);
    });
    configSelect.addEventListener('configurationChanged', (event) => {
      handleConfigurationChange(event.detail.configId);
    });
  }

  // Components Tab
  if (componentTypeSelect) {
    componentTypeSelect.addEventListener('change', (e) => {
      updateComponentForm(e.target.value);
    });
  }

  if (componentForm) {
    componentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessages(errorMessageElement, successMessageElement);
      const formData = new FormData(e.target);
      if (!formData.get('type') || !formData.get('modelo') || !formData.get('costo')) {
        displayError(
          'Por favor complete los campos básicos (Tipo, Modelo, Costo).',
          errorMessageElement,
          successMessageElement,
        );
        return;
      }
      try {
        const result = await submitComponent(formData);
        if (result.success) {
          displaySuccess(result.success, successMessageElement, errorMessageElement);
          e.target.reset();
          dynamicFieldsContainer.innerHTML = '';
          await loadComponentModels();
          if (componentListTypeSelect) {
            updateDetailedComponentView(componentListTypeSelect.value);
          }
          schematicEditor?.updateModels({
            cables: componentModels.coaxial,
            derivadores: componentModels.derivador,
            distribuidores: componentModels.distribuidor,
            tomas: componentModels.toma,
          });
        } else {
          displayError(
            result.error || 'Error al añadir el componente',
            errorMessageElement,
            successMessageElement,
          );
        }
      } catch (error) {
        console.error('Error submitting component:', error);
        displayError(
          `Error al añadir el componente: ${error.message || 'Error desconocido'}`,
          errorMessageElement,
          successMessageElement,
        );
      }
    });
  }

  if (componentListTypeSelect) {
    componentListTypeSelect.addEventListener('change', (event) => {
      updateDetailedComponentView(event.target.value);
    });
  }

  // Simulation Tab
  if (simulationConfigSelect) {
    simulationConfigSelect.addEventListener('change', () => {
      const newConfigId = simulationConfigSelect.value;
      if (configSelect.value !== newConfigId) {
        configSelect.value = newConfigId;
      }
      handleConfigurationChange(newConfigId);
    });
  }

  if (cableSelect) {
    cableSelect.addEventListener('change', (e) => {
      schematicEditor?.setCableType(e.target.value);
    });
  }

  if (simulationFloorSelect) {
    simulationFloorSelect.addEventListener('change', () => {
      const selectedFloor = simulationFloorSelect.value;
      schematicEditor?.setCurrentFloor(selectedFloor ? parseInt(selectedFloor) : null);
    });
  }

  if (schematicCanvas) {
    document.getElementById('zoom-in')?.addEventListener('click', () => schematicEditor?.zoom(1.2));
    document
      .getElementById('zoom-out')
      ?.addEventListener('click', () => schematicEditor?.zoom(1 / 1.2));
    document
      .getElementById('reset-view')
      ?.addEventListener('click', () => schematicEditor?.resetView());
  }

  if (runSimulationButton) {
    runSimulationButton.addEventListener('click', async () => {
      clearMessages(errorMessageElement, successMessageElement);
      if (!schematicEditor) {
        displayError(
          'El editor de esquemático no está inicializado.',
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
          'Por favor, seleccione una configuración y tipo de señal.',
          errorMessageElement,
          successMessageElement,
        );
        return;
      }
      if (isNaN(frequency) || frequency < 470 || frequency > 694) {
        displayError(
          'Frecuencia inválida (debe ser entre 470 y 694 MHz).',
          errorMessageElement,
          successMessageElement,
        );
        return;
      }
      const componentsData = schematicEditor.getAllComponents();
      if (Object.keys(componentsData.floors).length === 0) {
        displayError(
          'No se han añadido componentes al diseño en el esquemático.',
          errorMessageElement,
          successMessageElement,
        );
        return;
      }
      try {
        const selectedConfigData = currentConfigurations.find(
          (c) => (c.id_configuraciones || c.id) == selectedConfigId,
        );
        if (!selectedConfigData) {
          throw new Error('Configuración seleccionada no encontrada localmente.');
        }
        // Validate component hierarchy for each floor
        for (const [floorStr, floorComps] of Object.entries(componentsData.floors)) {
          const floorNum = parseInt(floorStr);
          const hasTomas =
            (Array.isArray(floorComps.tomasLeft) && floorComps.tomasLeft.some((model) => model)) ||
            (Array.isArray(floorComps.tomasRight) && floorComps.tomasRight.some((model) => model));
          const hasDistribuidor =
            Array.isArray(floorComps.distribuidores) &&
            floorComps.distribuidores.some((model) => model);
          const hasDerivador = floorComps.derivador !== undefined && floorComps.derivador !== null;
          if (hasTomas && !hasDistribuidor) {
            displayError(
              `El piso ${floorNum} tiene tomas pero no tiene distribuidor. Debe añadir un distribuidor antes de añadir tomas.`,
              errorMessageElement,
              successMessageElement,
            );
            return;
          }
          if (hasDistribuidor && !hasDerivador) {
            displayError(
              `El piso ${floorNum} tiene distribuidor pero no tiene derivador. Debe añadir un derivador antes de añadir distribuidores.`,
              errorMessageElement,
              successMessageElement,
            );
            return;
          }
          if (hasDistribuidor && !hasTomas) {
            displayError(
              `El piso ${floorNum} tiene distribuidor pero no tiene tomas. Debe añadir tomas cuando hay un distribuidor.`,
              errorMessageElement,
              successMessageElement,
            );
            return;
          }
          if (hasDerivador && !hasDistribuidor && !hasTomas) {
            displayError(
              `El piso ${floorNum} tiene solo un derivador. Debe añadir al menos un distribuidor o tomas.`,
              errorMessageElement,
              successMessageElement,
            );
            return;
          }
        }
        // Prepare API payload
        const apiComponents = [];
        Object.entries(componentsData.floors).forEach(([floorStr, floorComps]) => {
          const floorNum = parseInt(floorStr);
          if (floorComps.derivador) {
            apiComponents.push({ type: 'derivador', model: floorComps.derivador, floor: floorNum });
          }
          if (Array.isArray(floorComps.distribuidores)) {
            floorComps.distribuidores.forEach((model) => {
              if (model)
                apiComponents.push({ type: 'distribuidor', model: model, floor: floorNum });
            });
          }
          if (Array.isArray(floorComps.tomasLeft)) {
            floorComps.tomasLeft.forEach((model) => {
              if (model) apiComponents.push({ type: 'toma', model: model, floor: floorNum });
            });
          }
          if (Array.isArray(floorComps.tomasRight)) {
            floorComps.tomasRight.forEach((model) => {
              if (model) apiComponents.push({ type: 'toma', model: model, floor: floorNum });
            });
          }
        });
        const simulationPayload = {
          num_pisos: selectedConfigData.num_pisos,
          nivel_cabecera: selectedConfigData.nivel_cabecera,
          tipo_senal: selectedSignalType,
          frequency: frequency,
          selected_cable_model: cableSelect.value,
          components: apiComponents,
        };
        const results = await runSimulation(simulationPayload);
        results.nivel_cabecera = selectedConfigData.nivel_cabecera;
        // Save simulation history
        const simulationHistoryData = {
          id_configuraciones: selectedConfigId,
          frecuencia: frequency,
          tipo_senal: selectedSignalType,
          costo_total: results.total_cost,
          estado: results.signal_levels.every((f) => f.status === 'ok') ? 'ok' : 'error',
        };
        const simulationResponse = await saveSimulationHistory(simulationHistoryData);
        const idSimulacion = simulationResponse.id;
        // Save simulation results
        try {
          await saveSimulationResults(
            idSimulacion,
            results.signal_levels.map((level) => ({
              floor: level.floor,
              level: level.level,
              floor_cost: level.floor_cost,
              status: level.status,
            })),
          );
        } catch (error) {
          console.error('Error saving simulation results:', error);
          displayError(
            `Error al guardar los resultados: ${error.message || 'Error desconocido'}`,
            errorMessageElement,
            successMessageElement,
          );
        }
        // Save schematic components
        const schematicComponents = [];
        Object.entries(componentsData.floors).forEach(([floorStr, floorComps]) => {
          const floorNum = parseInt(floorStr);
          if (floorComps.derivador) {
            schematicComponents.push({
              id_simulaciones: idSimulacion,
              tipo: 'derivador',
              modelo: floorComps.derivador,
              piso: floorNum,
              posicion_x: 0,
              posicion_y: 0,
              cable_tipo: cableSelect.value,
            });
          }
          if (Array.isArray(floorComps.distribuidores) && floorComps.distribuidores[1]) {
            schematicComponents.push({
              id_simulaciones: idSimulacion,
              tipo: 'distribuidor',
              modelo: floorComps.distribuidores[1],
              piso: floorNum,
              posicion_x: 100,
              posicion_y: 0,
              cable_tipo: cableSelect.value,
            });
          }
          if (Array.isArray(floorComps.tomasRight)) {
            floorComps.tomasRight.forEach((toma, index) => {
              if (toma) {
                schematicComponents.push({
                  id_simulaciones: idSimulacion,
                  tipo: 'toma',
                  modelo: toma,
                  piso: floorNum,
                  posicion_x: 180,
                  posicion_y: index * 45,
                });
              }
            });
          }
        });
        for (const component of schematicComponents) {
          try {
            await saveSchematicComponent(component);
          } catch (error) {
            console.error('Error saving schematic component:', error);
            displayError(
              `Error al guardar componente: ${error.message || 'Error desconocido'}`,
              errorMessageElement,
              successMessageElement,
            );
          }
        }
        switchTab('results-tab');
        updateSimulationResults(results);
        displaySuccess(
          'Simulación completada con éxito.',
          successMessageElement,
          errorMessageElement,
        );
      } catch (error) {
        console.error('Error preparing or running simulation:', error);
        displayError(
          `Error en simulación: ${error.message || 'Error desconocido'}`,
          errorMessageElement,
          successMessageElement,
        );
      }
    });
  }

  // Tab Switching Logic
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => {
      const tabIdBase = button.id.replace('-mobile', '');
      if (tabIdBase === 'simulation-tab') {
        requestAnimationFrame(() => {
          schematicEditor?.initializeCanvas();
          const simulationConfigSelect = document.getElementById('simulation-config');
          if (simulationConfigSelect && simulationConfigSelect.value) {
            schematicEditor?.resetView();
          }
        });
      } else if (tabIdBase === 'components-tab') {
        if (componentListTypeSelect.value) {
          updateDetailedComponentView(componentListTypeSelect.value);
        }
      } else if (tabIdBase === 'config-tab') {
        if (configSelect.value) {
          handleConfigurationChange(configSelect.value);
        }
      } else if (tabIdBase === 'history-tab') {
        loadSimulationHistory();
      }
    });
  });

  // Loads simulation history and updates the table
  async function loadSimulationHistory() {
    try {
      const configurations = await fetchConfigurations();
      if (!configurations || configurations.length === 0) {
        displayError(
          'No hay configuraciones disponibles',
          errorMessageElement,
          successMessageElement,
        );
        return;
      }
      const allSimulations = [];
      for (const config of configurations) {
        try {
          const configSimulations = await fetchSimulationHistory(
            config.id_configuraciones || config.id,
          );
          if (configSimulations && configSimulations.length > 0) {
            const simulationsWithConfig = configSimulations.map((sim) => ({
              ...sim,
              config_name: config.nombre_edificio || config.nombre,
            }));
            allSimulations.push(...simulationsWithConfig);
          }
        } catch (error) {
          console.error(
            `Error fetching history for config ${config.id_configuraciones || config.id}:`,
            error,
          );
        }
      }
      allSimulations.sort((a, b) => {
        const configCompare = (a.config_name || '').localeCompare(b.config_name || '');
        if (configCompare !== 0) return configCompare;
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
      });
      updateSimulationHistoryTable(allSimulations);
    } catch (error) {
      console.error('Error loading simulation history:', error);
      displayError(
        'Error al cargar el historial de simulaciones',
        errorMessageElement,
        successMessageElement,
      );
    }
  }

  // Simulation history table event handlers
  const simulationHistoryTable = document.getElementById('simulation-history-table');
  if (simulationHistoryTable) {
    async function loadAndDisplayResults(simulationId, simulationRow, shouldSwitchTab = false) {
      const nivel_cabecera = parseFloat(simulationRow.cells[1].textContent);
      const total_cost = parseFloat(simulationRow.cells[4].textContent.slice(1));
      const minLevel = 45;
      const maxLevel = 70;
      const results = await loadSimulationResults(simulationId);
      if (shouldSwitchTab) {
        switchTab('results-tab');
      }
      updateSimulationResults({
        nivel_cabecera: nivel_cabecera,
        signal_levels: results.map((r) => ({
          floor: r.piso,
          level: r.nivel_senal,
          status: r.estado,
          floor_cost: r.costo_piso,
        })),
        total_cost: total_cost,
        margins: {
          min: minLevel,
          max: maxLevel,
        },
      });
      displaySuccess(
        'Resultados cargados correctamente',
        successMessageElement,
        errorMessageElement,
      );
    }

    simulationHistoryTable.addEventListener('click', async (event) => {
      const target = event.target;
      const simulationId = target.dataset.simulationId;
      if (!simulationId) return;
      if (
        target.classList.contains('load-schematic') ||
        target.classList.contains('load-results')
      ) {
        try {
          const simulationRow = target.closest('tr');
          const buildingName = simulationRow.cells[0].textContent;
          const frequency = simulationRow.cells[3].textContent.replace(' MHz', '');
          const isLoadSchematic = target.classList.contains('load-schematic');
          const targetTab = isLoadSchematic ? 'simulation-tab' : 'results-tab';
          const matchingConfig = currentConfigurations.find(
            (config) => (config.nombre_edificio || config.nombre) === buildingName,
          );
          if (matchingConfig) {
            const configId = matchingConfig.id_configuraciones || matchingConfig.id;
            simulationConfigSelect.value = configId;
            handleConfigurationChange(configId);
          }
          const components = await loadSchematic(simulationId);
          switchTab(targetTab);
          if (frequency) {
            signalFrequencyInput.value = frequency;
          }
          schematicEditor?.clearSchematic();
          for (const component of components) {
            const floor = component.piso;
            const type = component.tipo_componente;
            const model = component.modelo_componente;
            const posX = component.posicion_x;
            const posY = component.posicion_y;
            schematicEditor?.setCurrentFloor(floor);
            switch (type) {
              case 'derivador':
                schematicEditor?._setComponentValue(floor, 'DE', 0, model);
                break;
              case 'distribuidor':
                const positionIndex = posX > 0 ? 1 : 0;
                schematicEditor?._setComponentValue(floor, 'DI', positionIndex, model);
                break;
              case 'toma':
                const sideIndex = posX > 0 ? 1 : 0;
                const slotIndex = Math.floor(posY / 45);
                schematicEditor?._setSingleTomaModel(floor, sideIndex, slotIndex, model);
                break;
            }
          }
          if (components[0]?.cable_tipo) {
            cableSelect.value = components[0].cable_tipo;
            schematicEditor?.setCableType(components[0].cable_tipo);
          }
          await loadAndDisplayResults(simulationId, simulationRow, !isLoadSchematic);
          displaySuccess(
            isLoadSchematic
              ? 'Esquemático cargado correctamente'
              : 'Resultados cargados correctamente',
            successMessageElement,
            errorMessageElement,
          );
        } catch (error) {
          console.error('Error loading simulation data:', error);
          displayError(
            `Error al cargar los datos: ${error.message}`,
            errorMessageElement,
            successMessageElement,
          );
        }
      } else if (target.classList.contains('delete-simulation')) {
        if (
          !confirm(
            '¿Está seguro de que desea eliminar esta simulación? Esta acción no se puede deshacer.',
          )
        ) {
          return;
        }
        try {
          await deleteSimulationResults(simulationId);
          await deleteSchematicComponent(simulationId);
          await deleteSimulationHistory(simulationId);
          await loadSimulationHistory();
          displaySuccess(
            'Simulación eliminada correctamente',
            successMessageElement,
            errorMessageElement,
          );
        } catch (error) {
          console.error('Error deleting simulation:', error);
          displayError(
            'Error al eliminar la simulación',
            errorMessageElement,
            successMessageElement,
          );
        }
      }
    });
  }
}); // End DOMContentLoaded
