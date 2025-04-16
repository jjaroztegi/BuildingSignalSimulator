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
class SimulationComponentManager {
    constructor() {
        this.selectedComponents = {
            coaxial: [],
            derivador: [],
            distribuidor: [],
            toma: []
        };
    }

    addComponent(type, model) {
        if (!this.selectedComponents[type]) return false;
        if (!this.selectedComponents[type].includes(model)) {
            this.selectedComponents[type].push(model);
            return true;
        }
        return false;
    }

    removeComponent(type, model) {
        if (!this.selectedComponents[type]) return false;
        const index = this.selectedComponents[type].indexOf(model);
        if (index > -1) {
            this.selectedComponents[type].splice(index, 1);
            return true;
        }
        return false;
    }

    getSelectedComponents(type) {
        return this.selectedComponents[type] || [];
    }

    getAllSelectedComponents() {
        return this.selectedComponents;
    }

    clearComponents(type) {
        if (type) {
            this.selectedComponents[type] = [];
        } else {
            Object.keys(this.selectedComponents).forEach(key => {
                this.selectedComponents[key] = [];
            });
        }
    }
}

// Create and export a singleton instance
export const simulationComponentManager = new SimulationComponentManager();

// Function to update the selected components display
export function updateSelectedComponentsDisplay() {
    const selectedComponentsContainer = document.getElementById('selected-components-container');
    if (!selectedComponentsContainer) return;

    const componentTypes = Object.keys(simulationComponentManager.selectedComponents);
    
    let html = '<div class="space-y-4">';
    componentTypes.forEach(type => {
        const components = simulationComponentManager.getSelectedComponents(type);
        if (components.length > 0) {
            html += `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${getComponentTypeName(type)}</h4>
                    <ul class="space-y-1">
                        ${components.map(model => `
                            <li class="flex justify-between items-center text-sm">
                                <span>${model}</span>
                                <button 
                                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    onclick="document.dispatchEvent(new CustomEvent('removeComponent', {detail: {type: '${type}', model: '${model}'}}))"
                                >
                                    ×
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
    });
    html += '</div>';

    selectedComponentsContainer.innerHTML = html;
}

function getComponentTypeName(type) {
    const typeNames = {
        coaxial: 'Cables Coaxiales',
        derivador: 'Derivadores',
        distribuidor: 'Distribuidores',
        toma: 'Tomas'
    };
    return typeNames[type] || type;
}

export function formatDate(dateString) {
    if (!dateString) return "N/A";

    // Try to parse the date string
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        // If the date is in a different format, try to parse it manually
        // The date might be in a format like "2025-03-20 12:17:15"
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