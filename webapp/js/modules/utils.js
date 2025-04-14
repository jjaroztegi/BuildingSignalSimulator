// Utility functions module
export function setLoadingState(button, isLoading) {
    if (!button) return;

    // Save original state if not already saved
    if (!button.hasAttribute("data-original-text")) {
        button.setAttribute("data-original-text", button.innerHTML);
    }

    button.disabled = isLoading;
    button.innerHTML = isLoading
        ? '<span class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>'
        : button.getAttribute("data-original-text");
}

export function displayError(message, errorMessageElement, successMessageElement) {
    if (!errorMessageElement) return;
    errorMessageElement.textContent = message;
    errorMessageElement.classList.remove("hidden");
    successMessageElement?.classList.add("hidden");
}

export function displaySuccess(message, successMessageElement, errorMessageElement) {
    if (!successMessageElement) return;
    successMessageElement.textContent = message;
    successMessageElement.classList.remove("hidden");
    errorMessageElement?.classList.add("hidden");
}

export function clearMessages(errorMessageElement, successMessageElement) {
    errorMessageElement?.classList.add("hidden");
    successMessageElement?.classList.add("hidden");
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