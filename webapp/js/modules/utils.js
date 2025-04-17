// Utility functions module

// Loading state management
export function setLoadingState(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.innerHTML = isLoading ? "Cargando..." : button.dataset.originalText || button.innerHTML;
}

// Message display functions
export function displayError(message, errorElement, successElement) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove("hidden");
    }
    if (successElement) {
        successElement.classList.add("hidden");
    }
}

export function displaySuccess(message, successElement, errorElement) {
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove("hidden");
    }
    if (errorElement) {
        errorElement.classList.add("hidden");
    }
}

export function clearMessages(errorElement, successElement) {
    if (errorElement) {
        errorElement.classList.add("hidden");
        errorElement.textContent = "";
    }
    if (successElement) {
        successElement.classList.add("hidden");
        successElement.textContent = "";
    }
}

// Simulation Components Management
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

// Function to update the selected components display
export function updateSelectedComponentsDisplay() {
    const container = document.getElementById("components-by-floor");
    if (!container) return;

    container.innerHTML = "";

    // Get all floors and sort them numerically
    const floors = Object.keys(simulationComponentManager.getAllComponents()).sort((a, b) => parseInt(a) - parseInt(b));

    floors.forEach((floor) => {
        const floorComponents = simulationComponentManager.getComponentsByFloor(floor);

        // Create floor section
        const floorSection = document.createElement("div");
        floorSection.className = "mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg";

        // Floor header
        const floorHeader = document.createElement("h5");
        floorHeader.className = "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
        floorHeader.textContent = `Piso ${floor}`;
        floorSection.appendChild(floorHeader);

        // Components list
        const componentsList = document.createElement("div");
        componentsList.className = "space-y-2";

        Object.entries(floorComponents).forEach(([type, models]) => {
            if (models.size > 0) {
                const typeContainer = document.createElement("div");
                typeContainer.className = "pl-2";

                const typeHeader = document.createElement("div");
                typeHeader.className = "text-xs font-medium text-gray-600 dark:text-gray-400 mb-1";
                typeHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                typeContainer.appendChild(typeHeader);

                models.forEach((model) => {
                    const componentItem = document.createElement("div");
                    componentItem.className = "flex justify-between items-center text-sm";

                    const modelName = document.createElement("span");
                    modelName.textContent = model;

                    const removeButton = document.createElement("button");
                    removeButton.className =
                        "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300";
                    removeButton.textContent = "×";
                    removeButton.onclick = () => {
                        if (simulationComponentManager.removeComponent(type, model, floor)) {
                            updateSelectedComponentsDisplay();
                        }
                    };

                    componentItem.appendChild(modelName);
                    componentItem.appendChild(removeButton);
                    typeContainer.appendChild(componentItem);
                });

                componentsList.appendChild(typeContainer);
            }
        });

        floorSection.appendChild(componentsList);
        container.appendChild(floorSection);
    });
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

function getComponentTypeName(type) {
    const typeNames = {
        coaxial: "Cables Coaxiales",
        derivador: "Derivadores",
        distribuidor: "Distribuidores",
        toma: "Tomas",
    };
    return typeNames[type] || type;
}

export function formatDate(dateString) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        const parts = dateString.split(/[- :]/);
        if (parts.length >= 6) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is 0-indexed
            const day = parseInt(parts[2]);
            const hours = parseInt(parts[3]);
            const minutes = parseInt(parts[4]);
            const seconds = parseInt(parts[5]);

            const validDate = new Date(year, month, day, hours, minutes, seconds);
            if (!isNaN(validDate.getTime())) {
                return validDate.toLocaleString();
            }
        }

        // If we still can't parse it, return the original string
        return dateString;
    }

    return date.toLocaleString();
}
