// Utility functions for UI state and formatting

// Toggle loading state for a button (disables/enables and updates text)
export function setLoadingState(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.innerHTML = isLoading ? 'Cargando...' : button.dataset.originalText || button.innerHTML;
}

// Show error message and hide success message
export function displayError(message, errorElement, successElement) {
  if (errorElement) {
    const messageSpan = errorElement.querySelector('span');
    if (messageSpan) {
      messageSpan.textContent = message;
    } else {
      errorElement.textContent = message;
    }
    errorElement.classList.remove('hidden');
  }
  if (successElement) {
    successElement.classList.add('hidden');
  }
}

// Show success message and hide error message
export function displaySuccess(message, successElement, errorElement) {
  if (successElement) {
    const messageSpan = successElement.querySelector('span');
    if (messageSpan) {
      messageSpan.textContent = message;
    } else {
      successElement.textContent = message;
    }
    successElement.classList.remove('hidden');
  }
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}

// Hide both error and success messages
export function clearMessages(errorElement, successElement) {
  if (errorElement) {
    errorElement.classList.add('hidden');
    const messageSpan = errorElement.querySelector('span');
    if (messageSpan) {
      messageSpan.textContent = '';
    }
  }
  if (successElement) {
    successElement.classList.add('hidden');
    const messageSpan = successElement.querySelector('span');
    if (messageSpan) {
      messageSpan.textContent = '';
    }
  }
}

// Format a date string to a locale string, fallback to original if invalid
export function formatDate(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  // If date is invalid, try to parse manually (handles some non-standard formats)
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
    // Fallback: return original string if parsing fails
    return dateString;
  }

  return date.toLocaleString();
}
