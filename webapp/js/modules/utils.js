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

// Date formatting function
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
